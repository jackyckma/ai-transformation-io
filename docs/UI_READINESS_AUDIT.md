# UI readiness audit — Wave 15

**Last updated:** 2026-06-25  
**Purpose:** Comparative gap analysis so Wave 15 polish targets “production-ready” feel, not friend interviews.  
**Method:** Reference-site patterns + production snapshot of ai-transformation.io / .org (2026-06-25).

---

## How to use this doc

1. Each **dimension** scores our sites vs reference patterns.
2. **Gap** = why it feels “strange” or prototype-like.
3. **Backlog item** = shippable in Wave 15 (no full rebrand).

Wave 15 orchestrate should implement **≤10 backlog items** marked **P0** below.

---

## Reference set

| Type | Reference | What they do well |
|------|-----------|-------------------|
| Editorial executive | [Stratechery](https://stratechery.com), [Every](https://every.to) | Dense credibility: dates, bylines, “this is a live publication” |
| Community feed | [Indie Hackers](https://www.indiehackers.com) | Obvious activity: avatars, timestamps, reply counts, non-empty feed |
| Knowledge wiki | GitBook / Notion public docs | Clear hierarchy, updated metadata, scannable index |
| Agent + human | Stripe Docs, GitHub README | Trust chrome: footer, version, stable IA |

We **keep** editorial serif + light sans, narrow column, content-first — we are not copying marketing SaaS landing pages.

---

## Dimension matrix

| # | Dimension | .io | .org | Reference pattern | Gap (prototype feel) | Backlog |
|---|-----------|-----|------|-------------------|----------------------|---------|
| 1 | **Visual credibility** | Abstract topic covers on home cards (`public/curation/`) | Same + community cards | Real publications mix abstract art **with** article meta and occasional photographic spotlights | Covers read as “design system demo”, not “someone published this” | **P0** Add visible **published/updated date + content type** on home grid and library/knowledge index cards |
| 2 | **Information density** | Home 1+6 grid is structurally good | Community page can show “Loading…” then sparse list | IH / Stratechery: feed always shows **something** readable above fold | Empty or loading states dominate when object count low | **P0** Seed content (Wave 16) + **P0** static editorial fallback highlights when API returns 0 objects (curated, labeled “Editor’s picks”) |
| 3 | **Social proof signals** | Article pages lack prominent date/author in chrome | Community objects have metadata in API but weak in list cards | Timestamps, “3 replies”, member badge | Feels unfinished / no one home | **P0** Community list: show **type, date, visibility, excerpt length** consistently; detail page: interaction counts |
| 4 | **Brand consistency** | Home still links “Harvest Hub” (.io curated JSON) | Mixed “Harvest companion” widget copy | v2 brand: **Community · Knowledge commons** | Old brand strings erode “we launched” credibility | **P0** Grep + replace legacy **Harvest Hub / Harvest companion** in curated JSON, footers, companion widget |
| 5 | **Navigation affordance** | Ribbon OK | Ribbon OK | Clear “next read” on article footers | Dead-end after one article | **P1** Article footer: “More in Library/Knowledge” + related pillar links |
| 6 | **Empty / error states** | Rare | `/community` client fetch → loading/error | Honest empty state with **editorial static content**, not spinner-only | “Loading community…” feels broken | **P0** Replace spinner-only with skeleton + fallback curated highlights |
| 7 | **Trust chrome** | Minimal footer | Minimal footer | About, contact, mission, copyright year | “Side project” vibe | **P1** Footer block: mission one-liner, © year, low-key contact |
| 8 | **Interaction feedback** | Ask/Save OK when logged in | Follow/match/save exist | Immediate toast or inline “Saved” | Uncertain if action worked | **P1** Inline confirmation for save/follow/match feedback |
| 9 | **Companion / chat chrome** | “Companion” panel on every page | “Harvest companion” on .org | v2: companion via **/ask**, not persistent sidebar feel | Reads as bolt-on prototype widget | **P0** Demote to **/ask entry** only on mobile ribbon; reduce duplicate chat on community/knowledge index pages OR restyle as subtle “Open Ask” strip |
| 10 | **Secondary pages** | `/for-agents` good | Apprenticeship OK | Same typography rhythm as home | Some pages lighter/older | **P2** Pass: settings, moderation, start/join — align spacing + headers |

---

## Production spot-check (2026-06-25)

| URL | Observation |
|-----|-------------|
| https://ai-transformation.io/ | Structure solid; **“Harvest Hub”** still in Explore tile; companion panel competes with editorial home |
| https://ai-transformation.org/community | **“Loading community…”** in a11y tree on first paint; sparse when object count low |
| Curated covers | `apps/*/public/curation/README.md` — intentional abstract art; OK if paired with stronger metadata |

---

## Wave 15 P0 backlog (implement in orchestrate)

1. **Dates + type labels** on home curated grid, library/knowledge index, community list cards.
2. **Brand copy pass** — remove Harvest Hub / Harvest companion from user-visible strings (curated JSON, companion, footers).
3. **Community empty/loading UX** — skeleton + editorial fallback (`COMMUNITY_HIGHLIGHTS` or curated JSON) when live API empty.
4. **Companion demotion** — no full chat chrome on community/knowledge list pages; link to `/ask` instead.
5. **Trust footer** — one row mission + © on both sites.

Optional P1 in same wave if time: article footer related links; inline save confirmation.

**Out of scope Wave 15:** new features, Orbita, newsletter, LLM ranking, matcher promote.

---

## Verification

After Wave 15:

- [ ] Friend-style “prototype” checklist: home + community + one article **without** saying “loading” or legacy brand
- [ ] `rg -i "harvest hub|harvest companion" apps/web-* data/curated` → 0 user-facing hits (except historical docs)
- [ ] `pnpm turbo build` + manual smoke both domains

---

## Related

- [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) §12 — Wave 15 definition  
- [waves/wave15-ui-readiness.md](./waves/wave15-ui-readiness.md) — orchestrate kickoff goal  
- `data/curated/EDITORIAL_POLICY.md` — curation rules  
