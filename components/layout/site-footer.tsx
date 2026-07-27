"use client";

import Link from "next/link";
import { ArrowRight, AtSign } from "lucide-react";

import { Reveal } from "@/components/motion/reveal";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { siteConfig } from "@/lib/site-data";

const studioLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" }
];

const serviceLinks = [
  { href: "/services", label: "Product Design" },
  { href: "/services", label: "Marketing & Launch Surfaces" },
  { href: "/services", label: "Frontend Implementation" }
];

export function SiteFooter() {
  return (
    <footer className="site-footer-glass py-16 sm:py-20">
      <div className="mx-auto grid max-w-[1180px] gap-12 px-6 md:grid-cols-[1.1fr_0.65fr_0.8fr_1fr]">
        <Reveal>
          <Link className="inline-flex items-center gap-2.5 text-white" href="/">
            <span className="brand-tile brand-tile--footer size-[34px]">
              <BrandIcon className="size-[18px]" title="" />
            </span>
            <span className="font-display text-lg font-bold uppercase tracking-[-0.02em]">
              Rapid Studios
            </span>
          </Link>
          <p className="mt-6 max-w-sm text-[15.5px] leading-[1.7] text-[var(--color-text-secondary)]">
            Premium product design and frontend delivery for teams that ship.
          </p>
          <Link
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-brand-primary)] transition-colors hover:text-[var(--color-brand-primary-hover)]"
            href={`mailto:${siteConfig.email}`}
          >
            <AtSign className="size-4" />
            {siteConfig.email}
          </Link>
        </Reveal>

        <Reveal delay={0.04}>
          <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
            Studio
          </p>
          <ul className="mt-6 space-y-3 text-sm text-[var(--color-text-secondary)]">
            {studioLinks.map((item) => (
              <li key={item.label}>
                <Link
                  className="transition-colors hover:text-[var(--color-brand-primary-hover)]"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.08}>
          <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
            Services
          </p>
          <ul className="mt-6 space-y-3 text-sm leading-6 text-[var(--color-text-secondary)]">
            {serviceLinks.map((item) => (
              <li key={item.label}>
                <Link
                  className="transition-colors hover:text-[var(--color-brand-primary-hover)]"
                  href={item.href}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </Reveal>

        <Reveal delay={0.12} from="right">
          <div className="surface-card p-6">
            <p className="text-[11.5px] font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]">
              Have a project in mind?
            </p>
            <p className="mt-4 text-[15px] leading-7 text-[var(--color-text-secondary)]">
              Tell us what you are building. We typically respond within one business day.
            </p>
            <Button asChild className="mt-6 rounded-xl normal-case tracking-normal" size="sm">
              <Link href="/contact">
                Start a Project
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-14 max-w-[1180px]" delay={0.1}>
        <div className="flex flex-col gap-3 border-t border-white/[0.08] px-6 pt-7 text-xs text-[var(--color-text-secondary)] sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; {new Date().getFullYear()} Rapid Studios. All rights reserved.</p>
          <p>Designed to ship.</p>
        </div>
      </Reveal>
    </footer>
  );
}
