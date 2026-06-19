# Current status

**Last updated:** 2026-06-19

## Summary

Wave 0 ✅ · Wave 1 ✅ · Wave 2 ✅ · Content + editorial refresh ✅ · **Wave 3 Assessment ✅**

36-question Three Gaps assessment live on `.io` — Likert wizard, scoring API, radar results. Merged PR #2 (`78b5817`).

## What works

- https://ai-transformation.io — frameworks + playbook, editorial home, **`/assessment`**, `/ask`
- https://ai-transformation.org — learn hub + Harvest Hub contribute links, `/ask`
- `GET /api/assessment/questions` + `POST /api/assessment/score`
- `POST /api/inquiries` → SQLite `contributions` table
- Git push → Zeabur auto-deploy (manual redeploy if git hook stalls)

## Next wave

**Wave 4 — Google OAuth & saved progress:** unified identity + assessment resume.

Use `/orchestrate` when `CURSOR_API_KEY` is set.

## Planned (post–Wave 4)

| Wave | Focus |
|------|--------|
| 5 | Harvest Hub stories + prompts |
| 6 | Curated topics home + `/for-agents` + capabilities stub |
| 7 | Agent protocol v1 — [usr/11](../usr/11-agent-first-api-v1.md) |

## Docs

- [product-architecture.md](./product-architecture.md) — lanes L0–L11
- [project-progress.md](./project-progress.md) — full wave schedule
- [usr/11-agent-first-api-v1.md](../usr/11-agent-first-api-v1.md)
- [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)
