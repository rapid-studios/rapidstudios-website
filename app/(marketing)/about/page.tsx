import Link from "next/link";
import { ArrowRight, Code2, Layers, Lightbulb, Palette, Zap } from "lucide-react";

import { BrandIcon } from "@/components/ui/brand-icon";
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

export default function AboutPage() {
  return (
    <div className="pb-24 pt-16" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 pb-20 pt-24">
        <div className="mx-auto max-w-4xl">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
            About the studio
          </p>
          <h1 className="mt-8 text-5xl font-black leading-[1.05] tracking-[-0.06em] text-[var(--color-text-primary)] md:text-7xl">
            Small studio.{" "}
            <span className="text-[var(--color-brand-primary)]">Sharp output.</span>
          </h1>
          <p className="mt-8 max-w-3xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
            Rapid Studios is a product design and frontend studio built for teams that need polished digital products shipped with speed and craft -- not a 12-person agency with a 6-month timeline.
          </p>
        </div>
      </section>

      {/* Philosophy */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
              Philosophy
            </p>
            <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] text-[var(--color-text-primary)] md:text-5xl">
              Less team, more taste.
            </h2>
          </div>
          <div className="space-y-6">
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Most product teams don't need a bigger agency. They need a smaller one that moves faster, makes sharper decisions, and delivers work that actually looks like the product deserves.
            </p>
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
              Every engagement at Rapid Studios runs through the same tight loop: understand the positioning, design the system, build it in production. Strategy, design, and code happen in one pass -- so the product feels coherent from the first impression through launch.
            </p>
            <p className="text-lg leading-relaxed text-[var(--color-text-secondary)]">
              No decks for the sake of decks. No design that can't survive implementation. No handoff that creates drift. The output is the product.
            </p>
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="surface-card overflow-hidden rounded-[2rem] p-8 md:p-12">
          <div className="grid gap-10 lg:grid-cols-[auto_1fr] lg:items-center">
            <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10">
              <BrandIcon className="size-12 text-[var(--color-brand-primary)]" />
            </div>
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
                Studio Lead
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-[var(--color-text-primary)] md:text-4xl">
                Travis Stephenson
              </h2>
              <p className="mt-1 text-base font-semibold text-[var(--color-text-secondary)]">
                Founder &amp; Principal
              </p>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
                Product-minded engineer who has designed and shipped digital products across SaaS, AI tooling, and product launches. Background spans solutions architecture, product strategy, and frontend delivery -- the combination that makes a studio like this work.
              </p>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--color-text-secondary)]">
                Rapid Studios exists because too many product teams hire an agency and get process instead of output. The studio stays small on purpose -- fewer layers, faster decisions, better work.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="mb-12">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
            How we operate
          </p>
          <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] text-[var(--color-text-primary)] md:text-5xl">
            Principles
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {principles.map((item) => {
            const Icon = item.icon;
            return (
              <article className="surface-card p-8" key={item.title}>
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
                  <Icon className="size-6" />
                </div>
                <h3 className="text-xl font-black tracking-[-0.03em] text-[var(--color-text-primary)]">
                  {item.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-text-secondary)]">
                  {item.description}
                </p>
              </article>
            );
          })}
        </div>
      </section>

      {/* Capabilities + Stack */}
      <section className="mx-auto max-w-7xl px-4 pb-20">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="surface-card p-8">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
              <Layers className="size-6" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Capabilities
            </h3>
            <ul className="mt-5 space-y-3 text-base leading-7 text-[var(--color-text-primary)]">
              {capabilities.map((item) => (
                <li className="flex items-start gap-3" key={item}>
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--color-brand-primary)]" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="surface-card p-8">
            <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]">
              <Code2 className="size-6" />
            </div>
            <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">
              Stack
            </h3>
            <div className="mt-5 flex flex-wrap gap-3">
              {stack.map((item) => (
                <span
                  className="rounded-full border border-[var(--color-line-subtle)] px-4 py-2 text-sm font-semibold text-[var(--color-text-primary)]"
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>
            <p className="mt-8 text-base leading-relaxed text-[var(--color-text-secondary)]">
              Modern, composable stack chosen for speed, maintainability, and developer experience. Every project ships on infrastructure you can run and extend yourself.
            </p>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-[var(--color-line-subtle)] bg-[rgba(18,28,42,0.84)] px-10 py-14 text-center">
          <h2 className="text-4xl font-black tracking-[-0.05em] text-[var(--color-text-primary)] md:text-5xl">
            Ready to ship something better?
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
            Start with a 30-minute call. No pitch deck, no commitment -- just a clear conversation about what you're building and how we can help.
          </p>
          <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)] px-8 py-4 text-lg font-bold text-white transition-all hover:bg-[var(--color-brand-primary-hover)]"
              href="/contact"
            >
              Book a Discovery Call
              <ArrowRight className="size-5" />
            </Link>
            <Link
              className="inline-flex items-center gap-2 rounded-full border border-white/10 px-8 py-4 text-lg font-bold text-[var(--color-text-primary)] transition-colors hover:bg-white/5"
              href="/services"
            >
              View Services
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
