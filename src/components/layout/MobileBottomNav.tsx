'use client';

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWishlist } from "@/context/WishlistContext";
import { Home, Compass, Heart, ShoppingBag, MessageSquare } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { totalQuantity, openCart } = useCart();
  const { totalWishlistCount } = useWishlist();

  // Hide on admin routes to prevent interface collision
  if (pathname.startsWith('/admin')) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home, isActive: pathname === "/" },
    { label: "Shop", href: "/shop", icon: Compass, isActive: pathname.startsWith("/shop") || pathname.startsWith("/categories") || pathname.startsWith("/collections") },
    { label: "Wishlist", href: "/wishlist", icon: Heart, isActive: pathname.startsWith("/wishlist"), badge: totalWishlistCount },
    { label: "Bag", action: openCart, icon: ShoppingBag, badge: totalQuantity },
    { label: "WhatsApp", href: "https://wa.me/2348000000000?text=Hello%20Arubekee%20Collection,%20I%20would%20like%20to%20enquire%20about%20your%20fashion%20items", icon: MessageSquare, isExternal: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-ivory/95 backdrop-blur-md border-t border-stone-line lg:hidden safe-area-bottom">
      <div className="grid grid-cols-5 h-14 max-w-md mx-auto">
        {navItems.map((item, index) => {
          const Icon = item.icon;
          const content = (
            <div className="flex flex-col items-center justify-center w-full h-full relative py-1 text-obsidian-muted hover:text-oxblood transition-colors">
              <div className="relative">
                <Icon className={`w-5 h-5 stroke-1.5 ${item.isActive ? 'text-oxblood stroke-2' : ''}`} />
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 bg-oxblood text-ivory-light text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className={`text-[10px] tracking-wider uppercase mt-1 font-medium ${item.isActive ? 'text-oxblood font-bold' : ''}`}>
                {item.label}
              </span>
            </div>
          );

          if (item.action) {
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full h-full focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </button>
            );
          }

          if (item.isExternal) {
            return (
              <a
                key={index}
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-full focus:outline-none"
                aria-label={item.label}
              >
                {content}
              </a>
            );
          }

          return (
            <Link
              key={index}
              href={item.href!}
              className="w-full h-full focus:outline-none"
              aria-label={item.label}
            >
              {content}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

