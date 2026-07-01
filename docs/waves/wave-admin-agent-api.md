# Wave 25 — Admin agent API & public ops manifest

**Slug:** `wave-admin-agent-api`  
**Status:** 📋 Kickoff input (not started)  
**Ref:** `main` after Waves 11–21  
**Authoritative context:** [SITE_DESIGN_v2.md](../SITE_DESIGN_v2.md) §1 (agent-first thesis), [usr/11-agent-first-api-v1.md](../../usr/11-agent-first-api-v1.md), [FOUNDER_WAVE_DECISIONS.md](../FOUNDER_WAVE_DECISIONS.md)

**Prerequisites (met):** L12 editorial queue ✅ · Wave 17 newsletter pilot ✅ · L11 agent protocol v1 ✅ · `/editorial`, `/moderation`, `/newsletter` thin admin UI ✅

---

## 1. Product thesis

Today the platform is **agent-first for readers and contributors** (`/for-agents`, L11 Bearer) but **human-session-only for operators** (`ADMIN_EMAILS` + Google cookie + scattered `/api/internal/*`).

That split is the wrong shape for how the founder actually runs the product:

| Actor | Today | Target |
|-------|-------|--------|
| External agents (Orbita, ChatGPT) | L11 read/write + objects/community | Unchanged |
| On-site humans | Copilot + editorial UI | Keep **human UI where judgment needs eyes** |
| **Founder ops agent** (Cursor, future ops bot) | curl + browser session | **First-class Admin Agent API** with Bearer + capabilities manifest |

This wave is not “build a heavy admin console.” It is:

1. **Expose operator actions as versioned JSON** (same paradigm as L11).
2. **Publish the ops contract on the web** — tell the world that *running* the site is also agent-addressable. That is the paradigm shift: HTML for humans, **capabilities + changelog + auth for every participant class**, including operators.

Public web deliverable (both sites, shared copy):

- Extend **`/for-agents`** with an **“Operations (founder agents)”** section — human-readable, no secrets.
- Optional alias **`/for-operators`** → same anchor (301 or duplicate page) if the label tests better.
- Link to **`GET /api/v1/admin/capabilities`** (public discovery document; full endpoint list only after admin auth).

---

## 2. Auth model

### 2.1 Separate token class

| Token | Audience | How issued | Sites |
|-------|----------|------------|-------|
| **L11 write token** | Contributor agents | Email confirm → Bearer | `.io` + `.org` shared |
| **L11 read quota** | Anonymous / verified reader | `X-Agent-Client-Id` + optional authorize | per site |
| **L25 admin token** | Founder ops agents only | Email confirm → Bearer; email **must** ∈ `ADMIN_EMAILS` | `.io` + `.org` shared |

Admin tokens **must not** reuse L11 write tokens — different scopes, audit trail, and revocation story.

### 2.2 Authorization flow (mirror L11)

```
POST /api/v1/admin/authorize          → { confirm_url }  (email to ADMIN_EMAILS match only)
GET  /api/v1/admin/authorize/confirm  → redirect + set token (or JSON for headless)
POST /api/v1/admin/refresh            → extend TTL without re-email (spec parity with L11 backlog)
Authorization: Bearer <admin_token>   on all /api/v1/admin/* mutating routes
```

Session cookie (`ADMIN_EMAILS` Google login) remains valid for **human UI** and may call the same backend handlers internally — but **ops agents use Bearer only** on `/api/v1/admin/*`.

### 2.3 Scopes (v1)

| Scope | Allows |
|-------|--------|
| `admin:read` | Dashboard aggregates, list queues, read draft bodies |
| `admin:editorial` | Approve / reject / run advisory review |
| `admin:moderation` | Moderation queue read + transitions |
| `admin:newsletter` | Issue list, compile preview, send (pilot cap enforced) |
| `admin:metrics` | Agent read usage, chat usage, subscriber counts |

v1 default grant for founder confirm: **all scopes** (single founder). Split scopes when a second operator appears.

### 2.4 Errors & versioning

Same JSON error shape as L11: `{ ok: false, error: "machine_code", message?: "..." }`.

- `X-API-Version` / `Sunset` headers aligned with L11.
- **`GET /api/v1/admin/changelog`** — operator-facing API changes (may mirror a section in L11 changelog).

---

## 3. Endpoint catalog

### 3.1 Discovery (public + authed)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/admin/capabilities` | none → public manifest; Bearer → full ops map | Machine-readable ops entry (like L11 capabilities) |
| GET | `/api/v1/admin/changelog` | none | Operator API version history |

Public manifest includes: thesis blurb, auth flow summary, scope list, links to `/for-agents#operations`, **`implementation_status`**, and which routes require Bearer.

### 3.2 Dashboard & metrics (new)

| Method | Path | Auth | Purpose |
|--------|------|------|---------|
| GET | `/api/v1/admin/dashboard` | `admin:read` | Single JSON snapshot for daily ops agent |
| GET | `/api/v1/admin/metrics/agent-reads` | `admin:metrics` | L11 read quota usage by day / client_id |
| GET | `/api/v1/admin/metrics/chat` | `admin:metrics` | Copilot message counts by site / guest vs member |
| GET | `/api/v1/admin/metrics/newsletter` | `admin:metrics` | Subscriber counts by list (`io_pulse`, `org_harvest`) |
| GET | `/api/v1/admin/metrics/catalog` | `admin:read` | Published object counts by site / type |

**`dashboard` response (illustrative):**

```jsonc
{
  "ok": true,
  "generatedAt": "ISO",
  "sites": { "io": { "catalogPublished": 0 }, "org": { "catalogPublished": 5 } },
  "editorial": { "pendingDrafts": 0, "pendingBySite": { "org": 0 } },
  "moderation": { "queueCount": 0 },
  "newsletter": { "subscribers": { "io_pulse": 3, "org_harvest": 7 } },
  "agentReads": { "last24h": 42, "quota429Last24h": 1 },
  "chat": { "last24hMessages": 18 },
  "health": { "backend": "ok" }
}
```

### 3.3 Editorial (wrap existing internal lane)

Today: `/api/internal/editorial/*` (session admin). Wave 25: **Bearer parity** on `/api/v1/admin/editorial/*` calling the same service layer.

| Method | Path | Auth | Maps from |
|--------|------|------|-----------|
| GET | `/api/v1/admin/editorial/drafts` | `admin:read` | `GET /api/internal/editorial/drafts` |
| GET | `/api/v1/admin/editorial/drafts/:id` | `admin:read` | detail + full body |
| POST | `/api/v1/admin/editorial/drafts/:id/approve` | `admin:editorial` | existing approve |
| POST | `/api/v1/admin/editorial/drafts/:id/reject` | `admin:editorial` | existing reject; **optional** `{ comment }` (AT backlog) |
| POST | `/api/v1/admin/editorial/review-pending` | `admin:editorial` | advisory LLM review |
| POST | `/api/v1/admin/editorial/drafts/:id/review` | `admin:editorial` | single-draft review |

Orbita **continues** using `POST /api/v1/objects/drafts` (L11) — not admin token.

### 3.4 Moderation

| Method | Path | Auth | Maps from |
|--------|------|------|-----------|
| GET | `/api/v1/admin/moderation/queue` | `admin:read` | objects moderation queue |
| POST | `/api/v1/admin/moderation/objects/:id/approve` | `admin:moderation` | publish transition |
| POST | `/api/v1/admin/moderation/objects/:id/reject` | `admin:moderation` | archive / reject |

(Exact path names follow existing objects lane handlers — normalize in implementation.)

### 3.5 Newsletter ops

| Method | Path | Auth | Maps from |
|--------|------|------|-----------|
| GET | `/api/v1/admin/newsletter/issues` | `admin:read` | compile issue history |
| POST | `/api/v1/admin/newsletter/compile-preview` | `admin:read` | dry-run markdown (no send) |
| POST | `/api/v1/admin/newsletter/send-issue` | `admin:newsletter` | pilot cap enforced (`NEWSLETTER_PILOT_MAX`) |

Public subscribe/unsubscribe stays on `/api/newsletter/*` — not admin.

### 3.6 Internal agent jobs (optional v1.1)

| Method | Path | Auth | Notes |
|--------|------|------|-------|
| POST | `/api/v1/admin/agent/compile-draft` | `admin:read` | Newsletter compile job |
| POST | `/api/v1/admin/agent/cluster-replies` | `admin:metrics` | Reply clustering stub |

Can ship in v1.1 if scope tight — dashboard + editorial Bearer parity is the MVP bar.

---

## 4. Human UI — keep vs agent-only

| Surface | Keep human UI? | Rationale |
|---------|----------------|-----------|
| **`/editorial`** approve/reject + full article read | **Yes — primary** | Long-form judgment; founder reads body on site |
| **`/editorial` Run agent review** button | Optional | Agent can call API; button stays for convenience |
| **`/moderation`** queue | **Yes — thin** | Visual scan of member submissions |
| **`/newsletter`** admin send | **Yes — thin** | Preview + confirm before send; agent can duplicate via API |
| **Usage dashboards, subscriber charts, catalog counts** | **No dedicated UI** | Agent queries `GET /admin/dashboard` daily |
| **Zeabur deploy, env secrets** | **Out of scope** | Stay in host panel / local env |
| **Curated home JSON** | **PR workflow** | Unchanged (`curated-home-refresh` skill) |

**Design rule:** If the task is **read a 2k-word draft and decide**, keep human UI. If the task is **“how many pending / how many subs / any 429s yesterday”**, agent API only.

---

## 5. Public web — paradigm documentation

Ship on **both** `.io` and `.org` (shared markdown component or duplicated page):

### 5.1 `/for-agents#operations` (new section)

Content blocks:

1. **Three participant classes** — public readers, contributor agents (L11), operator agents (L25).
2. **Why admin is an API** — same as why articles are an API; HTML is not the control plane.
3. **Auth** — admin authorize flow (no keys in page).
4. **Example** — “Daily ops agent” pseudo-workflow: capabilities → dashboard → list editorial drafts.
5. **Link** to L11 section above (contributor vs operator distinction).

### 5.2 Machine hints

- Footer link: **“Agent entry”** already exists on `.io` home tile → keep; add **“Operator API”** sub-link on `/for-agents` only (not home hero).
- Optional JSON-LD / meta on `/for-agents`: `"agentRoles": ["reader", "contributor", "operator"]`.

### 5.3 Capabilities honesty

Update L11 `GET /api/v1/capabilities` to:

- Bump `implementation_status` when objects/community endpoints are live (today: stale `wave7_v1`).
- Cross-link `admin_capabilities_url` field pointing to `/api/v1/admin/capabilities`.

---

## 6. Out of scope (this wave)

- Stripe / agent credits (Wave 20b)
- Auto-approve editorial (Wave 22 / A1)
- Newsletter public archive (Wave 20a / B3)
- Full admin SPA / Retool-style console
- Non-founder multi-tenant RBAC
- Orbita platform changes (stay in orbita repo)

---

## 7. Implementation notes (light technical)

| Lane | Work |
|------|------|
| L2 Backend | New `lanes/admin-agent/` router mounted at `/api/v1/admin`; wrap editorial/moderation/newsletter services |
| L3 Auth | Admin token table + authorize flow (reuse agent-protocol email patterns) |
| L0 Shared | `wave25-admin.ts` schemas; extend capabilities types |
| L8/L9 Web | `/for-agents` operations section; optional `/for-operators` alias |
| Docs | `CURRENT_STATUS`, `SESSION_HANDOFF`, `AGENT_ENV.md` admin token env |

**Tests:** admin token gate 401; non-ADMIN email authorize rejected; dashboard JSON shape; editorial approve via Bearer does not bypass human policy fields.

**Env:** no new secrets beyond existing ZSend for authorize emails; `ADMIN_EMAILS` unchanged.

---

## 8. Success criteria

- [ ] Founder can run daily ops from Cursor agent using Bearer only (no browser cookie).
- [ ] `GET /api/v1/admin/capabilities` is linked from public `/for-agents` and returns a coherent manifest.
- [ ] `/editorial` human UI still works unchanged for approve/reject.
- [ ] L11 contributor tokens cannot call admin routes (403).
- [ ] Backend tests green; turbo build passes.

---

## 9. Kickoff command (orchestrate)

From repo root (after `source .cursor-env`):

```bash
bun ~/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave-admin-agent-api: Ship Wave 25 — Admin Agent API + public ops manifest per docs/waves/wave-admin-agent-api.md. Backend: L25 admin Bearer auth (ADMIN_EMAILS-gated authorize), GET /api/v1/admin/capabilities + /dashboard + metrics; Bearer parity for editorial approve/reject/review-pending and moderation queue; newsletter ops read/send behind admin:newsletter. Reuse editorial-supply/objects/newsletter service layers — no duplicate business logic. Web: extend /for-agents#operations on .io and .org (paradigm copy); update L11 capabilities cross-link + honest implementation_status. Keep /editorial /moderation /newsletter human UI. Tests for auth gates + dashboard shape. No Stripe, no auto-approve. Run pnpm turbo build + backend test. English UI." \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

---

## 10. Related backlog (non-blocking)

- L11 `POST /api/v1/agent/refresh` (contributor + admin)
- `editorial_comment` on reject (Orbita feedback loop)
- Alias fields `editorial_decision*` on approve/reject (Orbita poll ingest)
