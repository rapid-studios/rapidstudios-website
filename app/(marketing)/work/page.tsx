import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getCaseStudyMedia } from "@/lib/content/case-study-media";
import { getAllCaseStudies } from "@/lib/content/case-studies";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Work",
  description: "Selected case studies -- product design, marketing surfaces, and frontend delivery for SaaS, AI, and product teams.",
  pathname: "/work"
});

const filters = ["All Projects", "Developer Tools", "Financial Systems", "Automation", "AI Ops"] as const;

export default function WorkPage() {
  const studies = getAllCaseStudies();
  const [featured, ...rest] = studies;

  return (
    <div className="liquid-page pb-24">
      <Reveal>
        <section className="liquid-hero mx-auto max-w-[1180px] px-4 pb-14 pt-16 sm:px-6 sm:pb-16 sm:pt-20 lg:px-8 lg:pt-[120px]">
          <span className="protocol-label">Artifact Archive</span>
          <h1 className="liquid-h1 mx-auto mt-6 max-w-[900px] text-[var(--color-text-primary)]">
            Our work
          </h1>
          <p className="liquid-lead mt-6 max-w-[680px] text-[var(--color-text-secondary)]">
            A curated portfolio of high-impact digital products and experiences built for global brands and ambitious startups.
          </p>
          <div aria-label="Project categories" className="mt-9 flex flex-wrap gap-3">
            {filters.map((filter, index) => (
              <Reveal delay={0.06 + index * 0.03} key={filter}>
                <span className={index === 0 ? "annotation-tag" : "data-chip"}>{filter}</span>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <section className="mx-auto max-w-[1180px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 lg:gap-8">
          {studies.map((study, index) => {
            const isFeatured = featured?.slug === study.slug;

            return (
              <Reveal className="h-full" delay={0.08 + index * 0.05} key={study.slug}>
                <Link
                  aria-label={`View ${study.title} case study`}
                  className="media-link group block h-full rounded-[var(--radius-xl)] outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus-ring)]"
                  href={`/work/${study.slug}`}
                >
                  <article className="surface-card interactive-card media-card flex h-full flex-col overflow-hidden transition-transform duration-300 motion-safe:group-hover:-translate-y-1">
                    <div className="media-frame aspect-[16/10] w-full border-b border-[var(--color-line-subtle)] bg-[var(--color-surface)]">
                      <Image
                        alt={study.highlight}
                        className="media-asset object-cover"
                        fill
                        sizes="(min-width: 768px) 50vw, 100vw"
                        src={getCaseStudyMedia(study.slug).cover}
                      />
                    </div>
                    <div className="flex flex-1 flex-col p-6 sm:p-8">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        {isFeatured ? <span className="annotation-tag">Featured project</span> : null}
                        <span className="ml-auto inline-flex items-center gap-2 text-xs font-semibold text-[var(--color-brand-primary-strong)]">
                          View Case Study
                          <ArrowUpRight
                            aria-hidden="true"
                            className="size-4 transition-transform duration-300 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                          />
                        </span>
                      </div>

                      <p className="font-display mt-6 text-lg font-bold tracking-[-0.02em] text-[var(--color-text-primary)]">
                        {study.client}
                        <span className="ml-3 font-sans text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
                          {study.year}
                        </span>
                      </p>
                      <h2 className="font-display mt-3 text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-text-primary)]">
                        {study.title}
                      </h2>
                      <p className="mt-3 text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary-strong)]">
                        {study.tag}
                      </p>
                      <p className="mt-4 line-clamp-2 text-[15px] leading-6 text-[var(--color-text-secondary)]">
                        {study.summary}
                      </p>

                      <div className="mt-6 border-t border-[var(--color-line-subtle)] pt-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                          Result
                        </p>
                        <p className="mt-2 line-clamp-1 text-sm font-medium text-[var(--color-text-primary)]">
                          {study.highlight}
                        </p>
                      </div>

                      <dl className="mt-auto grid gap-4 pt-7 sm:grid-cols-3" aria-label={`${study.title} outcomes`}>
                        {study.metrics.map((metric) => (
                          <div className="border-t border-[var(--color-line-subtle)] pt-4" key={metric.label}>
                            <dt className="text-[9px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                              {metric.label}
                            </dt>
                            <dd className="font-display mt-2 text-xl font-bold tracking-[-0.03em] text-[var(--color-brand-primary-strong)]">
                              {metric.value}
                            </dd>
                          </div>
                        ))}
                      </dl>
                    </div>
                  </article>
                </Link>
              </Reveal>
            );
          })}

          {rest.length < 2 ? (
            <Reveal className="h-full" delay={0.2}>
              <div className="surface-card flex h-full flex-col p-8">
                <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]">
                  More proof
                </p>
                <h3 className="font-display mt-4 text-3xl font-bold tracking-[-0.03em] text-[var(--color-text-primary)]">
                  Additional case studies are being prepared.
                </h3>
                <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
                  The work page stays selective on purpose. Reach out if you want examples closer to your product category or launch stage.
                </p>
                <Button asChild className="mt-auto self-start">
                  <Link href="/contact">Request relevant examples</Link>
                </Button>
              </div>
            </Reveal>
          ) : null}
        </div>
      </section>

      <Reveal delay={0.12}>
        <section className="px-4 pt-16 sm:px-6 lg:px-8 lg:pt-24">
          <div className="cta-shell mx-auto max-w-[1180px] p-8 text-center sm:p-12 md:p-16">
            <span className="protocol-label justify-center">Portfolio protocol</span>
            <h2 className="font-display mx-auto mt-6 max-w-[900px] text-4xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-text-primary)] md:text-5xl">
              Want a portfolio that sells the work before the call?
            </h2>
            <p className="mx-auto mt-6 max-w-[680px] text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Rapid Studios structures proof so the best projects do the heavy lifting without turning the site into a noisy archive.
            </p>
            <Button asChild className="mt-8" size="large">
              <Link href="/contact">
                Start a Project
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
