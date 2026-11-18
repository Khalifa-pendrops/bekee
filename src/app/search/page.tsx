'use client';

import React, { useState, useEffect, Suspense, useMemo } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Product } from "@/types";
import { ProductCard } from "@/components/product/ProductCard";
import { Sparkles, Search, X, PackageSearch, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { ScrollReveal } from "@/components/ui/ScrollReveal";

function SearchContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const urlQuery = searchParams.get('q') || '';

  const [inputQuery, setInputQuery] = useState(urlQuery);
  const [debouncedQuery, setDebouncedQuery] = useState(urlQuery);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Sync state if URL query changes (e.g. clicking trending tags or navigating)
  useEffect(() => {
    setInputQuery(urlQuery);
    setDebouncedQuery(urlQuery);
  }, [urlQuery]);

  // Load product catalog
  useEffect(() => {
    let isMounted = true;
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (isMounted && Array.isArray(data)) {
          setAllProducts(data);
          setHasLoaded(true);
        }
      })
      .catch(() => {
        if (isMounted) setHasLoaded(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Debounce input typing (250ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      const trimmed = inputQuery.trim();
      setDebouncedQuery(trimmed);

      // Keep URL updated without refreshing page
      if (trimmed !== urlQuery.trim()) {
        const targetUrl = trimmed ? `/search?q=${encodeURIComponent(trimmed)}` : '/search';
        router.replace(targetUrl, { scroll: false });
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [inputQuery, router, urlQuery]);

  // High-performance name-prioritized live search results
  const results = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) return [];
    const q = debouncedQuery.toLowerCase();

    const startsWithName: Product[] = [];
    const startsWithWord: Product[] = [];
    const containsInName: Product[] = [];
    const otherMatches: Product[] = [];
    const seen = new Set<string>();

    for (const p of allProducts) {
      if (!p.isPublished || p.isArchived) continue;
      const nameLower = p.name.toLowerCase();

      // 1. Starts with query (e.g. "Zik" -> "Zikora...")
      if (nameLower.startsWith(q)) {
        startsWithName.push(p);
        seen.add(p.id);
      }
    }

    for (const p of allProducts) {
      if (seen.has(p.id) || !p.isPublished || p.isArchived) continue;
      const words = p.name.toLowerCase().split(/\s+/);
      // 2. Any word in the title starts with query (e.g. "Neckline", "Kaftan")
      if (words.some((w) => w.startsWith(q))) {
        startsWithWord.push(p);
        seen.add(p.id);
      }
    }

    for (const p of allProducts) {
      if (seen.has(p.id) || !p.isPublished || p.isArchived) continue;
      // 3. Name contains query anywhere
      if (p.name.toLowerCase().includes(q)) {
        containsInName.push(p);
        seen.add(p.id);
      }
    }

    for (const p of allProducts) {
      if (seen.has(p.id) || !p.isPublished || p.isArchived) continue;
      // 4. Tagline, category, or color match
      const colors = (p.variants || []).map((v) => (v.colorName || '').toLowerCase()).join(' ');
      const corpus = `${p.tagline || ''} ${p.categorySlug} ${p.subCategorySlug} ${colors} ${p.description}`.toLowerCase();
      if (corpus.includes(q)) {
        otherMatches.push(p);
        seen.add(p.id);
      }
    }

    return [...startsWithName, ...startsWithWord, ...containsInName, ...otherMatches];
  }, [debouncedQuery, allProducts]);

  const handleClear = () => {
    setInputQuery('');
    setDebouncedQuery('');
    router.replace('/search', { scroll: false });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Search Header Bar */}
      <div className="border-b border-stone-line pb-6 space-y-5">
        <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-oxblood font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Product Discovery • Aba Showroom &amp; Online</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
          <h1 className="editorial-heading text-3xl sm:text-4xl text-obsidian">
            {debouncedQuery ? `Search results for "${debouncedQuery}"` : "Search Arubekee Collection"}
          </h1>
          {hasLoaded && debouncedQuery && (
            <p className="text-xs text-obsidian-muted font-medium">
              Found {results.length} matching {results.length === 1 ? 'piece' : 'pieces'}
            </p>
          )}
        </div>

        {/* Live Debounced Search Bar */}
        <div className="max-w-2xl relative">
          <div className="relative flex items-center bg-white rounded-full border-2 border-[#D8B4A6] focus-within:border-oxblood focus-within:ring-4 focus-within:ring-oxblood/10 py-2 px-4 shadow-sm transition-all">
            <Search className="w-5 h-5 text-oxblood mr-2.5 shrink-0" />
            <input
              type="text"
              autoFocus
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Type product name, e.g. Zikora, Adaugo, Kamsi, Somto..."
              className="w-full bg-transparent text-stone-900 placeholder:text-stone-400 focus:outline-none text-sm font-medium"
            />
            {inputQuery && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1 text-stone-400 hover:text-stone-700 transition-colors mr-1 rounded-full hover:bg-stone-100"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Trending Styles Quick Filter Chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="font-bold uppercase tracking-wider text-[10px] text-stone-400">Trending Styles:</span>
          {["Zikora", "Adaugo", "Kamsi", "Somto", "Chiamaka", "Crepe Midi", "Mules", "Emerald", "Oxblood"].map((term) => (
            <button
              key={term}
              type="button"
              onClick={() => {
                setInputQuery(term);
                setDebouncedQuery(term);
                router.replace(`/search?q=${encodeURIComponent(term)}`, { scroll: false });
              }}
              className="px-3 py-1 bg-white hover:bg-oxblood hover:text-white text-stone-800 rounded-full border border-[#E5C7BC] transition-all text-xs font-medium active:scale-95 shadow-xs"
            >
              {term}
            </button>
          ))}
        </div>
      </div>

      {/* Results View */}
      {hasLoaded && (
        <div>
          {!debouncedQuery ? (
            <div className="py-16 text-center border border-dashed border-stone-200 rounded-2xl bg-sand-50/50 p-8 space-y-4">
              <PackageSearch className="w-10 h-10 text-oxblood/60 mx-auto" />
              <h2 className="font-serif text-2xl text-stone-900 font-bold">Start typing to search products</h2>
              <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
                Type the first letters of any design name (e.g. &ldquo;Z&rdquo; for Zikora, &ldquo;S&rdquo; for Somto, &ldquo;K&rdquo; for Kamsi) to see instant matching pieces.
              </p>
              <Link href="/shop" className="inline-block pt-2">
                <Button variant="primary" size="md">
                  Browse All Ready-to-Wear
                </Button>
              </Link>
            </div>
          ) : results.length === 0 ? (
            <div className="py-20 text-center border border-stone-line bg-ivory-warm p-8 space-y-4 rounded-2xl">
              <p className="font-serif text-2xl text-obsidian">No exact matches found</p>
              <p className="text-xs text-obsidian-muted max-w-md mx-auto leading-relaxed">
                We couldn&apos;t find anything matching &ldquo;{debouncedQuery}&rdquo;. Check your spelling, try one of the trending names above, or browse our ready-to-wear collection.
              </p>
              <div className="flex justify-center gap-3 pt-2">
                <Button variant="secondary" size="md" onClick={handleClear}>
                  Clear Search
                </Button>
                <Link href="/shop">
                  <Button variant="primary" size="md">
                    Explore All Ready-to-Wear
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {results.map((product, idx) => (
                  <ScrollReveal key={product.id} animation="slide-up" delay={(idx % 4) * 60}>
                    <ProductCard product={product} />
                  </ScrollReveal>
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
