// lib/cms/translator.ts
// The AI translator. Turns plain English into a STRUCTURED set of slot changes
// [{ slotId, newValue }]. It NEVER writes code and NEVER touches the content
// map — it only proposes. Every proposal is funneled through the Guardian by
// the caller. Providers: Anthropic, OpenRouter; offline heuristic as fallback.

import type { ContentMap, ProposedChange } from "./types";

const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";
const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";

function buildSystemPrompt(contentMap: ContentMap): string {
  const slots = Object.entries(contentMap).map(([id, s]) => ({
    slotId: id,
    type: s.type,
    currentValue: typeof s.value === "string" ? s.value : String(s.value),
  }));
  return [
    "You are a content-editing assistant for a locked website CMS.",
    "You may ONLY change the values of the editable slots listed below.",
    "You CANNOT add, remove, rename, or reorder slots. You CANNOT write code or HTML.",
    "Slot ids are a fixed, closed set — never invent an id that is not in the list.",
    "Image slots take a URL value. text/button/link slots take a plain string.",
    "",
    "Return ONLY a JSON array (no prose, no markdown fences) of objects:",
    '[{ "slotId": "<existing id>", "newValue": "<new value>" }]',
    "If the request cannot be satisfied with the available slots, return [].",
    "",
    "EDITABLE SLOTS:",
    JSON.stringify(slots, null, 2),
  ].join("\n");
}

export interface TranslateResult {
  provider: "anthropic" | "openrouter" | "offline" | "none";
  changes: ProposedChange[];
}

export async function translate(contentMap: ContentMap, instruction: string): Promise<TranslateResult> {
  if (!instruction || typeof instruction !== "string") {
    return { provider: "none", changes: [] };
  }
  const system = buildSystemPrompt(contentMap);

  if (process.env.ANTHROPIC_API_KEY) {
    return { provider: "anthropic", changes: await callAnthropic(system, instruction) };
  }
  if (process.env.OPENROUTER_API_KEY) {
    return { provider: "openrouter", changes: await callOpenRouter(system, instruction) };
  }
  return { provider: "offline", changes: offlineHeuristic(contentMap, instruction) };
}

async function callAnthropic(system: string, instruction: string): Promise<ProposedChange[]> {
  const res = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY as string,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: process.env.ANTHROPIC_MODEL || "claude-sonnet-4-20250514",
      max_tokens: 1024,
      system,
      messages: [{ role: "user", content: instruction }],
    }),
    signal: AbortSignal.timeout(30000),
  });
  if (!res.ok) throw new Error(`Anthropic error ${res.status}: ${await res.text()}`);
  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = (data.content || []).filter((b) => b.type === "text").map((b) => b.text || "").join("\n");
  return parseChanges(text);
}

async function callOpenRouter(system: string, instruction: string): Promise<ProposedChange[]> {
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
  const text = data.choices?.[0]?.message?.content || "";
  return parseChanges(text);
}

export function parseChanges(text: string): ProposedChange[] {
  if (!text) return [];
  let s = String(text).trim();
  s = s.replace(/^```(?:json)?/i, "").replace(/```$/i, "").trim();
  const start = s.indexOf("[");
  const end = s.lastIndexOf("]");
  if (start !== -1 && end !== -1 && end > start) s = s.slice(start, end + 1);
  try {
    const parsed = JSON.parse(s) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter((c): c is ProposedChange => Boolean(c) && typeof (c as ProposedChange).slotId === "string" && "newValue" in (c as object))
      .map((c) => ({ slotId: c.slotId, newValue: c.newValue }));
  } catch {
    return [];
  }
}

export function offlineHeuristic(contentMap: ContentMap, instruction: string): ProposedChange[] {
  const text = instruction.trim();

  const byId = text.match(/(?:set|change)\s+([a-z]+_[0-9a-f]{10})\s+to\s+(.+)/i);
  if (byId && contentMap[byId[1]]) {
    return [{ slotId: byId[1], newValue: stripQuotes(byId[2]) }];
  }

  const byWord = text.match(
    /(?:set|change|make)\s+(?:the\s+)?(headline|title|heading|button|cta|link|paragraph|subtitle)\s+(?:to|say|read)\s+(.+)/i
  );
  if (byWord) {
    const word = byWord[1].toLowerCase();
    const value = stripQuotes(byWord[2]);
    const targetType =
      word === "button" || word === "cta" ? "button" : word === "link" ? "link" : "text";
    const entry = Object.entries(contentMap).find(([, s]) => s.type === targetType);
    if (entry) return [{ slotId: entry[0], newValue: value }];
  }

  return [];
}

function stripQuotes(s: string): string {
  return s.trim().replace(/^["'“”]+|["'“”.]+$/g, "").trim();
}
