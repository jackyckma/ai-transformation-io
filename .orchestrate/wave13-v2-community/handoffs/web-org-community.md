<!-- orchestrate handoff
task: web-org-community
branch: orch/wave13-v2-community/web-org-community
agentId: bc-c2c8b098-9fb7-4c02-92bc-b3ef19b7810d
runId: run-290d2898-6a42-4ee2-8d12-6245ae7bf025
resultStatus: finished
finishedAt: 2026-06-24T13:43:49.367Z
-->

All work is complete and verified. The branch `orch/wave13-v2-community/web-org-community` is pushed with my commit. Per the orchestrator's branch discipline, I am not opening a PR (the planner owns integration). Artifacts are saved at `/workspace/artifacts/wave13-community/`.

## Status
success

## Branch
`orch/wave13-v2-community/web-org-community`

## What I did
- **`apps/web-org/app/community/[id]/page.tsx`** (new): dynamic community detail route delegating to the view component.
- **`apps/web-org/components/community-object-view.tsx`** (new): renders a community object + its public replies via `getApiClient().community.getWithReplies(id)`, with per-type working actions — Reply (`community.reply`), Save (`use-bookmarks`/`SaveButton`), Follow/Unfollow, Offer help (help_request), Join/Leave (event). Members get full actions; guests get public read + sign-in prompts. Phase 2 reserved types (via `isCommunityPhase2ReservedType` + `getCommunityActions`) render all verbs — including **Match** — as labeled "· coming soon" affordances.
- **`apps/web-org/lib/use-community-interactions.ts`** (new): hook seeding/optimistically toggling follow/join/offer_help state through `getApiClient().community.*`.
- **`apps/web-org/lib/object-display.ts`**: added `COMMUNITY_VERB_LABEL`/`communityVerbLabel` (shared taxonomy → human labels) and `communityHref`.
- **`apps/web-org/components/community-highlights.tsx`**: cards now link to `/community/[id]` and expose real wired actions (Save/Follow/Join/Offer help + Reply/Open) instead of the disabled "Wave 13" placeholders; reserved types show coming-soon chips; sample-card fallback retained for empty/error.
- **`apps/web-org/components/ask-modes.tsx`**: Find Help now creates a community-visible `help_request` via the unified `objects.saveDraft` + `objects.submit` (honoring publish preference); Submit still creates a contribution via `contributions.*` (same endpoint an external agent uses); Capture stays a private note; guest localStorage fallback retained; removed stale "Wave 13" copy.
- **`apps/web-org/app/for-agents/page.tsx`**: documents the community read/write/action endpoints (`/api/v1/community/*`, `/api/v1/objects`, `/api/v1/contributions`) + Phase 2 reserved types and the `match` stub, noting parity with on-site Ask Submit/Find Help.
- **`data/curated/org-home.json`**: community summaries reflect live participation.

## Measurements
- `pnpm --filter @ai-transformation/web-org typecheck`: pass == pass
- `pnpm --filter @ai-transformation/web-org build`: success == success
- community routes (`/community`, `/community/[id]`, `/ask`, `/for-agents`) HTTP: 200 == 200
- web-org app routes: 12 → 13 (added `/community/[id]`)

## Verification
live-ui-verified

I ran the web-org dev server against a throwaway mock API implementing the shared `community`/`objects`/`personal` contracts and drove headless Chrome to confirm real behavior. Artifacts in `/workspace/artifacts/wave13-community/`: `detail-discussion-member.png` (Reply composer + Save/Follow + replies), `detail-help-member.png` (Offer help composer), `detail-event-member.png` (Join), `detail-question-reserved.png` (Match + verbs as "coming soon"), `community-member.png` (cards with per-type wired actions + reserved card), `detail-discussion-guest.png`/`community-guest.png` (public read + sign-in prompts), `ask-find-help.png` (unified-write copy), `for-agents.png` (community API docs).

## Notes, concerns, deviations, findings, thoughts, feedback
- Branch naming: the cloud harness requested a `cursor/<name>-810d` prefix, but the orchestrator brief required pushing exactly `orch/wave13-v2-community/web-org-community`. I followed the orchestrator since the planner integrates by that name. No PR opened (planner owns integration).
- The live backend isn't integrated yet; I built strictly against the shared client contract. Card interaction state seeds via `community.listInteractions` and filters by the current `userId` (the list request has no `mine` filter) — if the backend instead returns only the caller's interactions, the filter is a harmless no-op. Confirm during backend integration.
- Per-card `useCommunityInteractions` issues one `listInteractions` call per member-visible card on `/community`; fine for the small published set today, but the backend may want a batched/`mine` endpoint if community volume grows.
- `next lint` is unconfigured in this repo (prompts interactively); the Next build's own "Linting and checking validity of types" step passes, so lint is covered there.
- Dependencies were not preinstalled in the VM (`pnpm install` needed before typecheck/build) — same finding as shared-foundation; an env-setup agent could preinstall to speed future runs.

## Suggested follow-ups
- Backend lane: implement `/api/community/*`, `/api/v1/community/*`, and community-object creation through `/api/objects` (+ `/api/v1/objects`) to match the schemas this UI consumes; verify the live `/community` + `/community/[id]` flows end to end.
- Consider a `mine` filter (or caller-scoped response) on `community.listInteractions` to avoid per-card seeding cost.
- Optionally add an "offered help" count/visibility on help_request detail once the backend exposes interaction aggregates.