'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Sparkles, X, ArrowRight } from 'lucide-react';

const ATTRACTIVE_PLACEHOLDERS = [
  "Search 'Adaugo Draped Silk Midi'...",
  "Search 'Handcrafted Aba Leather Mules'...",
  "Search 'Emerald Jewel Evening Jumpsuit'...",
  "Search 'Sunday Best & Wedding Guest Edits'...",
  "Search 'Architectural Top-Handle Bag'...",
  "Search 'Harmattan Linen Co-ord Sets'...",
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [placeholderIndex, setPlaceholderIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  // Animated rotating placeholder
  useEffect(() => {
    if (searchTerm) return; // don't cycle if user has typed something

    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setPlaceholderIndex((prev) => (prev + 1) % ATTRACTIVE_PLACEHOLDERS.length);
        setIsFading(false);
      }, 300);
    }, 3200);

    return () => clearInterval(interval);
  }, [searchTerm]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = searchTerm.trim() || ATTRACTIVE_PLACEHOLDERS[placeholderIndex].replace(/Search '|'\.\.\./g, '');
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`);
      if (onSearchExecuted) onSearchExecuted();
    }
  };

  const handleClear = () => {
    setSearchTerm('');
  };

  const currentPlaceholder = ATTRACTIVE_PLACEHOLDERS[placeholderIndex];

  return (
    <form
      onSubmit={handleSubmit}
      className={`relative w-full group transition-all duration-300 ${className}`}
    >
      <div
        className={`relative flex items-center bg-white rounded-full transition-all duration-300 shadow-sm ${
          variant === 'hero'
            ? 'border-2 border-[#D8B4A6] hover:border-oxblood focus-within:border-oxblood focus-within:ring-4 focus-within:ring-oxblood/10 py-1.5 px-3'
            : variant === 'modal'
            ? 'border-2 border-[#D8B4A6] focus-within:border-oxblood focus-within:ring-4 focus-within:ring-oxblood/10 py-2 px-4 shadow-md'
            : 'border-2 border-[#E5C7BC] hover:border-oxblood focus-within:border-oxblood focus-within:ring-4 focus-within:ring-oxblood/10 py-1 px-3 max-w-md'
        } ${isFocused ? 'shadow-md scale-[1.01]' : 'hover:shadow-md'}`}
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
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
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
            className="p-1 text-stone-400 hover:text-stone-700 transition-colors mr-1"
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
  );
}

