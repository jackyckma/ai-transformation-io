# Curated home feeds

Founder-edited JSON for `.io` and `.org` home pages and `GET /api/v1/curated`.

| File | Site |
|------|------|
| `io-home.json` | ai-transformation.io |
| `org-home.json` | ai-transformation.org |

## Fields

| Field | Used on | Purpose |
|-------|---------|---------|
| `layout` | spotlight, topics, readerPaths | `feature` · `compact` · `topic-row` |
| `image` | optional | Public path e.g. `/curation/hero.webp` (Phase B); until set, UI shows a placeholder |

Edit `readerPaths`, `spotlight`, and `topics` to change home emphasis. Article slugs must exist in `knowledge-base/` (see `packages/content` registry).

Slow cadence is intentional — no CMS required for v1.
