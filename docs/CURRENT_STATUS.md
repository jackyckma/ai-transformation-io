# Current status

**Last updated:** 2026-06-18

## Summary

Wave 0 ✅ · Wave 1 ✅ · Wave 2 ✅ · **Content + editorial refresh ✅** · Lane plan revised for agent-first product

Sites are **content-first editorial** portals (not marketing heroes). **L11 Agent protocol** added to lane map; waves resequenced (curation Wave 6, agent API Wave 7).

## What works

- https://ai-transformation.io — frameworks + playbook (10 KB articles), editorial home, `/ask`
- https://ai-transformation.org — learn hub + Harvest Hub contribute links, `/ask`
- `POST /api/inquiries` → SQLite `contributions` table
- Git push → Zeabur auto-deploy (manual redeploy if git hook stalls)

## Next wave

**Wave 3 — Assessment:** 36-question Three Gaps flow + scoring API.

Use `/orchestrate` when `CURSOR_API_KEY` is set.

## Planned (post–Wave 3)

| Wave | Focus |
|------|--------|
| 6 | Curated topics home + `/for-agents` + capabilities stub |
| 7 | Agent protocol v1 (read, authorize, write) — [usr/11](../usr/11-agent-first-api-v1.md) |
| 8 | Newsletter infra + internal agent jobs (L10) |

## Docs

- [product-architecture.md](./product-architecture.md) — lanes L0–L11
- [project-progress.md](./project-progress.md) — full wave schedule
- [usr/11-agent-first-api-v1.md](../usr/11-agent-first-api-v1.md)
- [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)
