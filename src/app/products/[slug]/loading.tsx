import React from "react";

export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-12 animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2 text-xs">
        <div className="h-3 w-12 bg-stone-200 rounded" />
        <span className="text-stone-300">/</span>
        <div className="h-3 w-16 bg-stone-200 rounded" />
        <span className="text-stone-300">/</span>
        <div className="h-3 w-28 bg-stone-200 rounded" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-14 items-start">
        {/* Left Column: Gallery Skeleton */}
        <div className="lg:col-span-7 space-y-4">
          <div className="aspect-[3/4] w-full bg-stone-200/80 rounded-xl" />
          <div className="flex gap-3">
            <div className="w-20 h-24 bg-stone-200/80 rounded-lg" />
            <div className="w-20 h-24 bg-stone-200/80 rounded-lg" />
            <div className="w-20 h-24 bg-stone-200/80 rounded-lg" />
          </div>
        </div>

        {/* Right Column: Info Skeleton */}
        <div className="lg:col-span-5 space-y-6">
          <div className="space-y-2">
            <div className="h-3 w-24 bg-stone-200 rounded" />
            <div className="h-8 w-3/4 bg-stone-200 rounded" />
            <div className="h-6 w-32 bg-stone-200 rounded" />
          </div>

          <div className="h-16 w-full bg-stone-100 rounded-lg border border-stone-200/60" />

          {/* Color Swatches Skeleton */}
          <div className="space-y-2">
            <div className="h-3 w-20 bg-stone-200 rounded" />
            <div className="flex gap-2">
              <div className="w-8 h-8 rounded-full bg-stone-200" />
              <div className="w-8 h-8 rounded-full bg-stone-200" />
            </div>
          </div>

          {/* Add to Bag Button Skeleton */}
          <div className="h-14 w-full bg-stone-300 rounded-lg" />
          <div className="h-12 w-full bg-stone-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}
