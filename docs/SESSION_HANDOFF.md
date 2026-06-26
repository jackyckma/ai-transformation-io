# Session handoff

**Date:** 2026-06-26  
**Branch:** `orch/wave19-editorial-review/integrate-wave19`  
**Latest commit:** `9d7fcbc` — docs(wave19): finalize integration handoff and verify runbooks  
**Push status:** pushed to `origin/orch/wave19-editorial-review/integrate-wave19`; draft PR [#13](https://github.com/jackyckma/ai-transformation-io/pull/13) opened to `main`

## Active task

- **Roadmap item:** **Wave 19 ✅ shipped** — editorial-review agent + agent discoverability per L12 interface and Orbita dogfood handoff
- **Definition of done:** See [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) §12 and [wave19-editorial-review.md](./waves/wave19-editorial-review.md)

## Current status

| Area | Status |
|------|--------|
| Editorial review agent (backend) | ✅ `POST /api/internal/editorial/review-pending` + `POST /api/internal/editorial/drafts/:id/review` write `metadata.editorial_agent` only (no publish-state mutation, no auto-approve) |
| No-key behavior | ✅ Graceful skip payload persisted (`{ skipped: true, reason, reviewedAt }`) when LLM key/config is unavailable |
| .org editorial queue UI | ✅ Draft cards show score/flags/summary/model or skipped badge; queue header includes `Run agent review`; existing Approve/Reject/View full article flow unchanged |
| Agent discoverability | ✅ `GET /api/v1/objects/catalog?site=` lists published Wave 12 objects (`source: 'wave12_object'`); legacy `/api/v1/content` stays available with `source: 'knowledge_base'`; capabilities now document verify path |
| Wave 18 follow-up read-back | ✅ `listInteractionsForUser`/community listing include `request_mentor`/`ask_for_intro`/`apply`; `.org` done-state survives reload |
| Optional P1 polish | ✅ `.io` shipped `More in Library` + inline Saved confirmation; ⏸️ `.org` `More in Knowledge` + inline Followed confirmation deferred |
| Verification | ✅ `pnpm turbo build` (all targets) + backend test suite **70/70** |

## Top priority next

1. **Wave 20+ roadmap:** newsletter archive and agent credits once active-user scale justifies it (≥50 users).
2. Keep Orbita weekly process aligned with post-publish verify path (`/api/v1/objects/catalog` + `/api/v1/objects/{id}`).
3. Optional follow-up PR for deferred `.org` pillar-5 polish (`knowledge-object-view` related links + inline followed feedback).

## What was tried / decisions

- Used a diamond integration strategy: backend ancestor + web-org branch + merge web-io branch, preserving both web parents.
- Kept no behavior drift in approval/rejection lifecycle; editorial review writes metadata only.
- Did not touch `packages/shared/src/index.ts` because a backend agent-protocol test asserts that text contract.

## How to run / verify

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
```

Manual API spot checks:

- `POST /api/internal/editorial/review-pending` (admin session)
- `GET /api/v1/objects/catalog?site=io|org`
- `GET /api/v1/objects/{id}` for post-publish verify

## Key paths

| Concern | Path |
|---------|------|
| Wave 19 scope doc | `docs/waves/wave19-editorial-review.md` |
| Editorial review endpoints | `apps/backend/src/lanes/editorial-supply/index.ts` |
| Editorial metadata schema usage | `apps/web-org/components/editorial-queue.tsx` |
| Catalog endpoint + source tagging | `apps/backend/src/lanes/objects/index.ts`, `apps/backend/src/lanes/agent-protocol/content-loader.ts` |
| Interaction read-back expansion | `apps/backend/src/db/community.ts` |
| Orbita runbook updates | `.editorial-orbita/README.md`, `.editorial-orbita/runbooks/weekly-seed.md` |

## Warnings

- Editorial review scoring depends on `MINIMAX_API_KEY` / `CHAT_LLM_*`; without config the system records a skip result by design.
- Keep `.orchestrate/` run-local bookkeeping out of commits/PRs.
