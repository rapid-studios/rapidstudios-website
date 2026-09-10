import Link from "next/link";
import { ArrowRight, Bot, Brush, Code2, Smartphone, TrendingUp } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { CmsSizzleReel } from "@/components/sections/cms-sizzle-reel";
import { Button } from "@/components/ui/button";
import { getAllServices } from "@/lib/content/services";
import { getServiceSchema } from "@/lib/seo/json-ld";
import { PageStructuredData } from "@/components/seo/page-structured-data";
import { buildMetadata } from "@/lib/seo/metadata";

const pageSeo = {
  title: "Services",
  description: "Clear messaging, marketing websites, AI workflows, frontend development, and iOS and Android apps. Explore the scope that fits your business.",
  pathname: "/services"
};

export const metadata = buildMetadata(pageSeo);

const serviceIcons = [TrendingUp, Brush, Bot, Code2, Smartphone] as const;

export default function ServicesPage() {
  const services = getAllServices();
  const serviceSchemas = services.map(getServiceSchema);

  return (
    <div className="pb-24 pt-10">
      <PageStructuredData
        {...pageSeo}
        type="CollectionPage"
        mainEntity={serviceSchemas.map((service) => ({ "@id": service["@id"] }))}
        entities={serviceSchemas}
      />
      <Reveal>
        <section className="mx-auto max-w-7xl px-4 pb-16 pt-20 md:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-center">
            <div>
              <span className="protocol-label">What we help you build</span>
              <h1 className="mt-8 text-[clamp(3.5rem,7vw,6.4rem)] font-black uppercase leading-[0.9] tracking-[-0.08em] text-[var(--color-text-primary)]">
                Websites, apps
                <br />
                <span className="text-[var(--color-brand-primary-strong)]">and workflows.</span>
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
                Help customers understand your offer, complete useful tasks, and get in touch. We connect clear messaging, design, and development around the work your business needs.
              </p>
            </div>

            <div aria-label="Design CMS sizzle reel" className="min-w-0">
              <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <span className="protocol-label">Content editing</span>
                  <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                    Review edits before publishing.
                  </h2>
                </div>
                <p className="max-w-[26ch] text-sm leading-6 text-[var(--color-text-secondary)] sm:text-right">
                  Edit visually, request AI changes, and approve updates before they go live.
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
                <article id={service.slug} className="scroll-mt-28 grid gap-6 border-t border-[var(--color-line-subtle)] py-10 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="pr-0 lg:pr-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                      Service 0{index + 1}
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
                          The goal
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
                  Defined scope
                </p>
                <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                  Focused projects
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                  Start with one page, workflow, or a complete build. We agree the deliverables, dependencies, and review points before work begins.
                </p>
              </article>
            </Reveal>
            <Reveal delay={0.16}>
              <article className="surface-card p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                  Partnership
                </p>
                <h2 className="mt-5 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                  Ongoing support
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                  Keep improving after launch with agreed updates, maintenance, and new features. Priorities and support coverage are defined in the engagement.
                </p>
              </article>
            </Reveal>
          </div>
          <div className="mt-8 text-center">
            <Link className="annotation-tag" href="/pricing">
              Explore engagement options
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.1}>
        <section className="px-4 pt-10 md:px-6 lg:px-8">
          <div className="cta-shell mx-auto max-w-7xl p-10 text-center md:p-16">
            <span className="protocol-label justify-center">Ready to build</span>
            <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.06em] text-[var(--color-text-primary)] md:text-6xl">
              Start with the problem.
              <br />
              Define the right build.
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Share what customers or your team struggle with, the tools you use, and your target date. We will help identify a practical starting scope.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="large">
                <Link href="/contact">
                  Discuss your project
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
