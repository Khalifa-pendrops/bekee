'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Globe, 
  Save, 
  Check, 
  ExternalLink, 
  MessageCircle, 
  Store, 
  FileText,
  AlertCircle
} from 'lucide-react';
import { StoreSettings } from '@/types';

export default function AdminWebsitePage() {
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedFeedback, setSavedFeedback] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings')
      .then((r) => r.json())
      .then((data) => setSettings(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (res.ok) {
        setSavedFeedback(true);
        setTimeout(() => setSavedFeedback(false), 3000);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-stone-500 font-semibold uppercase tracking-wider">Loading Website Controls...</div>;
  }

  if (!settings) {
    return <div className="p-8 text-center text-xs text-red-600">Failed to load store settings.</div>;
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Globe className="w-6 h-6 text-oxblood-700" />
            Website Content & Merchandising
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Update your announcement bar, Aba showroom address, customer care WhatsApp, and store policies without code.
          </p>
        </div>

        <Link
          href="/"
          target="_blank"
          className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-lg transition-colors"
        >
          <span>Preview Live Website</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>

      {savedFeedback && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-lg flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Website content updated successfully! Changes are live on your storefront.</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-8 text-xs">
        
        {/* 1. Announcement Bar */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-stone-900">
              Top Announcement Bar
            </h2>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-stone-600 font-medium">Show Bar:</span>
              <input
                type="checkbox"
                checked={settings.isAnnouncementBarActive}
                onChange={(e) => setSettings({ ...settings, isAnnouncementBarActive: e.target.checked })}
                className="w-4 h-4 accent-oxblood-700 rounded"
              />
            </label>
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Announcement Message:
            </label>
            <input
              type="text"
              value={settings.announcementBarText}
              onChange={(e) => setSettings({ ...settings, announcementBarText: e.target.value })}
              className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded font-medium text-stone-900 focus:outline-none focus:border-stone-900"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Destination Link (Optional):
            </label>
            <input
              type="text"
              value={settings.announcementBarLink || ''}
              onChange={(e) => setSettings({ ...settings, announcementBarLink: e.target.value })}
              placeholder="/shop or /collections/new-arrivals"
              className="w-full px-3.5 py-2 bg-sand-50 border border-stone-300 rounded text-stone-900 font-mono"
            />
          </div>
        </div>

        {/* 2. Store Identity & Aba Location */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-1.5">
            <Store className="w-4 h-4 text-oxblood-700" />
            Store Identity & Aba Showroom Contact
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Brand Name:
              </label>
              <input
                type="text"
                value={settings.storeName}
                onChange={(e) => setSettings({ ...settings, storeName: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded font-bold text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Brand Tagline:
              </label>
              <input
                type="text"
                value={settings.brandTagline}
                onChange={(e) => setSettings({ ...settings, brandTagline: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded font-medium text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Aba Boutique Showroom Address:
              </label>
              <input
                type="text"
                value={settings.businessAddress}
                onChange={(e) => setSettings({ ...settings, businessAddress: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Customer Care WhatsApp Number (e.g. 2348030001234):
              </label>
              <input
                type="text"
                value={settings.whatsappNumber}
                onChange={(e) => setSettings({ ...settings, whatsappNumber: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded text-stone-900 font-mono"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Customer Support Email:
              </label>
              <input
                type="email"
                value={settings.email}
                onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded text-stone-900"
              />
            </div>

            <div>
              <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Business & Showroom Hours:
              </label>
              <input
                type="text"
                value={settings.businessHours}
                onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-sand-50 border border-stone-300 rounded text-stone-900"
              />
            </div>
          </div>
        </div>

        {/* 3. Policies & Aba Pickup Instructions */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-oxblood-700" />
            Store Policies & Customer Information
          </h2>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Aba Boutique Showroom Pickup Instructions:
            </label>
            <textarea
              rows={2}
              value={settings.abaPickupInstructions}
              onChange={(e) => setSettings({ ...settings, abaPickupInstructions: e.target.value })}
              className="w-full px-3.5 py-2 bg-sand-50 border border-stone-300 rounded text-stone-900"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Delivery Policy & Transit Expectations:
            </label>
            <textarea
              rows={3}
              value={settings.deliveryPolicy}
              onChange={(e) => setSettings({ ...settings, deliveryPolicy: e.target.value })}
              className="w-full px-3.5 py-2 bg-sand-50 border border-stone-300 rounded text-stone-900"
            />
          </div>

          <div>
            <label className="block font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
              Return & Exchange Guidelines (48-Hour Notice):
            </label>
            <textarea
              rows={3}
              value={settings.returnAndExchangePolicy}
              onChange={(e) => setSettings({ ...settings, returnAndExchangePolicy: e.target.value })}
              className="w-full px-3.5 py-2 bg-sand-50 border border-stone-300 rounded text-stone-900"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="px-8 py-3.5 bg-stone-900 hover:bg-oxblood-700 text-white font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Publishing Changes...' : 'Save & Publish Changes'}</span>
          </button>
        </div>

      </form>

    </div>
  );
}

