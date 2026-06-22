# Curation analytics (planned)

**Status:** Not implemented — design note for semi-automatic home curation.

## Goal

Track which curated tiles and spotlight articles drive meaningful engagement, so the system can **suggest** home grid changes and a founder approves via PR (same process as `.agents/skills/curated-home-refresh/`).

## v1 signals (proposed)

| Signal | Source | Use |
|--------|--------|-----|
| Tile click | `data-curation-id` on home grid links | Relative popularity of entry points |
| Article read | Agent API content reads + human page views | Depth after click |
| Companion → link follow | Chat message link metadata | Which topics companion surfaces work |
| Assessment start | `/assessment` funnel | Secondary path uptake |

## Semi-auto workflow

1. Weekly job aggregates click/read counts per `curation-id` and slug.
2. Agent proposes diff to `data/curated/io-home.json` / `org-home.json` (swap spotlight or reorder `homeTiles`).
3. Founder reviews PR — no silent auto-publish.

## Implementation defer

- Backend: `content_events` table or lightweight analytics endpoint.
- Frontend: optional beacon on home tile click (respect cookie/consent when newsletter launches).
- Do not block current home grid — `data-curation-id` attributes are already on tiles for future wiring.
