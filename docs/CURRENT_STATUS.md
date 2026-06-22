# Current status

**Last updated:** 2026-06-22

## Summary

Wave 0–6 ✅ · **Wave 7 ✅ (core v1)** — agent read/write protocol · **Positioning locked** in [POSITIONING-UX.md](./POSITIONING-UX.md)

## What works

- https://ai-transformation.io — layered home (reader paths, curated topics, agent-friendly panel), `/for-agents`, frameworks, playbook, `/assessment` (secondary CTA), `/ask`
- https://ai-transformation.org — layered home (Share / learn / apprenticeship paths), `/for-agents`, apprenticeship, Harvest Hub stories & prompts, `/ask`; header **Sign in** (Join removed from nav)
- Topic cover imagery (Phase B) — `/curation/*.jpg` on both sites
- **Agent API v1** (`/api/v1/…`):
  - `GET /capabilities`, `/curated`, `/content`, `/content/{slug}` — read with 3/day anonymous · 10/day verified (write token) quota
  - `POST /agent/authorize` + `GET /agent/authorize/confirm` — email confirm → 180-day bearer token
  - `POST /contributions` — agent write (`source=agent`) with bearer token
- Assessment: anonymous wizard + radar; save/resume when signed in
- Harvest: stories, prompts, inquiries, apprenticeship interest
- Agent skills: `editorial-ui`, `ux-copy`, `curated-home-refresh`

## Production setup (Wave 4 + 7)

Set in Zeabur (see `docs/AGENT_ENV.md`):

- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` — human OAuth
- `ZSEND_API_KEY`, `AGENT_AUTHORIZE_FROM` (optional) — agent authorize emails; dev/test returns `confirm_url` in JSON when unset

Without Google OAuth env, `/api/auth/google` returns 501 — sites still work anonymously.

## Next

- **Post–Wave 7 UX** — sidebar chatbot v1 (primary human interaction); on-site chat history
- **Wave 7 polish** — token refresh/revoke; production authorize email
- **Wave 8** — Newsletter & internal agent jobs
- Login dashboard v1 (saved assessment + recommended links) — after chatbot direction

## Docs

- [POSITIONING-UX.md](./POSITIONING-UX.md) — locked product decisions
- [DOC_ALIGNMENT_AUDIT.md](./DOC_ALIGNMENT_AUDIT.md) — contradiction scan
- [project-progress.md](./project-progress.md)
- [AGENT_ENV.md](./AGENT_ENV.md)
- [product-architecture.md](./product-architecture.md)
- Curated feeds: [data/curated/README.md](../data/curated/README.md) · [EDITORIAL_POLICY.md](../data/curated/EDITORIAL_POLICY.md)
