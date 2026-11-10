import { NextRequest, NextResponse } from 'next/server';
import { PaystackService } from '@/lib/paystack';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get('x-paystack-signature');

    // 1. Verify HMAC SHA-512 webhook signature
    const isValid = PaystackService.verifyWebhookSignature(signature, rawBody);
    
    // In strict production, reject invalid signatures:
    if (!isValid && process.env.NODE_ENV === 'production') {
      console.warn('[Paystack Webhook] Invalid HMAC signature received.');
      return NextResponse.json({ error: 'Invalid webhook signature' }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;
    const data = payload.data;

    console.log(`[Paystack Webhook] Received event: ${event}`);

    // 2. Handle successful charge event
    if (event === 'charge.success') {
      const reference = data.reference;
      const amountKobo = data.amount;
      const transactionId = data.id ? String(data.id) : undefined;

      if (!reference) {
        return NextResponse.json({ error: 'Missing payment reference' }, { status: 400 });
      }

      // Authoritative idempotent settlement in database
      const settlement = await db.settleOrderPayment(reference, amountKobo, transactionId);

      console.log(`[Paystack Webhook] Settlement status for ${reference}: ${settlement.status}`);

      return NextResponse.json({
        received: true,
        settlementStatus: settlement.status,
      });
    }

    // Acknowledge other events (e.g. transfer.success, refund.processed)
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error('[Paystack Webhook] Internal Error:', err);
    return NextResponse.json(
      { error: 'Webhook processing error', message: err.message },
      { status: 500 }
    );
  }
}

