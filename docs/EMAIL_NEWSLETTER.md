# Email & newsletter infrastructure

**Last updated:** 2026-06-22  
**Lane:** L6 Newsletter · **Wave 8:** infra shipped · **Send pilot:** Wave 10

## Design principle

Keep **subscribers, issues, and reply storage in our backend**. Avoid Mailchimp/Buttondown. Use platform services only for **transport** (send + inbound parse).

```
Subscribe/unsubscribe     → backend (subscribers table) — Wave 10 UI
Draft / approve issue     → backend + L10 compile job (Wave 8 ✅)
Send newsletter           → Zeabur Email (ZSend) REST API
Receive reader replies    → Cloudflare Email Worker → backend webhook (Wave 10)
Store all inputs          → contributions (source=newsletter_reply)
```

---

## Send — Zeabur Email (ZSend)

| Item | Detail |
|------|--------|
| Service | Zeabur Email (AWS SES-backed) |
| API | `POST https://api.zeabur.com/api/v1/zsend/emails` |
| Auth | API key (`send_only`) in Zeabur — `ZSEND_API_KEY` |
| Verified domains | **ai-transformation.io**, **ai-transformation.org** (2026-06-22) |
| From addresses | `pulse@ai-transformation.io`, `learn@ai-transformation.org` |
| Provider | `ZeaburZSendProvider` when key set; else `NoopNewsletterProvider` |
| Webhooks | `POST /api/webhooks/zsend` — accept + log (Wave 8 stub) |

Agent authorize emails use `AGENT_AUTHORIZE_FROM` (default `pulse@ai-transformation.io`).

---

## Wave 8 shipped

| Piece | Status |
|-------|--------|
| `issues`, `subscribers`, `issue_contributions` tables | ✅ |
| `NoopNewsletterProvider` + `ZeaburZSendProvider` | ✅ |
| `POST /api/webhooks/zsend` | ✅ log stub |
| `POST /api/webhooks/inbound-email` | 501 until Wave 10 |
| `POST /api/newsletter/subscribe` | 501 until Wave 10 |
| `POST /api/agent/compile-draft` | ✅ admin — draft MD in `issues` |
| `POST /api/agent/cluster-replies` | ✅ admin — keyword cluster stub |

### Compile draft (admin)

```bash
curl -X POST https://ai-transformation.io/api/agent/compile-draft \
  -H 'content-type: application/json' \
  -H 'Cookie: atx_session=…' \
  -d '{"site":"io","list":"io_pulse","limit":30}'
```

Requires signed-in user in `ADMIN_EMAILS`.

---

## Receive replies — Cloudflare Email Worker (Wave 10)

| Item | Detail |
|------|--------|
| Address | `replies+{issueToken}@ai-transformation.io` |
| Worker | Parse MIME → `POST /api/webhooks/inbound-email` |
| Backend | Insert `contributions` with `source=newsletter_reply` |

**Pilot fallback:** Reply-To `info@` → Gmail forward → manual copy.

---

## Environment variables (Zeabur)

| Variable | Purpose |
|----------|---------|
| `ZSEND_API_KEY` | ZSend send (agent authorize + future newsletter) |
| `AGENT_AUTHORIZE_FROM` | e.g. `pulse@ai-transformation.io` |
| `INBOUND_EMAIL_WEBHOOK_SECRET` | Wave 10 Worker auth |
| `NEWSLETTER_FROM_IO` | Future: `pulse@ai-transformation.io` |
| `NEWSLETTER_FROM_ORG` | Future: `learn@ai-transformation.org` |
| `ADMIN_EMAILS` | Admin routes including compile-draft |

---

## Two lists

| List ID | Site | From | Audience |
|---------|------|------|----------|
| `io_pulse` | .io | pulse@… | Transformation Pulse — frameworks, insights |
| `org_harvest` | .org | learn@… | Harvest Hub digest — stories, prompts recap |

Brand: **Harvest Hub** (not "Learn Together"). Same backend; separate `subscribers.list` enum.

---

## Related

- [usr/10-harvest-hub-newsletter-infrastructure.md](../usr/10-harvest-hub-newsletter-infrastructure.md)
- [project-progress.md](./project-progress.md) — Wave 8 & 10
- [AGENT_ENV.md](./AGENT_ENV.md)
