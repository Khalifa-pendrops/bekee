import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { PaystackService } from '@/lib/paystack';

export async function POST(req: NextRequest) {
  try {
    const { reference } = await req.json();

    if (!reference || typeof reference !== 'string') {
      return NextResponse.json({ error: 'Payment reference is required' }, { status: 400 });
    }

    // 1. Authoritative verification with Paystack
    const verifyRes = await PaystackService.verifyTransaction(reference);

    if (!verifyRes.status || !verifyRes.data) {
      return NextResponse.json(
        { 
          status: 'failed', 
          error: verifyRes.message || 'Payment verification could not be completed with the payment provider.' 
        },
        { status: 400 }
      );
    }

    const { status: gatewayStatus, amount: amountKobo, id: transactionId } = verifyRes.data;

    if (gatewayStatus !== 'success') {
      return NextResponse.json({
        status: 'failed',
        error: `Transaction status is '${gatewayStatus}'. Payment was not successful.`,
      });
    }

    // 2. Idempotent Settlement in DB
    const settlement = await db.settleOrderPayment(
      reference,
      amountKobo,
      transactionId ? String(transactionId) : undefined
    );

    if (!settlement.success && settlement.status === 'NOT_FOUND') {
      return NextResponse.json(
        { status: 'error', error: 'Matching order not found for this transaction reference.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      status: settlement.status, // 'PAID' | 'ALREADY_PAID' | 'QUARANTINED_INVENTORY_CONFLICT'
      orderNumber: settlement.order?.orderNumber,
      orderId: settlement.order?.id,
      customerEmail: settlement.order?.customerEmail,
      customerPhone: settlement.order?.customerPhone,
      deliveryType: settlement.order?.deliveryType,
    });
  } catch (error: any) {
    console.error('[API /api/checkout/verify] Error:', error);
    return NextResponse.json(
      { error: 'An unexpected verification error occurred.', message: error.message },
      { status: 500 }
    );
  }
}

