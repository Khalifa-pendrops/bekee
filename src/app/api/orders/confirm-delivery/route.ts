import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderNumber, phone, customerNotes } = body;

    if (!orderNumber || !orderNumber.trim()) {
      return NextResponse.json(
        { error: 'Order reference number is required.' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { error: 'Phone number verification is required.' },
        { status: 400 }
      );
    }

    const cleanRef = orderNumber.trim();
    const cleanInputDigits = phone.replace(/\D/g, '').slice(-9);

    const order = (await db.getOrderByNumber(cleanRef)) || (await db.getOrderById(cleanRef));
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found with the provided reference number.' },
        { status: 404 }
      );
    }

    // Phone verification check (match last 9 digits)
    const orderPhoneDigits = (order.customerPhone || '').replace(/\D/g, '').slice(-9);
    if (cleanInputDigits && orderPhoneDigits && cleanInputDigits !== orderPhoneDigits) {
      return NextResponse.json(
        { error: 'Phone number does not match the order record.' },
        { status: 403 }
      );
    }

    // If already marked as delivered, return current state
    if (order.fulfillmentStatus === 'delivered') {
      return NextResponse.json({
        success: true,
        order,
        message: 'This order has already been marked as delivered.',
      });
    }

    // Update fulfillment status
    order.fulfillmentStatus = 'delivered';
    order.deliveredAt = new Date().toISOString();
    order.updatedAt = new Date().toISOString();

    if (!Array.isArray(order.timeline)) {
      order.timeline = [];
    }

    order.timeline.push({
      id: `tl_${Date.now()}`,
      orderId: order.id,
      title: 'Order Delivered (Confirmed by Customer)',
      description: customerNotes?.trim()
        ? `Customer confirmed safe delivery: "${customerNotes.trim()}"`
        : 'Customer confirmed parcel receipt via live tracking link.',
      actor: 'Customer',
      createdAt: new Date().toISOString(),
    });

    await db.saveOrder(order);

    return NextResponse.json({
      success: true,
      order,
      message: 'Delivery confirmed! Thank you for letting us know your parcel arrived safely.',
    });
  } catch (err: any) {
    console.error('[API /api/orders/confirm-delivery] Error:', err);
    return NextResponse.json(
      { error: 'Failed to confirm delivery', message: err.message },
      { status: 500 }
    );
  }
}
