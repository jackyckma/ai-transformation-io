# Wave 19 — Scale & archive (orchestrate goal — **draft only, do not kickoff yet**)

**Slug:** `wave19-scale-archive`  
**Ref:** `main` (after Wave 19 editorial-review merges)  
**Authoritative spec:** [SITE_DESIGN_v2.md](../SITE_DESIGN_v2.md) §11 Phase 4 deferrals, §12 Wave 19+; [EMAIL_NEWSLETTER.md](../EMAIL_NEWSLETTER.md)

**Prerequisites:** Wave 18 ✅ · Wave 19 editorial-review ✅ (recommended) · Newsletter pilot sent at least once (Wave 17 ops)

---

## Purpose

Wave 19 is the **scale gate** from SITE_DESIGN_v2 §12: public newsletter archive and agent credits — only after product surface + editorial pipeline are stable.

**Kickoff when:** founder has run ≥1 newsletter pilot send **and** either (a) wants public issue pages, or (b) active registered users approach **~50** (credits threshold).

---

## Scope (planned)

### In scope

| Lane | Work |
|------|------|
| L6 Newsletter | Public `/newsletter/archive` (or `/issues/[slug]`) — read-only issue pages from `newsletter_issues` table; no send changes |
| L6 | RSS/Atom feed for sent issues (optional same wave) |
| L11 Agent protocol | Credits ledger + Stripe top-up **only if** ≥50 active users gate met; otherwise document quota-only and ship archive only |
| L8/L9 | Archive index + issue detail pages on .io (primary) with low-key footer link |
| Docs | CURRENT_STATUS, SESSION_HANDOFF, EMAIL_NEWSLETTER archive section |

### Out of scope

- Editorial-review agent (Wave 19 editorial-review — separate goal)
- Unified agent content index (Wave 19 editorial-review — separate goal)
- Full Stripe billing UI before user gate
- Auto-approve editorial drafts
- Discourse / function-primary nav

---

## Suggested orchestrate task tree (when kicked off)

| Task | Branch | Notes |
|------|--------|-------|
| backend-wave19-scale | `orch/wave19-scale-archive/backend-wave19-scale` | Archive routes + optional credits schema |
| web-wave19-scale | `orch/wave19-scale-archive/web-wave19-scale` | .io archive pages + footer link |
| integrate-wave19-scale | `orch/wave19-scale-archive/integrate-wave19-scale` | Merge + draft PR |
| verify-wave19-scale | verifier | build + tests + archive smoke |

---

## Definition of done (when implemented)

1. Sent newsletter issues browsable on public archive URLs without admin session.
2. Subscribe/unsubscribe/send paths unchanged and still admin-gated.
3. If user count < 50: no Stripe; agent reads remain quota-only; PR states gate explicitly.
4. If user count ≥ 50: credits top-up MVP documented + wired (separate acceptance — founder decides at kickoff).
5. `pnpm turbo build` 6/6; backend tests pass.
6. One draft PR; merge per founder default after review.

---

## Kickoff command (hold until prerequisites)

```bash
# Do NOT run until editorial-review shipped + pilot send done.
bun ~/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave19-scale-archive: …" \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

(Fill goal string at kickoff time with current `main` SHA and user-count gate decision.)

---

## Notes

- **Newsletter pilot ops** (Wave 17) is human/founder work — not blocked on this wave doc.
- Orbita AT1b volume continues in parallel; archive wave does not change `objects/drafts` contract.
