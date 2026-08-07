# Autopilot adoption — ai-transformation-io

How this repo’s existing docs map onto the Cursor Autopilot Maker/Checker loop
(`methodology` **v1.3.0**). Read with `README.md` + `playbook.md`.

## Source of truth (after adoption)

| Concern | Before | After Autopilot |
|---------|--------|-----------------|
| What to build next | Interactive chat + `FOUNDER_LANES.md` | **`docs/autopilot/roadmap.json`** (approved epics) + **`backlog.json`** |
| Founder weekly radar | `FOUNDER_LANES.md` | Keep as **radar** (human); execution queue is Autopilot |
| Wave kickoff strings | `docs/waves/*.md` + `/orchestrate` | Still valid for large waves; Autopilot for small continuous slices |
| Session pause/resume | `SESSION_HANDOFF.md` | Handoff for **interactive** work; Autopilot uses `reports/` + backlog status |
| Pending founder calls | Chat / handoff | **`decisions.json`** (+ Pending decisions in handoff) |
| Merge authority | Human or same session | **Checker only** |

## What stays human

- `/editorial` approve/reject + comments (Orbita loop)
- Newsletter first pilot send (subscriber count gate)
- Approving `proposed` → `approved` epics (e.g. Wave 25 / E-03)
- Orbita dogfood handoff (on-demand skill)
- Feature-flag flips in production (none yet)

## What Autopilot owns

- Decompose approved epics into `ready` tasks with shell `acceptance`
- Implement behind PRs (`T-xxxx` in title)
- Verify (`agent-verify.sh` + task acceptance) and merge
- Optional prod smoke (`.io` + `.org` HTTP)
- Daily/weekly reports under `docs/autopilot/reports/`

## Cadence

**2× / day** Maker + Checker — see `automations.md` (UTC cron).

## Interactive sessions (minimize)

Use chat only for:

1. Answering `decisions.json` open items
2. Approving/rejecting editorial drafts
3. Changing Autopilot cadence or pause (`pause-state.json`)
4. Large wave planning that becomes a new `approved` epic

Do **not** use long interactive sessions to implement backlog tasks that already have acceptance commands — let Maker take them.

## First-week checklist

1. [ ] Two Automations created (Maker + Checker) from `automations.md`
2. [ ] `gh` auth + merge permissions on Checker
3. [ ] `node scripts/autopilot/decide-next-action.mjs --lane maker` prints JSON locally
4. [ ] Wait for first Maker tick → PR for `T-0001` (or run Maker once manually)
5. [ ] Checker merges → WATCHDOG smoke
6. [ ] Answer or silence-default **D-001** within SLA

## Pause / kill switch

```bash
# Pause all lanes
# Edit docs/autopilot/pause-state.json → { "paused": true, "by": "founder", "reason": "…" }
# Commit + push main
```
