<!-- orchestrate handoff
task: verify-wave21
branch: `orch/wave21-ui-p1-org-polish/web-org-wave21` (no new commits — verifier made no source changes)
agentId: bc-780a523d-104f-4bab-9682-50133cc1e4e7
runId: run-9423ac90-e92f-4acc-b317-4ec692d60d01
resultStatus: finished
finishedAt: 2026-06-27T13:43:02.954Z
-->

All criteria verified. Build and typecheck pass; code inspection confirms each deliverable; scope and PR state are clean.

## Verification
type-check-only

## Target
`web-org-wave21` on branch `orch/wave21-ui-p1-org-polish/web-org-wave21`

## Branch
`orch/wave21-ui-p1-org-polish/web-org-wave21` (no new commits — verifier made no source changes)

## Execution
- `pnpm install` → success (lockfile up to date, 237 packages, exit 0; no manifest changes needed).
- `pnpm --filter @ai-transformation/web-org typecheck` (`tsc --noEmit`) → **pass** (exit 0, no errors).
- `pnpm --filter @ai-transformation/web-org build` (`next build`) → **pass** (exit 0; "Linting and checking validity of types ✓", "Generating static pages (24/24) ✓"). `/knowledge/[slug]` and `/community/[id]` routes both compiled.
- `git diff --name-only $(git merge-base origin/main HEAD) HEAD` → exactly 7 files: `apps/web-org/components/{community-object-view,knowledge-object-view,save-button}.tsx`, `apps/web-org/lib/use-just-confirmed.tsx`, `docs/CURRENT_STATUS.md`, `docs/SESSION_HANDOFF.md`, `docs/waves/wave21-ui-p1-org-polish.md`. No backend/shared/web-io/combined/data/scripts. (Note: stale local `main` ref also shows `.orchestrate/*`; the correct merge-base diff is clean — those orch state files are not in HEAD's change set.)
- `git diff` grep for `package.json`/`pnpm-lock` → none; `use-community-interactions.ts` → NOT touched. No new dependency/toast lib.
- `gh pr view 14` → ONE PR, `isDraft: true`, `state: OPEN`, `baseRefName: main`, `mergedAt: null`. Code-inspected source files + the `.io` `save-to-context.tsx` reference and `knowledge-objects.tsx` source pattern.

## Findings
Per acceptance criterion:
- [x] **More in Knowledge footer**: met. `MoreInKnowledge` (`knowledge-object-view.tsx:179-238`) fetches `getApiClient().objects.list({ site:'org', objectType:'knowledge', status:'published' })` — identical to `knowledge-objects.tsx:31-34` (no new backend). Filters to `KnowledgeObjectRecord` excluding `object.id === currentId`; orders same-subtype-first via `sameType`/`rest` partition; caps with `.slice(0, 4)`. Each row links to `/knowledge/${encodeURIComponent(sibling.id)}` showing `subtypeLabel(sibling.type)` + `objectTitle(sibling)`. Renders `null` on `catch` and on 0 siblings. Secondary editorial styling (uppercase `var(--secondary)` label, `var(--border)` top divider) — not a hero. Rendered after `ObjectComments`, before `← All knowledge`.
- [x] **Inline Followed confirmation**: met. `useJustConfirmed(active)` helper (`use-just-confirmed.tsx`, `CONFIRM_MS = 1600`, cleanup on unmount, mirrors `.io` `save-to-context.tsx`'s justSaved/1600ms pattern). Follow `InteractionButton` (`community-object-view.tsx:339-348`) passes `confirmLabel="Followed"`; click calls `markInteracted()` then `interactions.toggle('follow')`. Hook flashes a check (`ConfirmCheckGlyph`) + "Followed" only on a user-initiated false→true `active` transition; unfollow (true→false) and the initial async load flip show nothing (guarded by `interactedRef`). `aria-pressed={active}`, `disabled={pending}`, and Following/Follow labels intact. `use-community-interactions.ts` untouched. No new dependency.
- [x] **Optional SaveButton confirmation**: met (SHIPPED). `save-button.tsx` uses `useJustConfirmed(saved)` to flash the same brief check before settling on "Saved". Props (`target/title/saved/pending/onToggle`) unchanged → backward-compatible for all callers (knowledge + community detail, knowledge index); toggle-off shows no confirmation. Documented as shipped in the wave doc.
- [x] **English/editorial/light+dark; scope; build+typecheck**: met. All copy English ("More in Knowledge", "Followed", "Saved"); muted token-based styling (`var(--border)/--muted/--secondary/--accent`) consistent with light+dark theming (no hard-coded colors that break dark mode); diff limited to `apps/web-org/**` + `docs/**`; build + typecheck both pass (above).
- [x] **Docs + single draft PR**: met. `docs/CURRENT_STATUS.md` (Wave 21 shipped bullet + summary line bump), `docs/SESSION_HANDOFF.md` (landed-vs-deferred, build/typecheck, branch + draft PR, struck old deferred line, Wave 20+ next), `docs/waves/wave21-ui-p1-org-polish.md` (DoD all ✅, optional item recorded as shipped, as-built task tree). Exactly one DRAFT PR #14 to `main`, not ready, not merged.

Other findings (severity-ordered):
- (low) `useJustConfirmed`: `interactedRef` is reset to `false` only inside the transition branch (after the `prev === active` early-return). If a user clicks but `active` never changes (e.g. toggle errors / no-op), `interactedRef` stays `true`, so a *later* load-driven false→true flip could flash a spurious confirmation. Narrow edge case, does not affect the normal follow/unfollow/save flows or any acceptance criterion; not blocking.
- (low) No automated test exercises the ~1.6s flash; cloud env has no browser MCP and the follow flow needs a signed-in member session + live backend, so the visual timing was confirmed by code inspection only, not live rendering (honest `type-check-only`).

## Notes & suggestions
- Verification is build/typecheck + thorough code/route inspection; UI timing states are "build/typecheck + code-inspection verified," not live pixel-verified (no browser MCP in env, as expected). A follow-up with a member session could live-confirm the 1.6s "Followed"/"Saved" flash and that unfollow shows nothing.
- All three deliverables (including the optional SaveButton) shipped; no scope creep; `use-community-interactions.ts` untouched; no new dependencies. The branch is in good shape to integrate.