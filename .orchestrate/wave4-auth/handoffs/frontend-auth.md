<!-- orchestrate handoff
task: frontend-auth
branch: orch/wave4-auth/frontend-auth
agentId: bc-fb5dfe38-519d-4bc9-b540-36f33979b4ef
runId: run-4225babf-8cfc-4150-b070-735b59f1d168
resultStatus: finished
finishedAt: 2026-06-19T09:54:38.378Z
-->

## Status
success

## Branch
`orch/wave4-auth/frontend-auth`

## What I did
- 在 `apps/web-io/components/auth-nav.tsx` 新增 client auth 元件：  
  - mount 時 `GET /api/auth/me`（`credentials:'include'`）  
  - signed-out 顯示 `Sign in`（導向 `/api/auth/google`）  
  - signed-in 顯示使用者名稱/Email + `Sign out`（`POST /api/auth/logout`）  
  - fetch 失敗/非 2xx（含 501）皆降級為 signed-out。
- 在 `apps/web-org/components/auth-nav.tsx` 做同等功能，樣式調整為 .org 調性。
- 更新 `apps/web-io/components/site-chrome.tsx`、`apps/web-org/components/site-chrome.tsx`：  
  - server component 保持不變，嵌入 client `AuthNav` 於 `ThemeToggle` 旁  
  - `.org` 導航新增 `Join` 項目。
- 新增 `apps/web-org/app/join/page.tsx`（server component + metadata）：  
  - Harvest Hub 風格的加入頁  
  - 主要 CTA：`Continue with Google`（導向 `${NEXT_PUBLIC_API_BASE_URL ?? ''}/api/auth/google`）  
  - 補上加入原因與社群導覽連結。
- 擴充 `apps/web-io/components/assessment/assessment-wizard.tsx` 以支援 Wave 4 save/resume（僅前端）：
  - 本地定義 auth/session TS 型別（未新增 shared exports 依賴）
  - mount 檢查 `GET /api/auth/me` 判斷登入狀態
  - 進入 questions 後，已登入者 `GET /api/assessment/session`，可恢復 `answers + stepIndex`
  - 顯示 `Resumed your saved progress` 與 `Progress saved / Saving progress…` 提示
  - 進度儲存（`POST /api/assessment/session`）於答題變更（debounce）、Next/Back、Submit 時觸發
  - 所有 API 呼叫使用 `credentials:'include'`，且失敗/401 皆靜默降級，不阻斷匿名流程
  - Intro/Results 文案依登入狀態調整，不再對已登入者宣稱「nothing is saved」。
- 驗證與交付：
  - 跑完指定 `pnpm install`、兩個 typecheck、兩個 build
  - commit + push 到指定分支（未開 PR、未改 backend/shared/combined）。
- 錄影產物：
  - `/opt/cursor/artifacts/wave4-playwright-results/wave4-auth-record-record-wave4-frontend-auth-and-join-flow/video.webm`

## Measurements
- `pnpm install: exit 0 == 0`
- `pnpm --filter @ai-transformation/web-io typecheck: exit 2 → 0`
- `pnpm --filter @ai-transformation/web-org typecheck: exit 0 == 0`
- `pnpm --filter @ai-transformation/web-io build: exit 0 == 0`
- `pnpm --filter @ai-transformation/web-org build: exit 0 == 0`
- `git show --stat HEAD (files changed): 0 → 6`
- `git show --stat HEAD (insertions): 0 → 521`

## Verification
live-ui-verified

## Notes, concerns, deviations, findings, thoughts, feedback
- 嚴格遵守範圍：僅改 `apps/web-io/**` 與 `apps/web-org/**`；`packages/shared/**`、`apps/backend/**`、`apps/combined/**` 未觸碰。
- `.io` assessment 的 signed-in save/resume API 路徑已接好並具失敗降級，但在此環境下未與真實 OAuth/session backend 做完整登入態 E2E（已以錄影確認前端 UI 與匿名路徑不阻斷）。
- `scripts/setup-cloud-agent-env.sh` 在本機嘗試時因全域 npm 權限（EACCES: `/usr/lib/node_modules`）失敗，與本次前端修改無直接衝突。

## Suggested follow-ups
- 由整合任務在完整 backend/OAuth 環境做一次跨域手動驗證：`.io` 登入後於 `.org` 一鍵重登、`/api/auth/me` user id 一致、cookie 分域行為正確。
- 補一組前端整合測試（可 mock `/api/auth/me` 與 `/api/assessment/session`）覆蓋 resume 邏輯與匿名降級路徑。