# Claude Coding Guidelines

These instructions apply to **Claude Code** and **Claude cloud** sessions.

## Core instructions (always loaded)

@.agents/instructions/karpathy-guidelines.md

@.agents/instructions/judgment-rubrics.md

@.agents/instructions/project-guidelines.md

@.agents/instructions/agent-tooling-guardrails.md

## Everything else — load by trigger

Read **`.agents/README.md`** for the file → trigger map: decision-authority
(decisions, batched briefs), session-handoff (pause/resume),
model-orchestration (subagent dispatch), autonomous-loop (unattended runs),
cursor-autopilot (optional Maker/Checker), issue-quality (writing issues),
framework-adoption (methodology sync), lane-based-development (lane projects).

The three entry points (`AGENTS.md`, `CLAUDE.md`,
`.cursor/rules/shared-instructions.mdc`) must name the **same** core list;
if you change one, change all three.

## Session resume

When **resuming** work, read `docs/SESSION_HANDOFF.md` first, then **`docs/SITE_DESIGN_v2.md`** for product/IA work.

## Cloud bootstrap

Run `bash scripts/setup-cloud-agent-env.sh` when starting a Claude cloud session if the script exists.

## Project-specific notes

Add Claude-only notes below when needed — keep shared behavior in `.agents/instructions/`.

## Zeabur Deployment

- Project ID: `6a33221c7cea1559991a43e5`
- Service ID: `6a3322239a194960c7edec34`
- Server: Ocean (`178.104.245.43`)
- URL: https://ai-transformation.zeabur.app
- Infra details: `docs/INFRA_SETUP.md`
