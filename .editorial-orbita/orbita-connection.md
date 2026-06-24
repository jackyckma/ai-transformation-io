# Orbita connection — content supply

API base: https://api.get-orbita.com  
Admin: https://api.get-orbita.com/admin

Target site API: https://ai-transformation.io/api (combined proxy — use `site=org|io` in payloads)

---

## Client IDs

| client_id | Product | Profile | Mode |
|-----------|---------|---------|------|
| `content-ai-transformation-org` | .org knowledge + community seed | `default` (or editorial when profile exists) | draft only until approve |
| `content-ai-transformation-io` | .io library seed | TBD | later |

---

## Credentials vault (names only — set in /admin)

| Vault name | client_id | Purpose |
|------------|-----------|---------|
| `atx_write_org` | `content-ai-transformation-org` | L11 Bearer for .org writes |
| `atx_write_io` | `content-ai-transformation-io` | L11 Bearer for .io writes (later) |

Create write token via normal `POST /api/v1/agent/authorize` flow; store token in vault, not in git.

---

## Local env (optional, gitignored)

Copy pattern from Orbita `marketing-agent/.env.local.example` if running manual session tests from your machine.

---

## Status

**Not configured yet** — configure during Wave 16b after L12 draft API ships.
