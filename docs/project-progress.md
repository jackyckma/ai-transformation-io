# Project progress — waves & decisions

**Last updated:** 2026-06-18  
**Methodology:** [lane-based-development.md](../.agents/instructions/lane-based-development.md)

## Milestone summary

| Milestone | Target | Status |
|-----------|--------|--------|
| M0 — Plan & lane architecture | 2026-06-18 | ✅ |
| M1 — Deploy loop (Wave 0) | 2026-06-18 | ✅ Local build; Zeabur root update pending |
| M2 — .io content MVP (Wave 1) | TBD | ⏳ |
| M3 — First Harvest loop (Wave 2) | TBD | ⏳ |
| M4 — Assessment live (Wave 3) | TBD | ⏳ |
| M5 — Auth + save (Wave 4) | TBD | ⏳ |
| M6 — .org Harvest Hub (Wave 5) | TBD | ⏳ |
| M7 — Agent + newsletter infra (Wave 6) | TBD | ⏳ |
| M8 — Content expansion (Wave 7+) | TBD | ⏳ |

Legend: ✅ Done · 🔄 In progress · ⏳ Planned · ❌ Blocked

---

## Wave plan

Each **wave** ships a **closed loop** — something demoable on production, verifiable locally, with lane status updated at wave end.

### Wave 0 — Monorepo scaffold & deploy loop

**Goal:** Push to `main` → Zeabur builds → both domains serve distinct Next.js shells + `/api/health`.

| Lane | Deliverables |
|------|--------------|
| L0 | `packages/shared` — package scaffold, health types |
| L1 | `apps/combined` — host proxy, turbo pipeline |
| L2 | `apps/backend` — Hono `/api/health` |
| L8 | `apps/web-io` — layout, home, theme toggle placeholder |
| L9 | `apps/web-org` — layout, home, distinct visual identity |

**Exit criteria:**
- [x] `pnpm build` succeeds at repo root
- [x] `pnpm start` (combined) routes `.io` / `.org` / `/api`
- [ ] Zeabur Root Directory = `apps/combined`
- [x] Remove root `index.html` placeholder after deploy verified
- [x] `./scripts/agent-verify.sh` runs typecheck

**Not in Wave 0:** DB, auth, assessment, forms.

---

### Wave 1 — .io content MVP

**Goal:** Corporate site feels real — MDX content, function IA proof.

| Lane | Deliverables |
|------|--------------|
| L7 | MDX pipeline; sync from `knowledge-base/` |
| L8 | Home (Three Gaps), `/functions/executive`, `/frameworks/roadmap` |
| L8 | Nav: Functions, Frameworks, Assessment (link), Ask (link) |
| L8 | SEO metadata, sitemap stub |

**Exit criteria:**
- [ ] 3 content pages live on .io
- [ ] Light/dark mode toggle works
- [ ] Mobile-responsive layout

---

### Wave 2 — Question box (first Harvest input)

**Goal:** First backend persistence loop — inquiries land in DB.

| Lane | Deliverables |
|------|--------------|
| L2 | DB setup (SQLite dev) |
| L5 | `POST /api/inquiries` → `contributions` table |
| L5 | Rate limit + basic validation (Zod via L0) |
| L8 | `/ask` page with form |
| L9 | `/ask` page (shared component pattern via L0) |

**Exit criteria:**
- [ ] Submit question from both sites → stored with `source=web_inquiry`
- [ ] Simulator fixture + stub test
- [ ] Founder can query DB or admin JSON endpoint

---

### Wave 3 — Assessment (36 questions)

**Goal:** Full Three Gaps assessment — client UX + scoring API.

| Lane | Deliverables |
|------|--------------|
| L0 | Question types, gap scoring schemas |
| L4 | Question bank JSON (~36 questions) |
| L4 | `POST /api/assessment/score` — returns gap radar + weakest gap |
| L8 | `/assessment` multi-step UI, results page |
| L8 | Results link to function playbooks + .org reflection CTA |

**Exit criteria:**
- [ ] Complete assessment without login
- [ ] Results show Three Gaps breakdown
- [ ] Unit tests for scoring logic

**Note:** Progress **not** saved until Wave 4.

---

### Wave 4 — Google OAuth & saved progress

**Goal:** Unified identity across both sites; assessment resume.

| Lane | Deliverables |
|------|--------------|
| L3 | Google OAuth, session cookies, users table |
| L4 | Save/resume assessment sessions when logged in |
| L8/L9 | Sign in/out UI, protected submit attribution |
| L2 | Postgres migration path for prod |

**Exit criteria:**
- [ ] Login on .io → same session on .org (shared backend cookie domain strategy)
- [ ] Assessment progress persists across visits
- [ ] OAuth credentials in Zeabur env (not committed)

---

### Wave 5 — .org Harvest Hub

**Goal:** Community contribution loop without forum.

| Lane | Deliverables |
|------|--------------|
| L5 | `POST /api/stories`, prompt replies, moderation status |
| L5 | `GET /api/stories`, `GET /api/prompts/current` |
| L9 | Home, `/stories`, `/stories/submit`, `/prompts/[slug]` |
| L9 | Weekly prompt seed content |
| L8 | `/insights` — featured stories (read from API) |

**Exit criteria:**
- [ ] Submit story → `status=new` in DB
- [ ] Manual approve → visible on .org
- [ ] At least 1 seed prompt live

---

### Wave 6 — Agent & newsletter infrastructure

**Goal:** Future-ready pipeline — no public newsletter yet.

| Lane | Deliverables |
|------|--------------|
| L6 | `issues`, `subscribers` tables; `NoopNewsletterProvider` |
| L10 | Job type definitions: `compile_issue_draft`, `cluster_replies` |
| L10 | CLI or admin route to trigger draft from contributions |
| L5 | `source=newsletter_reply` enum ready |

**Exit criteria:**
- [ ] Agent can generate draft MD from fixture contributions
- [ ] No subscribe UI exposed (or footer "coming soon" only)
- [ ] Webhook route stub returns 501

---

### Wave 7 — Content expansion

**Goal:** Fill .io IA; remaining function + framework pages.

| Lane | Deliverables |
|------|--------------|
| L7 | All cornerstone pages from `knowledge-base/` |
| L8 | Remaining function pages (template-driven) |
| L8 | Glossary, FAQ, use cases, pitfalls |
| L8 | Assessment → function playbook deep links |

**Exit criteria:**
- [ ] ≥8 published .io content pages
- [ ] Sitemap complete

---

### Wave 8 — Newsletter pilot (optional trigger)

**Goal:** Curated switchboard newsletter — small pilot list only.

**Triggers (any):**
- 10+ contributions in DB
- Agent draft quality acceptable with <30% edit
- ~10 person pilot list ready

| Lane | Deliverables |
|------|--------------|
| L6 | Buttondown or Resend provider |
| L6 | Subscribe API + footer CTA (per-site lists) |
| L10 | `compile_issue_draft` production job |
| L6 | Inbound reply webhook or manual forward workflow |

**Exit criteria:**
- [ ] One issue sent to pilot list
- [ ] ≥1 reply captured as contribution

---

### Wave 9+ — Future (not scheduled)

- Full forum (Foru.ms / Discourse) when trigger metrics met
- Magic link auth for corporate email constraints
- Consultation brief internal dashboard
- LinkedIn harvest automation
- Newsletter public archive pages

---

## Wave dependency graph

```
Wave 0 (scaffold)
    ↓
Wave 1 (.io content) ──────────────────────────┐
    ↓                                          │
Wave 2 (question box)                          │
    ↓                                          │
Wave 3 (assessment)                            │
    ↓                                          │
Wave 4 (auth + save)                           │
    ↓                                          │
Wave 5 (.org harvest) ←────────────────────────┘
    ↓
Wave 6 (agent + newsletter stub)
    ↓
Wave 7 (content expansion)
    ↓
Wave 8 (newsletter pilot) — optional trigger
```

Waves 1 and 2 can partially overlap after Wave 0; Wave 3 requires Wave 2 DB.

---

## Decisions log

| Date | Topic | Options | Decision |
|------|-------|---------|----------|
| 2026-06-18 | Monorepo layout | Single Next vs dual + Hono | Dual Next + Hono + combined proxy |
| 2026-06-18 | .org community | Forum vs Harvest Hub | **Harvest Hub** Phase 1 |
| 2026-06-18 | Auth v1 | Magic link vs Google | **Google OAuth only** |
| 2026-06-18 | Assessment depth | 15 vs 36 questions | **~36 questions** (Three Gaps × 12) |
| 2026-06-18 | .org access | Public vs members-only | **Public read**; login for attributed submit |
| 2026-06-18 | Newsletter | Launch now vs defer | **Defer send**; infra in Wave 6 |
| 2026-06-18 | Newsletter model | Broadcast vs switchboard | **Curated switchboard** — replies feed next issue |
| 2026-06-18 | Consultancy CTA | Book call vs question box | **Question box only** v1 |
| 2026-06-18 | .io IA | Function vs framework first | **Function-primary** nav |
| 2026-06-18 | Dev methodology | Ad hoc vs lane-based | **Lane-based + waves** |

---

## Session checklist (agents)

After each wave:

1. Update lane status table in `product-architecture.md`
2. Update milestone status in this file
3. Update `CURRENT_STATUS.md`
4. Run `./scripts/agent-verify.sh`
5. Log new decisions in § Decisions log

---

*Related: [product-architecture.md](./product-architecture.md) · [traceability-index.md](./traceability-index.md)*
