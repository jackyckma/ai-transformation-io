# Editorial review rubric (Wave 19 agent + human)

**Applies to:** Orbita / L11 drafts on `/editorial` (knowledge + community objects)  
**Not for:** Curated home JSON (`data/curated/EDITORIAL_POLICY.md`)

Agent review is **advisory only** — human approve/reject remains authoritative. Auto-approve is **not** enabled (founder TBD after calibration).

---

## Priority: substance over style

Do **not** reject or down-rank for polished AI prose alone. **Writing style is not the bar.**  
Focus on whether the piece earns publication: information, mechanism, stance, and coherence.

De-prioritize: tone polish, “on-brand voice”, length unless extreme padding.

---

## Technical failure modes (blockers)

Check before substance scoring:

| Flag | Meaning |
|------|---------|
| `ai-artifact` | Garbled text, unrelated sentences, obvious generation glitches |
| `inconsistent` | Internal contradiction (claims conflict within the draft) |
| `logic-gap` | Non sequitur; paragraphs lack logical dependency (shuffle test fails) |

**Shuffle test:** If paragraph order were randomized, would a careful reader notice? If not, flag `logic-gap` or `argument-incoherence`.

---

## Substance failure modes

### 1. Low claim density

Atmosphere sentences with zero information.  
**Test:** If the sentence were false, could you cite a counterexample? If not, it may be empty.

Example (empty): “AI is transforming how enterprises operate.”  
Example (claim): “Early ROI often comes from removing human handoff points, not from novel AI use cases.”

Flag: `low-claim-density`

### 2. Specificity gap

Concept-level buzzwords carry the piece without mechanism, case, or data.  
**Test:** Hide adjectives/adverbs — does the skeleton still say something?

Watch for hollow load-bearing terms: *empower, reshape, ecosystem, holistic integration* — fine as garnish, fatal as structure.

Flag: `specificity-gap`

### 3. Argument incoherence

Paragraphs feel connected but do not depend on each other.  
Flag: `argument-incoherence`

---

## Editorial principles (checklist)

| Principle | Question | Flag if failed |
|-----------|----------|----------------|
| **So what?** | After each section: does the reader’s judgment or action change? | `padding` |
| **Falsifiability** | Are there claims someone could disagree with? | `consensus-only` |
| **Specificity ladder** | Does the draft move abstract → mechanism → example/data → back? | `specificity-gap` |
| **Stranger test** | Swap “AI transformation” for another vague change meme — still “works”? | `stranger-test-fail` |
| **First-hand stance** | Author judgment, experience, or a clear “X is wrong” — not only safe middle? | `no-first-hand` |

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

**Sum → `substance_score`**

| Total | Guidance |
|-------|----------|
| **10–15** | Has substance — worth publishing (may still need light edit) |
| **6–9** | Skeleton OK — needs substantial enrichment |
| **≤5** | Rewrite likely faster than patch |

Map to queue **`score` (0–100)** for sorting: `round(substance_score / 15 × 100)`.

---

## Agent output contract

See `apps/backend/src/lanes/editorial-supply/review.ts` — JSON only:

```json
{
  "substance_score": 12,
  "dimensions": {
    "claim_density": 2,
    "specificity": 3,
    "argument_coherence": 2,
    "falsifiable_stance": 2,
    "first_hand": 3
  },
  "score": 80,
  "flags": ["padding"],
  "summary": "One or two sentences for the founder queue."
}
```

`flags` use kebab-case from tables above; add free-text only when necessary.

---

## Human workflow

1. Orbita / agent submits draft → `/editorial`
2. Optional **Run agent review** → `metadata.editorial_agent`
3. Founder reads **View full article** + agent summary
4. Approve / reject — agent never changes publish state
