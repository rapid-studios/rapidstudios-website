# Motion Library

- Topic: Rapid Studios website motion patterns
- Date: 2026-03-05
- Platform: Web
- User: Marketing-site visitors evaluating a premium studio
- Goal: Define a small, repeatable motion system that sharpens hierarchy and trust without feeling gimmicky

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

- Trigger: pointer hover on case-study cards, service cards, and secondary CTA surfaces
- Effect:
  - translateY `-4px`
  - shadow deepens from `shadow-soft` to `shadow-elevated`
  - border shifts from `line-subtle` to `line-strong`
- Duration: `motion-normal`
- Easing: `ease-standard`
- Why: makes cards feel editorial and responsive without exaggerated scaling
- Reduced motion fallback: no translate, only shadow and border change

### 2. Section Reveal

- Trigger: section entering viewport
- Effect:
  - opacity `0 -> 1`
  - translateY `16px -> 0`
  - optional stagger for sibling cards
- Duration: `motion-slow`
- Easing: `ease-out`
- Why: gives the page a polished cadence while preserving readability
- Reduced motion fallback: opacity only, no stagger if it feels too busy

### 3. Sticky Header Condense

- Trigger: scroll after hero departure
- Effect:
  - header height reduces slightly
  - backdrop blur and shadow gain strength
  - CTA remains stable and readable
- Duration: `motion-normal`
- Easing: `ease-in-out`
- Why: supports orientation and gives the site a premium, controlled feel
- Reduced motion fallback: instant style swap with no interpolation

### 4. Modal / Overlay

- Trigger: mobile menu, contact success modal, or pricing detail overlay
- Effect:
  - backdrop opacity `0 -> 1`
  - panel opacity `0 -> 1`
  - panel translateY `12px -> 0`
- Duration: `motion-slow`
- Easing: `ease-emphasis`
- Why: overlays should feel intentional and clean, not springy
- Reduced motion fallback: opacity-only fade

### 5. Toast / Inline Confirmation

- Trigger: contact form success or light system feedback
- Effect:
  - opacity `0 -> 1`
  - translateY `8px -> 0`
- Duration: `motion-fast`
- Easing: `ease-out`
- Why: feedback should feel immediate and non-disruptive
- Reduced motion fallback: opacity-only fade

### 6. Skeleton Loading

- Trigger: work list or case study loading state
- Effect:
  - slow shimmer sweep across muted placeholder blocks
- Duration: `motion-deliberate`
- Easing: linear loop
- Why: indicates progress without noisy loaders
- Reduced motion fallback: static skeleton blocks, no shimmer

## Reduced Motion Rules

- Disable translate and scale for non-essential effects.
- Keep only opacity transitions for reveal and overlay patterns when reduced motion is enabled.
- Replace shimmer with static placeholders.
- Remove stagger where it delays access to readable content.

## Web Implementation Snippets

### CSS

```css
.card {
  transition:
    transform var(--motion-normal) var(--ease-standard),
    box-shadow var(--motion-normal) var(--ease-standard),
    border-color var(--motion-normal) var(--ease-standard);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-elevated);
  border-color: var(--color-line-strong);
}

@media (prefers-reduced-motion: reduce) {
  .card {
    transition:
      box-shadow var(--motion-fast) var(--ease-standard),
      border-color var(--motion-fast) var(--ease-standard);
  }

  .card:hover {
    transform: none;
  }
}
```

### Framer Motion

```ts
export const revealUp = {
  initial: { opacity: 0, y: 16 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: {
    duration: 0.26,
    ease: [0, 0, 0.2, 1],
  },
};

export const overlayIn = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 8 },
  transition: {
    duration: 0.26,
    ease: [0.16, 1, 0.3, 1],
  },
};
```

## Usage Guidance

- Use hover lift on cards that are actually actionable.
- Use reveal motion on major sections and grouped content, not on every small element.
- Keep the hero calmer than the featured-work area.
- Avoid auto-rotating testimonial or showcase carousels for v1.

## Approval

- Decision:
- Notes:
- Prompt: Approve the design system + motion rules?
