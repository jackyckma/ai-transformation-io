---
name: ux-copy
description: Project-specific UX writing for interface microcopy, forms, errors, empty states, nav labels, and CTAs on ai-transformation sites. Load when writing or editing user-visible English strings in web-io, web-org, or shared UI — not for knowledge-base articles unless explicitly UI chrome.
---

# UX copy (ai-transformation sites)

Systematic microcopy and voice rules for **English site UI**. User/agent chat may be 繁體中文; **published site copy stays English**.

**When to load:** Buttons, labels, errors, toasts, empty states, form help, nav items, wizard steps, interest/signup forms, agent panel labels, assessment UI strings.

**When NOT to load (use editorial/content workflow instead):**

- `knowledge-base/` articles, `apps/web-org/content/*.md` long-form (e.g. apprenticeship overview)
- `usr/` internal strategy
- `data/curated/*.json` curator notes (founder voice, slow cadence)

**Also load:** `lane-web-io` or `lane-web-org`; for visual layout changes, load `editorial-ui`.

**Authority:** `AGENTS.md` Learned User Preferences + existing page copy as reference. Do not flatten everything to generic SaaS tone.

## Three voice contexts

| Context | Site / surface | Tone | Reading level |
|---------|----------------|------|---------------|
| **Enterprise editorial** | `.io` articles, frameworks, playbook, `/for-agents` prose | Authoritative, pragmatic, anti-hype; frameworks with actionable next steps | ~10th grade; precise terms OK when defined |
| **Community editorial** | `.org` Harvest Hub, apprenticeship overview (`apprenticeship-overview-EN.md` — **"we"** voice) | Warm, experience-first, not hype; formation not consulting | Conversational but substantive |
| **UI microcopy** | Forms, auth, assessment wizard, errors, nav | Concise, clear, active; sentence case | Short sentences; 8–14 words ideal in messages |

**Cross-domain:** `.io` = corporate portal; `.org` = Harvest Hub · Apprenticeship. Never imply apprenticeship is enterprise consulting.

## Four quality standards (every string)

1. **Purposeful** — Helps the user act or understand; serves the task, not the brand ego.
2. **Concise** — Fewest words that keep meaning; front-load the important part.
3. **Conversational** — Natural English; active voice default (~85%).
4. **Clear** — Unambiguous; consistent terminology across the flow.

**Edit in four passes:** Purposeful → Concise → Conversational → Clear.

## Patterns

### Buttons and links

- `[Verb] [object]` — `Save changes`, `Share a story`, `Express interest`
- Avoid: `Submit`, `OK`, `Click here`, `Learn more` (without object)
- Same verb through a flow: button `Sign in` → success `Signed in` (if shown)

### Nav and titles

- Sentence case: `For agents`, not `For Agents`
- Name what the user recognizes: `All learn guides`, `Organizational diagnostic`

### Errors

Pattern: **What failed. Why/context if helpful. What to do.**

- No blame (`Invalid input`), no vague (`Something went wrong`) without recovery
- No apologies theater; be direct and fix-oriented
- Examples: `Couldn't save your assessment. Sign in to save progress.` / `Email is required.`

### Empty states

Explain why empty + one clear next action. Not mood-only filler.

- `No stories yet.` + link to submit (if applicable)

### Forms (Harvest, apprenticeship interest, ask, auth)

- Visible labels always; placeholders supplement, don’t replace labels
- Helper text only when it reduces failure (why we ask, format hint)
- `.org` post flows: login required to post — say so plainly before blocking

### Agent-facing copy

- Factual, protocol-oriented on `/for-agents` and Agent-friendly panel
- Copy-paste quick start is a feature — keep commands accurate to real endpoints

## Accessibility

- Link text describes destination (`Read design rationale`, not `here`)
- Errors include text, not color alone
- Button/link purpose clear out of context (screen readers)

## Benchmarks (microcopy only)

| Element | Target |
|---------|--------|
| Button | 2–4 words |
| Error + fix | ~12–18 words |
| Notification title | ~35–45 characters |

Long editorial paragraphs are exempt — don’t force 40-character lines on articles.

## Anti-patterns for this project

- Startup hype (`Unlock`, `Supercharge`, `Revolutionary`)
- False urgency subscribe CTAs (newsletter deferred)
- Schedule-call / consultancy funnel language on early surfaces
- Replacing apprenticeship **"we"** community voice with founder **"I"** on public `.org` pages (founder first-person stays in `usr/13` / external blog)
- Generic 7th-grade dumbing-down of framework terms users need (Three Gaps, RoA, etc.)

## Quick audit checklist

- [ ] Matches one of the three voice contexts
- [ ] Active, sentence case, specific verbs
- [ ] Error/empty states actionable
- [ ] Terminology matches rest of site (Assessment, Harvest Hub, Apprenticeship, Agent-friendly)
- [ ] No marketing pills or hype inconsistent with `AGENTS.md`

## Attribution

Four standards and pattern structure adapted from [ux-writing-skill](https://github.com/content-designer/ux-writing-skill). Project voice rules are original to this repo.
