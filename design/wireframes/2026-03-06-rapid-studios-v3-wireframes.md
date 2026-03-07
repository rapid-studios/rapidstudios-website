# Rapid Studios V3 Wireframes

Date: 2026-03-06
Phase: Gate 8 - Wireframes
Direction: `C. Proof-led dark`
Selected concept source: `Google Stitch`
Homepage source reference: `output/figma-capture/stitch-c-homepage.html`

## Purpose

Translate the approved proof-led concept direction into low-fidelity page wireframes that preserve:
- stronger proof and CTA rhythm
- featured work with clearer framing
- restrained dark-mode editorial tone
- simple section density
- the section balance selected from the Google Stitch homepage

## Source lock

Use the selected Google Stitch concept as the homepage composition reference for:
- hero density
- proof rail prominence
- service-card framing
- stronger featured-work blocks
- CTA emphasis at the close

Do not inherit from Stitch:
- its default type choices
- any mobile-first assumptions from the generation metadata
- any bright accent overuse
- any generic testimonial or logo treatments

## Home

Intent:
- communicate value quickly
- establish proof early
- move users toward contact or work review

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header: logo | Work | Services | Process | Contact | CTA                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Hero shell                                                                   │
│ ┌──────────────────────────────┬───────────────────────────────────────────┐ │
│ │ Eyebrow                      │ Proof rail                               │ │
│ │ Large headline               │ - Outcome signal 1                       │ │
│ │ Short supporting paragraph   │ - Outcome signal 2                       │ │
│ │ Primary CTA  Secondary CTA   │ - Outcome signal 3                       │ │
│ └──────────────────────────────┴───────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Trust strip: trusted by / proof markers / placeholder logos                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Services                                                                     │
│ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                       │
│ │ Strategy      │ │ Design        │ │ Engineering   │                       │
│ │ short value   │ │ short value   │ │ short value   │                       │
│ │ learn more    │ │ learn more    │ │ learn more    │                       │
│ └───────────────┘ └───────────────┘ └───────────────┘                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Featured work                                                                │
│ ┌─────────────────────────────┐  ┌─────────────────────────────┐            │
│ │ Case study 1               │  │ Case study 2               │            │
│ │ image / product frame      │  │ image / product frame      │            │
│ │ outcome + short summary    │  │ outcome + short summary    │            │
│ │ view case study            │  │ view case study            │            │
│ └─────────────────────────────┘  └─────────────────────────────┘            │
├──────────────────────────────────────────────────────────────────────────────┤
│ Process                                                                      │
│ Discover ---------------- Build ---------------- Ship                        │
│ short sentence          short sentence          short sentence               │
├──────────────────────────────────────────────────────────────────────────────┤
│ Testimonials                                                                 │
│ ┌───────────────────────┐  ┌───────────────────────┐                        │
│ │ quote                 │  │ quote                 │                        │
│ │ name / role           │  │ name / role           │                        │
│ └───────────────────────┘  └───────────────────────┘                        │
├──────────────────────────────────────────────────────────────────────────────┤
│ CTA band                                                                      │
│ headline | short sentence | primary CTA | secondary CTA                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Footer                                                                        │
└──────────────────────────────────────────────────────────────────────────────┘
```

Notes:
- hero proof rail should prioritize short outcome signals over fake enterprise-logo storytelling
- CTA band can include `Book a discovery call` or `Start a project`
- keep homepage tighter than a long SaaS page
- homepage should track the selected Stitch composition more closely than the rejected Figma concept

## Work List

Intent:
- make the portfolio feel credible and selective
- help users skim by category, outcome, and delivery type

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Intro: Work / selected projects / filter chips                              │
├──────────────────────────────────────────────────────────────────────────────┤
│ Featured project                                                             │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ large visual | outcome line | short summary | view case study          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Project grid                                                                 │
│ ┌─────────────────────┐ ┌─────────────────────┐                             │
│ │ card               │ │ card               │                             │
│ │ category           │ │ category           │                             │
│ │ title              │ │ title              │                             │
│ │ short outcome      │ │ short outcome      │                             │
│ └─────────────────────┘ └─────────────────────┘                             │
├──────────────────────────────────────────────────────────────────────────────┤
│ Empty state: no matching work / clear reset action                          │
├──────────────────────────────────────────────────────────────────────────────┤
│ Footer                                                                       │
└──────────────────────────────────────────────────────────────────────────────┘
```

Notes:
- featured project should borrow the stronger framing from the selected Stitch source
- keep filters lightweight so the page still reads as a studio portfolio, not a product catalog

## Case Study

Intent:
- show outcome, process, and visual craft without becoming an essay

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Case study hero                                                              │
│ title | client/category | outcome summary | year | CTA                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Lead visual                                                                   │
│ wide product frame / mockup / interface crop                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Challenge / approach / result                                                │
│ 3-column summary blocks                                                      │
├──────────────────────────────────────────────────────────────────────────────┤
│ Key screens / artifacts                                                      │
│ stacked media rows with short captions                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Process notes                                                                 │
│ discovery | design | build                                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Next case study / contact CTA                                                │
└──────────────────────────────────────────────────────────────────────────────┘
```

## Services

Intent:
- make the offer feel structured and high-value
- route visitors to contact or pricing

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Intro: what Rapid Studios does and for whom                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ Service stack                                                                │
│ ┌──────────────────────────────────────────────────────────────────────────┐ │
│ │ Strategy: what it includes / outcomes / deliverables / CTA             │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ Design: what it includes / outcomes / deliverables / CTA               │ │
│ ├──────────────────────────────────────────────────────────────────────────┤ │
│ │ Engineering: what it includes / outcomes / deliverables / CTA          │ │
│ └──────────────────────────────────────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Engagement models / optional pricing teaser                                 │
├──────────────────────────────────────────────────────────────────────────────┤
│ FAQ / CTA band                                                               │
└──────────────────────────────────────────────────────────────────────────────┘
```

Notes:
- preserve the low-profile service card language from the homepage before expanding into detailed service rows
- pricing teaser can be visible here even if `/pricing` stays secondary in the primary nav

## Process

Intent:
- make delivery feel reliable, not vague

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Intro: from strategy to shipped interface                                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ Step 1: Discover                                                             │
│ Step 2: Define                                                               │
│ Step 3: Design                                                               │
│ Step 4: Build                                                                │
│ Step 5: Launch                                                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ Working principles / collaboration model / timeline notes                   │
├──────────────────────────────────────────────────────────────────────────────┤
│ CTA band                                                                     │
└──────────────────────────────────────────────────────────────────────────────┘
```

Notes:
- homepage keeps the short 3-step rhythm from Stitch
- dedicated process page expands that into the approved 5-step explanation without changing the visual tone

## Contact

Intent:
- keep the route short, direct, and high-intent

```text
┌──────────────────────────────────────────────────────────────────────────────┐
│ Header                                                                       │
├──────────────────────────────────────────────────────────────────────────────┤
│ Intro: start a project / response expectation                               │
├──────────────────────────────────────────────────────────────────────────────┤
│ Contact split                                                                 │
│ ┌──────────────────────────────┬───────────────────────────────────────────┐ │
│ │ Short proof panel            │ Contact form                              │ │
│ │ - why work together          │ name                                      │ │
│ │ - timeline note              │ email                                     │ │
│ │ - scope note                 │ company                                   │ │
│ │                              │ project summary                           │ │
│ │                              │ budget / timeline select                  │ │
│ │                              │ submit                                    │ │
│ └──────────────────────────────┴───────────────────────────────────────────┘ │
├──────────────────────────────────────────────────────────────────────────────┤
│ Alternate CTA: email link or scheduling link                                │
├──────────────────────────────────────────────────────────────────────────────┤
│ Success state / error state / field validation                              │
└──────────────────────────────────────────────────────────────────────────────┘
```

Notes:
- contact route should feel more direct and less decorative than the homepage
- preserve the stronger CTA clarity selected in direction `C`

## Page extension rules

Use these rules when extending the selected Stitch homepage into the rest of the site:
- interior pages should inherit the same shell language, border contrast, and button treatment
- interior pages can be quieter than home, but not lighter or flatter
- proof should appear near the top of `Work`, `Services`, and `Contact`
- any new card type should look like a sibling of the Stitch homepage cards
- sections should stay spacious, but not drift into empty luxury-brand minimalism

## State coverage

Required states for later high-fidelity work:
- work filters empty state
- contact form validation error state
- contact form submit loading state
- contact form success state
- missing case study fallback
- reduced-motion behavior note for reveal and hover patterns

## Recommendation

Use these wireframes as the structure source for the first high-fidelity Figma pass, but preserve the selected `C` strengths:
- stronger proof line in hero
- more explicit CTA rhythm
- clearer framing around work and service blocks
- the selected Google Stitch homepage as the homepage composition reference

## Approval

Status: Approved
Approval date: 2026-03-06
Notes:
- proceed to high-fidelity Figma
- homepage fidelity target should match the selected Google Stitch render exactly
