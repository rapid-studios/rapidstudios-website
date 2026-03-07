# Design Patterns For Rapid Studios Marketing Website

**Platform:** Web  
**Date:** 2026-03-05  
**Goal:** Phase 1 research for a premium, agency-grade marketing site for Rapid Studios  
**Method:** Mobbin site-section research using authenticated Mobbin filters plus screenshot capture

## Notes

- The repo is still empty, so this phase focuses on visual and structural patterns, not implementation constraints.
- Mobbin Sites skews toward SaaS, product, and launch sites more than pure agencies. For Rapid Studios, that is useful: the target feel is "product studio" rather than a traditional agency brochure.
- Screenshots captured during research are stored in `output/playwright/mobbin/.playwright-cli/`:
  - `page-2026-03-05T22-47-28-349Z.png` hero sections
  - `page-2026-03-05T22-48-50-540Z.png` pricing sections
  - `page-2026-03-05T22-50-27-580Z.png` social proof sections
  - `page-2026-03-05T22-53-14-357Z.png` navigation sections
  - `page-2026-03-05T22-56-17-391Z.png` showcase sections

## Sources

### Hero Sections

- Mobbin filter: `Hero`
- Top examples surfaced:
  - Titan
  - Duna
  - Speakeasy
  - Superhuman
  - Structured

### Pricing Sections

- Mobbin filter: `Pricing`
- Top examples surfaced:
  - Dovetail
  - Mercury
  - Titan
  - Claude
  - Humble
  - Square

### Social Proof / Trust

- Mobbin filter: `Social Proof`
- Top examples surfaced:
  - Stripe
  - Mixpanel
  - Sana Labs
  - Apollo
  - Titan
  - Opennote

### Navigation

- Mobbin filter: `Navigation`
- Top examples surfaced:
  - Hex
  - Legend
  - Swap
  - Vizcom
  - Zellerfeld
  - Assembly Coffee

### Showcase / Case Study Modules

- Mobbin filter: `Showcase`
- Top examples surfaced:
  - incident.io
  - Becane
  - Cosmos
  - Shopify Editions
  - Slush

### General Premium SaaS / Product-Studio Signal

- Mobbin discover examples observed on the Sites surface before filtering:
  - Linear
  - GitBook
  - Rox
  - Robot.com
  - Vizcom
  - Sana Labs

## Layout

- Pattern: A strong hero leads almost every premium site, followed quickly by proof, then product or service framing, then richer showcase content.
- Reason: The best sites do not waste the first scroll. They establish legitimacy immediately and move the visitor into trust and examples.
- Notes:
  - Rapid Studios should follow this rhythm:
    1. Hero
    2. Trust bar
    3. Services
    4. Featured work
    5. Process
    6. Testimonials
    7. CTA band
    8. Footer
  - The best showcase sections behave like compressed case studies, not generic galleries.

## Visual Hierarchy

- Pattern: Short, assertive headlines with sparse supporting copy dominate hero sections. Typography and spacing do most of the premium work.
- Reason: Mobbin’s strongest SaaS and launch sites feel confident because they say less, not more.
- Notes:
  - Use one primary value proposition line and one short clarifier.
  - Keep service section copy tight and let composition, whitespace, and visual modules create perceived quality.
  - Favor high-contrast text on soft, layered surfaces rather than noisy imagery.

## Interactions

- Pattern: Motion is restrained and directional. Hover states, reveal transitions, and sticky-header state changes are subtle and controlled.
- Reason: Premium sites feel expensive when motion reinforces hierarchy and state, not when it performs for attention.
- Notes:
  - Use a sticky translucent header that gains blur and stronger border definition on scroll.
  - Apply light hover lift and shadow adjustments to cards and CTAs.
  - Use reveal transitions for sections and showcase items with short durations and non-bouncy easing.
  - For lead capture, the dominant pattern is a short CTA path:
    - primary CTA button
    - optional booking CTA
    - short contact form later on the page
  - Avoid long, multi-field forms on the marketing surface.

## Navigation

- Pattern: Navigation is short, sticky, and CTA-aware. Premium sites keep the number of links low and surface one obvious action.
- Reason: The strongest Mobbin examples prioritize decision-making over exploration.
- Notes:
  - Recommended top-level nav:
    - Work
    - Services
    - Process
    - Contact
  - Optional secondary routes:
    - Pricing
    - About
  - Add one persistent CTA such as `Start a project` or `Book discovery`.

## Pricing Patterns

- Pattern: Pricing sections that feel premium avoid bargain-table aesthetics. They use strong framing, clear differentiation, and often a custom CTA path for larger work.
- Reason: Cheap-feeling pricing usually comes from dense comparison tables and overly promotional copy.
- Notes:
  - For Rapid Studios, pricing should probably be optional and framed as engagement models rather than rigid commodity tiers.
  - If included, use 2-3 offers max:
    - project sprint
    - website engagement
    - ongoing design/dev partner
  - Add a `Custom engagement` CTA rather than forcing every visitor into a fixed tier.

## Contact / Lead Capture Patterns

- Pattern: Lead capture is usually distributed, not isolated. The strongest sites expose contact opportunities in hero, nav CTA, and final CTA band.
- Reason: High-intent visitors should never need to hunt for the next step.
- Notes:
  - Recommended contact pattern:
    - hero CTA
    - sticky nav CTA
    - final CTA band with a short form or booking link
  - Keep the form to 3-4 fields maximum for the marketing site.
  - Offer a direct email path and a scheduling path.

## Testimonials / Trust Bar Patterns

- Pattern: Trust is built through layered proof:
  - logo strip
  - short quote
  - numeric outcomes
  - featured clients or outcomes within case study cards
- Reason: A single proof mechanism is weaker than a stack of lightweight signals.
- Notes:
  - Start with a compact logo or trust strip under the hero.
  - Use testimonials later in the page, once visitors already understand the offer.
  - Pair quotes with role/company context to avoid anonymous fluff.

## Case Study Layout Patterns

- Pattern: The strongest showcase modules feel editorial. They combine a large visual, a concise label, and one clear result or positioning statement.
- Reason: Premium case study presentation is about curation and pacing, not volume.
- Notes:
  - Use 2-3 featured case studies on home.
  - Each card should include:
    - category or service label
    - concise project headline
    - one-sentence impact summary
    - strong visual container
  - Full case study pages should follow:
    - hero
    - challenge
    - approach
    - selected screens or system decisions
    - result / CTA

## Recommended UI Structure

### Home

- Hero with strong positioning statement, short support copy, and one dominant CTA
- Trust bar directly under hero
- Service cards with concise capability framing
- Featured work section with editorial case-study cards
- Process section with 3-5 steps
- Testimonials and outcome proof
- Final CTA band with short lead-capture path

### Work

- Tight filter or category control
- Editorial card grid rather than dense masonry
- Each project card led by a visual and short result statement

### Case Study

- Strong opening hero
- Minimal metadata
- Large visual modules
- Tight narrative pacing
- Final CTA

### Services / Process / Contact

- Services should feel strategic, not like a commodity menu
- Process should communicate confidence and structure without becoming verbose
- Contact should keep one primary CTA path and one fallback path

## Acceptance Criteria

- [ ] The homepage opens with a clear value proposition and one obvious CTA.
- [ ] Navigation stays compact and sticky, with a visible CTA.
- [ ] The visual rhythm alternates between whitespace, proof, and showcase modules instead of stacking generic cards.
- [ ] Services are framed as premium offers, not a laundry list.
- [ ] Featured work reads like curated proof, not a portfolio dump.
- [ ] Pricing, if included, feels premium and consultation-led rather than cheap or transactional.
- [ ] Contact capture is short, direct, and available in more than one place.
- [ ] Motion is subtle, confident, and hierarchy-driven.

## Open Questions

- Is Rapid Studios positioned more as a design studio, a development partner, or a hybrid product studio?
- Do we want to show pricing publicly, or should we frame engagement models without explicit prices?
- Do we have any client logos, testimonials, or named case studies ready for launch?
- Should the visual tone be more restrained and editorial, or slightly more experimental and tech-forward?
- Is there a preferred conversion action:
  - contact form
  - book a call
  - direct email

## Recommendation

The strongest direction for Rapid Studios is:

- product-studio clarity from SaaS leaders
- editorial showcase treatment from premium launch sites
- restrained motion and minimal copy density
- multiple lightweight trust signals instead of one heavy testimonial block

That combination will feel premium, modern, and conversion-oriented without reading like a generic agency template.

## Approval Gate

Approve these UX patterns and sources?
