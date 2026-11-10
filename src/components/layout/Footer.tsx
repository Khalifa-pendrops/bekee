import React from "react";
import Link from "next/link";
import { MapPin, Phone, Clock, MessageSquare, ShieldCheck, Truck, RefreshCw } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-ivory-warm border-t border-stone-line text-obsidian pt-16 pb-24 lg:pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Core Brand Value Pillars */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pb-12 border-b border-stone-line">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-ivory border border-stone-line text-oxblood shrink-0">
              <Truck className="w-5 h-5 stroke-1.5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-obsidian">Nationwide Dispatch & Aba Pickup</h4>
              <p className="text-xs text-obsidian-muted mt-1 leading-relaxed">
                Reliable interstate delivery across Nigeria. Free verified store pickup available at our boutique in Aba, Abia State.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-ivory border border-stone-line text-oxblood shrink-0">
              <ShieldCheck className="w-5 h-5 stroke-1.5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-obsidian">Quality Craftsmanship</h4>
              <p className="text-xs text-obsidian-muted mt-1 leading-relaxed">
                Premium fabrics, neat seam finishes, and authentic sizing tailored specifically for the contemporary African woman.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="p-3 bg-ivory border border-stone-line text-oxblood shrink-0">
              <RefreshCw className="w-5 h-5 stroke-1.5" />
            </div>
            <div>
              <h4 className="font-serif text-base text-obsidian">Easy Exchange Support</h4>
              <p className="text-xs text-obsidian-muted mt-1 leading-relaxed">
                Unworn items in original condition can be exchanged within 48 hours of delivery. Simple WhatsApp coordination.
              </p>
            </div>
          </div>
        </div>

        {/* Navigation & Contact Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 py-12">
          {/* Brand Info */}
          <div className="lg:col-span-2 space-y-4">
            <div className="space-y-1">
              <h3 className="font-serif text-2xl tracking-[0.2em] text-obsidian uppercase">
                ARUBEKEE
              </h3>
              <p className="text-[10px] tracking-[0.3em] uppercase text-oxblood font-semibold">
                Collection
              </p>
            </div>
            <p className="text-xs text-obsidian-muted leading-relaxed max-w-sm">
              Artisanal and contemporary ready-to-wear women’s fashion, shoes, structured bags, and accessories, curated and crafted in the commercial fashion hub of Aba, Abia State.
            </p>

            <div className="pt-2 space-y-2 text-xs text-obsidian-soft">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-oxblood shrink-0" />
                <span>Aba, Abia State, Nigeria (Physical store pickup available)</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-oxblood shrink-0" />
                <span>Monday – Saturday: 9:00 AM – 6:00 PM WAT</span>
              </div>
              <div className="flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-oxblood shrink-0" />
                <a
                  href="https://wa.me/2348000000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-oxblood underline"
                >
                  Direct WhatsApp Support
                </a>
              </div>
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-obsidian-soft mb-4">
              Shop Categories
            </h4>
            <ul className="space-y-2.5 text-xs text-obsidian-muted">
              <li>
                <Link href="/categories/clothing" className="hover:text-oxblood transition-colors">
                  Dresses & Jumpsuits
                </Link>
              </li>
              <li>
                <Link href="/categories/clothing" className="hover:text-oxblood transition-colors">
                  Matching Sets & Tops
                </Link>
              </li>
              <li>
                <Link href="/categories/shoes" className="hover:text-oxblood transition-colors">
                  Heels, Flats & Sandals
                </Link>
              </li>
              <li>
                <Link href="/categories/bags" className="hover:text-oxblood transition-colors">
                  Shoulder & Crossbody Bags
                </Link>
              </li>
              <li>
                <Link href="/categories/accessories" className="hover:text-oxblood transition-colors">
                  Jewellery & Belts
                </Link>
              </li>
            </ul>
          </div>

          {/* Collections */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-obsidian-soft mb-4">
              Curated Edits
            </h4>
            <ul className="space-y-2.5 text-xs text-obsidian-muted">
              <li>
                <Link href="/collections/new-arrivals" className="hover:text-oxblood transition-colors">
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link href="/collections/workwear" className="hover:text-oxblood transition-colors">
                  Corporate & Workwear
                </Link>
              </li>
              <li>
                <Link href="/collections/weekend-looks" className="hover:text-oxblood transition-colors">
                  Weekend Looks
                </Link>
              </li>
              <li>
                <Link href="/collections/occasion-wear" className="hover:text-oxblood transition-colors">
                  Sunday & Occasion Wear
                </Link>
              </li>
              <li>
                <Link href="/collections/sale" className="text-oxblood font-medium hover:underline">
                  Special Sale Edit
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Care */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-widest text-obsidian-soft mb-4">
              Customer Care
            </h4>
            <ul className="space-y-2.5 text-xs text-obsidian-muted">
              <li>
                <Link href="/track-order" className="hover:text-oxblood transition-colors">
                  Track Your Order
                </Link>
              </li>
              <li>
                <Link href="/size-guide" className="hover:text-oxblood transition-colors">
                  Size Guide (UK & EU)
                </Link>
              </li>
              <li>
                <Link href="/delivery" className="hover:text-oxblood transition-colors">
                  Delivery Rates & Pickup
                </Link>
              </li>
              <li>
                <Link href="/returns" className="hover:text-oxblood transition-colors">
                  Exchange Policy
                </Link>
              </li>
              <li>
                <Link href="/about" className="hover:text-oxblood transition-colors">
                  About Our Aba Atelier
                </Link>
              </li>
              <li>
                <Link href="/admin" className="text-obsidian-subtle hover:text-obsidian text-[11px]">
                  Owner Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright & Disclaimer */}
        <div className="pt-8 mt-4 border-t border-stone-line flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-obsidian-subtle">
          <p>© {new Date().getFullYear()} ARUBEKEE COLLECTION. All rights reserved. Aba, Abia State, Nigeria.</p>
          <div className="flex gap-4">
            <Link href="/privacy" className="hover:underline">Privacy Policy</Link>
            <Link href="/terms" className="hover:underline">Terms of Service</Link>
            <span>Currency: NGN (₦)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

