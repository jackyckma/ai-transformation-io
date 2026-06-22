# Positioning & UX — locked decisions

**Last updated:** 2026-06-22  
**Status:** Founder-approved — supersedes scattered notes in `usr/*` and older positioning lines where they conflict.

**Related:** [POSITIONING.md](./POSITIONING.md) (short table) · [product-architecture.md](./product-architecture.md) (IA) · [DOC_ALIGNMENT_AUDIT.md](./DOC_ALIGNMENT_AUDIT.md) (contradiction log)

---

## One-line positioning

| Site | One line |
|------|----------|
| **ai-transformation.io** | A **companion / support** portal for AI transformation — personalized over time (role + progress), not a quiz-first product. |
| **ai-transformation.org** | **Harvest Hub** — share field experiences; read first, contribute when you have something real. Brand: *AI Transformation · Harvest Hub* (not "Learn Together"). |

---

## .io — companion, not quiz-first

### North star

- **Primary interaction (future):** in-site **sidebar chatbot** for personalized answers — users prefer dialogue over reading long articles.
- **Secondary interaction:** external agents via API (`/for-agents`, L11) — already building; not the first UX bet unless data shows it is clearly easier or more effective.
- **Content layer:** role-based reader paths + curated topics + spotlight; assessment is **SEO / secondary** (org-level Three Gaps diagnostic), not home hero.
- **Agent panel:** stays **default visible** on home — human discovery of agent-friendly design is intentional.

### Assessment

- Keep 36-question Three Gaps wizard + radar (Wave 3 shipped).
- Home: secondary link only (`secondaryLinks` in curated JSON), not primary CTA.
- "Your progress" dashboard (saved assessment + recommended links) — iterate after chatbot v1.

### Personalization & chat history

- **Chat history** means **on-site conversation** (future site chatbot / ask thread), not export from ChatGPT/Claude.
- Wave 7–9: reserve data model hooks for conversation persistence; **conversation export API** is optional until chatbot ships.

### Human-via-agent path (3 steps)

1. Human reads agent-friendly copy on home panel or `/for-agents`.
2. Human gives **`/for-agents`** (or quick-start block) to their ChatGPT / Claude / custom agent.
3. Agent reads API + `llms.txt`; human signs in separately for progress; agent write via authorize + rate limits (Wave 7).

---

## .org — Harvest Hub, share-first

### Success metric

- **Primary:** monthly **N approved stories** (moderated Harvest loop).
- **CTA priority:** Share stories > learn guides > apprenticeship (affiliate intro page for now).

### Navigation & auth (locked 2026-06-22)

| Decision | Detail |
|----------|--------|
| Nav priority | **Stories / Share** first, then Learn, Apprenticeship, Prompts, Ask |
| **Join** nav | **Removed** — humans use header **Sign in** (Google OAuth) |
| `/join` route | May remain as OAuth landing URL; not primary nav |
| Agent entry | **Home agent panel + `/for-agents` only** — not "Join" |

### Human-via-agent

Same 3-step model as .io; agents can read community metadata and (after authorize) submit stories, prompt replies, inquiries.

---

## Curation & spotlight

### Principles

- Home is **layered curation**, not a flat article index.
- **No intentional duplication** — a cornerstone article must not appear in both spotlight and a reader path (see [EDITORIAL_POLICY.md](../data/curated/EDITORIAL_POLICY.md)).
- Spotlight **may rotate** at low frequency (editorial, not news cadence).

### v1 process (locked 2026-06-22)

1. Agent proposes JSON diff to `data/curated/*.json` (skill: `.agents/skills/curated-home-refresh/`).
2. Founder **approves PR** — no silent auto-publish.
3. Policy doc: `data/curated/EDITORIAL_POLICY.md`.

---

## Interaction roadmap (phases)

| Phase | Focus |
|-------|--------|
| **Now (Wave 6 partial)** | Curated homes, agent discovery UI, API stubs |
| **Wave 7** | Agent read/write protocol, quotas |
| **Post–Wave 7** | Sidebar chatbot v1 (primary human interaction) |
| **Later** | Your progress dashboard; optional conversation export API |
| **Wave 9** | Function-by-role IA (deferred from default home) |

---

## Design constraints (unchanged)

- English-only UI; light default + dark toggle.
- Content-first editorial — serif titles, light sans body; not product-marketing hero blocks.
- Defer newsletter subscribe UI and prominent consultancy CTAs until assessment + automation mature.

---

## Document hierarchy

When docs conflict, prefer (newest explicit lock wins):

1. **This file** — product / UX locks  
2. `docs/product-architecture.md` — IA + lanes  
3. `docs/project-progress.md` — wave delivery  
4. `usr/*` — internal strategy history (may be superseded; see audit)
