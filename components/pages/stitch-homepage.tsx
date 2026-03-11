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
    title: "\"Our product looks good, but our site doesn't.\"",
    description: "The product is strong but the public-facing surface feels templated or rushed. First impressions are costing deals."
  },
  {
    title: "\"We need to launch and look credible.\"",
    description: "A new product, rebrand, or funding round needs polished design and a site that builds trust fast. No time for a 6-month agency engagement."
  },
  {
    title: "\"We have the vision but not the frontend team.\"",
    description: "The design direction exists but there's no one to carry it into production with the right level of craft."
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
    description: "A clear scope with deliverables, timeline, and pricing -- typically within 48 hours.",
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
    <div
      className="bg-[var(--color-canvas)] text-[var(--color-text-primary)]"
      style={{ fontFamily: "var(--font-stitch), sans-serif" }}
    >
      {/* Hero */}
      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-40 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[var(--color-brand-primary)]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--color-brand-primary)] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--color-brand-primary)]"></span>
          </span>
          Premium Product Studio
        </div>
        <h1 className="mb-8 max-w-5xl text-5xl font-black leading-[1.1] tracking-tight md:text-8xl">
          Digital Products Designed to <span className="italic text-[var(--color-brand-primary)]">Ship</span>
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-[var(--color-text-secondary)] md:text-xl">
          Rapid Studios helps product teams design and launch polished digital products -- from positioning and UI to production frontend delivery.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Button asChild className="h-auto px-10 py-5 text-lg font-bold shadow-[0_28px_70px_rgba(59,138,240,0.22)]">
            <TrackedLink href="/contact" trackLabel="Book a Discovery Call" trackLocation="hero">
              Book a Discovery Call
            </TrackedLink>
          </Button>
          <Button asChild className="h-auto bg-[var(--color-surface-soft)] px-10 py-5 text-lg font-bold backdrop-blur-[12px]" variant="secondary">
            <TrackedLink href="/work" trackLabel="View Our Work" trackLocation="hero">
              View Our Work
            </TrackedLink>
          </Button>
        </div>
      </section>

      {/* Audience Pills */}
      <section className="border-y border-[var(--color-line-subtle)] py-8">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-3 px-4">
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">Built for</span>
          {audiencePills.map((label) => (
            <span
              className="rounded-full border border-[var(--color-line-subtle)] px-4 py-1.5 text-sm font-medium text-[var(--color-text-secondary)]"
              key={label}
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* Differentiators */}
      <section className="py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-6 px-4 sm:grid-cols-2 md:grid-cols-4">
          {differentiators.map(({ title, description }) => (
            <div
              className="rounded-xl border border-[var(--color-line-subtle)] bg-[var(--color-canvas)] p-6"
              key={title}
            >
              <p className="mb-2 text-lg font-bold text-[var(--color-text-primary)]">{title}</p>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Services */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">What We Do</p>
            <h2 className="mb-4 text-4xl font-black">Three services, one standard.</h2>
            <p className="max-w-xl text-[var(--color-text-secondary)]">
              From product strategy to production code, every engagement ends with something polished, credible, and ready to ship.
            </p>
          </div>
          <Link className="group flex items-center gap-2 font-bold text-[var(--color-brand-primary)]" href="/services">
            All services
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map(({ title, kicker, description, icon: Icon }) => (
            <div
              className="group rounded-xl border border-[var(--color-line-subtle)] bg-[var(--color-canvas)]/40 p-8 transition-all hover:border-[var(--color-brand-primary)]/50"
              key={title}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)] transition-transform group-hover:scale-110">
                <Icon className="size-6" />
              </div>
              <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em] text-[var(--color-brand-primary)]">{kicker}</p>
              <h3 className="mb-3 text-xl font-bold">{title}</h3>
              <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Selected Work */}
      <section className="bg-[var(--color-canvas)] py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">Portfolio</p>
              <h2 className="mb-4 text-4xl font-black">Selected work</h2>
              <p className="text-[var(--color-text-secondary)]">Products we designed, built, and shipped.</p>
            </div>
            <Link className="group flex items-center gap-2 font-bold text-[var(--color-brand-primary)]" href="/work">
              View all projects
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {featuredStudies.map((study, studyIndex) => (
              <Link className="group block" href={`/work/${study.slug}`} key={study.slug}>
                {(() => {
                  const visuals = getCaseStudyMedia(study.slug);
                  const featuredImage =
                    study.slug === "codeverified" ? visuals.gallery[2] ?? visuals.cover : visuals.cover;

                  return (
                    <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-xl bg-[var(--color-surface)]">
                      <Image
                        alt={study.highlight}
                        className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                        fill
                        priority={studyIndex === 0}
                        sizes="(min-width: 768px) 33vw, 100vw"
                        src={featuredImage}
                      />
                    </div>
                  );
                })()}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-brand-primary)]">
                      {study.tag}
                    </p>
                    <h3 className="mb-2 text-2xl font-bold">{study.title}</h3>
                    <p className="text-[var(--color-text-secondary)]">{study.summary}</p>
                  </div>
                  <ArrowUpRight className="mt-1 size-5 shrink-0 text-[var(--color-text-secondary)]" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Teams Bring Us In */}
      <section className="bg-[var(--color-surface)]/30 py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">Common Starting Points</p>
            <h2 className="text-4xl font-black">Why teams bring us in.</h2>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            {clientReasons.map((item) => (
              <article
                className="rounded-[1.25rem] border border-[var(--color-line-subtle)] bg-[var(--color-canvas)] p-8"
                key={item.title}
              >
                <h3 className="mb-4 text-lg font-bold leading-snug text-[var(--color-text-primary)]">{item.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl overflow-hidden px-4 py-24">
        <div className="mb-20 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">How It Works</p>
          <h2 className="text-4xl font-black">Research. Design. Ship.</h2>
        </div>
        <div className="relative">
          <div className="absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 bg-[var(--color-line-subtle)] md:block"></div>
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
            {processSteps.map((step) => (
              <div
                className="relative z-10 flex flex-col items-center rounded-xl border border-[var(--color-line-subtle)] bg-[var(--color-canvas)] p-8 text-center"
                key={step.step}
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-brand-primary)] text-xl font-black text-white shadow-[0_18px_44px_rgba(59,138,240,0.22)]">
                  {step.step}
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-[var(--color-text-secondary)]">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-12 text-center">
          <Link className="group inline-flex items-center gap-2 font-bold text-[var(--color-brand-primary)]" href="/process">
            See the full process
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      {/* What Happens After You Reach Out */}
      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mb-16 text-center">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">Getting Started</p>
          <h2 className="mb-4 text-4xl font-black">What happens after you reach out.</h2>
          <p className="mx-auto max-w-xl text-[var(--color-text-secondary)]">
            A short call to see if we&apos;re the right fit. No sales pressure, no commitment.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
          {nextSteps.map(({ step, title, description, icon: Icon }) => (
            <div className="flex gap-5" key={step}>
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                <Icon className="size-5" />
              </div>
              <div>
                <p className="mb-1 text-sm font-bold text-[var(--color-brand-primary)]">Step {step}</p>
                <h3 className="mb-2 text-lg font-bold">{title}</h3>
                <p className="text-sm leading-relaxed text-[var(--color-text-secondary)]">{description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-24">
        <div className="cta-shell relative mx-auto max-w-7xl overflow-hidden p-12 text-center text-white md:p-24">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-black blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="mb-4 text-4xl font-black leading-tight md:text-6xl">
              Ready to ship something better?
            </h2>
            <p className="mx-auto mb-8 max-w-lg text-lg text-white/80">
              Start with a 30-minute call. No pitch deck, no commitment.
            </p>
            <Button
              asChild
              className="h-auto bg-white px-10 py-5 text-xl font-bold text-[var(--color-brand-primary)] shadow-xl hover:bg-[var(--color-brand-primary-hover)] hover:text-white"
            >
              <TrackedLink href="/contact" trackLabel="Book a Discovery Call" trackLocation="bottom_cta">
                Book a Discovery Call
              </TrackedLink>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
