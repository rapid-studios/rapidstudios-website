import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
  const galleryGridClass =
    visuals.gallery.length === 1 ? "md:grid-cols-1" : visuals.gallery.length === 2 ? "md:grid-cols-2" : "md:grid-cols-3 md:items-start";

  return (
    <div className="pb-24 pt-16" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-20">
        <Link
          className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-primary)] transition-colors hover:text-white"
          href="/work"
        >
          <ArrowLeft className="size-4" />
          Back to work
        </Link>

        <div className="mt-8 max-w-4xl">
          <h1 className="text-5xl font-black leading-[1.02] tracking-[-0.08em] text-[var(--color-text-primary)] md:text-[5.5rem]">
            {study.title}
          </h1>
          <p className="mt-4 text-xl font-medium leading-snug text-[var(--color-brand-primary)] md:max-w-2xl">
            {study.summary}
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-12">
        <div className="flex flex-wrap gap-4 rounded-[1.75rem] border border-white/8 bg-white/4 p-4 backdrop-blur-sm">
          <div className="min-w-[11rem] flex-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">Client</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{study.client}</p>
          </div>
          <div className="min-w-[8rem] flex-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">Year</p>
            <p className="text-sm font-semibold text-[var(--color-text-primary)]">{study.year}</p>
          </div>
          <div className="min-w-[12rem] flex-1">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">Tag</p>
            <p className="text-sm font-semibold leading-tight text-[var(--color-text-primary)]">{study.tag}</p>
          </div>
          <div className="min-w-[14rem] flex-[1.2]">
            <p className="mb-1 text-[10px] uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">Focus</p>
            <p className="text-sm font-semibold leading-tight text-[var(--color-text-primary)]">
              {study.services.join(" / ")}
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/6 bg-slate-900 shadow-2xl">
          <Image alt={study.highlight} className="object-cover" fill priority sizes="100vw" src={visuals.cover} />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-8 lg:grid-cols-[0.92fr_1.08fr]">
          <div className="space-y-4">
            <h2 className="text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-brand-primary)]">The Challenge</h2>
            <p className="text-xl leading-relaxed text-[var(--color-text-secondary)]">{study.problem}</p>
          </div>

          <div
            className="relative overflow-hidden rounded-[2rem] border p-8 text-center"
            style={{
              borderColor: `${study.accentTo}33`,
              background: `linear-gradient(180deg, ${study.accentTo}10, rgba(9,17,31,0.94))`
            }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-40 opacity-50 blur-3xl"
              style={{
                background: `linear-gradient(90deg, ${study.accentFrom}, ${study.accentTo})`
              }}
            />
            <div className="relative">
              <h2 className="mb-8 text-xs font-bold uppercase tracking-[0.24em]" style={{ color: study.accentTo }}>
                The Result
              </h2>
              <div className="grid gap-8 md:grid-cols-3">
                {study.metrics.map((metric) => (
                  <div key={metric.label}>
                    <span className="text-5xl font-black tracking-[-0.06em]" style={{ color: study.accentTo }}>
                      {metric.value}
                    </span>
                    <p className="mt-2 text-sm font-medium text-[var(--color-text-secondary)]">{metric.label}</p>
                  </div>
                ))}
              </div>
              <p className="mx-auto mt-8 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
                {study.outcome}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-3">
          <article className="surface-card p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">Solution</p>
            <ul className="mt-5 space-y-3 text-base leading-7 text-[var(--color-text-secondary)]">
              {study.solutionBullets.map((item) => (
                <li className="flex items-start gap-3" key={item}>
                  <span className="mt-3 h-2 w-2 rounded-full bg-[var(--color-brand-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </article>

          <article className="surface-card p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-brand-accent)]">Technology</p>
            <div className="mt-5 flex flex-wrap gap-3">
              {study.technologies.map((item) => (
                <span
                  className="rounded-full border border-white/8 bg-white/4 px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
          </article>

          <article className="surface-card p-8">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">Architecture</p>
            <ol className="mt-5 space-y-3 text-base leading-7 text-[var(--color-text-secondary)]">
              {study.architectureHighlights.map((item, index) => (
                <li className="flex items-start gap-3" key={item}>
                  <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/8 text-sm font-bold text-[var(--color-text-primary)]">
                    {index + 1}
                  </span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl overflow-hidden px-4 pb-20">
        <h2 className="px-2 text-xs font-bold uppercase tracking-[0.24em] text-[var(--color-brand-primary)]">Key Screens</h2>
        <div className={`mt-8 grid gap-6 ${galleryGridClass}`}>
          {visuals.gallery.map((image, index) => (
            <div
              className={`relative overflow-hidden rounded-[1.5rem] border border-white/8 shadow-xl ${
                visuals.gallery.length < 3
                  ? ""
                  : index === 0
                    ? "md:translate-y-2 md:rotate-2"
                    : index === 1
                      ? "md:-translate-y-4 md:-rotate-2"
                      : "md:translate-y-1 md:rotate-1"
              }`}
              key={`${image}-${index}`}
            >
              <div className={`relative bg-slate-900 ${visuals.gallery.length === 1 ? "aspect-[16/10]" : "aspect-[4/5]"}`}>
                <Image
                  alt={`${study.title} screen ${index + 1}`}
                  className="object-cover"
                  fill
                  sizes="(min-width: 768px) 33vw, 100vw"
                  src={image}
                />
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 pb-16">
        <div className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="surface-card p-8 sm:p-10">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-text-secondary)]">
              Project Narrative
            </p>
            <div className="content-prose mt-6">
              <study.Content />
            </div>
          </div>

          <div className="grid gap-6">
            <article className="surface-card p-8">
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">Outcome</p>
              <p className="mt-4 text-lg leading-8 text-[var(--color-text-secondary)]">{study.outcome}</p>
            </article>
            {study.spotlights.map((spotlight) => (
              <article className="surface-card p-8" key={spotlight.title}>
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--color-brand-accent)]">
                  {spotlight.label}
                </p>
                <h2 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--color-text-primary)]">
                  {spotlight.title}
                </h2>
                <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{spotlight.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4">
        <article className="group relative flex aspect-video flex-col justify-end overflow-hidden rounded-[2rem] border border-white/6 bg-slate-900 p-8 shadow-2xl">
          <div className="absolute inset-0 opacity-40 transition-opacity group-hover:opacity-60">
            <Image
              alt={`Background for ${nextStudy.title}`}
              className="object-cover"
              fill
              sizes="100vw"
              src={nextVisuals.cover}
            />
          </div>
          <div className="relative z-10 max-w-md">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.28em] text-white/55">Next Project</p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">{nextStudy.title}</h2>
            <Button
              asChild
              className="mt-6 h-auto w-full px-8 py-4 text-base font-bold hover:bg-white hover:text-[var(--color-brand-primary)] sm:w-auto"
            >
              <Link href={`/work/${nextStudy.slug}`}>
                Explore Case Study
                <ArrowRight className="size-5" />
              </Link>
            </Button>
          </div>
        </article>
      </section>
    </div>
  );
}
