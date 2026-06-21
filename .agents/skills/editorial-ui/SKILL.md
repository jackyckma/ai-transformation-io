---
name: editorial-ui
description: Project-specific visual UI guidance for ai-transformation.io and .org — editorial layout, curation, typography, spacing. Load before reshaping pages, home, nav, or shared components in web-io/web-org. Overrides generic frontend-design skills for this repo.
---

# Editorial UI (ai-transformation sites)

Visual and layout work for **content-first editorial portals**, not product-marketing landing pages.

**When to load:** Home/curation changes, new page shells, nav/chrome, component layout, typography/spacing tokens, imagery placement — in `apps/web-io` or `apps/web-org`.

**Also load:** `lane-web-io` or `lane-web-org`, plus `ux-copy` when changing visible text.

**Authority:** `AGENTS.md` (Site design, .io IA, .org home) wins over any global Cursor `frontend-design` plugin skill.

## Product shape (do not fight this)

| Site | Role | Home entry |
|------|------|------------|
| `.io` | Enterprise info portal | Reader reflection paths (Option A) → curated topics → agent panel; Assessment **secondary** |
| `.org` | Harvest Hub + Apprenticeship | Read / share / apprenticeship paths → curation; not a flat article index |

Agent-first is **visible but quiet**: Agent-friendly block, `/for-agents`, `llms.txt` — not shouty “AI product” chrome.

## Locked visual system (extend, don’t replace)

**Typography:** Lora serif for titles (`font-serif`), Geist sans body (`font-weight: 300` default). Titles: normal weight, tight tracking — not heavy bold marketing headlines.

**Layout tokens** (`apps/web-*/app/globals.css`):

| Class / var | Use |
|-------------|-----|
| `--layout-shell` / `.layout-shell` | Header, wide chrome (~72rem) |
| `--layout-read` / `.layout-read` | Home curation grids (~48rem) |
| `--layout-prose` / `.layout-prose` | Article / long-form (~42rem) |

**Components to reuse before inventing new ones:**

- `page-intro`, `markdown-body`, `site-chrome`, `article-list`
- `curated-cards` (`FeatureSpotlightCard`, `TopicRowCard`, `CompactPathCard`, `CuratedVisual`)
- `reader-entry-section`, `curated-sections`, `agent-friendly-panel`

**Curation data:** `data/curated/*.json` — topic-level `image` paths under `/curation/` (reusable covers, not per-article news photos). Regenerate via `scripts/generate-curation-covers.mjs`.

**Site accents:** `.io` warm stone (`--accent: #8b7355`); `.org` muted green (`--accent: #3d7a5c`). Keep low saturation.

## Hard constraints (never)

- Product-marketing hero (big gradient CTA, oversized bold sans hero, stats + pill buttons)
- Subscribe funnels, “Book a call”, loud consultancy CTAs (deferred by product decision)
- Numbered decorative markers (01/02/03) unless content is a **real** ordered process
- New palette/type stack per page — no “fresh studio identity” each session
- Duplicating `.io` frameworks on `.org` (link across domains instead)

## Process (adapted from frontend-design practice)

1. **Read context:** Which site, which lane skill, existing page/components, `data/curated` if home-related.
2. **Plan briefly:** One sentence layout intent + which existing components/tokens you’ll extend. ASCII wireframe only if layout is non-obvious.
3. **Self-check for AI slop** — reject unless the brief explicitly asks for it:
   - Warm cream `#F4F1EA` + terracotta + display serif template
   - Near-black + single acid-green/vermilion accent template
   - Broadsheet hairline rules + zero radius + dense columns template
4. **Build:** Minimal diff; match surrounding Tailwind patterns (`border-[var(--border)]`, `text-[var(--muted)]`).
5. **Critique:** Responsive at mobile; keyboard focus visible; respect `prefers-reduced-motion`; nav must not wrap awkwardly (use `.layout-shell` grid in `site-chrome`).
6. **Verify:** `pnpm --filter @ai-transformation/web-io build` and/or `web-org` as appropriate.

## Motion and imagery

- **Motion:** Sparse. Prefer CSS transitions on hover/focus. No decorative page-load sequences unless explicitly requested.
- **Imagery:** Topic/path covers from `/curation/` library. Placeholder gradients + initials when `image` absent. No stock “business handshake” photos.

## Interactive flows (exceptions)

Assessment wizard, multi-step forms, moderation panels may use **wider** layouts (`max-w-4xl` etc.) — purpose-built, still editorial (not SaaS dashboard chrome).

## Attribution

Planning workflow partially derived from [Anthropic frontend-design skill](https://github.com/anthropics/skills/tree/main/skills/frontend-design) (Apache 2.0). See `NOTICE.md` in this folder.
