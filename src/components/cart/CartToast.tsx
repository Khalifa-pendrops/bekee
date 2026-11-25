'use client';

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatKoboToNaira } from "@/lib/utils";
import { Sparkles, ShoppingBag, X, ArrowRight } from "lucide-react";

const TOAST_DURATION_MS = 5500; // Stays for ~5.5 seconds

export function CartToast() {
  const { lastAddedItem, isToastOpen, closeToast, openCart, totalQuantity } = useCart();
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const startTimeRef = useRef<number>(Date.now());
  const elapsedRef = useRef<number>(0);

  useEffect(() => {
    if (!isToastOpen) {
      setProgress(100);
      elapsedRef.current = 0;
      return;
    }

    startTimeRef.current = Date.now() - elapsedRef.current;
    const intervalStep = 50;

    const interval = setInterval(() => {
      if (!isHovered) {
        const elapsed = Date.now() - startTimeRef.current;
        elapsedRef.current = elapsed;
        const remainingPct = Math.max(0, 100 - (elapsed / TOAST_DURATION_MS) * 100);
        setProgress(remainingPct);

        if (remainingPct <= 0) {
          clearInterval(interval);
          closeToast();
        }
      } else {
        // When hovered, freeze elapsed timer anchor
        startTimeRef.current = Date.now() - elapsedRef.current;
      }
    }, intervalStep);

    return () => clearInterval(interval);
  }, [isToastOpen, isHovered, closeToast]);

  if (!isToastOpen || !lastAddedItem) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="fixed top-20 right-3 sm:right-6 z-50 max-w-[calc(100vw-24px)] sm:max-w-md w-full animate-slide-down"
    >
      <div className="bg-white/98 backdrop-blur-md rounded-2xl border-2 border-[#D4AF37]/60 shadow-[0_15px_45px_-8px_rgba(84,18,27,0.35)] p-4 relative overflow-hidden transition-all duration-300">
        {/* Subtle Gold Shimmer Bar on Top */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-gold via-amber-300 to-oxblood" />

        {/* Header Row */}
        <div className="flex items-center justify-between pb-2 mb-3 border-b border-stone-100">
          <div className="flex items-center gap-1.5 text-oxblood">
            <Sparkles className="w-4 h-4 text-gold fill-gold animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider">Added to Bag</span>
            <span className="text-[11px] text-stone-500 font-medium">({totalQuantity} in bag)</span>
          </div>
          <button
            onClick={closeToast}
            aria-label="Dismiss notification"
            className="text-stone-400 hover:text-stone-700 transition-colors p-1 -mr-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Product Preview Body */}
        <div className="flex gap-3.5 items-center">
          <div className="relative w-16 h-20 rounded-lg overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lastAddedItem.image}
              alt={lastAddedItem.productName}
              className="w-full h-full object-cover object-top"
            />
          </div>

          <div className="flex-1 min-w-0 space-y-1">
            <h4 className="font-serif text-sm font-normal text-stone-900 truncate">
              {lastAddedItem.productName}
            </h4>
            <div className="flex items-center gap-2 text-xs text-stone-500">
              {lastAddedItem.colorName && (
                <span className="truncate">{lastAddedItem.colorName}</span>
              )}
              {lastAddedItem.quantity > 1 && (
                <span>• Qty: {lastAddedItem.quantity}</span>
              )}
            </div>
            <p className="font-serif font-bold text-sm text-oxblood">
              {formatKoboToNaira(lastAddedItem.unitPriceKobo)}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-3.5 pt-3 border-t border-stone-100 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => {
              closeToast();
              openCart();
            }}
            className="py-2.5 px-3 text-xs font-semibold text-stone-900 bg-stone-100 hover:bg-stone-200 active:bg-stone-300 border border-stone-200 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>View Bag</span>
          </button>
          <Link
            href="/checkout"
            onClick={closeToast}
            className="py-2.5 px-3 text-xs font-semibold text-white bg-oxblood hover:bg-oxblood-800 active:bg-oxblood-900 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <span>Checkout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Auto-Dismiss Visual Countdown Progress Bar */}
        <div className="w-full bg-stone-100 h-0.5 mt-3 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold via-amber-400 to-oxblood transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
