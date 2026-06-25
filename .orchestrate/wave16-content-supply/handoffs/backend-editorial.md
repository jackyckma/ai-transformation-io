<!-- orchestrate handoff
task: backend-editorial
branch: cursor/wave16-backend-editorial-8610
agentId: bc-e7921260-cfdc-4ec1-b908-696e7cf58610
runId: run-c4d1f3e2-4ed7-4c42-954b-8f7a08500342
resultStatus: finished
finishedAt: 2026-06-25T16:46:12.799Z
-->

All work is complete, committed, and pushed. Here is my handoff.

## Status
success

## Branch
`cursor/wave16-backend-editorial-8610`

> Note: the task asked for `orch/wave16-content-supply/backend-editorial`, but the cloud-agent environment enforces a `cursor/<name>-8610` branch naming policy, so I could not push that exact name. All commits are on `cursor/wave16-backend-editorial-8610`. No PR opened (planner owns integration).

## What I did
- **L12 lane** — `apps/backend/src/lanes/editorial-supply/index.ts` (new), mounted at `/api/internal/editorial` in `apps/backend/src/index.ts`. Endpoints: `POST /drafts` (ADMIN session **or** L11 Bearer), `GET /drafts` (admin), `POST /drafts/:id/approve` (admin), `POST /drafts/:id/reject` (admin). Reuses Wave 12 object store via `saveObjectDraft`/`updateObjectLifecycle`; stamps `metadata.editorial_source`. No parallel table.
- **DB helpers** — `apps/backend/src/db/objects.ts`: added `listEditorialDrafts` (status draft/pending + `editorial_source` marker) and `findEditorialSeedObject` (idempotency by `site`+`seed_key` via `json_extract`). Exported `normalizeCommunityMetadata` from `lanes/objects/index.ts` for reuse.
- **compile-draft** — extended `compileIssueDraftMarkdown` + caller in `lanes/agent/index.ts` to add "Featured knowledge" (with `/knowledge/<slug>` links, `/library` for .io), "Community highlights" (`/community`), and an "Explore more" curated-links block, querying published objects via `listObjectsForRequester`. Deterministic, contributions sections kept.
- **Seed** — `scripts/seed-editorial-content.ts` + root `seed:editorial` script. Idempotent (keyed on `seed_key`); inserts 8 published .org knowledge (slugs aligned to `data/curated/org-home.json`: `what-is-ai-transformation`, `transformation-roadmap`, `common-pitfalls`, `ai-patterns-copilots-agents-automation`, +4) and 5 mixed community highlights, all labeled `editorial_seed=true`/`seed_wave='wave16'`.
- **Runbooks** — updated `.editorial-orbita/README.md`, `orbita-connection.md`, `runbooks/weekly-seed.md` with exact paths; doc-only, no Orbita platform code.
- **Tests** — new `editorial-supply.test.ts` (admin+bearer create, admin list/approve→published, reject→archived, 401/403 gates, `/api/v1/objects/drafts` still works) + a compile-draft assertion in `newsletter.test.ts`.
- **Shared schemas** — none needed; reused `objectDraftRequestSchema`. `packages/shared/src/index.ts` untouched.
- `data/curated/org-home.json` needed no edits (slugs already matched seeds).

## Measurements
- `pnpm --filter @ai-transformation/backend test: 48 passing → 55 passing`
- `pnpm --filter @ai-transformation/backend build: pass → pass`
- `pnpm --filter @ai-transformation/backend typecheck: pass`
- `seed knowledge count: 8 == 8` (run1 → run2)
- `seed community count: 5 == 5` (discussion=2, community_announcement=1, event=1, help_request=1)
- `seed created: run1=13 → run2=0` (skipped=13 — idempotent)
- `web-io/web-org files changed: 0`

## Verification
unit-test-verified

New `editorial-supply.test.ts` exercises create (admin+bearer), admin-only list/approve/reject with 401/403 gates, approve→published visibility, and the unbroken `/api/v1/objects/drafts` bearer route; newsletter test asserts the new knowledge/community/curated-link sections. Seed idempotency verified by running twice.

## Notes, concerns, deviations, findings, thoughts, feedback
- **Branch name deviation** (above) is the only deviation — driven by the environment's enforced branch policy. The integration worker may need to re-key off `cursor/wave16-backend-editorial-8610`.
- I added `tsx` to the **workspace root** `devDependencies` (and `pnpm-lock.yaml` changed) so `pnpm tsx scripts/seed-editorial-content.ts` / `pnpm seed:editorial` work from root; previously tsx lived only in the backend package.
- `approve` publishes via `updateObjectLifecycle` (status→published, generates `publishedSlug` if absent, stamps `editorial_review:'approved'`) rather than `submitObject`, so admin approval is unconditional (no auto-moderation bounce). `reject` sets status `archived` + `editorial_review:'rejected'`.
- `GET /drafts` uses the dedicated `listEditorialDrafts` query (admin-gated) instead of `listObjectsForRequester` to avoid the visibility filter hiding members-only/cross-site drafts from the admin queue.
- The seed writes to the real `data/app.db` (gitignored, not committed). Community seeds use `visibility: 'public'` per the task's SEED spec so they render on `/community` without login.
- I did not add `data/simulators/editorial/**` fixtures (INTERFACE lists them as "to be added", non-blocking) and did not touch `docs/waves/wave16-content-supply.md`.

## Suggested follow-ups
- Publish the **web-org-editorial** task (thin `/editorial` admin queue UI consuming these endpoints) — it branches from this slice.
- Consider an L11 Bearer **editorial scope** check if you later want to restrict which tokens may create editorial drafts (currently any valid write token is accepted, matching the existing `/api/v1/objects/drafts` behavior).
- Wave 17: `compile-draft` now surfaces published knowledge/community — wire newsletter send to it.