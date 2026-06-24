<!-- orchestrate handoff
task: web-org-wave14
branch: orch/wave14-v2-personalization/web-org-wave14
agentId: bc-bd02b130-6bc0-467d-883f-89c13d00010e
runId: run-504ae148-cc86-42e2-bafb-bbc26233d7bd
resultStatus: finished
finishedAt: 2026-06-24T17:09:23.087Z
-->

All work is complete. Here is my handoff.

## Status
success

## Branch
`orch/wave14-v2-personalization/web-org-wave14`

## What I did
- **Phase 2 types active** — `components/community-object-view.tsx`: removed the `reserved`/`ReservedActions`/"coming soon" path entirely; all valid community types now render as active objects via `getCommunityActions`. Added a `TypeFields` block that surfaces per-type `metadata` fields (focusArea, skillsNeeded, offering/seeking, cohort, tags, etc.) using new `communityTypeFieldEntries` helper. Type-appropriate intent verbs (`apply`, `request_mentor`, `ask_for_intro`) wired as on-site Ask-prefill links; `reply`/`follow`/`save`/`offer_help`/`join` keep their real interaction wiring.
- `components/community-highlights.tsx`: dropped reserved-disabled chips; cards now show real per-type actions for every type, plus a compact "Find matches · experimental" link on eligible types. Sample-card fallback retained for empty/error. Refreshed the bottom-section copy.
- `lib/object-display.ts`: added `isCommunityTypeRenderedActive` (uses shared `isCommunityTypeActive`), `MATCH_ELIGIBLE_TYPES`/`isMatchEligible` (help_request, mentorship_request, project_request, collaboration_offer), and `communityTypeFieldEntries`.
- **Experimental Match UI** — new `MatchPanel` + `MatchCandidateCard` in `community-object-view.tsx`: clearly "Experimental" badged, calls `getApiClient().community.match(...)`, renders ranked cards (title/score%/reasons[]) with 👍/👎 wired to `community.matchFeedback`. Handles guest (sign-in prompt), loading, empty, and error.
- **Personalization v2** — `lib/recommendation-types.ts` + `lib/home-recommendations.ts`: removed `pseudoSignal()` hashing; candidates now carry `keywords`, and `activitySignalsFor()` maps a real `personalization.getActivitySummary` into the three ActivitySignals. `components/community-activity-dashboard.tsx` fetches the summary client-side, reranks via `scoreRecommendation`, and shows real followed-topics / contributions / interactions panels with a graceful new-user fallback. (Moved the scorer into `recommendation-types.ts` so the client component doesn't pull the `server-only` content package.)
- `app/for-agents/page.tsx`: rewrote Phase 2 section to document the types as active (create/fields/actions) and added an "Experimental matching" section (POST `/api/v1/community/match` + `/match/feedback`, Bearer, on-site parity).
- `data/curated/org-home.json`: updated community summaries for the now-active opportunity layer + experimental matching; bumped `updatedAt`.

## Measurements
- `pnpm --filter @ai-transformation/web-org typecheck`: pass → pass
- `pnpm --filter @ai-transformation/web-org build`: pass → pass (compiled, all routes generated)
- pseudo/hashed signal occurrences in web-org: 1 (`pseudoSignal`) → 0
- reserved/coming-soon occurrences in web-org: present → 0

## Verification
type-check-only

Build + typecheck pass against the shared client contract, all UI consumes `getApiClient().community.*` / `.personalization.*` (no shadow fetch). Dev server smoke test: `/community`, `/for-agents`, `/` all return 200 and `/for-agents` renders the new "Opportunity community types (Phase 2)" + "Experimental matching" copy. I could not exercise the interactive Phase 2 actions, Match candidates, or real dashboard signals end-to-end because they require the live backend (integrates separately per the task) — those code paths are validated only against the typed contract.

Screenshots (page shells, light theme) captured at `/opt/cursor/artifacts/wave14-web-org/` (`community.png`, `home.png`). The community/dashboard/Match/Phase-2-detail dynamic states render as loading/fallback shells here since no backend is live; full visual capture of those states needs the integrated backend.

## Notes, concerns, deviations, findings, thoughts, feedback
- `community.match` request type requires `limit` (shared schema uses `.default(5)`, so `z.infer` output makes it required) — I pass `limit: 5` explicitly.
- Match eligibility is a UI-side set including `help_request`, which lacks the `match` taxonomy verb in shared but is a primary matching subject per the task; documented inline.
- `request_mentor`/`ask_for_intro`/`apply` have no dedicated interaction endpoints in the shared client (only follow/offer_help/join), so I wired them as Ask-prefill links (§6 contextual actions → on-site Ask), keeping them active and useful rather than inventing endpoints.
- Per branch discipline I pushed the branch but did NOT open a PR or merge — planner owns integration.
- No browser MCP and no live backend in this env, so live-UI verification of the new features wasn't possible; the verifier should run with the integrated backend.

## Suggested follow-ups
- Verifier pass with the live Wave 14 backend to confirm Match candidates, Phase 2 create/list/detail, and real dashboard signals render correctly end-to-end, and to capture the dynamic-state screenshots.
- Consider an env-setup agent so cloud sessions have `pnpm install` pre-done and a headless-browser/screenshot path that doesn't hang (default `--headless` hung; `--headless=new` with per-run `--user-data-dir` worked but was flaky).
- Once the matcher proves out, consider promoting `match` from "experimental" labeling and adding `apprenticeship_opportunity` to match eligibility if the backend supports it.