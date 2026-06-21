---
name: lane-web-org
description: L9 Web ORG — ai-transformation.org Harvest Hub UI. Load before editing apps/web-org. For UX/layout or microcopy changes, also load editorial-ui and/or ux-copy.
---

# L9 — Web ORG

- INTERFACE: `apps/web-org/INTERFACE.md`

## Rules
1. UI stays thin — API calls only.
2. Warmer community voice ("we" on apprenticeship). Link to .io for frameworks, don't duplicate.
3. Harvest Hub: stories, prompts, ask — no forum in Phase 1.
4. UX work: load `.agents/skills/editorial-ui/SKILL.md` (visual) and `.agents/skills/ux-copy/SKILL.md` (strings).

## Verify
`pnpm --filter @ai-transformation/web-org build`
