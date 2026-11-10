import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const fulfillmentStatus = searchParams.get('fulfillment') || undefined;
    const paymentStatus = searchParams.get('payment') || undefined;
    const search = searchParams.get('search') || undefined;

    const orders = await db.getOrders({
      fulfillmentStatus,
      paymentStatus,
      search,
    });

    return NextResponse.json(orders);
  } catch (err: any) {
    console.error('[API /api/admin/orders] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders', message: err.message }, { status: 500 });
  }
}

