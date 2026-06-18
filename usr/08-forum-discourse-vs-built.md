# Forum: Discourse vs self-built — analysis

**Date:** 2026-06-18  
**Context:** .org needs forum with (a) UI integration, (b) unified user management, (c) future AI/agent content synthesis.

---

## Your requirements mapped

| Requirement | Self-built (Next + backend DB) | Discourse (self-hosted) |
|-------------|-------------------------------|-------------------------|
| **(a) UI integration** | ✅ Native — same Next.js layout, theme, nav | ⚠️ Partial — see integration levels below |
| **(b) User management** | ✅ Single auth in `apps/backend` | ✅ Via **DiscourseConnect SSO** (our backend = IdP) |
| **(c) AI / agent access** | ✅ Direct DB or internal API | ✅ REST API + webhooks; ❌ no raw DB on hosted plan |

---

## Discourse: can it do what you need?

### User management — YES (DiscourseConnect)

Discourse supports **your app as the identity provider**:

```
User signs in with Google on ai-transformation.org (apps/backend)
    ↓
User clicks "Discuss" → redirect to Discourse with SSO
    ↓
Backend /api/discourse/sso validates session, returns signed payload
    ↓
Discourse creates/syncs user (external_id = our user id)
```

Settings on Discourse side:
- `discourse_connect_url` → our backend endpoint
- `discourse_connect_secret` → shared HMAC secret
- `auth_skip_create_confirm` → skip duplicate signup screen

**One login, one user record in our DB.** Discourse holds a shadow account linked by `external_id`.

Also available: `sync_sso` admin API to pre-provision users.

### UI integration — THREE LEVELS

| Level | Effort | UX | Description |
|-------|--------|-----|-------------|
| **L1: Link out** | Low | Two sites | `community.ai-transformation.org` or `discuss.ai-transformation.org`; shared nav link only |
| **L2: SSO + themed subdomain** | Medium | Good enough | Match colors/fonts; user doesn't re-login; still Discourse UI |
| **L3: Headless (API-driven UI)** | High | Best | Build thread/post UI in Next.js; Discourse as API backend only — significant dev work |

**Reality:** True "(a) interface integration" like one seamless site requires **L3 headless** or **self-built**. Discourse's default UI always looks like Discourse (sidebar, trust levels, etc.).

### AI / agent content access — YES (with backend)

Discourse does **not** give you direct PostgreSQL access on **Discourse-hosted** plans. On **self-hosted** Discourse, you can access DB but shouldn't bypass API for app logic.

**Recommended pipeline for agents:**

```
Option A — API pull (works hosted or self-hosted)
  Backend cron / agent job
    → GET /posts.json, /t/{id}.json, search API
    → Admin API key ONLY on backend (never frontend)
    → Data Explorer plugin: SQL → CSV export via API

Option B — Webhooks (real-time)
  Discourse webhook: post_created, post_edited
    → POST to apps/backend/api/webhooks/discourse
    → Queue for agent synthesis

Option C — Self-hosted DB (self-hosted only)
  Read-only replica or periodic pg_dump
  → Overkill for MVP; API is enough
```

Discourse Meta thread (2024): community explicitly exports posts for LLM analysis via **Data Explorer** + API — this is a known pattern.

**Verdict for (c):** Discourse **can** feed your agent pipeline, as long as extraction runs from **backend** with Admin API or webhooks. You do not need direct DB access for MVP.

---

## Self-built forum: what you get

Minimal schema in backend:

```
users (shared)
topics (category, title, author, created_at)
posts (topic_id, body, author, created_at)
categories (slug, name, description)
```

Built in `web-org` as native pages under `/discuss`.

| Pros | Cons |
|------|------|
| Perfect UI unity | Build moderation, spam, notifications yourself |
| Trivial AI access (SQL) | No trust levels, gamification out of box |
| Fits monorepo architecture | 2–4 weeks for MVP forum vs 2–3 days Discourse setup |
| Schema designed for agent synthesis | Cold-start UX features (digest, prompts) you build |

---

## Side-by-side summary

| Dimension | Self-built | Discourse (self-hosted + SSO) |
|-----------|------------|-------------------------------|
| Time to MVP forum | 2–4 weeks | 2–5 days |
| UI integration | ⭐⭐⭐⭐⭐ | ⭐⭐ (link) – ⭐⭐⭐⭐ (headless, heavy) |
| User SSO | Native (same app) | DiscourseConnect (proven, ~1 day setup) |
| Moderation / spam | You build | Built-in (Akismet, trust levels, flags) |
| Notifications | You build | Built-in (email digests, watches) |
| Search | You build or Pagefind | Built-in full-text |
| Mobile | Your responsive UI | Discourse mobile web (good) |
| AI content export | Direct DB query | API + webhooks (sufficient) |
| Ops burden | Low (part of monorepo) | Medium (second service to deploy) |
| Zeabur deploy | One combined service | Second service OR subdomain container |
| Future split (Option A) | Forum stays in web-org | Discourse already separate |

---

## Recommendation for ai-transformation.org

### Phase 1 (MVP — matches your cold-start + AI goals)

**Self-built lightweight forum** in `web-org` + `apps/backend`:

- Categories: Getting Started, Work Redesign, Governance, Measuring Value, Ask the Community
- Topic list + thread view + markdown compose
- Google OAuth (backend) — login to post; public read
- Weekly prompt topics (admin-created via seed script)
- **`/api/agent/synthesize`** stub — backend can query all public posts anytime

**Why:** You care about UI unity and AI pipeline more than forum feature completeness at launch. Post volume will be low during cold start — Discourse's moderation advantages matter less with 20 users.

### Phase 2 (if community grows past ~100 active users)

Evaluate **self-hosted Discourse** at `discuss.ai-transformation.org`:
- Migrate posts via export/import OR run parallel
- DiscourseConnect SSO from existing backend users
- Keep AI pipeline on backend via API + webhooks
- web-org `/discuss` becomes embedded link or headless hybrid

### When to choose Discourse from day 1

Choose Discourse first if:
- You want real forum UX within days
- You accept subdomain + themed Discourse UI (L2 integration)
- You're willing to run a second Zeabur service
- Moderation/spam from day one is critical

---

## Integration architecture (either path)

```
                    apps/backend
                    ├── auth (Google OAuth)
                    ├── users
                    ├── assessment responses
                    ├── inquiries (email + question box)
                    └── forum posts (self-built)
                        OR discourse sync/webhooks (Discourse path)

web-org ──API_BASE_URL──► backend
web-io  ──API_BASE_URL──► backend (assessment, inquiries)
```

Agent job (future):
```
backend cron → fetch new posts since last run
             → LLM summarize / draft article
             → store in drafts table
             → human review → publish to .io or .org
```

---

*Related: [07-pre-scaffold-decisions.md](./07-pre-scaffold-decisions.md)*
