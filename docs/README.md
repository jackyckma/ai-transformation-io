# Documentation index

**Last updated:** 2026-06-23

## Start here

| Doc | Purpose |
|-----|---------|
| **[SITE_DESIGN_v2.md](SITE_DESIGN_v2.md)** | **Approved** product & IA spec — Wave 11+ north star |
| [CURRENT_STATUS.md](CURRENT_STATUS.md) | What works in production today |
| [project-progress.md](project-progress.md) | Wave delivery (0–14); Wave 11+ aligned to v2 |
| [SESSION_HANDOFF.md](SESSION_HANDOFF.md) | Resume point for the next agent session |

## Product & UX

| Doc | Purpose |
|-----|---------|
| [POSITIONING.md](POSITIONING.md) | Short two-site positioning (points to v2) |
| [POSITIONING-UX.md](POSITIONING-UX.md) | **Historical** — Waves 0–10 UX locks only |
| [product-architecture.md](product-architecture.md) | Lane map + **shipped** IA (pre-v2) + pointers |
| [DOC_ALIGNMENT_AUDIT.md](DOC_ALIGNMENT_AUDIT.md) | Doc contradiction log; re-run after major pivots |
| [archive/](archive/) | Superseded planning docs |

## Technical & ops

| Doc | Purpose |
|-----|---------|
| [ARCHITECTURE.md](ARCHITECTURE.md) | Monorepo / deploy architecture |
| [traceability-index.md](traceability-index.md) | Lane → package → skill mapping |
| [AGENT_ENV.md](AGENT_ENV.md) | Local vs cloud agent capability matrix |
| [EMAIL_NEWSLETTER.md](EMAIL_NEWSLETTER.md) | ZSend + inbound replies |
| [INFRA_SETUP.md](INFRA_SETUP.md) | DNS, Zeabur, email routing |
| [CURATION_ANALYTICS.md](CURATION_ANALYTICS.md) | Curation analytics notes |

## Agent instructions

Shared behavior: `.agents/instructions/`  
Entry points: `AGENTS.md`, `CLAUDE.md`, `.cursor/rules/shared-instructions.mdc`  
Lane skills: `.agents/skills/lane-*/SKILL.md`

**Before non-trivial work:** read `SITE_DESIGN_v2.md` (new features) + `CURRENT_STATUS.md` (what is live).
