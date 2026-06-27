# Wave 21 — .org UI P1 polish (orchestrate goal)

**Slug:** `wave21-ui-p1-org-polish`  
**Ref:** `main` @ Wave 19 merge (`50dc77f`)  
**Founder lock:** [FOUNDER_WAVE_DECISIONS.md](../FOUNDER_WAVE_DECISIONS.md) D4 — ship deferred Wave 19 .org P1 items

**Prerequisites (met):** Wave 19 ✅ · Wave 15 UI audit P1 backlog partially shipped on .io in Wave 19

---

## Kickoff command

From repo root (after `source .cursor-env`):

```bash
bun /home/jackyma/.cursor/plugins/cache/cursor-public/orchestrate/e46364b8be46000b7df0f260550cd712afbb8d36/skills/orchestrate/scripts/cli.ts kickoff \
  "wave21-ui-p1-org-polish: Ship Wave 21 .org UI P1 polish per FOUNDER_WAVE_DECISIONS.md D4 — complete Wave 19 deferred .org pillar-5 only. Scope: (1) knowledge-object-view — add secondary More in Knowledge footer with up to 4 sibling entries (same pillar/type first), exclude current article, derive from existing knowledge index/object list patterns on .org (no new backend). (2) Inline Followed confirmation on follow/unfollow affordances — match .io save-to-context pattern from Wave 19 (brief check then persistent Followed state; useCommunityInteractions). (3) Optional: same inline confirmation on community save/bookmark if same component path. English UI; editorial tone; light default + dark toggle. Run pnpm --filter @ai-transformation/web-org build + typecheck. Update docs/CURRENT_STATUS.md + SESSION_HANDOFF.md. Open ONE draft PR to main." \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

---

## Scope

### In scope

| Lane | Work |
|------|------|
| L9 web-org | `More in Knowledge` footer on knowledge detail |
| L9 web-org | Inline Followed confirmation (follow hook / community cards) |
| Docs | CURRENT_STATUS, SESSION_HANDOFF |

### Out of scope

- Backend changes
- .io changes (already shipped Wave 19)
- Newsletter archive · credits · editorial auto-approve

---

## Definition of done

1. Knowledge detail shows related Knowledge links footer (secondary, not hero).
2. Follow action shows brief inline confirmation consistent with .io Saved pattern.
3. `pnpm --filter @ai-transformation/web-org` build + typecheck pass.
4. One draft PR to main.

---

## Suggested task tree

| Task | Branch |
|------|--------|
| web-org-wave21 | `orch/wave21-ui-p1-org-polish/web-org-wave21` |
| integrate-wave21 | merge + PR |
| verify-wave21 | verifier |
