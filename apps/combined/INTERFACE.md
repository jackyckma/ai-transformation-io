# L1 — Platform (Combined) INTERFACE

## Purpose
Zeabur entry point. Host-based reverse proxy only — no business logic.

## Owns
- `apps/combined/**`

## Provides
- Single `PORT` listener routing to web-io, web-org, backend
- Process supervisor spawning child apps

## Consumes
| Lane | Contract |
|------|----------|
| L8 | `http://127.0.0.1:3002` |
| L9 | `http://127.0.0.1:3003` |
| L2 | `API_BASE_URL` default `http://127.0.0.1:3001` |

## Env
- `PORT`, `SITE_IO_HOST`, `SITE_ORG_HOST`, `API_BASE_URL`

## Allowed paths
- `apps/combined/**`

## Verification
- `pnpm --filter @ai-transformation/combined build`
- Manual: curl both Host headers + `/api/health`
