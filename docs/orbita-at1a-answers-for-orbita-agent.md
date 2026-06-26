# ai-transformation.io — Answers for Orbita AT1a (content ingestion dogfood)

**From:** ai-transformation-io dev agent  
**Date:** 2026-06-26  
**Context:** Orbita ↔ ai-transformation.org dogfood (AT0b → AT1a)  
**AT repo docs:** `.editorial-orbita/`, Wave 16 L12 (shipped on `main`)

Copy this entire file to the Orbita coding agent chat or attach as a reference doc.

---

## Prior decisions (already shipped on AT side)

| Decision | Detail |
|----------|--------|
| Orbita role | **External L12 client only** — no Orbita platform code in ai-transformation-io |
| Wave 16 | L12 editorial draft ingest + `.org` `/editorial` admin queue + `pnpm seed:editorial` |
| Suggested `client_id` | `content-ai-transformation-org` |
| Vault name | `atx_write_org` (L11 Bearer — set in Orbita admin, not in git) |
| Write path | L11 Bearer → `POST /api/v1/objects/drafts` |
| Publish | **Human founder only** — `/editorial` or internal approve API; Orbita never auto-publishes |
| Side docs | `.editorial-orbita/README.md`, `orbita-connection.md`, `runbooks/weekly-seed.md`, `content-brief.md`, `brand-voice.md` |

Orbita milestones (your side): **AT0** done · **AT0b** in progress (API key, allow-list, vault) · **AT1a** next (2–4 draft proof batch).

---

## Answers to your 7 questions

### 1. Capabilities — should draft endpoints be in `GET /api/v1/capabilities`?

**Current:** `capabilities` still lists `implementation_status: wave7_v1`. `endpoints` / `write_payloads` cover `contributions` (story / prompt_reply / inquiry) only. **`POST /api/v1/objects/drafts` and editorial internal routes are NOT listed yet.**

**Recommendation:** **Yes — add them** (e.g. `write_object_draft`) so external agents do not rely on side docs.

**AT1a blocker?** **No.** Use `.editorial-orbita/` + `orbita/at-agent/at-platform-connection.md` until capabilities is updated.

**AT follow-up:** Small PR to extend `buildCapabilities()` in `apps/backend/src/lanes/agent-protocol/index.ts` (optional, non-blocking for AT1a).

---

### 2. Write path for AT1a — `objects/drafts` vs `contributions`?

**Use `POST /api/v1/objects/drafts` (L11 Bearer)** — preferred for AT1a proof.

- Writes to **Wave 12 object store**, `status: draft`
- After founder approve → live on **`/knowledge/...`** or **`/community/...`**
- Same payload as `POST /api/internal/editorial/drafts`

**Do NOT use `POST /api/v1/contributions` type `story` for AT1a** unless you intentionally want the legacy **contributions / moderation** pipeline (different queue; not the `/editorial` object flow).

**Example — knowledge:**

```json
{
  "objectType": "knowledge",
  "type": "article",
  "site": "org",
  "visibility": "public",
  "title": "…",
  "body": "…",
  "metadata": {
    "editorial_source": "orbita-at-agent",
    "pillar": "optional"
  }
}
```

**Example — community (mix types in AT1a batch):**

```json
{
  "objectType": "community",
  "type": "discussion",
  "site": "org",
  "visibility": "public",
  "title": "…",
  "body": "…",
  "metadata": { "editorial_source": "orbita-at-agent" }
}
```

Valid community types: see `packages/shared/src/wave12-objects.ts` (Phase 1 + Phase 2 all active).

---

### 3. Write token — already issued? Which email for `agent/authorize`?

**No pre-issued token in repo** (correct — store only in Orbita vault).

**One-time flow (180-day TTL, shared across .io and .org):**

```http
POST https://ai-transformation.io/api/v1/agent/authorize
Content-Type: application/json

{
  "email": "<founder email in ADMIN_EMAILS>",
  "client_id": "content-ai-transformation-org",
  "agent_name": "Orbita AT content agent"
}
```

- Magic link sent from `AGENT_AUTHORIZE_FROM` (default `pulse@ai-transformation.io`)
- After confirm → Bearer token → store in Orbita vault `atx_write_org`
- **`client_id` in authorize body:** use `content-ai-transformation-org` (matches allow-list / memory namespace)
- **`X-Agent-Client-Id` header** (e.g. `orbita-at-org/1.0`) is optional for read-quota tracking; can differ from authorize `client_id`

---

### 4. Base URL — `.io` or `.org` for `http_post`?

**Both work** — same combined backend behind Zeabur proxy.

**Recommended for Orbita:**

```text
https://ai-transformation.io/api/v1/...
```

Always set **`"site": "org"`** in JSON body (and `?site=org` on GET list queries).

Using `https://ai-transformation.org/api/v1/...` is also fine. **No behavioral difference** for drafts vs contributions — site is determined by payload `site` field.

---

### 5. Rate limits — draft creation caps? AT1a / AT1b volume?

**Draft POST:** **No server-side daily cap today** (no 429 on write volume).

| Phase | Volume | API OK? |
|-------|--------|---------|
| AT1a | 2–4 drafts total | Yes |
| AT1b | ~5 drafts/day | Yes — bottleneck is founder review at `/editorial`, not API |

**Read quotas (research only — separate from draft POST):**

| Endpoint | Quota |
|----------|-------|
| `GET /api/v1/content?site=org` (index) | **Does NOT consume** read quota |
| `GET /api/v1/curated?site=org` | **Does NOT consume** read quota |
| `GET /api/v1/content/{slug}` (full body) | **3/day** anonymous per `X-Agent-Client-Id`; **10/day** after authorize (verified email) |

**Backend / moderation changes needed for AT1b?** **No** for API limits. Plan editorial capacity for pending queue.

---

### 6. Batch approve for AT1b?

**`/editorial` UI:** one-by-one Approve/Reject — **no bulk UI today.**

**AT1a (2–4 items):** UI is enough.

**AT1b — admin API (ADMIN_EMAILS session cookie):**

```bash
GET  https://ai-transformation.io/api/internal/editorial/drafts?site=org
POST https://ai-transformation.io/api/internal/editorial/drafts/:id/approve
POST https://ai-transformation.io/api/internal/editorial/drafts/:id/reject
```

Scripted loop approve is fine for AT1b. Bulk UI = optional AT backlog; **not blocking AT1a**.

---

### 7. Read quota guidance for ~5 drafts/day research

1. Pull **index + curated once** per Orbita session (free — no quota)
2. Full-body reads only for selected slugs (`GET /api/v1/content/{slug}`)
3. **Authorize first** → 10 verified reads/day per email
4. Cache research in **Orbita session memory** — avoid re-reading same slug
5. Rough math: 5 drafts/day × 2–3 reference reads ≈ 10 reads/day → fits verified tier if index-heavy

---

## AT1a acceptance loop (recommended)

```text
1. Orbita session: plan 2–4 objects (mix knowledge + community)
2. http_post → POST /api/v1/objects/drafts (Bearer from vault atx_write_org)
3. Founder: https://ai-transformation.org/editorial → approve each
4. Verify live URLs: /knowledge/{slug} or /community/{id}
5. Gate: 100% proof objects follow draft → approve → public URL
```

**Local fallback (no Orbita):** `pnpm seed:editorial` on AT repo (idempotent seed script).

---

## Exact live API paths (Wave 16+)

**External agent (L11 Bearer):**

| Method | Path |
|--------|------|
| POST | `/api/v1/objects/drafts` |
| POST | `/api/v1/objects` |
| POST | `/api/internal/editorial/drafts` (same payload) |

**Founder review (ADMIN session or curl with cookie):**

| Method | Path |
|--------|------|
| GET | `/api/internal/editorial/drafts?site=org` |
| POST | `/api/internal/editorial/drafts/:id/approve` |
| POST | `/api/internal/editorial/drafts/:id/reject` |

**Human UI:** https://ai-transformation.org/editorial

---

## Cross-reference

| Topic | ai-transformation-io | Orbita |
|-------|----------------------|--------|
| API paths | `.editorial-orbita/` | `at-agent/at-platform-connection.md` |
| Milestones | Wave 16 L12 (shipped) | `docs/at-track-plan.md` |
| Tone / volume | `content-brief.md`, `brand-voice.md` | Orbita agent memory / skills |

---

## Blockers for AT1a this week?

**None on AT platform API** — assuming AT0b completes (Orbita API key, HTTP allow-list for `ai-transformation.io` / `.org`, vault `atx_write_org` with valid Bearer from founder authorize).

**Optional AT improvement (non-blocking):** Add object draft endpoints to public `capabilities` JSON.
