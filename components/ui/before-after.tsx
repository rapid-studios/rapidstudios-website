"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "framer-motion";

import { cn } from "@/lib/utils";

type BeforeAfterProps = {
  before: string;
  after: string;
  beforeAlt: string;
  afterAlt: string;
  sizes: string;
  /** Cards sit inside a link, so they only auto-play; the case study page also lets visitors drag. */
  interactive?: boolean;
  priority?: boolean;
  className?: string;
};

const SWEEP_MS = 7000;

// Eased ping-pong between 12% and 88% with a short hold at each end.
function sweepPosition(elapsed: number) {
  const phase = (elapsed % SWEEP_MS) / SWEEP_MS;
  const wave = (1 - Math.cos(phase * Math.PI * 2)) / 2;
  const held = Math.min(1, Math.max(0, (wave - 0.08) / 0.84));
  const eased = held * held * (3 - 2 * held);
  return 88 - eased * 76;
}

export function BeforeAfter({
  before,
  after,
  beforeAlt,
  afterAlt,
  sizes,
  interactive = false,
  priority = false,
  className
}: BeforeAfterProps) {
  const prefersReducedMotion = useReducedMotion();
  const rootRef = useRef<HTMLDivElement>(null);
  const draggingRef = useRef(false);
  const [position, setPosition] = useState(50);
  const [autoPlay, setAutoPlay] = useState(true);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!autoPlay || !inView || prefersReducedMotion) return;
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      setPosition(sweepPosition(now - start));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [autoPlay, inView, prefersReducedMotion]);

  const moveTo = (clientX: number) => {
    const rect = rootRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    setPosition(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  const pointerHandlers = interactive
    ? {
        onPointerDown: (event: React.PointerEvent<HTMLDivElement>) => {
          setAutoPlay(false);
          draggingRef.current = true;
          event.currentTarget.setPointerCapture(event.pointerId);
          moveTo(event.clientX);
        },
        onPointerMove: (event: React.PointerEvent<HTMLDivElement>) => {
          if (draggingRef.current) moveTo(event.clientX);
        },
        onPointerUp: () => {
          draggingRef.current = false;
        },
        onPointerCancel: () => {
          draggingRef.current = false;
        }
      }
    : {};

  return (
    <div
      className={cn(
        "absolute inset-0 select-none overflow-hidden",
        interactive &&
          "cursor-ew-resize touch-pan-y has-[input:focus-visible]:ring-4 has-[input:focus-visible]:ring-inset has-[input:focus-visible]:ring-[var(--color-focus-ring)]",
        className
      )}
      ref={rootRef}
      {...pointerHandlers}
    >
      <Image alt={afterAlt} className="object-cover object-top" draggable={false} fill priority={priority} sizes={sizes} src={after} />
      <div aria-hidden="true" className="absolute inset-0" style={{ clipPath: `inset(0 ${100 - position}% 0 0)` }}>
        <Image alt="" className="object-cover object-top" draggable={false} fill sizes={sizes} src={before} />
      </div>
      <span className="sr-only">{beforeAlt}</span>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_18px_rgba(0,0,0,0.45)]"
        style={{ left: `${position}%` }}
      >
        <span className="absolute left-1/2 top-1/2 flex size-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/70 bg-black/55 text-[11px] font-bold tracking-[0.08em] text-white backdrop-blur-sm">
          &#8596;
        </span>
      </div>

      <span
        aria-hidden="true"
        className="pointer-events-none absolute left-3 top-3 rounded-full bg-black/65 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity duration-300"
        style={{ opacity: position > 14 ? 1 : 0 }}
      >
        Before
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-3 rounded-full bg-[var(--color-brand-primary-strong)] px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-white transition-opacity duration-300"
        style={{ opacity: position < 86 ? 1 : 0 }}
      >
        After
      </span>

      {interactive ? (
        <input
          aria-label="Compare the old site with the new site"
          className="sr-only"
          max={100}
          min={0}
          onChange={(event) => {
            setAutoPlay(false);
            setPosition(Number(event.target.value));
          }}
          step={1}
          type="range"
          value={Math.round(position)}
        />
      ) : null}
    </div>
  );
}
