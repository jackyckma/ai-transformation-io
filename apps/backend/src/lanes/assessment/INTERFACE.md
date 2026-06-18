# L4 — Assessment INTERFACE

## Purpose
36-question Three Gaps assessment: question bank, scoring, saved sessions (Wave 4+).

## Owns
- `apps/backend/src/lanes/assessment/**`
- `data/simulators/assessment/questions.json`

## Provides
- `POST /api/assessment/score` — gap radar + weakest gap
- `GET/POST /api/assessment/session` — saved progress (Wave 4, requires L3)

## Consumes
| Lane | Contract |
|------|----------|
| L0 | Assessment schemas |
| L3 | User ID for saved sessions (Wave 4) |

## Wave
3 (score), 4 (save)

## Verification
- Unit tests for scoring
- Fixture: `data/simulators/assessment/sample-answers.json`
