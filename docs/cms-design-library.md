# CMS design library

This document records the research and product rules behind the selectable design library in Studio. The implementation lives in `lib/cms/design/templates.ts`; this file explains why it is shaped this way.

## Product decision

Studio separates two choices that are often incorrectly bundled together:

1. **Page goal** selects a conversion structure and section recipe.
2. **Visual direction** selects semantic theme tokens and craft guidance.

This keeps nine useful page structures from multiplying into dozens of brittle page-and-color combinations. A template can improve without invalidating every visual direction, and a style kit can evolve without changing a customer's information architecture.

The default UI is a three-step path: choose a goal, choose a visual direction, optionally describe the desired change. Advanced token presets, slot IDs, source recipes, and worker details stay progressively disclosed.

## Initial page-goal templates

| Template | Primary use | Conversion path |
| --- | --- | --- |
| Agency Proof | Creative, product, development, and marketing studios | Outcome → proof → work → services → process → inquiry |
| SaaS Product-Led | Self-serve software and AI tools | Promise → product → benefits → features → trial |
| SaaS Enterprise | Higher-ticket B2B platforms | Outcome → proof → platform → security → consultation |
| Commerce Discovery | Catalog and collection-led stores | Discovery → categories → products → trust |
| Commerce Product Story | Hero products and focused launches | Product/price/action → details → proof → purchase |
| Portfolio Case Study | Independent creative and technical practices | Point of view → selected work → case studies → inquiry |
| Local Service Lead | Local professional and home services | Service/geography → credentials → reviews → call/quote |
| Appointment & Location | Clinics, hospitality, salons, and fitness | Experience → services → policies/location → booking |
| Launch & Waitlist | Products, courses, and events before launch | Promise/date → preview → fit/proof → signup |

Section recipes are opinionated but optional sections remain removable. They never authorize the model to invent missing business facts.

## Initial visual directions

- Clear Professional
- Warm Editorial
- Technical Precision
- Dark Cinematic
- Luxury Minimal
- Friendly Organic
- Playful Modular
- High-Clarity Utility

These describe reusable properties, not imitations of named companies or designers. References must be translated into properties such as “editorial serif with generous whitespace,” never “copy Apple” or “make it exactly like Stripe.”

## Prompt contract

Every model request must provide:

- verified business context and existing page slots;
- primary audience and conversion goal;
- chosen template and style-kit IDs;
- locked structure/content constraints;
- a verified-content-only source policy;
- WCAG 2.2 AA and reduced-motion defaults;
- an explicit JSON output schema.

The model may return only a typed theme or content proposal. It may not return HTML, CSS, JavaScript, shell commands, repository paths, deployment instructions, or a self-declared accessibility pass. The deterministic Guardian revalidates every result, and an owner must approve proposals before application.

Reusable prompt pattern:

> Improve the supplied page for the stated audience and primary action. Follow the selected structure recipe and visual direction. Preserve locked sections and stable slot IDs. Use only provided and verified content. Mark missing facts as unresolved; never invent clients, testimonials, metrics, awards, certifications, prices, locations, or urgency. Return only the requested closed JSON schema. Do not emit code or claim the result passes accessibility.

## Deterministic release gates

- Body-sized text contrast: at least 4.5:1.
- Large text and meaningful non-text controls: at least 3:1.
- Pointer targets: 44×44 CSS px preferred; never below WCAG 2.2 rules.
- Body copy: readable line height and roughly 65–75 characters per line.
- Text must survive 200% enlargement and a 320px CSS viewport.
- Native controls and semantic landmarks precede ARIA workarounds.
- No color-only states, hidden focus, parallax, auto-advancing carousels, novelty cursors, or persistent decorative motion.
- Reduced-motion behavior is required.
- No publish without preview, diff, owner review, rollback point, and audit trail.
- Public production stays Git-backed; the model and Mongo are not runtime dependencies for the marketing site.

## Impeccable integration

The repo-local Impeccable skill adds typography, color, layout, interaction, responsive, motion, UX-writing, and anti-pattern guidance. It is an advisory and detection layer. It cannot bypass the Design Guardian, the repo's human approval gates, or the GitHub PR review required for production.

## Primary research sources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
- [WAI target size guidance](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)
- [WAI page structure tutorial](https://www.w3.org/WAI/tutorials/page-structure/)
- [U.S. Web Design System design principles](https://designsystem.digital.gov/design-principles/)
- [GOV.UK type scale](https://design-system.service.gov.uk/styles/type-scale/)
- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility)
- [Apple layout guidance](https://developer.apple.com/design/human-interface-guidelines/layout)
- [Shopify theme best practices](https://shopify.dev/docs/storefronts/themes/best-practices)
- [Google LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Design Tokens Community Group format](https://www.designtokens.org/TR/2025.10/format/)
- [Material theming and color roles](https://material-web.dev/theming/material-theming/)
- [Web Vitals](https://web.dev/articles/vitals)
- [Impeccable](https://github.com/pbakaus/impeccable)
