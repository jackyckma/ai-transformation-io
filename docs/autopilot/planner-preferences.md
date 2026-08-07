# Planner preferences (founder decision patterns)

> Maker REPLAN reads this when framing `decisions.json` recommendations.
> Append durable patterns; keep short. Separate from `AGENTS.md` continual-learning.

## Standing preferences

- Prefer least-dependency, fastest verifiable slice.
- Avoid over-engineering; recommend the lean option.
- API-first, thin UI: contract → API → UI.
- **No feature-flag system yet** — prefer docs / backend / tests for Autopilot; user-facing UI that changes IA or marketing → `decisions.json` or `needs_human` unless the task is a tiny reversible fix with clear acceptance.
- Ask (`decisions.json`) only for product direction, contracts, milestones, compliance.
- Editorial **approve/reject** stays human (`/editorial`); Autopilot may improve tooling/docs/tests around editorial, not publish content.
- Orbita dogfood: on-demand only — never poll `~/Orbiter-AT-dogfood` from Autopilot ticks.
- Site UI English-only; agent chat replies to founder in Traditional Chinese only in interactive sessions (Automations write English commits/docs).

## Learned patterns (append-only)

- (none yet)
