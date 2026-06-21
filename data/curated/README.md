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
| `image` | optional | Public path e.g. `/curation/cornerstone.jpg` — topic-level covers in `apps/web-*/public/curation/` (reused across slots; not per-article photos) |

## Topic cover library (Phase B)

Reusable abstract covers — **by curated topic/path**, not per knowledge-base article.

| File | Used for |
|------|----------|
| `cornerstone.jpg` | Spotlight (both sites) |
| `three-gaps.jpg` | .io topic |
| `roadmap.jpg` | .io topic |
| `harvest-stories.jpg` | .org topic |
| `apprenticeship.jpg` | .org topic + apprenticeship path |
| `path-governance.jpg` | Lead / learn reader paths |
| `path-playbook.jpg` | Implement path |
| `path-explore.jpg` | Explore path |
| `path-share.jpg` | Share path |

Regenerate (MiniMax `image-01`, SVG fallback if no key): `node scripts/generate-curation-covers.mjs`

Assets are duplicated under both `apps/web-io/public/curation/` and `apps/web-org/public/curation/`.

Edit `readerPaths`, `spotlight`, and `topics` to change home emphasis. Article slugs must exist in `knowledge-base/` (see `packages/content` registry).

Slow cadence is intentional — no CMS required for v1.
