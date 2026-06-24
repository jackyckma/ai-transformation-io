<!-- orchestrate handoff
task: backend-community
branch: orch/wave13-v2-community/backend-community
agentId: bc-df762d07-f8ea-4fa2-afca-e58e91018ef9
runId: run-99c6e545-96b4-41e2-8382-499a2abe3537
resultStatus: finished
finishedAt: 2026-06-24T13:29:47.143Z
-->

## Status
success

## Branch
`orch/wave13-v2-community/backend-community`

## What I did
- Added a new Wave 13 community DB lane:
  - **`apps/backend/src/db/community.ts`** (new)
    - Added idempotent/additive migrations for:
      - `community_follows` (one row per `user_id + object_id`)
      - `community_interactions` (`offer_help` / `join`, idempotent by `user_id + object_id + kind`)
    - Implemented follow/interactions CRUD helpers and paginated list helpers.
- Wired community migrations into backend startup:
  - **`apps/backend/src/db/index.ts`**
    - Added `runCommunityMigrations(db)` to migration flow.
- Implemented new community router with session/Bearer parity:
  - **`apps/backend/src/lanes/community/index.ts`** (new)
    - Added endpoints matching shared contract on both `/api/community/*` and `/api/v1/community/*`:
      - `GET /community/objects` (`listByType`, visibility via `listObjectsForRequester` + `toVisibilityContext`)
      - `GET /community/objects/:id/replies` (`getWithReplies`, with public comment replies)
      - `POST /community/replies` (public comment on object)
      - `POST/DELETE /community/follows`
      - `POST /community/offers`
      - `POST/DELETE /community/joins`
      - `GET /community/interactions`
      - `POST /community/match` (Phase 2 reserved no-op stub response)
- Ensured app mounts community router on both session and Bearer namespaces:
  - **`apps/backend/src/index.ts`**
    - `app.route('/api', communityRouter)`
    - `app.route('/api/v1', communityRouter)`
- Reused requester/bearer-owner visibility/auth helpers from objects lane and added reserved-type flagging:
  - **`apps/backend/src/lanes/objects/index.ts`**
    - Exported `resolveRequester`, `toVisibilityContext`, `requireResolvedUser`, `requireAuthenticated`, `getValidationErrorMessage` for reuse.
    - Added Phase 2 reserved handling on object/contribution create/draft paths:
      - Force reserved community types to draft status on create/draft writes.
      - Store reserved marker metadata (`reserved`, `reservedPhase`, `reservedType`).
- Added targeted Wave 13 backend tests:
  - **`apps/backend/src/lanes/community/community.test.ts`** (new)
    - Visibility matrix coverage for `listByType` and `getWithReplies` across:
      - anonymous, io-member, org-member, owner, bearer-owner
    - Phase 1 action happy paths + idempotence (`reply`, `follow/unfollow`, `offer_help`, `join/leave`)
    - Bearer parity coverage for:
      - help_request contribution create+submit
      - community follow action
    - Phase 2 reserved handling coverage:
      - accepted-but-flagged draft behavior
      - match stub reserved response

## Measurements
- `pnpm --filter @ai-transformation/backend test: 45 passing → 49 passing`
- `pnpm --filter @ai-transformation/backend typecheck errors: 0 == 0`

## Verification
unit-test-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- Implemented community read visibility strictly via existing Wave 12 visibility path (`listObjectsForRequester` / `getObjectByIdForRequester` + `toVisibilityContext`), so no second visibility logic was introduced.
- Bearer-owner mapping uses existing `resolveRequester` path (`verifyWriteToken` + `getUserByEmail`) and is shared by both `/api` and `/api/v1` handlers.
- Reserved Phase 2 behavior is currently implemented as **accepted + flagged draft writes** and **no-op match stub** (no matching engine logic).
- Ran `pnpm install` because workspace had no `node_modules`.
- No UI/interactive bug scope in this backend task; no screen recording artifact applicable.

## Suggested follow-ups
- Add one more backend test for Bearer parity on `POST /api/v1/community/replies` to mirror session reply coverage.
- Add an explicit contract test asserting response schema compatibility for all `/community/*` endpoints against `@ai-transformation/shared` parsers in one place.
- Consider running an Env Setup agent so future cloud runs don’t need manual dependency bootstrap. Suggested prompt:
  - `Preinstall pnpm workspace dependencies for this monorepo cloud environment and verify pnpm install + pnpm --filter @ai-transformation/backend test + pnpm --filter @ai-transformation/backend typecheck succeed on startup image.`