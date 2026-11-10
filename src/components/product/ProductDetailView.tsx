'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import Link from "next/link";
import { Product, ProductVariant, StoreSettings } from "@/types";
import { formatKoboToNaira, buildWhatsAppProductUrl } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { SizeGuideModal } from "@/components/product/SizeGuideModal";
import { ProductCard } from "@/components/product/ProductCard";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { 
  Heart, 
  ShoppingBag, 
  MessageSquare, 
  Ruler, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Check, 
  Minus, 
  Plus, 
  ChevronRight,
  ZoomIn
} from "lucide-react";

interface ProductDetailViewProps {
  product: Product;
  relatedProducts: Product[];
  settings: StoreSettings;
}

export function ProductDetailView({ product, relatedProducts, settings }: ProductDetailViewProps) {
  const { addItem } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  // Find initial variant
  const initialVariant = useMemo(() => {
    return product.variants.find((v) => v.stockQuantity > 0) || product.variants[0];
  }, [product]);

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>(initialVariant);
  const [selectedColor, setSelectedColor] = useState<string>(initialVariant.colorName);
  const [selectedSize, setSelectedSize] = useState<string>(initialVariant.size);
  const [quantity, setQuantity] = useState<number>(1);
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [isSizeGuideOpen, setIsSizeGuideOpen] = useState<boolean>(false);
  const [isZoomed, setIsZoomed] = useState<boolean>(false);
  const [mousePos, setMousePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [showStickyBar, setShowStickyBar] = useState<boolean>(false);

  const mainCtaRef = useRef<HTMLDivElement>(null);

  // Monitor scroll for mobile sticky bar
  useEffect(() => {
    const handleScroll = () => {
      if (mainCtaRef.current) {
        const rect = mainCtaRef.current.getBoundingClientRect();
        setShowStickyBar(rect.bottom < 0);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Filter available sizes for the currently selected color
  const availableSizesForColor = useMemo(() => {
    return product.variants
      .filter((v) => v.colorName.toLowerCase() === selectedColor.toLowerCase())
      .map((v) => ({
        size: v.size,
        stock: v.stockQuantity,
        variant: v,
      }));
  }, [product.variants, selectedColor]);

  // Unique colors
  const uniqueColors = useMemo(() => {
    return Array.from(new Set(product.variants.map((v) => v.colorName)));
  }, [product.variants]);

  // Update selected variant when color or size changes
  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    // Find matching variant with same size or fallback to first in-stock variant of that color
    const exactMatch = product.variants.find(
      (v) => v.colorName === color && v.size === selectedSize && v.stockQuantity > 0
    );
    if (exactMatch) {
      setSelectedVariant(exactMatch);
    } else {
      const anyInStock = product.variants.find((v) => v.colorName === color && v.stockQuantity > 0);
      const chosen = anyInStock || product.variants.find((v) => v.colorName === color) || product.variants[0];
      setSelectedVariant(chosen);
      setSelectedSize(chosen.size);
    }
  };

  const handleSizeChange = (size: string) => {
    setSelectedSize(size);
    const match = product.variants.find(
      (v) => v.colorName === selectedColor && v.size === size
    );
    if (match) {
      setSelectedVariant(match);
      setQuantity(1); // Reset qty to 1 when changing size
    }
  };

  const isSoldOut = selectedVariant.stockQuantity <= 0;
  const isLowStock = selectedVariant.stockQuantity > 0 && selectedVariant.stockQuantity <= selectedVariant.lowStockThreshold;

  const currentPriceKobo = selectedVariant.salePriceKobo || selectedVariant.priceKobo;
  const originalPriceKobo = selectedVariant.salePriceKobo ? selectedVariant.priceKobo : undefined;
  const hasSale = Boolean(originalPriceKobo && originalPriceKobo > currentPriceKobo);

  const primaryImage = product.images[activeImageIndex] || product.images[0];

  const inWishlist = isInWishlist(product.id);

  // Handle Add to Bag
  const handleAddToCart = () => {
    if (isSoldOut) return;

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      productName: product.name,
      productSlug: product.slug,
      image: primaryImage.url,
      colorName: selectedVariant.colorName,
      size: selectedVariant.size,
      unitPriceKobo: currentPriceKobo,
      originalPriceKobo,
      quantity,
      maxAvailableStock: selectedVariant.stockQuantity,
    }, quantity);
  };

  // Zoom on hover handler
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setMousePos({ x, y });
  };

  const productUrl = typeof window !== 'undefined' ? window.location.href : `https://arubekee.com/products/${product.slug}`;
  const whatsAppUrl = buildWhatsAppProductUrl(
    settings.whatsappNumber,
    product.name,
    `${selectedVariant.colorName} • ${selectedVariant.size}`,
    productUrl
  );

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-2 text-xs uppercase tracking-wider text-obsidian-subtle">
        <Link href="/" className="hover:text-oxblood transition-colors">Home</Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href={`/categories/${product.categorySlug}`} className="hover:text-oxblood transition-colors capitalize">
          {product.categorySlug}
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="text-obsidian font-semibold truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Main PDP Grid: Gallery on Left, Purchase Panel on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* LEFT: Responsive Gallery with Zoom */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-col-reverse sm:flex-row gap-4">
            {/* Thumbnails Column */}
            {product.images.length > 1 && (
              <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:w-20 shrink-0 no-scrollbar">
                {product.images.map((img, index) => {
                  const isActive = index === activeImageIndex;
                  return (
                    <button
                      key={img.id}
                      onClick={() => setActiveImageIndex(index)}
                      className={`relative aspect-[3/4] w-16 sm:w-full border transition-all overflow-hidden bg-stone-subtle shrink-0 ${
                        isActive
                          ? "border-oxblood ring-1 ring-oxblood"
                          : "border-stone-line opacity-70 hover:opacity-100"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt={img.altText || product.name}
                        className="w-full h-full object-cover object-top"
                      />
                    </button>
                  );
                })}
              </div>
            )}

            {/* Main Active Image View with Hover Zoom */}
            <div
              className="relative flex-1 aspect-[3/4] overflow-hidden bg-stone-subtle border border-stone-line cursor-crosshair group"
              onMouseEnter={() => setIsZoomed(true)}
              onMouseLeave={() => setIsZoomed(false)}
              onMouseMove={handleMouseMove}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={primaryImage.url}
                alt={primaryImage.altText || product.name}
                className="w-full h-full object-cover object-top transition-transform duration-300"
                style={{
                  transformOrigin: `${mousePos.x}% ${mousePos.y}%`,
                  transform: isZoomed ? "scale(2.2)" : "scale(1)",
                }}
              />

              {/* Status Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 pointer-events-none z-10">
                {isSoldOut ? (
                  <Badge variant="outline" className="bg-ivory/95 font-bold">
                    Sold Out
                  </Badge>
                ) : hasSale ? (
                  <Badge variant="sale">
                    Sale
                  </Badge>
                ) : product.collectionSlugs.includes("new-arrivals") ? (
                  <Badge variant="new">
                    New Arrival
                  </Badge>
                ) : null}
              </div>

              {/* Wishlist Button on Main Image */}
              <button
                onClick={() =>
                  toggleWishlist({
                    productId: product.id,
                    productSlug: product.slug,
                    productName: product.name,
                    primaryImage: primaryImage.url,
                    startingPriceKobo: currentPriceKobo,
                    originalPriceKobo,
                    hasSale,
                    categorySlug: product.categorySlug,
                    addedAt: new Date().toISOString(),
                  })
                }
                aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
                className="absolute top-4 right-4 p-3 bg-ivory/90 hover:bg-ivory text-obsidian rounded-full shadow-subtle z-10 transition-colors"
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    inWishlist ? "fill-oxblood text-oxblood" : "text-obsidian"
                  }`}
                />
              </button>

              {/* Zoom hint overlay */}
              <div className="absolute bottom-3 right-3 bg-ivory/90 px-2.5 py-1 text-[11px] font-medium text-obsidian uppercase tracking-wider flex items-center gap-1.5 pointer-events-none opacity-80 group-hover:opacity-0 transition-opacity">
                <ZoomIn className="w-3.5 h-3.5" />
                <span>Hover to Zoom</span>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Product Ordering & Variant Controls */}
        <div className="lg:col-span-5 space-y-6 text-left">
          {/* Header & Title */}
          <div className="space-y-2 border-b border-stone-line pb-5">
            <span className="text-[11px] uppercase tracking-widest font-semibold text-oxblood">
              Aba Handcrafted Luxury • SKU: {selectedVariant.sku}
            </span>

            <h1 className="editorial-heading text-2xl sm:text-3xl lg:text-4xl text-obsidian font-normal">
              {product.name}
            </h1>

            {product.tagline && (
              <p className="text-xs sm:text-sm text-obsidian-muted">
                {product.tagline}
              </p>
            )}

            {/* Price Container */}
            <div className="pt-2 flex items-baseline gap-3">
              {hasSale ? (
                <>
                  <span className="font-serif text-2xl sm:text-3xl text-oxblood font-semibold">
                    {formatKoboToNaira(currentPriceKobo)}
                  </span>
                  <span className="text-base text-obsidian-subtle line-through">
                    {formatKoboToNaira(originalPriceKobo!)}
                  </span>
                  <Badge variant="sale" className="text-[10px]">
                    Save {formatKoboToNaira(originalPriceKobo! - currentPriceKobo)}
                  </Badge>
                </>
              ) : (
                <span className="font-serif text-2xl sm:text-3xl text-obsidian font-normal">
                  {formatKoboToNaira(currentPriceKobo)}
                </span>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="uppercase tracking-wider font-semibold text-obsidian-soft">
                Color: <strong className="text-obsidian">{selectedColor}</strong>
              </span>
              <span className="text-obsidian-subtle text-[11px]">
                {uniqueColors.length} {uniqueColors.length === 1 ? 'color' : 'colors'} available
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {uniqueColors.map((color) => {
                const isSelected = selectedColor.toLowerCase() === color.toLowerCase();
                return (
                  <button
                    key={color}
                    onClick={() => handleColorChange(color)}
                    className={`px-3.5 py-2 text-xs font-medium border transition-all ${
                      isSelected
                        ? "bg-oxblood text-ivory-light border-oxblood shadow-xs font-semibold"
                        : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
                    }`}
                  >
                    {color}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Size Selection */}
          <div className="space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="uppercase tracking-wider font-semibold text-obsidian-soft">
                Select Size ({product.categorySlug === 'shoes' ? 'EU' : 'UK'})
              </span>
              <button
                type="button"
                onClick={() => setIsSizeGuideOpen(true)}
                className="text-oxblood underline uppercase tracking-wider text-[11px] font-semibold flex items-center gap-1 hover:text-oxblood-hover"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Size Guide</span>
              </button>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {availableSizesForColor.map(({ size, stock, variant }) => {
                const isSelected = selectedSize === size;
                const outOfStock = stock <= 0;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={outOfStock}
                    onClick={() => handleSizeChange(size)}
                    className={`py-2.5 px-2 text-xs font-semibold text-center border transition-all ${
                      isSelected
                        ? "bg-oxblood text-ivory-light border-oxblood shadow-xs"
                        : outOfStock
                        ? "bg-stone-subtle text-obsidian-subtle/50 border-stone-line cursor-not-allowed line-through"
                        : "bg-ivory border-stone-line text-obsidian hover:border-obsidian"
                    }`}
                  >
                    <div>{size}</div>
                    <div className="text-[10px] font-normal mt-0.5">
                      {outOfStock ? "Sold Out" : `${stock} left`}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Live Stock Alert */}
            {isLowStock && (
              <p className="text-xs font-semibold text-status-warning flex items-center gap-1.5 animate-pulse">
                <span>⚠️ Limited availability: Only {selectedVariant.stockQuantity} remaining in our Aba store.</span>
              </p>
            )}
            {isSoldOut && (
              <p className="text-xs font-semibold text-status-danger">
                This size is currently sold out. Enquire on WhatsApp for backorder availability.
              </p>
            )}
          </div>

          {/* Quantity Controls & Add to Cart */}
          <div ref={mainCtaRef} className="space-y-4 pt-2">
            {!isSoldOut && (
              <div className="flex items-center gap-4">
                <span className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft">
                  Quantity:
                </span>
                <div className="flex items-center border border-stone-line bg-ivory-light">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                    className="p-2 hover:bg-ivory-muted text-obsidian-soft disabled:opacity-30 transition-colors"
                    aria-label="Decrease quantity"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold text-obsidian">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.min(selectedVariant.stockQuantity, quantity + 1))}
                    disabled={quantity >= selectedVariant.stockQuantity}
                    className="p-2 hover:bg-ivory-muted text-obsidian-soft disabled:opacity-30 transition-colors"
                    aria-label="Increase quantity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            <div className="space-y-2.5">
              <Button
                variant="primary"
                size="lg"
                disabled={isSoldOut}
                onClick={handleAddToCart}
                className="w-full flex items-center justify-center gap-2 uppercase tracking-wider text-sm py-4 shadow-card"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>{isSoldOut ? "Currently Sold Out" : "Add to Shopping Bag"}</span>
              </Button>

              <a
                href={whatsAppUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full"
              >
                <Button
                  variant="whatsapp"
                  size="md"
                  className="w-full flex items-center justify-center gap-2 text-xs uppercase tracking-wider"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Enquire / Order on WhatsApp</span>
                </Button>
              </a>
            </div>
          </div>

          {/* Delivery & Assurance Pillars */}
          <div className="border-t border-stone-line pt-6 space-y-3 text-xs text-obsidian-soft">
            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
              <div>
                <strong>Aba Boutique Pickup:</strong> Free collection available at our Ehi Road showroom within 2 hours.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Truck className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
              <div>
                <strong>Interstate Dispatch:</strong> 1-2 days to South-East & Port Harcourt; 2-3 days to Lagos & Abuja; 3-5 days nationwide.
              </div>
            </div>

            <div className="flex items-start gap-3">
              <ShieldCheck className="w-4 h-4 text-oxblood shrink-0 mt-0.5" />
              <div>
                <strong>48-Hour Exchange Guarantee:</strong> Unworn items with tags intact can be exchanged easily.
              </div>
            </div>
          </div>

          {/* Product Description, Fabric & Care Tabs */}
          <div className="border-t border-stone-line pt-6 space-y-4">
            <div>
              <h3 className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft mb-1.5">
                The Silhouette & Design
              </h3>
              <p className="text-xs text-obsidian-muted leading-relaxed">
                {product.description}
              </p>
            </div>

            {product.fabricAndCare && product.fabricAndCare.length > 0 && (
              <div>
                <h3 className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft mb-1.5">
                  Fabric, Construction & Seams
                </h3>
                <ul className="list-disc list-inside space-y-1 text-xs text-obsidian-muted">
                  {product.fabricAndCare.map((item, idx) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {product.stylingTips && (
              <div>
                <h3 className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft mb-1.5">
                  Atelier Styling Note
                </h3>
                <p className="text-xs italic text-obsidian-muted leading-relaxed">
                  &ldquo;{product.stylingTips}&rdquo;
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* RELATED PRODUCTS */}
      {relatedProducts.length > 0 && (
        <section className="border-t border-stone-line pt-14 space-y-6">
          <div className="flex justify-between items-baseline">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-oxblood">
                Complete The Look
              </span>
              <h2 className="font-serif text-2xl text-obsidian mt-1">
                You May Also Appreciate
              </h2>
            </div>
            <Link
              href={`/categories/${product.categorySlug}`}
              className="text-xs uppercase tracking-wider font-semibold text-oxblood hover:underline"
            >
              Explore More {product.categorySlug}
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((rel) => (
              <ProductCard key={rel.id} product={rel} />
            ))}
          </div>
        </section>
      )}

      {/* MOBILE STICKY BOTTOM PURCHASE ACTION BAR */}
      {showStickyBar && (
        <div className="fixed bottom-14 left-0 right-0 z-30 bg-ivory/95 backdrop-blur-md border-t border-stone-line p-3 sm:hidden shadow-floating animate-slide-up">
          <div className="flex items-center justify-between gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs font-serif text-obsidian truncate font-semibold">
                {product.name}
              </p>
              <div className="flex items-center gap-1.5 text-xs text-oxblood font-semibold">
                <span>{formatKoboToNaira(currentPriceKobo)}</span>
                <span className="text-obsidian-muted text-[10px]">({selectedVariant.size})</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              disabled={isSoldOut}
              onClick={handleAddToCart}
              className="shrink-0 uppercase tracking-wider text-xs px-4"
            >
              {isSoldOut ? "Sold Out" : "Add to Bag"}
            </Button>
          </div>
        </div>
      )}

      {/* SIZE GUIDE MODAL */}
      <SizeGuideModal
        isOpen={isSizeGuideOpen}
        onClose={() => setIsSizeGuideOpen(false)}
        categoryType={product.categorySlug}
      />
    </div>
  );
}

