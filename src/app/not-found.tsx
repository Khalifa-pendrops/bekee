import React from 'react';
import Link from 'next/link';
import { ArrowRight, Compass, Home, MessageCircle, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/Button';

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16 sm:py-24 bg-ivory text-center">
      <div className="max-w-md mx-auto space-y-6">
        <span className="text-[11px] font-bold uppercase tracking-widest text-oxblood">
          404 • Page Not Found
        </span>

        <h1 className="editorial-heading text-3xl sm:text-4xl text-obsidian font-normal">
          This piece appears to have moved.
        </h1>

        <p className="text-xs sm:text-sm text-obsidian-muted leading-relaxed">
          The fashion piece or page you are looking for may have been updated, sold out, or moved to our main boutique catalog.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Link href="/shop" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full gap-2">
              <Compass className="w-4 h-4" />
              <span>Explore Shop</span>
            </Button>
          </Link>

          <Link href="/" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full border-stone-line gap-2">
              <Home className="w-4 h-4" />
              <span>Back Home</span>
            </Button>
          </Link>
        </div>

        <div className="pt-8 border-t border-stone-line/60">
          <p className="text-[11px] text-obsidian-subtle">
            Need urgent assistance finding a specific Aba outfit?{' '}
            <a
              href="https://wa.me/2348030001234?text=Hello%20Arubekee%20Collection,%20I%20am%20looking%20for%20an%20item"
              target="_blank"
              rel="noopener noreferrer"
              className="text-oxblood font-semibold underline hover:text-obsidian"
            >
              Chat directly on WhatsApp
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

