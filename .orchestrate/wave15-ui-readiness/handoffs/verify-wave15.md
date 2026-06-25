<!-- orchestrate handoff
task: verify-wave15
branch: orch/wave15-ui-readiness/integrate-wave15
agentId: bc-828250cc-f147-48dc-be2c-90b83a425a77
runId: run-26f9c314-9e9d-4c72-ad68-cbd5eab50798
resultStatus: finished
finishedAt: 2026-06-25T13:40:03.639Z
-->

## Verification
unit-test-verified

## Target
`integrate-wave15` on branch `orch/wave15-ui-readiness/integrate-wave15`

## Branch
`orch/wave15-ui-readiness/integrate-wave15`

## Execution
- `pnpm install` → OK (resolved 237, done)
- `pnpm turbo build` → **6 successful, 6 total** (web-io, web-org, backend, combined, shared, content)
- `pnpm --filter @ai-transformation/backend test` → **10 files, 49/49 passed** (vitest, 1.89s)
- `rg -i "harvest hub|harvest companion" apps/web-io apps/web-org data/curated` → **0 hits** (exit 1)
- `git log` on merge `bb4a874` → **2 parents** (`0638bea` web-org-ui base + `441516d` web-io-ui), both preserved
- `gh pr list --base main --state open` → exactly **one** PR #9, draft, base `main`, `mergedAt: null`
- Read inspection of: both `layout-companion.tsx`, `companion-ask-entry.tsx`, `companion-ask-strip.tsx`, `community-highlights.tsx`, `community/page.tsx`, both `home-curation-grid.tsx`, `library-browser.tsx`, `knowledge-index-view.tsx`, both `site-chrome.tsx`, `sidebar-chat.tsx`
- Env note: no browser available, so verified by build + backend tests + grep + route/component code-inspection (not a live click-through). Upstream handoff references screenshot artifacts under `/opt/cursor/artifacts/wave15-*`.

## Findings
Per integrate-wave15 acceptance criterion:
- [x] web-io-ui merged with both parents preserved: merge `bb4a874` has 2 parents (met)
- [x] `pnpm turbo build` 6/6: 6 successful, 6 total (met)
- [x] backend test no regressions: 49/49 passed (met)
- [x] brand grep 0 user-facing hits: scoped grep returned 0; residual "Harvest Hub" only in `apps/backend` + `packages/shared/src/index.ts` (explicitly out of scope; backend test asserts on it) and `.next/cache` binaries (met)
- [x] CURRENT_STATUS.md + SESSION_HANDOFF.md mark Wave 15 shipped: both updated (met)
- [x] exactly ONE draft PR to main, not merged/ready: PR #9 draft, open, base main (met)

Per 5 Wave 15 P0 items:
- [x] (1) dates + type labels: .io home per-tile `tileTypeLabel` + `· Updated {month-year}`; .io `/library` per-card `PILLAR_LABEL` + list-level `· Reviewed {month-year}`; .org home per-tile `tileKind` + spotlight date; .org `/knowledge` per-item `PILLAR_TYPE_LABEL` + index-level `Updated {date}`; .org community per-card type label + `Updated {date}` (met — see low finding on per-card date granularity)
- [x] (2) brand pass + neutral companion title: 0 scoped hits; `sidebar-chat.tsx` titles are `Companion` / `Community companion` (met)
- [x] (3) community empty/loading: `CommunitySkeleton` while `loading`; `FallbackHighlights` using `COMMUNITY_HIGHLIGHTS` labeled "Editor's picks" + "featured" on both ready-empty and error; no indefinite "Loading community…" (met)
- [x] (4) companion demotion: both `layout-companion.tsx` return `null` (suppress docked `SiteCompanion`) on `/`,`/library`,`/insights` (io) and `/community`,`/knowledge` (org); `CompanionAskStrip` (→`/ask`) mounted via `CompanionAskEntry` (io) and inside `community-highlights`/`knowledge-index-view` (org) (met)
- [x] (5) trust footer: both `SiteFooter` render mission one-liner + `© {new Date().getFullYear()}` + agent (`/api/agent`) and contact/contribute (`/ask`) links (met)

Other findings:
- (low) Date granularity: `/library` (.io), `/knowledge` (.org), and the .org home grid show a curation/section-level date ("Reviewed"/"Updated"/spotlight) rather than a per-card published/updated date; per-card dates appear only on .io home tiles and .org community cards. This matches the upstream handoff note that real per-article date metadata is a deferred follow-up. Dates are visible on every required surface, so P0 is satisfied, but card-level date fidelity is partial.
- (low) Backend system-prompt strings (`apps/backend/src/lanes/chat/llm.ts`, `context.ts`) still say "Harvest Hub companion"; these are out of scope (backend untouched) and not user-visible UI chrome, but will surface in companion responses on .org until a future backend pass.

## Notes & suggestions
- Backend was untouched and `packages/shared/src/index.ts` "Harvest Hub" left intact as required (agent-protocol test still asserts it).
- I committed verifier evidence to `docs/verify/wave15-verifier-notes.md` and pushed (`ecee912`); no target source files were modified.
- Follow-up candidates: add per-article publish/updated metadata to content sources to upgrade card date fidelity; brand-neutralize backend chat system prompts in a backend-scoped wave.