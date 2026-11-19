import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSupabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

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

    const res = NextResponse.json(orders);
    res.headers.set('Cache-Control', 'no-store, max-age=0');
    res.headers.set('X-Orders-Count', String(orders.length));
    res.headers.set('X-Supabase-Admin', String(Boolean(getSupabaseAdmin())));
    return res;
  } catch (err: any) {
    console.error('[API /api/admin/orders] Error:', err);
    return NextResponse.json({ error: 'Failed to fetch orders', message: err.message }, { status: 500 });
  }
}


