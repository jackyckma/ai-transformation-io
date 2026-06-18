# L8 — Web IO INTERFACE

## Purpose
Thin UI for ai-transformation.io. Fetches from backend API only — no business logic in pages.

## Owns
- `apps/web-io/**`

## Provides
- Corporate site pages per product-architecture.md IA
- Light default + dark mode toggle

## Consumes
| Lane | Contract |
|------|----------|
| L0 | API client, types |
| L2–L6 | `/api/*` via `API_BASE_URL` |
| L7 | MDX content |

## Must NOT
- Import `apps/backend/src/**` directly
- Host-based routing logic

## Wave
0 (shell), 1 (content), 2+ (features)

## Verification
- `pnpm --filter @ai-transformation/web-io build`
