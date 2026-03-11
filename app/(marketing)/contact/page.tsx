import Link from "next/link";

import { CalendlyRightMorphButton } from "@/components/integrations/calendly";
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
    <div className="pb-24 pt-16" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <section className="mx-auto max-w-7xl px-4 pb-16 pt-24">
        <div className="grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <div className="pt-10">
            <p className="text-sm font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">Get in touch</p>
            <h1 className="mt-8 text-6xl font-black leading-[0.95] tracking-[-0.08em] text-[var(--color-text-primary)] md:text-[6.5rem]">
              Start Your Next <span className="text-[var(--color-brand-primary)]">Product.</span>
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-relaxed text-[var(--color-text-secondary)]">
              We transform ambitious ideas into market-ready products in record time. Let&apos;s build something remarkable.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <CalendlyRightMorphButton label="Book a Free Call" location="contact_page_hero" />
              <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
                Prefer to talk it through live? Pick a time instantly and we&apos;ll meet on the calendar instead of starting over email.
              </p>
            </div>
            <div className="mt-12 grid gap-4 sm:grid-cols-3">
              {proofStats.map((item) => (
                <div className="rounded-[2rem] border border-[var(--color-line-subtle)] bg-white/4 px-6 py-7" key={item.label}>
                  <p className="text-3xl font-black tracking-[-0.05em] text-[var(--color-brand-primary)]">{item.value}</p>
                  <p className="mt-2 text-lg text-[var(--color-text-secondary)]">{item.label}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card rounded-[2.5rem] p-8 md:p-12">
            <ContactForm />
            <p className="mt-6 text-sm font-semibold text-[var(--color-brand-accent)]">Typical response time: &lt;12 hours</p>
            <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
              Prefer direct email?{" "}
              <Link className="font-semibold text-[var(--color-text-primary)] hover:text-[var(--color-brand-primary)]" href={`mailto:${siteConfig.email}`}>
                {siteConfig.email}
              </Link>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
