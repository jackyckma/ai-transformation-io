# Session handoff

**Date:** 2026-06-22  
**Session:** Wave 8 — newsletter infra + internal agent jobs

## Completed

1. **Wave 8 shipped:**
   - L6: `issues`, `subscribers`, `issue_contributions`; `NoopNewsletterProvider` + `ZeaburZSendProvider`
   - Webhooks: `/api/webhooks/zsend` (accept), `/api/webhooks/inbound-email` (501)
   - Subscribe/unsubscribe routes return 501 (deferred Wave 10)
   - L10: `POST /api/agent/compile-draft`, `POST /api/agent/cluster-replies` (admin)
2. ZSend DNS verified for `.io` + `.org`; `ZSEND_API_KEY` on Zeabur
3. Docs updated: CURRENT_STATUS, project-progress, product-architecture, traceability-index, EMAIL_NEWSLETTER, AGENT_ENV

## Next

- **Wave 9** — Function-by-role IA (.io)
- **Parallel** — Sidebar chatbot v1
- **Wave 10** — Newsletter pilot (subscribe, send, inbound Worker)

## Admin: compile draft

`POST /api/agent/compile-draft` with `{ "site": "io"|"org" }` — requires `ADMIN_EMAILS` session.
