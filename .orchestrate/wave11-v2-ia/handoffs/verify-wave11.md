<!-- orchestrate handoff
task: verify-wave11
branch: `orch/wave11-v2-ia/integrate-wave11` (no verifier commits added — avoided pushing to the branch carrying the open draft PR the planner owns)
agentId: bc-f5a73b26-6a6c-45db-8975-0c33efd5a61a
runId: run-3cf13e89-bb4a-4679-a3ed-22ba7b73b196
resultStatus: finished
finishedAt: 2026-06-23T22:38:28.905Z
-->

I have run all verifications end-to-end. Here is my verifier handoff.

## Verification
live-ui-verified

## Target
`integrate-wave11` on branch `orch/wave11-v2-ia/integrate-wave11`

## Branch
`orch/wave11-v2-ia/integrate-wave11` (no verifier commits added — avoided pushing to the branch carrying the open draft PR the planner owns)

## Execution
- `git rev-list --parents -n 1 dbbd945` → `dbbd945 33ab412 6d2d34c` (merge commit has 2 parents: web-io-ia + web-org-ia).
- `pnpm install` → resolved, 8 workspace projects, done.
- `pnpm turbo build` → **6 successful, 6 total**, exit 0. Route manifests show io {`/`, `/library`, `/library/[slug]`, `/insights`, `/insights/assessment`, `/ask`, `/settings`, `/progress`, `/for-agents`} and org {`/`, `/knowledge`, `/knowledge/[slug]`, `/community`, `/ask`, `/settings`, `/apprenticeship`, …}; no legacy routes compiled.
- `pnpm --filter @ai-transformation/backend test` → **Test Files 7 passed; Tests 39 passed**, exit 0.
- Started both prod servers (`next start`, io:4101, org:4102) and curled real HTTP:
  - io v2: `/ /library /insights /ask /settings` → all 200; `/library/what-is-ai-transformation` → 200.
  - io legacy: `/frameworks /playbook /functions /assessment-hub` → all **404, redirect_url empty** (no redirect).
  - org v2: `/ /knowledge /community /ask /settings` → all 200; `/knowledge/what-is-ai-transformation` → 200.
  - org legacy: `/learn /stories /stories/submit` → all **404, redirect_url empty**.
- Inspected served HTML: io ribbon = `Home·Library·Insights·Ask`; org ribbon = `Home·Knowledge·Community·Ask`; org home contains `Community · Knowledge commons`; `/insights` & `/community` contain placeholder cues (placeholder / "Wave 13" / highlights).
- Read shared `packages/shared/src/ask-modes.ts` `ASK_MODE_ACCESS` vs `docs/SITE_DESIGN_v2.md` §4 table → exact match.
- `gh pr list` → PR #5 OPEN, **isDraft true**, head `orch/wave11-v2-ia/integrate-wave11`, title "Wave 11: SITE_DESIGN_v2 Phase 1 IA shell + Ask modes" (not merged, not ready).

## Findings
Per acceptance criterion:
- [x] web-org-ia merged with both parents in history: merge `dbbd945` → parents `33ab412` (web-io-ia) + `6d2d34c` (web-org-ia). met
- [x] `pnpm turbo build` passes for web-io and web-org: 6/6 tasks successful, exit 0. met
- [x] `pnpm --filter @ai-transformation/backend test` passes: 39/39 across 7 files. met
- [x] docs/CURRENT_STATUS.md + SESSION_HANDOFF.md updated for Wave 11 shipped: CURRENT_STATUS line 7 "Wave 11 … shipped ✅ on both sites", line 14 §15 housekeeping removals, line 33 "Wave 12 (Phase 2) … next"; both files match `Wave 11`. met
- [x] One DRAFT PR to main, not merged/ready: PR #5 draft+open. met

Planner-level §4 / ribbon matrix:
- [x] (a) io ribbon `Home·Library·Insights·Ask` / org `Home·Knowledge·Community·Ask`, labels stable across auth: ribbons rendered from static `IO_RIBBON`/`ORG_RIBBON` consts in server `SiteHeader` (not auth-gated); confirmed in live HTML. met
- [x] (b) /library & /knowledge list + `<slug>` pages; /insights & /community placeholders: live 200s + SSG slug pages + placeholder HTML. met
- [x] (c) /ask matrix matches §4: shared `ASK_MODE_ACCESS` = io{guest:[ask], member:[ask,capture]}, org{guest:[ask], member:[ask,capture,submit,find-help]} — identical to §4 table; both `ask-workspace`/`ask-modes` consume it via `getAllowedAskModes`/`isAskModeAllowed`. met
- [x] (d) legacy hub routes gone, no redirects: route dirs absent on disk; no `redirects()`/`rewrites()` in either `next.config.ts`; live 404 with empty redirect_url. met
- [x] (e) org brand "Community · Knowledge commons": present in layout metadata, site-chrome, json-ld, home — live HTML confirmed. met
- [x] (f) hamburger holds Agent API + Settings + auth on both: io `MobileNavDrawer` (AuthNav + Settings + "Agentic access API"); org `MobileNavDrawer` (AuthNav + `ORG_HAMBURGER_LINKS`: Settings, "Agentic Access API", About). met

Other findings:
- (low) Ask **member** modes (capture/submit/find-help) and logged-in home/ribbon were verified via code + shared §4 access map and a passing build, not via a live authenticated session (no test session/creds in env). Guest state (Ask-only + "Sign in for Capture / unlock…" copy) is confirmed in code; the tablist is a client component so it is not in raw SSR HTML. Auth-state label stability is guaranteed structurally (ribbon consts are not auth-conditioned).
- (low) `docs/CURRENT_STATUS.md` line 14 lists the removed io route as `/assessment` rather than `/assessment-hub`; the `/assessment-hub` app dir is confirmed absent (404, no redirect), so this is a doc-wording nit only.
- (low) Turbo warns "no output files found" for `@ai-transformation/content`/`shared` build tasks — pre-existing `turbo.json` outputs-key cosmetic warning, builds still succeed.

## Notes & suggestions
- All five integrate-wave11 criteria and all six planner ribbon/mode criteria are met with live HTTP + build + test evidence. I left no commits on the branch to avoid altering the open draft PR #5.
- If a stricter live check of the member Ask matrix and logged-in home is desired in Wave 12, seed a test session (mock `useAuthUser`/session cookie) and assert the rendered tablist shows the full mode set per site.