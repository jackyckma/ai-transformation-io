<!-- orchestrate handoff
task: backend-inquiries
branch: orch/wave2-question-box/backend-inquiries
agentId: bc-d8b00c0f-b926-4c9c-868c-a0582f904b2a
runId: run-a8c158f2-5f12-4a27-8d65-df19741c569c
resultStatus: finished
finishedAt: 2026-06-18T11:02:30.526Z
-->

## Status
success

## Branch
`orch/wave2-question-box/backend-inquiries`

## What I did
- 更新 `packages/shared/src/index.ts`：
  - 新增 `inquiryResponseSchema`（`{ ok: true, id: string }`）與 `InquiryResponse` type export。
  - 在 `createApiClient(baseUrl)` 擴充 `submitInquiry(payload)`，以 `POST ${base}/api/inquiries`（`content-type: application/json`）送出，非 2xx 會 throw，成功以 schema parse 回傳。
  - 保留既有 exports（`healthResponseSchema`, `contributionSourceSchema`, `inquiryPayloadSchema`, `createApiClient`, `SITE_IO`, `SITE_ORG`）。
- 新增 `apps/backend/src/db/index.ts`：
  - 以 `better-sqlite3` 建立 SQLite 單例連線。
  - DB 路徑使用 `process.env.SQLITE_PATH ?? 'data/app.db'`，相對路徑一律以 repo root 解析；若父目錄不存在會自動建立。
  - 啟動時執行 idempotent migration：建立 `contributions` table 與 `(source, created_at)` index。
  - 匯出 `getDb()` 與 `insertContribution(...)` helper。
- 實作 `apps/backend/src/lanes/harvest/index.ts`：
  - 匯出 Hono router。
  - 新增 `POST /inquiries`（掛載後為 `POST /api/inquiries`）。
  - 使用 `inquiryPayloadSchema` 驗證 request body。
  - 成功時 insert 一筆 `source='web_inquiry'` 的 contributions 資料（含 `id=crypto.randomUUID()`, `created_at=ISO string` 等），回 `201 { ok: true, id }`。
  - 驗證失敗回 `400 { ok: false, error }`（優先取第一個 issue 訊息）。
- 更新 `apps/backend/src/index.ts`：
  - 保留既有 CORS 與 `GET /api/health`。
  - 僅新增 `app.route('/api', harvestRouter)` 掛載 lane。
- 更新 `apps/backend/package.json`：
  - dependencies 新增 `better-sqlite3`
  - devDependencies 新增 `@types/better-sqlite3`
- 更新 root `.gitignore`：
  - 新增 `*.db`, `*.db-*`, `data/*.db`
- 已 commit 並 push：
  - commit: `440a2c8`
  - branch: `orch/wave2-question-box/backend-inquiries`

## Measurements
- `POST /api/inquiries (data/simulators/harvest/inquiry.json) HTTP status: 201 == 201`
- `POST /api/inquiries ({"email":"x"}) HTTP status: 400 == 400`
- `GET /api/health HTTP status: 200 == 200`
- `contributions rows where source='web_inquiry' in /tmp/wave2-inq.db: 0 → 1`
- `pnpm --filter @ai-transformation/shared typecheck exit code: 0 == 0`
- `pnpm --filter @ai-transformation/backend typecheck exit code: 0 == 0`

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- 依指示未開 PR、未 rebase/merge，只推送指定分支。
- `scripts/setup-cloud-agent-env.sh` 在此環境執行時遇到 npm 全域目錄權限錯誤（`EACCES: /usr/lib/node_modules`），不影響本任務實作與驗證。
- 本任務無 UI 變更，因此沒有螢幕錄影 artifact（N/A）。
- 為遵守可修改路徑限制，未提交 `pnpm-lock.yaml` 變更。

## Suggested follow-ups
- 為 `POST /api/inquiries` 增加 backend 自動化測試（成功/失敗/DB 寫入）。
- 在後續整合階段，將 `.io` / `.org` 的 `/ask` 前端表單改用 shared 的 `createApiClient().submitInquiry()`。