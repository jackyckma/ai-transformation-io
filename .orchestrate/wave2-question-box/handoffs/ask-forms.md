<!-- orchestrate handoff
task: ask-forms
branch: orch/wave2-question-box/ask-forms
agentId: bc-b5813961-df27-40db-ac8c-c06237509199
runId: run-fd1d3128-1091-4608-af99-198b637091ea
resultStatus: finished
finishedAt: 2026-06-18T11:40:35.530Z
-->

## Status
success

## Branch
`orch/wave2-question-box/ask-forms`

## What I did
- 在 `apps/web-io/components/inquiry-form.tsx` 新增可用的 Client Component（`'use client'`）表單：
  - 欄位：`email`（必填）、`name`（選填）、`question`（必填 textarea）
  - 前端驗證完全對齊契約：email 格式、question 10–5000、name <=120
  - 送出目標採用 `const endpoint = \`${process.env.NEXT_PUBLIC_API_BASE_URL ?? ''}/api/inquiries\``
  - 使用 plain `fetch` POST JSON `{ email, question, name?, site: 'io' }`
  - 實作 submitting disable state、inline 錯誤訊息、201 成功訊息、非 201/失敗錯誤訊息
- 更新 `apps/web-io/app/ask/page.tsx`，保留 server component + metadata，改為 render `InquiryForm`。
- 在 `apps/web-org/components/inquiry-form.tsx` 新增對應 Client Component：
  - 同樣契約驗證與提交邏輯，但 `site: 'org'`
  - 文案與按鈕語氣調整為較溫暖的社群風格（Ask the community）
- 更新 `apps/web-org/app/ask/page.tsx`，保留 server component + metadata，改為 render `InquiryForm`。
- 僅修改允許路徑（`apps/web-io/**`、`apps/web-org/**`），未觸及 `packages/shared/**`、`apps/backend/**`、`apps/combined/**`。
- 已 commit 並 push 到指定分支。

## Measurements
(none)

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- 指定驗證已通過：
  - `pnpm install`
  - `pnpm --filter @ai-transformation/web-io typecheck`
  - `pnpm --filter @ai-transformation/web-org typecheck`
  - `pnpm --filter @ai-transformation/web-io build`
  - `pnpm --filter @ai-transformation/web-org build`
- UI 互動錄影已產生（Playwright 實際打開 `/ask` 並操作欄位/提交）：
  - `/opt/cursor/artifacts/wave2-ask-videos/wave2-ask-records-web-io-ask-form-flow/video.webm`
  - `/opt/cursor/artifacts/wave2-ask-videos/wave2-ask-records-web-org-ask-form-flow/video.webm`
- 依專案慣例另外嘗試執行 `scripts/setup-cloud-agent-env.sh`，但因系統權限 (`EACCES` on `/usr/lib/node_modules`) 失敗；`scripts/agent-verify.sh` 已成功通過。

## Suggested follow-ups
- 由整合者在完整環境（含 backend `POST /api/inquiries`）做一次手動 smoke，確認 201 成功分支顯示文案與資料落庫鏈路。