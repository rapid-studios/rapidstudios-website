# Wireframe Outline

- Screen Or Flow: Rapid Studios marketing website v1
- Date: 2026-03-05
- Platform: Web
- Inputs Approved: Phase 1 research, phase 2 design spec, phase 3 design system and motion rules

## Shared Frame Rules

- Header:
  - Sticky, pill-like container with brand on the left, nav in the middle, and primary CTA on the right.
- Grid:
  - Desktop-first wireframes assume a centered max-width content column with generous vertical spacing.
- Motion:
  - Section reveals are subtle and sequential.
  - Hover lift applies only to actionable cards or CTAs.
  - Reduced-motion mode removes translate effects and keeps opacity-only transitions where needed.
- Mobile note:
  - All multi-column sections collapse into a single-column stack with the primary CTA kept above the fold.

## Home

### Layout Outline

```text
+--------------------------------------------------------------------------------------------------+
| Sticky Header                                                                                    |
| [Rapid Studios]                [Work] [Services] [Process] [Contact]             [Start a project] |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Hero                                                                                             |
| [Eyebrow: Product studio + frontend delivery]                                                    |
| [Large headline: Premium marketing surfaces built fast.]                                         |
| [Short support copy: positioning, design, build, launch]                                         |
| [Primary CTA] [Secondary CTA to Work]                                                            |
|                                                              [Visual / proof panel]             |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Trust Bar                                                                                        |
| [Trusted by / outcomes / logo placeholders / proof stats in one horizontal strip]               |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Services                                                                                         |
| [Section heading + short intro]                                                                  |
| [Card 1] [Card 2] [Card 3]                                                                       |
| [Optional Card 4]                                                                                |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Featured Work                                                                                    |
| [Section heading + view all work link]                                                           |
| [Editorial project card: image / title / outcome / tag]                                          |
| [Editorial project card: image / title / outcome / tag]                                          |
| [Optional featured card 3]                                                                       |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Process                                                                                          |
| [Section heading + short intro]                                                                  |
| [01 Research] -> [02 Direction] -> [03 Design] -> [04 Build] -> [05 Launch]                     |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Testimonials                                                                                     |
| [Quote card] [Quote card]                                                                        |
| [Optional third proof item or metric]                                                            |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| CTA Band                                                                                         |
| [Strong closing headline]                                                                        |
| [One-line confidence statement]                                                                  |
| [Primary CTA] [Fallback email / scheduling CTA]                                                  |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Footer                                                                                           |
| [Brand summary] [Nav links] [Email] [Social links]                                               |
+--------------------------------------------------------------------------------------------------+
```

### Regions

- Region: Header
- Purpose: Persistent navigation and conversion path.
- Region: Hero
- Purpose: Immediate positioning and action.
- Region: Trust Bar
- Purpose: Lower perceived risk early.
- Region: Services
- Purpose: Clarify offer in 3 to 4 concise pillars.
- Region: Featured Work
- Purpose: Show proof through curated case studies.
- Region: Process
- Purpose: Make the studio feel structured and predictable.
- Region: Testimonials
- Purpose: Reinforce confidence with short social proof.
- Region: CTA Band
- Purpose: Drive the strongest conversion before footer.

### Key Actions

- Action: Click primary CTA from hero or CTA band.
- Action: Navigate to work details from featured project cards.
- Action: Explore services or process from secondary paths.

### States

- Loading: None on static marketing sections.
- Empty: Trust bar can fall back to text-based proof markers if logo assets are unavailable.
- Error: N/A for the base marketing layout.

### Notes

- Note: Hero visual should stay abstract or editorial, not dashboard-heavy.
- Note: Featured work cards should feel oversized and selective rather than grid-dense.
- Note: CTA rhythm should keep one dominant button style site-wide.

## Work List

### Layout Outline

```text
+--------------------------------------------------------------------------------------------------+
| Sticky Header                                                                                    |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Page Intro                                                                                       |
| [Eyebrow]                                                                                        |
| [H1: Selected work]                                                                              |
| [Short positioning copy]                                                                         |
| [Optional filter chips: Websites / Launches / Frontend / Strategy]                              |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Work Grid                                                                                        |
| [Project Card]                       [Project Card]                                              |
| [Large visual]                       [Large visual]                                              |
| [Title + tag + one-line outcome]     [Title + tag + one-line outcome]                           |
|                                                                                                  |
| [Project Card]                       [Project Card]                                              |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Bottom CTA                                                                                       |
| [Need something similar? Start a project.] [CTA]                                                 |
+--------------------------------------------------------------------------------------------------+
```

### Regions

- Region: Page Intro
- Purpose: Frame the work collection and set expectations.
- Region: Filter Row
- Purpose: Light categorization without turning the page into a product catalog.
- Region: Work Grid
- Purpose: Present projects in an editorial two-column rhythm.
- Region: Bottom CTA
- Purpose: Convert readers after proof consumption.

### Key Actions

- Action: Open a case study from a project card.
- Action: Filter visible work by category or service.
- Action: Jump to contact from bottom CTA.

### States

- Loading: Show 4 skeleton cards with final card dimensions.
- Empty: Show "More work coming soon" with CTA to contact.
- Error: Show compact retry treatment with link back to home or contact.

### Notes

- Note: Keep filters optional and minimal. They should not dominate the page.
- Note: Project cards should privilege the image and outcome line over long description text.

## Case Study Page

### Layout Outline

```text
+--------------------------------------------------------------------------------------------------+
| Sticky Header                                                                                    |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Case Study Hero                                                                                  |
| [Breadcrumb / back to work]                                                                      |
| [Project name]                                                                                   |
| [One-line outcome statement]                                                                     |
| [Meta row: service / timeline / role]                                                            |
|                                                              [Hero image / showcase frame]      |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Overview / Outcome Summary                                                                       |
| [Short summary block]                 [Key metrics / results / proof bullets]                    |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Challenge                                                                                        |
| [Narrative block]                                                                                |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Approach                                                                                         |
| [Strategy / design / build decisions in 2-column content blocks]                                 |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Selected Screens / System Decisions                                                              |
| [Large media block]                                                                              |
| [Caption / rationale]                                                                            |
| [Large media block]                                                                              |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Result                                                                                           |
| [Closing proof statement / reflection / impact]                                                  |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Next CTA                                                                                         |
| [See more work] [Start a project]                                                                |
+--------------------------------------------------------------------------------------------------+
```

### Regions

- Region: Case Study Hero
- Purpose: Set the project context fast and visually.
- Region: Outcome Summary
- Purpose: Make the value explicit before deeper narrative.
- Region: Challenge / Approach
- Purpose: Tell the project story with discipline.
- Region: Selected Screens
- Purpose: Show the actual work and decisions.
- Region: Result
- Purpose: Close on impact.
- Region: Next CTA
- Purpose: Continue into more proof or conversion.

### Key Actions

- Action: Return to work index.
- Action: Continue to contact or the next case study.

### States

- Loading: Skeleton hero, metric blocks, and media placeholders.
- Empty: Show "Case study coming soon" with back-to-work CTA.
- Error: Show compact error state with route back to work list.

### Notes

- Note: Keep copy concise and evidence-led. Avoid long agency-style storytelling.
- Note: Visual sections should alternate density so the page does not feel monotonous.

## Services

### Layout Outline

```text
+--------------------------------------------------------------------------------------------------+
| Sticky Header                                                                                    |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Services Intro                                                                                   |
| [Eyebrow]                                                                                        |
| [H1: What Rapid Studios helps teams ship]                                                        |
| [Short summary copy]                                                                             |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Service Pillar 1                                                                                 |
| [Title + short promise]                 [Deliverables / outcomes / engagement fit]               |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Service Pillar 2                                                                                 |
| [Title + short promise]                 [Deliverables / outcomes / engagement fit]               |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Service Pillar 3                                                                                 |
| [Title + short promise]                 [Deliverables / outcomes / engagement fit]               |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Optional Engagement Framing                                                                      |
| [Sprint] [Website build] [Ongoing partner]                                                       |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| CTA Band                                                                                         |
| [Talk through your project] [Primary CTA]                                                        |
+--------------------------------------------------------------------------------------------------+
```

### Regions

- Region: Intro
- Purpose: Frame the offer in plain language.
- Region: Service Pillars
- Purpose: Explain core capabilities without listing every task.
- Region: Engagement Framing
- Purpose: Give buying clarity without turning the page into pricing.
- Region: CTA Band
- Purpose: Move high-intent visitors to contact.

### Key Actions

- Action: Navigate from service framing to contact.
- Action: Cross-link to work or process for proof and methodology.

### States

- Loading: N/A for static content.
- Empty: If a pillar is not ready, use a simplified placeholder with headline and one-line summary.
- Error: N/A for base layout.

### Notes

- Note: Each service section should alternate visual alignment to keep the page moving.
- Note: Deliverables should be grouped tightly and never feel like a giant feature checklist.

## Process

### Layout Outline

```text
+--------------------------------------------------------------------------------------------------+
| Sticky Header                                                                                    |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Process Intro                                                                                    |
| [Eyebrow]                                                                                        |
| [H1: A fast, structured process]                                                                 |
| [Short summary copy]                                                                             |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Step 01                                                                                          |
| [Research]                            [What happens / what the client gets]                      |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Step 02                                                                                          |
| [Direction]                           [What happens / what the client gets]                      |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Step 03                                                                                          |
| [Design]                              [What happens / what the client gets]                      |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Step 04                                                                                          |
| [Build]                               [What happens / what the client gets]                      |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Step 05                                                                                          |
| [Launch]                              [What happens / what the client gets]                      |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Collaboration Principles / FAQ                                                                   |
| [Communication] [Speed] [Ownership]                                                              |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| CTA Band                                                                                         |
| [Ready to move quickly?] [CTA]                                                                   |
+--------------------------------------------------------------------------------------------------+
```

### Regions

- Region: Intro
- Purpose: Position the process as clear and low-risk.
- Region: Sequential Steps
- Purpose: Make each phase concrete and outcome-oriented.
- Region: Collaboration Principles
- Purpose: Address how working together feels.
- Region: CTA Band
- Purpose: Capture visitors after uncertainty has been reduced.

### Key Actions

- Action: Jump to contact after reading the process.
- Action: Cross-link to services or work for proof.

### States

- Loading: N/A for static content.
- Empty: If a step is not fully written yet, keep the numbered shell and one-line description.
- Error: N/A for base layout.

### Notes

- Note: Numbering should be prominent and steady to support scanning.
- Note: This page can use subtle step reveal motion as the user scrolls.

## Contact

### Layout Outline

```text
+--------------------------------------------------------------------------------------------------+
| Sticky Header                                                                                    |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Contact Hero                                                                                     |
| [H1: Start a project]                                                                            |
| [Short confidence-building copy]                                                                 |
| [Expected response time / what to include]                                                       |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Contact Layout                                                                                   |
| [Short Form Card]                             [Direct Email / optional scheduling card]          |
|                                                                                                |
| Form fields:                                                                                     |
| [Name]                                                                                           |
| [Email]                                                                                          |
| [Company or project type]                                                                        |
| [Project note]                                                                                   |
| [Submit CTA]                                                                                     |
+--------------------------------------------------------------------------------------------------+

+--------------------------------------------------------------------------------------------------+
| Reassurance Strip                                                                                |
| [What happens next] [Typical engagement types] [No-pressure note]                                |
+--------------------------------------------------------------------------------------------------+
```

### Regions

- Region: Contact Hero
- Purpose: Reduce friction and set the tone.
- Region: Form Card
- Purpose: Capture the minimum viable project brief.
- Region: Alternate Path
- Purpose: Support users who prefer email or scheduling.
- Region: Reassurance Strip
- Purpose: Answer the "what happens next" question immediately.

### Key Actions

- Action: Submit inquiry form.
- Action: Use direct email path.
- Action: Click optional scheduling CTA if enabled later.

### States

- Loading: N/A before interaction.
- Empty: Default state is a clean form with no helper clutter.
- Error: Inline field validation plus one form-level fallback message.
- Success: Confirmation panel with response expectation and optional link back to work.
- Submitting: Disabled fields and button loading state.

### Notes

- Note: The page should feel calm and short. Do not bury the form below long intro copy.
- Note: Success state can appear inline rather than in a separate page flow.

## Approval

- Decision: Pending
- Notes: Approve wireframes before any Figma layout expansion or implementation planning.
