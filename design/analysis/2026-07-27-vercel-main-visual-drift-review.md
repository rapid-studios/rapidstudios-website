# Design Drift Review

- Topic: Liquid-glass visual update on the CMS-enabled production branch
- Date: 2026-07-27
- Scope: All marketing routes, shared navigation and footer, the managed homepage, the CMS sizzle reel, and Studio authentication/editor surfaces
- Related approved artifacts:
  - `design/handoff/2026-07-27-liquid-glass-marketing-implementation.md`
  - `design/tokens/2026-03-06-rapid-studios-v3-design-system.md`
  - `design/patterns/2026-03-06-rapid-studios-v3-motion-pattern-library.md`

## Findings

| Area | Drift on production `main` | Correction | Status |
| --- | --- | --- | --- |
| Marketing system | Production still used the prior dark-blue visual system while the approved branch used the liquid-glass system. | Ported the approved tokens, wordmark, glass navigation, page compositions, responsive controls, and reduced-motion rules onto current `main`. | Corrected |
| Managed homepage | The approved homepage composition was not connected to the newer managed snapshot and theme projection. | Preserved `getManagedHomepageSnapshot`, managed slot projection, theme CSS, provenance, and the `data-managed-homepage` scope inside the approved composition. | Corrected |
| CMS product story | Production did not show the approved CMS sizzle reel in the homepage/service story. | Added the five-scene CMS reel with accessible scene labels, play/pause control, deterministic reduced-motion fallback, and responsive layouts. | Corrected |
| Pricing visibility | Pricing remained visible as a public navigation concept and CMS copy still promised a proposal with “pricing.” | Removed Pricing from desktop/mobile navigation and the footer; renamed the direct route to Engagements; removed all public price values; changed the CTA to “Book a Discovery Call”; updated the managed slot and deterministic content hash. | Corrected |
| Studio | Studio retained the former flat panel styling after the public visual system changed. | Scoped the liquid gradient, glass panels, specular controls, focus states, 16px mobile inputs, and reduced-motion behavior to `/studio` without changing CMS/API behavior. | Corrected |
| Responsive behavior | The previously reviewed page could render in a fixed-width surface instead of using the viewport. | Verified every marketing route and `/studio` at 390px, 768px, and 1440px with zero horizontal overflow. | Corrected |

## Validation

| Check | Result |
| --- | --- |
| ESLint | Pass |
| TypeScript (`tsc --noEmit`) | Pass |
| CMS pipeline and worker tests | Pass — 29/29 |
| Next.js production build | Pass — all public, Studio, and CMS/API routes generated |
| Browser route matrix | Pass — 11 routes × 3 viewport sizes, all HTTP 200 |
| Pricing navigation and copy | Pass — no header/footer/mobile-menu Pricing links and no public price language |
| CMS reel | Pass — visible on mobile and desktop, pause/play works, reduced-motion scene remains still |
| Heading/overflow smoke checks | Pass — one H1 per audited route and no horizontal overflow |

## Approved Exceptions

The automated visual detector reports two gradient-text warnings. Both are deliberate parts of the approved handoff: the Engagements emphasis treatment and the CMS reel end card. They are retained as reviewed brand treatments rather than treated as unapproved drift.

## Decision

- Outcome: Approved visual system is aligned with the CMS-enabled production architecture and is ready for Vercel preview verification.
- Follow-up owner: Rapid Studios
