---
name: curated-home-refresh
description: Propose curated home JSON changes for .io/.org per EDITORIAL_POLICY — founder approves PR. Load before editing data/curated/*.json.
---

# Curated home refresh

Propose changes to `data/curated/io-home.json` and `org-home.json` — **do not merge without founder approval**.

## Required reading

1. `data/curated/EDITORIAL_POLICY.md`
2. `docs/POSITIONING-UX.md` (CTA priority, dedup, .org share-first)

## Workflow

1. Read current JSON + policy dedup rules.
2. Draft minimal diff (usually 1–3 fields: spotlight, path order, `editorNote`, or `updatedAt`).
3. Verify every `articleSlugs` / `anchorSlug` / `spotlight.slug` exists in `knowledge-base/` or org learn registry (`packages/content`).
4. Open PR with:
   - **Rationale** (one paragraph — why now, what metric it serves)
   - **Dedup checklist** — confirm no slug collision across slots
   - **Screenshots** optional — home layout if visual change is large
5. Stop — founder merges.

## Constraints

- Do not add CMS or dynamic feeds in v1.
- Do not move Assessment to spotlight on .io.
- .org: Share path before Learn in `readerPaths` array order.
- Update `updatedAt` to change date (ISO `YYYY-MM-DD`).

## Verify

```bash
pnpm --filter @ai-transformation/content build  # if types touched
pnpm --filter @ai-transformation/web-io build
pnpm --filter @ai-transformation/web-org build
curl -s "http://localhost:3001/api/v1/curated?site=io" | head
```

## Anti-patterns

- Duplicating cornerstone across spotlight + reader path
- Rotating spotlight weekly (too fast for brand)
- Auto-merging agent proposals without human review
