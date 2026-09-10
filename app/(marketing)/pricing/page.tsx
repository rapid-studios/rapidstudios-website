import Link from "next/link";
import { Check } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getFaqSchema } from "@/lib/seo/json-ld";
import { PageStructuredData } from "@/components/seo/page-structured-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { engagementModels } from "@/lib/site-data";

const pageSeo = {
  title: "Engagements",
  description: "Compare focused projects, complete website or app builds, and ongoing support. Get a scope-based quote and answers about timing, ownership, and integrations.",
  pathname: "/pricing"
};

export const metadata = buildMetadata(pageSeo);

const engagementFaqs = [
  {
    question: "What will my project cost?",
    answer:
      "We quote the agreed scope rather than publish one price for every project. Share the outcome you need, the pages or features involved, your existing tools, and your timing. The proposal sets out deliverables, dependencies, and cost before work begins."
  },
  {
    question: "Can you work with our existing website and tools?",
    answer:
      "We review what you already use before recommending a build or replacement. Integrations depend on the access, APIs, and permissions your tools provide. Bring the names of your website platform, booking system, CRM, or other key tools to the first conversation."
  },
  {
    question: "How long does a project take, and can the scope change?",
    answer:
      "Timing depends on the agreed scope, availability, content, and integration access. We set a schedule with review points before kickoff. If the work changes, we agree the effect on cost and timing before adding it. External approvals can also affect a launch date."
  },
  {
    question: "Who owns the work, and are there other fees?",
    answer:
      "You receive the project code, design files, and content produced for your engagement. Third-party software, stock assets, and services remain subject to their own licenses and fees. Hosting, app developer accounts, and paid integrations may have ongoing costs separate from the project."
  },
  {
    question: "What happens after launch?",
    answer:
      "Launch support is defined in the project scope. Maintenance, content updates, new features, and workflow improvements can be scoped through Ongoing Support. We agree the coverage and priorities so you know what is included."
  },
  {
    question: "What happens on the first call?",
    answer:
      "The first call is a 15-minute conversation about the problem, your current setup, and the result you want. You do not need a finished brief. There is no commitment to a project; the aim is to decide whether there is a useful next step."
  },
  {
    question: "Do you build and submit iOS and Android apps?",
    answer:
      "Yes. A scoped app engagement can include production development, device testing, and App Store and Google Play submission support. The work depends on the agreed features, suitable integration access, and developer accounts. Store approval and review timing are controlled by the stores. A demo or prototype is separate from a production app release."
  }
] as const;

export default function PricingPage() {
  return (
    <div className="liquid-page pb-24">
      <PageStructuredData
        {...pageSeo}
        type="FAQPage"
        mainEntity={getFaqSchema(engagementFaqs, pageSeo.pathname).mainEntity}
      />
      <Reveal>
        <section className="liquid-hero mx-auto max-w-5xl px-6 text-center">
          <span className="protocol-label justify-center">Engagement options</span>
          <h1 className="liquid-h1 mt-8">
            Choose your <span className="gradient-text">starting point</span>
          </h1>
          <p className="liquid-lead mx-auto mt-6 max-w-3xl">
            Start with a focused project, a complete build, or ongoing support. Tell us the goal and constraints; we will recommend a scope and quote before work starts.
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
                      Featured
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
                    <Button asChild className="mt-8" variant={featured ? "primary" : "secondary"}>
                      <Link href="/contact">Discuss your project</Link>
                    </Button>
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
              Bring the problem, your current tools, and any target date. A short conversation can help identify a useful first step before you commit to a larger build.
            </p>
            <Button asChild className="mt-8" size="large">
              <Link href="/contact">Discuss your project</Link>
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
                What to expect before kickoff, during the build, and after launch.
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
