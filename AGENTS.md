# Agent Instructions (Codex / OpenAI coding agents)

Read **`.agents/instructions/`** before non-trivial work:

1. [METHODOLOGIES.md](https://github.com/jackyckma/ai-dev-methodologies/blob/main/METHODOLOGIES.md) — or local copy if vendored
2. `.agents/instructions/karpathy-guidelines.md`
3. `.agents/instructions/project-guidelines.md`
4. `.agents/instructions/agent-tooling-guardrails.md`
5. `.agents/instructions/session-handoff.md` — when resuming or ending a session
6. `.agents/instructions/framework-adoption.md` — when bootstrapping or syncing methodology

When **resuming**, read `docs/SESSION_HANDOFF.md` first.

Optional: `.agents/instructions/lane-based-development.md` for multi-module products.

Do not duplicate long policy here — keep this file a thin pointer.

## Git workflow

Branch from **`main`**, open PR to **`main`**, unless `project-guidelines.md` states otherwise.

## Cloud Agent sessions

Run `scripts/setup-cloud-agent-env.sh` if present, then `scripts/agent-verify.sh` before handoff.

See `docs/AGENT_ENV.md` for local vs cloud capability matrix.

## Learned User Preferences

- v1 authentication: Google OAuth only (no magic link).
- Assessment: 30+ questions using the Three Gaps framework, not a shorter MVP quiz.
- Defer newsletter on both sites until agent automation can reduce manual curation; plan separate newsletters per domain when launched.
- Defer prominent consultancy CTAs until assessment is mature; use low-key contact or comment forms first; no schedule-call booking in early versions.
- Prefer Harvest Hub contribution model over a self-hosted discussion forum for .org.
- .org community: public read, login required to post.
- Site UI language: English-only; light theme default with dark mode toggle.
- .io content organized by job function; .org content is community-oriented and not necessarily by function.
- Research output: internal strategy in `usr/`, public website ideas in `knowledge-base/`.
- Design infrastructure to support a future newsletter and switchboard workflow before launching newsletter.
- Use Zeabur skills for Zeabur deploy and instance management.
- Default to commit and push to `main` for deploy until production stage; no extra approval needed for commit/push.

## Learned Workspace Facts

- ai-transformation.io is corporate-facing; ai-transformation.org is community "learn together" positioning.
- Both domains share one Zeabur combined service with separate Next.js frontends (`web-io`, `web-org`).
- Remove legacy DNS records (e.g. `dev.ai-transformation.io`) except email-routing-related entries.
- Development follows lane-based architecture with wave milestones.
- L6 Switchboard lane handles newsletter reply ingestion when newsletter launches.
- Backend stays host-agnostic; host-based routing lives only in `apps/combined`.
- Monorepo is structured for a future split: standalone `apps/backend`, `web-io`, `web-org`; shared code in `packages/shared`.
