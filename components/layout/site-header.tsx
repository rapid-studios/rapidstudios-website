"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useState } from "react";

import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";
import { motionTokens } from "@/lib/motion/tokens";
import { navigation } from "@/lib/site-data";
import { cn } from "@/lib/utils";

const headerNavigation = navigation.filter((item) => item.href !== "/contact");

export function SiteHeader() {
  const pathname = usePathname();
  const prefersReducedMotion = useReducedMotion();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <motion.header
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-[22px] z-50 px-4"
        initial={{ opacity: 0, y: prefersReducedMotion ? 0 : -16 }}
        transition={{
          duration: prefersReducedMotion ? motionTokens.normal : motionTokens.slow,
          ease: motionTokens.easeEmphasis
        }}
      >
        <nav className="nav-capsule mx-auto flex w-full max-w-[1000px] items-center justify-between gap-5 py-[11px] pl-[22px] pr-4">
          <Link
            className="flex shrink-0 items-center gap-2.5 text-white"
            href="/"
            onClick={() => setMenuOpen(false)}
          >
            <span className="brand-tile size-[30px]">
              <BrandIcon className="size-4" title="" />
            </span>
            <span className="font-display text-[17px] font-bold uppercase tracking-[-0.02em]">
              Rapid Studios
            </span>
          </Link>

          <div className="hidden items-center gap-[26px] text-sm font-medium text-[var(--color-text-secondary)] md:flex">
            {headerNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

              return (
                <Link
                  aria-current={isActive ? "page" : undefined}
                  className={cn(
                    "transition-colors duration-200 hover:text-[var(--color-brand-primary-hover)]",
                    isActive && "text-[var(--color-brand-primary)]"
                  )}
                  href={item.href}
                  key={item.href}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>

          <Button
            asChild
            className="hidden h-auto rounded-full px-[18px] py-2.5 text-[13.5px] font-bold normal-case tracking-normal md:inline-flex"
            size="sm"
          >
            <Link href="/contact">Start a Project</Link>
          </Button>

          <button
            aria-expanded={menuOpen}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            className="glass-button inline-flex size-10 items-center justify-center rounded-full md:hidden"
            onClick={() => setMenuOpen((value) => !value)}
            type="button"
          >
            {menuOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </button>
        </nav>
      </motion.header>

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
            <div className="surface-card mx-auto max-w-md p-4">
              <nav className="flex flex-col gap-1">
                {headerNavigation.map((item) => {
                  const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);

                  return (
                    <Link
                      aria-current={isActive ? "page" : undefined}
                      className={cn(
                        "rounded-xl px-4 py-3 text-sm font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text-primary)]",
                        isActive && "bg-[rgba(59,138,240,0.12)] text-[var(--color-brand-primary)]"
                      )}
                      href={item.href}
                      key={item.href}
                      onClick={() => setMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
              <Button
                asChild
                className="mt-3 h-12 w-full rounded-xl normal-case tracking-normal"
                onClick={() => setMenuOpen(false)}
              >
                <Link href="/contact">Start a Project</Link>
              </Button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
