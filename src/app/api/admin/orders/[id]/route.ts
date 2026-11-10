import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id;
    const body = await req.json();

    const order = await db.getOrderById(orderId);
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const { action, carrierName, trackingNumber, trackingUrl, cancelReason, staffName } = body;
    const actor = staffName || 'Store Manager';

    if (action === 'dispatch') {
      order.fulfillmentStatus = 'dispatched';
      order.dispatchedAt = new Date().toISOString();
      order.carrierName = carrierName || 'Waybill Courier';
      order.trackingNumber = trackingNumber || undefined;
      order.trackingUrl = trackingUrl || undefined;

      order.timeline.push({
        id: `tl_${Date.now()}`,
        orderId: order.id,
        title: 'Order Dispatched',
        description: `Parcel consigned with ${carrierName || 'Courier'}. Waybill: ${trackingNumber || 'N/A'}.`,
        actor,
        createdAt: new Date().toISOString(),
      });
    } else if (action === 'deliver') {
      order.fulfillmentStatus = 'delivered';
      order.deliveredAt = new Date().toISOString();

      order.timeline.push({
        id: `tl_${Date.now()}`,
        orderId: order.id,
        title: 'Order Delivered',
        description: 'Customer confirmed parcel receipt.',
        actor,
        createdAt: new Date().toISOString(),
      });
    } else if (action === 'cancel') {
      order.fulfillmentStatus = 'cancelled';
      order.paymentStatus = 'refunded';

      order.timeline.push({
        id: `tl_${Date.now()}`,
        orderId: order.id,
        title: 'Order Cancelled & Refund Initiated',
        description: `Reason: ${cancelReason || 'Cancelled by store owner'}.`,
        actor,
        createdAt: new Date().toISOString(),
      });
    }

    order.updatedAt = new Date().toISOString();
    await db.saveOrder(order);

    return NextResponse.json({ success: true, order });
  } catch (err: any) {
    console.error('[API /api/admin/orders/[id]] Error:', err);
    return NextResponse.json({ error: 'Failed to update order', message: err.message }, { status: 500 });
  }
}

