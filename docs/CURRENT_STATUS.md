# Current status

**Last updated:** 2026-06-22

## Summary

Wave 0–5 ✅ · **Wave 6 (partial) ✅** — curated homes, reader entry, agent discovery UI + API stubs · **Positioning locked** in [POSITIONING-UX.md](./POSITIONING-UX.md)

## What works

- https://ai-transformation.io — layered home (reader paths, curated topics, agent-friendly panel), `/for-agents`, frameworks, playbook, `/assessment` (secondary CTA), `/ask`
- https://ai-transformation.org — layered home (Share / learn / apprenticeship paths), `/for-agents`, apprenticeship, Harvest Hub stories & prompts, `/ask`; header **Sign in** (Join removed from nav)
- Topic cover imagery (Phase B) — `/curation/*.jpg` on both sites
- `GET /api/v1/curated?site=io|org` — curated feed from `data/curated/` (agent-propose + founder PR approve)
- `GET /api/v1/capabilities` — Wave 6 stub (full agent read/write in Wave 7)
- Assessment: anonymous wizard + radar; save/resume when signed in
- Harvest: stories, prompts, inquiries, apprenticeship interest
- Agent skills: `editorial-ui`, `ux-copy`, `curated-home-refresh`

## Production setup (Wave 4)

Set in Zeabur (see `docs/AGENT_ENV.md`):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

Without these, `/api/auth/google` returns 501 — sites still work anonymously.

## Next

- **Wave 7** — Agent protocol v1 (`GET /api/v1/content`, authorize, write)
- **Wave 6 remainder** — read rate-limit middleware skeleton
- **Interaction** — sidebar chatbot v1 (primary human UX bet); on-site chat history
- Login dashboard v1 (saved assessment + recommended links) — after chatbot direction

## Docs

- [POSITIONING-UX.md](./POSITIONING-UX.md) — locked product decisions
- [DOC_ALIGNMENT_AUDIT.md](./DOC_ALIGNMENT_AUDIT.md) — contradiction scan
- [project-progress.md](./project-progress.md)
- [AGENT_ENV.md](./AGENT_ENV.md)
- [product-architecture.md](./product-architecture.md)
- Curated feeds: [data/curated/README.md](../data/curated/README.md) · [EDITORIAL_POLICY.md](../data/curated/EDITORIAL_POLICY.md)
