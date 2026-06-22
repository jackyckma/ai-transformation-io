# Editorial policy — curated home feeds

**Last updated:** 2026-06-22  
**Feeds:** `io-home.json`, `org-home.json`  
**Process:** Agent proposes → founder approves PR (see `.agents/skills/curated-home-refresh/`)

---

## Purpose

Home pages show **few, high-signal** editorial choices — not the full article index. Changes are intentional and slow.

---

## Slot rules

| Slot | Max items | Role |
|------|-----------|------|
| `readerEntry` | 1 | Reflective headline — sets tone, not a CTA button |
| `readerPaths` | 3 | Role/intent paths (compact cards) |
| `spotlight` | 1 | Single featured piece — may rotate |
| `topics` | 2–3 | Thematic rows with anchor or external href |
| `secondaryLinks` | 0–2 | Lower emphasis (e.g. assessment on .io) |

---

## Dedup rule (required)

**The same article slug must not appear in more than one primary home slot** among:

- `spotlight[].slug`
- `readerPaths[].articleSlugs[]`
- `topics[].anchorSlug`

External links (`externalLinks`, `externalHref`) are exempt but should not repeat the same destination as spotlight without reason.

**Example violation:** cornerstone in both `spotlight` and explore reader path → pick one slot.

---

## Site-specific emphasis

### .io

- Reader paths: lead / implement / explore (role framing).
- Assessment: **`secondaryLinks` only** — not spotlight, not path hero.
- Spotlight: prefer playbook or governance angle when rotating — avoid repeating explore-path cornerstone.

### .org

- **Reader path order:** Share → Learn → Apprenticeship (share-first metric).
- Spotlight: orient newcomers OR highlight contribution — must not duplicate learn-path slugs.
- Topics: field experiences + apprenticeship; link to .io frameworks in secondary, not duplicate content.

---

## Imagery

- Covers are **topic-level** abstractions under `/curation/*.jpg` — not per-article photos.
- Regenerate: `node scripts/generate-curation-covers.mjs`
- Assets duplicated in both `apps/web-io/public/curation/` and `apps/web-org/public/curation/`.

---

## Rotation cadence

- **Low frequency** — editorial judgment, not news ticker.
- Typical: monthly or when a new Harvest theme warrants it.
- Every change updates `updatedAt` in JSON.

---

## Approval workflow

1. Agent (or human) drafts JSON diff + short rationale in PR description.
2. Founder reviews: dedup, voice, CTA priority, image paths.
3. Merge → deploy from `main`.
4. No direct production JSON edits outside git.

---

## Voice

- English UI copy; anti-hype; experience over vendor checklist (.org).
- Editorial notes (`editorNote`) — one sentence, curator voice, not marketing superlatives.
