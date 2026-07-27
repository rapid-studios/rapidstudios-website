import Link from "next/link";
import { ArrowRight, Bot, Brush, Code2, TrendingUp } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { CmsSizzleReel } from "@/components/sections/cms-sizzle-reel";
import { Button } from "@/components/ui/button";
import { getAllServices } from "@/lib/content/services";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Services",
  description: "From positioning and launch surfaces to AI-powered workflows, we create digital systems that make businesses look sharper and run smoother.",
  pathname: "/services"
});

const serviceIcons = [TrendingUp, Brush, Bot, Code2] as const;

export default function ServicesPage() {
  const services = getAllServices();

  return (
    <div className="pb-24 pt-10">
      <Reveal>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-20 md:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <span className="protocol-label">Operational Capabilities</span>
              <h1 className="mt-8 text-[clamp(3.5rem,7vw,6.4rem)] font-black uppercase leading-[0.9] tracking-[-0.08em] text-[var(--color-text-primary)]">
                Systems built
                <br />
                <span className="text-[var(--color-brand-primary-strong)]">to move fast.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
                From positioning and launch surfaces to AI-powered workflows, we create digital systems that make businesses look sharper and run smoother.
              </p>
            </div>

            <div aria-label="Design CMS sizzle reel" className="min-w-0">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="protocol-label">Client-ready Design CMS</span>
                  <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                    Easy to edit. Safe to publish.
                  </h2>
                </div>
                <p className="max-w-[26ch] text-sm leading-6 text-[var(--color-text-secondary)] sm:text-right">
                  Visual editing, plain-English AI, and guarded approvals.
                </p>
              </div>
              <CmsSizzleReel />
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.04}>
        <section className="mx-auto max-w-7xl px-4 py-8 md:px-6 lg:px-8">
          {services.map((service, index) => {
            const Icon = serviceIcons[index] ?? Code2;

            return (
              <Reveal delay={0.08 + index * 0.06} key={service.slug}>
                <article className="grid gap-6 border-t border-[var(--color-line-subtle)] py-10 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="pr-0 lg:pr-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                      Protocol 0{index + 1}
                    </p>
                    <h2 className="mt-5 text-[clamp(2.9rem,5vw,4.8rem)] font-black uppercase leading-[0.92] tracking-[-0.07em] text-[var(--color-text-primary)]">
                      {service.title}
                    </h2>
                    <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
                      {service.summary}
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                      {service.outcomes.map((outcome, outcomeIndex) => (
                        <Reveal delay={0.12 + index * 0.06 + outcomeIndex * 0.03} key={outcome}>
                          <span className="data-chip">{outcome}</span>
                        </Reveal>
                      ))}
                    </div>
                  </div>

                  <Reveal delay={0.12 + index * 0.06} from="right">
                    <div className="surface-card p-7">
                      <div className="flex items-center justify-between border-b border-[var(--color-line-subtle)] pb-5">
                        <div className="inline-flex size-14 items-center justify-center border border-[var(--color-line-subtle)] bg-[var(--color-surface)] text-[var(--color-brand-accent)]">
                          <Icon className="size-7" />
                        </div>
                        <span className="annotation-tag">Core deliverables</span>
                      </div>
                      <ul className="mt-6 space-y-3 text-base leading-7 text-[var(--color-text-primary)]">
                        {service.deliverables.map((item) => (
                          <li className="flex items-start gap-3" key={item}>
                            <span className="mt-3 h-2 w-2 shrink-0 bg-[var(--color-brand-accent)]" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                      <div className="dossier-tape dossier-tape--tight mt-8 border border-[var(--color-line-subtle)] bg-[var(--color-surface)] p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                          Outcome signal
                        </p>
                        <p className="mt-3 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                          {service.outcomeSignal}
                        </p>
                      </div>
                    </div>
                  </Reveal>
                </article>
              </Reveal>
            );
          })}
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="mx-auto max-w-7xl px-4 py-12 md:px-6 lg:px-8">
          <div className="grid gap-6 md:grid-cols-2">
            <Reveal delay={0.12}>
              <article className="surface-card p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                  Engagement
                </p>
                <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                  Project-based sprints
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                  Best when you need a focused surface, launch-ready build, or high-impact system shipped quickly.
                </p>
              </article>
            </Reveal>
            <Reveal delay={0.16}>
              <article className="surface-card p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                  Partnership
                </p>
                <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                  Ongoing retainer
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                  Best for teams that need a design-and-build partner for continuous updates, workflow automation, and growth work.
                </p>
              </article>
            </Reveal>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="px-4 pt-10 md:px-6 lg:px-8">
          <div className="cta-shell mx-auto max-w-7xl p-10 text-center md:p-16">
            <span className="protocol-label justify-center">Ready to build</span>
            <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.06em] text-[var(--color-text-primary)] md:text-6xl">
              Operational clarity,
              <br />
              shipped in code.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Strategy, design, automation, and frontend in one streamlined process so your business launches with more clarity and less friction.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="large">
                <Link href="/contact">
                  Start a Project
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild size="large" variant="secondary">
                <Link href="/work">View Case Studies</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
