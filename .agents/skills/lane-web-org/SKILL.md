---
name: lane-web-org
description: L9 Web ORG — ai-transformation.org community UI. Load before editing apps/web-org. For UX/layout, also load editorial-ui and/or ux-copy.
---

# L9 — Web ORG

- INTERFACE: `apps/web-org/INTERFACE.md`
- **Product/IA (Wave 11+):** `docs/SITE_DESIGN_v2.md` — Knowledge · Community · Ask

## Rules
1. UI stays thin — API calls only.
2. Warmer community voice ("we" on apprenticeship). Link to .io Library for frameworks, don't duplicate.
3. **Until Wave 11 ships:** legacy `/learn`, `/stories` remain — do not extend old IA for new features.
4. UX work: load `.agents/skills/editorial-ui/SKILL.md` and `.agents/skills/ux-copy/SKILL.md`.

## Verify
`pnpm --filter @ai-transformation/web-org build`
