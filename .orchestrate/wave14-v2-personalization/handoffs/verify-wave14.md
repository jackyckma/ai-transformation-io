<!-- orchestrate handoff
task: verify-wave14
branch: `orch/wave14-v2-personalization/integrate-wave14` (no commits added — verifier did not modify target source)
agentId: bc-23990f8a-1468-4858-b86e-1e94a49d94d7
runId: run-db1c82b0-bbfe-4338-a792-7dd9a434fa60
resultStatus: finished
finishedAt: 2026-06-24T17:19:42.917Z
-->

## Verification
unit-test-verified

## Target
`integrate-wave14` on branch `orch/wave14-v2-personalization/integrate-wave14`

## Branch
`orch/wave14-v2-personalization/integrate-wave14` (no commits added — verifier did not modify target source)

## Execution
- `git log --graph` + `git log --pretty='%H %P'` → two merge commits with both parents preserved: merge of `web-org-wave14` (parents `1dd4cd8` backend + `d067cc8` web-org) and `web-io-wave14` (parents `43c8409` + `cfa5c32` web-io). Merge parents preserved in history.
- `pnpm install` → success (8 workspace projects, lockfile up to date).
- `pnpm turbo build` → **6 successful, 6 total** (backend + web-io + web-org + content + shared). web-org route table shows `/community`, `ƒ /community/[id]`, `/for-agents`; web-io built clean.
- `pnpm --filter @ai-transformation/backend test` → **10 files, 49 passed**.
- `vitest run community.test.ts --reporter=verbose` → 4/4 Wave 14 tests pass: "activates phase2 publish pipeline and enforces visibility matrix for session and bearer", "supports phase2 action verbs plus reply/follow/save", "returns deterministic experimental matches with visibility enforcement and session/bearer parity", "persists match feedback and returns real activity summary with anonymous zero fallback".
- `gh pr view 8` → `isDraft:true, state:OPEN, base:main, head:integrate-wave14, mergedAt:null`.
- Code/route inspection of `apps/backend/src/index.ts`, `lanes/community/index.ts`, `lanes/objects/index.ts`, `packages/shared/src/wave14-community.ts`, and both web apps.

## Findings
Per acceptance criterion:
- [x] web-org/web-io branches merged with parents preserved: two merge commits, both impl-branch parents present in `git log --pretty='%H %P'`. (met)
- [x] `pnpm turbo build` passes backend + web-io + web-org: 6/6 tasks successful. (met)
- [x] `pnpm --filter backend test` passes incl. new Phase 2/matcher/activity-summary tests: 49 passed; the 4 named Wave 14 tests exercise create-with-type-fields, submit→published per publish preference, visibility matrix (anonymous/io/org/owner) over session+Bearer, deterministic candidates+reasons, feedback persistence (`getMatchFeedback().verdict==='down'`), and real activity summary with anonymous zero fallback. (met)
- [x] .io `/for-agents` notes Phase 2 active + experimental matching via `/api/v1` Bearer (doc-only): page lists Phase 2 types active and `POST /api/v1/community/match` + `/match/feedback`. (met)
- [x] `docs/CURRENT_STATUS.md` + `docs/SESSION_HANDOFF.md` mark Wave 14 shipped: "Wave 14 (SITE_DESIGN_v2 Phase 4) shipped ✅" plus Phase 2/matcher/personalization bullets. (met)
- [x] One DRAFT PR to main, not merged/ready: PR #8, draft, open, base main. (met)

Planner-level claims:
- [x] Phase 2 types no longer reserved-draft-only: `PHASE2_ACTIVE=true`, `isCommunityTypeActive()` returns true for the 5 types; `getCommunityTypeFields()` validates/merges real fields into metadata on create; test asserts `metadata.reserved` is `undefined` and `metadata.focusArea` persisted; submit yields `status:'published'` with visibility preserved. (met)
- [x] Match is a REAL deterministic matcher mounted on `/api` + `/api/v1`: `scoreMatchCandidate` uses type-compatibility table + tag/skill/keyword overlap → ranked candidates with `reasons[]`, response `experimental:true`, candidate pool via `listVisibleCommunityObjects` (visibility-respecting), `recordMatchRun`/`upsertMatchFeedback` persist; `communityRouter` mounted on both `/api` and `/api/v1`. (met)
- [x] .org UI uses `getApiClient().community.*` / `personalization.getActivitySummary` (no shadow fetch): `community-object-view.tsx` calls `.match`/`.matchFeedback`/`.reply`/`.getWithReplies`; `community-activity-dashboard.tsx` renders real `followedTopics/contributionsCount/interactionsCount/bookmarksCount/recentObjectTypes`; no `fetch(` in `app/community`. (met)
- [x] .io personalization v2: `personal-dashboard.tsx` maps bookmarked pillars → `rankArticles({ bookmarkedPillars })` → `bookmarkAffinity` weighted signal; `insights-cards.tsx` calls `rankInsights({ profile, weakestGap })` for signed-in users (rule-based, assessment session + onboarding profile, no LLM). (met)
- [x] `/for-agents` on both sites documents Phase 2 active + experimental matching. (met)

Other findings (severity-ordered):
- (med) .org Phase 2 *intent* verbs (`apply`, `request_mentor`, `ask_for_intro`) render as Ask-prefill links in `community-object-view.tsx` rather than calling the typed `/community/actions` endpoint, even though the backend fully supports those kinds with type gating (`isActionAllowedForType`). `offer_help`, reply, follow, match, matchFeedback are wired to the real typed client. This is a known, planner-acknowledged deviation (handoff notes it), not a regression — backend action parity is test-covered.
- (low) The Wave 13 `matchStub` no-op still exists on the shared client surface (`index.ts` ~1109/1657) alongside the new real `match`. The UI uses the real `match`; the stub is leftover backward-compat surface, harmless.
- (low) Turbo warns "no output files found" for `content#build` and `shared#build` (outputs key in turbo.json) — cosmetic, builds succeed.

## Notes & suggestions
- I could not run a live browser click-through in this environment (no dev server / headless browser harness invoked), so UI is verified via production build + code-path inspection, not a live DOM/network capture. The backend behavior, however, is exercised end-to-end through the real Hono app (`app.request`) over both session cookie and Bearer in the integration tests — this is the strongest available evidence and it passes. Hence `unit-test-verified` (not `live-ui-verified`).
- Suggested follow-up (future wave, not blocking): promote the .org intent verbs (`apply`/`request_mentor`/`ask_for_intro`) from Ask-prefill to the typed `community.action` client so the human UI reaches full parity with the already-implemented backend `/community/actions` endpoint.
- No source files modified; working tree clean. Did not merge, rebase, or alter the PR.