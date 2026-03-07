export const motionTokens = {
  fast: 0.12,
  normal: 0.18,
  slow: 0.26,
  deliberate: 0.38,
  easeStandard: [0.2, 0, 0, 1] as const,
  easeOut: [0, 0, 0.2, 1] as const,
  easeInOut: [0.4, 0, 0.2, 1] as const,
  easeEmphasis: [0.16, 1, 0.3, 1] as const
};

export const revealUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: {
    duration: motionTokens.slow,
    ease: motionTokens.easeOut
  }
};
