# Wave 15 — Production UI readiness (orchestrate goal)

**Slug:** `wave15-ui-readiness`  
**Ref:** `main`  
**Authoritative audit:** [UI_READINESS_AUDIT.md](../UI_READINESS_AUDIT.md)

---

## Kickoff command

From repo root (after `source .cursor-env`):

```bash
bun /path/to/orchestrate/scripts/cli.ts kickoff \
  "wave15-ui-readiness: Ship SITE_DESIGN_v2 Wave 15 (production UI readiness) per docs/UI_READINESS_AUDIT.md. Implement P0 polish backlog only — no new backend features, no Orbita, no newsletter. Focus: visible dates/type labels on cards, brand copy pass (remove Harvest Hub/companion legacy strings from user UI), community loading/empty UX with editorial fallback, demote companion chat chrome on list pages to Ask entry, trust footer on both sites. Both web-io and web-org. Run pnpm turbo build; backend tests must still pass. Update docs/CURRENT_STATUS.md when done. Open ONE draft PR to main." \
  --ref main \
  --repo https://github.com/jackyckma/ai-transformation-io \
  --dispatcher-name "Jacky"
```

---

## Scope

### In scope

| Lane | Work |
|------|------|
| L8 web-io | Home, Library, Insights list cards; footer; companion demotion; curated copy |
| L9 web-org | Home, Knowledge, Community list; footer; companion demotion; community empty/loading |
| L7 | `data/curated/*.json` brand string fixes only |
| Docs | `CURRENT_STATUS.md`, `SESSION_HANDOFF.md` light update |

### Out of scope

- L12 editorial supply, Orbita integration (Wave 16)
- Newsletter (Wave 17)
- LLM ranking, deep links (Wave 18)
- Backend API changes except if required for date display (prefer frontend-only)
- Replacing abstract curation covers with stock photography (optional P2 later)

---

## Suggested orchestrate task tree

| Task | Branch prefix | Notes |
|------|---------------|-------|
| shared-foundation | `orch/wave15-ui-readiness/shared-foundation` | Doc pointers only if needed |
| web-io-ui | `orch/wave15-ui-readiness/web-io-ui` | .io P0 items |
| web-org-ui | `orch/wave15-ui-readiness/web-org-ui` | .org P0 items |
| integrate-wave15 | `orch/wave15-ui-readiness/integrate-wave15` | Merge + one draft PR |
| verify-wave15 | verifier | build + grep brand strings |

Workers touch **disjoint trees** (web-io vs web-org + curated JSON).

---

## Definition of done

1. All **P0** items in [UI_READINESS_AUDIT.md](../UI_READINESS_AUDIT.md) implemented or explicitly deferred with reason in PR body.
2. `pnpm turbo build` — 6/6 pass.
3. `pnpm --filter @ai-transformation/backend test` — pass (no regressions).
4. No user-visible “Harvest Hub” / “Harvest companion” in web apps or curated JSON (grep verification).
5. One **draft PR** to `main`; founder review + merge per AGENTS.md orchestrate default.

---

## Exit criteria (manual smoke)

1. `.io` home — dates/types on grid cards; no legacy Harvest branding in tiles.
2. `.org` `/community` — no indefinite “Loading…”; fallback content when API empty.
3. Both sites — footer trust line present.
4. Community/knowledge index — companion reduced to Ask entry pattern per audit.
