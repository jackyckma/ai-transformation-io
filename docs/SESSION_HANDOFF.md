# Session handoff

**Date:** 2026-06-26  
**Branch:** `orch/wave18-platform-depth/integrate-wave18`  
**Latest commit:** `de2e0b8` — docs: mark wave18 platform depth shipped  
**Push status:** pushed (`orch/wave18-platform-depth/integrate-wave18`)

## Active task

- **Roadmap item:** `wave18-platform-depth`
- **Definition of done:** [wave18-platform-depth.md](./waves/wave18-platform-depth.md)
- **Status:** ✅ Implemented and integration-verified on the integration branch; draft PR to `main` prepared by this handoff.

## Current status

| Area | Status |
|------|--------|
| Wave 18 — LLM-assisted ranking | ✅ Shipped: optional rerank on matcher (`useLlmRerank`) + new `POST /api/v1/personal/rank-suggestions`, both with deterministic fallback on missing key or LLM failure |
| Wave 18 — external agent deep links | ✅ Shipped: shared helper (`packages/shared/src/wave18-external-agent.ts`), discreet ChatGPT/Claude links on `.io` and `.org` targets, `/for-agents#deep-links` docs on both sites, JSON hint script on detail pages |
| Wave 18 — Phase 2 intent verb UI parity (.org) | ✅ Shipped: `offer_help`/`request_mentor`/`ask_for_intro`/`apply` call persisted `community.actions()` from cards + detail actions via `getCommunityActions()`; Ask-prefill links remain secondary |
| Verification | ✅ `pnpm turbo build` (6/6) and `pnpm --filter @ai-transformation/backend test` (62/62) |
| Wave 19+ | ⏭️ Next: newsletter archive + agent credits/Stripe when active users reach threshold (≥50 users) |

## Known deferred follow-up (not fixed in Wave 18 integration)

- Backend `listInteractionsForUser` read query currently returns only `follow` / `offer_help` / `join`.
- Result: `.org` detail done-state for `request_mentor` / `ask_for_intro` / `apply` is optimistic per session.
- Writes are persisted via `POST /api/community/actions` (and `/api/v1/community/actions` parity), but done-state read-back after reload remains incomplete until list query expansion.

## How to verify

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
```

## Key paths

| Concern | Path |
|---------|------|
| LLM rerank + rank suggestions | `apps/backend/src/lanes/community/index.ts`, `apps/backend/src/llm/llm.ts`, `packages/shared/src/ranking.ts` |
| External deep links helper | `packages/shared/src/wave18-external-agent.ts` |
| .io deep-link surfaces | `apps/web-io/components/external-agent-links.tsx`, `apps/web-io/components/content-page-layout.tsx`, `apps/web-io/components/library-browser.tsx`, `apps/web-io/components/insights-cards.tsx`, `apps/web-io/app/for-agents/page.tsx` |
| .org Phase 2 verbs + deep links | `apps/web-org/lib/use-community-interactions.ts`, `apps/web-org/components/community-object-view.tsx`, `apps/web-org/components/community-highlights.tsx`, `apps/web-org/components/agent-deep-links.tsx`, `apps/web-org/app/for-agents/page.tsx` |

## Warnings

- Do not edit `packages/shared/src/index.ts` for Wave 18 integration (agent-entry protocol assertion depends on current text).
- Cloud env had no browser MCP; UI state was build/type validated rather than browser-screenshot verified for member-auth + live-LLM conditions.
