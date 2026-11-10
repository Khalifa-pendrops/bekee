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
  User,
  ShoppingBag
} from 'lucide-react';
import { formatKoboToNaira, parseNairaToKobo } from '@/lib/utils';
import { Product, PaymentMethod, OrderSource } from '@/types';

export default function RecordOfflineSalePage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Form Fields
  const [selectedProductId, setSelectedProductId] = useState('');
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash_in_store');
  const [orderSource, setOrderSource] = useState<OrderSource>('offline_aba_store');
  const [staffName, setStaffName] = useState('Store Owner');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Status
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successOrder, setSuccessOrder] = useState<any | null>(null);

  // Fetch products
  useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/admin/products');
        // If GET endpoint doesn't exist yet, we can fetch all products via client
        // Or we use a lightweight inline helper
      } catch (e) {}
    }
  }, []);

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
  const totalKobo = unitPriceKobo * quantity;

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

    if (currentVariant && currentVariant.stockQuantity < quantity) {
      setErrorMessage(
        `Insufficient physical stock. Available in Aba store: ${currentVariant.stockQuantity}, requested: ${quantity}`
      );
      return;
    }

    setIsSubmitting(true);

    try {
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
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record offline sale.');

      setSuccessOrder(data.order);
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
    setNotes('');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 w-full min-w-0">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-stone-200">
        <div>
          <Link
            href="/admin"
            className="inline-flex items-center text-xs font-semibold uppercase tracking-wider text-stone-500 hover:text-stone-900 transition-colors mb-1"
          >
            <ArrowLeft className="w-3.5 h-3.5 mr-1" /> Back to Dashboard
          </Link>
          <h1 className="font-serif text-2xl font-bold text-stone-900 flex items-center gap-2">
            <Zap className="w-5 h-5 text-amber-500" />
            Fast Offline POS (Aba Store & WhatsApp)
          </h1>
        </div>
      </div>

      {/* Success Receipt Modal Card */}
      {successOrder ? (
        <div className="bg-white p-8 rounded-xl border border-stone-200 shadow-sm text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h2 className="font-serif text-xl font-bold text-stone-900">
            Sale Recorded & Stock Deducted!
          </h2>

          <p className="text-xs text-stone-600">
            Order Reference: <strong className="font-mono text-stone-900">{successOrder.orderNumber}</strong>
          </p>

          <div className="bg-sand-50 p-4 rounded-lg text-left text-xs space-y-2 border border-sand-200">
            <div className="flex justify-between">
              <span className="text-stone-500">Item:</span>
              <span className="font-semibold text-stone-900">{successOrder.items[0]?.productName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Variant:</span>
              <span className="text-stone-900">{successOrder.items[0]?.colorName} • {successOrder.items[0]?.size}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Quantity Sold:</span>
              <span className="font-bold text-stone-900">{successOrder.items[0]?.quantity} unit(s)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Amount Collected:</span>
              <span className="font-bold text-oxblood-800 text-sm">{formatKoboToNaira(successOrder.totalKobo)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Payment Channel:</span>
              <span className="uppercase font-semibold text-stone-800">{successOrder.paymentMethod?.replace(/_/g, ' ')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Recorded By:</span>
              <span className="text-stone-900">{successOrder.recordedByStaffName}</span>
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={handleResetForNextSale}
              className="flex-1 py-3 bg-stone-900 hover:bg-oxblood-700 text-white text-xs font-bold uppercase tracking-wider rounded transition-colors"
            >
              + Record Next Sale
            </button>
            <Link
              href="/admin/stock"
              className="px-4 py-3 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded transition-colors"
            >
              Check Stock
            </Link>
          </div>
        </div>
      ) : (
        /* POS Entry Form */
        <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-stone-200 shadow-sm p-6 space-y-6">
          
          {errorMessage && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3.5 flex items-center gap-2.5 text-xs text-red-800">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* 1. Channel Selector: Walk-in vs WhatsApp */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Sale Channel:
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOrderSource('offline_aba_store')}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  orderSource === 'offline_aba_store'
                    ? 'border-stone-900 bg-sand-100/70 font-bold text-stone-900 ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Store className="w-4 h-4 text-oxblood-700" />
                <span className="text-xs">Aba Boutique Walk-in</span>
              </button>

              <button
                type="button"
                onClick={() => setOrderSource('whatsapp_order')}
                className={`p-3 rounded-lg border text-left flex items-center gap-2.5 transition-all ${
                  orderSource === 'whatsapp_order'
                    ? 'border-emerald-700 bg-emerald-50 font-bold text-emerald-950 ring-1 ring-emerald-700'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <MessageCircle className="w-4 h-4 text-emerald-600" />
                <span className="text-xs">WhatsApp Direct Order</span>
              </button>
            </div>
          </div>

          {/* 2. Product & Variant Picker */}
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Select Product:
              </label>
              <select
                value={selectedProductId}
                onChange={(e) => setSelectedProductId(e.target.value)}
                className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded font-medium text-stone-900 focus:outline-none focus:border-stone-900"
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
                    Colour & Size Variant:
                  </label>
                  <select
                    value={selectedVariantId}
                    onChange={(e) => setSelectedVariantId(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded font-medium text-stone-900 focus:outline-none focus:border-stone-900"
                  >
                    {currentProduct.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.colorName} • {v.size} ({v.stockQuantity} in stock)
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
                    className="w-full px-3.5 py-2.5 text-xs bg-sand-50 border border-stone-300 rounded font-bold text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>
            )}

            {/* Price Preview Card */}
            {currentVariant && (
              <div className="p-3.5 bg-sand-100 rounded-lg border border-sand-300 flex items-center justify-between text-xs">
                <div>
                  <div className="text-stone-500 font-mono text-[11px]">{currentVariant.sku}</div>
                  <div className="text-stone-900 font-medium">Unit Price: {formatKoboToNaira(unitPriceKobo)}</div>
                </div>
                <div className="text-right">
                  <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Total to Collect:</div>
                  <div className="font-serif text-base font-bold text-oxblood-800">{formatKoboToNaira(totalKobo)}</div>
                </div>
              </div>
            )}
          </div>

          {/* 3. Payment Method */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-2">
              Payment Method Received:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setPaymentMethod('cash_in_store')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentMethod === 'cash_in_store'
                    ? 'border-stone-900 bg-sand-100/70 font-bold text-stone-900 ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <DollarSign className="w-4 h-4 mx-auto mb-1 text-emerald-700" />
                <span className="text-[11px] block">Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('pos_terminal')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentMethod === 'pos_terminal'
                    ? 'border-stone-900 bg-sand-100/70 font-bold text-stone-900 ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <CreditCard className="w-4 h-4 mx-auto mb-1 text-oxblood-700" />
                <span className="text-[11px] block">Store POS</span>
              </button>

              <button
                type="button"
                onClick={() => setPaymentMethod('bank_transfer_offline')}
                className={`p-3 rounded-lg border text-center transition-all ${
                  paymentMethod === 'bank_transfer_offline'
                    ? 'border-stone-900 bg-sand-100/70 font-bold text-stone-900 ring-1 ring-stone-900'
                    : 'border-stone-200 bg-stone-50 text-stone-600 hover:bg-stone-100'
                }`}
              >
                <Building className="w-4 h-4 mx-auto mb-1 text-blue-700" />
                <span className="text-[11px] block">Bank Transfer</span>
              </button>
            </div>
          </div>

          {/* 4. Staff Name & Customer Info */}
          <div className="space-y-3 pt-2 border-t border-stone-200">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                Staff Member Recording Sale: <span className="text-oxblood-700">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Chinyere, Store Manager"
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                className="w-full px-3.5 py-2 text-xs bg-sand-50 border border-stone-300 rounded font-medium text-stone-900"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Customer Name <span className="text-stone-400 font-normal">(Optional)</span>:
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mrs. Obi"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-sand-50 border border-stone-300 rounded text-stone-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Phone (WhatsApp) <span className="text-stone-400 font-normal">(Optional)</span>:
                </label>
                <input
                  type="tel"
                  placeholder="0803..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 text-xs bg-sand-50 border border-stone-300 rounded text-stone-900"
                />
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting || !currentVariant}
            className="w-full py-3.5 bg-stone-900 hover:bg-oxblood-700 text-white text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Recording Sale...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-amber-400" />
                <span>Confirm Sale & Deduct Stock • {formatKoboToNaira(totalKobo)}</span>
              </>
            )}
          </button>

        </form>
      )}

    </div>
  );
}

