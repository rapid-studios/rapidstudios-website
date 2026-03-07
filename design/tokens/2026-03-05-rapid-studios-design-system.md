# Design System

- Theme: Light mode default, dark mode deferred as a follow-up proposal
- Date: 2026-03-05
- Inputs: Approved phase 2 design spec, approved phase 1 research, motion reference board

## Visual Direction

- Summary:
  - Rapid Studios should feel like a premium product studio rather than a generic agency template.
  - The system should rely on crisp hierarchy, wide spacing, soft borders, layered white surfaces, restrained gradients, and one strong brand color.
  - Visual energy should come from composition, typography, and subtle motion, not from dense effects or loud color usage.

## Typography Tokens

- `display`
  - Family: `Space Grotesk`, sans-serif
  - Size: `72px`
  - Weight: `700`
  - Line height: `0.96`
- `h1`
  - Family: `Space Grotesk`, sans-serif
  - Size: `56px`
  - Weight: `700`
  - Line height: `1.0`
- `h2`
  - Family: `Space Grotesk`, sans-serif
  - Size: `40px`
  - Weight: `700`
  - Line height: `1.05`
- `h3`
  - Family: `Space Grotesk`, sans-serif
  - Size: `28px`
  - Weight: `600`
  - Line height: `1.15`
- `body`
  - Family: `Manrope`, sans-serif
  - Size: `18px`
  - Weight: `500`
  - Line height: `1.65`
- `caption`
  - Family: `Manrope`, sans-serif
  - Size: `14px`
  - Weight: `600`
  - Line height: `1.5`

## Color Tokens

- `canvas`
  - Value: `#F5F7FB`
  - Usage: base page background
- `canvas-tint`
  - Value: `#EEF3FF`
  - Usage: hero and accent wash backgrounds
- `surface`
  - Value: `#FFFFFF`
  - Usage: default cards, panels, input surfaces
- `surface-soft`
  - Value: `rgba(255, 255, 255, 0.82)`
  - Usage: blurred panels, sticky header, elevated sections
- `surface-muted`
  - Value: `#F8FAFD`
  - Usage: secondary blocks and pricing highlights
- `text-primary`
  - Value: `#0F172A`
  - Usage: major headings, body emphasis
- `text-secondary`
  - Value: `#5B677D`
  - Usage: body copy, labels, secondary links
- `text-inverse`
  - Value: `#F8FBFF`
  - Usage: primary buttons and dark surfaces
- `line-subtle`
  - Value: `rgba(15, 23, 42, 0.08)`
  - Usage: card borders, dividers
- `line-strong`
  - Value: `rgba(15, 23, 42, 0.14)`
  - Usage: hover states, focused outlines, stronger separators
- `brand-primary`
  - Value: `#346DFF`
  - Usage: primary CTA, key accent, selected states
- `brand-primary-hover`
  - Value: `#2356DE`
  - Usage: CTA hover and active
- `brand-accent`
  - Value: `#0FB7A7`
  - Usage: secondary emphasis, inline accents, metrics
- `focus-ring`
  - Value: `rgba(52, 109, 255, 0.32)`
  - Usage: accessible focus halo
- `success`
  - Value: `#0E9F6E`
  - Usage: contact success and positive outcomes
- `warning`
  - Value: `#D97706`
  - Usage: caution or FAQ emphasis
- `error`
  - Value: `#DC2626`
  - Usage: form errors and failure states

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

## Reduced Motion Rules

- Rule:
  - Remove translate and scale effects where they are not strictly needed for comprehension.
- Rule:
  - Replace staggered reveals with opacity-only appearance where possible.
- Rule:
  - Disable shimmer loops and replace them with static placeholder states.
- Rule:
  - Keep transitions at `motion-fast` or `motion-normal` only when motion remains necessary.

## Base Component Rules

- `Button`
  - Rule:
    - Primary buttons use `brand-primary`, `text-inverse`, `radius-pill`, and `shadow-elevated`.
    - Hover should darken the fill and slightly deepen the shadow, not scale noticeably.
- `Secondary Button`
  - Rule:
    - Use `surface`, `text-primary`, and `line-strong` with the same rounded shape as primary buttons.
- `Card`
  - Rule:
    - Cards use `surface` or `surface-soft`, `line-subtle`, and `radius-lg` or `radius-xl`.
    - Hover emphasis should come from shadow and border refinement first.
- `Sticky Header`
  - Rule:
    - Use `surface-soft`, blur, `line-subtle`, and `radius-pill`.
    - Keep the visual weight light until scroll compaction begins.
- `Section Heading`
  - Rule:
    - Pair `h2` with short `body` support copy.
    - Avoid multi-paragraph intros inside section headers.
- `Input`
  - Rule:
    - Inputs should feel calm and premium: `surface`, `line-subtle`, `radius-md`, strong focus ring.
- `Pricing Card`
  - Rule:
    - Use one emphasized card at most.
    - Keep the card premium through spacing and hierarchy, not through loud badge styling.
- `Testimonial Card`
  - Rule:
    - Quotes stay short and use generous padding.
    - Metadata should sit in `caption` or small `body` styles.

## Optional Dark Mode Proposal

- Not required for v1.
- If added later:
  - keep the same structure and spacing
  - invert contrast carefully instead of using saturated glows
  - reduce shadow reliance and lean more on borders and translucent surfaces

## Developer Token Export

```css
:root {
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Manrope", sans-serif;

  --text-display-size: 72px;
  --text-h1-size: 56px;
  --text-h2-size: 40px;
  --text-h3-size: 28px;
  --text-body-size: 18px;
  --text-caption-size: 14px;

  --line-display: 0.96;
  --line-h1: 1;
  --line-h2: 1.05;
  --line-h3: 1.15;
  --line-body: 1.65;
  --line-caption: 1.5;

  --color-canvas: #f5f7fb;
  --color-canvas-tint: #eef3ff;
  --color-surface: #ffffff;
  --color-surface-soft: rgba(255, 255, 255, 0.82);
  --color-surface-muted: #f8fafd;
  --color-text-primary: #0f172a;
  --color-text-secondary: #5b677d;
  --color-text-inverse: #f8fbff;
  --color-line-subtle: rgba(15, 23, 42, 0.08);
  --color-line-strong: rgba(15, 23, 42, 0.14);
  --color-brand-primary: #346dff;
  --color-brand-primary-hover: #2356de;
  --color-brand-accent: #0fb7a7;
  --color-focus-ring: rgba(52, 109, 255, 0.32);
  --color-success: #0e9f6e;
  --color-warning: #d97706;
  --color-error: #dc2626;

  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 24px;
  --space-6: 32px;
  --space-7: 48px;
  --space-8: 64px;
  --space-9: 96px;
  --space-10: 128px;

  --radius-sm: 14px;
  --radius-md: 18px;
  --radius-lg: 24px;
  --radius-xl: 32px;
  --radius-pill: 999px;

  --shadow-soft: 0 10px 30px rgba(15, 23, 42, 0.06);
  --shadow-elevated: 0 18px 46px rgba(15, 23, 42, 0.08);
  --shadow-float: 0 28px 72px rgba(15, 23, 42, 0.12);

  --motion-fast: 120ms;
  --motion-normal: 180ms;
  --motion-slow: 260ms;
  --motion-deliberate: 380ms;
  --ease-standard: cubic-bezier(0.2, 0, 0, 1);
  --ease-out: cubic-bezier(0, 0, 0.2, 1);
  --ease-in-out: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-emphasis: cubic-bezier(0.16, 1, 0.3, 1);
}
```

```ts
export const rapidStudiosTokens = {
  fonts: {
    display: '"Space Grotesk", sans-serif',
    body: '"Manrope", sans-serif',
  },
  typography: {
    display: { size: 72, weight: 700, lineHeight: 0.96 },
    h1: { size: 56, weight: 700, lineHeight: 1.0 },
    h2: { size: 40, weight: 700, lineHeight: 1.05 },
    h3: { size: 28, weight: 600, lineHeight: 1.15 },
    body: { size: 18, weight: 500, lineHeight: 1.65 },
    caption: { size: 14, weight: 600, lineHeight: 1.5 },
  },
  colors: {
    canvas: "#F5F7FB",
    canvasTint: "#EEF3FF",
    surface: "#FFFFFF",
    surfaceSoft: "rgba(255,255,255,0.82)",
    surfaceMuted: "#F8FAFD",
    textPrimary: "#0F172A",
    textSecondary: "#5B677D",
    textInverse: "#F8FBFF",
    lineSubtle: "rgba(15,23,42,0.08)",
    lineStrong: "rgba(15,23,42,0.14)",
    brandPrimary: "#346DFF",
    brandPrimaryHover: "#2356DE",
    brandAccent: "#0FB7A7",
    focusRing: "rgba(52,109,255,0.32)",
    success: "#0E9F6E",
    warning: "#D97706",
    error: "#DC2626",
  },
  space: {
    1: 4,
    2: 8,
    3: 12,
    4: 16,
    5: 24,
    6: 32,
    7: 48,
    8: 64,
    9: 96,
    10: 128,
  },
  radius: {
    sm: 14,
    md: 18,
    lg: 24,
    xl: 32,
    pill: 999,
  },
  shadow: {
    soft: "0 10px 30px rgba(15, 23, 42, 0.06)",
    elevated: "0 18px 46px rgba(15, 23, 42, 0.08)",
    float: "0 28px 72px rgba(15, 23, 42, 0.12)",
  },
  motion: {
    fast: 120,
    normal: 180,
    slow: 260,
    deliberate: 380,
    easeStandard: [0.2, 0, 0, 1],
    easeOut: [0, 0, 0.2, 1],
    easeInOut: [0.4, 0, 0.2, 1],
    easeEmphasis: [0.16, 1, 0.3, 1],
  },
} as const;
```

## Approval

- Decision:
- Notes:
- Prompt: Approve the design system + motion rules?
