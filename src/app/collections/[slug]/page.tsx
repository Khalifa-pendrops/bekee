import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CollectionPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CollectionPageProps) {
  const collection = await db.getCollectionBySlug(params.slug);
  if (!collection) return { title: "Collection Not Found" };

  return {
    title: `${collection.name} | ARUBEKEE COLLECTION - Aba, Nigeria`,
    description: collection.description,
  };
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  const collection = await db.getCollectionBySlug(params.slug);
  if (!collection) {
    notFound();
  }

  const products = await db.getProducts({
    collectionSlug: collection.slug,
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-obsidian-subtle">
        <Link href="/" className="hover:text-oxblood transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/shop" className="hover:text-oxblood transition-colors">Collections</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-obsidian font-semibold">{collection.name}</span>
      </nav>

      {/* Collection Hero Banner */}
      <div className="bg-ivory-warm border border-stone-line p-8 sm:p-12 text-center relative overflow-hidden">
        <div className="max-w-2xl mx-auto space-y-3 relative z-10">
          <span className="text-xs font-semibold tracking-widest uppercase text-oxblood block">
            {collection.tagline}
          </span>

          <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-obsidian font-normal">
            {collection.name}
          </h1>

          <p className="text-xs sm:text-sm text-obsidian-muted leading-relaxed max-w-lg mx-auto">
            {collection.description}
          </p>
        </div>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="py-20 text-center border border-stone-line bg-ivory-warm p-8 space-y-4">
          <p className="font-serif text-2xl text-obsidian">No pieces in this edit currently</p>
          <p className="text-xs text-obsidian-muted max-w-md mx-auto">
            Our atelier is updating this collection with fresh Aba-crafted items.
          </p>
          <Link href="/shop">
            <Button variant="primary" size="sm" className="mt-2">
              Explore All Ready-to-Wear
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex justify-between items-baseline border-b border-stone-line pb-3">
            <p className="text-xs text-obsidian-muted font-medium">
              Showing {products.length} {products.length === 1 ? 'piece' : 'pieces'} in {collection.name}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

