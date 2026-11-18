'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Image from 'next/image';
import { Search, Sparkles, X, ArrowRight, ChevronRight, PackageSearch } from 'lucide-react';
import { Product } from '@/types';
import { formatKoboToNaira } from '@/lib/utils';

const ATTRACTIVE_PLACEHOLDERS = [
  "Search 'Adaugo Draped Silk Midi'...",
  "Search 'Zikora Royal Neckline Kaftan'...",
  "Search 'Somto Palm Oasis Asymmetric Tunic'...",
  "Search 'Kamsi Hourglass Brooch Dress'...",
  "Search 'Handcrafted Aba Leather Mules'...",
  "Search 'Architectural Top-Handle Bag'...",
  "Search 'Harmattan Linen Co-ord Sets'...",
];

// Helper to highlight matching characters in product title
function HighlightMatch({ text, query }: { text: string; query: string }) {
  if (!query || query.length === 0) return <span>{text}</span>;
  const index = text.toLowerCase().indexOf(query.toLowerCase());
  if (index === -1) return <span>{text}</span>;

  const before = text.substring(0, index);
  const match = text.substring(index, index + query.length);
  const after = text.substring(index + query.length);

  return (
    <span>
      {before}
      <span className="text-oxblood font-bold underline decoration-oxblood/40">{match}</span>
      {after}
    </span>
  );
}

interface ModernSearchBarProps {
  className?: string;
  variant?: 'header' | 'hero' | 'modal';
  onSearchExecuted?: () => void;
  autoFocus?: boolean;
}

export function ModernSearchBar({
  className = '',
  variant = 'header',
  onSearchExecuted,
  autoFocus = false,
}: ModernSearchBarProps) {
  const router = useRouter();
  const pathname = usePathname();

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Cached product catalog for instant live search
  const [catalog, setCatalog] = useState<Product[]>([]);
  const [hasLoadedCatalog, setHasLoadedCatalog] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch catalog once on mount / focus for instant live search
  useEffect(() => {
    let isMounted = true;
    fetch('/api/products')
      .then((res) => res.json())
      .then((data: Product[]) => {
        if (isMounted && Array.isArray(data)) {
          setCatalog(data);
          setHasLoadedCatalog(true);
        }
      })
      .catch(() => {});

    return () => {
      isMounted = false;
    };
  }, []);

  // Clear search term whenever route changes (e.g. entering search results page or returning home)
  useEffect(() => {
    setSearchTerm('');
    setDebouncedQuery('');
    setShowDropdown(false);
  }, [pathname]);

  // Click outside to dismiss suggestions dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounce user keystrokes (200ms) for high-speed live search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchTerm.trim());
    }, 200);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Animated rotating placeholder when input is empty
  useEffect(() => {
    if (searchTerm) return;

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % ATTRACTIVE_PLACEHOLDERS.length);
        setIsFading(false);
      }, 300);
    }, 3200);

    return () => clearInterval(interval);
  }, [searchTerm]);

  // Filter products prioritizing exact/starts-with product name matches
  const suggestions = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 1) return [];
    const q = debouncedQuery.toLowerCase();

    const startsWithName: Product[] = [];
    const startsWithWord: Product[] = [];
    const containsInName: Product[] = [];
    const otherMatches: Product[] = [];
    const seen = new Set<string>();

    for (const p of catalog) {
      if (!p.isPublished || p.isArchived) continue;
      const nameLower = p.name.toLowerCase();

      // 1. Product name starts with query (e.g. "Zik" -> "Zikora...")
      if (nameLower.startsWith(q)) {
        startsWithName.push(p);
        seen.add(p.id);
      }
    }

    for (const p of catalog) {
      if (seen.has(p.id) || !p.isPublished || p.isArchived) continue;
      const words = p.name.toLowerCase().split(/\s+/);
      // 2. Any word in the product name begins with query (e.g. "Kaftan", "Neckline")
      if (words.some((w) => w.startsWith(q))) {
        startsWithWord.push(p);
        seen.add(p.id);
      }
    }

    for (const p of catalog) {
      if (seen.has(p.id) || !p.isPublished || p.isArchived) continue;
      // 3. Product name contains query anywhere
      if (p.name.toLowerCase().includes(q)) {
        containsInName.push(p);
        seen.add(p.id);
      }
    }

    for (const p of catalog) {
      if (seen.has(p.id) || !p.isPublished || p.isArchived) continue;
      // 4. Tagline, category, or color match
      const colors = (p.variants || []).map((v) => (v.colorName || '').toLowerCase()).join(' ');
      const corpus = `${p.tagline || ''} ${p.categorySlug} ${p.subCategorySlug} ${colors}`.toLowerCase();
      if (corpus.includes(q)) {
        otherMatches.push(p);
        seen.add(p.id);
      }
    }

    return [...startsWithName, ...startsWithWord, ...containsInName, ...otherMatches].slice(0, 6);
  }, [debouncedQuery, catalog]);

  const executeSearch = (queryText: string) => {
    const q = queryText.trim() || ATTRACTIVE_PLACEHOLDERS[placeholderIndex].replace(/Search '|'\.\.\./g, '');
    if (!q) return;

    setSearchTerm('');
    setDebouncedQuery('');
    setShowDropdown(false);

    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement)?.blur();
    }

    router.push(`/search?q=${encodeURIComponent(q)}`);
    if (onSearchExecuted) onSearchExecuted();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(searchTerm);
  };

  const handleSelectProduct = (product: Product) => {
    setSearchTerm('');
    setDebouncedQuery('');
    setShowDropdown(false);

    if (typeof document !== 'undefined') {
      (document.activeElement as HTMLElement)?.blur();
    }

    if (onSearchExecuted) onSearchExecuted();
    router.push(`/products/${product.slug}`);
  };

  const handleClear = () => {
    setSearchTerm('');
    setDebouncedQuery('');
    setShowDropdown(false);
  };

  const currentPlaceholder = ATTRACTIVE_PLACEHOLDERS[placeholderIndex];
  const isDropdownVisible = showDropdown && searchTerm.trim().length >= 1;

  return (
    <div ref={containerRef} className={`relative w-full group ${className}`}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div
          className={`relative flex items-center bg-white rounded-full transition-all duration-300 shadow-sm ${
            variant === 'hero'
              ? 'border-2 border-[#D8B4A6] hover:border-oxblood focus-within:border-oxblood focus-within:ring-4 focus-within:ring-oxblood/10 py-1.5 px-3'
              : variant === 'modal'
              ? 'border-2 border-[#D8B4A6] focus-within:border-oxblood focus-within:ring-4 focus-within:ring-oxblood/10 py-2 px-4 shadow-md'
              : 'border-2 border-[#E5C7BC] hover:border-oxblood focus-within:border-oxblood focus-within:ring-4 focus-within:ring-oxblood/10 py-1 px-3 max-w-md'
          } ${isFocused || isDropdownVisible ? 'shadow-md scale-[1.01] border-oxblood' : 'hover:shadow-md'}`}
        >
          {/* Left Search Icon with Gold Accent */}
          <div className="flex items-center gap-1.5 pl-1.5 pr-2 text-oxblood shrink-0">
            <Search className="w-4 h-4 transition-transform duration-300 group-hover:scale-110" />
            <Sparkles className="w-3 h-3 text-gold animate-pulse hidden sm:inline" />
          </div>

          {/* Input Field with Animated Placeholder */}
          <div className="relative flex-1 min-w-0">
            <input
              type="text"
              autoFocus={autoFocus}
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onFocus={() => {
                setIsFocused(true);
                if (searchTerm.trim().length >= 1) setShowDropdown(true);
              }}
              onBlur={() => setIsFocused(false)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') setShowDropdown(false);
              }}
              placeholder={currentPlaceholder}
              className={`w-full bg-transparent text-stone-900 placeholder:text-stone-400 placeholder:transition-opacity placeholder:duration-300 focus:outline-none font-medium ${
                isFading ? 'placeholder:opacity-0' : 'placeholder:opacity-100'
              } ${variant === 'hero' || variant === 'modal' ? 'text-sm py-2' : 'text-xs py-1.5'}`}
            />
          </div>

          {/* Clear Button (when typing) */}
          {searchTerm && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 text-stone-400 hover:text-stone-700 transition-colors mr-1 rounded-full hover:bg-stone-100"
              aria-label="Clear search"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Search Action Pill Button */}
          <button
            type="submit"
            className={`shrink-0 rounded-full font-bold uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-1 shadow-sm active:scale-95 ${
              variant === 'hero' || variant === 'modal'
                ? 'px-5 py-2 text-xs bg-oxblood hover:bg-oxblood-hover text-white'
                : 'px-3.5 py-1.5 text-[11px] bg-oxblood hover:bg-oxblood-hover text-white'
            }`}
          >
            <span>Find</span>
            <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      </form>

      {/* ======================================================== */}
      {/* INSTANT DEBOUNCED LIVE PRODUCT PREVIEW DROPDOWN */}
      {/* ======================================================== */}
      {isDropdownVisible && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border-2 border-[#E5C7BC] shadow-2xl z-50 overflow-hidden animate-fade-in max-h-[460px] flex flex-col">
          
          {/* Dropdown Header */}
          <div className="px-4 py-2.5 bg-sand-50/90 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="font-semibold text-stone-700 uppercase tracking-wider text-[10px] flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-gold" />
              <span>Products Matching &quot;{debouncedQuery || searchTerm}&quot;</span>
            </span>
            <span className="text-stone-400 text-[11px]">
              {suggestions.length} {suggestions.length === 1 ? 'match' : 'matches'}
            </span>
          </div>

          {/* Product Items List */}
          <div className="divide-y divide-stone-100 overflow-y-auto flex-1">
            {suggestions.length > 0 ? (
              suggestions.map((p) => {
                const primaryImage = (p.images || []).find((img) => img.isPrimary) || p.images?.[0];
                const lowestPrice = Math.min(...(p.variants || []).map((v) => v.salePriceKobo || v.priceKobo));
                const totalStock = (p.variants || []).reduce((acc, v) => acc + (v.stockQuantity || 0), 0);

                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSelectProduct(p)}
                    className="w-full text-left p-3 hover:bg-sand-50/80 transition-colors flex items-center gap-3 group/item"
                  >
                    {/* Thumbnail Image */}
                    <div className="w-12 h-14 bg-stone-100 rounded-lg overflow-hidden relative shrink-0 border border-stone-200">
                      {primaryImage?.url ? (
                        <Image
                          src={primaryImage.url}
                          alt={p.name}
                          fill
                          sizes="48px"
                          className="object-cover group-hover/item:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-stone-300">
                          <PackageSearch className="w-5 h-5" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <h4 className="font-serif font-bold text-stone-900 text-xs sm:text-sm truncate">
                        <HighlightMatch text={p.name} query={debouncedQuery || searchTerm} />
                      </h4>

                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-stone-500">
                        <span className="capitalize">{p.categorySlug}</span>
                        {p.tagline && (
                          <>
                            <span>•</span>
                            <span className="truncate max-w-[200px]">{p.tagline}</span>
                          </>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-serif font-bold text-xs text-oxblood">
                          {formatKoboToNaira(lowestPrice)}
                        </span>
                        {totalStock > 0 ? (
                          <span className="text-[10px] text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded font-medium">
                            In Stock
                          </span>
                        ) : (
                          <span className="text-[10px] text-stone-400 bg-stone-100 px-1.5 py-0.2 rounded font-medium">
                            Out of stock
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Chevron Indicator */}
                    <div className="text-stone-300 group-hover/item:text-oxblood group-hover/item:translate-x-0.5 transition-all pr-1">
                      <ChevronRight className="w-4 h-4" />
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-6 text-center text-stone-500 space-y-1">
                <p className="text-xs font-semibold text-stone-700">
                  No products found starting with &quot;{debouncedQuery || searchTerm}&quot;
                </p>
                <p className="text-[11px] text-stone-400">
                  Try checking your spelling or search by category (e.g. Dresses, Mules, Sets)
                </p>
              </div>
            )}
          </div>

          {/* Dropdown Footer: View All in Full Results Page */}
          <div className="p-3 bg-sand-50/90 border-t border-stone-200">
            <button
              type="button"
              onClick={() => executeSearch(searchTerm)}
              className="w-full py-2 bg-stone-900 hover:bg-oxblood text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <span>See all results for &quot;{searchTerm}&quot;</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      )}
    </div>
  );
}
