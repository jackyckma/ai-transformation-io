# L5 — Harvest INTERFACE

## Purpose
Unified contributions pipeline: stories, inquiries, prompt replies. Core of Harvest Hub.

## Owns
- `apps/backend/src/lanes/harvest/**`

## Provides
- `POST /api/inquiries` — question box
- `POST /api/stories` — requires authenticated session
- `GET /api/stories` — public published/featured stories
- `GET /api/stories/moderation` — admin-only moderation list
- `PATCH /api/stories/:id` — admin-only moderation update
- `GET /api/prompts/current` — public active prompt
- `POST /api/prompts/:id/replies` — requires authenticated session

## Consumes
| Lane | Contract |
|------|----------|
| L0 | Contribution types, Zod schemas |
| L3 | Optional user attribution (Wave 4+) |

## Data
All inputs → `contributions` table with `source` enum.

## Access control
- Session auth source: `atx_session` cookie via `sessionMiddleware`
- Admin gate for moderation: `ADMIN_EMAILS` env (comma-separated, case-insensitive)
- If `ADMIN_EMAILS` is empty/unset, no admin access is granted

## Wave
2 (inquiries), 5 (full harvest)

## Verification
- Fixtures: `data/simulators/harvest/inquiry.json`, `story.json`, `prompt-reply.json`
