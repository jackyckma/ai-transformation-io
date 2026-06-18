# L10 — Agent INTERFACE

## Purpose
Background jobs: compile newsletter drafts, cluster replies, synthesize .io articles. Draft-only — human approves.

## Owns
- `apps/backend/src/lanes/agent/**`

## Provides
- Job types: `compile_issue_draft`, `cluster_replies`, `synthesize_article`
- `POST /api/agent/compile-draft` (admin-only, Wave 6)

## Consumes
| Lane | Contract |
|------|----------|
| L5 | contributions query |
| L6 | issues table |
| L0 | Shared types |

## Env
- `MINIMAX_API_KEY` or fallback providers per project-guidelines

## Wave
6 (stub), 8 (production drafts)

## Verification
- Fixture: `data/simulators/agent/compile-draft-output.json`
