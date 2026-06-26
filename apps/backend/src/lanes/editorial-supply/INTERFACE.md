# L12 — Editorial supply INTERFACE

**Status:** Planned (Wave 16) — contract first; implementation follows.  
**Purpose:** Ingest editorial drafts into the Wave 12 object store with founder review before publish. Optional **Orbita client** posts drafts via L11 Bearer token — Orbita runtime lives in [jackyckma/orbita](https://github.com/jackyckma/orbita), not in this repo.

---

## Owns

- `apps/backend/src/lanes/editorial-supply/**` (to be created)
- `.editorial-orbita/` — runbooks, Orbita `client_id` docs (no secrets)

## Does NOT own

- Orbita platform code (`orbita` repo)
- LLM session scheduling (Orbita)
- Public newsletter send (L6 — Wave 17)

---

## Provides (planned v1)

| Endpoint | Auth | Purpose |
|----------|------|---------|
| `POST /api/internal/editorial/drafts` | `ADMIN_EMAILS` session **or** L11 Bearer with editorial scope | Create draft knowledge/community object |
| `GET /api/internal/editorial/drafts` | Admin session | List pending review |
| `GET /api/internal/editorial/drafts/:id` | Admin session | Full draft body for review before approve/reject |
| `POST /api/internal/editorial/drafts/:id/approve` | Admin session | Publish or queue for moderation per member prefs |
| `POST /api/internal/editorial/drafts/:id/reject` | Admin session | Archive / discard |

Public read remains L11 + object store visibility — no new public routes required for v1.

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

- Drafts stored as Wave 12 objects with `status: draft` (or dedicated `editorial_drafts` metadata table if needed — decide at implement time).
- Approved objects → existing submit/publish flow (Wave 12 moderation).

---

## Wave

- **16a:** Internal draft ingest + admin list/approve (manual)
- **16b:** Orbita scheduled session → draft API (parallel lane)
- **16c:** Seed N knowledge + M community objects for home/newsletter

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
