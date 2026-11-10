'use client';

import React, { useState, useMemo, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { db } from "@/lib/db";
import { Product, Category, CategorySlug } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { Drawer } from "@/components/ui/Drawer";
import { formatKoboToNaira, parseNairaToKobo } from "@/lib/utils";
import { 
  SlidersHorizontal, 
  X, 
  RotateCcw, 
  ChevronDown, 
  Check, 
  Sparkles,
  ArrowUpDown
} from "lucide-react";

function ShopContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // URL state
  const currentCategory = searchParams.get('category') || '';
  const currentSubcategory = searchParams.get('subcategory') || '';
  const currentCollection = searchParams.get('collection') || '';
  const currentSize = searchParams.get('size') || '';
  const currentColor = searchParams.get('color') || '';
  const currentSort = (searchParams.get('sort') || 'newest') as 'newest' | 'price-asc' | 'price-desc' | 'featured';
  const inStockOnly = searchParams.get('instock') === 'true';
  const maxPriceParam = searchParams.get('max_price');

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
  const [priceRange, setPriceRange] = useState<number>(
    maxPriceParam ? parseInt(maxPriceParam, 10) : 10000000 // default ₦100,000 max
  );

  useEffect(() => {
    async function loadData() {
      const prods = await db.getProducts();
      const cats = await db.getCategories();
      setProducts(prods);
      setCategories(cats);
    }
    loadData();
  }, []);

  // Update URL helper
  const updateQueryParam = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    router.replace(`/shop?${params.toString()}`, { scroll: false });
  };

  const clearAllFilters = () => {
    router.replace('/shop', { scroll: false });
    setPriceRange(10000000);
  };

  // Derive available filter options from catalog
  const allSizes = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.size) set.add(v.size);
      });
    });
    return Array.from(set).sort();
  }, [products]);

  const allColors = useMemo(() => {
    const set = new Set<string>();
    products.forEach((p) => {
      p.variants.forEach((v) => {
        if (v.colorName) set.add(v.colorName);
      });
    });
    return Array.from(set).sort();
  }, [products]);

  // Apply active filters
  const filteredProducts = useMemo(() => {
    let result = [...products];

    if (currentCategory) {
      result = result.filter((p) => p.categorySlug === currentCategory);
    }

    if (currentSubcategory) {
      result = result.filter((p) => p.subCategorySlug === currentSubcategory);
    }

    if (currentCollection) {
      result = result.filter((p) => p.collectionSlugs.includes(currentCollection));
    }

    if (currentSize) {
      result = result.filter((p) =>
        p.variants.some((v) => v.size === currentSize && v.stockQuantity > 0)
      );
    }

    if (currentColor) {
      result = result.filter((p) =>
        p.variants.some((v) => v.colorName.toLowerCase() === currentColor.toLowerCase())
      );
    }

    if (inStockOnly) {
      result = result.filter((p) =>
        p.variants.some((v) => v.stockQuantity > 0)
      );
    }

    if (maxPriceParam) {
      const maxKobo = parseInt(maxPriceParam, 10);
      result = result.filter((p) => {
        const lowestPrice = Math.min(...p.variants.map((v) => v.salePriceKobo || v.priceKobo));
        return lowestPrice <= maxKobo;
      });
    }

    // Sort
    if (currentSort === 'price-asc') {
      result.sort((a, b) => (a.variants[0]?.priceKobo || 0) - (b.variants[0]?.priceKobo || 0));
    } else if (currentSort === 'price-desc') {
      result.sort((a, b) => (b.variants[0]?.priceKobo || 0) - (a.variants[0]?.priceKobo || 0));
    } else if (currentSort === 'newest') {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return result;
  }, [
    products, 
    currentCategory, 
    currentSubcategory, 
    currentCollection, 
    currentSize, 
    currentColor, 
    inStockOnly, 
    maxPriceParam, 
    currentSort
  ]);

  const hasActiveFilters = Boolean(
    currentCategory || currentSubcategory || currentCollection || currentSize || currentColor || inStockOnly || maxPriceParam
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Editorial Header */}
      <div className="border-b border-stone-line pb-6 text-left">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-oxblood font-semibold mb-1">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Curated Catalogue • Aba Atelier</span>
        </div>
        <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-obsidian font-normal">
          The Full Collection
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted mt-2 max-w-2xl leading-relaxed">
          Explore artisanal ready-to-wear dresses, architectural footwear, structured bags, and statement accessories handcrafted in Aba, Abia State.
        </p>
      </div>

      {/* Control Bar: Categories Quick Switcher & Sort/Filter */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 pb-4 border-b border-stone-line">
        {/* Category Pill Switcher */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => updateQueryParam('category', null)}
            className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
              !currentCategory
                ? "bg-obsidian text-ivory-light border-obsidian"
                : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
            }`}
          >
            All Departments
          </button>
          {categories.map((cat) => {
            const isSelected = currentCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => updateQueryParam('category', isSelected ? null : cat.slug)}
                className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
                  isSelected
                    ? "bg-oxblood text-ivory-light border-oxblood shadow-xs"
                    : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
                }`}
              >
                {cat.name}
              </button>
            );
          })}
        </div>

        {/* Right side: Filter Drawer Button & Sort Dropdown */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterDrawerOpen(true)}
            className="flex items-center gap-2 text-xs uppercase tracking-wider relative"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-oxblood" />
            <span>Filters</span>
            {hasActiveFilters && (
              <span className="w-2 h-2 rounded-full bg-oxblood ml-1" />
            )}
          </Button>

          <div className="flex items-center gap-2 text-xs">
            <span className="text-obsidian-subtle uppercase tracking-wider hidden sm:inline">Sort:</span>
            <select
              value={currentSort}
              onChange={(e) => updateQueryParam('sort', e.target.value)}
              className="bg-ivory border border-stone-line px-3 py-1.5 text-xs text-obsidian uppercase tracking-wider focus:outline-none focus:border-oxblood cursor-pointer"
            >
              <option value="newest">Newest Drops</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="featured">Featured First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Pills Strip */}
      {hasActiveFilters && (
        <div className="flex flex-wrap items-center gap-2 pt-1 animate-fade-in">
          <span className="text-[11px] uppercase tracking-wider text-obsidian-subtle font-semibold mr-1">
            Active Filters:
          </span>

          {currentCategory && (
            <span className="inline-flex items-center gap-1.5 bg-ivory-muted border border-stone-line px-2.5 py-1 text-xs text-obsidian">
              <span>Category: <strong>{currentCategory}</strong></span>
              <button onClick={() => updateQueryParam('category', null)} aria-label="Remove category filter">
                <X className="w-3 h-3 text-obsidian-subtle hover:text-status-danger" />
              </button>
            </span>
          )}

          {currentSize && (
            <span className="inline-flex items-center gap-1.5 bg-ivory-muted border border-stone-line px-2.5 py-1 text-xs text-obsidian">
              <span>Size: <strong>{currentSize}</strong></span>
              <button onClick={() => updateQueryParam('size', null)} aria-label="Remove size filter">
                <X className="w-3 h-3 text-obsidian-subtle hover:text-status-danger" />
              </button>
            </span>
          )}

          {currentColor && (
            <span className="inline-flex items-center gap-1.5 bg-ivory-muted border border-stone-line px-2.5 py-1 text-xs text-obsidian">
              <span>Color: <strong>{currentColor}</strong></span>
              <button onClick={() => updateQueryParam('color', null)} aria-label="Remove color filter">
                <X className="w-3 h-3 text-obsidian-subtle hover:text-status-danger" />
              </button>
            </span>
          )}

          {inStockOnly && (
            <span className="inline-flex items-center gap-1.5 bg-ivory-muted border border-stone-line px-2.5 py-1 text-xs text-obsidian">
              <span>In-Stock Only</span>
              <button onClick={() => updateQueryParam('instock', null)} aria-label="Remove in-stock filter">
                <X className="w-3 h-3 text-obsidian-subtle hover:text-status-danger" />
              </button>
            </span>
          )}

          {maxPriceParam && (
            <span className="inline-flex items-center gap-1.5 bg-ivory-muted border border-stone-line px-2.5 py-1 text-xs text-obsidian">
              <span>Under {formatKoboToNaira(parseInt(maxPriceParam, 10))}</span>
              <button onClick={() => updateQueryParam('max_price', null)} aria-label="Remove max price filter">
                <X className="w-3 h-3 text-obsidian-subtle hover:text-status-danger" />
              </button>
            </span>
          )}

          <button
            onClick={clearAllFilters}
            className="text-xs text-oxblood hover:underline uppercase tracking-wider font-semibold ml-2 inline-flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset All</span>
          </button>
        </div>
      )}

      {/* Main Product Grid */}
      {filteredProducts.length === 0 ? (
        <div className="py-20 text-center border border-stone-line bg-ivory-warm p-8 space-y-4">
          <p className="font-serif text-2xl text-obsidian">No fashion pieces matched your criteria</p>
          <p className="text-xs text-obsidian-muted max-w-md mx-auto">
            Try adjusting your active size, price, or category selections, or reset all filters to view our full Aba catalog.
          </p>
          <Button variant="primary" size="md" onClick={clearAllFilters} className="mt-2">
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-xs text-obsidian-muted font-medium">
            Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'piece' : 'pieces'}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}

      {/* FILTER DRAWER (Mobile & Desktop Slideout) */}
      <Drawer
        isOpen={isFilterDrawerOpen}
        onClose={() => setIsFilterDrawerOpen(false)}
        title="Refine Collection"
        description="Filter by sizes, colors, and budget"
        position="right"
      >
        <div className="space-y-6">
          {/* Availability Toggle */}
          <div className="pb-4 border-b border-stone-line">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => updateQueryParam('instock', e.target.checked ? 'true' : null)}
                className="w-4 h-4 accent-oxblood rounded-none cursor-pointer"
              />
              <span className="text-xs uppercase tracking-wider font-semibold text-obsidian">
                In-Stock Items Only
              </span>
            </label>
          </div>

          {/* Size Filter */}
          <div className="pb-4 border-b border-stone-line space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-obsidian-soft">
                Size
              </span>
              {currentSize && (
                <button
                  onClick={() => updateQueryParam('size', null)}
                  className="text-[10px] text-oxblood uppercase hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="grid grid-cols-3 gap-2">
              {allSizes.map((size) => {
                const isSelected = currentSize === size;
                return (
                  <button
                    key={size}
                    onClick={() => updateQueryParam('size', isSelected ? null : size)}
                    className={`py-2 px-1 text-xs font-semibold text-center border transition-all ${
                      isSelected
                        ? "bg-oxblood text-ivory-light border-oxblood shadow-xs"
                        : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
                    }`}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Filter */}
          <div className="pb-4 border-b border-stone-line space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-obsidian-soft">
                Colour
              </span>
              {currentColor && (
                <button
                  onClick={() => updateQueryParam('color', null)}
                  className="text-[10px] text-oxblood uppercase hover:underline"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              {allColors.map((color) => {
                const isSelected = currentColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => updateQueryParam('color', isSelected ? null : color)}
                    className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-oxblood text-ivory-light border-oxblood shadow-xs"
                        : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Max Price Range Slider */}
          <div className="pb-4 border-b border-stone-line space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider font-semibold text-obsidian-soft">
                Max Price
              </span>
              <span className="text-xs font-serif font-semibold text-oxblood">
                {formatKoboToNaira(priceRange)}
              </span>
            </div>

            <input
              type="range"
              min="1000000" // ₦10,000
              max="15000000" // ₦150,000
              step="500000" // ₦5,000 steps
              value={priceRange}
              onChange={(e) => setPriceRange(parseInt(e.target.value, 10))}
              onMouseUp={() => updateQueryParam('max_price', priceRange.toString())}
              onTouchEnd={() => updateQueryParam('max_price', priceRange.toString())}
              className="w-full accent-oxblood cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-obsidian-subtle">
              <span>₦10,000</span>
              <span>₦150,000</span>
            </div>
          </div>

          {/* Drawer Actions */}
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              size="md"
              className="w-full uppercase tracking-wider"
              onClick={() => setIsFilterDrawerOpen(false)}
            >
              View Results ({filteredProducts.length})
            </Button>

            {hasActiveFilters && (
              <Button
                variant="outline"
                size="md"
                className="w-full text-xs uppercase tracking-wider"
                onClick={clearAllFilters}
              >
                Reset All Filters
              </Button>
            )}
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center font-serif text-lg text-obsidian">Loading Arubekee Collection...</div>}>
      <ShopContent />
    </Suspense>
  );
}

