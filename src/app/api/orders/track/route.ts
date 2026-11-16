import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { Order } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const { query, phone } = await req.json();

    if (!query || typeof query !== 'string' || !query.trim()) {
      return NextResponse.json({ error: 'Please enter your Order Reference' }, { status: 400 });
    }

    const rawQuery = query.trim();
    const upperQuery = rawQuery.toUpperCase();

    // 1. Fetch orders from authoritative server DB (disk + Supabase)
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
      const match = rawQuery.match(/(ARUBEKEE-[0-9]{4}-[0-9]{4}|ARU-[0-9]{4}-[0-9]{4}|ARUBEKEE-OFF-[0-9]{4}|ARU-OFF-[0-9]{4})/i);
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
        { error: 'No order found with that reference. Please check your confirmation SMS or email.' },
        { status: 404 }
      );
    }

    // 3. Security phone verification (handles Nigerian local 080... vs +23480...)
    if (phone && typeof phone === 'string' && phone.trim()) {
      const inputDigits = phone.replace(/[^0-9]/g, '');
      const orderDigits = foundOrder.customerPhone.replace(/[^0-9]/g, '');

      // Compare the last 9-10 digits to be completely resilient to local vs international dialing prefixes
      const inputLast9 = inputDigits.slice(-9);
      const orderLast9 = orderDigits.slice(-9);

      if (inputLast9 && orderLast9 && inputLast9 !== orderLast9) {
        return NextResponse.json(
          { error: 'The phone number provided does not match this order reference for security verification.' },
          { status: 403 }
        );
      }
    }

    return NextResponse.json({ success: true, order: foundOrder });
  } catch (err: any) {
    console.error('[API /api/orders/track] Error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while looking up your order.' },
      { status: 500 }
    );
  }
}
