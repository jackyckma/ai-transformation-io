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
- .io IA: **companion/support** north star — **companion-first home** (starter questions, explore links, compact curated preview); Assessment **secondary** for org-level diagnostic; on-site **companion** primary human interaction (no login required; on-site chat history); external agent API secondary unless data proves otherwise; function role guides at `/functions/*` (footer secondary, not header nav). .org home: **Share-first** + same companion-first home pattern; **Join removed from nav** (Sign in in header); agent entry = `/for-agents` only.
- Curation spotlight v1: agent proposes `data/curated/*.json` → founder approves PR; see `data/curated/EDITORIAL_POLICY.md` and `docs/POSITIONING-UX.md`.
- Research output: internal strategy in `usr/`, public website ideas in `knowledge-base/`; prioritize enriching both sites from knowledge-base before interaction features.
- Site design: content-first editorial; companion-first home (starter prompts + explore links + compact curated preview); curated JSON via agent-propose + founder PR approve, slow cadence; Phase B topic covers in `/curation/`. Mobile companion as bottom sheet; sticky two-row header (auth row + nav row, no overlap). Not product-marketing (no oversized bold sans titles, pill CTAs, or subscribe funnels); refined elegant typography — serif titles with light sans body. Agent-first via companion, `/for-agents`, embedded hints — not shouty marketing.
- Enterprise executive info portal: substantive content visible without subscribe; optional subscribe for deeper content later; future newsfeed via RSS and/or agent-curated news.
- After completing shippable work (content, UI, fixes, docs tied to production), default to commit and push to `main` without asking for approval — unless the user says otherwise or the change is explicitly exploratory. Zeabur deploys from `main`.

## Learned Workspace Facts

- ai-transformation.io is a corporate-facing executive info portal; ai-transformation.org is community Harvest Hub plus AI-era Apprenticeship (`/apprenticeship`, `/apprenticeship/rationale`, `POST /api/apprenticeship/interest`; brand as AI Transformation · Harvest Hub, not "Learn Together"). Apprenticeship is formation/judgment training, not enterprise consulting.
- Both domains share one Zeabur combined service with separate Next.js frontends (`web-io`, `web-org`).
- Remove legacy DNS records (e.g. `dev.ai-transformation.io`) except email-routing-related entries.
- Lane-based waves: 0–9 production-verified; Wave 7 agent protocol v1; Wave 8 newsletter infra + compile-draft jobs; Wave 9 function IA (`/functions/*` role guides); Wave 10 newsletter pilot; sidebar companion v1 shipped on .io/.org; L11 split from L10 internal jobs.
- Product direction: agent-first site — humans and agents are first-class participants; on-site companion (primary human UI; 8 msg/day anonymous, 25/day signed-in; MiniMax-M3 via `MINIMAX_API_KEY`) plus `/for-agents` and embedded machine-readable hints on human pages.
- Agent read tiers (v1 locked): 3/day anonymous, 10/day registered; write token 180-day TTL; .io and .org share one token.
- Cross-domain auth (Wave 4): per-host HttpOnly session cookies via combined `/api` proxy; same Google account maps to one `users` row; second domain needs one-click re-auth (no cross-TLD cookie).
- Assessment shipped: 36 Three Gaps Likert questions, wizard + radar API, save/resume when authenticated. Production runtime: backend and combined use `tsx` (`packages/shared` exports `.ts`); backend `tsc` excludes `*.test.ts`.
- Zeabur deploy: git auto-deploy can stall — use `npx zeabur@latest deploy` if needed. **zbpack must list every deploy package explicitly** (`web-io`, `web-org`, `backend`, `combined`, …); bare `turbo run build` on Zeabur may scope to only `backend` when commits touch `.orchestrate/` only → missing `.next` → 502. Orchestrate `syncStateToGit` commits on `main` trigger these broken deploys before Wave PRs merge. Turbo cache can skip `combined/dist`; zbpack uses `--force`; combined starts via `tsx src/start.ts`.
- Google OAuth secrets (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `SESSION_SECRET`) live in Zeabur env only; document in `docs/AGENT_ENV.md`, never commit values.
- L6 Switchboard lane handles newsletter reply ingestion when newsletter launches.
- Backend stays host-agnostic; host-based routing lives only in `apps/combined`; monorepo structured for future split (`apps/backend`, `web-io`, `web-org`; shared in `packages/shared`).
