# L12 — Editorial supply INTERFACE

**Status:** Live (Wave 16 + Wave 19 extension).  
**Purpose:** Ingest editorial drafts into the Wave 12 object store with founder review before publish. Optional **Orbita client** posts drafts via L11 Bearer token — Orbita runtime lives in [jackyckma/orbita](https://github.com/jackyckma/orbita), not in this repo.

---

## Owns

- `apps/backend/src/lanes/editorial-supply/**`
- `.editorial-orbita/` — runbooks, Orbita `client_id` docs (no secrets)

## Does NOT own

- Orbita platform code (`orbita` repo)
- LLM session scheduling (Orbita)
- Public newsletter send (L6 — Wave 17)

---

## Provides (live v1)

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/internal/editorial/drafts` | `ADMIN_EMAILS` session **or** L11 Bearer with editorial scope | Create draft knowledge/community object |
| `GET /api/internal/editorial/drafts` | Admin session | List pending review |
| `GET /api/internal/editorial/drafts/:id` | Admin session | Full draft body for review before approve/reject |
| `POST /api/internal/editorial/drafts/:id/approve` | Admin session | Publish or queue for moderation per member prefs |
| `POST /api/internal/editorial/drafts/:id/reject` | Admin session | Archive / discard |
| `POST /api/internal/editorial/review-pending` | `ADMIN_EMAILS` session | Run the editorial-review agent over all pending/draft editorial drafts |
| `POST /api/internal/editorial/drafts/:id/review` | `ADMIN_EMAILS` session | Run the editorial-review agent over one draft |

Public read remains L11 + object store visibility — no new public routes required for v1.

---

## Editorial-review agent (Wave 19)

`POST /api/internal/editorial/review-pending` reviews the pending-draft set (the
same `status IN ('draft','pending')` + `metadata.editorial_source` set listed by
`GET /drafts`). Optional JSON body `{ site?: 'io' | 'org', limit?: number }`
scopes which drafts; default = all pending editorial drafts.

For each draft it computes an LLM review and persists it to
`metadata.editorial_agent` via `updateObjectLifecycle({ id, status: existing.status, metadata })`
— **publish state never changes** (status/visibility/publishedSlug untouched).
Review logic lives in `review.ts` and reuses `lanes/chat/llm.ts`
(`resolveLlmConfig` / `isChatLlmConfigured` / `extractAssistantContent`,
`MINIMAX_API_KEY` / `CHAT_LLM_*`). It **never throws** and the route never 500s:
with no key or any LLM error it writes a skip result.

`metadata.editorial_agent` shape (`EditorialAgentReview` in
`@ai-transformation/shared` / `wave19-editorial.ts`):

```jsonc
// success
{ "score": 0-100, "flags": ["tone", "factual-risk", ...], "summary": "...", "reviewedAt": "ISO", "model": "MiniMax-M3" }
// graceful skip (no key / llm_error / malformed)
{ "skipped": true, "reviewedAt": "ISO", "reason": "llm_not_configured" }
```

Responses:

- `review-pending` → `{ ok: true, reviewed: number, results: Array<{ id, editorial_agent }> }`
- `drafts/:id/review` → `{ ok: true, draft: <draftDetail with metadata.editorial_agent> }`

### Related Wave 19 backend contracts (other lanes)

- `GET /api/v1/objects/catalog?site=io|org` (objects lane, public, no auth) →
  `{ ok, site, origin, count, objects: ObjectCatalogEntry[] }`. Each entry:
  `{ id, slug, title, objectType, type, human_url, api_url: '${origin}/api/v1/objects/{id}', source: 'wave12_object' }`.
  human_url: knowledge on io → `/library/{slug}`, knowledge on org → `/knowledge/{slug}`,
  community → `/community/{id}`.
- `GET /api/v1/content` (+ `/content/:slug`) entries are now tagged `source: 'knowledge_base'`.
- `GET /api/v1/capabilities` documents the post-publish verify path (`objects/{id}` or `objects/catalog`).

---

## Consumes

| Lane | Contract |
|------|----------|
| L0 | Object types, visibility, community type schemas |
| L2 | DB, session middleware |
| L3 | Admin session gate (`ADMIN_EMAILS`) |
| L11 | Bearer write for external agent (Orbita) — same payloads as internal draft |
| L12 objects | `apps/backend/src/lanes/objects` create/submit pipeline |

**Dependency rule:** L12 calls objects lane through **HTTP-internal handlers or shared service boundary** — never import L5 harvest `src/` directly.

---

## Orbita client (non-blocking)

| Item | Value |
|------|-------|
| Platform | https://api.get-orbita.com |
| Suggested `client_id` | `content-ai-transformation-org` (`.io` later: `content-ai-transformation-io`) |
| Auth | Orbita API key + `x-orbita-client-id` |
| Target | `POST https://ai-transformation.io/api/v1/...` (via combined proxy) with site write Bearer in Orbita vault |
| Runbook | [.editorial-orbita/README.md](../../../.editorial-orbita/README.md) |

If Orbita is down, founder uses admin UI or curl against internal draft endpoints — **Wave 16 must not block on Orbita**.

---

## Data

- Drafts are stored as Wave 12 objects with `status: draft|pending` and editorial marker metadata (`editorial_source`).
- Review output persists at `metadata.editorial_agent` and never mutates publish lifecycle state.
- Approved objects continue through the existing submit/publish flow (Wave 12 moderation).

---

## Wave

- **16a:** Internal draft ingest + admin list/approve (manual)
- **16b:** Orbita scheduled session → draft API (parallel lane)
- **16c:** Seed N knowledge + M community objects for home/newsletter
- **19:** Editorial-review agent metadata + public objects catalog verify path + interaction read-back parity follow-up

---

## Verification

- Fixtures: `data/simulators/editorial/` (to be added)
- Manual: create draft → approve → visible on `/knowledge` or `/community`
- Orbita: trajectory shows successful HTTP POST to draft endpoint

---

## Related

- [UI_READINESS_AUDIT.md](../../../docs/UI_READINESS_AUDIT.md) — Wave 15 before seed content matters for empty states
- [EMAIL_NEWSLETTER.md](../../../docs/EMAIL_NEWSLETTER.md) — Wave 17 newsletter after seed
- [SITE_DESIGN_v2.md](../../../docs/SITE_DESIGN_v2.md) §12
