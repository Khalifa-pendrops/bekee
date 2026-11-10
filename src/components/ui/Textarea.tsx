import React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-xs font-semibold uppercase tracking-wider text-obsidian-soft"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[90px] w-full bg-ivory-light border border-stone-line px-3.5 py-2.5 text-sm text-obsidian placeholder:text-obsidian-subtle/60 focus-visible:outline-none focus-visible:border-oxblood focus-visible:ring-1 focus-visible:ring-oxblood disabled:cursor-not-allowed disabled:opacity-50 transition-colors resize-y",
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

Textarea.displayName = "Textarea";

