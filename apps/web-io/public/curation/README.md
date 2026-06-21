# Curation cover images

Topic-level abstract covers for curated home cards (not per-article news photos).

- Generated via `node scripts/generate-curation-covers.mjs` (MiniMax `image-01`; SVG fallback without API key)
- Same files mirrored on `.io` and `.org` Next.js `public/` trees
- Mapped from `data/curated/*.json` `image` fields

Do not add per-article stock photography here — extend this library only when a **new curated topic or path** needs a distinct visual.
