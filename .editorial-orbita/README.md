# Editorial Orbita client — ai-transformation.io / .org

**Lane:** L12 Editorial supply (Wave 16)  
**Platform:** [Orbita](https://get-orbita.com) — agent-native HTTP API ([github.com/jackyckma/orbita](https://github.com/jackyckma/orbita))

This folder is the **caller runbook** (like `orbita/marketing-agent/` for get-orbita.com). It does **not** contain Orbita platform code.

---

## Goal

A scheduled Orbita agent session drafts **knowledge** and **community** objects into ai-transformation via the same **L11 write API** an external agent would use. Founder approves before publish.

**Non-blocking:** Wave 15 UI and Wave 16a manual drafts proceed without Orbita.

---

## Glossary

| Name | What | Where |
|------|------|-------|
| Orbita API key (`orb_…`) | Calls Orbita sessions | Orbita `/admin` — gitignore locally |
| `client_id` | Memory / credentials namespace | Orbita `/admin` allow-list |
| Vault credential | ai-transformation **write Bearer** | Orbita vault only — name e.g. `atx_write_org` |
| Draft API | Our ingest endpoint | L12 `POST /api/internal/editorial/drafts` or `POST /api/v1/objects` (draft) |

---

## Planned client IDs

| client_id | Site | Profile | Mode |
|-----------|------|---------|------|
| `content-ai-transformation-org` | .org | `default` or custom editorial profile | draft → founder approve |
| `content-ai-transformation-io` | .io | TBD | later |

---

## HTTP allow-list (Orbita admin)

- `ai-transformation.io`
- `ai-transformation.org`

---

## Flow

```text
Orbita cron/webhook
  → POST /v1/sessions (client_id = content-ai-transformation-org)
  → agent reads brand-voice.md + EDITORIAL_POLICY (skill/memory)
  → tool/http POST ai-transformation API (Bearer from vault)
  → draft object in DB
  → founder GET /api/internal/editorial/drafts → approve
  → published on /knowledge or /community
  → Wave 17 compile-draft can include in newsletter
```

---

## Files

| File | Purpose |
|------|---------|
| [orbita-connection.md](./orbita-connection.md) | client_id table, vault names (no secrets) |
| [brand-voice.md](./brand-voice.md) | Editorial tone for .org / .io |
| [content-brief.md](./content-brief.md) | What to seed (types, pillars, frequency) |
| [runbooks/weekly-seed.md](./runbooks/weekly-seed.md) | Operator steps |

---

## Feedback loop

Orbita platform gaps → file issues in `orbita` repo or `orbita/marketing-agent/feedback-to-orbita.md` pattern.

---

## Related

- [apps/backend/src/lanes/editorial-supply/INTERFACE.md](../apps/backend/src/lanes/editorial-supply/INTERFACE.md)
- [data/curated/EDITORIAL_POLICY.md](../data/curated/EDITORIAL_POLICY.md)
