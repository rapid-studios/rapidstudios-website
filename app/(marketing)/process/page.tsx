import Link from "next/link";

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
    <div className="pb-24 pt-16" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-24 text-center">
        <h1 className="text-6xl font-black tracking-[-0.08em] text-[var(--color-text-primary)] md:text-[6.5rem]">
          Our Process
        </h1>
        <p className="mx-auto mt-6 max-w-4xl text-2xl leading-relaxed text-[var(--color-text-secondary)]">
          High-velocity delivery from discovery to launch.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="relative">
          <div className="absolute left-1/2 top-0 hidden h-full w-px -translate-x-1/2 bg-[var(--color-brand-primary)]/40 lg:block"></div>
          <div className="space-y-14">
            {processSteps.map((step, index) => {
              const leftAligned = index % 2 === 0;

              return (
                <article
                  className={`grid gap-8 lg:grid-cols-2 ${leftAligned ? "" : "lg:[&>*:first-child]:order-2 lg:[&>*:last-child]:order-1"}`}
                  key={step.step}
                >
                  <div className={leftAligned ? "lg:pr-16" : "lg:pl-16"}>
                    <div className="relative rounded-[2rem] p-8">
                      <p className="absolute -top-8 text-[10rem] font-black leading-none tracking-[-0.1em] text-white/7">
                        {step.step}
                      </p>
                      <p className="relative text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                        {step.title}
                      </p>
                      <p className="relative mt-6 text-xl leading-relaxed text-[var(--color-text-secondary)]">
                        {step.description}
                      </p>
                      <span className="relative mt-6 inline-flex rounded-full border border-[var(--color-brand-accent)]/30 bg-[var(--color-brand-accent)]/10 px-4 py-2 text-sm font-semibold text-[var(--color-brand-accent)]">
                        Rapid Outcome: {rapidOutcomes[index]}
                      </span>
                    </div>
                  </div>
                  <div className="hidden lg:block"></div>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-10">
          <h2 className="text-3xl font-black tracking-[-0.05em] text-[var(--color-text-primary)]">Principles</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {collaborationPrinciples.map((item) => (
            <article className="surface-card p-8" key={item.title}>
              <div className="mb-6 h-12 w-12 rounded-full bg-[var(--color-brand-primary)]/10"></div>
              <h3 className="text-2xl font-black tracking-[-0.04em] text-[var(--color-text-primary)]">{item.title}</h3>
              <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 pt-12">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[var(--color-line-subtle)] bg-[rgba(18,28,42,0.84)] px-10 py-14 text-center">
          <h2 className="text-4xl font-black tracking-[-0.05em] text-[var(--color-text-primary)] md:text-5xl">
            Ready to build?
          </h2>
          <p className="mx-auto mt-5 max-w-3xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
            The process stays structured so direction, design, and build move with less drift and more confidence.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link className="inline-flex rounded-full bg-[var(--color-brand-primary)] px-8 py-4 text-lg font-bold text-white" href="/contact">
              Get Started
            </Link>
            <Link className="inline-flex rounded-full border border-white/10 px-8 py-4 text-lg font-bold text-[var(--color-text-primary)] transition-colors hover:bg-white/5" href="/services">
              Explore Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
