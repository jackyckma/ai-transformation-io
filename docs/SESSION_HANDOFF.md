# Session handoff

**Date:** 2026-06-26  
**Branch:** `main`  
**Latest commit:** `ec8c237` — docs: hand off after Wave 17 merge  
**Push status:** Wave 18 goal doc + kickoff pending commit

## Active task

- **Roadmap item:** `wave18-platform-depth` — orchestrate **running**
- **Definition of done:** [wave18-platform-depth.md](./waves/wave18-platform-depth.md)

## Orchestrate (Wave 18)

| Field | Value |
|-------|--------|
| Slug | `wave18-platform-depth` |
| Agent | [bc-b6402923…](https://cursor.com/agents/bc-b6402923-c5c1-4ffe-a72e-ba9a9a7b0193) |
| Run | `run-6acde07b-ff61-46d8-bc00-c90fb7d222e5` |
| Ref | `main` @ Wave 17 merged (`d621b7a`) |
| Status | **running** (kickoff 2026-06-26) |

**Scope:** LLM-assisted ranking (optional fallback), external ChatGPT/Claude deep links, Phase 2 community verb API UI parity on .org.

## Current status

| Area | Status |
|------|--------|
| Wave 17 on `main` | ✅ PR #11 @ `d621b7a` |
| Wave 18 orchestrate | ⏳ running |
| Wave 19+ | Newsletter archive, credits (≥50 users) — deferred |

## Top priority next

1. Poll Wave 18; if ERROR ~35 min with no branches → re-kickoff from [wave18-platform-depth.md](./waves/wave18-platform-depth.md).
2. When complete + verifier pass → review + merge draft PR (founder default).
3. Production: newsletter pilot ops (subscribers, first send) can run in parallel.

## How to poll

```bash
git fetch origin
git ls-remote origin 'refs/heads/orch/wave18*'
gh pr list --limit 5
```

```bash
curl -sS -H "Authorization: Bearer $CURSOR_API_KEY" \
  "https://api.cursor.com/v1/agents/bc-b6402923-c5c1-4ffe-a72e-ba9a9a7b0193/runs/run-6acde07b-ff61-46d8-bc00-c90fb7d222e5"
```

## Key paths

| Concern | Path |
|---------|------|
| Wave 18 goal | `docs/waves/wave18-platform-depth.md` |
| Recommendations | `packages/shared/src/recommendation.ts`, `apps/web-io/lib/recommendations.ts` |
| Community matcher | `apps/backend/src/lanes/community/index.ts` |
| Phase 2 taxonomy | `packages/shared/src/wave13-community.ts` |

## Warnings

- First orchestrate kickoff may ERROR (~30 min); re-kickoff usually works.
- Keep `packages/shared/src/index.ts` untouched if possible.
- LLM features must fallback when `MINIMAX_API_KEY` unset.
