import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo/metadata";
import { pricingPlans } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Pricing",
  description: "Transparent pricing for focused sprints, full website engagements, and ongoing studio partnerships.",
  pathname: "/pricing"
});

const pricingFaqs = [
  {
    question: "How is pricing scoped?",
    answer:
      "Every engagement is anchored to a clear outcome, page set, and launch timeline before work starts. That keeps the process fast and avoids the bloated feel of agency-style estimates."
  },
  {
    question: "Can scope expand after kickoff?",
    answer:
      "Yes. If a sprint turns into a broader site or retained partnership, the work is re-scoped into the next best engagement model instead of getting buried in change-order friction."
  },
  {
    question: "How fast can we start?",
    answer:
      "Most projects can begin within a few business days once direction, availability, and source material are aligned."
  },
  {
    question: "Do you handle custom or larger engagements?",
    answer:
      "Yes. The published offers are the cleanest starting points, but custom engagements are available when the work spans more surfaces, approvals, or implementation depth."
  }
] as const;

function getPriceSuffix(planName: string, price: string) {
  if (price.toLowerCase() === "custom") {
    return "";
  }

  if (planName.toLowerCase().includes("sprint")) {
    return "/project";
  }

  return "/engagement";
}

export default function PricingPage() {
  return (
    <div className="pb-24 pt-16" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <section className="px-4 pb-16 pt-24">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-brand-primary)]/20 bg-[var(--color-brand-primary)]/10 px-4 py-2 text-xs font-black uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">
            <span className="h-2 w-2 rounded-full bg-[var(--color-brand-primary)] shadow-[0_0_14px_rgba(59,138,240,0.65)]" />
            High-velocity product studio
          </div>
          <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-[-0.08em] text-[var(--color-text-primary)] md:text-7xl">
            Simple, High-Velocity <span className="text-[var(--color-brand-primary)]">Pricing</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)] md:text-xl">
            Premium engagements, clear scope, and fast starts. The goal is momentum and polish, not a cheap-feeling menu of deliverables.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-3 md:items-start">
          {pricingPlans.map((plan) => {
            const featured = Boolean(plan.featured);

            return (
              <article
                className={`group relative flex h-full flex-col gap-6 rounded-[2rem] p-8 backdrop-blur-sm transition-all ${
                  featured
                    ? "border-2 border-[var(--color-brand-primary)] bg-[rgba(8,18,32,0.98)] shadow-[0_0_40px_-12px_rgba(59,138,240,0.4)] md:scale-[1.03]"
                    : "border border-[var(--color-line-subtle)] bg-[rgba(12,20,32,0.8)] hover:border-white/16"
                }`}
                key={plan.name}
              >
                {featured ? (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--color-brand-accent)] px-4 py-1.5 text-xs font-black uppercase tracking-[0.18em] text-[#0b1020] shadow-lg">
                    Most popular
                  </div>
                ) : null}

                <div className="flex flex-col gap-2">
                  <h2 className="text-xl font-bold text-[var(--color-text-primary)]">{plan.name}</h2>
                  <p className="text-sm leading-6 text-[var(--color-text-secondary)]">{plan.summary}</p>
                  <p className="mt-4 flex items-baseline gap-1 text-[var(--color-text-primary)]">
                    <span className="text-5xl font-black tracking-[-0.06em]">{plan.price}</span>
                    {getPriceSuffix(plan.name, plan.price) ? (
                      <span className="text-base font-medium opacity-60">{getPriceSuffix(plan.name, plan.price)}</span>
                    ) : null}
                  </p>
                </div>

                <Button
                  asChild
                  className={
                    featured
                      ? "h-12 text-sm font-bold shadow-lg shadow-[rgba(59,138,240,0.24)]"
                      : "h-12 bg-white/6 text-sm font-bold text-[var(--color-text-primary)] hover:bg-white/10 hover:text-[var(--color-text-primary)]"
                  }
                  variant={featured ? "primary" : "secondary"}
                >
                  <Link href="/contact">{plan.cta}</Link>
                </Button>

                <div className="flex flex-col gap-4 border-t border-white/8 pt-4">
                  {plan.details.map((item) => (
                    <div className="flex gap-3 text-sm font-medium text-[var(--color-text-secondary)]" key={item}>
                      <Check className="mt-0.5 size-5 text-[var(--color-brand-primary)]" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </main>

      <section className="mx-auto max-w-4xl px-4 py-24">
        <div className="flex flex-col gap-12 md:flex-row">
          <div className="md:w-1/3">
            <h2 className="text-3xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
              The public pricing page is meant to keep expectations clear. If the answer is not here, a short call will usually settle scope fast.
            </p>
          </div>

          <div className="flex flex-1 flex-col divide-y divide-white/8">
            {pricingFaqs.map((faq, index) => (
              <details className="group py-4" key={faq.question} open={index === 0}>
                <summary className="flex cursor-pointer list-none items-center justify-between gap-6">
                  <p className="text-base font-semibold text-[var(--color-text-primary)]">{faq.question}</p>
                  <span className="text-2xl leading-none text-[var(--color-text-secondary)] transition-transform group-open:rotate-45">
                    +
                  </span>
                </summary>
                <div className="pb-2 pt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{faq.answer}</div>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-24">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/8 bg-[rgba(4,11,23,0.96)] p-12 text-center shadow-2xl md:p-16">
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "radial-gradient(circle at 2px 2px, rgba(59,138,240,0.5) 1px, transparent 0)",
              backgroundSize: "24px 24px"
            }}
          />
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-[-0.05em] text-[var(--color-text-primary)] md:text-4xl">
              Not sure which fits?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              We can map the right engagement quickly if you share the launch goal, the pages in scope, and how fast you need to move.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild className="px-8 text-base font-bold" size="large">
                <Link href="/contact">Let&apos;s talk</Link>
              </Button>
              <Button asChild className="px-8 text-base font-bold" size="large" variant="secondary">
                <Link href="/work">
                  View Case Studies
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
