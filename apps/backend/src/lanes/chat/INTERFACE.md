# Provides
- `GET /api/chat/session?site=io|org` — resume or create on-site chat session (cookie-backed)
- `POST /api/chat/session/messages` — send user message; returns assistant reply + quota

# Persistence
- `chat_sessions`, `chat_messages`, `chat_usage` tables

# LLM
- **Default:** `MINIMAX_API_KEY` + `MINIMAX_MODEL=MiniMax-M3` → `https://api.minimax.io/v1/chat/completions` with `reasoning_split: true`
- Overrides: `CHAT_LLM_*` or `OPENAI_*` env vars
- Falls back to keyword-matched site links when no API key is configured
