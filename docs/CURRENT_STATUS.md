# Current status

**Last updated:** 2026-06-20

## Summary

Wave 0–5 ✅ · **Wave 6 (partial) ✅** — curated homes, reader entry, agent discovery UI + API stubs

## What works

- https://ai-transformation.io — layered home (reader paths, curated topics, agent-friendly panel), `/for-agents`, frameworks, playbook, `/assessment` (secondary CTA), `/ask`
- https://ai-transformation.org — layered home (Read / share / apprenticeship paths), `/for-agents`, apprenticeship, Harvest Hub, `/ask`, `/join`
- `GET /api/v1/curated?site=io|org` — founder-curated feed from `data/curated/`
- `GET /api/v1/capabilities` — Wave 6 stub (full agent read/write in Wave 7)
- Assessment: anonymous wizard + radar; save/resume when signed in
- Harvest: stories, prompts, inquiries, apprenticeship interest

## Production setup (Wave 4)

Set in Zeabur (see `docs/AGENT_ENV.md`):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

Without these, `/api/auth/google` returns 501 — sites still work anonymously.

## Next

- **Wave 7** — Agent protocol v1 (`GET /api/v1/content`, authorize, write)
- **Wave 6 remainder** — read rate-limit middleware skeleton; experimental content chatbot hook
- Login dashboard v1 (saved assessment + recommended links) — iterate later

## Docs

- [project-progress.md](./project-progress.md)
- [AGENT_ENV.md](./AGENT_ENV.md)
- [product-architecture.md](./product-architecture.md)
- Curated feeds: [data/curated/README.md](../data/curated/README.md)
