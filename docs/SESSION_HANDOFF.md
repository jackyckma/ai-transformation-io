# Session handoff

**Date:** 2026-06-26  
**Branch:** `main`  
**Latest commit:** `d621b7a` — Merge pull request #11 (Wave 17 newsletter pilot)  
**Push status:** merged to `origin/main`

## Active task

- **Roadmap item:** Wave 17 ✅ shipped · **Wave 18** next (LLM ranking, agent deep links, Phase 2 intent UI parity)
- **Definition of done:** See [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) §12

## Current status

| Area | Status |
|------|--------|
| Wave 17 on `main` | ✅ PR [#11](https://github.com/jackyckma/ai-transformation-io/pull/11) @ `d621b7a` |
| Subscribe / unsubscribe | ✅ `POST /api/newsletter/subscribe`, `/unsubscribe` |
| Admin send | ✅ `POST /api/internal/newsletter/send-issue` (ADMIN_EMAILS, pilot cap) |
| Inbound replies | ✅ `POST /api/webhooks/inbound-email` (secret-gated) |
| UI | ✅ Footer subscribe + `/newsletter` admin on `.io` and `.org` |
| Build + tests (post-merge) | ✅ turbo 6/6; backend 55/55 |

## Top priority next

1. **Production pilot ops:** Zeabur env (`ZSEND_API_KEY`, `INBOUND_EMAIL_WEBHOOK_SECRET`, `NEWSLETTER_FROM_*`, `NEWSLETTER_PILOT_MAX`, `ADMIN_EMAILS`); seed ~10 subscribers; compile + send one issue.
2. **Inbound:** Deploy Cloudflare Email Worker (`replies+{issueToken}@…`) **or** manual reply fallback for first test.
3. **Wave 18:** Draft orchestrate goal when ready.

## How to run / verify

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
```

Admin newsletter (ADMIN_EMAILS session):

- https://ai-transformation.io/newsletter
- https://ai-transformation.org/newsletter

## Key paths

| Concern | Path |
|---------|------|
| Wave 17 goal | `docs/waves/wave17-newsletter-pilot.md` |
| Newsletter spec | `docs/EMAIL_NEWSLETTER.md` |
| L6 backend | `apps/backend/src/lanes/newsletter/` |
| Shared schemas | `packages/shared/src/wave17-newsletter.ts` |

## Warnings

- Cloudflare Worker **not** in repo — deploy separately per `EMAIL_NEWSLETTER.md`.
- Zeabur manual restart if 502 after merge-only deploy.
