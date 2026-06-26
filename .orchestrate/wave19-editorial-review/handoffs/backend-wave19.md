<!-- orchestrate handoff
task: backend-wave19
branch: orch/wave19-editorial-review/backend-wave19
agentId: bc-41ad764b-f845-42b3-9b1a-74f78fc96ad1
runId: run-d30e5917-ecff-4c30-ab8f-e9ddeaab5b2c
resultStatus: finished
finishedAt: 2026-06-26T13:34:55.652Z
-->

Done. All work is committed and pushed to the required branch. No PR opened (planner owns integration).

## Status
success

## Branch
`orch/wave19-editorial-review/backend-wave19`

## What I did
- **Shared (`packages/shared/`)**: new `wave19-editorial.ts` exporting `editorialAgentReviewSchema` (union of success `{score,flags,summary,reviewedAt,model?}` and skip `{skipped:true,reviewedAt,reason?}`), `objectCatalogEntrySchema`/`objectCatalogResponseSchema`, plus request/response schemas; widened `communityInteractionKindSchema` additively to `['follow','offer_help','join','request_mentor','ask_for_intro','apply']`; added `export * from './wave19-editorial'` to the barrel (only that one line — agent-entry/'Harvest Hub' text untouched).
- **Editorial-review agent**: new `lanes/editorial-supply/review.ts` `reviewDraft()` reusing `chat/llm.ts` (no second client) — never throws, returns skip on no-key/non-200/malformed. Added `POST /api/internal/editorial/review-pending` and `POST /api/internal/editorial/drafts/:id/review` (both `requireAdmin`), persisting `metadata.editorial_agent` via `updateObjectLifecycle({id, status: draft.status, metadata})` so publish state never changes.
- **Catalog**: `GET /api/v1/objects/catalog` registered BEFORE `/objects/:id` in objects lane; anonymous public visibility context; lists published+public knowledge+community Wave 12 objects.
- **Legacy tagging + capabilities**: `content-loader.ts` `ContentListEntry`/`ContentDocument` now carry `source:'knowledge_base'`; capabilities gained `read_objects_catalog` endpoint + a new changelog entry documenting the post-publish verify path.
- **Wave 18 follow-up**: widened `listInteractionsForUser` IN clause to include the three new kinds.
- Updated `editorial-supply/INTERFACE.md`; added `wave19-backend.test.ts` (8 tests).

## Measurements
- `pnpm --filter @ai-transformation/backend test`: 62 passing → 70 passing
- `pnpm --filter @ai-transformation/backend build`: pass == pass
- `pnpm --filter @ai-transformation/shared build`: pass == pass
- new backend tests added: 0 → 8

## Verification
unit-test-verified

## Contract for downstream web + docs workers (exact shapes)
- **Endpoints**:
  - `POST /api/internal/editorial/review-pending` (ADMIN_EMAILS). Optional body `{ site?: 'io'|'org', limit?: number }`. Returns `{ ok:true, reviewed:number, results: Array<{ id:string, editorial_agent:EditorialAgentReview }> }`.
  - `POST /api/internal/editorial/drafts/:id/review` (ADMIN_EMAILS). Returns `{ ok:true, draft:<draftDetail incl. metadata.editorial_agent> }`. 404 if missing/not editorial/not draft|pending.
  - `GET /api/v1/objects/catalog?site=io|org&limit=` (public, no auth). Returns `{ ok:true, site, origin, count, objects: ObjectCatalogEntry[] }`.
- **`editorial_agent` metadata** (on draft `metadata.editorial_agent`): success `{ score:0-100 int, flags:string[], summary:string, reviewedAt:ISO, model:string }`; skip `{ skipped:true, reviewedAt:ISO, reason?:'llm_not_configured'|'llm_error'|'malformed' }`.
- **`ObjectCatalogEntry`**: `{ id, slug:string|null, title:string|null, objectType, type, human_url, api_url, source:'wave12_object' }`. `api_url = ${origin}/api/v1/objects/${id}`. **human_url (confirmed real Next.js segments)**: knowledge on io → `${origin}/library/${slug}`, knowledge on org → `${origin}/knowledge/${slug}`, community → `${origin}/community/${id}`. `origin` = `https://ai-transformation.org` (org) else `.io`.
- **Legacy `GET /api/v1/content` + `/content/:slug`** entries now include `source:'knowledge_base'` (other fields unchanged).
- New files: `packages/shared/src/wave19-editorial.ts`, `apps/backend/src/lanes/editorial-supply/review.ts`.

## Notes, concerns, deviations, findings
- **Deviation (necessary)**: the brief's bottom list says "Do NOT modify packages/shared/src/index.ts", but DELIVERABLE 1 + acceptance criteria require re-exporting `wave19-editorial` from the barrel, and the package's only entrypoint is `./src/index.ts`. New types are unreachable otherwise, so I added exactly one line (`export * from './wave19-editorial';`) and changed nothing else in that file (agent-entry/'Harvest Hub' strings intact; backend agent-protocol tests stay green).
- `communityInteractionKindSchema` was widened to add only the three kinds the task named; `collaborate` (which exists in the backend `ExtendedCommunityInteractionKind`) was intentionally left out of both the schema and the `listInteractionsForUser` IN clause, matching the brief.
- Adding `source` as a required field on `ContentListEntry` is a backend-internal type; the shared `agentContentIndexEntrySchema` was left unchanged (zod strips the extra key, so existing web/client parsing is unaffected). Downstream UI can rely on `source` being present in the raw JSON response.
- Did not touch `apps/web-*`, `apps/combined`, `.editorial-orbita/`, or top-level `docs/**` — only `editorial-supply/INTERFACE.md`, which I own.

## Suggested follow-ups
- Web worker: render `editorial_agent` score/flags/summary on `/editorial` draft cards (badge when `skipped`); wire `/objects/catalog` into the agent-discoverability UI; add article-footer related links + inline Saved/Followed confirmation (pillar 5).
- Docs worker: update `docs/CURRENT_STATUS.md`, `SESSION_HANDOFF.md`, and `.editorial-orbita` runbooks with the `review-pending` path.
- Consider extending shared `agentContentIndexEntrySchema` with an optional `source` once a consumer needs to validate it strictly.