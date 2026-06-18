# L7 — Content INTERFACE

## Purpose
MDX/markdown loading from `knowledge-base/` for web-io. Build-time content pipeline.

## Owns
- `packages/content/**`
- Content sync scripts (when added)

## Provides
- `getPage(slug)`, `getAllPages()` for web-io
- Frontmatter parsing (title, description, pillar)

## Consumes
| Lane | Contract |
|------|----------|
| — | Reads `knowledge-base/*.md` at build time |

## Wave
1

## Verification
- web-io builds with imported pages
