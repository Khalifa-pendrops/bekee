'use client';

import React, { createContext, useContext, useEffect, useState } from "react";
import { WishlistItem } from "@/types";

interface WishlistContextType {
  items: WishlistItem[];
  toggleWishlist: (item: WishlistItem) => void;
  removeFromWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  totalWishlistCount: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

const WISHLIST_STORAGE_KEY = "arubekee_wishlist_v1";
const CART_STORAGE_KEY = "arubekee_cart_v1";

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const cartSaved = localStorage.getItem(CART_STORAGE_KEY);
      const cartProductIds = new Set<string>();

      if (cartSaved) {
        try {
          const parsedCart = JSON.parse(cartSaved);
          if (Array.isArray(parsedCart)) {
            parsedCart.forEach((it: any) => {
              if (it.productId) cartProductIds.add(it.productId);
            });
          }
        } catch {}
      }

      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Filter out any pieces that already exist in the bag
          const filtered = parsed.filter((i: WishlistItem) => !cartProductIds.has(i.productId));
          setItems(filtered);
        }
      }
    } catch (e) {
      console.warn("Failed to read wishlist from localStorage:", e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items));
    } catch (e) {
      console.warn("Failed to save wishlist to localStorage:", e);
    }
  }, [items, isLoaded]);

  // Listen for items added to cart anywhere in the app and auto-clear from wishlist
  useEffect(() => {
    const handleCartItemAdded = (e: any) => {
      const productId = e.detail?.productId;
      if (productId) {
        setItems((prev) => prev.filter((i) => i.productId !== productId));
      }
    };

    window.addEventListener('arubekee:cart-item-added', handleCartItemAdded);
    return () => window.removeEventListener('arubekee:cart-item-added', handleCartItemAdded);
  }, []);

  const toggleWishlist = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((i) => i.productId === item.productId);
      if (exists) {
        return prev.filter((i) => i.productId !== item.productId);
      } else {
        return [...prev, item];
      }
    });
  };

  const removeFromWishlist = (productId: string) => {
    setItems((prev) => prev.filter((i) => i.productId !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((i) => i.productId === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        toggleWishlist,
        removeFromWishlist,
        isInWishlist,
        totalWishlistCount: items.length,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error("useWishlist must be used within a WishlistProvider");
  }
  return context;
}
