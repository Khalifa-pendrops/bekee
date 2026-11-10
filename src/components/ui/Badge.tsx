import React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

export const badgeVariants = cva(
  "inline-flex items-center px-2 py-0.5 text-xs font-semibold tracking-wider uppercase transition-colors select-none",
  {
    variants: {
      variant: {
        default: "bg-obsidian text-ivory-light",
        sale: "bg-oxblood text-ivory-light",
        new: "bg-ivory-muted text-obsidian border border-stone-line",
        gold: "bg-gold text-obsidian font-bold",
        success: "bg-status-successBg text-status-success border border-status-success/20",
        warning: "bg-status-warningBg text-status-warning border border-status-warning/20",
        danger: "bg-status-dangerBg text-status-danger border border-status-danger/20",
        info: "bg-status-infoBg text-status-info border border-status-info/20",
        outline: "text-obsidian border border-stone-line bg-transparent",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

