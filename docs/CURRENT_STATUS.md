# Current status

**Last updated:** 2026-06-23

## Summary

Wave 0–9 ✅ · Sidebar/mobile shell ✅ · Agent API v1 ✅ · **Product direction:** [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) (approved 2026-06-23)

## What works (production — pre-v2 IA)

- https://ai-transformation.io — layered home, `/for-agents`, frameworks, playbook, `/functions`, **sidebar companion**, `/assessment` (secondary), `/ask`
- https://ai-transformation.org — Share-first home, Harvest Hub, apprenticeship, **sidebar companion**, `/for-agents`, `/ask`
- **Agent API v1** — read, authorize, write (`/api/v1/*`)
- **Newsletter infra (Wave 8)** — `issues` / `subscribers` tables, `NoopNewsletterProvider` + `ZeaburZSendProvider`, webhooks stub
- **Internal jobs (Wave 8)** — admin `POST /api/agent/compile-draft`, `POST /api/agent/cluster-replies`
- ZSend domains **ai-transformation.io** + **.org** verified; `ZSEND_API_KEY` on Zeabur
- Assessment, Harvest (stories, prompts, inquiries), curated homes
- **Sidebar chatbot v1** — cookie-backed sessions, on-site message history, content-grounded replies (LLM when `CHAT_LLM_*` / `OPENAI_*` configured; link fallback otherwise)

## Production env

See [AGENT_ENV.md](./AGENT_ENV.md):

- Google OAuth, `SESSION_SECRET`
- `ZSEND_API_KEY`, `AGENT_AUTHORIZE_FROM=pulse@ai-transformation.io`
- `ADMIN_EMAILS` — required for compile-draft admin routes
- `CHAT_LLM_*` optional overrides — **default LLM:** `MINIMAX_API_KEY` + `MINIMAX_MODEL=MiniMax-M3` via `https://api.minimax.io/v1`

## Next

- **Site design v2 (approved):** [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) — Wave 11+ north star; **current UI still pre-v2 routes** until Wave 11 ships
- **Wave 10** — Newsletter pilot (optional trigger)
- **Wave 11** — IA shell: Library / Knowledge / Insights / Community ribbon, Ask modes, onboarding, **remove legacy hub routes**

## Docs

- [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) — product & IA spec (draft)
- [POSITIONING-UX.md](./POSITIONING-UX.md)
- [project-progress.md](./project-progress.md)
- [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)
