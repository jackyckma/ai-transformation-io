<!-- orchestrate handoff
task: web-io-personal
branch: `orch/wave12-v2-objects/web-io-personal` (work committed on local `cursor/wave12-web-io-personal-b9a1`, pushed to the orchestrator branch ref)
agentId: bc-91c212f5-be84-42fa-b1bc-9467639bb9a1
runId: run-ff6921fc-0e60-4c0c-afa0-d7b993e56465
resultStatus: finished
finishedAt: 2026-06-24T10:44:19.628Z
-->

Pushed to `orch/wave12-v2-objects/web-io-personal`. Per branch discipline I'm not opening a PR (the planner owns integration). All work is complete and verified.

## Status
success

## Branch
`orch/wave12-v2-objects/web-io-personal` (work committed on local `cursor/wave12-web-io-personal-b9a1`, pushed to the orchestrator branch ref)

## What I did
Wired the ai-transformation.io Wave 12 personal layer + assessment-under-Insights in `apps/web-io`, consuming the shared-foundation `@ai-transformation/shared` object/personal/profile schemas and `createApiClient` methods. All fetches are SSR-safe and degrade gracefully when the parallel backend is unreachable (build never depends on it).

- `lib/api-client.ts` (new): browser-only `getApiClient()` built from `resolveClientApiUrl('/')` — the shared session client used by all personal-layer hooks.
- `lib/recently-viewed.ts`: `useRecentlyViewed()` reads from the recently-viewed API for signed-in users (local-cache fallback on failure); `useRecordRecentlyViewed()` writes API + local cache. `ArticleViewTracker` now uses it.
- `lib/captured-notes.ts`: `useCapturedNotes()` reads/writes the notes API (`isCapture: true`, `captureSource: 'ask_capture'`, always private per §4) when signed in; localStorage fallback otherwise. Capture context stored in note `metadata.context`.
- `lib/onboarding-profile.ts`: `useOnboardingProfile()` loads/saves role/industry/projectFocus via the profile API for signed-in users, localStorage when logged out; local copy kept in sync so the scorer always has an input.
- `lib/bookmarks.ts` (new) + `components/save-to-context.tsx` (new): a shared `useSyncExternalStore` bookmarks store (one auth + bookmarks fetch shared across all buttons) and a members-only "Save to my context" toggle, wired onto Library list items (`library_article` target) and Insights cards (`object` target). Logged-out renders nothing (button hidden).
- `components/library-browser.tsx`: `My library` tab now lists real bookmarks + recently-viewed + private notes from the API for signed-in users.
- `lib/recommendations.ts` + `lib/assessment-gaps.ts` (new) + `components/personal-dashboard.tsx`: added a `gapBoost` signal; the logged-in Home fetches the completed assessment's weakest gap and boosts matching library articles (§9 input 2). Onboarding profile already feeds the scorer.
- Copy updates in `capture-note.tsx` and `settings/page.tsx` to reflect account sync. Assessment already lives under `/insights/assessment` (Wave 11); ribbon labels/routes unchanged; `data/curated/io-*.json` already point at `/insights/assessment`, so no curated edits were needed.

## Measurements
- `pnpm --filter @ai-transformation/web-io typecheck`: pass → pass
- `pnpm --filter @ai-transformation/web-io build`: 23/23 static routes prerendered (no backend reachable) → pass
- web-io files changed: 10 modified, 4 added (all under `apps/web-io/**`)

## Verification
type-check-only

Logged-out flows are live-verified against the production build with no backend: all routes (`/`, `/insights`, `/insights/assessment`, `/library`, `/ask`, `/settings`, `/progress`) return 200, the assessment is reachable under Insights, and Save-to-context is correctly client-gated (absent from SSR HTML when logged out) — confirming SSR-safety and graceful degradation. Signed-in API read/write paths (bookmarks/notes/profile/recently-viewed) are typed against the real shared contract and compile, but were not exercised end-to-end because the backend is built in parallel and unreachable from this clone.

## Notes, concerns, deviations, findings, thoughts, feedback
- Branch-name conflict: cloud policy wanted `cursor/<name>-b9a1`, but the task explicitly required pushing `orch/wave12-v2-objects/web-io-personal`. I honored the orchestrator instruction and pushed HEAD to that ref; did not open/merge a PR (planner owns integration).
- Recommendation weights were rebalanced to make room for `gapBoost` (keywordMatch 0.45→0.4, curatedBoost 0.25→0.2, affinity 0.3→0.25, gapBoost 0.35). Adjust if the planner prefers different weighting.
- The personal-layer `list` calls pass `{ site: 'io', mine: true }`; the backend must scope to the session user and `site`. Recently-viewed/bookmarks only round-trip `target` (slug/id) — title/pathname are resolved client-side from content metadata, so the API need not store article titles.
- `WEAKEST_GAP_SLUGS` uses content slugs (not `/library/<param>` route params) since the scorer matches `page.slug`; keep it aligned with the wizard/progress CTAs if those slugs change.
- No screen recording: the changed signed-in interactions (My Library lists, Save-to-context, Capture-to-API) require the parallel backend + a session, which I can't run here; logged-out SSR was the only live-exercisable surface.

## Suggested follow-ups
- Verifier with a running backend (or mocked session) should confirm signed-in My Library population, Capture→note persistence, profile round-trip, and the weakest-gap boost on Home.
- Consider a single shared session/auth store to dedupe the several independent `/api/auth/me` fetches across personal-layer hooks (pre-existing pattern; out of scope here).
- `.org` worker should mirror this client-wiring approach for Knowledge/Community + My Library to keep the two sites consistent.