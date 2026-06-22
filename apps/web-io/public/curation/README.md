# Curation cover images

Topic-level abstract covers for curated home cards (not per-article news photos).

- Generated via `node scripts/generate-curation-covers.mjs` (MiniMax `image-01`; SVG fallback without API key)
- **Separate files per site** — `.io` warm stone/bronze, `.org` moss green (same filenames, different trees)
- Mapped from `data/curated/*.json` `image` fields

Do not add per-article stock photography here — extend this library only when a **new curated topic or path** needs a distinct visual.
