# Product architecture — dual-domain platform

**Last updated:** 2026-06-22  
**Status:** Approved — lane-based development with wave delivery (revised for agent-first + editorial product)

**UX locks:** [POSITIONING-UX.md](./POSITIONING-UX.md)

## System overview

One monorepo, two public faces, one backend:

```
                    Zeabur (apps/combined)
                              │
         ┌────────────────────┼────────────────────┐
         │                    │                    │
   ai-transformation.io  ai-transformation.org   /api/*
         │                    │                    │
    apps/web-io          apps/web-org         apps/backend
    (corporate)          (community)            (Hono, host-agnostic)
         │                    │                    │
         └────────────────────┴────────────────────┘
                              │
                    packages/shared (types, schemas, API client)
```

**Positioning:** [POSITIONING.md](./POSITIONING.md)  
**Harvest + newsletter model:** [usr/10-harvest-hub-newsletter-infrastructure.md](../usr/10-harvest-hub-newsletter-infrastructure.md)  
**Agent-first API v1:** [usr/11-agent-first-api-v1.md](../usr/11-agent-first-api-v1.md)

---

## Site design — ai-transformation.io

**Audience:** Enterprise / corporate leaders — **information portal**, not product marketing  
**Voice:** Editorial, anti-hype, content-first (serif titles, light sans body)  
**Organizing principle:** **Curated topics** + playbook/framework articles; **function pages** secondary (footer + deep links, not primary nav)

### Information architecture (current + target)

```
/                               Home — reader entry + curated topics + agent-friendly panel
/frameworks/*                   Cornerstone explainers (5 live)
/playbook/*                     Reference guides (5 live)
/for-agents                     Agent protocol + copy-paste quick start
/assessment                     36-question Three Gaps assessment (Wave 3)
/ask                            Question box
/functions/*                    By role — Executive + CIO (Wave 9; shared template)
/insights                       Curated Harvest outputs (Wave 5+)
```

### Function page template (each `/functions/*`) — Wave 9 ✅

1. **You own** — role responsibilities in AI transformation  
2. **Three Gaps lens** — how gaps show up for this function  
3. **Key decisions** — 3–5 decisions this role must make  
4. **Checklist** — 10–15 self-assessment items (feeds full assessment)  
5. **Playbook links** — links to framework pages by stage  
6. **Case patterns** — 1–2 relevant examples  
7. **Next step** — Assessment / Ask / link to .org prompt  

### Content source

- Articles from `knowledge-base/` via `packages/content`
- **Curated topics** feed (JSON — founder-authored, slow cadence)
- `/insights/*` from moderated Harvest outputs (later)
- Agent-readable content via **L11** read API (planned)

### Shipped (Waves 1–9 + content refresh)

- 10 knowledge-base articles on .io (`/frameworks/*`, `/playbook/*`)
- Editorial blog-index home, serif typography
- Question box + SQLite contributions
- **Wave 9:** `/functions` index + Executive + CIO role guides (shared template); assessment → role deep links

### Deferred

- Function-primary landing as default home
- Newsletter subscribe UI on landing
- Book a call / Calendly
- Additional function roles beyond Executive + CIO

---

## Site design — ai-transformation.org

**Audience:** Practitioners and visitors — **Harvest Hub** community on twin domain  
**Voice:** Open, editorial, experience-driven — content before contribute  
**Organizing principle:** **Learn articles** + low-key contribution paths (not forum)  
**Brand:** AI Transformation · Harvest Hub (not "Learn Together")

### Information architecture (current + target)

```
/                               Home — Share-first paths + curated topics + agent panel
/learn/*                        Intro guides from knowledge-base (5 live)
/stories, /stories/submit       Experience stories (Wave 5) — primary CTA
/prompts                        Weekly prompt (Wave 5)
/ask                            Question box (live)
/for-agents                     Agent protocol + quick start
/join                           OAuth landing (optional deep link; not primary nav)
```

### Harvest Hub loop

```
Stories + Prompt replies + Question box
        → contributions table (backend)
        → agent synthesize (later)
        → curated .io /insights + future newsletter issue
```

### Shipped (post-Wave 2 refresh)

- Learn article index home (`/learn/*` — 5 articles)
- Editorial typography; Harvest Hub branding
- Shared question box (Wave 2)

### v1 scope (Wave 5)

- Story submit + listing (moderated)
- Weekly prompt page (static seed + question box reply)
- Google OAuth for attribution (Wave 4, shared with .io)

### Deferred

- Full forum / Discuss categories
- Events / AMA
- Newsletter send
- Public issue archive

---

## Cross-site flows

```
.io Assessment (36q)
    → weakest gap result
    → CTA: Ask (.io) | Reflect (.org) | Share story (.org)

.org Story / Prompt reply
    → contributions DB
    → founder review
    → optional .io /insights feature

(Future) Newsletter reply
    → contributions (source=newsletter_reply)
    → next issue / .io article
```

---

## Lane map

Lanes are **planning and agent-coordination** boundaries. Runtime code lives in normal packages; lanes define contracts and allowed paths.

| Lane | ID | Primary responsibility | Package / path |
|------|-----|------------------------|----------------|
| **Shared** | L0 | Types, Zod schemas, API client, design tokens | `packages/shared` |
| **Platform** | L1 | Host proxy, process supervisor, Zeabur entry | `apps/combined` |
| **Backend core** | L2 | Hono app shell, DB, middleware, health | `apps/backend` (core) |
| **Auth** | L3 | Google OAuth, sessions, users | `apps/backend/src/lanes/auth` |
| **Assessment** | L4 | 36-question bank, scoring, saved progress | `apps/backend/src/lanes/assessment` |
| **Harvest** | L5 | contributions: stories, inquiries, prompts | `apps/backend/src/lanes/harvest` |
| **Newsletter** | L6 | issues, subscribers, provider stub | `apps/backend/src/lanes/newsletter` |
| **Content** | L7 | knowledge-base, curated topics, content registry | `packages/content` |
| **Web IO** | L8 | Editorial UI — .io | `apps/web-io` |
| **Web ORG** | L9 | Editorial UI — .org | `apps/web-org` |
| **Agent jobs** | L10 | Internal jobs: issue compile, synthesize, cluster | `apps/backend/src/lanes/agent` |
| **Agent protocol** | L11 | External agent API: read, write tokens, credits, capabilities | `apps/backend/src/lanes/agent-protocol` |

### Dependency rules

- L8, L9 **only** call backend via `API_BASE_URL` + `@ai-transformation/shared` client — no business logic in pages.
- L3–L6, L10, L11 **never** import each other's `src/` directly — shared types only via L0.
- L1 routes by Host header only — no host checks in L8/L9 page components.
- L7 content is consumed by L8, L9, and **L11 read API** (same registry).
- L11 write tokens use L3 email verification (magic link) before OAuth is required.

### Data flow (Harvest + assessment)

```
Browser (.io / .org)
    → POST /api/inquiries | /api/stories | /api/assessment/*
    → GET /api/v1/content/* (agents + humans via L11)
    → POST /api/v1/agent/authorize | /api/v1/contributions (agents, L11)
    → L2 middleware (CORS, rate limit, session)
    → L3 auth (OAuth + email magic link for agent tokens)
    → L4 / L5 / L11 handlers
    → SQLite → Postgres (Wave 4)
    → L10 internal agent jobs (digest, compile)
```

---

## Current lane status

| Lane | 上次完成的功能 | 下次要做的功能 |
|------|----------------|----------------|
| L0 Shared | Assessment + agent + **newsletter** schemas | — |
| L1 Platform | Combined proxy + Zeabur deploy | — |
| L2 Backend core | Health, DB, all lane routers | — |
| L3 Auth | Google OAuth, sessions, agent authorize email | — |
| L4 Assessment | Scoring API + session save/resume | — |
| L5 Harvest | Stories, prompts, inquiries, moderation | `newsletter_reply` ingestion (Wave 10) |
| L6 Newsletter | **Wave 8** — issues/subscribers tables, providers, webhooks | Public send + subscribe (Wave 10) |
| L7 Content | KB registry, curated JSON, agent content API | — |
| L8 Web IO | Reader home, assessment secondary, for-agents, **function role guides** | Sidebar chatbot v1 |
| L9 Web ORG | Share-first Harvest Hub, apprenticeship | Sidebar chatbot v1 |
| L10 Agent jobs | **Wave 8** — compile-draft, cluster-replies | LLM synthesis (later) |
| L11 Agent protocol | Wave 7 v1 — read, authorize, write | Token refresh/revoke (v1.1) |

*Updated 2026-06-22 — see [project-progress.md](./project-progress.md)*

---

## Technology constraints

| Item | Choice |
|------|--------|
| Monorepo | pnpm + Turborepo |
| Frontends | Next.js 15 App Router × 2 |
| Backend | Hono |
| Auth v1 | Google OAuth only |
| DB | SQLite dev → Postgres prod (Wave 4) |
| Styling | Tailwind per frontend |
| Deploy | Zeabur Root Directory = `apps/combined` |

---

*Related: [project-progress.md](./project-progress.md) · [traceability-index.md](./traceability-index.md) · [ARCHITECTURE.md](./ARCHITECTURE.md)*
