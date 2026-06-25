# Session handoff

**Date:** 2026-06-25  
**Branch:** `main`  
**Latest commit:** `e4c3b82` — docs: mark Wave 16 merged and hand off to Wave 17  
**Push status:** Wave 17 goal doc + kickoff pending commit

## Active task

- **Roadmap item:** `wave17-newsletter-pilot` — orchestrate **running**
- **Definition of done:** [wave17-newsletter-pilot.md](./waves/wave17-newsletter-pilot.md) + [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)

## Orchestrate (Wave 17)

| Field | Value |
|-------|--------|
| Slug | `wave17-newsletter-pilot` |
| Agent | [bc-9ce54122…](https://cursor.com/agents/bc-9ce54122-a30a-4ed9-be35-74ef5e087011) |
| Run | `run-8214463b-1d92-44e0-8178-92ad797116c7` |
| Ref | `main` @ Wave 16 merged |
| Status | **running** (kickoff 2026-06-25) |

**Scope:** subscribe/unsubscribe APIs, admin send-issue, inbound webhook, footer subscribe + `/newsletter` admin UI on both sites, pilot cap 25, tests + docs. No Stripe, no public archive, Cloudflare Worker doc-only.

## Current status

| Area | Status |
|------|--------|
| Wave 16 on `main` | ✅ PR #10 @ `58a174b` |
| Wave 17 orchestrate | ⏳ running |
| Newsletter pilot send | ⏳ not live until Wave 17 merges |

## Top priority next

1. Poll Wave 17 orchestrate; if ERROR ~35 min with no branches → re-kickoff from [wave17-newsletter-pilot.md](./waves/wave17-newsletter-pilot.md).
2. When complete + verifier pass → review + merge draft PR (founder default).
3. Post-merge: add ~10 pilot subscribers, compile + send one issue; test inbound or manual reply fallback.

## How to poll

```bash
git fetch origin
ls .orchestrate/wave17-newsletter-pilot/ 2>/dev/null
git ls-remote origin 'refs/heads/orch/wave17*'
gh pr list --limit 5
```

Planner run status (after `source .cursor-env`):

```bash
curl -sS -H "Authorization: Bearer $CURSOR_API_KEY" \
  "https://api.cursor.com/v1/agents/bc-9ce54122-a30a-4ed9-be35-74ef5e087011/runs/run-8214463b-1d92-44e0-8178-92ad797116c7"
```

## Key paths

| Concern | Path |
|---------|------|
| Wave 17 goal | `docs/waves/wave17-newsletter-pilot.md` |
| Newsletter spec | `docs/EMAIL_NEWSLETTER.md` |
| L6 backend | `apps/backend/src/lanes/newsletter/` |
| compile-draft | `apps/backend/src/lanes/agent/` |

## Warnings

- First orchestrate kickoff sometimes ERROR (~30 min); re-kickoff usually succeeds (Waves 14–16 pattern).
- Keep `packages/shared/src/index.ts` untouched if possible.
- Zeabur manual restart if 502 after merge-only deploy.
