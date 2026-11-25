'use client';

import React, { useState, useMemo } from 'react';
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
  Menu, 
  X, 
  PlusCircle, 
  Zap, 
  ArrowUpRight, 
  Store, 
  ChevronLeft,
  ChevronRight,
  LogOut,
  Search
} from 'lucide-react';
import { AdminOrderNotification } from '@/components/admin/AdminOrderNotification';

interface NavItem {
  name: string;
  href: string;
  icon: any;
  badge?: string;
  highlight?: boolean;
}

const ADMIN_MAIN_LINKS: NavItem[] = [
  { name: 'Dashboard', href: '/admin', icon: Home },
  { name: 'Orders', href: '/admin/orders', icon: Package, badge: 'Live' },
  { name: 'Products', href: '/admin/products', icon: ShoppingBag },
  { name: 'Stock & Inventory', href: '/admin/stock', icon: Layers },
];

const ADMIN_COMMERCE_LINKS: NavItem[] = [
  { name: 'Walk-in / WhatsApp', href: '/admin/offline-sale', icon: Zap, highlight: true, badge: 'POS' },
  { name: 'Discount Codes', href: '/admin/discounts', icon: Percent },
  { name: 'Delivery Logistics', href: '/admin/delivery', icon: Truck },
  { name: 'Storefront CMS', href: '/admin/website', icon: Globe },
  { name: 'Store Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
    } catch (e) {
      // ignore
    }
    window.location.href = '/admin/login';
  };

  // If viewing the dedicated login screen, do not show admin navigation chrome
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  // Filter links when user types into the quick glass search bar
  const filteredMain = useMemo(() => {
    if (!searchQuery.trim()) return ADMIN_MAIN_LINKS;
    const q = searchQuery.toLowerCase();
    return ADMIN_MAIN_LINKS.filter((l) => l.name.toLowerCase().includes(q));
  }, [searchQuery]);

  const filteredCommerce = useMemo(() => {
    if (!searchQuery.trim()) return ADMIN_COMMERCE_LINKS;
    const q = searchQuery.toLowerCase();
    return ADMIN_COMMERCE_LINKS.filter((l) => l.name.toLowerCase().includes(q));
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-[#181513] text-stone-100 font-sans flex flex-col md:flex-row relative selection:bg-oxblood-700 selection:text-white overflow-x-hidden">
      
      {/* 1. PHOTOGRAPHIC LUXURY ARCHITECTURAL INTERIOR BACKDROP (Warm wood, ambient daylight, architectural depth) */}
      <div 
        aria-hidden="true" 
        className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
      >
        {/* Real High-Resolution Luxury Interior Atmosphere */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/asset/admin-studio-bg.jpg"
          alt=""
          className="absolute inset-0 w-full h-full object-cover object-left md:object-center filter brightness-[0.82] contrast-[1.08] transition-all duration-700"
        />

        {/* Warm Ambient Studio Glow directly illuminating the area behind the glass sidebar */}
        <div className="absolute top-1/4 -left-10 w-[42rem] h-[42rem] rounded-full bg-gradient-to-tr from-amber-600/35 via-orange-800/20 to-transparent blur-3xl opacity-85" />
        
        {/* Subtle Atelier Oxblood Tint on bottom-left */}
        <div className="absolute -bottom-10 left-10 w-96 h-96 rounded-full bg-gradient-to-t from-oxblood-700/30 to-transparent blur-3xl opacity-75" />

        {/* Ergonomic Workspace Vignette: Keeps sidebar clear & frosted, while ensuring the data workspace has comfortable contrast */}
        <div className="absolute inset-0 bg-gradient-to-r from-stone-950/25 via-stone-950/60 to-stone-950/80 backdrop-blur-[1px]" />
        
        {/* Global ambient luxury vignette */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-transparent via-stone-950/30 to-black/75" />
      </div>

      {/* DESKTOP FLOATING FROSTED GLASS SIDEBAR (Inspired by Glassy SideBar V5) */}
      <aside 
        className={`hidden md:flex flex-col sticky top-4 h-[calc(100vh-2rem)] my-4 ml-4 shrink-0 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] z-30 select-none ${
          isCollapsed ? 'w-20' : 'w-72'
        }`}
      >
        {/* The Ultra-Frosted Translucent Glass Container Pill sitting gracefully on the interior */}
        <div className="relative w-full h-full flex flex-col rounded-[28px] bg-white/[0.08] hover:bg-white/[0.11] backdrop-blur-2xl border border-white/25 shadow-[0_25px_60px_rgba(0,0,0,0.5),inset_0_1px_1px_rgba(255,255,255,0.3)] overflow-hidden text-stone-100 transition-colors before:absolute before:inset-x-0 before:top-0 before:h-28 before:bg-gradient-to-b before:from-white/25 before:via-white/[0.05] before:to-transparent before:pointer-events-none">
          
          {/* 1. BRAND HEADER & CIRCULAR TOGGLE */}
          <div className="p-4 pb-3 flex items-center justify-between border-b border-white/15 relative z-10">
            <Link 
              href="/admin" 
              className={`flex items-center gap-3 group transition-opacity ${isCollapsed ? 'mx-auto' : ''}`}
              title="ARUBEKEE Boutique Workspace"
            >
              {/* Circular Atelier Seal Avatar */}
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-oxblood-600 via-oxblood-700 to-oxblood-900 text-white flex items-center justify-center font-serif font-bold text-base shadow-lg shadow-black/40 border border-white/35 shrink-0 group-hover:scale-105 transition-transform">
                A
              </div>

              {!isCollapsed && (
                <div className="min-w-0">
                  <div className="font-serif text-sm font-bold tracking-widest uppercase text-white truncate drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] flex items-center gap-1.5">
                    <span>ARUBEKEE</span>
                  </div>
                  <div className="text-[10px] text-sand-200 font-medium tracking-wide truncate drop-shadow-[0_1px_1px_rgba(0,0,0,0.7)]">
                    Boutique HQ
                  </div>
                </div>
              )}
            </Link>

            {/* Circular Collapse Toggle Button */}
            {!isCollapsed && (
              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="w-7 h-7 rounded-full bg-white/15 hover:bg-white/25 border border-white/25 text-white flex items-center justify-center transition-all shadow-sm focus:outline-none"
                title="Collapse Sidebar"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Action Button (+ Add Product) */}
          <div className="p-3 border-b border-white/15">
            {isCollapsed ? (
              <Link
                href="/admin/products/new"
                className="w-10 h-10 mx-auto flex items-center justify-center bg-oxblood-700/85 hover:bg-oxblood-600/90 text-white rounded-2xl transition-all shadow-md shadow-black/40 border border-white/25 backdrop-blur-md"
                title="Add New Product"
              >
                <PlusCircle className="w-5 h-5" />
              </Link>
            ) : (
              <Link
                href="/admin/products/new"
                className="w-full py-2.5 px-3.5 bg-gradient-to-r from-oxblood-700/85 to-oxblood-800/85 hover:from-oxblood-600/90 hover:to-oxblood-700/90 text-white rounded-2xl text-xs font-semibold tracking-wider uppercase transition-all shadow-lg shadow-black/35 flex items-center justify-center gap-2 border border-white/25 backdrop-blur-md"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Add Product</span>
              </Link>
            )}
          </div>

          {/* 2. QUICK SEARCH BAR (Like the Reference 'Search pages ⌘K') */}
          {!isCollapsed && (
            <div className="px-3 pt-3">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-200" />
                <input
                  type="text"
                  placeholder="Search workspace..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-8 py-1.5 text-xs bg-white/10 hover:bg-white/15 focus:bg-white/20 border border-white/20 focus:border-white/35 rounded-xl text-white placeholder-stone-300 focus:outline-none transition-colors backdrop-blur-md drop-shadow-sm"
                />
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-300 hover:text-white"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[9px] font-mono text-stone-200 bg-white/15 px-1 py-0.5 rounded border border-white/20">
                    ⌘K
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 3. NAVIGATION SECTIONS */}
          <div className="flex-1 px-3 py-3 space-y-4 overflow-y-auto scrollbar-thin scrollbar-thumb-white/15">
            
            {/* Section: MAIN */}
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] uppercase font-bold tracking-widest text-stone-300 mb-1.5 drop-shadow-sm">
                  Main
                </div>
              )}
              {filteredMain.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || (link.href !== '/admin' && pathname.startsWith(link.href));
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={isCollapsed ? link.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-white/25 text-white font-semibold border border-white/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-xl'
                        : 'text-stone-200 hover:text-white hover:bg-white/10 hover:border-white/15 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-amber-300 drop-shadow-sm' : 'text-stone-300 group-hover:text-white'
                    }`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1 drop-shadow-sm">{link.name}</span>
                    )}
                    {!isCollapsed && link.badge && (
                      <span className="text-[10px] bg-emerald-400/25 text-emerald-200 px-2 py-0.5 rounded-full border border-emerald-400/40 font-mono font-semibold">
                        {link.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Section: ATELIER & COMMERCE */}
            <div className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[10px] uppercase font-bold tracking-widest text-stone-300 mb-1.5 drop-shadow-sm">
                  Workspace
                </div>
              )}
              {filteredCommerce.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href);
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    title={isCollapsed ? link.name : undefined}
                    className={`flex items-center gap-3 px-3 py-2 rounded-2xl text-xs font-medium transition-all group ${
                      isActive
                        ? 'bg-white/25 text-white font-semibold border border-white/35 shadow-[inset_0_1px_1px_rgba(255,255,255,0.4)] backdrop-blur-xl'
                        : 'text-stone-200 hover:text-white hover:bg-white/10 hover:border-white/15 border border-transparent'
                    } ${isCollapsed ? 'justify-center px-0' : ''}`}
                  >
                    <Icon className={`w-4 h-4 shrink-0 transition-transform group-hover:scale-110 ${
                      link.highlight 
                        ? 'text-amber-400 drop-shadow-sm' 
                        : isActive 
                        ? 'text-amber-300 drop-shadow-sm' 
                        : 'text-stone-300 group-hover:text-white'
                    }`} />
                    {!isCollapsed && (
                      <span className="truncate flex-1 drop-shadow-sm">{link.name}</span>
                    )}
                    {!isCollapsed && link.highlight && (
                      <span className="text-[9px] bg-amber-400/25 text-amber-200 px-1.5 py-0.5 rounded-full font-mono font-bold border border-amber-400/40">
                        POS
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>

          </div>

          {/* 4. EXPAND BUTTON (If Collapsed) */}
          {isCollapsed && (
            <div className="p-3 border-t border-white/15 flex justify-center">
              <button
                type="button"
                onClick={() => setIsCollapsed(false)}
                className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/25 border border-white/20 text-white flex items-center justify-center transition-all shadow-sm"
                title="Expand Sidebar"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* 5. BOTTOM USER PROFILE & SESSION PILL (Like Alex Morgan in reference) */}
          <div className="p-3 border-t border-white/15 bg-white/[0.04]">
            {isCollapsed ? (
              <div className="flex flex-col items-center gap-2">
                <Link
                  href="/"
                  target="_blank"
                  className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center text-stone-200 hover:text-white transition-colors"
                  title="View Storefront"
                >
                  <Store className="w-4 h-4 text-sand-200" />
                </Link>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="w-9 h-9 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/30 flex items-center justify-center text-red-300 transition-colors"
                  title="Sign Out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/20 shadow-sm backdrop-blur-md transition-colors">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative">
                    <div className="w-8 h-8 rounded-full bg-stone-950/60 border border-white/30 flex items-center justify-center font-bold text-xs text-amber-300 shrink-0">
                      SM
                    </div>
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-stone-900 absolute -bottom-0.5 -right-0.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-white truncate drop-shadow-sm">
                      Store Manager
                    </div>
                    <div className="text-[10px] text-stone-300 font-mono truncate drop-shadow-sm">
                      Aba Boutique • Live
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-1">
                  <Link
                    href="/"
                    target="_blank"
                    className="p-1.5 rounded-lg text-stone-300 hover:text-white hover:bg-white/15 transition-colors"
                    title="View Live Storefront"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>

                  <button
                    type="button"
                    onClick={handleLogout}
                    className="p-1.5 rounded-lg text-red-300 hover:text-red-200 hover:bg-red-950/60 transition-colors"
                    title="Sign Out"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </aside>

      {/* MOBILE TOP BAR (Matching Frosted Glass Header) */}
      <header className="md:hidden bg-stone-900/50 backdrop-blur-2xl text-white px-4 py-3 border-b border-white/15 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-oxblood-600 to-oxblood-900 text-white flex items-center justify-center font-serif font-bold text-sm border border-white/30">
            A
          </div>
          <div>
            <Link href="/admin" className="font-serif text-sm tracking-widest uppercase font-bold text-white block drop-shadow-sm">
              ARUBEKEE
            </Link>
            <span className="text-[9px] tracking-wider uppercase text-sand-200 font-medium block">
              Atelier Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/offline-sale"
            className="p-1.5 bg-amber-400/20 text-amber-200 rounded-xl border border-amber-400/30 text-xs font-semibold flex items-center gap-1 backdrop-blur-md"
          >
            <Zap className="w-3.5 h-3.5" />
            <span className="text-[10px]">POS</span>
          </Link>

          <Link
            href="/admin/products/new"
            className="p-1.5 bg-oxblood-700/80 text-white rounded-xl text-xs font-semibold flex items-center gap-1 border border-white/20 backdrop-blur-md"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span className="text-[10px]">+Product</span>
          </Link>

          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-1.5 text-stone-200 hover:text-white rounded-xl bg-white/10 border border-white/20 focus:outline-none backdrop-blur-md"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MOBILE EXPANDED MENU DRAWER (Floating Frosted Sheet) */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-md flex flex-col justify-end p-3">
          <div className="bg-stone-900/50 backdrop-blur-3xl border border-white/25 p-6 rounded-3xl max-h-[85vh] overflow-y-auto space-y-4 shadow-2xl text-stone-100">
            <div className="flex items-center justify-between pb-3 border-b border-white/15">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-full bg-oxblood-700 text-white flex items-center justify-center font-serif text-xs font-bold border border-white/30">
                  A
                </div>
                <span className="text-xs uppercase tracking-widest text-sand-200 font-semibold">Boutique HQ Menu</span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 text-stone-300 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <nav className="grid grid-cols-2 gap-2">
              {[...ADMIN_MAIN_LINKS, ...ADMIN_COMMERCE_LINKS].map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-3 rounded-2xl text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-white/25 text-white font-semibold border border-white/35 backdrop-blur-xl'
                        : 'bg-white/10 text-stone-200 hover:bg-white/15 border border-white/15 backdrop-blur-md'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0 text-amber-300" />
                    <span className="truncate">{link.name}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="pt-2 border-t border-white/15 flex gap-2">
              <Link
                href="/"
                target="_blank"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 py-2.5 text-center text-xs bg-white/10 hover:bg-white/20 text-stone-200 border border-white/20 rounded-2xl font-medium flex items-center justify-center gap-1.5 backdrop-blur-md"
              >
                <Store className="w-3.5 h-3.5 text-sand-200" />
                <span>Storefront</span>
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="px-4 py-2.5 text-center text-xs bg-red-950/40 text-red-200 border border-red-500/30 rounded-2xl font-medium flex items-center justify-center gap-1.5 backdrop-blur-md"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 w-full max-w-full overflow-x-hidden pb-20 md:pb-8 relative z-10 admin-content-scope">
        <div className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>

      {/* Universal fallback text contrast on dark admin canvas */}
      <style jsx global>{`
        /* Direct page headings outside cards */
        .admin-content-scope h1.text-stone-900,
        .admin-content-scope .space-y-6 > div > h1.text-stone-900,
        .admin-content-scope .space-y-6 > .flex h1.text-stone-900 {
          color: #ffffff !important;
        }
        /* Top border dividers */
        .admin-content-scope .border-b.border-stone-200 {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        /* Muted descriptive subtitle text directly on canvas */
        .admin-content-scope .border-b > div > p.text-stone-500,
        .admin-content-scope .space-y-6 > div > p.text-stone-500 {
          color: #a8a29e !important;
        }
      `}</style>

      {/* MOBILE BOTTOM NAVIGATION DOCK (Thumb-Optimized Floating Glass Dock) */}
      <nav className="md:hidden fixed bottom-3 left-3 right-3 bg-stone-900/40 backdrop-blur-2xl border border-white/25 rounded-2xl flex items-center justify-around py-2 px-2 z-40 shadow-2xl">
        <Link
          href="/admin"
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname === '/admin' ? 'text-amber-300 font-semibold' : 'text-stone-400'
          }`}
        >
          <Home className="w-5 h-5 mb-0.5" />
          <span>Home</span>
        </Link>

        <Link
          href="/admin/orders"
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname.startsWith('/admin/orders') ? 'text-amber-300 font-semibold' : 'text-stone-400'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Orders</span>
        </Link>

        {/* Center Quick POS / Add Action */}
        <Link
          href="/admin/offline-sale"
          className="flex flex-col items-center justify-center -mt-6 bg-gradient-to-tr from-amber-500 to-amber-400 text-stone-950 p-3 rounded-full shadow-lg shadow-amber-500/30 border-2 border-stone-950"
        >
          <Zap className="w-5 h-5" />
        </Link>

        <Link
          href="/admin/products"
          className={`flex flex-col items-center justify-center py-1 px-3 text-[10px] font-medium transition-colors ${
            pathname.startsWith('/admin/products') ? 'text-amber-300 font-semibold' : 'text-stone-400'
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

      {/* Real-time Order Audio Chime, Mobile Haptics & Sweet Luxury Toast Banner */}
      <AdminOrderNotification />

    </div>
  );
}
