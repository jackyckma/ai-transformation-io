# Session handoff

**Date:** 2026-06-25  
**Branch:** `main`  
**Latest commit:** `58a174b` — Merge pull request #10 (Wave 16 content supply)  
**Push status:** merged to `origin/main`

## Active task

- **Roadmap item:** `wave17-newsletter-pilot` — next up (legacy Wave 10 newsletter scope; content supply now unblocked)
- **Definition of done:** See [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) §12, [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md); draft orchestrate goal doc when ready

## Current status

| Area | Status |
|------|--------|
| Wave 16 on `main` | ✅ merged PR [#10](https://github.com/jackyckma/ai-transformation-io/pull/10) @ `58a174b` |
| L12 editorial-supply | ✅ `/api/internal/editorial/drafts` + approve/reject; Bearer parity via `/api/v1/objects/drafts` |
| compile-draft extension | ✅ published knowledge + community + curated links |
| Idempotent seed | ✅ `pnpm seed:editorial` — 8 knowledge + 5 community; run #2 created 0 |
| .org admin queue | ✅ `/editorial` (ADMIN_EMAILS gate) |
| Orbita | ✅ `.editorial-orbita` exact-path docs only; runtime non-blocking |
| Build + tests (post-merge verify) | ✅ turbo build 6/6; backend tests 55/55 |

## Verified in

- **Local agent:** build + backend tests on `main` after PR #10 merge
- **Orchestrate verifier:** seed twice, editorial-supply integration tests, PR #10 scope check

## Top priority next

1. Draft Wave 17 orchestrate goal (`docs/waves/wave17-newsletter-pilot.md`) and kick off newsletter pilot (compile-draft → issue send path; still no credits/Stripe).
2. Run `pnpm seed:editorial` on production DB if seeded content not yet visible live (Zeabur one-off or deploy hook — confirm before mass send).
3. Optional: wire Orbita as external HTTP client to L12 draft endpoints (doc-only in this repo today).

## How to run / verify

```bash
pnpm install
pnpm turbo build
pnpm --filter @ai-transformation/backend test
pnpm seed:editorial
pnpm seed:editorial
```

Admin editorial queue (requires ADMIN_EMAILS session on .org):

- https://ai-transformation.org/editorial

## Key paths

| Concern | Path |
|---------|------|
| Wave 16 goal (shipped) | `docs/waves/wave16-content-supply.md` |
| L12 contract | `apps/backend/src/lanes/editorial-supply/INTERFACE.md` |
| Seed script | `scripts/seed-editorial-content.ts` |
| compile-draft | `apps/backend/src/lanes/agent/compile-draft.ts` |
| .org admin queue | `apps/web-org/app/editorial/page.tsx` |
| Newsletter spec | `docs/EMAIL_NEWSLETTER.md` |
| Orbita runbooks | `.editorial-orbita/` |

## Warnings

- Newsletter **pilot send** still not live until Wave 17 ships; infra (ZSend, issues/subscribers tables) exists from Wave 8.
- Orbita integration remains **doc-only** in this repo.
- Keep `packages/shared/src/index.ts` untouched.
- After doc-only merges, Zeabur may need manual restart if production shows 502.
