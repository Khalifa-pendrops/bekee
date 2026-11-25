'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Zap, 
  Store, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft,
  CreditCard,
  DollarSign,
  Building,
  Truck,
  Copy,
  Check,
  ExternalLink,
  FileText,
  Send,
  Sparkles
} from 'lucide-react';
import { formatKoboToNaira } from '@/lib/utils';
import { Product, PaymentMethod, OrderSource } from '@/types';

export default function RecordOfflineSalePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Mode: Instant Paid Sale vs WhatsApp Invoice
  const [saleMode, setSaleMode] = useState<'paid_sale' | 'whatsapp_invoice'>('whatsapp_invoice');

  // Form Fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank_transfer_offline');
  const [orderSource, setOrderSource] = useState<OrderSource>('whatsapp_order');
  const [staffName, setStaffName] = useState('Store Manager');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Delivery configuration
  const [deliveryType, setDeliveryType] = useState<'aba_pickup' | 'nationwide'>('nationwide');
  const [deliveryFeeNaira, setDeliveryFeeNaira] = useState(5000);
  const [streetAddress, setStreetAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('Lagos');
  const [landmark, setLandmark] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Copy feedback
  const [copiedInvoice, setCopiedInvoice] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Fetch all products on mount
  useEffect(() => {
    fetch('/api/products')
      .then((r) => r.json())
      .then((data) => {
        if (data && Array.isArray(data)) {
          setProducts(data);
          if (data.length > 0) {
            setSelectedProductId(data[0].id);
            if (data[0].variants?.length > 0) {
              setSelectedVariantId(data[0].variants[0].id);
            }
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoadingProducts(false));
  }, []);

  // Update selected variant when product changes
  const currentProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const currentVariant = currentProduct?.variants.find((v) => v.id === selectedVariantId) || currentProduct?.variants[0];

  useEffect(() => {
    if (currentProduct && currentProduct.variants.length > 0) {
      if (!currentProduct.variants.some((v) => v.id === selectedVariantId)) {
        setSelectedVariantId(currentProduct.variants[0].id);
      }
    }
  }, [selectedProductId, currentProduct, selectedVariantId]);

  const unitPriceKobo = currentVariant?.salePriceKobo || currentVariant?.priceKobo || 0;
  const itemsSubtotalKobo = unitPriceKobo * quantity;
  const deliveryFeeKobo = deliveryType === 'nationwide' ? deliveryFeeNaira * 100 : 0;
  const totalKobo = itemsSubtotalKobo + deliveryFeeKobo;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!selectedVariantId) {
      setErrorMessage('Please select a product variant.');
      return;
    }

    if (!staffName.trim()) {
      setErrorMessage('Please enter the name of the staff recording this sale.');
      return;
    }

    if (saleMode === 'whatsapp_invoice' && !customerPhone.trim()) {
      setErrorMessage('A customer WhatsApp phone number is required to send an invoice.');
      return;
    }

    if (currentVariant && currentVariant.stockQuantity < quantity) {
      setErrorMessage(
        `Insufficient physical stock. Available in Aba store: ${currentVariant.stockQuantity}, requested: ${quantity}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const isInvoice = saleMode === 'whatsapp_invoice';
      const shippingAddress = deliveryType === 'nationwide' ? {
        streetAddress: streetAddress.trim() || 'Pending address confirmation',
        city: city.trim() || 'Lagos',
        state: state.trim() || 'Lagos',
        landmark: landmark.trim() || undefined,
      } : undefined;

      const res = await fetch('/api/admin/offline-sale', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          variantId: selectedVariantId,
          quantity,
          unitPriceKobo,
          paymentMethod,
          staffName: staffName.trim(),
          orderSource,
          customerName: customerName.trim() || undefined,
          customerPhone: customerPhone.trim() || undefined,
          notes: notes.trim() || undefined,
          isInvoice,
          deliveryFeeKobo,
          deliveryType: deliveryType === 'nationwide' ? 'state_capital' : 'aba_pickup',
          shippingAddress,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record sale / invoice.');

      setSuccessOrder(data.order);
      if (typeof window !== 'undefined' && data.order) {
        window.dispatchEvent(new CustomEvent('arubekee:new-order', { detail: data.order }));
      }
    } catch (err: any) {
      console.error('[Offline Sale] Error:', err);
      setErrorMessage(err.message || 'Could not record sale.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetForNextSale = () => {
    setSuccessOrder(null);
    setQuantity(1);
    setCustomerName('');
    setCustomerPhone('');
    setStreetAddress('');
    setCity('');
    setLandmark('');
    setNotes('');
  };

  // Generate WhatsApp Message
  const getWhatsAppMessage = () => {
    if (!successOrder) return '';
    const item = successOrder.items[0];
    const isPending = successOrder.paymentStatus === 'pending';
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bekee.com';
    const cleanPhone = successOrder.customerPhone?.replace(/\D/g, '') || '';
    const trackLink = `${origin}/track-order?ref=${successOrder.orderNumber}&phone=${cleanPhone}`;

    if (isPending) {
      return `*ARUBEKEE COLLECTION • OFFICIAL INVOICE*

Dear ${successOrder.customerName || 'Valued Client'},
Thank you for your order with ARUBEKEE COLLECTION, Aba. Here is your official order invoice:

- *Invoice Ref:* ${successOrder.orderNumber}
- *Garment:* ${item?.productName}
- *Color:* ${item?.colorName}
- *Quantity:* ${item?.quantity} unit(s)
- *Garment Subtotal:* ${formatKoboToNaira(successOrder.subtotalKobo)}
${successOrder.deliveryFeeKobo > 0 ? `- *Express Delivery:* ${formatKoboToNaira(successOrder.deliveryFeeKobo)} (${successOrder.shippingAddress?.city || 'Nationwide'}, ${successOrder.shippingAddress?.state || ''})` : `- *Collection:* Free Aba Boutique Pickup`}
- *Total Due:* ${formatKoboToNaira(successOrder.totalKobo)}
${successOrder.shippingAddress?.streetAddress ? `- *Destination:* ${successOrder.shippingAddress.streetAddress}, ${successOrder.shippingAddress.city}, ${successOrder.shippingAddress.state}` : ''}

*PAYMENT OPTIONS:*
1. *Instant Online Card / Transfer Checkout:*
${trackLink}

2. *Direct Boutique Bank Transfer:*
Bank: Zenith Bank PLC
Account Name: ARUBEKEE COLLECTION ATELIER
Account Number: 1018938472

_Kindly reply here with your transfer slip or payment confirmation once completed. We box and dispatch your items immediately once settlement is confirmed._

- *Concierge:* +234 916 416 1091
- *Aba Boutique Showroom • Nationwide Express Dispatch*`;
    }

    // Receipt message for completed sale
    return `*ARUBEKEE COLLECTION • PAYMENT RECEIPT*

Dear ${successOrder.customerName || 'Valued Client'},
Thank you for your purchase with ARUBEKEE COLLECTION, Aba! Your payment has been received and confirmed.

- *Receipt Ref:* ${successOrder.orderNumber}
- *Item:* ${item?.productName} (${item?.colorName})
- *Quantity:* ${item?.quantity} unit(s)
- *Amount Paid:* ${formatKoboToNaira(successOrder.totalKobo)}
- *Payment Channel:* ${successOrder.paymentMethod?.replace(/_/g, ' ').toUpperCase()}
${successOrder.deliveryFeeKobo > 0 ? `- *Delivery Status:* In queue for courier dispatch to ${successOrder.shippingAddress?.city || 'your address'}` : `- *Fulfillment:* Handed over at Aba Boutique showroom`}

*TRACK LIVE DISPATCH:*
${trackLink}

Thank you for shopping our curated fashion collection!

With warmth,
*ARUBEKEE Boutique Team*
Aba, Abia State • +234 916 416 1091`;
  };

  const handleSendWhatsApp = () => {
    const text = getWhatsAppMessage();
    const phone = successOrder?.customerPhone?.replace(/\D/g, '') || '';
    const cleanPhone = phone.startsWith('0') ? '234' + phone.slice(1) : phone;
    const url = cleanPhone 
      ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`
      : `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  const handleCopyMessage = () => {
    const text = getWhatsAppMessage();
    navigator.clipboard.writeText(text);
    setCopiedInvoice(true);
    setTimeout(() => setCopiedInvoice(false), 2500);
  };

  const handleCopyTrackingLink = () => {
    if (!successOrder) return;
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://bekee.com';
    const cleanPhone = successOrder.customerPhone?.replace(/\D/g, '') || '';
    const link = `${origin}/track-order?ref=${successOrder.orderNumber}&phone=${cleanPhone}`;
    navigator.clipboard.writeText(link);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 w-full min-w-0">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-white/10">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-400 hover:text-white transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="font-serif text-2xl font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-400" />
            Fast Offline POS & WhatsApp Invoicing
          </h1>
          <p className="text-xs text-stone-400 mt-0.5">
            Issue official WhatsApp invoices, record walk-in store cash/POS sales, and reserve workshop inventory in 1 click.
          </p>
        </div>
      </div>

      {/* Success Modal / Action View */}
      {successOrder ? (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xl overflow-hidden text-stone-900 space-y-6 p-6 sm:p-8">
          
          <div className="text-center space-y-2">
            <div className={`w-14 h-14 ${successOrder.paymentStatus === 'pending' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'} rounded-full flex items-center justify-center mx-auto shadow-sm`}>
              {successOrder.paymentStatus === 'pending' ? (
                <FileText className="w-7 h-7" />
              ) : (
                <CheckCircle2 className="w-7 h-7" />
              )}
            </div>

            <h2 className="font-serif text-2xl font-bold">
              {successOrder.paymentStatus === 'pending' ? 'WhatsApp Invoice Issued & Stock Reserved!' : 'Sale Recorded & Stock Deducted!'}
            </h2>

            <p className="text-xs text-stone-500">
              Reference: <strong className="font-mono text-stone-900 text-sm bg-sand-100 px-2.5 py-0.5 rounded border border-sand-300">{successOrder.orderNumber}</strong>
            </p>
          </div>

          {/* WhatsApp Direct Action Bar */}
          <div className="bg-emerald-50 border-2 border-emerald-300/80 rounded-xl p-4 sm:p-5 text-center space-y-3">
            <div className="flex items-center justify-center gap-2 text-emerald-950 font-bold text-sm">
              <MessageCircle className="w-5 h-5 text-emerald-600 fill-emerald-100" />
              <span>Direct WhatsApp Dispatch Ready</span>
            </div>
            <p className="text-xs text-emerald-800 max-w-md mx-auto">
              Send the official formatted invoice and payment links directly to {successOrder.customerName || 'the customer'} on WhatsApp with 1 tap.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={handleSendWhatsApp}
                className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-emerald-900/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Open in WhatsApp</span>
              </button>

              <button
                type="button"
                onClick={handleCopyMessage}
                className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-emerald-100/60 text-emerald-950 font-semibold text-xs border border-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedInvoice ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
                <span>{copiedInvoice ? 'Invoice Copied!' : 'Copy Invoice Text'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyTrackingLink}
                className="w-full sm:w-auto px-4 py-3 bg-white hover:bg-emerald-100/60 text-emerald-950 font-semibold text-xs border border-emerald-300 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <ExternalLink className="w-4 h-4 text-emerald-700" />}
                <span>{copiedLink ? 'Link Copied!' : 'Copy Payment Link'}</span>
              </button>
            </div>
          </div>

          {/* Itemized Order Breakdown */}
          <div className="bg-sand-50 p-4 rounded-xl border border-sand-200 text-xs space-y-2.5">
            <div className="flex justify-between items-center pb-2 border-b border-sand-200">
              <span className="font-semibold text-stone-700">Garment Item:</span>
              <span className="font-bold text-stone-900">{successOrder.items[0]?.productName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Variant:</span>
              <span className="text-stone-900">{successOrder.items[0]?.colorName}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Quantity:</span>
              <span className="font-bold text-stone-900">{successOrder.items[0]?.quantity} unit(s)</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Items Subtotal:</span>
              <span className="text-stone-900 font-medium">{formatKoboToNaira(successOrder.subtotalKobo)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-stone-500">Delivery Fee:</span>
              <span className="text-stone-900 font-medium">{successOrder.deliveryFeeKobo > 0 ? formatKoboToNaira(successOrder.deliveryFeeKobo) : 'Free Aba Pickup'}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-sand-200 text-sm font-bold text-stone-900">
              <span>Total Amount:</span>
              <span className="text-oxblood-800 font-serif text-base">{formatKoboToNaira(successOrder.totalKobo)}</span>
            </div>
            <div className="flex justify-between items-center pt-1 text-[11px] text-stone-500">
              <span>Status:</span>
              <span className={`px-2 py-0.5 rounded font-bold uppercase ${successOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                {successOrder.paymentStatus === 'paid' ? 'Paid & Settled' : 'Awaiting Payment'}
              </span>
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={handleResetForNextSale}
              className="flex-1 py-3 bg-stone-900 hover:bg-oxblood-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-colors text-center"
            >
              + Create Another Invoice / Sale
            </button>
            <Link
              href={`/admin/orders/${successOrder.id}`}
              className="px-5 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-colors text-center"
            >
              View Full Order Details →
            </Link>
          </div>
        </div>
      ) : (
        /* POS & Invoicing Entry Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-stone-200 shadow-xl p-6 sm:p-8 space-y-6 text-stone-900">
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Transaction Mode Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-600 mb-2">
              Transaction Mode:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => {
                  setSaleMode('whatsapp_invoice');
                  setOrderSource('whatsapp_order');
                  setPaymentMethod('bank_transfer_offline');
                }}
                className={`p-4 rounded-xl border text-left transition-all relative ${
                  saleMode === 'whatsapp_invoice'
                    ? 'border-emerald-600 bg-emerald-50/70 ring-2 ring-emerald-600/30 shadow-sm'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-emerald-950 mb-1">
                  <MessageCircle className="w-4 h-4 text-emerald-600" />
                  <span>Issue WhatsApp Invoice</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-normal">
                  For WhatsApp or phone inquiries. Generates an invoice with live Paystack link & boutique bank transfer details, reserving workshop stock.
                </p>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSaleMode('paid_sale');
                  setOrderSource('offline_aba_store');
                  setPaymentMethod('cash_in_store');
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  saleMode === 'paid_sale'
                    ? 'border-stone-900 bg-sand-100/80 ring-2 ring-stone-900/30 shadow-sm'
                    : 'border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600'
                }`}
              >
                <div className="flex items-center gap-2 font-bold text-xs text-stone-900 mb-1">
                  <Store className="w-4 h-4 text-oxblood-700" />
                  <span>Instant Paid Sale (Walk-in / POS)</span>
                </div>
                <p className="text-[11px] text-stone-600 leading-normal">
                  For walk-in customers at our Aba boutique showroom or clients who already transferred cash to POS terminal. Deducts inventory immediately.
                </p>
              </button>
            </div>
          </div>

          {/* 2. Garment & Variant Picker */}
          <div className="space-y-4 pt-1 border-t border-stone-100">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Select Product:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:border-oxblood-700"
              >
                {products.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.categorySlug})
                  </option>
                ))}
              </select>
            </div>

            {currentProduct && currentProduct.variants.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Colour Variant:
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded-xl font-medium text-stone-900 focus:outline-none focus:border-oxblood-700"
                  >
                    {currentProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.colorName} ({v.stockQuantity} available in Aba)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Quantity:
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={currentVariant?.stockQuantity || 1}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded-xl font-bold text-stone-900 focus:outline-none focus:border-oxblood-700"
                  />
                </div>
              </div>
            )}
          </div>

          {/* 3. Delivery & Destination Settings */}
          <div className="space-y-4 pt-2 border-t border-stone-100">
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1">
              Fulfillment & Destination:
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setDeliveryType('nationwide')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  deliveryType === 'nationwide'
                    ? 'border-oxblood-700 bg-rose-50/50 font-bold text-oxblood-950 ring-1 ring-oxblood-700'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Truck className="w-4 h-4 text-oxblood-700" />
                <span className="text-xs">Nationwide Delivery</span>
              </button>

              <button
                type="button"
                onClick={() => setDeliveryType('aba_pickup')}
                className={`p-3 rounded-xl border text-left flex items-center gap-2.5 transition-all ${
                  deliveryType === 'aba_pickup'
                    ? 'border-stone-900 bg-sand-100 font-bold text-stone-900 ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Store className="w-4 h-4 text-stone-800" />
                <span className="text-xs">Aba Boutique Pickup (Free)</span>
              </button>
            </div>

            {deliveryType === 'nationwide' && (
              <div className="p-4 bg-sand-50 rounded-xl border border-sand-200 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Delivery Fee (NGN):
                    </label>
                    <select
                      value={deliveryFeeNaira}
                      onChange={(e) => setDeliveryFeeNaira(parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg font-bold text-stone-900"
                    >
                      <option value={3500}>₦3,500 - South East (Enugu, Owerri, Umuahia, Onitsha)</option>
                      <option value={5000}>₦5,000 - Lagos / Abuja / Port Harcourt Express</option>
                      <option value={7000}>₦7,000 - Interstate / Remote Towns</option>
                      <option value={0}>₦0 - Free Shipping Promo</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Destination State:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Lagos, Abuja, Rivers, Enugu"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Street Address / Area:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 14 Admiralty Way, Lekki Phase 1"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold uppercase tracking-wider text-stone-700 mb-1">
                      Nearest Landmark / Bus stop:
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Near Ebeano Supermarket"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-stone-900"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 4. Customer Information (WhatsApp) */}
          <div className="space-y-3 pt-2 border-t border-stone-100">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Customer Name:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Somtochukwu Obi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded-xl text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  WhatsApp Phone Number: <span className="text-oxblood-700">*</span>
                </label>
                <input
                  type="tel"
                  required={saleMode === 'whatsapp_invoice'}
                  placeholder="e.g. 0803 123 4567 or 234803..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded-xl font-medium text-stone-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Staff Recording / Issuing:
              </label>
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-sand-50 border border-stone-300 rounded-xl font-medium text-stone-900"
              />
            </div>
          </div>

          {/* 5. Live Calculation Breakdown */}
          <div className="p-4 bg-sand-100/80 rounded-xl border border-sand-300 space-y-2 text-xs">
            <div className="flex justify-between text-stone-600">
              <span>Garment Unit Price:</span>
              <span>{formatKoboToNaira(unitPriceKobo)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Items Subtotal ({quantity} unit{quantity > 1 ? 's' : ''}):</span>
              <span>{formatKoboToNaira(itemsSubtotalKobo)}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Delivery Fee:</span>
              <span>{deliveryFeeKobo > 0 ? formatKoboToNaira(deliveryFeeKobo) : 'Free Pickup'}</span>
            </div>
            <div className="pt-2 border-t border-sand-300 flex justify-between font-bold text-sm text-stone-900">
              <span>Total Invoice Amount:</span>
              <span className="font-serif text-base text-oxblood-800">{formatKoboToNaira(totalKobo)}</span>
            </div>
          </div>

          {/* Submit Action */}
          <button
            type="submit"
            disabled={isSubmitting || !currentVariant}
            className={`w-full py-3.5 text-white text-xs font-bold uppercase tracking-widest rounded-xl transition-all flex items-center justify-center gap-2 shadow-md disabled:opacity-50 ${
              saleMode === 'whatsapp_invoice'
                ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-950/20'
                : 'bg-stone-900 hover:bg-oxblood-700 shadow-stone-950/30'
            }`}
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Generating Invoice & Reserving Stock...</span>
              </>
            ) : saleMode === 'whatsapp_invoice' ? (
              <>
                <MessageCircle className="w-4 h-4" />
                <span>Generate WhatsApp Invoice & Reserve Stock • {formatKoboToNaira(totalKobo)}</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Confirm Paid Sale & Deduct Stock • {formatKoboToNaira(totalKobo)}</span>
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );
}
