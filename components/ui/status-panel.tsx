import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const statusPanelVariants = cva("dossier-tape dossier-tape--tight relative overflow-hidden rounded-[var(--radius-lg)] border p-6 shadow-[var(--shadow-soft)] sm:p-8", {
  variants: {
    tone: {
      default: "border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)]",
      success: "border-emerald-500/35 bg-emerald-500/8",
      error: "border-rose-400/35 bg-rose-500/8",
      muted: "border-[var(--color-line-subtle)] bg-[var(--color-surface)]"
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
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-[linear-gradient(90deg,var(--color-brand-accent),transparent_38%,var(--color-brand-primary-strong))]" />
      {meta ? (
        <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">{meta}</p>
      ) : null}
      <h3 className="font-display text-2xl font-black uppercase tracking-[-0.04em] text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)] sm:text-base">
        {description}
      </p>
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}
