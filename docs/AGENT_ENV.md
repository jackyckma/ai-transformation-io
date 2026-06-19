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

## Wave 4 authentication env

Set these in Zeabur environment variables only. Never commit real values.

| Variable | Purpose | Required for local/dev without Google? |
|----------|---------|------------------------------------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client id for sign-in redirect and token exchange | No |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret for token exchange | No |
| `SESSION_SECRET` | HMAC secret for OAuth `state` signing | No |

When any auth variable above is missing, Google sign-in is treated as not configured and auth OAuth routes return `501`.

### Google OAuth redirect URIs

Register all of the following callback URLs in the Google OAuth client:

- `https://ai-transformation.io/api/auth/callback/google`
- `https://ai-transformation.org/api/auth/callback/google`
- `http://localhost:8080/api/auth/callback/google` (local combined dev)

## Database env (Wave 4)

| Variable | Purpose | Notes |
|----------|---------|-------|
| `SQLITE_PATH` | SQLite file path used by backend | Defaults to `data/app.db` |
| `DATABASE_URL` | Future DB driver hook | Wave 4 supports SQLite only; non-`sqlite:`/`file:` URL throws at startup |

## Founder defaults loaded

See `.agents/defaults/` for Zeabur, Cloudflare, and AI provider conventions.
