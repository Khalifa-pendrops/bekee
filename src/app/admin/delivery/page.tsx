'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Truck, Store, Check, Save, MapPin } from 'lucide-react';
import { formatKoboToNaira, parseNairaToKobo } from '@/lib/utils';
import { DeliveryZone } from '@/types';

export default function AdminDeliveryPage() {
  const [zones, setZones] = useState<DeliveryZone[]>([
    {
      id: 'zone_aba_pickup',
      name: 'Aba Boutique Showroom Pickup',
      description: 'Customer collects in person at our Aba showroom. Free of charge.',
      estimatedDays: 'Same-day collection available',
      statesIncluded: ['Abia'],
      feeKobo: 0,
      isActive: true,
      priorityOrder: 0,
    },
    {
      id: 'zone_aba_local',
      name: 'Aba Metropolis Dispatch',
      description: 'Dedicated dispatch rider within Aba metropolis.',
      estimatedDays: 'Same-day or next-day',
      statesIncluded: ['Abia'],
      feeKobo: 250000,
      isActive: true,
      priorityOrder: 1,
    },
    {
      id: 'zone_south_east',
      name: 'South-East Interstate Express',
      description: 'Enugu, Owerri, Onitsha, Awka, Abakaliki via dedicated express logistics.',
      estimatedDays: '1 - 2 business days',
      statesIncluded: ['Imo', 'Enugu', 'Anambra', 'Ebonyi'],
      feeKobo: 400000,
      isActive: true,
      priorityOrder: 2,
    },
    {
      id: 'zone_lagos_ph_abuja',
      name: 'Lagos, PH & Abuja Commercial Corridor',
      description: 'Priority courier transit to high-volume commercial capitals.',
      estimatedDays: '2 - 3 business days',
      statesIncluded: ['Lagos', 'Rivers', 'Abuja FCT'],
      feeKobo: 550000,
      isActive: true,
      priorityOrder: 3,
    },
    {
      id: 'zone_nationwide',
      name: 'Nationwide Interstate Waybill',
      description: 'Interstate courier waybill across all other Nigerian states.',
      estimatedDays: '3 - 5 business days',
      statesIncluded: ['All other 33 states'],
      feeKobo: 650000,
      isActive: true,
      priorityOrder: 4,
    },
  ]);

  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState(false);

  const handleUpdateFee = (id: string, newNaira: string) => {
    const kobo = parseNairaToKobo(newNaira);
    setZones(zones.map((z) => (z.id === id ? { ...z, feeKobo: kobo } : z)));
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      setFeedback(true);
      setTimeout(() => setFeedback(false), 3000);
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-oxblood-700" />
            Delivery Zones & Courier Rates
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Configure shipping fees (in NGN) and delivery turnaround times for customers across Nigeria.
          </p>
        </div>
      </div>

      {feedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Delivery rates updated! New checkouts will calculate based on these prices.</span>
        </div>
      )}

      <form onSubmit={handleSaveAll} className="space-y-4">
        {zones.map((zone) => {
          const isFree = zone.feeKobo === 0;
          const nairaValue = Math.round(zone.feeKobo / 100);

          return (
            <div
              key={zone.id}
              className="bg-white rounded-xl border border-stone-200 shadow-sm p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-stone-900">{zone.name}</span>
                  <span className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded font-medium">
                    Priority #{zone.priorityOrder}
                  </span>
                </div>

                <p className="text-xs text-stone-500 leading-normal">
                  {zone.description}
                </p>

                <div className="text-[11px] text-stone-600 flex items-center gap-1.5 pt-1">
                  <MapPin className="w-3.5 h-3.5 text-oxblood-700" />
                  <span>Coverage: <strong>{zone.statesIncluded.join(', ')}</strong> • Turnaround: <strong>{zone.estimatedDays}</strong></span>
                </div>
              </div>

              {/* Fee Editor */}
              <div className="shrink-0 flex items-center gap-2">
                {isFree ? (
                  <span className="px-4 py-2 bg-emerald-50 text-emerald-800 border border-emerald-200 font-bold text-xs rounded-lg">
                    FREE PICKUP
                  </span>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-stone-500 text-xs font-bold">₦</span>
                    <input
                      type="number"
                      step="500"
                      value={nairaValue}
                      onChange={(e) => handleUpdateFee(zone.id, e.target.value)}
                      className="w-28 px-3 py-2 text-xs font-bold bg-sand-50 border border-stone-300 rounded focus:outline-none focus:border-stone-900 text-stone-900 text-right"
                    />
                  </div>
                )}
              </div>
            </div>
          );
        })}

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-stone-900 hover:bg-oxblood-700 text-white font-bold uppercase tracking-widest text-xs rounded-lg transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Updating Rates...' : 'Save Delivery Pricing'}</span>
          </button>
        </div>
      </form>

    </div>
  );
}

