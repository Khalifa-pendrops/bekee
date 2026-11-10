'use client';

import React, { useState } from "react";
import Link from "next/link";
import { X, Sparkles } from "lucide-react";

interface AnnouncementBarProps {
  message?: string;
  link?: string;
}

export function AnnouncementBar({
  message = "Bespoke & Ready-to-Wear Fashion from Aba, Abia State • Nationwide Express Dispatch • Free Aba Pickup",
  link = "/shop",
}: AnnouncementBarProps) {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) return null;

  return (
    <div className="bg-oxblood text-ivory-light text-[11px] font-medium tracking-widest uppercase py-2 px-4 relative flex items-center justify-center transition-all select-none border-b border-oxblood-hover">
      <div className="flex items-center gap-2 text-center truncate">
        <Sparkles className="w-3.5 h-3.5 text-gold shrink-0 animate-pulse" />
        <Link href={link} className="hover:underline truncate">
          {message}
        </Link>
      </div>

      <button
        onClick={() => setIsVisible(false)}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-ivory-light/70 hover:text-ivory-light p-1 transition-colors"
        aria-label="Dismiss announcement"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

