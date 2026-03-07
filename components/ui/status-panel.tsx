import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusPanelVariants = cva("rounded-[var(--radius-xl)] border p-6 shadow-[var(--shadow-soft)] sm:p-8", {
  variants: {
    tone: {
      default: "border-[var(--color-line-subtle)] bg-[rgba(18,28,42,0.86)]",
      success: "border-emerald-500/25 bg-emerald-500/8",
      error: "border-rose-500/25 bg-rose-500/8",
      muted: "border-[var(--color-line-subtle)] bg-[var(--color-surface-muted)]"
    }
  },
  defaultVariants: {
    tone: "default"
  }
});

type StatusPanelProps = VariantProps<typeof statusPanelVariants> & {
  title: string;
  description: string;
  action?: ReactNode;
  meta?: string;
  className?: string;
};

export function StatusPanel({
  title,
  description,
  action,
  meta,
  tone,
  className
}: StatusPanelProps) {
  return (
    <div className={cn(statusPanelVariants({ tone }), className)}>
      {meta ? (
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">{meta}</p>
      ) : null}
      <h3 className="font-display text-2xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
