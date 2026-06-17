# Site Architecture Recommendations

> Internal technical and content structure ideas for ai-transformation.io

## MVP Site Structure

Start lean. Seven cornerstone pages + blog. Expand based on traffic and engagement data.

```
ai-transformation.io/
├── /                           → Hero + value prop + three gaps overview
├── /what-is-ai-transformation  → Definitive explainer (SEO cornerstone)
├── /roadmap                    → Interactive or visual 7-stage roadmap
├── /governance                 → Autonomy ladder + accountability framework
├── /measure-value              → RoA vs ROI + measurement playbook
├── /use-cases                  → Industry/function use case hub
├── /resources                  → Downloads, checklists, frameworks
├── /blog                       → Articles tagged by pillar
├── /about                      → Mission, team, contact
└── /newsletter                 → Email capture + archive
```

## Page Priorities

### Tier 1 — Launch (Week 1–2)
| Page | Goal | Primary Keyword Target |
|------|------|----------------------|
| Homepage | Position + convert to newsletter | "AI transformation" |
| What is AI Transformation | SEO cornerstone, education | "what is AI transformation" |
| Roadmap | Practical value, shareable | "AI transformation roadmap" |
| About | Trust + contact | Brand queries |

### Tier 2 — Month 1
| Page | Goal | Primary Keyword Target |
|------|------|----------------------|
| Governance | Thought leadership | "AI governance operating model" |
| Measure Value | Differentiated framing | "AI ROI measurement" / "return on autonomy" |
| Use Cases hub | Long-tail SEO | "AI transformation use cases" |
| Blog (5–10 posts) | Organic traffic engine | Various long-tail |

### Tier 3 — Month 2–3
| Page | Goal |
|------|------|
| Resources / downloads | Lead magnets |
| Glossary | SEO + internal linking hub |
| FAQ | Featured snippets |
| Assessment tool | Interactive engagement + email capture |

## Homepage Structure

```
[Hero]
  Headline: "Close the gap between AI deployment and AI transformation"
  Subhead: Practical frameworks for leaders redesigning work, governance, and value measurement
  CTA: Subscribe to newsletter | Explore the roadmap

[Three Gaps Section]
  Cards: Work Redesign | Governance | Value Measurement
  Each links to dedicated content

[Framework Preview]
  Visual: 7-stage transformation roadmap (simplified)
  CTA: See the full roadmap

[Social Proof / Stats]
  "48% added AI without redesigning workflows" (Deloitte)
  "Only 25% of companies find real AI value" (BCG)

[Latest Articles]
  3 recent blog posts

[Newsletter CTA]
  "Weekly transformation insights for enterprise leaders"

[Footer]
  Links, social, contact
```

## Blog Taxonomy

Tag every post with one **pillar** and one **audience level**:

**Pillars:** Understand | Assess | Plan | Execute | Govern | Measure | Patterns

**Audience:** Executive | Practitioner | Technical

**Formats:**
- Framework guides (evergreen, cornerstone)
- Research syntheses (timely, citable)
- Case patterns (anonymized, practical)
- Opinion / contrarian takes (engagement)
- Checklists and playbooks (downloadable)

## Technical Stack Recommendations

Given domain on Cloudflare (`.env` has Cloudflare token), lean toward edge-first:

### Option A: Static + Edge (Recommended for MVP)
- **Astro** or **Next.js** (static export) for content site
- **Cloudflare Pages** for hosting
- **MDX** for blog/content with components
- **Tailwind CSS** for styling
- Fast, cheap, SEO-friendly, easy to deploy

### Option B: Full Next.js on Cloudflare
- Next.js on Cloudflare Workers/Pages
- Good if you want API routes for newsletter, assessments later

### Option C: Headless CMS
- **Sanity**, **Contentful**, or **Keystatic** (git-based)
- Add when non-technical editors need to publish

### Newsletter
- **Buttondown**, **ConvertKit**, or **Resend + custom**
- Start simple; email is primary growth channel

### Analytics
- **Plausible** or **Cloudflare Web Analytics** (privacy-friendly)
- Track: newsletter signups, roadmap page time, resource downloads

## SEO Strategy

### Cornerstone Content (target 2,000–4,000 words each)
1. What is AI Transformation
2. AI Transformation Roadmap (7 stages)
3. AI Transformation vs Digital Transformation
4. AI Governance Operating Model
5. How to Measure AI ROI / Return on Autonomy

### Internal Linking Hub
- Glossary page links to all defined terms
- Every blog post links to 1 cornerstone + 1 related post
- Roadmap page links to stage-specific deep dives

### Schema Markup
- `Organization` on homepage
- `Article` on blog posts
- `FAQPage` on FAQ
- `HowTo` on roadmap/playbook pages

## Interactive Tools (Phase 2)

| Tool | Purpose | Complexity |
|------|---------|------------|
| AI Readiness Quiz | Email capture + engagement | Medium |
| Autonomy Maturity Self-Assessment | Governance pillar | Medium |
| Three Gaps Diagnostic | Proprietary framework | Medium |
| ROI vs RoA Calculator | Measurement pillar | High |
| Use Case Prioritization Matrix | Planning pillar | Low (downloadable) |

Start with downloadable PDFs/checklists; build interactive versions when traffic justifies dev time.

## Design Direction

- **Clean, editorial** — Think BCG/Deloitte insight pages, not startup landing page
- **Dark mode option** — `.io` audience expects it
- **Framework visuals** — Maturity ladders, roadmaps, comparison tables
- **Minimal animation** — Professional, fast
- **Typography-forward** — Strong hierarchy, readable long-form

Avoid: gradient-heavy AI slop aesthetics, robot illustrations, purple-on-dark clichés.

## Content Workflow

```
Research (knowledge-base/) → Draft (MDX) → Review → Publish → Promote (newsletter/social)
```

Keep `knowledge-base/` as the source of truth for website content. Site pages synthesize and link to deeper KB articles.

## Launch Checklist

- [ ] Domain DNS on Cloudflare
- [ ] 4 cornerstone pages live
- [ ] 5 blog posts published
- [ ] Newsletter signup working
- [ ] Basic analytics
- [ ] Open Graph / social cards
- [ ] Sitemap + robots.txt
- [ ] 404 page
- [ ] Privacy policy (required for email capture)

## Metrics to Track (First 90 Days)

| Metric | Target |
|--------|--------|
| Newsletter subscribers | 200+ |
| Organic sessions/month | 1,000+ |
| Avg time on cornerstone pages | 3+ min |
| Pages per session | 2+ |
| Resource downloads | 50+ |
