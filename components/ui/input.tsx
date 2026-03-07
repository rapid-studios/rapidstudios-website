import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      className={cn(
        "h-13 w-full rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[rgba(16,24,34,0.82)] px-4 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-soft)] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Input.displayName = "Input";
