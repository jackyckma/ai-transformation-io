# Wave 18 — Platform depth (orchestrate goal)

**Slug:** `wave18-platform-depth`  
**Ref:** `main` (includes Wave 17 @ `d621b7a`)  
**Authoritative spec:** [SITE_DESIGN_v2.md](../SITE_DESIGN_v2.md) §9–§11 (Phase 4 deferrals), §6 contextual actions

**Prerequisites (met):** Waves 11–17 ✅ · Phase 2 community API + matcher (Wave 14) ✅ · Rule-based recommendations v2 ✅

---

## Kickoff command

From repo root (after `source .cursor-env`):

```bash
bun /home/jackyma/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave18-platform-depth: Ship SITE_DESIGN_v2 Wave 18 (member-independent platform depth) per SITE_DESIGN_v2.md Phase 4 deferrals. Three pillars — no Stripe/credits, no newsletter archive: (1) LLM-assisted ranking — optional experimental re-rank layer on top of existing rule-based engines when MINIMAX_API_KEY (or CHAT_LLM_*) is configured; graceful fallback to deterministic scores when absent or on LLM error. Backend: extend community matcher POST /api/v1/community/match (and session /api/community/match parity) with optional useLlmRerank flag — take rule-based top candidates, LLM re-order + human-readable reason refresh; add POST /api/v1/personal/rank-suggestions for .io library + .org knowledge/community candidates (accept site, candidate summaries, profile context; return ranked ids + reasons). Reuse chat llm.ts patterns. UI: label Experimental LLM assist; show when rerank applied. Tests mock LLM; prove fallback without key. (2) External agent deep links — shared helper module (new packages/shared/src/wave18-external-agent.ts, avoid editing packages/shared/src/index.ts barrel unless required): build ChatGPT + Claude compose URLs from {title, canonicalUrl, suggestedPrompt, site}. Surface as secondary discreet actions alongside Open in Ask on .io library/article + insights cards and .org knowledge/community detail (not hero CTAs). Add brief /for-agents section documenting deep-link pattern + example URLs. Optional JSON agent hint on detail pages (data attribute or script type application/json) with page url + suggested prompts. (3) Phase 2 intent verb UI parity on .org — backend POST /api/community/actions already supports request_mentor, ask_for_intro, apply; wire API client + UI so Phase 2 verbs are real persisted actions (with optional short body modal), not Ask-prefill-only. Extend useCommunityInteractions or dedicated hook; detail page ActiveActions shows API buttons for offer_help, request_mentor, ask_for_intro, apply per getCommunityActions() from wave13-community taxonomy; keep Ask draft links as secondary where appropriate. Community list/highlights cards: use getCommunityActions not stale COMMUNITY_TYPE_VERBS Phase-1-only map; show type labels + primary verb affordance for Phase 2 types (question, mentorship_request, project_request, collaboration_offer, apprenticeship_opportunity). Reply affordance for question type. (4) Docs: update docs/CURRENT_STATUS.md, docs/SESSION_HANDOFF.md, SITE_DESIGN cross-ref if needed. Run pnpm turbo build and pnpm --filter @ai-transformation/backend test. Open ONE draft PR to main. English UI."
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

---

## Scope

### In scope

| Lane | Work |
|------|------|
| L2 Backend | LLM re-rank for matcher + personal rank-suggestions; reuse `chat/llm.ts` |
| L11 Agent API | `/api/v1/community/match` + `/api/v1/personal/rank-suggestions` parity |
| L0 Shared | `wave18-external-agent.ts` deep-link builders; match/rank request schemas if needed |
| L8 web-io | External deep links on library/insights; optional LLM-ranked dashboard labels |
| L9 web-org | Deep links on knowledge/community; Phase 2 verb API wiring on list + detail |
| Docs | CURRENT_STATUS, SESSION_HANDOFF, /for-agents deep-link section |

### Out of scope

- Agent credits / Stripe (Wave 19+)
- Newsletter public archive
- Full forum / function-primary nav
- Replacing rule-based engine entirely (LLM is optional assist layer only)
- Deploying external ChatGPT/Claude integrations beyond URL deep links

---

## Suggested orchestrate task tree

| Task | Branch | Notes |
|------|--------|-------|
| backend-wave18 | `orch/wave18-platform-depth/backend-wave18` | LLM rerank + rank-suggestions + tests |
| web-wave18 | `orch/wave18-platform-depth/web-wave18` | Deep links + Phase 2 verb UI (.io + .org) |
| integrate-wave18 | `orch/wave18-platform-depth/integrate-wave18` | Merge + draft PR |
| verify-wave18 | verifier | build + tests + fallback + action wiring proof |

---

## Definition of done

1. Matcher and personal suggestions support optional LLM re-rank with deterministic fallback; UI labels experimental.
2. Library/knowledge/community detail pages offer discreet ChatGPT + Claude deep links plus existing Ask actions.
3. Phase 2 community verbs (`request_mentor`, `ask_for_intro`, `apply`, `offer_help`) persist via API on detail + visible on list cards where appropriate.
4. `getCommunityActions()` drives UI taxonomy (no Phase-1-only verb map drift).
5. `pnpm turbo build` 6/6; backend tests pass.
6. One draft PR; merge per founder default after review.

---

## Notes

- **Quota-only** agent reads unchanged; LLM calls are server-side for signed-in personalization/matching only.
- Deep links open third-party UIs; user copies context — no OAuth to OpenAI/Anthropic.
