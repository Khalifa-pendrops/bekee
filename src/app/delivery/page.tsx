import React from "react";
import Link from "next/link";
import { 
  Truck, 
  MapPin, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Package, 
  PhoneCall, 
  Store, 
  ArrowRight,
  MessageCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";

export const metadata = {
  title: "Delivery & Pickup Information | ARUBEKEE COLLECTION",
  description: "Transparent Nigerian courier transit times, Aba boutique collection hours, and logistics guidelines for ARUBEKEE COLLECTION.",
};

interface LogisticsZone {
  id: string;
  name: string;
  badge: string;
  coverage: string;
  estimatedTransit: string;
  courierPartner: string;
  customerCost: string;
  isFreePickup: boolean;
  notes: string;
}

const LOGISTICS_ZONES: LogisticsZone[] = [
  {
    id: "zone_aba_pickup",
    name: "Aba Store Boutique Pickup",
    badge: "Free Collection",
    coverage: "Aba Showroom (Ehi Road Fashion District, Aba, Abia State)",
    estimatedTransit: "Ready in 2 hours (Same Day)",
    courierPartner: "In-Person Boutique Collection",
    customerCost: "₦0 (Free)",
    isFreePickup: true,
    notes: "Collect directly from our Aba atelier. Inspect your garments in-store with zero handling fee.",
  },
  {
    id: "zone_aba_local",
    name: "Aba Metropolis Doorstep Express",
    badge: "Direct Dispatch",
    coverage: "Any residential or business address within Aba city limits",
    estimatedTransit: "Same day / 24 hours",
    courierPartner: "Dedicated City Dispatch Rider",
    customerCost: "Paid to Rider on Arrival",
    isFreePickup: false,
    notes: "Direct doorstep dispatch. The rider's standard city transit fee is paid directly upon delivery.",
  },
  {
    id: "zone_south_east",
    name: "South-East Regional Transit",
    badge: "Regional Express",
    coverage: "Enugu, Owerri, Umuahia, Onitsha, Awka, Abakaliki & surrounding towns",
    estimatedTransit: "1 – 2 business days",
    courierPartner: "Regional Courier / Park Express (Peace Mass, Eastern Transit)",
    customerCost: "Waybill Fee Paid on Collection",
    isFreePickup: false,
    notes: "Parcels are dispatched daily from Aba. Pay the official courier waybill fee upon arrival at the terminal or doorstep.",
  },
  {
    id: "zone_lagos_ph_abuja",
    name: "Lagos, Port Harcourt & Abuja Commercial Corridor",
    badge: "Priority Corridor",
    coverage: "Lagos State, Rivers State (Port Harcourt), and Abuja FCT",
    estimatedTransit: "2 – 3 business days",
    courierPartner: "Priority Air Cargo & Express Overland Couriers",
    customerCost: "Courier Fee Paid on Delivery",
    isFreePickup: false,
    notes: "Priority interstate transit direct from Aba. Transporter fee is billed by the logistics provider and paid on delivery.",
  },
  {
    id: "zone_nationwide",
    name: "Nationwide Standard Delivery",
    badge: "Nationwide Transit",
    coverage: "All other 33 Nigerian States & Federal Territories",
    estimatedTransit: "3 – 5 business days",
    courierPartner: "GIG Logistics / Peace Mass Transit / Certified Interstate Couriers",
    customerCost: "Waybill Fee Paid on Collection",
    isFreePickup: false,
    notes: "Dispatched to your nearest courier terminal or doorstep. Waybill charge is paid directly to the transporter upon collection.",
  },
];

export default function DeliveryPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-20 space-y-12 text-left">
      
      {/* 1. Header */}
      <div className="border-b border-stone-line pb-6 space-y-2">
        <span className="text-xs uppercase tracking-widest font-semibold text-oxblood">
          Logistics & Fulfilment Policy
        </span>
        <h1 className="editorial-heading text-3xl sm:text-4xl lg:text-5xl text-obsidian font-normal">
          Delivery & Boutique Pickup
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted max-w-2xl leading-relaxed">
          We dispatch parcels from our Aba showroom every afternoon (Monday – Saturday). Because transport fees depend directly on courier logistics, parcel weight, and destination, <strong>all delivery and waybill fees are determined by the transporter and paid directly upon delivery or collection.</strong>
        </p>
      </div>

      {/* 2. Core Policy Card: Why Pay on Arrival for Logistics? */}
      <div className="bg-ivory border border-stone-line p-6 sm:p-8 space-y-5 shadow-card">
        <div className="flex items-center gap-2.5 text-oxblood font-serif text-lg font-bold">
          <ShieldCheck className="w-5 h-5 text-oxblood shrink-0" />
          <span>Our Transparent Logistics Promise</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-obsidian-muted">
          <div className="space-y-1.5 p-4 bg-sand-50/60 border border-stone-line/60 rounded">
            <span className="font-semibold text-obsidian text-xs block">1. Garments Only Paid Online</span>
            <p className="leading-relaxed">
              When checking out on our website, your payment covers 100% of your chosen luxury garments. We never charge arbitrary or inflated shipping markups online.
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-sand-50/60 border border-stone-line/60 rounded">
            <span className="font-semibold text-obsidian text-xs block">2. In-Store Pickup is Always Free</span>
            <p className="leading-relaxed">
              If you or your representative collects in person at our Aba showroom on Ehi Road, there is zero handling or collection fee (₦0).
            </p>
          </div>

          <div className="space-y-1.5 p-4 bg-sand-50/60 border border-stone-line/60 rounded">
            <span className="font-semibold text-obsidian text-xs block">3. True Courier Rate on Arrival</span>
            <p className="leading-relaxed">
              For interstate and doorstep deliveries, you pay the courier&apos;s genuine waybill fee directly to them when receiving your package.
            </p>
          </div>
        </div>
      </div>

      {/* 3. Delivery Zones & Estimated Timelines */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-1">
          <div>
            <h2 className="font-serif text-2xl text-obsidian font-bold">Approved Transit Zones & Timelines</h2>
            <p className="text-xs text-obsidian-muted">Estimated transit times from parcel dispatch at our Aba workshop.</p>
          </div>
        </div>

        <div className="bg-ivory border border-stone-line divide-y divide-stone-line shadow-card">
          {LOGISTICS_ZONES.map((zone) => (
            <div 
              key={zone.id} 
              className="p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-sand-50/30 transition-colors"
            >
              <div className="space-y-2 max-w-xl">
                <div className="flex flex-wrap items-center gap-2">
                  <h3 className="font-serif text-lg text-obsidian font-semibold">{zone.name}</h3>
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                    zone.isFreePickup 
                      ? 'bg-status-successBg text-status-success border border-status-success/20' 
                      : 'bg-stone-100 text-stone-700 border border-stone-300'
                  }`}>
                    {zone.badge}
                  </span>
                </div>

                <p className="text-xs text-obsidian leading-relaxed">
                  <span className="font-semibold text-stone-800">Coverage:</span> {zone.coverage}
                </p>

                <p className="text-xs text-obsidian-muted leading-relaxed">
                  {zone.notes}
                </p>

                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] pt-1">
                  <span className="text-oxblood font-semibold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Transit: {zone.estimatedTransit}</span>
                  </span>
                  <span className="text-stone-500 flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5" />
                    <span>Courier: {zone.courierPartner}</span>
                  </span>
                </div>
              </div>

              {/* Cost Indicator */}
              <div className="text-left md:text-right shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-stone-line/60">
                <span className="text-[10px] uppercase tracking-wider text-obsidian-muted block font-semibold">
                  Delivery Charge
                </span>
                <span className={`font-sans font-bold text-sm sm:text-base ${
                  zone.isFreePickup ? 'text-emerald-700' : 'text-obsidian'
                }`}>
                  {zone.customerCost}
                </span>
                <span className="text-[10px] text-stone-500 block mt-0.5">
                  {zone.isFreePickup ? 'Zero transport cost' : 'Paid directly to courier'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. 3-Step Fulfillment & Collection Flow */}
      <div className="space-y-4 border-t border-stone-line pt-8">
        <h2 className="font-serif text-2xl text-obsidian font-bold">How Your Order Reaches You</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs text-obsidian-muted">
          <div className="p-5 bg-ivory border border-stone-line space-y-2.5 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-oxblood text-ivory-light flex items-center justify-center font-bold text-xs">
              1
            </span>
            <strong className="block text-obsidian text-sm font-serif">1. Order & Address</strong>
            <p className="leading-relaxed">
              Select &ldquo;Aba Boutique Pickup&rdquo; for free showroom collection, or enter your delivery address anywhere across Nigeria.
            </p>
          </div>

          <div className="p-5 bg-ivory border border-stone-line space-y-2.5 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-oxblood text-ivory-light flex items-center justify-center font-bold text-xs">
              2
            </span>
            <strong className="block text-obsidian text-sm font-serif">2. Live Waybill Notification</strong>
            <p className="leading-relaxed">
              Once packaged, our dispatch team hands over your parcel to the courier and sends your Waybill Tracking Code and carrier details via WhatsApp and SMS.
            </p>
          </div>

          <div className="p-5 bg-ivory border border-stone-line space-y-2.5 shadow-xs">
            <span className="w-7 h-7 rounded-full bg-oxblood text-ivory-light flex items-center justify-center font-bold text-xs">
              3
            </span>
            <strong className="block text-obsidian text-sm font-serif">3. Receive & Confirm</strong>
            <p className="leading-relaxed">
              Collect your parcel, pay the courier their official logistics fee, and use your 1-click live link to confirm safe arrival with our boutique.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Aba Showroom Pickup Details */}
      <div className="bg-sand-50 border border-stone-line p-6 sm:p-8 space-y-4">
        <div className="flex items-center gap-2 text-oxblood font-semibold text-sm uppercase tracking-wider">
          <Store className="w-5 h-5 shrink-0" />
          <span>Aba Boutique Showroom & Pickup Desk</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-obsidian-muted">
          <div>
            <strong className="block text-obsidian text-xs uppercase tracking-wider mb-1">Location Address:</strong>
            <p className="leading-relaxed">
              Ehi Road Fashion District, Aba, Abia State, Nigeria.
            </p>
          </div>
          <div>
            <strong className="block text-obsidian text-xs uppercase tracking-wider mb-1">Opening Hours:</strong>
            <p className="leading-relaxed">
              Monday – Saturday: 9:00 AM – 6:00 PM (Closed Sundays)
            </p>
          </div>
        </div>
        <p className="text-[11px] text-stone-500 pt-1">
          * Please have your Order Reference number (e.g., <code>ARUBEKEE-2611-XXXX</code>) ready when picking up your garments in-store.
        </p>
      </div>

      {/* 6. Help & Special Inquiries */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 bg-ivory border border-stone-line">
        <div className="space-y-1 text-center sm:text-left">
          <h3 className="font-serif text-base font-bold text-obsidian">Need specific courier assistance or motor park dispatch?</h3>
          <p className="text-xs text-obsidian-muted">
            Our logistics team can assist with GIG Logistics, Peace Mass Transit, or private car waybills to any local government area.
          </p>
        </div>
        <a 
          href="https://api.whatsapp.com/send?phone=2349134008010&text=Hello%20ARUBEKEE%2C%20I%20have%20a%20question%20regarding%20delivery%20logistics."
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 bg-oxblood hover:bg-oxblood-hover text-white text-xs font-semibold rounded shadow-xs transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Chat with Logistics</span>
        </a>
      </div>

    </div>
  );
}
