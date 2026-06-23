<!-- orchestrate handoff
task: web-org-ia
branch: orch/wave11-v2-ia/web-org-ia
agentId: bc-88823fb5-d98d-4107-bddb-35f63eb62e7a
runId: run-34c27793-11da-415e-9aa3-cc7ec6a316b3
resultStatus: finished
finishedAt: 2026-06-23T22:28:16.752Z
-->

Branch pushed. Per the branch discipline in my brief ("Do NOT merge, rebase, or open a PR. The planner owns integration"), I'm not opening a PR. Here is my handoff.

## Status
success

## Branch
`orch/wave11-v2-ia/web-org-ia`

## What I did
- **Ribbon nav + hamburger** (`lib/nav.ts`, `site-chrome.tsx`, `desktop-nav-links.tsx`, `mobile-bottom-nav.tsx`, `mobile-nav-drawer.tsx`): ribbon = Home · Knowledge · Community · Ask on desktop header + mobile bottom nav, identical labels regardless of auth. Hamburger (now available at all breakpoints) holds Sign in/account, Settings, Agentic Access API, About; `/for-agents` demoted there; ribbon excludes Agent API/Settings.
- **Knowledge** (`app/knowledge/page.tsx`, `app/knowledge/[slug]/page.tsx`, `lib/knowledge-index.ts`, `knowledge-index-view.tsx`): public index with auto-categories (curated sections from `org-hub-index.json` + pillar fallback) over the shared `getOrgKnowledgePages()` migrated `/knowledge/<slug>` articles; logged-in adds My Library / My articles+comments placeholder tabs; Summarize/Cite contextual actions → `/ask` prefill.
- **Community** (`app/community/page.tsx`, `community-highlights.tsx`, `lib/community-highlights.ts`): public-only sample highlight cards for all four Phase 1 types with human verbs as non-functional affordances + Draft reply/Turn into field note/Submit via Agent → `/ask` prefill; logged-in shows fuller opportunity-layer placeholder.
- **Ask** (`app/ask/page.tsx`, `ask-modes.tsx`): mode switcher from shared `getAllowedAskModes('org', audience)` — guest=Ask, member=Ask+Capture+Submit+Find Help; `?mode=` reflected via router; Ask runs `SidebarChat`, other modes are local (localStorage) draft stubs using shared `ASK_MODE_METADATA` placeholders.
- **Home** (`app/page.tsx`, `home-view.tsx`, `community-activity-dashboard.tsx`, `lib/home-recommendations.ts` + `recommendation-types.ts`): logged-out curated community grid; logged-in Personal Community Activity Dashboard ranking candidates with shared `scoreRecommendation` v0 (followedTopic/contributions/interactions weights).
- **Onboarding** (`app/settings/page.tsx`, `onboarding-profile-form.tsx`): role/industry/projectFocus via shared `onboardingProfileSchema`.
- **Auth** (`lib/use-auth-user.ts`): shared client hook → `{user, isLoading, audience}`.
- **Housekeeping**: removed `app/learn`, `app/stories`, `app/stories/submit` (no redirects) + dead `story-list/story-form/hub-index-sections/ask-chat/curated-sections` and `lib/hub-index.ts`/`explore-links.ts`; updated `sitemap.ts`; rebranded chrome/JSON-LD/metadata/llms.txt/apprenticeship/moderation/prompts to **Community · Knowledge commons** (apprenticeship kept as linked special page); updated `data/curated/org-home.json` + `org-hub-index.json` CTAs/paths to v2 routes and `useOrgKnowledgePaths`.

## Measurements
- `pnpm --filter @ai-transformation/web-org build`: fail → pass (BUILD_DONE_0)
- `pnpm --filter @ai-transformation/web-org typecheck`: 0 errors == 0 errors
- removed route dirs `app/learn` + `app/stories`: present → removed (HTTP 404, no redirect)
- new routes HTTP status (`next start` + curl): `/`,`/knowledge`,`/knowledge/<slug>`,`/community`,`/ask`,`/settings` == 200
- ribbon label render count (Home/Knowledge/Community/Ask): 2 each (desktop header + mobile bottom nav)
- community Phase 1 types rendered on `/community`: 4 == 4 (discussion, help_request, event, community_announcement)

## Verification
live-ui-verified

Built and ran `next start`; curl confirmed all v2 routes return 200, removed routes return 404 (no redirect), and the rendered HTML contains the ribbon labels, the brand "Community · Knowledge commons", knowledge auto-categories + Summarize/Cite actions, and all four community types with Draft reply/Turn into field note/Submit via Agent prefill links. Build + typecheck both pass.

## Notes, concerns, deviations, findings, thoughts, feedback
- No browser/computer-use MCP or Playwright is available in this cloud VM, so I could not capture pixel screenshots/recording; I verified live behavior over HTTP (status codes + rendered HTML strings) instead. Mode-switcher and dashboard auth-gating are client-rendered, so they need a signed-in session to see fully — logic is covered by the shared config and verified by build/typecheck.
- Client/server boundary fix: split recommendation types into `lib/recommendation-types.ts` so the client dashboard does not transitively import the `server-only` `@ai-transformation/content` module (initial build failed on this; resolved).
- Kept `/prompts`, `/join`, `/start`, `/moderation`, `/apprenticeship` (and `/apprenticeship/rationale`) — not in scope to remove. `/prompts` uses a real backend and stays reachable (linked from curated home tiles); rebranded its eyebrow. Fixed broken `/join` links that pointed at removed `/stories`.
- Visibility levels are display-only hints in Phase 1 ("public" badges); Ask Capture/Submit/Find-Help persist to localStorage only — no Wave 12/13 object store, as scoped.
- Did not touch `apps/web-io/**`, `packages/**`, `apps/backend/**`, `apps/combined/**`. Did not open a PR (branch discipline: planner owns integration).

## Suggested follow-ups
- Web-io worker should mirror the same ribbon/hamburger/Ask-mode/Settings/home-dashboard patterns for consistency.
- Wave 12: wire onboarding profile + Capture/Submit/Find-Help stubs and My Library/dashboard placeholders to the real object model and visibility enforcement; migrate `/moderation` to generic contribution states.
- Wave 13: replace community placeholder highlights and non-functional verbs with the real community-types posting backend; fold `/prompts` into Community as a first-class type.
- Consider deleting now-orphaned `/start` and reconciling `/join` with the hamburger sign-in to avoid duplicate auth surfaces.