# L2 — Backend Core INTERFACE

## Purpose
Hono application shell: middleware, route mounting, DB connection, health check.

## Owns
- `apps/backend/src/index.ts`
- `apps/backend/src/middleware/**`
- `apps/backend/src/db/**`

## Provides
- `GET /api/health`
- Mount points for lane routers under `/api/*`

## Consumes
| Lane | Contract |
|------|----------|
| L0 | Shared types/schemas |

## Does NOT own
- Auth, assessment, harvest logic (see lane subdirs)

## Allowed paths
- `apps/backend/**` (coordinate with lane owners for `src/lanes/*`)

## Verification
- `pnpm --filter @ai-transformation/backend typecheck`
- `curl http://localhost:3001/api/health`
