# Research Report

- Topic: Rapid Studios marketing site v3 restart cycle
- Date: 2026-03-06
- Platform: Web
- Research board URL: `https://www.figma.com/design/Gsg8X78vwMmRM8Gt2aSOfG?node-id=12-2`
- Audience: founders, operators, and product leads evaluating a premium studio for website, launch, and frontend execution work
- Goal: restart the full UX-to-Figma pipeline from gate 1 with a cleaner, more explicit design direction that can drive a fresh decision board, structure spec, token lock, and later Figma work

## Sources

- Source:
  - Link: `design/research/2026-03-05-rapid-studios-phase-1-mobbin.md`
  - Why it is relevant: contains the strongest authenticated Mobbin reference clusters already gathered for hero, navigation, pricing, social proof, and showcase sections

- Source:
  - Link: `output/figma-capture/assets/hero.png`
  - Why it is relevant: captures the premium hero references that best match the intended product-studio tone

- Source:
  - Link: `output/figma-capture/assets/navigation.png`
  - Why it is relevant: captures compact, CTA-aware navigation patterns that align with the current homepage shell direction

- Source:
  - Link: `output/figma-capture/assets/showcase.png`
  - Why it is relevant: captures the editorial featured-work treatments that should anchor the homepage proof story

- Source:
  - Link: `output/figma-capture/assets/social-proof.png`
  - Why it is relevant: captures light-touch trust and proof modules that feel premium without becoming noisy

- Source:
  - Link: `output/figma-capture/assets/pricing.png`
  - Why it is relevant: captures premium pricing and engagement framing patterns that avoid low-end commodity presentation

- Source:
  - Link: `https://www.figma.com/design/Gsg8X78vwMmRM8Gt2aSOfG?node-id=1-2`
  - Why it is relevant: this homepage blueprint is still the strongest concrete visual source in Figma and should remain a constraint on the next decisions

- Source:
  - Link: `https://www.figma.com/design/Gsg8X78vwMmRM8Gt2aSOfG?node-id=7-2`
  - Why it is relevant: the current decision board shows the design choices already under consideration and helps identify what should be carried forward or intentionally changed in the restart

- Source:
  - Link: `design/analysis/2026-03-05-rapid-studios-figma-analysis.md`
  - Why it is relevant: identifies the missing state, token, and page-coverage gaps that the restart cycle should treat as design problems, not cleanup work

## Pattern Clusters

### Layout

- Evidence:
  - The strongest Mobbin references still follow a fast trust-building rhythm: assertive hero, early proof, compressed offer framing, then richer showcase content.
  - The current homepage blueprint already supports that rhythm without feeling template-heavy.
  - The implemented site also confirms that a selective homepage content model is easier to keep premium than a dense multi-module layout.
- Recommendation:
  - Keep the homepage structure disciplined: hero, trust, services, featured work, process, testimonials, CTA, footer.
  - Treat the homepage as the taste-setting surface and push depth down into `Work`, `Services`, `Process`, and case-study pages.
  - Use the restart cycle to make the homepage sharper, not longer.

### Visual Hierarchy

- Evidence:
  - The Mobbin hero cluster consistently rewards short headlines, restrained support copy, and obvious CTA contrast.
  - The homepage blueprint is strongest when the display typography is oversized and the surrounding cards stay quiet.
  - Earlier iterations drifted whenever cards became too information-dense or too close to SaaS dashboard UI.
- Recommendation:
  - Lock the hierarchy to oversized editorial display type, short support copy, and spacious pale modules with low text density.
  - Keep one dominant CTA per section and avoid decorative surface noise that competes with the headline.
  - Use selective visual emphasis rather than many medium-strength elements.

### Navigation

- Evidence:
  - The navigation cluster still points to short sticky headers, few links, and one or two clear CTAs.
  - The existing Figma blueprint already establishes a strong pill-shell header identity.
  - The implementation and prior analysis show the header still needs clearer state design when condensed, hovered, or focused.
- Recommendation:
  - Keep the short nav: `Work`, `Services`, `Process`, `Contact`.
  - Keep the pill-shell header and dual-CTA treatment, but make the condensed state part of the design system rather than an afterthought.
  - Treat the header as a reusable branded component, not just page chrome.

### States

- Evidence:
  - The previous Figma analysis found weak or missing coverage for loading, empty, error, form success, and focus states.
  - The implemented site already has state handling in code, which means the visual system is behind the product reality.
  - Premium marketing sites still need quiet but intentional state design, especially for forms, portfolio fallbacks, and CTA interaction.
- Recommendation:
  - Promote state coverage into the core design brief for this restart.
  - Require designed states for portfolio loading, portfolio empty, portfolio error, contact default, contact validating, contact error, contact success, and CTA focus.
  - Treat state design as part of perceived polish, not just engineering hygiene.

### Content Model

- Evidence:
  - The strongest references feel curated rather than exhaustive.
  - The current blueprint works best with 3 services, 2 featured work items, 3 process steps on home, and a restrained CTA band.
  - The earlier spec already proved that long lists and heavy metadata reduce the premium feel.
- Recommendation:
  - Keep the homepage tightly curated.
  - Frame Rapid Studios as a product-studio partner, not a service-menu shop.
  - Let detail live in interior pages and case studies instead of overloading the homepage.

## Decision Board Readiness

- Decision area: Hero style
- Example references: Mobbin hero cluster, homepage blueprint node `1:2`
- Recommended option: oversized editorial hero with short support copy, primary CTA, secondary work CTA, and proof-oriented right rail
- Reasoning: this is still the strongest overlap between reference quality and the current Figma reality

- Decision area: Navigation identity
- Example references: Mobbin navigation cluster, homepage blueprint node `1:2`
- Recommended option: pill-shell sticky header with dual CTA cluster and a distinct condensed-on-scroll variant
- Reasoning: it gives the site a recognizable shell while keeping the navigation short and conversion-aware

- Decision area: Showcase style
- Example references: Mobbin showcase cluster, existing home featured-work direction
- Recommended option: editorial featured-work cards with one media well, one line of impact, and minimal metadata
- Reasoning: this keeps proof premium and selective instead of turning the homepage into a portfolio index

- Decision area: Trust model
- Example references: Mobbin social-proof cluster, current trust strip direction
- Recommended option: compact trust strip near the top, with testimonials later in the page and proof distributed across work cards
- Reasoning: layered trust feels stronger than a single heavy testimonial block

- Decision area: Offer framing
- Example references: pricing references plus the approved service-page direction
- Recommended option: premium engagement framing, with public pricing optional and positioned as engagement models rather than commodity tiers
- Reasoning: this protects perceived value while still helping visitors understand how to buy

- Decision area: Typography tone
- Example references: homepage blueprint proportions, prior token lock
- Recommended option: `Space Grotesk` for display and headings, `Manrope` for body and UI copy
- Reasoning: this combination keeps the site sharper and more studio-like than the placeholder sans stack

- Decision area: Color tone
- Example references: current homepage blueprint surfaces and existing design-token intent
- Recommended option: bright neutral canvas, restrained blue primary, muted navy copy, and very light accent surfaces
- Reasoning: this keeps the site premium and calm without becoming generic purple SaaS

- Decision area: Motion style
- Example references: prior motion board, existing motion GIF references, and premium SaaS/studio interaction patterns
- Recommended option: subtle reveal, hover lift, header condense, and low-amplitude CTA feedback with reduced-motion fallbacks
- Reasoning: the site should feel deliberate and expensive, not animated for attention

- Decision area: State priority
- Example references: Figma analysis gaps and implemented UI states in code
- Recommended option: state coverage becomes a required part of the next visual gates
- Reasoning: the biggest polish gap is not layout anymore, it is inconsistent or missing state design

## Recommended Direction

- Summary:
  - Restart the pipeline with a homepage-first but full-system-aware direction.
  - Use the current homepage blueprint as a visual constraint, not as permission to freeze the whole site around one frame.
  - Carry forward the strongest choices from the existing board: editorial hero, short pill-shell navigation, simple cards, curated featured work, restrained motion, and explicit state coverage.
- Why it fits:
  - It keeps the process honest about the one strong visual source already in Figma.
  - It gives the next decision board enough scope to clarify typography, color, motion, trust, and state priorities, not just layout blocks.
  - It preserves speed while raising the quality bar for later token, Figma, and implementation work.

## Risks And Open Questions

- Risk:
  - If the restart cycle expands the homepage too aggressively, the site will lose the selective, agency-grade feel that is currently its strongest quality.

- Risk:
  - Without explicit state design in the next gates, the restart will still produce a polished shell with weaker interaction fidelity.

- Question:
  - Should the restart keep public pricing as a secondary page, or should the new decision board explicitly test a no-pricing public site with offer framing handled only through services and contact?

- Question:
  - Do you want the next decision board to keep the current bright/light tone, or should it intentionally test a slightly more contrast-heavy art direction while staying in light mode?

## Approval

- Decision: Pending
- Notes: Gate 1 for the restarted v3 pipeline. Old March 5 and March 6 artifacts remain preserved and are not treated as approvals for this new cycle.
