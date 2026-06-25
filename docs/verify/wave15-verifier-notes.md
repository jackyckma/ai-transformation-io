# Wave 15 integrate-wave15 — Verifier Notes

Branch: `orch/wave15-ui-readiness/integrate-wave15`

## Automated evidence
- `pnpm install` → OK
- `pnpm turbo build` → 6 successful, 6 total (web-io, web-org, backend, combined, shared, content)
- `pnpm --filter @ai-transformation/backend test` → 10 files, 49/49 passed
- `rg -i "harvest hub|harvest companion" apps/web-io apps/web-org data/curated` → 0 hits (exit 1)
- Merge `bb4a874` has 2 parents (web-org-ui + web-io-ui), history preserved

## P0 code-inspection
1. Dates/type labels:
   - .io home `home-curation-grid.tsx`: per-tile `tileTypeLabel` + `· Updated {month-year}`; spotlight `Updated`.
   - .io `/library` `library-browser.tsx`: per-card `PILLAR_LABEL`; list-level `· Reviewed {month-year}` (no per-article date — known follow-up).
   - .org home `home-curation-grid.tsx`: per-tile `tileKind`; spotlight date.
   - .org `/knowledge` `knowledge-index-view.tsx`: per-item `PILLAR_TYPE_LABEL`; index-level `Updated {date}`.
   - .org community cards `community-highlights.tsx`: per-card type label + `Updated {date}`.
2. Brand pass: scoped grep 0 hits; companion titles brand-neutral (`Companion` / `Community companion`). Remaining "Harvest Hub" only in backend + `packages/shared/src/index.ts` (intentionally out of scope; backend test asserts it).
3. Community empty/loading: `CommunitySkeleton` while loading; `FallbackHighlights` (`COMMUNITY_HIGHLIGHTS`, "Editor's picks" + "featured") on ready-empty AND error. No indefinite "Loading community…".
4. Companion demotion: `web-io/layout-companion.tsx` suppresses docked companion on `/`,`/library`,`/insights` indexes; `CompanionAskEntry` mounts `CompanionAskStrip` (→ `/ask`) there. `web-org/layout-companion.tsx` suppresses on `/community`,`/knowledge`; strip mounted in `community-highlights.tsx` + `knowledge-index-view.tsx`.
5. Trust footer: both `site-chrome.tsx` `SiteFooter` show mission one-liner + `© {new Date().getFullYear()}` + agent/contact links.

## Docs + PR
- `docs/CURRENT_STATUS.md` + `docs/SESSION_HANDOFF.md` mark Wave 15 shipped/integrated.
- PR #9: draft, open, base `main`, not merged — exactly one open PR to main from this branch.
