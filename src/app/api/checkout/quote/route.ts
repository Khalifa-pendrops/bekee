import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { normalizeNigerianPhone } from '@/lib/utils';

const quoteRequestSchema = z.object({
  customerName: z.string().min(2, 'Name is required'),
  phone: z.string().min(10, 'Valid Nigerian phone number is required'),
  email: z.string().email('Valid email is required'),
  state: z.string().min(2, 'State is required'),
  city: z.string().min(2, 'City is required'),
  streetAddress: z.string().min(5, 'Address is required'),
  landmark: z.string().optional(),
  items: z.array(
    z.object({
      productName: z.string(),
      variantSummary: z.string(),
      quantity: z.number().int().positive(),
      subtotalKobo: z.number().int().nonnegative(),
    })
  ).min(1, 'At least one item is required'),
  subtotalKobo: z.number().int().positive(),
  ownerNotes: z.string().optional(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = quoteRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid delivery quote request data', details: parsed.error.format() },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const normalizedPhone = normalizeNigerianPhone(data.phone);

    const createdQuote = await db.submitDeliveryQuoteRequest({
      customerName: data.customerName,
      phone: normalizedPhone,
      email: data.email,
      state: data.state,
      city: data.city,
      streetAddress: data.streetAddress,
      landmark: data.landmark,
      items: data.items,
      subtotalKobo: data.subtotalKobo,
      ownerNotes: data.ownerNotes,
    });

    return NextResponse.json({
      success: true,
      quoteId: createdQuote.id,
      message: 'Delivery quote request received. Our Aba logistics desk will review shipping options and send a secure direct payment link within 2 to 4 business hours.',
    });
  } catch (error: any) {
    console.error('[API /api/checkout/quote] Error:', error);
    return NextResponse.json(
      { error: 'Failed to submit quote request.', message: error.message },
      { status: 500 }
    );
  }
}

