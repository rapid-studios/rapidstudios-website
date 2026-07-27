import Link from "next/link";

import { CalendlyRightMorphButton } from "@/components/integrations/calendly";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/sections/contact-form";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-data";

export const metadata = buildMetadata({
  title: "Contact",
  description: "Tell us about your project. Rapid Studios typically responds within 24 hours with a clear next step.",
  pathname: "/contact"
});

const proofStats = [
  { value: "<24hr", label: "Response Time" },
  { value: "30 min", label: "Discovery Call" },
  { value: "48hr", label: "Proposal Turnaround" }
] as const;

export default function ContactPage() {
  return (
    <div className="liquid-page pb-24">
      <Reveal>
        <section className="liquid-hero liquid-hero--left mx-auto max-w-[1180px] px-6">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-16">
            <div className="max-w-2xl">
              <span className="protocol-label">Contact Protocol</span>
              <h1 className="liquid-h1 mt-7">
                Start your next
                <br />
                <span className="bg-[linear-gradient(120deg,var(--color-brand-primary),var(--color-brand-accent))] bg-clip-text italic text-transparent">
                  product.
                </span>
              </h1>
              <p className="liquid-lead mt-7 max-w-xl">
                We transform ambitious ideas into market-ready products in record time. Let&apos;s build something remarkable.
              </p>

              <div className="mt-9 border-y border-[var(--color-line-subtle)] py-6">
                <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
                  Prefer direct email?
                </p>
                <Link
                  className="mt-3 inline-flex break-all text-lg font-semibold text-[var(--color-brand-primary)] underline decoration-[var(--color-line-strong)] underline-offset-6 transition-colors hover:text-[var(--color-brand-primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus-ring)]"
                  href={`mailto:${siteConfig.email}`}
                >
                  {siteConfig.email}
                </Link>
              </div>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
                <CalendlyRightMorphButton label="Book a Discovery Call" location="contact_page_hero" />
                <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  Prefer to talk it through live? Pick a time instantly and we&apos;ll meet on the calendar instead of starting over email.
                </p>
              </div>

              <dl aria-label="What to expect after contacting Rapid Studios" className="mt-10 grid gap-4 sm:grid-cols-3">
                {proofStats.map((item, index) => (
                  <Reveal delay={0.08 + index * 0.05} key={item.label}>
                    <div className="surface-card interactive-card h-full p-5">
                      <dt className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                        {item.label}
                      </dt>
                      <dd className="mt-4 text-3xl font-bold tracking-[-0.04em] text-[var(--color-brand-primary)]">
                        {item.value}
                      </dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>

            <Reveal delay={0.1} from="right">
              <aside aria-labelledby="project-intake-heading" className="surface-card p-7 sm:p-9 lg:p-10">
                <div className="mb-8 border-b border-[var(--color-line-subtle)] pb-5">
                  <h2 id="project-intake-heading" className="protocol-label">
                    Project Intake
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
                    Send the brief, share the rough scope, and we&apos;ll come back with a clear next step.
                  </p>
                </div>
                <ContactForm />
                <p className="mt-6 text-sm font-semibold text-[var(--color-brand-accent)]">Typical response time: &lt;12 hours</p>
              </aside>
            </Reveal>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
