'use client';

import React from "react";
import Link from "next/link";
import { useWishlist } from "@/context/WishlistContext";
import { formatKoboToNaira } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Heart, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function WishlistPage() {
  const { items, toggleWishlist, totalWishlistCount } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-stone-line pb-6 text-left">
        <span className="text-xs uppercase tracking-widest font-semibold text-oxblood">
          Saved Favorites
        </span>
        <h1 className="editorial-heading text-3xl sm:text-4xl text-obsidian font-normal mt-1">
          Your Curated Wishlist
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted mt-1">
          {totalWishlistCount} {totalWishlistCount === 1 ? 'piece' : 'pieces'} saved for later
        </p>
      </div>

      {items.length === 0 ? (
        <div className="py-24 text-center border border-stone-line bg-ivory-warm p-8 space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-full bg-ivory-muted flex items-center justify-center text-obsidian-subtle mx-auto">
            <Heart className="w-8 h-8 stroke-1" />
          </div>
          <h2 className="font-serif text-2xl text-obsidian">Your wishlist is currently empty</h2>
          <p className="text-xs text-obsidian-muted leading-relaxed">
            Found something you love? Tap the heart icon on any dress, footwear, or handbag to save it here while you decide.
          </p>
          <Link href="/shop" className="inline-block pt-2">
            <Button variant="primary" size="md">
              Explore Collections
            </Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((item) => (
            <div
              key={item.productId}
              className="group flex flex-col bg-ivory border border-stone-line relative select-none"
            >
              {/* Image */}
              <div className="relative aspect-[3/4] overflow-hidden bg-stone-subtle">
                <Link href={`/products/${item.productSlug}`}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.primaryImage}
                    alt={item.productName}
                    className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                  />
                </Link>

                {item.hasSale && (
                  <div className="absolute top-2.5 left-2.5">
                    <Badge variant="sale">Sale</Badge>
                  </div>
                )}

                <button
                  onClick={() => toggleWishlist(item)}
                  className="absolute top-2.5 right-2.5 p-2 bg-ivory/90 hover:bg-ivory text-obsidian rounded-full shadow-subtle hover:text-status-danger transition-colors"
                  aria-label="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Details */}
              <div className="p-3.5 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-obsidian-subtle capitalize">
                    {item.categorySlug}
                  </span>
                  <Link href={`/products/${item.productSlug}`} className="block mt-0.5">
                    <h3 className="font-serif text-sm font-medium text-obsidian group-hover:text-oxblood truncate transition-colors">
                      {item.productName}
                    </h3>
                  </Link>

                  <div className="mt-1 flex items-baseline gap-2">
                    <span className="font-sans font-semibold text-sm text-oxblood">
                      {formatKoboToNaira(item.startingPriceKobo)}
                    </span>
                    {item.originalPriceKobo && (
                      <span className="text-xs text-obsidian-subtle line-through">
                        {formatKoboToNaira(item.originalPriceKobo)}
                      </span>
                    )}
                  </div>
                </div>

                <Link href={`/products/${item.productSlug}`} className="block w-full">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs uppercase tracking-wider gap-1.5"
                  >
                    <span>View & Select Size</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

