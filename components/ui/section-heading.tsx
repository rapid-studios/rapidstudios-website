import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type SectionHeadingProps = {
  eyebrow?: string;
  title: string;
  description: string;
  action?: ReactNode;
  align?: "left" | "split";
  className?: string;
};

export function SectionHeading({
  eyebrow,
  title,
  description,
  action,
  align = "left",
  className
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-4",
        align === "split" && "gap-6 lg:flex-row lg:items-end lg:justify-between",
        className
      )}
    >
      <div className="max-w-2xl">
        {eyebrow ? (
          <p className="mb-3 inline-flex rounded-full border border-[var(--color-line-subtle)] bg-white/75 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary)] shadow-[var(--shadow-soft)]">
            {eyebrow}
          </p>
        ) : null}
        <h2 className="font-display text-4xl font-bold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-5xl">
          {title}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
          {description}
        </p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
