# Session handoff

**Date:** 2026-08-07  
**Branch:** `main`  
**Latest commit:** methodology 1.3.0 + Autopilot adoption (see git log)  
**Push status:** on `origin/main`

## Active task

- **Ops:** Cursor Autopilot adopted (2×/day Maker/Checker) — `docs/autopilot/AT_ADOPTION.md`
- **Roadmap:** Waves 11–21 shipped. Autopilot E-01/E-02; E-03 Wave 25 **proposed** pending D-001
- **Founder decisions:** [FOUNDER_WAVE_DECISIONS.md](./FOUNDER_WAVE_DECISIONS.md); open Autopilot **D-001** in `docs/autopilot/decisions.json`

## Current status

| Area | Status |
|------|--------|
| Methodology | ✅ `1.3.0` pinned in `.agents/METHODOLOGY.lock` |
| Autopilot | ✅ scaffolds + AT seed; Automations UI **create manually** |
| Wave 19–21 | ✅ on `main` |
| Prod catalog | ✅ `GET /api/v1/objects/catalog?site=org` |

## Pending decisions

- **D-001** — Wave 25 vs search API vs hygiene-only (`docs/autopilot/decisions.json`; `default_if_silent=C`, SLA 7 days)

## Loop log

| # | Issue | Outcome | Commit | Verified by |
|---|-------|---------|--------|-------------|
| — | First Maker tick not yet run | — | — | — |

## Top priority next

1. **You** — create Maker + Checker Automations (`docs/autopilot/automations.md`)
2. **You** — `/editorial` approve/reject (human)
3. **Autopilot** — T-0001 first green merge
4. **Newsletter** — first send when ~10 subscribers (B1)

## Key paths

| Concern | Path |
|---------|------|
| Autopilot | `docs/autopilot/` |
| Founder radar | `docs/FOUNDER_LANES.md` |
| Orbita handoff | on-demand only — skill `orbiter-handoff` |

## Warnings

- Editorial approve stays human; Autopilot must not publish content
- Zeabur deploy can lag after Checker merge — WATCHDOG allows smoke delay
- No feature-flag system yet — UI product changes prefer `needs_human` / decisions
