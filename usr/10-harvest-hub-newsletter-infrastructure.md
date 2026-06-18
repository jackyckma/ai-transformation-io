# Harvest Hub × Newsletter — curated switchboard & infrastructure

**Date:** 2026-06-18  
**Status:** Approved direction — build v1 infra hooks; defer send/subscribe UI  
**Context:** Founder agrees Harvest Hub is a reasonable try; sees strong synergy with a small, curated newsletter as a two-way switchboard.

---

## The model: curated switchboard

**Harvest Hub** collects structured input (Stories, question box, Weekly Prompt replies).  
**Newsletter** is the **distribution + reply channel** — not a separate content product.

```
                    ┌─────────────────────────────────┐
                    │  Harvest Hub (.org + .io inputs) │
                    │  Stories · Prompt · Question box │
                    │  Assessment reflections          │
                    └───────────────┬─────────────────┘
                                    │ curate
                                    ▼
                    ┌─────────────────────────────────┐
                    │  Newsletter issue (small, edited)│
                    │  · 1 insight / synthesis         │
                    │  · 1 community highlight         │
                    │  · 1 prompt or question          │
                    └───────────────┬─────────────────┘
                                    │ send
                                    ▼
                              Subscribers
                                    │ reply (email)
                                    ▼
                    ┌─────────────────────────────────┐
                    │  Inbound → contributions table   │
                    │  source = newsletter_reply       │
                    └───────────────┬─────────────────┘
                                    │ agent digest + human review
                                    ▼
                         Next issue · .io article · Story
```

**Why this beats forum-only or newsletter-only:**

| | Forum | One-way newsletter | Harvest + switchboard newsletter |
|--|-------|-------------------|----------------------------------|
| Reply friction | High (visit site) | Low (hit reply) | Low |
| Public vs private | Public | Private 1:1 | Private reply → curated public output |
| SEO | On forum pages | None | Replies feed .io |
| Cold start | Hard | Medium | Medium — small list OK |
| Your effort | Moderate + empty threads | Write every issue | Replies **give you** next issue material |

**Scale intent:** Small list (50–500) is fine. Quality of replies > subscriber count.

---

## Two lists (unchanged, clarified)

| List | Site | Voice | Primary content |
|------|------|-------|-----------------|
| **Transformation Pulse** | .io | Authoritative, frameworks | Research synthesis, playbook updates, featured community insights (with permission) |
| **Learn Together** | .org | Warmer, experience-driven | Weekly prompt recap, new Stories, “what we heard this week” |

Same backend, **separate subscriber lists** and send cadence. A Story may appear in **both** (org digest + io “community insight” section) with explicit `featured_on` flags.

Cross-subscribe: optional checkbox at signup — not required v1.

---

## v1: what we build vs defer

### Build now (infra hooks, no send)

| Piece | v1 behaviour |
|-------|----------------|
| **`contributions` table** | Unified store for all Harvest inputs + future newsletter replies |
| **`source` enum** | `web_story`, `web_inquiry`, `web_prompt_reply`, `assessment_reflection`, `newsletter_reply`, `linkedin_manual` |
| **`issues` table (stub)** | Schema only; optional admin seed rows; no public archive yet |
| **`subscribers` table (stub)** | Schema only; no signup API exposed in UI |
| **`NewsletterProvider` interface** | `NoopProvider` in v1; swap for Buttondown/Resend later |
| **Webhook route stub** | `POST /api/webhooks/inbound-email` — 501 or log-only until provider wired |
| **Agent job types** | Define `compile_issue_draft`, `cluster_replies` as queued job names; implement later |
| **Footer placeholder** | “Newsletter coming soon” or omit CTA entirely |

### Defer (Phase 2+)

- Subscribe/unsubscribe API and UI
- Actual send via provider
- Public issue archive pages (`/newsletter/[slug]`)
- Automated reply parsing (start with manual forward → contribution)
- Newsletter analytics dashboard

---

## Data model (backend)

### `contributions`

Central object — everything Harvest Hub and newsletter replies land here.

```ts
contributions {
  id              uuid PK
  source          enum  // see above
  site            enum  // io | org | null
  user_id         uuid? // if logged in
  email           string
  name            string?
  subject         string?
  body            text
  status          enum  // new | reviewed | published | featured | archived | spam
  metadata        jsonb // assessment_id, prompt_id, gap_scores, tags
  published_slug  string? // if published as Story on .org
  created_at      timestamptz
  reviewed_at     timestamptz?
  reviewed_by     uuid?
}
```

### `issues` (newsletter editions)

```ts
issues {
  id              uuid PK
  site            enum  // io | org
  slug            string
  title           string
  draft_md        text
  status          enum  // draft | scheduled | sent | archived
  reply_to_token  string  // for inbound routing, e.g. issue-abc123
  provider_id     string? // external id after send
  sent_at         timestamptz?
  created_at      timestamptz
}

issue_contributions {
  issue_id        uuid FK
  contribution_id uuid FK
  role            enum  // featured | quoted | prompt_source | reply_included
}
```

### `subscribers`

```ts
subscribers {
  id              uuid PK
  email           string UNIQUE
  list            enum  // io_pulse | org_learn
  status          enum  // pending | active | unsubscribed
  user_id         uuid?
  subscribed_at   timestamptz
  unsubscribed_at timestamptz?
}
```

### Legacy alias (v1 API)

Public API can keep friendly names; they write to `contributions`:

| API route | `source` value |
|-----------|----------------|
| `POST /api/stories` | `web_story` |
| `POST /api/inquiries` | `web_inquiry` |
| `POST /api/prompts/:id/replies` | `web_prompt_reply` |

---

## Inbound reply flow (Phase 2)

**Preferred:** Provider with reply tracking (Buttondown, ConvertKit, Resend Inbound).

1. Issue sent with `Reply-To: replies+{reply_to_token}@mail.ai-transformation.org` (or provider alias).
2. Webhook receives reply → parse body → insert `contributions` with `source=newsletter_reply`, link `metadata.issue_id`.
3. Notification to founder; agent job `cluster_replies` runs weekly.
4. Human picks quotes for next issue (with permission) or synthesizes .io article.

**v1 fallback:** Manually forward interesting replies to `info@` → copy into admin UI as contribution. No automation required to **validate** the loop.

---

## Agent pipeline (aligned)

| Job | Trigger | Input | Output |
|-----|---------|-------|--------|
| `compile_issue_draft` | Weekly cron or manual | New contributions since last issue | Draft MD in `issues.draft_md` |
| `cluster_replies` | After inbound batch | `newsletter_reply` contributions | Theme summary + suggested next prompt |
| `synthesize_article` | Manual or threshold | Cluster + related contributions | .io article draft in review queue |

All jobs: **draft only** — human approves before send or publish.

---

## Provider abstraction

```ts
interface NewsletterProvider {
  subscribe(email: string, list: ListId): Promise<SubscriberRef>
  unsubscribe(ref: SubscriberRef): Promise<void>
  send(issue: Issue, list: ListId): Promise<SendResult>
  // Phase 2:
  parseInboundWebhook(req: Request): Promise<InboundReply[]>
}

// v1
class NoopNewsletterProvider implements NewsletterProvider { ... }
```

Env vars (reserved, empty in v1):

```env
NEWSLETTER_PROVIDER=noop          # noop | buttondown | resend
BUTTONDOWN_API_KEY=
RESEND_API_KEY=
INBOUND_EMAIL_WEBHOOK_SECRET=
```

---

## UI / UX hooks (minimal v1)

- No prominent subscribe form on homepage.
- Assessment completion: optional “We’ll email a summary” — **disabled** until newsletter live; store preference flag on user if logged in.
- `.org` Weekly Prompt page: “Reply via question box” (not “reply to newsletter” yet).
- Admin-only (later): `/admin/contributions`, `/admin/issues/draft`.

When newsletter launches:
- `.io` footer + post-assessment: subscribe to **Pulse**
- `.org` Stories + Prompt: subscribe to **Learn Together**
- Each issue ends with explicit **“Hit reply — we read every response”**

---

## Operational loop (target cadence)

| Cadence | Activity | Automation |
|---------|----------|------------|
| Weekly | Review contributions; send small issue (when live) | Agent drafts issue from queue |
| Ongoing | Read email replies | Webhook → DB (later) |
| Biweekly | Publish .io insight from reply cluster | Agent draft + human edit |
| Monthly | Review whether to add forum/Slack | Manual decision |

**Effort when live:** ~1–2 hrs/issue if agent drafts; replies **reduce** blank-page time vs pure editorial newsletter.

---

## Triggers to turn on newsletter

- [ ] 10+ contributions in DB (stories + inquiries) **or** 20+ assessment completions
- [ ] Agent `compile_issue_draft` produces usable draft without heavy rewrite
- [ ] Founder has 2–3 hours to set up provider + send pilot to 10 friends

Do **not** wait for large list — pilot to invite list first.

---

## Decisions (confirmed)

| Item | Decision |
|------|----------|
| Newsletter in v1 | **No send, no subscribe UI** |
| Infra in v1 | **`contributions` + stub `issues`/`subscribers` + provider interface** |
| Model | **Curated switchboard** — Harvest → issue → replies → next Harvest cycle |
| Two lists | **Yes** — io Pulse + org Learn Together |
| Reply handling v1 | Manual forward OK; webhook when provider chosen |

---

*Related: [09-community-strategy-alternatives.md](./09-community-strategy-alternatives.md) · [07-pre-scaffold-decisions.md](./07-pre-scaffold-decisions.md) · [../docs/ARCHITECTURE.md](../docs/ARCHITECTURE.md)*
