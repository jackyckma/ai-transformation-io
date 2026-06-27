# Session handoff

**Date:** 2026-06-27  
**Branch:** `orch/wave21-ui-p1-org-polish/web-org-wave21`  
**Latest commit:** merge PR #13 — Wave 19 editorial-review  
**Push status:** merged to `origin/main`; Wave 21 on feature branch (draft PR)

## Active task

- **Wave 21** ui-p1-org-polish — **.org UI P1 polish shipped on feature branch** (draft PR to `main`)
  - Landed: (1) `More in Knowledge` footer on `/knowledge/[id]` — ≤4 siblings, same-subtype-first, current excluded, from existing `objects.list` call (no backend); renders nothing on empty/failure. (2) Inline `Followed` confirmation on the `.org` follow button (~1.6s check, matching `.io` save-to-context) settling to persistent `Following`; unfollow shows nothing. (3) Optional: same brief-check confirmation shipped on the shared `.org` SaveButton (backward-compatible).
  - Not touched: `use-community-interactions.ts` (no behavior change); confirmation logic lives in a new `apps/web-org/lib/use-just-confirmed.tsx` helper + the button components.
  - Build + typecheck: `pnpm --filter @ai-transformation/web-org build` ✅ · `pnpm --filter @ai-transformation/web-org typecheck` (tsc --noEmit) ✅.
  - Deferred: nothing from the Wave 21 scope (all three deliverables, including the optional SaveButton item, shipped). Wave 20+ scale-archive / credits remain next.
- **Founder decisions:** all locked in [FOUNDER_WAVE_DECISIONS.md](./FOUNDER_WAVE_DECISIONS.md)
- **Human ops:** Zeabur deploy Wave 19 + newsletter send @ ~10 subs

## Current status

| Area | Status |
|------|--------|
| Wave 19 on `main` | ✅ PR [#13](https://github.com/jackyckma/ai-transformation-io/pull/13) merged |
| Editorial review agent | ✅ `review-pending` + `editorial_agent` metadata (no auto-approve) |
| Objects catalog | ✅ `GET /api/v1/objects/catalog?site=` |
| Interaction read-back | ✅ Phase 2 verbs survive reload |
| Build + tests | ✅ turbo 6/6; backend **70/70** |
| Orbita handoff | ✅ `~/Orbiter-AT-dogfood/inbox/at-to-orbita/2026-06-26-wave19-catalog-review-at.md` |

## Deferred (non-blocking)

- ~~`.org` P1: `More in Knowledge` footer + inline Followed confirmation~~ ✅ shipped in Wave 21
- Wave 19 scale-archive (newsletter archive + credits at ≥50 users)
- Editorial auto-approve policy (founder TBD after calibration)

## Top priority next

1. **Zeabur deploy** — confirm `/editorial` Run agent review + catalog on prod
2. **Newsletter pilot ops** — first send (Wave 17 founder-led)
3. **Orbita** — adopt `objects/catalog` in daily dedup after prod deploy
4. **Founder pre-decisions** — see `docs/FOUNDER_WAVE_DECISIONS.md` (batch wave alignment)

## Key paths

| Concern | Path |
|---------|------|
| Wave 19 scope | `docs/waves/wave19-editorial-review.md` |
| Scale draft | `docs/waves/wave19-scale-archive.md` |
| Editorial review | `apps/backend/src/lanes/editorial-supply/review.ts` |
| Catalog | `apps/backend/src/lanes/objects/index.ts` |
| `/editorial` UI | `apps/web-org/components/editorial-queue.tsx` |

## Warnings

- Editorial review skips without `MINIMAX_API_KEY` — by design
- Zeabur manual restart if 502 after merge-only commits
