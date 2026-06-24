<!-- orchestrate handoff
task: web-io-wave14
branch: orch/wave14-v2-personalization/web-io-wave14
agentId: bc-70a5b0ae-2396-45ab-8bbc-b6e8e84930a9
runId: run-1ab68668-ab7b-48e4-96c4-7e13f23e367d
resultStatus: finished
finishedAt: 2026-06-24T16:53:31.780Z
-->

Branch pushed. Per branch discipline I'm not opening a PR (planner owns integration). Here's my handoff.

## Status
success

## Branch
`orch/wave14-v2-personalization/web-io-wave14`

## What I did
- `apps/web-io/lib/recommendations.ts`: refactored `rankArticles` to consume the **shared** `RecommendationSignalName` + `DEFAULT_RECOMMENDATION_WEIGHTS` from shared-foundation (no more bespoke local signal/weights). Added a `bookmarkAffinity` signal (pillar overlap with bookmarked library items, frequency-weighted, normalized) and mapped legacy signals to the shared names (`profileAlignment`/`assessmentAlignment`/`recentlyViewedAffinity`/`curatedSpotlightBoost`). Each result now carries `reasons: string[]` (short chips, signal-priority ordered). Logged-out callers pass no bookmarks/profile/history → curated order unchanged.
- `apps/web-io/components/personal-dashboard.tsx`: sources bookmarks via `useBookmarks` (existing client/`getApiClient().bookmarks`), resolves bookmarked `library_article` slugs → pillars, feeds `bookmarkedPillars` into `rankArticles`, and renders up to 2 **reason chips** per recommendation explaining WHY.
- `apps/web-io/lib/insights-recommendations.ts` (new): rule-based Insights scorer reusing the shared `scoreRecommendation` + signal contract (restricted to `profileAlignment` + `assessmentAlignment`), with stable curated fallback and `canPersonalizeInsights` guard.
- `apps/web-io/components/insights-cards.tsx`: now a client component — reorders `IO_INSIGHTS` by onboarding profile + assessment weakest gap for signed-in users, shows a **"Personalized for your role"** affordance + per-card reason chips; logged-out/no-signal renders the static curated order (SEO preserved).
- `apps/web-io/lib/insights-data.ts`: added a `gaps: AssessmentGapId[]` mapping per insight card to drive weakest-gap reordering.

## Measurements
- `pnpm --filter @ai-transformation/web-io typecheck`: pass → pass
- `pnpm --filter @ai-transformation/web-io build`: pass → pass (23/23 static pages)

## Verification
unit-test-verified

Ran throwaway tsx harnesses against the real exported functions (then deleted them):
- `rankArticles`: logged-out → alphabetical, zero reasons; with `bookmarkedPillars=['resource','resource']` the resource article rises to top with reason `"Like what you saved"`.
- `rankInsights`: static order `mckinsey,stanford,oecd`; `weakestGap=governance` → `stanford,oecd,mckinsey` (reason `"Your weakest gap"`); profile `policy/government` → `oecd-ai-policy` to top; `canPersonalizeInsights({none})` → `false` (static).

## Notes, concerns, deviations, findings, thoughts, feedback
- **No live screenshots.** The logged-in experience depends on a running backend + OAuth session + real bookmarks/profile/assessment, none available in this sandbox, and no MCP browser tool was available. I substituted deterministic rule-based verification of the exact exported scorers. A verifier with a deployed env should capture the before/after Home + `/insights` screenshots.
- I replaced the old bespoke `WEIGHTS` (keywordMatch/curatedBoost/affinity/gapBoost = 0.4/0.2/0.25/0.35) with the shared `DEFAULT_RECOMMENDATION_WEIGHTS` to satisfy "no bespoke shadow scoring". This slightly changes ranking weights vs Wave 13 (intended — now single source of truth in shared).
- Strictly scoped to `apps/web-io/**`; did not touch `data/curated/io-home.json` (no copy change needed). No edits to web-org/packages/backend/combined.
- Everything remains rule-based; no LLM ranking (deferred per §9).

## Suggested follow-ups
- A verifier should run web-io against a live/staging backend signed in (with bookmarks + profile + assessment) to capture the before/after Home recommendation shift and personalized `/insights` ordering screenshots.
- Consider extending `bookmarkAffinity` beyond pillar overlap to tag/topic overlap once library content gains tags (ContentPageMeta currently has only `pillar`).