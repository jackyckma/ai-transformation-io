# Editorial review rubric (Wave 19 agent + human)

**Applies to:** Orbita / L11 drafts on `/editorial` (knowledge + community objects)  
**Not for:** Curated home JSON (`data/curated/EDITORIAL_POLICY.md`)

Agent review is **advisory only** — human approve/reject remains authoritative. Auto-approve is **not** enabled (founder TBD after calibration).

Code: type profiles in `packages/shared/src/editorial-review-profiles.ts`; LLM prompt in `apps/backend/src/lanes/editorial-supply/review.ts`.

---

## Priority: substance over style

Do **not** reject or down-rank for polished AI prose alone. **Writing style is not the bar.**  
Focus on whether the piece earns publication for **its type**.

De-prioritize: tone polish, “on-brand voice”, length unless extreme padding.

---

## Step 0 — Platform gatekeeper (all types)

We are **not** a vendor marketplace. **Reject** drafts that read like scraped marketing or product brochures.

| Flag | Meaning |
|------|---------|
| `vendor-marketing` | Promotes a company/product/service as a pitch |
| `product-pitch` | Named product or “our platform/solution” without editorial distance |
| `promotional-copy` | Brochure tone, feature lists, pricing, CTAs |

Also block on technical failures: `ai-artifact`, `inconsistent`.

If gatekeeper flags fire, founder should **reject** (or demand a full rewrite stripping promo language).

---

## Review profiles by submission type

The agent and `/editorial` UI apply a **profile** per `objectType` + `type`. Bands below use `substance_score` (5–15).

| Profile | Types | Bar | Strong ≥ | Caution ≥ |
|---------|-------|-----|----------|-----------|
| **Knowledge article** | `knowledge` / `article` | High — claims, mechanism, stance | 10 | 6 |
| **Field note** | `knowledge` / `field_note` | Medium — short observation OK | 8 | 5 |
| **Derived article** | `knowledge` / `derived_article` | Medium-high — coherent synthesis | 9 | 6 |
| **Community discussion** | `community` / `discussion` | Light — question or observation OK; agent clears most | 7 | 5 |
| **Help request** | `community` / `help_request` | Light — problem context clear | 6 | 4 |
| **Announcement** | `community` / `community_announcement` | Factual — who/what/when | 6 | 4 |
| **Community default** | other community types | Light-medium | 7 | 5 |

**Founder default trap:** applying the knowledge-article bar to every draft. Discussions do **not** need essay-length falsifiable stance.

---

## Technical failure modes (blockers)

| Flag | Meaning |
|------|---------|
| `ai-artifact` | Garbled text, unrelated sentences, obvious generation glitches |
| `inconsistent` | Internal contradiction (claims conflict within the draft) |
| `logic-gap` | Non sequitur; paragraphs lack logical dependency (shuffle test fails) |

**Shuffle test:** If paragraph order were randomized, would a careful reader notice? If not, flag `logic-gap` or `argument-incoherence`.

---

## Substance failure modes (knowledge-heavy)

### 1. Low claim density

Atmosphere sentences with zero information.  
Flag: `low-claim-density`

### 2. Specificity gap

Concept-level buzzwords without mechanism, case, or data.  
Flag: `specificity-gap`

### 3. Argument incoherence

Paragraphs feel connected but do not depend on each other.  
Flag: `argument-incoherence`

---

## Editorial principles (knowledge profiles)

| Principle | Question | Flag if failed |
|-----------|----------|----------------|
| **So what?** | Does the reader’s judgment change? | `padding` |
| **Falsifiability** | Disagreeable claims? | `consensus-only` |
| **Specificity ladder** | Abstract → mechanism → example? | `specificity-gap` |
| **Stranger test** | Vague meme swap still “works”? | `stranger-test-fail` |
| **First-hand stance** | Author judgment or experience? | `no-first-hand` |

Community **discussion** profiles score stance/first-hand leniently.

---

## Substance score (5 × 1–3 = 5–15)

Score each dimension **1 (weak) · 2 (adequate) · 3 (strong)**:

| Dimension | 1 | 3 |
|-----------|---|---|
| **claim_density** | Mostly atmosphere | Verifiable claim per major section |
| **specificity** | Concept layer only | Mechanism / case / data supports claims |
| **argument_coherence** | Order interchangeable | Clear logical dependency |
| **falsifiable_stance** | All consensus | At least one debatable position |
| **first_hand** | Second-hand summary | Author judgment or lived observation |

Map to queue **`score` (0–100)** for sorting: `round(substance_score / 15 × 100)`.

Use **profile-specific bands** (table above), not one global 10/6 cut.

---

## Agent output contract

```json
{
  "substance_score": 12,
  "dimensions": { "...": 2 },
  "score": 80,
  "flags": ["padding"],
  "summary": "One or two sentences for the founder queue.",
  "review_profile": "knowledge_article"
}
```

`review_profile` is set server-side from the draft type. `flags` use kebab-case from tables above.

---

## Human workflow

1. Orbita / agent submits draft → `/editorial`
2. Optional **Run agent review** → `metadata.editorial_agent`
3. Founder reads type bar + gatekeeper flags + **View full article**
4. Approve / reject with optional `editorial_comment` for the submitting agent
