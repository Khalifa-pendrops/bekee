import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
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

    let product: Product;
    if (body.id) {
      const updated = await db.updateProduct(body.id, body);
      if (!updated) {
        return NextResponse.json({ error: 'Product not found for update' }, { status: 404 });
      }
      product = updated;
    } else {
      product = await db.createProduct(body);
    }

    // Immediately purge Next.js route caches so edits reflect across the storefront
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      if (product.slug) {
        revalidatePath(`/products/${product.slug}`);
      }
      if (product.categorySlug) {
        revalidatePath(`/categories/${product.categorySlug}`);
      }
    } catch (revalErr) {
      console.warn('[API /api/admin/products] Revalidation warning:', revalErr);
    }

    return NextResponse.json({
      success: true,
      product,
      message: body.id
        ? 'Product updated successfully.'
        : 'Product published successfully to ARUBEKEE COLLECTION.',
    });
  } catch (error: any) {
    console.error('[API /api/admin/products] Error:', error);
    return NextResponse.json(
      { error: 'Failed to save product', message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  return POST(req);
}

export async function PATCH(req: NextRequest) {
  return POST(req);
}

