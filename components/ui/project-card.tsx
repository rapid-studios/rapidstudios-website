import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CaseStudyEntry } from "@/types/content";

type ProjectCardProps = {
  study: CaseStudyEntry;
  variant?: "featured" | "grid";
};

export function ProjectCard({ study, variant = "grid" }: ProjectCardProps) {
  return (
    <article className={cn("interactive-card surface-card overflow-hidden p-5 sm:p-6", variant === "featured" && "lg:p-7")}>
      <div
        className={cn(
          "relative overflow-hidden rounded-[var(--radius-lg)] border border-white/40",
          variant === "featured" ? "h-64 sm:h-72" : "h-56"
        )}
        style={{
          background:
            variant === "featured"
              ? "linear-gradient(180deg, rgba(213,229,241,0.96) 0%, rgba(196,220,239,0.92) 100%)"
              : `linear-gradient(135deg, ${study.accentFrom}, ${study.accentTo})`
        }}
      >
        <div
          className={cn(
            "absolute inset-0",
            variant === "featured"
              ? "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.45),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.14),rgba(255,255,255,0.02))]"
              : "bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.3),transparent_42%),radial-gradient(circle_at_bottom_right,rgba(15,23,42,0.18),transparent_52%)]"
          )}
        />
        {variant === "featured" ? null : (
          <div className="absolute inset-6 flex flex-col justify-between rounded-[calc(var(--radius-lg)-8px)] border border-white/20 bg-white/10 p-5 backdrop-blur-sm">
            <div className="flex flex-wrap gap-2">
              {study.services.slice(0, 2).map((service) => (
                <span className="rounded-full border border-white/20 bg-white/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.14em] text-white/88" key={service}>
                  {service}
                </span>
              ))}
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {study.metrics.map((metric) => (
                <div className="rounded-[var(--radius-md)] border border-white/20 bg-white/15 px-4 py-3" key={metric.label}>
                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/70">{metric.label}</p>
                  <p className="mt-2 text-lg font-semibold tracking-[-0.04em] text-white">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {variant === "featured" ? (
        <div className="mt-5">
          <h3 className="font-display text-[1.75rem] font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
            {study.title}
          </h3>
          <p className="mt-3 max-w-xl text-sm leading-7 text-[var(--color-text-secondary)]">{study.summary}</p>
          <Link
            aria-label={`Open ${study.title}`}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-primary)] transition-colors hover:text-[var(--color-brand-primary-hover)]"
            href={`/work/${study.slug}`}
          >
            Read case study
            <ArrowUpRight className="size-4" />
          </Link>
        </div>
      ) : (
        <>
          <div className="mt-6 flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[var(--color-brand-primary)]">
                {study.client} / {study.year}
              </p>
              <h3 className="mt-3 font-display text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                {study.title}
              </h3>
              <p className="mt-3 max-w-xl text-base leading-8 text-[var(--color-text-secondary)]">{study.summary}</p>
            </div>
            <Button asChild size="sm" variant="secondary">
              <Link aria-label={`Open ${study.title}`} href={`/work/${study.slug}`}>
                <ArrowUpRight className="size-4" />
              </Link>
            </Button>
          </div>
          <p className="mt-5 text-sm font-medium text-[var(--color-text-primary)]">{study.highlight}</p>
        </>
      )}
    </article>
  );
}
