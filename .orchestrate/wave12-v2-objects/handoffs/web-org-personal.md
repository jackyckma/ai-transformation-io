<!-- orchestrate handoff
task: web-org-personal
branch: orch/wave12-v2-objects/web-org-personal
agentId: bc-47012463-a432-43f9-a555-a923eba85221
runId: run-d4666f58-ca71-4a9a-a725-8a3680f69a30
resultStatus: finished
finishedAt: 2026-06-24T10:34:18.670Z
-->

Clean tree, all committed and pushed. The work is complete. Let me write the handoff.

## Status
success

## Branch
`orch/wave12-v2-objects/web-org-personal`

## What I did
Wired the ai-transformation.org Wave 12 object rendering + personal layer + generic moderation/publish UI in `apps/web-org`, consuming the shared-foundation `@ai-transformation/shared` Wave 12 schemas and `createApiClient` methods. All fetches are client-side (`'use client'` + `useEffect`), SSR-safe, and degrade gracefully when the parallel backend is unreachable.

- **Foundation** (`lib/api-client.ts`, `lib/object-display.ts`, `lib/use-bookmarks.ts`, `components/save-button.tsx`): browser-safe shared client via `resolveClientApiUrl`; visibility/type labels, title/excerpt/target helpers; a `useBookmarks` hook (loads member bookmarks once, optimistic toggle) and reusable `SaveButton`.
- **Knowledge**: `knowledge-objects.tsx` lists knowledge objects via the visibility-aware shared client (`objects.list`, status `published`) alongside the existing filesystem `BrowseCategories`; `knowledge-object-view.tsx` renders a single object by id (records recently-viewed, Save, public comments list+create); `app/knowledge/[slug]/page.tsx` now falls back to the object view for non-filesystem slugs. Replaced the Wave 11 placeholder tabs with real **My Library** (`my-library-panel.tsx`: bookmarks/notes/recently-viewed), **My articles** and **My comments** (`my-articles-panel.tsx`).
- **Community** (`community-highlights.tsx`): renders live community objects with type/visibility badges and §6 contextual Ask actions; Save wired to bookmarks; Reply/Follow/etc. kept as Wave 13 stubs; falls back to the existing sample highlights on empty/error.
- **Ask** (`ask-modes.tsx`): replaced `LocalDraftStub` with `AskComposer` — Capture → `notes.create` (private, `ask_capture`), Submit → `contributions.saveDraft` (knowledge `field_note`, `members-only`) then auto-submit only if the user's publish preference is `auto` (never elevates to public), Find Help → `objects.saveDraft` (community `help_request` draft). localStorage fallback for logged-out and on API failure.
- **Moderation** (`moderation-panel.tsx`): rebuilt on `moderation.list` / `moderation.transition` (generic queue across contributions+objects, grouped by lifecycle status, admin-gated via 401/403 detection).
- **Settings/Profile**: `publish-preference-form.tsx` (auto vs review via `publishPreference` API); `onboarding-profile-form.tsx` now persists via `profile` API when signed in with localStorage fallback; `app/settings/page.tsx` replaced the Wave 11 stubs.
- Ribbon labels/routes and the **Community · Knowledge commons** brand are unchanged; `data/curated/org-*.json` untouched (no CTA/path change needed). No files outside `apps/web-org/**` modified.

## Measurements
- `pnpm --filter @ai-transformation/web-org typecheck`: pass → pass
- `pnpm --filter @ai-transformation/web-org build`: 20 routes pass → 22 routes pass (backend unreachable)

## Verification
type-check-only

Build + typecheck pass with no backend reachable; all new data paths are client-side and resilient (loading/empty/error states). I could not exercise live API responses because the backend is built on a parallel branch and is not reachable from this clone, so I did not capture a runtime screen recording.

## Notes, concerns, deviations, findings, thoughts, feedback
- Contract assumptions worth a cross-worker sync: I rely on `objects.list` server-side visibility enforcement (anonymous → public; members → +members-only) and on `mine: true` returning the owner's drafts. `comments.list({ targetType, targetId })` is used for per-object public comments (the shared `PersonalListRequest` supports these fields).
- Find Help creates a `help_request` community **draft** with `visibility: 'public'` (its natural §5.3 audience) but status `draft`, so it is never auto-published; full reply/match parity stays Wave 13.
- Submit defaults knowledge contributions to `members-only`; auto-publish passes `visibility: 'members-only'` explicitly so the server never elevates to public.
- `next lint` has no committed ESLint config (interactive setup prompt) — pre-existing; `next build` runs lint+type validation and passes, so I treated that as the lint gate.
- Left `community-activity-dashboard.tsx` placeholder panels (Your contributions / Recent interactions) as-is — out of the listed acceptance scope; a follow-up could back them with `objects.list({ mine: true })`.
- `node_modules` was absent on the VM; I ran `pnpm install` (lockfile already up to date). An env-setup agent could preinstall workspace deps so future cloud agents skip bootstrap.

## Suggested follow-ups
- Backend worker: confirm `/api/objects`, `/api/personal/*`, `/api/moderation/queue`, `/api/settings/publish-preference`, `/api/profile` match the shared contract exactly (visibility + lifecycle transitions).
- Live-UI verification pass once backend is integrated: anonymous vs member visibility on /knowledge and /community, My Library/articles/comments, Ask writes, moderation queue, Settings publish preference — capture a screen recording then.
- Optionally back the .org Home dashboard "Your contributions"/"Recent interactions" panels with the objects/personal APIs (Wave 12 personal-layer completeness).