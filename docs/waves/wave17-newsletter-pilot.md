# Wave 17 — Newsletter pilot (orchestrate goal)

**Slug:** `wave17-newsletter-pilot`  
**Ref:** `main` (includes Wave 16 @ `58a174b`)  
**Authoritative spec:** [EMAIL_NEWSLETTER.md](../EMAIL_NEWSLETTER.md), [SITE_DESIGN_v2.md](../SITE_DESIGN_v2.md) §12, legacy Wave 10 scope in [project-progress.md](../project-progress.md)

**Prerequisites (met):** Wave 15 UI readiness ✅ · Wave 16 content seed + compile-draft extension ✅ · ZSend domains verified ✅

---

## Kickoff command

From repo root (after `source .cursor-env`):

```bash
bun /home/jackyma/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave17-newsletter-pilot: Ship SITE_DESIGN_v2 Wave 17 (newsletter pilot — legacy Wave 10 scope) per docs/EMAIL_NEWSLETTER.md. Wave 17 delivers end-to-end pilot path (small list only, no Stripe/credits, no public archive): (1) L6 backend — replace 501 stubs with POST /api/newsletter/subscribe and POST /api/newsletter/unsubscribe (email + list io_pulse|org_harvest; store in subscribers table; pilot may use single opt-in active status). Add subscriber DB helpers (upsert, list active by list). (2) L6 admin send — POST /api/internal/newsletter/send-issue (ADMIN_EMAILS session): load draft issue by id, resolve from address (NEWSLETTER_FROM_IO|ORG or defaults pulse@/learn@), Reply-To replies+{replyToToken}@ai-transformation.io, send to active subscribers via existing ZeaburZSendProvider/NoopNewsletterProvider, mark issue sent with provider_id. Pilot safety cap: max 25 recipients per send unless NEWSLETTER_PILOT_MAX overridden. (3) L6 inbound — implement POST /api/webhooks/inbound-email with INBOUND_EMAIL_WEBHOOK_SECRET header check; accept JSON payload {replyToToken, from, subject, text|body}; insert contributions source=newsletter_reply linked to issue when token matches. Document Cloudflare Email Worker contract in docs/EMAIL_NEWSLETTER.md only (no Worker deploy in repo). Manual pilot fallback remains documented. (4) L10 admin issue helpers — GET /api/internal/agent/issues (list recent drafts/sent) optional if needed for UI; reuse existing compile-draft. (5) L8 web-io + L9 web-org — low-key footer subscribe field (site-appropriate list default, no hero funnel); thin ADMIN_EMAILS /newsletter admin page: compile draft, preview draftMd, send pilot to list with confirm dialog. English UI. Editorial tone — not product-marketing CTAs. (6) Tests in newsletter.test.ts: subscribe/unsubscribe happy path, send-issue with noop provider + cap, inbound webhook creates newsletter_reply contribution. (7) Update apps/backend/src/lanes/newsletter/INTERFACE.md, docs/EMAIL_NEWSLETTER.md, docs/CURRENT_STATUS.md, docs/SESSION_HANDOFF.md. Avoid editing packages/shared/src/index.ts if possible — add schemas in a new shared module if needed. Run pnpm turbo build and pnpm --filter @ai-transformation/backend test. Open ONE draft PR to main." \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

---

## Scope

### In scope

| Lane | Work |
|------|------|
| L6 Newsletter | Subscribe/unsubscribe APIs, send-issue admin route, inbound webhook, subscriber + issue DB helpers |
| L6 Provider | Reuse `ZeaburZSendProvider` / `NoopNewsletterProvider`; plain-text from issue `draftMd` |
| L10 Agent jobs | Optional issue list endpoint; `compile-draft` already extended in Wave 16 |
| L8 web-io | Footer subscribe (list `io_pulse`); admin `/newsletter` |
| L9 web-org | Footer subscribe (list `org_harvest`); admin `/newsletter` or shared pattern |
| L0 Shared | Subscribe/send request schemas in new module if needed (not barrel `index.ts` unless unavoidable) |
| Docs | `EMAIL_NEWSLETTER.md`, newsletter `INTERFACE.md`, status + handoff |

### Out of scope

- Public newsletter archive / issue pages (Wave 19+)
- Stripe agent credits
- Cloudflare Worker deployment (document contract only)
- Double opt-in email flow (optional later; pilot single opt-in OK)
- Prominent home subscribe funnels
- LLM ranking (Wave 18)

---

## Suggested orchestrate task tree

| Task | Branch | Notes |
|------|--------|-------|
| backend-newsletter | `orch/wave17-newsletter-pilot/backend-newsletter` | Subscribe, send, inbound, DB, tests |
| web-io-newsletter | `orch/wave17-newsletter-pilot/web-io-newsletter` | Footer subscribe + .io admin UI |
| web-org-newsletter | `orch/wave17-newsletter-pilot/web-org-newsletter` | Footer subscribe + .org admin UI |
| integrate-wave17 | `orch/wave17-newsletter-pilot/integrate-wave17` | Merge + draft PR |
| verify-wave17 | verifier | build + tests + subscribe/send/inbound proof |

---

## Definition of done

1. Visitor can subscribe via footer on `.io` (`io_pulse`) and `.org` (`org_harvest`); unsubscribe API works.
2. Admin can `compile-draft` → review issue → `send-issue` to active pilot list (noop in test env; ZSend when key set).
3. Inbound webhook can create `newsletter_reply` contribution when `INBOUND_EMAIL_WEBHOOK_SECRET` matches (integration test with fixture payload).
4. Pilot send capped (default 25); issue marked `sent` with `provider_id` / `sent_at`.
5. Reply-To uses `replies+{replyToToken}@ai-transformation.io` pattern documented for future Worker.
6. `pnpm turbo build` 6/6; backend tests pass (including new newsletter cases).
7. One draft PR; merge per founder default after review.

---

## Pilot operations (founder)

After merge to production:

1. Seed subscribers manually or via footer (~10 person pilot list per project-progress).
2. Admin compile draft on target site → send pilot issue.
3. Inbound: deploy Cloudflare Worker separately **or** manual forward to `info@` for first reply test.
4. Confirm ≥1 `newsletter_reply` in contributions before declaring pilot success.
