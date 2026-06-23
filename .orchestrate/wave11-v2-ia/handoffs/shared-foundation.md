<!-- orchestrate handoff
task: shared-foundation
branch: orch/wave11-v2-ia/shared-foundation
agentId: bc-c9c5b55f-8494-46c5-a6ad-ac436032172a
runId: run-335657f3-6b42-41ba-83a1-52a79f3ca1db
resultStatus: finished
finishedAt: 2026-06-23T22:04:15.726Z
-->

## Status
success

## Branch
`orch/wave11-v2-ia/shared-foundation`

## What I did
- Added shared Phase 1 onboarding profile model in `packages/shared/src/onboarding.ts`:
  - `onboardingProfileSchema` (Zod) with `role`, `industry`, optional `projectFocus`
  - exported `OnboardingProfile` type
- Added shared Ask mode model in `packages/shared/src/ask-modes.ts`:
  - `AskMode` union: `'ask' | 'capture' | 'submit' | 'find-help'`
  - site/audience access matrix matching §4:
    - io guest=`[ask]`, io member=`[ask,capture]`
    - org guest=`[ask]`, org member=`[ask,capture,submit,find-help]`
  - per-mode metadata with `label` + `placeholder`
  - helper functions `getAllowedAskModes` and `isAskModeAllowed`
- Added generic rule-based recommendation scorer in `packages/shared/src/recommendation.ts`:
  - pure weighted-score function `scoreRecommendation(signals, weights)`
  - typed signal/weight/result models
- Exported all new shared modules from `packages/shared/src/index.ts`.
- Migrated content IA paths in `packages/content/src/index.ts`:
  - all `CONTENT_REGISTRY` pathnames moved from `/frameworks/*` and `/playbook/*` to `/library/*` (trailing segment preserved)
  - org curated rewrite renamed to knowledge naming:
    - `ORG_KNOWLEDGE_SLUGS`
    - `getOrgKnowledgePages()` now emits `/knowledge/<slug>`
  - renamed resolver parameter usage to `useOrgKnowledgePaths`
  - kept curated payload resolution working with a compatibility fallback that still reads legacy `useOrgLearnPaths` flags when present
- Updated curated type flags in `packages/content/src/curated.ts` to knowledge naming (`useOrgKnowledgePaths`) while retaining optional legacy key for compatibility during migration.

## Measurements
- legacy io route pathnames (`/frameworks|/playbook` in `packages/content/src/index.ts`): 10 → 0
- library route pathnames (`/library/` in `packages/content/src/index.ts`): 0 → 10
- org knowledge route pathnames (`/knowledge/` in `packages/content/src/index.ts`): 0 → 1
- `pnpm --filter @ai-transformation/shared typecheck`: 0 errors == 0 errors
- `pnpm --filter @ai-transformation/content typecheck`: 0 errors == 0 errors

## Verification
type-check-only

## Notes, concerns, deviations, findings, thoughts, feedback
- Kept changes strictly within allowed paths: `packages/shared/**` and `packages/content/**`.
- Did not touch `apps/**`, `data/**`, `docs/**`, or `knowledge-base/**`.
- No backend object model / visibility enforcement work was added (Wave 12 out of scope).
- No UI/interactive bug fix in this scope; no screen recording artifact applicable.
- Workspace initially lacked installed dependencies in this cloud run (`tsc` missing), so I ran `pnpm install` before typechecks. No dependency manifest changes were made.

## Suggested follow-ups
- Update `apps/web-io` and `apps/web-org` consumers to use the new shared exports (`onboardingProfileSchema`, Ask mode config/metadata, recommendation scorer).
- Migrate curated JSON producer/consumer usage from `useOrgLearnPaths` to `useOrgKnowledgePaths` in app-layer code and data pipeline once downstream workers are ready.
- Add focused unit tests for `scoreRecommendation` and content resolver behavior (`/library` + `/knowledge` + legacy flag compatibility).