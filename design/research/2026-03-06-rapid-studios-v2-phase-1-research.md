# Research Report

- Topic: Rapid Studios marketing site v2 refinement cycle
- Date: 2026-03-06
- Platform: Web
- Audience: founders, operators, and product leads evaluating a premium studio for marketing-site or launch work
- Goal: restart the updated design pipeline with a homepage-first refinement cycle that uses the current Figma blueprint as the visual north star while closing the state and fidelity gaps found in implementation

## Sources

- Source:
  - Link: `design/research/2026-03-05-rapid-studios-phase-1-mobbin.md`
  - Why it is relevant: contains the original Mobbin pattern clusters for hero, navigation, pricing, social proof, and showcase sections

- Source:
  - Link: `https://www.figma.com/design/Gsg8X78vwMmRM8Gt2aSOfG?node-id=1-2`
  - Why it is relevant: this is the only current approved visual blueprint in Figma, so it defines the strongest concrete layout signal for the homepage

- Source:
  - Link: `design/analysis/2026-03-05-rapid-studios-figma-analysis.md`
  - Why it is relevant: documents the implementation-critical gaps in the current Figma file, especially state coverage, componentization, and missing page frames

- Source:
  - Link: `design/handoff/2026-03-05-rapid-studios-implementation-review.md`
  - Why it is relevant: records what has already been scaffolded in code and where the design source of truth is still incomplete

## Pattern Clusters

### Layout

- Evidence:
  - The Mobbin research recommended an 8-part homepage rhythm: hero, trust, services, featured work, process, testimonials, CTA, footer.
  - The Figma blueprint confirms a concrete homepage split: oversized hero left, structured proof/right rail, then stacked editorial sections below.
  - The current implementation review shows the homepage can already follow this cadence cleanly in code.
- Recommendation:
  - Lock the homepage to the Figma blueprint rhythm as the v2 baseline.
  - Treat this pipeline cycle as homepage-first until the full multi-page Figma set exists.
  - Keep the homepage process band at 3 cards for the homepage, while reserving the full 5-step explanation for the dedicated `/process` page.

### Visual Hierarchy

- Evidence:
  - The strongest Mobbin references leaned on a short assertive hero, clear CTA hierarchy, and selective proof rather than dense feature lists.
  - The current Figma blueprint uses oversized editorial hero type, small support copy, plain section titles, pale media wells, and low-noise surfaces.
  - The Figma analysis noted that typography and token attachments were still incomplete in the file.
- Recommendation:
  - Keep the visual system calm and bright: giant display type, plain section titles, large white surfaces, restrained gradients, and pale image containers.
  - Avoid over-decorating featured work or service cards. The blueprint is strongest when the cards stay simple and spacious.
  - Use the approved `Space Grotesk` and `Manrope` system instead of inheriting the placeholder Figma font stack.

### Navigation

- Evidence:
  - Mobbin findings favored compact sticky headers with one persistent CTA and a short nav.
  - The Figma blueprint uses a pill header with brand left, 4 links center, and 2 compact CTAs right.
  - The Figma analysis flagged missing focus states and a missing condensed variant.
- Recommendation:
  - Keep `Work`, `Services`, `Process`, and `Contact` as the only primary nav items.
  - Preserve the pill shell and condensed-on-scroll behavior as the navigation identity for v2.
  - The next gate must explicitly include default, condensed, hover, and focus treatments for the header and CTA cluster.

### States

- Evidence:
  - The Figma analysis found no explicit loading, empty, error, or contact form state frames in the current file.
  - The implementation already includes route-level loading and error coverage for work, case study, and contact.
  - The updated pipeline now places stronger emphasis on state completeness before implementation output.
- Recommendation:
  - The new pipeline must treat states as first-class design work, not implementation cleanup.
  - The decision board should include a state-inventory lane for:
    - work loading, empty, error
    - case study loading, empty, error
    - contact default, focus, inline error, submitting, success
    - CTA hover and focus

### Content Model

- Evidence:
  - Prior Mobbin research recommended curated proof and short distributed lead capture instead of heavy copy blocks.
  - The Figma blueprint keeps services to 3 homepage cards, featured work to 2 editorial cards, and testimonials to 2 short quotes.
  - The implementation review records that the code already supports this smaller content model well.
- Recommendation:
  - Keep homepage content selective:
    - 1 dominant hero message
    - 1 compact trust strip
    - 3 service cards
    - 2 featured work cards
    - 3 homepage process cards
    - 2 testimonials
    - 1 CTA band
  - Push detail down into dedicated pages rather than bloating the homepage.

### Decision Board Readiness

- Decision area: Hero tone
- Example references: prior Mobbin hero cluster plus Figma blueprint node `1:2`
- Recommended option: oversized editorial headline with short support copy and a 2-button CTA row
- Reasoning: this is the clearest intersection of the approved research direction and the current homepage blueprint

- Decision area: Card fidelity
- Example references: Figma blueprint service cards, featured work cards, and testimonial cards
- Recommended option: simpler cards with pale media wells and low-content density
- Reasoning: the current Figma frame looks strongest when cards stay spacious and not overloaded with metrics or tags

- Decision area: Homepage process density
- Example references: Figma blueprint process row and original 5-step wireframes
- Recommended option: 3-card homepage process, 5-step dedicated process page
- Reasoning: this keeps the homepage fast while preserving the fuller story in the interior page

- Decision area: CTA pattern
- Example references: Figma blueprint CTA band and prior research on short lead-capture patterns
- Recommended option: email-forward CTA band on the homepage with a secondary work link
- Reasoning: it matches the current visual blueprint and keeps the closing conversion path concise

- Decision area: State inventory
- Example references: Figma analysis gaps plus implemented route states in code
- Recommended option: promote state frames into the next visual gate before further high-fidelity work
- Reasoning: this is the biggest practical gap between design and implementation quality right now

## Recommended Direction

- Summary:
  - Run the updated pipeline as a homepage-first refinement cycle.
  - Use the current Figma blueprint as the look reference for layout cadence and card simplicity.
  - Use the approved token system and implemented state coverage as the quality bar the Figma work must catch up to.
- Why it fits:
  - This avoids pretending the full site is visually resolved when only the homepage blueprint exists.
  - It lets the new decision-board step focus on concrete choices: hero tone, card simplification, CTA pattern, and missing states.
  - It keeps the pipeline honest about what is already implemented versus what still needs visual sign-off.

## Risks And Open Questions

- Risk:
  - The updated pipeline references later-stage skills that are not installed in this repo session: `design-decision-board`, `figma-auto-board-builder`, `stitch-prompt-optimizer`, `stitch-prototype-generator`, `codepen-ingest`, `style-guide-generator`, and `design-drift-guard`.

- Risk:
  - The current Figma file still lacks the full multi-page high-fidelity frame set, so the pipeline will remain homepage-first until those pages exist.

- Question:
  - Should v2 remain homepage-first through the decision-board and token-lock steps, or do you want the next board to explicitly cover all core routes even before those Figma frames exist?

- Question:
  - Do you want later blocked stages handled manually with the repo templates, or should we pause when we reach the first missing automation skill?

## Approval

- Decision: Pending
- Notes: Gate 1 for the updated March 6 pipeline.
