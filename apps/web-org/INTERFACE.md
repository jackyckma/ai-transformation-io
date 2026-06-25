# L9 — Web ORG INTERFACE

## Purpose
Thin UI for ai-transformation.org. Community · Knowledge commons face.

## Owns
- `apps/web-org/**`

## Provides
- Knowledge commons + community pages per SITE_DESIGN_v2.md IA
- Warmer visual identity than web-io

## Consumes
| Lane | Contract |
|------|----------|
| L0 | API client, types |
| L2–L6 | `/api/*` via `API_BASE_URL` |

## Must NOT
- Import backend src directly
- Duplicate .io function playbooks (link to .io instead)

## Wave
0 (shell), interim (learn hub + editorial), 5 (harvest UI), 6 (curated home)

## Verification
- `pnpm --filter @ai-transformation/web-org build`
