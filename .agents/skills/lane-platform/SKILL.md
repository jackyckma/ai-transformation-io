---
name: lane-platform
description: L1 Platform — combined proxy. Load before editing apps/combined.
---

# L1 — Platform

- INTERFACE: `apps/combined/INTERFACE.md`

## Rules
1. Host routing ONLY here — never in web-io/web-org pages.
2. No business logic in proxy.
3. Zeabur Root Directory = `apps/combined`.

## Verify
`pnpm --filter @ai-transformation/combined build`
