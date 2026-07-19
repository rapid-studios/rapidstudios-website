// lib/cms/guardian.ts
// THE GUARDIAN — deterministic validator (NO AI). Checks every proposed change
// before it touches the content map. Ported verbatim from the verified core.
//
// Four checks, in order:
//   1. Slot exists        -> rejects the button_text-vs-cta-txt hallucination
//   2. Type match         -> text/button/link are strings; image/link valid URL
//   3. Structural integrity -> required slots may not be emptied
//   4. Constraints        -> max length and allowed URL schemes

import type { ContentMap, ProposedChange, ChangeResult, BatchVerdict } from "./types";

const HTML_ESCAPES: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;",
};

export function escapeHtml(str: string): string {
  return String(str).replace(/[&<>"']/g, (c) => HTML_ESCAPES[c]);
}

export type CmsUrlKind = "image" | "link";

export const IMAGE_URL_SCHEMES = ["http:", "https:", "data:"] as const;
export const LINK_URL_SCHEMES = ["http:", "https:", "mailto:", "tel:"] as const;

const URL_SCHEME = /^([a-z][a-z0-9+.-]*):/i;
const URL_CONTROL_CHAR = /[\u0000-\u001f\u007f]/;
const SAFE_IMAGE_DATA_URL =
  /^data:image\/(?:avif|bmp|gif|jpeg|jpg|png|webp|x-icon|vnd\.microsoft\.icon);base64,[a-z0-9+/=\s]+$/i;

/**
 * Return the canonical value when a CMS URL is safe to place in its intended
 * HTML attribute. Relative URLs are allowed; executable schemes are not.
 * Image data URLs are limited to non-SVG raster formats.
 */
export function sanitizeUrl(
  value: unknown,
  schemes: readonly string[] = LINK_URL_SCHEMES,
  kind: CmsUrlKind = "link"
): string | null {
  if (typeof value !== "string") return null;

  const candidate = value.trim();
  if (!candidate || URL_CONTROL_CHAR.test(candidate) || candidate.includes("\\")) return null;

  const schemeMatch = candidate.match(URL_SCHEME);
  if (!schemeMatch) {
    // A relative path, query, fragment, or protocol-relative HTTP(S) URL.
    return candidate;
  }

  const protocol = `${schemeMatch[1].toLowerCase()}:`;
  const allowed = new Set(schemes.map((scheme) => scheme.toLowerCase()));
  if (!allowed.has(protocol)) return null;

  if (protocol === "data:") {
    return kind === "image" && SAFE_IMAGE_DATA_URL.test(candidate) ? candidate : null;
  }

  try {
    const parsed = new URL(candidate);
    if ((protocol === "http:" || protocol === "https:") && !parsed.hostname) return null;
    return candidate;
  } catch {
    return null;
  }
}

export function isValidUrl(value: unknown, schemes?: readonly string[], kind: CmsUrlKind = "link"): boolean {
  return sanitizeUrl(value, schemes ?? LINK_URL_SCHEMES, kind) !== null;
}

function reject(slotId: string | null, reason: string): ChangeResult {
  return { accepted: false, slotId: slotId ?? null, reason };
}

/** Validate a single proposed change against the page's content map. */
export function validateChange(contentMap: ContentMap, change: ProposedChange): ChangeResult {
  const slotId = change?.slotId;
  const newValue = change?.newValue;

  // 1) Slot exists — closed set.
  if (!slotId || !Object.prototype.hasOwnProperty.call(contentMap, slotId)) {
    return reject(slotId ?? null, `Unknown slot id "${slotId}". Slots are a closed set; nothing was changed.`);
  }

  const slot = contentMap[slotId];
  const c = slot.constraints || {};

  // 2) Type match
  switch (slot.type) {
    case "text":
    case "button": {
      if (typeof newValue !== "string") {
        return reject(slotId, `Slot "${slotId}" is ${slot.type}; expected a string value.`);
      }
      break;
    }
    case "link": {
      if (typeof newValue !== "string") {
        return reject(slotId, `Slot "${slotId}" is a link; expected a string label.`);
      }
      break;
    }
    case "image": {
      if (typeof newValue !== "string" || !isValidUrl(newValue, c.schemes, "image")) {
        return reject(slotId, `Slot "${slotId}" is an image; value must be a valid URL (${(c.schemes || []).join(", ")}).`);
      }
      break;
    }
    default:
      return reject(slotId, `Slot "${slotId}" has unknown type.`);
  }

  // 3) Structural integrity — required slots may not be emptied.
  const isEmpty =
    newValue === null ||
    newValue === undefined ||
    (typeof newValue === "string" && newValue.trim() === "");
  if (c.required && isEmpty) {
    return reject(slotId, `Slot "${slotId}" is required and cannot be emptied (would remove a structural section).`);
  }

  // 4) Constraints
  if (typeof newValue === "string") {
    if (typeof c.maxLength === "number" && newValue.length > c.maxLength) {
      return reject(slotId, `Slot "${slotId}" exceeds maxLength ${c.maxLength} (got ${newValue.length}).`);
    }
  }

  // Values remain plain data. render() performs context-aware DOM assignment,
  // so storing pre-escaped entities would both double-encode and blur the trust
  // boundary between validation and HTML serialization.
  const value = slot.type === "image"
    ? sanitizeUrl(newValue, c.schemes, "image") as string
    : newValue as string;

  return { accepted: true, slotId, value };
}

/** Validate a batch atomically — ALL must pass or none apply. Pure (no mutation). */
export function validateBatch(contentMap: ContentMap, changes: ProposedChange[]): BatchVerdict {
  if (!Array.isArray(changes) || changes.length === 0) {
    return { accepted: false, reason: "No changes proposed.", results: [] };
  }
  const results = changes.map((ch) => validateChange(contentMap, ch));
  const rejected = results.filter((r) => !r.accepted);
  if (rejected.length > 0) {
    return { accepted: false, reason: rejected.map((r) => (r as { reason: string }).reason).join(" | "), results };
  }
  const next: ContentMap = structuredClone(contentMap);
  for (const r of results) {
    if (r.accepted) next[r.slotId] = { ...next[r.slotId], value: r.value };
  }
  return { accepted: true, contentMap: next, results };
}
