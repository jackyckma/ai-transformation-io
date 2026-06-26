# Email & newsletter infrastructure

**Last updated:** 2026-06-25  
**Lane:** L6 Newsletter · **Wave 8:** infra shipped · **Wave 17:** pilot shipped (legacy Wave 10 scope)

**Prerequisites:** Wave 15 UI readiness + Wave 16 content seed before first pilot send. See [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) §12.

## Design principle

Keep **subscribers, issues, and reply storage in our backend**. Avoid Mailchimp/Buttondown. Use platform services only for **transport** (send + inbound parse).

```
Subscribe/unsubscribe     → backend (subscribers table) — Wave 17 ✅
Draft / approve issue     → backend + L10 compile job (Wave 8 ✅; Wave 17 send path)
Send newsletter           → Zeabur Email (ZSend) REST API — Wave 17 ✅
Receive reader replies    → Cloudflare Email Worker → backend webhook — Wave 17 ✅
Store all inputs          → contributions (source=newsletter_reply) — Wave 17 ✅
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

## Wave 8 foundation (shipped)

| Piece | Status |
|-------|--------|
| `issues`, `subscribers`, `issue_contributions` tables | ✅ |
| `NoopNewsletterProvider` + `ZeaburZSendProvider` | ✅ |
| `POST /api/webhooks/zsend` | ✅ log stub |
| `POST /api/webhooks/inbound-email` | ✅ implemented in Wave 17 |
| `POST /api/newsletter/subscribe` | ✅ implemented in Wave 17 |
| `POST /api/newsletter/unsubscribe` | ✅ implemented in Wave 17 |
| `POST /api/agent/compile-draft` | ✅ admin — draft MD in `issues` |
| `POST /api/agent/cluster-replies` | ✅ admin — keyword cluster stub |

## Wave 17 pilot (shipped)

| Piece | Status |
|-------|--------|
| `POST /api/newsletter/subscribe` | ✅ validates `{email,list}` and upserts active subscriber |
| `POST /api/newsletter/unsubscribe` | ✅ validates `{email,list}` and marks status `unsubscribed` |
| `POST /api/internal/newsletter/send-issue` | ✅ admin-only send endpoint with pilot cap and status updates |
| `GET /api/internal/agent/issues?limit=` | ✅ admin-only recent issues list for `/newsletter` UI |
| `POST /api/webhooks/inbound-email` | ✅ secret-gated inbound reply capture + issue linkage |

### Wave 17 endpoint contract (pilot scope)

- `POST /api/newsletter/subscribe`
  - Request: `{ "email": "user@example.com", "list": "io_pulse" | "org_harvest" }`
  - Behavior: create or reactivate subscriber as `active`.
- `POST /api/newsletter/unsubscribe`
  - Request: `{ "email": "user@example.com", "list": "io_pulse" | "org_harvest" }`
  - Behavior: set subscriber status to `unsubscribed` and stamp `unsubscribed_at`.
- `POST /api/internal/newsletter/send-issue`
  - Admin-only (`ADMIN_EMAILS` session gate).
  - Request: `{ "issueId": "<issues.id>" }`
  - Behavior: sends only to active subscribers in the issue's list, caps send count with `NEWSLETTER_PILOT_MAX`, updates issue status/provider id/sent timestamp.

---

### Compile draft (admin)

```bash
curl -X POST https://ai-transformation.io/api/agent/compile-draft \
  -H 'content-type: application/json' \
  -H 'Cookie: atx_session=…' \
  -d '{"site":"io","list":"io_pulse","limit":30}'
```

Requires signed-in user in `ADMIN_EMAILS`.

---

## Receive replies — Cloudflare Email Worker contract (Wave 17)

| Item | Detail |
|------|--------|
| Reply address pattern | `replies+{issueToken}@ai-transformation.io` |
| Worker responsibility | Parse inbound MIME and extract sender + subject + plain text |
| Backend endpoint | `POST /api/webhooks/inbound-email` |
| Auth header | `x-inbound-secret: $INBOUND_EMAIL_WEBHOOK_SECRET` |
| JSON body | `{ "replyToToken": "...", "from": "...", "subject": "...", "text": "..." }` |
| Backend behavior | Persist contribution with `source=newsletter_reply`; link to issue when token resolves |

**Manual pilot fallback remains valid:** set `Reply-To: info@ai-transformation.io`, forward replies to Gmail, then manually copy high-signal replies into contributions while Worker rollout is pending.

---

## Environment variables (Zeabur)

| Variable | Purpose |
|----------|---------|
| `ZSEND_API_KEY` | ZSend send (agent authorize + future newsletter) |
| `AGENT_AUTHORIZE_FROM` | e.g. `pulse@ai-transformation.io` |
| `INBOUND_EMAIL_WEBHOOK_SECRET` | Wave 17 Worker auth |
| `NEWSLETTER_FROM_IO` | Sender for `io_pulse` (default `pulse@ai-transformation.io`) |
| `NEWSLETTER_FROM_ORG` | Sender for `org_harvest` (default `learn@ai-transformation.org`) |
| `NEWSLETTER_PILOT_MAX` | Max recipients per pilot send (default `25`) |
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
