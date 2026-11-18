import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import React, { Suspense } from "react";
import { StorefrontShell } from "@/components/layout/StorefrontShell";
import { NavigationProgress } from "@/components/layout/NavigationProgress";
import { CartProvider } from "@/context/CartContext";
import { WishlistProvider } from "@/context/WishlistContext";

const serifFont = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const sansFont = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL && !process.env.NEXT_PUBLIC_SITE_URL.includes('localhost')
  ? process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  : 'https://arubekeecollection.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    template: "%s | ARUBEKEE COLLECTION - Aba, Nigeria",
    default: "ARUBEKEE COLLECTION | Curated Women's Fashion • Aba, Nigeria",
  },
  description:
    "Curated contemporary women's clothing, footwear, bags, and statement accessories handpicked in Aba, Abia State, Nigeria. Express delivery nationwide and free boutique pickup.",
  keywords: [
    "Aba fashion",
    "women clothing Nigeria",
    "Aba dresses",
    "ready to wear Nigeria",
    "Nigerian fashion boutique",
    "Abia State boutique",
    "women shoes Nigeria",
    "handbags Aba",
  ],
  authors: [{ name: "ARUBEKEE COLLECTION" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: siteUrl,
    siteName: "ARUBEKEE COLLECTION",
    title: "ARUBEKEE COLLECTION | Curated Women's Fashion • Aba, Nigeria",
    description:
      "Curated contemporary women's clothing, footwear, bags, and statement accessories handpicked in Aba, Abia State, Nigeria.",
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: "ARUBEKEE COLLECTION - Curated Contemporary Fashion",
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "ARUBEKEE COLLECTION | Curated Women's Fashion • Aba, Nigeria",
    description: "Curated contemporary women's clothing, footwear, bags, and statement accessories handpicked in Aba, Abia State, Nigeria.",
    images: ['/og-image.jpg'],
  },
};

export const viewport: Viewport = {
  themeColor: "#54121B",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${serifFont.variable} ${sansFont.variable}`}>
      <body className="bg-ivory text-obsidian flex flex-col min-h-screen w-full max-w-full min-w-0 relative">
        <Suspense fallback={null}>
          <NavigationProgress />
        </Suspense>
        <CartProvider>
          <WishlistProvider>
            <StorefrontShell>{children}</StorefrontShell>
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

