---
name: lane-backend-core
description: L2 Backend core — Hono shell, DB, health. Load before editing apps/backend core.
---

# L2 — Backend Core

- INTERFACE: `apps/backend/INTERFACE.md`

## Rules
1. Mount lane routers from `src/lanes/*` — do not implement lane logic in index.ts.
2. Do not import lane internals across lanes.
3. All routes under `/api`.

## Verify
`curl localhost:3001/api/health`
