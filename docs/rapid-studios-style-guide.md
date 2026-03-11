# Rapid Studios -- Style Guide

**Version:** 1.0
**Last Updated:** 2026-03-08

---

## Brand Identity

### Name Usage
| Context | Format | Example |
|---------|--------|---------|
| Navigation / header | ALL CAPS | RAPID STUDIOS |
| Body copy / footer | Title Case | Rapid Studios |
| Domain / email | Lowercase | rapidstudios.dev |
| Legal / copyright | Title Case | Rapid Studios |

Never use: "rapid studios", "RapidStudios", "RAPIDSTUDIOS", "Rapid studios"

### Brand Mark
SVG lightning bolt icon (`components/ui/brand-icon.tsx`). Always rendered in `--color-brand-primary` (#2b7cee). Minimum size: 24px. Typical header size: 32px.

---

## Color System

All colors are defined as CSS custom properties in `styles/globals.css`.

### Core Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-canvas` | `#101822` | Page background |
| `--color-canvas-tint` | `#0c1320` | Darker variant for depth |
| `--color-surface` | `#121c2a` | Card/panel backgrounds |
| `--color-surface-soft` | `rgba(18, 28, 42, 0.9)` | Glassmorphism surfaces |
| `--color-surface-muted` | `#172233` | Disabled/muted surfaces |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-text-primary` | `#f3f7ff` | Headings, primary content |
| `--color-text-secondary` | `#8fa8c9` | Body text, descriptions |
| `--color-text-inverse` | `#ffffff` | Text on brand-colored backgrounds |

### Brand Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-brand-primary` | `#2b7cee` | Primary accent, CTAs, links, icons |
| `--color-brand-primary-hover` | `#236bd6` | Hover state for primary |
| `--color-brand-accent` | `#0bda5e` | Success indicators, positive metrics |
| `--color-focus-ring` | `rgba(43, 124, 238, 0.28)` | Focus outlines |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-success` | `#22c55e` | Success states |
| `--color-warning` | `#f59e0b` | Warning states |
| `--color-error` | `#f87171` | Error states, validation |

### Line/Border Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--color-line-subtle` | `rgba(255, 255, 255, 0.08)` | Default borders |
| `--color-line-strong` | `rgba(255, 255, 255, 0.14)` | Hover/emphasis borders |

### Usage Rules
- Never use raw Tailwind color classes (e.g., `slate-400`, `slate-800`) in new code
- Always reference CSS variables: `text-[var(--color-text-secondary)]`
- The only exception is `white` and `black` for absolute values
- Background gradients and radial blurs may use rgba values directly when composing effects

---

## Typography

### Font Stack

| Variable | Family | Weight Range | Usage |
|----------|--------|-------------|-------|
| `--font-display` | Space Grotesk | 700-900 | Display headlines (available but currently not primary) |
| `--font-body` | Manrope | 400-700 | Body text (available but currently not primary) |
| `--font-stitch` | Inter | 400-900 | Primary font for all UI (currently active) |

The site currently uses Inter (`--font-stitch`) as the primary font across all surfaces. Space Grotesk and Manrope are loaded and available for future differentiation.

### Type Scale

| Element | Size | Weight | Tracking | Line Height |
|---------|------|--------|----------|------------|
| Hero H1 | 5xl / 8xl (md) | 900 (black) | tight | 1.1 |
| Page H1 | 6xl / 6.5rem (md) | 900 (black) | -0.08em | 0.95 |
| Section H2 | 4xl | 900 (black) | default | default |
| Card H3 | xl | 700 (bold) | default | default |
| Card H4 | 2xl | 700 (bold) | default | default |
| Body | base (1rem) | 400 | default | 1.9 (prose) |
| Body large | lg / xl | 400 | default | relaxed |
| Eyebrow | xs / sm | 700 (bold) | 0.18-0.28em | default |
| Small / meta | sm | 500-600 | default | default |
| Nav link | sm | 500 | default | default |
| Button | sm | 600 | -0.02em | default |

### Eyebrow Pattern
Uppercase, extra-wide tracking, brand-primary color, bold weight. Used above section headings.
```
text-xs font-bold uppercase tracking-[0.2em] text-[var(--color-brand-primary)]
```

---

## Spacing

### Section Spacing
| Context | Padding |
|---------|---------|
| Standard section | `py-24` (6rem) |
| Hero section | `pb-20 pt-40` (homepage) or `pb-16 pt-24` (inner pages) |
| Metric bar | `py-16` |
| Footer | `py-20` |

### Container
- Max width: `max-w-7xl` (80rem / 1280px) for full-width sections
- Max width: `max-w-5xl` (64rem / 1024px) for header nav
- Max width: `max-w-[1234px]` for Container component
- Horizontal padding: `px-4` (1rem) on all breakpoints

### Component Spacing
| Context | Gap/Margin |
|---------|-----------|
| Section heading to content | `mb-16` |
| Card grid | `gap-6` to `gap-10` |
| Card internal | `p-6` to `p-10` |
| Form fields | `space-y-4` |
| Button group | `gap-3` to `gap-4` |

---

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 14px | Small elements |
| `--radius-md` | 18px | Form inputs |
| `--radius-lg` | 24px | Cards, panels |
| `--radius-xl` | 32px | Large cards, CTA sections |
| `--radius-pill` | 999px | Buttons, nav bar, badges |

### Common Patterns
- Buttons: `rounded-[var(--radius-pill)]`
- Cards: `rounded-xl` or `rounded-[1.25rem]`
- Inputs: `rounded-[var(--radius-md)]`
- Contact form card: `rounded-[2.5rem]`
- Nav bar: `rounded-full`

---

## Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-soft` | `0 14px 34px rgba(0,0,0,0.18)` | Cards, inputs |
| `--shadow-elevated` | `0 18px 46px rgba(0,0,0,0.24)` | Hover states |
| `--shadow-float` | `0 28px 72px rgba(0,0,0,0.34)` | CTAs, floating elements |

Brand shadow for primary buttons: `shadow-[0_28px_70px_rgba(43,124,238,0.22)]`

---

## Motion

### Duration Tokens
| Token | Value | Usage |
|-------|-------|-------|
| `--motion-fast` | 120ms | Micro-interactions, color changes |
| `--motion-normal` | 180ms | Standard transitions |
| `--motion-slow` | 260ms | Panel/menu animations |
| `--motion-deliberate` | 380ms | Page-level reveals |

### Easing Functions
| Token | Value | Usage |
|-------|-------|-------|
| `--ease-standard` | `cubic-bezier(0.2, 0, 0, 1)` | Default for all interactive elements |
| `--ease-out` | `cubic-bezier(0, 0, 0.2, 1)` | Exit animations |
| `--ease-in-out` | `cubic-bezier(0.4, 0, 0.2, 1)` | Symmetric transitions |
| `--ease-emphasis` | `cubic-bezier(0.16, 1, 0.3, 1)` | Dramatic reveals, menu open |

### Motion Principles
1. **Subtle reveal** -- elements fade in and translate up slightly on scroll
2. **Refined hover states** -- cards lift with shadow, buttons scale subtly
3. **No flashy gimmicks** -- motion supports premium feel, never distracts
4. **Respect preferences** -- all motion respects `prefers-reduced-motion`
5. **Consistent curves** -- use easing tokens, never linear transitions

### Reveal Animation
The `Reveal` component (`components/motion/reveal.tsx`) provides scroll-triggered fade-up animation using Framer Motion. Configurable delay for staggered reveals.

### Interactive Card
```css
.interactive-card:hover {
  transform: translateY(-4px);
  border-color: var(--color-line-strong);
  box-shadow: var(--shadow-elevated);
}
```
Disabled when `prefers-reduced-motion: reduce`.

---

## Button Variants

Defined in `components/ui/button.tsx` using CVA.

| Variant | Background | Text | Border | Shadow | Usage |
|---------|-----------|------|--------|--------|-------|
| `primary` | brand-primary | white | none | elevated | Primary CTAs |
| `secondary` | white/4 | text-primary | line-subtle | soft | Secondary actions |
| `ghost` | transparent | text-primary | none | none | Tertiary actions |

| Size | Height | Padding |
|------|--------|---------|
| `default` | h-12 | px-5 |
| `large` | h-14 | px-6 |
| `sm` | h-10 | px-4 |

All buttons use `--radius-pill` (fully rounded).

### Link-as-Button Pattern
For navigation CTAs (hero, CTA bands), use inline Link styled as button rather than Button with asChild. This keeps the styling explicit and avoids Slot complexity for simple cases.

---

## Card Styles

### Surface Card (`.surface-card`)
Glass-effect card with gradient background, subtle border, backdrop blur, and soft shadow. Used for the contact form container and prominent content panels.

### Interactive Card (`.interactive-card`)
Adds hover lift effect to any card. Combine with border and shadow tokens.

### Standard Card Pattern
```
rounded-xl border border-[var(--color-line-subtle)] bg-[var(--color-canvas)] p-8
```

---

## Form Fields

- Input height: `h-13` (~3.25rem)
- Border: `border-[var(--color-line-subtle)]`
- Background: `rgba(16, 24, 34, 0.82)`
- Focus: brand-primary border + focus ring
- Radius: `--radius-md` (18px)
- Text: `--color-text-primary`
- Placeholder: `--color-text-secondary`

Error text: `text-[var(--color-error)]` below the field, `mt-2 text-sm`

---

## Section Backgrounds

| Pattern | Usage |
|---------|-------|
| Plain canvas | Default sections |
| `bg-[var(--color-surface)]/50` | Alternating sections for depth |
| `bg-[var(--color-surface)]/30` | Subtle differentiation |
| `.cta-shell` | CTA bands (brand-primary gradient with radial highlights) |

### Body Background
Radial gradient with blue and green tints at top corners, fading to dark canvas:
```css
background:
  radial-gradient(circle at top left, rgba(43, 124, 238, 0.12), transparent 24%),
  radial-gradient(circle at top right, rgba(11, 218, 94, 0.06), transparent 20%),
  linear-gradient(180deg, #101822 0%, #0b1017 100%);
```

---

## Icon Usage

- Library: Lucide React
- Default size: `size-4` to `size-7` depending on context
- Icon-in-circle pattern: `h-12 w-12 rounded-full bg-[var(--color-brand-primary)]/10 text-[var(--color-brand-primary)]`
- Navigation icons: `size-5`
- Decorative/action: `size-4`

---

## Link Styling

- Default: `text-[var(--color-text-secondary)]`
- Hover: `hover:text-[var(--color-brand-primary)]` or `hover:text-[var(--color-text-primary)]`
- Active nav: `text-[var(--color-brand-primary)]`
- Transition: `transition-colors` (inherits `--ease-standard` from global rule)

---

## Header Pattern

Floating pill navigation bar, fixed at top with 24px offset. Glass effect with backdrop blur. Contains brand mark, nav links, and primary CTA button. Mobile: hamburger menu with animated dropdown panel.

## Footer Pattern

Four-column grid: brand info, studio links, service links, contact CTA. Border top separator. Bottom bar with copyright and email. All text uses CSS variable colors.

---

## Email Brand Styling

For Resend email templates (to be implemented):
- Dark background matching `--color-canvas`
- Blue accent matching `--color-brand-primary`
- Header: brand icon + "RAPID STUDIOS"
- Footer: "RAPID STUDIOS" + studio link
- Signoff: "Thank You! / The Rapid Studios Team"
- Reply-to: hello@rapidstudios.dev

---

## Accessibility

- All interactive elements have focus-visible ring (`--color-focus-ring`)
- Reduced motion: all animations collapse to near-instant
- Color contrast: primary text on canvas exceeds 4.5:1
- Mobile nav button has aria-label
- Form inputs have associated labels
- Images have alt text

---

## File Organization

```
styles/globals.css          -- Design tokens + utility classes
lib/motion/tokens.ts        -- Motion values for Framer Motion
lib/utils.ts                -- cn() class merge utility
components/ui/              -- Primitive UI components
components/layout/          -- Header, footer
components/sections/        -- Page sections (composable)
components/motion/          -- Animation wrappers
components/pages/           -- Full page compositions
```
