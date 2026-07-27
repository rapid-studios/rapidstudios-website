import Link from "next/link";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { collaborationPrinciples, processSteps } from "@/lib/site-data";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Process",
  description: "Research, design, and build in focused sprints -- how Rapid Studios ships polished products in weeks, not months.",
  pathname: "/process"
});

const rapidOutcomes = [
  "Strategy Roadmap",
  "Locked Direction",
  "High-Fidelity UI",
  "Build-Ready Frontend",
  "Launch Confidence"
] as const;

export default function ProcessPage() {
  return (
    <div className="liquid-page pb-24">
      <Reveal>
        <section className="liquid-hero mx-auto max-w-5xl px-6 text-center">
          <span className="protocol-label justify-center">Process Protocol</span>
          <h1 className="liquid-h1 mt-8">
            Our <span className="gradient-text">Process</span>
          </h1>
          <p className="liquid-lead mx-auto mt-6 max-w-3xl">
            High-velocity delivery from discovery to launch.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.04}>
        <section aria-label="Rapid Studios delivery process" className="mx-auto max-w-5xl px-6 pb-20">
          <div className="relative grid gap-8">
            <div
              aria-hidden="true"
              className="absolute bottom-12 left-[17px] top-12 w-px bg-[var(--color-brand-primary)]/30 sm:left-[23px]"
            />
            {processSteps.map((step, index) => (
              <Reveal className="relative pl-12 sm:pl-16" delay={0.08 + index * 0.05} key={step.step}>
                <div
                  aria-hidden="true"
                  className="absolute left-[10px] top-10 z-10 size-[15px] rounded-full border border-[var(--color-brand-primary)]/60 bg-[var(--color-canvas)] shadow-[0_0_0_6px_color-mix(in_srgb,var(--color-brand-primary)_10%,transparent)] sm:left-4"
                >
                  <span className="absolute inset-[4px] rounded-full bg-[var(--color-brand-primary)]" />
                </div>

                <article className="surface-card interactive-card relative min-h-56 overflow-hidden p-7 sm:p-10">
                  <span
                    aria-hidden="true"
                    className="font-display pointer-events-none absolute -right-2 -top-3 select-none text-[120px] font-bold leading-none tracking-[-0.08em] text-[var(--color-text-primary)] opacity-[0.06] sm:right-5"
                  >
                    {step.step}
                  </span>

                  <div className="relative z-10 max-w-3xl">
                    <p className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">
                      Step {step.step}
                    </p>
                    <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)] sm:text-4xl">
                      {step.title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)] sm:text-lg sm:leading-8">
                      {step.description}
                    </p>
                    <div className="mt-7">
                      <span className="data-chip">Rapid Outcome: {rapidOutcomes[index]}</span>
                    </div>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="mx-auto max-w-7xl px-6 py-8">
          <h2 className="text-4xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-5xl">
            Principles
          </h2>
          <div className="grid gap-6 md:grid-cols-3">
            {collaborationPrinciples.map((item, index) => (
              <Reveal delay={0.12 + index * 0.05} key={item.title}>
                <article className="surface-card h-full p-7 sm:p-8">
                  <span className="data-chip">Principle {String(index + 1).padStart(2, "0")}</span>
                  <h3 className="mt-6 text-2xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
                    {item.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="px-6 pt-20">
          <div className="cta-shell mx-auto max-w-7xl p-8 text-center sm:p-12 md:p-16">
            <h2 className="text-4xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] md:text-5xl">
              Ready to build?
            </h2>
            <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              The process stays structured so direction, design, and build move with less drift and more confidence.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="large">
                <Link href="/contact">Get Started</Link>
              </Button>
              <Button asChild size="large" variant="secondary">
                <Link href="/services">Explore Services</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
