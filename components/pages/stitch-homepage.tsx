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
import { getFeaturedCaseStudies } from "@/lib/content/case-studies";

const differentiators = [
  {
    title: "Positioning First",
    description: "Story, hierarchy, and conversion logic are locked before design begins."
  },
  {
    title: "Designed to Ship",
    description: "Layouts are built with real code constraints, responsive states, and motion budgets in mind."
  },
  {
    title: "Weeks, Not Months",
    description: "Focused sprints with weekly deliverables. No open-ended timelines."
  },
  {
    title: "You Own Everything",
    description: "Code, design system, content structure, and every asset. No lock-in."
  }
] as const;

const services = [
  {
    title: "Product Design",
    kicker: "Strategy meets interface",
    description:
      "Shape the story, structure, and user experience so the product feels credible and converts from the first interaction.",
    icon: Palette
  },
  {
    title: "Marketing & Launch Surfaces",
    kicker: "Premium digital surfaces",
    description:
      "Design and build the public-facing layer -- homepages, landing pages, and campaign surfaces that make the product feel serious.",
    icon: Layers
  },
  {
    title: "Frontend Implementation",
    kicker: "Design carried to production",
    description:
      "Ship in Next.js with reusable components, motion polish, and the state coverage to survive real users.",
    icon: Code2
  }
] as const;

const audiencePills = [
  "SaaS teams",
  "AI products",
  "Product launches",
  "Founder-led companies",
  "Technical teams"
] as const;

const clientReasons = [
  {
    title: "Our product looks good, but our site does not.",
    description: "The product is strong but the public-facing surface feels templated or rushed. First impressions are costing deals."
  },
  {
    title: "We need to launch and look credible.",
    description: "A new product, rebrand, or funding round needs polished design and a site that builds trust fast. No time for a 6-month agency engagement."
  },
  {
    title: "We have the vision but not the frontend team.",
    description: "The design direction exists but there is no one to carry it into production with the right level of craft."
  }
] as const;

const processSteps = [
  {
    step: "01",
    title: "Research",
    description: "Positioning audit, reference gathering, and page structure locked before design starts."
  },
  {
    step: "02",
    title: "Design",
    description: "Visual system, layout composition, and motion direction tuned for conversion and craft."
  },
  {
    step: "03",
    title: "Ship",
    description: "Production Next.js build with responsive polish, content wiring, and launch QA."
  }
] as const;

const nextSteps = [
  {
    step: "1",
    title: "Discovery Call",
    description: "A 30-minute conversation about your product, goals, and what good looks like for your team.",
    icon: Calendar
  },
  {
    step: "2",
    title: "Proposal",
    description: "A clear scope with deliverables, timeline, and next steps -- typically within 48 hours.",
    icon: FileText
  },
  {
    step: "3",
    title: "Kickoff",
    description: "Research begins immediately. You see real direction within the first week.",
    icon: CheckCircle2
  }
] as const;

export function StitchHomepage() {
  const featuredStudies = getFeaturedCaseStudies().slice(0, 3);

  return (
    <div className="pb-24">
      <Reveal>
        <section className="mx-auto max-w-7xl px-4 pb-18 pt-32 md:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
            <div>
              <span className="protocol-label">Forensic Blueprint</span>
              <h1 className="mt-8 text-[clamp(3.8rem,8vw,7.4rem)] font-black uppercase leading-[0.9] tracking-[-0.08em] text-[var(--color-text-primary)]">
                Digital Products
                <br />
                <span className="text-[var(--color-brand-primary-strong)]">At High Velocity</span>
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
                Rapid Studios helps product teams design and launch polished digital products -- from positioning and UI to production frontend delivery.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="large">
                  <TrackedLink href="/contact" trackLabel="Book a Discovery Call" trackLocation="hero">
                    Book a Discovery Call
                  </TrackedLink>
                </Button>
                <Button asChild size="large" variant="secondary">
                  <TrackedLink href="/work" trackLabel="View Our Work" trackLocation="hero">
                    View Our Work
                  </TrackedLink>
                </Button>
              </div>
              <div className="mt-10 flex flex-wrap gap-3">
                {audiencePills.map((label, index) => (
                  <Reveal delay={0.08 + index * 0.04} key={label}>
                    <span className="data-chip">{label}</span>
                  </Reveal>
                ))}
              </div>
            </div>

            <Reveal delay={0.08} from="right">
              <aside className="surface-card p-7 sm:p-8">
                <div className="flex items-center justify-between border-b border-[var(--color-line-subtle)] pb-4">
                  <span className="protocol-label">System Intel</span>
                  <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                    Live
                  </span>
                </div>
                <div className="mt-6 space-y-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                      Protocol 01
                    </p>
                    <h2 className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] text-[var(--color-text-primary)]">
                      Positioning before pixels.
                    </h2>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">
                      The story, proof, and conversion logic get locked early so every later decision feels deliberate.
                    </p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Reveal delay={0.14}>
                      <div className="dossier-tape dossier-tape--tight border border-[var(--color-line-subtle)] bg-[var(--color-surface)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                          Delivery rhythm
                        </p>
                        <p className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] text-[var(--color-brand-accent)]">
                          Weekly
                        </p>
                      </div>
                    </Reveal>
                    <Reveal delay={0.18}>
                      <div className="dossier-tape dossier-tape--tight border border-[var(--color-line-subtle)] bg-[var(--color-surface)] p-4">
                        <p className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                          Output mode
                        </p>
                        <p className="mt-3 text-3xl font-black uppercase tracking-[-0.06em] text-[var(--color-brand-primary-strong)]">
                          Build-ready
                        </p>
                      </div>
                    </Reveal>
                  </div>
                  <Reveal delay={0.22}>
                    <div className="dossier-tape dossier-tape--tight border border-[var(--color-line-subtle)] bg-[var(--color-surface)] p-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                        Current protocol
                      </p>
                      <ul className="mt-4 space-y-3 text-sm leading-7 text-[var(--color-text-secondary)]">
                        <li>01. Structure the message and page hierarchy.</li>
                        <li>02. Establish the visual system and motion logic.</li>
                        <li>03. Ship polished frontend without handoff drift.</li>
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
          aria-label="Rapid Studios CMS showcase"
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
                    System check
                  </p>
                  <h2 className="mt-4 text-2xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                    {title}
                  </h2>
                  <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{description}</p>
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
              <span className="protocol-label">Operational Capabilities</span>
              <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
                Three services,
                <br />
                one standard.
              </h2>
            </div>
            <Link className="annotation-tag" href="/services">
              All services
              <ArrowRight className="size-4" />
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
                    <div className="inline-flex size-12 items-center justify-center border border-[var(--color-line-subtle)] bg-[var(--color-surface)] text-[var(--color-brand-accent)]">
                      <Icon className="size-6" />
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
              <span className="protocol-label">Artifact Archive</span>
              <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
                Selected work
              </h2>
            </div>
            <Link className="annotation-tag" href="/work">
              View all projects
              <ArrowRight className="size-4" />
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
                            alt={study.highlight}
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
                            <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{study.summary}</p>
                          </div>
                          <ArrowUpRight className="mt-1 size-5 shrink-0 text-[var(--color-brand-accent)]" />
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
            <span className="protocol-label justify-center">Common Starting Points</span>
            <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
              Why teams bring us in.
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
                  <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="mx-auto max-w-7xl px-4 py-18 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="protocol-label justify-center">Protocol Flow</span>
            <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
              Research. Design. Ship.
            </h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {processSteps.map((step, index) => (
              <Reveal delay={0.14 + index * 0.05} key={step.step}>
                <article className="surface-card p-7">
                  <div className="flex items-start justify-between gap-6 border-b border-[var(--color-line-subtle)] pb-5">
                    <p className="text-5xl font-black uppercase tracking-[-0.08em] text-[var(--color-brand-accent)]">
                      {step.step}
                    </p>
                    <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                      Active
                    </span>
                  </div>
                  <h3 className="mt-6 text-3xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                    {step.title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{step.description}</p>
                </article>
              </Reveal>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link className="annotation-tag" href="/process">
              See the full process
              <ArrowRight className="size-4" />
            </Link>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.14}>
        <section className="mx-auto max-w-7xl px-4 py-18 md:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="protocol-label justify-center">Getting Started</span>
            <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)]">
              What happens after you reach out.
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {nextSteps.map(({ step, title, description, icon: Icon }, index) => (
              <Reveal delay={0.16 + index * 0.05} key={step}>
                <article className="surface-card p-7">
                  <div className="flex items-center gap-4 border-b border-[var(--color-line-subtle)] pb-5">
                    <div className="inline-flex size-12 items-center justify-center border border-[var(--color-line-subtle)] bg-[var(--color-surface)] text-[var(--color-brand-primary-strong)]">
                      <Icon className="size-5" />
                    </div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-[var(--color-brand-primary-strong)]">
                      Step {step}
                    </p>
                  </div>
                  <h3 className="mt-6 text-2xl font-black uppercase tracking-[-0.05em] text-[var(--color-text-primary)]">
                    {title}
                  </h3>
                  <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{description}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.16}>
        <section className="px-4 py-18 md:px-6 lg:px-8">
          <div className="cta-shell mx-auto max-w-7xl p-10 text-center md:p-16">
            <span className="protocol-label justify-center">Initiate Protocol</span>
            <h2 className="mt-6 text-5xl font-black uppercase tracking-[-0.07em] text-[var(--color-text-primary)] md:text-6xl">
              Ready to ship something better?
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Start with a 30-minute call. No pitch deck, no commitment -- just a clear conversation about what you&apos;re building and how we can help.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Button asChild size="large">
                <TrackedLink href="/contact" trackLabel="Book a Discovery Call" trackLocation="bottom_cta">
                  Book a Discovery Call
                </TrackedLink>
              </Button>
              <Button asChild size="large" variant="secondary">
                <Link href="/work">View the Archive</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
