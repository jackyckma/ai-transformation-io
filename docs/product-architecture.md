# Product architecture — dual-domain platform

**Last updated:** 2026-06-18  
**Status:** Approved — lane-based development with wave delivery

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

---

## Site design — ai-transformation.io

**Audience:** Enterprise / corporate leaders  
**Voice:** Authoritative, frameworks, anti-hype, editorial  
**Organizing principle:** By **function** (role), with cross-cutting **frameworks**

### Information architecture

```
/                               Home — Three Gaps narrative, function entry, assessment CTA
/functions                      Function hub
/functions/executive            Executive / Board
/functions/cio                  CIO / CTO
/functions/coo                  COO / Operations
/functions/cfo                  CFO / Finance
/functions/chro                 CHRO / People
/functions/risk                 CRO / Legal / Risk
/functions/caio                 CAIO / AI Lead
/frameworks                     Cross-cutting hub
/frameworks/roadmap             7-stage transformation roadmap
/frameworks/governance          Governance & operating model
/frameworks/measure-value       Measuring AI value / RoA
/frameworks/patterns            Copilots, RAG, agents, automation
/assessment                     36-question Three Gaps assessment
/use-cases                      Industry use cases
/resources                      Glossary, FAQ, pitfalls
/insights                       Curated community insights (from Harvest → .io)
/ask                            Question box (email + question)
/about                          About, contact
```

### Function page template (each `/functions/*`)

1. **You own** — role responsibilities in AI transformation  
2. **Three Gaps lens** — how gaps show up for this function  
3. **Key decisions** — 3–5 decisions this role must make  
4. **Checklist** — 10–15 self-assessment items (feeds full assessment)  
5. **Playbook links** — links to framework pages by stage  
6. **Case patterns** — 1–2 relevant examples  
7. **Next step** — Assessment / Ask / link to .org prompt  

### Content source

- Cornerstone MDX from `knowledge-base/` (build-time sync or import)
- `/insights/*` from moderated Harvest outputs (later)

### v1 scope (Wave 1–2)

- Home, 1 function page (Executive), 1 framework page (Roadmap)
- Assessment shell (Wave 3–4)
- Question box (Wave 2)
- Light/dark theme toggle

### Deferred

- All function pages populated (Wave 8+)
- Newsletter subscribe UI (Wave 7+)
- Book a call / Calendly
- Consultation brief dashboard

---

## Site design — ai-transformation.org

**Audience:** Practitioners learning together  
**Voice:** Open, collaborative, experience-driven, warmer  
**Organizing principle:** By **learning journey / theme** — not by corporate function  
**Community model:** **Harvest Hub** (not full forum in Phase 1)

### Information architecture

```
/                               Learn Together — how to participate
/start                          What is AI transformation (community lens)
/stories                        Published experience stories (UGC)
/stories/submit                 Story submission form
/prompts                        Weekly prompt archive
/prompts/[slug]                 Current weekly prompt + reply via question box
/resources                      Community-curated links & templates
/ask                            Question box (shared API with .io)
/assessment/reflection          Post-assessment reflection CTA (links to .io assessment)
/join                           Sign in (Google OAuth — for save/submit attribution)
```

### Harvest Hub loop

```
Stories + Prompt replies + Question box
        → contributions table (backend)
        → agent synthesize (later)
        → curated .io /insights + future newsletter issue
```

### v1 scope (Wave 5–6)

- Learn Together home
- Story submit + listing (moderated)
- Weekly prompt page (static seed + question box reply)
- Shared question box
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
| **Content** | L7 | MDX pipeline, knowledge-base sync | `packages/content`, `apps/web-io` content layer |
| **Web IO** | L8 | Thin UI — ai-transformation.io | `apps/web-io` |
| **Web ORG** | L9 | Thin UI — ai-transformation.org | `apps/web-org` |
| **Agent** | L10 | Draft jobs: issue compile, synthesize (stub) | `apps/backend/src/lanes/agent` |

### Dependency rules

- L8, L9 **only** call backend via `API_BASE_URL` + `@ai-transformation/shared` client — no business logic in pages.
- L3–L6, L10 **never** import each other's `src/` directly — shared types only via L0.
- L1 routes by Host header only — no host checks in L8/L9 page components.
- L7 content is consumed by L8; L9 has separate MDX or static pages under `apps/web-org/content/`.

### Data flow (Harvest + assessment)

```
Browser (.io / .org)
    → POST /api/inquiries | /api/stories | /api/assessment/*
    → L2 middleware (CORS, session)
    → L3 auth (optional/required per route)
    → L4 / L5 handler
    → SQLite/Postgres (TBD at Wave 4)
    → L10 agent queue (future)
```

---

## Current lane status

| Lane | 上次完成的功能 | 下次要做的功能 |
|------|----------------|----------------|
| L0 Shared | Types, Zod schemas, API client stub | Assessment + contribution schemas (Wave 2–3) |
| L1 Platform | Combined proxy + turbo build | Zeabur deploy verify |
| L2 Backend core | Hono health + route mount | DB + inquiry API (Wave 2) |
| L3 Auth | — | Google OAuth (Wave 4) |
| L4 Assessment | — | Question bank + scoring (Wave 3) |
| L5 Harvest | — | contributions API (Wave 2 inquiries, Wave 5 full) |
| L6 Newsletter | — | Schema stub + NoopProvider (Wave 6) |
| L7 Content | Markdown loader from `knowledge-base/` | More cornerstone pages (Wave 7) |
| L8 Web IO | Home + 3 framework SSG pages + sitemap | Function pages (Wave 7) |
| L9 Web ORG | Harvest Hub home + shell pages | Story/prompt forms (Wave 5) |
| L10 Agent | — | Job types stub (Wave 6) |

*Updated at end of each wave — see [project-progress.md](./project-progress.md)*

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
