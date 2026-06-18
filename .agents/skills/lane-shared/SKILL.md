---
name: lane-shared
description: L0 Shared — types, schemas, API client. Load before editing packages/shared.
---

# L0 — Shared

- INTERFACE: `packages/shared/INTERFACE.md`
- Package: `packages/shared/`

## Rules
1. No business logic — types and validation only.
2. Do not import from apps/*.
3. Export everything from `src/index.ts`.

## Verify
`pnpm --filter @ai-transformation/shared typecheck`
