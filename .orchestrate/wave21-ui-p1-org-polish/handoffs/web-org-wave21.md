<!-- orchestrate handoff
task: web-org-wave21
branch: orch/wave21-ui-p1-org-polish/web-org-wave21
agentId: bc-06250c38-6ae9-44fb-9c2f-b73bc2c0d671
runId: run-29de261e-23b6-4a97-b324-230f1c1daff2
resultStatus: finished
finishedAt: 2026-06-27T13:37:41.727Z
-->

## Status
success

## Branch
`orch/wave21-ui-p1-org-polish/web-org-wave21`

## What I did
- **D1 — `More in Knowledge` footer** (`apps/web-org/components/knowledge-object-view.tsx`): new `MoreInKnowledge` component rendered after `ObjectComments`, before the `← All knowledge` link. It fetches siblings from the EXACT existing index source `getApiClient().objects.list({ site:'org', objectType:'knowledge', status:'published' })`, filters to `KnowledgeObjectRecord`, **excludes the current article** (`object.id !== currentId`), orders **same-subtype-first** (`object.type === currentType` partition prepended to the rest), and **caps at 4** via `.slice(0,4)`. Each row links to `/knowledge/${encodeURIComponent(id)}` showing `subtypeLabel` + `objectTitle`. On fetch failure or 0 siblings it renders `null`. Secondary editorial styling (uppercase `var(--secondary)` section label, `var(--border)` divider) — not a hero. No backend, no dependency.
- **D2 — inline `Followed` confirmation** (`community-object-view.tsx`): the `follow` `InteractionButton` now gets a `confirmLabel="Followed"`. New helper `apps/web-org/lib/use-just-confirmed.tsx` (`CONFIRM_MS=1600`, mirrors `.io` `save-to-context.tsx`) tracks a **user-initiated** false→true transition of `active`: the click calls `markInteracted()`, and only when `active` then flips idle→active does it flash an inline check + `Followed` for ~1.6s before settling to the persistent `Following`. Unfollow (active→idle) shows nothing; the initial async load flip shows nothing (guarded by the interaction flag). `aria-pressed`, disabled-while-pending, and labels are intact. **I did NOT touch `use-community-interactions.ts`** — all logic lives in the helper + button.
- **D3 (optional) — SHIPPED**: `save-button.tsx` uses the same `useJustConfirmed(saved)` helper to flash a brief check on a successful save. SaveButton stays controlled/backward-compatible (props unchanged), so all callers (knowledge + community detail, knowledge index) are unaffected; toggle-off shows no confirmation. Shipped because it reuses the identical low-risk helper with zero caller changes.
- **Docs**: updated `docs/CURRENT_STATUS.md` (Wave 21 bullet + date/summary bump), `docs/SESSION_HANDOFF.md` (landed vs deferred, build/typecheck, branch/PR; struck the old deferred line), and `docs/waves/wave21-ui-p1-org-polish.md` (Definition of Done all ✅, optional item recorded as shipped, task tree as-built).
- Opened ONE draft PR to `main`: https://github.com/jackyckma/ai-transformation-io/pull/14 (used the orchestrator-mandated `orch/...` branch name via prefix-check override).

## Measurements
- `pnpm --filter @ai-transformation/web-org typecheck (tsc --noEmit)`: pass → pass
- `pnpm --filter @ai-transformation/web-org build`: 24/24 pages → 24/24 pages
- `git diff --name-only main...HEAD`: 7 files, all under `apps/web-org/**` + `docs/**`
- More in Knowledge siblings cap: `<= 4`

## Verification
type-check-only

(Build + `tsc --noEmit` both pass and I inspected the logic carefully. I did not run the app live / capture a screenshot — the cloud env had no running server and rendering the follow/confirmation flow requires a signed-in member session + backend. No live UI repro was performed; a verifier should confirm the ~1.6s flash visually.)

## Notes, concerns, deviations, findings, thoughts, feedback
- **Branch-prefix conflict:** the PR tool requires a `cursor/` prefix, but the orchestrator task mandated exactly `orch/wave21-ui-p1-org-polish/web-org-wave21`. I honored the orchestrator and set `skip_branch_prefix_check=true` so the planner's reconcile loop can track the branch it expects.
- **Helper file extension:** `use-just-confirmed` contains the `ConfirmCheckGlyph` JSX, so it is `.tsx` (an initial `.ts` failed typecheck). It exports both the hook and the glyph.
- **D2 implementation choice:** because `toggle('follow')` is async/void with no direction, I detect the transition in the button via a prev-value ref + a user-interaction flag rather than awaiting the hook. This keeps `use-community-interactions.ts` untouched and avoids regressing join/offer/act/intent verbs. The `join` button intentionally has no `confirmLabel`, so it’s unchanged.
- `.orchestrate/` was never staged; diff is clean to `apps/web-org/**` + `docs/**`.

## Suggested follow-ups
- A verifier with a member session should visually confirm the ~1.6s `Followed`/`Saved` check flash and that unfollow shows nothing (live-ui-verify).
- The same `useJustConfirmed` helper could later be applied to `.org` list/card SaveButtons and the `join` affordance if product wants confirmation parity there.