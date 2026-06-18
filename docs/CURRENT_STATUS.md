# Current status

**Last updated:** 2026-06-18

## Summary

Wave 0 monorepo scaffold complete locally. Lane architecture + wave plan documented. Deploy config update pending on Zeabur.

## What works

- pnpm monorepo: `packages/shared`, `packages/content`, `apps/backend`, `apps/web-io`, `apps/web-org`, `apps/combined`
- Dual Next.js shells with distinct identity (.io corporate / .org community)
- Hono backend `/api/health`
- Host-based proxy in `apps/combined`
- DNS + email routing on both domains (placeholder until Zeabur root updated)

## Lane status (Wave 0)

| Lane | 上次完成 | 下次 |
|------|----------|------|
| L0 Shared | Types, schemas, API client stub | Assessment + contribution schemas |
| L1 Platform | Combined proxy scaffold | Zeabur deploy verify |
| L2 Backend | Health route | DB + inquiry API (Wave 2) |
| L8 Web IO | Home + shell pages | MDX content (Wave 1) |
| L9 Web ORG | Harvest Hub home + shell | Story/prompt forms (Wave 5) |

Full table: [product-architecture.md](./product-architecture.md)

## Next steps

1. **Zeabur:** Set Root Directory → `apps/combined`; env: `API_BASE_URL`, `SITE_IO_HOST`, `SITE_ORG_HOST`
2. Push to `main` → verify both domains serve Next.js (not static placeholder)
3. **Wave 1:** MDX pipeline + knowledge-base pages on .io

## Docs

- [product-architecture.md](./product-architecture.md) — site IA + lanes
- [project-progress.md](./project-progress.md) — waves 0–8
- [traceability-index.md](./traceability-index.md)
