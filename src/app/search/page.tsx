'use client';

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ModernSearchBar } from "@/components/layout/ModernSearchBar";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get('q') || '';
  const [searchTerm, setSearchTerm] = useState(query);
  const [results, setResults] = useState<Product[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    async function performSearch() {
      if (query.trim()) {
        const matching = await db.getProducts({
          search: query.trim(),
        });
        setResults(matching);
      } else {
        setResults([]);
      }
      setHasLoaded(true);
    }
    performSearch();
  }, [query]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchTerm.trim())}`;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header Bar */}
      <div className="border-b border-stone-line pb-8 space-y-4">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-oxblood font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Product Discovery</span>
        </div>

        <h1 className="editorial-heading text-3xl sm:text-4xl text-obsidian">
          {query ? `Search results for "${query}"` : "Search Arubekee Collection"}
        </h1>

        <div className="max-w-2xl pt-2">
          <ModernSearchBar variant="hero" />
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-2 text-xs">
          <span className="font-bold uppercase tracking-wider text-[10px] text-stone-400">Trending Styles:</span>
          {["Pleated Crepe", "Block Mule", "Leather Tote", "Two Piece", "Emerald", "Oxblood"].map((term) => (
            <Link
              key={term}
              href={`/search?q=${encodeURIComponent(term)}`}
              className="px-3 py-1 bg-white hover:bg-oxblood hover:text-white text-stone-800 rounded-full border border-[#E5C7BC] transition-all text-xs font-medium active:scale-95 shadow-xs"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>

      {/* Results View */}
      {hasLoaded && (
        <div>
          {results.length === 0 ? (
            <div className="py-20 text-center border border-stone-line bg-ivory-warm p-8 space-y-4">
              <p className="font-serif text-2xl text-obsidian">No exact matches found</p>
              <p className="text-xs text-obsidian-muted max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find anything matching &ldquo;{query}&rdquo;. Check your spelling or browse our popular categories.
              </p>
              <Link href="/shop">
                <Button variant="primary" size="md" className="mt-2">
                  Explore All Ready-to-Wear
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-xs text-obsidian-muted font-medium">
                Found {results.length} matching {results.length === 1 ? 'piece' : 'pieces'}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center font-serif text-lg text-obsidian">Searching catalogue...</div>}>
      <SearchContent />
    </Suspense>
  );
}

