// lib/cms/design/presets.ts
// Curated design-system presets, in the spirit of OpenDesign's DESIGN.md
// library (150 brand systems, "switch a system -> the next render uses the new
// tokens"). Each preset is a complete ThemeTokens object that has already been
// authored to pass the Design Guardian. Font stacks are system stacks so no
// external font loading is required.

import type { ThemeTokens } from "./tokens";
import { DEFAULT_THEME } from "./tokens";

export interface ThemePreset {
  id: string;
  name: string;
  description: string;
  tokens: ThemeTokens;
}

export const THEME_PRESETS: ThemePreset[] = [
  {
    id: "neutral-modern",
    name: "Neutral Modern",
    description: "Clean SaaS default. White field, slate text, indigo accent.",
    tokens: { ...DEFAULT_THEME },
  },
  {
    id: "warm-editorial",
    name: "Warm Editorial",
    description: "Cream paper, serif headings, burgundy accent. Magazine feel.",
    tokens: {
      bg: "#faf6ef",
      surface: "#f3ecdf",
      text: "#2b2118",
      muted: "#7a6a58",
      accent: "#8c2f39",
      accentText: "#faf6ef",
      headingFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "Georgia, 'Times New Roman', serif",
      radius: "2px",
      shadow: "none",
      intensity: "overlay",
    },
  },
  {
    id: "dark-neon",
    name: "Dark Neon",
    description: "Near-black field, cyan accent, rounded glow. Late-night product.",
    tokens: {
      bg: "#0a0f1c",
      surface: "#111a2e",
      text: "#e7ecf7",
      muted: "#8b96ad",
      accent: "#22d3ee",
      accentText: "#06121f",
      headingFont: "ui-sans-serif, system-ui, 'Segoe UI', Arial, sans-serif",
      bodyFont: "ui-sans-serif, system-ui, 'Segoe UI', Arial, sans-serif",
      radius: "12px",
      shadow: "lg",
      intensity: "overlay",
    },
  },
  {
    id: "luxury-editorial",
    name: "Luxury Editorial",
    description: "Charcoal and champagne gold. High-end brand voice.",
    tokens: {
      bg: "#141210",
      surface: "#1e1b17",
      text: "#efe9df",
      muted: "#a1988a",
      accent: "#c9a24b",
      accentText: "#141210",
      headingFont: "Georgia, 'Times New Roman', serif",
      bodyFont: "ui-sans-serif, system-ui, 'Segoe UI', Arial, sans-serif",
      radius: "0px",
      shadow: "none",
      intensity: "overlay",
    },
  },
  {
    id: "playful-pop",
    name: "Playful Pop",
    description: "Bright field, punchy coral accent, big radius. Consumer energy.",
    tokens: {
      bg: "#fffdf5",
      surface: "#fff3e0",
      text: "#27221f",
      muted: "#8a7f74",
      accent: "#ff5a5f",
      accentText: "#ffffff",
      headingFont: "'Trebuchet MS', Verdana, sans-serif",
      bodyFont: "Verdana, Geneva, sans-serif",
      radius: "16px",
      shadow: "md",
      intensity: "overlay",
    },
  },
  {
    id: "brutalist-mono",
    name: "Brutalist Mono",
    description: "Paper white, ink black, zero radius, monospace headings.",
    tokens: {
      bg: "#ffffff",
      surface: "#f2f2f2",
      text: "#000000",
      muted: "#555555",
      accent: "#0000ee",
      accentText: "#ffffff",
      headingFont: "'Courier New', Courier, monospace",
      bodyFont: "Arial, Helvetica, sans-serif",
      radius: "0px",
      shadow: "none",
      intensity: "overlay",
    },
  },
];

export function getPreset(id: string): ThemePreset | null {
  return THEME_PRESETS.find((p) => p.id === id) || null;
}
