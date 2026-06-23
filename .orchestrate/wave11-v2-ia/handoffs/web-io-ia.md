<!-- orchestrate handoff
task: web-io-ia
branch: orch/wave11-v2-ia/web-io-ia
agentId: bc-f9dd178c-c9b8-4ca8-87c9-dabf371dce1b
runId: run-9d7c9ccb-cf15-4771-9442-5162ed030782
resultStatus: finished
finishedAt: 2026-06-23T22:27:26.927Z
-->

All work is complete, verified, committed, and pushed. Here is my handoff.

## Status
success

## Branch
`orch/wave11-v2-ia/web-io-ia`

## What I did
- **Ribbon nav (§3.1):** Added `lib/nav.ts` (`IO_RIBBON` = Home·Library·Insights·Ask) consumed by a new client `components/ribbon-nav.tsx` (desktop header) and rewritten `components/mobile-bottom-nav.tsx` (bottom ribbon with new Library/Insights icons). Labels are auth-independent.
- **Hamburger restructure (§3.2):** Rewrote `components/mobile-nav-drawer.tsx` to a single all-breakpoint menu holding Account (auth), Settings, Your progress, Agentic access API (`/for-agents`), Agent entry (`/api/agent`), Community on .org. Removed inline auth + legacy `DesktopNavLinks` from `components/site-chrome.tsx`; footer now points to `/library` + `/insights`.
- **/library:** `app/library/page.tsx` + client `components/library-browser.tsx` — lists all `getAllPages()` filterable by pillar/type and editorial collection, with **My library** tab (logged-in) showing recently-viewed + a Wave-12 saved/notes placeholder. `app/library/[slug]/page.tsx` renders articles at the migrated paths; `content-page-layout.tsx` now records views and shows Open-in-Ask actions.
- **/insights (§10):** `app/insights/page.tsx` + `components/insights-cards.tsx` + `lib/insights-data.ts` — curated benchmark/dataset/survey cards with "what this means" interpretation; assessment moved **under** insights at `app/insights/assessment/page.tsx` (not a ribbon item).
- **/ask modes (§4):** `components/ask-workspace.tsx` — mode switcher from shared `getAllowedAskModes` (guest=Ask, member=Ask+Capture), `?mode=` reflected via router; Capture = private-note stub (`lib/captured-notes.ts` + `components/capture-note.tsx`); reads `context`/`message` for prefill.
- **Home (§3.3/§9):** `app/page.tsx` renders logged-out curated grid + Library highlights, and `components/home-view.tsx`→`personal-dashboard.tsx` renders the logged-in dashboard using the shared `scoreRecommendation` scorer (`lib/recommendations.ts`) over onboarding profile + curated spotlight + recently-viewed.
- **Onboarding + Settings (§8):** `components/onboarding-fields.tsx` persists role/industry/projectFocus via the shared `onboardingProfileSchema` (`lib/onboarding-profile.ts`, localStorage stub); captured on first login (dashboard prompt) and in `app/settings/page.tsx`.
- **Contextual actions (§6):** `components/open-in-ask.tsx` + server-safe `lib/ask-actions.ts` → `/ask?mode=ask&context=<id>&message=…`.
- **§15 housekeeping:** Deleted `app/frameworks`, `app/playbook`, `app/functions`, `app/assessment` (404, no redirects) and orphaned `hub-index-sections`, `hub-explore-nav`, `curated-sections`, `function-page-layout`, `data/function-pages.ts`, `lib/hub-index.ts`, `lib/explore-links.ts`. Updated `sitemap.ts`, `progress-dashboard.tsx`, `assessment-wizard.tsx`, `public/llms.txt`, and rewrote `data/curated/io-home.json` + `io-hub-index.json` (now Library collections) to `/library` + `/insights`.

## Measurements
- legacy hub route dirs (frameworks/playbook/functions/assessment) in `apps/web-io/app`: 4 → 0
- legacy route refs in `data/curated/io-*.json`: present → 0 (only `/insights/assessment` remains)
- `pnpm --filter @ai-transformation/web-io build`: pass (23 routes, 10 `/library/<slug>` prerendered)
- `pnpm --filter @ai-transformation/web-io typecheck`: 0 errors
- route status (prod server): `/`,`/library`,`/insights`,`/insights/assessment`,`/ask`,`/settings`,`/for-agents`,`/progress` == 200; `/frameworks`,`/playbook`,`/functions`,`/assessment` == 404

## Verification
live-ui-verified

Ran `next start` and confirmed via HTTP: ribbon labels Home·Library·Insights·Ask render on `/`, library lists articles + `/library/<slug>` renders, insights cards + assessment section render, guest `/ask` exposes only the Ask mode, no legacy hub links in home HTML, and removed routes 404. Build + typecheck pass. Caveat: member-only Capture, mode-switch URL sync, capture save, and recommendation re-ranking are client-side and were validated by logic/code (using the shared config/schema/scorer) rather than a clicked-through browser session.

## Notes, concerns, deviations, findings, thoughts, feedback
- **Role guides dropped (content deviation):** `/functions` and the hard-coded `FUNCTION_PAGES` (executive/cio role guides) were removed per §15. That content is **not** in the KB `CONTENT_REGISTRY`, so it is not migrated into `/library` — it is gone, not redirected. Flagging for a Wave 12 decision: model role guides as a library type/tag or re-author as KB articles.
- **`io-hub-index.json` repurposed:** Rather than orphan it after deleting the hub pages, I rewrote it into Library `collections` and consume it via `lib/library-index.ts` (validated against `getAllPages`). This both honors "update its paths" and keeps it live.
- **Profile/notes are localStorage stubs** (no Wave 12 object store): onboarding profile, captured notes, and recently-viewed all persist client-side via the shared `onboardingProfileSchema`. `/progress` (assessment save/resume) is kept and reachable from the hamburger + dashboard, just not in the ribbon.
- **No screen recording:** no browser/Playwright tooling is available in this environment (MCP catalog exposes only Cloudflare/Tldraw), so I verified at the HTTP/SSR level instead. If the planner wants a visual artifact, a verifier with browser MCP should capture the ribbon, library filters, and the member Ask+Capture switcher.
- `next lint` standalone prompts for ESLint setup (no `.eslintrc` in web-io) and fails non-interactively — pre-existing; the lint step inside `next build` passed.
- Did not touch `apps/web-org/**`, `packages/**`, `apps/backend/**`, or `apps/combined/**`.

## Suggested follow-ups
- Wave 12: wire My Library, Capture notes, and onboarding profile to the real object model/profile API (replace the localStorage stubs); enforce visibility.
- Decide the fate of the removed role guides (re-author as `/library` articles with a `role` type/tag).
- Member-state visual QA of `/ask` (Ask+Capture) and the logged-in home dashboard once a verifier with Google OAuth/browser tooling is available.
- Consider an LLM ranking layer for recommendations (explicitly deferred to Phase 2 in §9).