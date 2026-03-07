import Link from "next/link";
import { AtSign, Globe } from "lucide-react";

import { BrandIcon } from "@/components/ui/brand-icon";
import { siteConfig } from "@/lib/site-data";

const studioLinks = [
  { href: "/work", label: "Work" },
  { href: "/services", label: "Services" },
  { href: "/process", label: "Process" },
  { href: "/contact", label: "Contact" }
];

const serviceLinks = [
  { href: "/services", label: "UX/UI Design" },
  { href: "/services", label: "Web Development" },
  { href: "/services", label: "Mobile Apps" },
  { href: "/services", label: "AI Integration" }
];

export function SiteFooter() {
  return (
    <footer className="border-t border-white/8 py-20" style={{ fontFamily: "var(--font-stitch), sans-serif" }}>
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-12 px-4 md:grid-cols-4">
        <div className="col-span-2 md:col-span-1">
          <div className="mb-6 flex items-center gap-2">
            <BrandIcon className="size-8 text-[#2b7cee]" />
            <span className="text-xl font-black tracking-[-0.06em] text-[var(--color-text-primary)]">Rapid Studios</span>
          </div>
          <p className="mb-6 text-sm leading-relaxed text-slate-500">
            High-velocity digital product studio for ambitious founders and enterprises.
          </p>
          <div className="flex gap-4">
            <Link className="text-slate-400 transition-colors hover:text-white" href="/">
              <Globe className="size-5" />
            </Link>
            <Link className="text-slate-400 transition-colors hover:text-white" href={`mailto:${siteConfig.email}`}>
              <AtSign className="size-5" />
            </Link>
          </div>
        </div>
        <div>
          <h5 className="mb-6 font-bold text-[var(--color-text-primary)]">Studio</h5>
          <ul className="space-y-4 text-sm text-slate-500">
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
          <h5 className="mb-6 font-bold text-[var(--color-text-primary)]">Services</h5>
          <ul className="space-y-4 text-sm text-slate-500">
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
          <h5 className="mb-6 font-bold text-[var(--color-text-primary)]">Newsletter</h5>
          <p className="mb-4 text-sm text-slate-500">Get the latest insights on product and velocity.</p>
          <form className="flex flex-col gap-2">
            <input
              className="rounded-lg border border-white/10 bg-slate-900 px-4 py-2 text-sm text-white outline-none transition-colors focus:border-[var(--color-brand-primary)]"
              placeholder="Email address"
              type="email"
            />
            <button className="rounded-lg bg-slate-800 py-2 text-sm font-bold text-white transition-colors hover:bg-slate-700" type="button">
              Join
            </button>
          </form>
        </div>
      </div>
      <div className="mx-auto mt-20 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/8 px-4 pt-8 text-xs text-slate-500 md:flex-row">
        <p>© 2024 Rapid Studios Inc. All rights reserved.</p>
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
  );
}
