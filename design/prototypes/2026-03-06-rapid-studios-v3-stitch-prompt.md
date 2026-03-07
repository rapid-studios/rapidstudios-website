# Stitch Prompt

- Topic: Rapid Studios v3 dark-mode homepage-first concept prompt
- Date: 2026-03-06
- Platform: Web
- Related spec: `design/specs/2026-03-06-rapid-studios-v3-ux-structure-spec.md`
- Locked token artifact: `design/tokens/2026-03-06-rapid-studios-v3-dark-token-revision.md`
- Look-lock board: `design/boards/2026-03-06-rapid-studios-v3-look-lock-comparison-board.md`

## Direction Summary

- Summary:
  - Generate a homepage-first marketing concept for Rapid Studios using the approved dark-mode visual lock.
  - The site should feel cinematic, premium, restrained, and studio-grade.
  - The concept must preserve the approved UX structure and component language instead of inventing a conflicting style.

## Final Prompt

```text
Design a premium dark-mode marketing website concept for “Rapid Studios,” a product studio and frontend delivery partner for teams that need a sharper web presence and fast execution.

Create a homepage-first concept that feels cinematic, premium, modern, and highly intentional. It should look more like a product studio with editorial restraint than a generic SaaS landing page.

Use this exact structural direction:
- sticky pill-shell header
- oversized editorial hero
- compact trust strip
- 3 simple services cards
- 2 featured work cards
- 3-step homepage process row
- 2 short testimonial blocks
- calm closing CTA band

Hero requirements:
- giant headline with strong contrast
- short support copy
- primary CTA + secondary work CTA
- right-side proof rail using short outcome signals, not fake logos

Visual system:
- dark mode default
- charcoal base, not pure black
- layered dark surfaces with soft borders
- crisp blue primary accent
- mint accent used sparingly
- Space Grotesk style display personality
- Manrope style body/UI rhythm
- large whitespace and selective density
- editorial cards with minimal metadata

Color feel:
- background around #0B1020
- primary surfaces around #121A2B
- elevated surfaces around #182235
- primary text around #F3F7FF
- muted text around #A7B3C8
- primary accent around #5A8DFF
- secondary accent around #3ED7C4

Component language:
- pill-shell header with short nav: Work, Services, Process, Contact
- buttons should feel premium and crisp, not glossy
- project cards should use one media well, one strong title, and one short outcome line
- service cards should stay calm and structural, not feature-dense
- CTA band should frame the engagement clearly without a heavy form

Motion posture to reflect visually:
- subtle reveal
- hover lift
- header condense
- low-amplitude interaction feel
- reduced-motion-aware behavior

State posture to reflect visually:
- loading, empty, success, and error states should feel calm and designed
- focus should be crisp and accessible
- no bright glows or aggressive alert styling

Content posture:
- keep copy concise
- use placeholder content where needed
- do not invent fake client logos or fake quantified proof

The result should feel:
- premium
- darker and more cinematic than the original light proposal
- still restrained and trustworthy
- clearly custom, not template-driven

Avoid:
- generic blue-on-black SaaS glow
- purple gradients
- pure black backgrounds
- dense dashboard-like cards
- glossy 3D effects
- noisy mesh gradients
- excessive blur or bloom
- bouncy motion cues
- overbuilt pricing-table aesthetics
```

## Constraints

- Constraint:
  - Respect the approved homepage order and do not add extra homepage modules without a strong reason.

- Constraint:
  - Keep the nav shell, CTA model, editorial hero, and curated proof treatment intact.

- Constraint:
  - Treat the dark choice as an atmosphere change, not a new structural direction.

- Constraint:
  - Keep the concept selective and premium rather than content-heavy.

- Constraint:
  - Use placeholders for logos, testimonials, and project outcomes instead of inventing false client proof.

## Avoid List

- Avoid:
  - pure black canvases

- Avoid:
  - oversized glow around buttons or cards

- Avoid:
  - neon cyan/blue gradients

- Avoid:
  - purple-led palette drift

- Avoid:
  - product-dashboard density

- Avoid:
  - auto-generated agency-template tropes like giant icon stacks or repetitive three-column filler

- Avoid:
  - motion-heavy visual styling that implies bounce, parallax, or theatrical transitions

## Approval

- Decision: Pending
- Notes: Gate 6 prompt for the restarted v3 pipeline, updated to the approved dark look-lock direction.
