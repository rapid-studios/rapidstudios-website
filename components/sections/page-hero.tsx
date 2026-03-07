import type { ReactNode } from "react";

import { Container } from "@/components/ui/container";

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  aside?: ReactNode;
};

export function PageHero({ eyebrow, title, description, aside }: PageHeroProps) {
  return (
    <section className="pt-10">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
          <div className="surface-card p-7 sm:p-10">
            <p className="inline-flex rounded-full border border-[var(--color-line-subtle)] bg-[rgba(52,109,255,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
              {eyebrow}
            </p>
            <h1 className="mt-5 font-display text-5xl font-bold tracking-[-0.06em] text-[var(--color-text-primary)] sm:text-6xl lg:text-7xl">
              {title}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl">{description}</p>
          </div>
          {aside ? <div className="surface-card p-7 sm:p-8">{aside}</div> : null}
        </div>
      </Container>
    </section>
  );
}
