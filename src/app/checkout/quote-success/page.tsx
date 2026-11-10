'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Sparkles, MessageCircle, ArrowLeft, CheckCircle2 } from 'lucide-react';

function QuoteSuccessContent() {
  const searchParams = useSearchParams();
  const quoteId = searchParams.get('quoteId') || 'REQ-QUOTE';

  const whatsappMessage = encodeURIComponent(
    `Hello ARUBEKEE COLLECTION, I just submitted a delivery quote request (${quoteId}). I'd like to confirm the shipping cost for my area.`
  );
  const whatsappUrl = `https://wa.me/2348030001234?text=${whatsappMessage}`;

  return (
    <div className="bg-sand-50 min-h-screen py-16 md:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 md:p-10 rounded-lg border border-sand-200 shadow-sm text-center">
          
          <div className="w-14 h-14 bg-sand-100 text-oxblood-700 rounded-full flex items-center justify-center mx-auto mb-5">
            <Sparkles className="w-8 h-8" />
          </div>

          <h1 className="font-serif text-2xl md:text-3xl text-stone-900 mb-3 tracking-tight">
            Delivery Quote Request Received
          </h1>

          <p className="text-stone-600 text-sm mb-6 leading-relaxed">
            Thank you! Because your delivery address is outside standard route corridors or requires custom waybill handling, our Aba logistics desk is calculating the most reliable, cost-effective shipping rate.
          </p>

          <div className="bg-sand-50 border border-sand-200 rounded-lg p-4 mb-8 text-left text-xs text-stone-700 space-y-2">
            <div className="flex justify-between">
              <span className="font-semibold uppercase tracking-wider text-stone-500">Quote ID:</span>
              <span className="font-mono font-bold text-stone-900">{quoteId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold uppercase tracking-wider text-stone-500">Next Steps:</span>
              <span className="text-stone-900">Direct payment link sent via SMS/WhatsApp</span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold uppercase tracking-wider text-stone-500">Estimated Response:</span>
              <span className="text-emerald-700 font-medium">Within 2 to 4 business hours</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Speed Up Review via WhatsApp</span>
            </a>

            <Link
              href="/shop"
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-oxblood-700 transition-colors"
            >
              Return to Shop
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-sand-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center text-xs font-medium text-stone-500 hover:text-stone-900 tracking-wider uppercase transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function QuoteSuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-sand-50 min-h-screen flex items-center justify-center">
        <div className="text-xs tracking-widest uppercase font-medium text-stone-500">Loading Confirmation...</div>
      </div>
    }>
      <QuoteSuccessContent />
    </Suspense>
  );
}

