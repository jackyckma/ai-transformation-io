<!-- orchestrate handoff
task: web-org-harvest
branch: orch/wave5-harvest/web-org-harvest
agentId: bc-535d61b2-0dec-4d6b-8b7a-b0dc55e9a5f1
runId: run-fc6dcee4-a9b2-4e92-90e5-bef52923933e
resultStatus: finished
finishedAt: 2026-06-19T17:52:17.598Z
-->

## Status
success

## Branch
`orch/wave5-harvest/web-org-harvest`

## What I did
- Built Wave 5 Harvest Hub UI in `apps/web-org` only, with plain `fetch` + `API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? ''` everywhere and `credentials: 'include'` on all authed requests.
- Replaced placeholder pages with server wrappers + metadata:
  - `apps/web-org/app/stories/page.tsx` → renders new client `StoryList`.
  - `apps/web-org/app/stories/submit/page.tsx` → renders new client `StoryForm`.
  - `apps/web-org/app/prompts/page.tsx` → renders new client `PromptReply`.
  - Added `apps/web-org/app/moderation/page.tsx` → renders new client `ModerationPanel`.
- Added new client components:
  - `apps/web-org/components/story-list.tsx`
    - Fetches `GET /api/stories` on mount.
    - Renders published stories with title, author fallback, featured badge, date, excerpt.
    - Handles loading, empty state (`No stories published yet — be the first to share.`), error state, retry, and CTA link to `/stories/submit`.
  - `apps/web-org/components/story-form.tsx`
    - Checks `GET /api/auth/me` on mount.
    - Signed-out: shows friendly sign-in prompt linking to `${API_BASE}/api/auth/google?return=/stories/submit`.
    - Signed-in: validated form for `POST /api/stories` (title 4..160, body 50..8000, name <=120) with submitting/success/error states and moderation-review confirmation.
  - `apps/web-org/components/prompt-reply.tsx`
    - Fetches `GET /api/prompts/current` and auth state.
    - Handles `prompt: null` empty state.
    - Logged-out: shows prompt + sign-in link `${API_BASE}/api/auth/google?return=/prompts`.
    - Logged-in: validated reply form posting to `POST /api/prompts/:id/replies` (10..5000) with submitting/success/error states.
  - `apps/web-org/components/moderation-panel.tsx`
    - On mount, fetches `/api/auth/me` then `GET /api/stories/moderation` with credentials.
    - Gracefully handles 401/403 with `You do not have moderation access.`.
    - Groups queue by status and renders title/author/email/body/status.
    - Action buttons for publish/feature/archive/spam use `PATCH /api/stories/:id` and refresh state immediately after successful PATCH.
- Updated nav:
  - `apps/web-org/components/site-chrome.tsx` now includes `/moderation` link.
- Captured UI recording artifact for changed routes:
  - `/workspace/artifacts/wave5-web-org-harvest-ui.webm`
- Ran required gates successfully.
- Committed and pushed:
  - Commit: `a905947`
  - Branch pushed: `orch/wave5-harvest/web-org-harvest`

## Measurements
(none)

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- Only `apps/web-org/**` tracked files were modified; `packages/shared`, `apps/backend`, `apps/web-io`, and `apps/combined` were untouched.
- No new imports were added from `@ai-transformation/shared`.
- `artifacts/` is intentionally untracked (contains the recording output only).
- I did not open a PR per your branch-discipline instruction.

## Suggested follow-ups
- Add a small e2e smoke suite for these four routes (signed-out and signed-in states) once backend/staging auth is available for stable CI assertions.
- Consider adding pagination/truncation controls for long moderation/story bodies if queue volume grows.