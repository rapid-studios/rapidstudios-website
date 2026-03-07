import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-[var(--radius-md)] border border-[var(--color-line-subtle)] bg-[rgba(16,24,34,0.82)] px-4 py-4 text-sm text-[var(--color-text-primary)] shadow-[var(--shadow-soft)] outline-none transition-[border-color,box-shadow] duration-[180ms] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-brand-primary)] focus:ring-4 focus:ring-[var(--color-focus-ring)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
