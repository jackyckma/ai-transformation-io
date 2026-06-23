# Current status

**Last updated:** 2026-06-23

## Summary

Wave 0–9 ✅ · Agent API v1 ✅ · **Wave 11 (SITE_DESIGN_v2 Phase 1) shipped** ✅ on both sites

## What works (production)

- https://ai-transformation.io — v2 IA shell: **Home · Library · Insights · Ask**, `/library` unified index + `/library/[slug]`, `/insights` + `/insights/assessment`, `/ask` (guest Ask; member Ask+Capture), logged-in dashboard with rule-based recommendations v0, onboarding fields in Settings, contextual Open-in-Ask prefills
- https://ai-transformation.org — v2 IA shell: **Home · Knowledge · Community · Ask**, `/knowledge` unified index + `/knowledge/[slug]`, `/community` highlights placeholder, `/ask` (guest Ask; member Ask+Capture+Submit+Find Help), logged-in activity dashboard + onboarding fields
- .org branding updated to **Community · Knowledge commons**
- §15 housekeeping shipped (no redirects): removed `.io` `/frameworks` `/playbook` `/functions` `/assessment`; removed `.org` `/learn` `/stories` `/stories/submit`
- **Agent API v1** — read, authorize, write (`/api/v1/*`)
- **Newsletter infra (Wave 8)** — `issues` / `subscribers` tables, `NoopNewsletterProvider` + `ZeaburZSendProvider`, webhooks stub
- **Internal jobs (Wave 8)** — admin `POST /api/agent/compile-draft`, `POST /api/agent/cluster-replies`
- ZSend domains **ai-transformation.io** + **.org** verified; `ZSEND_API_KEY` on Zeabur
- Assessment backend and data products remain available (assessment now lives under Insights route in web-io)
- On-site Ask chatbot remains cookie-backed with session history and content-grounded replies (LLM when `CHAT_LLM_*` / `OPENAI_*` configured; link fallback otherwise)

## Production env

See [AGENT_ENV.md](./AGENT_ENV.md):

- Google OAuth, `SESSION_SECRET`
- `ZSEND_API_KEY`, `AGENT_AUTHORIZE_FROM=pulse@ai-transformation.io`
- `ADMIN_EMAILS` — required for compile-draft admin routes
- `CHAT_LLM_*` optional overrides — **default LLM:** `MINIMAX_API_KEY` + `MINIMAX_MODEL=MiniMax-M3` via `https://api.minimax.io/v1`

## Next

- **Wave 12 (Phase 2):** object model + visibility enforcement, persisted My Library/notes/capture/submit flows, moderation/publish settings
- **Wave 13+:** deeper community object types + unified write API expansion + personalization v2
- **Wave 10** remains optional: Newsletter pilot trigger

## Docs

- [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) — approved product & IA spec (Wave 11+)
- [POSITIONING-UX.md](./POSITIONING-UX.md)
- [project-progress.md](./project-progress.md)
- [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)
