import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';

const offlineSaleSchema = z.object({
  variantId: z.string().min(1, 'Product variant is required'),
  quantity: z.number().int().positive('Quantity must be at least 1'),
  unitPriceKobo: z.number().int().positive('Unit price is required'),
  paymentMethod: z.enum(['cash_in_store', 'pos_terminal', 'bank_transfer_offline']),
  staffName: z.string().min(2, 'Staff name is required for inventory audit trail'),
  orderSource: z.enum(['offline_aba_store', 'whatsapp_order']),
  customerName: z.string().optional(),
  customerPhone: z.string().optional(),
  notes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = offlineSaleSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid offline sale parameters', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const result = await db.recordOfflineSale(parsed.data);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Failed to record offline sale' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      order: result.order,
      message: `Offline sale recorded successfully. Inventory updated.`,
    });
  } catch (error: any) {
    console.error('[API /api/admin/offline-sale] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error while logging offline sale', message: error.message },
      { status: 500 }
    );
  }
}

