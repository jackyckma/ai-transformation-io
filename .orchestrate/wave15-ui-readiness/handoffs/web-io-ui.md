<!-- orchestrate handoff
task: web-io-ui
branch: orch/wave15-ui-readiness/web-io-ui
agentId: bc-8c7bf60d-dc4d-4348-bfb3-2091f08218a4
runId: run-1f7bbd56-5461-4c43-8ecb-3c340b4ed660
resultStatus: finished
finishedAt: 2026-06-25T13:03:59.643Z
-->

All work is complete. Only the allowed paths (`apps/web-io/**` and `data/curated/io-home.json`) changed, build and typecheck pass, and I verified the result live via the built server plus screenshots.

## Status
success

## Branch
`orch/wave15-ui-readiness/web-io-ui`

## What I did
- **Brand copy (`data/curated/io-home.json`)** — replaced the two user-visible legacy strings: explore path link `Harvest Hub on .org` → `Community on .org`, and community tile summary `Harvest Hub — field stories…` → `Community · Knowledge commons — field stories, prompts, and practitioner guides…`. `rg -i` confirms 0 remaining `Harvest Hub`/`Harvest companion` hits in `apps/web-io` + `io-home.json`.
- **Dates + type labels** — added `lib/format-date.ts` (`formatMonthYear`, honest, omits when absent). Home curated grid (`home-curation-grid.tsx` + `curated-cards.tsx`): every tile now shows a derived content-type label (`Library` / `Assessment` / `Framework` / `Insights` / `Community` / `For agents`) plus `Updated Jun 2026` from the genuine `feed.updatedAt`; spotlight card shows `Framework · Updated Jun 2026`. Home "From the library" cards show a `Framework` label. Library index (`library/page.tsx` + `library-browser.tsx`): existing per-card type labels retained; added `Reviewed Jun 2026` next to the article count (sourced from `io-home` curation date). No per-article dates were fabricated.
- **Companion demotion** — `layout-companion.tsx` now renders the full docked `SidebarChat` only on reading/cockpit surfaces (`/library/[slug]`, `/insights/assessment`, `/progress`, `/settings`, `/for-agents`) and renders nothing on list/index pages; new `companion-ask-entry.tsx` renders the shared `CompanionAskStrip` (imported from `@ai-transformation/chat-ui`) at the foot of `/`, `/library`, `/insights`. `layout.tsx` rewired so the right rail collapses on list pages (editorial full width) and the strip mounts inside `<main>`.
- **Trust footer (`site-chrome.tsx`)** — `SiteFooter` is now a mission one-liner + nav (Library / Insights / Agent entry / Community on .org / Contact) + `© {new Date().getFullYear()} AI Transformation`.

## Measurements
- `rg -i "harvest hub|harvest companion" apps/web-io data/curated/io-home.json: 2 → 0`
- `pnpm --filter @ai-transformation/web-io typecheck: pass → pass`
- `pnpm --filter @ai-transformation/web-io build: pass → pass (23 routes)`
- `files changed outside apps/web-io + io-home.json: 0 == 0`
- `docked companion on /library: present → absent (chat-panel-w hits 1 → 0)`
- `docked companion on /library/[slug]: 1 == 1 (retained)`
- `Ask strip on /, /library, /insights: 0 → 3 routes present`

## Verification
live-ui-verified

Started the production build (`next start`) and confirmed via headless-Chrome screenshots + HTML smoke: home/library cards show type + date labels, `Community on .org` brand copy, the subtle `Have a question? Open Ask →` strip on list pages (docked chat panel gone), full companion retained on `/library/[slug]`, and the trust footer with `© 2026`. Artifacts: `/opt/cursor/artifacts/wave15-web-io/after-home.png`, `after-library.png`, `after-insights.png`.

## Notes, concerns, deviations, findings, thoughts, feedback
- **Dates are genuinely scarce.** `@ai-transformation/content` (`ContentPageMeta`) carries no per-article date and knowledge-base markdown has no date frontmatter; `packages/**` is out of scope. The only real date is the curation `updatedAt` (`2026-06-22`). I used it as `Updated Jun 2026` on curated home cards and `Reviewed Jun 2026` on the library index, and relied on the always-true type labels — per the brief, dates are gracefully omitted where unavailable rather than faked. If the planner wants true per-article publish/updated dates, that needs a `packages/content` change (add dates to `CONTENT_REGISTRY` or markdown frontmatter) in a separate task.
- **Companion placement decision:** rather than leaving a mostly-empty 22rem chat rail with just a strip, I collapsed the rail on list pages (giving editorial content full width — directly addressing audit item 9 "companion competes with editorial home") and mounted the `CompanionAskStrip` at the end of the page content. `/for-agents` keeps the full companion (content page, not a list/index page) so no page is left with neither companion nor strip.
- **`docs/CURRENT_STATUS.md` not touched** — it's outside my allowed write set (`apps/web-io/**`, `io-home.json`); the overall-goal status doc update belongs to the planner/integration.
- The `CompanionAskStrip` uses a plain `<a href="/ask">` (full nav, framework-agnostic per upstream); acceptable for a low-key entry. Chrome segfaults on exit in this sandbox but writes the PNG before crashing — screenshots are valid.
- Per branch discipline I did **not** open a PR; branch `orch/wave15-ui-readiness/web-io-ui` is pushed for the planner to integrate.

## Suggested follow-ups
- Add real per-article `publishedAt`/`updatedAt` to `packages/content` (registry or markdown frontmatter) so library/home cards can show true article dates instead of the curation-level stamp.
- Apply the same Wave 15 .org slice (web-org): brand pass, `CompanionAskStrip` demotion on `/knowledge` + `/community` indexes, community loading/empty editorial fallback (audit items 2/3/6), and the trust footer.