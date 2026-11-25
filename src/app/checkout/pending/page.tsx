'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Clock, MessageCircle, AlertTriangle, ArrowRight } from 'lucide-react';
import { buildCustomerOrderWhatsAppUrl } from '@/lib/whatsapp';

function PendingContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'Your Order';
  const reason = searchParams.get('reason');
  const [orderData, setOrderData] = React.useState<any>(null);

  const isQuarantine = reason === 'inventory_conflict';

  React.useEffect(() => {
    if (orderNumber && !orderNumber.includes('Order')) {
      fetch(`/api/checkout/order-summary?orderNumber=${encodeURIComponent(orderNumber)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.order) {
            setOrderData(json.order);
          }
        })
        .catch(() => {});
    }
  }, [orderNumber]);

  const storePhone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2349164161091').replace(/\D/g, '');
  const destination = orderData?.shippingAddress
    ? `${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`
    : undefined;

  const whatsappUrl = buildCustomerOrderWhatsAppUrl({
    storePhone,
    orderNumber,
    customerName: orderData?.customerName,
    customerPhone: orderData?.customerPhone,
    deliveryType: orderData?.deliveryType,
    deliveryDestination: destination,
    items: orderData?.items,
    totalKobo: orderData?.totalKobo,
  });

  return (
    <div className="bg-sand-50 min-h-screen py-16 md:py-24">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <div className="bg-white p-8 md:p-10 rounded-lg border border-sand-200 shadow-sm text-center">
          
          <div className="w-14 h-14 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-5">
            {isQuarantine ? <AlertTriangle className="w-8 h-8" /> : <Clock className="w-8 h-8" />}
          </div>

          <h1 className="font-serif text-2xl md:text-3xl text-stone-900 mb-3 tracking-tight">
            {isQuarantine ? 'Payment Received • Priority Order Review' : 'Payment Awaiting Settlement'}
          </h1>

          <p className="text-stone-600 text-sm mb-6 leading-relaxed">
            {isQuarantine ? (
              <>
                Your payment was successfully received, but arrived after the standard 15-minute reservation window expired. 
                Our Aba warehouse team has placed your order in a <strong>priority quarantine hold</strong> to confirm variant fabric availability or offer an immediate restock priority / full refund.
              </>
            ) : (
              <>
                Your bank transfer or transaction is currently settling with the interbank network. Once Paystack confirms the credit, your order status will automatically update to paid.
              </>
            )}
          </p>

          <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-4 mb-8 text-left text-xs text-amber-900 space-y-1">
            <div className="font-semibold uppercase tracking-wider">Order Reference: {orderNumber}</div>
            <div>Status: <span className="font-medium">{isQuarantine ? 'Quarantined (Late Settlement)' : 'Pending Interbank Clearing'}</span></div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3 bg-emerald-700 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Contact Aba Concierge on WhatsApp</span>
            </a>

            <Link
              href="/track-order"
              className="w-full sm:w-auto px-6 py-3 bg-stone-900 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-oxblood-700 transition-colors flex items-center justify-center gap-2"
            >
              <span>Track Order</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="mt-8 pt-6 border-t border-sand-200 text-center">
            <Link
              href="/"
              className="text-xs font-medium text-stone-500 hover:text-stone-900 tracking-wider uppercase transition-colors"
            >
              Return to Storefront
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function CheckoutPendingPage() {
  return (
    <Suspense fallback={
      <div className="bg-sand-50 min-h-screen flex items-center justify-center">
        <div className="text-xs tracking-widest uppercase font-medium text-stone-500">Checking Status...</div>
      </div>
    }>
      <PendingContent />
    </Suspense>
  );
}

