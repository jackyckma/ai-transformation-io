# Current status

**Last updated:** 2026-06-22

## Summary

Wave 0–8 ✅ · **Wave 9 ✅** — function-by-role IA (.io) · **Positioning locked** in [POSITIONING-UX.md](./POSITIONING-UX.md)

## What works

- https://ai-transformation.io — layered home, `/for-agents`, frameworks, playbook, `/functions` (Executive + CIO), `/assessment` (secondary), `/ask`
- https://ai-transformation.org — Share-first home, Harvest Hub, apprenticeship, `/for-agents`, `/ask`
- **Agent API v1** — read, authorize, write (`/api/v1/*`)
- **Newsletter infra (Wave 8)** — `issues` / `subscribers` tables, `NoopNewsletterProvider` + `ZeaburZSendProvider`, webhooks stub
- **Internal jobs (Wave 8)** — admin `POST /api/agent/compile-draft`, `POST /api/agent/cluster-replies`
- ZSend domains **ai-transformation.io** + **.org** verified; `ZSEND_API_KEY` on Zeabur
- Assessment, Harvest (stories, prompts, inquiries), curated homes

## Production env

See [AGENT_ENV.md](./AGENT_ENV.md):

- Google OAuth, `SESSION_SECRET`
- `ZSEND_API_KEY`, `AGENT_AUTHORIZE_FROM=pulse@ai-transformation.io`
- `ADMIN_EMAILS` — required for compile-draft admin routes

## Next

- **Post–Wave 9 UX** — sidebar chatbot v1 (primary human interaction)
- **Wave 10** — Newsletter pilot (subscribe UI, send issue, inbound Worker)

## Docs

- [POSITIONING-UX.md](./POSITIONING-UX.md)
- [project-progress.md](./project-progress.md)
- [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)
