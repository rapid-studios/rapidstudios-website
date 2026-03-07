# Design System

- Theme: Light mode default, premium product-studio system with restrained blue emphasis
- Date: 2026-03-06
- Inputs: `design/specs/2026-03-06-rapid-studios-v3-ux-structure-spec.md`, `design/boards/2026-03-06-rapid-studios-v3-decision-board.md`

## Visual Direction

- Summary:
  - Rapid Studios should feel selective, credible, and premium rather than loud, trendy, or overly productized.
  - The system should use oversized editorial type, bright neutral surfaces, soft borders, deep whitespace, and one clear action color.
  - Visual energy should come from composition, rhythm, and motion restraint rather than saturated gradients or dense UI treatment.

## Look-Lock Summary

- Homepage read:
  - giant editorial headline
  - short support copy
  - pill-shell header
  - compact trust strip
  - quiet cards
  - curated proof
  - calm closing CTA

- Surface behavior:
  - white and near-white layers
  - subtle tints
  - soft border definition
  - low-noise shadows

- Brand feel:
  - more studio than SaaS template
  - more polished than flashy
  - more confident than descriptive

## Token Direction Options

### Typography Options

- Option A:
  - `Space Grotesk` for display and headings
  - `Manrope` for body and UI copy
  - tone: sharp, modern, studio-grade
- Option B:
  - neutral sans everywhere
  - tone: safer, more generic, more product UI
- Option C:
  - editorial serif hybrid
  - tone: more fashion/editorial, less aligned to the approved homepage shell
- Recommended:
  - Option A

### Color Options

- Option A:
  - bright neutral canvas
  - navy text
  - restrained blue as the only strong action color
  - soft mint as a secondary accent
- Option B:
  - purple-led SaaS palette
- Option C:
  - higher-contrast editorial palette
- Recommended:
  - Option A

### Spacing Options

- Option A:
  - airy editorial spacing
  - large section gaps
  - generous card padding
- Option B:
  - balanced modern SaaS spacing
- Option C:
  - tighter product UI spacing
- Recommended:
  - Option A

### Radius Options

- Option A:
  - soft 2xl shells
  - xl cards
  - pill CTAs and header
- Option B:
  - more squared editorial edges
- Option C:
  - uniformly rounded everything
- Recommended:
  - Option A

### Shadow Options

- Option A:
  - soft layered ambient shadows
  - visible only when needed for depth
- Option B:
  - almost flat, border-first system
- Option C:
  - stronger floating shadows
- Recommended:
  - Option A

### Motion Options

- Option A:
  - subtle reveal
  - hover lift
  - header condense
- Option B:
  - springier product interactions
- Option C:
  - almost static UI
- Recommended:
  - Option A

### Density Options

- Option A:
  - selective content density
  - shorter copy blocks
  - fewer stronger elements
- Option B:
  - balanced content density
- Option C:
  - denser product-style information layout
- Recommended:
  - Option A

## Typography Tokens

- `font-display`
  - Family: `Space Grotesk`, sans-serif
  - Size: token only
  - Weight: token only
  - Line height: token only

- `font-body`
  - Family: `Manrope`, sans-serif
  - Size: token only
  - Weight: token only
  - Line height: token only

- `display-xl`
  - Family: `Space Grotesk`, sans-serif
  - Size: `80px`
  - Weight: `700`
  - Line height: `0.92`

- `display-lg`
  - Family: `Space Grotesk`, sans-serif
  - Size: `64px`
  - Weight: `700`
  - Line height: `0.95`

- `h1`
  - Family: `Space Grotesk`, sans-serif
  - Size: `56px`
  - Weight: `700`
  - Line height: `0.98`

- `h2`
  - Family: `Space Grotesk`, sans-serif
  - Size: `40px`
  - Weight: `700`
  - Line height: `1.04`

- `h3`
  - Family: `Space Grotesk`, sans-serif
  - Size: `28px`
  - Weight: `600`
  - Line height: `1.12`

- `body-lg`
  - Family: `Manrope`, sans-serif
  - Size: `18px`
  - Weight: `500`
  - Line height: `1.65`

- `body`
  - Family: `Manrope`, sans-serif
  - Size: `16px`
  - Weight: `500`
  - Line height: `1.65`

- `caption`
  - Family: `Manrope`, sans-serif
  - Size: `14px`
  - Weight: `600`
  - Line height: `1.5`

- `eyebrow`
  - Family: `Manrope`, sans-serif
  - Size: `12px`
  - Weight: `700`
  - Line height: `1.3`

## Color Tokens

- `canvas`
  - Value: `#F4F7FB`
  - Usage: base page background

- `canvas-elevated`
  - Value: `#FAFCFF`
  - Usage: brighter background bands and high-clarity sections

- `canvas-tint`
  - Value: `#EEF4FF`
  - Usage: hero wash, blueprint-like pale accents, subtle supporting surfaces

- `surface`
  - Value: `#FFFFFF`
  - Usage: default cards, panels, forms, and proof modules

- `surface-soft`
  - Value: `rgba(255, 255, 255, 0.84)`
  - Usage: blurred sticky header, elevated shells, translucent panels

- `surface-muted`
  - Value: `#F8FAFD`
  - Usage: secondary cards, pricing highlights, support rails

- `surface-accent`
  - Value: `rgba(52, 109, 255, 0.08)`
  - Usage: selected surfaces, highlight chips, subtle emphasis

- `surface-accent-strong`
  - Value: `rgba(52, 109, 255, 0.14)`
  - Usage: stronger selected states and hero support accents

- `text-primary`
  - Value: `#0F172A`
  - Usage: headlines, core body emphasis, UI labels

- `text-secondary`
  - Value: `#5B677D`
  - Usage: support copy, body text, captions, secondary navigation

- `text-tertiary`
  - Value: `#7A879B`
  - Usage: lower-priority helper text and placeholder UI text

- `text-inverse`
  - Value: `#F8FBFF`
  - Usage: primary CTA labels and dark contrast moments

- `line-subtle`
  - Value: `rgba(15, 23, 42, 0.08)`
  - Usage: card borders, dividers, quiet shells

- `line-strong`
  - Value: `rgba(15, 23, 42, 0.14)`
  - Usage: active borders, hover refinement, stronger separation

- `brand-primary`
  - Value: `#346DFF`
  - Usage: primary CTA, active states, primary accents

- `brand-primary-hover`
  - Value: `#2356DE`
  - Usage: CTA hover and active

- `brand-accent`
  - Value: `#0FB7A7`
  - Usage: supporting accent, proof markers, positive emphasis

- `focus-ring`
  - Value: `rgba(52, 109, 255, 0.32)`
  - Usage: accessible focus halo

- `success`
  - Value: `#0E9F6E`
  - Usage: success states and confirmations

- `warning`
  - Value: `#D97706`
  - Usage: caution or expectation-setting notes

- `error`
  - Value: `#DC2626`
  - Usage: inline errors and failure states

- `overlay-scrim`
  - Value: `rgba(15, 23, 42, 0.32)`
  - Usage: modal and mobile-nav backdrops

## Spacing Tokens

- `space-1`
  - Value: `4px`

- `space-2`
  - Value: `8px`

- `space-3`
  - Value: `12px`

- `space-4`
  - Value: `16px`

- `space-5`
  - Value: `24px`

- `space-6`
  - Value: `32px`

- `space-7`
  - Value: `48px`

- `space-8`
  - Value: `64px`

- `space-9`
  - Value: `96px`

- `space-10`
  - Value: `128px`

- `space-11`
  - Value: `160px`

## Radius And Shadow Tokens

- `radius-sm`
  - Value: `14px`

- `radius-md`
  - Value: `18px`

- `radius-lg`
  - Value: `24px`

- `radius-xl`
  - Value: `32px`

- `radius-pill`
  - Value: `999px`

- `shadow-soft`
  - Value: `0 10px 30px rgba(15, 23, 42, 0.06)`

- `shadow-elevated`
  - Value: `0 18px 46px rgba(15, 23, 42, 0.08)`

- `shadow-float`
  - Value: `0 28px 72px rgba(15, 23, 42, 0.12)`

- `shadow-focus`
  - Value: `0 0 0 4px rgba(52, 109, 255, 0.16)`

## Motion Tokens

- `motion-fast`
  - Value: `120ms`

- `motion-normal`
  - Value: `180ms`

- `motion-slow`
  - Value: `260ms`

- `motion-deliberate`
  - Value: `380ms`

- `ease-standard`
  - Value: `cubic-bezier(0.2, 0, 0, 1)`

- `ease-out`
  - Value: `cubic-bezier(0, 0, 0.2, 1)`

- `ease-in-out`
  - Value: `cubic-bezier(0.4, 0, 0.2, 1)`

- `ease-emphasis`
  - Value: `cubic-bezier(0.16, 1, 0.3, 1)`

## Density Tokens

- `density-home`
  - Value: `selective`

- `density-card-copy`
  - Value: `2-3 short lines max before truncation or deeper page handoff`

- `density-section-intro`
  - Value: `headline + 1 short support paragraph`

- `density-proof`
  - Value: `distributed`

## Reduced Motion Rules

- Rule:
  - Remove translate and scale effects where they are not needed for comprehension.

- Rule:
  - Replace reveal patterns with opacity-only transitions where possible.

- Rule:
  - Replace shimmer or looping motion with static placeholder treatment.

- Rule:
  - Keep only fast or normal-duration state changes when reduced motion is enabled.

## Base Component Rules

- `SiteHeader`
  - Rule:
    - Use `surface-soft`, `line-subtle`, `radius-pill`, and blur.
    - The condensed state should feel tighter, not dramatically different.

- `Hero`
  - Rule:
    - Lead with `display-xl` or `display-lg`.
    - Support copy should use `body-lg`.
    - The proof rail should use short outcome signals rather than fake client logos.

- `Button`
  - Rule:
    - Primary buttons use `brand-primary`, `text-inverse`, `radius-pill`, and `shadow-elevated`.
    - Hover deepens the fill and shadow, not scale.

- `Secondary Button`
  - Rule:
    - Use `surface`, `text-primary`, `line-strong`, and the same pill shape as primary buttons.

- `Card`
  - Rule:
    - Cards use `surface` or `surface-soft`, `line-subtle`, and `radius-lg` or `radius-xl`.
    - Keep copy short and spacing generous.

- `TrustStrip`
  - Rule:
    - Keep it compact and low-contrast relative to the hero.
    - It should reassure, not dominate.

- `ProjectCard`
  - Rule:
    - Use one media well, one strong title, and one short outcome line.
    - Avoid metadata stacks on the homepage.

- `Input`
  - Rule:
    - Inputs use `surface`, `line-subtle`, `radius-md`, strong focus ring, and calm placeholder styling.

- `PricingCard`
  - Rule:
    - Premium through spacing and clarity, not by stacking feature-table density or loud badges.

## Developer Token Export

```json
{
  "fonts": {
    "display": "\"Space Grotesk\", sans-serif",
    "body": "\"Manrope\", sans-serif"
  },
  "typography": {
    "displayXl": { "size": 80, "weight": 700, "lineHeight": 0.92 },
    "displayLg": { "size": 64, "weight": 700, "lineHeight": 0.95 },
    "h1": { "size": 56, "weight": 700, "lineHeight": 0.98 },
    "h2": { "size": 40, "weight": 700, "lineHeight": 1.04 },
    "h3": { "size": 28, "weight": 600, "lineHeight": 1.12 },
    "bodyLg": { "size": 18, "weight": 500, "lineHeight": 1.65 },
    "body": { "size": 16, "weight": 500, "lineHeight": 1.65 },
    "caption": { "size": 14, "weight": 600, "lineHeight": 1.5 },
    "eyebrow": { "size": 12, "weight": 700, "lineHeight": 1.3 }
  },
  "colors": {
    "canvas": "#F4F7FB",
    "canvasElevated": "#FAFCFF",
    "canvasTint": "#EEF4FF",
    "surface": "#FFFFFF",
    "surfaceSoft": "rgba(255,255,255,0.84)",
    "surfaceMuted": "#F8FAFD",
    "surfaceAccent": "rgba(52,109,255,0.08)",
    "surfaceAccentStrong": "rgba(52,109,255,0.14)",
    "textPrimary": "#0F172A",
    "textSecondary": "#5B677D",
    "textTertiary": "#7A879B",
    "textInverse": "#F8FBFF",
    "lineSubtle": "rgba(15,23,42,0.08)",
    "lineStrong": "rgba(15,23,42,0.14)",
    "brandPrimary": "#346DFF",
    "brandPrimaryHover": "#2356DE",
    "brandAccent": "#0FB7A7",
    "focusRing": "rgba(52,109,255,0.32)",
    "success": "#0E9F6E",
    "warning": "#D97706",
    "error": "#DC2626",
    "overlayScrim": "rgba(15,23,42,0.32)"
  },
  "space": {
    "1": 4,
    "2": 8,
    "3": 12,
    "4": 16,
    "5": 24,
    "6": 32,
    "7": 48,
    "8": 64,
    "9": 96,
    "10": 128,
    "11": 160
  },
  "radius": {
    "sm": 14,
    "md": 18,
    "lg": 24,
    "xl": 32,
    "pill": 999
  },
  "shadow": {
    "soft": "0 10px 30px rgba(15,23,42,0.06)",
    "elevated": "0 18px 46px rgba(15,23,42,0.08)",
    "float": "0 28px 72px rgba(15,23,42,0.12)",
    "focus": "0 0 0 4px rgba(52,109,255,0.16)"
  },
  "motion": {
    "fast": "120ms",
    "normal": "180ms",
    "slow": "260ms",
    "deliberate": "380ms",
    "easeStandard": "cubic-bezier(0.2,0,0,1)",
    "easeOut": "cubic-bezier(0,0,0.2,1)",
    "easeInOut": "cubic-bezier(0.4,0,0.2,1)",
    "easeEmphasis": "cubic-bezier(0.16,1,0.3,1)"
  },
  "density": {
    "home": "selective",
    "cardCopy": "2-3 short lines max",
    "sectionIntro": "headline + 1 short support paragraph",
    "proof": "distributed"
  }
}
```

## Approval

- Decision: Superseded
- Notes: This original v3 token lock captured the light-mode proposal. After the gate 5 comparison on 2026-03-06, the cycle moved to the dark alternative. See the dark token revision artifact for the active lock.
