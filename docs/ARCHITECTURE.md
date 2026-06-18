# Architecture: dual-domain monorepo

**Status:** Approved direction (2026-06-18)  
**Domains:** `ai-transformation.io` + `ai-transformation.org` → same Zeabur service now, splittable later

## Summary

Claude's spec is **sound and we should adopt it**, with naming and Next.js-specific implementation details below. The hard rules (standalone apps, shared code only in `packages/shared`, host routing only in `combined`, `API_BASE_URL` env var) are exactly what keep a future Zeabur split cheap.

## Domain mapping

| App | Domain | Positioning |
|-----|--------|-------------|
| `web-io` | ai-transformation.io | **Corporate** — organized AI transformation knowledge; future consultancy hook |
| `web-org` | ai-transformation.org | **Community** — "learn together"; encourage sharing experiences |
| `backend` | `/api` (internal) | Shared API — host-agnostic |
| `combined` | Zeabur entry | Host-based reverse proxy only |

See [POSITIONING.md](./POSITIONING.md) for voice and UX decisions.

## UX (confirmed)

- Default theme: **light**, with **dark mode toggle**
- Language: **English only** at launch

## Repository structure

```
ai-transformation-io/          # repo name can stay; hosts both domains
├── apps/
│   ├── backend/               # Hono — standalone API server
│   ├── web-io/                # Next.js — ai-transformation.io
│   ├── web-org/               # Next.js — ai-transformation.org
│   └── combined/              # Thin proxy server — Zeabur Root Directory
├── packages/
│   └── shared/                # Types, Zod schemas, API client, design tokens
├── knowledge-base/            # Content source for web-io (unchanged)
├── usr/                       # Internal strategy (unchanged)
├── docs/
├── pnpm-workspace.yaml
├── turbo.json
└── package.json
```

## Verdict on Claude's hard rules

| Rule | Verdict | Notes |
|------|---------|-------|
| 1. Standalone `backend` | ✅ Adopt | Use **Hono** — cleaner split than Next API routes |
| 2. Standalone frontends | ✅ Adopt | Two Next.js apps, each `next build` independently |
| 3. Shared code in `packages/shared` only | ✅ Adopt | `@ai-transformation/shared` workspace import |
| 4. Host routing only in `combined` | ✅ Adopt | No `if (host)` in page components |
| 5. `API_BASE_URL` env var | ✅ Adopt | localhost now → Zeabur backend URL after split |
| 6. Backend host-agnostic | ✅ Adopt | Site identity stays in frontends |

## Next.js-specific: how `apps/combined` works

Next.js apps don't compose in one process like Express middleware. Combined runs a **reverse proxy supervisor**:

```
                    Zeabur PORT (e.g. 8080)
                              │
                    apps/combined (Node)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
    Host: .io            Host: .org          Path: /api/*
         │                    │                    │
   web-io :3002          web-org :3003      backend :3001
   (next start)          (next start)       (hono serve)
```

1. `start.ts` spawns three child processes.
2. Proxy on `process.env.PORT` routes by Host header and `/api` prefix.
3. `turbo run build` builds all apps before start.

**Why Hono for backend?** Next API routes belong to a frontend app — awkward to extract. Hono is standalone, same TypeScript stack, trivial Zeabur deploy later.

## Deployment: Option B (now)

| Setting | Value |
|---------|-------|
| Zeabur service | Existing `ai-transformation-io` service |
| Root Directory | `apps/combined` |
| Domains | `ai-transformation.io` ✅, `ai-transformation.org` ✅ (+ www) |
| Watch paths | whole repo |

```env
API_BASE_URL=http://127.0.0.1:3001
SITE_IO_HOST=ai-transformation.io
SITE_ORG_HOST=ai-transformation.org
```

## Deployment: Option A (later split)

Three Zeabur services from same repo — update `API_BASE_URL` on frontends, rebind domains. No app rewrites if rules above were followed.

## Scaffold order

1. pnpm workspace + `packages/shared`
2. `apps/backend` — Hono health route
3. `apps/web-io` + `apps/web-org` — Next.js shells (different layouts)
4. `apps/combined` — proxy supervisor
5. Zeabur root → `apps/combined`, bind `.org`, update DNS
6. Content pipeline for web-io from `knowledge-base/`

## Resolved

- **web-org positioning** — community / learn together ([POSITIONING.md](./POSITIONING.md))
- **Email** — info@ on both .io and .org → multitude.multiplex@gmail.com
- **Theme** — light default + dark toggle; English only

## Content pipeline: Harvest Hub + newsletter (switchboard)

**.org Phase 1:** Stories + Weekly Prompt + question box (no forum).  
**Newsletter:** Deferred for send/subscribe UI; **infra hooks in v1**.

All Harvest inputs and (later) email replies flow through a unified **`contributions`** store in `apps/backend`. Newsletter issues reference contributions; replies create new contributions with `source=newsletter_reply`.

```
contributions ← stories, inquiries, prompt replies, assessment notes, newsletter replies
      ↓
issues (draft → sent)  —  agent compile_issue_draft  —  human approve
      ↓
subscribers (io_pulse | org_learn)  —  NewsletterProvider (noop v1 → Buttondown/Resend)
```

Full schema and ops loop: [usr/10-harvest-hub-newsletter-infrastructure.md](../usr/10-harvest-hub-newsletter-infrastructure.md).

## Open questions

1. **Consultancy product** on .io — design TBD
2. **Newsletter provider** — Buttondown vs Resend (decide at Phase 2 turn-on)

---

*Related: [SCAFFOLD_PLAN.md](./SCAFFOLD_PLAN.md) · [INFRA_SETUP.md](./INFRA_SETUP.md)*
