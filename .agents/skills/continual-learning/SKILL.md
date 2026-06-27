---
name: continual-learning
description: Run incremental AGENTS.md memory updates via agents-memory-updater; keep user-facing replies ≤300 words.
---

# Continual learning (project)

Keep `AGENTS.md` learned sections current without verbose run reports.

## When to use

- User asks to mine chats / update agent memory / run continual learning
- Stop hook injects a follow-up to run this skill

## Workflow

1. Read `.agents/instructions/continual-learning.md` (output contract — **required**).
2. Call **`agents-memory-updater`** with incremental index:
   `.cursor/hooks/state/continual-learning-index.json`
3. Reply to the user per the contract (**≤300 words**, 繁體中文).

## Guardrails

- Parent: orchestration + brief summary only; no transcript mining.
- Subagent: owns `AGENTS.md` + index updates.
- If no durable updates: respond exactly `No high-signal memory updates.`
