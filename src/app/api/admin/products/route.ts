import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/lib/db';
import { Product } from '@/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (!body.name || !body.categorySlug || !body.variants || body.variants.length === 0) {
      return NextResponse.json(
        { error: 'Product name, category, and at least one sellable variant are required.' },
        { status: 400 }
      );
    }

    const createdProduct = await db.createProduct(body);

    return NextResponse.json({
      success: true,
      product: createdProduct,
      message: 'Product published successfully to ARUBEKEE COLLECTION.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/products] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create product', message: error.message },
      { status: 500 }
    );
  }
}

