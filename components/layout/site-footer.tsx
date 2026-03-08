import Link from "next/link";
import { AtSign, Globe } from "lucide-react";

import { BrandIcon } from "@/components/ui/brand-icon";
import { siteConfig } from "@/lib/site-data";

const studioLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/pricing", label: "Pricing" },
  { href: "/contact", label: "Contact" }
];

const serviceLinks = [
  { href: "/services", label: "Product Design" },
  { href: "/services", label: "Marketing & Launch Surfaces" },
  { href: "/services", label: "Frontend Implementation" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--color-line-subtle)] py-20" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 px-4 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-6 flex items-center gap-2">
            <BrandIcon className="size-8 text-[var(--color-brand-primary)]" />
            <span className="text-xl font-black tracking-[-0.06em] text-[var(--color-text-primary)]">Rapid Studios</span>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-[var(--color-text-secondary)]">
            Premium product design and frontend delivery for teams that ship.
          </p>
          <div className="flex gap-4">
            <Link aria-label="Rapid Studios website" className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]" href="/">
              <Globe className="size-5" />
            </Link>
            <Link aria-label="Email Rapid Studios" className="text-[var(--color-text-secondary)] transition-colors hover:text-[var(--color-text-primary)]" href={`mailto:${siteConfig.email}`}>
              <AtSign className="size-5" />
            </Link>
          </div>
        </div>
        <div>
          <p className="mb-6 font-bold text-[var(--color-text-primary)]">Studio</p>
          <ul className="space-y-4 text-sm text-[var(--color-text-secondary)]">
            {studioLinks.map((item) => (
              <li key={item.label}>
                <Link className="transition-colors hover:text-[var(--color-brand-primary)]" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-6 font-bold text-[var(--color-text-primary)]">Services</p>
          <ul className="space-y-4 text-sm text-[var(--color-text-secondary)]">
            {serviceLinks.map((item) => (
              <li key={item.label}>
                <Link className="transition-colors hover:text-[var(--color-brand-primary)]" href={item.href}>
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-6 font-bold text-[var(--color-text-primary)]">Get in Touch</p>
          <p className="mb-4 text-sm text-[var(--color-text-secondary)]">
            Have a project in mind? We typically respond within 24 hours.
          </p>
          <Link
            className="inline-flex h-10 items-center justify-center rounded-[var(--radius-pill)] bg-[var(--color-brand-primary)] px-5 text-sm font-bold text-white transition-all hover:bg-[var(--color-brand-primary-hover)]"
            href="/contact"
          >
            Start a Project
          </Link>
        </div>
      </div>
      <div className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-[var(--color-line-subtle)] px-4 pt-8 text-xs text-[var(--color-text-secondary)] md:flex-row">
        <p>&copy; {new Date().getFullYear()} Rapid Studios. All rights reserved.</p>
        <p>
          <Link className="transition-colors hover:text-[var(--color-text-primary)]" href={`mailto:${siteConfig.email}`}>
            {siteConfig.email}
          </Link>
        </p>
      </div>
    </footer>
  );
}
