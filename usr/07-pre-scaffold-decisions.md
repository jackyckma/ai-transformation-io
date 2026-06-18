# Pre-scaffold product decisions

**Date:** 2026-06-18  
**Status:** Confirmed by founder — use for scaffold planning

## Confirmed decisions

| Topic | Decision |
|-------|----------|
| Assessment depth | **30+ questions** (one-time build, no phased 15→30) |
| .org access model | **Public read, login to post** |
| Auth (primary) | **Google OAuth** |
| Newsletter | **Delayed** on both sites; separate lists when ready (after agent curation) |
| Consultancy CTA | **No booking** in v1; low-key **email + question** box only |
| Assessment → sales | Wait until assessment mature before stronger CTA |

## Open (needs architecture choice)

| Topic | Current leaning | See |
|-------|-----------------|-----|
| .org community | **Harvest Hub first** (Stories + Prompt + question box); defer full forum | `09-community-strategy-alternatives.md` |

## Assessment structure (30+ questions)

Based on **Three Gaps** × 3 sub-dimensions × ~4 questions ≈ **36 questions**:

| Gap | Sub-dimensions | ~Questions |
|-----|----------------|------------|
| Work redesign | Workflow ownership, metrics, end-to-end pilots | 12 |
| Governance | Autonomy level, accountability, monitoring | 12 |
| Value measurement | Outcome hypotheses, multidimensional ROI, board reporting | 12 |

Scoring → gap radar + weakest gap + links to .io function playbooks + .org discuss categories.

## v1 contact capture (not sales)

**"Have a question?" box** on .io (and optionally .org):
- Fields: email, question (textarea), optional name
- Stored in `apps/backend` → `inquiries` table
- No Calendly / no scheduling
- Optional: tag source page / assessment score if logged in
- Response: manual email reply for now; agent-assisted drafts later

## Auth stack recommendation

- **Google OAuth** via backend (Auth.js / Lucia + Google provider)
- Single user table in backend; sessions shared across web-io, web-org via backend
- **Defer magic link** to Phase 2 (add for corporate users blocked from Google OAuth)
- Same identity for assessment save + forum post + inquiry

## Newsletter (deferred — infra ready)

**Model:** Curated **switchboard** — Harvest Hub inputs → small newsletter issue → subscriber **replies** → next issue / .io content. See `10-harvest-hub-newsletter-infrastructure.md`.

**v1:** No subscribe UI, no send. Build unified `contributions` table + stub `issues`/`subscribers` + `NoopNewsletterProvider`.

**When live:**
- `.io` **Transformation Pulse** — frameworks, playbook updates, featured community insights
- `.org` **Learn Together** — weekly prompt recap, new Stories, “what we heard”
- Separate lists; same backend; agent drafts issue from contribution queue; human approves send

**Turn-on trigger:** ~10+ contributions or usable agent draft + pilot list of ~10 friends (not mass scale).

## Cold start (.org)

See discussion in founder conversation 2026-06-18; tactics in `06-implementation-research-discussion.md` § cold start.

Priority tactics:
1. Founder-seeded 10–15 threads before public launch
2. Weekly prompt (automated topic creation)
3. Cross-link from .io assessment results → relevant .org discuss category
4. Showcase 1–2 "community insights" on .io (with permission) — bridges two sites

---

*Related: [06-implementation-research-discussion.md](./06-implementation-research-discussion.md)*
