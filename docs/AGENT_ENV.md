# Agent environment

**Project:** ai-transformation.io  
**Last updated:** 2026-06-18

## Connectivity

| Service | Status | Account |
|---------|--------|---------|
| GitHub | ✅ Connected | jackyckma (Jacky Ma) |
| Zeabur | ✅ Connected | Jacky Ma / jackymama@gmail.com |
| Cloudflare | ⚠️ Partial | Token valid; zone API blocked from current IP (error 9109) |

## Verification ladder

| Level | What | Command / URL |
|-------|------|---------------|
| L0 | Repo sanity | `git status` |
| L1 | Static placeholder exists | `test -f public/index.html` |
| L4 | Production smoke | `curl -sI https://ai-transformation.io` |

## Staging / production URLs

| Environment | URL |
|-------------|-----|
| Production | https://ai-transformation.io (pending DNS) |
| Zeabur generated | TBD after first deploy |

## Cloud Agent notes

- `.env` is gitignored; contains `CLOUDFLARE_API_TOKEN`, `MINIMAX_API_KEY`
- Zeabur CLI: always use `npx zeabur@latest`, never bare `zeabur`
- Ocean server IP for DNS: `178.104.245.43`

## Founder defaults loaded

See `.agents/defaults/` for Zeabur, Cloudflare, and AI provider conventions.
