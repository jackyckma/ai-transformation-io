# Wave 16 — Content supply (orchestrate goal)

**Slug:** `wave16-content-supply`  
**Ref:** `main` (includes Wave 15 @ `378befe`)  
**Authoritative spec:** [L12 INTERFACE](../../apps/backend/src/lanes/editorial-supply/INTERFACE.md), [.editorial-orbita/README.md](../../.editorial-orbita/README.md), [content-brief.md](../../.editorial-orbita/content-brief.md)

---

## Kickoff command

From repo root (after `source .cursor-env`):

```bash
bun /home/jackyma/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave16-content-supply: Ship SITE_DESIGN_v2 Wave 16 (content supply — L12 editorial draft ingest + seed content) per apps/backend/src/lanes/editorial-supply/INTERFACE.md and .editorial-orbita/content-brief.md. Wave 16 delivers: (1) L12 backend editorial-supply lane — POST/GET /api/internal/editorial/drafts, approve/reject for ADMIN_EMAILS session; same create-draft contract callable via L11 Bearer on /api/v1/objects/drafts (reuse Wave 12 object store, no parallel DB). (2) Extend L10 compile-draft to include published knowledge/community objects + curated links for newsletter prep (Wave 17), not contributions-only. (3) Idempotent seed path meeting content-brief minimums: >=8 published .org knowledge objects + >=5 .org community highlights (mixed types), align data/curated/org-home.json slugs; label editorial seeds in metadata. (4) Minimal .org admin UI for draft queue (ADMIN_EMAILS only) OR document curl-only if UI too heavy — prefer thin /editorial page listing pending drafts + approve/reject. (5) Update .editorial-orbita runbooks with exact API paths (no Orbita platform code in this repo; Orbita client setup is doc-only, non-blocking). Shared schemas in packages/shared if needed. Run pnpm turbo build and pnpm --filter @ai-transformation/backend test. Update docs/CURRENT_STATUS.md + SESSION_HANDOFF.md. Open ONE draft PR to main. English UI/code." \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

---

## Scope

### In scope

| Lane | Work |
|------|------|
| L0 Shared | Editorial draft list/approve request schemas (if not inline in backend) |
| L12 Editorial supply | `apps/backend/src/lanes/editorial-supply/**`, mount `/api/internal/editorial/*` |
| L10 Agent jobs | Extend `compile-draft` to pull published objects |
| L5/L12 objects | Reuse create/submit/visibility — no duplicate object model |
| L9 web-org | Thin admin draft queue UI (ADMIN_EMAILS) |
| L7 | Curated JSON slug alignment; optional seed script under `scripts/` |
| Docs | `.editorial-orbita/*` API path updates, CURRENT_STATUS, SESSION_HANDOFF |

### Out of scope

- Orbita platform code (`jackyckma/orbita` repo)
- Live Orbita scheduled sessions (doc/runbook only)
- Newsletter send (Wave 17)
- Stripe credits
- LLM ranking (Wave 18)

---

## Suggested orchestrate task tree

| Task | Branch | Notes |
|------|--------|-------|
| shared-foundation | `orch/wave16-content-supply/shared-foundation` | Shared schemas + client helpers if needed |
| backend-editorial | `orch/wave16-content-supply/backend-editorial` | L12 + compile-draft + tests + seed script |
| web-org-editorial | `orch/wave16-content-supply/web-org-editorial` | Admin draft queue UI |
| integrate-wave16 | `orch/wave16-content-supply/integrate-wave16` | Merge + draft PR |
| verify-wave16 | verifier | build + tests + seed counts |

---

## Definition of done

1. Founder/admin can create draft → approve → object visible on `/knowledge` or `/community`.
2. Bearer token can create draft objects (same as external agent path).
3. Seed minimums from content-brief met on integrate branch (or via idempotent seed script run in verifier).
4. `compile-draft` output references knowledge/community URLs.
5. `.editorial-orbita/orbita-connection.md` documents real API paths for future Orbita client.
6. `pnpm turbo build` 6/6; backend tests pass.
7. One draft PR; merge per founder default after review.

---

## Orbita (non-blocking)

Wave 16 **must ship** without Orbita. Document `client_id: content-ai-transformation-org` and Bearer draft path only. Founder configures Orbita separately using `.editorial-orbita/runbooks/weekly-seed.md`.
