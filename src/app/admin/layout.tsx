'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Home, 
  ShoppingBag, 
  Package, 
  Layers, 
  Percent, 
  Globe, 
  Truck, 
  Settings, 
  HelpCircle,
  Menu,
  X,
  PlusCircle,
  Zap,
  ArrowUpRight,
  Store,
  ChevronRight
} from 'lucide-react';

const ADMIN_NAV_LINKS = [
  { name: 'Home', href: '/admin', icon: Home },
  { name: 'Orders', href: '/admin/orders', icon: Package },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Stock', href: '/admin/stock', icon: Layers },
  { name: 'Offline Sale', href: '/admin/offline-sale', icon: Zap, highlight: true },
  { name: 'Discounts', href: '/admin/discounts', icon: Percent },
  { name: 'Website', href: '/admin/website', icon: Globe },
  { name: 'Delivery', href: '/admin/delivery', icon: Truck },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col md:flex-row text-stone-900 font-sans">
      
      {/* DESKTOP SIDEBAR */}
      <aside className="hidden md:flex flex-col w-64 bg-stone-900 text-stone-300 border-r border-stone-800 shrink-0 select-none">
        
        {/* Brand Header */}
        <div className="p-6 border-b border-stone-800">
          <Link href="/admin" className="block">
            <span className="font-serif text-lg tracking-widest uppercase font-bold text-white block">
              ARUBEKEE
            </span>
            <span className="text-[10px] tracking-wider uppercase text-sand-400 font-medium block">
              Aba Boutique Owner Portal
            </span>
          </Link>
          <div className="mt-3 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[11px] text-stone-400 font-mono">Storefront Live</span>
          </div>
        </div>

        {/* Quick Action Buttons */}
        <div className="p-4 space-y-2 border-b border-stone-800">
          <Link
            href="/admin/products/new"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 bg-oxblood-700 hover:bg-oxblood-800 text-white rounded text-xs font-semibold tracking-wider uppercase transition-colors shadow-sm"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Product</span>
          </Link>

          <Link
            href="/admin/offline-sale"
            className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-sand-300 rounded text-xs font-medium tracking-wide transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Record Walk-in / WhatsApp</span>
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {ADMIN_NAV_LINKS.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
            return (
              <Link
                key={link.name}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-stone-800 text-white font-semibold shadow-inner'
                    : 'text-stone-400 hover:text-white hover:bg-stone-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-oxblood-400' : 'text-stone-400'}`} />
                <span>{link.name}</span>
                {link.highlight && (
                  <span className="ml-auto text-[9px] bg-amber-500/20 text-amber-300 px-1.5 py-0.5 rounded font-mono font-semibold">
                    FAST
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Sidebar Footer Link to Public Store */}
        <div className="p-4 border-t border-stone-800">
          <Link
            href="/"
            target="_blank"
            className="flex items-center justify-between px-3 py-2 text-xs text-stone-400 hover:text-white rounded bg-stone-800/50 hover:bg-stone-800 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Store className="w-3.5 h-3.5 text-sand-400" />
              <span>View Live Storefront</span>
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </aside>

      {/* MOBILE TOP BAR */}
      <header className="md:hidden bg-stone-900 text-white px-4 py-3 border-b border-stone-800 flex items-center justify-between sticky top-0 z-40">
        <div>
          <Link href="/admin" className="font-serif text-base tracking-widest uppercase font-bold text-white block">
            ARUBEKEE
          </Link>
          <span className="text-[9px] tracking-wider uppercase text-sand-400 font-medium block">
            Aba Merchant Portal
          </span>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/offline-sale"
            className="p-1.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30 text-xs font-semibold flex items-center gap-1"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px]">POS</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="p-1.5 bg-oxblood-700 text-white rounded text-xs font-semibold flex items-center gap-1"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="text-[10px]">+Product</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-stone-300 hover:text-white rounded focus:outline-none"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* MOBILE EXPANDED MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-stone-900/90 backdrop-blur-sm flex flex-col justify-end">
          <div className="bg-stone-900 border-t border-stone-800 p-6 rounded-t-2xl max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-stone-800">
              <span className="text-xs uppercase tracking-widest text-sand-400 font-semibold">Store Management Menu</span>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-stone-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="grid grid-cols-2 gap-2">
              {ADMIN_NAV_LINKS.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-lg text-xs font-medium ${
                      isActive
                        ? 'bg-oxblood-700 text-white font-semibold'
                        : 'bg-stone-800 text-stone-300 hover:bg-stone-700'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-stone-800 flex gap-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs bg-stone-800 text-stone-300 rounded font-medium flex items-center justify-center gap-1.5"
              >
                <Store className="w-3.5 h-3.5" />
                <span>Customer Storefront</span>
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 pb-20 md:pb-8">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Thumb-Optimized for Phone Screen) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-stone-900 border-t border-stone-800 flex items-center justify-around py-2 px-2 z-40">
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname === '/admin' ? 'text-white' : 'text-stone-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname.startsWith('/admin/orders') ? 'text-white' : 'text-stone-400'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </Link>

        {/* Center Quick POS / Add Action */}
        <Link
          href="/admin/offline-sale"
          className="flex flex-col items-center justify-center -mt-4 bg-amber-500 text-stone-950 p-2.5 rounded-full shadow-lg border-2 border-stone-900"
        >
          <Zap className="w-5 h-5" />
        </Link>

        <Link
          href="/admin/products"
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname.startsWith('/admin/products') ? 'text-white' : 'text-stone-400'
          }`}
        >
          <ShoppingBag className="w-5 h-5 mb-0.5" />
          <span>Products</span>
        </Link>

        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium text-stone-400"
        >
          <Menu className="w-5 h-5 mb-0.5" />
          <span>More</span>
        </button>
      </nav>

    </div>
  );
}

