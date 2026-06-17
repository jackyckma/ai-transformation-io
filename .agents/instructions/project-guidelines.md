# Project Agent Guidelines

Customize this file for **ai-transformation.io**. Shared methodologies live in `.agents/instructions/` (from [ai-dev-methodologies](https://github.com/jackyckma/ai-dev-methodologies)).

## Communication language

- Respond to the user in **Traditional Chinese (繁體中文)** unless they ask for another language.
- Keep code, commands, file paths, and quoted source in original language.

## Project

| Item | Value |
|------|-------|
| Name | AI Transformation (ai-transformation.io) |
| Purpose | Website about enterprise AI transformation — frameworks, roadmaps, governance, value measurement |
| Content sources | `knowledge-base/` (public content), `usr/` (internal strategy) |
| Phase | Pre-scaffold — infra setup complete, site not yet built |

## Stack

| Item | Value |
|------|-------|
| Language / framework | TBD (likely Astro or Next.js static on Cloudflare/Zeabur) |
| Package manager | TBD (likely pnpm) |
| Test runner | TBD |

## Git branching

| Branch | Purpose |
|--------|---------|
| `main` | Production / deploy branch |
| `feat/*` | Feature branches |

Workflow: branch from `main` → PR → `main`.

## Deploy

| Item | Value |
|------|-------|
| Platform | Zeabur (GitHub-linked) on dedicated server **Ocean** |
| Zeabur project ID | `<!-- filled after create -->` |
| Service ID | `<!-- filled after deploy -->` |
| Server | Ocean (`server-69ea44a68736baad13c7c617`, IP `178.104.245.43`) |
| Public URL | https://ai-transformation.io |
| Deploy branch | `main` |
| GitHub repo | https://github.com/jackyckma/ai-transformation-io |

Load Zeabur agent skills when doing deploy/log/env operations.

## DNS / email

| Item | Value |
|------|-------|
| DNS provider | Cloudflare |
| Domain | ai-transformation.io |
| Cloudflare token | `CLOUDFLARE_API_TOKEN` in `.env` — never commit |
| Email routing | info@ai-transformation.io → multitude.multiplex@gmail.com |

## AI providers

| Provider | Env var | Default? |
|----------|---------|----------|
| Minimax | `MINIMAX_API_KEY` | ✅ preferred |
| OpenAI | `OPENAI_API_KEY` | fallback |
| Anthropic | `ANTHROPIC_API_KEY` | fallback |
| OpenRouter | `OPENROUTER_API_KEY` | experiments |

## Documentation to read before non-trivial work

1. `docs/README.md`
2. `docs/CURRENT_STATUS.md`
3. `docs/SESSION_HANDOFF.md` (when resuming)
4. `docs/AGENT_ENV.md`
5. `knowledge-base/README.md` — website content index
6. `usr/README.md` — internal strategy index

Update status docs in the same session when behavior or capabilities change materially.

## Content conventions

- **knowledge-base/** — publishable website content (cornerstone pages, FAQ, glossary)
- **usr/** — internal strategy (positioning, competitive analysis, business model) — not for direct publication
- Site voice: authoritative, pragmatic, anti-hype; frameworks with actionable next steps

## Verification before handoff

- Local / Cloud: `./scripts/agent-verify.sh` when present
- After deploy: smoke https://ai-transformation.io (L4)
