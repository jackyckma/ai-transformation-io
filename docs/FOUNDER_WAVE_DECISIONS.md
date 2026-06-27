# Founder wave decisions — pre-lock before batch orchestrate

**Purpose:** Decisions that would otherwise pause mid-wave. Lock answers here so multiple waves can run without founder checkpoints.

**Last updated:** 2026-06-26 (founder + agent locked all non-critical defaults)  
**How to use:** Items marked **Locked ✅** are treated as spec for orchestrate goals.

---

## Glossary (founder clarifications)

| Term | Meaning in this repo | **Not** the same as |
|------|----------------------|---------------------|
| **Newsletter public archive** | Public web pages listing **past email issues** sent via Wave 17 (`/newsletter/archive`, issue markdown) | Knowledge `/knowledge` articles, Orbita draft corpus, Library index |
| **Corpus reset (AT1b)** | Unpublish or remove **Orbita training-batch** objects after editorial standards are learned | Newsletter archive |

---

## Wave queue (post Wave 19 editorial-review)

| Wave | Slug | Blocker type | Ready when |
|------|------|--------------|------------|
| **Ops** | newsletter-pilot-send | Human ops | ~10 subscribers (B1) |
| **21** | ui-p1-org-polish | — | **Kickoff now** (D4 locked) |
| **20b** | agent-credits | Scale | ≥50 registered users (C1) |
| **20a** | newsletter-archive | Founder product | B3 reopen (deferred) |
| **22** | editorial-auto-approve | Founder policy | A1 reopens after agent acceptance |
| **23** | at1b-corpus-reset | Founder editorial | A3 — after training complete |
| **24** | function-ia | Deferred | Still deprioritized |

---

## Decision matrix

### A. Editorial & Orbita (AT1b)

| # | Question | Your decision | Status |
|---|----------|---------------|--------|
| A1 | **Auto-approve editorial drafts?** | **No** — not until approval agent passes founder acceptance | Locked ✅ 2026-06-26 |
| A2 | If auto-approve later: score threshold? | **90** + zero `critical` flags (pre-lock for Wave 22) | Locked ✅ agent 2026-06-26 |
| A3 | **Corpus reset** after review round? | **Yes, after** editorial/training iteration complete | Locked ✅ 2026-06-26 |
| A4 | Orbita daily volume until reset | **5/day** | Locked ✅ agent 2026-06-26 |
| A5 | Founder review during AT1b | **Approve all** drafts | Locked ✅ 2026-06-26 |
| A6 | LLM review before human sees draft? | Advisory badge only | Locked ✅ |

### B. Newsletter (Wave 17 ops → future archive wave)

| # | Question | Your decision | Status |
|---|----------|---------------|--------|
| B1 | **First pilot send timing** | After **~10 subscribers** | Locked ✅ 2026-06-26 |
| B2 | Pilot list size cap | **25** per send (`NEWSLETTER_PILOT_MAX` override OK) | Locked ✅ agent 2026-06-26 |
| B3 | **Public newsletter archive** | **Defer** until issue volume warrants browse UI | Locked ✅ 2026-06-26 |
| B4 | Archive URL (when B3 reopens) | `.io` **`/newsletter/archive`** | Locked ✅ 2026-06-26 |
| B5 | RSS/Atom with archive | **Yes**, same wave as 20a when B3 reopens | Locked ✅ agent 2026-06-26 |
| B6 | Inbound replies | Manual first, Cloudflare Worker later | Locked ✅ |

### C. Agent credits & scale

| # | Question | Your decision | Status |
|---|----------|---------------|--------|
| C1 | **Credits / Stripe gate** | **≥50 registered users** | Locked ✅ 2026-06-26 |
| C2 | Until gate: quota-only reads | **3/10** anonymous/registered | Locked ✅ |
| C3 | Stripe scope at launch | **Top-up only**; subscriptions later | Locked ✅ 2026-06-26 |
| C4 | Price point (top-up MVP) | **$5 USD / 100 read credits** (single SKU; revise before Stripe live if needed) | Locked ✅ agent 2026-06-26 |

### D. Product / IA (lower urgency)

| # | Question | Your decision | Status |
|---|----------|---------------|--------|
| D1 | Function-by-role pages | Defer | Locked ✅ |
| D2 | Assessment UX | `/insights/assessment` | Locked ✅ |
| D3 | Community Follow vs Save | Save first | Locked ✅ |
| D4 | `.org` deferred P1 polish | **Ship Wave 21** | Locked ✅ agent 2026-06-26 |
| D5 | Prominent consultancy CTAs | Defer | Locked ✅ |

### E. Orbita platform (cross-repo)

| # | Question | Your decision | Status |
|---|----------|---------------|--------|
| E1 | `at-editorial` on prod | Deployed ✅ | Done |
| E2 | Catalog in daily dedup | **Yes** — primary after Wave 19 prod deploy | Locked ✅ agent 2026-06-26 |
| E3 | Separate `.io` Orbita client | Defer | Locked ✅ |

---

## Batch orchestrate bundles (updated)

| Bundle | Work | Status |
|--------|------|--------|
| **Bundle 1 — Ops** | Zeabur deploy Wave 19 + newsletter send @ ~10 subs | Human-led; B1/B2 locked |
| **Bundle 2 — Polish** | **Wave 21** ui-p1-org | **Orchestrate kickoff 2026-06-26** |
| **Bundle 3 — Credits** | Wave 20b agent-credits @ ≥50 users | Wait C1 gate |
| **Bundle 4 — Auto-approve** | Wave 22 | Wait A1 |
| **Bundle 5 — Corpus reset** | Wave 23 | Wait A3 |
| **Deferred — Archive** | Wave 20a | B3 defer |

---

## Already locked (do not re-ask)

- Google OAuth only · no legacy redirects · no Discourse · no function-primary nav
- English UI · light default + dark toggle
- Quota-only reads until C1 gate
- Human approve until A1 reopens · no newsletter archive until B3 reopens

---

## Founder decision log

| Date | IDs | Summary |
|------|-----|---------|
| 2026-06-26 | A1, A3, A5 | No auto-approve until agent accepted; reset after training; approve all AT1b |
| 2026-06-26 | B1, B3, B4 | Send @ ~10 subs; defer archive; URL reserved |
| 2026-06-26 | C1, C3 | Credits @ ≥50 registered; top-up only |
| 2026-06-26 | A2, A4, B2, B5, C4, D4, E2 | Agent defaults: A2=90; 5/day; cap 25; RSS with archive; $5/100 reads; Wave 21; catalog dedup |
