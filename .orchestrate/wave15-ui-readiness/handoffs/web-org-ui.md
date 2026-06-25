<!-- orchestrate handoff
task: web-org-ui
branch: orch/wave15-ui-readiness/web-org-ui
agentId: bc-52fb1c4c-d723-4937-818c-00aaa641e162
runId: run-c8a8fdf1-a2c7-4c67-b2ab-bae92a1d07a7
resultStatus: finished
finishedAt: 2026-06-25T12:45:36.378Z
-->

All work is complete, committed, pushed, and verified live. Here is my handoff.

## Status
success

## Branch
`orch/wave15-ui-readiness/web-org-ui`

## What I did
- **Brand copy pass** — `apps/web-org/app/layout.tsx`: dropped `(formerly Harvest Hub)` from the metadata description. Neutralized `apps/web-org/INTERFACE.md` ("Harvest Hub" → "Community · Knowledge commons"). Curated `org-*.json` had no Harvest Hub/companion text (only asset filenames, left untouched).
- **Trust footer** — `components/site-chrome.tsx` `SiteFooter`: mission one-liner + dynamic `© {new Date().getFullYear()}` line + low-key links (Contribute / Agent entry / Frameworks on .io); existing nav retained.
- **Companion demotion** — `components/layout-companion.tsx` now returns no docked rail for `/community` and `/knowledge` (added to the existing `/ask` skip); moved the rail wrapper into the component and removed it from `layout.tsx`. The shared `CompanionAskStrip` (imported from `@ai-transformation/chat-ui`) is rendered inline on both the community and knowledge index views.
- **Community empty/loading UX** — `components/community-highlights.tsx`: replaced the `Loading community…` text with a `CommunitySkeleton` (4 `motion-safe:animate-pulse` cards); both the empty (0 objects) and error states now render a clearly-labeled `Editor's picks` fallback using `COMMUNITY_HIGHLIGHTS`; live objects still render when present; sample-card tag relabeled `example` → `featured`.
- **Dates + type labels** — Home grid: spotlight shows a `SPOTLIGHT` chip + `Updated {feed.updatedAt}`; tiles get a content-type kicker (Knowledge/Community/Contribute/Program/Prompts/For agents). Knowledge index: pillar-based type chip (Framework/Guide/Reference) + visibility on cards, plus an `Updated {date}` header sourced from a new `updatedAt` in `org-hub-index.json` (threaded through `lib/knowledge-index.ts`). Community list cards already carried type/visibility/excerpt; prefixed the date with `Updated`.

## Measurements
- `rg -i "harvest hub|harvest companion" apps/web-org data/curated/org-*.json: 1 → 0`
- `pnpm --filter @ai-transformation/web-org typecheck: pass → pass`
- `pnpm --filter @ai-transformation/web-org build: pass → pass`
- `files changed outside apps/web-org + data/curated/org-*.json: 0 == 0`

## Verification
live-ui-verified

Ran the built server (`next start`, port 3003) and captured live screenshots in `/opt/cursor/artifacts/`:
- `wave15-org-community-skeleton.png` — skeleton (no "Loading…" text) via delayed API route
- `wave15-org-community-fallback.png` — `Editor's picks` fallback + type/visibility labels + Ask strip + trust footer
- `wave15-org-knowledge.png` — `Updated Jun 24, 2026` + Ask strip + Framework/Reference labels
- `wave15-org-home.png` — spotlight `SPOTLIGHT`/`Updated` + tile type kickers (docked companion correctly retained on home)

## Notes, concerns, deviations, findings, thoughts, feedback
- **No live API in this env**, so the community page resolves to the error→fallback path; that conveniently exercised the editorial fallback. The skeleton was captured by delaying `/api/**` with a Playwright route. I did not add Playwright to any `package.json` — used a one-off `pnpm dlx`/`/tmp` install per tooling guardrails.
- **No real per-card publish dates exist** in the curated content package (`ResolvedCuratedArticle`/`CuratedHomeTile`/`KnowledgeItem` carry none), and I did not fake any. I surfaced real editorial timestamps instead: the home feed's `updatedAt` on the spotlight, and a curator-maintained `updatedAt` added to the knowledge config. Per-card dates are omitted gracefully where unavailable.
- Did **not** open a PR, merge, or rebase (branch discipline — planner owns integration). Did **not** touch `docs/CURRENT_STATUS.md` (outside my allowed paths; that's an integration-level update).
- Home retains the full docked companion by design — demotion is scoped to the `/community` and `/knowledge` index/list pages only.

## Suggested follow-ups
- Run full `pnpm turbo build` + backend tests at integration time across all Wave 15 branches.
- Wave 16 content supply will populate live community/knowledge objects so the skeleton→real-objects path (vs. the fallback) gets exercised in production.
- Consider giving `CompanionAskStrip` an optional `className`/spacing prop upstream so consumers don't need wrapper `<div>`s (minor).