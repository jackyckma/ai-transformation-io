# Document alignment audit

**Last updated:** 2026-06-22  
**Trigger:** Founder locked companion/.org nav/spotlight/chatbot decisions — scan for outdated or contradictory docs.

**Canonical UX locks:** [POSITIONING-UX.md](./POSITIONING-UX.md)

---

## Summary

| Category | Count | Action |
|----------|-------|--------|
| Updated in this pass | 8 | See § Fixed below |
| Historical — pointer only | 5 | `usr/*` — do not rewrite; superseded where noted |
| Orchestrate handoffs | 2 | Historical wave artifacts — no edit |
| Scaffold / early plans | 1 | Low priority — note only |

---

## Fixed in this pass

| File | Was wrong | Fix applied |
|------|-----------|-------------|
| `docs/POSITIONING.md` | "Learn together" for .org; missing companion .io | Rewritten; links to POSITIONING-UX |
| `docs/CURRENT_STATUS.md` | Stale date; missing Phase B images, skills, nav lock | Updated |
| `docs/project-progress.md` | "Founder hand-edits JSON"; register-funnel chatbot | Agent-propose + approve; chatbot-as-support |
| `docs/product-architecture.md` | `/join` in nav IA; old home description | Pointer to POSITIONING-UX; nav/auth note |
| `docs/ARCHITECTURE.md` | "learn together" domain row | Harvest Hub + link |
| `docs/README.md` | Missing new docs in index | Added POSITIONING-UX, audit, EDITORIAL_POLICY |
| `data/curated/README.md` | "Founder-edited" only | Agent-propose workflow + EDITORIAL_POLICY link |
| `AGENTS.md` | Chatbot as "registration hook"; missing 2026-06-22 locks | Updated Learned Preferences |

---

## Remaining known gaps (not blocking)

| File | Issue | Recommended action |
|------|-------|-------------------|
| `docs/EMAIL_NEWSLETTER.md` | List name `org_learn` described as "Learn Together" | When newsletter ships, rename list label to **Harvest Hub** in copy only; infra ID can stay |
| `docs/SCAFFOLD_PLAN.md` | Early scaffold; "readiness quiz" wording | Historical — ignore unless someone uses it for greenfield |
| `.orchestrate/wave4-auth/handoffs/*` | Documents adding `/join` nav | Historical Wave 4 artifact — superseded by POSITIONING-UX nav lock |
| `apps/web-org/app/join/page.tsx` | OAuth landing still exists | OK as deep link; nav removed; consider redirect copy update later |
| `docs/traceability-index.md` | May lag new skills | Add `curated-home-refresh` on next traceability pass |

---

## Historical internal strategy (`usr/`)

These files informed early direction. **Do not delete** — they record research. Where they conflict with [POSITIONING-UX.md](./POSITIONING-UX.md), the UX doc wins.

| File | Stale element | Status |
|------|---------------|--------|
| `usr/06-implementation-research-discussion.md` | Forum-first, "Learn Together" home | Historical — Harvest Hub chosen over forum |
| `usr/07-pre-scaffold-decisions.md` | Learn Together newsletter naming | Historical — defer newsletter |
| `usr/09-community-strategy-alternatives.md` | Learn Together narrative | Historical — see POSITIONING-UX |
| `usr/10-harvest-hub-newsletter-infrastructure.md` | "Learn Together" list branding | Mostly aligned on Harvest; rename when L6 ships |
| `usr/11-agent-first-api-v1.md` | Agent API spec | **Still authoritative** for Wave 7 — aligns with decisions |

---

## Code ↔ doc contradictions (resolved or tracked)

| Location | Issue | Resolution |
|----------|-------|------------|
| `apps/web-org/components/site-chrome.tsx` | `Join` in primary nav | **Removed** — Sign in in header |
| `data/curated/io-home.json` | Spotlight = explore path cornerstone | **Deduped** — spotlight uses different slug |
| `data/curated/org-home.json` | Learn before Share in paths | **Reordered** — Share path first |
| `packages/shared` agent panel copy | Missing human "give link to agent" | **Updated** summary string |
| `.agents/skills/lane-web-io/SKILL.md` | (Was) function-primary IA | Already says reader paths + curation first |

---

## Contradiction themes (for future scans)

1. **"Learn Together"** vs **Harvest Hub** — grep periodically.
2. **Quiz / assessment as hero** vs **companion + secondary diagnostic**.
3. **Founder-only JSON edits** vs **agent-propose + founder PR approve**.
4. **Join nav** vs **Sign in only**.
5. **Chatbot as register funnel** vs **chatbot as primary support interaction**.

---

## How to re-run this audit

```bash
rg -i "learn together|/join|quiz-first|hand-edit|register funnel" docs usr data .agents --glob '*.md'
```

Compare hits against [POSITIONING-UX.md](./POSITIONING-UX.md).
