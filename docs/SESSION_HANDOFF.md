# Session handoff

**Date:** 2026-06-22  
**Session:** Sidebar chatbot v1 (.io + .org)

## Completed

1. **Sidebar companion v1 shipped:**
   - L2: `chat_sessions`, `chat_messages`, `chat_usage` tables
   - `GET /api/chat/session`, `POST /api/chat/session/messages`
   - Content-grounded replies via keyword retrieval + OpenAI-compatible LLM (`CHAT_LLM_*` / `OPENAI_*` / `MINIMAX_*`); link fallback when no key
   - Quotas: 8/day anonymous, 25/day signed-in
   - `@ai-transformation/chat-ui` — shared `SidebarChat` panel (fixed toggle + slide-over)
   - Wired on both `.io` and `.org` root layouts
2. Tests: `apps/backend/src/lanes/chat/chat.test.ts` (3 cases)
3. Docs updated: CURRENT_STATUS, POSITIONING-UX, project-progress, product-architecture

## Next

- **Wave 10** — Newsletter pilot (subscribe, send, inbound Worker)
- **Later** — progress dashboard, streaming replies, conversation export API

## Verify locally

```bash
pnpm --filter @ai-transformation/backend test
pnpm --filter @ai-transformation/web-io build
pnpm --filter @ai-transformation/web-org build
```

Optional: set `CHAT_LLM_API_KEY` + `CHAT_LLM_BASE_URL=https://hnd1.aihub.zeabur.ai/v1` on Zeabur for live LLM replies.

## Admin: compile draft

`POST /api/agent/compile-draft` with `{ "site": "io"|"org" }` — requires `ADMIN_EMAILS` session.
