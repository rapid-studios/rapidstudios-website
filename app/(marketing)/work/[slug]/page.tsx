import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { Button } from "@/components/ui/button";
import { getCaseStudyMedia } from "@/lib/content/case-study-media";
import { getAllCaseStudies, getCaseStudyBySlug } from "@/lib/content/case-studies";
import { buildMetadata } from "@/lib/seo/metadata";

export async function generateStaticParams() {
  return getAllCaseStudies().map((entry) => ({
    slug: entry.slug
  }));
}

export async function generateMetadata({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = getCaseStudyBySlug(slug);

  if (!entry) {
    return buildMetadata({
      title: "Case study",
      description: "Case study coming soon.",
      pathname: `/work/${slug}`
    });
  }

  return buildMetadata({
    title: entry.title,
    description: entry.summary,
    pathname: `/work/${slug}`
  });
}

export default async function CaseStudyPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const study = getCaseStudyBySlug(slug);

  if (!study) {
    notFound();
  }

  const studies = getAllCaseStudies();
  const currentIndex = studies.findIndex((entry) => entry.slug === study.slug);
  const nextStudy = studies[(currentIndex + 1) % studies.length];
  const visuals = getCaseStudyMedia(study.slug);
  const nextVisuals = getCaseStudyMedia(nextStudy.slug);
  const projectDetails = [
    { label: "Client", value: study.client },
    { label: "Year", value: study.year },
    { label: "Tag", value: study.tag },
    { label: "Focus", value: study.services.join(" / ") }
  ];

  return (
    <div className="liquid-page pb-24">
      <Reveal>
        <section className="relative isolate min-h-[clamp(42rem,72vw,52rem)] overflow-hidden border-y border-[var(--color-line-subtle)]">
          <Image
            alt={study.highlight}
            className="object-cover"
            fill
            priority
            sizes="100vw"
            src={visuals.cover}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, color-mix(in srgb, var(--color-canvas) 24%, transparent) 0%, color-mix(in srgb, var(--color-canvas) 68%, transparent) 52%, var(--color-canvas) 100%)"
            }}
          />

          <div className="liquid-hero liquid-hero--left relative z-10 flex min-h-[clamp(42rem,72vw,52rem)] flex-col">
            <Link className="annotation-tag self-start" href="/work">
              <ArrowLeft aria-hidden="true" className="size-4" />
              Back to work
            </Link>

            <div className="mt-auto max-w-[950px]">
              <span className="protocol-label">Case File</span>
              <h1 className="liquid-h1 mt-6 text-[var(--color-text-primary)]">{study.title}</h1>
              <p className="liquid-lead mt-6 max-w-[680px] text-[var(--color-text-secondary)]">
                {study.summary}
              </p>

              <dl aria-label="Project details" className="mt-8 flex flex-wrap gap-2">
                {projectDetails.map((item) => (
                  <div className="data-chip max-w-full whitespace-normal" key={item.label}>
                    <dt className="sr-only">{item.label}</dt>
                    <dd>
                      <span aria-hidden="true">{item.label}: </span>
                      {item.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </Reveal>

      <Reveal className="relative z-20 mx-auto -mt-16 max-w-[1000px] px-4 sm:px-6 lg:px-8" delay={0.05}>
        <dl
          aria-label={`${study.title} outcome metrics`}
          className="surface-card grid overflow-hidden sm:grid-cols-3"
        >
          {study.metrics.map((metric) => (
            <div
              className="border-t border-[var(--color-line-subtle)] p-5 text-center first:border-t-0 sm:border-l sm:border-t-0 sm:p-7 sm:first:border-l-0"
              key={metric.label}
            >
              <dt className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                {metric.label}
              </dt>
              <dd className="font-display mt-3 break-words text-3xl font-bold tracking-[-0.04em] text-[var(--color-brand-primary-strong)] sm:text-4xl">
                {metric.value}
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>

      <div className="mx-auto max-w-[680px] space-y-8 px-4 pt-20 sm:px-6 lg:pt-24">
        <Reveal delay={0.08}>
          <section className="surface-card p-7 sm:p-9" aria-labelledby="challenge-heading">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]"
              id="challenge-heading"
            >
              The challenge
            </p>
            <p className="mt-5 text-lg leading-8 text-[var(--color-text-secondary)] sm:text-xl">{study.problem}</p>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <aside className="surface-card overflow-hidden p-7 sm:p-9" aria-labelledby="result-heading">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]"
              id="result-heading"
            >
              The result
            </p>
            <blockquote className="font-display mt-5 border-l-2 border-[var(--color-brand-primary-strong)] pl-5 text-2xl font-semibold leading-snug tracking-[-0.025em] text-[var(--color-text-primary)] sm:text-3xl">
              {study.outcome}
            </blockquote>
          </aside>
        </Reveal>

        <Reveal delay={0.12}>
          <article className="surface-card p-7 sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]">
              Solution
            </p>
            <ul className="mt-5 space-y-4 text-base leading-7 text-[var(--color-text-secondary)]">
              {study.solutionBullets.map((item) => (
                <li className="flex items-start gap-3" key={item}>
                  <span
                    aria-hidden="true"
                    className="mt-[0.65rem] size-2 shrink-0 rounded-full bg-[var(--color-brand-primary-strong)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>
        </Reveal>

        <Reveal delay={0.14}>
          <article className="surface-card p-7 sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]">
              Technology
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              {study.technologies.map((item) => (
                <span className="data-chip" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.16}>
          <article className="surface-card p-7 sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]">
              Architecture
            </p>
            <ol className="mt-5 space-y-4 text-base leading-7 text-[var(--color-text-secondary)]">
              {study.architectureHighlights.map((item, index) => (
                <li className="flex items-start gap-4" key={item}>
                  <span className="font-display inline-flex size-8 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-subtle)] bg-[var(--color-surface)] text-sm font-bold text-[var(--color-brand-primary-strong)]">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </article>
        </Reveal>

        <Reveal delay={0.18}>
          <section aria-labelledby="artifact-gallery-heading">
            <div className="mb-6">
              <span className="protocol-label" id="artifact-gallery-heading">
                Artifact gallery
              </span>
            </div>
            <div className="grid gap-6">
              {visuals.gallery.map((image, index) => (
                <div className="surface-card media-card overflow-hidden" key={`${image}-${index}`}>
                  <div
                    className={`media-frame relative ${
                      visuals.gallery.length === 1 ? "aspect-[16/10]" : "aspect-[4/3]"
                    }`}
                  >
                    <Image
                      alt={`${study.title} screen ${index + 1}`}
                      className="media-asset object-cover"
                      fill
                      sizes="(min-width: 768px) 680px, 100vw"
                      src={image}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.2}>
          <section className="surface-card p-7 sm:p-10" aria-labelledby="project-narrative-heading">
            <p
              className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]"
              id="project-narrative-heading"
            >
              Project narrative
            </p>
            <div className="content-prose mt-6">
              <study.Content />
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.22}>
          <article className="surface-card p-7 sm:p-9">
            <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]">
              Outcome
            </p>
            <p className="mt-4 text-lg leading-8 text-[var(--color-text-secondary)]">{study.outcome}</p>
          </article>
        </Reveal>

        {study.spotlights.map((spotlight, index) => (
          <Reveal delay={0.24 + index * 0.04} key={spotlight.title}>
            <article className="surface-card p-7 sm:p-9">
              <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary-strong)]">
                {spotlight.label}
              </p>
              <h2 className="font-display mt-4 text-3xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-text-primary)]">
                {spotlight.title}
              </h2>
              <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{spotlight.description}</p>
            </article>
          </Reveal>
        ))}
      </div>

      <Reveal delay={0.28}>
        <section className="mx-auto max-w-[1180px] px-4 pt-20 sm:px-6 lg:px-8 lg:pt-28">
          <article className="cta-shell group relative isolate overflow-hidden p-8 sm:p-10 md:p-14">
            <Image
              alt={`Background for ${nextStudy.title}`}
              className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.02]"
              fill
              sizes="100vw"
              src={nextVisuals.cover}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  "linear-gradient(90deg, var(--color-canvas) 0%, color-mix(in srgb, var(--color-canvas) 88%, transparent) 54%, color-mix(in srgb, var(--color-canvas) 58%, transparent) 100%)"
              }}
            />
            <div className="relative z-10 max-w-[680px]">
              <span className="protocol-label">Next project</span>
              <h2 className="font-display mt-6 text-4xl font-bold leading-tight tracking-[-0.03em] text-[var(--color-text-primary)] md:text-5xl">
                {nextStudy.title}
              </h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
                Continue through the archive and review the next case study in the sequence.
              </p>
              <Button asChild className="mt-8" size="large">
                <Link href={`/work/${nextStudy.slug}`}>
                  Explore Case Study
                  <ArrowRight aria-hidden="true" className="size-5" />
                </Link>
              </Button>
            </div>
          </article>
        </section>
      </Reveal>
    </div>
  );
}
