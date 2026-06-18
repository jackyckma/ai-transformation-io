# Scaffold plan

**Updated:** 2026-06-18 — dual-domain monorepo (see [ARCHITECTURE.md](./ARCHITECTURE.md))

## Stack

| Item | Choice |
|------|--------|
| Monorepo | pnpm workspaces + Turborepo |
| Frontends | Next.js App Router × 2 (`web-io`, `web-org`) |
| Backend | Hono (standalone `apps/backend`) |
| Combined entry | `apps/combined` (host proxy — Zeabur root) |
| Shared | `packages/shared` |
| Styling | Tailwind CSS per frontend |

## Domains

| Domain | App |
|--------|-----|
| ai-transformation.io | `apps/web-io` |
| ai-transformation.org | `apps/web-org` |
| `/api/*` | `apps/backend` (via combined proxy) |

## Deprecated: single-app structure

The earlier single-Next.js plan below is superseded by the monorepo layout in `ARCHITECTURE.md`.

<details>
<summary>Previous single-app plan (reference only)</summary>

## Why Next.js fits

| Need | Next.js capability |
|------|-------------------|
| Content site now | Static/SSG pages from `knowledge-base/` |
| Newsletter signup later | API Route (`app/api/newsletter/route.ts`) |
| Readiness quiz / assessments | Server Actions or API routes + client components |
| Search / filtering | Client components without a separate backend |
| Zeabur deploy | `next build` + `next start` — already supported |

Astro would be faster for pure content, but adding real interactivity later means a migration. Next.js keeps one stack.

## Proposed structure

```
app/
├── layout.tsx              # Root layout, nav, footer
├── page.tsx                # Homepage (Three Gaps hero)
├── what-is-ai-transformation/page.tsx
├── roadmap/page.tsx
├── governance/page.tsx
├── measure-value/page.tsx
├── use-cases/page.tsx
├── glossary/page.tsx
├── faq/page.tsx
├── blog/
│   ├── page.tsx
│   └── [slug]/page.tsx
└── api/                    # Future: newsletter, contact, quiz
    └── (routes added as needed)

components/                 # UI primitives, layout, MDX components
content/                    # MDX/markdown sourced from knowledge-base (or symlink)
lib/                        # Utils, content loader
public/                     # Static assets
```

## Content strategy

**Option A (recommended):** Copy or sync `knowledge-base/*.md` → `content/` as MDX with frontmatter (title, description, pillar).

**Option B:** Build-time script reads `knowledge-base/` directly — keeps single source of truth at repo root.

Cornerstone pages map 1:1 from `knowledge-base/README.md` index.

## Styling direction

From `usr/02-positioning-and-differentiation.md`:

- Clean, editorial (BCG/Deloitte insight style)
- Typography-forward, dark mode optional
- Framework visuals (roadmaps, comparison tables)
- Avoid generic “AI slop” aesthetics

Tailwind + a small set of custom components. Consider [Geist](https://vercel.com/font) or similar for typography.

## Zeabur deploy config

Next.js on Zeabur (Git deploy, existing service):

```json
// package.json scripts
"build": "next build",
"start": "next start -p ${PORT:-3000}"
```

Zeabur auto-detects Next.js. Remove root `index.html` placeholder once app is live.

**Port:** Zeabur sets `PORT` env var — Next.js must bind to it (`next start -p $PORT`).

## Scaffold phases

### Phase 1 — MVP shell (first PR)
- [ ] `create-next-app` with TypeScript, Tailwind, App Router, pnpm
- [ ] Root layout: nav, footer, basic typography
- [ ] Homepage with Three Gaps overview + newsletter CTA placeholder
- [ ] One cornerstone page (e.g. `/what-is-ai-transformation`) from MDX
- [ ] Remove static `index.html` placeholder
- [ ] Verify Zeabur build + deploy on push to `main`

### Phase 2 — Content pages
- [ ] MDX pipeline for all `knowledge-base/` cornerstone pages
- [ ] Blog listing + first 3 posts
- [ ] Glossary + FAQ pages
- [ ] SEO: metadata, sitemap, Open Graph

### Phase 3 — Interactivity (when ready)
- [ ] Newsletter API route + provider (Buttondown / Resend)
- [ ] Contact form or `info@` mailto
- [ ] Readiness quiz (client + optional API)
- [ ] Search (Pagefind or client-side index)

## Open decisions (confirm at scaffold)

1. **MDX library:** `next-mdx-remote` vs `@next/mdx` — `@next/mdx` is simpler for static content
2. **Dark mode:** default light, toggle, or system?
3. **Newsletter provider:** defer to Phase 3?
4. **i18n:** English only at launch (Traditional Chinese for agent comms only)?

## Commands (when scaffold starts)

```bash
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir=false --import-alias "@/*" --use-pnpm
# Then merge with existing repo files (keep knowledge-base/, usr/, docs/, .agents/)
```

Run in repo root; resolve conflicts with existing `public/`, `README.md`, etc.

</details>

---

*Related: [ARCHITECTURE.md](./ARCHITECTURE.md) · [knowledge-base/README.md](../knowledge-base/README.md)*
