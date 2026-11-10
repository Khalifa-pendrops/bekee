'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { AnnouncementBar } from '@/components/layout/AnnouncementBar';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { MobileBottomNav } from '@/components/layout/MobileBottomNav';
import { CartDrawer } from '@/components/cart/CartDrawer';

interface StorefrontShellProps {
  children: React.ReactNode;
}

export function StorefrontShell({ children }: StorefrontShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  // If inside the admin area, do not render consumer storefront chrome
  if (isAdmin) {
    return <main className="flex-1 w-full max-w-full overflow-x-hidden min-w-0">{children}</main>;
  }

  // Consumer storefront: full chrome with announcement bar, header, drawer, footer, and bottom navigation
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden min-w-0">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 w-full max-w-full overflow-x-hidden min-w-0">{children}</main>
      <Footer />
      <CartDrawer />
      <MobileBottomNav />
    </div>
  );
}

