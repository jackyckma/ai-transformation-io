---
name: lane-web-io
description: L8 Web IO — ai-transformation.io thin UI. Load before editing apps/web-io.
---

# L8 — Web IO

- INTERFACE: `apps/web-io/INTERFACE.md`

## Rules
1. UI stays thin — fetch from `/api/*` via shared client.
2. No host-based routing. Corporate editorial voice.
3. Function-primary IA — see docs/product-architecture.md.

## Verify
`pnpm --filter @ai-transformation/web-io build`
