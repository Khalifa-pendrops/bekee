import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { PaystackService } from '@/lib/paystack';
import { normalizeNigerianPhone } from '@/lib/utils';
import { Order, ImmutableOrderItem } from '@/types';

const checkoutSchema = z.object({
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      quantity: z.number().int().positive(),
    })
  ).min(1, 'Cart cannot be empty'),
  customer: z.object({
    fullName: z.string().min(2, 'Full name is required'),
    email: z.string().email('Valid email is required for payment receipts'),
    phone: z.string().min(10, 'Valid Nigerian phone number is required'),
    state: z.string().min(2, 'State is required'),
    city: z.string().min(2, 'City or local area is required'),
    streetAddress: z.string().min(5, 'Delivery address is required'),
    landmark: z.string().optional(),
    deliveryInstructions: z.string().optional(),
  }),
  deliveryType: z.enum(['aba_pickup', 'dispatch_delivery']),
  discountCode: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid checkout data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const { items: requestItems, customer, deliveryType, discountCode } = parsed.data;

    // 1. Normalize Nigerian phone number (e.g. 080... to +23480...)
    const normalizedPhone = normalizeNigerianPhone(customer.phone);

    // 2. Authoritative Server-Side Item Price & Stock Validation
    const allProducts = await db.getProducts();
    const immutableItems: ImmutableOrderItem[] = [];
    let calculatedSubtotalKobo = 0;

    for (const reqItem of requestItems) {
      let matchedProduct = null;
      let matchedVariant = null;

      for (const p of allProducts) {
        const v = p.variants.find((variant) => variant.id === reqItem.variantId);
        if (v) {
          matchedProduct = p;
          matchedVariant = v;
          break;
        }
      }

      if (!matchedProduct || !matchedVariant) {
        return NextResponse.json(
          { error: `One or more selected products are no longer available in the catalogue.` },
          { status: 400 }
        );
      }

      const unitPriceKobo = matchedVariant.salePriceKobo || matchedVariant.priceKobo;
      const lineTotalKobo = unitPriceKobo * reqItem.quantity;
      calculatedSubtotalKobo += lineTotalKobo;

      immutableItems.push({
        id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        productId: matchedProduct.id,
        variantId: matchedVariant.id,
        sku: matchedVariant.sku,
        productName: matchedProduct.name,
        colorName: matchedVariant.colorName,
        size: matchedVariant.size,
        unitPriceKobo,
        quantity: reqItem.quantity,
        totalKobo: lineTotalKobo,
        imageUrl: matchedProduct.images[0]?.url || '',
      });
    }

    // 3. Server-Side Delivery Calculation
    let calculatedDeliveryFeeKobo = 0;
    let deliveryZoneName = 'Aba Boutique Pickup';

    if (deliveryType === 'aba_pickup') {
      calculatedDeliveryFeeKobo = 0;
      deliveryZoneName = 'Aba Boutique Showroom Pickup';
    } else {
      const matchedZone = db.matchDeliveryZone(customer.state, false);
      if (!matchedZone) {
        return NextResponse.json(
          { 
            error: `We could not match a standardized delivery route for ${customer.state}. Please use the 'Request a Delivery Quote' option so our Aba team can prepare custom logistics for your destination.`,
            requiresQuote: true 
          },
          { status: 400 }
        );
      }
      calculatedDeliveryFeeKobo = matchedZone.feeKobo;
      deliveryZoneName = matchedZone.name;
    }

    // 4. Server-Side Discount Validation
    let calculatedDiscountKobo = 0;
    let appliedDiscountCode: string | undefined = undefined;

    if (discountCode) {
      const discountResult = await db.validateDiscountCode(discountCode, calculatedSubtotalKobo);
      if (discountResult.valid) {
        calculatedDiscountKobo = discountResult.discountKobo;
        appliedDiscountCode = discountResult.discount?.code;
      }
    }

    // 5. Calculate Final Grand Total
    const calculatedTotalKobo = Math.max(
      0,
      calculatedSubtotalKobo + calculatedDeliveryFeeKobo - calculatedDiscountKobo
    );

    // 6. Generate Order ID and Unique Payment Reference
    const orderId = `ord_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const orderNumber = `ARU-${new Date().getFullYear().toString().slice(-2)}${(new Date().getMonth() + 1).toString().padStart(2, '0')}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paymentReference = `ARU_PAY_${orderNumber}_${Date.now()}`;

    // 7. Atomic Concurrency Lock: 15-Minute Stock Reservation
    const reservationResult = await db.createStockReservation(
      orderId,
      requestItems.map((i) => ({ variantId: i.variantId, quantity: i.quantity })),
      15 // 15 minutes window
    );

    if (!reservationResult.success) {
      return NextResponse.json(
        { 
          error: reservationResult.error || 'Inventory is currently unavailable for one or more items. Another shopper may be checking out.',
        },
        { status: 409 }
      );
    }

    // 8. Create Pending Order Record
    const newOrder: Order = {
      id: orderId,
      orderNumber,
      orderSource: 'storefront',
      customerName: customer.fullName,
      customerEmail: customer.email,
      customerPhone: normalizedPhone,
      deliveryType,
      shippingAddress: {
        fullName: customer.fullName,
        email: customer.email,
        phone: normalizedPhone,
        state: customer.state,
        city: customer.city,
        streetAddress: customer.streetAddress,
        landmark: customer.landmark,
        deliveryInstructions: customer.deliveryInstructions,
      },
      items: immutableItems,
      subtotalKobo: calculatedSubtotalKobo,
      deliveryFeeKobo: calculatedDeliveryFeeKobo,
      discountKobo: calculatedDiscountKobo,
      discountCode: appliedDiscountCode,
      totalKobo: calculatedTotalKobo,
      paymentStatus: 'pending',
      paymentMethod: 'paystack',
      paymentReference,
      fulfillmentStatus: 'unfulfilled',
      internalNotes: `Delivery Zone: ${deliveryZoneName}. Reservation expires: ${reservationResult.expiresAt}`,
      timeline: [
        {
          id: `tl_${Date.now()}_init`,
          orderId,
          title: 'Checkout Initiated',
          description: `Order initiated for ₦${(calculatedTotalKobo / 100).toLocaleString()}. 15-minute stock lock placed.`,
          actor: 'Customer',
          createdAt: new Date().toISOString(),
        },
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await db.saveOrder(newOrder);

    // 9. Initialize Paystack Transaction
    const origin = req.nextUrl.origin || 'http://localhost:3000';
    const callbackUrl = `${origin}/checkout/callback`;

    const paystackRes = await PaystackService.initializeTransaction({
      email: customer.email,
      amountKobo: calculatedTotalKobo,
      reference: paymentReference,
      callbackUrl,
      metadata: {
        orderId,
        orderNumber,
        customerName: customer.fullName,
        customerPhone: normalizedPhone,
        deliveryZone: deliveryZoneName,
      },
    });

    if (!paystackRes.status || !paystackRes.data) {
      return NextResponse.json(
        { error: paystackRes.message || 'Could not communicate with Paystack payment gateway.' },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      authorizationUrl: paystackRes.data.authorization_url,
      reference: paymentReference,
      orderNumber,
      orderId,
      expiresAt: reservationResult.expiresAt,
    });
  } catch (err: any) {
    console.error('[API /api/checkout/initialize] Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while preparing your checkout.', message: err.message },
      { status: 500 }
    );
  }
}

