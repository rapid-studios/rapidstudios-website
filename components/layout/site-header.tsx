"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { motionTokens } from "@/lib/motion/tokens";
import { navigation } from "@/lib/site-data";
import { BrandIcon } from "@/components/ui/brand-icon";
import { cn } from "@/lib/utils";

const headerNavigation = navigation.filter((item) => item.href !== "/contact");

export function SiteHeader() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <header
        className="fixed inset-x-0 top-6 z-50 flex justify-center px-4"
        style={{ fontFamily: "var(--font-stitch), sans-serif" }}
      >
        <nav className="flex w-full max-w-5xl items-center justify-between rounded-full border border-white/10 bg-[rgba(28,32,39,0.8)] px-6 py-3 shadow-[0_20px_60px_rgba(0,0,0,0.24)] backdrop-blur-[12px]">
          <Link className="flex items-center gap-2" href="/" onClick={() => setMenuOpen(false)}>
            <BrandIcon className="size-8 text-[#2b7cee]" />
            <span className="text-lg font-black uppercase tracking-[-0.03em] text-white md:text-xl">
              RAPID STUDIOS
            </span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-slate-400 md:flex">
            {headerNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  className={cn("transition-colors hover:text-[#2b7cee]", isActive && "text-[#2b7cee]")}
                  href={item.href}
                  key={item.href}
                  onClick={() => setMenuOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <div className="hidden md:flex">
            <Link
              className="rounded-full bg-[#2b7cee] px-5 py-2 text-sm font-bold text-white transition-all hover:scale-105 hover:bg-[#236bd6]"
              href="/contact"
            >
              Start a Project
            </Link>
          </div>

          <button
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition-colors hover:bg-white/10 md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            type="button"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </nav>
      </header>

      <AnimatePresence>
        {menuOpen ? (
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="fixed inset-x-4 top-24 z-40 md:hidden"
            exit={{ opacity: 0, y: prefersReducedMotion ? 0 : -8 }}
            initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -16 }}
            transition={{
              duration: prefersReducedMotion ? motionTokens.normal : motionTokens.slow,
              ease: motionTokens.easeEmphasis
            }}
          >
            <div
              className="mx-auto max-w-5xl rounded-[1.5rem] border border-white/10 bg-[rgba(16,24,34,0.96)] p-5 shadow-[0_20px_60px_rgba(0,0,0,0.32)] backdrop-blur-[18px]"
              style={{ fontFamily: "var(--font-stitch), sans-serif" }}
            >
              <nav className="flex flex-col gap-3">
                {headerNavigation.map((item) => (
                  <Link
                    className={cn(
                      "rounded-[1rem] px-4 py-3 text-base font-semibold text-white transition-colors hover:bg-white/5",
                      (pathname === item.href || pathname.startsWith(`${item.href}/`)) && "text-[#2b7cee]"
                    )}
                    href={item.href}
                    key={item.href}
                    onClick={() => setMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
              <div className="mt-5 grid gap-3">
                <Link
                  className="inline-flex h-12 items-center justify-center rounded-full bg-[#2b7cee] px-5 text-sm font-bold text-white transition-all hover:bg-[#236bd6]"
                  href="/contact"
                  onClick={() => setMenuOpen(false)}
                >
                  Start a Project
                </Link>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
