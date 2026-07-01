---
name: orbiter-handoff
description: >-
  On-demand Orbiter–AT dogfood handoff only. Use when the user explicitly asks
  to check handoff, poll Orbita inbox, read/write ~/Orbiter-AT-dogfood, or
  process cross-project Orbita questions — NOT on every turn or session start.
---

# Orbiter–AT dogfood handoff (on-demand)

Async cross-repo inbox between **Orbita** and **ai-transformation-io**. Folder: `/home/jackyma/Orbiter-AT-dogfood` (local, not in git).

## When to use

**Only when the user explicitly requests**, e.g.:

- 「檢查 handoff」「poll Orbita」「處理 Orbiter-AT-dogfood」
- 「Read Orbiter-AT-dogfood」「reply in at-to-orbita」
- User pastes the handoff follow-up prompt from a prior session

## When NOT to use

- **Do not** read or write this folder at session start, session end, or every agent turn.
- **Do not** auto-poll because work mentions Orbita, L12, editorial supply, or `.editorial-orbita/` — those are in-repo; dogfood inbox is separate.
- **Do not** run unless the user asked in this conversation (or a stop hook injected the exact handoff follow-up — hook is disabled by default).

## Workflow (AT agent)

1. Read `~/Orbiter-AT-dogfood/state/STATUS.md`.
2. Read `~/Orbiter-AT-dogfood/inbox/orbita-to-at/` — files with `status: open`, or new since last user-requested poll (skip `TEMPLATE-*`).
3. If questions need answers: write a **new** file to `~/Orbiter-AT-dogfood/inbox/at-to-orbita/` per `PROTOCOL.md` (matching topic slug; do not overwrite question files).
4. Update `~/Orbiter-AT-dogfood/state/STATUS.md` (`Last updated`, inbox counts, blockers).
5. Summarize for the user in **繁體中文** (brief).
6. Mirror durable contracts into this repo (`docs/orbita-*.md`) only when the answer is long-lived — optional.

## Routine poll (no new Orbita questions)

If inbox is all `done` and user asked for a check anyway:

- Write `inbox/at-to-orbita/YYYY-MM-DD-inbox-poll-N-at.md` with production spot-check (catalog count, deploy, blockers).
- Update `STATUS.md`.

## Guardrails

- No secrets in handoff files (keys, tokens, cookies).
- One topic per file; frontmatter per `PROTOCOL.md`.
- Cloud agents may not see `~/Orbiter-AT-dogfood` unless workspace includes it — note limitation if folder missing.

## Manual CLI (optional)

```bash
# Summary only — does not trigger agent
~/Orbiter-AT-dogfood/scripts/handoff-summary.sh
```
