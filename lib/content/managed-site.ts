import { createHash } from "node:crypto";

import type { CSSProperties } from "react";

import rawHomepageSnapshot from "@/content/managed/rapidstudios-homepage.json";
import { DEFAULT_THEME, validateTheme, type ThemeTokens } from "@/lib/cms/design/tokens";
import type { ContentMap } from "@/lib/cms/types";
import {
  MANAGED_HOMEPAGE_MANIFEST,
  MANAGED_HOMEPAGE_PUBLISH_TARGET,
  type ManagedHomepageSemanticKey
} from "@/lib/content/managed-site-manifest";

const SNAPSHOT_TOP_LEVEL_KEYS = [
  "schemaVersion",
  "publishTarget",
  "provenance",
  "contentHash",
  "theme",
  "slots"
] as const;
const PUBLISH_TARGET_KEYS = ["repository", "branch", "path", "siteId", "pageId", "route", "domain"] as const;
const PROVENANCE_KEYS = ["source", "snapshotId", "jobId", "publishedAt", "publishedBy"] as const;
const THEME_KEYS: ReadonlyArray<keyof ThemeTokens> = [
  "bg",
  "surface",
  "text",
  "muted",
  "accent",
  "accentText",
  "headingFont",
  "bodyFont",
  "radius",
  "shadow",
  "intensity"
];
const SAFE_COPY = /^[^<>\u0000-\u001f\u007f]+$/u;
const SAFE_ID = /^[a-zA-Z0-9][a-zA-Z0-9._:-]{0,127}$/;
const SHA256 = /^sha256:[a-f0-9]{64}$/;
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export type ManagedHomepageSlots = Readonly<Record<ManagedHomepageSemanticKey, string>>;

export interface ManagedHomepageSnapshot {
  schemaVersion: 1;
  publishTarget: typeof MANAGED_HOMEPAGE_PUBLISH_TARGET;
  provenance: {
    source: "bootstrap" | "local-codex-worker";
    snapshotId: string;
    jobId: string | null;
    publishedAt: string;
    publishedBy: string;
  };
  contentHash: `sha256:${string}`;
  theme: ThemeTokens;
  slots: ManagedHomepageSlots;
}

export type ManagedHomepageSnapshotExport = Omit<ManagedHomepageSnapshot, "contentHash">;

type ManagedThemeStyle = CSSProperties & Record<`--${string}`, string>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function assertRecord(value: unknown, label: string): asserts value is Record<string, unknown> {
  if (!isRecord(value)) throw new Error(`${label} must be an object.`);
}

function assertExactKeys(record: Record<string, unknown>, expected: readonly string[], label: string): void {
  const actual = Object.keys(record).sort();
  const wanted = [...expected].sort();
  if (actual.length !== wanted.length || actual.some((key, index) => key !== wanted[index])) {
    throw new Error(`${label} has an invalid key set. Expected exactly: ${wanted.join(", ")}.`);
  }
}

function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonicalJson).join(",")}]`;
  if (isRecord(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonicalJson(value[key])}`)
      .join(",")}}`;
  }
  const serialized = JSON.stringify(value);
  if (serialized === undefined) throw new Error("Managed snapshot contains a non-JSON value.");
  return serialized;
}

function snapshotHash(snapshot: ManagedHomepageSnapshotExport): `sha256:${string}` {
  return `sha256:${createHash("sha256").update(canonicalJson(snapshot)).digest("hex")}`;
}

function asSafeString(value: unknown, label: string, maxLength: number): string {
  if (typeof value !== "string") throw new Error(`${label} must be a string.`);
  if (value.length === 0 || value.length > maxLength) {
    throw new Error(`${label} must contain 1-${maxLength} characters.`);
  }
  if (value !== value.trim()) throw new Error(`${label} may not start or end with whitespace.`);
  if (!SAFE_COPY.test(value)) throw new Error(`${label} contains markup or control characters.`);
  return value;
}

function parseHex(color: string): [number, number, number] {
  if (!HEX_COLOR.test(color)) throw new Error(`Managed public theme color "${color}" must be six-digit hex.`);
  return [
    Number.parseInt(color.slice(1, 3), 16),
    Number.parseInt(color.slice(3, 5), 16),
    Number.parseInt(color.slice(5, 7), 16)
  ];
}

function relativeLuminance(color: string): number {
  const channels = parseHex(color).map((channel) => {
    const value = channel / 255;
    return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
  });
  return channels[0] * 0.2126 + channels[1] * 0.7152 + channels[2] * 0.0722;
}

function contrastRatio(first: string, second: string): number {
  const lighter = Math.max(relativeLuminance(first), relativeLuminance(second));
  const darker = Math.min(relativeLuminance(first), relativeLuminance(second));
  return (lighter + 0.05) / (darker + 0.05);
}

function assertContrast(first: string, second: string, minimum: number, label: string): void {
  const ratio = contrastRatio(first, second);
  if (ratio < minimum) {
    throw new Error(`${label} contrast is ${ratio.toFixed(2)}:1; it must be at least ${minimum}:1.`);
  }
}

function parseTheme(value: unknown): ThemeTokens {
  assertRecord(value, "Managed homepage theme");
  assertExactKeys(value, THEME_KEYS, "Managed homepage theme");
  const verdict = validateTheme(DEFAULT_THEME, value);
  if (!verdict.accepted || !verdict.theme) {
    throw new Error(`Managed homepage theme failed the Design Guardian: ${verdict.reason ?? "unknown error"}`);
  }
  const theme = verdict.theme;
  if (theme.intensity !== "tokens") {
    throw new Error('Managed homepage theme intensity must be "tokens"; public layout overlays are not allowed.');
  }
  for (const key of ["bg", "surface", "text", "muted", "accent", "accentText"] as const) {
    parseHex(theme[key]);
  }
  assertContrast(theme.text, theme.bg, 4.5, "Primary text on page background");
  assertContrast(theme.muted, theme.bg, 4.5, "Secondary text on page background");
  assertContrast(theme.text, theme.surface, 4.5, "Primary text on surface");
  assertContrast(theme.accent, theme.bg, 3, "Accent against page background");
  assertContrast(theme.accentText, theme.accent, 3, "Accent-surface text");
  return theme;
}

function parsePublishTarget(value: unknown): typeof MANAGED_HOMEPAGE_PUBLISH_TARGET {
  assertRecord(value, "Managed homepage publish target");
  assertExactKeys(value, PUBLISH_TARGET_KEYS, "Managed homepage publish target");
  for (const [key, expected] of Object.entries(MANAGED_HOMEPAGE_PUBLISH_TARGET)) {
    if (value[key] !== expected) {
      throw new Error(`Managed homepage publish target ${key} must be exactly "${expected}".`);
    }
  }
  return MANAGED_HOMEPAGE_PUBLISH_TARGET;
}

function parseProvenance(value: unknown): ManagedHomepageSnapshot["provenance"] {
  assertRecord(value, "Managed homepage provenance");
  assertExactKeys(value, PROVENANCE_KEYS, "Managed homepage provenance");
  if (value.source !== "bootstrap" && value.source !== "local-codex-worker") {
    throw new Error('Managed homepage provenance source must be "bootstrap" or "local-codex-worker".');
  }
  if (typeof value.snapshotId !== "string" || !SAFE_ID.test(value.snapshotId)) {
    throw new Error("Managed homepage provenance snapshotId is invalid.");
  }
  if (value.jobId !== null && (typeof value.jobId !== "string" || !SAFE_ID.test(value.jobId))) {
    throw new Error("Managed homepage provenance jobId is invalid.");
  }
  if (value.source === "bootstrap" && value.jobId !== null) {
    throw new Error("Managed homepage bootstrap provenance may not claim a worker job.");
  }
  if (value.source === "local-codex-worker" && value.jobId === null) {
    throw new Error("Managed homepage worker provenance requires a jobId.");
  }
  if (typeof value.publishedAt !== "string") throw new Error("Managed homepage provenance publishedAt is invalid.");
  const parsedDate = new Date(value.publishedAt);
  if (Number.isNaN(parsedDate.valueOf()) || parsedDate.toISOString() !== value.publishedAt) {
    throw new Error("Managed homepage provenance publishedAt must be a canonical ISO timestamp.");
  }
  if (typeof value.publishedBy !== "string" || !SAFE_ID.test(value.publishedBy)) {
    throw new Error("Managed homepage provenance publishedBy is invalid.");
  }
  return {
    source: value.source,
    snapshotId: value.snapshotId,
    jobId: value.jobId,
    publishedAt: value.publishedAt,
    publishedBy: value.publishedBy
  };
}

function parseSlots(value: unknown): ManagedHomepageSlots {
  assertRecord(value, "Managed homepage slots");
  const expectedKeys = MANAGED_HOMEPAGE_MANIFEST.map(({ key }) => key);
  assertExactKeys(value, expectedKeys, "Managed homepage slots");

  const slots: Partial<Record<ManagedHomepageSemanticKey, string>> = {};
  for (const definition of MANAGED_HOMEPAGE_MANIFEST) {
    slots[definition.key] = asSafeString(value[definition.key], `Managed slot ${definition.key}`, definition.maxLength);
  }
  return Object.freeze(slots as Record<ManagedHomepageSemanticKey, string>);
}

/** Validate an untrusted checked-in snapshot. Any schema drift fails the build. */
export function validateManagedSnapshot(value: unknown): ManagedHomepageSnapshot {
  assertRecord(value, "Managed homepage snapshot");
  assertExactKeys(value, SNAPSHOT_TOP_LEVEL_KEYS, "Managed homepage snapshot");
  if (value.schemaVersion !== 1) throw new Error("Managed homepage schemaVersion must be 1.");
  if (typeof value.contentHash !== "string" || !SHA256.test(value.contentHash)) {
    throw new Error("Managed homepage contentHash must be a sha256 digest.");
  }

  const withoutHash: ManagedHomepageSnapshotExport = {
    schemaVersion: 1,
    publishTarget: parsePublishTarget(value.publishTarget),
    provenance: parseProvenance(value.provenance),
    theme: parseTheme(value.theme),
    slots: parseSlots(value.slots)
  };
  if (
    withoutHash.provenance.source === "bootstrap" &&
    !MANAGED_HOMEPAGE_MANIFEST.every(({ key, defaultValue }) => withoutHash.slots[key] === defaultValue)
  ) {
    throw new Error("Managed homepage bootstrap snapshot must match every checked-in manifest default.");
  }
  const expectedHash = snapshotHash(withoutHash);
  if (value.contentHash !== expectedHash) {
    throw new Error(`Managed homepage contentHash mismatch. Expected ${expectedHash}.`);
  }

  return Object.freeze({ ...withoutHash, contentHash: expectedHash });
}

/** Build a canonical, validated snapshot for the local publisher. */
export function exportManagedSnapshot(input: ManagedHomepageSnapshotExport): ManagedHomepageSnapshot {
  const candidate = { ...input, contentHash: snapshotHash(input) };
  return validateManagedSnapshot(candidate);
}

/** Stable file bytes for `content/managed/rapidstudios-homepage.json`. */
export function exportManagedSnapshotJson(input: ManagedHomepageSnapshotExport): string {
  return `${JSON.stringify(exportManagedSnapshot(input), null, 2)}\n`;
}

export interface ManagedHomepageProjectionInput {
  contentMap: ContentMap;
  provenance: ManagedHomepageSnapshot["provenance"];
  theme: ThemeTokens;
}

/** Build the CMS page map with the manifest's opaque slot IDs and constraints. */
export function createManagedHomepageContentMap(slots: ManagedHomepageSlots): ContentMap {
  const validatedSlots = parseSlots(slots);
  return Object.fromEntries(
    MANAGED_HOMEPAGE_MANIFEST.map((definition) => [
      definition.slotId,
      {
        type: definition.type,
        value: validatedSlots[definition.key],
        constraints: {
          required: true,
          maxLength: definition.maxLength,
          allowHtml: false
        }
      }
    ])
  );
}

/**
 * Project an approved CMS ContentMap into the one allowlisted Git snapshot.
 * Unknown, missing, mistyped, or weakened slots are rejected atomically.
 */
export function projectCmsContentMapToManagedSnapshotExport({
  contentMap,
  provenance,
  theme
}: ManagedHomepageProjectionInput): ManagedHomepageSnapshotExport {
  assertRecord(contentMap, "Managed homepage CMS content map");
  assertExactKeys(
    contentMap,
    MANAGED_HOMEPAGE_MANIFEST.map(({ slotId }) => slotId),
    "Managed homepage CMS content map"
  );

  const semanticSlots: Partial<Record<ManagedHomepageSemanticKey, string>> = {};
  for (const definition of MANAGED_HOMEPAGE_MANIFEST) {
    const candidate = contentMap[definition.slotId];
    assertRecord(candidate, `Managed CMS slot ${definition.slotId}`);
    if (candidate.type !== definition.type) {
      throw new Error(`Managed CMS slot ${definition.slotId} must have type "${definition.type}".`);
    }
    assertRecord(candidate.constraints, `Managed CMS slot ${definition.slotId} constraints`);
    if (
      candidate.constraints.required !== true ||
      candidate.constraints.maxLength !== definition.maxLength ||
      candidate.constraints.allowHtml === true
    ) {
      throw new Error(`Managed CMS slot ${definition.slotId} constraints do not match the checked-in manifest.`);
    }
    semanticSlots[definition.key] = asSafeString(
      candidate.value,
      `Managed CMS slot ${definition.slotId}`,
      definition.maxLength
    );
  }

  return {
    schemaVersion: 1,
    publishTarget: MANAGED_HOMEPAGE_PUBLISH_TARGET,
    provenance: parseProvenance(provenance),
    theme: parseTheme(theme),
    slots: parseSlots(semanticSlots)
  };
}

/** True only for the validated, pre-worker bootstrap revision. */
export function isManagedHomepagePlaceholder(value: unknown): boolean {
  const snapshot = validateManagedSnapshot(value);
  return (
    snapshot.provenance.source === "bootstrap" &&
    snapshot.provenance.jobId === null &&
    MANAGED_HOMEPAGE_MANIFEST.every(({ key, defaultValue }) => snapshot.slots[key] === defaultValue)
  );
}

const managedHomepageSnapshot = validateManagedSnapshot(rawHomepageSnapshot);

export function getManagedHomepageSnapshot(): ManagedHomepageSnapshot {
  return managedHomepageSnapshot;
}

export function getManagedHomepageCopy(): ManagedHomepageSlots {
  return managedHomepageSnapshot.slots;
}

function darkenHex(color: string, factor: number): string {
  return `#${parseHex(color)
    .map((channel) => Math.round(channel * factor).toString(16).padStart(2, "0"))
    .join("")}`;
}

/** React style variables only; no raw CSS or unvalidated values are emitted. */
export function getManagedThemeStyle(theme: ThemeTokens): ManagedThemeStyle {
  const guardedTheme = parseTheme(theme);
  const [accentRed, accentGreen, accentBlue] = parseHex(guardedTheme.accent);
  const [surfaceRed, surfaceGreen, surfaceBlue] = parseHex(guardedTheme.surface);
  const shadow = {
    none: "none",
    sm: "0 1px 2px rgba(0, 0, 0, 0.08)",
    md: "0 4px 12px rgba(0, 0, 0, 0.12)",
    lg: "0 12px 32px rgba(0, 0, 0, 0.18)"
  }[guardedTheme.shadow];

  return {
    "--color-canvas": guardedTheme.bg,
    "--color-canvas-end": darkenHex(guardedTheme.bg, 0.68),
    "--color-surface": guardedTheme.surface,
    "--color-surface-soft": `rgba(${surfaceRed}, ${surfaceGreen}, ${surfaceBlue}, 0.9)`,
    "--color-text-primary": guardedTheme.text,
    "--color-text-secondary": guardedTheme.muted,
    "--color-text-inverse": guardedTheme.accentText,
    "--color-brand-primary": guardedTheme.accent,
    "--color-brand-primary-rgb": `${accentRed} ${accentGreen} ${accentBlue}`,
    "--color-focus-ring": `rgba(${accentRed}, ${accentGreen}, ${accentBlue}, 0.28)`,
    "--radius-lg": guardedTheme.radius,
    "--cms-bg": guardedTheme.bg,
    "--cms-surface": guardedTheme.surface,
    "--cms-text": guardedTheme.text,
    "--cms-muted": guardedTheme.muted,
    "--cms-accent": guardedTheme.accent,
    "--cms-accent-text": guardedTheme.accentText,
    "--cms-heading-font": guardedTheme.headingFont,
    "--cms-body-font": guardedTheme.bodyFont,
    "--cms-radius": guardedTheme.radius,
    "--cms-shadow": shadow
  };
}

/** Scope managed variables to the public homepage so Studio keeps its stable UI theme. */
export function getManagedHomepageThemeCss(theme: ThemeTokens): string {
  const declarations = Object.entries(getManagedThemeStyle(theme))
    .map(([property, value]) => `${property}:${value}`)
    .join(";");
  return `:root:has([data-managed-homepage=rapidstudios]){${declarations}}`;
}
