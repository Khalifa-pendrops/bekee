'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { clearCart } = useCart();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    if (!reference) {
      setErrorMessage('No payment reference found in callback request.');
      return;
    }

    let isMounted = true;

    async function verifyPayment() {
      try {
        const res = await fetch('/api/checkout/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference }),
        });

        const data = await res.json();

        if (!isMounted) return;

        if (data.status === 'PAID' || data.status === 'ALREADY_PAID') {
          // Success: Clear guest cart and redirect to success
          clearCart();
          router.replace(`/checkout/success?orderNumber=${encodeURIComponent(data.orderNumber)}`);
        } else if (data.status === 'QUARANTINED_INVENTORY_CONFLICT') {
          clearCart();
          router.replace(`/checkout/pending?reason=inventory_conflict&orderNumber=${encodeURIComponent(data.orderNumber)}`);
        } else {
          router.replace(`/checkout/failed?reason=${encodeURIComponent(data.error || 'Payment was not confirmed by the bank.')}`);
        }
      } catch (err: any) {
        console.error('[Callback] Verification failed:', err);
        if (isMounted) {
          setErrorMessage(err.message || 'Payment verification failed. Please contact customer care.');
        }
      }
    }

    verifyPayment();

    return () => {
      isMounted = false;
    };
  }, [searchParams, router, clearCart]);

  return (
    <div className="bg-sand-50 min-h-screen flex items-center justify-center py-20 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg border border-sand-200 text-center shadow-sm">
        {errorMessage ? (
          <div>
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 text-red-600">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="font-serif text-xl text-stone-900 mb-2">Verification Notice</h2>
            <p className="text-xs text-stone-600 mb-6 leading-relaxed">{errorMessage}</p>
            <button
              onClick={() => router.push('/checkout')}
              className="w-full py-2.5 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-oxblood-700 transition-colors"
            >
              Return to Checkout
            </button>
          </div>
        ) : (
          <div>
            <div className="w-12 h-12 bg-sand-100 rounded-full flex items-center justify-center mx-auto mb-4 text-stone-800">
              <Loader2 className="w-6 h-6 animate-spin text-oxblood-700" />
            </div>
            <h2 className="font-serif text-2xl text-stone-900 mb-2">Verifying Payment</h2>
            <p className="text-xs text-stone-600 leading-relaxed mb-6">
              Please wait while we confirm your transaction settlement with Paystack and commit your order...
            </p>
            <div className="inline-flex items-center gap-1.5 text-[11px] text-stone-400 font-medium">
              <ShieldCheck className="w-3.5 h-3.5 text-oxblood-700" />
              Secure 256-Bit SSL Handshake
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutCallbackPage() {
  return (
    <Suspense fallback={
      <div className="bg-sand-50 min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-oxblood-700" />
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}

