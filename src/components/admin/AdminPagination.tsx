'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdminPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  itemName?: string;
  baseUrl?: string;
  searchParams?: Record<string, string | undefined | null>;
  onPageChange?: (page: number) => void;
  className?: string;
}

export function AdminPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  itemName = 'items',
  baseUrl,
  searchParams = {},
  onPageChange,
  className = '',
}: AdminPaginationProps) {
  if (totalItems <= 0) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Helper to build URL for a specific page
  const buildPageUrl = (page: number) => {
    if (!baseUrl) return '#';
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([k, v]) => {
      if (v && k !== 'page') params.set(k, v);
    });
    params.set('page', page.toString());
    return `${baseUrl}?${params.toString()}`;
  };

  // Generate page numbers with intelligent ellipsis
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('ellipsis');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('ellipsis');
      pages.push(totalPages);
    }
    return pages;
  };

  const renderPageButton = (page: number) => {
    const isActive = page === currentPage;
    const baseClasses = `min-w-[34px] h-[34px] px-2.5 text-xs font-semibold rounded-lg flex items-center justify-center transition-all ${
      isActive
        ? 'bg-stone-900 text-white shadow-sm ring-1 ring-stone-900'
        : 'bg-white text-stone-700 hover:bg-stone-100 hover:text-stone-900 border border-stone-200'
    }`;

    if (onPageChange) {
      return (
        <button
          key={page}
          type="button"
          onClick={() => onPageChange(page)}
          className={baseClasses}
          aria-current={isActive ? 'page' : undefined}
        >
          {page}
        </button>
      );
    }

    return (
      <Link
        key={page}
        href={buildPageUrl(page)}
        className={baseClasses}
        aria-current={isActive ? 'page' : undefined}
      >
        {page}
      </Link>
    );
  };

  const isPrevDisabled = currentPage <= 1;
  const isNextDisabled = currentPage >= totalPages;

  return (
    <div
      className={`p-4 bg-stone-50 border-t border-stone-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs select-none ${className}`}
    >
      {/* Item Range Text */}
      <div className="text-stone-600 font-medium text-center sm:text-left">
        Showing{' '}
        <span className="font-bold text-stone-900">{startItem}</span> to{' '}
        <span className="font-bold text-stone-900">{endItem}</span> of{' '}
        <span className="font-bold text-stone-900">{totalItems}</span> {itemName}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1.5">
          {/* Previous Button */}
          {onPageChange ? (
            <button
              type="button"
              disabled={isPrevDisabled}
              onClick={() => onPageChange(currentPage - 1)}
              className={`h-[34px] px-2.5 sm:px-3 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border ${
                isPrevDisabled
                  ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200 shadow-xs'
              }`}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
          ) : (
            <Link
              href={isPrevDisabled ? '#' : buildPageUrl(currentPage - 1)}
              className={`h-[34px] px-2.5 sm:px-3 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border ${
                isPrevDisabled
                  ? 'bg-stone-100 text-stone-300 border-stone-200 pointer-events-none'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200 shadow-xs'
              }`}
              aria-disabled={isPrevDisabled}
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Prev</span>
            </Link>
          )}

          {/* Numbered Page Buttons */}
          <div className="flex items-center gap-1">
            {getPageNumbers().map((item, idx) =>
              item === 'ellipsis' ? (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-7 text-center text-stone-400 font-bold"
                >
                  ...
                </span>
              ) : (
                renderPageButton(item)
              )
            )}
          </div>

          {/* Next Button */}
          {onPageChange ? (
            <button
              type="button"
              disabled={isNextDisabled}
              onClick={() => onPageChange(currentPage + 1)}
              className={`h-[34px] px-2.5 sm:px-3 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border ${
                isNextDisabled
                  ? 'bg-stone-100 text-stone-300 border-stone-200 cursor-not-allowed'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200 shadow-xs'
              }`}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={isNextDisabled ? '#' : buildPageUrl(currentPage + 1)}
              className={`h-[34px] px-2.5 sm:px-3 text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors border ${
                isNextDisabled
                  ? 'bg-stone-100 text-stone-300 border-stone-200 pointer-events-none'
                  : 'bg-white text-stone-700 hover:bg-stone-100 border-stone-200 shadow-xs'
              }`}
              aria-disabled={isNextDisabled}
            >
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      )}
    </div>
  );
}

