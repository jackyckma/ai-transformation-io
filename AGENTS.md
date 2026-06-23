# Agent Instructions (Codex / OpenAI coding agents)

Read **`.agents/instructions/`** before non-trivial work:

1. [METHODOLOGIES.md](https://github.com/jackyckma/ai-dev-methodologies/blob/main/METHODOLOGIES.md) — or local copy if vendored
2. `.agents/instructions/karpathy-guidelines.md`
3. `.agents/instructions/project-guidelines.md`
4. `.agents/instructions/agent-tooling-guardrails.md`
5. `.agents/instructions/session-handoff.md` — when resuming or ending a session
6. `.agents/instructions/framework-adoption.md` — when bootstrapping or syncing methodology

When **resuming**, read `docs/SESSION_HANDOFF.md` first, then **`docs/SITE_DESIGN_v2.md`** for product/IA work.

Optional: `.agents/instructions/lane-based-development.md` for multi-module products.

Do not duplicate long policy here — keep this file a thin pointer.

## Git workflow

Branch from **`main`**, open PR to **`main`**, unless `project-guidelines.md` states otherwise.

## Cloud Agent sessions

Run `scripts/setup-cloud-agent-env.sh` if present, then `scripts/agent-verify.sh` before handoff.

See `docs/AGENT_ENV.md` for local vs cloud capability matrix.

## Orchestrate (`/orchestrate`)

- Kickoff uses the orchestrate CLI (`bun cli.ts kickoff` under the Cursor orchestrate plugin `scripts/`). Requires `CURSOR_API_KEY` (personal key — not team key).
- **Do not ask the founder for the key.** Load it from repo-root **`.cursor-env`** (gitignored, same pattern as `.env`): from repo root, `set -a && source .cursor-env && set +a` before kickoff. If kickoff still fails, check that `.cursor-env` defines `CURSOR_API_KEY` — do not paste or commit the value.
- Dispatcher passes the user goal verbatim (e.g. `wave5-harvest: …`); return the cloud root planner URL from kickoff JSON.

## Learned User Preferences

- Human v1 auth: Google OAuth only (no magic link for humans). External consent screen (not Internal); owner uses personal Gmail — Testing mode + test users until Publish; one dedicated GCP project per product. Agent write authorize (L11): email confirmation → reusable bearer token (180-day TTL, refresh without re-email).
- Assessment: 30+ questions using the Three Gaps framework (36 Likert 1–5, agent-drafted from knowledge-base); functional wizard UX with radar results—not article layout; results CTAs provisionally approved pending founder review.
- Defer newsletter on both sites until agent automation can reduce manual curation; design infrastructure for separate per-domain newsletters and switchboard before launch. Defer prominent consultancy CTAs until assessment is mature; use low-key contact or comment forms first; no schedule-call booking in early versions.
- .org Apprenticeship program: separate product line from enterprise .io consulting (AI-era judgment/formation training); public pages use "we" voice (`apprenticeship-overview-EN.md`); founder first-person thesis stays in `usr/13` as internal source.
- .org community: public read, login required to post; prefer Harvest Hub contribution model over a self-hosted discussion forum.
- Site UI language: English-only; light theme default with dark mode toggle. User may converse in Cantonese/Traditional Chinese; agents respond in Traditional Chinese per project-guidelines; docs and code stay English.
- .io IA (v2, Wave 11+): **Library · Insights · Ask** ribbon; public Library + Insights; logged-in personal cockpit — see `docs/SITE_DESIGN_v2.md`. **Until Wave 11 ships:** legacy `/frameworks`, `/playbook`, `/functions` remain live.
- .org IA (v2): **Knowledge · Community · Ask**; brand **Community · Knowledge commons**. **Until Wave 11:** legacy `/learn`, `/stories` remain live.
- Curation: agent proposes `data/curated/*.json` → founder approves PR; see `data/curated/EDITORIAL_POLICY.md`.
- Site design: content-first editorial; Ask page with modes (Ask/Capture/Submit/Find Help per site); agent-native contextual actions → on-site Ask prefill; not product-marketing chrome. Mobile: hamburger + bottom ribbon; companion via `/ask` (not persistent sidebar). Distinct .io vs .org color palettes and decoration imagery.
- Enterprise executive info portal: substantive content visible without subscribe; optional subscribe for deeper content later; future newsfeed via RSS and/or agent-curated news.
- After completing shippable work (content, UI, fixes, docs tied to production), default to commit, push to `main`, and Zeabur deploy without asking — unless the user says otherwise, the change is exploratory, or a critical product decision is pending.

## Learned Workspace Facts

- ai-transformation.io — public Library + Insights + personal cockpit (v2); ai-transformation.org — **Community · Knowledge commons** (v2). See `docs/SITE_DESIGN_v2.md`. Production URLs: ai-transformation.io / .org (not `*.zeabur.app`). Apprenticeship remains a special program (`/apprenticeship`).
- Both domains share one Zeabur combined service with separate Next.js frontends (`web-io`, `web-org`).
- Remove legacy DNS records (e.g. `dev.ai-transformation.io`) except email-routing-related entries.
- Lane-based waves: 0–9 production-verified; **SITE_DESIGN_v2 approved** — Wave 11–14 = IA + object model migration with doc/code housekeeping; Wave 10 newsletter pilot optional.
- Product direction: agent-first site — humans and agents are first-class participants; on-site companion (primary human UI; 8 msg/day anonymous, 25/day signed-in; MiniMax-M3 via `MINIMAX_API_KEY`) plus `/for-agents` and embedded machine-readable hints on human pages.
- Agent read tiers (v1 locked): 3/day anonymous, 10/day registered; write token 180-day TTL; .io and .org share one token.
- Cross-domain auth (Wave 4): per-host HttpOnly session cookies via combined `/api` proxy; same Google account maps to one `users` row; second domain needs one-click re-auth (no cross-TLD cookie).
- Assessment shipped: 36 Three Gaps Likert questions, wizard + radar API, save/resume when authenticated. Production runtime: backend and combined use `tsx` (`packages/shared` exports `.ts`); backend `tsc` excludes `*.test.ts`.
- Zeabur deploy: git auto-deploy can stall — use `npx zeabur@latest deploy` if needed. **zbpack must list every deploy package explicitly** (`web-io`, `web-org`, `backend`, `combined`, …); bare `turbo run build` on Zeabur may scope to only `backend` when commits touch `.orchestrate/` only → missing `.next` → 502. Orchestrate `syncStateToGit` commits on `main` trigger these broken deploys before Wave PRs merge. Turbo cache can skip `combined/dist`; zbpack uses `--force`; combined starts via `tsx src/start.ts`.
- Google OAuth secrets (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`) live in Zeabur env only; document in `docs/AGENT_ENV.md`, never commit values. Backend stays host-agnostic; host-based routing lives only in `apps/combined`; monorepo structured for future split (`apps/backend`, `web-io`, `web-org`; shared in `packages/shared`).
- L6 Switchboard lane handles newsletter reply ingestion when newsletter launches.
- UX/UI work in web-io/web-org: load `.agents/skills/editorial-ui` + `ux-copy`; they override generic frontend-design plugins.
