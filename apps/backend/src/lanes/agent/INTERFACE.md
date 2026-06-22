# L10 — Agent INTERFACE

## Purpose
Background jobs: compile newsletter drafts, cluster replies, synthesize .io articles. Draft-only — human approves.

## Owns
- `apps/backend/src/lanes/agent/**`

## Provides
- Job types: `compile_issue_draft`, `cluster_replies`, `synthesize_article` (latter deferred)
- `POST /api/agent/compile-draft` — admin-only (Wave 8)
- `POST /api/agent/cluster-replies` — admin-only keyword cluster stub (Wave 8)

## Consumes
| Lane | Contract |
|------|----------|
| L5 | contributions query |
| L6 | issues table |
| L0 | Shared types |

## Env
- `MINIMAX_API_KEY` optional for future LLM synthesis

## Wave
8 (deterministic draft compiler) · LLM synthesis later

## Verification
- Fixture: `data/simulators/agent/compile-draft-output.json`
- Tests: `apps/backend/src/lanes/newsletter/newsletter.test.ts`
