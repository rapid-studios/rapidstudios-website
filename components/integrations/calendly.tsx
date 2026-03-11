"use client";

import { useEffect, useRef, useState } from "react";
import Script from "next/script";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CalendarDays, X } from "lucide-react";

import { trackCtaClick } from "@/lib/analytics";
import { BrandIcon } from "@/components/ui/brand-icon";
import { Button } from "@/components/ui/button";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { parentElement: HTMLElement; resize?: boolean; url: string }) => void;
      initPopupWidget: (options: { url: string }) => void;
    };
  }
}

const CALENDLY_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";
const CALENDLY_STYLES_HREF = "https://assets.calendly.com/assets/external/widget.css";
const CALENDLY_STYLES_ID = "calendly-widget-styles";
const CALENDLY_HINT_IDS = {
  calendlyPreconnect: "calendly-preconnect",
  calendlyDnsPrefetch: "calendly-dns-prefetch",
  assetsPreconnect: "calendly-assets-preconnect",
  assetsDnsPrefetch: "calendly-assets-dns-prefetch"
} as const;

export const calendlyPopupUrl =
  "https://calendly.com/rapidstudios?background_color=0e161f&text_color=ffffff&primary_color=3b8af0&hide_landing_page_details=1";
export const calendlyInlineUrl = `${calendlyPopupUrl}&hide_gdpr_banner=1`;
const CALENDLY_BADGE_OFFSET = 52;
const CONTACT_MORPH_PANEL_WIDTH = 640;
const CONTACT_MORPH_PANEL_HEIGHT = 760;

type PanelGeometry = {
  buttonHeight: number;
  buttonLeft: number;
  buttonTop: number;
  buttonWidth: number;
  openHeight: number;
  openLeft: number;
  openTop: number;
  openWidth: number;
};

function ensureCalendlyStylesheet() {
  if (typeof document === "undefined" || document.getElementById(CALENDLY_STYLES_ID)) {
    return;
  }

  const link = document.createElement("link");
  link.id = CALENDLY_STYLES_ID;
  link.rel = "stylesheet";
  link.href = CALENDLY_STYLES_HREF;
  document.head.appendChild(link);
}

function ensureCalendlyResourceHints() {
  if (typeof document === "undefined") {
    return;
  }

  const hints = [
    {
      id: CALENDLY_HINT_IDS.calendlyPreconnect,
      rel: "preconnect",
      href: "https://calendly.com",
      crossOrigin: "anonymous"
    },
    {
      id: CALENDLY_HINT_IDS.calendlyDnsPrefetch,
      rel: "dns-prefetch",
      href: "https://calendly.com"
    },
    {
      id: CALENDLY_HINT_IDS.assetsPreconnect,
      rel: "preconnect",
      href: "https://assets.calendly.com",
      crossOrigin: "anonymous"
    },
    {
      id: CALENDLY_HINT_IDS.assetsDnsPrefetch,
      rel: "dns-prefetch",
      href: "https://assets.calendly.com"
    }
  ];

  hints.forEach((hint) => {
    if (document.getElementById(hint.id)) {
      return;
    }

    const link = document.createElement("link");
    link.id = hint.id;
    link.rel = hint.rel;
    link.href = hint.href;

    if ("crossOrigin" in hint && hint.crossOrigin) {
      link.crossOrigin = hint.crossOrigin;
    }

    document.head.appendChild(link);
  });
}

function warmCalendly() {
  ensureCalendlyResourceHints();
  ensureCalendlyStylesheet();
}

function CalendlyInlineEmbed({
  className = "absolute inset-0 calendly-inline-embed",
  onHeightChange
}: {
  className?: string;
  onHeightChange?: (height: number) => void;
}) {
  const embedRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const embedNode = embedRef.current;
    let resizeObserver: ResizeObserver | null = null;
    let cancelled = false;
    let intervalId: number | null = null;

    const mountInlineWidget = () => {
      if (cancelled || !embedNode || !window.Calendly?.initInlineWidget) {
        return false;
      }

      embedNode.innerHTML = "";
      window.Calendly.initInlineWidget({
        parentElement: embedNode,
        resize: true,
        url: calendlyInlineUrl
      });

      return true;
    };

    warmCalendly();

    if (embedNode && onHeightChange && typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver((entries) => {
        const entry = entries[0];

        if (!entry) {
          return;
        }

        onHeightChange(Math.ceil(entry.contentRect.height));
      });

      resizeObserver.observe(embedNode);
    }

    if (!mountInlineWidget()) {
      intervalId = window.setInterval(() => {
        if (mountInlineWidget() && intervalId) {
          window.clearInterval(intervalId);
        }
      }, 120);
    }

    return () => {
      cancelled = true;

      if (intervalId) {
        window.clearInterval(intervalId);
      }

      if (resizeObserver) {
        resizeObserver.disconnect();
      }

      if (embedNode) {
        embedNode.innerHTML = "";
      }
    };
  }, [onHeightChange]);

  return <div className={className} ref={embedRef} />;
}

function openCalendly(url: string) {
  warmCalendly();

  if (typeof window === "undefined") {
    return;
  }

  if (window.Calendly?.initPopupWidget) {
    window.Calendly.initPopupWidget({ url });
    return;
  }

  window.open(url, "_blank", "noopener,noreferrer");
}

export function CalendlyPopupButton({
  className,
  label = "Book a Free Call",
  location,
  variant = "primary"
}: {
  className?: string;
  label?: string;
  location: string;
  variant?: "primary" | "secondary";
}) {
  return (
    <>
      <CalendlyAssets />
      <Button
        className={className}
        onClick={() => {
          trackCtaClick(location, label);
          openCalendly(calendlyPopupUrl);
        }}
        onFocus={warmCalendly}
        onMouseEnter={warmCalendly}
        size="large"
        type="button"
        variant={variant}
      >
        <CalendarDays className="size-4" />
        {label}
      </Button>
    </>
  );
}

export function CalendlyRightMorphButton({
  className,
  label = "Book a Free Call",
  location
}: {
  className?: string;
  label?: string;
  location: string;
}) {
  const prefersReducedMotion = useReducedMotion();
  const closeTimerRef = useRef<number | null>(null);
  const [closing, setClosing] = useState(false);
  const [embedHeight, setEmbedHeight] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [geometry, setGeometry] = useState<PanelGeometry | null>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    warmCalendly();
  }, []);

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        window.clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const updateGeometry = () => {
      const trigger = triggerRef.current;

      if (!trigger) {
        return;
      }

      const rect = trigger.getBoundingClientRect();
      const margin = 24;
      const openWidth = Math.min(CONTACT_MORPH_PANEL_WIDTH, window.innerWidth - margin * 2);
      const desiredOpenHeight = Math.max((embedHeight ?? CONTACT_MORPH_PANEL_HEIGHT) + CALENDLY_BADGE_OFFSET, 320);
      const openHeight = Math.min(desiredOpenHeight, window.innerHeight - margin * 2);
      const openLeft = Math.max((window.innerWidth - openWidth) / 2, margin);
      const openTop = Math.max((window.innerHeight - openHeight) / 2, margin);

      setGeometry({
        buttonHeight: rect.height,
        buttonLeft: rect.left,
        buttonTop: rect.top,
        buttonWidth: rect.width,
        openHeight,
        openLeft,
        openTop,
        openWidth
      });
    };

    updateGeometry();
    window.addEventListener("resize", updateGeometry);
    window.addEventListener("scroll", updateGeometry, true);

    return () => {
      window.removeEventListener("resize", updateGeometry);
      window.removeEventListener("scroll", updateGeometry, true);
    };
  }, [embedHeight]);

  useEffect(() => {
    if (!expanded || typeof window === "undefined") {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [expanded]);

  const handleOpen = () => {
    if (closeTimerRef.current) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }

    setClosing(false);
    trackCtaClick(location, label);
    warmCalendly();
    setExpanded(true);
  };

  const handleClose = () => {
    if (closing) {
      return;
    }

    const closeDelay = prefersReducedMotion ? 60 : 180;

    setExpanded(false);
    setClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      setClosing(false);
      closeTimerRef.current = null;
    }, closeDelay);
  };

  const collapsedX = geometry ? geometry.buttonLeft - geometry.openLeft : 0;
  const collapsedY = geometry ? geometry.buttonTop - geometry.openTop : 0;
  const panelVisible = expanded || closing;
  const closedClipPath = geometry
    ? `inset(${Math.max(collapsedY, 0)}px ${Math.max(
        geometry.openWidth - (collapsedX + geometry.buttonWidth),
        0
      )}px ${Math.max(geometry.openHeight - (collapsedY + geometry.buttonHeight), 0)}px ${Math.max(
        collapsedX,
        0
      )}px round 999px)`
    : "inset(100% 0 0 100% round 999px)";

  return (
    <>
      <CalendlyAssets />
      <Button
        className={`${className ?? ""} ${panelVisible ? "pointer-events-none opacity-0" : "opacity-100"}`.trim()}
        onClick={handleOpen}
        onFocus={warmCalendly}
        onMouseEnter={warmCalendly}
        onTouchStart={warmCalendly}
        ref={triggerRef}
        size="large"
        style={{ transition: "opacity 120ms cubic-bezier(0.22, 1, 0.36, 1)" }}
        type="button"
        variant="primary"
      >
        <CalendarDays className="size-4" />
        {label}
      </Button>
      <AnimatePresence>
        {panelVisible && geometry ? (
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close scheduling panel"
            className="fixed inset-0 z-[55] bg-[rgba(8,12,18,0.36)] backdrop-blur-[2px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={handleClose}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.16,
              ease: [0.22, 1, 0.36, 1]
            }}
            type="button"
          />
        ) : null}
      </AnimatePresence>
      {geometry ? (
        <motion.div
          animate={{
            boxShadow:
              panelVisible
                ? "0 34px 96px rgba(4, 10, 18, 0.52), 0 0 0 1px rgba(59, 138, 240, 0.14)"
                : "0 28px 70px rgba(59, 138, 240, 0.18), 0 0 0 1px rgba(59, 138, 240, 0.1)",
            clipPath: expanded ? "inset(0px 0px 0px 0px round 32px)" : closedClipPath,
            opacity: panelVisible ? 1 : 0,
            x: 0,
            y: 0
          }}
          className={`fixed z-[65] overflow-hidden border border-[rgba(59,138,240,0.16)] bg-[rgba(10,16,24,0.96)] backdrop-blur-[20px] ${
            panelVisible ? "pointer-events-auto" : "pointer-events-none"
          }`}
          initial={false}
          style={{
            height: geometry.openHeight,
            left: geometry.openLeft,
            top: geometry.openTop,
            width: geometry.openWidth
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0.12, ease: [0.22, 1, 0.36, 1] }
              : { type: "spring", stiffness: 320, damping: 34, mass: 0.82 }
          }
        >
          <motion.button
            animate={{ opacity: expanded ? 1 : 0, y: expanded || prefersReducedMotion ? 0 : -6 }}
            aria-label="Close scheduling panel"
            className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(10,16,24,0.82)] text-white/70 backdrop-blur-sm transition-colors hover:bg-[rgba(18,28,42,0.92)] hover:text-white"
            initial={false}
            onClick={handleClose}
            transition={{
              delay: expanded && !prefersReducedMotion ? 0.08 : 0,
              duration: prefersReducedMotion ? 0.08 : 0.12,
              ease: [0.22, 1, 0.36, 1]
            }}
            type="button"
          >
            <X className="size-4" />
          </motion.button>
          <motion.div
            animate={{ opacity: expanded ? 1 : 0, y: expanded || prefersReducedMotion ? 0 : -6 }}
            className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(10,16,24,0.82)] px-3 py-2 text-white/80 backdrop-blur-sm"
            initial={false}
            transition={{
              duration: prefersReducedMotion ? 0.08 : 0.12,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <BrandIcon className="size-4 text-[var(--color-brand-primary)]" size={16} title={undefined} />
            <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Rapid Studios</span>
          </motion.div>
          <motion.div
            animate={{ opacity: expanded ? 1 : 0, y: expanded || prefersReducedMotion ? 0 : 8 }}
            className="absolute inset-0"
            initial={false}
            transition={{
              delay: expanded && !prefersReducedMotion ? 0.08 : 0,
              duration: prefersReducedMotion ? 0.08 : 0.14,
              ease: [0.22, 1, 0.36, 1]
            }}
          >
            <CalendlyInlineEmbed
              className="absolute inset-x-0 bottom-0 top-[52px] calendly-inline-embed"
              onHeightChange={setEmbedHeight}
            />
          </motion.div>
        </motion.div>
      ) : null}
    </>
  );
}

export function CalendlyBadgeWidget() {
  const prefersReducedMotion = useReducedMotion();
  const [embedHeight, setEmbedHeight] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const collapsedHeight = 56;
  const collapsedWidth = 214;
  const panelHeight = Math.max((embedHeight ?? CONTACT_MORPH_PANEL_HEIGHT) + CALENDLY_BADGE_OFFSET, 320);

  useEffect(() => {
    warmCalendly();
  }, []);

  useEffect(() => {
    if (!expanded || typeof window === "undefined") {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setExpanded(false);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [expanded]);

  const primeCalendly = () => {
    warmCalendly();
  };

  const handleOpen = () => {
    trackCtaClick("floating_calendly", "Book a Free Call");
    primeCalendly();
    setExpanded(true);
  };

  const handleClose = () => {
    setExpanded(false);
  };

  return (
    <>
      <CalendlyAssets />
      <AnimatePresence>
        {expanded ? (
          <motion.button
            animate={{ opacity: 1 }}
            aria-label="Close scheduling panel"
            className="fixed inset-0 z-[55] bg-[rgba(8,12,18,0.36)] backdrop-blur-[2px]"
            exit={{ opacity: 0 }}
            initial={{ opacity: 0 }}
            onClick={handleClose}
            transition={{
              duration: prefersReducedMotion ? 0.1 : 0.16,
              ease: [0.22, 1, 0.36, 1]
            }}
            type="button"
          />
        ) : null}
      </AnimatePresence>
      <div
        className="pointer-events-none fixed bottom-5 right-5 z-[60] sm:bottom-6 sm:right-6"
        style={{
          height: `min(${panelHeight}px, calc(100vh - 40px))`,
          width: `min(${CONTACT_MORPH_PANEL_WIDTH}px, calc(100vw - 24px))`
        }}
      >
        <motion.div
          animate={{
            boxShadow: expanded
              ? "0 34px 96px rgba(4, 10, 18, 0.52), 0 0 0 1px rgba(59, 138, 240, 0.14)"
              : "0 28px 70px rgba(59, 138, 240, 0.22), 0 0 0 1px rgba(59, 138, 240, 0.14)",
            clipPath: expanded
              ? "inset(0% 0% 0% 0% round 32px)"
              : `inset(calc(100% - ${collapsedHeight}px) 0% 0% calc(100% - ${collapsedWidth}px) round 999px)`,
            opacity: 1
          }}
          className="pointer-events-none absolute inset-0 overflow-hidden border border-[rgba(59,138,240,0.16)] bg-[rgba(10,16,24,0.96)] backdrop-blur-[20px]"
          initial={{
            clipPath: `inset(calc(100% - ${collapsedHeight}px) 0% 0% calc(100% - ${collapsedWidth}px) round 999px)`,
            opacity: 0
          }}
          style={{
            transformOrigin: "right bottom"
          }}
          transition={
            prefersReducedMotion
              ? { duration: 0.12, ease: [0.22, 1, 0.36, 1] }
              : { type: "spring", stiffness: 360, damping: 32, mass: 0.78 }
          }
        >
          <motion.button
            animate={{
              opacity: expanded ? 0 : 1,
              y: expanded && !prefersReducedMotion ? 6 : 0
            }}
            aria-label="Book a Free Call"
            className={`pointer-events-auto absolute bottom-0 right-0 flex h-14 w-[214px] items-center justify-center gap-2 overflow-hidden rounded-full bg-[var(--color-brand-primary)] px-6 text-sm font-semibold tracking-[-0.02em] text-white ${
              expanded ? "pointer-events-none" : ""
            }`}
            onClick={handleOpen}
            onFocus={primeCalendly}
            onMouseEnter={primeCalendly}
            onTouchStart={primeCalendly}
            transition={{
              duration: prefersReducedMotion ? 0.08 : 0.1,
              ease: [0.22, 1, 0.36, 1]
            }}
            type="button"
            whileHover={prefersReducedMotion || expanded ? undefined : { y: -2, scale: 1.01 }}
            whileTap={prefersReducedMotion || expanded ? undefined : { scale: 0.985 }}
            >
              <motion.span
                aria-hidden="true"
              className="pointer-events-none absolute inset-0 rounded-full bg-[linear-gradient(120deg,transparent_8%,rgba(255,255,255,0.22)_38%,transparent_64%)]"
              initial={false}
              transition={{
                duration: prefersReducedMotion ? 0.1 : 0.18,
                ease: [0.4, 0, 0.2, 1]
              }}
              variants={{
                collapsed: { opacity: 0.45, x: "-125%" },
                expanded: { opacity: 0.9, x: "130%" }
              }}
              animate="collapsed"
              whileHover={prefersReducedMotion ? undefined : "expanded"}
              />
              <span className="pointer-events-none absolute inset-0 rounded-full bg-[radial-gradient(circle_at_22%_20%,rgba(255,255,255,0.16),transparent_56%)]" />
              <CalendarDays className="relative z-10 size-4 shrink-0" />
              <span className="relative z-10 whitespace-nowrap">Book a Free Call</span>
          </motion.button>

            <motion.div
              animate={{
                opacity: expanded ? 1 : 0,
                y: expanded || prefersReducedMotion ? 0 : 10
              }}
              className={`absolute inset-0 flex flex-col ${expanded ? "pointer-events-auto" : "pointer-events-none"}`}
              transition={{
                delay: expanded && !prefersReducedMotion ? 0.06 : 0,
                duration: prefersReducedMotion ? 0.12 : 0.16,
                ease: [0.22, 1, 0.36, 1]
              }}
            >
              <button
                aria-label="Close scheduling panel"
                className="absolute right-4 top-4 z-20 flex size-10 items-center justify-center rounded-full border border-white/10 bg-[rgba(10,16,24,0.82)] text-white/70 backdrop-blur-sm transition-colors hover:bg-[rgba(18,28,42,0.92)] hover:text-white"
                onClick={handleClose}
                type="button"
              >
                <X className="size-4" />
              </button>
              <div className="pointer-events-none absolute left-4 top-4 z-20 flex items-center gap-2 rounded-full border border-white/10 bg-[rgba(10,16,24,0.82)] px-3 py-2 text-white/80 backdrop-blur-sm">
                <BrandIcon className="size-4 text-[var(--color-brand-primary)]" size={16} title={undefined} />
                <span className="text-[11px] font-bold uppercase tracking-[0.18em]">Rapid Studios</span>
              </div>
              <div className="relative min-h-0 flex-1 bg-[var(--color-surface)]">
                <CalendlyInlineEmbed
                  className="absolute inset-x-0 bottom-0 top-[52px] calendly-inline-embed"
                  onHeightChange={setEmbedHeight}
                />
              </div>
            </motion.div>
          </motion.div>
      </div>
    </>
  );
}

function CalendlyAssets() {
  useEffect(() => {
    warmCalendly();
  }, []);

  return (
    <Script
      src={CALENDLY_SCRIPT_SRC}
      strategy="afterInteractive"
    />
  );
}
