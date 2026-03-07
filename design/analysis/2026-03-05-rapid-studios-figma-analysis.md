# Figma Analysis

- Topic: Rapid Studios marketing site v1 MCP validation
- Date: 2026-03-05
- File: https://www.figma.com/design/Gsg8X78vwMmRM8Gt2aSOfG
- Frames:
  - `Rapid Studios - Marketing Site Blueprint` (`1:2`)
  - Note: the phase 5 target frames `10 Home`, `20 Work`, `30 Case Study`, `40 Services`, `50 Process`, and `60 Contact` were not present in the file at analysis time.
- Platform: Web

## Component Inventory

- Component: `Site Header` (`1:253`)
- Variants: observed `default` only; no separate condensed variant found.

- Component: `Primary CTA Link` (`1:17`, `1:276`, `1:239`)
- Variants: observed filled-pill default only; no hover, focus, or disabled variants found.

- Component: `Secondary CTA Link` (`1:20`, `1:242`, `1:273`)
- Variants: observed outlined-pill default only.

- Component: `Trust Chips` (`1:92`, `1:95`, `1:98`, `1:101`, `1:104`)
- Variants: repeated pattern, but not promoted to a reusable Figma component.

- Component: `Service Card` (`1:117`, `1:128`, `1:139`)
- Variants: repeated default card only.

- Component: `Featured Work Card` (`1:160`, `1:168`)
- Variants: repeated default card only.

- Component: `Process Step Card` (`1:186`, `1:193`, `1:200`)
- Variants: repeated default card only.

- Component: `Testimonial Card` (`1:217`, `1:224`)
- Variants: repeated default card only.

- Component: `CTA Band` (`1:231`)
- Variants: observed single default state only.

- Component: `Footer` (`1:245`)
- Variants: observed single default state only.

- Component: `Status / Form States`
- Variants: not found in the analyzed file.

## Layout Map

- Region: Sticky header shell
- Notes: full-width pill container with brand left, short nav center, and dual CTA cluster right.

- Region: Hero split layout
- Notes: large left editorial message block paired with right-side information cards for route map and homepage rhythm.

- Region: Trust band
- Notes: short intro above one horizontal row of proof chips.

- Region: Services
- Notes: section heading followed by a 3-up card grid with equal-width cards.

- Region: Featured work
- Notes: section heading followed by a 2-up editorial card layout with large media containers.

- Region: Process
- Notes: short heading plus 3-up card row; this is compressed relative to the approved 5-step wireframe.

- Region: Testimonials
- Notes: 2-up quote cards with role context.

- Region: CTA band
- Notes: full-width gradient-backed conversion block with two pill CTAs.

- Region: Footer
- Notes: single-row utility footer with brand left and route list right.

## Token Usage

- Typography:
  - Observed in frame: `Segoe UI` for all text styles.
  - Gap: this does not match the approved phase 3 system of `Space Grotesk` plus `Manrope`.

- Colors:
  - Observed in frame: neutral white and off-white surfaces, low-opacity navy borders, blue primary gradients, and a restrained teal accent wash.
  - Alignment: broadly consistent with the approved palette direction.
  - Gap: no Figma variables were attached to the frame.

- Spacing:
  - Observed in frame: outer shell padding around `28px`, section gaps around `20px` to `28px`, card insets around `24px` to `25px`.
  - Alignment: consistent with the approved wide-spacing direction, though not mapped to named spacing variables.

- Radius And Shadows:
  - Observed in frame: `32px` large shells, `24px` cards, `18px` inner media wells, and `999px` pills.
  - Observed shadows: soft elevation around `0 22px 60px rgba(15,23,42,0.08)`.
  - Alignment: close to the approved radius and shadow system.

- Motion:
  - Observed in frame: no Figma prototype transitions or motion annotations attached to the blueprint frame.
  - Related file context: motion ideas exist on the research board, but not as approved prototype states in the analyzed blueprint.

## State Coverage

- Loading:
  - Not present for work cards, case study content, or route-level placeholders.

- Empty:
  - Not present for work listing, case study, or trust/logo fallback variants.

- Error:
  - Not present for work listing, route errors, or contact flows.

- Interactive:
  - Default CTA appearance is present.
  - Hover, focus, pressed, disabled, and condensed-header states are not present as separate frames or variants.
  - Contact form states are not present because no contact page frame or form component is in the file.

## Accessibility Risks

- Risk:
  - Header navigation appears to be text-sized around `14px` with no visible focus treatment. The eventual implementation will need larger clickable areas and explicit keyboard focus states.

- Risk:
  - Small chip labels and secondary text sit on translucent light surfaces. Contrast should be rechecked once the approved typography system replaces the current placeholder font stack.

- Risk:
  - State coverage is incomplete. Without visible error, success, loading, and focus states, accessibility behavior is under-specified for implementation.

- Risk:
  - The frame uses placeholder media wells without explicit content labeling. When replaced with real visuals, decorative versus informative image intent will need to be specified for alt text.

## Implementation Notes

- Note:
  - This report is based on the existing homepage blueprint frame plus MCP metadata and design context. Confidence is lower than a normal phase 6 review because the dedicated approved page frames were not present.

- Note:
  - Engineering should not treat the current Figma file as a complete page-by-page source of truth for `Work`, `Case Study`, `Services`, `Process`, and `Contact`. Those layouts still need to be created or added to the file.

- Note:
  - The current homepage blueprint is structurally useful for implementation. Its section rhythm aligns well with the approved spec: hero, trust, services, featured work, process, testimonials, CTA, footer.

- Note:
  - Before code generation, update the Figma file to use the approved typography system and attach real Figma variables for color, spacing, radius, and effects. Variable coverage is currently empty.

- Note:
  - Promote repeated patterns into actual Figma components with variants: header, buttons, service cards, project cards, testimonial cards, and status panels.

- Note:
  - Add explicit review frames for missing states: work loading, work empty, work error, case study empty, case study error, contact default, contact focus, contact inline error, contact submitting, and contact success.

- Note:
  - The approved implementation plan can proceed in two ways:
    - Option A: treat this blueprint as the homepage source of truth only, then create the remaining page frames before UI build.
    - Option B: finish the full approved Figma page set first, then rerun phase 6 for a higher-confidence implementation handoff.

## Approval

- Decision: Pending
- Notes: The file is analyzable, but incomplete relative to the approved handoff plan. Full implementation confidence depends on adding the missing page and state frames.
- Prompt: Approve this implementation plan?
