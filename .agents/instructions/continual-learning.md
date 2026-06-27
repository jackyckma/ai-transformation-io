# Continual learning — output contract

Applies when the user asks to run continual learning, or when a **stop hook** injects a follow-up to run the `continual-learning` skill / `agents-memory-updater` subagent.

## Parent agent reply (after subagent finishes)

**Hard limit: 300 words** (繁體中文). Count includes headings; exclude code fences and file paths.

### If nothing durable to merge

Respond **exactly**:

```text
No high-signal memory updates.
```

No preamble, no index stats, no “processed transcript X”.

### If `AGENTS.md` changed

Use this shape only (still ≤300 words total):

1. **One sentence** — outcome (e.g. 已更新 AGENTS.md 的 Learned 區塊).
2. **At most 3 short bullets** — net-new or materially changed themes only (not every bullet diff).
3. **Optional one line** — whether index JSON was refreshed; no path dumps.

Do **not**:

- List every edited bullet verbatim
- Paste diffs or long AGENTS.md excerpts
- Recap the full continual-learning workflow
- Ask to commit unless the user cares about git state in that turn

## Subagent (`agents-memory-updater`) return to parent

**Hard limit: 150 words** in English or 繁體中文.

Return only: `{ updated: true|false, preferencesDelta: string[], factsDelta: string[] }` as short phrases, or the exact no-update sentence above. Parent owns the user-facing ≤300-word summary.

## Workflow (unchanged)

1. Delegate to `agents-memory-updater` (incremental index at `.cursor/hooks/state/continual-learning-index.json`).
2. Do not mine transcripts in the parent turn.
3. Apply this output contract before replying to the user.
