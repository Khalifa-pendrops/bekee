import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  PlusCircle, 
  Search, 
  ExternalLink, 
  Edit3, 
  AlertTriangle,
  CheckCircle2,
  X
} from 'lucide-react';
import { db } from '@/lib/db';
import { formatKoboToNaira } from '@/lib/utils';
import { AdminPagination } from '@/components/admin/AdminPagination';

export const dynamic = 'force-dynamic';

interface AdminProductsPageProps {
  searchParams?: {
    page?: string;
    search?: string;
    status?: string;
    category?: string;
  };
}

export default async function AdminProductsPage({ searchParams = {} }: AdminProductsPageProps) {
  const allProducts = await db.getAllProductsForAdmin();

  const searchQuery = (searchParams.search || '').trim().toLowerCase();
  const statusFilter = searchParams.status || 'all';
  const categoryFilter = searchParams.category || 'all';

  // Filter products
  let filtered = allProducts.filter((product) => {
    // 1. Text Search
    if (searchQuery) {
      const matchName = product.name.toLowerCase().includes(searchQuery);
      const matchCategory = product.categorySlug.toLowerCase().includes(searchQuery);
      const matchSub = (product.subCategorySlug || '').toLowerCase().includes(searchQuery);
      const matchSku = product.variants.some((v) => (v.sku || '').toLowerCase().includes(searchQuery));
      if (!matchName && !matchCategory && !matchSub && !matchSku) return false;
    }

    // 2. Status Filter
    if (statusFilter === 'published') {
      if (!product.isPublished) return false;
    } else if (statusFilter === 'draft') {
      if (product.isPublished) return false;
    } else if (statusFilter === 'low_stock') {
      const isLow = product.variants.some((v) => v.stockQuantity <= v.lowStockThreshold);
      if (!isLow) return false;
    }

    // 3. Category Filter
    if (categoryFilter !== 'all' && product.categorySlug !== categoryFilter) {
      return false;
    }

    return true;
  });

  // Pagination parameters
  const pageSize = 8;
  const totalItems = filtered.length;
  const totalPages = Math.ceil(totalItems / pageSize) || 1;
  const requestedPage = parseInt(searchParams.page || '1', 10);
  const currentPage = Math.max(1, Math.min(requestedPage, totalPages));

  const startIndex = (currentPage - 1) * pageSize;
  const paginatedProducts = filtered.slice(startIndex, startIndex + pageSize);

  // Helper to build URL with persistent filters
  const makeFilterUrl = (newParams: Record<string, string | undefined>) => {
    const p = new URLSearchParams();
    const merged = { ...searchParams, page: '1', ...newParams };
    Object.entries(merged).forEach(([k, v]) => {
      if (v && v !== 'all') p.set(k, v);
    });
    const qs = p.toString();
    return `/admin/products${qs ? `?${qs}` : ''}`;
  };

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
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-oxblood-700 hover:bg-oxblood-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Product</span>
        </Link>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-stone-200 shadow-sm">
        
        {/* Search Input Form */}
        <form method="GET" action="/admin/products" className="relative flex-1">
          {statusFilter !== 'all' && (
            <input type="hidden" name="status" value={statusFilter} />
          )}
          {categoryFilter !== 'all' && (
            <input type="hidden" name="category" value={categoryFilter} />
          )}
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <input
            type="text"
            name="search"
            defaultValue={searchParams.search || ''}
            placeholder="Search by product name, SKU, or category..."
            className="w-full pl-10 pr-10 py-2 bg-stone-50 border border-stone-200 rounded-lg text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-oxblood/20 focus:border-oxblood transition-all"
          />
          {searchParams.search && (
            <Link
              href={makeFilterUrl({ search: undefined })}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-stone-400 hover:text-stone-700"
              title="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </Link>
          )}
        </form>

        {/* Status Filters */}
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <Link
            href={makeFilterUrl({ status: 'all' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            All ({allProducts.length})
          </Link>

          <Link
            href={makeFilterUrl({ status: 'published' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'published'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Published
          </Link>

          <Link
            href={makeFilterUrl({ status: 'draft' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'draft'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Drafts
          </Link>

          <Link
            href={makeFilterUrl({ status: 'low_stock' })}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              statusFilter === 'low_stock'
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
            }`}
          >
            Low Stock
          </Link>
        </div>

        {/* Category Filter */}
        <div className="flex items-center gap-2">
          <Link
            href="/admin/stock"
            className="text-xs font-semibold text-oxblood-700 hover:underline shrink-0"
          >
            Stock Audit →
          </Link>
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        
        {/* Table Top Bar */}
        <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="font-semibold text-stone-700">
            {filtered.length === allProducts.length ? (
              <span>All Products ({totalItems})</span>
            ) : (
              <span>
                Filtered: <strong className="text-stone-900">{totalItems}</strong> of {allProducts.length}
              </span>
            )}
          </div>

          <div className="text-[11px] text-stone-500 font-mono">
            Page {currentPage} of {totalPages}
          </div>
        </div>

        {/* Product Items */}
        {paginatedProducts.length === 0 ? (
          <div className="p-12 text-center text-stone-500 space-y-3">
            <p className="text-sm font-medium text-stone-800">No products match your criteria.</p>
            <p className="text-xs text-stone-500">
              Try adjusting your search query or reset the filters.
            </p>
            <Link
              href="/admin/products"
              className="inline-block px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 rounded-lg text-xs font-semibold"
            >
              Reset Filters
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {paginatedProducts.map((product) => {
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
                      className="px-3.5 py-1.5 bg-stone-900 hover:bg-oxblood-700 text-white rounded-lg text-xs font-semibold tracking-wide transition-colors"
                    >
                      Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Pagination Controls */}
        <AdminPagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          pageSize={pageSize}
          itemName="products"
          baseUrl="/admin/products"
          searchParams={searchParams}
        />

      </div>

    </div>
  );
}
