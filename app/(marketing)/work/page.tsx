import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import { getCaseStudyMedia } from "@/lib/content/case-study-media";
import { getAllCaseStudies } from "@/lib/content/case-studies";
import { buildMetadata } from "@/lib/seo/metadata";

export const metadata = buildMetadata({
  title: "Work",
  description: "A curated portfolio of high-impact digital products and experiences built by Rapid Studios.",
  pathname: "/work"
});

const filters = ["All Projects", "Developer Tools", "Financial Systems", "Automation", "AI Ops"] as const;

export default function WorkPage() {
  const studies = getAllCaseStudies();
  const [featured, ...rest] = studies;

  return (
    <div className="pb-24 pt-16" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <section className="mx-auto max-w-7xl px-4 pb-12 pt-20">
        <h1 className="text-6xl font-black tracking-[-0.08em] text-[var(--color-text-primary)] md:text-[7rem]">
          Our Work
        </h1>
        <p className="mt-5 max-w-3xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
          A curated portfolio of high-impact digital products and experiences built for global brands and ambitious startups.
        </p>
        <div className="mt-14 flex flex-wrap gap-3">
          {filters.map((filter, index) => (
            <span
              className={`rounded-full px-6 py-3 text-lg font-semibold ${
                index === 0
                  ? "bg-[var(--color-brand-primary)] text-white"
                  : "border border-[var(--color-line-subtle)] bg-white/4 text-[var(--color-text-primary)]"
              }`}
              key={filter}
            >
              {filter}
            </span>
          ))}
        </div>
      </section>

      {featured ? (
        <section className="mx-auto max-w-7xl px-4 pb-8">
          <Link className="group block" href={`/work/${featured.slug}`}>
            <article className="overflow-hidden rounded-[2.2rem] border border-[var(--color-line-subtle)] bg-[rgba(18,28,42,0.86)] shadow-[var(--shadow-float)]">
              <div className="relative aspect-[16/9] bg-[linear-gradient(135deg,#274f70,#406f76)]">
                <Image
                  alt={featured.highlight}
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  fill
                  sizes="100vw"
                  src={getCaseStudyMedia(featured.slug).cover}
                />
              </div>
              <div className="grid gap-6 px-8 py-8 md:grid-cols-[1fr_auto] md:items-end">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">Featured project</p>
                  <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-[var(--color-text-primary)]">
                    {featured.title}
                  </h2>
                  <p className="mt-4 max-w-3xl text-lg leading-relaxed text-[var(--color-text-secondary)]">
                    {featured.summary}
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {featured.metrics.map((metric) => (
                      <div
                        className="rounded-full border border-[var(--color-line-subtle)] bg-white/4 px-4 py-2 text-sm text-[var(--color-text-primary)]"
                        key={metric.label}
                      >
                        <span className="font-semibold text-[var(--color-brand-accent)]">{metric.value}</span> {metric.label}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-brand-primary)] px-6 py-3 text-sm font-bold text-white">
                  View Case Study
                  <ArrowRight className="size-4" />
                </div>
              </div>
            </article>
          </Link>
        </section>
      ) : null}

      <section className="mx-auto max-w-7xl px-4 py-8">
        <div className="grid gap-8 md:grid-cols-2">
          {(rest.length > 0 ? rest : studies).map((study) => (
            <Link className="group block" href={`/work/${study.slug}`} key={study.slug}>
              <article className="overflow-hidden rounded-[2rem] border border-[var(--color-line-subtle)] bg-[rgba(18,28,42,0.82)] shadow-[var(--shadow-soft)] transition-transform duration-200 group-hover:-translate-y-1">
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-900">
                  <Image
                    alt={study.highlight}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    fill
                    sizes="(min-width: 768px) 50vw, 100vw"
                    src={getCaseStudyMedia(study.slug).cover}
                  />
                </div>
                <div className="flex items-start justify-between gap-6 px-7 py-7">
                  <div>
                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-text-secondary)]">
                      {study.client} / {study.year}
                    </p>
                    <h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-[var(--color-text-primary)]">
                      {study.title}
                    </h3>
                    <p className="mt-2 text-sm font-semibold uppercase tracking-[0.16em] text-[var(--color-brand-primary)]">
                      {study.tag}
                    </p>
                    <p className="mt-4 text-base leading-7 text-[var(--color-text-secondary)]">{study.summary}</p>
                  </div>
                  <ArrowUpRight className="mt-1 size-5 text-slate-600 transition-colors group-hover:text-[var(--color-brand-primary)]" />
                </div>
              </article>
            </Link>
          ))}

          {rest.length < 2 ? (
            <div className="rounded-[2rem] border border-dashed border-[var(--color-line-subtle)] bg-white/3 p-8">
              <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-text-secondary)]">More proof</p>
              <h3 className="mt-4 text-3xl font-black tracking-[-0.05em] text-[var(--color-text-primary)]">
                Additional case studies are being prepared.
              </h3>
              <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
                The work page stays selective on purpose. Reach out if you want examples closer to your product category or launch stage.
              </p>
              <Link
                className="mt-6 inline-flex rounded-full bg-[var(--color-brand-primary)] px-5 py-3 text-sm font-bold text-white"
                href="/contact"
              >
                Request relevant examples
              </Link>
            </div>
          ) : null}
        </div>
      </section>

      <section className="px-4 pt-16">
        <div className="cta-shell relative mx-auto max-w-7xl overflow-hidden p-12 text-center text-white md:p-20">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-black blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="text-4xl font-black tracking-[-0.05em] md:text-6xl">
              Want a portfolio that sells the work before the call?
            </h2>
            <p className="mx-auto mt-6 max-w-3xl text-lg leading-relaxed text-white/82">
              Rapid Studios structures proof so the best projects do the heavy lifting without turning the site into a noisy archive.
            </p>
            <Link className="mt-8 inline-flex rounded-full bg-white px-8 py-4 text-lg font-bold text-[var(--color-brand-primary)]" href="/contact">
              Start a Project
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
