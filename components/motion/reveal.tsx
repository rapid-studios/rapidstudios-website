"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { motionTokens } from "@/lib/motion/tokens";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  distance?: number;
  from?: "up" | "down" | "left" | "right" | "none";
  once?: boolean;
  amount?: number;
};

export function Reveal({
  children,
  delay = 0,
  className,
  distance = 16,
  from = "up",
  once = true,
  amount = 0.2
}: RevealProps) {
  const prefersReducedMotion = useReducedMotion();
  const axisOffset = prefersReducedMotion
    ? { x: 0, y: 0 }
    : from === "left"
      ? { x: -distance, y: 0 }
      : from === "right"
        ? { x: distance, y: 0 }
        : from === "down"
          ? { x: 0, y: -distance }
          : from === "none"
            ? { x: 0, y: 0 }
            : { x: 0, y: distance };

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, x: axisOffset.x, y: axisOffset.y }}
      transition={{
        duration: prefersReducedMotion ? motionTokens.normal : motionTokens.slow,
        ease: motionTokens.easeOut,
        delay
      }}
      viewport={{ once, amount }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
