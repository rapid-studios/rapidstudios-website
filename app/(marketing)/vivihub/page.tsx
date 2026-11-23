import Link from "next/link";

import { PageStructuredData } from "@/components/seo/page-structured-data";
import { buildMetadata } from "@/lib/seo/metadata";
import { siteConfig } from "@/lib/site-data";

const pageSeo = {
  title: "ViviHub",
  description:
    "ViviHub is a visitor sign-in system for senior care and skilled nursing facilities, built and run by Rapid Studios. Its only email is a visitor report that facility staff request.",
  pathname: "/vivihub"
};

export const metadata = buildMetadata(pageSeo);

const senderAddress = "vivihub@mail.rapidstudios.dev";

const emailFacts = [
  {
    label: "When it is sent",
    body: "Only when that facility's staff ask for it, from the facility's tablet or the ViviHub dashboard."
  },
  {
    label: "Who receives it",
    body: "Only the administrator address(es) the facility entered in its own settings, with a copy to ViviHub's operator mailbox."
  },
  {
    label: "Where it comes from",
    body: senderAddress
  },
  {
    label: "How often",
    body: "Each facility can send at most 6 reports per hour."
  }
] as const;

const linkClassName =
  "font-semibold text-[var(--color-brand-primary)] underline decoration-[var(--color-line-strong)] underline-offset-4 transition-colors hover:text-[var(--color-brand-primary-hover)] focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--color-focus-ring)]";

function EmailLink() {
  return (
    <Link className={`${linkClassName} break-all`} href={`mailto:${siteConfig.email}`}>
      {siteConfig.email}
    </Link>
  );
}

export default function ViviHubPage() {
  return (
    <div className="liquid-page pb-24">
      <PageStructuredData {...pageSeo} />

      <section className="liquid-hero liquid-hero--left mx-auto max-w-[1180px] px-6">
        <div className="max-w-3xl">
          <span className="protocol-label">Product</span>
          <h1 className="liquid-h1 mt-7">ViviHub</h1>
          <p className="liquid-lead mt-7 max-w-2xl">Visitor sign-in for senior care facilities</p>
        </div>
      </section>

      <section aria-labelledby="vivihub-what" className="mx-auto max-w-[1180px] px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="surface-card h-full p-7 sm:p-9">
            <h2 id="vivihub-what" className="text-2xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-3xl">
              What it is
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">
              ViviHub is a visitor sign-in system for the front desks of senior care and skilled nursing facilities. Visitors sign in and out on a tablet at the front desk, the facility can print a name badge, and the facility keeps its own sign-in log.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
              Rapid Studios builds and runs ViviHub&apos;s software and servers.
            </p>
          </article>

          <article className="surface-card h-full p-7 sm:p-9">
            <h2 className="text-2xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-3xl">Who uses it</h2>
            <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">
              Facility staff, such as administrators and front-desk teams.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
              Visitors use the tablet at the desk. They do not have accounts.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="vivihub-email" className="mx-auto max-w-[1180px] px-6 pb-16">
        <div className="grid gap-10 border-y border-[var(--color-line-subtle)] py-14 lg:grid-cols-[0.78fr_1.22fr] lg:gap-16">
          <div>
            <span className="protocol-label">Email</span>
            <h2
              id="vivihub-email"
              className="mt-6 text-4xl font-bold tracking-[-0.05em] text-[var(--color-text-primary)] sm:text-5xl"
            >
              The one email ViviHub sends
            </h2>
            <p className="mt-6 text-lg leading-relaxed text-[var(--color-text-secondary)]">
              A facility&apos;s visitor report.
            </p>
          </div>

          <div>
            <dl className="divide-y divide-[var(--color-line-subtle)] border-b border-[var(--color-line-subtle)]">
              {emailFacts.map((item) => (
                <div className="grid gap-2 py-5 first:pt-0 sm:grid-cols-[11rem_1fr] sm:gap-6" key={item.label}>
                  <dt className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)] sm:pt-1.5">
                    {item.label}
                  </dt>
                  <dd className="break-words text-base leading-7 text-[var(--color-text-primary)]">{item.body}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-base leading-8 text-[var(--color-text-secondary)]">
              ViviHub sends no marketing, no newsletters and nothing unrequested. It has no mailing lists and never buys or imports addresses.
            </p>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1180px] px-6 pb-16">
        <div className="grid gap-6 lg:grid-cols-2">
          <article aria-labelledby="vivihub-unexpected" className="surface-card h-full p-7 sm:p-9">
            <h2 id="vivihub-unexpected" className="text-2xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-3xl">
              Got a report you did not expect?
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">
              Email <EmailLink /> and we will remove your address from that facility&apos;s settings.
            </p>
          </article>

          <article aria-labelledby="vivihub-privacy" className="surface-card h-full p-7 sm:p-9">
            <h2 id="vivihub-privacy" className="text-2xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-3xl">
              Privacy
            </h2>
            <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">
              Visitor records belong to the facility. ViviHub uses them only to run that facility&apos;s sign-in log and reports.
            </p>
            <p className="mt-4 text-base leading-8 text-[var(--color-text-secondary)]">
              They travel over encrypted connections, backups are encrypted, and they are never sold or used for advertising.
            </p>
          </article>
        </div>
      </section>

      <section aria-labelledby="vivihub-contact" className="mx-auto max-w-[1180px] px-6">
        <div className="border-t border-[var(--color-line-subtle)] pt-10">
          <h2 id="vivihub-contact" className="text-2xl font-bold tracking-[-0.04em] text-[var(--color-text-primary)] sm:text-3xl">
            Contact
          </h2>
          <p className="mt-5 text-base leading-8 text-[var(--color-text-secondary)]">
            {siteConfig.name}, <EmailLink />
          </p>
        </div>
      </section>
    </div>
  );
}
