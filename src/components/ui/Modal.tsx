'use client';

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = "md",
}: ModalProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  if (!isOpen || !mounted) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
    full: "max-w-4xl",
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Full-screen Backdrop */}
      <div
        className="fixed inset-0 bg-stone-950/70 backdrop-blur-sm transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Content (Mobile Bottom Sheet & Desktop Centered Dialog) */}
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative w-full bg-ivory border-t sm:border border-stone-200/80 shadow-2xl p-5 sm:p-8 z-10 animate-slide-up max-h-[85vh] sm:max-h-[90vh] overflow-y-auto rounded-t-3xl sm:rounded-2xl",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        {/* Mobile drag handle indicator */}
        <div className="w-12 h-1.5 bg-stone-300 rounded-full mx-auto mb-4 sm:hidden" />

        <button
          onClick={onClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 p-2 text-stone-500 hover:text-stone-900 hover:bg-stone-100 rounded-full transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {title && (
          <div className="mb-4 pr-8">
            <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
              {title}
            </h2>
            {description && (
              <p className="mt-1 text-xs text-stone-500 tracking-wide line-clamp-1 sm:line-clamp-none">
                {description}
              </p>
            )}
          </div>
        )}

        <div>{children}</div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}

