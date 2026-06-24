# Session handoff

**Date:** 2026-06-24  
**Session:** Wave 14 integration — SITE_DESIGN_v2 Phase 4 personalization + Phase 2 community + matching experiments  
**Branch:** `orch/wave14-v2-personalization/integrate-wave14`  
**Latest commit:** see branch tip (`git log -1 --oneline`)  
**Push status:** pushed to `origin/orch/wave14-v2-personalization/integrate-wave14`

## Active task

- **Roadmap item:** `wave14-v2-personalization` (SITE_DESIGN_v2 §11 Phase 4)
- **Definition of done:**
  1. Merge `backend-wave14` + `web-org-wave14` + `web-io-wave14` with merge parents preserved.
  2. Keep shared Wave 14 contracts compatible across backend, web-org, and web-io.
  3. Ship .org Phase 2 community types + experimental matching UI/API + real activity signals.
  4. Ship .io personalization v2 and update .io `/for-agents` with Wave 14 API notes.
  5. Update `docs/CURRENT_STATUS.md` and this handoff to Wave 14 shipped state.

## Current status

| Area | Status |
|------|--------|
| Integration branch | `orch/wave14-v2-personalization/backend-wave14` merged with `web-org-wave14` and `web-io-wave14` (merge commits preserved) |
| Backend community + personal APIs | Phase 2 community types active; experimental matcher + match feedback + activity-summary live on `/api/*` and `/api/v1/*` with session/Bearer parity |
| .org UI | Phase 2 types active in cards/detail/actions; experimental Match panel with candidate reasons + thumbs feedback; dashboard uses real activity summary signals |
| .io personalization | Recommendation ranking includes bookmark affinity; `/insights` order can re-rank by profile + weakest assessment gap for logged-in users |
| .io agent docs | `/for-agents` updated to note active Phase 2 types and experimental matching endpoints on `/api/v1` |
| Known blockers | None in this integration session |

## Verified in

- **Cloud agent (this session):**
  - `pnpm install` — pass
  - `pnpm turbo build` — pass (`@ai-transformation/backend`, `@ai-transformation/web-io`, `@ai-transformation/web-org`)
  - `pnpm --filter @ai-transformation/backend test` — pass (49 passing)
- **Live UI:** not re-run in this integration session (upstream UI branches verified type/build and provided artifacts where available)

## Top priority next

1. Wave 15+ planning and implementation: newsletter public archive and optional agent credits top-up (if still desired).

## What was already tried

- Fetched and merged the two web Wave 14 branches directly into the backend Wave 14 branch lineage to keep parent history.
- Resolved integration by verification rather than code rewrites; no additional cross-lane type drift fixes were required after merge.
- Kept `.io` Wave 14 update to `/for-agents` as a light doc-only note (no .io community UI added).

## How to run / verify

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
```

Manual smoke checklist:

1. `.org` `/community` shows active Phase 2 actions (including Ask-prefill intent actions where applicable).
2. `.org` `/community/[id]` experimental Match panel can load candidates and submit thumbs feedback.
3. `.org` dashboard reflects real activity-summary-driven panels.
4. `.io` home recommendations reflect bookmark affinity when signed in.
5. `.io` `/insights` reorders content when profile + assessment signals exist.
6. `.io` `/for-agents` documents active Phase 2 + experimental matching endpoints.

## Key file paths

| Concern | Path |
|---------|------|
| Backend matcher/actions/activity summary | `apps/backend/src/lanes/community/index.ts`, `apps/backend/src/lanes/objects/index.ts`, `apps/backend/src/db/community.ts`, `apps/backend/src/db/personal.ts` |
| Backend Wave 14 tests | `apps/backend/src/lanes/community/community.test.ts` |
| .org Phase 2 + Match UI | `apps/web-org/components/community-object-view.tsx`, `apps/web-org/components/community-highlights.tsx`, `apps/web-org/lib/object-display.ts` |
| .org real activity signals | `apps/web-org/components/community-activity-dashboard.tsx`, `apps/web-org/lib/home-recommendations.ts`, `apps/web-org/lib/recommendation-types.ts` |
| .org agent docs | `apps/web-org/app/for-agents/page.tsx` |
| .io personalization v2 | `apps/web-io/lib/recommendations.ts`, `apps/web-io/components/personal-dashboard.tsx`, `apps/web-io/lib/insights-recommendations.ts`, `apps/web-io/components/insights-cards.tsx` |
| .io agent docs | `apps/web-io/app/for-agents/page.tsx` |
| Status docs | `docs/CURRENT_STATUS.md`, `docs/SESSION_HANDOFF.md` |

## Warnings

- Keep `.orchestrate/` out of PR diff (run-local orchestrator state).
- `pnpm install` may be required on fresh cloud sessions because workspace dependencies are not always prewarmed.
- Experimental matcher is intentionally labeled experimental in UI/docs; keep that label until promoted.
