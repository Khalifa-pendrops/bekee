'use client';

import React from "react";
import Link from "next/link";
import { Drawer } from "@/components/ui/Drawer";
import { Button } from "@/components/ui/Button";
import { useCart } from "@/context/CartContext";
import { formatKoboToNaira, buildWhatsAppProductUrl } from "@/lib/utils";
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from "lucide-react";

export function CartDrawer() {
  const { items, removeItem, updateQuantity, isCartOpen, closeCart, subtotalKobo } = useCart();

  return (
    <Drawer
      isOpen={isCartOpen}
      onClose={closeCart}
      title="Shopping Bag"
      description={`${items.length} ${items.length === 1 ? 'item' : 'items'} selected`}
      position="right"
    >
      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-ivory-muted flex items-center justify-center text-obsidian-subtle">
            <ShoppingBag className="w-8 h-8 stroke-1" />
          </div>
          <div className="space-y-1">
            <p className="font-serif text-lg text-obsidian">Your bag is empty</p>
            <p className="text-xs text-obsidian-muted max-w-xs">
              Explore our latest curated collections from Aba fashion artisans.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={closeCart}
            className="mt-2"
          >
            <Link href="/shop">Start Shopping</Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col h-full justify-between">
          {/* Items list */}
          <div className="divide-y divide-stone-line">
            {items.map((item) => (
              <div key={item.id} className="py-4 flex gap-4">
                {/* Thumbnail */}
                <div className="relative w-20 h-24 bg-stone-subtle shrink-0 overflow-hidden border border-stone-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.image}
                    alt={item.productName}
                    className="w-full h-full object-cover object-top"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-start">
                      <Link
                        href={`/products/${item.productSlug}`}
                        onClick={closeCart}
                        className="font-serif text-sm font-medium text-obsidian hover:text-oxblood truncate transition-colors"
                      >
                        {item.productName}
                      </Link>
                      <button
                        onClick={() => removeItem(item.variantId)}
                        className="text-obsidian-subtle hover:text-status-danger p-1 transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="flex items-center gap-2 mt-1 text-xs text-obsidian-muted">
                      <span>{item.colorName}</span>
                      <span>•</span>
                      <span className="font-medium text-obsidian">{item.size}</span>
                    </div>

                    <div className="mt-1 font-sans font-semibold text-sm text-oxblood">
                      {formatKoboToNaira(item.unitPriceKobo)}
                    </div>
                  </div>

                  {/* Quantity Stepper */}
                  <div className="flex items-center justify-between mt-2 pt-1 border-t border-stone-line/50">
                    <div className="flex items-center border border-stone-line bg-ivory-light">
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity - 1)}
                        className="p-1 hover:bg-ivory-muted text-obsidian-soft transition-colors"
                        aria-label="Decrease quantity"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 text-xs font-semibold text-obsidian">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.variantId, item.quantity + 1)}
                        disabled={item.quantity >= item.maxAvailableStock}
                        className="p-1 hover:bg-ivory-muted text-obsidian-soft disabled:opacity-30 transition-colors"
                        aria-label="Increase quantity"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <span className="text-xs font-medium text-obsidian-soft">
                      {formatKoboToNaira(item.unitPriceKobo * item.quantity)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer Checkout Summary */}
          <div className="border-t border-stone-line pt-4 mt-6 bg-ivory space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider text-obsidian-muted font-semibold">
                Subtotal
              </span>
              <span className="font-serif text-xl font-normal text-obsidian">
                {formatKoboToNaira(subtotalKobo)}
              </span>
            </div>

            <p className="text-[11px] text-obsidian-subtle">
              Delivery fees calculated at checkout based on location (Aba pickup or nationwide courier).
            </p>

            <div className="space-y-2 pt-1">
              <Link href="/checkout" onClick={closeCart} className="block w-full">
                <Button variant="primary" size="lg" className="w-full flex items-center justify-center gap-2">
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>

              <Button
                variant="outline"
                size="md"
                className="w-full text-xs uppercase tracking-wider"
                onClick={closeCart}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      )}
    </Drawer>
  );
}

