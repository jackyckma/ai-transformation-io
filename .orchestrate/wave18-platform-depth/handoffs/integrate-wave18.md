<!-- orchestrate handoff
task: integrate-wave18
branch: orch/wave18-platform-depth/integrate-wave18
agentId: bc-ad6aa609-ba60-4819-8705-43d64364ada6
runId: run-7f1ea586-f4c7-4740-9fb0-cacb35faff7e
resultStatus: finished
finishedAt: 2026-06-26T10:00:55.075Z
-->

## Status
success

## Branch
`orch/wave18-platform-depth/integrate-wave18`

## What I did
- Created integration branch from `orch/wave18-platform-depth/web-org-wave18`, then merged `origin/orch/wave18-platform-depth/web-io-wave18` with merge commit `2e4012d` (both parents preserved; backend/shared ancestor retained).
- Ran required install and verification on the integrated branch:
  - `pnpm install`
  - `pnpm turbo build`
  - `pnpm --filter @ai-transformation/backend test`
- Updated docs to mark Wave 18 shipped and reflect all three pillars:
  - `docs/CURRENT_STATUS.md`
  - `docs/SESSION_HANDOFF.md`
  - `docs/SITE_DESIGN_v2.md` (cross-ref/status alignment)
- Documented the explicit deferred follow-up (not fixed): backend `listInteractionsForUser` read-back gap for `request_mentor` / `ask_for_intro` / `apply`, while POST persistence already works.
- Committed and pushed integration/doc updates on the required branch:
  - `de2e0b8` — docs: mark wave18 platform depth shipped
  - `acfdbef` — docs: finalize wave18 handoff metadata
- Opened exactly one **draft** PR to `main`:
  - https://github.com/jackyckma/ai-transformation-io/pull/12
  - Title: `Wave 18: SITE_DESIGN_v2 platform depth (LLM-assist rerank + external-agent deep links + Phase 2 verbs)`

## Measurements
- `pnpm turbo build (successful tasks): 6/6 → 6/6`
- `pnpm --filter @ai-transformation/backend test (passing): 62 → 62`
- `draft PRs for this branch to main: 0 → 1`
- `merge conflicts integrating web-io branch: 0 == 0`

## Verification
unit-test-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- Integration is clean and includes all three required streams in one branch lineage: backend/shared ancestor (`ec0c735`) + web-org wave18 (`c44116f`) + merged web-io wave18 (`ff46d02`).
- Deferred follow-up is documented in both docs and PR body as requested: done-state rehydration for `request_mentor` / `ask_for_intro` / `apply` is currently optimistic per session because `listInteractionsForUser` read query excludes those kinds.
- No changes were made to `packages/shared/src/index.ts`.
- Cloud environment had no browser MCP available, so live member-auth + live-LLM UI states were not browser-recorded here; validation is via build/type/test plus upstream implementation handoffs and integrated test pass.

## Suggested follow-ups
- Extend backend `listInteractionsForUser` to include `request_mentor`, `ask_for_intro`, and `apply` so .org detail done-state survives reload.
- Run authenticated manual QA with an LLM key configured (`MINIMAX_API_KEY` or `CHAT_LLM_*`) to capture final UX evidence for:
  - `.org` Phase 2 action done-state UX
  - `Experimental · LLM assist` badge behavior when rerank is actually applied
  - external-agent deep-link rendering on member flows