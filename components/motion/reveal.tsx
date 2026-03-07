"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

import { motionTokens } from "@/lib/motion/tokens";

type RevealProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

export function Reveal({ children, delay = 0, className }: RevealProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 16 }}
      transition={{
        duration: prefersReducedMotion ? motionTokens.normal : motionTokens.slow,
        ease: motionTokens.easeOut,
        delay
      }}
      viewport={{ once: true, amount: 0.2 }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}
