# Provides
- `GET /api/chat/session?site=io|org` — resume or create on-site chat session (cookie-backed)
- `POST /api/chat/session/messages` — send user message; returns assistant reply + quota

# Persistence
- `chat_sessions`, `chat_messages`, `chat_usage` tables

# LLM
- OpenAI-compatible endpoint via `CHAT_LLM_*` or `OPENAI_*` / `MINIMAX_*` env vars
- Falls back to keyword-matched site links when no API key is configured
