import Link from "next/link";
import { ArrowRight, Code2, Layers, Lightbulb, Palette, Zap } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "About",
  description: "A small, deliberate product studio that ships polished digital products -- from positioning to production frontend.",
  pathname: "/about"
});

const principles = [
  {
    title: "Positioning before pixels",
    description: "The story, hierarchy, and conversion logic get locked before anyone opens a design tool. Visuals without direction just look expensive.",
    icon: Lightbulb
  },
  {
    title: "Design that ships",
    description: "Every layout is built with real constraints in mind -- responsive states, motion budgets, content loading. No handoff surprise.",
    icon: Palette
  },
  {
    title: "Speed with intention",
    description: "Focused sprints, weekly deliverables, tight feedback loops. Fast doesn't mean rushed -- it means fewer meetings and more decisions.",
    icon: Zap
  },
  {
    title: "You own everything",
    description: "Code, design system, content structure, assets. No lock-in, no recurring platform fee, no dependency on us to make edits.",
    icon: Code2
  }
] as const;

const capabilities = [
  "Product strategy and positioning",
  "UI/UX design systems",
  "Marketing and launch surfaces",
  "Homepage and landing page design",
  "Next.js frontend implementation",
  "Motion design and interaction",
  "Content architecture (MDX)",
  "Responsive and accessibility QA"
] as const;

const stack = [
  "Next.js",
  "React",
  "TypeScript",
  "Tailwind CSS",
  "Framer Motion",
  "Figma",
  "Vercel",
  "MDX"
] as const;

const studioStats = [
  { value: "01", label: "Studio lead" },
  { value: capabilities.length.toString().padStart(2, "0"), label: "Capabilities" },
  { value: stack.length.toString().padStart(2, "0"), label: "Stack" }
] as const;

export default function AboutPage() {
  return (
    <div className="liquid-page pb-24">
      <Reveal>
        <section className="liquid-hero liquid-hero--left mx-auto grid max-w-[1180px] gap-12 px-6 lg:grid-cols-[1.28fr_0.72fr] lg:items-center lg:gap-16">
          <div className="max-w-3xl">
            <span className="protocol-label">Studio Output</span>
            <h1 className="liquid-h1 mt-7">
              Small studio.
              <br />
              <span className="bg-[linear-gradient(120deg,var(--color-brand-primary),var(--color-brand-accent))] bg-clip-text italic text-transparent">
                Sharp output.
              </span>
            </h1>
            <p className="liquid-lead mt-7 max-w-3xl">
              Rapid Studios is a product design and frontend studio built for teams that need polished digital products shipped with speed and craft -- not a 12-person agency with a 6-month timeline.
            </p>
          </div>

          <aside aria-label="Studio at a glance">
            <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
              {studioStats.map((item, index) => (
                <Reveal delay={0.06 + index * 0.05} from="right" key={item.label}>
                  <div className="surface-card interactive-card flex items-end justify-between gap-6 p-6">
                    <div>
                      <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                        {item.label}
                      </dt>
                      <dd className="mt-3 text-5xl font-bold tracking-[-0.05em] text-[var(--color-brand-primary)]">
                        {item.value}
                      </dd>
                    </div>
                    <span aria-hidden="true" className="text-xs font-semibold tracking-[0.18em] text-[var(--color-text-muted)]">
                      0{index + 1}
                    </span>
                  </div>
                </Reveal>
              ))}
            </dl>
          </aside>
        </section>
      </Reveal>

      <section aria-labelledby="studio-lead" className="mx-auto max-w-[1180px] px-6 pb-20">
        <Reveal delay={0.04}>
          <article className="surface-card grid gap-8 p-7 sm:p-9 md:grid-cols-[auto_1fr] md:items-center lg:gap-12 lg:p-12">
            <div className="flex items-center gap-5 md:block">
              <div className="relative flex size-28 shrink-0 items-center justify-center rounded-full border border-[var(--color-line-strong)] bg-[var(--color-surface-soft)] shadow-[var(--shadow-soft)] md:size-36">
                <div aria-hidden="true" className="absolute inset-2 rounded-full border border-[var(--color-line-subtle)]" />
                <BrandIcon
                  className="relative size-12 text-[var(--color-brand-primary)] md:size-14"
                  title="Rapid Studios avatar for Travis Stephenson"
                />
              </div>
              <div className="md:mt-6">
                <span className="annotation-tag">Founder &amp; Principal</span>
              </div>
            </div>

            <div>
              <span className="protocol-label">Studio lead</span>
              <h2 id="studio-lead" className="mt-5 text-4xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-5xl">
                Travis Stephenson
              </h2>
              <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
                Founder &amp; Principal
              </p>
              <p className="mt-6 text-base leading-8 text-[var(--color-text-secondary)]">
                Product-minded engineer who has designed and shipped digital products across SaaS, AI tooling, and product launches. Background spans solutions architecture, product strategy, and frontend delivery -- the combination that makes a studio like this work.
              </p>
              <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
                Rapid Studios exists because too many product teams hire an agency and get process instead of output. The studio stays small on purpose -- fewer layers, faster decisions, better work.
              </p>
            </div>
          </article>
        </Reveal>
      </section>

      <Reveal delay={0.04}>
        <section className="mx-auto max-w-[1180px] px-6 pb-20">
          <div className="grid gap-10 border-y border-[var(--color-line-subtle)] py-14 md:py-18 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
            <div>
              <span className="protocol-label">Manifesto</span>
              <h2 className="mt-6 text-4xl font-bold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-5xl">
                Less team,
                <br />
                more taste.
              </h2>
            </div>
            <Reveal delay={0.08} from="right">
              <div className="space-y-5 text-lg leading-relaxed text-[var(--color-text-secondary)]">
                <p>
                  Most product teams do not need a bigger agency. They need a smaller one that moves faster, makes sharper decisions, and delivers work that actually looks like the product deserves.
                </p>
                <p>
                  Every engagement at Rapid Studios runs through the same tight loop: understand the positioning, design the system, build it in production. Strategy, design, and code happen in one pass -- so the product feels coherent from the first impression through launch.
                </p>
                <p>
                  No decks for the sake of decks. No design that cannot survive implementation. No handoff that creates drift. The output is the product.
                </p>
              </div>
            </Reveal>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.08}>
        <section className="mx-auto max-w-[1180px] px-6 pb-20">
          <div className="mb-10 max-w-2xl">
            <span className="protocol-label">How we operate</span>
            <h2 className="mt-6 text-4xl font-bold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-5xl">
              Studio principles
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {principles.map((item, index) => {
              const Icon = item.icon;
              return (
                <Reveal delay={0.12 + index * 0.05} key={item.title}>
                  <article className="surface-card interactive-card h-full p-7 sm:p-8">
                    <div className="flex items-center justify-between border-b border-[var(--color-line-subtle)] pb-5">
                      <div className="inline-flex size-12 items-center justify-center rounded-full border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] text-[var(--color-brand-primary)]">
                        <Icon className="size-6" />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-[0.28em] text-[var(--color-text-muted)]">
                        0{index + 1}
                      </span>
                    </div>
                    <h3 className="mt-6 text-2xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-3xl">
                      {item.title}
                    </h3>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{item.description}</p>
                  </article>
                </Reveal>
              );
            })}
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.12}>
        <section className="mx-auto max-w-[1180px] px-6 pb-20">
          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal delay={0.16}>
              <article className="surface-card h-full p-7 sm:p-9">
                <div className="inline-flex size-12 items-center justify-center rounded-full border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] text-[var(--color-brand-primary)]">
                  <Layers className="size-6" />
                </div>
                <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">
                  Capabilities
                </h3>
                <ul className="mt-5 space-y-3 text-base leading-7 text-[var(--color-text-primary)]">
                  {capabilities.map((item) => (
                    <li className="flex items-start gap-3" key={item}>
                      <span className="mt-2.5 size-1.5 shrink-0 rounded-full bg-[var(--color-brand-accent)]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            </Reveal>
            <Reveal delay={0.2}>
              <article className="surface-card h-full p-7 sm:p-9">
                <div className="inline-flex size-12 items-center justify-center rounded-full border border-[var(--color-line-subtle)] bg-[var(--color-surface-soft)] text-[var(--color-brand-primary)]">
                  <Code2 className="size-6" />
                </div>
                <h3 className="mt-6 text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-brand-primary)]">
                  Stack
                </h3>
                <div className="mt-5 flex flex-wrap gap-3">
                  {stack.map((item, index) => (
                    <Reveal delay={0.24 + index * 0.03} key={item}>
                      <span className="data-chip">{item}</span>
                    </Reveal>
                  ))}
                </div>
                <p className="mt-8 text-base leading-8 text-[var(--color-text-secondary)]">
                  Modern, composable stack chosen for speed, maintainability, and developer experience. Every project ships on infrastructure you can run and extend yourself.
                </p>
              </article>
            </Reveal>
          </div>
        </section>
      </Reveal>

      <Reveal delay={0.14}>
        <section className="px-6">
          <div className="cta-shell mx-auto max-w-[1180px] p-9 text-center sm:p-12 md:p-16">
            <span className="protocol-label justify-center">Ready to ship</span>
            <h2 className="mt-6 text-4xl font-bold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-5xl md:text-6xl">
              Ready to ship something better?
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Start with a 30-minute call. No pitch deck, no commitment -- just a clear conversation about what you&apos;re building and how we can help.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="large">
                <Link href="/contact">
                  Book a Discovery Call
                  <ArrowRight className="size-5" />
                </Link>
              </Button>
              <Button asChild size="large" variant="secondary">
                <Link href="/services">View Services</Link>
              </Button>
            </div>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
