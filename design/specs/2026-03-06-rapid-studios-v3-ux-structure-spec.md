# Design Spec

- Feature: Rapid Studios marketing website v3
- Date: 2026-03-06
- Platform: Web
- Inputs Approved: `design/research/2026-03-06-rapid-studios-v3-phase-1-research.md`, `design/boards/2026-03-06-rapid-studios-v3-decision-board.md`
- Scope model: homepage-first, system-aware

## Users And Goals

- Primary user: founder, operator, or product lead evaluating Rapid Studios for a marketing site, launch surface, or frontend-heavy studio engagement
- Primary goal: quickly understand the quality bar, trust Rapid Studios, and take a clear next step
- Secondary user: collaborator, referral partner, or candidate evaluating the studio's taste and operating style
- Secondary goal: understand what Rapid Studios does, how it works, and what kind of work it is best suited for

## Positioning

- Working positioning: Rapid Studios is a product studio and frontend delivery partner for teams that need a premium web presence, sharper positioning, and fast execution
- Brand tone: modern, minimal, premium, selective, direct
- Conversion principle: every page should either build confidence or move the visitor toward contact

## Approved Direction

- Hero style: oversized editorial hero with short support copy, dual CTA row, and proof-oriented right rail
- Navigation identity: pill-shell sticky header with short nav and visible CTA actions
- Trust model: compact trust strip near the top, with testimonials and deeper proof later in the page
- Featured work treatment: editorial cards with one media well, concise title, and one-line outcome
- Homepage process model: 3-card summary on home, fuller narrative on `/process`
- Offer framing: premium engagement framing with an email-first closing CTA path
- System direction: `Space Grotesk` for display and headings, `Manrope` for body and UI, restrained blue-led light mode, explicit state coverage
- Motion direction: subtle reveal, hover lift, and header condense with reduced-motion fallbacks

## Information Architecture

- `/` Home
- `/work` Work index
- `/work/[slug]` Case study template
- `/services` Services
- `/process` Process
- `/contact` Contact
- `/pricing` Pricing or engagement models page

## Global Structure

- Sticky header
  - Purpose: brand anchor, short navigation, visible CTA path
  - Behavior: default pill shell at load, condensed on scroll

- Main content
  - Purpose: page-specific narrative, proof, and conversion

- Footer
  - Purpose: utility navigation, contact path, brand close

## Homepage Structure

### 1. Hero

- Purpose: establish studio quality and positioning immediately
- Required content:
  - short eyebrow or positioning tag
  - oversized editorial headline
  - short support copy
  - primary CTA
  - secondary CTA to work
  - proof-oriented right rail
- Structural rules:
  - keep the message concise
  - do not turn the hero into a feature list
  - the proof rail should reinforce credibility, not compete with the headline

### 2. Trust Strip

- Purpose: reduce perceived risk immediately after the hero
- Required content:
  - client logos, trusted-by placeholders, or compact proof markers
- Structural rules:
  - stay compact
  - treat this as early reassurance, not a full testimonial section

### 3. Services

- Purpose: explain the studio offer without reading like a service menu
- Required content:
  - 3 service cards on home
  - each card includes a clear title and short supporting line
- Structural rules:
  - cards should stay simple and spacious
  - avoid metrics, dense tags, or mini-dashboard behavior

### 4. Featured Work

- Purpose: prove quality through curated case-study teasers
- Required content:
  - 2 featured case studies on home
  - media well
  - project title
  - one-line outcome or positioning statement
- Structural rules:
  - editorial layout, not dense grid
  - metadata stays minimal

### 5. Process

- Purpose: show confidence and structure without slowing the page
- Required content:
  - 3-step homepage summary
  - each step focuses on outcome, not internal jargon
- Structural rules:
  - keep the homepage version lightweight
  - reserve the fuller narrative for the dedicated process page

### 6. Testimonials

- Purpose: deepen trust after the visitor understands the offer
- Required content:
  - 2 short testimonial blocks
  - role, company, or outcome context when available
- Structural rules:
  - do not let testimonials dominate the page
  - treat them as support for the work and trust strip, not a replacement

### 7. Closing CTA Band

- Purpose: provide the clearest conversion point before the footer
- Required content:
  - one direct CTA
  - secondary path to work or direct email
  - concise framing around how the engagement starts
- Structural rules:
  - keep the CTA band calm and short
  - do not make the homepage ending form-heavy

### 8. Footer

- Purpose: reinforce brand and provide fallback navigation
- Required content:
  - route links
  - contact email
  - optional social links

## Interior Page Structure

### Work Index

- Purpose: show a curated portfolio with clear hierarchy
- Structure:
  - page intro
  - optional simple filter or categorization
  - editorial project grid
- Rules:
  - avoid noisy controls
  - favor curation over density

### Case Study Template

- Purpose: turn one project into a focused trust-building narrative
- Structure:
  - case-study hero
  - overview / outcome summary
  - challenge
  - approach
  - selected screens or decisions
  - result
  - next CTA
- Rules:
  - concise, evidence-led storytelling
  - large visual modules
  - minimal filler copy

### Services

- Purpose: deepen understanding of the offer
- Structure:
  - page intro
  - service pillars
  - engagement framing
  - CTA
- Rules:
  - stay strategic
  - avoid commodity-menu language

### Process

- Purpose: explain how Rapid Studios works in more detail than the homepage allows
- Structure:
  - page intro
  - 5-step process narrative
  - collaboration principles or working model
  - CTA

### Contact

- Purpose: convert qualified visitors with minimal friction
- Structure:
  - concise intro
  - short contact form
  - direct email path
  - optional scheduling path later, not required for this gate
- Rules:
  - keep the path short and clear
  - one dominant CTA, one fallback path

### Pricing / Engagement Models

- Purpose: explain how the work is bought without cheapening the brand
- Structure:
  - intro
  - 2-3 engagement models
  - custom engagement block
  - expectation-setting notes or FAQ
- Rules:
  - frame pricing as engagement logic, not bargain-table tiers
  - this page can remain secondary in navigation emphasis

## Component Hierarchy

- `SiteHeader`
  - brand
  - nav items
  - CTA cluster
  - condensed state

- `HeroSection`
  - eyebrow
  - editorial headline
  - support copy
  - CTA row
  - proof rail

- `TrustStrip`
  - logos or proof markers

- `ServiceCard`
  - title
  - short supporting copy

- `FeaturedWorkGrid`
  - section intro
  - `ProjectCard` items

- `ProjectCard`
  - media well
  - title
  - short result line

- `ProcessRow`
  - 3 summary steps for home

- `ProcessDetailList`
  - 5-step detailed version for `/process`

- `TestimonialCard`
  - quote
  - attribution

- `CTABand`
  - offer framing line
  - primary CTA
  - secondary path

- `ContactForm`
  - short inquiry form

- `PricingCard`
  - engagement model
  - audience / fit
  - CTA

## Required State Coverage

- Work index:
  - loading
  - empty
  - error

- Case study:
  - loading
  - empty / missing
  - error

- Contact:
  - default
  - focus
  - inline validation error
  - submitting
  - success
  - failure

- CTA and navigation:
  - default
  - hover
  - focus
  - condensed header state

## Motion Expectations

- Hero:
  - minimal entrance emphasis only
  - no theatrical intro sequence

- Sections:
  - subtle reveal on enter
  - stagger only when it clarifies order

- Cards and proof modules:
  - hover lift with mild shadow and edge emphasis
  - no aggressive scale jumps

- Header:
  - condense on scroll with blur and stronger border definition

- Reduced motion:
  - preserve clarity and state changes
  - remove translation-heavy or decorative movement

## Acceptance Criteria

- [ ] The homepage structure stays selective and does not gain extra modules beyond the approved rhythm without explicit review.
- [ ] The hero is editorial, short, and supported by a proof rail rather than a feature list.
- [ ] Navigation uses the pill-shell header model with a clear CTA path.
- [ ] Trust is distributed through a compact strip, featured work, and later testimonials.
- [ ] Homepage cards stay simple and spacious.
- [ ] Featured work reads like curated editorial proof, not a dense portfolio grid.
- [ ] The homepage process section stays at 3 steps, while `/process` carries the fuller narrative.
- [ ] Offer framing stays premium and avoids cheap-feeling pricing presentation.
- [ ] Typography, color tone, and state coverage are treated as required system inputs for the next gate.
- [ ] Motion stays subtle, confident, and reduced-motion-aware.

## Open Questions

- Do we want `/pricing` to stay publicly visible in the final nav, or should it remain a secondary route linked from services and CTA surfaces?
- Are real logos, testimonials, and case-study outcomes available for the launch version, or should the next gate design around placeholders?
- Should the proof rail in the hero lean more toward logos, capability markers, or short outcome signals?

## Resolved Notes

- `/pricing`
  - Keep it public, but do not promote it into the primary short header nav.
  - Rationale: this preserves the approved `Work / Services / Process / Contact` shell while still making pricing or engagement models easy to discover from services, CTA surfaces, and the footer.

- Launch content reality
  - Design the next gate around placeholders for logos, testimonials, and case-study outcomes.
  - Rationale: placeholder-aware structure is better than inventing fake proof or overfitting the layout to assets that do not exist yet.

- Hero proof rail recommendation
  - Lean toward short outcome signals, supported by capability markers if needed.
  - Recommended pattern:
    - 2-3 compact proof items
    - each item framed as a client-relevant result or delivery signal
    - optional supporting label underneath if clarity is needed
  - Example directions:
    - `Sharper positioning`
    - `Design + frontend in one pass`
    - `Fast launch-ready delivery`
  - Rationale: logos are weak when they are placeholders, and pure capability markers can feel generic. Outcome-led proof feels more credible and more premium at this stage.

## Approval

- Decision: Pending
- Notes: Gate 3 for the restarted v3 pipeline.
