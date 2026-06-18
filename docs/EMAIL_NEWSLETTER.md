# Email & newsletter infrastructure

**Last updated:** 2026-06-18  
**Lane:** L6 Newsletter · **Wave:** 6 (stub) · **Send pilot:** Wave 8

## Design principle

Keep **subscribers, issues, and reply storage in our backend**. Avoid Mailchimp/Buttondown. Use platform services only for **transport** (send + inbound parse).

```
Subscribe/unsubscribe     → backend (subscribers table)
Draft / approve issue     → backend + agent (issues table)
Send newsletter           → Zeabur Email (ZSend) REST API
Receive reader replies    → Cloudflare Email Worker → backend webhook
Store all inputs          → contributions (source=newsletter_reply)
```

---

## Send — Zeabur Email (ZSend)

| Item | Detail |
|------|--------|
| Service | Zeabur Email (AWS SES-backed) |
| API | `POST https://api.zeabur.com/api/v1/zsend/emails` |
| Auth | API key (`send_only` permission) in Zeabur env — never commit |
| From addresses | `pulse@ai-transformation.io`, `learn@ai-transformation.org` (after domain verify) |
| Webhooks (outbound) | `send`, `delivery`, `bounce`, `complaint`, `open`, `click` → `/api/webhooks/zsend` |
| Provider class | `ZeaburZSendProvider` implements `NewsletterProvider.send()` |

**Current account status:** healthy. Verified send domain today: `prismstudio.cc` only.  
**Before pilot:** add and verify `ai-transformation.io` (and optionally `.org`) in ZSend + DNS (DKIM/SPF via Cloudflare).

### Outbound webhook use

- **bounce / complaint** → mark subscriber status, stop sending
- **delivery** → optional analytics on `issues` row
- **Not used for replies** — ZSend does not emit inbound/reply events

---

## Receive replies — Cloudflare Email Worker

ZSend **cannot** auto-capture Reply. Inbound uses **Cloudflare Email Routing → Email Worker**.

| Item | Detail |
|------|--------|
| Address | `replies@ai-transformation.io` or `replies+{issueToken}@ai-transformation.io` |
| Routing | Cloudflare Email Routing rule → Worker |
| Worker | Parse MIME (`postal-mime`) → `POST /api/webhooks/inbound-email` |
| Auth | HMAC or bearer `INBOUND_EMAIL_WEBHOOK_SECRET` |
| Backend | Insert `contributions` with `source=newsletter_reply`, `metadata.issue_id` |

### Reply-To on send

```
From: pulse@ai-transformation.io
Reply-To: replies+issue-{uuid}@ai-transformation.io
```

Backend parses `issueToken` from local-part when webhook fires.

### Pilot fallback (manual)

`Reply-To: info@ai-transformation.io` → existing Cloudflare forward to Gmail → founder copies into admin / contributions. Valid for ~10 person pilot before Worker deploy.

---

## Backend API (target)

| Route | Wave | Purpose |
|-------|------|---------|
| `POST /api/newsletter/subscribe` | 8 | Add to `subscribers` |
| `POST /api/newsletter/unsubscribe` | 8 | Token-based unsubscribe |
| `POST /api/newsletter/issues/:id/send` | 8 | Admin: send via ZSend |
| `POST /api/webhooks/zsend` | 6 | Outbound delivery events |
| `POST /api/webhooks/inbound-email` | 6 stub · 8 live | Inbound reply from CF Worker |

---

## Environment variables (Zeabur service)

```env
ZSend_API_KEY=              # Zeabur Email API key (send_only)
INBOUND_EMAIL_WEBHOOK_SECRET=
NEWSLETTER_FROM_IO=pulse@ai-transformation.io
NEWSLETTER_FROM_ORG=learn@ai-transformation.org
```

Use Zeabur variable create/update — never commit keys.

---

## Two lists

| List ID | Site | From | Audience |
|---------|------|------|----------|
| `io_pulse` | .io | pulse@… | Transformation Pulse — frameworks, insights |
| `org_learn` | .org | learn@… | Learn Together — prompts, stories recap |

Same backend; separate `subscribers.list` enum.

---

## Related

- [usr/10-harvest-hub-newsletter-infrastructure.md](../usr/10-harvest-hub-newsletter-infrastructure.md)
- [project-progress.md](./project-progress.md) — Wave 6 & 8
- Zeabur skill: `zeabur-email`
- Cloudflare: [Email Workers runtime API](https://developers.cloudflare.com/email-routing/email-workers/runtime-api/)
