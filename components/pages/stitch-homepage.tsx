import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  AtSign,
  Brush,
  Code2,
  Gauge,
  Globe,
  Rocket,
  Star,
  TrendingUp,
  Users
} from "lucide-react";

import { BrandIcon } from "@/components/ui/brand-icon";
import { getCaseStudyMedia } from "@/lib/content/case-study-media";
import { getFeaturedCaseStudies } from "@/lib/content/case-studies";

const metrics = [
  {
    label: "ROI Generated",
    value: "150%",
    note: "+150% Average",
    icon: TrendingUp
  },
  {
    label: "Scale Factor",
    value: "10x",
    note: "Performance gain",
    icon: Rocket
  },
  {
    label: "Efficiency",
    value: "40%",
    note: "Faster delivery",
    icon: Gauge
  },
  {
    label: "User Growth",
    value: "5M+",
    note: "Daily active users",
    icon: Users
  }
] as const;

const services = [
  {
    title: "Product Design",
    description:
      "Beautifully crafted user interfaces backed by deep psychological research and user testing.",
    icon: Brush
  },
  {
    title: "Development",
    description:
      "Robust, scalable engineering solutions using the latest tech stacks for high-performance apps.",
    icon: Code2
  },
  {
    title: "Strategy",
    description:
      "Data-driven product roadmaps that align with business goals and market opportunities.",
    icon: TrendingUp
  }
] as const;

const testimonials = [
  {
    quote:
      '"Rapid Studios transformed our MVP from a basic tool into a market-leading platform in record time. Their speed is unmatched."',
    name: "Marcus Chen",
    role: "CEO, TechStream",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDr3XlmkaYlk1J8E7TEtuSWTA3kD_gozAjAzST0ew8EA4MZdmRtBBMGLCx_PFkywC1PNCMtss_2KrHs1pD7wa1F8-Q1kKqApWjIRckGDYAy1N8QztEUmJit5VS4IrfKRDksGo-f0nh3wxa3kG2vwsx5TK9j-7cfZTwc4rfd8uj58ElluiODhN3T3mALTZ8CIs8fVBCzEFIlghYGLzjrWy3oJz-wen0Rhfbg8x3dGvSCqO2lDhhwLOpBfGfKbjJP8UjVnZtjTuRRkZQ",
    alt: "Professional headshot of a male executive"
  },
  {
    quote:
      `"They don't just build apps; they build businesses. Their strategic insight was just as valuable as their code."`,
    name: "Sarah Jenkins",
    role: "Founder, Bloom AI",
    image:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAzPKBqZqGuGI-n53RVBCh29KMhsISxbg-YMJSM3FsQevbsdQmn8-J7Rdb5PkXW5G1wGjgpzK1Q7r48x9wNFjBc4XktkXeqkGE1haFa4rGAuuK1U3KmvxaWONzcwJRst_vxeF-Ax2w4H5o4BAoMjFAbOdCWljEVBN-yO6rCL5DMabWq65FxoFk1uxPCZOE5k43SNmlLHnns9yCdKuJMcflluME0s1CfXCkLe3z70TSNynkBCJqhw-ltJ3-xIfqkSVXru1EGXv7wCNo",
    alt: "Professional headshot of a female entrepreneur"
  }
] as const;

const footerColumns = [
  {
    title: "Studio",
    links: ["Work", "Services", "Process", "Careers"]
  },
  {
    title: "Services",
    links: ["UX/UI Design", "Web Development", "Mobile Apps", "AI Integration"]
  }
] as const;

export function StitchHomepage() {
  const featuredStudies = getFeaturedCaseStudies().slice(0, 3);

  return (
    <div
      className="bg-[#101822] text-slate-100"
      style={{ fontFamily: "var(--font-stitch), sans-serif" }}
    >
      <section className="mx-auto flex max-w-7xl flex-col items-center px-4 pb-20 pt-40 text-center">
        <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-[#2b7cee]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.28em] text-[#2b7cee]">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2b7cee] opacity-75"></span>
            <span className="relative inline-flex h-2 w-2 rounded-full bg-[#2b7cee]"></span>
          </span>
          Now booking for Q4
        </div>
        <h1 className="mb-8 max-w-5xl text-5xl font-black leading-[1.1] tracking-tight md:text-8xl">
          Digital Products at <span className="italic text-[#2b7cee]">High Velocity</span>
        </h1>
        <p className="mb-12 max-w-2xl text-lg text-slate-400 md:text-xl">
          A premium product studio delivering high-performance solutions through iterative design and engineering excellence.
        </p>
        <div className="flex flex-col gap-4 sm:flex-row">
          <Link
            className="rounded-full bg-[#2b7cee] px-10 py-5 text-lg font-bold text-white shadow-[0_28px_70px_rgba(43,124,238,0.22)] transition-all hover:bg-[#236bd6]"
            href="/contact"
          >
            Book a Discovery Call
          </Link>
          <Link
            className="rounded-full border border-white/10 bg-[rgba(28,32,39,0.8)] px-10 py-5 text-lg font-bold text-white backdrop-blur-[12px] transition-all hover:bg-white/10"
            href="/work"
          >
            View Our Work
          </Link>
        </div>
      </section>

      <section className="bg-slate-900/50 py-16">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 md:grid-cols-4">
          {metrics.map(({ label, value, note, icon: Icon }) => (
            <div
              className="flex flex-col gap-2 rounded-xl border border-slate-800 bg-[#101822]/50 p-6"
              key={label}
            >
              <p className="text-sm font-medium uppercase tracking-wider text-slate-400">{label}</p>
              <p className="text-4xl font-black text-white">{value}</p>
              <p className="flex items-center gap-1 text-sm font-bold text-[#0bda5e]">
                <Icon className="size-4" />
                {note}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-24">
        <div className="mb-16">
          <h2 className="mb-4 text-4xl font-black">Our Services</h2>
          <p className="max-w-xl text-slate-400">
            We specialize in taking complex problems and turning them into seamless digital experiences.
          </p>
        </div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {services.map(({ title, description, icon: Icon }) => (
            <div
              className="group cursor-default rounded-lg border border-slate-800 bg-[#101822]/40 p-8 transition-all hover:border-[#2b7cee]/50"
              key={title}
            >
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-full bg-[#2b7cee]/10 text-[#2b7cee] transition-transform group-hover:scale-110">
                <Icon className="size-7" />
              </div>
              <h3 className="mb-3 text-xl font-bold">{title}</h3>
              <p className="text-sm leading-relaxed text-slate-400">{description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-[#101822] py-24">
        <div className="mx-auto max-w-7xl px-4">
          <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mb-4 text-4xl font-black">Featured Work</h2>
              <p className="text-slate-400">Selected projects from our studio portfolio.</p>
            </div>
            <Link className="group flex items-center gap-2 font-bold text-[#2b7cee]" href="/work">
              View all projects
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {featuredStudies.map((study) => (
              <Link className="group block" href={`/work/${study.slug}`} key={study.slug}>
                {(() => {
                  const visuals = getCaseStudyMedia(study.slug);
                  const featuredImage =
                    study.slug === "codeverified" ? visuals.gallery[2] ?? visuals.cover : visuals.cover;

                  return (
                <div className="relative mb-6 aspect-[4/3] overflow-hidden rounded-xl bg-slate-900">
                  <Image
                    alt={study.highlight}
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    src={featuredImage}
                  />
                </div>
                  );
                })()}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-[#2b7cee]">
                      {study.tag}
                    </p>
                    <h4 className="mb-2 text-2xl font-bold">{study.title}</h4>
                    <p className="text-slate-400">{study.summary}</p>
                  </div>
                  <ArrowUpRight className="mt-1 size-5 shrink-0 text-slate-600" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl overflow-hidden px-4 py-24">
        <h2 className="mb-20 text-center text-4xl font-black">Our Process</h2>
        <div className="relative">
          <div className="absolute left-0 top-1/2 hidden h-px w-full -translate-y-1/2 bg-slate-800 md:block"></div>
          <div className="relative grid grid-cols-1 gap-12 md:grid-cols-3">
            {[
              {
                id: "01",
                title: "Discover",
                description:
                  "In-depth research and strategic planning to define the project foundation."
              },
              {
                id: "02",
                title: "Execute",
                description:
                  "Rapid prototyping and iterative development with weekly deliverables."
              },
              {
                id: "03",
                title: "Optimize",
                description:
                  "Performance tuning and continuous improvement based on real data."
              }
            ].map((step) => (
              <div
                className="relative z-10 flex flex-col items-center rounded-xl border border-slate-800 bg-[#101822] p-8 text-center"
                key={step.id}
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-[#2b7cee] text-xl font-black text-white shadow-[0_18px_44px_rgba(43,124,238,0.22)]">
                  {step.id}
                </div>
                <h3 className="mb-3 text-xl font-bold">{step.title}</h3>
                <p className="text-sm text-slate-400">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-900/30 py-24">
        <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-4 md:grid-cols-2">
          {testimonials.map((item) => (
            <article
              className="rounded-[1.25rem] border border-slate-800 bg-[#101822] p-10"
              key={item.name}
            >
              <div className="mb-6 flex gap-1 text-[#2b7cee]">
                {Array.from({ length: 5 }).map((_, index) => (
                  <Star className="size-5 fill-current" key={`${item.name}-${index}`} />
                ))}
              </div>
              <p className="mb-8 text-xl italic leading-relaxed text-slate-300">{item.quote}</p>
              <div className="flex items-center gap-4">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-slate-700">
                  <Image
                    alt={item.alt}
                    className="object-cover"
                    fill
                    sizes="48px"
                    src={item.image}
                  />
                </div>
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-slate-500">{item.role}</p>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="px-4 py-24">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-xl bg-[#2b7cee] p-12 text-center text-white md:rounded-lg md:p-24">
          <div className="pointer-events-none absolute inset-0 opacity-10">
            <div className="absolute left-0 top-0 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white blur-3xl"></div>
            <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-black blur-3xl"></div>
          </div>
          <div className="relative z-10">
            <h2 className="mb-8 text-4xl font-black leading-tight md:text-6xl">
              Ready to build the future <br /> of your business?
            </h2>
            <Link
              className="inline-flex rounded-full bg-white px-10 py-5 text-xl font-bold text-[#2b7cee] shadow-xl transition-all hover:bg-slate-100"
              href="/contact"
            >
              Book a Discovery Call
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 py-20">
        <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 px-4 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <div className="mb-6 flex items-center gap-2">
              <BrandIcon className="size-8 text-[#2b7cee]" />
              <span className="text-xl font-black uppercase tracking-[-0.03em]">Rapid Studios</span>
            </div>
            <p className="mb-6 text-sm leading-relaxed text-slate-500">
              High-velocity digital product studio for ambitious founders and enterprises.
            </p>
            <div className="flex gap-4">
              <Link className="text-slate-400 transition-colors hover:text-white" href="/">
                <Globe className="size-5" />
              </Link>
              <Link
                className="text-slate-400 transition-colors hover:text-white"
                href="mailto:hello@rapidstudios.dev"
              >
                <AtSign className="size-5" />
              </Link>
            </div>
          </div>

          {footerColumns.map((column) => (
            <div key={column.title}>
              <h5 className="mb-6 font-bold">{column.title}</h5>
              <ul className="space-y-4 text-sm text-slate-500">
                {column.links.map((link) => (
                  <li key={link}>
                    <span className="transition-colors hover:text-[#2b7cee]">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <div>
            <h5 className="mb-6 font-bold">Newsletter</h5>
            <p className="mb-4 text-sm text-slate-500">
              Get the latest insights on product and velocity.
            </p>
            <form className="flex flex-col gap-2">
              <input
                className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2 text-sm text-white outline-none transition-colors focus:border-[#2b7cee]"
                placeholder="Email address"
                type="email"
              />
              <button
                className="rounded-lg bg-slate-800 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700"
                type="button"
              >
                Join
              </button>
            </form>
          </div>
        </div>
        <div className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-slate-800/50 px-4 pt-8 text-xs text-slate-500 md:flex-row">
          <p>&copy; 2026 Rapid Studios. All rights reserved.</p>
          <div className="flex gap-8">
            <Link className="transition-colors hover:text-white" href="/">
              Privacy Policy
            </Link>
            <Link className="transition-colors hover:text-white" href="/">
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
