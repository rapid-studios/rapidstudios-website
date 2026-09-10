import Link from "next/link";

import { CalendlyRightMorphButton } from "@/components/integrations/calendly";
import { Reveal } from "@/components/motion/reveal";
import { ContactForm } from "@/components/sections/contact-form";
import { PageStructuredData } from "@/components/seo/page-structured-data";
import { bookingConfig } from "@/lib/booking";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-data";

const pageSeo = {
  title: "Contact",
  description: "Talk through your app, website or automation project in a 15-minute call, or send a note. Rapid Studios typically replies within one business day.",
  pathname: "/contact"
};

export const metadata = buildMetadata(pageSeo);

const contactExpectations = [
  { value: "15 min", label: "Project call" },
  { value: "No prep", label: "Bring your idea" },
  { value: "Next step", label: "Goals and scope" }
] as const;

export default function ContactPage() {
  return (
    <div className="liquid-page pb-24">
      <PageStructuredData {...pageSeo} type="ContactPage" />
      <Reveal>
        <section className="liquid-hero liquid-hero--left mx-auto max-w-[1180px] px-6">
          <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-start lg:gap-16">
            <div className="max-w-2xl">
              <span className="protocol-label">Let&apos;s talk about your project</span>
              <h1 className="liquid-h1 mt-7">
                What&apos;s your next
                <br />
                <span className="bg-[linear-gradient(120deg,var(--color-brand-primary),var(--color-brand-accent))] bg-clip-text italic text-transparent">
                  step?
                </span>
              </h1>
              <p className="liquid-lead mt-7 max-w-xl">
                Need an app, a clearer website, or less manual work? Tell us what&apos;s getting in the way and what you want to achieve. We&apos;ll help you work out a practical next step.
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
                <CalendlyRightMorphButton label={bookingConfig.label} location="contact_page_hero" />
                <p className="max-w-sm text-sm leading-relaxed text-[var(--color-text-secondary)]">
                  A short conversation about your goals, your current setup and what to build first. No presentation or finished brief needed.
                </p>
              </div>

              <dl aria-label="What to expect after contacting Rapid Studios" className="mt-10 grid gap-4 sm:grid-cols-3">
                {contactExpectations.map((item, index) => (
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
                    Prefer to send a note?
                  </h2>
                  <p className="mt-4 max-w-xl text-base leading-7 text-[var(--color-text-secondary)]">
                    Share the problem you want to solve. A rough idea is enough to start the conversation.
                  </p>
                </div>
                <ContactForm />
                <p className="mt-6 text-sm font-semibold text-[var(--color-brand-accent)]">We typically reply within one business day.</p>
              </aside>
            </Reveal>
          </div>
        </section>
      </Reveal>
    </div>
  );
}
