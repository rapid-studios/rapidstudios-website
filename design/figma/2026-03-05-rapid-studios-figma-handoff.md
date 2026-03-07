# Figma Review

- Topic: Rapid Studios marketing site v1 Figma handoff
- Date: 2026-03-05
- File URL: https://www.figma.com/design/Gsg8X78vwMmRM8Gt2aSOfG
- Frames:
  - `10 Home`
  - `20 Work`
  - `30 Case Study`
  - `40 Services`
  - `50 Process`
  - `60 Contact`

## Goal

- Turn the approved wireframes into polished desktop-first Figma layouts using the approved design system and motion rules.
- Keep this phase focused on visual design and state coverage only.
- Do not start code implementation from this file until a human has reviewed and approved the Figma designs.

## Page And Frame Setup

- Create a new Figma page named `Approved Layouts`.
- Add desktop frames first at `1440 x auto`.
- Add mobile frames after desktop approval at `390 x auto`.
- Use the frame naming pattern:
  - `10 Home`
  - `20 Work`
  - `30 Case Study`
  - `40 Services`
  - `50 Process`
  - `60 Contact`
- Keep existing research-board pages for reference only. Do not mix them with the approved layout page.

## Auto Layout Rules

- Root page sections:
  - Use vertical auto layout.
  - Section spacing between major blocks: `space-9` to `space-10`.
  - Internal section padding: typically `space-8` vertical and `space-6` horizontal.
- Content container:
  - Use a centered content wrapper with max width around `1200px`.
  - Desktop side padding should feel generous; do not crowd edges.
- Two-column sections:
  - Use clear `space-7` or `space-8` gaps.
  - Collapse to one column on mobile without changing content order unless the CTA needs to rise earlier.
- Cards:
  - Prefer nested auto layout over manual positioning.
  - Build card internals with stable vertical spacing tokens so variants stay consistent.
- Header:
  - Use horizontal auto layout with left brand, middle nav, right CTA.
  - Keep the shell pill-like and visually light before the condensed scroll state.

## Variables And Tokens To Set Up

- Color variables:
  - `canvas`
  - `canvas-tint`
  - `surface`
  - `surface-soft`
  - `surface-muted`
  - `text-primary`
  - `text-secondary`
  - `text-inverse`
  - `line-subtle`
  - `line-strong`
  - `brand-primary`
  - `brand-primary-hover`
  - `brand-accent`
  - `focus-ring`
  - `success`
  - `warning`
  - `error`
- Spacing variables:
  - `space-1` through `space-10`
- Radius variables:
  - `radius-sm`
  - `radius-md`
  - `radius-lg`
  - `radius-xl`
  - `radius-pill`
- Effect variables:
  - `shadow-soft`
  - `shadow-elevated`
  - `shadow-float`
- Motion documentation variables:
  - `motion-fast`
  - `motion-normal`
  - `motion-slow`
  - `motion-deliberate`
  - `ease-standard`
  - `ease-out`
  - `ease-in-out`
  - `ease-emphasis`

## Type Styles

- `Display / 72 / 700 / Space Grotesk`
- `H1 / 56 / 700 / Space Grotesk`
- `H2 / 40 / 700 / Space Grotesk`
- `H3 / 28 / 600 / Space Grotesk`
- `Body / 18 / 500 / Manrope`
- `Caption / 14 / 600 / Manrope`

## Component Inventory To Build

- `Site Header`
  - Variants:
    - `default`
    - `condensed`
- `Button`
  - Variants:
    - `primary`
    - `secondary`
    - `ghost`
  - States:
    - `default`
    - `hover`
    - `focus`
    - `disabled`
- `Section Heading`
  - Variants:
    - `left-aligned`
    - `split-with-link`
- `Service Card`
  - States:
    - `default`
    - `hover`
- `Project Card`
  - Variants:
    - `featured`
    - `grid`
  - States:
    - `default`
    - `hover`
    - `loading`
    - `empty-shell`
- `Process Step`
  - Variants:
    - `horizontal`
    - `stacked`
- `Testimonial Card`
  - States:
    - `default`
    - `highlighted`
- `CTA Band`
  - Variants:
    - `standard`
    - `email-secondary`
- `Input`
  - States:
    - `default`
    - `focus`
    - `error`
    - `disabled`
- `Textarea`
  - States:
    - `default`
    - `focus`
    - `error`
- `Status Panel`
  - Variants:
    - `form-success`
    - `form-error`
    - `work-empty`
    - `route-error`
- `Skeleton Block`
  - Variants:
    - `card`
    - `hero`
    - `media`

## Page Build Instructions

### 10 Home

- Build the hero first.
- Use a two-column composition:
  - left side for eyebrow, headline, support copy, CTA row
  - right side for a premium abstract visual or editorial proof panel
- Keep the trust bar compact and close to the hero.
- Services should read as 3 primary cards, with a fourth only if needed for balance.
- Featured work should use oversized editorial cards, not equal small tiles.
- Process can stay horizontal on desktop if it remains readable.
- Testimonials should stay short and structured.
- CTA band should feel like the strongest conversion block on the page after the hero.

### 20 Work

- Use a short intro and then move quickly into the project grid.
- Keep filter chips minimal and visually secondary.
- Build the work grid as a two-column editorial rhythm with strong image containers.
- Include loading, empty, and error states in a nearby component area or side-by-side review frame.

### 30 Case Study

- Keep the hero image prominent but not oversized enough to delay the summary.
- Place outcome summary high on the page.
- Alternate media and text density as the story progresses.
- Include a `case study coming soon` empty-state frame for template completeness.

### 40 Services

- Build each service pillar as a clean, spacious block with headline, short promise, and deliverables.
- Alternate alignment or media placement across sections to avoid repetition.
- Keep any engagement-model row calm and premium.

### 50 Process

- Keep numbering visually strong and easy to scan.
- Use repeated step modules with consistent spacing and hierarchy.
- Add a small collaboration-principles block near the bottom to reduce uncertainty.

### 60 Contact

- Keep the form high on the page.
- Use a two-column layout:
  - left for form
  - right for direct email or scheduling option
- Include all form states in review:
  - default
  - focus
  - inline error
  - submitting
  - success

## Visual Rules To Preserve

- Favor white or near-white surfaces over dark hero treatments.
- Use blur, shadow, and border restraint. The site should feel expensive, not effect-heavy.
- Keep one dominant CTA color throughout the system.
- Use the teal accent sparingly for highlights, not as a second primary brand.
- Keep corners soft and large, especially on cards, panels, and CTA containers.

## Motion Notes For Figma Prototype

- `Site Header`
  - Show a condensed sticky-header variant for the scrolled state.
  - Use Smart Animate only if the transition remains subtle.
- `Project Card` and `Service Card`
  - Document hover-lift intent in notes or component descriptions.
  - Do not exaggerate scale in prototype motion.
- Section reveals:
  - Note that sections should fade and rise slightly on implementation.
  - No bouncing, parallax, or rotating decorative elements for v1.
- Overlays:
  - If a mobile menu or success overlay is mocked, use opacity plus small upward settle only.
- Reduced motion:
  - Add a reviewer note that all translate-heavy effects must have opacity-only fallbacks in code.

## Required Review States

- Home:
  - hero default
  - sticky header condensed state
- Work:
  - default list
  - loading
  - empty
  - error
- Case Study:
  - default
  - empty
  - error
- Contact:
  - default
  - focus
  - inline error
  - submitting
  - success

## Human Review Checklist

- The page hierarchy feels premium and calm, not crowded.
- The CTA path is obvious on every page.
- The section rhythm feels intentional across the full home page.
- Card components are consistent in padding, radius, border, and shadow behavior.
- The Figma file includes the required states, not just the happy path.
- Typography matches the approved scale and family choices.
- Colors and effects stay inside the approved token system.
- Motion notes are documented but restrained.
- Mobile collapse behavior has been considered, even if mobile frames are not fully designed yet.

## Token And Component Coverage

- Coverage note: All page designs should be composed from the phase 3 token system before any one-off styling is introduced.
- Coverage note: Any new component invented during visual design must be added back to this handoff note before phase 6.
- Coverage note: Do not skip error, empty, or success states for the sake of speed.

## Approval

- Decision: Pending
- Notes: Build or refine these frames in Figma, then return with the file URL and frame names if they change.
- Prompt: Has the Figma design been reviewed and approved by a human?
