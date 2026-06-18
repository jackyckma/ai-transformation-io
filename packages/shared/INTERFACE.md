# L0 — Shared INTERFACE

## Purpose
Cross-lane types, Zod validation schemas, API client, and shared constants. No runtime business logic.

## Owns
- `packages/shared/src/**`

## Provides
- TypeScript types (`HealthResponse`, contribution enums, assessment types)
- Zod schemas for API payloads
- `createApiClient(baseUrl)` for frontends

## Consumes
Nothing upstream.

## Allowed paths
- `packages/shared/**`

## Verification
- `pnpm --filter @ai-transformation/shared typecheck`
- `pnpm --filter @ai-transformation/shared test` (when added)
