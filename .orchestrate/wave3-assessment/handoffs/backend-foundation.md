<!-- orchestrate handoff
task: backend-foundation
branch: orch/wave3-assessment/backend-foundation
agentId: bc-37f35cea-b63c-495c-b336-02d2b48ef9f5
runId: run-e7479049-0596-432a-a4aa-8ae073ef186b
resultStatus: finished
finishedAt: 2026-06-19T00:06:45.143Z
-->

## Status
success

## Branch
`orch/wave3-assessment/backend-foundation`

## What I did
- `packages/shared/src/index.ts`
  - 保留既有 exports（health/inquiry/api client constants）並新增 Wave 3 assessment 全套 Zod schemas：
    - `assessmentGapIdSchema`, `likertValueSchema`, `assessmentSubDimensionSchema`, `assessmentGapSchema`, `assessmentQuestionSchema`, `assessmentQuestionBankSchema`
    - `assessmentAnswerSchema`, `assessmentScoreRequestSchema`
    - `assessmentSubScoreSchema`, `assessmentGapScoreSchema`, `assessmentRadarPointSchema`, `assessmentScoreResponseSchema`
  - 匯出對應 inferred types（含 `AssessmentGapId`, `AssessmentQuestion`, `AssessmentQuestionBank`, `AssessmentAnswer`, `AssessmentScoreRequest`, `AssessmentScoreResponse` 等）。
  - 擴充 `createApiClient(baseUrl)`：
    - `getAssessmentQuestions()` → GET `/api/assessment/questions` + schema parse
    - `submitAssessmentScore(req)` → POST `/api/assessment/score` + schema parse
- `data/simulators/assessment/questions.json`
  - 新增 canonical 題庫，符合 hard contract shape。
  - 完成 36 題（3 gaps × 3 sub-dimensions × 4 題），題目文案依 `usr/07` 與指定 knowledge-base 內容撰寫為成熟度 Likert 敘述。
  - `scale.labels` 提供 1–5（至少涵蓋 1/3/5）。
- `apps/backend/src/lanes/assessment/bank.ts`
  - 新增題庫載入/快取模組，使用 `import.meta.url` 向上解析 repo root（比照 db lane 模式）讀取 `data/simulators/assessment/questions.json`。
  - 以 `assessmentQuestionBankSchema` 驗證後輸出 `getQuestionBank(): AssessmentQuestionBank`。
- `apps/backend/src/lanes/assessment/scoring.ts`
  - 新增純函式 `scoreAssessment(bank, answers)`，實作：
    - overall / gap / sub-dimension 平均分
    - 全部分數四捨五入到 1 位小數
    - radar value = gap score
    - weakest gap tie-break 順序：`work_redesign` → `governance` → `value_measurement`
  - 新增 `validateAssessmentAnswers(bank, request)`，處理：
    - unknown questionId
    - duplicate questionId
    - 未答滿全部 36 題（`All 36 questions must be answered`）
- `apps/backend/src/lanes/assessment/index.ts`
  - 由 placeholder 改為 Hono router：
    - `GET /questions` 回傳題庫
    - `POST /score`：request zod parse + validation helper；失敗回 `400 { ok:false, error }`；成功回 score response
- `apps/backend/src/index.ts`
  - 掛載 `app.route('/api/assessment', assessmentRouter);`
  - 保留既有 `/api/health`、CORS、`app.route('/api', harvestRouter)` 不變。
- 測試與工具
  - `apps/backend/src/lanes/assessment/scoring.test.ts`：新增 5 個 vitest 測試（all-5s、mixed 手算案例、tie-break、incomplete rejection、unknown id rejection）。
  - `apps/backend/vitest.config.ts`：新增測試設定。
  - `apps/backend/package.json`：新增 `"test": "vitest run"`，新增 devDependency `vitest`（透過 pnpm 安裝）。
  - `pnpm-lock.yaml` 更新。
- Git
  - 已 commit 並 push 到指定分支（未開 PR）：
    - `feat: implement wave3 assessment schemas and backend scoring`

## Measurements
- `assessment questions count: 0 → 36`
- `questions per gap (work_redesign/governance/value_measurement): 0/0/0 → 12/12/12`
- `questions per sub-dimension (9 total): 0 each → 4 each`
- `pnpm --filter @ai-transformation/backend test: 0 passing → 5 passing`
- `manual API smoke status (GET questions / POST score complete / POST score incomplete / GET health): n/a → 200 / 200 / 400 / 200`
- `pnpm --filter @ai-transformation/shared typecheck exit code: n/a → 0`
- `pnpm --filter @ai-transformation/backend typecheck exit code: n/a → 0`

## Verification
unit-test-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- 嚴格限制修改路徑：僅變更 `packages/shared/**`、`apps/backend/**`、`data/simulators/assessment/**`（加上必要的 `pnpm-lock.yaml`）。
- `apps/web-io/**`、`apps/web-org/**`、`apps/combined/**` 未修改。
- 手動 smoke test 使用 `SQLITE_PATH=/tmp/wave3.db PORT=3001 pnpm --filter @ai-transformation/backend dev` 啟動後驗證 API。
- 目前 `validateAssessmentAnswers` 額外拒絕 duplicate `questionId`，屬於契約安全強化，未改變既定 contract。
- 本次為 backend/shared/data 任務，無 UI 互動修復；因此沒有螢幕錄影 artifact（該要求在此任務範圍不適用）。

## Suggested follow-ups
- 讓後續前端任務直接串接 `createApiClient().getAssessmentQuestions()` 與 `submitAssessmentScore()`，避免重複定義 contract。
- 補一組 backend router 層整合測試（HTTP 層）來固定 400 錯誤訊息與 response shape。
- 規劃 Wave 4 時，沿用 `scoreAssessment` 純函式做 session save/resume 的 server-side re-score，避免邏輯分岔。