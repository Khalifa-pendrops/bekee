'use client';

import React, { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Sparkles, 
  ShoppingBag, 
  X, 
  ArrowRight, 
  MessageCircle, 
  CheckCircle2, 
  MapPin, 
  Volume2
} from 'lucide-react';
import { Order } from '@/types';
import { formatKoboToNaira } from '@/lib/utils';
import { generateOrderWhatsAppUrl } from '@/lib/whatsapp';

/**
 * High-end luxury boutique chime using Web Audio API.
 * Synthesizes an authentic 4-stage ascending harmonic chime with warm resonance.
 */
function playOrderArrivalChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();

    if (ctx.state === 'suspended') {
      ctx.resume().catch(() => {});
    }

    const now = ctx.currentTime;

    // Chime chord frequencies: C5 (523.25), E5 (659.25), G5 (783.99), C6 (1046.50)
    const notes = [
      { freq: 523.25, time: now, duration: 0.45, gain: 0.12 },
      { freq: 659.25, time: now + 0.09, duration: 0.50, gain: 0.14 },
      { freq: 783.99, time: now + 0.18, duration: 0.55, gain: 0.16 },
      { freq: 1046.50, time: now + 0.28, duration: 0.95, gain: 0.18 },
    ];

    notes.forEach(({ freq, time, duration, gain }) => {
      // Primary warm tone
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gainNode.gain.setValueAtTime(gain, time);
      gainNode.gain.exponentialRampToValueAtTime(0.0005, time + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);

      // Subtle metallic overtone (triangle) for boutique brass bell clarity
      const overtoneOsc = ctx.createOscillator();
      const overtoneGain = ctx.createGain();
      overtoneOsc.type = 'triangle';
      overtoneOsc.frequency.setValueAtTime(freq * 2, time);

      overtoneGain.gain.setValueAtTime(gain * 0.25, time);
      overtoneGain.gain.exponentialRampToValueAtTime(0.0005, time + duration * 0.6);

      overtoneOsc.connect(overtoneGain);
      overtoneGain.connect(ctx.destination);

      overtoneOsc.start(time);
      overtoneOsc.stop(time + duration * 0.6);
    });
  } catch (err) {
    console.warn('[AdminOrderNotification] Audio chime failed:', err);
  }
}

/**
 * Haptic feedback vibration for mobile/tablet admin users.
 */
function triggerAdminHaptics() {
  if (typeof window !== 'undefined' && typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      // Distinct double pulse celebratory alert pattern
      navigator.vibrate([60, 50, 80, 50, 120]);
    } catch {}
  }
}

interface NotificationState {
  order: Order;
  totalNewCount: number;
}

const DISPLAY_DURATION_MS = 4800; // ~4.8 seconds

export function AdminOrderNotification() {
  const pathname = usePathname();
  const [notification, setNotification] = useState<NotificationState | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(100);

  const isInitializedRef = useRef(false);
  const knownOrderIdsRef = useRef<Set<string>>(new Set());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Clear running timers
  const clearTimers = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
  }, []);

  const dismissNotification = useCallback(() => {
    setIsVisible(false);
    clearTimers();
    setTimeout(() => {
      setNotification(null);
    }, 400); // Wait for transition
  }, [clearTimers]);

  // Trigger sound, haptics, and display banner
  const triggerNotification = useCallback((order: Order, count = 1) => {
    clearTimers();
    setNotification({ order, totalNewCount: count });
    setIsVisible(true);
    setProgress(100);

    // Audio & Haptics
    playOrderArrivalChime();
    triggerAdminHaptics();

    // Start auto-dismiss progress
    const startTime = Date.now();
    const intervalStep = 50;

    progressIntervalRef.current = setInterval(() => {
      if (!isHovered) {
        const elapsed = Date.now() - startTime;
        const remainingPct = Math.max(0, 100 - (elapsed / DISPLAY_DURATION_MS) * 100);
        setProgress(remainingPct);
        if (remainingPct <= 0) {
          dismissNotification();
        }
      }
    }, intervalStep);
  }, [clearTimers, isHovered, dismissNotification]);

  // Audio Context unlocker on user's first click or touch
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioCtx) {
          const ctx = new AudioCtx();
          if (ctx.state === 'suspended') {
            ctx.resume();
          }
        }
      } catch {}
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  // Poll for orders every 12 seconds
  useEffect(() => {
    if (pathname === '/admin/login') return;

    let isMounted = true;

    async function checkForNewOrders() {
      try {
        const res = await fetch('/api/admin/orders', { cache: 'no-store' });
        if (!res.ok) return;
        const orders: Order[] = await res.json();
        if (!Array.isArray(orders) || !isMounted) return;

        // First load: Record all existing orders without playing chime
        if (!isInitializedRef.current) {
          orders.forEach((o) => {
            if (o.id) knownOrderIdsRef.current.add(o.id);
            if (o.orderNumber) knownOrderIdsRef.current.add(o.orderNumber);
          });
          isInitializedRef.current = true;
          return;
        }

        // Subsequent polls: check for incoming orders
        const newlyArrived = orders.filter(
          (o) => !knownOrderIdsRef.current.has(o.id) && !knownOrderIdsRef.current.has(o.orderNumber)
        );

        if (newlyArrived.length > 0) {
          newlyArrived.forEach((o) => {
            if (o.id) knownOrderIdsRef.current.add(o.id);
            if (o.orderNumber) knownOrderIdsRef.current.add(o.orderNumber);
          });

          // Most recent order
          const latest = newlyArrived[0];
          triggerNotification(latest, newlyArrived.length);
        }
      } catch (e) {
        // network / polling error - retry on next interval
      }
    }

    // Initial check
    checkForNewOrders();

    const interval = setInterval(checkForNewOrders, 12000);

    // Also check immediately when window regains focus
    const handleFocus = () => {
      checkForNewOrders();
    };
    window.addEventListener('focus', handleFocus);

    // Listen for custom immediate order events (e.g. from POS offline sales)
    const handleCustomOrderEvent = (e: any) => {
      if (e.detail) {
        const order: Order = e.detail;
        if (order.id) knownOrderIdsRef.current.add(order.id);
        if (order.orderNumber) knownOrderIdsRef.current.add(order.orderNumber);
        triggerNotification(order, 1);
      }
    };
    window.addEventListener('arubekee:new-order', handleCustomOrderEvent);

    return () => {
      isMounted = false;
      clearInterval(interval);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('arubekee:new-order', handleCustomOrderEvent);
      clearTimers();
    };
  }, [pathname, triggerNotification, clearTimers]);

  if (!notification || pathname === '/admin/login') {
    return null;
  }

  const { order, totalNewCount } = notification;
  const destination = order.deliveryType === 'aba_pickup'
    ? 'Aba Showroom Collection'
    : order.shippingAddress?.city
    ? `${order.shippingAddress.city}, ${order.shippingAddress.state}`
    : 'Doorstep Courier';

  const firstItem = order.items?.[0];
  const itemsSummary = order.items && order.items.length > 0
    ? `${order.items.length} garment${order.items.length > 1 ? 's' : ''}: ${firstItem?.productName}${order.items.length > 1 ? ` (+${order.items.length - 1} more)` : ''}`
    : 'Order snapshot garments';

  const waUrl = generateOrderWhatsAppUrl(order);

  return (
    <div
      role="alert"
      aria-live="assertive"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 max-w-sm sm:max-w-md w-[calc(100%-2rem)] transition-all duration-400 ease-out transform ${
        isVisible
          ? 'translate-y-0 opacity-100 scale-100'
          : '-translate-y-4 opacity-0 scale-95 pointer-events-none'
      }`}
    >
      <div className="relative bg-stone-900/95 backdrop-blur-xl border border-amber-500/50 rounded-2xl shadow-2xl shadow-black/80 overflow-hidden ring-1 ring-amber-400/20">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-amber-300 to-amber-600" />

        <div className="p-4 sm:p-5">
          {/* Header Row */}
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <div className="flex items-center gap-2">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-300 flex items-center gap-1 font-mono">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>New Order Received</span>
              </span>
              {totalNewCount > 1 && (
                <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-amber-500 text-stone-950 font-mono">
                  +{totalNewCount - 1} more
                </span>
              )}
            </div>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-stone-400 font-mono">Just now</span>
              <button
                onClick={dismissNotification}
                className="p-1 text-stone-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors ml-1"
                aria-label="Dismiss notification"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Main Content Info */}
          <div className="space-y-1 mb-3">
            <div className="flex items-baseline justify-between gap-2">
              <h4 className="font-serif text-sm sm:text-base font-bold text-white tracking-tight truncate">
                {order.customerName || 'Valued Client'}
              </h4>
              <span className="font-mono text-sm sm:text-base font-bold text-amber-300 shrink-0">
                {formatKoboToNaira(order.totalKobo)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-xs text-stone-300">
              <span className="font-mono text-[11px] text-stone-400 font-semibold">{order.orderNumber}</span>
              <span className="text-stone-500">•</span>
              <span className="text-emerald-400 font-medium text-[11px] flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                {order.paymentStatus === 'paid' ? 'Paid in Full' : 'Payment Pending'}
              </span>
            </div>

            <p className="text-[11px] text-stone-400 truncate pt-0.5">
              {itemsSummary}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-stone-400 font-medium pt-0.5">
              <MapPin className="w-3 h-3 text-amber-400/80 shrink-0" />
              <span className="truncate">{destination}</span>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-2 pt-2 border-t border-white/10">
            <Link
              href={`/admin/orders/${order.id}`}
              onClick={dismissNotification}
              className="flex-1 py-2 px-3 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-stone-950 font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-1.5 shadow-md shadow-amber-500/20"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Fulfill Order</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {order.customerPhone && (
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={dismissNotification}
                className="py-2 px-3 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-semibold text-xs rounded-lg transition-colors flex items-center justify-center gap-1.5"
                title="Send Order Confirmation on WhatsApp"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Progress Bar (Depletes as time ticks down; paused on hover) */}
        <div className="w-full bg-white/5 h-1">
          <div
            className="h-full bg-gradient-to-r from-amber-500 via-amber-300 to-amber-400 transition-all duration-75 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>

      </div>
    </div>
  );
}
