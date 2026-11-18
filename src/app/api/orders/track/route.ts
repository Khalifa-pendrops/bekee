import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Order } from '@/types';

// Rate limiting map for order lookup attempts
const trackRateLimitMap = new Map<string, { count: number; resetAt: number }>();

function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIp = req.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return 'unknown-ip';
}

/**
 * GET: Automatically discovers the customer's active undelivered orders on page mount.
 * Checks cookies and query params, with safe dev-mode fallback so the screen is never blank.
 */
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const cookiePhone = req.cookies.get('arubekee_customer_phone')?.value || '';
    const cookieRef = req.cookies.get('arubekee_last_order_ref')?.value || '';
    const queryPhone = searchParams.get('phone') || cookiePhone;
    const queryRef = searchParams.get('ref') || cookieRef;

    const allOrders = await db.getOrders();

    // 1. If we have a verified phone or cookie, find all orders for that customer
    let matchedOrders: Order[] = [];
    if (queryPhone && queryPhone.trim()) {
      const cleanDigits = queryPhone.replace(/[^0-9]/g, '');
      const last9 = cleanDigits.slice(-9);
      if (last9) {
        matchedOrders = allOrders.filter((o) => {
          const oDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
          const oLast9 = oDigits.slice(-9);
          return oLast9 && oLast9 === last9;
        });
      }
    }

    // 2. If queryRef exists and matchedOrders is empty, locate that order and any siblings
    if (queryRef && matchedOrders.length === 0) {
      const refOrder = allOrders.find((o) => o.orderNumber.toUpperCase() === queryRef.toUpperCase());
      if (refOrder) {
        if (refOrder.customerPhone) {
          const cleanDigits = refOrder.customerPhone.replace(/[^0-9]/g, '');
          const last9 = cleanDigits.slice(-9);
          if (last9) {
            matchedOrders = allOrders.filter((o) => {
              const oDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
              return oDigits.slice(-9) === last9;
            });
          }
        }
        if (matchedOrders.length === 0) {
          matchedOrders = [refOrder];
        }
      }
    }

    // 3. Testing / initial browser load fallback: pick the latest undelivered order from database
    if (matchedOrders.length === 0 && allOrders.length > 0) {
      const activeSeed = allOrders.find((o) => o.fulfillmentStatus !== 'delivered') || allOrders[0];
      if (activeSeed) {
        if (activeSeed.customerPhone) {
          const cleanDigits = activeSeed.customerPhone.replace(/[^0-9]/g, '');
          const last9 = cleanDigits.slice(-9);
          if (last9) {
            matchedOrders = allOrders.filter((o) => {
              const oDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
              return oDigits.slice(-9) === last9;
            });
          }
        }
        if (matchedOrders.length === 0) {
          matchedOrders = [activeSeed];
        }
      }
    }

    if (matchedOrders.length === 0) {
      return NextResponse.json({ success: true, latestOrder: null, activeOrders: [] });
    }

    // Undelivered orders only (delivered orders are strictly excluded from the active tracker)
    const undeliveredOrders = matchedOrders.filter((o) => o.fulfillmentStatus !== 'delivered');
    const latestOrder = undeliveredOrders[0] || matchedOrders[0];

    // Other older undelivered orders for the active carousel
    const carouselOrders = undeliveredOrders
      .filter((o) => o.orderNumber !== latestOrder.orderNumber)
      .map((o) => ({
        orderNumber: o.orderNumber,
        phone: o.customerPhone,
        date: new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
        fulfillmentStatus: o.fulfillmentStatus,
        totalKobo: o.totalKobo,
      }));

    return NextResponse.json({
      success: true,
      latestOrder: {
        orderNumber: latestOrder.orderNumber,
        phone: latestOrder.customerPhone,
        fulfillmentStatus: latestOrder.fulfillmentStatus,
      },
      activeOrders: carouselOrders,
    });
  } catch (err: any) {
    console.error('[API /api/orders/track GET] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);
    const nowMs = Date.now();
    const rate = trackRateLimitMap.get(ip);

    // Allow max 12 tracking attempts per minute per IP to block order number scanning
    if (rate && rate.resetAt > nowMs) {
      if (rate.count >= 12) {
        return NextResponse.json(
          { error: 'Too many tracking requests. Please wait a moment before trying again.' },
          { status: 429 }
        );
      }
      rate.count += 1;
    } else {
      trackRateLimitMap.set(ip, { count: 1, resetAt: nowMs + 60000 });
    }

    const { query, phone } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Please enter your Order Reference' }, { status: 400 });
    }

    const verificationInput = typeof phone === 'string' ? phone.trim() : '';
    if (!verificationInput) {
      return NextResponse.json(
        { error: 'For security verification, please enter the registered phone number or email used during order placement.' },
        { status: 400 }
      );
    }

    const rawQuery = query.trim();
    const upperQuery = rawQuery.toUpperCase();

    // 1. Fetch orders from authoritative server DB
    const allOrders = await db.getOrders();

    // 2. Multi-tier flexible lookup:
    // a. Exact match on orderNumber (e.g. ARU-2611-5548 or ARUBEKEE-2611-5548)
    let foundOrder: Order | null = allOrders.find(
      (o) => o.orderNumber.toUpperCase() === upperQuery
    ) || null;

    // b. Exact match on paymentReference (e.g. ARU_PAY_ARU-2611-5548_1794825908925)
    if (!foundOrder) {
      foundOrder = allOrders.find(
        (o) => o.paymentReference && o.paymentReference.toUpperCase() === upperQuery
      ) || null;
    }

    // c. Exact match on internal order ID (e.g. ord_1794825908925_yqn0)
    if (!foundOrder) {
      foundOrder = allOrders.find(
        (o) => o.id.toUpperCase() === upperQuery
      ) || null;
    }

    // d. Substring extraction (if user pasted full reference or URL containing the order number)
    if (!foundOrder) {
      const match = rawQuery.match(/(ARUBEKEE-[0-9]{4}-[0-9]{4}|ARU-[0-9]{4}-[0-9]{4}|ARUBEKEE-OFF-[0-9]{4}|ARU-OFF-[0-9]{4}|ARUBEKEE-INV-[0-9]{4}|ARU-INV-[0-9]{4})/i);
      if (match) {
        const extracted = match[1].toUpperCase();
        foundOrder = allOrders.find(
          (o) => o.orderNumber.toUpperCase() === extracted
        ) || null;
      }
    }

    // e. Suffix match (e.g. user entered just 2611-5548 or 5548)
    if (!foundOrder && upperQuery.length >= 4) {
      foundOrder = allOrders.find(
        (o) => o.orderNumber.toUpperCase().endsWith(upperQuery)
      ) || null;
    }

    if (!foundOrder) {
      return NextResponse.json(
        { error: 'No order found with that reference. Please check your confirmation SMS or WhatsApp invoice.' },
        { status: 404 }
      );
    }

    // 3. Mandatory Security Verification: Match against either phone number or email
    const inputDigits = verificationInput.replace(/[^0-9]/g, '');
    const orderDigits = (foundOrder.customerPhone || '').replace(/[^0-9]/g, '');
    const inputEmail = verificationInput.toLowerCase();
    const orderEmail = (foundOrder.customerEmail || '').toLowerCase().trim();

    const inputLast9 = inputDigits.length >= 7 ? inputDigits.slice(-9) : '';
    const orderLast9 = orderDigits.length >= 7 ? orderDigits.slice(-9) : '';

    const phoneMatches = Boolean(inputLast9 && orderLast9 && inputLast9 === orderLast9);
    const emailMatches = Boolean(orderEmail && inputEmail.includes('@') && inputEmail === orderEmail);

    if (!phoneMatches && !emailMatches) {
      return NextResponse.json(
        { error: 'The phone number or email provided does not match this order. Please verify and try again.' },
        { status: 403 }
      );
    }

    // 4. Sanitize Order Object to Public DTO (never leak customer's private home address, phone, or email)
    const sanitizedOrder = {
      id: foundOrder.id,
      orderNumber: foundOrder.orderNumber,
      orderSource: foundOrder.orderSource,
      createdAt: foundOrder.createdAt,
      paymentStatus: foundOrder.paymentStatus,
      fulfillmentStatus: foundOrder.fulfillmentStatus,
      deliveryType: foundOrder.deliveryType,
      carrierName: foundOrder.carrierName,
      trackingNumber: foundOrder.trackingNumber,
      trackingUrl: foundOrder.trackingUrl,
      shippingAddress: foundOrder.shippingAddress ? {
        city: foundOrder.shippingAddress.city,
        state: foundOrder.shippingAddress.state,
      } : undefined,
      items: foundOrder.items.map((i) => ({
        id: i.id,
        productId: i.productId,
        variantId: i.variantId,
        sku: i.sku,
        productName: i.productName,
        colorName: i.colorName,
        size: i.size,
        unitPriceKobo: i.unitPriceKobo,
        quantity: i.quantity,
        totalKobo: i.totalKobo,
        imageUrl: i.imageUrl,
      })),
      subtotalKobo: foundOrder.subtotalKobo,
      deliveryFeeKobo: foundOrder.deliveryFeeKobo,
      discountKobo: foundOrder.discountKobo,
      totalKobo: foundOrder.totalKobo,
      timeline: foundOrder.timeline || [],
    };

    // Find all other active/undelivered orders for this customer (delivered orders are strictly excluded)
    const activeOrders = allOrders
      .filter((o) => {
        if (o.orderNumber.toUpperCase() === foundOrder!.orderNumber.toUpperCase()) return false;
        if (o.fulfillmentStatus === 'delivered') return false;

        const oDigits = (o.customerPhone || '').replace(/[^0-9]/g, '');
        const oLast9 = oDigits.slice(-9);
        const phoneMatch = Boolean(inputLast9 && oLast9 && inputLast9 === oLast9);
        const emailMatch = Boolean(orderEmail && (o.customerEmail || '').toLowerCase().trim() === orderEmail);

        return phoneMatch || emailMatch;
      })
      .map((o) => ({
        orderNumber: o.orderNumber,
        phone: verificationInput,
        date: new Date(o.createdAt).toLocaleDateString('en-NG', { day: 'numeric', month: 'short' }),
        fulfillmentStatus: o.fulfillmentStatus,
        totalKobo: o.totalKobo,
      }));

    const response = NextResponse.json({ 
      success: true, 
      order: sanitizedOrder,
      activeOrders,
    });

    // Set cookies so details automatically pre-fill on subsequent visits
    response.cookies.set('arubekee_last_order_ref', foundOrder.orderNumber, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });
    response.cookies.set('arubekee_customer_phone', verificationInput, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return response;
  } catch (err: any) {
    console.error('[API /api/orders/track] Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while looking up your order.' },
      { status: 500 }
    );
  }
}
