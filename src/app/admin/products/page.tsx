import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PlusCircle, 
  Search, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Layers, 
  Sparkles,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatKoboToNaira } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await db.getAllProductsForAdmin();

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900">
            Products & Catalogue
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage your ready-to-wear designs, shoe lines, bags, and artisan accessories.
          </p>
        </div>

        <Link
          href="/admin/products/new"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-oxblood-700 hover:bg-oxblood-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Table Header Bar */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs font-semibold text-stone-700">
            Total Products: <span className="font-bold text-stone-900">{products.length}</span>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <span className="text-[11px] text-stone-500">Fast action:</span>
            <Link
              href="/admin/stock"
              className="text-xs font-semibold text-oxblood-700 hover:underline"
            >
              Bulk Stock Adjustments →
            </Link>
          </div>
        </div>

        {/* Product Items */}
        <div className="divide-y divide-stone-100">
          {products.map((product) => {
            const primaryImg = product.images.find((i) => i.isPrimary) || product.images[0];
            const startingVariant = product.variants[0];
            const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);
            const isLowStock = product.variants.some((v) => v.stockQuantity <= v.lowStockThreshold);

            return (
              <div
                key={product.id}
                className="p-4 hover:bg-stone-50/80 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative w-14 h-16 rounded overflow-hidden bg-stone-100 shrink-0 border border-stone-200">
                    {primaryImg && (
                      <Image
                        src={primaryImg.url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    )}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm text-stone-900 truncate">
                        {product.name}
                      </span>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                        product.isPublished ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-700'
                      }`}>
                        {product.isPublished ? 'Published' : 'Draft'}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 flex flex-wrap items-center gap-2">
                      <span className="capitalize font-medium text-stone-700">{product.categorySlug}</span>
                      <span>•</span>
                      <span>{product.variants.length} variant(s)</span>
                      <span>•</span>
                      <span className={`font-semibold ${isLowStock ? 'text-red-700' : 'text-stone-700'}`}>
                        {totalStock} in stock {isLowStock && '(Low)'}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-stone-900 mt-1">
                      {startingVariant ? formatKoboToNaira(startingVariant.salePriceKobo || startingVariant.priceKobo) : 'N/A'}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <Link
                    href={`/products/${product.slug}`}
                    target="_blank"
                    className="p-2 text-stone-400 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors"
                    title="View on Storefront"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>

                  <Link
                    href={`/admin/products/${product.id}`}
                    className="px-3 py-1.5 bg-stone-900 hover:bg-oxblood-700 text-white rounded text-xs font-semibold tracking-wide transition-colors"
                  >
                    Edit
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

      </div>

    </div>
  );
}

