# Current status

**Last updated:** 2026-06-19

## Summary

Wave 0–3 ✅ · **Wave 4 Auth ✅** (merged PR #3 `e41a143`)

Google OAuth + assessment save/resume shipped. **OAuth requires Zeabur env vars** before sign-in works in production.

## What works

- https://ai-transformation.io — frameworks, playbook, `/assessment`, `/ask`, sign-in chrome
- https://ai-transformation.org — learn hub, `/ask`, `/join`, sign-in chrome
- Assessment: anonymous wizard + radar; **save/resume when signed in**
- `GET /api/auth/me` (returns `user: null` until OAuth configured)
- `GET/POST /api/assessment/session` (401 when anonymous)
- `POST /api/inquiries` with optional `user_id` when logged in

## Production setup (Wave 4)

Set in Zeabur (see `docs/AGENT_ENV.md`):

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `SESSION_SECRET`

Without these, `/api/auth/google` returns 501 — sites still work anonymously.

## Next wave

**Wave 5 — Harvest Hub:** stories, prompts, moderation.

## Docs

- [project-progress.md](./project-progress.md)
- [AGENT_ENV.md](./AGENT_ENV.md)
- [product-architecture.md](./product-architecture.md)
