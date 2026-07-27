"use client";

import { motion, useAnimationControls, useReducedMotion } from "framer-motion";
import { useCallback, useEffect } from "react";

import { motionTokens } from "@/lib/motion/tokens";
import { cn } from "@/lib/utils";

export function RapidWordmark({
  className,
  textClassName
}: {
  className?: string;
  textClassName?: string;
}) {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  const drawCircle = useCallback(async () => {
    if (prefersReducedMotion) {
      controls.set({ opacity: 1, pathLength: 1 });
      return;
    }

    controls.set({ opacity: 1, pathLength: 0 });
    await controls.start({
      opacity: 1,
      pathLength: 1,
      transition: {
        duration: 0.72,
        ease: motionTokens.easeEmphasis
      }
    });
  }, [controls, prefersReducedMotion]);

  useEffect(() => {
    void drawCircle();
  }, [drawCircle]);

  return (
    <span className={cn("relative inline-flex items-center", className)} onMouseEnter={() => void drawCircle()}>
      <span className={cn("relative z-10", textClassName)}>Rapid</span>
      <svg
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-3 -inset-y-2 z-0 h-[calc(100%+1rem)] w-[calc(100%+1.5rem)] overflow-visible text-[var(--color-brand-accent)]"
        preserveAspectRatio="none"
        viewBox="0 0 160 62"
      >
        <motion.path
          animate={controls}
          d="M8 31C11 10 148 8 151 28C154 53 13 56 8 31Z"
          fill="none"
          initial={false}
          pathLength={1}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.8"
        />
        <motion.path
          animate={controls}
          d="M12 29C17 13 144 11 146 31C147 51 18 54 12 29Z"
          fill="none"
          initial={false}
          pathLength={1}
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.6"
          style={{ opacity: 0.55 }}
        />
      </svg>
    </span>
  );
}
