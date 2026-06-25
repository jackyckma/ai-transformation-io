<!-- orchestrate handoff
task: web-org-editorial
branch: `orch/wave16-content-supply/web-org-editorial` (pushed exactly as requested — the env's `cursor/*-c14c` policy was not enforced on push, so the upstream's re-key concern does not apply here)
agentId: bc-d2dbb4d2-cdca-4ed6-b03d-fbbe6c77c14c
runId: run-4c82a77c-140a-43b8-95ae-66508e819a48
resultStatus: finished
finishedAt: 2026-06-25T16:59:18.118Z
-->

Done. Only `apps/web-org/**` changed, build + typecheck pass, branch pushed, and I captured live screenshots of the populated queue.

## Status
success

## Branch
`orch/wave16-content-supply/web-org-editorial` (pushed exactly as requested — the env's `cursor/*-c14c` policy was not enforced on push, so the upstream's re-key concern does not apply here)

## What I did
- **`apps/web-org/app/editorial/page.tsx`** (new, 17 lines) — thin route mirroring `app/moderation/page.tsx`: `PageShell width="wide"` wrapping the client component, `robots: noindex`.
- **`apps/web-org/components/editorial-queue.tsx`** (new, 244 lines) — client component modeled on `moderation-panel.tsx`. Fetches `GET /api/internal/editorial/drafts` credentialed via `resolveClientApiUrl` base; renders each draft (objectType, subtype, site, created date, optional source label, body excerpt); Approve → `POST .../:id/approve` and Reject → `POST .../:id/reject`, removing the draft from the list on success. Reuses the same admin-gate pattern (401/403 → "You do not have editorial access."), loading/empty/error/retry states, and editorial Tailwind tokens. Reuses `formatDate`/`subtypeLabel` from `lib/object-display`.
- Adapted the UI to the real `GET /drafts` response (it returns `objectType`, `bodyExcerpt`, `title|null` — no `entityType`), so no backend change was needed.

## Measurements
- `pnpm --filter @ai-transformation/web-org typecheck: pass`
- `pnpm --filter @ai-transformation/web-org build: pass` (`/editorial` route present, 3.06 kB)
- `files changed vs starting branch: 2 (apps/web-org only) == 2`
- `LOC added: 0 → 261`

## Verification
live-ui-verified

Ran the web-org dev server against a local mock of the L12 endpoints (correct response shape) and captured the rendered queue with three pending drafts and working Approve/Reject controls, light + dark:
- `/opt/cursor/artifacts/editorial-queue-light.png`
- `/opt/cursor/artifacts/editorial-queue-dark.png`

The dark capture shows the toggle flipped to "Light", confirming the dark theme is preserved. Build + typecheck both pass.

## Notes, concerns, deviations, findings, thoughts, feedback
- **Admin gate is client-side only**, identical to `/moderation`: it relies on the backend returning 401/403 and shows a not-authorized state. There is no server-side admin check on either page, so I mirrored the existing pattern rather than inventing one.
- **No shared API-client method** for editorial exists (it lives in `packages/shared`, out of scope), so the component does direct credentialed `fetch` calls — consistent with how the shared client itself fetches. Approve/reject also POST with no body, matching the L12 router (it reads only the `:id` param).
- `lint` (`next lint`) is **not runnable** in this env — it drops into an interactive ESLint-setup prompt and exits non-zero regardless of code. It is not a task gate (only build + typecheck are); pre-existing tooling issue.
- Screenshots were produced with `puppeteer-core` + system Chrome installed in `/tmp` only (no repo `package.json`/lockfile change), per the tooling guardrails. Mock server + harness all live in `/tmp`.
- Did not open a PR (planner owns integration).

## Suggested follow-ups
- Add an `editorial` namespace to the `packages/shared` API client (list/approve/reject) so the queue uses typed helpers instead of raw fetch, once backend + UI land together.
- Consider linking `/editorial` from the admin/moderation chrome for discoverability (currently direct-URL only, like `/moderation`).
- Wire a verifier run of the full stack (real admin session + seeded drafts) to confirm end-to-end against the live L12 endpoints after integration.