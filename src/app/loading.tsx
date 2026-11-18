import React from "react";

export default function GlobalLoading() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-10 h-10 border-2 border-stone-200 border-t-oxblood rounded-full animate-spin" />
      <span className="text-[11px] uppercase tracking-widest text-stone-500 font-semibold animate-pulse">
        ARUBEKEE COLLECTION
      </span>
    </div>
  );
}
