# Session handoff

**Date:** 2026-06-26  
**Branch:** `main`  
**Latest commit:** `e25e0ca` — Merge pull request #12 (Wave 18 platform depth)  
**Push status:** merged to `origin/main`

## Active task

- **Roadmap item:** Wave 18 ✅ shipped · **Wave 19+** next (newsletter archive, agent credits ≥50 users)
- **Definition of done:** See [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) §12

## Current status

| Area | Status |
|------|--------|
| Wave 18 on `main` | ✅ PR [#12](https://github.com/jackyckma/ai-transformation-io/pull/12) @ `e25e0ca` |
| LLM-assisted ranking | ✅ Optional `useLlmRerank` on matcher + `/personal/rank-suggestions`; fallback when no key |
| External deep links | ✅ ChatGPT/Claude on .io/.org detail + `/for-agents` docs |
| Phase 2 verb UI | ✅ `community.actions()` for request_mentor / ask_for_intro / apply on .org |
| Build + tests | ✅ turbo 6/6; backend **62/62** |

## Known follow-up (non-blocking)

- Extend `listInteractionsForUser` read-back for `request_mentor` / `ask_for_intro` / `apply` so done-state survives reload (writes persist; UI optimistic today).

## Top priority next

1. **Newsletter pilot ops** on production (subscribers, compile, send, inbound Worker or manual reply).
2. **Wave 19+** when scale warrants: public newsletter archive, agent credits (≥50 active users).
3. Zeabur env: confirm `MINIMAX_API_KEY` if testing LLM assist live.

## Key paths

| Concern | Path |
|---------|------|
| Wave 18 goal | `docs/waves/wave18-platform-depth.md` |
| LLM rerank | `apps/backend/src/lanes/community/llm-rerank.ts` |
| Rank suggestions | `apps/backend/src/lanes/personal/index.ts` |
| Deep links | `packages/shared/src/wave18-external-agent.ts` |
| Phase 2 actions | `apps/web-org/lib/use-community-interactions.ts` |

## Warnings

- LLM features noop/fallback without `MINIMAX_API_KEY`.
- Zeabur manual restart if 502 after orchestrate-only commits on `main`.
