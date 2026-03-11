# Rapid Studios -- Component Specification

**Version:** 1.0
**Last Updated:** 2026-03-08

---

## Layout Components

### SiteHeader
**File:** `components/layout/site-header.tsx`
**Type:** Client component ("use client")
**Props:** None

Floating pill-shaped navigation bar fixed 24px from viewport top. Contains:
- Brand icon + "RAPID STUDIOS" wordmark (links to /)
- Desktop nav links (Work, Services, Process) -- Contact excluded, shown as CTA
- "Start a Project" primary CTA button (links to /contact)
- Mobile hamburger toggle with animated dropdown panel

**Dependencies:** framer-motion, lucide-react (Menu, X), BrandIcon, navigation from site-data

**Behavior:**
- Active link detection via `usePathname()`
- Mobile menu uses AnimatePresence for enter/exit animation
- Respects `prefers-reduced-motion` via `useReducedMotion()`

---

### SiteFooter
**File:** `components/layout/site-footer.tsx`
**Type:** Server component
**Props:** None

Four-column footer grid with:
1. Brand mark + tagline + social links (Globe, AtSign)
2. Studio links (Work, Services, Process, Pricing, Contact)
3. Service links (Positioning & Messaging, Marketing Websites, Frontend Implementation)
4. "Get in Touch" CTA with "Start a Project" button

Bottom bar: dynamic copyright year + email link.

**Service links must match actual MDX service content.** Update both if services change.

---

## Page Components

### StitchHomepage
**File:** `components/pages/stitch-homepage.tsx`
**Type:** Server component
**Props:** None

Full homepage composition with inline sections:
- Hero (headline, subheadline, dual CTA)
- Metrics grid (4 stat cards)
- Services grid (3 cards)
- Featured Work (3 case study cards from MDX)
- Process steps (3 steps with connecting line)
- Testimonials (2 cards with star ratings)
- CTA band (full-width brand-colored section)

**Known issue:** Services and metrics in this component do not match the real service content in `content/services/`. This is flagged for Phase 4 alignment.

---

## Section Components

### ContactForm
**File:** `components/sections/contact-form.tsx`
**Type:** Client component ("use client")
**Props:** None

Contact form with client-side validation. Fields: name (required), email (required), note/project brief (required, min 12 chars). Company field exists in payload type but is not rendered.

**States:**
- Default: form with fields
- Pending: "Sending..." button text, disabled
- Success: StatusPanel with "Inquiry received" and action buttons
- Error: field-level error messages + form-level error with email fallback

**Submission:** POST to `/api/contact` with JSON payload.

---

### PageHero
**File:** `components/sections/page-hero.tsx`
**Props:** `eyebrow`, `title`, `description`, `aside?` (ReactNode)

Reusable hero for inner pages. Two-column layout on large screens with optional aside content. Used on /services, /work, /process, /pricing.

---

### ProcessSection
**File:** `components/sections/process-section.tsx`
**Props:** `steps`, `variant` ("compact" | "detailed"), `principles?`

Renders process steps as numbered cards. Compact: 3-step horizontal. Detailed: 5-step with collaboration principles section.

---

### TestimonialsSection
**File:** `components/sections/testimonials-section.tsx`
**Props:** `testimonials` (Testimonial[])

Two-column grid of testimonial cards with quote, name, role. Uses Reveal animation wrapper.

---

### FeaturedWorkSection
**File:** `components/sections/featured-work-section.tsx`

Two-column grid of ProjectCard components showing featured case studies.

---

### CtaBand
**File:** `components/sections/cta-band.tsx`
**Props:** `title`, `description`, `href`, `label`

Full-width CTA section using `.cta-shell` styling. Brand-colored background with white text and CTA button.

---

### HomeTrustBar
**File:** `components/sections/home-trust-bar.tsx`

Horizontal strip of trust signals from `site-data.ts`. Pill-shaped badges.

---

## UI Components

### Button
**File:** `components/ui/button.tsx`
**Props:** Standard button props + `variant`, `size`, `asChild`

CVA-based polymorphic button. Supports Radix Slot for rendering as child element (Link, etc.).

| Variant | Visual |
|---------|--------|
| `primary` | Blue background, white text, elevated shadow |
| `secondary` | Transparent with border, backdrop blur |
| `ghost` | No background, hover reveals subtle fill |

| Size | Dimensions |
|------|-----------|
| `default` | h-12, px-5 |
| `large` | h-14, px-6 |
| `sm` | h-10, px-4 |

---

### Input
**File:** `components/ui/input.tsx`
**Props:** Standard input HTML attributes

Styled text input. Height h-13, rounded-md, dark background with subtle border. Focus state: brand-primary border + focus ring.

---

### Textarea
**File:** `components/ui/textarea.tsx`
**Props:** Standard textarea HTML attributes

Same styling as Input but multi-line.

---

### Container
**File:** `components/ui/container.tsx`
**Props:** Standard div props

Centered container with `max-w-[1234px]` and responsive padding.

---

### StatusPanel
**File:** `components/ui/status-panel.tsx`
**Props:** `meta`, `title`, `description`, `action?` (ReactNode), `tone`

Status display card for form results, errors, empty states.

| Tone | Border Color |
|------|-------------|
| `default` | line-subtle |
| `success` | brand-accent (green) |
| `error` | error (red) |
| `muted` | line-subtle |

---

### BrandIcon
**File:** `components/ui/brand-icon.tsx`
**Props:** `className`

SVG lightning bolt brand mark. Color controlled via className (typically `text-[var(--color-brand-primary)]`).

---

### SectionHeading
**File:** `components/ui/section-heading.tsx`
**Props:** `eyebrow?`, `title`, `description?`, `action?`, `align`

Reusable section heading with optional eyebrow text, description paragraph, and action button. Supports "split" (heading left, action right) and "left" alignment.

---

### ProjectCard
**File:** `components/ui/project-card.tsx`
**Props:** Case study data + `variant` ("featured" | "grid")

Case study preview card with image, tag, title, summary. Featured variant is larger with more detail.

---

### ServiceCard
**File:** `components/ui/service-card.tsx`
**Props:** Service data

Service offering card with badge, title, and summary text.

---

### Skeletons
**File:** `components/ui/skeletons.tsx`

Loading state components:
- `WorkSkeletonGrid`: Grid of placeholder cards for /work
- `CaseStudySkeleton`: Full-page skeleton for /work/[slug]

Uses `animate-pulse` for shimmer effect.

---

## Motion Components

### Reveal
**File:** `components/motion/reveal.tsx`
**Props:** `children`, `delay?`, `className?`

Framer Motion wrapper that fades in and translates up when element enters viewport. Configurable delay for stagger effects. Respects `prefers-reduced-motion`.

---

## Adding New Components

1. Place in the appropriate subdirectory (`ui/`, `sections/`, `layout/`, `pages/`)
2. Use CSS variable tokens for all colors -- never hardcode hex values
3. Use the `cn()` utility from `lib/utils.ts` for class composition
4. Add TypeScript types in `types/content.ts` if the component uses content data
5. For animated components, use motion tokens from `lib/motion/tokens.ts`
6. Always support `prefers-reduced-motion` for animated elements
7. Prefer server components; only add "use client" when interactivity requires it
