# Design System Revision

- Theme: Dark mode default, cinematic product-studio system with restrained blue emphasis
- Date: 2026-03-06
- Inputs: `design/boards/2026-03-06-rapid-studios-v3-look-lock-comparison-board.md`, `design/specs/2026-03-06-rapid-studios-v3-ux-structure-spec.md`
- Supersedes: `design/tokens/2026-03-06-rapid-studios-v3-design-system.md`

## Revision Summary

- Decision:
  - Dark mode was selected at gate 5 after side-by-side comparison with the original light system.

- What stays locked from the original v3 system:
  - `Space Grotesk` + `Manrope`
  - airy editorial spacing
  - soft 2xl shells
  - pill-shell navigation
  - selective density
  - subtle reveal, hover lift, and header condense

- What changes in this revision:
  - base canvas, surface, text, line, and accent values
  - shadow emphasis becomes lower-glow and more border-dependent
  - component rules tighten to avoid neon or generic blue-on-black SaaS styling

## Visual Direction

- Summary:
  - The site should feel cinematic, premium, and controlled rather than flashy or neon.
  - Use charcoal layers instead of true black.
  - Keep the blue accent crisp and bright enough for dark surfaces, but avoid glow-heavy treatment.
  - Use the mint accent sparingly as a secondary support signal only.

## Locked Foundations

- Typography:
  - inherit from `2026-03-06-rapid-studios-v3-design-system.md`

- Spacing:
  - inherit from `2026-03-06-rapid-studios-v3-design-system.md`

- Radius:
  - inherit from `2026-03-06-rapid-studios-v3-design-system.md`

- Motion:
  - inherit from `2026-03-06-rapid-studios-v3-motion-pattern-library.md`

- Density:
  - inherit from `2026-03-06-rapid-studios-v3-design-system.md`

## Color Tokens

- `canvas`
  - Value: `#0B1020`
  - Usage: base page background

- `canvas-elevated`
  - Value: `#0E1424`
  - Usage: brighter dark sections and layered page bands

- `canvas-tint`
  - Value: `#101A32`
  - Usage: dark hero wash and subtle atmosphere gradients

- `surface`
  - Value: `#121A2B`
  - Usage: default cards, modules, and form surfaces

- `surface-soft`
  - Value: `rgba(18, 26, 43, 0.84)`
  - Usage: sticky header shell and elevated translucent layers

- `surface-muted`
  - Value: `#182235`
  - Usage: secondary cards, rails, and quieter support surfaces

- `surface-accent`
  - Value: `rgba(90, 141, 255, 0.12)`
  - Usage: selected surfaces and subtle blue emphasis

- `surface-accent-strong`
  - Value: `rgba(90, 141, 255, 0.18)`
  - Usage: stronger selected states and featured emphasis

- `text-primary`
  - Value: `#F3F7FF`
  - Usage: headlines, key labels, primary body emphasis

- `text-secondary`
  - Value: `#A7B3C8`
  - Usage: support copy, muted body text, secondary navigation

- `text-tertiary`
  - Value: `#7F8CA5`
  - Usage: placeholders, lower-priority helper text, tertiary metadata

- `text-inverse`
  - Value: `#0B1020`
  - Usage: text on the brightest accent surfaces

- `line-subtle`
  - Value: `rgba(243, 247, 255, 0.09)`
  - Usage: default dark borders and quiet shell definition

- `line-strong`
  - Value: `rgba(243, 247, 255, 0.18)`
  - Usage: hover refinement, active borders, stronger separation

- `brand-primary`
  - Value: `#5A8DFF`
  - Usage: primary CTA, active states, key accent color

- `brand-primary-hover`
  - Value: `#78A2FF`
  - Usage: CTA hover and active emphasis

- `brand-accent`
  - Value: `#3ED7C4`
  - Usage: secondary accent and selective positive emphasis

- `focus-ring`
  - Value: `rgba(90, 141, 255, 0.36)`
  - Usage: accessible focus halo

- `success`
  - Value: `#2AC28F`
  - Usage: success states and positive confirmations

- `warning`
  - Value: `#F0A43A`
  - Usage: caution or expectation-setting notes

- `error`
  - Value: `#FF6B6B`
  - Usage: errors and negative feedback

- `overlay-scrim`
  - Value: `rgba(5, 8, 16, 0.56)`
  - Usage: modal and navigation backdrops

## Shadow Tokens

- `shadow-soft`
  - Value: `0 16px 36px rgba(0, 0, 0, 0.24)`
  - Usage: low-contrast elevation on dark surfaces

- `shadow-elevated`
  - Value: `0 24px 52px rgba(0, 0, 0, 0.32)`
  - Usage: cards and key elevated surfaces

- `shadow-float`
  - Value: `0 32px 72px rgba(0, 0, 0, 0.38)`
  - Usage: strongest floating surfaces only

- `shadow-focus`
  - Value: `0 0 0 4px rgba(90, 141, 255, 0.18)`
  - Usage: focus halo support

## Dark-Specific Component Rules

- `SiteHeader`
  - Rule:
    - use dark translucent surfaces with strong border definition
    - avoid bright glow around the shell

- `Primary Button`
  - Rule:
    - keep the blue crisp and slightly brighter than the light-mode system
    - no oversized glows or saturated halos

- `Secondary Button`
  - Rule:
    - rely on border and text contrast more than fill difference

- `ProjectCard`
  - Rule:
    - media wells should use dark-tinted gradients, not bright mock UI blocks
    - hover should tighten border definition before deepening shadow

- `State Surface`
  - Rule:
    - on dark surfaces, state clarity should come from border, icon, and text contrast first
    - avoid colored glow blocks

## Avoid List

- Avoid:
  - pure black backgrounds
  - blue outer glow around every CTA
  - heavy cyan-neon gradients
  - purple drift
  - glossy 3D SaaS styling
  - over-animated hover states on dark cards

## Developer Token Export

```json
{
  "theme": "dark",
  "colors": {
    "canvas": "#0B1020",
    "canvasElevated": "#0E1424",
    "canvasTint": "#101A32",
    "surface": "#121A2B",
    "surfaceSoft": "rgba(18,26,43,0.84)",
    "surfaceMuted": "#182235",
    "surfaceAccent": "rgba(90,141,255,0.12)",
    "surfaceAccentStrong": "rgba(90,141,255,0.18)",
    "textPrimary": "#F3F7FF",
    "textSecondary": "#A7B3C8",
    "textTertiary": "#7F8CA5",
    "textInverse": "#0B1020",
    "lineSubtle": "rgba(243,247,255,0.09)",
    "lineStrong": "rgba(243,247,255,0.18)",
    "brandPrimary": "#5A8DFF",
    "brandPrimaryHover": "#78A2FF",
    "brandAccent": "#3ED7C4",
    "focusRing": "rgba(90,141,255,0.36)",
    "success": "#2AC28F",
    "warning": "#F0A43A",
    "error": "#FF6B6B",
    "overlayScrim": "rgba(5,8,16,0.56)"
  },
  "shadow": {
    "soft": "0 16px 36px rgba(0,0,0,0.24)",
    "elevated": "0 24px 52px rgba(0,0,0,0.32)",
    "float": "0 32px 72px rgba(0,0,0,0.38)",
    "focus": "0 0 0 4px rgba(90,141,255,0.18)"
  }
}
```

## Approval

- Decision: Approved
- Notes: Active token lock after the dark look-lock comparison decision on 2026-03-06.
