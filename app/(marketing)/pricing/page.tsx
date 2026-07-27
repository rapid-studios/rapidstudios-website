import Link from "next/link";
import { Check } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo/metadata";
import { engagementModels } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Engagements",
  description: "Focused sprints, full website engagements, and ongoing studio partnerships tailored around the work.",
  pathname: "/pricing"
});

const engagementFaqs = [
  {
    question: "How is an engagement scoped?",
    answer:
      "Every engagement is anchored to a clear outcome, page set, and launch timeline before work starts. That keeps the process fast and avoids the bloated feel of agency-style overhead."
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
      "Yes. The options shown here are the cleanest starting points, but custom engagements are available when the work spans more surfaces, approvals, or implementation depth."
  }
] as const;

export default function PricingPage() {
  return (
    <div className="liquid-page pb-24">
      <Reveal>
        <section className="liquid-hero mx-auto max-w-5xl px-6 text-center">
          <span className="protocol-label justify-center">Engagement options</span>
          <h1 className="liquid-h1 mt-8">
            Find the right <span className="gradient-text">engagement</span>
          </h1>
          <p className="liquid-lead mx-auto mt-6 max-w-3xl">
            Premium engagements, clear scope, and fast starts. The goal is momentum and polish, not a cheap-feeling menu of deliverables.
          </p>
        </section>
      </Reveal>

      <Reveal delay={0.04}>
        <section aria-label="Engagement options" className="mx-auto max-w-7xl px-6 pb-10">
          <div className="grid gap-8 lg:grid-cols-3 lg:items-stretch">
            {engagementModels.map((plan, index) => {
              const featured = Boolean(plan.featured);

              return (
                <Reveal className="relative flex h-full pt-4" delay={0.08 + index * 0.05} key={plan.name}>
                  {featured ? (
                    <span className="data-chip absolute left-1/2 top-0 z-10 -translate-x-1/2 whitespace-nowrap">
                      Most popular
                    </span>
                  ) : null}

                  <article
                    className={`surface-card interactive-card relative flex flex-1 flex-col p-7 sm:p-8 ${
                      featured
                        ? "border-[var(--color-brand-primary)]/45 shadow-[0_40px_80px_color-mix(in_srgb,var(--color-brand-primary)_18%,transparent)]"
                        : ""
                    }`}
                  >
                    <div className="border-b border-[var(--color-line-subtle)] pb-6">
                      <p className="text-[11.5px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">
                        {featured ? "Featured engagement" : "Engagement model"}
                      </p>
                      <h2 className="mt-4 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
                        {plan.name}
                      </h2>
                    </div>

                    <p className="mt-6 text-base leading-7 text-[var(--color-text-secondary)]">{plan.summary}</p>

                    <ul className="mt-7 flex flex-1 flex-col gap-3 border-t border-[var(--color-line-subtle)] pt-6">
                      {plan.details.map((item) => (
                        <li className="flex gap-3 text-sm leading-7 text-[var(--color-text-secondary)]" key={item}>
                          <Check
                            aria-hidden="true"
                            className="mt-1 size-5 shrink-0 text-[var(--color-brand-primary)]"
                          />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="mx-auto max-w-5xl px-6 pb-24 pt-16">
          <div className="cta-shell p-8 text-center sm:p-12 md:p-16">
            <h2 className="text-4xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] md:text-5xl">
              Not sure which fits?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              We can map the right engagement quickly if you share the launch goal, the pages in scope, and how fast you need to move.
            </p>
            <Button asChild className="mt-8" size="large">
              <Link href="/contact">Book a Discovery Call</Link>
            </Button>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="mx-auto max-w-5xl px-6">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:items-start">
            <div>
              <h2 className="text-4xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)]">
                Frequently Asked Questions
              </h2>
              <p className="mt-4 text-sm leading-7 text-[var(--color-text-secondary)]">
                These engagement options are meant to keep expectations clear. If the answer is not here, a short call will usually settle scope fast.
              </p>
            </div>

            <div className="surface-card px-7 py-3 sm:px-8">
              {engagementFaqs.map((faq, index) => (
                <details
                  className="group border-b border-[var(--color-line-subtle)] py-5 last:border-b-0"
                  key={faq.question}
                  open={index === 0}
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus-ring)]">
                    <span className="text-base font-semibold text-[var(--color-text-primary)]">{faq.question}</span>
                    <span
                      aria-hidden="true"
                      className="text-2xl leading-none text-[var(--color-brand-primary)] transition-transform group-open:rotate-45 motion-reduce:transition-none"
                    >
                      +
                    </span>
                  </summary>
                  <p className="pb-2 pt-4 text-sm leading-7 text-[var(--color-text-secondary)]">{faq.answer}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
