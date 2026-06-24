# Document alignment audit

**Last updated:** 2026-06-25  
**Trigger:** Founder approved [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md) — full doc pass + archive outdated plans.

**Post–Wave 14 roadmap (2026-06-25):** Waves 15–19+ realigned — UI before newsletter; L12 Orbita client; see [UI_READINESS_AUDIT.md](./UI_READINESS_AUDIT.md).

**Canonical product & IA (Wave 11+):** [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md)  
**Historical UX (Waves 0–10):** [POSITIONING-UX.md](./POSITIONING-UX.md)

---

## v2 alignment pass (2026-06-25)

| Action | Files |
|--------|-------|
| **Roadmap realign** | `SITE_DESIGN_v2.md` §12 — Waves 15–19+; Wave 10 scope → Wave 17 |
| **New** | `UI_READINESS_AUDIT.md`, `docs/waves/wave15-ui-readiness.md`, L12 `INTERFACE.md`, `.editorial-orbita/` |
| **Updated** | `CURRENT_STATUS.md`, `SESSION_HANDOFF.md`, `project-progress.md`, `product-architecture.md`, `traceability-index.md`, `EMAIL_NEWSLETTER.md`, `docs/README.md`, `AGENTS.md` |
| **Resolved** | Code↔doc “routes not migrated” — Wave 11–14 shipped on `main` |

## v2 alignment pass (2026-06-23)

| Action | Files |
|--------|-------|
| **Approved spec** | `SITE_DESIGN_v2.md` — status → Approved; §15 housekeeping for implementation |
| **Deprecation banners** | `POSITIONING-UX.md`, `product-architecture.md` (IA sections) |
| **Rewritten pointers** | `POSITIONING.md`, `docs/README.md`, `CURRENT_STATUS.md`, `SESSION_HANDOFF.md` |
| **Wave map updated** | `project-progress.md` — Wave 11–14 = v2 |
| **Archived** | `SCAFFOLD_PLAN.md` → [archive/SCAFFOLD_PLAN.md](./archive/SCAFFOLD_PLAN.md) |
| **Agent entry points** | `AGENTS.md`, `project-guidelines.md`, lane skills — v2 pointers |

---

## Summary

| Category | Action |
|----------|--------|
| Active — follow for new work | `SITE_DESIGN_v2.md`, `CURRENT_STATUS.md`, `project-progress.md`, technical ops docs |
| Historical — do not extend | `POSITIONING-UX.md`, `product-architecture.md` § shipped IA |
| Archive | `docs/archive/*` — early scaffold & superseded plans |
| Internal research | `usr/*` — keep; add note where Harvest Hub branding superseded |
| Orchestrate handoffs | `.orchestrate/wave*/**` — wave artifacts; never edit for pivots |

---

## Contradiction themes (grep periodically)

1. **Harvest Hub** as primary .org brand vs **Community · Knowledge commons** (v2)
2. **`/frameworks` `/learn` `/stories`** vs **`/library` `/knowledge`**
3. **Sidebar / home agent panel primary** vs **Ask modes + contextual actions** (v2)
4. **Function-primary or Share-first nav** vs **fixed v2 ribbon**
5. **POSITIONING-UX** cited for new IA — should cite **SITE_DESIGN_v2** instead

```bash
rg -i "harvest hub|/frameworks|/learn/|POSITIONING-UX|function-primary|share-first" docs .agents AGENTS.md README.md --glob '*.md'
```

Compare hits against [SITE_DESIGN_v2.md](./SITE_DESIGN_v2.md).

---

## Historical internal strategy (`usr/`)

Do not delete — research record. Where branding or IA conflicts with v2, **v2 wins** for new work.

| File | Note |
|------|------|
| `usr/09-community-strategy-alternatives.md` | Harvest Hub Phase 1 choice — still valid history |
| `usr/10-harvest-hub-newsletter-infrastructure.md` | Infra still useful; rename list copy when newsletter ships |
| `usr/11-agent-first-api-v1.md` | API spec — align with v2 Ask/API parity in Wave 13 |

---

## Code ↔ doc (Wave 11–14 ✅ on `main`)

Legacy routes removed per v2 §15. Do not reintroduce `/frameworks`, `/learn`, etc.

| v2 route | Status |
|----------|--------|
| `/library`, `/insights`, `/ask` (.io) | ✅ |
| `/knowledge`, `/community`, `/ask` (.org) | ✅ |
| Object store + community API | ✅ Wave 12–14 |
