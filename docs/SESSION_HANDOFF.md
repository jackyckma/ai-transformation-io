# Session handoff

**Date:** 2026-06-24  
**Session:** Wave 13 integration — SITE_DESIGN_v2 Phase 3 community types + Agent API parity  
**Branch:** `orch/wave13-v2-community/integrate-wave13`  
**Latest commit:** see branch tip (`git log -1 --oneline`)  
**Push status:** pushed to `origin/orch/wave13-v2-community/integrate-wave13`

## Active task

- **Roadmap item:** `wave13-v2-community` (SITE_DESIGN_v2 §11 Phase 3)
- **Definition of done:**
  1. Merge backend + web-org community branches with both parents preserved.
  2. Keep shared community contract compatible across backend, web-org, and web-io builds.
  3. Ship .org Phase 1 community types end-to-end + Ask Submit/Find Help write parity with external Agent API.
  4. Keep Phase 2 community types as clearly reserved stubs (including `match`).

## Current status

| Area | Status |
|------|--------|
| Integration branch | `orch/wave13-v2-community/backend-community` merged with `orch/wave13-v2-community/web-org-community` (merge commit preserved) |
| Backend community APIs | Live on both `/api/community/*` and `/api/v1/community/*` with session/Bearer parity |
| .org community UI | `/community` and `/community/[id]` wired to shared community client actions (reply/follow/offer/join/save + reserved affordances) |
| .org Ask parity | Ask Submit + Find Help call unified write APIs (`/api/v1/contributions`, `/api/v1/objects`, `/api/v1/objects/submit`) |
| Phase 2 reserved types | Reserved schema/API/UI affordances shipped; `POST /api/v1/community/match` returns reserved stub response |
| .io for-agents docs | Updated with brief Wave 13 note about community write/action endpoints and reserved stubs via shared `/api/v1` Agentic API |
| Known blockers | None in this integration session |

## Verified in

- **Cloud agent (this session):**
  - `pnpm install` — pass
  - `pnpm turbo build` — pass (`@ai-transformation/backend`, `@ai-transformation/web-io`, `@ai-transformation/web-org`)
  - `pnpm --filter @ai-transformation/backend test` — pass (49 passing)
- **Live UI:** not re-run in this integration step (upstream web-org branch provided live verification artifacts)

## Top priority next

1. Wave 14 kickoff: activate Phase 2 community types (beyond reserved stubs), add first matching experiment flow, and deepen personalization v2 ranking/targeting.

## What was already tried

- `pnpm install` was required because cloud workspace started without `node_modules`.
- Per-branch merge strategy kept backend/community lane and web-org/community lane disjoint changes without rewriting history.
- No additional shared contract drift fixes were needed after merge because build/test already passed on integrated branch.

## How to run / verify

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
```

Manual smoke checklist:

1. `.org` `/community` shows live action controls and links to `/community/[id]`.
2. `.org` `/ask?mode=find-help` creates `help_request` through unified objects endpoints.
3. `.org` `/ask?mode=submit` writes via unified contributions endpoint.
4. `.org` `/for-agents` documents community endpoints and reserved type behavior.
5. `.io` `/for-agents` includes the brief Wave 13 parity note.

## Key file paths

| Concern | Path |
|---------|------|
| Backend community routes and parity | `apps/backend/src/lanes/community/index.ts` |
| Backend community data + migrations | `apps/backend/src/db/community.ts`, `apps/backend/src/db/index.ts` |
| Shared auth/visibility helpers reused by community lane | `apps/backend/src/lanes/objects/index.ts` |
| Backend community tests | `apps/backend/src/lanes/community/community.test.ts` |
| .org community list/detail/actions | `apps/web-org/components/community-highlights.tsx`, `apps/web-org/components/community-object-view.tsx`, `apps/web-org/app/community/[id]/page.tsx`, `apps/web-org/lib/use-community-interactions.ts` |
| .org Ask Submit/Find Help parity wiring | `apps/web-org/components/ask-modes.tsx` |
| Agent docs (.org) | `apps/web-org/app/for-agents/page.tsx` |
| Agent docs (.io) | `apps/web-io/app/for-agents/page.tsx` |
| Status docs | `docs/CURRENT_STATUS.md`, `docs/SESSION_HANDOFF.md` |

## Warnings

- Keep `.orchestrate/` out of PR diff (run-local orchestrator state).
- Zeabur auto-deploy behavior can be sensitive to build scope; keep explicit package builds via turbo in verification.
- If cloud runners repeatedly start without dependencies, consider env setup baseline to preinstall pnpm workspace deps.
