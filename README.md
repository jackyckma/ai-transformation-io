# AI Transformation

Dual-domain platform for enterprise AI transformation knowledge and community learning.

| Domain | App | Role |
|--------|-----|------|
| [ai-transformation.io](https://ai-transformation.io) | `apps/web-io` | Corporate — frameworks, assessment, playbooks |
| [ai-transformation.org](https://ai-transformation.org) | `apps/web-org` | Community — Harvest Hub (stories, prompts) |

## Monorepo

```
apps/
  backend/     Hono API (shared, host-agnostic)
  web-io/      Next.js — .io
  web-org/     Next.js — .org
  combined/    Zeabur entry — host proxy
packages/
  shared/      Types, Zod schemas, API client
  content/     MDX/content pipeline (Wave 1+)
```

## Development

```bash
pnpm install
pnpm build          # build all apps
pnpm dev            # dev all apps in parallel (or run individually)
pnpm start          # production: combined proxy on $PORT
```

**Zeabur Root Directory:** `apps/combined`

## Planning

- [docs/product-architecture.md](docs/product-architecture.md) — site IA + lanes
- [docs/project-progress.md](docs/project-progress.md) — wave delivery plan
- [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) — technical architecture

## Agent entry points

- `AGENTS.md` · `CLAUDE.md` · `.cursor/rules/shared-instructions.mdc`
- Lane skills: `.agents/skills/lane-*/SKILL.md`

## Status

[docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md)
