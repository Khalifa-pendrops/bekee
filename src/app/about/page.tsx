import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "About Our Boutique & Curation | ARUBEKEE COLLECTION",
  description: "Learn about Arubekee Collection, our handpicked fashion curation in Aba, Abia State, and our commitment to contemporary ready-to-wear luxury.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 text-left">
      {/* Editorial Header */}
      <div className="space-y-4 border-b border-stone-line pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-ivory-warm border border-stone-line text-oxblood text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Aba Fashion District • Curated Contemporary Ready-to-Wear</span>
        </div>

        <h1 className="editorial-heading text-4xl sm:text-5xl text-obsidian font-normal">
          Refined Curation, Poise, and the Soul of Aba Fashion.
        </h1>

        <p className="text-base sm:text-lg text-obsidian-muted leading-relaxed font-normal">
          ARUBEKEE COLLECTION was born from a simple conviction: modern women deserve stylish, quality-vetted fashion without the uncertainty, delays, and fit headaches of bespoke tailoring.
        </p>
      </div>

      {/* Story Sections */}
      <div className="space-y-12 text-sm sm:text-base text-obsidian-muted leading-relaxed">
        <section className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-normal">
            Handpicked in the Fashion Capital of the East
          </h2>
          <p>
            Aba has long been celebrated as the engine room of African textile commerce and leather footwear. For decades, the busiest fashion trade streets on Ehi Road and Ariaria have produced some of the most creative styles on the continent.
          </p>
          <p>
            At ARUBEKEE COLLECTION, our role is rigorous curation and taste-making. We scout, inspect, and handpick only the standout garments, comfortable block heels, and artisanal leather bags from premier makers. Every piece that enters our boutique showroom undergoes a strict quality check for fabric weight, clean seams, and authentic sizing before earning a spot on our racks.
          </p>
        </section>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="bg-ivory-warm border border-stone-line p-6 space-y-3">
            <ShieldCheck className="w-6 h-6 text-oxblood stroke-1.5" />
            <h3 className="font-serif text-lg text-obsidian font-semibold">Vetted, Quality Fabrics</h3>
            <p className="text-xs text-obsidian-muted leading-relaxed">
              We reject cheap, clingy polyester. We select heavyweight crepe, breathable satin twill, and structured fabrics that flatter and endure the tropical climate.
            </p>
          </div>

          <div className="bg-ivory-warm border border-stone-line p-6 space-y-3">
            <Heart className="w-6 h-6 text-oxblood stroke-1.5" />
            <h3 className="font-serif text-lg text-obsidian font-semibold">Curated for Real Curves</h3>
            <p className="text-xs text-obsidian-muted leading-relaxed">
              Our selections are handpicked specifically for African silhouettes—ensuring generous room through hips, supportive busts, and waists that sit comfortably.
            </p>
          </div>

          <div className="bg-ivory-warm border border-stone-line p-6 space-y-3">
            <MapPin className="w-6 h-6 text-oxblood stroke-1.5" />
            <h3 className="font-serif text-lg text-obsidian font-semibold">100% In-Stock & Ready</h3>
            <p className="text-xs text-obsidian-muted leading-relaxed">
              No waiting weeks for tailors. Every piece on our site is in physical inventory at our Aba showroom, ready for pickup or express 24-hour courier transit.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-normal">
            Boutique Pickup &amp; Nationwide Dispatch
          </h2>
          <p>
            Whether you walk into our showroom on Ehi Road in Aba to pick up your order in person, or order from Lagos, Port Harcourt, Abuja, or abroad, our promise remains constant: verified product quality, fast dispatch, and direct personal care.
          </p>
        </section>
      </div>

      {/* CTA Box */}
      <div className="bg-obsidian text-ivory-light p-8 sm:p-12 border border-stone-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <h3 className="font-serif text-2xl text-ivory">Explore our latest curated drops</h3>
          <p className="text-xs text-ivory-muted">
            Freshly curated dresses, mules, and matching sets ready for immediate dispatch across Nigeria.
          </p>
        </div>
        <Link href="/shop">
          <Button variant="gold" size="lg" className="gap-2">
            <span>Browse Collection</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </Link>
      </div>
    </div>
  );
}
