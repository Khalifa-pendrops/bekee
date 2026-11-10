import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categorySlug = searchParams.get('category') || undefined;
    const subCategorySlug = searchParams.get('subcategory') || undefined;
    const collectionSlug = searchParams.get('collection') || undefined;
    const search = searchParams.get('search') || undefined;
    const sort = (searchParams.get('sort') as any) || undefined;

    const products = await db.getProducts({
      categorySlug,
      subCategorySlug,
      collectionSlug,
      search,
      sort,
    });

    return NextResponse.json(products);
  } catch (error: any) {
    console.error('[API /api/products] Error:', error);
    return NextResponse.json({ error: 'Failed to fetch products', message: error.message }, { status: 500 });
  }
}

