---
name: ux-figma-code-pipeline
description: Orchestrate the end-to-end human-in-the-loop UI pipeline across research, decision boards, token lock, Stitch prototypes, Figma review, implementation, style guide generation, and drift checks. Use as the default coordinator for multi-phase design work in this repository.
---

# UX Figma Code Pipeline

Use this as the default orchestrator for design work in this repo.

## Goal

- Keep every artifact under `design/` using `YYYY-MM-DD-short-topic.md` names.
- Stop at every approval gate before moving forward.
- Pair repo-local skills with the global `figma`, `figma-implement-design`, and `playwright` skills when MCP or browser automation is needed.

## Artifact map

- `design/research/`: discovery reports and screenshots
- `design/patterns/`: reusable layout and motion recommendations
- `design/boards/`: decision boards, look-lock notes, and concept board summaries
- `design/specs/`: approved UX specs
- `design/tokens/`: design system and token definitions
- `design/prototypes/`: Stitch prompts and prototype review notes
- `design/wireframes/`: low-fidelity text or ASCII wireframes
- `design/figma/`: Figma links, review notes, and sign-off
- `design/analysis/`: Figma analysis reports and drift reviews
- `design/interactions/`: CodePen interaction references
- `design/handoff/`: implementation briefs and review notes
- `design/style-guide/`: reusable style guides
- `design/templates/`: starter templates for all of the above

## Required gates

Require explicit approval after each of these:

1. research findings
2. decision board
3. UX structure spec
4. design token lock
5. look-lock board
6. Stitch prompt
7. concept selection
8. wireframes
9. high-fidelity Figma review
10. implementation output
11. style guide and drift review

## Workflow

1. Research
   - Invoke `mobbin-ux-research`.
   - If the work is dashboard-heavy or onboarding-heavy, also invoke `saas-dashboard-layouts` or `app-onboarding-patterns`.
   - Save research under `design/research/` and any reusable pattern notes under `design/patterns/`.
2. Decision board
   - Invoke `design-decision-board`.
   - Use `figma-auto-board-builder` when the board should be structured in Figma.
   - Save notes under `design/boards/`.
3. UX structure spec
   - Draft the spec with `design/templates/design-spec.md`.
   - Save it under `design/specs/`.
4. Design token lock
   - Invoke `design-system-generator`.
   - Invoke `motion-pattern-library` when motion needs extra detail.
   - Save outputs under `design/tokens/`.
5. Look-lock board
   - Use `figma-auto-board-builder` to summarize the approved token choices visually.
   - Save notes under `design/boards/`.
6. Stitch prompt optimization
   - Invoke `stitch-prompt-optimizer`.
   - Save the approved prompt under `design/prototypes/`.
7. Stitch concept generation
   - Invoke `stitch-prototype-generator`.
   - Save concept review notes under `design/prototypes/` or `design/boards/`.
8. Wireframes
   - Draft low-fidelity wireframes with `design/templates/wireframe-outline.md`.
   - Save them under `design/wireframes/`.
9. High-fidelity Figma design
   - Wait for a human-reviewed Figma file.
   - Record file links and review notes under `design/figma/`.
10. Interaction references
   - Invoke `codepen-ingest` for motion or interaction sourcing.
   - Save outputs under `design/interactions/`.
11. Figma analysis
   - Invoke `figma-design-analyzer`.
   - Save the report under `design/analysis/`.
12. UI build
   - Invoke `ui-builder`.
   - Save the implementation brief under `design/handoff/`.
13. Style guide and drift guard
   - Invoke `style-guide-generator` to capture the reusable system.
   - Invoke `design-drift-guard` when reviewing later additions or regressions.
   - Save outputs under `design/style-guide/` and `design/analysis/`.

## Guardrails

- Do not skip approval gates because the path feels obvious.
- Cite sources and assumptions at every phase.
- Do not treat inspiration as permission to copy a product's brand or interaction details verbatim.
- If a required tool or credential is unavailable, stop at the current phase and document the blocker.
