# Wave 19 — Editorial review & agent discoverability (orchestrate goal)

**Slug:** `wave19-editorial-review`  
**Ref:** `main` @ `6e91a00` (editorial full-body UI)  
**Authoritative spec:** [L12 INTERFACE](../../apps/backend/src/lanes/editorial-supply/INTERFACE.md), [SITE_DESIGN_v2.md](../SITE_DESIGN_v2.md) §12, Orbita handoff `~/Orbiter-AT-dogfood/state/STATUS.md` (AT1b)

**Prerequisites (met):** Wave 16 L12 ✅ · Orbita AT1a proof ✅ · `/editorial` full draft body ✅ · Wave 18 ✅

**Parallel:** Orbita AT1b ~5 drafts/day (training corpus). **No auto-approve** in this wave — human final approve remains default.

---

## Kickoff command

From repo root (after `source .cursor-env`):

```bash
bun /home/jackyma/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave19-editorial-review: Ship AT1b editorial-review agent + agent discoverability per L12 INTERFACE and Orbita dogfood handoff. Four pillars — no auto-approve, no Stripe/credits, no newsletter archive: (1) Editorial-review agent — extend L12 editorial-supply: POST /api/internal/editorial/review-pending (ADMIN_EMAILS) runs LLM review over pending drafts (status draft/pending from objects store); for each draft write metadata editorial_agent { score 0-100, flags string[], summary, reviewedAt, model? } without changing publish state. Reuse chat/llm.ts (MINIMAX_API_KEY / CHAT_LLM_*); graceful skip when no key (metadata editorial_agent: { skipped: true }). Optional POST /api/internal/editorial/drafts/:id/review for single draft. Tests mock LLM + prove no-key skip. (2) /editorial UI — show agent summary/score/flags on draft cards when metadata present; badge when skipped. Keep View full article + approve/reject unchanged. (3) Agent content index — extend GET /api/v1/content list (and GET /content/:slug where applicable) OR add GET /api/v1/objects/catalog?site= for published public knowledge+community objects with { id, slug, title, objectType, type, human_url, api_url, source: wave12_object }; update GET /api/v1/capabilities agent_action text to document post-publish verify via objects/{id} OR new catalog. Do NOT break legacy knowledge-base entries (source: knowledge_base). Tests prove Orbita verify path lists published Wave 12 objects. (4) Wave 18 follow-up — extend listInteractionsForUser + community listInteractions API to return request_mentor, ask_for_intro, apply kinds so .org detail done-state survives reload (actions already persist). (5) UI P1 polish if time — article footer More in Library/Knowledge related links on .io content-page-layout + .org knowledge-object-view; inline Saved/Followed confirmation on save/follow (subtle, no toast library required). Update docs/CURRENT_STATUS.md, SESSION_HANDOFF.md, L12 INTERFACE.md, .editorial-orbita runbooks (review-pending path). Run pnpm turbo build and pnpm --filter @ai-transformation/backend test. Open ONE draft PR to main. English UI." \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

---

## Scope

### In scope

| Lane | Work |
|------|------|
| L12 Editorial supply | Review agent job + metadata on pending drafts |
| L10 Agent jobs | Optional: hook review after compile-draft batch (admin-only) |
| L11 Agent protocol | Content/catalog index for Wave 12 published objects + capabilities text |
| L2 Backend | `listInteractionsForUser` read-back for Phase 2 action kinds |
| L9 web-org | `/editorial` agent score/flags display |
| L8/L9 | P1 article footer + inline save confirmation (if time) |
| Docs | CURRENT_STATUS, SESSION_HANDOFF, INTERFACE.md, `.editorial-orbita/*` |

### Out of scope

- Auto-approve policy (founder TBD after calibration)
- Orbita platform code
- Newsletter archive / Stripe credits (Wave 19 scale — separate doc)
- Replacing human `/editorial` queue
- Corpus reset tooling (manual/admin only)

---

## Suggested orchestrate task tree

| Task | Branch | Notes |
|------|--------|-------|
| backend-editorial-review | `orch/wave19-editorial-review/backend-editorial-review` | Review agent + catalog index + listInteractions fix + tests |
| web-org-editorial-review | `orch/wave19-editorial-review/web-org-editorial-review` | /editorial agent badges + P1 polish (.org) |
| web-io-editorial-review | `orch/wave19-editorial-review/web-io-editorial-review` | P1 article footer (.io) |
| integrate-wave19-editorial | `orch/wave19-editorial-review/integrate-wave19-editorial` | Merge + draft PR |
| verify-wave19-editorial | verifier | build + tests + catalog lists Wave 12 objects |

---

## Definition of done

1. Admin can trigger editorial review; pending drafts gain `editorial_agent` metadata when LLM configured.
2. `/editorial` shows agent summary without hiding human approve/reject.
3. External agents can discover published Wave 12 objects via documented index/catalog endpoint (legacy KB entries preserved).
4. Phase 2 community action done-state survives page reload on .org detail.
5. `pnpm turbo build` 6/6; backend tests pass (new review + catalog + interaction tests).
6. One draft PR; merge per founder default after review.

---

## Orbita handoff

After merge, post to `~/Orbiter-AT-dogfood/inbox/at-to-orbita/` with catalog verify path. Orbita continues `objects/drafts` unchanged.

---

## Notes

- Early Orbita volume is **training corpus** — agent scores are advisory, not publish gates.
- Review agent must **never** auto-approve in v1 of this wave.
