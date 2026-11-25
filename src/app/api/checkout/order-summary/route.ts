import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { normalizeNigerianPhone } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const orderNumber = (searchParams.get('orderNumber') || searchParams.get('ref') || '').trim();

    if (!orderNumber) {
      return NextResponse.json({ success: false, error: 'Order reference is required' }, { status: 400 });
    }

    const allOrders = await db.getOrders();
    const cleanRef = orderNumber.toUpperCase();

    const order = allOrders.find(
      (o) => o.orderNumber.toUpperCase() === cleanRef || o.id.toUpperCase() === cleanRef
    );

    if (!order) {
      return NextResponse.json({ success: false, error: 'Order not found' }, { status: 404 });
    }

    // Recover items snapshot from disk orders if relational query had stripped it
    let items = order.items || [];
    let customerName = order.customerName;
    let customerPhone = order.customerPhone;
    let shippingAddress = order.shippingAddress;
    let totalKobo = order.totalKobo;

    if (!items || items.length === 0) {
      try {
        const fs = eval('require')('fs');
        const path = eval('require')('path');
        const candidates = [
          path.join(process.cwd(), 'src', 'data', 'orders.json'),
          path.join(process.cwd(), 'collection', 'src', 'data', 'orders.json'),
        ];
        for (const c of candidates) {
          if (fs.existsSync(c)) {
            const list = JSON.parse(fs.readFileSync(c, 'utf-8'));
            const match = list.find((o: any) => o.orderNumber?.toUpperCase() === cleanRef || o.id?.toUpperCase() === cleanRef);
            if (match) {
              if (match.items && match.items.length > 0) items = match.items;
              if (!customerName && match.customerName) customerName = match.customerName;
              if (!customerPhone && match.customerPhone) customerPhone = match.customerPhone;
              if (!shippingAddress && match.shippingAddress) shippingAddress = match.shippingAddress;
              if (!totalKobo && match.totalKobo) totalKobo = match.totalKobo;
              break;
            }
          }
        }
      } catch {}
    }

    const normPhone = normalizeNigerianPhone(customerPhone || '');

    const sanitizedSummary = {
      orderNumber: order.orderNumber,
      customerName: customerName,
      customerPhone: normPhone.isValid ? normPhone.display : customerPhone,
      customerEmail: order.customerEmail,
      deliveryType: order.deliveryType,
      shippingAddress: shippingAddress ? {
        city: shippingAddress.city,
        state: shippingAddress.state,
        streetAddress: shippingAddress.streetAddress,
        landmark: shippingAddress.landmark,
      } : undefined,
      items: items.map((i) => ({
        id: i.id,
        productId: i.productId,
        productName: i.productName,
        colorName: i.colorName,
        size: i.size,
        unitPriceKobo: i.unitPriceKobo,
        quantity: i.quantity,
        totalKobo: i.totalKobo,
      })),
      subtotalKobo: order.subtotalKobo,
      deliveryFeeKobo: order.deliveryFeeKobo,
      totalKobo: totalKobo,
      paymentStatus: order.paymentStatus,
      fulfillmentStatus: order.fulfillmentStatus,
      createdAt: order.createdAt,
    };

    return NextResponse.json({ success: true, order: sanitizedSummary });
  } catch (err: any) {
    console.error('[API /api/checkout/order-summary] Error:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
