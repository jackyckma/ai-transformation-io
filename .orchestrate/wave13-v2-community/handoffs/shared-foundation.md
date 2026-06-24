<!-- orchestrate handoff
task: shared-foundation
branch: orch/wave13-v2-community/shared-foundation
agentId: bc-8e44abdf-cf0d-411a-8c07-128440d716e3
runId: run-294a5d71-71da-49a5-a1a2-a8e22016cbac
resultStatus: finished
finishedAt: 2026-06-24T13:22:46.912Z
-->

## Status
success

## Branch
`orch/wave13-v2-community/shared-foundation`

## What I did
- Added `packages/shared/src/wave13-community.ts` with Wave 13 shared contracts only (no Wave 12 schema duplication), including:
  - Phase 1 + Phase 2 reserved community action taxonomy maps.
  - Helpers `getCommunityActions(type)` and `isCommunityPhase2ReservedType(type)`.
  - Generic community interaction schemas (record/create/list/delete/undo) for `follow | offer_help | join`.
  - Thin reply wrapper schema + converter that reuses existing Wave 12 public comment contract with `{ targetType: 'object' }`.
  - Phase 2 reserved stub schemas: `communityMatchRequestSchema`, `communityMatchResponseSchema`, and `communityReservedTypeResultSchema`.
- Updated `packages/shared/src/index.ts` to:
  - Re-export the new Wave 13 module.
  - Extend `createApiClient` with a new `community` namespace on both session and `v1` (Bearer) clients, with matching method sets:
    - `listByType`, `getWithReplies`, `reply`, `follow`, `unfollow`, `offerHelp`, `join`, `leave`, `listInteractions`, `matchStub`
  - Wired session routes under `/api/community/*` and Bearer parity routes under `/api/v1/community/*`.
- Installed workspace dependencies (`pnpm install`) because `tsc` was missing in the cloud environment, then ran shared typecheck successfully.

## Measurements
(none)

## Verification
type-check-only

## Notes, concerns, deviations, findings, thoughts, feedback
- No files outside `packages/shared/**` were changed.
- No PR was opened (per instruction).
- Branch pushed exactly as requested.
- Cloud environment initially had no `node_modules`; `pnpm --filter @ai-transformation/shared typecheck` failed first due to missing `tsc`, then passed after install.
- Commit on branch: `b2a8357`.

## Suggested follow-ups
- Backend lane: implement `/api/community/*` and `/api/v1/community/*` endpoints to conform to these new shared schemas and method shapes.
- .org UI lane: wire Ask Submit / Find Help and Community interactions to this new unified `community` client namespace (session + Bearer parity contract).
- If future cloud runs should avoid repeating dependency bootstrap, run an Env Setup agent from Cursor Web with prompt:  
  `In this repo, preinstall workspace dependencies for pnpm monorepo agents so packages/shared typecheck can run without manual pnpm install. Verify pnpm install + pnpm --filter @ai-transformation/shared typecheck on startup image and update cloud agent environment config accordingly.`