# Implementation Handoff

- Feature: Rapid Studios marketing website v1 scaffold
- Date: 2026-03-05
- Target stack: Next.js App Router, TypeScript, Tailwind CSS, MDX, Framer Motion
- Related spec: `design/specs/2026-03-05-rapid-studios-design-spec.md`

## Inputs

- Research artifact: `design/research/2026-03-05-rapid-studios-phase-1-mobbin.md`
- Token artifact: `design/tokens/2026-03-05-rapid-studios-design-system.md`
- Figma analysis: `design/analysis/2026-03-05-rapid-studios-figma-analysis.md`

## Proposed File Tree Or Modules

- Path: `app/(marketing)/`
- Responsibility: page routes for home, work, case study, services, process, contact, and pricing.

- Path: `app/api/contact/route.ts`
- Responsibility: placeholder contact endpoint with validation-ready response shape.

- Path: `components/layout/`
- Responsibility: sticky header, mobile navigation, and footer shell.

- Path: `components/sections/`
- Responsibility: homepage sections, page heroes, process blocks, CTA band, and contact form.

- Path: `components/ui/`
- Responsibility: button, input, textarea, cards, status panels, and skeleton states.

- Path: `components/motion/`
- Responsibility: reusable reveal motion wrapper aligned to approved motion tokens.

- Path: `content/case-studies/`
- Responsibility: MDX case-study content with exported metadata for the work index and dynamic routes.

- Path: `content/services/`
- Responsibility: MDX service content with exported metadata for the services page.

- Path: `lib/content/`
- Responsibility: content lookup helpers for case studies and services.

- Path: `lib/seo/`
- Responsibility: page metadata builder for native Next metadata and Open Graph fields.

- Path: `lib/motion/`
- Responsibility: shared motion-token constants for Framer Motion.

- Path: `styles/globals.css`
- Responsibility: approved design tokens, premium surface styles, and reduced-motion behavior.

## UI States

- State: Work loading
- Handling: `app/(marketing)/work/loading.tsx` renders project-card skeletons.

- State: Work empty
- Handling: `app/(marketing)/work/page.tsx` renders a muted status panel when no case studies exist.

- State: Work error
- Handling: `app/(marketing)/work/error.tsx` provides retry and contact fallbacks.

- State: Case study loading
- Handling: `app/(marketing)/work/[slug]/loading.tsx` renders a case-study skeleton layout.

- State: Case study empty
- Handling: `app/(marketing)/work/[slug]/not-found.tsx` renders a "coming soon" state.

- State: Case study error
- Handling: `app/(marketing)/work/[slug]/error.tsx` provides retry and back-to-work actions.

- State: Contact default
- Handling: interactive client form with inline labels and minimal field set.

- State: Contact submitting
- Handling: submit button enters loading state while request is in flight.

- State: Contact success
- Handling: success panel replaces the form with next-step actions.

- State: Contact error
- Handling: inline field errors plus form-level fallback message.

## Motion Mapping

- Pattern: Section reveal
- Token: `motion-slow` with `ease-out` via `components/motion/reveal.tsx`

- Pattern: Hover lift
- Token: `motion-normal` with `ease-standard` via `.interactive-card`

- Pattern: Sticky header condense
- Token: style change on scroll via `components/layout/site-header.tsx`

- Pattern: Reduced motion
- Token: `styles/globals.css` removes non-essential movement under `prefers-reduced-motion`

## Acceptance Checklist

- [x] Approved route structure is present.
- [x] Home page follows the approved section order.
- [x] Work and case-study routes use MDX-backed content.
- [x] Contact flow includes default, submitting, success, and error states.
- [x] Work and case-study routes include loading and error coverage.
- [x] Motion is restrained and reduced-motion aware.
- [x] Native Next metadata, sitemap, and robots handlers are present.
- [x] `npm run lint` passes.
- [x] `npm run build` passes.

## Open Issues

- Issue: The Figma file still lacks the full approved page set and explicit state frames, so the code is aligned to the approved spec plus the current homepage blueprint rather than a complete final design file.

- Issue: Contact submission is a placeholder JSON endpoint. Production delivery still needs Resend, SendGrid, or a scheduling integration.

- Issue: Case-study visuals are gradient placeholders rather than final branded imagery.

- Issue: Pricing stays optional in the primary nav, matching the approved spec, but the page itself is fully scaffolded.

## Review Decision

- Decision: Implemented and verified
- Notes: The scaffold is ready for content refinement, asset replacement, and a follow-up fidelity pass once the Figma page set catches up.
