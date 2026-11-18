'use client';

import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { AlertTriangle, AlertCircle, Info, CheckCircle2, Trash2, X } from 'lucide-react';

export type DialogVariant = 'danger' | 'warning' | 'info' | 'success';

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: DialogVariant;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const isAlertOnly = !onConfirm;

  const variantStyles = {
    danger: {
      iconBg: 'bg-red-50 text-red-700 border-red-200',
      icon: <Trash2 className="w-5 h-5 text-red-700" />,
      confirmBtn: 'bg-red-700 hover:bg-red-800 text-white shadow-sm',
    },
    warning: {
      iconBg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: <AlertTriangle className="w-5 h-5 text-amber-700" />,
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white shadow-sm',
    },
    info: {
      iconBg: 'bg-stone-100 text-stone-800 border-stone-200',
      icon: <Info className="w-5 h-5 text-stone-700" />,
      confirmBtn: 'bg-stone-900 hover:bg-oxblood text-white shadow-sm',
    },
    success: {
      iconBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-700" />,
      confirmBtn: 'bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm',
    },
  }[variant];

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="sm">
      <div className="space-y-4 pt-1">
        
        {/* Icon & Heading */}
        <div className="flex items-start gap-3.5">
          <div className={`p-2.5 rounded-xl border shrink-0 ${variantStyles.iconBg}`}>
            {variantStyles.icon}
          </div>

          <div className="min-w-0 flex-1">
            <h3 className="font-serif text-lg sm:text-xl font-bold text-stone-900 leading-snug">
              {title}
            </h3>
            <p className="mt-1.5 text-xs sm:text-sm text-stone-600 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>
        </div>

        {/* Buttons Row */}
        <div className="pt-4 border-t border-stone-200 flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-2.5">
          {!isAlertOnly && (
            <button
              type="button"
              disabled={isLoading}
              onClick={onClose}
              className="w-full sm:w-auto px-5 py-2.5 border border-stone-300 hover:bg-stone-100 text-stone-700 font-semibold text-xs uppercase tracking-wider rounded-xl sm:rounded-lg transition-colors text-center"
            >
              {cancelLabel}
            </button>
          )}

          <button
            type="button"
            disabled={isLoading}
            onClick={() => {
              if (onConfirm) {
                onConfirm();
              } else {
                onClose();
              }
            }}
            className={`w-full sm:w-auto px-6 py-2.5 font-bold text-xs uppercase tracking-wider rounded-xl sm:rounded-lg transition-colors flex items-center justify-center gap-2 ${variantStyles.confirmBtn}`}
          >
            {isLoading ? (
              <span>Processing...</span>
            ) : (
              <span>{isAlertOnly ? (confirmLabel === 'Confirm' ? 'Got It' : confirmLabel) : confirmLabel}</span>
            )}
          </button>
        </div>

      </div>
    </Modal>
  );
}
