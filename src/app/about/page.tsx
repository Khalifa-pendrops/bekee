import React from "react";
import Link from "next/link";
import { Sparkles, MapPin, ShieldCheck, Heart, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Our Heritage & Aba Atelier | ARUBEKEE COLLECTION",
  description: "Learn about Arubekee Collection, our master pattern cutters in Aba, Abia State, and our commitment to African ready-to-wear luxury.",
};

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-16 text-left">
      {/* Editorial Header */}
      <div className="space-y-4 border-b border-stone-line pb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-ivory-warm border border-stone-line text-oxblood text-xs uppercase tracking-widest font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-gold" />
          <span>Aba Atelier • Commercial Hub of African Garments</span>
        </div>

        <h1 className="editorial-heading text-4xl sm:text-5xl text-obsidian font-normal">
          Craftsmanship, Poise, and the Soul of Aba Fashion.
        </h1>

        <p className="text-base sm:text-lg text-obsidian-muted leading-relaxed font-normal">
          ARUBEKEE COLLECTION was born from a fundamental conviction: contemporary women&apos;s fashion in Nigeria deserves master tailoring, clean durable seams, and rich fabrics that flatter the curves and poise of African women.
        </p>
      </div>

      {/* Story Sections */}
      <div className="space-y-12 text-sm sm:text-base text-obsidian-muted leading-relaxed">
        <section className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-normal">
            Rooted in Aba, Abia State
          </h2>
          <p>
            Aba has long been celebrated as the engine room of African textile commerce and footwear craftsmanship. For generations, master pattern cutters, leather cobblers, and seamstresses have turned raw cloth and hides into extraordinary garments on the streets of Ehi Road and Ariaria.
          </p>
          <p>
            At ARUBEKEE COLLECTION, we refine this legendary industriousness into a curated luxury house. Every dress, wide-leg trouser, sculpted mule, and structured leather bag is cut, assembled, and finished under strict quality standards in our Aba workshop.
          </p>
        </section>

        {/* 3 Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-4">
          <div className="bg-ivory-warm border border-stone-line p-6 space-y-3">
            <ShieldCheck className="w-6 h-6 text-oxblood stroke-1.5" />
            <h3 className="font-serif text-lg text-obsidian font-semibold">Weighty, Breathable Fabrics</h3>
            <p className="text-xs text-obsidian-muted leading-relaxed">
              We reject cheap, clingy polyester. We select heavyweight Spanish crepe, breathable satin twill, and structured natural cotton suited for the tropical Nigerian climate.
            </p>
          </div>

          <div className="bg-ivory-warm border border-stone-line p-6 space-y-3">
            <Heart className="w-6 h-6 text-oxblood stroke-1.5" />
            <h3 className="font-serif text-lg text-obsidian font-semibold">Designed for Real Curves</h3>
            <p className="text-xs text-obsidian-muted leading-relaxed">
              Our sizing is calibrated strictly for African proportions—ensuring room through hips, structured busts, and waists that fit without gapping.
            </p>
          </div>

          <div className="bg-ivory-warm border border-stone-line p-6 space-y-3">
            <MapPin className="w-6 h-6 text-oxblood stroke-1.5" />
            <h3 className="font-serif text-lg text-obsidian font-semibold">Local Artisanal Leather</h3>
            <p className="text-xs text-obsidian-muted leading-relaxed">
              Our footwear and bags are built with genuine full-grain leather, cushioned memory-foam insoles, and reinforced stitching by second-generation Aba cordwainers.
            </p>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="font-serif text-2xl sm:text-3xl text-obsidian font-normal">
            Boutique Pickup & Nationwide Dispatch
          </h2>
          <p>
            Whether you walk through our doors on Ehi Road in Aba to collect your parcel in person, or order from Lagos, Port Harcourt, Abuja, or London, our promise remains constant: punctual dispatch, honest pricing in Naira, and direct personal care.
          </p>
        </section>
      </div>

      {/* CTA Box */}
      <div className="bg-obsidian text-ivory-light p-8 sm:p-12 border border-stone-line flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <h3 className="font-serif text-2xl text-ivory">Explore our latest drops</h3>
          <p className="text-xs text-ivory-muted">
            Freshly finished dresses, mules, and matching sets ready for dispatch across Nigeria.
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

