---
name: lane-web-io
description: L8 Web IO — ai-transformation.io thin UI. Load before editing apps/web-io. For UX/layout or microcopy changes, also load editorial-ui and/or ux-copy.
---

# L8 — Web IO

- INTERFACE: `apps/web-io/INTERFACE.md`
- **Product/IA (Wave 11+):** `docs/SITE_DESIGN_v2.md` — Library · Insights · Ask

## Rules
1. UI stays thin — fetch from `/api/*` via shared client.
2. No host-based routing. Corporate editorial voice.
3. **Until Wave 11 ships:** legacy routes (`/frameworks`, etc.) still live — do not extend old IA for new features.
4. UX work: load `.agents/skills/editorial-ui/SKILL.md` and `.agents/skills/ux-copy/SKILL.md`.

## Verify
`pnpm --filter @ai-transformation/web-io build`
