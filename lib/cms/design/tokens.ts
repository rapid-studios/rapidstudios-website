// lib/cms/design/tokens.ts
// The design lane. A ThemeTokens object is the CMS equivalent of OpenDesign's
// DESIGN.md brand contract: a small, validated set of design tokens that can
// restyle an entire site while structure and content stay frozen.
//
// THE DESIGN GUARDIAN lives here: deterministic validation (no AI) of every
// token value before it can land. Values are emitted into a <style> tag, so
// validation is also the CSS-injection boundary: every value must match a
// strict per-token pattern. Nothing unvalidated ever reaches the stylesheet.

export interface ThemeTokens {
  /** Page background */
  bg: string;
  /** Card / section surface */
  surface: string;
  /** Primary text */
  text: string;
  /** Secondary text */
  muted: string;
  /** Accent (links, buttons) */
  accent: string;
  /** Text on accent surfaces */
  accentText: string;
  /** Heading font stack */
  headingFont: string;
  /** Body font stack */
  bodyFont: string;
  /** Corner radius, e.g. "8px" */
  radius: string;
  /** Shadow preset */
  shadow: "none" | "sm" | "md" | "lg";
  /**
   * How hard the theme is applied to an ingested page:
   * "overlay" forces tokens onto common elements (works on any site),
   * "tokens" only defines CSS variables (for templates authored against them).
   */
  intensity: "overlay" | "tokens";
}

export type ThemePatch = Partial<ThemeTokens>;

export interface ThemeVerdict {
  accepted: boolean;
  reason?: string;
  theme?: ThemeTokens;
}

// ---------------------------------------------------------------------------
// Validation (the Design Guardian)
// ---------------------------------------------------------------------------

const COLOR_RE =
  /^(#[0-9a-fA-F]{3}|#[0-9a-fA-F]{4}|#[0-9a-fA-F]{6}|#[0-9a-fA-F]{8}|rgb\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*\)|rgba\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*(0|1|0?\.\d+)\s*\)|hsl\(\s*\d{1,3}\s*,\s*\d{1,3}%\s*,\s*\d{1,3}%\s*\)|transparent)$/;

// Font stacks: letters, digits, spaces, commas, hyphens, single/double quotes.
// No braces, semicolons, parens, slashes or angle brackets => cannot escape CSS.
const FONT_RE = /^[a-zA-Z0-9 ,'"-]{2,120}$/;

const LENGTH_RE = /^\d{1,3}(\.\d{1,2})?(px|rem|em|%)$/;

const SHADOWS = new Set(["none", "sm", "md", "lg"]);
const INTENSITIES = new Set(["overlay", "tokens"]);

const VALIDATORS: Record<keyof ThemeTokens, (v: unknown) => string | null> = {
  bg: color, surface: color, text: color, muted: color, accent: color, accentText: color,
  headingFont: font, bodyFont: font,
  radius: length,
  shadow: (v) => (typeof v === "string" && SHADOWS.has(v) ? null : "shadow must be one of none|sm|md|lg"),
  intensity: (v) => (typeof v === "string" && INTENSITIES.has(v) ? null : "intensity must be overlay|tokens"),
};

function color(v: unknown): string | null {
  return typeof v === "string" && COLOR_RE.test(v.trim()) ? null : "must be a hex/rgb/rgba/hsl color";
}
function font(v: unknown): string | null {
  return typeof v === "string" && FONT_RE.test(v.trim()) ? null : "font stack contains disallowed characters";
}
function length(v: unknown): string | null {
  return typeof v === "string" && LENGTH_RE.test(v.trim()) ? null : "must be a css length like 8px / 0.5rem";
}

/**
 * Validate a patch against a base theme. Atomic: any invalid token rejects the
 * whole patch. Unknown keys reject (closed set, same philosophy as slot ids).
 */
export function validateTheme(base: ThemeTokens, patch: ThemePatch): ThemeVerdict {
  const keys = Object.keys(patch) as (keyof ThemeTokens)[];
  if (keys.length === 0) return { accepted: false, reason: "Empty theme patch." };
  for (const key of keys) {
    if (!(key in VALIDATORS)) {
      return { accepted: false, reason: `Unknown theme token "${String(key)}". Tokens are a closed set.` };
    }
    const err = VALIDATORS[key](patch[key]);
    if (err) return { accepted: false, reason: `Token "${key}": ${err}` };
  }
  const theme: ThemeTokens = { ...base };
  for (const key of keys) {
    (theme as unknown as Record<string, unknown>)[key] = String(patch[key]).trim();
  }
  return { accepted: true, theme };
}

// ---------------------------------------------------------------------------
// CSS emission
// ---------------------------------------------------------------------------

const SHADOW_CSS: Record<ThemeTokens["shadow"], string> = {
  none: "none",
  sm: "0 1px 2px rgba(0,0,0,.08)",
  md: "0 4px 12px rgba(0,0,0,.12)",
  lg: "0 12px 32px rgba(0,0,0,.18)",
};

/**
 * Emit the theme stylesheet. Every value has already passed the Design
 * Guardian, so plain interpolation is safe. In "overlay" mode we force tokens
 * onto common elements so any ingested page restyles; in "tokens" mode we only
 * define the variables for templates authored against them.
 */
export function themeToCss(theme: ThemeTokens): string {
  const vars = `:root{--cms-bg:${theme.bg};--cms-surface:${theme.surface};--cms-text:${theme.text};--cms-muted:${theme.muted};--cms-accent:${theme.accent};--cms-accent-text:${theme.accentText};--cms-heading-font:${theme.headingFont};--cms-body-font:${theme.bodyFont};--cms-radius:${theme.radius};--cms-shadow:${SHADOW_CSS[theme.shadow]};}`;
  if (theme.intensity === "tokens") return vars;
  return (
    vars +
    `body{background:var(--cms-bg) !important;color:var(--cms-text) !important;font-family:var(--cms-body-font) !important;}` +
    `h1,h2,h3,h4,h5,h6{font-family:var(--cms-heading-font) !important;color:var(--cms-text) !important;}` +
    `p,li,td,th,label,figcaption,blockquote{color:var(--cms-text) !important;}` +
    `small,caption{color:var(--cms-muted) !important;}` +
    `a{color:var(--cms-accent) !important;}` +
    `button,input[type=submit],input[type=button],[role=button]{background:var(--cms-accent) !important;color:var(--cms-accent-text) !important;border-color:var(--cms-accent) !important;border-radius:var(--cms-radius) !important;box-shadow:var(--cms-shadow) !important;}` +
    `img,video,iframe{border-radius:var(--cms-radius);}` +
    `section,article,header,footer,aside,main{background-color:transparent;}`
  );
}

/** Inject (or replace) the theme stylesheet in rendered HTML. */
export function injectTheme(html: string, theme: ThemeTokens | null | undefined): string {
  if (!theme) return html;
  const tag = `<style id="__cms-theme">${themeToCss(theme)}</style>`;
  // Replace an existing block first (idempotent re-render).
  if (html.includes('id="__cms-theme"')) {
    return html.replace(/<style id="__cms-theme">[\s\S]*?<\/style>/, tag);
  }
  if (html.includes("</head>")) return html.replace("</head>", tag + "</head>");
  if (html.includes("<body")) return html.replace(/<body([^>]*)>/, `<body$1>${tag}`);
  return tag + html;
}

export const DEFAULT_THEME: ThemeTokens = {
  bg: "#ffffff",
  surface: "#f6f7f9",
  text: "#111827",
  muted: "#6b7280",
  accent: "#4f46e5",
  accentText: "#ffffff",
  headingFont: "ui-sans-serif, system-ui, 'Segoe UI', Arial, sans-serif",
  bodyFont: "ui-sans-serif, system-ui, 'Segoe UI', Arial, sans-serif",
  radius: "8px",
  shadow: "sm",
  intensity: "overlay",
};
