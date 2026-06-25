<!-- orchestrate handoff
task: shared-foundation
branch: orch/wave15-ui-readiness/shared-foundation
agentId: bc-c68df45c-bbc7-43fc-adf1-4178dcc44f32
runId: run-7964eacd-5955-45c8-aefe-863972cbb571
resultStatus: finished
finishedAt: 2026-06-25T12:31:07.828Z
-->

## Status
success

## Branch
`orch/wave15-ui-readiness/shared-foundation`

## What I did
- Updated brand copy in `packages/chat-ui/src/sidebar-chat.tsx`:
  - org companion title changed from `Harvest companion` to `Community companion`.
- Updated legacy prompt text in `packages/chat-ui/src/companion-home-entry.tsx`:
  - `What should I read first on Harvest Hub?` → `What should I read first in the community?`
- Added new presentational Ask-entry strip component at `packages/chat-ui/src/companion-ask-strip.tsx`:
  - Exported `CompanionAskStrip` with props `{ site: 'io' | 'org'; href?: string; label?: string; description?: string }`.
  - Uses plain `<a href>` (framework-agnostic), defaults to `/ask`, and does not start chat/session/streaming.
  - Styled with existing editorial conventions (`var(--border)`, `var(--card)`, `var(--accent)`, `font-serif`, muted light body copy).
- Exported the new component from `packages/chat-ui/src/index.ts`.
- Added `packages/chat-ui/src/node-globals.d.ts` so chat-ui typecheck can compile shared import usage of `process.env` without touching `packages/shared/**`.
- Verified only `packages/chat-ui/**` files changed in commit, then committed and pushed to the required branch.

## Measurements
- `rg -i "Harvest Hub|Harvest companion" packages/chat-ui matches: 2 → 0`
- `TypeScript errors (pnpm --filter @ai-transformation/chat-ui typecheck): 1 → 0`
- `Files outside packages/chat-ui changed in HEAD commit: 0 == 0`

## Verification
type-check-only

## Notes, concerns, deviations, findings, thoughts, feedback
- I did **not** modify `packages/shared/**` (including `packages/shared/src/index.ts`) to avoid breaking the backend agent-protocol assertion you flagged.
- Per your branch discipline, I did not open a PR.
- UI artifact captured (before/after state recording):  
  `/opt/cursor/artifacts/wave15-chat-ui-before-after.mp4`
- The artifact is a generated before/after visual handoff clip for this shared-package-only task (not an app-level live browser interaction), since scope forbids app/page changes in this worker.

## Suggested follow-ups
- Integrate `CompanionAskStrip` on list/index surfaces in `apps/web-io` and `apps/web-org` where full docked companion should be demoted in Wave 15 item 9.
- In web workers, run full `pnpm turbo build` plus backend tests after app-level adoption of the shared component.