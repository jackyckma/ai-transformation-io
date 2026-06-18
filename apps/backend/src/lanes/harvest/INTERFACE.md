# L5 — Harvest INTERFACE

## Purpose
Unified contributions pipeline: stories, inquiries, prompt replies. Core of Harvest Hub.

## Owns
- `apps/backend/src/lanes/harvest/**`

## Provides
- `POST /api/inquiries` — question box
- `POST /api/stories`, `GET /api/stories`, `PATCH /api/stories/:id` (moderation)
- `GET /api/prompts/current`, `POST /api/prompts/:id/replies`

## Consumes
| Lane | Contract |
|------|----------|
| L0 | Contribution types, Zod schemas |
| L3 | Optional user attribution (Wave 4+) |

## Data
All inputs → `contributions` table with `source` enum.

## Wave
2 (inquiries), 5 (full harvest)

## Verification
- Fixtures: `data/simulators/harvest/inquiry.json`, `story.json`
