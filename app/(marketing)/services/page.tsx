import Link from "next/link";
import { ArrowRight, Brush, Code2, TrendingUp } from "lucide-react";

import { getAllServices } from "@/lib/content/services";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Services",
  description: "Premium product-studio services across strategy, design, and engineering.",
  pathname: "/services"
});

const serviceIcons = [TrendingUp, Brush, Code2] as const;

export default function ServicesPage() {
  const services = getAllServices();

  return (
    <div className="pb-24 pt-16" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-24 text-center">
        <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-[var(--color-line-subtle)] bg-[var(--color-brand-primary)]/10 px-4 py-2 text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
          Our capabilities
        </div>
        <h1 className="mt-8 text-6xl font-black tracking-[-0.08em] text-[var(--color-text-primary)] md:text-[6.5rem]">
          Our Services
        </h1>
        <p className="mx-auto mt-6 max-w-4xl text-2xl leading-relaxed text-[var(--color-text-secondary)]">
          Premium product studio delivering strategy, design, and engineering excellence for category-defining startups.
        </p>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        {services.map((service, index) => {
          const Icon = serviceIcons[index] ?? Code2;

          return (
            <article
              className="grid items-center gap-8 border-t border-[var(--color-brand-primary)]/70 py-12 md:grid-cols-[1fr_0.95fr]"
              key={service.slug}
            >
              <div>
                <div className="flex flex-wrap items-end gap-4">
                  <p className="text-6xl font-black leading-none tracking-[-0.08em] text-[var(--color-brand-primary)] md:text-7xl">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h2 className="text-[clamp(2.85rem,4.8vw,4.8rem)] font-black leading-[0.92] tracking-[-0.06em] text-[var(--color-text-primary)]">
                    {service.title}
                  </h2>
                </div>
                <p className="mt-6 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
                  {service.summary}
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  {service.outcomes.map((outcome) => (
                    <span
                      className="rounded-full border border-[var(--color-line-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-brand-accent)]"
                      key={outcome}
                    >
                      {outcome}
                    </span>
                  ))}
                </div>
              </div>

              <div className="surface-card p-8">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                  <Icon className="size-7" />
                </div>
                <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                  Core Deliverables
                </h3>
                <ul className="mt-5 space-y-3 text-base leading-7 text-[var(--color-text-primary)]">
                  {service.deliverables.map((item) => (
                    <li className="flex items-start gap-3" key={item}>
                      <span className="mt-2 h-2 w-2 rounded-full bg-[var(--color-brand-primary)]"></span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8 rounded-[1.5rem] border border-[var(--color-line-subtle)] bg-white/3 p-5">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
                    Outcome signal
                  </p>
                  <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-[var(--color-brand-accent)]">
                    {index === 0 ? "Sharper offer framing" : index === 1 ? "Premium launch-ready UI" : "Production-grade frontend"}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="mx-auto max-w-7xl px-4 py-12">
        <div className="grid gap-6 md:grid-cols-2">
          <article className="surface-card p-8">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Engagement</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--color-text-primary)]">
              Project-based sprints
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Best when you need a homepage, core page system, or launch surface tightened and shipped quickly.
            </p>
          </article>
          <article className="surface-card p-8">
            <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Partnership</p>
            <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--color-text-primary)]">
              Monthly retainer
            </h2>
            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
              Better for ongoing launches, iterative product marketing, and teams that need a design-build partner on call.
            </p>
          </article>
        </div>
      </section>

      <section className="px-4 pt-10">
        <div className="cta-shell relative mx-auto max-w-7xl overflow-hidden p-12 text-center text-white md:p-20">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-black blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">Ready to Start?</h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/82">
              Bring the strategy, design, and engineering into one pass so the site feels coherent from the first frame through launch.
            </p>
            <Link className="mt-8 inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-lg font-bold text-[var(--color-brand-primary)]" href="/contact">
              Contact Us
              <ArrowRight className="size-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
