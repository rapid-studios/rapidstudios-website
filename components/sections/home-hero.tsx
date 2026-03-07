import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";

const structureItems = ["/", "/work", "/work/[slug]", "/services", "/process", "/contact", "/pricing"];

export function HomeHero() {
  return (
    <section className="pt-10">
      <Container>
        <div className="grid gap-6 lg:grid-cols-[1.12fr_0.88fr]">
          <Reveal className="surface-card p-7 sm:p-10 lg:p-12">
            <p className="inline-flex rounded-full border border-[var(--color-line-subtle)] bg-[rgba(52,109,255,0.1)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--color-brand-primary)] shadow-[var(--shadow-soft)]">
              Product studio + frontend delivery
            </p>
            <h1 className="mt-6 max-w-[9ch] font-display text-[clamp(4.25rem,8.1vw,6.7rem)] font-bold leading-[0.9] tracking-[-0.075em] text-[var(--color-text-primary)]">
              Agency-grade websites for product teams that need momentum.
            </h1>
            <p className="mt-5 max-w-[42rem] text-base leading-8 text-[var(--color-text-secondary)] sm:text-lg">
              Premium positioning, clean section rhythm, sharp case-study storytelling, and subtle motion tuned for trust and conversion.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="large">
                <Link href="/contact">
                  Book discovery
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild size="large" variant="secondary">
                <Link href="/services">See capabilities</Link>
              </Button>
            </div>
          </Reveal>

          <div className="grid gap-6">
            <Reveal className="surface-card p-7 sm:p-8" delay={0.06}>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                Launch-ready structure
              </h2>
              <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
                The site ships with the core page set already planned, so design and code stay aligned from the start.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                {structureItems.map((item) => (
                  <span className="rounded-full border border-[var(--color-line-subtle)] bg-white/80 px-3 py-2 text-sm text-[var(--color-text-secondary)]" key={item}>
                    {item}
                  </span>
                ))}
              </div>
            </Reveal>

            <Reveal className="surface-card p-7 sm:p-8" delay={0.12}>
              <h2 className="font-display text-2xl font-semibold tracking-[-0.05em] text-[var(--color-text-primary)]">
                Homepage rhythm
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                Hero, trust, services, featured work, process, testimonials, CTA, footer.
              </p>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-white/78 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Routes planned</p>
                  <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">7</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-white/78 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Homepage sections</p>
                  <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">8</p>
                </div>
                <div className="rounded-[var(--radius-lg)] border border-[var(--color-line-subtle)] bg-white/78 p-4 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Core service pillars</p>
                  <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.04em] text-[var(--color-text-primary)]">4</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
