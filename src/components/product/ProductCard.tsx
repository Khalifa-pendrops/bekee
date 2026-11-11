'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { formatKoboToNaira } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingBag, Check, Sparkles, AlertCircle } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

// Fallback color hex mapping for popular fashion shades
const COLOR_PALETTE_MAP: Record<string, string> = {
  'imperial oxblood': '#6B1724',
  'oxblood': '#6B1724',
  'wine': '#6B1724',
  'burgundy': '#54121B',
  'obsidian black': '#181514',
  'black': '#181514',
  'ivory sand': '#FAF6F0',
  'ivory': '#FAF6F0',
  'cream': '#F7F2EA',
  'white': '#FFFFFF',
  'emerald jewel': '#064E3B',
  'emerald green': '#064E3B',
  'emerald': '#064E3B',
  'green': '#15803D',
  'royal sapphire': '#1E3A8A',
  'blue': '#1D4ED8',
  'navy': '#0F172A',
  'burnt terracotta': '#B4533C',
  'terracotta': '#B4533C',
  'rust': '#9A3412',
  'mustard gold': '#C59B46',
  'gold': '#C59B46',
  'amber tortoise': '#B45309',
  'tan': '#D97706',
  'chocolate': '#451A03',
  'rose': '#E11D48',
  'blush': '#FDA4AF',
  'fuschia': '#C026D3',
};

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Stock calculations
  const totalStock = product.variants.reduce((sum, v) => sum + v.stockQuantity, 0);
  const isSoldOut = totalStock <= 0;
  const isLowStock = !isSoldOut && totalStock <= 5;

  const [activeColor, setActiveColor] = useState<string>(
    product.variants[0]?.colorName || ""
  );

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length === 1 ? product.variants[0] : null
  );
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  // Images
  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary && img.sortOrder > 0) || primaryImage;

  // Compute pricing
  const defaultVariant = product.variants[0];
  const startingPriceKobo = defaultVariant ? defaultVariant.priceKobo : 0;
  const salePriceKobo = defaultVariant?.salePriceKobo;
  const hasSale = !!salePriceKobo && salePriceKobo < startingPriceKobo;
  const discountPercent = hasSale ? Math.round(((startingPriceKobo - salePriceKobo!) / startingPriceKobo) * 100) : 0;

  // Unique colours (defensive against undefined/empty color names)
  const uniqueColors = Array.from(
    new Set(
      (product.variants || [])
        .map((v) => v?.colorName?.trim())
        .filter((c): c is string => Boolean(c))
    )
  );

  // Sizes breakdown with their respective availability
  const uniqueSizes = Array.from(
    new Set(
      (product.variants || [])
        .map((v) => v?.size?.trim())
        .filter((s): s is string => Boolean(s))
    )
  );

  const inWishlist = isInWishlist(product.id);

  const handleWishlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWishlist({
      productId: product.id,
      productSlug: product.slug,
      productName: product.name,
      primaryImage: primaryImage?.url || "",
      startingPriceKobo: salePriceKobo || startingPriceKobo,
      originalPriceKobo: hasSale ? startingPriceKobo : undefined,
      hasSale,
      categorySlug: product.categorySlug,
      addedAt: new Date().toISOString(),
    });
  };

  const handleQuickAddClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (product.variants.length === 1 && product.variants[0].stockQuantity > 0) {
      const v = product.variants[0];
      addItem({
        productId: product.id,
        variantId: v.id,
        productName: product.name,
        productSlug: product.slug,
        image: primaryImage?.url || "",
        colorName: v.colorName,
        size: v.size,
        unitPriceKobo: v.salePriceKobo || v.priceKobo,
        originalPriceKobo: v.salePriceKobo ? v.priceKobo : undefined,
        quantity: 1,
        maxAvailableStock: v.stockQuantity,
      });
    } else {
      setIsQuickAddModalOpen(true);
    }
  };

  const handleConfirmModalAdd = () => {
    if (!selectedVariant || selectedVariant.stockQuantity <= 0) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      productSlug: product.slug,
      image: primaryImage?.url || "",
      colorName: selectedVariant.colorName,
      size: selectedVariant.size,
      unitPriceKobo: selectedVariant.salePriceKobo || selectedVariant.priceKobo,
      originalPriceKobo: selectedVariant.salePriceKobo ? selectedVariant.priceKobo : undefined,
      quantity: 1,
      maxAvailableStock: selectedVariant.stockQuantity,
    });

    setIsQuickAddModalOpen(false);
  };

  return (
    <>
      <div
        className="group relative flex flex-col bg-white rounded-xl border border-[#EADDCF]/70 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 overflow-hidden select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* ======================================================== */}
        {/* IMAGE CONTAINER */}
        {/* ======================================================== */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-ivory-warm">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isHovered && secondaryImage ? secondaryImage.url : primaryImage?.url}
              alt={primaryImage?.altText || product.name}
              className={`w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105 ${
                isSoldOut ? "grayscale opacity-85" : ""
              }`}
              loading={priority ? "eager" : "lazy"}
            />
          </Link>

          {/* Top-Left Status Badges */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            {isSoldOut ? (
              <span className="px-2.5 py-1 bg-stone-900/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                Sold Out
              </span>
            ) : isLowStock ? (
              <span className="px-2.5 py-1 bg-terracotta text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
                Only {totalStock} Left
              </span>
            ) : hasSale ? (
              <span className="px-2.5 py-1 bg-oxblood text-white text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                {discountPercent > 0 ? `${discountPercent}% OFF` : 'Sale'}
              </span>
            ) : product.collectionSlugs.includes("new-arrivals") ? (
              <span className="px-2.5 py-1 bg-gold text-stone-950 text-[10px] font-bold uppercase tracking-wider rounded-md shadow-sm">
                New Drop
              </span>
            ) : null}
          </div>

          {/* Floating Wishlist Heart */}
          <button
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 right-2.5 w-8 h-8 bg-white/90 hover:bg-white text-stone-900 rounded-full shadow-sm flex items-center justify-center transition-all duration-200 z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                inWishlist ? "fill-oxblood text-oxblood" : "text-stone-700 hover:text-oxblood"
              }`}
            />
          </button>

          {/* Size Pills Hover Overlay on Desktop */}
          <div className="absolute inset-x-2 bottom-12 hidden sm:flex flex-wrap items-center justify-center gap-1 opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10 pointer-events-none">
            {uniqueSizes.slice(0, 5).map((size) => {
              const matchingVariant = product.variants.find((v) => v.size === size);
              const isSizeInStock = matchingVariant && matchingVariant.stockQuantity > 0;
              return (
                <span
                  key={size}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase backdrop-blur-md shadow-sm ${
                    isSizeInStock
                      ? "bg-white/95 text-stone-900 border border-stone-200"
                      : "bg-stone-200/80 text-stone-400 line-through"
                  }`}
                >
                  {size}
                </span>
              );
            })}
          </div>

          {/* Quick Add Action Bar - Slides up on desktop */}
          {!isSoldOut && (
            <div className="absolute inset-x-2 bottom-2 hidden sm:block opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0 transition-all duration-300 z-10">
              <button
                onClick={handleQuickAddClick}
                className="w-full py-2 bg-stone-900/95 hover:bg-oxblood text-white text-xs font-semibold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 shadow-md active:scale-98 transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.variants.length === 1 ? "Quick Add" : "Choose Size"}</span>
              </button>
            </div>
          )}
        </div>

        {/* ======================================================== */}
        {/* PRODUCT DETAILS CARD BODY */}
        {/* ======================================================== */}
        <div className="p-3.5 flex flex-col flex-1 justify-between bg-white">
          <div className="space-y-1.5">
            
            {/* Colour Swatches & Stock State Line */}
            <div className="flex items-center justify-between gap-2">
              {/* Colour Dots */}
              {uniqueColors.length > 0 && (
                <div className="flex items-center gap-1">
                  {uniqueColors.slice(0, 4).map((col) => {
                    const clean = (col || '').toLowerCase().trim();
                    const hex = (clean && COLOR_PALETTE_MAP[clean]) || '#6B1724';
                    return (
                      <span
                        key={col}
                        title={col}
                        className="w-3 h-3 rounded-full border border-stone-300 shadow-xs block"
                        style={{ backgroundColor: hex }}
                      />
                    );
                  })}
                  {uniqueColors.length > 4 && (
                    <span className="text-[10px] text-stone-400 font-medium pl-0.5">
                      +{uniqueColors.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Attached Stock Indicator Pill */}
              <div className="text-[10px] font-semibold tracking-wide ml-auto">
                {isSoldOut ? (
                  <span className="text-stone-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-stone-300" />
                    Out of stock
                  </span>
                ) : isLowStock ? (
                  <span className="text-terracotta flex items-center gap-1 font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-terracotta" />
                    {totalStock} left
                  </span>
                ) : (
                  <span className="text-emerald-700 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    In Stock
                  </span>
                )}
              </div>
            </div>

            {/* Product Title */}
            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="font-serif text-sm sm:text-base font-normal text-stone-900 group-hover:text-oxblood line-clamp-1 transition-colors">
                {product.name}
              </h3>
            </Link>

            {/* Subtle Tagline */}
            {product.tagline && (
              <p className="text-[11px] text-stone-500 line-clamp-1">
                {product.tagline}
              </p>
            )}
          </div>

          {/* Pricing Row */}
          <div className="mt-3 pt-2 border-t border-[#F2ECE4] flex items-center justify-between">
            <div className="flex items-baseline gap-1.5">
              {hasSale ? (
                <>
                  <span className="font-serif font-bold text-sm sm:text-base text-oxblood">
                    {formatKoboToNaira(salePriceKobo!)}
                  </span>
                  <span className="text-[11px] text-stone-400 line-through font-sans">
                    {formatKoboToNaira(startingPriceKobo)}
                  </span>
                </>
              ) : (
                <span className="font-serif font-bold text-sm sm:text-base text-stone-900">
                  {formatKoboToNaira(startingPriceKobo)}
                </span>
              )}
            </div>

            {/* Mobile Size Badge or Category */}
            <span className="text-[10px] text-stone-400 uppercase font-medium">
              {product.variants.length} {product.variants.length === 1 ? 'size' : 'sizes'}
            </span>
          </div>

          {/* Mobile Quick Add Button */}
          {!isSoldOut && (
            <div className="mt-2.5 sm:hidden">
              <button
                onClick={handleQuickAddClick}
                className="w-full py-2 bg-stone-900 hover:bg-oxblood text-white text-[11px] uppercase tracking-wider font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>{product.variants.length === 1 ? "Add to Bag" : "Select Size"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* QUICK ADD MODAL */}
      {/* ======================================================== */}
      <Modal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        title="Select Your Fit"
        description={product.name}
        maxWidth="sm"
      >
        <div className="space-y-5 pt-2">
          {/* Colors */}
          {uniqueColors.length > 1 && (
            <div>
              <label className="block text-[11px] uppercase font-bold tracking-wider text-stone-700 mb-2">
                Choose Colour:
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueColors.map((color) => {
                  const isSelected = (selectedVariant?.colorName || activeColor) === color;
                  const cleanColor = (color || '').toLowerCase().trim();
                  const hex = (cleanColor && COLOR_PALETTE_MAP[cleanColor]) || '#6B1724';
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => {
                        setActiveColor(color);
                        const match = product.variants.find((v) => v.colorName === color);
                        if (match) setSelectedVariant(match);
                      }}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-2 transition-all ${
                        isSelected
                          ? "border-oxblood bg-oxblood text-white shadow-xs"
                          : "border-stone-200 bg-white text-stone-800 hover:border-stone-400"
                      }`}
                    >
                      <span className="w-2.5 h-2.5 rounded-full border border-white/50 block" style={{ backgroundColor: hex }} />
                      <span>{color}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes with Live Stock Counters */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-[11px] uppercase font-bold tracking-wider text-stone-700">
                Choose Size ({product.categorySlug === 'shoes' ? 'EU Sizing' : 'UK Sizing'}):
              </label>
              <span className="text-[11px] text-stone-500">
                {selectedVariant ? `${selectedVariant.stockQuantity} in stock` : 'Select size'}
              </span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {product.variants
                .filter((v) => !activeColor || v.colorName === activeColor)
                .map((variant) => {
                  const isSelected = selectedVariant?.id === variant.id;
                  const isAvailable = variant.stockQuantity > 0;

                  return (
                    <button
                      key={variant.id}
                      type="button"
                      disabled={!isAvailable}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-2.5 text-center rounded-lg border transition-all text-xs ${
                        isSelected
                          ? "border-oxblood bg-oxblood text-white font-bold ring-2 ring-oxblood/20"
                          : isAvailable
                          ? "border-stone-200 bg-white hover:border-stone-900 font-semibold text-stone-900"
                          : "border-stone-200 bg-stone-100 text-stone-400 line-through cursor-not-allowed opacity-60"
                      }`}
                    >
                      <div>{variant.size}</div>
                      <div className="text-[9px] font-normal opacity-80 mt-0.5">
                        {isAvailable ? `${variant.stockQuantity} left` : 'Out'}
                      </div>
                    </button>
                  );
                })}
            </div>
          </div>

          {/* Price & CTA */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <div>
              <div className="text-[10px] text-stone-400 uppercase font-semibold">Total Price:</div>
              <div className="font-serif text-lg font-bold text-oxblood">
                {selectedVariant ? formatKoboToNaira(selectedVariant.salePriceKobo || selectedVariant.priceKobo) : formatKoboToNaira(startingPriceKobo)}
              </div>
            </div>

            <button
              type="button"
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              onClick={handleConfirmModalAdd}
              className="px-6 py-2.5 bg-stone-900 hover:bg-oxblood text-white text-xs font-bold uppercase tracking-wider rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1.5 shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Shopping Bag</span>
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
