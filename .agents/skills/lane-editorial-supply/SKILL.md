---
name: lane-editorial-supply
description: L12 Editorial supply — draft ingest, review queue, Orbita client runbooks. Load before Wave 16 content supply work.
---

# L12 Editorial supply

## Scope

- `apps/backend/src/lanes/editorial-supply/**` (when implemented)
- `.editorial-orbita/**` runbooks (no secrets)

## Rules

- Read [INTERFACE.md](../../../apps/backend/src/lanes/editorial-supply/INTERFACE.md) first.
- Orbita is an **external client** — do not vendor Orbita platform code into this repo.
- Wave 16 must ship **manual draft path** before Orbita automation.
- Do not block Wave 15 UI work.

## Verify

- Draft → approve → visible on site
- `pnpm --filter @ai-transformation/backend test`
