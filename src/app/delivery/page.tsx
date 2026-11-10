import React from "react";
import Link from "next/link";
import { mockDeliveryZones } from "@/data/mockData";
import { formatKoboToNaira } from "@/lib/utils";
import { Truck, MapPin, ShieldCheck, Clock, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Delivery Rates & Aba Pickup | ARUBEKEE COLLECTION",
  description: "Transparent Nigerian shipping rates, Aba boutique collection hours, and transit times for Arubekee Collection.",
};

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 text-left">
      <div className="border-b border-stone-line pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-oxblood">
          Logistics & Fulfilment
        </span>
        <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-obsidian font-normal">
          Delivery Rates & Store Pickup
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted max-w-xl">
          We dispatch parcels from our Aba atelier every afternoon (Monday – Saturday). All delivery fees are stated upfront before you make payment.
        </p>
      </div>

      {/* Delivery Zones Table */}
      <div className="space-y-4">
        <h2 className="font-serif text-2xl text-obsidian">Approved Delivery Zones</h2>
        <div className="bg-ivory border border-stone-line divide-y divide-stone-line">
          {mockDeliveryZones.map((zone) => (
            <div key={zone.id} className="p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1 max-w-md">
                <div className="flex items-center gap-2">
                  <h3 className="font-serif text-lg text-obsidian font-semibold">{zone.name}</h3>
                  {zone.feeKobo === 0 && (
                    <span className="bg-status-successBg text-status-success text-[10px] font-bold px-2 py-0.5 uppercase">
                      Free
                    </span>
                  )}
                </div>
                <p className="text-xs text-obsidian-muted">{zone.description}</p>
                <p className="text-[11px] text-oxblood font-semibold">
                  Estimated Transit: {zone.estimatedDays}
                </p>
              </div>

              <div className="text-left sm:text-right shrink-0">
                <div className="font-sans font-bold text-base text-obsidian">
                  {zone.feeKobo === 0 ? "₦0 (Free)" : formatKoboToNaira(zone.feeKobo)}
                </div>
                {zone.freeShippingAboveKobo && (
                  <p className="text-[10px] text-status-success font-medium">
                    Free above {formatKoboToNaira(zone.freeShippingAboveKobo)}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quote-Required Areas Policy */}
      <div className="bg-ivory-warm border border-stone-line p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-oxblood font-semibold text-sm uppercase tracking-wider">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>Living Outside Standard Delivery Zones?</span>
        </div>
        <p className="text-xs sm:text-sm text-obsidian-muted leading-relaxed">
          If your delivery address is in a remote LGA or military cantonment not covered by our standard couriers, our system will <strong>never charge you for items and surprise you with unexpected freight bills later</strong>.
        </p>
        <p className="text-xs sm:text-sm text-obsidian-muted leading-relaxed">
          Instead, select <em>&ldquo;Request Delivery Quote&rdquo;</em> at checkout. Our Aba logistics coordinator will calculate the exact transport fee with local motor park couriers or GIG Logistics and send you a secure checkout link covering both items and verified delivery.
        </p>
      </div>

      {/* Aba Store Pickup Instructions */}
      <div className="space-y-4 border-t border-stone-line pt-8">
        <h2 className="font-serif text-2xl text-obsidian">How Aba Store Pickup Works</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-obsidian-muted">
          <div className="p-4 bg-ivory border border-stone-line space-y-2">
            <span className="w-6 h-6 rounded-full bg-oxblood text-ivory-light flex items-center justify-center font-bold text-xs">1</span>
            <strong className="block text-obsidian text-sm">Select Aba Pickup</strong>
            <p>Choose &ldquo;Free Aba Store Pickup&rdquo; at checkout and complete your order.</p>
          </div>

          <div className="p-4 bg-ivory border border-stone-line space-y-2">
            <span className="w-6 h-6 rounded-full bg-oxblood text-ivory-light flex items-center justify-center font-bold text-xs">2</span>
            <strong className="block text-obsidian text-sm">Receive Readiness SMS</strong>
            <p>Your items are packaged in our boutique within 2 hours. You will receive an SMS and WhatsApp notification.</p>
          </div>

          <div className="p-4 bg-ivory border border-stone-line space-y-2">
            <span className="w-6 h-6 rounded-full bg-oxblood text-ivory-light flex items-center justify-center font-bold text-xs">3</span>
            <strong className="block text-obsidian text-sm">Collect at Showroom</strong>
            <p>Visit our showroom on Ehi Road with your Order Number to inspect and collect your garments.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

