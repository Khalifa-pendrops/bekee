'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Percent, Plus, Check, Tag, ShieldCheck, Trash2 } from 'lucide-react';
import { formatKoboToNaira, parseNairaToKobo } from '@/lib/utils';
import { DiscountCode } from '@/types';

export default function AdminDiscountsPage() {
  const [discounts, setDiscounts] = useState<DiscountCode[]>([
    {
      id: 'disc_welcome',
      code: 'ARUWELCOME',
      discountType: 'percentage',
      discountValue: 10,
      minOrderKobo: 2000000, // ₦20,000
      timesUsed: 14,
      maxUses: 500,
      isActive: true,
    },
    {
      id: 'disc_abagirl',
      code: 'ABAGIRL',
      discountType: 'fixed_kobo',
      discountValue: 500000, // ₦5,000 off
      minOrderKobo: 4000000, // ₦40,000
      timesUsed: 22,
      maxUses: 200,
      isActive: true,
    },
    {
      id: 'disc_vip',
      code: 'VIP2026',
      discountType: 'percentage',
      discountValue: 15,
      minOrderKobo: 5000000, // ₦50,000
      timesUsed: 5,
      maxUses: 100,
      isActive: true,
    },
  ]);

  const [newCode, setNewCode] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed_kobo'>('percentage');
  const [discountVal, setDiscountVal] = useState('10');
  const [minOrderNaira, setMinOrderNaira] = useState('20000');
  const [maxUses, setMaxUses] = useState('100');
  const [showModal, setShowModal] = useState(false);

  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) return;

    const val = discountType === 'percentage' ? parseInt(discountVal) : parseNairaToKobo(discountVal);

    const created: DiscountCode = {
      id: `disc_${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      discountType,
      discountValue: val,
      minOrderKobo: minOrderNaira ? parseNairaToKobo(minOrderNaira) : undefined,
      timesUsed: 0,
      maxUses: maxUses ? parseInt(maxUses) : undefined,
      isActive: true,
    };

    setDiscounts([created, ...discounts]);
    setShowModal(false);
    setNewCode('');
  };

  const handleToggleActive = (id: string) => {
    setDiscounts(discounts.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d)));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Percent className="w-6 h-6 text-oxblood-700" />
            Promotions & Discount Codes
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Create promotional coupon codes for new customers, VIP sales, and festive flash offers.
          </p>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-oxblood-700 hover:bg-oxblood-800 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Code</span>
        </button>
      </div>

      {/* Discounts Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden">
        <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs font-semibold text-stone-700">
          Active Coupons ({discounts.length})
        </div>

        <div className="divide-y divide-stone-100">
          {discounts.map((d) => (
            <div key={d.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-sm text-stone-900 bg-sand-100 px-2.5 py-0.5 rounded border border-sand-300">
                    {d.code}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    d.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-stone-200 text-stone-600'
                  }`}>
                    {d.isActive ? 'Active' : 'Paused'}
                  </span>
                </div>

                <div className="text-stone-700">
                  Reward: <strong className="font-semibold text-oxblood-800">
                    {d.discountType === 'percentage' ? `${d.discountValue}% OFF` : `${formatKoboToNaira(d.discountValue)} OFF`}
                  </strong>
                  {d.minOrderKobo && (
                    <span className="text-stone-500"> • Min order: {formatKoboToNaira(d.minOrderKobo)}</span>
                  )}
                </div>

                <div className="text-[11px] text-stone-400">
                  Used: {d.timesUsed} {d.maxUses ? `of ${d.maxUses} limit` : 'times'}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleToggleActive(d.id)}
                  className={`px-3 py-1.5 rounded text-xs font-semibold uppercase tracking-wider transition-colors ${
                    d.isActive ? 'bg-stone-100 hover:bg-stone-200 text-stone-700' : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  }`}
                >
                  {d.isActive ? 'Pause Code' : 'Enable Code'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-stone-200 max-w-md w-full p-6 shadow-2xl space-y-4">
            <h3 className="font-serif text-lg font-bold text-stone-900">Create Promotional Coupon</h3>

            <form onSubmit={handleCreateDiscount} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                  Coupon Code (e.g. FLASH20): <span className="text-oxblood-700">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ARUWOMAN"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  className="w-full px-3 py-2 uppercase font-mono font-bold bg-sand-50 border border-stone-300 rounded text-stone-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Discount Type:
                  </label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-sand-50 border border-stone-300 rounded font-medium text-stone-900"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed_kobo">Fixed Naira (₦ OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Value ({discountType === 'percentage' ? '%' : '₦'}):
                  </label>
                  <input
                    type="number"
                    required
                    value={discountVal}
                    onChange={(e) => setDiscountVal(e.target.value)}
                    className="w-full px-3 py-2 font-bold bg-sand-50 border border-stone-300 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Min Order (₦):
                  </label>
                  <input
                    type="number"
                    value={minOrderNaira}
                    onChange={(e) => setMinOrderNaira(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-50 border border-stone-300 rounded text-stone-900"
                  />
                </div>

                <div>
                  <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1">
                    Max Uses:
                  </label>
                  <input
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    className="w-full px-3 py-2 bg-sand-50 border border-stone-300 rounded text-stone-900"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2.5 border border-stone-300 text-stone-700 font-semibold uppercase rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-stone-900 hover:bg-oxblood-700 text-white font-bold uppercase rounded transition-colors"
                >
                  Create Coupon
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}

