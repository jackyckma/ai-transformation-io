<!-- orchestrate handoff
task: shared-foundation
branch: orch/wave14-v2-personalization/shared-foundation
agentId: bc-5a101f95-170a-4ada-8fe2-ddad54b4d8b1
runId: run-2694bafe-091c-48e3-ac2f-754ec9a12492
resultStatus: finished
finishedAt: 2026-06-24T16:44:02.177Z
-->

## Status
success

## Branch
`orch/wave14-v2-personalization/shared-foundation`

## What I did
- Added `packages/shared/src/wave14-community.ts` with Wave 14 shared contracts:
  - **Phase 2 active type fields** (optional metadata-style schemas) for:
    - `question`
    - `mentorship_request`
    - `project_request`
    - `collaboration_offer`
    - `apprenticeship_opportunity`
  - Exported `communityPhase2TypeFieldsSchemaMap`, `getCommunityTypeFields(type)`, `PHASE2_ACTIVE`, and `isCommunityTypeActive(type)`.
  - Added **experimental matcher schemas**:
    - `matchCandidateSchema`
    - `matchExperimentRequestSchema`
    - `matchExperimentResponseSchema` (`experimental: true`)
    - `matchFeedbackRequestSchema`
    - `matchFeedbackResponseSchema`
  - Added **personalization v2 activity summary contracts**:
    - `activitySummarySchema`
    - `activitySummaryRequestSchema`
    - `activitySummaryResponseSchema`
- Updated `packages/shared/src/recommendation.ts` additively:
  - Added named signal set with `bookmarkAffinity`.
  - Added `DEFAULT_RECOMMENDATION_WEIGHTS` including `bookmarkAffinity`.
  - Kept `scoreRecommendation` behavior unchanged.
- Updated `packages/shared/src/index.ts`:
  - Imported + re-exported `wave14-community`.
  - Extended **session client** with:
    - `community.match(...)` → `POST /api/community/match`
    - `community.matchFeedback(...)` → `POST /api/community/match/feedback`
    - `personalization.getActivitySummary({ site })` → `GET /api/personal/activity-summary`
  - Extended **v1 Bearer namespace** with identical method shapes and `/api/v1/*` parity:
    - `v1.community.match(...)`
    - `v1.community.matchFeedback(...)`
    - `v1.personalization.getActivitySummary({ site }, options?)`

## Measurements
(none)

## Verification
type-check-only

## Notes, concerns, deviations, findings, thoughts, feedback
- `pnpm --filter @ai-transformation/shared typecheck` passed.
- Workspace initially had no `node_modules`; I ran `pnpm install` before typecheck.
- No files outside `packages/shared/**` were modified.
- I kept Wave 13 reserved/no-op match schemas importable (unchanged in `wave13-community.ts`), and added Wave 14 experimental matcher contracts in the new module.

## Suggested follow-ups
- Migrate backend + web callers to `community.match` / `community.matchFeedback` and `personalization.getActivitySummary` as the Wave 14 primary paths.
- Consider formally deprecating `matchStub` in a later pass once all consumers are switched.
- Env setup follow-up (to reduce repeated bootstrap in cloud agents): run an env setup agent with prompt  
  `Preinstall workspace dependencies so shared lane checks can run immediately; verify pnpm install state and ensure pnpm --filter @ai-transformation/shared typecheck works in fresh cloud sessions without manual dependency bootstrap.`