import * as React from "react";

import { cn } from "@/lib/utils";

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => (
    <textarea
      className={cn(
        "min-h-36 w-full rounded-xl border border-[var(--color-input-border)] bg-[var(--color-input-fill)] px-4 py-4 text-sm leading-7 text-[var(--color-text-primary)] shadow-[var(--shadow-input)] outline-none transition-[border-color,box-shadow,background-color] duration-[180ms] placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-focus-ring)] focus:ring-4 focus:ring-[var(--color-focus-soft)] disabled:cursor-not-allowed disabled:bg-[var(--color-surface-muted)]",
        className
      )}
      ref={ref}
      {...props}
    />
  )
);

Textarea.displayName = "Textarea";
