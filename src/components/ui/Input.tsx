import React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, label, error, hint, id, ...props }, ref) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-xs font-semibold uppercase tracking-wider text-obsidian-soft"
          >
            {label}
          </label>
        )}
        <input
          type={type}
          id={inputId}
          className={cn(
            "flex h-11 w-full bg-ivory-light border border-stone-line px-3.5 py-2 text-sm text-obsidian placeholder:text-obsidian-subtle/60 focus-visible:outline-none focus-visible:border-oxblood focus-visible:ring-1 focus-visible:ring-oxblood disabled:cursor-not-allowed disabled:opacity-50 transition-colors",
            error && "border-status-danger focus-visible:border-status-danger focus-visible:ring-status-danger",
            className
          )}
          ref={ref}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-obsidian-subtle">{hint}</p>
        )}
        {error && (
          <p className="text-xs font-medium text-status-danger">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

