# Design Spec

- Feature: Rapid Studios marketing website v1
- Date: 2026-03-05
- Platform: Web
- Inputs Approved: Phase 1 Mobbin research, research board, motion reference board

## Users And Goals

- Primary user: Founder, operator, or product lead evaluating Rapid Studios for a website, launch surface, or product-marketing build.
- Primary goal: Convince qualified visitors that Rapid Studios produces premium, high-confidence work and move them toward contact.
- Secondary user: Potential collaborators or future hires assessing taste, capability, and positioning.
- Secondary goal: Quickly understand what Rapid Studios does, how it works, and whether the studio feels credible.

## Positioning

- Working positioning: Rapid Studios is a product studio and frontend delivery partner for teams that want a premium marketing surface, sharper positioning, and fast execution.
- Brand tone: modern, minimal, premium, confident, concise.
- Conversion principle: every page should either build trust or move the visitor toward contact.

## Sitemap

- `/` Home
- `/work` Work index
- `/work/[slug]` Case study template
- `/services` Services
- `/process` Process
- `/contact` Contact
- `/pricing` Pricing (optional in nav, but designed as a complete page)

## Global Layout Map

- Sticky header
  - Purpose: global navigation, brand anchor, primary CTA
- Main content
  - Purpose: page-specific storytelling and conversion
- Footer
  - Purpose: utility nav, contact details, secondary trust and closing brand presence

## Home Page Structure

### 1. Hero

- Purpose: communicate the core value proposition immediately and establish the studio as premium and credible.
- Content goal:
  - one-line positioning statement
  - short support sentence
  - primary CTA
  - optional secondary CTA to work
- Recommended content:
  - eyebrow or short positioning tag
  - large headline
  - concise support copy
  - CTA row

### 2. Trust Bar

- Purpose: reduce perceived risk early.
- Content goal:
  - client logos if available
  - otherwise trusted-by placeholder, outcomes, or category markers

### 3. Services

- Purpose: frame Rapid Studios as strategic and execution-capable without becoming a feature list.
- Content goal:
  - 3 to 5 service pillars
  - short explanation for each
- Recommended pillars:
  - positioning and messaging
  - marketing websites
  - product launch surfaces
  - frontend implementation

### 4. Featured Work

- Purpose: show proof through curated case studies.
- Content goal:
  - 2 to 3 featured projects
  - one-line outcome or impact statement per card
- Constraint:
  - editorial cards, not dense portfolio grids

### 5. Process

- Purpose: make the studio feel reliable and structured.
- Content goal:
  - 3 to 5 steps
  - outcome-oriented descriptions
- Working process:
  - research
  - direction
  - design
  - build
  - launch

### 6. Testimonials

- Purpose: reinforce trust after visitors understand the offer.
- Content goal:
  - 2 to 4 short proof blocks
  - role/company context when available

### 7. CTA Band

- Purpose: create the strongest conversion point before the footer.
- Content goal:
  - one direct call to action
  - one fallback contact path
  - optional short form or booking prompt

### 8. Footer

- Purpose: provide secondary navigation and close with a clear brand signal.
- Content goal:
  - route links
  - contact email
  - optional social links

## Page Specs

### Work

- Purpose: show the portfolio with enough filtering to stay readable, but not at the expense of editorial quality.
- Structure:
  - page intro
  - optional category or service filter
  - project card grid
- Card contents:
  - project title
  - short descriptor
  - category/service tag
  - strong visual container
  - optional impact line

### Case Study Template

- Purpose: turn one project into a focused trust-building narrative.
- Structure:
  - hero
  - overview / outcome summary
  - challenge
  - approach
  - selected screens or system decisions
  - result
  - next CTA
- Tone:
  - concise and evidence-led
  - avoid long agency-case-study filler

### Services

- Purpose: go deeper on how Rapid Studios helps clients.
- Structure:
  - page intro
  - service pillar sections
  - deliverable or engagement framing
  - CTA

### Process

- Purpose: explain how the studio works in a way that lowers uncertainty.
- Structure:
  - page intro
  - sequential process steps
  - optional collaboration principles
  - CTA

### Contact

- Purpose: convert qualified visitors with minimal friction.
- Structure:
  - concise intro
  - short contact form
  - alternate direct email path
  - optional scheduling CTA
- Form fields:
  - name
  - email
  - company or project type
  - brief project note

### Pricing

- Purpose: frame engagement models without making the studio feel commoditized.
- Structure:
  - pricing intro
  - 2 to 3 engagement models
  - custom engagement block
  - FAQ or expectation-setting notes
- Recommended framing:
  - sprint
  - website engagement
  - ongoing partner

## Component Inventory

- `SiteHeader`
  - Responsibility: brand, nav, primary CTA, sticky scroll behavior
- `HeroSection`
  - Responsibility: value proposition, CTA row, premium first impression
- `TrustBar`
  - Responsibility: logos, proof tokens, or trust phrases
- `ServiceCard`
  - Responsibility: concise capability summary
- `FeaturedWorkGrid`
  - Responsibility: curated home-page case study cards
- `ProjectCard`
  - Responsibility: reusable work listing item
- `CaseStudyHero`
  - Responsibility: page-level case study lead block
- `ProcessStep`
  - Responsibility: numbered or ordered process content
- `TestimonialCard`
  - Responsibility: quote plus role/company context
- `CTABand`
  - Responsibility: strong end-of-page conversion
- `ContactForm`
  - Responsibility: short inquiry capture
- `PricingCard`
  - Responsibility: one engagement model with CTA
- `SectionHeading`
  - Responsibility: consistent title plus support-copy pattern
- `Footer`
  - Responsibility: secondary navigation and contact

## States

### Work Listing

- Loading:
  - show skeleton cards matching final project-card proportions
- Empty:
  - show short message plus CTA back to contact or services
- Error:
  - show retry state and fallback CTA

### Case Study

- Loading:
  - show hero and content skeleton blocks
- Empty:
  - show "case study coming soon" with link back to work
- Error:
  - show compact error state with navigation back to work

### Contact Form

- Default:
  - short, calm, readable
- Submitting:
  - button loading state, inputs disabled
- Success:
  - confirmation message with next-step expectation
- Error:
  - inline field errors plus one form-level fallback message

### Interactive States

- Header:
  - default, scrolled, mobile-open
- CTA buttons:
  - default, hover, focus, pressed, disabled
- Cards:
  - default, hover, focus
- Nav links:
  - default, hover, active

## Motion Expectations

### Global

- Motion should be subtle, confident, and directional.
- Respect `prefers-reduced-motion`.
- No bouncy or playful easing.

### Header

- Sticky header should gain blur, shadow, and slightly tighter proportions on scroll.
- Nav interaction should feel crisp and immediate.

### Hero

- Intro content may fade and rise in on load.
- Keep hero motion minimal; the typography should carry the section.

### Trust Bar

- Static by default.
- Optional gentle marquee only if it stays readable and does not feel gimmicky.

### Services

- Service cards may reveal with staggered fades.
- Hover should use light lift, shadow refinement, and border emphasis.

### Featured Work

- Case-study cards should use the strongest hover behavior on the site.
- Hover motion should feel editorial:
  - slight lift
  - shadow deepen
  - image or frame sharpen subtly

### Process

- Step reveals may use a staggered fade.
- Avoid overly animated connectors or timeline effects.

### Testimonials

- Keep motion restrained.
- If carousel behavior exists later, default to manual controls over auto-rotation.

### CTA Band

- CTA emphasis should come from contrast and clarity first, not animation.
- Button hover and focus states must remain sharp and simple.

## Interaction Rules

- Always present one clearly dominant CTA per major section.
- Do not overload navigation with more than one primary action.
- Keep section copy concise and scan-friendly.
- Prioritize readability and spacing over decorative density.
- Treat pricing as optional in global nav if it weakens the brand signal.
- Route transitions, if added later, should not delay content visibility.

## Content Model

- Home hero content
  - headline
  - support copy
  - primary CTA
  - optional secondary CTA
- Service content
  - title
  - description
  - optional deliverable tags
- Work content
  - slug
  - title
  - summary
  - category
  - hero image
  - optional outcome line
- Case study content
  - challenge
  - approach
  - selected visuals
  - result
- Testimonial content
  - quote
  - name
  - role
  - company

## Acceptance Criteria

- [ ] The sitemap covers Home, Work, Case Study, Services, Process, Contact, and Pricing.
- [ ] The homepage section order is Hero, Trust, Services, Featured Work, Process, Testimonials, CTA Band, Footer.
- [ ] Every page has a clear primary conversion path.
- [ ] The work listing and case study template include loading, empty, and error states.
- [ ] The contact flow includes success and error states.
- [ ] Motion expectations are defined for header, hero, services, featured work, process, testimonials, and CTA band.
- [ ] The component hierarchy is specific enough to inform wireframes and future implementation.
- [ ] Pricing is framed as a premium engagement model page rather than a commodity comparison table.

## Open Questions

- Should Pricing be included in the primary nav at launch, or only linked contextually?
- Do we already have real work, logos, and testimonials, or should v1 launch with placeholders and one or two self-authored case studies?
- Is the preferred primary CTA `Start a project`, `Book discovery`, or `Get in touch`?
- Should the Work page support categories from day one, or launch as a single curated list?

## Approval

- Decision:
- Notes:
- Prompt: Approve the design spec?
