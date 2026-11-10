'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  Lock, 
  Truck, 
  Store, 
  Tag, 
  AlertCircle, 
  ArrowLeft, 
  Check, 
  HelpCircle,
  Clock,
  Sparkles
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatKoboToNaira, normalizeNigerianPhone } from '@/lib/utils';
import { DeliveryZone } from '@/types';

// Standard 36 Nigerian States + FCT
const NIGERIAN_STATES = [
  'Abia', 'Abuja FCT', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Gombe', 'Imo', 'Jigawa',
  'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara', 'Lagos', 'Nasarawa', 'Niger',
  'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers', 'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

export default function CheckoutPage() {
  const router = useRouter();
  const { items = [], subtotalKobo = 0, totalQuantity = 0, clearCart } = useCart();

  // Delivery Mode: 'delivery' | 'pickup' | 'quote'
  const [deliveryMode, setDeliveryMode] = useState<'delivery' | 'pickup' | 'quote'>('delivery');

  // Customer Form Fields
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [state, setState] = useState('Abia');
  const [city, setCity] = useState('');
  const [streetAddress, setStreetAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [deliveryInstructions, setDeliveryInstructions] = useState('');

  // Discount
  const [discountCodeInput, setDiscountCodeInput] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    discountKobo: number;
    description: string;
  } | null>(null);
  const [discountError, setDiscountError] = useState<string | null>(null);
  const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

  // Delivery calculation state
  const [matchedZone, setMatchedZone] = useState<DeliveryZone | null>(null);
  const [isCalculatingZone, setIsCalculatingZone] = useState(false);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // Dynamic Delivery Zone computation based on state and mode
  useEffect(() => {
    if (deliveryMode === 'pickup') {
      setMatchedZone({
        id: 'zone_aba_pickup',
        name: 'Aba Boutique Pickup',
        description: 'Collect in person from our Aba showroom. Zero dispatch fees.',
        estimatedDays: 'Same-day collection available',
        statesIncluded: ['Abia'],
        feeKobo: 0,
        isActive: true,
        priorityOrder: 0,
      });
      return;
    }

    if (deliveryMode === 'quote') {
      setMatchedZone(null);
      return;
    }

    // Match zone according to state
    const cleanState = state.trim().toLowerCase();
    
    if (cleanState === 'abia') {
      setMatchedZone({
        id: 'zone_aba_local',
        name: 'Aba Metropolis Dispatch',
        description: 'Direct dispatch rider within Aba metropolis.',
        estimatedDays: 'Same-day or next-day',
        statesIncluded: ['Abia'],
        feeKobo: 250000, // ₦2,500
        isActive: true,
        priorityOrder: 1,
      });
    } else if (['imo', 'enugu', 'anambra', 'ebonyi'].includes(cleanState)) {
      setMatchedZone({
        id: 'zone_south_east',
        name: 'South-East Interstate Express',
        description: 'Enugu, Owerri, Onitsha, Awka, Abakaliki via dedicated express logistics.',
        estimatedDays: '1 - 2 business days',
        statesIncluded: ['Imo', 'Enugu', 'Anambra', 'Ebonyi'],
        feeKobo: 400000, // ₦4,000
        isActive: true,
        priorityOrder: 2,
      });
    } else if (['lagos', 'rivers', 'abuja fct', 'abuja'].includes(cleanState)) {
      setMatchedZone({
        id: 'zone_lagos_ph_abuja',
        name: 'Lagos, PH & Abuja Air/Express Corridor',
        description: 'Priority courier transit to high-volume commercial capitals.',
        estimatedDays: '2 - 3 business days',
        statesIncluded: ['Lagos', 'Rivers', 'Abuja FCT'],
        feeKobo: 550000, // ₦5,500
        isActive: true,
        priorityOrder: 3,
      });
    } else {
      setMatchedZone({
        id: 'zone_nationwide',
        name: 'Nationwide Interstate Waybill',
        description: 'Interstate courier waybill across all other Nigerian states.',
        estimatedDays: '3 - 5 business days',
        statesIncluded: ['All other states'],
        feeKobo: 650000, // ₦6,500
        isActive: true,
        priorityOrder: 4,
      });
    }
  }, [state, deliveryMode]);

  // Financial Computations
  const deliveryFeeKobo = deliveryMode === 'quote' ? 0 : (matchedZone?.feeKobo || 0);
  const discountKobo = appliedDiscount ? appliedDiscount.discountKobo : 0;
  const totalKobo = Math.max(0, subtotalKobo + deliveryFeeKobo - discountKobo);

  // Apply Discount Code
  const handleApplyDiscount = async () => {
    if (!discountCodeInput.trim()) return;
    setIsApplyingDiscount(true);
    setDiscountError(null);

    const code = discountCodeInput.trim().toUpperCase();

    // Fast-path client validation for seeded codes
    if (code === 'ARUWELCOME') {
      if (subtotalKobo < 2000000) {
        setDiscountError('Order must be at least ₦20,000 to use ARUWELCOME.');
        setIsApplyingDiscount(false);
        return;
      }
      const disc = Math.round(subtotalKobo * 0.1);
      setAppliedDiscount({
        code: 'ARUWELCOME',
        discountKobo: disc,
        description: '10% Welcome Discount applied',
      });
    } else if (code === 'ABAGIRL') {
      if (subtotalKobo < 4000000) {
        setDiscountError('Order must be at least ₦40,000 to use ABAGIRL.');
        setIsApplyingDiscount(false);
        return;
      }
      setAppliedDiscount({
        code: 'ABAGIRL',
        discountKobo: 500000,
        description: '₦5,000 Aba Special discount applied',
      });
    } else if (code === 'VIP2026') {
      if (subtotalKobo < 5000000) {
        setDiscountError('Order must be at least ₦50,000 to use VIP2026.');
        setIsApplyingDiscount(false);
        return;
      }
      const disc = Math.round(subtotalKobo * 0.15);
      setAppliedDiscount({
        code: 'VIP2026',
        discountKobo: disc,
        description: '15% VIP Festive discount applied',
      });
    } else {
      setDiscountError('Invalid promotional code. Please check and try again.');
    }

    setIsApplyingDiscount(false);
  };

  // Submit Order or Quote
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);

    if (items.length === 0) {
      setCheckoutError('Your shopping bag is empty.');
      return;
    }

    if (!fullName.trim() || !email.trim() || !phone.trim()) {
      setCheckoutError('Please provide your complete name, email, and phone number.');
      return;
    }

    if (deliveryMode !== 'pickup' && (!city.trim() || !streetAddress.trim())) {
      setCheckoutError('Please provide your full delivery address and town/city.');
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Delivery Quote Request Mode
      if (deliveryMode === 'quote') {
        const quoteRes = await fetch('/api/checkout/quote', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            customerName: fullName,
            phone,
            email,
            state,
            city: city || 'Unspecified City',
            streetAddress: streetAddress || 'Unspecified Address',
            landmark,
            items: items.map((i) => ({
              productName: i.productName,
              variantSummary: `${i.colorName} • ${i.size}`,
              quantity: i.quantity,
              subtotalKobo: i.unitPriceKobo * i.quantity,
            })),
            subtotalKobo,
            ownerNotes: deliveryInstructions,
          }),
        });

        const quoteData = await quoteRes.json();
        if (!quoteRes.ok) throw new Error(quoteData.error || 'Failed to submit quote request.');

        clearCart();
        router.push(`/checkout/quote-success?quoteId=${encodeURIComponent(quoteData.quoteId)}`);
        return;
      }

      // 2. Direct Paystack Checkout Mode
      const initRes = await fetch('/api/checkout/initialize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
          customer: {
            fullName,
            email,
            phone,
            state: deliveryMode === 'pickup' ? 'Abia' : state,
            city: deliveryMode === 'pickup' ? 'Aba' : city,
            streetAddress: deliveryMode === 'pickup' ? 'Aba Boutique Showroom Pickup' : streetAddress,
            landmark,
            deliveryInstructions,
          },
          deliveryType: deliveryMode === 'pickup' ? 'aba_pickup' : 'dispatch_delivery',
          discountCode: appliedDiscount?.code,
        }),
      });

      const initData = await initRes.json();
      if (!initRes.ok) {
        throw new Error(initData.error || 'Unable to start payment checkout.');
      }

      // Redirect customer to Paystack authorization URL
      if (initData.authorizationUrl) {
        window.location.href = initData.authorizationUrl;
      } else {
        throw new Error('Payment gateway did not return an authorization URL.');
      }
    } catch (err: any) {
      console.error('[Checkout] Error:', err);
      setCheckoutError(err.message || 'An error occurred during checkout.');
      setIsSubmitting(false);
    }
  };

  // If bag is empty
  if (items.length === 0) {
    return (
      <div className="bg-sand-50 min-h-screen py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <div className="w-16 h-16 bg-sand-200 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-500">
            <Tag className="w-8 h-8" />
          </div>
          <h1 className="font-serif text-3xl text-stone-900 mb-3">Your Shopping Bag is Empty</h1>
          <p className="text-stone-600 text-sm mb-8">
            You haven't selected any items from ARUBEKEE COLLECTION yet. Explore our handcrafted ready-to-wear pieces and artisan accessories.
          </p>
          <Link
            href="/shop"
            className="inline-flex items-center justify-center px-8 py-3.5 bg-stone-900 text-white text-xs font-semibold tracking-widest uppercase hover:bg-oxblood-700 transition-colors rounded shadow-sm"
          >
            Explore the Collection
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-sand-50 min-h-screen py-10 md:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 mb-8 border-b border-sand-300 gap-4">
          <div>
            <Link
              href="/shop"
              className="inline-flex items-center text-xs tracking-widest uppercase font-medium text-stone-500 hover:text-stone-900 transition-colors mb-2"
            >
              <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Return to Bag / Shop
            </Link>
            <h1 className="font-serif text-2xl md:text-3xl text-stone-900 tracking-tight">
              Secure Checkout
            </h1>
          </div>
          
          <div className="inline-flex items-center gap-2 text-xs font-medium text-stone-600 bg-sand-200/80 px-3.5 py-1.5 rounded-full">
            <Lock className="w-3.5 h-3.5 text-oxblood-700" />
            256-Bit SSL Encrypted • Paystack CBN Regulated
          </div>
        </div>

        {/* 15-Minute Reservation Guarantee Notice */}
        <div className="bg-sand-100 border border-sand-300/80 rounded-lg p-4 mb-8 flex items-start gap-3">
          <Clock className="w-5 h-5 text-oxblood-700 shrink-0 mt-0.5" />
          <div className="text-xs text-stone-700 leading-relaxed">
            <strong className="text-stone-900 font-semibold">15-Minute Inventory Protection:</strong>{' '}
            Upon clicking "Proceed to Payment", your chosen sizes and colours are temporarily locked in our Aba warehouse for 15 minutes to guarantee nobody else purchases them while you complete your card or bank transfer.
          </div>
        </div>

        {/* Error Alert */}
        {checkoutError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-8 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-sm text-red-800 leading-normal">
              <strong>Checkout Alert:</strong> {checkoutError}
            </div>
          </div>
        )}

        {/* Main Grid: Form (Left) & Order Summary (Right) */}
        <form onSubmit={handleCheckoutSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 w-full max-w-full min-w-0">
          
          {/* LEFT COLUMN: Customer & Delivery Details */}
          <div className="lg:col-span-7 space-y-8 min-w-0">
            
            {/* 1. Contact Information */}
            <div className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
              <h2 className="font-serif text-lg text-stone-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans">1</span>
                Contact & Notification Details
              </h2>
              <p className="text-xs text-stone-500 mb-6 pl-8">
                We'll send your payment receipt, packing updates, and waybill tracking to these details.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                    Full Name <span className="text-oxblood-700">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Amaka Nwosu"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Email Address <span className="text-oxblood-700">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="amaka@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Phone Number (WhatsApp) <span className="text-oxblood-700">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="0803 123 4567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                    />
                    <span className="text-[10px] text-stone-400 mt-1 block">
                      Dispatches are notified via SMS/WhatsApp with rider contact.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Delivery Method Selection */}
            <div className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm">
              <h2 className="font-serif text-lg text-stone-900 mb-1 flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-stone-900 text-white text-xs flex items-center justify-center font-sans">2</span>
                Choose Fulfilment Mode
              </h2>
              <p className="text-xs text-stone-500 mb-6 pl-8">
                Select whether you are picking up in Aba or having items dispatched across Nigeria.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
                
                {/* Option 1: Doorstep Delivery */}
                <button
                  type="button"
                  onClick={() => setDeliveryMode('delivery')}
                  className={`p-4 rounded-lg border text-left transition-all relative ${
                    deliveryMode === 'delivery'
                      ? 'border-stone-900 bg-sand-100/70 ring-1 ring-stone-900'
                      : 'border-sand-300 bg-sand-50 hover:bg-sand-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Truck className="w-5 h-5 text-stone-800" />
                    {deliveryMode === 'delivery' && (
                      <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-xs text-stone-900 mb-0.5">Doorstep / Waybill</div>
                  <div className="text-[11px] text-stone-500">Standard rates per state</div>
                </button>

                {/* Option 2: Aba Boutique Pickup */}
                <button
                  type="button"
                  onClick={() => setDeliveryMode('pickup')}
                  className={`p-4 rounded-lg border text-left transition-all relative ${
                    deliveryMode === 'pickup'
                      ? 'border-stone-900 bg-sand-100/70 ring-1 ring-stone-900'
                      : 'border-sand-300 bg-sand-50 hover:bg-sand-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <Store className="w-5 h-5 text-stone-800" />
                    {deliveryMode === 'pickup' && (
                      <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-xs text-stone-900 mb-0.5">Aba Boutique Pickup</div>
                  <div className="text-[11px] text-emerald-700 font-semibold">FREE • Same-day</div>
                </button>

                {/* Option 3: Request Quote */}
                <button
                  type="button"
                  onClick={() => setDeliveryMode('quote')}
                  className={`p-4 rounded-lg border text-left transition-all relative ${
                    deliveryMode === 'quote'
                      ? 'border-stone-900 bg-sand-100/70 ring-1 ring-stone-900'
                      : 'border-sand-300 bg-sand-50 hover:bg-sand-100'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <HelpCircle className="w-5 h-5 text-stone-800" />
                    {deliveryMode === 'quote' && (
                      <span className="w-4 h-4 rounded-full bg-stone-900 text-white flex items-center justify-center">
                        <Check className="w-2.5 h-2.5" />
                      </span>
                    )}
                  </div>
                  <div className="font-medium text-xs text-stone-900 mb-0.5">Request Delivery Quote</div>
                  <div className="text-[11px] text-stone-500">Remote or bulk shipment</div>
                </button>

              </div>

              {/* Mode Details Section */}
              {deliveryMode === 'pickup' && (
                <div className="bg-sand-100 p-4 rounded-lg border border-sand-300 text-xs text-stone-700 space-y-2">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Store className="w-4 h-4 text-oxblood-700" /> Aba Boutique Collection Point:
                  </div>
                  <p>
                    <strong>ARUBEKEE COLLECTION Showroom:</strong> Ehi Road Fashion District, Aba, Abia State, Nigeria.
                  </p>
                  <p className="text-stone-500">
                    Open: Monday – Saturday (9:00 AM – 6:00 PM). Please present your Order Confirmation email or SMS at pickup.
                  </p>
                </div>
              )}

              {deliveryMode === 'quote' && (
                <div className="bg-sand-100 p-4 rounded-lg border border-sand-300 text-xs text-stone-700 space-y-2">
                  <div className="font-semibold text-stone-900 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-oxblood-700" /> Personalized Logistics Quote:
                  </div>
                  <p>
                    Outside standard transit routes or ordering bulk items? Submit your destination details below. Our Aba logistics desk will compute exact park waybill or special flight courier charges and send you an immediate secure checkout link.
                  </p>
                </div>
              )}

              {/* Address Form (Shown for Delivery or Quote) */}
              {deliveryMode !== 'pickup' && (
                <div className="space-y-4 pt-4 border-t border-sand-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        Destination State <span className="text-oxblood-700">*</span>
                      </label>
                      <select
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                      >
                        {NIGERIAN_STATES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                        City / Town / Area <span className="text-oxblood-700">*</span>
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. Ikeja, Port Harcourt, Owerri, Wuse 2"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Street Address <span className="text-oxblood-700">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 14 Okigwe Road, Flat 3B"
                      value={streetAddress}
                      onChange={(e) => setStreetAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Prominent Landmark <span className="text-stone-400 font-normal">(Crucial for Nigerian Riders)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Beside Zenith Bank, opposite Total Filling Station"
                      value={landmark}
                      onChange={(e) => setLandmark(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                      Special Delivery Instructions / Gate Code
                    </label>
                    <textarea
                      rows={2}
                      placeholder="e.g. Call my second number on arrival, leave with estate security"
                      value={deliveryInstructions}
                      onChange={(e) => setDeliveryInstructions(e.target.value)}
                      className="w-full px-3.5 py-2 text-sm bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                    />
                  </div>

                  {/* Matched Zone Feedback */}
                  {deliveryMode === 'delivery' && matchedZone && (
                    <div className="p-3 bg-sand-100 rounded border border-sand-300 flex items-center justify-between text-xs text-stone-800">
                      <div>
                        <div className="font-semibold text-stone-900">{matchedZone.name}</div>
                        <div className="text-stone-500 text-[11px]">{matchedZone.description} • {matchedZone.estimatedDays}</div>
                      </div>
                      <div className="font-semibold text-sm text-stone-900">
                        {formatKoboToNaira(matchedZone.feeKobo)}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT COLUMN: Order Summary & Payment Button */}
          <div className="lg:col-span-5 space-y-6 min-w-0">
            
            <div className="bg-white p-6 md:p-8 rounded-lg border border-sand-200 shadow-sm sticky top-24">
              <h2 className="font-serif text-lg text-stone-900 mb-4 pb-3 border-b border-sand-200">
                Order Summary ({totalQuantity} items)
              </h2>

              {/* Item List */}
              <div className="divide-y divide-sand-200 max-h-72 overflow-y-auto mb-6 pr-1">
                {items.map((item) => (
                  <div key={item.id} className="py-3 flex items-center gap-3">
                    <div className="relative w-14 h-16 rounded overflow-hidden bg-sand-100 shrink-0 border border-sand-200">
                      <Image
                        src={item.image}
                        alt={item.productName}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-medium text-stone-900 truncate">
                        {item.productName}
                      </h4>
                      <div className="text-[11px] text-stone-500">
                        {item.colorName} • {item.size} • Qty {item.quantity}
                      </div>
                      <div className="text-xs font-semibold text-stone-900 mt-0.5">
                        {formatKoboToNaira(item.unitPriceKobo * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Discount Code Input */}
              <div className="mb-6 pb-6 border-b border-sand-200">
                <label className="block text-xs font-semibold uppercase tracking-wider text-stone-700 mb-1.5">
                  Promotional Code
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. ARUWELCOME"
                    value={discountCodeInput}
                    onChange={(e) => setDiscountCodeInput(e.target.value.toUpperCase())}
                    className="flex-1 px-3 py-2 text-xs uppercase tracking-wider bg-sand-50 border border-sand-300 rounded focus:outline-none focus:border-stone-900 text-stone-900"
                  />
                  <button
                    type="button"
                    disabled={isApplyingDiscount || !discountCodeInput.trim()}
                    onClick={handleApplyDiscount}
                    className="px-4 py-2 bg-stone-900 text-white text-xs font-semibold uppercase tracking-wider rounded hover:bg-oxblood-700 disabled:opacity-50 transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {discountError && (
                  <p className="text-[11px] text-red-600 mt-1.5">{discountError}</p>
                )}
                {appliedDiscount && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> {appliedDiscount.description}
                  </p>
                )}
              </div>

              {/* Financial Breakdown */}
              <div className="space-y-2.5 text-xs text-stone-600 mb-6">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-900">{formatKoboToNaira(subtotalKobo)}</span>
                </div>

                <div className="flex justify-between">
                  <span>Fulfilment ({deliveryMode === 'pickup' ? 'Aba Pickup' : deliveryMode === 'quote' ? 'Quote Required' : 'Courier Transit'})</span>
                  <span className="font-medium text-stone-900">
                    {deliveryMode === 'quote' ? (
                      <span className="text-oxblood-700 font-normal">Quoted post-review</span>
                    ) : deliveryFeeKobo === 0 ? (
                      <span className="text-emerald-700 font-semibold">FREE</span>
                    ) : (
                      formatKoboToNaira(deliveryFeeKobo)
                    )}
                  </span>
                </div>

                {appliedDiscount && (
                  <div className="flex justify-between text-emerald-700 font-medium">
                    <span>Discount ({appliedDiscount.code})</span>
                    <span>- {formatKoboToNaira(appliedDiscount.discountKobo)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-sand-200 flex justify-between items-baseline text-sm font-semibold text-stone-900">
                  <span className="font-serif text-base">Grand Total (NGN)</span>
                  <span className="font-serif text-lg text-oxblood-800">
                    {deliveryMode === 'quote' ? formatKoboToNaira(subtotalKobo) : formatKoboToNaira(totalKobo)}
                  </span>
                </div>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3.5 px-4 bg-stone-900 text-white text-xs font-semibold tracking-widest uppercase rounded hover:bg-oxblood-700 transition-colors shadow-sm disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : deliveryMode === 'quote' ? (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Submit Delivery Quote Request</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Pay with Paystack • {formatKoboToNaira(totalKobo)}</span>
                  </>
                )}
              </button>

              {/* Payment Trust Badges */}
              <div className="mt-6 pt-4 border-t border-sand-200/80 text-center">
                <p className="text-[11px] text-stone-500 mb-2">Accepted Payment Channels:</p>
                <div className="flex items-center justify-center gap-2 text-stone-400 text-xs font-medium">
                  <span className="px-2 py-1 bg-sand-100 rounded border border-sand-300">Mastercard</span>
                  <span className="px-2 py-1 bg-sand-100 rounded border border-sand-300">Visa</span>
                  <span className="px-2 py-1 bg-sand-100 rounded border border-sand-300">Verve</span>
                  <span className="px-2 py-1 bg-sand-100 rounded border border-sand-300">Bank Transfer</span>
                  <span className="px-2 py-1 bg-sand-100 rounded border border-sand-300">USSD</span>
                </div>
                <div className="mt-3 flex items-center justify-center gap-1.5 text-[10px] text-stone-500">
                  <ShieldCheck className="w-3.5 h-3.5 text-oxblood-700" />
                  Your card data never touches our servers. 100% verified by Paystack.
                </div>
              </div>

            </div>

          </div>

        </form>

      </div>
    </div>
  );
}

