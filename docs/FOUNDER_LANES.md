# Founder lanes — product radar

**Purpose:** One-page mental model for **you**. Replaces tracking individual wave numbers day-to-day.  
**Last updated:** 2026-06-29  
**Detail for agents:** [CURRENT_STATUS.md](./CURRENT_STATUS.md) · [FOUNDER_WAVE_DECISIONS.md](./FOUNDER_WAVE_DECISIONS.md) · [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md)

---

## How to use this doc

| You want to… | Read |
|--------------|------|
| “What should I care about this week?” | **Active items** below (max 3 per lane) |
| “What’s shipped vs deferred?” | **Last shipped / Next** per lane |
| “What can I ignore until a gate opens?” | **Gated future** lane |
| Implementation / test detail | `CURRENT_STATUS.md` (agents, not daily radar) |
| Orchestrate kickoff strings | `docs/waves/*.md` |

**Rule:** When an **active item** is done, move it to *Last shipped* and **remove it from your radar** — do not leave stale todos here.

---

## Loose ends (clear radar first)

Quick tidy before new lanes work. Owner = who unblocks.

| Item | Owner | Done when |
|------|-------|-----------|
| Agent Review `malformed` on `/editorial` (`max_tokens` fix) | **AT** | Advisory scores appear on pending drafts |
| `.io` logged-out home — pick **A or B** (see discussion) | **Founder** → AT | **Done** — reader paths; path photos removed (gradient icons) |
| Wave 25 brief | **AT** | Kickoff or explicit **defer** note in FOUNDER_WAVE_DECISIONS |
| Orbita w30 + missed 6/29 supply batch | **Orbita** | New drafts land or manual batch recovered |
| `FOUNDER_WAVE_DECISIONS` wave queue row for Wave 21 | **AT** | Mark ✅ shipped (doc drift) |

Cross-project handoff: `~/Orbiter-AT-dogfood/state/STATUS.md` (on-demand only).

---

## Lane 1 — Content & editorial

**What this is:** What gets published on `.org` (and eventually `.io` objects), how Orbita feeds drafts, and your approve/reject judgment.

| | |
|--|--|
| **Last shipped** | AT1b end-to-end: Orbita harness → `/editorial` → **5** published `.org` knowledge articles; substance-first advisory rubric on `main` |
| **Next (one thing)** | Stable daily supply after Orbita w30; you keep **approve all** (A5) |
| **Active (≤3)** | ① Orbita sync outcomes script ② Agent review fix deploy ③ Optional spot-check published articles |

**Not on radar:** Auto-approve (Wave 22 / A1), corpus reset (Wave 23 / A3).

---

## Lane 2 — Agent platform (L11 + admin)

**What this is:** Machine-readable APIs for **contributor agents** (Orbita, external bots) and eventually **operator agents** (you).

| | |
|--|--|
| **Last shipped** | L11 read/write/authorize; objects/catalog; community write parity; `/for-agents` |
| **Next (one thing)** | **Wave 25** admin agent API kickoff **or** defer — [wave-admin-agent-api.md](./waves/wave-admin-agent-api.md) |
| **Active (≤3)** | ① Capabilities manifest honesty (`wave7_v1` stale) ② **Search API gap** (no `GET /search` today) ③ Admin Bearer auth design |

**Not on radar:** Stripe credits (Wave 20b / ≥50 users).

---

## Lane 3 — Human product (Copilot + surfaces)

**What this is:** What humans see and do on `.io` / `.org` — Copilot, home, library, assessment.

| | |
|--|--|
| **Last shipped** | v2 IA; Copilot (MiniMax); `.org` four Ask modes; Wave 21 `.org` polish; palette + chrome refresh |
| **Next (one thing)** | Optional: `node scripts/generate-curation-covers.mjs --site=io` after path cards ship text-only |
| **Active (≤3)** | ① Home logged-in vs logged-out clarity (session cookie) ② Assessment ↔ Copilot linkage (low) ③ Library full-text search UI (blocked on Lane 2 search API) |

**Not on radar:** Function-primary nav (Wave 24), prominent consultancy CTAs.

---

## Lane 4 — Ops & growth

**What this is:** Newsletter pilot and low-key growth — no hero funnels.

| | |
|--|--|
| **Last shipped** | Wave 17 subscribe/unsubscribe, admin send cap, inbound reply ingest, footer forms |
| **Next (one thing)** | **First pilot send** when ~**10** subscribers (B1) |
| **Active (≤3)** | ① Grow list organically ② One send + reply check ③ Defer public archive (B3) |

---

## Lane 5 — Gated future (ignore until gate opens)

| Gate | Work | Locked in |
|------|------|-----------|
| ≥50 registered users | Agent credits / Stripe top-up | Wave 20b · C1 |
| Agent review trusted | Auto-approve editorial | Wave 22 · A1 |
| AT1b training complete | Orbita corpus reset | Wave 23 · A3 |
| Enough newsletter issues | Public archive + RSS | Wave 20a · B3 |
| Re-prioritized | Function-by-role pages | Wave 24 · D1 |

---

## `.io` logged-out home — A vs B (founder decision)

Both options keep **logged-in home** as **Personal dashboard** (text cards, recommendations — your second screenshot). Only **guest / logged-out** `/` changes.

### Today (reference)

```
┌─────────────────────────────────────────────┐
│  [ LARGE IMAGE — roadmap beige 3D ]         │
│  FRAMEWORK · AI Transformation Roadmap    │
│  editor note…                               │
├──────────────┬──────────────┬───────────────┤
│ [img] Library│ [img] Assess │ [img] Roadmap │
│  summary…    │  summary…    │  summary…     │
│  (+ 3 more tiles in JSON)                   │
└─────────────────────────────────────────────┘
```

Images repeat across tiles; tone clashes with near-white + cool chrome.

### Option A — Visual refresh (same layout, better assets)

**What changes:** Still spotlight + tile grid, but **photography/abstract art** matches `.io` palette (cool grey-blue, subtle gold accent, **no sandy beige blocks**). Optionally **shrink** image height on tiles (thin banner strip, not half the card).

**Finished feel:** Same “curated magazine cover” structure as now, but calm and editorial — closer to ai-business.live / jackyma.info restraint. Less “3D render gallery.”

**Effort:** Regenerate `apps/web-io/public/curation/*.jpg` (+ script); maybe small CSS tweak. **No IA change.**

### Option B — IA: reader paths (copy already in JSON, UI not wired)

**What changes:** Replace the **six-image tile grid** with **intent paths** already defined in `data/curated/io-home.json`:

```
┌─────────────────────────────────────────────┐
│  What does AI transformation mean in        │
│  your context?                              │
│  Not a vendor checklist — how work,         │
│  judgment, and value actually change…       │
├──────────────────┬──────────────────┬───────┤
│ I lead or        │ I implement or   │ I'm   │
│ sponsor change   │ enable           │explor-│
│ governance,      │ patterns,        │ing…   │
│ roadmap, value   │ pitfalls…        │corner-│
│ → 3 articles     │ → 3 articles     │stone  │
│                  │                  │+.org  │
├─────────────────────────────────────────────┤
│  Optional: one text-first spotlight OR      │
│  topic rows (title + summary, small accent) │
│  Assessment → secondary link only (policy)  │
└─────────────────────────────────────────────┘
```

**Finished feel:** Closer to **logged-in dashboard** (typography-led, role framing). Visitor answers “where do I sit?” before diving into library. **Fewer or no hero photos** — compact path cards might use a **small accent strip** instead of full bleed images.

**Effort:** Wire `readerEntry` + `readerPaths` in `HomeCurationGrid`; demote or remove `homeTiles`; enforce dedup in `EDITORIAL_POLICY.md`.

### Pick one

| If you prioritize… | Pick |
|--------------------|------|
| Fastest fix for “images feel wrong” | **A** |
| Clearer first-time visitor story | **B** |

Hybrid (B layout + A-quality small thumbs) is possible **later** — not required for v1.

---

## Lane ↔ repo map (light)

| Lane | Primary paths |
|------|----------------|
| Content & editorial | `apps/backend/.../editorial-supply/`, `apps/web-org/app/editorial/`, `.editorial-orbita/`, Orbita dogfood |
| Agent platform | `apps/backend/.../agent-protocol/`, `objects/`, future `admin-agent/`, `/for-agents` |
| Human product | `apps/web-io/`, `apps/web-org/`, `packages/chat-ui/`, `data/curated/` |
| Ops & growth | `apps/backend/.../newsletter/`, `/newsletter` admin pages |
| Gated future | Wave docs only until gate opens |

---

## Changelog

| Date | Change |
|------|--------|
| 2026-06-29 | Initial founder lanes + loose ends + A/B home decision frame |
