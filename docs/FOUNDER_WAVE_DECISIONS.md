# Founder wave decisions — pre-lock before batch orchestrate

**Purpose:** Decisions that would otherwise pause mid-wave. Lock answers here so multiple waves can run without founder checkpoints.

**Last updated:** 2026-06-26  
**How to use:** Reply inline (edit Decision column) or tell the agent to update this file. Items marked **Locked** are treated as spec for orchestrate goals.

---

## Wave queue (post Wave 19 editorial-review)

| Wave | Slug | Blocker type | Ready when |
|------|------|--------------|------------|
| **Ops** | newsletter-pilot-send | Human ops | Anytime (infra shipped Wave 17) |
| **20** | scale-archive | Founder product | ≥1 pilot send + archive/credits decisions below |
| **21** | ui-p1-org-polish | Low — default OK | Anytime (small wave) |
| **22** | editorial-auto-approve | Founder policy | After ~1 editorial review round on AT1b corpus |
| **23** | at1b-corpus-reset | Founder editorial | After standards locked OR one full review pass |
| **24** | function-ia | Deferred | Wave 9 — still deprioritized unless reversed |

---

## Decision matrix

### A. Editorial & Orbita (AT1b)

| # | Question | Options | Default if silent | Your decision |
|---|----------|---------|-------------------|---------------|
| A1 | **Auto-approve editorial drafts?** | (a) Never (b) Score ≥N auto-approve (c) Auto-approve spam-only reject | **(a) Never** until calibration round done | ☐ |
| A2 | If (b): minimum score threshold? | e.g. 85 / 90 / 95 | 90 + zero critical flags | ☐ |
| A3 | **Corpus reset** after review round? | (a) Keep all (b) Unpublish training batch (c) DB wipe editorial seeds only | **(a) Keep** — training material | ☐ |
| A4 | Orbita daily volume after calibration | 5/day · 3/day · pause | **5/day** until reset decision | ☐ |
| A5 | Founder review burden cap | approve all · approve score≥N only · sample 20% | **approve all** during AT1b | ☐ |
| A6 | LLM review required before human sees draft? | yes (hide until reviewed) · no (advisory badge only) | **no** — current shipped UX | ☐ Locked ✅ |

### B. Newsletter (Wave 17 ops → scale-archive)

| # | Question | Options | Default if silent | Your decision |
|---|----------|---------|-------------------|---------------|
| B1 | **First pilot send timing** | now · after N subscribers · after editorial corpus stable | **after ~10 subscribers** | ☐ |
| B2 | Pilot list size cap | 10 · 25 (current code cap) · 50 | **25** (env override OK) | ☐ |
| B3 | **Public archive** when? | after 1 send · after 3 sends · never until year-end | **after 1 send** | ☐ |
| B4 | Archive URL pattern | `/newsletter/archive` · `/issues/[slug]` · .io only vs both sites | **`/newsletter/archive` on .io** | ☐ |
| B5 | RSS/Atom with archive? | yes · no · later | **yes** same wave as archive | ☐ |
| B6 | Inbound replies | Cloudflare Worker · manual forward · defer | **manual first**, Worker later | ☐ Locked ✅ |

### C. Agent credits & scale (scale-archive wave)

| # | Question | Options | Default if silent | Your decision |
|---|----------|---------|-------------------|---------------|
| C1 | **Credits / Stripe gate** | ≥50 registered users · ≥50 MAU · manual founder toggle | **≥50 registered** | ☐ |
| C2 | Until gate: quota-only reads | 3/10 keep · raise to 5/20 | **keep 3/10** | ☐ Locked ✅ |
| C3 | Stripe scope at launch | top-up only · subscriptions · defer Stripe entirely | **top-up only** when gate met | ☐ |
| C4 | Price point (if top-up) | e.g. $5/100 reads · TBD | **TBD at kickoff** | ☐ |

### D. Product / IA (lower urgency)

| # | Question | Options | Default if silent | Your decision |
|---|----------|---------|-------------------|---------------|
| D1 | Function-by-role pages (Wave 9) | still defer · limited `/library?role=` tags only | **defer** | ☐ Locked ✅ |
| D2 | Assessment UX | keep `/insights/assessment` · modal from hub | **keep URL** | ☐ Locked ✅ |
| D3 | Community Follow vs Save priority | Save first · Follow Phase 2 | **Save first** | ☐ Locked ✅ |
| D4 | `.org` deferred P1 polish | ship in Wave 21 · skip | **ship Wave 21** | ☐ |
| D5 | Prominent consultancy CTAs | defer (AGENTS.md) · low-key contact only | **defer** | ☐ Locked ✅ |

### E. Orbita platform (cross-repo)

| # | Question | Options | Default if silent | Your decision |
|---|----------|---------|-------------------|---------------|
| E1 | `at-editorial` profile on prod | deploy now · after Wave 19 prod verify | **after catalog live on prod** | ☐ |
| E2 | Catalog in daily dedup | yes · keep verify-by-id only | **yes** after prod deploy | ☐ |
| E3 | Separate `.io` content client | defer · `content-ai-transformation-io` later | **defer** | ☐ Locked ✅ |

---

## Batch orchestrate bundles (suggested)

Once decisions locked, kick off in groups without stopping:

| Bundle | Waves / work | Needs from you |
|--------|--------------|----------------|
| **Bundle 1 — Ops** | Newsletter first send (human) + Zeabur smoke | B1, B2 |
| **Bundle 2 — Polish** | Wave 21 ui-p1-org + optional `.org` footer | D4 only (defaults OK) |
| **Bundle 3 — Scale** | Wave 20 scale-archive | B3–B5, C1, C3 |
| **Bundle 4 — Editorial maturity** | Auto-approve + corpus reset tooling | A1–A5 after 1 review round |

---

## Already locked (do not re-ask)

From SITE_DESIGN_v2 §16 + AGENTS.md:

- Google OAuth only (humans)
- No legacy URL redirects
- No Discourse / full forum
- No function-primary nav (default)
- English UI; light default + dark toggle
- Quota-only agent reads until scale gate
- Human founder approve for publish (until A1 changes)

---

*Edit Decision column or tell agent: 「A1: (b) 90」to lock.*
