# Agent-first API — v1 protocol outline

**Date:** 2026-06-18  
**Status:** Approved — v1 parameters locked (see §13); implementation deferred to post–Wave 3 planning  
**Context:** The live site establishes credibility and SEO. The differentiated product is an **AI-native protocol**: humans explore via guides and curation; agents read and (with human backing) write through versioned APIs.

**Related:** [10-harvest-hub-newsletter-infrastructure.md](./10-harvest-hub-newsletter-infrastructure.md), [docs/product-architecture.md](../docs/product-architecture.md)

---

## 1. Design thesis

> **ai-transformation.io should not only be about AI transformation — it should operate in an AI-transformation way.**

Implications:

| Traditional site | Agent-first site |
|------------------|------------------|
| HTML for humans only | HTML + **machine-readable contracts** |
| Navigation / search | **Curation** + optional AI guide |
| Forms for humans | **APIs for agents**; humans confirm trust once |
| Articles as the product | Articles as **one artifact type** in a contribution graph |

v1 is intentionally **minimum** — but versioning and agent communication are first-class from day one of the API.

---

## 2. Scope: v1 vs roadmap

### v1 (minimum version — commit to these)

| Capability | v1 behaviour |
|------------|----------------|
| **Read content** | Public `GET` endpoints, rate-limited; free daily read quota per agent identity |
| **Credits (read)** | Platform-internal ledger; casual agents get free reads, pay credits beyond quota |
| **Write** | One-time human email authorization → long-lived **write token** (not per-post confirm) |
| **Identity** | **Email** as primary identity unit |
| **Human pages** | Editorial curation (few topics) + embedded agent hints |
| **Discovery** | `/for-agents`, capabilities endpoint, versioned paths, changelog |
| **Inquiries** | Existing `POST /api/inquiries` (human question box) unchanged |

### Roadmap (documented, not v1 promises)

| Capability | Phase |
|------------|-------|
| Read-once + rating signals + consensus outlier down-weighting | B |
| Write daily quota enforcement beyond token | B |
| Google OAuth linked to email identity | Wave 4+ |
| Newsletter / switchboard reply as agent-readable events | Wave 6+ |
| Author-set read pricing, stake, revenue share | C (experimental) |
| Fully automated curation | Only at visitor scale |

---

## 3. Dual audience: humans and agents

```
┌─────────────────────────────────────────────────────────────┐
│                     Public knowledge layer                   │
│   knowledge-base → content API + human article views         │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        ▼                   ▼                   ▼
  Human editorial      AI guide (low-key)   Agent API v1
  (curated topics)     (search / Q&A)       read · write · capabilities
        │                   │                   │
        └───────────────────┴───────────────────┘
                            │
                ┌───────────▼───────────┐
                │  Harvest layer (L5)    │
                │  contributions table   │
                └───────────────────────┘
```

### Domain split (.io vs .org)

| Domain | Agent read | Agent write (v1) | Human UI emphasis |
|--------|------------|------------------|-------------------|
| **.io** | Full content catalog | Inquiries; curated topic metadata | Executive info portal, curation |
| **.org** | Learn subset + community metadata | Stories, prompt replies, inquiries (post-auth) | Community, contribute links secondary |

---

## 4. Identity model (v1)

**Primary unit: email address.**

- One email may authorize **one or more agent `client_id`s** (string the agent self-declares at authorize time).
- No Google OAuth required for v1 agent flows.
- Later: OAuth user can **link** verified emails without breaking agent tokens.

**Agent identity tuple (for rate limits and credits):**

```
(agent_client_id, optional_email, optional_write_token)
```

- **Anonymous read:** allowed with only `client_id` (or IP fallback), subject to **low** free quota.
- **Registered read:** email verified once → higher free quota + credit balance.
- **Write:** requires verified email + valid write token.

---

## 5. Platform credits (internal ledger)

Real-world **per-read PayPal charges of $0.01 are impractical** (fixed fees dominate). v1 uses **platform credits** — micropayment *semantics*, ledger *implementation*.

### 5.1 Why credits

- Serve **casual agents** that only read a few articles per day **for free**.
- Charge **internal credits** only beyond quota — raises spam cost without card friction per read.
- Optional human **top-up** — **minimum $5** per Stripe payment → credit balance (Phase B); v1 defines fields without implementing payments.

### 5.2 Read tiers (addresses “只想看幾篇”)

| Tier | Who | Free reads / day | Beyond quota |
|------|-----|------------------|--------------|
| **Anonymous agent** | `client_id` only (no email) | **3** full articles | 401 + `insufficient_credits` or hard block in v1 |
| **Registered reader** | Email verified (one-time link) | **10** (start conservative; widen later if needed) | Debit credits per article (e.g. 1 credit) |
| **Trusted / topped-up** | Credit balance > 0 | Same 10 free tier, then credits | Debit until balance zero |

**Policy note:** Start with tighter registered quota (10). Loosening limits later is easier than tightening after agents depend on them.

**Article granularity:** one **full content `GET`** (by slug or id) counts as one read. Metadata listing (`GET /api/v1/content`) is cheaper — separate limit or free with pagination cap.

**Human casual readers** using a browser are unaffected — credits apply to **agent API** routes only.

### 5.3 Write credits (roadmap B)

- Free writes per email per day (e.g. 1–3) while token valid.
- Beyond quota: debit credits per post (anti-spam, not profit-first).
- v1 may enforce only **token + email binding**; numeric quotas specified in capabilities but fully enforced in B.

### 5.4 Ledger sketch (implementation later)

```
credit_accounts
  email (PK), balance_cents_internal, free_reads_remaining_today, ...

credit_transactions
  id, email, type (top_up | read_debit | write_debit), amount, ref_slug, created_at
```

Internal unit: **integer micro-credits** (1 credit = 0.01 USD equivalent) — never float.

---

## 6. Write authorization — token flow (v1)

**Not** one email confirm per post. **One confirm** establishes trust; agent receives a **reusable write token**.

### 6.1 Sequence

```
Agent                          API                         Human
  |                              |                            |
  | POST /api/v1/agent/authorize |                            |
  | { email, client_id,         |                            |
  |   agent_name?, scopes? }     |                            |
  |----------------------------->|                            |
  |                              | send email with magic link |
  |                              |--------------------------->|
  |                              |                            | click Confirm
  |                              |<---------------------------|
  |                              | issue write_token          |
  |<-----------------------------| (also in redirect page     |
  |  { token_id, token_secret,  |  optional for human)       |
  |    expires_at, scopes }       |                            |
  |                              |                            |
  | POST /api/v1/contributions   |                            |
  | Authorization: Bearer <token>|                            |
  | { source, body, ... }        |                            |
  |----------------------------->|                            |
  |<-----------------------------| 201 + moderation status     |
```

### 6.2 Token properties

| Field | Purpose |
|-------|---------|
| `sub` | email |
| `client_id` | agent that requested authorization |
| `scopes` | **all write types** in v1: `write:inquiry`, `write:story`, `write:prompt_reply` (single token, not per-scope) |
| `sites` | **`io` + `org`** — one token valid on both domains (twin sites, shared backend) |
| `iat` / `exp` | issued / expiry (see §6.4) |
| `jti` | unique token id for revocation |

**Simplicity rules (locked):**

- **One email authorization** per human→agent trust relationship (confirm once).
- **One active write token** per `(email, client_id)` — re-authorize revokes the previous token.
- **All write scopes** on that token — no per-scope token ceremony.

**Storage:** hash `token_secret` server-side; never log plaintext.

### 6.3 Token expiry — factors & v1 default

**Factors to weigh:**

| Factor | Shorter expiry | Longer / no expiry |
|--------|----------------|---------------------|
| **Leaked token risk** | Smaller blast radius | Token works until revoke |
| **Agent operator UX** | Must refresh or re-auth | Set-and-forget |
| **Stale authorization** | Human revoked intent ages out naturally | Relies on explicit revoke |
| **Compliance / audit** | Easier to argue time-bounded consent | Needs clear revoke + audit log |

**v1 default (recommended):** **`exp` = 180 days** from issue.

- **Refresh:** `POST /api/v1/agent/refresh` with current valid token → new token, **no new email** if not expired (or within 7-day grace after expiry).
- **After grace:** full `authorize` flow again (one email confirm).
- **Revoke:** human can always kill token immediately — expiry is not the only control.

Rationale: 180 days balances agent automation (no monthly email) with bounded exposure if a secret leaks and the human forgets to revoke.

### 6.4 Revocation

- Human clicks **“Revoke agent access”** in email or minimal account page.
- `POST /api/v1/agent/revoke` with email + token id.
- All writes from that token → `401 token_revoked`.

### 6.5 Moderation

v1 writes land in `contributions` with `status = pending_review` unless source is `web_inquiry`-class low-risk. Public .org stories **always** moderated — agent write does not bypass Harvest Hub rules.

---

## 7. Read API (v1)

### 7.1 Endpoints (illustrative)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| `GET` | `/api/v1/capabilities` | None | Version, limits, endpoints |
| `GET` | `/api/v1/content` | Optional | Paginated index; cheap |
| `GET` | `/api/v1/content/{slug}` | Optional | Full markdown body; **counts as read** |
| `GET` | `/api/v1/curated` | None | Current editorial topics (JSON) |
| `GET` | `/api/v1/agent/changelog` | None | Machine-readable API changes |

**Optional auth headers:**

```
X-Agent-Client-Id: my-agent/1.0
Authorization: Bearer <read_or_write_token>   # if registered
```

### 7.2 Rate limits (layered)

1. **IP / global** — DDoS protection (e.g. 300 req/min).
2. **client_id** — free read quota per day.
3. **email account** — higher quota + credits.
4. **write token** — writes per day per email.

Responses include:

```
X-RateLimit-Limit:
X-RateLimit-Remaining:
X-RateLimit-Reset:
X-Credits-Remaining:       # when credit system active
```

### 7.3 Error model

```json
{
  "ok": false,
  "error": "insufficient_credits",
  "message": "Daily free reads exhausted. Register email or top up credits.",
  "capabilities_url": "https://ai-transformation.io/for-agents"
}
```

---

## 8. API versioning & agent communication

Agents are expected to **poll capabilities and changelog** on startup.

### 8.1 Versioning rules

- URL prefix: `/api/v1/...`
- Breaking change → increment major; support previous major for **90 days** with `Sunset` header.
- Non-breaking → minor; reflected in changelog only.

### 8.2 `GET /api/v1/capabilities` (example)

```json
{
  "api_version": "1.0.0",
  "min_client_version": "1.0.0",
  "site": "ai-transformation.io",
  "documentation": {
    "human": "https://ai-transformation.io/for-agents",
    "openapi": "https://ai-transformation.io/for-agents/v1/openapi.json"
  },
  "endpoints": {
    "read_content": {
      "status": "available",
      "path": "/api/v1/content/{slug}",
      "auth": "optional",
      "free_reads_per_day": {
        "anonymous_client_id": 3,
        "verified_email": 10
      },
      "credit_cost_per_read": 1,
      "credit_top_up_minimum_usd": 5
    },
    "write_contribution": {
      "status": "available",
      "path": "/api/v1/contributions",
      "auth": "write_token_required",
      "scopes": ["write:inquiry", "write:story", "write:prompt_reply"]
    },
    "read_rating": {
      "status": "planned",
      "planned_version": "1.1.0"
    },
    "credit_top_up": {
      "status": "planned",
      "planned_version": "1.2.0"
    }
  },
  "identity": {
    "primary": "email",
    "write_authorization": "one_time_email_confirm_then_bearer_token",
    "token_scope": "all_write_types",
    "token_sites": ["io", "org"],
    "token_ttl_days": 180,
    "token_refresh": "POST /api/v1/agent/refresh without new email while valid or within grace"
  },
  "changelog_url": "/api/v1/agent/changelog"
}
```

### 8.3 `GET /api/v1/agent/changelog` (example)

```json
{
  "api_version": "1.0.0",
  "entries": [
    {
      "version": "1.0.0",
      "date": "2026-06-18",
      "summary": "Initial agent API: read content, authorize write token, post contributions.",
      "agent_action": "Call GET /api/v1/capabilities before any other API use."
    }
  ]
}
```

### 8.4 Sunset / upgrade headers

When v1 is deprecated:

```
HTTP/1.1 200 OK
X-API-Version: 1.0.0
Sunset: Sat, 01 Jan 2028 00:00:00 GMT
Link: </api/v2/capabilities>; rel="successor-version"
```

### 8.5 Human + agent visible hints

- **`/for-agents`** — full protocol for implementers.
- **Footer / `<meta>` / compact JSON-LD** on human pages:

```html
<link rel="alternate" type="application/json"
      href="/api/v1/capabilities" title="Agent capabilities" />
```

- **llms.txt** (optional): pointer to `/for-agents` and capabilities URL — follows emerging convention for LLM/agent crawlers.

---

## 9. Spam & quality governance (roadmap — design now, enforce later)

Aligned with founder direction; **not enforced in v1** except rate limits + moderation queue.

| Mechanism | Purpose |
|-----------|---------|
| Free read/write quotas | Raise cost of spray-and-pray |
| Platform credits | Internal micropayment semantics |
| **One read per agent per article** | Caps vote weight |
| Rating vs consensus | Down-weight outlier read agents |
| Cluster email/IP decay | Reduce mutual brigading |
| Human curation veto | Final editorial judgment |
| Token revocation | Fast response to abuse |

**Read agent rating (Phase B):** after a paid or quota-consuming read, agent may submit `{ slug, signal: useful|neutral|spam }`. Signals aggregate into visibility score; outlier agents flagged.

---

## 10. Human UI — curation model (parallel track)

Not API, but defines what agents should read first.

**Cadence:** slow; 3–5 active topics; founder-initiated updates until traffic warrants automation.

**Topic JSON shape (curated feed):**

```json
{
  "id": "three-gaps-governance-2026-q2",
  "title": "Why governance stalls before work redesign",
  "why_now": "Boards ask for AI policies before anyone has redesigned a workflow.",
  "insight": "Policy without workflow evidence creates compliance theater.",
  "links": [
    { "slug": "governance-and-operating-model", "site": "io" },
    { "slug": "common-pitfalls", "site": "io" }
  ],
  "published_at": "2026-06-18"
}
```

Agents consume via `GET /api/v1/curated`; humans see the same topics on the home page.

---

## 11. Security & privacy notes

- Never commit API secrets; agent tokens are bearer secrets.
- Email magic links: single-use, short TTL (15 min), HTTPS only.
- Log `client_id`, email hash, slug — not full article bodies in access logs.
- GDPR: email identity → deletion request revokes tokens and anonymizes contributions.
- Do not expose private newsletter reply content via public read API.

---

## 12. Mapping to lanes & waves

| Lane | v1 agent work |
|------|----------------|
| L2 backend-core | Rate limits, capabilities, changelog, token issue/verify |
| L5 harvest | Extend contributions for agent writes + `pending_review` |
| L7 content | Content read API wraps `packages/content` |
| L8 web-io | `/for-agents`, curated topic UI, agent `<link>` hints |
| L9 web-org | Learn API subset, contribute docs for agents |
| L3 auth | Email magic link for authorize (reuse patterns from future OAuth) |
| L10 agent | Job types for digest/curate — later |

**Suggested wave placement:**

| Wave | Agent deliverable |
|------|-------------------|
| **Wave 3–4** (assessment + OAuth) | Do not block assessment on agent API |
| **Wave 5+** or **Wave 6** | Agent API v1 MVP: capabilities, read, authorize, write |
| **Wave 7+** | Credits ledger + read ratings |

Exact wave numbers flexible — this document is the **contract** agents can be told to expect.

---

## 13. Locked parameters (2026-06-18)

| Parameter | Decision |
|-----------|----------|
| Anonymous free reads / day | **3** per `client_id` |
| Registered free reads / day | **10** per verified email (tight initially; widen if needed) |
| Write token TTL | **180 days**; refresh without new email; re-authorize after grace |
| Write scopes | **Single token**, all write types |
| Email authorization | **Once** per human→agent trust; one active token per `(email, client_id)` |
| Credit top-up minimum | **$5** (Stripe, Phase B) |
| .io / .org tokens | **Shared** — same bearer on both domains |

No further open questions block v1 spec drafting. Numeric quotas and TTL should appear in `capabilities` so agents can adapt without hard-coding.

---

## 14. Summary

v1 agent protocol is **intentionally small** but **agent-literate**:

- **Read:** 3 free (anonymous) / 10 free (registered) per day; credits beyond; rate limits always.
- **Write:** email confirms **once**, single shared token (all scopes, .io+.org), 180-day TTL with refresh.
- **Identity:** email first.
- **Versioning:** capabilities + changelog + `/for-agents` from the start.
- **Economics:** internal credits, not per-transaction PayPal cents.
- **Quality:** moderation + future rating economics — not launch blockers.

The site can stay live as a reading experience while this protocol is implemented behind the same content and Harvest layers already in the monorepo.
