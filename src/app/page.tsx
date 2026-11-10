import React from "react";
import Link from "next/link";
import { mockProducts, mockCategories, mockCollections, mockStoreSettings } from "@/data/mockData";
import { ProductCard } from "@/components/product/ProductCard";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, MapPin, MessageCircle, ShieldCheck, Truck } from "lucide-react";

export default function HomePage() {
  const featuredProducts = mockProducts.filter((p) => p.isFeatured && p.isPublished);
  const newArrivals = mockProducts.filter((p) => p.collectionSlugs.includes("new-arrivals"));
  const saleProducts = mockProducts.filter((p) => 
    p.variants.some((v) => v.salePriceKobo && v.salePriceKobo < v.priceKobo)
  );

  return (
    <div className="space-y-16 sm:space-y-24 pb-16">
      {/* 1. EDITORIAL HERO SECTION */}
      <section className="relative bg-ivory-warm border-b border-stone-line overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6 text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-ivory border border-stone-line text-oxblood text-xs uppercase tracking-widest font-semibold">
                <Sparkles className="w-3.5 h-3.5 text-gold" />
                <span>Crafted in Aba, Abia State</span>
              </div>

              <h1 className="editorial-heading text-4xl sm:text-5xl lg:text-6xl text-obsidian leading-[1.1]">
                Contemporary African luxury, tailored for every milestone.
              </h1>

              <p className="text-base sm:text-lg text-obsidian-muted font-normal leading-relaxed max-w-xl">
                Ready-to-wear dresses, architectural leather mules, structured bags, and polished co-ords. Designed for the discerning Nigerian woman who values flawless seams, breathable luxury fabrics, and understated poise.
              </p>

              <div className="flex flex-wrap gap-4 pt-2">
                <Link href="/collections/new-arrivals">
                  <Button variant="primary" size="lg" className="gap-2">
                    <span>Explore New In</span>
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>

                <Link href="/collections/workwear">
                  <Button variant="outline" size="lg">
                    <span>Workwear Edit</span>
                  </Button>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 border-t border-stone-line/80 grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs text-obsidian-soft">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-oxblood shrink-0" />
                  <span>Nationwide Express Transit</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-oxblood shrink-0" />
                  <span>Free Aba Boutique Pickup</span>
                </div>
                <div className="flex items-center gap-2 col-span-2 sm:col-span-1">
                  <ShieldCheck className="w-4 h-4 text-oxblood shrink-0" />
                  <span>Verified Leather & Crepe</span>
                </div>
              </div>
            </div>

            {/* Right Hero Visual Collage */}
            <div className="lg:col-span-5 relative">
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Main Portrait */}
                <div className="aspect-[3/4] overflow-hidden border border-stone-line shadow-card bg-stone-subtle">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80"
                    alt="Arubekee Collection Luxury Fashion Aba"
                    className="w-full h-full object-cover object-top hover:scale-102 transition-transform duration-700"
                  />
                </div>

                {/* Overlaid Editorial Plaque */}
                <div className="absolute -bottom-6 -left-6 bg-ivory p-4 border border-stone-line shadow-floating max-w-[240px] hidden sm:block">
                  <span className="text-[10px] tracking-widest uppercase font-semibold text-oxblood block">
                    Harmattan / Pre-Festive 2026
                  </span>
                  <p className="font-serif text-sm text-obsidian mt-1 leading-snug">
                    Architectural pleats & hand-burnished leather mules.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. CATEGORY DISCOVERY (SHEIN-agility with luxury aesthetics) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-line">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-oxblood">
              Curated Departments
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-obsidian mt-1">
              Shop by Category
            </h2>
          </div>
          <Link
            href="/shop"
            className="text-xs uppercase tracking-wider font-semibold text-obsidian hover:text-oxblood flex items-center gap-1.5 mt-2 sm:mt-0"
          >
            <span>View All Departments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          {mockCategories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col bg-ivory border border-stone-line hover:border-oxblood transition-all duration-300 overflow-hidden"
            >
              <div className="aspect-[4/5] bg-stone-subtle overflow-hidden relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={
                    cat.slug === "clothing"
                      ? "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=700&q=80"
                      : cat.slug === "shoes"
                      ? "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=700&q=80"
                      : cat.slug === "bags"
                      ? "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=700&q=80"
                      : "https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=700&q=80"
                  }
                  alt={cat.name}
                  className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-obsidian/60 via-transparent to-transparent opacity-80 group-hover:opacity-90 transition-opacity" />
                <div className="absolute bottom-3 left-3 right-3 text-ivory-light">
                  <h3 className="font-serif text-lg font-normal tracking-wide">
                    {cat.name}
                  </h3>
                  <p className="text-[11px] text-ivory-muted tracking-wider uppercase font-medium">
                    {cat.subcategories.length} sub-styles
                  </p>
                </div>
              </div>

              <div className="p-3 bg-ivory flex justify-between items-center text-xs">
                <span className="text-obsidian-muted font-medium line-clamp-1">
                  Explore {cat.name}
                </span>
                <ArrowRight className="w-3.5 h-3.5 text-obsidian-subtle group-hover:text-oxblood group-hover:translate-x-1 transition-all" />
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. NEW ARRIVALS CAROUSEL / GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-line">
          <div>
            <span className="text-xs font-semibold tracking-widest uppercase text-oxblood">
              Just Dropped
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-normal text-obsidian mt-1">
              New Arrivals from Aba
            </h2>
          </div>
          <Link
            href="/collections/new-arrivals"
            className="text-xs uppercase tracking-wider font-semibold text-obsidian hover:text-oxblood flex items-center gap-1.5 mt-2 sm:mt-0"
          >
            <span>View All New Pieces ({newArrivals.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {newArrivals.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. CURATED COLLECTIONS BANNER */}
      <section className="bg-ivory-warm border-y border-stone-line py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
            <span className="text-xs font-semibold tracking-widest uppercase text-oxblood">
              Editorial Curation
            </span>
            <h2 className="editorial-heading text-3xl sm:text-4xl text-obsidian">
              Dressing for the Occasion
            </h2>
            <p className="text-xs sm:text-sm text-obsidian-muted">
              Explore hand-selected edits structured around your work calendar, weekend brunches, and high-society events.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {mockCollections.filter(c => c.slug !== 'new-arrivals' && c.slug !== 'sale').map((collection) => (
              <div
                key={collection.id}
                className="bg-ivory border border-stone-line p-6 sm:p-8 flex flex-col justify-between hover:border-oxblood transition-colors shadow-subtle group"
              >
                <div className="space-y-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-oxblood">
                    {collection.tagline}
                  </span>
                  <h3 className="font-serif text-xl sm:text-2xl text-obsidian font-normal group-hover:text-oxblood transition-colors">
                    {collection.name}
                  </h3>
                  <p className="text-xs text-obsidian-muted leading-relaxed">
                    {collection.description}
                  </p>
                </div>

                <div className="pt-6 mt-6 border-t border-stone-line/60">
                  <Link
                    href={`/collections/${collection.slug}`}
                    className="inline-flex items-center gap-2 text-xs uppercase tracking-wider font-semibold text-obsidian group-hover:text-oxblood"
                  >
                    <span>Browse Collection</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. SALE SPOTLIGHT (GENUINE MARKDOWNS) */}
      {saleProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 pb-4 border-b border-stone-line">
            <div>
              <span className="text-xs font-semibold tracking-widest uppercase text-oxblood">
                Limited Archive
              </span>
              <h2 className="font-serif text-2xl sm:text-3xl font-normal text-obsidian mt-1">
                Special Sale Edit
              </h2>
            </div>
            <Link
              href="/collections/sale"
              className="text-xs uppercase tracking-wider font-semibold text-oxblood hover:underline flex items-center gap-1.5 mt-2 sm:mt-0"
            >
              <span>Explore All Markdown Pieces</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {saleProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* 6. ABA ATELIER HERITAGE & BOUTIQUE PICKUP */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-obsidian text-ivory-light p-8 sm:p-12 lg:p-16 border border-obsidian-soft relative overflow-hidden">
          <div className="max-w-2xl space-y-6 relative z-10">
            <span className="text-xs uppercase tracking-widest font-semibold text-gold">
              The Aba Craftsmanship Story
            </span>

            <h2 className="editorial-heading text-3xl sm:text-4xl text-ivory leading-tight">
              Honouring the commercial capital of African garment craftsmanship.
            </h2>

            <p className="text-xs sm:text-sm text-ivory-muted leading-relaxed">
              Every garment and accessory in the Arubekee Collection is conceived and finished in Aba, Abia State. Our pattern cutters and leather artisans blend traditional Igbo trade diligence with contemporary silhouettes. No fast-fashion polyester disposability — only durable elegance made to be cherished.
            </p>

            <div className="pt-4 flex flex-wrap gap-4 items-center">
              <Link href="/about">
                <Button variant="gold" size="md">
                  <span>Our Heritage & Process</span>
                </Button>
              </Link>

              <a
                href={`https://wa.me/${mockStoreSettings.whatsappNumber}?text=Hello%20Arubekee!%20I%20would%20like%20to%20learn%20more%20about%20your%20Aba%20store`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="md" className="border-ivory-muted text-ivory hover:bg-ivory/10 gap-2">
                  <MessageCircle className="w-4 h-4 text-[#25D366]" />
                  <span>Chat With Founder on WhatsApp</span>
                </Button>
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

