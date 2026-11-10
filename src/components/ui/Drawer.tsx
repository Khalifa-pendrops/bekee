'use client';

import React, { useEffect } from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  position?: "left" | "right" | "bottom";
  className?: string;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right",
  className,
}: DrawerProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const positionClasses = {
    right: "top-0 right-0 h-full w-full max-w-md animate-slide-left border-l",
    left: "top-0 left-0 h-full w-full max-w-sm animate-slide-right border-r",
    bottom: "bottom-0 left-0 right-0 max-h-[85vh] w-full animate-slide-up border-t",
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-obsidian/60 backdrop-blur-xs transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Surface */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "fixed bg-ivory border-stone-line shadow-floating z-10 flex flex-col overflow-hidden",
          positionClasses[position],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-line px-5 py-4 bg-ivory-warm">
          <div>
            {title && (
              <h2 className="font-serif text-xl font-normal text-obsidian tracking-tight">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-obsidian-muted mt-0.5">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close drawer"
            className="p-1.5 text-obsidian-subtle hover:text-obsidian hover:bg-ivory-muted transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6">{children}</div>
      </div>
    </div>
  );
}

