# Motion Library

- Topic: Rapid Studios website v3 motion patterns
- Date: 2026-03-06
- Platform: Web
- User: marketing-site visitors evaluating a premium studio
- Goal: define the reusable motion system that supports the approved v3 tone without making the site feel busy

## Motion Token Summary

- Durations:
  - `motion-fast`: `120ms`
  - `motion-normal`: `180ms`
  - `motion-slow`: `260ms`
  - `motion-deliberate`: `380ms`

- Easing:
  - `ease-standard`: `cubic-bezier(0.2, 0, 0, 1)`
  - `ease-out`: `cubic-bezier(0, 0, 0.2, 1)`
  - `ease-in-out`: `cubic-bezier(0.4, 0, 0.2, 1)`
  - `ease-emphasis`: `cubic-bezier(0.16, 1, 0.3, 1)`

## Pattern Catalog

### 1. Hover Lift

- Trigger:
  - pointer hover on project cards, service cards, pricing cards, and quiet CTA surfaces
- Effect:
  - translateY `-4px`
  - shadow deepens from `shadow-soft` to `shadow-elevated`
  - border shifts from `line-subtle` to `line-strong`
- Duration:
  - `motion-normal`
- Easing:
  - `ease-standard`
- Why:
  - makes clickable surfaces feel refined without aggressive scale or bounce
- Reduced motion fallback:
  - no translate
  - border and shadow only

### 2. Section Reveal

- Trigger:
  - section entering viewport
- Effect:
  - opacity `0 -> 1`
  - translateY `16px -> 0`
  - optional small stagger for sibling cards only when it clarifies hierarchy
- Duration:
  - `motion-slow`
- Easing:
  - `ease-out`
- Why:
  - gives the page a polished rhythm while preserving readability
- Reduced motion fallback:
  - opacity only
  - no stagger when reduced motion is enabled

### 3. Sticky Header Condense

- Trigger:
  - scroll after the hero begins to clear
- Effect:
  - shell padding reduces slightly
  - blur and border definition increase
  - CTA cluster remains stable in position and readability
- Duration:
  - `motion-normal`
- Easing:
  - `ease-in-out`
- Why:
  - helps orientation and makes the shell feel intentionally designed
- Reduced motion fallback:
  - instant state swap with no interpolation

### 4. Modal / Overlay Entrance

- Trigger:
  - mobile nav, success overlay, or future detail overlay
- Effect:
  - backdrop opacity `0 -> 1`
  - panel opacity `0 -> 1`
  - panel translateY `12px -> 0`
- Duration:
  - `motion-slow`
- Easing:
  - `ease-emphasis`
- Why:
  - overlays should feel controlled and clean, not spring-driven
- Reduced motion fallback:
  - opacity-only fade

### 5. Page Transition

- Trigger:
  - route-level transitions where used
- Effect:
  - light opacity crossfade only
  - avoid large page slides or dramatic wipes
- Duration:
  - `motion-normal`
- Easing:
  - `ease-out`
- Why:
  - the site should feel smooth between pages without calling attention to the transition itself
- Reduced motion fallback:
  - no animated transition

### 6. Skeleton Loading

- Trigger:
  - work list loading, case-study loading, or future async content placeholders
- Effect:
  - slow shimmer across muted placeholder blocks
- Duration:
  - `motion-deliberate`
- Easing:
  - linear loop
- Why:
  - indicates progress without resorting to noisy spinners
- Reduced motion fallback:
  - static placeholder blocks with no shimmer

### 7. Toast / Inline Confirmation

- Trigger:
  - contact success, inline save confirmation, or lightweight feedback
- Effect:
  - opacity `0 -> 1`
  - translateY `8px -> 0`
- Duration:
  - `motion-fast`
- Easing:
  - `ease-out`
- Why:
  - feedback should feel immediate and non-disruptive
- Reduced motion fallback:
  - opacity only

### 8. List Add / Remove

- Trigger:
  - future filter chips, dynamic list items, or interactive pricing toggles
- Effect:
  - add: opacity `0 -> 1`, translateY `8px -> 0`
  - remove: opacity `1 -> 0`, translateY `0 -> -4px`
- Duration:
  - `motion-fast`
- Easing:
  - `ease-standard`
- Why:
  - keeps list changes readable without over-animating simple UI updates
- Reduced motion fallback:
  - opacity only

## Reduced Motion Rules

- Disable translate and scale for non-essential effects.
- Keep only opacity transitions for reveal and overlay patterns when reduced motion is enabled.
- Replace shimmer with static placeholders.
- Remove stagger if it delays access to readable content.
- Keep feedback and focus changes fast and functional rather than decorative.

## Usage Guidance

- Use hover lift only on truly interactive surfaces.
- Use section reveal on major blocks, not every child element.
- Keep the hero calmer than the featured-work region.
- Avoid auto-rotating testimonial or showcase carousels for this cycle.
- Do not add bounce, elastic easing, or long parallax treatments to the homepage.
- On dark surfaces, rely more on border contrast and less on exaggerated shadow gain.
- Do not add accent-color glows to hover or focus states.

## Approval

- Decision: Approved
- Notes: Motion rules remain active for the dark revision. The dark look-lock decision only tightens the no-glow and border-first guidance on dark surfaces.
