'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { CartItem } from "@/types";

interface CartContextType {
  items: CartItem[];
  cart: {
    items: CartItem[];
    subtotalKobo: number;
    totalQuantity: number;
  };
  addItem: (item: Omit<CartItem, 'id'>, quantity?: number) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  totalQuantity: number;
  subtotalKobo: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  lastAddedItem: CartItem | null;
  isToastOpen: boolean;
  closeToast: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "arubekee_cart_v1";

function playAtelierChime() {
  if (typeof window === 'undefined') return;
  try {
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const now = ctx.currentTime;
    
    // Warm chime (C5: 523.25Hz)
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(523.25, now);
    gain1.gain.setValueAtTime(0.04, now);
    gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Subtle gold harmonic overtone (E5: 659.25Hz)
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(659.25, now + 0.08);
    gain2.gain.setValueAtTime(0.03, now + 0.08);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(now + 0.08);
    osc2.stop(now + 0.45);
  } catch {
    // Silent fallback
  }
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [lastAddedItem, setLastAddedItem] = useState<CartItem | null>(null);
  const [isToastOpen, setIsToastOpen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from local storage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Self-heal any cart items with missing or undefined variantId
          const healed = parsed.map((item: any) => ({
            ...item,
            variantId: item.variantId || (item.id && item.id.includes('-') ? item.id.split('-').slice(1).join('-') : item.productId),
          }));
          setItems(healed);
        }
      }
    } catch (e) {
      console.warn("Failed to read cart from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to local storage on changes
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save cart to localStorage:", e);
    }
  }, [items, isLoaded]);

  const addItem = (newItem: Omit<CartItem, 'id'>, quantity: number = 1) => {
    const safeVariantId = newItem.variantId || newItem.productId;
    const cleanItem = {
      ...newItem,
      variantId: safeVariantId,
    };

    setItems((prevItems) => {
      const compositeId = `${cleanItem.productId}-${safeVariantId}`;
      const existingIndex = prevItems.findIndex(
        (i) => i.variantId === safeVariantId
      );

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const existing = updated[existingIndex];
        const combinedQty = Math.min(
          existing.quantity + quantity,
          existing.maxAvailableStock
        );
        updated[existingIndex] = {
          ...existing,
          quantity: combinedQty,
        };
        return updated;
      } else {
        const itemToAdd: CartItem = {
          ...cleanItem,
          id: compositeId,
          quantity: Math.min(quantity, cleanItem.maxAvailableStock),
        };
        return [...prevItems, itemToAdd];
      }
    });

    const itemSnapshot: CartItem = {
      ...cleanItem,
      id: `${cleanItem.productId}-${safeVariantId}`,
      quantity: Math.min(quantity, cleanItem.maxAvailableStock),
    };
    setLastAddedItem(itemSnapshot);
    setIsToastOpen(true);

    playAtelierChime();
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 30, 20]);
      } catch {}
    }

    // Auto-remove from wishlist if this product was saved for later
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('arubekee:cart-item-added', {
          detail: { productId: newItem.productId }
        })
      );
    }
  };

  const removeItem = (variantId: string) => {
    setItems((prev) => prev.filter((i) => i.variantId !== variantId));
  };

  const updateQuantity = (variantId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.variantId === variantId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.maxAvailableStock),
          };
        }
        return item;
      })
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const totalQuantity = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalKobo = items.reduce(
    (acc, item) => acc + item.unitPriceKobo * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        cart: {
          items,
          subtotalKobo,
          totalQuantity,
        },
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        totalQuantity,
        subtotalKobo,
        isCartOpen,
        openCart: () => setIsCartOpen(true),
        closeCart: () => setIsCartOpen(false),
        lastAddedItem,
        isToastOpen,
        closeToast: () => setIsToastOpen(false),
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}

