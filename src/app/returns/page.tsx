import React from "react";
import Link from "next/link";
import { RefreshCw, ShieldCheck, AlertCircle, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Exchange Policy | ARUBEKEE COLLECTION",
  description: "Learn about the 48-hour exchange policy and guidelines for garments, footwear, and accessories from Arubekee Collection.",
};

export default function ReturnsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 text-left">
      <div className="border-b border-stone-line pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-oxblood">
          Customer Protection
        </span>
        <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-obsidian font-normal">
          Exchange & Return Policy
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted max-w-xl">
          We want you to feel poised and completely delighted with every garment you purchase. Here is our straightforward exchange process.
        </p>
      </div>

      <div className="space-y-8 text-xs sm:text-sm text-obsidian-muted leading-relaxed">
        <div className="bg-ivory-warm border border-stone-line p-6 space-y-3">
          <h2 className="font-serif text-xl text-obsidian font-semibold">
            The 48-Hour Exchange Window
          </h2>
          <p>
            If a garment or pair of shoes does not fit as expected, you may exchange it for a different size or another item in our collection within <strong>48 hours of parcel delivery confirmation</strong>.
          </p>
        </div>

        <section className="space-y-4">
          <h3 className="font-serif text-xl text-obsidian">Eligibility Conditions</h3>
          <ul className="list-disc list-inside space-y-2 pl-2">
            <li>Items must be unworn, unwashed, and free from perfume, makeup stains, or deodorant marks.</li>
            <li>All original designer brand tags and garment labels must remain attached.</li>
            <li>Footwear must have pristine, unscuffed soles (we recommend trying on over a rug or carpet).</li>
            <li>Custom bespoke-tailored orders (sewn to customer-provided non-standard measurements) are non-exchangeable unless defective.</li>
          </ul>
        </section>

        <section className="space-y-4">
          <h3 className="font-serif text-xl text-obsidian">How to Initiate an Exchange</h3>
          <p>
            Simply send a WhatsApp message to our Aba care line or use our <Link href="/track-order" className="underline text-oxblood font-semibold">Track Order</Link> page with your Order Number and photos of the item. Our team will verify size availability and coordinate pickup or courier drop-off.
          </p>
        </section>

        <section className="space-y-2 border-t border-stone-line pt-6">
          <h3 className="font-serif text-xl text-obsidian">Restocking & Quality Assurance</h3>
          <p>
            Returned pieces undergo an inspection by our quality control lead in Aba before any replacement item is dispatched. Defective or soiled items are not returned to sellable stock.
          </p>
        </section>
      </div>

      <div className="pt-4">
        <a
          href="https://wa.me/2348030001234?text=Hello%20Arubekee,%20I%20would%20like%20to%20request%20an%20item%20exchange"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Button variant="whatsapp" size="md" className="gap-2 text-xs uppercase tracking-wider">
            <MessageSquare className="w-4 h-4" />
            <span>Request Exchange on WhatsApp</span>
          </Button>
        </a>
      </div>
    </div>
  );
}

