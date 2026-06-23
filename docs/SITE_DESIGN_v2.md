# Site design v2 — product & IA spec

**Status:** **Approved** (founder 2026-06-23) — Wave 11+ north star; gradual migration from Waves 0–9 shipped shell  
**Last updated:** 2026-06-23  
**Related:** [project-progress.md](./project-progress.md) · [CURRENT_STATUS.md](./CURRENT_STATUS.md)

Supersedes IA/product direction in [POSITIONING-UX.md](./POSITIONING-UX.md) and site IA sections of [product-architecture.md](./product-architecture.md) for **new work**. Historical Waves 0–10 decisions remain valid until Wave 11 removes/replaces shipped UI.

---

## 1. Product thesis

Both sites are **knowledge workspaces for humans and agents**, not traditional content sites or forums.

| Principle | Detail |
|-----------|--------|
| **Site role** | Present information, low-friction interaction, track personal/community state |
| **Heavy lifting** | Long-form structuring, contribution, many community actions → **Agent + API** (human approves when configured) |
| **Ask surface** | Single page with **modes** (Ask / Capture / Submit / Find Help) — not a vague mega-chat |
| **Agent API** | In hamburger (docs + settings); **contextual actions** on every object |
| **On-site Agent** | The **Ask chatbot** (today’s companion) — contextual actions prefill Ask with context |

External ChatGPT/Claude deep links are **out of scope for Phase 1** (Ask prefill only).

---

## 2. Positioning

### ai-transformation.io

| Layer | Purpose |
|-------|---------|
| **Public (logged out)** | Traffic driver — generic curation + reference library + insights placeholders + Ask |
| **Personal cockpit (logged in)** | Same IA, added **My Library**, personal Insights relevance, Capture, rule-based recommendations |

Not a gated corporate portal in Phase 1 — public Library stays fully valuable for SEO and discovery.

### ai-transformation.org

| Layer | Purpose |
|-------|---------|
| **Public** | Community-facing **Knowledge commons** + public **Community highlights** |
| **Logged in** | Personal activity dashboard, My Library / My contributions, full Community opportunity layer, lightweight interaction UI |

**Brand (outward):** *Community · Knowledge commons* — not “Harvest Hub” as primary label (may remain in metadata/description during transition).

Core remains **community**, split into:

1. **Knowledge** — durable contributed knowledge (articles, field notes, derived articles, etc.)
2. **Community** — opportunity & interaction layer (discussions, events, requests, etc.)

Not a classic forum — agent-assisted workflows preferred; human one-click actions **coexist** where useful.

---

## 3. Navigation

### 3.1 Mobile ribbon (fixed)

| Site | Tabs |
|------|------|
| **.io** | Home · Library · Insights · Ask |
| **.org** | Home · Knowledge · Community · Ask |

Labels **do not change** between logged out / logged in; **page content** changes (see §4).

### 3.2 Hamburger (both sites)

- Register / Sign in (Google OAuth — see §8)
- Agentic Access API (documentation + token/settings)
- Settings (profile, onboarding fields, agent auto-publish preferences)
- About / documentation links as needed

**Not in ribbon:** Agent API, Settings, Account management.

### 3.3 Route map (target — replaces current split hubs)

#### .io

| Route | Logged out | Logged in |
|-------|------------|-----------|
| `/` | Curated home + Library highlights + special pages | **Personal Transformation Dashboard** (recommendations) |
| `/library` | Wiki-style unified library (all articles, filterable) | Shared library + **My Library** tabs |
| `/insights` | Curated external benchmarks + short interpretation (placeholders OK) | + personal relevance filter |
| `/ask` | Ask mode only | Ask + Capture modes |

**Removed (no redirects):** `/frameworks`, `/playbook`, `/functions`, `/assessment` as top-level hubs — content lives under `/library` with types/tags; assessment runs under `/insights` or linked from library objects (exact UX TBD in Wave 11 implementation).

#### .org

| Route | Logged out | Logged in |
|-------|------------|-----------|
| `/` | Curated community home + special pages (e.g. apprenticeship intro) | **Personal Community Activity Dashboard** |
| `/knowledge` | Public knowledge index (auto-categories) | + My Library, My articles/comments |
| `/community` | **Public-only** highlights (discussions, events, requests, …) | Full opportunity layer (all visibility-allowed items) |
| `/ask` | Ask mode only | Ask + Capture + Submit + Find Help |

**Removed (no redirects):** `/learn`, `/stories`, `/stories/submit` as separate top-level sections — migrated into `/knowledge` and `/community` / Ask modes.

**May remain temporarily as special pages linked from Home:** `/apprenticeship` until modeled as Community object type (Phase 2).

---

## 4. Ask page — modes

Same `/ask` route; mode selector above input. Placeholder text per mode.

| Mode | .io guest | .io member | .org guest | .org member |
|------|-----------|------------|------------|-------------|
| **Ask** | ✓ | ✓ | ✓ | ✓ |
| **Capture** | — | ✓ | — | ✓ |
| **Submit** | — | — | — | ✓ |
| **Find Help** | — | — | — | ✓ |

### Mode intent

| Mode | Behavior |
|------|----------|
| **Ask** | RAG chat over public Library/Insights (.io) or Knowledge/Community public slice (.org); logged in adds private notes + My Library context |
| **Capture** | Short rough input → private note / project context (always **private** visibility) |
| **Submit** | Describe contribution → structured draft → member review or agent auto-publish per settings → API |
| **Find Help** | Describe need → creates **help_request** (or discussion) in Community |

### Implementation note — unified API

The on-site Ask chatbot should call the **same backend contracts** as Agentic Access API where possible (read, draft contribution, capture note, community post). The UI is a client; not a separate shadow system. Concretely:

- **Reads:** existing `/api/v1/content`, chat session RAG (today’s `/api/chat/*`)
- **Writes:** extend toward `/api/v1/contributions` + new typed endpoints for Capture / Community objects, callable with session auth (human) or Bearer token (external agent)

Phase 1 can keep human session on cookie and external agent on Bearer; shared Zod schemas in `@ai-transformation/shared`.

---

## 5. Object model

### 5.1 Visibility (all knowledge & community objects)

| Level | Who can read | Sites |
|-------|----------------|-------|
| `public` | Everyone | .io, .org |
| `members-only` | Logged-in members of **that site** | .io and .org each enforce on their own objects |
| `private` | Owner only (+ owner’s agent token) | Primarily .io Capture/notes; rarely .org drafts |

“Community-only knowledge” = **`members-only`** on .org.

### 5.2 Knowledge objects (.org primary; .io library articles are knowledge without community workflow)

**Sources (non-exhaustive):**

- Native / migrated articles
- Agent field notes (approved or auto-published)
- **Derived articles** from discussions (new object; discussion retains link/id in Community)
- Mentor/apprentice summaries, event outcomes, project after-action notes (Phase 2+)
- `members-only` or `public` per author settings

**Derivation rule:** Discussion stays in **Community**; derived article lives in **Knowledge**; system posts back-link on the discussion.

### 5.3 Community objects (.org)

**Phase 1 types** (agent + human UI; extensible schema):

| Type | Purpose | Typical actions |
|------|---------|-----------------|
| `discussion` | Thread / conversation starter | Reply, Follow, Save, Turn into field note, Draft reply (Ask) |
| `help_request` | Output of Find Help mode | Offer help, Save, Match (Phase 2), Draft via Ask |
| `event` | Simple event listing | Join, Save, Follow |
| `community_announcement` | Official/community notices | Read, Save |

**Phase 2 types** (design reserved; API stubs OK):

`question`, `mentorship_request`, `project_request`, `collaboration_offer`, `apprenticeship_opportunity`

Each type has distinct fields and action verbs (Join, Apply, Offer help, Ask for intro, Follow, Save, Turn into knowledge note, Request mentor, Match me) — mapped in Agent API per type in Phase 2.

### 5.4 Personal layer (logged in)

| Feature | Visibility | Sites |
|---------|------------|-------|
| **Bookmarks** | Private | Both |
| **Comments** on public articles | **Public** | Both |
| **Annotations** | **Private** | Both |
| **Notes** (incl. Capture output) | **Private** | Both |
| **Recently viewed** | Private | Both |
| **My articles** | Per object visibility | .org (+ .io if user-authored in future) |
| **My comments** | Public comments authored by user | .org Knowledge |

---

## 6. Contextual agent actions (UI → Ask prefill)

Agent = on-site Ask. Examples:

| Context | Actions |
|---------|---------|
| .io Library item | Open with Agent · Ask to apply this · Save to my context |
| .io Insights card | Let Agent interpret for my role |
| .org Knowledge item | Summarize · Cite in my contribution |
| .org Community item | Draft reply · Turn discussion into field note · Submit via Agent |

Implementation: navigate to `/ask?mode=ask&context=<object-id>` (or event bus); Phase 1 = prefill prompt + optional object metadata in chat session.

---

## 7. Moderation & publish pipeline

- **No human moderator role** in Phase 1.
- **System:** automated moderation (content policy checks on submit — implementation Wave 12+).
- **Member setting:** per-user or per-submission choice — **auto-publish** (within visibility rules) vs **review before publish** (draft queue in My Library / dashboard).
- Public `members-only` content still respects visibility; auto-publish never elevates to public without explicit author choice.

Existing **story moderation queue** migrates to generic **contribution draft / pending** states.

---

## 8. Auth (decided for v2 draft)

| Decision | Value |
|----------|--------|
| Human auth | **Google OAuth only** (no magic link for humans) |
| Account scope | **One account** across .io and .org |
| Agent write auth | Unchanged — email confirm → Bearer token (180d), shared across sites |
| Register/Login | Hamburger; header sign-in optional for desktop |

Onboarding (first login or Settings): **role**, **industry**, optional **project focus** — feeds recommendations.

---

## 9. Recommendations (Phase 1 — decided)

**Single rule-based engine** shared by:

- .io logged-in **Home** dashboard
- .io **Insights** personal relevance section

**Inputs (weighted simple score):**

1. Onboarding profile (role, industry, project focus)
2. Assessment results if completed (weakest gap boosts matching articles)
3. Bookmarks + recently viewed
4. Editorial curated spotlight (manual boost)

**Not in Phase 1:** LLM ranking layer (defer to Phase 2 experiment).

.org logged-in Home uses the same engine pattern but inputs emphasize **followed topics**, **my contributions activity**, **community interactions**.

---

## 10. Insights (.io)

Phase 1 **placeholders accepted**:

- Curated cards: external benchmark links, open datasets, survey references
- Short **interpretation** copy (“what this means for {role}” template)
- No interactive charts required initially
- Logged-in: reorder/filter by onboarding profile

Assessment **lives under Insights** as a data type (not standalone nav item). Company/org diagnostic = one Insight product among others.

---

## 11. Phase plan (implementation)

### Phase 1 — IA shell + Ask modes (Wave 11)

- New ribbon routes + hamburger structure (both sites)
- `/library`, `/knowledge`, `/insights` placeholder, `/community` public highlights placeholder
- Ask mode switcher (matrix §4); Capture → private note stub
- Home logged-in vs logged-out layouts (rule-based recommendations v0)
- Onboarding profile fields
- Contextual “Open in Ask” prefills
- **Remove** old hub nav; **no** legacy URL redirects
- Brand copy: Community · Knowledge commons on .org

### Phase 2 — Object store + visibility (Wave 12)

- Unified knowledge/community object tables (or generalize `contributions`)
- Visibility enforcement
- Derived article workflow
- Auto-moderation hook + member publish settings
- My Library (bookmarks, notes, comments split)
- Assessment under Insights UX

### Phase 3 — Community types & API parity (Wave 13)

- Phase 1 community types fully wired (human UI + Agent API)
- Ask Submit / Find Help → API same as external agent
- Phase 2 community types + matching stubs

### Phase 4 — Personalization depth (Wave 14+)

- LLM-assisted ranking (optional)
- External agent deep links (optional)
- Newsletter integration with Knowledge objects (if Wave 10 pilot happened)

---

## 12. Wave alignment (Waves 0–10 vs v2)

### Already shipped (keep as foundation)

| Shipped | v2 reuse |
|---------|----------|
| Agent API v1 read/write/authorize | Agentic Access API + Ask backend parity target |
| Google OAuth + saved assessment | §8 auth + §9 recommendations input |
| Curated home JSON | Home curated layer (both sites) |
| Chat companion / `/ask` | Ask page + modes |
| Harvest stories/prompts/inquiries | Migrate to Knowledge / Community types |
| ZSend + newsletter infra (Wave 8) | Optional; Wave 10 unchanged |

### Wave 10 — Newsletter pilot

**Status:** Still **optional trigger** (contributions count, pilot list). **Not blocked by v2.**

**v2 note:** When pilot runs, newsletter content should link to **Knowledge** URLs (`/knowledge/...`), not legacy `/learn` or `/stories`. Defer subscribe UI on home hero until agent curation matures (unchanged product preference).

### Wave 11+ — remapped to v2 (replaces old “forum / credits” bullet list)

| Wave | Goal |
|------|------|
| **11** | IA shell, Ask modes, onboarding, Insights/Community placeholders, drop old hub routes |
| **12** | Object model, visibility, My Library, moderation settings, assessment→Insights |
| **13** | Community Phase 1 types + unified write API for Ask + external agent |
| **14** | Personalization v2, Phase 2 community types, matching experiments |
| **15+** | Newsletter public archive, agent credits top-up (if still desired) |

**Explicitly deprioritized vs old Wave 11+ list:**

- Full forum (Discourse) — **conflicts with v2**; do not plan
- Function-primary nav — **superseded** by Library wiki model

---

## 13. Open questions (non-blocking for draft)

| Topic | Default until tested |
|-------|----------------------|
| One-click Follow/Save on Community | Ship Save in Phase 1; Follow Phase 2 if low usage |
| Exact assessment URL under Insights | `/insights/assessment` vs modal from Insights hub |
| Auto-categories for Knowledge | Rule-based tags from pillar + agent-suggested tags Phase 2 |

---

## 15. Implementation housekeeping (Wave 11+)

When implementing v2, **remove or migrate** legacy surfaces in the same PRs — do not leave parallel IA.

### Routes to remove (no redirects per §3.3)

**web-io:** `/frameworks`, `/playbook`, `/functions`, standalone `/assessment` hub — content moves under `/library` or `/insights`.

**web-org:** `/learn`, `/stories`, `/stories/submit` as top-level sections — migrate to `/knowledge` and `/community` / Ask modes.

### Nav / chrome

- Replace mobile ribbon labels with v2 tabs (§3.1).
- Demote `/for-agents` and home agent panel to hamburger + contextual actions (panel may remain temporarily until contextual actions ship).
- Remove `DesktopNavLinks` hub nav tied to old sections when `/library` ships.

### Docs & copy (ongoing)

- Grep for Harvest Hub as **primary** brand → Community · Knowledge commons.
- Update `data/curated/*.json` CTAs when routes change.
- Archive or banner any new docs that describe pre-v2 IA.

### Code candidates for deletion after migration

- Duplicate hub index components if superseded by unified Library/Knowledge views.
- Orphan route segments under `app/frameworks`, `app/playbook`, `app/functions`, `app/learn`, `app/stories` once `/library` and `/knowledge` render the same content.
- Legacy `FunctionsIndex`-style components if unused.

### Keep until replaced

- Agent API v1 (`/api/v1/*`), chat session API, assessment scoring API, harvest/contributions backend — **refactor into object model in Wave 12**, do not delete prematurely.

---

## 16. Approval record

- [x] Founder approved Phase 1 community types (§5.3) — 2026-06-23
- [x] No legacy URL redirects (§3.3) — 2026-06-23
- [x] Google OAuth-only + shared account (§8) — 2026-06-23
- [x] Deprecation banners on superseded docs — 2026-06-23

---

*Approved from founder direction + clarification sessions 2026-06-23.*
