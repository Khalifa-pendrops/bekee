import type { Metadata, Viewport } from "next";
import { Playfair_Display, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { CartDrawer } from "@/components/cart/CartDrawer";
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

export const metadata: Metadata = {
  title: {
    template: "%s | ARUBEKEE COLLECTION - Aba, Nigeria",
    default: "ARUBEKEE COLLECTION | Premium Women's Fashion • Aba, Nigeria",
  },
  description:
    "Curated contemporary women's clothing, footwear, bags, and accessories crafted in Aba, Abia State, Nigeria. Express delivery nationwide and free boutique pickup.",
  keywords: [
    "Aba fashion",
    "women clothing Nigeria",
    "Aba dresses",
    "ready to wear Nigeria",
    "Nigerian fashion designer",
    "Abia State boutique",
    "women shoes Nigeria",
    "handbags Aba",
  ],
  authors: [{ name: "ARUBEKEE COLLECTION" }],
  openGraph: {
    type: "website",
    locale: "en_NG",
    url: "https://arubekee.com",
    siteName: "ARUBEKEE COLLECTION",
    title: "ARUBEKEE COLLECTION | Women's Fashion from Aba, Nigeria",
    description:
      "Distinctive women's clothing, shoes, bags, and accessories from the commercial heart of Nigerian fashion craftsmanship.",
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
      <body className="bg-ivory text-obsidian flex flex-col min-h-screen">
        <CartProvider>
          <WishlistProvider>
            <AnnouncementBar />
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <CartDrawer />
            <MobileBottomNav />
          </WishlistProvider>
        </CartProvider>
      </body>
    </html>
  );
}

