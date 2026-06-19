<!-- orchestrate handoff
task: backend-auth
branch: orch/wave4-auth/backend-auth
agentId: bc-b8ea8e0a-9b70-4701-960a-eb7e79175d0d
runId: run-90a97ef3-ff19-4555-b778-4e68f032274b
resultStatus: finished
finishedAt: 2026-06-19T09:33:30.123Z
-->

## Status
success

## Branch
`orch/wave4-auth/backend-auth`

## What I did
- 完成 Wave 4 backend 實作（僅修改允許路徑）：
  - `apps/backend/src/db/index.ts`
    - 新增 idempotent migrations：`users`、`sessions`、`assessment_sessions`
    - 保留既有 `contributions` 與 `insertContribution`
    - 新增 helper：`upsertUserByGoogle`、`createSession`、`getSessionWithUser`、`deleteSession`、`getAssessmentSession`、`upsertAssessmentSession`
    - 新增 `DATABASE_URL` driver hook：非 `sqlite:`/`file:` 會在啟動拋出 `DATABASE_URL driver not yet supported in Wave 4 (SQLite only)`，並保留 SQLite 預設路徑
  - `apps/backend/src/middleware/session.ts`、`apps/backend/src/types/session.ts`
    - 新增 session middleware，讀取 `atx_session` cookie 後注入 `c.set('user')` / `c.set('session')`
  - `apps/backend/src/index.ts`
    - 註冊 session middleware（在 CORS 後、router 前）
    - 掛載 `/api/auth` router
    - 保留 `/api/health` 與原 CORS 設定
  - `apps/backend/src/lanes/auth/index.ts`
    - 實作 `GET /api/auth/google`、`GET /api/auth/callback/google`、`POST /api/auth/logout`、`GET /api/auth/me`
    - 未配置 Google env 時，`/google` 與 `/callback/google` 回 501
    - OAuth state 採 HMAC-SHA256 簽名，並寫入 `HttpOnly` `atx_oauth_state` cookie
    - callback 成功後建立 session 並設定 `HttpOnly` host-only `atx_session` cookie（無 Domain）
  - `apps/backend/src/lanes/assessment/index.ts`
    - 新增 `GET/POST /api/assessment/session`
    - 未登入回 401，登入可儲存/讀取 `answers + stepIndex (+ lastScore)`
    - 保持既有 `/questions`、`/score` 行為
  - `apps/backend/src/lanes/harvest/index.ts`
    - `POST /api/inquiries` 在有 session 時附帶 `userId`，匿名仍可 201
- `packages/shared/src/index.ts`
  - 保留既有 exports，新增：
    - `authUserSchema`、`authMeResponseSchema`
    - `assessmentSessionStateSchema`、`assessmentSessionResponseSchema`、`assessmentSessionSaveRequestSchema`
    - 對應 inferred types
  - `createApiClient` 新增：
    - `getAuthMe()`、`logout()`、`getAssessmentSession()`、`saveAssessmentSession()`
    - 皆使用 `credentials: 'include'`
- 測試與文件：
  - 新增 `apps/backend/src/lanes/auth/auth.test.ts`，覆蓋：
    1) cookie `/api/auth/me` flow  
    2) `upsertUserByGoogle` dedup  
    3) assessment session round-trip + unauth 401  
    4) inquiry attribution + anonymous 201  
    5) `/api/auth/google` 未配置時 501
  - 更新 `docs/AGENT_ENV.md`：Wave 4 auth env、redirect URIs、`DATABASE_URL` hook 說明
  - 更新 `.env.example`：加入 `GOOGLE_CLIENT_ID`、`GOOGLE_CLIENT_SECRET`、`SESSION_SECRET`、`DATABASE_URL`、`SQLITE_PATH`
  - 新增 fixture：`data/simulators/auth/session.json`（符合 `GET /api/auth/me` authenticated shape）
- 已 commit + push 到指定分支，未開 PR、未修改禁止路徑。

## Measurements
- `pnpm --filter @ai-transformation/shared typecheck (errors)`: 0 == 0
- `pnpm --filter @ai-transformation/backend typecheck (errors)`: 0 == 0
- `pnpm --filter @ai-transformation/backend test`: 10 passing == 10 passing
- `manual smoke checks (5 endpoints/status expectations)`: 5/5 == 5/5

## Verification
unit-test-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- 手動 smoke（`SQLITE_PATH=/tmp/wave4-auth.db PORT=3001`、無 Google env）結果符合契約：
  - `GET /api/auth/me` → `{ok:true,user:null}`
  - `GET /api/auth/google` → `501`
  - `GET /api/health` → `{ok:true,...}`
  - `GET /api/assessment/session`（無 session）→ `401`
  - `POST /api/inquiries`（匿名）→ `201`
- `scripts/setup-cloud-agent-env.sh` 在此環境因 npm 全域目錄權限（EACCES `/usr/lib/node_modules`）失敗；不影響本任務交付。
- 本任務是純 backend/API，無 UI/互動修復案例；不適用螢幕錄影 artifact 要求（N/A）。

## Suggested follow-ups
- 補一組 `GET /api/auth/callback/google` 的 mock-fetch 測試（token exchange/userinfo/error redirect 分支），提高 OAuth callback regression coverage。
- 前端整合時，驗證 `.io` 與 `.org` 的「同 Google 帳號同一 user row、不同 TLD 各自 host-only cookie」跨域登入體驗。
- 因本次 cloud 環境有實際安裝依賴，建議在 Cursor Web 跑一次 env setup agent，避免其他 agents 重覆安裝。  
  建議 prompt：`Inspect this pnpm+turbo monorepo and update cloud agent environment so pnpm install for @ai-transformation/* (including better-sqlite3 native build) is pre-provisioned; fix npm global permission pitfalls (EACCES on /usr/lib/node_modules), and validate shared/backend typecheck + backend vitest can run out of the box.`