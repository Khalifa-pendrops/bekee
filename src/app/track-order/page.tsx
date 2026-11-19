'use client';

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { Order } from "@/types";
import { formatKoboToNaira } from "@/lib/utils";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { 
  Package, 
  Search, 
  Truck, 
  MapPin, 
  CheckCircle2, 
  Clock, 
  ExternalLink,
  AlertCircle,
  CreditCard,
  Copy,
  Check,
  MessageCircle,
  ShieldCheck,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { 
  getSavedOrders, 
  saveOrderToHistory, 
  removeOrderFromHistory, 
  clearOrderHistory, 
  TrackedOrderRecord 
} from "@/lib/orderStorage";

function TrackOrderContent() {
  const searchParams = useSearchParams();
  const initialRef = searchParams.get('ref') || '';
  const initialPhone = searchParams.get('phone') || '';

  const [orderNumber, setOrderNumber] = useState(initialRef);
  const [phoneNumber, setPhoneNumber] = useState(initialPhone);
  const [savedOrders, setSavedOrders] = useState<TrackedOrderRecord[]>([]);
  const [isAutoFilled, setIsAutoFilled] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [isConfirmingDelivery, setIsConfirmingDelivery] = useState(false);
  const [deliveryConfirmedMessage, setDeliveryConfirmedMessage] = useState("");

  const carouselRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const checkScrollButtons = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 4);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 4);
    }
  };

  useEffect(() => {
    const t = setTimeout(checkScrollButtons, 120);
    const el = carouselRef.current;
    if (el) {
      el.addEventListener('scroll', checkScrollButtons, { passive: true });
      window.addEventListener('resize', checkScrollButtons);
      return () => {
        clearTimeout(t);
        el.removeEventListener('scroll', checkScrollButtons);
        window.removeEventListener('resize', checkScrollButtons);
      };
    }
    return () => clearTimeout(t);
  }, [savedOrders]);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const offset = direction === 'left' ? -220 : 220;
      carouselRef.current.scrollBy({ left: offset, behavior: 'smooth' });
      setTimeout(checkScrollButtons, 350);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return;
    isDraggingRef.current = true;
    hasDraggedRef.current = false;
    startXRef.current = e.pageX - carouselRef.current.offsetLeft;
    scrollLeftRef.current = carouselRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || !carouselRef.current) return;
    const x = e.pageX - carouselRef.current.offsetLeft;
    const walk = x - startXRef.current;
    if (Math.abs(walk) > 5) {
      hasDraggedRef.current = true;
    }
    carouselRef.current.scrollLeft = scrollLeftRef.current - walk;
    checkScrollButtons();
  };

  const handleMouseUpOrLeave = () => {
    isDraggingRef.current = false;
    setTimeout(() => {
      hasDraggedRef.current = false;
    }, 60);
  };

  // Load saved order history or auto-discover customer's active orders from server
  useEffect(() => {
    let isMounted = true;

    async function initializeTracker() {
      const list = getSavedOrders();
      setSavedOrders(list);

      let refToUse = initialRef;
      let phoneToUse = initialPhone;

      // 1. Check local storage single keys if not already provided via search params
      if (!refToUse && typeof window !== 'undefined') {
        const storedRef = localStorage.getItem('arubekee_last_order_ref');
        if (storedRef) refToUse = storedRef;
      }
      if (!phoneToUse && typeof window !== 'undefined') {
        const storedPhone = localStorage.getItem('arubekee_last_customer_phone');
        if (storedPhone) phoneToUse = storedPhone;
      }

      // 2. Check saved orders list
      if (!refToUse && list.length > 0) {
        refToUse = list[0].orderNumber;
      }
      if (!phoneToUse && list.length > 0 && list[0].phone) {
        phoneToUse = list[0].phone;
      }

      // Immediately sync state with whatever we found locally so fields are populated
      if (refToUse) setOrderNumber(refToUse);
      if (phoneToUse) setPhoneNumber(phoneToUse);

      // 3. If either ref or phone is missing, discover from server API (cookies or latest active order)
      if (!refToUse || !phoneToUse) {
        try {
          const params = new URLSearchParams();
          if (phoneToUse) params.set('phone', phoneToUse);
          if (refToUse) params.set('ref', refToUse);

          const res = await fetch(`/api/orders/track?${params.toString()}`);
          const data = await res.json();
          if (isMounted && data.success && data.latestOrder) {
            if (!refToUse && data.latestOrder.orderNumber) {
              refToUse = data.latestOrder.orderNumber;
              setOrderNumber(refToUse);
            }
            if (!phoneToUse && data.latestOrder.phone) {
              phoneToUse = data.latestOrder.phone;
              setPhoneNumber(phoneToUse);
            }
            setIsAutoFilled(true);

            // Register active orders (strictly omitting delivered orders)
            if (data.latestOrder.fulfillmentStatus !== 'delivered') {
              saveOrderToHistory(
                data.latestOrder.orderNumber, 
                data.latestOrder.phone || phoneToUse, 
                undefined, 
                data.latestOrder.fulfillmentStatus
              );
            }
            if (Array.isArray(data.activeOrders)) {
              data.activeOrders.forEach((act: any) => {
                if (act.fulfillmentStatus !== 'delivered') {
                  saveOrderToHistory(act.orderNumber, act.phone || phoneToUse, act.totalKobo, act.fulfillmentStatus);
                }
              });
            }
            setSavedOrders(getSavedOrders());
          }
        } catch (e) {
          console.error('[TrackOrder] Auto-discovery error:', e);
        }
      }

      if (refToUse) {
        setIsAutoFilled(true);
      }

      // 4. If we have both fields, execute tracking immediately without requiring manual submit
      if (refToUse && refToUse.trim() && phoneToUse && phoneToUse.trim()) {
        fetchTrackOrder(refToUse.trim(), phoneToUse.trim());
      }
    }

    initializeTracker();

    return () => {
      isMounted = false;
    };
  }, [initialRef, initialPhone]);

  const handleOrderNumberChange = (value: string) => {
    setOrderNumber(value);
    if (typeof window !== 'undefined' && value.trim()) {
      localStorage.setItem('arubekee_last_order_ref', value.trim());
    }
  };

  const handlePhoneNumberChange = (value: string) => {
    setPhoneNumber(value);
    if (typeof window !== 'undefined' && value.trim()) {
      localStorage.setItem('arubekee_last_customer_phone', value.trim());
    }
  };

  const handleSelectSavedOrder = (entry: TrackedOrderRecord) => {
    setOrderNumber(entry.orderNumber);
    if (entry.phone) {
      setPhoneNumber(entry.phone);
    }
    setErrorMessage("");
    fetchTrackOrder(entry.orderNumber, entry.phone || phoneNumber);
  };

  const handleRemoveOrder = (ref: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const updated = removeOrderFromHistory(ref);
    setSavedOrders(updated);
    if (orderNumber.toUpperCase() === ref.toUpperCase()) {
      if (updated.length > 0) {
        setOrderNumber(updated[0].orderNumber);
        if (updated[0].phone) setPhoneNumber(updated[0].phone);
        fetchTrackOrder(updated[0].orderNumber, updated[0].phone || phoneNumber);
      } else {
        setOrderNumber('');
        setOrder(null);
        setIsAutoFilled(false);
      }
    }
  };

  const handleClearAllSaved = () => {
    clearOrderHistory();
    setSavedOrders([]);
    setOrderNumber('');
    setPhoneNumber('');
    setOrder(null);
    setIsAutoFilled(false);
  };

  const fetchTrackOrder = async (queryRef: string, queryPhone: string) => {
    if (!queryRef.trim()) {
      setErrorMessage("Please enter your Order Reference (e.g. ARUBEKEE-...)");
      return;
    }
    if (!queryPhone.trim()) {
      setErrorMessage("Please enter your registered phone number or email for security verification.");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");
    setHasSearched(true);

    try {
      const res = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: queryRef.trim(),
          phone: queryPhone.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.error || "No order found with that reference. Please check your SMS or email confirmation.");
        setIsLoading(false);
        return;
      }

      setOrder(data.order);

      // Save currently tracked order with its live fulfillment status
      saveOrderToHistory(
        queryRef.trim(), 
        queryPhone.trim(), 
        data.order?.totalKobo, 
        data.order?.fulfillmentStatus
      );

      // Register all other active undelivered orders for this customer
      if (Array.isArray(data.activeOrders)) {
        data.activeOrders.forEach((act: any) => {
          if (act.fulfillmentStatus !== 'delivered') {
            saveOrderToHistory(act.orderNumber, act.phone || queryPhone.trim(), act.totalKobo, act.fulfillmentStatus);
          }
        });
      }

      // Filtered to active undelivered orders only
      const updatedList = getSavedOrders();
      setSavedOrders(updatedList);
      setIsAutoFilled(true);
    } catch (err) {
      setErrorMessage("Unable to retrieve order details right now. Please try again or chat with us on WhatsApp.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTrackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    fetchTrackOrder(orderNumber, phoneNumber);
  };

  const copyBankDetails = () => {
    navigator.clipboard.writeText("1018938472");
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2500);
  };

  const boutiqueWhatsApp = "2349164161091";

  const handleConfirmDelivery = async () => {
    if (!order) return;
    const phoneToVerify = phoneNumber || order.customerPhone;
    if (!phoneToVerify) {
      setErrorMessage("Please enter your phone number to verify and confirm delivery.");
      return;
    }

    setIsConfirmingDelivery(true);
    setErrorMessage("");

    try {
      const res = await fetch('/api/orders/confirm-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderNumber: order.orderNumber,
          phone: phoneToVerify,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to confirm delivery.');
      }

      if (data.order) {
        setOrder(data.order);
        setDeliveryConfirmedMessage(data.message || 'Delivery confirmed! Thank you for letting our Aba workshop know your parcel arrived safely.');
        // Update browser saved history to mark as delivered
        saveOrderToHistory(data.order.orderNumber, phoneToVerify, data.order.totalKobo, 'delivered');
        setSavedOrders(getSavedOrders());
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred while confirming delivery.');
    } finally {
      setIsConfirmingDelivery(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-16 space-y-10">
      {/* Page Header */}
      <div className="text-center space-y-2 max-w-xl mx-auto">
        <span className="text-xs uppercase tracking-widest font-semibold text-oxblood">
          Live Dispatch &amp; Order Tracking
        </span>
        <h1 className="editorial-heading text-3xl sm:text-4xl text-obsidian font-normal">
          Track Your Fashion Parcel
        </h1>
        <p className="text-xs sm:text-sm text-obsidian-muted leading-relaxed">
          Check live dispatch, courier waybill number, and fulfillment status for your ARUBEKEE order or invoice.
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-ivory border border-stone-line p-6 sm:p-8 shadow-card max-w-xl mx-auto relative">
        {/* Multi-Order History Switcher */}
        {savedOrders.length > 0 && (
          <div className="mb-5 pb-4 border-b border-stone-line space-y-2.5">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-obsidian uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Package className="w-3.5 h-3.5 text-oxblood" />
                <span>Your Active Orders ({savedOrders.length})</span>
              </span>

              <div className="flex items-center gap-2">
                {(canScrollLeft || canScrollRight || savedOrders.length >= 2) && (
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollCarousel('left')}
                      disabled={!canScrollLeft}
                      className={`p-1 rounded-full border transition-all ${
                        canScrollLeft
                          ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100 hover:border-stone-900 shadow-xs active:scale-95'
                          : 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed opacity-40'
                      }`}
                      title="Scroll backward"
                      aria-label="Scroll backward"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollCarousel('right')}
                      disabled={!canScrollRight}
                      className={`p-1 rounded-full border transition-all ${
                        canScrollRight
                          ? 'bg-white border-stone-300 text-stone-800 hover:bg-stone-100 hover:border-stone-900 shadow-xs active:scale-95'
                          : 'bg-stone-50 border-stone-200 text-stone-300 cursor-not-allowed opacity-40'
                      }`}
                      title="Scroll forward"
                      aria-label="Scroll forward"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleClearAllSaved}
                  className="text-[10px] text-stone-400 hover:text-stone-700 underline ml-1"
                >
                  Clear History
                </button>
              </div>
            </div>

            {/* Scrollable Track */}
            <div className="relative group">
              {canScrollLeft && (
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-ivory via-ivory/80 to-transparent z-10 pointer-events-none" />
              )}

              <div
                ref={carouselRef}
                onScroll={checkScrollButtons}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUpOrLeave}
                onMouseLeave={handleMouseUpOrLeave}
                className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scroll-smooth no-scrollbar snap-x touch-pan-x cursor-grab active:cursor-grabbing select-none"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch',
                }}
              >
                {savedOrders.map((item, index) => {
                  const isSelected = orderNumber.toUpperCase() === item.orderNumber.toUpperCase();
                  return (
                    <button
                      key={item.orderNumber}
                      type="button"
                      onClick={() => {
                        if (hasDraggedRef.current) return;
                        handleSelectSavedOrder(item);
                      }}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-medium border flex items-center gap-2 transition-all shrink-0 snap-start select-none ${
                        isSelected
                          ? 'bg-oxblood text-white border-oxblood shadow-xs font-semibold ring-2 ring-oxblood/20'
                          : 'bg-white border-stone-300 text-stone-700 hover:border-stone-900 hover:bg-stone-50 shadow-2xs'
                      }`}
                    >
                      <span className="font-mono">{item.orderNumber}</span>
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-sans ${
                        isSelected ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {index === 0 ? 'Latest' : (item.fulfillmentStatus ? item.fulfillmentStatus.replace(/_/g, ' ') : item.date)}
                      </span>
                      <span
                        onMouseDown={(e) => e.stopPropagation()}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveOrder(item.orderNumber, e);
                        }}
                        className={`ml-0.5 rounded-full p-0.5 transition-colors ${
                          isSelected ? 'text-white/70 hover:text-white hover:bg-white/20' : 'text-stone-400 hover:text-red-600 hover:bg-red-50'
                        }`}
                        title="Remove from history"
                      >
                        <X className="w-3 h-3" />
                      </span>
                    </button>
                  );
                })}
              </div>

              {canScrollRight && (
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ivory via-ivory/80 to-transparent z-10 pointer-events-none" />
              )}
            </div>
          </div>
        )}

        <form onSubmit={handleTrackSubmit} className="space-y-4">
          <Input
            label="Order / Invoice Reference"
            placeholder="e.g. ARUBEKEE-2611-9481 or ARUBEKEE-INV-..."
            value={orderNumber}
            onChange={(e) => handleOrderNumberChange(e.target.value)}
            required
          />

          <Input
            label="Registered Phone Number or Email"
            placeholder="e.g. 0803 123 4567 or customer@email.com"
            value={phoneNumber}
            onChange={(e) => handlePhoneNumberChange(e.target.value)}
            required
            hint="Recipient verification (matches order checkout phone/email)"
          />

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isLoading}
            className="w-full uppercase tracking-wider text-xs"
          >
            Track Order / View Invoice
          </Button>

          {errorMessage && (
            <div className="p-3 bg-status-dangerBg border border-status-danger/20 text-status-danger text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}
        </form>
      </div>

      {/* Order Results Display */}
      {order && (
        <div className="bg-ivory border border-stone-line shadow-card p-6 sm:p-8 space-y-8 animate-fade-in text-left">
          {/* Order Header Summary */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-line pb-6">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-oxblood">
                {order.orderNumber.includes('INV') ? 'Pro-Forma Invoice' : 'Order Status'}
              </span>
              <h2 className="font-serif text-2xl text-obsidian mt-0.5">
                {order.orderNumber}
              </h2>
              <p className="text-xs text-obsidian-muted mt-0.5">
                Issued on {new Date(order.createdAt).toLocaleDateString('en-NG', { dateStyle: 'long' })}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge
                variant={order.paymentStatus === 'paid' ? 'success' : order.paymentStatus === 'pending' ? 'warning' : 'default'}
              >
                Payment: {order.paymentStatus.replace(/_/g, ' ')}
              </Badge>

              <Badge
                variant={order.fulfillmentStatus === 'delivered' ? 'success' : order.fulfillmentStatus === 'dispatched' ? 'info' : 'default'}
              >
                Fulfillment: {order.fulfillmentStatus.replace(/_/g, ' ')}
              </Badge>
            </div>
          </div>

          {/* Live Delivery Confirmation Card (For Dispatched or Ready for Pickup orders) */}
          {(order.fulfillmentStatus === 'dispatched' || order.fulfillmentStatus === 'ready_for_pickup') && (
            <div className="bg-emerald-50/90 border-2 border-emerald-400 p-5 sm:p-6 space-y-3 rounded-sm shadow-xs animate-fade-in">
              <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                <Package className="w-5 h-5 text-emerald-700 shrink-0" />
                <span>Have you received your package?</span>
              </div>
              <p className="text-xs text-emerald-800 leading-relaxed">
                {order.deliveryType === 'aba_pickup'
                  ? "If you have collected your pieces from our Aba showroom, tap below to confirm collection."
                  : "If your courier has handed over your parcel, tap below to confirm delivery. This immediately updates your order and notifies our Aba atelier that your pieces arrived safely."}
              </p>

              {deliveryConfirmedMessage && (
                <div className="p-3 bg-emerald-100 text-emerald-900 text-xs font-semibold rounded flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{deliveryConfirmedMessage}</span>
                </div>
              )}

              <div className="pt-1">
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  isLoading={isConfirmingDelivery}
                  onClick={handleConfirmDelivery}
                  className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs uppercase tracking-wider gap-2 shadow-xs"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isConfirmingDelivery ? "Confirming Receipt..." : "Yes, I Have Received My Order"}</span>
                </Button>
              </div>
            </div>
          )}

          {/* Delivered Celebration Card */}
          {order.fulfillmentStatus === 'delivered' && (
            <div className="bg-emerald-50/70 border border-emerald-300/80 p-4 sm:p-5 rounded-sm flex items-start sm:items-center gap-3 text-emerald-900 text-xs animate-fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
              <div>
                <span className="font-bold text-sm block text-emerald-950">Parcel Delivered &amp; Received</span>
                <span className="text-emerald-800">
                  {order.deliveredAt ? `Confirmed delivered on ${new Date(order.deliveredAt).toLocaleDateString('en-NG', { dateStyle: 'medium', timeStyle: 'short' })}` : 'Delivery confirmed'} • Thank you for shopping with ARUBEKEE COLLECTION! ✨
                </span>
              </div>
            </div>
          )}

          {/* Pending Payment Pro-Forma Invoice Banner (If Unpaid / WhatsApp Invoice) */}
          {order.paymentStatus === 'pending' && (
            <div className="bg-amber-50/70 border-2 border-amber-300/80 p-5 sm:p-6 space-y-4">
              <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
                <CreditCard className="w-5 h-5 text-amber-700" />
                <span>Awaiting Bank Transfer • Garment Reserved</span>
              </div>
              <p className="text-xs text-amber-800 leading-relaxed">
                Your order is currently placed on reserve in our Aba showroom. Please complete a direct bank transfer of{" "}
                <strong className="text-amber-950 font-bold font-serif text-sm">
                  {formatKoboToNaira(order.totalKobo)}
                </strong>{" "}
                using the official boutique account details below to confirm dispatch.
              </p>

              {/* Bank Account Details Card */}
              <div className="bg-white border border-amber-200/90 p-4 rounded-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1 text-xs">
                  <div className="text-obsidian-muted">Bank Name: <strong className="text-obsidian">Zenith Bank PLC</strong></div>
                  <div className="text-obsidian-muted">Account Name: <strong className="text-obsidian">ARUBEKEE COLLECTION ATELIER</strong></div>
                  <div className="text-obsidian-muted flex items-center gap-2">
                    <span>Account Number:</span>
                    <span className="font-mono text-base font-bold text-obsidian tracking-wider">1018938472</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={copyBankDetails}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 bg-stone-100 hover:bg-stone-200 border border-stone-300 text-obsidian text-xs font-semibold transition-colors"
                  >
                    {copiedAccount ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Account Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-obsidian-muted" />
                        <span>Copy Account No</span>
                      </>
                    )}
                  </button>

                  <a
                    href={`https://wa.me/${boutiqueWhatsApp}?text=${encodeURIComponent(
                      `Hello ARUBEKEE COLLECTION, I have transferred payment for invoice ${order.orderNumber} (${formatKoboToNaira(order.totalKobo)}). Here is my payment receipt / confirmation:`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold shadow-sm transition-colors"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Send Receipt via WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Logistics & Tracking Reference */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-ivory-warm p-5 border border-stone-line">
            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-soft block">
                Fulfillment Route
              </span>
              <div className="flex items-center gap-2 text-sm font-semibold text-obsidian">
                {order.deliveryType === 'aba_pickup' ? (
                  <>
                    <MapPin className="w-4 h-4 text-oxblood" />
                    <span>Aba Boutique Showroom Pickup</span>
                  </>
                ) : (
                  <>
                    <Truck className="w-4 h-4 text-oxblood" />
                    <span>Courier Interstate Delivery</span>
                  </>
                )}
              </div>

              {order.shippingAddress && (
                <p className="text-xs text-obsidian-muted">
                  Destination: {order.shippingAddress.city}, {order.shippingAddress.state}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-bold tracking-wider text-obsidian-soft block">
                Dispatch Courier & Tracking
              </span>
              {order.carrierName ? (
                <div className="space-y-1">
                  <p className="text-sm font-medium text-obsidian">
                    Courier: <strong>{order.carrierName}</strong>
                  </p>
                  {order.trackingNumber && (
                    <p className="text-xs text-obsidian-muted">
                      Waybill / Waybill No: <code className="bg-ivory px-1.5 py-0.5 border border-stone-line font-mono">{order.trackingNumber}</code>
                    </p>
                  )}
                  {order.trackingUrl && (
                    <a
                      href={order.trackingUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-oxblood underline hover:text-oxblood-hover mt-1 font-semibold"
                    >
                      <span>Track with Courier</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              ) : (
                <p className="text-xs text-obsidian-muted">
                  {order.paymentStatus === 'pending'
                    ? "Dispatch will commence immediately once bank transfer confirmation is received."
                    : "Your items are being retrieved from our Aba showroom racks, quality-inspected, and boxed for courier transit."}
                </p>
              )}
            </div>
          </div>

          {/* Order Items Snapshot */}
          <div className="space-y-3">
            <h3 className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft">
              Items in this {order.paymentStatus === 'pending' ? 'Invoice' : 'Parcel'}
            </h3>
            <div className="divide-y divide-stone-line border-y border-stone-line">
              {order.items.map((item) => (
                <div key={item.id} className="py-3 flex justify-between items-center text-xs">
                  <div>
                    <p className="font-semibold text-obsidian">{item.productName}</p>
                    <p className="text-obsidian-muted text-[11px]">
                      {item.colorName} {/* • {item.size} */} • Qty: {item.quantity}
                    </p>
                  </div>
                  <span className="font-semibold text-obsidian">
                    {formatKoboToNaira(item.totalKobo)}
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-between items-baseline text-sm">
              <span className="font-semibold uppercase tracking-wider text-xs text-obsidian">
                {order.paymentStatus === 'pending' ? 'Total Due:' : 'Total Paid:'}
              </span>
              <span className="font-serif text-lg font-bold text-oxblood">
                {formatKoboToNaira(order.totalKobo)}
              </span>
            </div>
          </div>

          {/* Timeline Events */}
          {order.timeline && order.timeline.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-stone-line">
              <h3 className="text-xs uppercase font-semibold tracking-wider text-obsidian-soft">
                Order Activity Timeline
              </h3>
              <div className="space-y-3">
                {order.timeline.map((event) => (
                  <div key={event.id} className="flex items-start gap-3 text-xs">
                    <CheckCircle2 className="w-4 h-4 text-status-success shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold text-obsidian">{event.title}</p>
                      <p className="text-obsidian-muted text-[11px]">{event.description}</p>
                      <span className="text-[10px] text-obsidian-subtle">
                        {new Date(event.createdAt).toLocaleDateString()} {new Date(event.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TrackOrderPage() {
  return (
    <Suspense fallback={
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-xs uppercase tracking-widest text-obsidian-muted">
        Loading Order Tracker...
      </div>
    }>
      <TrackOrderContent />
    </Suspense>
  );
}

