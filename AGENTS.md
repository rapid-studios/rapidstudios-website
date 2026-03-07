## Skills
### Available skills
- `mobbin-ux-research`: Research UI and product patterns on Mobbin or comparable public references, cluster findings, capture screenshots, and prepare per-decision recommendations for direction boards. Use when starting discovery for a page, flow, dashboard, onboarding sequence, or redesign. (file: `.codex/skills/mobbin-ux-research/SKILL.md`)
- `design-decision-board`: Turn approved research into a visual decision board with 3-4 examples per design choice, one recommendation, and a place for the final human decision. Use after discovery and before locking direction. (file: `.codex/skills/design-decision-board/SKILL.md`)
- `figma-auto-board-builder`: Structure and populate Figma research, decision, look-lock, concept, or style-guide boards from organized inputs. Use when a design phase needs a clean board format in Figma. (file: `.codex/skills/figma-auto-board-builder/SKILL.md`)
- `design-system-generator`: Generate and lock approved design tokens, visual rules, and reusable foundations. Use after the direction is chosen and before prototype or UI generation. (file: `.codex/skills/design-system-generator/SKILL.md`)
- `motion-pattern-library`: Define reusable animation and interaction patterns aligned to approved motion tokens, including reduced-motion guidance. Use when the product needs consistent motion rules or implementation notes. (file: `.codex/skills/motion-pattern-library/SKILL.md`)
- `stitch-prompt-optimizer`: Convert the approved UX spec, look-lock decisions, and token choices into a high-specificity Stitch prompt with explicit constraints. Use before Stitch concept generation. (file: `.codex/skills/stitch-prompt-optimizer/SKILL.md`)
- `stitch-prototype-generator`: Generate 2-3 concept directions from the approved spec, locked tokens, and optimized Stitch prompt, then organize them for review in a concept board. Use during concepting after token lock. (file: `.codex/skills/stitch-prototype-generator/SKILL.md`)
- `codepen-ingest`: Inspect public CodePen references for interactions, motion, and component behavior, then turn them into implementation notes and caveats. Use when sourcing animation or interaction references for implementation. (file: `.codex/skills/codepen-ingest/SKILL.md`)
- `figma-design-analyzer`: Analyze a Figma file or frame through MCP, extract structure, tokens, states, accessibility risks, and implementation notes. Use after a human-reviewed Figma design exists and before code generation or fidelity review. (file: `.codex/skills/figma-design-analyzer/SKILL.md`)
- `ui-builder`: Generate implementation scaffolding from the approved spec, Figma design, style choices, and selected interaction references. Use only after explicit approval of the design direction and implementation target. (file: `.codex/skills/ui-builder/SKILL.md`)
- `style-guide-generator`: Generate a reusable project style guide, token reference, component usage notes, and Figma structure after the core design pipeline is complete. Use to preserve the approved system for future work. (file: `.codex/skills/style-guide-generator/SKILL.md`)
- `design-drift-guard`: Detect and flag deviations from the approved tokens, typography, spacing, colors, components, and motion patterns. Use when reviewing later additions or regressions against the locked design system. (file: `.codex/skills/design-drift-guard/SKILL.md`)
- `ux-figma-code-pipeline`: Orchestrate the end-to-end human-in-the-loop UI pipeline across research, decision boards, token lock, Stitch prototypes, Figma review, implementation, style guide generation, and drift checks. Use as the default coordinator for new design work in this repository whenever the task spans multiple design phases. (file: `.codex/skills/ux-figma-code-pipeline/SKILL.md`)
- `saas-dashboard-layouts`: Recommend reusable SaaS dashboard structures, KPI and table layouts, density models, and wireframe starting points. Use during research or spec work for analytics, admin, ops, or reporting surfaces. (file: `.codex/skills/saas-dashboard-layouts/SKILL.md`)
- `app-onboarding-patterns`: Design onboarding flows with clear step structure, permission timing, personalization choices, motion guidance, and activation criteria. Use during research or spec work for first-run experiences on web, iOS, or Android products. (file: `.codex/skills/app-onboarding-patterns/SKILL.md`)

### Repo workflow
- Use `ux-figma-code-pipeline` as the top-level coordinator for design work in this repo.
- Store all artifacts under `design/`, using the expanded phase folders and the templates in `design/templates/`.
- Pair repo-local skills with the global `figma`, `figma-implement-design`, and `playwright` skills when a phase needs MCP access, Figma automation, or browser automation.

### Usage rules
- Read only the relevant `SKILL.md` first, then load extra files or templates as needed.
- Prefer `ux-figma-code-pipeline` whenever the request spans multiple design phases.
- Stop at each approval gate before moving from research to decision board, from decision board to UX spec, from UX spec to token lock, from token lock to look-lock and Stitch prompt, from concepting to wireframes, from Figma to implementation, and from implementation to style-guide or drift-review work.
