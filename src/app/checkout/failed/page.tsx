'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { AlertCircle, RotateCcw, MessageCircle, ArrowLeft } from 'lucide-react';

function FailedContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get('reason') || 'Transaction was cancelled or declined by your banking institution.';

  const whatsappMessage = encodeURIComponent(
    `Hello ARUBEKEE COLLECTION, I tried paying on your website but encountered an error: "${reason}". Can I pay via direct bank transfer?`
  );
  const whatsappUrl = `https://wa.me/2348030001234?text=${whatsappMessage}`;

  return (
    <div className="bg-sand-50 min-h-screen py-16 md:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 md:p-10 rounded-lg border border-sand-200 shadow-sm text-center">
          
          <div className="w-14 h-14 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-5">
            <AlertCircle className="w-8 h-8" />
          </div>

          <h1 className="font-serif text-2xl md:text-3xl text-stone-900 mb-3 tracking-tight">
            Payment Not Completed
          </h1>

          <p className="text-stone-600 text-sm mb-6 leading-relaxed">
            We were unable to verify settlement for this transaction. No funds were debited by ARUBEKEE COLLECTION.
          </p>

          <div className="bg-red-50/70 border border-red-200/80 rounded-lg p-4 mb-8 text-left">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-red-800 mb-1">
              Gateway Response:
            </div>
            <div className="text-xs text-red-700 leading-normal">
              {reason}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/checkout"
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-oxblood-700 transition-colors flex items-center justify-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Retry Checkout</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Pay via WhatsApp Bank Transfer</span>
            </a>
          </div>

          <div className="mt-8 pt-6 border-t border-sand-200 text-center">
            <Link
              href="/shop"
              className="inline-flex items-center text-xs font-medium text-stone-500 hover:text-stone-900 tracking-wider uppercase transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Continue Browsing
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutFailedPage() {
  return (
    <Suspense fallback={
      <div className="bg-sand-50 min-h-screen flex items-center justify-center">
        <div className="text-xs tracking-widest uppercase font-medium text-stone-500">Loading Status...</div>
      </div>
    }>
      <FailedContent />
    </Suspense>
  );
}

