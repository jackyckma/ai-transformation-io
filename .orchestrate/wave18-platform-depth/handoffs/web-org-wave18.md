<!-- orchestrate handoff
task: web-org-wave18
branch: `orch/wave18-platform-depth/web-org-wave18` (pushed; no PR per instructions)
agentId: bc-25957e0f-fe66-4dbc-a1c0-5b80adfb84cd
runId: run-2229ec99-fc6b-440b-bf87-5c8b0a5708c5
resultStatus: finished
finishedAt: 2026-06-26T09:54:52.449Z
-->

All work is complete, committed, and pushed. Here is my handoff.

## Status
success

## Branch
`orch/wave18-platform-depth/web-org-wave18` (pushed; no PR per instructions)

## What I did
- **Hook (`apps/web-org/lib/use-community-interactions.ts`)** — added `act(kind: CommunityActionKind, body?)` that POSTs to `getApiClient().community.actions({ site:'org', objectId, kind, body? })` with pending/done/error tracking. Broadened the done/pending sets to a `TrackedKind = CommunityInteractionKind | CommunityActionKind` union. Kept existing `toggle` (follow/join), `offerHelp`, and the `listInteractions` load. Note: the list endpoint only returns `follow/offer_help/join`, so request_mentor/ask_for_intro/apply done-state is optimistic for the session (see Notes).
- **Detail ActiveActions (`components/community-object-view.tsx`)** — replaced the Ask-prefill-only intent links with real persisted-action buttons driven by `getCommunityActions(type)` ∩ `{offer_help, request_mentor, ask_for_intro, apply}`. New `IntentAction` component: collapsed button → optional short body composer (reusing the OfferHelp/Reply pattern) → `act()`; shows pending/done/error and a per-action secondary "Draft via Ask" link. Removed the now-redundant standalone `OfferHelpComposer` (offer_help is now an intent action). Remaining non-intent Ask verbs (draft_reply/turn_into_field_note/draft_via_ask) stay as a secondary "With the on-site agent" row. Reply/follow/join/save/match unchanged.
- **Match panel** — passes `useLlmRerank: true`; captures `llmAssisted` + `rerankModel`; renders an `Experimental · LLM assist` badge (with model when present) only when `llmAssisted === true`, otherwise identical to before.
- **Cards (`components/community-highlights.tsx`)** — `ObjectCard` now derives a primary verb via `getCommunityActions(type)` + `communityVerbLabel` (priority `reply → request_mentor → apply → ask_for_intro`): `Reply` for question/discussion, `Request mentor`/`Apply` rendered as an accent primary affordance for Phase 2 types, linking to the detail action. Type label already shown. Removed the dead `COMMUNITY_TYPE_VERBS` constant from `lib/object-display.ts`.
- **Deep links** — new `components/agent-deep-links.tsx` (`AgentDeepLinks` + `AgentHintScript`) using shared `buildExternalAgentLinks`/`buildExternalAgentHint`. Wired discreet ChatGPT/Claude links (new tab, subordinate text) + `<script type="application/json" data-agent-hint="page">` into both knowledge and community detail headers. Canonical URLs from `getSiteOrigin('org')` + `/knowledge/<id>` / `/community/<id>`.
- **`/for-agents` (`app/for-agents/page.tsx`)** — added `#deep-links` section documenting the pattern + live example ChatGPT/Claude URLs from `buildExternalAgentLinks`; existing `#community`/`#phase-2`/`#matching` intact.

## Measurements
- `pnpm --filter @ai-transformation/web-org typecheck`: pass → pass
- `pnpm --filter @ai-transformation/web-org build`: pass → pass (24/24 static pages)
- changed files: only `apps/web-org/**` (6 modified + 1 new)

## Verification
type-check-only

Build + typecheck pass and I inspected each wired path. I could not produce live screenshots: no browser MCP server is available in this env (Playwright is disallowed without approval), and the intent buttons + LLM-assist badge require member auth, seeded Phase 2 data, and a configured LLM key — none present here.

## Notes, concerns, deviations, findings, thoughts, feedback
- **Optimistic done-state gap (backend contract):** `listInteractionsForUser` filters `i.kind IN ('offer_help','join')` (plus follow), so `request_mentor`/`ask_for_intro`/`apply` are persisted but NOT returned by `/community/interactions`. Their "done" state is therefore optimistic per session and resets on reload. If persistent reflection is desired, the backend list query needs to include the action kinds (out of my scope: `apps/backend/**`).
- **Removed standalone `OfferHelpComposer`:** offer_help is now an ActiveActions intent action (real POST via `community.actions`, which the backend also persists and reflects in listInteractions), avoiding duplicate offer-help affordances on help_request pages. Cards still use the hook's `offerHelp` inline button (unchanged).
- **`act()` routes offer_help through `/community/actions`** (not the legacy `/community/offers`); both persist offer_help and both are reflected by listInteractions, so behavior is equivalent.
- **No screenshots** captured for the reasons above — flagged so a verifier with a running stack + member session + `MINIMAX_API_KEY`/`CHAT_LLM_*` can confirm the badge appears and the intent buttons persist.

## Suggested follow-ups
- Backend: include `request_mentor`/`ask_for_intro`/`apply` in `listInteractionsForUser` so the detail page can show persisted done-state across reloads.
- Verifier: run web-org dev with backend + an LLM key, sign in as a member on a Phase 2 item to capture the Request mentor/Apply composer and the `Experimental · LLM assist` badge.
- Consider adding the deep-link discreet actions to the static knowledge `ContentPageLayout` pages too (currently only the dynamic `KnowledgeObjectView`), if founder wants ChatGPT/Claude links on editorial knowledge articles as well.