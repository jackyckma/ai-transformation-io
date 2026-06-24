# Current status

**Last updated:** 2026-06-24

## Summary

Wave 0–9 ✅ · Agent API v1 ✅ · Wave 11 (SITE_DESIGN_v2 Phase 1) ✅ · **Wave 12 (SITE_DESIGN_v2 Phase 2) shipped** ✅

## What works (production)

- https://ai-transformation.io — v2 IA shell: **Home · Library · Insights · Ask**, `/library` unified index + `/library/[slug]`, `/insights` + `/insights/assessment`, `/ask` (guest Ask; member Ask+Capture), logged-in dashboard with rule-based recommendations v0, onboarding fields in Settings, contextual Open-in-Ask prefills
- https://ai-transformation.org — v2 IA shell: **Home · Knowledge · Community · Ask**, `/knowledge` unified index + `/knowledge/[slug]`, `/community` highlights placeholder, `/ask` (guest Ask; member Ask+Capture+Submit+Find Help), logged-in activity dashboard + onboarding fields
- .org branding updated to **Community · Knowledge commons**
- §15 housekeeping shipped (no redirects): removed `.io` `/frameworks` `/playbook` `/functions` `/assessment`; removed `.org` `/learn` `/stories` `/stories/submit`
- **Wave 12 object store + visibility model live:** unified objects + contributions lifecycle with query-time visibility enforcement (`public` / `members-only` / `private`) for anonymous, session members, owners, and bearer-token owners.
- **Wave 12 moderation/publish flow live:** generic draft/pending/published lifecycle, moderation queue transitions, member publish preference (`auto` vs `review`) with auto-moderation hook, and derived-article workflow stub.
- **Wave 12 personal layer live on backend + both sites:** persisted bookmarks, notes (including Ask Capture private notes), annotations, comments split, recently viewed, and persisted onboarding profile.
- **.io Wave 12 wiring:** My Library now reads persisted bookmarks/notes/recently-viewed for signed-in users; assessment remains under `/insights/assessment` and recommendation inputs include persisted profile + gap signals.
- **.org Wave 12 wiring:** Knowledge/Community render object-backed content with visibility semantics; My Library / My articles / My comments panels consume shared object/personal endpoints; moderation and publish preference UI consume generic APIs; Ask Capture/Submit/Find Help drafts persist through Wave 12 endpoints.
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

- **Wave 13 (Phase 3):** community Phase 1 type write-API parity and external-agent parity for Ask Submit / Find Help flows reserved by SITE_DESIGN_v2 §11.
- **Wave 13+:** deepen community interaction types and personalization v2 on top of Wave 12 object/personal foundations.
- **Wave 10** remains optional: Newsletter pilot trigger

## Docs

- [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) — approved product & IA spec (Wave 11+)
- [POSITIONING-UX.md](./POSITIONING-UX.md)
- [project-progress.md](./project-progress.md)
- [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md)
