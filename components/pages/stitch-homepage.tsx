import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  Calendar,
  CheckCircle2,
  Code2,
  FileText,
  Layers,
  Palette
} from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { CmsSizzleReel } from "@/components/sections/cms-sizzle-reel";
import { Button } from "@/components/ui/button";
import { TrackedLink } from "@/components/ui/tracked-link";
import { getCaseStudyMedia } from "@/lib/content/case-study-media";
import { getManagedHomepageSnapshot, getManagedHomepageThemeCss } from "@/lib/content/managed-site";

export function StitchHomepage() {
  const snapshot = getManagedHomepageSnapshot();
  const copy = snapshot.slots;
  const differentiators = ([1, 2, 3, 4] as const).map((item) => ({
    title: copy[`home.differentiators.item${item}.title`],
    description: copy[`home.differentiators.item${item}.description`]
  }));
  const services = ([
    { item: 1, icon: Palette },
    { item: 2, icon: Layers },
    { item: 3, icon: Code2 }
  ] as const).map(({ item, icon }) => ({
    title: copy[`home.services.item${item}.title`],
    kicker: copy[`home.services.item${item}.kicker`],
    description: copy[`home.services.item${item}.description`],
    icon
  }));
  const audiencePills = ([1, 2, 3, 4, 5] as const).map((item) => copy[`home.audience.item${item}`]);
  const featuredStudies = ([
    { item: 1, slug: "codeverified" },
    { item: 2, slug: "ai-trading-decision-platform" },
    { item: 3, slug: "upward-pt-automation" }
  ] as const).map(({ item, slug }) => ({
    slug,
    tag: copy[`home.portfolio.item${item}.tag`],
    title: copy[`home.portfolio.item${item}.title`],
    summary: copy[`home.portfolio.item${item}.summary`],
    imageAlt: copy[`home.portfolio.item${item}.imageAlt`]
  }));
  const clientReasons = ([1, 2, 3] as const).map((item) => ({
    title: copy[`home.reasons.item${item}.title`],
    description: copy[`home.reasons.item${item}.description`]
  }));
  const processSteps = ([1, 2, 3] as const).map((item) => ({
    step: `0${item}`,
    title: copy[`home.process.item${item}.title`],
    description: copy[`home.process.item${item}.description`]
  }));
  const nextStepIcons = [Calendar, FileText, CheckCircle2];
  const nextSteps = ([1, 2, 3] as const).map((item) => ({
    step: String(item),
    title: copy[`home.nextSteps.item${item}.title`],
    description: copy[`home.nextSteps.item${item}.description`],
    icon: nextStepIcons[item - 1]
  }));

  return (
    <>
      <style>{getManagedHomepageThemeCss(snapshot.theme)}</style>
      <div
        className="bg-[var(--color-canvas)] pb-24 text-[var(--color-text-primary)]"
        data-managed-homepage="rapidstudios"
        style={{ fontFamily: "var(--font-stitch), sans-serif" }}
      >
        <Reveal>
          <section className="mx-auto max-w-7xl px-4 pb-18 pt-32 md:px-6 lg:px-8">
            <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
              <div>
                <span className="protocol-label">{copy["home.hero.eyebrow"]}</span>
                <h1 className="mt-8 text-[clamp(3.8rem,8vw,7.4rem)] font-black uppercase leading-[0.9] tracking-[-0.08em] text-[var(--color-text-primary)]">
                  {copy["home.hero.headlinePrefix"]}{" "}
                  <span className="text-[var(--color-brand-primary-strong)]">
                    {copy["home.hero.headlineEmphasis"]}
                  </span>
                </h1>
                <p className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
                  {copy["home.hero.description"]}
                </p>
                <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                  <Button asChild size="large">
                    <TrackedLink
                      href="/contact"
                      trackLabel={copy["home.hero.primaryCta"]}
                      trackLocation="hero"
                    >
                      {copy["home.hero.primaryCta"]}
                    </TrackedLink>
                  </Button>
                  <Button asChild size="large" variant="secondary">
                    <TrackedLink
                      href="/work"
                      trackLabel={copy["home.hero.secondaryCta"]}
                      trackLocation="hero"
                    >
                      {copy["home.hero.secondaryCta"]}
                    </TrackedLink>
                  </Button>
                </div>
                <div className="mt-10">
                  <p className="mb-4 text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-text-muted)]">
                    {copy["home.audience.label"]}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    {audiencePills.map((label, index) => (
                      <Reveal delay={0.08 + index * 0.04} key={label}>
                        <span className="data-chip">{label}</span>
                      </Reveal>
                    ))}
                  </div>
                </div>
              </div>

              <Reveal delay={0.08} from="right">
                <aside className="surface-card p-7 sm:p-8">
                  <div className="border-b border-[var(--color-line-subtle)] pb-4">
                    <span className="protocol-label">{copy["home.process.eyebrow"]}</span>
                  </div>
                  <div className="mt-6 space-y-6">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                        {copy["home.services.eyebrow"]}
                      </p>
                      <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] text-[var(--color-text-primary)]">
                        {differentiators[0].title}
                      </h2>
                      <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                        {differentiators[0].description}
                      </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                      {differentiators.slice(1, 3).map((item, index) => (
                        <Reveal delay={0.14 + index * 0.04} key={item.title}>
                          <div className="dossier-tape dossier-tape--tight h-full border border-[var(--color-line-subtle)] bg-[var(--color-surface)] p-4">
                            <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                              {item.title}
                            </p>
                            <p className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] text-[var(--color-brand-accent)]">
                              0{index + 2}
                            </p>
                          </div>
                        </Reveal>
                      ))}
                    </div>
                    <Reveal delay={0.22}>
                      <div className="dossier-tape dossier-tape--tight border border-[var(--color-line-subtle)] bg-[var(--color-surface)] p-5">
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                          {copy["home.process.title"]}
                        </p>
                        <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                          {processSteps.map((step) => (
                            <li key={step.step}>
                              {step.step}. {step.title}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </Reveal>
                  </div>
                </aside>
              </Reveal>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.02}>
          <section
            aria-label={copy["home.services.title"]}
            className="mx-auto w-full max-w-[1120px] px-4 pb-18 md:px-6"
          >
            <CmsSizzleReel />
          </section>
        </Reveal>

        <Reveal delay={0.04}>
          <section className="mx-auto max-w-7xl px-4 pb-18 md:px-6 lg:px-8">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {differentiators.map(({ title, description }, index) => (
                <Reveal delay={0.06 + index * 0.04} key={title}>
                  <article className="surface-card interactive-card p-6">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                      0{index + 1}
                    </p>
                    <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                      {title}
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                      {description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.06}>
          <section className="mx-auto max-w-7xl px-4 py-18 md:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="protocol-label">{copy["home.services.eyebrow"]}</span>
                <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
                  {copy["home.services.title"]}
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
                  {copy["home.services.description"]}
                </p>
              </div>
              <Link className="annotation-tag" href="/services">
                {copy["home.services.linkLabel"]}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
              {services.map(({ title, kicker, description, icon: Icon }, index) => (
                <Reveal delay={0.1 + index * 0.05} key={title}>
                  <article className="surface-card interactive-card p-7">
                    <div className="flex items-start justify-between gap-4 border-b border-[var(--color-line-subtle)] pb-5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                          0{index + 1} / {kicker}
                        </p>
                        <h3 className="mt-4 text-3xl font-black uppercase tracking-[-0.06em] text-[var(--color-text-primary)]">
                          {title}
                        </h3>
                      </div>
                      <div className="inline-flex size-12 shrink-0 items-center justify-center border border-[var(--color-line-subtle)] bg-[var(--color-surface)] text-[var(--color-brand-accent)]">
                        <Icon aria-hidden="true" className="size-6" />
                      </div>
                    </div>
                    <p className="mt-6 text-base leading-7 text-[var(--color-text-secondary)]">{description}</p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.08}>
          <section className="mx-auto max-w-7xl px-4 py-18 md:px-6 lg:px-8">
            <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <span className="protocol-label">{copy["home.portfolio.eyebrow"]}</span>
                <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
                  {copy["home.portfolio.title"]}
                </h2>
                <p className="mt-5 text-base leading-7 text-[var(--color-text-secondary)]">
                  {copy["home.portfolio.description"]}
                </p>
              </div>
              <Link className="annotation-tag" href="/work">
                {copy["home.portfolio.linkLabel"]}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>

            <div className="grid gap-8 md:grid-cols-3">
              {featuredStudies.map((study, studyIndex) => (
                <Reveal delay={0.12 + studyIndex * 0.06} key={study.slug}>
                  <Link className="media-link group" href={`/work/${study.slug}`}>
                    {(() => {
                      const visuals = getCaseStudyMedia(study.slug);
                      const featuredImage =
                        study.slug === "codeverified" ? visuals.gallery[2] ?? visuals.cover : visuals.cover;

                      return (
                        <article className="surface-card interactive-card media-card overflow-hidden">
                          <div className="media-frame aspect-[4/3] border-b border-[var(--color-line-subtle)] bg-[var(--color-surface)]">
                            <Image
                              alt={study.imageAlt}
                              className="media-asset object-cover"
                              fill
                              priority={studyIndex === 0}
                              sizes="(min-width: 768px) 33vw, 100vw"
                              src={featuredImage}
                            />
                          </div>
                          <div className="flex items-start justify-between gap-4 p-6">
                            <div>
                              <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                                {study.tag}
                              </p>
                              <h3 className="mt-4 text-3xl font-black uppercase tracking-[-0.06em] text-[var(--color-text-primary)]">
                                {study.title}
                              </h3>
                              <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                                {study.summary}
                              </p>
                            </div>
                            <ArrowUpRight
                              aria-hidden="true"
                              className="mt-1 size-5 shrink-0 text-[var(--color-brand-accent)]"
                            />
                          </div>
                        </article>
                      );
                    })()}
                  </Link>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.1}>
          <section className="mx-auto max-w-7xl px-4 py-18 md:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="protocol-label justify-center">{copy["home.reasons.eyebrow"]}</span>
              <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
                {copy["home.reasons.title"]}
              </h2>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {clientReasons.map((item, index) => (
                <Reveal delay={0.12 + index * 0.05} key={item.title}>
                  <article className="surface-card p-7">
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                      0{index + 1}
                    </p>
                    <h3 className="mt-4 text-2xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                      {item.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.12}>
          <section className="mx-auto max-w-7xl px-4 py-18 md:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="protocol-label justify-center">{copy["home.process.eyebrow"]}</span>
              <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
                {copy["home.process.title"]}
              </h2>
            </div>
            <div className="grid gap-6 lg:grid-cols-3">
              {processSteps.map((step, index) => (
                <Reveal delay={0.14 + index * 0.05} key={step.step}>
                  <article className="surface-card p-7">
                    <div className="border-b border-[var(--color-line-subtle)] pb-5">
                      <p className="text-5xl font-black uppercase tracking-[-0.08em] text-[var(--color-brand-accent)]">
                        {step.step}
                      </p>
                    </div>
                    <h3 className="mt-6 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                      {step.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                      {step.description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link className="annotation-tag" href="/process">
                {copy["home.process.linkLabel"]}
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.14}>
          <section className="mx-auto max-w-7xl px-4 py-18 md:px-6 lg:px-8">
            <div className="mb-12 text-center">
              <span className="protocol-label justify-center">{copy["home.nextSteps.eyebrow"]}</span>
              <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
                {copy["home.nextSteps.title"]}
              </h2>
              <p className="mx-auto mt-5 max-w-2xl text-base leading-7 text-[var(--color-text-secondary)]">
                {copy["home.nextSteps.description"]}
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {nextSteps.map(({ step, title, description, icon: Icon }, index) => (
                <Reveal delay={0.16 + index * 0.05} key={step}>
                  <article className="surface-card p-7">
                    <div className="flex items-center gap-4 border-b border-[var(--color-line-subtle)] pb-5">
                      <div className="inline-flex size-12 items-center justify-center border border-[var(--color-line-subtle)] bg-[var(--color-surface)] text-[var(--color-brand-primary-strong)]">
                        <Icon aria-hidden="true" className="size-5" />
                      </div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                        {copy["home.nextSteps.stepLabel"]} {step}
                      </p>
                    </div>
                    <h3 className="mt-6 text-2xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                      {title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                      {description}
                    </p>
                  </article>
                </Reveal>
              ))}
            </div>
          </section>
        </Reveal>

        <Reveal delay={0.16}>
          <section className="px-4 py-18 md:px-6 lg:px-8">
            <div className="cta-shell mx-auto max-w-7xl p-10 text-center md:p-16">
              <span className="protocol-label justify-center">{copy["home.cta.button"]}</span>
              <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)] md:text-6xl">
                {copy["home.cta.title"]}
              </h2>
              <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
                {copy["home.cta.description"]}
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <Button asChild size="large">
                  <TrackedLink
                    href="/contact"
                    trackLabel={copy["home.cta.button"]}
                    trackLocation="bottom_cta"
                  >
                    {copy["home.cta.button"]}
                  </TrackedLink>
                </Button>
                <Button asChild size="large" variant="secondary">
                  <Link href="/work">{copy["home.portfolio.linkLabel"]}</Link>
                </Button>
              </div>
            </div>
          </section>
        </Reveal>
      </div>
    </>
  );
}
