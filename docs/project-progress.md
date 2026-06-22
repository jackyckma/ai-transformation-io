# Project progress — waves & decisions

**Last updated:** 2026-06-22  
**Methodology:** [lane-based-development.md](../.agents/instructions/lane-based-development.md)

## Milestone summary

| Milestone | Target | Status |
|-----------|--------|--------|
| M0 — Plan & lane architecture | 2026-06-18 | ✅ |
| M1 — Deploy loop (Wave 0) | 2026-06-18 | ✅ |
| M2 — .io content MVP (Wave 1) | 2026-06-18 | ✅ |
| M3 — First Harvest loop (Wave 2) | 2026-06-18 | ✅ |
| M3b — Content + editorial refresh | 2026-06-18 | ✅ |
| M4 — Assessment live (Wave 3) | 2026-06-19 | ✅ |
| M5 — Auth + save (Wave 4) | 2026-06-19 | ✅ |
| M6 — .org Harvest Hub (Wave 5) | 2026-06-20 | ✅ |
| M7 — Curation + agent discovery (Wave 6) | 2026-06-22 | ✅ |
| M8 — Agent protocol v1 (Wave 7) | 2026-06-22 | ✅ |
| M9 — Newsletter + internal agent jobs (Wave 8) | 2026-06-22 | ✅ |
| M10 — IA expansion (Wave 9) | 2026-06-22 | ✅ |
| M11 — Newsletter pilot (Wave 10) | TBD | ⏳ |

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
- [x] Zeabur deploy via `zbpack.ai-transformation-io.json` + git push (repo root build)
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
- [x] 3+ content pages live on .io (home + 3 framework pages)
- [x] Light/dark mode toggle works
- [x] Mobile-responsive layout
- [x] Sitemap at `/sitemap.xml`

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
- [x] Submit question from both sites → stored with `source=web_inquiry`
- [ ] Simulator fixture + stub test
- [ ] Founder can query DB or admin JSON endpoint

**Merged:** PR #1 (`e905f31`) — SQLite + `POST /api/inquiries` + `/ask` forms on .io and .org.

---

### Interim — Content + editorial refresh (post-Wave 2)

**Goal:** Align shipped UX with **content-first, agent-native** product direction — not a numbered wave, but a closed milestone before Wave 3.

| Lane | Deliverables |
|------|--------------|
| L7 | Full `knowledge-base/` registry (10 articles); `/playbook/*` + `/learn/*` routes |
| L8 | Editorial blog-index home; frameworks + playbook; serif titles |
| L9 | Learn hub home; Harvest Hub branding (not "Learn Together") |
| — | Product spec: [usr/11-agent-first-api-v1.md](../usr/11-agent-first-api-v1.md) |

**Exit criteria:**
- [x] 10 KB articles on .io; 5 learn pages on .org
- [x] Editorial layout (narrow column, Lora + Geist)
- [x] Agent-first v1 parameters locked in usr/11
- [x] Lane map updated: **L11 Agent protocol** split from L10 internal jobs

**Commits:** `f91f3d3` (content routes), `05f202e` (editorial UI), `aae15d9` (agent spec).

---

### Wave 3 — Assessment (36 questions)

**Goal:** Full Three Gaps assessment — functional multi-step UX + scoring API + radar results.

**Locked decisions (2026-06-18):**

| Topic | Decision |
|-------|----------|
| Question copy | **Agents draft** all 36 from `usr/07` structure + `knowledge-base/` Three Gaps content |
| Question format | **Likert 1–5** maturity scale (1 = not in place, 5 = systematic) — best fit for gap averaging + radar |
| Results UI | **Gap radar** chart + weakest-gap callout + per-gap scores |
| Assessment UX | **Re-open UI design** — functional flow (wizard/progress), not article-index layout; **keep** Lora titles + light Geist body + existing palette |
| Results CTAs | Link to live `/frameworks/*`, `/playbook/*`, `/ask`, `.org` reflection — **fine-tune after seeing results** |
| Save progress | Deferred to Wave 4 (anonymous completion only in Wave 3) |

| Lane | Deliverables |
|------|--------------|
| L0 | Question + answer types, gap scoring schemas, radar result shape |
| L4 | `data/simulators/assessment/questions.json` — 36 agent-drafted questions (3 gaps × 12) |
| L4 | `POST /api/assessment/score` — gap scores + weakest gap + sub-dimension breakdown |
| L8 | Assessment UX: intro → stepped questions (grouped by gap) → results with radar |
| L8 | Reusable assessment components (progress, Likert row, radar chart) — functional, not editorial article chrome |
| L8 | Results page with provisional CTAs to frameworks/playbook/ask/.org |

**Exit criteria:**
- [x] Complete 36-question assessment without login
- [x] Results show Three Gaps radar + weakest gap
- [x] Unit tests for scoring logic
- [x] Question bank fixture committed under `data/simulators/assessment/`
- [x] Assessment UI uses site fonts/theme but purpose-built layout (wider than `max-w-2xl` article column if needed for radar)

**Merged:** PR #2 (`78b5817`) — assessment schemas, 36-question bank, scoring API, functional wizard + radar on `.io`.

**Note:** Progress **not** saved until Wave 4. Results CTAs approved as provisional (founder review 2026-06-19).

---

### Wave 4 — Google OAuth & saved progress

**Goal:** Unified identity across both sites; assessment resume.

**Locked decisions (2026-06-19):**

| Topic | Decision |
|-------|----------|
| Auth provider | **Google OAuth only** (humans); no magic link this wave |
| Cross-domain (.io / .org) | **Same `users` row** when Google account matches; **per-host** HttpOnly session cookie on first-party `/api` (combined proxy). Second domain needs one-click Google sign-in — **not** a shared cookie across TLDs |
| Assessment save | Persist **partial answers + step index**; resume wizard; optional last score snapshot |
| DB | **SQLite** remains for Wave 4 prod; add env-driven DB module hook for future Postgres (`DATABASE_URL`) without requiring Zeabur Postgres deploy now |
| Sign-in UI | Header sign-in/out on **both** sites; `/join` optional landing on .org (not nav — see POSITIONING-UX); assessment shows “save progress” when logged in |
| Attribution | Logged-in `POST /api/inquiries` attaches `user_id` when session present |
| Secrets | `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET` in Zeabur env only — document in `docs/AGENT_ENV.md` |

| Lane | Deliverables |
|------|--------------|
| L3 | Google OAuth routes, `users` + `sessions` tables, `GET /api/auth/me`, logout |
| L4 | `GET/POST /api/assessment/session` — save/resume when authenticated |
| L8/L9 | Sign-in/out chrome, assessment wizard resume, `/join` shell on .org |
| L2 | Session middleware; optional `user_id` on harvest writes |

**Exit criteria:**
- [x] `GET /api/auth/me` + session routes; graceful 501 without Google env
- [x] `GET/POST /api/assessment/session` save/resume when authenticated
- [x] Sign-in/out chrome on .io and .org; `/join` on .org
- [x] Inquiry `user_id` attribution when session present
- [x] Secrets documented in `docs/AGENT_ENV.md`
- [ ] Live Google OAuth on production (requires Zeabur env + redirect URIs)

**Merged:** PR #3 (`e41a143`) — 10 backend tests passing.

---

### Wave 5 — .org Harvest Hub

**Goal:** Community contribution loop without forum.

| Lane | Deliverables |
|------|--------------|
| L5 | `POST /api/stories`, prompt replies, moderation status |
| L5 | `GET /api/stories`, `GET /api/prompts/current` |
| L9 | `/stories`, `/stories/submit`, `/prompts/[slug]` |
| L9 | Weekly prompt seed content |
| L8 | `/insights` — featured stories (read from API) |

**Exit criteria:**
- [ ] Submit story → `status=new` in DB
- [ ] Manual approve → visible on .org
- [ ] At least 1 seed prompt live

---

### Wave 6 — Curation & agent discovery

**Goal:** Human-facing **curation** layer + machine-readable discovery — no full agent write API yet.

| Lane | Deliverables |
|------|--------------|
| L7 | Curated topics feed (`GET /api/v1/curated` or static JSON v0) |
| L8/L9 | Home shows founder-curated topics (not full article index as primary) |
| L8/L9 | `/for-agents` page — protocol summary, links to usr/11 |
| L2 | `GET /api/v1/capabilities` stub (version, endpoints, quotas) |
| L2 | Read rate-limit middleware skeleton (anonymous vs registered tiers) |

**Exit criteria:**
- [x] Both homes lead with ≤5 curated topics (via `data/curated/` + reader entry paths)
- [x] `/for-agents` live on .io and .org
- [x] Capabilities JSON returns stable v1 stub shape
- [x] Read rate-limit middleware skeleton (implemented in Wave 7 content reads)
- [ ] Sidebar chatbot hook (support interaction, on-site history) — post–Wave 7 UX bet

**Locked decisions (2026-06-20, amended 2026-06-22):**
- Home primary entry: **reader reflection paths (Option A)**, not Assessment CTA
- Assessment remains secondary link for org-level diagnostic
- Agent-friendly block visible on both homes + `llms.txt`
- Curation: agent proposes JSON → **founder approves PR** ([EDITORIAL_POLICY.md](../data/curated/EDITORIAL_POLICY.md))
- .io north star: **companion/support**, not quiz-first — see [POSITIONING-UX.md](./POSITIONING-UX.md)
- .org nav: Share/Stories first; **Join removed** from nav; Sign in in header

**Depends on:** Wave 2 DB; benefits from Wave 5 contributions for future curation sources.

---

### Wave 7 — Agent protocol v1 (L11)

**Goal:** First-class agent API — read, authorize, write — per [usr/11-agent-first-api-v1.md](../usr/11-agent-first-api-v1.md).

| Lane | Deliverables |
|------|--------------|
| L0 | Agent protocol Zod schemas (token, contribution write, capabilities) |
| L3 | Email magic link for `POST /api/v1/agent/authorize` (one email per human→agent) |
| L11 | `GET /api/v1/content/*` — read from L7 registry |
| L11 | Write token issuance (180-day TTL, shared .io+.org, single token all scopes) |
| L11 | `POST /api/v1/contributions` — agent write path |
| L2 | Anonymous 3/day + registered 10/day read quotas |
| L11 | Changelog + versioned paths documented |

**Exit criteria:**
- [x] Agent can list + fetch content within quota
- [x] Human completes one email authorize → agent receives write token
- [x] Agent submission lands in `contributions` with `source=agent`
- [x] Credits ledger stub (`credit_accounts` table)
- [ ] Token refresh / revoke endpoints (optional v1.1)
- [x] Production ZSend authorize email (`ZSEND_API_KEY` + `AGENT_AUTHORIZE_FROM`)

**Not in v1:** Per-post email confirm, author-set pricing, read-once consensus (Phase B).

---

### Wave 8 — Newsletter & internal agent jobs

**Goal:** Future-ready pipeline — internal digest/compile jobs; no public newsletter yet.

| Lane | Deliverables |
|------|--------------|
| L6 | `issues`, `subscribers` tables; `NoopNewsletterProvider` + `ZeaburZSendProvider` stub |
| L6 | `POST /api/webhooks/zsend`; inbound stub per [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md) |
| L10 | Job types: `compile_issue_draft`, `cluster_replies` |
| L10 | CLI or admin route to trigger draft from contributions |
| L5 | `source=newsletter_reply` enum ready |

**Exit criteria:**
- [x] Internal job can generate draft MD from contributions (`POST /api/agent/compile-draft`)
- [x] `cluster_replies` stub for newsletter_reply contributions
- [x] `issues`, `subscribers`, `issue_contributions` tables + providers
- [x] No subscribe UI exposed (`POST /api/newsletter/subscribe` → 501)
- [x] Inbound webhook stub returns 501 until Wave 10
- [x] `POST /api/webhooks/zsend` accepts events (log-only stub)

**Not in Wave 8:** Public send, subscribe UI, inbound Email Worker (Wave 10).

See [EMAIL_NEWSLETTER.md](./EMAIL_NEWSLETTER.md) for ZSend send + Cloudflare Worker inbound replies.

---

### Wave 9 — IA expansion (function pages)

**Goal:** Remaining .io IA — function templates, glossary, use cases — **secondary** to curation + agent API.

| Lane | Deliverables |
|------|--------------|
| L7 | Any remaining cornerstone pages from `knowledge-base/` |
| L8 | Function page template (`/functions/*`) — at least Executive + CIO |
| L8 | Glossary, FAQ, use cases stubs |
| L8 | Assessment → function playbook deep links |

**Exit criteria:**
- [x] ≥2 function pages using shared template (`/functions/executive`, `/functions/cio`)
- [x] Sitemap complete (`/functions`, role slugs)

**Not in Wave 9:** Function-primary nav; additional roles beyond Executive + CIO.

**Shipped:** Shared `FunctionPageLayout` + `function-pages.ts` data; `/functions` index with glossary/FAQ/use-cases links; assessment weakest-gap CTAs → role guides; footer secondary link only.

---

### Wave 10 — Newsletter pilot (optional trigger)

**Goal:** Curated switchboard newsletter — small pilot list only.

**Triggers (any):**
- 10+ contributions in DB
- Agent draft quality acceptable with <30% edit
- ~10 person pilot list ready

| Lane | Deliverables |
|------|--------------|
| L6 | Verify `ai-transformation.io` on ZSend; `ZeaburZSendProvider` live send |
| L6 | Subscribe API + footer CTA (per-site lists) |
| L6 | Cloudflare Email Worker → `/api/webhooks/inbound-email` (or manual pilot) |
| L10 | `compile_issue_draft` production job |

**Exit criteria:**
- [ ] One issue sent to pilot list
- [ ] ≥1 reply captured as contribution

---

### Wave 11+ — Future (not scheduled)

- Full forum (Foru.ms / Discourse) when trigger metrics met
- Consultation brief internal dashboard
- LinkedIn harvest automation
- Newsletter public archive pages
- Low-key AI guide on human pages (post–agent API v1)
- Agent credits top-up ($5 minimum, Phase B)

---

## Wave dependency graph

```
Wave 0 (scaffold)
    ↓
Wave 1 (.io content)
    ↓
Wave 2 (question box)
    ↓
Interim (content + editorial + agent spec) ✅
    ↓
Wave 3 (assessment) ✅
    ↓
Wave 4 (auth + save) ✅
    ↓
Wave 5 (.org harvest) ✅
    ↓
Wave 6 (curation + /for-agents) ✅
    ↓
Wave 7 (agent protocol v1 — L11) ✅
    ↓
Wave 8 (newsletter + L10 jobs) ✅
    ↓
Wave 9 (function pages / IA expansion) ✅
    ↓
Wave 10 (newsletter pilot) — optional trigger                    ← NEXT
```

Waves 3 requires Wave 2 DB. Wave 7 built on Wave 6 + L7 registry. Wave 8 uses Wave 5 contributions + ZSend verified domains. Wave 10 pilot needs Wave 8 infra.

---

## Decisions log

| Date | Topic | Options | Decision |
|------|-------|---------|----------|
| 2026-06-18 | Monorepo layout | Single Next vs dual + Hono | Dual Next + Hono + combined proxy |
| 2026-06-18 | .org community | Forum vs Harvest Hub | **Harvest Hub** Phase 1 |
| 2026-06-18 | Auth v1 | Magic link vs Google | **Google OAuth only** (humans); **email magic link** for agent authorize (L11) |
| 2026-06-18 | Assessment depth | 15 vs 36 questions | **~36 questions** (Three Gaps × 12) |
| 2026-06-18 | .org access | Public vs members-only | **Public read**; login for attributed submit |
| 2026-06-18 | Newsletter | Launch now vs defer | **Defer send**; infra in Wave 8 |
| 2026-06-18 | Newsletter model | Broadcast vs switchboard | **Curated switchboard** — replies feed next issue |
| 2026-06-18 | Consultancy CTA | Book call vs question box | **Question box only** v1 |
| 2026-06-18 | .io IA | Function vs framework first | **Curation + articles first**; function pages Wave 9 |
| 2026-06-18 | Dev workflow | Ask before commit | **Default commit+push to main** until production |
| 2026-06-18 | Newsletter send | Buttondown/Resend vs ZSend | **Zeabur ZSend** |
| 2026-06-18 | Dev methodology | Ad hoc vs lane-based | **Lane-based + waves** |
| 2026-06-18 | Newsletter replies | Third-party inbound | **Cloudflare Email Worker → backend webhook** |
| 2026-06-18 | Methodology sync | Stay on 1.0.0 vs sync 1.1.0 | **Synced ai-dev-methodologies 1.0.0 → 1.1.0** |
| 2026-06-18 | Human UI | Marketing hero vs editorial | **Blog/article index**, serif titles, narrow column |
| 2026-06-18 | Product direction | Article portal vs AI-native | **Agent-first protocol** — humans curate, agents read/write via API |
| 2026-06-18 | Agent lane split | Single L10 vs split | **L10** internal jobs; **L11** external agent protocol |
| 2026-06-18 | Agent read quotas | Unlimited vs capped | **3/day anonymous, 10/day registered** (v1) |
| 2026-06-18 | Agent write auth | Per-post vs one-time | **One email authorize → 180-day write token** (v1) |
| 2026-06-18 | Wave 3 question copy | Founder vs agent draft | **Agents draft** from usr/07 + knowledge-base |
| 2026-06-18 | Wave 3 question format | Likert vs checkbox vs agree/disagree | **Likert 1–5** maturity scale |
| 2026-06-18 | Wave 3 results UI | Text vs radar | **Gap radar** + weakest-gap callout |
| 2026-06-18 | Wave 3 assessment UX | Editorial article layout vs functional | **Functional wizard flow**; keep fonts/theme, not article-index chrome |
| 2026-06-18 | Wave 3 results CTAs | Function playbooks vs live articles | **Frameworks + playbook + ask + .org** — refine after visual review |

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
