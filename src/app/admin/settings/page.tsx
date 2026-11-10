'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Settings, 
  ShieldCheck, 
  Database, 
  CreditCard, 
  Copy, 
  Check, 
  BookOpen, 
  Clock, 
  CheckCircle2,
  Lock
} from 'lucide-react';

export default function AdminSettingsPage() {
  const [copiedWebhook, setCopiedWebhook] = useState(false);

  const webhookUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/api/webhooks/paystack` 
    : 'https://arubekee.com/api/webhooks/paystack';

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopiedWebhook(true);
    setTimeout(() => setCopiedWebhook(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-200">
        <div>
          <h1 className="font-serif text-2xl md:text-3xl font-bold text-stone-900 flex items-center gap-2">
            <Settings className="w-6 h-6 text-oxblood-700" />
            Store Infrastructure & Integrations
          </h1>
          <p className="text-xs text-stone-500 mt-0.5">
            Operational settings, Paystack API credentials, Supabase database status, and staff access.
          </p>
        </div>
      </div>

      <div className="space-y-6 text-xs">
        
        {/* 1. Paystack Gateway Configuration */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-oxblood-700" />
              Paystack Nigeria Integration
            </h2>
            <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 rounded-full font-bold uppercase text-[10px]">
              Test Mode Active
            </span>
          </div>

          <p className="text-stone-600 leading-normal">
            Transactions settle in Nigerian Naira (NGN) directly into your registered corporate bank account. All card and bank transfer data is handled securely under Central Bank of Nigeria (CBN) regulations.
          </p>

          {/* Webhook Configuration Card */}
          <div className="p-4 bg-sand-50 rounded-lg border border-sand-300 space-y-2">
            <div className="font-semibold text-stone-800 uppercase tracking-wider text-[11px]">
              Paystack Webhook Endpoint (For Live Settlement Sync):
            </div>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={webhookUrl}
                className="flex-1 px-3 py-2 bg-white border border-stone-300 rounded font-mono text-stone-900 text-xs"
              />
              <button
                onClick={handleCopyWebhook}
                className="px-4 py-2 bg-stone-900 text-white rounded font-semibold uppercase text-xs hover:bg-oxblood-700 flex items-center gap-1.5 transition-colors"
              >
                {copiedWebhook ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedWebhook ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
            <p className="text-[11px] text-stone-500">
              Paste this URL in your Paystack Dashboard under <em>Settings → API Keys & Webhooks</em>.
            </p>
          </div>
        </div>

        {/* 2. Supabase Cloud Database Status */}
        <div className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-4">
          <h2 className="font-serif text-base font-bold text-stone-900 flex items-center gap-2">
            <Database className="w-4 h-4 text-oxblood-700" />
            Supabase PostgreSQL Engine
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <div className="text-stone-500 text-[11px] uppercase font-semibold">PostgreSQL Host:</div>
              <div className="font-mono font-medium text-stone-900 mt-0.5">wpzncfmlcyrqgzaewjez.supabase.co</div>
            </div>

            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <div className="text-stone-500 text-[11px] uppercase font-semibold">Row-Level Security (RLS):</div>
              <div className="font-semibold text-emerald-700 mt-0.5 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Enforced & Active
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <div className="text-stone-500 text-[11px] uppercase font-semibold">Concurrency Engine:</div>
              <div className="font-medium text-stone-800 mt-0.5">15-Minute Row Locking with Auto-Expiry</div>
            </div>

            <div className="p-3 bg-stone-50 rounded border border-stone-200">
              <div className="text-stone-500 text-[11px] uppercase font-semibold">Currency & Timezone:</div>
              <div className="font-medium text-stone-800 mt-0.5">NGN (Integer Kobo) • Africa/Lagos (WAT)</div>
            </div>
          </div>
        </div>

        {/* 3. Owner Operating Manual */}
        <div className="bg-sand-100 rounded-xl border border-sand-300 p-6 space-y-3">
          <div className="flex items-center gap-2 font-serif text-base font-bold text-stone-900">
            <BookOpen className="w-5 h-5 text-oxblood-700" />
            Store Owner Operating Manual
          </div>
          <p className="text-stone-700 leading-relaxed">
            Need guidance on packing orders, issuing waybill tracking, updating prices, or taking in-store Aba sales? Check our complete step-by-step operating guide designed specifically for non-technical smartphone operation.
          </p>
          <div>
            <Link
              href="/admin/offline-sale"
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-stone-900 hover:bg-oxblood-700 text-white rounded text-xs font-semibold uppercase tracking-wider transition-colors"
            >
              <span>Explore Fast Actions</span>
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}

