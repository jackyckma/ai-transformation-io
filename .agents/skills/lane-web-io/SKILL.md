---
name: lane-web-io
description: L8 Web IO — ai-transformation.io thin UI. Load before editing apps/web-io. For UX/layout or microcopy changes, also load editorial-ui and/or ux-copy.
---

# L8 — Web IO

- INTERFACE: `apps/web-io/INTERFACE.md`

## Rules
1. UI stays thin — fetch from `/api/*` via shared client.
2. No host-based routing. Corporate editorial voice.
3. Home IA: reader paths + curation first; Assessment secondary — see `AGENTS.md`.
4. UX work: load `.agents/skills/editorial-ui/SKILL.md` (visual) and `.agents/skills/ux-copy/SKILL.md` (strings).

## Verify
`pnpm --filter @ai-transformation/web-io build`
