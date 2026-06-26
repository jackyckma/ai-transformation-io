<!-- orchestrate handoff
task: web-org-wave19
branch: orch/wave19-editorial-review/web-org-wave19
agentId: bc-29d20594-e567-478d-9870-49b5fa500672
runId: run-06331d73-6877-4da2-b9be-1788c84414bc
resultStatus: finished
finishedAt: 2026-06-26T13:43:05.007Z
-->

Done. Branch pushed, no PR opened (planner owns integration).

## Status
success

## Branch
`orch/wave19-editorial-review/web-org-wave19`

## What I did
- **`apps/web-org/components/editorial-queue.tsx`** (only file changed):
  - Imported `editorialAgentReviewSchema` + `EditorialAgentReview` from `@ai-transformation/shared` (barrel re-exports `wave19-editorial`, imports cleanly).
  - Added `readAgentReview(metadata)` — safe-parses `metadata.editorial_agent` via the shared zod schema, returns `null` if absent/malformed (no crash on legacy drafts).
  - **DraftCard**: renders a secondary, agent-attributed `AgentReviewBlock` when present. Success state shows an "AGENT REVIEW" label, `Score N/100`, the summary, flags as small bordered chips, and `Reviewed by {model}`. Skip state (`'skipped' in review`) shows a muted dashed-border "Agent review skipped · {reason}" badge. `View full article` toggle and Approve/Reject buttons are byte-for-byte unchanged.
  - **EditorialQueue header**: added a "Run agent review" button that POSTs to `${apiBase()}/api/internal/editorial/review-pending` with `credentials:'include'`, shows pending ("Running agent review…") + inline error states, reuses the existing `ACCESS_DENIED` convention (sets accessDenied on 401/403), and calls `loadQueue()` on success so new `editorial_agent` metadata appears.
- Screenshot artifact (success + skipped cards, light theme): `/workspace/artifacts/editorial-agent-review-cards.png` (not committed — keeps the diff to web-org only). Captured via dev server + a throwaway `shotdemo` route + one-off `playwright` from `/tmp` (no `package.json` touched); temp route and temporary `DraftCard` export both reverted.

## Measurements
- `pnpm --filter @ai-transformation/web-org build`: pass == pass
- `pnpm --filter @ai-transformation/web-org typecheck`: pass == pass
- files changed under apps/web-org/**: 1 (editorial-queue.tsx)
- LOC(apps/web-org/components/editorial-queue.tsx): 315 → 411

## Verification
live-ui-verified

Rendered both states live (dev server + Playwright screenshot) confirming the success block (score/flags/summary/model), the skipped badge, and unchanged Approve/Reject/View-full-article. Build + typecheck pass.

## Notes, concerns, deviations, findings, thoughts, feedback
- **Pillar 5 (.org P1 polish) DEFERRED** — explicitly optional, and skipped to keep this slice low-risk and diff-focused. (a) "More in Knowledge" related links: `knowledge-object-view.tsx` only loads the single object via `objects.get(id)` — a related-links block would need a new list fetch (e.g. `objects.list`) and relatedness heuristic, which is net-new behavior, so I left it out rather than guess. (b) Inline Saved/Followed confirmation lives in shared `SaveButton`/community interaction components, not in the files this brief scoped me to touch first; deferring avoids risk on shared affordances. Recommend a follow-up task scoped to those components.
- The skipped/success discrimination uses `'skipped' in review`, which TypeScript narrows correctly against the shared union (skip schema has `skipped: literal(true)`, success does not).
- `readAgentReview` tolerates legacy drafts with no `editorial_agent` and any malformed payload — returns `null`, so cards render exactly as before when the backend hasn't reviewed them.
- No backend/packages/web-io/combined/docs files touched; `git status` shows only `editorial-queue.tsx` (plus the uncommitted `artifacts/` screenshot).

## Suggested follow-ups
- Publish a small follow-up for pillar 5 scoped to `apps/web-org/components/knowledge-object-view.tsx` (+ a `SaveButton`/community-interactions slice) for "More in Knowledge" related links and inline Saved/Followed confirmation.
- Optional: wire the new `GET /api/v1/objects/catalog` into a `/for-agents` discoverability surface on .org (separate from this editorial slice).