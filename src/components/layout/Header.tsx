'use client';

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { 
  ShoppingBag, 
  Heart, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  MessageCircle, 
  ChevronRight 
} from "lucide-react";
import { Drawer } from "@/components/ui/Drawer";
import { ModernSearchBar } from "@/components/layout/ModernSearchBar";

export function Header() {
  const { totalQuantity, openCart } = useCart();
  const { totalWishlistCount } = useWishlist();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const navigationCategories = [
    { name: "New Arrivals", href: "/collections/new-arrivals", highlight: true },
    { name: "Clothing", href: "/categories/clothing" },
    { name: "Shoes", href: "/categories/shoes" },
    { name: "Bags", href: "/categories/bags" },
    { name: "Accessories", href: "/categories/accessories" },
    { name: "Workwear", href: "/collections/workwear" },
    { name: "Weekend", href: "/collections/weekend-looks" },
    { name: "Occasion", href: "/collections/occasion-wear" },
    { name: "Sale", href: "/collections/sale", isSale: true },
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/search?q=${encodeURIComponent(searchQuery.trim())}`;
      setIsSearchOpen(false);
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-ivory/95 backdrop-blur-md border-b border-stone-line transition-all">
        {/* Main Navbar */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-4">
            
            {/* Left: Mobile Menu & Brand Identity */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-obsidian hover:text-oxblood transition-colors -ml-2"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6 stroke-1.5" />
              </button>

              <Link href="/" className="group flex flex-col">
                <span className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.22em] text-obsidian group-hover:text-oxblood transition-colors uppercase">
                  ARUBEKEE
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-oxblood uppercase font-sans font-semibold -mt-1">
                  Collection
                </span>
              </Link>
            </div>

            {/* Center: Modern Search Bar (Prominent on Desktop) */}
            <div className="hidden lg:flex flex-1 max-w-lg mx-6">
              <ModernSearchBar variant="header" />
            </div>

            {/* Right: Actions (Mobile Search, Wishlist, Bag) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Button */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-obsidian hover:text-oxblood transition-colors flex items-center justify-center rounded-full border border-[#D8B4A6]/60 bg-white shadow-xs"
                aria-label="Search store"
              >
                <Search className="w-4 h-4 text-oxblood" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2.5 text-obsidian hover:text-oxblood transition-colors rounded-full hover:bg-sand-100"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-1.5" />
                {totalWishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-oxblood text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fade-in shadow-xs">
                    {totalWishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag */}
              <button
                onClick={openCart}
                className="relative p-2.5 text-obsidian hover:text-oxblood transition-colors rounded-full hover:bg-sand-100"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-1.5" />
                {totalQuantity > 0 && (
                  <span className="absolute top-1 right-1 bg-oxblood text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fade-in shadow-xs">
                    {totalQuantity}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Desktop Category Navigation */}
          <nav className="hidden lg:flex items-center justify-center gap-8 py-2.5 border-t border-stone-line/60">
            {navigationCategories.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`nav-link text-xs tracking-widest uppercase transition-colors ${
                  item.isSale
                    ? "text-oxblood font-bold"
                    : item.highlight
                    ? "text-obsidian font-bold"
                    : "text-obsidian-soft hover:text-oxblood"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>

      {/* Search Overlay Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-md p-4 flex items-start justify-center pt-16 sm:pt-24 animate-fade-in">
          <div className="bg-white rounded-2xl border-2 border-[#E5C7BC] shadow-floating p-6 sm:p-8 w-full max-w-2xl relative">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 p-2 text-stone-400 hover:text-stone-900 rounded-full hover:bg-sand-100 transition-colors"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="space-y-5">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-oxblood">
                  Curated Catalog Search
                </span>
                <h3 className="font-serif text-xl sm:text-2xl text-stone-900 font-normal mt-0.5">
                  What are you looking to wear?
                </h3>
              </div>

              {/* Modern Search Bar */}
              <ModernSearchBar
                variant="modal"
                autoFocus
                onSearchExecuted={() => setIsSearchOpen(false)}
              />

              {/* Trending Suggestion Chips */}
              <div className="flex flex-wrap gap-2 pt-2 items-center text-xs">
                <span className="font-bold uppercase tracking-wider text-stone-400 text-[10px]">Trending:</span>
                {[
                  "Aba Made Crepe",
                  "Two Piece Sets",
                  "Handcrafted Mules",
                  "Evening Jumpsuits",
                  "Tote Bags",
                  "Wedding Guest"
                ].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                      setIsSearchOpen(false);
                    }}
                    className="px-3 py-1.5 rounded-full bg-sand-100 hover:bg-oxblood hover:text-white text-stone-800 border border-[#E8DFD3] transition-all text-xs font-medium active:scale-95 shadow-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="ARUBEKEE COLLECTION"
        description="Contemporary Ready-to-Wear Fashion"
        position="left"
      >
        <div className="space-y-6">
          <div className="space-y-1 divide-y divide-stone-line/50">
            {navigationCategories.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center justify-between py-3.5 text-sm uppercase tracking-wider font-medium ${
                  item.isSale ? "text-oxblood font-bold" : "text-obsidian"
                }`}
              >
                <span>{item.name}</span>
                <ChevronRight className="w-4 h-4 text-obsidian-subtle" />
              </Link>
            ))}
          </div>

          <div className="border-t border-stone-line pt-4 space-y-3">
            <Link
              href="/admin"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs uppercase tracking-wider text-obsidian-muted hover:text-oxblood"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Owner Admin Access</span>
            </Link>

            <Link
              href="/contact"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center gap-2 text-xs uppercase tracking-wider text-obsidian-muted hover:text-oxblood"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Aba Store Hours & WhatsApp</span>
            </Link>
          </div>
        </div>
      </Drawer>
    </>
  );
}

