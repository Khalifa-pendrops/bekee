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
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Left: Mobile Menu Trigger & Desktop Search */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="lg:hidden p-2 text-obsidian hover:text-oxblood transition-colors -ml-2"
                aria-label="Open mobile menu"
              >
                <Menu className="w-6 h-6 stroke-1.5" />
              </button>

              <button
                onClick={() => setIsSearchOpen(true)}
                className="hidden lg:flex items-center gap-2 text-xs uppercase tracking-wider text-obsidian-muted hover:text-obsidian px-3 py-1.5 rounded-none border border-transparent hover:border-stone-line transition-all"
              >
                <Search className="w-4 h-4 text-obsidian-subtle" />
                <span>Search</span>
              </button>
            </div>

            {/* Center: Brand Identity */}
            <div className="flex flex-col items-center text-center">
              <Link href="/" className="group flex flex-col items-center">
                <span className="font-serif text-2xl sm:text-3xl font-normal tracking-[0.22em] text-obsidian group-hover:text-oxblood transition-colors uppercase">
                  ARUBEKEE
                </span>
                <span className="text-[9px] sm:text-[10px] tracking-[0.35em] text-obsidian-muted uppercase font-sans -mt-1">
                  Collection • Aba
                </span>
              </Link>
            </div>

            {/* Right: Actions (Wishlist, Admin, Bag) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Mobile Search Icon */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className="lg:hidden p-2 text-obsidian hover:text-oxblood transition-colors"
                aria-label="Search store"
              >
                <Search className="w-5 h-5 stroke-1.5" />
              </button>

              {/* Wishlist */}
              <Link
                href="/wishlist"
                className="relative p-2 text-obsidian hover:text-oxblood transition-colors"
                aria-label="Wishlist"
              >
                <Heart className="w-5 h-5 stroke-1.5" />
                {totalWishlistCount > 0 && (
                  <span className="absolute top-1 right-1 bg-oxblood text-ivory-light text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fade-in">
                    {totalWishlistCount}
                  </span>
                )}
              </Link>

              {/* Shopping Bag */}
              <button
                onClick={openCart}
                className="relative p-2 text-obsidian hover:text-oxblood transition-colors"
                aria-label="Shopping Bag"
              >
                <ShoppingBag className="w-5 h-5 stroke-1.5" />
                {totalQuantity > 0 && (
                  <span className="absolute top-1 right-1 bg-oxblood text-ivory-light text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-fade-in">
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
        <div className="fixed inset-0 z-50 bg-obsidian/70 backdrop-blur-sm p-4 flex items-start justify-center pt-20 animate-fade-in">
          <div className="bg-ivory w-full max-w-2xl border border-stone-line shadow-floating p-6 relative">
            <button
              onClick={() => setIsSearchOpen(false)}
              className="absolute top-4 right-4 p-2 text-obsidian-subtle hover:text-obsidian"
              aria-label="Close search"
            >
              <X className="w-5 h-5" />
            </button>

            <form onSubmit={handleSearchSubmit} className="space-y-4">
              <label className="block text-xs uppercase font-semibold tracking-wider text-obsidian-muted">
                Search Arubekee Collection
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-obsidian-subtle" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Dresses, heels, handbags, matching sets, workwear..."
                  className="w-full bg-ivory-light border border-stone-line pl-12 pr-4 py-3 text-base text-obsidian focus:outline-none focus:border-oxblood focus:ring-1 focus:ring-oxblood"
                />
              </div>

              <div className="flex flex-wrap gap-2 pt-2 items-center text-xs text-obsidian-muted">
                <span className="font-semibold uppercase tracking-wider text-obsidian-soft text-[10px]">Popular:</span>
                {["Aba Made Dresses", "Two Piece Sets", "Low Block Heels", "Tote Bags", "Office Wear"].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      setSearchQuery(tag);
                      window.location.href = `/search?q=${encodeURIComponent(tag)}`;
                      setIsSearchOpen(false);
                    }}
                    className="px-2.5 py-1 bg-ivory-muted hover:bg-stone-line/70 text-obsidian transition-colors text-xs"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Mobile Navigation Drawer */}
      <Drawer
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        title="ARUBEKEE"
        description="Women's Fashion • Aba, Abia State"
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

