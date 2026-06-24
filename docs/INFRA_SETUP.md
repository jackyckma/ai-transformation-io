# Infrastructure setup

**Last updated:** 2026-06-18

## Zeabur service

| Item | Value |
|------|-------|
| Project ID | `6a33221c7cea1559991a43e5` |
| Service ID | `6a3322239a194960c7edec34` |
| Server IP | `178.104.245.43` (Ocean) |
| Plan type | `nodejs` (was `static`; upgraded 2026-06-18) |
| Root Directory | repo root (empty) — monorepo build via `zbpack.ai-transformation-io.json` |
| Build | `pnpm install && pnpm build` |
| Start | `pnpm --filter @ai-transformation/combined start` |

### Environment variables

| Key | Value |
|-----|-------|
| `PORT` | `${WEB_PORT}` (Zeabur default) |
| `API_BASE_URL` | `http://127.0.0.1:3001` |
| `SITE_IO_HOST` | `ai-transformation.io` |
| `SITE_ORG_HOST` | `ai-transformation.org` |

Config file: `zbpack.ai-transformation-io.json` at repo root.

### Bound domains

| Domain | Status |
|--------|--------|
| ai-transformation.io | PROVISIONED ✅ |
| ai-transformation.org | PROVISIONED ✅ |
| www.ai-transformation.io | bound (SSL may take a few min) |
| www.ai-transformation.org | bound (SSL may take a few min) |

## DNS cleanup (2026-06-18)

**Removed legacy records:**
- `.io`: `dev.ai-transformation.io`
- `.org`: `app`, `dify`, `n8n`, OpenAI domain verification TXT, old MX

**Current:** both apex domains → `178.104.245.43`; email MX/SPF/DKIM preserved.

## Email routing

| Address | Forwards to | Status |
|---------|-------------|--------|
| info@ai-transformation.io | multitude.multiplex@gmail.com | ✅ rule active |
| info@ai-transformation.org | multitude.multiplex@gmail.com | ✅ rule active |

Verify Gmail destination in Cloudflare dashboard if mail doesn't forward.

## Email (ZSend)

Both domains verified for Zeabur Email (2026-06-22). Agent authorize + future newsletter send via `ZSEND_API_KEY` on Zeabur.

| Address | Purpose |
|---------|---------|
| pulse@ai-transformation.io | .io send / agent authorize |
| learn@ai-transformation.org | .org digest (Wave 17) |
| info@* | Cloudflare forward (human contact) |

See [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md).

## Live URLs

- https://ai-transformation.io ✅ (Next.js Wave 0)
- https://ai-transformation.org ✅ (Next.js Wave 0)
- https://ai-transformation.io/api/health ✅
