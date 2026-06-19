<!-- orchestrate handoff
task: backend-harvest
branch: orch/wave5-harvest/backend-harvest
agentId: bc-d100c1ac-614d-487f-8d95-1371bbf2f008
runId: run-2455f85f-3e1b-4f07-8255-d02f6f9b9aed
resultStatus: finished
finishedAt: 2026-06-19T17:53:07.752Z
-->

## Status
success

## Branch
`orch/wave5-harvest/backend-harvest`

## What I did
- 在 `apps/backend/src/db/index.ts`：
  - 新增 `prompts` table migration（含 `id/question/week_of/status/created_at`）。
  - 加入 idempotent seed（`prompt-2026-w24`, `prompt-2026-w25`）。
  - 新增並 export：
    - `listPublishedStories()`
    - `listStoriesForModeration()`
    - `getContributionById(id)`
    - `updateContributionModeration({ id, status, publishedSlug, reviewedBy, reviewedAt })`
    - `getCurrentPrompt()`
    - `getPromptById(id)`
  - 保留所有既有 export/migration。
- 在 `apps/backend/src/lanes/harvest/index.ts`：
  - 保持既有 `POST /inquiries` 邏輯不變。
  - 新增 routes：
    - `POST /stories`（需登入，401 anon，400 invalid）
    - `GET /stories`（公開，僅 published/featured，created_at DESC）
    - `GET /stories/moderation`（admin gate：401/403）
    - `PATCH /stories/:id`（admin gate；狀態更新、reviewed_at/reviewed_by、必要時自動 slug）
    - `GET /prompts/current`（公開）
    - `POST /prompts/:id/replies`（需登入；unknown prompt 404）
  - 在 harvest lane 內新增 `isAdmin(user)`，以 `ADMIN_EMAILS` 做 trim + case-insensitive 比對。
- 在 `packages/shared/src/index.ts`：
  - 保留所有既有 export。
  - 新增 Zod schemas/types：
    - `storyPayloadSchema`
    - `storyStatusSchema`
    - `storySchema`
    - `storyModerationSchema`
    - `storiesResponseSchema`
    - `promptSchema`
    - `currentPromptResponseSchema`
    - `promptReplyPayloadSchema`
    - `storyModerationListResponseSchema`
    - `storyModerationResponseSchema`
  - 擴充 `createApiClient`（不移除既有 methods）：
    - `submitStory(payload)`（credentials include）
    - `getStories()`
    - `getCurrentPrompt()`
    - `submitPromptReply(promptId, payload)`（credentials include）
    - `getStoriesForModeration()`（credentials include）
    - `moderateStory(id, body)`（credentials include）
- 在 `apps/backend/src/lanes/harvest/INTERFACE.md`：
  - 更新 Provides 與 Access control（含 `ADMIN_EMAILS` gate）。
- 新增 simulator fixtures：
  - `data/simulators/harvest/story.json`
  - `data/simulators/harvest/prompt-reply.json`
- 新增測試：
  - `apps/backend/src/lanes/harvest/harvest.test.ts`
  - 覆蓋你要求的 401/403/404/400、stories publish flow、moderation gate、current prompt 與 prompt replies。
- `.env.example` 新增：
  - `# Wave 5 harvest`
  - `ADMIN_EMAILS=`
- Git：
  - commit: `2eafef8`
  - push: `origin/orch/wave5-harvest/backend-harvest`

## Measurements
- `LOC(apps/backend/src/db/index.ts): 505 → 754`
- `LOC(apps/backend/src/lanes/harvest/index.ts): 54 → 330`
- `LOC(packages/shared/src/index.ts): 255 → 396`
- `backend harvest test file count: 2 → 3`
- `pnpm --filter @ai-transformation/shared typecheck: exit 0 == exit 0`
- `pnpm --filter @ai-transformation/backend typecheck: exit 0 == exit 0`
- `pnpm --filter @ai-transformation/backend test: 17 passing == 17 passing`

## Verification
unit-test-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- 手動 smoke 已執行：
  - `SQLITE_PATH=/tmp/wave5-be.db ADMIN_EMAILS=admin@example.com PORT=3001 pnpm --filter @ai-transformation/backend dev`
  - `curl -s localhost:3001/api/prompts/current` 回傳 `{ok:true,prompt:{...}}`
  - `curl -s localhost:3001/api/health` 回傳 `{ok:true,...}`
- `scripts/setup-cloud-agent-env.sh` 在此 cloud 環境因全域 npm 權限 (`EACCES /usr/lib/node_modules`) 失敗；`scripts/agent-verify.sh` 成功。
- 這是 backend/shared 任務，未修改 `apps/web-io/**`、`apps/web-org/**`、`apps/combined/**`。
- 無 UI 互動修復，故無 screen recording artifact（N/A）。

## Suggested follow-ups
- 前端整合端可直接對接：
  - stories 發佈與 moderation API
  - prompts current + reply API
  - `@ai-transformation/shared` 新增 schema/client methods
- 若要加強 moderation 穩定性，可補：
  - `published_slug` uniqueness constraint/index（目前 contract 未要求）。