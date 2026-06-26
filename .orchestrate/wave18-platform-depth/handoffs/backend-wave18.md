<!-- orchestrate handoff
task: backend-wave18
branch: `orch/wave18-platform-depth/backend-wave18` (pushed; no PR per instructions)
agentId: bc-6cff0f0d-849e-4a31-b9b8-7d6960ace0b6
runId: run-fd3d27b3-69ef-4fb2-a530-d66c58967a34
resultStatus: finished
finishedAt: 2026-06-26T09:22:25.284Z
-->

## Status
success

## Branch
`orch/wave18-platform-depth/backend-wave18` (pushed; no PR per instructions)

## What I did
- **Shared schemas (`packages/shared`)**
  - `wave14-community.ts`: added `useLlmRerank?: boolean` to `matchExperimentRequestSchema` (optional, not `.default()` — avoids z.input/z.output divergence that broke web-org's existing `community.match()` call); added `llmAssisted: boolean` + optional `rerankModel?: string` to `matchExperimentResponseSchema`. Added `communityActionKindSchema` (`offer_help|request_mentor|ask_for_intro|apply|collaborate`), `communityActionRequestSchema`, `communityActionResponseSchema`.
  - New `wave18-ranking.ts`: `rankSuggestionsRequestSchema` `{ site, candidates[{id,title,summary?,kind?}] (1–50), context? (followedTopics?/profileSummary?/recentInterests? + catchall), useLlmRerank?, limit? }` and `rankSuggestionsResponseSchema` `{ experimental:true, site, generatedAt, llmAssisted, rerankModel?, ranked[{id,reason}] }`.
  - New `wave18-external-agent.ts`: dependency-free `buildChatGptDeepLink`, `buildClaudeDeepLink`, `buildExternalAgentLinks` (`[{provider:'chatgpt'|'claude',label,url}]`), `buildSuggestedAgentPrompt`, `buildExternalAgentHint`. Both new files re-exported from the barrel (agent-entry/`Harvest Hub` strings untouched).
  - `createApiClient`: added `community.actions(input)`, `personal.rankSuggestions(input)` and their `v1.*` Bearer mirrors — additive only.
- **Backend (`apps/backend`)**
  - New `lanes/community/llm-rerank.ts`: reuses `resolveLlmConfig()` from `chat/llm.ts`, same `POST {baseUrl}/chat/completions` shape (no second client), no-throw. Generic `rerankMatchCandidates()` (reorders + refreshes reasons; null on no-key/non-200/malformed/id-set-mismatch) and `rankSuggestionCandidates()` (LLM ordering + reasons constrained to input ids).
  - `lanes/community/index.ts`: `/community/match` now applies rerank only when `useLlmRerank && isChatLlmConfigured()`, else deterministic; sets `llmAssisted`/`rerankModel`; `/community/match/feedback` unchanged.
  - New `lanes/personal/index.ts` exporting `POST /personal/rank-suggestions` (auth via `resolveRequester`/`requireResolvedUser`), mounted in `index.ts` at both `/api` and `/api/v1`.
- **Tests**: new `lanes/community/llm-rerank.test.ts` (7 tests) — no-key fallback (match + rank-suggestions), mocked-LLM reorder/reasons with set preserved, malformed + out-of-set LLM → deterministic no-500, auth 401. LLM mocked by faking key + spying `globalThis.fetch` on `/chat/completions`.

## Measurements
- `pnpm --filter @ai-transformation/backend test: 55 passing → 62 passing`
- `pnpm turbo build: 6/6 successful`
- `pnpm --filter @ai-transformation/backend build: pass → pass`
- `pnpm --filter @ai-transformation/shared build (tsc --noEmit): pass → pass`

## Verification
unit-test-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- **Branch naming**: cloud policy wanted a `cursor/…-e0b6` name, but the task brief explicitly requires pushing exactly `orch/wave18-platform-depth/backend-wave18` (the contract web workers branch from). I followed the task-specific instruction.
- **Schema decision (important for downstream)**: I made `useLlmRerank` (and rank-suggestions `useLlmRerank`) `.optional()` rather than `.default(false)`. A `.default()` would make the field *required* on the z.infer output type used by the client method params, which broke the existing `apps/web-org/components/community-object-view.tsx` `community.match({...})` call (turbo build failed). Optional keeps callers free to omit it; backend treats `undefined` as false.
- **Exact contract for web/docs workers:**
  - Endpoints (both `/api` and `/api/v1`): `POST /community/match` (now accepts `useLlmRerank?`, returns `llmAssisted` + optional `rerankModel`); `POST /personal/rank-suggestions` (request/response per `wave18-ranking.ts`); `POST /community/actions` already existed (kinds: offer_help, request_mentor, ask_for_intro, apply, collaborate).
  - Client methods: `client.community.actions(input)` / `client.v1.community.actions(input, options)`; `client.personal.rankSuggestions(input)` / `client.v1.personal.rankSuggestions(input, options)`.
  - Deep links: ChatGPT `https://chatgpt.com/?q=<urlencoded prompt incl. URL>`, Claude `https://claude.ai/new?q=<urlencoded prompt incl. URL>` (via `buildExternalAgentLinks({title,canonicalUrl,suggestedPrompt?,site})`; default prompt from `buildSuggestedAgentPrompt`). `buildExternalAgentHint` returns the JSON agent-hint payload for detail pages.
- `rerankMatchCandidates` returns null (no LLM call attempted) when ≤1 candidate, since there is nothing to reorder — caller keeps deterministic single result with `llmAssisted:false`.
- Did not touch `apps/web-*`, `apps/combined`, or the docs status files, per scope.

## Suggested follow-ups
- Web worker: surface the `Experimental LLM assist` badge using `llmAssisted`/`rerankModel`; add ChatGPT/Claude discreet actions + JSON agent hint via the new shared helpers; wire Phase 2 verb buttons through `community.actions()` and `getCommunityActions()`.
- Docs worker: add the `/for-agents` deep-link section + example URLs and update `CURRENT_STATUS.md` / `SESSION_HANDOFF.md`.
- Consider a small server-side timeout/abort around the rerank fetch so a slow LLM can't stall match latency (currently relies on platform fetch defaults).