import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { variantId, newQuantity, reason, staffName, notes } = body;

    if (!variantId || newQuantity === undefined || !reason || !staffName) {
      return NextResponse.json(
        { error: 'variantId, newQuantity, reason, and staffName are required.' },
        { status: 400 }
      );
    }

    const result = await db.adjustStock({
      variantId,
      newQuantity: parseInt(newQuantity),
      reason,
      staffName,
      notes,
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Failed to adjust stock' }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      variant: result.variant,
      message: 'Stock adjusted and audit movement logged.',
    });
  } catch (err: any) {
    console.error('[API /api/admin/stock] Error:', err);
    return NextResponse.json({ error: 'Internal stock adjustment error', message: err.message }, { status: 500 });
  }
}

