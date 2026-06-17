# AI Transformation

Website about enterprise AI transformation — closing the gap between AI deployment and operating model change.

**Domain:** [ai-transformation.io](https://ai-transformation.io)

## Repository layout

| Path | Purpose |
|------|---------|
| `knowledge-base/` | Website content drafts (cornerstone pages, FAQ, glossary) |
| `usr/` | Internal strategy docs (positioning, competitive analysis, business model) |
| `docs/` | Live project status and agent handoff |
| `.agents/` | AI development methodology (from [ai-dev-methodologies](https://github.com/jackyckma/ai-dev-methodologies)) |
| `public/` | Static assets (placeholder until site scaffold) |

## Development

This project uses the [ai-dev-methodologies](https://github.com/jackyckma/ai-dev-methodologies) framework. Agent entry points:

- `AGENTS.md` — Codex / OpenAI agents
- `CLAUDE.md` — Claude Code
- `.cursor/rules/shared-instructions.mdc` — Cursor

## Deploy

- **Platform:** Zeabur (GitHub-linked) on dedicated server Ocean
- **Branch:** `main`
- **DNS:** Cloudflare → A record to Zeabur server IP

## Status

Pre-scaffold. See [docs/CURRENT_STATUS.md](docs/CURRENT_STATUS.md).
