# Wave 19 — Editorial review + agent discoverability

**Slug:** `wave19-editorial-review`  
**Ref:** `main` (follows Wave 18 platform depth)  
**Authoritative spec:** [SITE_DESIGN_v2.md](../SITE_DESIGN_v2.md) §12 and L12 interface updates

---

## Scope

Wave 19 ships editorial-review quality signals for founder moderation, public post-publish discoverability for external agents, and the deferred interaction read-back parity from Wave 18.

### Pillar 1 — Editorial-review agent (no auto-approve)

- `POST /api/internal/editorial/review-pending` (admin session) reviews pending editorial drafts (`draft` / `pending`) and writes `metadata.editorial_agent`.
- Optional `POST /api/internal/editorial/drafts/:id/review` reviews one draft.
- Review metadata contract:
  - success: `{ score, flags, summary, reviewedAt, model? }`
  - graceful skip: `{ skipped: true, reviewedAt, reason }`
- Uses `lanes/chat/llm.ts` config path (`MINIMAX_API_KEY` / `CHAT_LLM_*`).
- **Invariant:** review endpoints never change publish lifecycle state (no auto-approve, no publish transition).

### Pillar 2 — `/editorial` queue UI

- `.org` editorial draft cards now display agent score/flags/summary/model when `metadata.editorial_agent` exists.
- Skip metadata renders as a muted skipped badge.
- Queue header includes `Run agent review` action (`POST /api/internal/editorial/review-pending`).
- Existing `View full article`, `Approve`, `Reject` flow remains unchanged.

### Pillar 3 — Agent content index + verify path

- New public endpoint: `GET /api/v1/objects/catalog?site=io|org`.
- Catalog lists published public Wave 12 knowledge/community objects with:
  - `id`, `slug`, `title`, `objectType`, `type`
  - `human_url`, `api_url`
  - `source: 'wave12_object'`
- Legacy `GET /api/v1/content` and `GET /api/v1/content/:slug` stay intact and are tagged `source: 'knowledge_base'`.
- `GET /api/v1/capabilities` documents post-publish verify via `GET /api/v1/objects/{id}` or `GET /api/v1/objects/catalog`.

### Pillar 4 — Wave 18 follow-up interaction read-back

- `listInteractionsForUser` and community interaction listing now include:
  - `request_mentor`
  - `ask_for_intro`
  - `apply`
- `.org` detail/list action done-state survives reload for these persisted interactions.

### Pillar 5 (optional polish) — status

- ✅ `.io`: shipped `More in Library` related links footer on article pages.
- ✅ `.io`: shipped inline Saved confirmation state for save/bookmark affordances.
- ⏸️ `.org`: `More in Knowledge` related links and inline Followed confirmation are deferred.

---

## Out of scope (unchanged)

- No auto-approve workflow
- No Stripe/credits
- No newsletter archive

---

## Definition of done

1. Editorial review writes `metadata.editorial_agent` and never mutates publish state.
2. `/editorial` UI surfaces review results and supports run-review action.
3. External agents can verify newly published objects using catalog/object endpoints.
4. Reload-safe interaction done-state works for `request_mentor` / `ask_for_intro` / `apply`.
5. Build + backend tests pass on the integrated branch.

---

## Verification commands

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
```

Expected outcomes on the integration branch:

- `pnpm turbo build`: pass for all workspace targets (`web-io`, `web-org`, `backend`, `combined`, `shared`, `content`)
- `pnpm --filter @ai-transformation/backend test`: pass (`70/70`)
