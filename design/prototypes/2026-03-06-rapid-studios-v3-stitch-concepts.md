# Rapid Studios V3 Stitch Concepts

Date: 2026-03-06
Phase: Gate 7 - Concept Selection
Project: Rapid Studios
Stitch project: `projects/3365543092341076053`

## Scope

Generate 2-3 concept directions from the approved dark-mode UX structure, token lock, and motion rules.

Approved inputs:
- UX spec: `design/specs/2026-03-06-rapid-studios-v3-ux-structure-spec.md`
- active tokens: `design/tokens/2026-03-06-rapid-studios-v3-dark-token-revision.md`
- motion rules: `design/patterns/2026-03-06-rapid-studios-v3-motion-pattern-library.md`
- Stitch prompt: `design/prototypes/2026-03-06-rapid-studios-v3-stitch-prompt.md`

## Stitch note

Stitch rejected `deviceType = "desktop"` with `Request contains an invalid argument.` The working path was to omit `deviceType`, which produced mobile concept sections. These concepts are valid for visual direction review, but not desktop-ready layout lock.

## Direction A - Balanced dark

Label: `A. Balanced dark`

Intent:
- the closest match to the approved dark homepage direction
- balances editorial tone with clear conversion structure

Screens:
- Hero and proof: `0d413d5f08b044eaa42cfc279870a28a`
- Services, work, process: `c2d6118a663e4d9faeabca6f241b9834`
- Testimonials, CTA: `099e3b88225c44f3b03e366fefd47d18`

Strengths:
- best overall alignment to the approved homepage rhythm
- dark palette and blue accent direction are close to the locked system
- service, work, and process hierarchy are all represented cleanly
- CTA tone stays calm and premium

Concerns:
- mobile output only
- typography defaults to `INTER`, not the approved `Space Grotesk` plus `Manrope` direction
- proof rail uses placeholder logos and metrics
- generated testimonials skew slightly more elegant than practical

## Direction B - Editorial dark

Label: `B. Editorial dark`

Intent:
- push the studio feel harder through typography and negative space
- reduce card noise and let the page feel more gallery-like

Screens:
- Hero and proof: `87a55afc17c940c3a0b547035953cd19`
- Services and work: `d3b0bda4a7de4fb8af9ed550ce196949`
- Testimonials and CTA: `3e6a96b1161a46c3ace479167b676287`

Strengths:
- strongest premium and agency-grade feel
- the quiet treatment of services and work feels less template-like
- whitespace and typography read closest to a product studio

Concerns:
- one section drifted into a light-themed treatment
- the hero introduced `NEWSREADER`, which conflicts with the approved type system
- proof and CTA clarity are weaker than the balanced and proof-led directions
- this path risks feeling too art-directed for a fast-conversion landing page

## Direction C - Proof-led dark

Label: `C. Proof-led dark`

Intent:
- keep the approved dark system, but push trust and conversion signals harder
- make the work and CTA rhythm more explicit

Screens:
- Hero and proof: `578aaab2db7c468faebd104e7617c0d0`
- Services and work: `9fe0370b93f04028bb5aba9748f08df9`
- Testimonials and CTA: `3aaaaba9de664663a62b3e044d7aa80b`

Strengths:
- clearest value communication and CTA hierarchy
- featured work and services get stronger framing
- easiest direction to adapt into pricing and contact flows later
- outcome signals are more readable than the other two directions

Concerns:
- closer to polished SaaS than pure studio editorial
- avatars and stronger metrics can feel generic if we keep placeholders too long
- needs restraint to avoid drifting away from the approved premium calm tone

## Recommendation

Recommended direction: `A. Balanced dark`

Why:
- it stays closest to the approved look-lock and dark token revision
- it gives us a credible homepage direction without forcing either extreme
- it leaves room to borrow selective strengths from the other concepts

Recommended synthesis:
- use `A` as the base
- borrow the whitespace discipline from `B`
- borrow the clearer proof rail and CTA clarity from `C`

## Review link

Concept board source:
- `output/figma-capture/stitch-concepts-board.html`

## Approval

Status: Approved
Selected direction: `C. Proof-led dark`
Selection date: 2026-03-06
Notes:
- keep the stronger proof rail and CTA clarity from `C`
- preserve restraint so the site does not drift into generic SaaS glow
- maintain the approved dark token system and motion rules
- selected source for further concepting: `Google Stitch`
- rejected alternative source: manually built Figma desktop concept
