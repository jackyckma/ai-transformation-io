# Session handoff

**Date:** 2026-06-27  
**Branch:** `main`  
**Latest commit:** `2d8d3e6` — Merge PR #14 (Wave 21 .org P1 polish)  
**Push status:** on `origin/main`

## Active task

- **Roadmap:** Waves 11–21 shipped on `main`. **Next:** human ops (newsletter @ ~10 subs); Wave 20b credits when ≥50 users; Wave 20a archive deferred (B3).
- **Founder decisions:** [FOUNDER_WAVE_DECISIONS.md](./FOUNDER_WAVE_DECISIONS.md) — all locked

## Current status

| Area | Status |
|------|--------|
| Wave 19 | ✅ PR #13 — editorial review + catalog + interaction read-back |
| Wave 21 | ✅ PR #14 — More in Knowledge footer + Followed/Saved confirmation |
| Prod catalog | ✅ `GET /api/v1/objects/catalog?site=org` returns 200 (deploy live) |
| Orbita | Switch dedup to catalog (E2 locked) |
| Build + tests | Wave 19: backend **70/70** · Wave 21: web-org build + typecheck ✅ |

## Top priority next

1. **Orbita** — adopt `objects/catalog` as primary dedup (prod live)
2. **Founder** — `/editorial` Run agent review smoke + approve AT1b drafts
3. **Newsletter pilot** — first send when ~10 subscribers (B1)
4. **Wave 20b** — kickoff when ≥50 registered users

## Key paths

| Concern | Path |
|---------|------|
| Founder decisions | `docs/FOUNDER_WAVE_DECISIONS.md` |
| Wave 21 | `docs/waves/wave21-ui-p1-org-polish.md` |
| Orbita handoff | `~/Orbiter-AT-dogfood/state/STATUS.md` — **on user request only** (skill `orbiter-handoff`) |

## Warnings

- Editorial review skips without `MINIMAX_API_KEY` — by design
- Zeabur may lag on `.org` frontend after PR #14 — hard refresh if UI missing
