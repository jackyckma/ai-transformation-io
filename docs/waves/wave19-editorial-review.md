# Wave 19 — Editorial review & agent discoverability

**Slug:** `wave19-editorial-review`  
**Status:** ✅ Shipped (PR #13 merged 2026-06-26)  
**Ref:** `main` after Wave 18  
**Authoritative spec:** [L12 INTERFACE](../../apps/backend/src/lanes/editorial-supply/INTERFACE.md), [SITE_DESIGN_v2.md](../SITE_DESIGN_v2.md) §12

**Prerequisites (met):** Wave 16 L12 ✅ · Orbita AT1a ✅ · `/editorial` full-body ✅ · Wave 18 ✅

---

## What shipped

### Pillar 1 — Editorial-review agent (no auto-approve)

- `POST /api/internal/editorial/review-pending` (admin) + optional `POST /api/internal/editorial/drafts/:id/review`
- Writes `metadata.editorial_agent` — never changes publish state
- Graceful skip when no LLM key

### Pillar 2 — `/editorial` UI

- Agent score/flags/summary on draft cards; **Run agent review** button
- View full article + Approve/Reject unchanged

### Pillar 3 — Agent catalog

- `GET /api/v1/objects/catalog?site=io|org` — published Wave 12 objects (`source: wave12_object`)
- Legacy content index tagged `source: knowledge_base`

### Pillar 4 — Interaction read-back

- `request_mentor`, `ask_for_intro`, `apply` in listInteractions

### Pillar 5 — UI P1 (partial)

- ✅ .io: More in Library footer + inline Saved
- ⏸️ .org: More in Knowledge + inline Followed (deferred)

**Verification:** turbo 6/6 · backend **70/70**

---

## Kickoff command (historical)

```bash
bun ~/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave19-editorial-review: …" \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

(Full goal string in git history @ `75b9d79`.)

---

## Orbita handoff

Posted: `~/Orbiter-AT-dogfood/inbox/at-to-orbita/2026-06-26-wave19-catalog-review-at.md`

---

## Notes

- Early Orbita volume = training corpus; scores advisory only
- Auto-approve policy remains **founder TBD** after calibration
