# Session handoff

**Date:** 2026-06-25  
**Session:** Post–Wave 14 roadmap alignment + Wave 15–16 planning  
**Branch:** `main`  
**Latest commit:** `7be73fe` (Wave 14 merge) + doc alignment commits on branch tip  
**Push status:** see `git log -1 origin/main`

## Active task

- **Roadmap item:** Wave 15 production UI readiness (next orchestrate target)
- **Definition of done (Wave 15):**
  1. Ship polish items from [UI_READINESS_AUDIT.md](./UI_READINESS_AUDIT.md) backlog (≤10 high-impact).
  2. Both sites pass comparative audit “production-ready” bar on home, primary ribbon routes, article/detail pages.
  3. No new features that depend on community scale or Orbita.
  4. Update `docs/CURRENT_STATUS.md` when Wave 15 ships.

## Current status

| Area | Status |
|------|--------|
| Wave 14 on `main` | ✅ merged (`7be73fe`) — Phase 2 community, matcher, personalization v2 |
| Roadmap docs | ✅ aligned — Waves 15–19+ in `SITE_DESIGN_v2.md`, `project-progress.md` |
| Wave 15 audit doc | ✅ [UI_READINESS_AUDIT.md](./UI_READINESS_AUDIT.md) — comparative gap matrix |
| Wave 15 orchestrate goal | ✅ [waves/wave15-ui-readiness.md](./waves/wave15-ui-readiness.md) |
| L12 editorial supply | ✅ INTERFACE + `.editorial-orbita/` runbook skeleton (Wave 16) |
| Known blockers | None for Wave 15 kickoff |

## Top priority next

1. **Kickoff Wave 15 orchestrate** using goal in `docs/waves/wave15-ui-readiness.md`.
2. After Wave 15 ships: Wave 16 content supply (L12 contract first; Orbita client parallel).
3. After Wave 15–16: Wave 17 newsletter pilot (not before UI + seed content).

## How to run / verify

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
```

Production smoke (recommended before Wave 17):

- Read: `GET /api/v1/capabilities`, content index + article fetch
- .org: `/community`, `/knowledge`, logged-in dashboard
- .io: home recommendations, `/insights` when signed in

## Key file paths

| Concern | Path |
|---------|------|
| Roadmap (post–Wave 14) | `docs/SITE_DESIGN_v2.md` §12 |
| UI audit | `docs/UI_READINESS_AUDIT.md` |
| Wave 15 orchestrate | `docs/waves/wave15-ui-readiness.md` |
| L12 editorial supply | `apps/backend/src/lanes/editorial-supply/INTERFACE.md` |
| Orbita client runbook | `.editorial-orbita/` |
| Status | `docs/CURRENT_STATUS.md` |

## Warnings

- **Wave numbering:** legacy “Wave 10 newsletter pilot” = **Wave 17** in the new plan.
- **Credits:** quota-only until ~50 active users — do not implement Stripe top-up early.
- **Orbita (L12):** must not block Wave 15 UI work; manual draft ingest is the fallback.
