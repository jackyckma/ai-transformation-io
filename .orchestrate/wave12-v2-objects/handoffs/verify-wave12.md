<!-- orchestrate handoff
task: verify-wave12
branch: `orch/wave12-v2-objects/integrate-wave12` (no commits added; verification was non-destructive, temp probe scripts removed, working tree clean)
agentId: bc-c8d1eeb4-3151-4e25-8708-0f030ee91f74
runId: run-1928fdc9-d038-4df5-ab62-c0359aa743f7
resultStatus: finished
finishedAt: 2026-06-24T11:01:57.567Z
-->

## Verification
unit-test-verified

(Security-critical visibility enforcement was additionally exercised against the **live running backend over real HTTP** — see Execution. I withhold `live-ui-verified` only because the frontend personal-layer flows were validated by build + code/route inspection, not a live browser clickthrough.)

## Target
`integrate-wave12` on branch `orch/wave12-v2-objects/integrate-wave12`

## Branch
`orch/wave12-v2-objects/integrate-wave12` (no commits added; verification was non-destructive, temp probe scripts removed, working tree clean)

## Execution
- `git log --pretty='%h %p'` → merge topology confirmed: `1a660ab` has parents `9ee77e5 5ab8b7a` (web-org merge), `9ee77e5` has parents `bb6c26e fcdf7cb` (web-io merge). Both frontend merges present; full backend + shared + both frontends in tree.
- `pnpm install` → success (better-sqlite3 compiled).
- `pnpm turbo build` → **6/6 tasks pass**. web-io routes include `/insights/assessment`, `/library`, `/settings`, `/ask`, `/progress`; web-org includes `/knowledge`, `/community`, `/moderation`, `/settings`, `/ask`.
- `pnpm --filter @ai-transformation/backend test` → **45 passing (9 files)**. Includes `objects.test.ts` (visibility matrix anon/member/owner/bearer + auto/review moderation + generic queue/transition), `personal.test.ts` (owner-only isolation, comments world-read/author-delete, profile round-trip + capture-as-private), `harvest.test.ts` (`/api/stories` POST/GET/PATCH/moderation still work).
- **Live backend boot (real binary, HTTP on :3017/:3018)** seeding via DB then `fetch`:
  - anon `/api/objects` → `{pubIo,pubOrg}` only (expected) ✓
  - io member → `+memIo`; org member (via `x-forwarded-host`) → `+memOrg`, **NOT memIo** → cross-site members-only isolation confirmed live ✓
  - owner session & owner bearer token `/api/v1/objects` → `+privOwner`, **NOT privOther** ✓
  - `GET /api/objects/{privOwner}`: anon→404, owner→200, bearer→200; io-member `GET privOther`→404 ✓
- Code inspection `apps/backend/src/db/objects.ts`: single `buildVisibilityFilter()` is the only filter; both `getObjectByIdForRequester` and `listObjectsForRequester` route through it. `objects`, `user_publish_preferences`, `user_profiles` tables created; contributions generalized via `runObjectsMigrations` (object_type/type/visibility/object_id columns). `createDerivedArticleFromDiscussion` creates a `knowledge`/`derived_article` object + writes `derivedArticleObjectIds` back-link on source.
- Contract check: `packages/shared/src/index.ts` client routes (`/api/objects*`, `/api/personal/*`, `/api/moderation/*`, `/api/profile`, `/api/contributions*`, `/api/settings/publish-preference`) match backend lane routes exactly. `grep` for direct `fetch('.../api/objects|personal|moderation|...')` in both web apps → **no shadow fetch shapes**; `apps/web-io/lib/bookmarks.ts` uses `getApiClient().bookmarks.*`, web-org `ask-modes.tsx` uses `client.contributions.saveDraft/submit` with `type:'help_request'`.
- `gh pr list` → PR #6 OPEN, `isDraft: true`, title `Wave 12: SITE_DESIGN_v2 Phase 2 object store + visibility + personal layer`.

## Findings
Per integrate-wave12 acceptance criterion:
- [x] Both frontend branches merged with both parents in history; full backend+shared+frontends present: merge graph above (**met**).
- [x] `pnpm turbo build` passes for web-io and web-org: 6/6 tasks (**met**).
- [x] `pnpm --filter backend test` passes (visibility matrix + personal isolation + existing suites): 45/45 (**met**).
- [x] Frontends/backend agree on shared client contract, no divergent wire shapes: shared routes == backend routes, no shadow fetch (**met**).
- [x] `docs/CURRENT_STATUS.md` + `docs/SESSION_HANDOFF.md` updated for Wave 12 shipped / Wave 13 next: both contain explicit Wave 12 shipped + Wave 13 sections (**met**).
- [x] One DRAFT PR opened to main, not merged/ready: PR #6 draft open (**met**).

Planner-level security & feature requirements:
- [x] (a) anonymous → only public: live + unit (**met**).
- [x] (b) member sees own site members-only, not other site: live (x-forwarded-host) + unit (**met**).
- [x] (c) private only to owner (session + bearer), 404 to others: live + unit (**met**).
- [x] (d) personal rows owner-scoped; comments world-read by target, author-only delete: unit/integration via `app.request` (**met**).
- [x] Single visibility filter, every read path routes through it: code-confirmed (**met**).
- [x] Story moderation generalized to lifecycle states; `/api/stories` still works: harvest tests pass (**met**).
- [x] Auto-publish vs review preference; auto-publish never elevates members-only/private to public: test asserts published object keeps `members-only`/`private` visibility; status and visibility are independent fields (**met**).
- [x] Derived-article stub creates knowledge object + discussion back-link: `createDerivedArticleFromDiscussion` (**met**).
- [x] .io My Library + Capture + profile + assessment-under-Insights: `library-browser.tsx`, `capture-note.tsx`, `onboarding-profile.ts`, `/insights/assessment` (**met**).
- [x] .org Knowledge/Community rendering + My Library/articles/comments + `/moderation` + publish-pref Settings + Ask Capture/Submit/Find-Help persistence: pages + `PublishPreferenceForm` + `ask-modes.tsx` contributions API (**met**).

Other findings:
- (low) `captured-notes.ts` keeps a localStorage fallback for logged-out users while using the notes API when signed in — consistent with the members-only personal layer design, not a regression.
- (low) `?site=` query also filters the object list to that site (so `?site=org` returns only org public+members), which is correct list-filter behavior, distinct from the visibility gate; worth noting so the planner doesn't mistake it for cross-site leakage.

## Notes & suggestions
- Node `fetch`/undici strips the forbidden `Host` header, so live cross-site checks must use `x-forwarded-host` (or `?site=`); the backend's `resolveRequestSite` honors `x-forwarded-host` first. My initial live run defaulted everything to `io` until I switched headers — flagged in case future verifiers hit the same artifact.
- Upstream noted `scripts/agent-verify.sh` fails on a pre-existing `@ai-transformation/chat-ui` typecheck (`Cannot find name 'process'`), unrelated to Wave 12. I did not run `agent-verify.sh`; the Wave 12 required checks (build + backend test) all pass. Worth a Wave 13 cleanup task.
- No live browser clickthrough of the frontend personal layer was performed (no dev-server UI session stood up); frontend acceptance is build + static/contract verified. If the planner wants UI-level proof, a follow-up live-UI pass on `/library`, `/settings`, and `/moderation` would close that gap.