import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

export const buttonVariants = cva(
  "inline-flex items-center justify-center font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-oxblood focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-oxblood text-ivory-light hover:bg-oxblood-hover shadow-subtle border border-oxblood-hover",
        secondary:
          "bg-obsidian text-ivory-light hover:bg-obsidian-soft shadow-subtle",
        outline:
          "border border-stone-line bg-transparent text-obsidian hover:bg-ivory-muted hover:border-obsidian-muted",
        ghost:
          "bg-transparent text-obsidian hover:bg-ivory-muted hover:text-obsidian-soft",
        gold:
          "bg-gold text-obsidian font-semibold hover:bg-gold-light shadow-subtle",
        danger:
          "bg-status-danger text-ivory-light hover:opacity-90 shadow-subtle",
        whatsapp:
          "bg-[#25D366] text-white hover:bg-[#20BD5A] shadow-subtle",
      },
      size: {
        sm: "h-9 px-4 text-xs tracking-wider uppercase font-semibold rounded-lg",
        md: "h-11 px-6 text-sm tracking-wide rounded-lg font-medium",
        lg: "h-13 px-8 text-base tracking-wide rounded-xl font-medium",
        icon: "h-10 w-10 p-0 rounded-full",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

