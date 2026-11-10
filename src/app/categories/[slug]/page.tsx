import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, ChevronRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CategoryPageProps {
  params: {
    slug: string;
  };
  searchParams?: {
    sub?: string;
  };
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const category = await db.getCategoryBySlug(params.slug);
  if (!category) return { title: "Category Not Found" };

  return {
    title: `${category.name} | ARUBEKEE COLLECTION - Aba, Nigeria`,
    description: category.description,
  };
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const category = await db.getCategoryBySlug(params.slug);
  if (!category) {
    notFound();
  }

  const selectedSub = searchParams?.sub || '';

  const allProducts = await db.getProducts({
    categorySlug: category.slug,
    subCategorySlug: selectedSub || undefined,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-obsidian-subtle">
        <Link href="/" className="hover:text-oxblood transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-oxblood transition-colors">Shop</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-obsidian font-semibold">{category.name}</span>
      </nav>

      {/* Category Hero Banner */}
      <div className="bg-ivory-warm border border-stone-line p-6 sm:p-10 lg:p-12 relative overflow-hidden">
        <div className="max-w-2xl space-y-3 relative z-10 text-left">
          <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-ivory border border-stone-line text-oxblood text-[10px] uppercase tracking-widest font-semibold">
            <Sparkles className="w-3 h-3 text-gold" />
            <span>Aba Craftsmanship Department</span>
          </div>

          <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-obsidian font-normal">
            {category.name}
          </h1>

          <p className="text-xs sm:text-sm text-obsidian-muted leading-relaxed max-w-xl">
            {category.description}
          </p>

          <div className="pt-2 flex items-center gap-4 text-xs text-obsidian-soft">
            <span>Sizing Standard: <strong className="uppercase font-semibold text-oxblood">{category.sizeSystem.replace('_', ' ')}</strong></span>
            <span>•</span>
            <Link href="/size-guide" className="underline hover:text-oxblood">
              View Sizing Chart
            </Link>
          </div>
        </div>
      </div>

      {/* Subcategories Filter Pills */}
      {category.subcategories.length > 0 && (
        <div className="border-b border-stone-line pb-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <Link
              href={`/categories/${category.slug}`}
              className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
                !selectedSub
                  ? "bg-obsidian text-ivory-light border-obsidian"
                  : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
              }`}
            >
              All {category.name}
            </Link>

            {category.subcategories.map((sub) => {
              const isSelected = selectedSub === sub.slug;
              return (
                <Link
                  key={sub.id}
                  href={`/categories/${category.slug}?sub=${sub.slug}`}
                  className={`px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider whitespace-nowrap transition-all border ${
                    isSelected
                      ? "bg-oxblood text-ivory-light border-oxblood shadow-xs"
                      : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
                  }`}
                >
                  {sub.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Products Grid */}
      {allProducts.length === 0 ? (
        <div className="py-20 text-center border border-stone-line bg-ivory-warm p-8 space-y-4">
          <p className="font-serif text-2xl text-obsidian">No items found in this section</p>
          <p className="text-xs text-obsidian-muted max-w-md mx-auto">
            Our artisans are currently cutting new pieces for this category in our Aba studio.
          </p>
          <Link href="/shop">
            <Button variant="outline" size="sm" className="mt-2">
              Browse All Available Pieces
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-baseline">
            <p className="text-xs text-obsidian-muted font-medium">
              Showing {allProducts.length} {allProducts.length === 1 ? 'piece' : 'pieces'} in {category.name}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {allProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

