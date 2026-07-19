// lib/cms/design/translator.ts
// The design-lane AI translator. Turns a plain-English brief ("make it feel
// like a luxury brand", "dark mode with cyan buttons") into a ThemePatch.
// Same containment model as the content translator: the AI only PROPOSES a
// JSON patch against the closed token set; the Design Guardian validates every
// value before it lands. Providers: Anthropic, OpenRouter; offline preset
// matching as fallback so the lane is demoable without keys.

import type { ThemePatch, ThemeTokens } from "./tokens";
import { THEME_PRESETS } from "./presets";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function buildSystemPrompt(current: ThemeTokens): string {
  return [
    "You are a brand design assistant for a locked website CMS.",
    "You restyle sites ONLY by proposing new values for a fixed set of design tokens.",
    "You CANNOT write CSS, HTML, or code. You CANNOT invent new token names.",
    "",
    "TOKENS (closed set) and formats:",
    "- bg, surface, text, muted, accent, accentText: hex/rgb/rgba/hsl color",
    "- headingFont, bodyFont: a font stack using only letters, digits, spaces, commas, hyphens, quotes",
    "- radius: css length like 0px, 8px, 1rem",
    '- shadow: one of "none" | "sm" | "md" | "lg"',
    '- intensity: "overlay" (restyle any page) or "tokens" (variables only)',
    "",
    "Return ONLY a JSON object (no prose, no markdown fences) containing the",
    "tokens you want to change, e.g. {\"bg\":\"#0a0f1c\",\"accent\":\"#22d3ee\"}.",
    "If the request cannot be satisfied with these tokens, return {}.",
    "",
    "CURRENT THEME:",
    JSON.stringify(current, null, 2),
  ].join("\n");
}

export interface DesignTranslateResult {
  provider: "anthropic" | "openrouter" | "offline" | "none";
  patch: ThemePatch;
  presetId?: string;
}

export async function translateDesign(current: ThemeTokens, instruction: string): Promise<DesignTranslateResult> {
  if (!instruction || typeof instruction !== "string") return { provider: "none", patch: {} };
  const system = buildSystemPrompt(current);

  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: "anthropic", patch: await callAnthropic(system, instruction) };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return { provider: "openrouter", patch: await callOpenRouter(system, instruction) };
  }
  const offline = offlinePresetMatch(instruction);
  return { provider: "offline", patch: offline.patch, presetId: offline.presetId };
}

async function callAnthropic(system: string, instruction: string): Promise<ThemePatch> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 512,
      system,
      messages: [{ role: "user", content: instruction }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text || "").join("\n");
  return parsePatch(text);
}

async function callOpenRouter(system: string, instruction: string): Promise<ThemePatch> {
  const res = await fetch(OPENROUTER_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${process.env.OPENROUTER_API_KEY as string}`,
    },
    body: JSON.stringify({
      model: process.env.OPENROUTER_MODEL || "anthropic/claude-3.5-sonnet",
      messages: [
        { role: "system", content: system },
        { role: "user", content: instruction },
      ],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`OpenRouter error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
  return parsePatch(data.choices?.[0]?.message?.content || "");
}

/** Extract a JSON object patch from a model response. Never throws. */
export function parsePatch(text: string): ThemePatch {
  if (!text) return {};
  let s = String(text).trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = s.indexOf("{");
  const end = s.lastIndexOf("}");
  if (start === -1 || end === -1 || end <= start) return {};
  s = s.slice(start, end + 1);
  try {
    const parsed = JSON.parse(s) as unknown;
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) return {};
    return parsed as ThemePatch;
  } catch {
    return {};
  }
}

/**
 * Offline fallback: match the instruction against preset names/keywords so the
 * restyle loop is demoable without an API key.
 */
export function offlinePresetMatch(instruction: string): { patch: ThemePatch; presetId?: string } {
  const t = instruction.toLowerCase();
  const score = (words: string[]) => words.reduce((n, w) => (t.includes(w) ? n + 1 : n), 0);
  const candidates: { id: string; s: number }[] = [
    { id: "dark-neon", s: score(["dark", "neon", "night", "cyber", "glow", "black"]) },
    { id: "luxury-editorial", s: score(["luxury", "premium", "gold", "elegant", "high-end", "editorial"]) },
    { id: "warm-editorial", s: score(["warm", "magazine", "serif", "paper", "classic", "cream"]) },
    { id: "playful-pop", s: score(["playful", "fun", "bright", "pop", "friendly", "colorful"]) },
    { id: "brutalist-mono", s: score(["brutalist", "mono", "minimal", "raw", "stark", "plain"]) },
    { id: "neutral-modern", s: score(["clean", "modern", "neutral", "default", "saas", "professional"]) },
  ];
  candidates.sort((a, b) => b.s - a.s);
  const best = candidates[0];
  if (!best || best.s === 0) return { patch: {} };
  const preset = THEME_PRESETS.find((p) => p.id === best.id);
  return preset ? { patch: { ...preset.tokens }, presetId: preset.id } : { patch: {} };
}
