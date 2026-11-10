'use client';

import React, { useState } from "react";
import Link from "next/link";
import { Product, ProductVariant } from "@/types";
import { formatKoboToNaira } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Heart, ShoppingBag, Eye } from "lucide-react";
import { Modal } from "@/components/ui/Modal";

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(
    product.variants.length === 1 ? product.variants[0] : null
  );
  const [isQuickAddModalOpen, setIsQuickAddModalOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const primaryImage = product.images.find((img) => img.isPrimary) || product.images[0];
  const secondaryImage = product.images.find((img) => !img.isPrimary && img.sortOrder > 0) || primaryImage;

  // Compute pricing
  const defaultVariant = product.variants[0];
  const startingPriceKobo = defaultVariant ? defaultVariant.priceKobo : 0;
  const salePriceKobo = defaultVariant?.salePriceKobo;
  const hasSale = !!salePriceKobo && salePriceKobo < startingPriceKobo;

  // Colors available
  const uniqueColors = Array.from(new Set(product.variants.map((v) => v.colorName)));

  // Sizes available
  const availableVariants = product.variants.filter((v) => v.stockQuantity > 0);
  const isSoldOut = availableVariants.length === 0;

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

    // If only one variant and in stock, add immediately
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
      // Require explicit variant selection modal
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
        className="group relative flex flex-col bg-ivory transition-all duration-300 select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Image Container with Editorial Aspect Ratio (3:4) */}
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-stone-subtle border border-stone-line">
          <Link href={`/products/${product.slug}`} className="block w-full h-full">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={isHovered && secondaryImage ? secondaryImage.url : primaryImage?.url}
              alt={primaryImage?.altText || product.name}
              className="w-full h-full object-cover object-top transition-transform duration-700 ease-out group-hover:scale-105"
              loading={priority ? "eager" : "lazy"}
            />
          </Link>

          {/* Badges Overlay */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {isSoldOut ? (
              <Badge variant="outline" className="bg-ivory/90 text-obsidian border-stone-line font-bold">
                Sold Out
              </Badge>
            ) : hasSale ? (
              <Badge variant="sale">
                Sale
              </Badge>
            ) : product.collectionSlugs.includes("new-arrivals") ? (
              <Badge variant="new">
                New In
              </Badge>
            ) : null}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={handleWishlistClick}
            aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            className="absolute top-2.5 right-2.5 p-2 bg-ivory/90 hover:bg-ivory text-obsidian rounded-full shadow-subtle transition-all duration-200 z-10"
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                inWishlist ? "fill-oxblood text-oxblood" : "text-obsidian hover:text-oxblood"
              }`}
            />
          </button>

          {/* Quick Add CTA Bar - slides up on hover on desktop */}
          {!isSoldOut && (
            <div className="absolute inset-x-2 bottom-2 hidden sm:block opacity-0 group-hover:opacity-100 transition-all duration-200 z-10">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleQuickAddClick}
                className="w-full bg-obsidian/95 hover:bg-oxblood text-ivory-light text-xs uppercase tracking-wider py-2 flex items-center justify-center gap-1.5 shadow-card"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>{product.variants.length === 1 ? "Quick Add" : "Choose Size"}</span>
              </Button>
            </div>
          )}
        </div>

        {/* Product Information */}
        <div className="pt-3 pb-2 flex flex-col flex-1 justify-between">
          <div>
            {/* Color swatches preview */}
            {uniqueColors.length > 1 && (
              <p className="text-[10px] uppercase tracking-widest text-obsidian-subtle mb-1">
                {uniqueColors.length} Colours Available
              </p>
            )}

            <Link href={`/products/${product.slug}`} className="block">
              <h3 className="font-serif text-sm sm:text-base font-normal text-obsidian group-hover:text-oxblood line-clamp-1 transition-colors">
                {product.name}
              </h3>
            </Link>

            {product.tagline && (
              <p className="text-xs text-obsidian-muted line-clamp-1 mt-0.5">
                {product.tagline}
              </p>
            )}
          </div>

          {/* Price Container */}
          <div className="mt-2 flex items-baseline gap-2">
            {hasSale ? (
              <>
                <span className="font-sans font-semibold text-sm sm:text-base text-oxblood">
                  {formatKoboToNaira(salePriceKobo!)}
                </span>
                <span className="text-xs text-obsidian-subtle line-through">
                  {formatKoboToNaira(startingPriceKobo)}
                </span>
              </>
            ) : (
              <span className="font-sans font-medium text-sm sm:text-base text-obsidian">
                {formatKoboToNaira(startingPriceKobo)}
              </span>
            )}
          </div>

          {/* Mobile Quick Add Button */}
          {!isSoldOut && (
            <div className="mt-2 sm:hidden">
              <button
                onClick={handleQuickAddClick}
                className="w-full py-1.5 px-2 border border-stone-line bg-ivory-warm text-[11px] uppercase tracking-wider font-semibold text-obsidian hover:bg-oxblood hover:text-ivory-light transition-colors flex items-center justify-center gap-1.5"
              >
                <ShoppingBag className="w-3 h-3" />
                <span>{product.variants.length === 1 ? "Add to Bag" : "Select Size"}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Quick Add Variant Selection Modal */}
      <Modal
        isOpen={isQuickAddModalOpen}
        onClose={() => setIsQuickAddModalOpen(false)}
        title="Select Size & Color"
        description={product.name}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          {/* Colors */}
          <div>
            <label className="block text-xs uppercase font-semibold tracking-wider text-obsidian-soft mb-2">
              Color
            </label>
            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((color) => {
                const isSelected = selectedVariant?.colorName === color;
                return (
                  <button
                    key={color}
                    type="button"
                    onClick={() => {
                      const match = product.variants.find((v) => v.colorName === color);
                      if (match) setSelectedVariant(match);
                    }}
                    className={`px-3 py-1.5 text-xs font-medium border transition-all ${
                      isSelected
                        ? "border-oxblood bg-oxblood text-ivory-light"
                        : "border-stone-line bg-ivory-light text-obsidian hover:border-obsidian"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizes */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft">
                Size
              </label>
              <Link
                href="/size-guide"
                className="text-[11px] text-oxblood underline uppercase tracking-wider"
              >
                Size Guide
              </Link>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {product.variants.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const outOfStock = v.stockQuantity <= 0;

                return (
                  <button
                    key={v.id}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => setSelectedVariant(v)}
                    className={`py-2 px-1 text-xs font-semibold text-center border transition-all ${
                      isSelected
                        ? "border-oxblood bg-oxblood text-ivory-light shadow-sm"
                        : outOfStock
                        ? "border-stone-line bg-stone-subtle text-obsidian-subtle/50 cursor-not-allowed line-through"
                        : "border-stone-line bg-ivory-light text-obsidian hover:border-obsidian"
                    }`}
                  >
                    <div>{v.size}</div>
                    <div className="text-[10px] font-normal mt-0.5">
                      {outOfStock ? "Out of stock" : `${v.stockQuantity} left`}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price & Confirmation */}
          <div className="pt-4 border-t border-stone-line space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase text-obsidian-muted font-medium">Price:</span>
              <span className="font-serif text-lg text-obsidian font-semibold">
                {formatKoboToNaira(
                  selectedVariant?.salePriceKobo || selectedVariant?.priceKobo || startingPriceKobo
                )}
              </span>
            </div>

            <Button
              variant="primary"
              size="md"
              className="w-full uppercase tracking-wider"
              disabled={!selectedVariant || selectedVariant.stockQuantity <= 0}
              onClick={handleConfirmModalAdd}
            >
              Add to Shopping Bag
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}

