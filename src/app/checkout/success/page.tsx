'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  CheckCircle2, 
  Package, 
  MapPin, 
  MessageCircle, 
  ArrowRight, 
  ShieldCheck,
  Calendar,
  Truck,
  ShoppingBag
} from 'lucide-react';
import { saveOrderToHistory } from '@/lib/orderStorage';
import { buildCustomerOrderWhatsAppUrl } from '@/lib/whatsapp';
import { formatKoboToNaira } from '@/lib/utils';

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber') || 'ARUBEKEE-ORDER';
  const paramPhone = searchParams.get('phone') || '';

  // Start as null so initial SSR HTML and initial client hydration match exactly (preventing hydration error)
  const [orderData, setOrderData] = React.useState<any>(null);

  React.useEffect(() => {
    // 1. Immediately hydrate order data from client localStorage post-mount
    if (typeof window !== 'undefined') {
      try {
        const byId = localStorage.getItem(`arubekee_order_${orderNumber}`);
        if (byId) {
          setOrderData(JSON.parse(byId));
        } else {
          const last = localStorage.getItem('arubekee_last_order_snapshot');
          if (last) {
            const parsed = JSON.parse(last);
            if (!orderNumber || parsed.orderNumber === orderNumber || orderNumber.includes('ORDER')) {
              setOrderData(parsed);
            }
          }
        }
      } catch {}
    }

    // 2. Fetch fresh server-confirmed summary
    if (orderNumber && !orderNumber.includes('ORDER')) {
      const existingPhone = paramPhone || (typeof window !== 'undefined' ? localStorage.getItem('arubekee_last_customer_phone') || '' : '');
      saveOrderToHistory(orderNumber, existingPhone);
      if (paramPhone && typeof window !== 'undefined') {
        localStorage.setItem('arubekee_last_customer_phone', paramPhone);
      }

      fetch(`/api/checkout/order-summary?orderNumber=${encodeURIComponent(orderNumber)}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.order) {
            setOrderData(json.order);
            try {
              localStorage.setItem(`arubekee_order_${orderNumber}`, JSON.stringify(json.order));
            } catch {}
          }
        })
        .catch((e) => console.warn('Could not load order summary for WhatsApp message:', e));
    }
  }, [orderNumber, paramPhone]);

  const storePhone = (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '2349164161091').replace(/[^0-9]/g, '');
  const destination = orderData?.shippingAddress
    ? `${orderData.shippingAddress.city}, ${orderData.shippingAddress.state}`
    : orderData?.deliveryDestination || undefined;

  const whatsappUrl = buildCustomerOrderWhatsAppUrl({
    storePhone,
    orderNumber,
    customerName: orderData?.customerName,
    customerPhone: orderData?.customerPhone || paramPhone,
    deliveryType: orderData?.deliveryType,
    deliveryDestination: destination,
    items: orderData?.items,
    totalKobo: orderData?.totalKobo,
  });

  const handleWhatsAppClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    let currentData = orderData;
    if (!currentData?.items || currentData.items.length === 0) {
      if (typeof window !== 'undefined') {
        try {
          const raw = localStorage.getItem(`arubekee_order_${orderNumber}`) || localStorage.getItem('arubekee_last_order_snapshot');
          if (raw) currentData = JSON.parse(raw);
        } catch {}
      }
    }

    if (!currentData?.items || currentData.items.length === 0) {
      e.preventDefault();
      try {
        const res = await fetch(`/api/checkout/order-summary?orderNumber=${encodeURIComponent(orderNumber)}`);
        const json = await res.json();
        if (json.success && json.order) {
          setOrderData(json.order);
          const dest = json.order.shippingAddress
            ? `${json.order.shippingAddress.city}, ${json.order.shippingAddress.state}`
            : undefined;
          const freshUrl = buildCustomerOrderWhatsAppUrl({
            storePhone,
            orderNumber,
            customerName: json.order.customerName,
            customerPhone: json.order.customerPhone || paramPhone,
            deliveryType: json.order.deliveryType,
            deliveryDestination: dest,
            items: json.order.items,
            totalKobo: json.order.totalKobo,
          });
          window.open(freshUrl, '_blank');
          return;
        }
      } catch {}
      window.open(whatsappUrl, '_blank');
    }
  };

  return (
    <div className="bg-sand-50 min-h-screen py-16 md:py-24">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        
        {/* Main Card */}
        <div className="bg-white p-8 md:p-12 rounded-lg border border-sand-200 shadow-sm text-center">
          
          {/* Animated Success Badge */}
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="inline-block px-3 py-1 bg-sand-100 rounded-full text-xs font-semibold uppercase tracking-widest text-stone-700 mb-3">
            Payment Verified & Confirmed
          </div>

          <h1 className="font-serif text-3xl md:text-4xl text-stone-900 mb-3 tracking-tight">
            Thank You for Your Order
          </h1>

          <p className="text-stone-600 text-sm mb-6 leading-relaxed">
            Your payment has settled securely via Paystack. Your pieces are now moving from our Aba cutting room and warehouse to garment inspection and packaging.
          </p>

          {/* Order Details Strip */}
          <div className="bg-sand-50 rounded-lg p-5 border border-sand-200/80 mb-8 text-left space-y-3">
            <div className="flex justify-between items-center text-xs pb-3 border-b border-sand-200">
              <span className="text-stone-500 uppercase tracking-wider font-semibold">Order Reference:</span>
              <span className="font-mono font-bold text-stone-900 text-sm">{orderNumber}</span>
            </div>

            <div className="flex justify-between items-center text-xs pb-3 border-b border-sand-200">
              <span className="text-stone-500 uppercase tracking-wider font-semibold">Payment Status:</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> Paid in Full (NGN)
              </span>
            </div>

            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500 uppercase tracking-wider font-semibold">Inspection & Packaging:</span>
              <span className="text-stone-700 font-medium">Underway in Aba, Nigeria</span>
            </div>

            {orderData?.items && orderData.items.length > 0 && (
              <div className="pt-3 border-t border-sand-200 space-y-2">
                <span className="text-stone-500 uppercase tracking-wider font-semibold text-[11px] block">Items in this Order:</span>
                <div className="divide-y divide-sand-200/60">
                  {orderData.items.map((it: any, idx: number) => (
                    <div key={idx} className="py-1.5 flex justify-between items-center text-xs">
                      <div>
                        <span className="font-medium text-stone-900">{it.productName}</span>
                        {it.colorName && <span className="text-stone-500 block text-[10px]">{it.colorName}</span>}
                      </div>
                      <span className="text-stone-700 font-mono">x{it.quantity} • {formatKoboToNaira(it.totalKobo)}</span>
                    </div>
                  ))}
                </div>
                {orderData.totalKobo && (
                  <div className="pt-2 border-t border-sand-200 flex justify-between items-center text-xs font-bold text-stone-900">
                    <span>Total Paid:</span>
                    <span className="text-oxblood font-serif text-sm">{formatKoboToNaira(orderData.totalKobo)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Logistics Guidance */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8 text-left">
            <div className="p-4 bg-sand-100/60 rounded border border-sand-200">
              <div className="flex items-center gap-2 font-semibold text-xs text-stone-900 mb-1">
                <Truck className="w-4 h-4 text-oxblood-700" /> Dispatch Waybill
              </div>
              <p className="text-[11px] text-stone-600 leading-normal">
                Once consigned with our courier partner, you will receive an SMS and Email with your live tracking number.
              </p>
            </div>

            <div className="p-4 bg-sand-100/60 rounded border border-sand-200">
              <div className="flex items-center gap-2 font-semibold text-xs text-stone-900 mb-1">
                <MapPin className="w-4 h-4 text-oxblood-700" /> Aba Showroom Pickups
              </div>
              <p className="text-[11px] text-stone-600 leading-normal">
                If you chose Aba boutique collection, please present your order confirmation SMS or this page at our showroom.
              </p>
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href={`/track-order`}
              className="w-full sm:w-auto px-6 py-3.5 bg-stone-900 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-oxblood-700 transition-colors flex items-center justify-center gap-2"
            >
              <Package className="w-4 h-4" />
              <span>Track Order Live</span>
            </Link>

            <a
              href={whatsappUrl}
              onClick={handleWhatsAppClick}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto px-6 py-3.5 bg-emerald-700 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-emerald-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Concierge</span>
            </a>
          </div>

          {/* Footer return link */}
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

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <div className="bg-sand-50 min-h-screen flex items-center justify-center">
        <div className="text-xs tracking-widest uppercase font-medium text-stone-500">Loading Order Confirmation...</div>
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}

