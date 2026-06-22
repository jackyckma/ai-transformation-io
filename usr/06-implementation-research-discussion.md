# 兩站實作內容調查與討論

> **Note (2026-06-22):** Internal research from pre-scaffold. Product/UX locks superseded by [`docs/POSITIONING-UX.md`](../docs/POSITIONING-UX.md) where they differ (e.g. Harvest Hub vs "Learn Together", forum-first).

**日期：** 2026-06-18  
**目的：** 在 scaffold 之前，釐清 `.io` 與 `.org` 各自可做的具體內容、互動形式，以及與顧問服務的銜接方式。

---

## 一、我們已有的知識資產（可分享什麼）

來自先前研究（Deloitte、BCG、KPMG、Economist 等）與 `knowledge-base/` 草稿，以下內容具備對外分享價值：

### 1.1 核心框架（高價值、可重複使用）

| 框架 | 來源/我們的詮釋 | 最適呈現方式 |
|------|----------------|-------------|
| **Three Gaps**（工作重設計、治理、價值衡量） | Deloitte 2026 Pulse Check | 首頁敘事 + 診斷問卷維度 |
| **7-Stage Roadmap** | 業界綜合 | 互動式路線圖（可點選各階段） |
| **Autonomy Maturity Ladder**（L0–L3） | 我們整理 | 階梯圖 + checklist |
| **Return on Autonomy (RoA)** | Deloitte | 對比表 + 衡量指標清單 |
| **Four AI Patterns**（Copilot/RAG/Agent/Automation） | 業界實務 | 決策樹 / 選擇矩陣 |
| **Deploy / Reshape / Invent** | BCG | 價值路徑分類（.io 策略頁） |
| **Nine Capacities** | Economist "Making AI Deliver" | 雷達圖評估維度 |
| **Common Pitfalls**（10 項） | 我們整理 | 自評 checklist + 部落格 |

### 1.2 內容形態建議

| 形態 | 適合主題 | 站點 |
|------|----------|------|
| **Cornerstone 長文**（2000–4000 字） | 定義、路線圖、治理、衡量 | .io 為主 |
| **職能 Playbook**（800–1500 字） | 各 function 的 AI 轉型切入點 | .io |
| **Case Pattern**（問題→做法→結果→教訓） | Covestro、Danone、BASF 等 | .io 案例庫；.org 可改寫為「我的經驗」 |
| **Glossary / FAQ** | SEO、內部連結 hub | .io |
| **Discussion prompt**（開放式問題） | 「你們卡在哪一階段？」 | .org |
| **Experience post**（第一人称） | 失敗/成功故事 | .org |
| **Weekly synthesis** | 研究摘要 + 評論 | 電子報（兩站可各一份或共用 backend） |

### 1.3 不建議直接搬運的

- 大型顧問白皮書原文（版權、且太 generic）
- 未經驗證的統計數字（需標註來源與年份）
- 過度 agentic AI  hype 內容（與我們 anti-hype 定位不符）

---

## 二、.io 網站：按「職能」組織的具體方案

### 2.1 資訊架構（建議）

```
Home
├── By Function（主導航）
│   ├── Executive / Board      — 策略、董事會報告、RoA
│   ├── CIO / CTO              — 平台、資料、MLOps、整合
│   ├── COO / Operations       — 工作流重設計、試點到量產
│   ├── CFO / Finance          — ROI/RoA、投資組合、成本
│   ├── CHRO / People          — 變革管理、技能、70% 問題
│   ├── CRO / Legal / Risk     — 治理、合規、EU AI Act
│   ├── CAIO / AI Lead         — 作業模型、use case portfolio
│   └── Function-specific      — Finance close, HR, Supply chain...
├── Frameworks（跨職能）
│   ├── Roadmap · Governance · Measure Value · Patterns
├── Assess（互動）
│   └── Transformation Readiness Assessment
├── Use Cases
├── Resources / Glossary / FAQ
└── Newsletter · Contact / Consultation
```

**邏輯：** 企業訪客通常以「我是 CIO」或「我負責 HR 轉型」進站，而非先找「Seven-Stage Roadmap」。職能入口降低認知負擔；框架頁提供跨職能共同語言。

### 2.2 各職能頁面模板（每頁固定結構）

1. **You own** — 這個職能在 AI 轉型中的責任
2. **Three Gaps lens** — 對這個職能，三個 gap 長什麼樣
3. **Key decisions** — 必須做的 3–5 個決策
4. **Checklist** — 10–15 項可勾選的自評（Assessment 的前導）
5. **Playbook links** — 連到 roadmap 對應階段
6. **Case patterns** — 1–2 個相關案例
7. **Next step** — Assessment / Newsletter / Contact

### 2.3 參考案例（企業知識 + 評估）

| 網站 | 做什麼 | 可借鑑 |
|------|--------|--------|
| [EY Digital Readiness Assessment](https://digitalreadiness.ey.com/) | 7 維度成熟度 + 產業 benchmark + 填表後 lead gen | 維度設計、benchmark 敘事、**需登入/留資才看完整報告** |
| [PwC Transformation Maturity Profiler](https://transformationprofiler.strategyand.pwc.com/) | 短問卷 → 七項 leadership imperatives 評分 | 低門檻入口、confidential 承諾 |
| [KPMG Digital Maturity Assessment](https://kpmg.com/us/en/articles/2023/kpmg-digital-maturity-assessment.html) | 問卷 → 下載客製化 PDF 報告 | **報告作為 lead magnet** |
| [Mendix Assessment](https://www.mendix.com/strategies/digital-transformation/assessment-tool/) | 7 題快篩 → 填表才看結果 | 漸進式資訊收集 |
| [aitransformation.app](https://www.aitransformation.app/) | 72 題 × 6 域、加權評分、風險旗標、roadmap、可存 progress | **最接近你的 Assessment 構想**；進度自動保存、可匯出 |
| [Detecon AI Readiness](https://www.detecon.com/en/ai-readiness-assessment) | S/M/L 三種深度 → 顧問銜接 | 分級 assessment 對應不同顧問產品 |
| [Prosci Resources](https://www.prosci.com/resources) | ADKAR 框架 + 免費下載 + 會員社群 | **內容漏斗 → 認證/會員 → 顧問** 的經典路徑 |
| [Deloitte AI Institute](https://www.deloitte.com/.../ai-transformation-predictions-2026.html) | 研究報告 + Pulse Check 數據 | 權威感、引用數據的方式 |

---

## 三、.org 網站：「共同學習」社群通常怎麼運作

### 3.1 社群網站的三種常見模式

| 模式 | 代表 | 特點 | 適合 .org 的程度 |
|------|------|------|-----------------|
| **Forum-first（論壇優先）** | Discourse 架站 | 深度討論串、知識沉澱、SEO 好 | ⭐⭐⭐ 最貼「learn together」 |
| **Cohort / Program（學習旅程）** | Howspace, Circle | 引導式反思、同期學員、facilitator | ⭐⭐ 後期可做「Transformation cohort」 |
| **Content + Community（內容+社群）** | Thinkific, Disco | 課程/資源 + 討論區 | ⭐⭐ 若 .org 有輕量學習路徑 |

**重點：** 成功的 CoP（Community of Practice）通常不是「另一個部落格」，而是 **結構化討論 + 可搜尋的集體知識 + 身份認同**（Discourse Meta 上 CoP 建站的討論也強調：daily/weekly prompt、categories、moderation）。

### 3.2 .org 建議的資訊組織（**不按職能**）

按 **學習旅程 / 主題 / 活動類型** 組織：

```
Home — "Learn Together"
├── Start Here          — 什麼是 AI transformation、如何參與
├── Stories             — 會員/來賓分享的經驗（類 case，但第一人稱）
├── Discuss             — 論壇式討論區
│   ├── Getting Started
│   ├── Work Redesign
│   ├── Governance & Trust
│   ├── Measuring Value
│   ├── Tools & Patterns
│   └── Ask the Community
├── Prompts / Weekly    — 每週一個開放問題（降低發文門檻）
├── Resources           — 社群策展的連結、模板（非 .io 的正式框架）
├── Events              — AMA、office hours（後期）
└── Join / Sign in
```

**與 .io 的差異：**

| 維度 | .io | .org |
|------|-----|------|
| 組織軸 | 職能 × 框架 | 主題 × 學習階段 |
| 內容權威 | 我們撰寫、引用研究 | 社群貢獻 + 我們 facilitation |
| 語氣 | 「這是最佳實務」 | 「這是我們的經驗，你的呢？」 |
| 案例 | Case pattern（第三人稱） | Story（第一人稱、可匿名） |

### 3.3 參考案例（社群 / 變革管理 / 數位轉型）

| 網站/平台 | 類型 | 可借鑑 |
|-----------|------|--------|
| [Discourse Meta — CoP 討論](https://meta.discourse.org/t/working-group-on-communities-of-practice/337560) | 論壇建站經驗 | Categories、weekly prompt、shared drafts |
| [Circle Professional Communities](https://circle.so/platform/professional-communities) | 付費社群平台功能清單 | Events、member directory、digest — 作為功能願望清單 |
| [LearnHouse Communities](https://www.learnhouse.app/features/communities) | Q&A / Ideas / Show & Tell 分類 | **內建 category 模板** 可直接套用 |
| [Howspace](https://howspace.com/learning-and-development/) | 協作式學習 | Pulse、sticky notes、AI  synthesize 討論 — 互動組件靈感 |
| [Prosci Membership](https://www.prosci.com/resources) | 變革管理 practitioner 社群 | 研究 hub + 同儕 + 工具；**內容免費、深度付費** |
| [AITR (.org)](https://www.aitransformationreadiness.org/) | AI transformation 教育/評估 | Canvas、Scorecard、executive program — 偏 .io 但值得看評估工具 |

---

## 四、互動組件：超越靜態網站

### 4.1 互動組件光譜（由淺到深）

| 層級 | 組件 | 需登入 | 技術複雜度 | 建議站點 | 顧問價值 |
|------|------|--------|------------|----------|----------|
| L0 | Dark mode toggle | 否 | 低 | 兩站 | 低 |
| L1 | **Checkbox self-assessment**（單頁，結果在 browser） | 否 | 低 | .io | 中（無 lead） |
| L2 | **Multi-step assessment** + 雷達圖 + PDF 匯出 | 可選 | 中 | .io | 高 |
| L3 | **Saved progress**（需帳號） | 是 | 中 | .io | 高 |
| L4 | **Discussion / forum** | 是 | 中高 | .org | 中（社群） |
| L5 | **Guided dialogue**（依 assessment 結果推薦討論） | 是 | 高 | 兩站 | 很高 |
| L6 | **Consultation request** + CRM 整合 | 是 | 中 | .io | 直接轉換 |

### 4.2 你提出的 Assessment + 登入 + 對話構想

**構想摘要：**
- Checkbox 評估使用者/組織的 AI transformation 需求
- 登入後記錄討論過程
- 累積足夠資訊後，方便接手人力顧問

**市場上類似做法：**

1. **aitransformation.app** — 72 題、自動存 progress、風險旗標、roadmap；**不需帳號**即可開始，降低摩擦
2. **EY / KPMG / Mendix** — 問卷 → **留 email** → 完整報告 / 顧問 follow-up
3. **Evalinator 模板** — 16 題快篩 vs 35 題深度；**分級 assessment** 對應 sales stage
4. **Prosci** — 免費 ADKAR 內容 → Membership 工具 → 認證/顧問

**建議產品設計（分階段）：**

#### Phase A — 無登入（MVP）
- **Quick Check**（5 分鐘）：Three Gaps 各 5 題 checkbox → 即時「你在哪個 gap 最弱」
- 結果可 share link（encoded in URL）或 email 寄給自己
- CTA：深入 Full Assessment / Join .org 討論 / Book intro call

#### Phase B — 輕登入（email magic link 或 OAuth）
- **Full Assessment**（~20–30 題，基於 Nine Capacities 或 Six Domains 簡化版）
- 進度保存、歷史比較（3 個月後重測）
- 依分數推薦：.io 職能 playbook、.org 相關討論串

#### Phase C — 顧問銜接
- Assessment 完成 + 使用者同意 → 內部 dashboard 看到 anonymized aggregate
- **Consultation brief** 自動生成：成熟度、gap、使用者填的「最大挑戰」自由文本
- 可選：在 .org 發「#assessment-reflection」prompt，連結同分數區間的 peer（需隱私設計）

**重要設計原則（呼應 monorepo architecture）：**
- Assessment **邏輯與題庫** → `packages/shared` + `apps/backend`
- .io 呈現「正式、board-ready」報告 UI
- .org 呈現「你的分數不代表對錯，來聊聊」reflection UI
- **同一 backend、不同 frontend 詮釋** — 符合 host-agnostic API

### 4.3 Checkbox Assessment 題庫方向（草案）

可從現有 `knowledge-base/` 提煉三組：

**Group A — Work Redesign（對應 Deloitte 48% 問題）**
- [ ] 我們有在至少一個核心流程做 end-to-end 工作重設計
- [ ] 我們衡量的不是 copilot 登入數，而是 cycle time / 品質
- [ ] ...

**Group B — Governance**
- [ ] 我們有書面定義 AI 可自主動作的邊界（action boundary）
- [ ] 我們知道 AI 出錯時誰負責（accountability）
- [ ] ...

**Group C — Value Measurement**
- [ ] 我們有在部署前定義 outcome hypothesis
- [ ] 我們的 ROI 報告不只含 cost savings
- [ ] ...

每組 8–12 題 → 分數 → 對應 playbook 推薦。

---

## 五、.io vs .org 功能對照表（建議）

| 功能 | .io | .org |
|------|-----|------|
| 職能 Playbook | ✅ 主內容 | ❌ |
| 框架長文 | ✅ | 摘要 + 連到 .io |
| Quick / Full Assessment | ✅ 主入口 | ✅ 「Reflect on your score」版 |
| 討論區 | ❌ 或只讀連結 | ✅ 主互動 |
| Experience stories | 精選案例 | ✅ 會員投稿 |
| Newsletter | 企業洞察 | 社群 digest |
| Consultation CTA | ✅ 明確 | 輕量（「找 peer 先聊」） |
| 登入 | Assessment 保存 | 發文、追蹤討論 |

---

## 六、與顧問服務的漏斗（長期）

```
匿名 Quick Check (.io)
    ↓
Email / 登入 → Full Assessment (.io)
    ↓
推薦 .org 討論串（同主題 peer）
    ↓
Optional: Book discovery call (.io)
    ↓
Internal: Consultation brief（backend 自動彙整）
    ↓
Human consultancy engagement
```

**資料倫理：** 明確 opt-in、GDPR 友好、aggregate analytics 優先於個資濫用。

---

## 七、實作優先序建議（討論用）

| 優先 | 項目 | 站 | 理由 |
|------|------|-----|------|
| P0 | Monorepo scaffold + 兩站 shell（不同 layout/theme） | 兩站 | 基礎 |
| P0 | .io 首頁 + 1 職能頁 + 1 框架頁（MDX） | .io | 驗證 IA |
| P1 | Quick Check（無登入 checkbox） | .io | 你的核心 idea 最小驗證 |
| P1 | .org Discuss 結構（可先 static + 外部 Discourse 或 built-in 簡版） | .org | 社群種子 |
| P2 | Full Assessment + save progress | .io | 需 backend DB |
| P2 | .org Stories 投稿流程 | .org | UGC |
| P3 | 帳號系統統一（兩站 SSO via backend） | 兩站 | 討論記錄 |
| P3 | Consultation brief + internal view | .io/backend | 顧問銜接 |

---

## 八、待你決策的問題

1. **Assessment 深度：** MVP 用 Three Gaps 15 題快篩，還是一開始就做 30+ 題？
2. **.org 討論區：** 自建（Next + DB）vs 嵌入 Discourse（成熟、省開發）？
3. **登入方式：** Email magic link vs Google/GitHub OAuth？
4. **.org 開放程度：** 完全公開可讀、登入才可發文？還是會員制？
5. **兩站 newsletter：** 一份還是兩份？
6. **顧問 CTA 時機：** 第一版就放「Book a call」，還是等 assessment 成熟後？

---

## 九、參考連結彙整

**Digital / AI Transformation Assessment**
- https://digitalreadiness.ey.com/
- https://transformationprofiler.strategyand.pwc.com/
- https://kpmg.com/us/en/articles/2023/kpmg-digital-maturity-assessment.html
- https://www.mendix.com/strategies/digital-transformation/assessment-tool/
- https://www.aitransformation.app/
- https://www.detecon.com/en/ai-readiness-assessment
- https://www.evalinator.com/digital-maturity-assessment-template/

**Change Management / Community**
- https://www.prosci.com/resources
- https://www.aitransformationreadiness.org/
- https://meta.discourse.org/t/working-group-on-communities-of-practice/337560
- https://www.learnhouse.app/features/communities
- https://howspace.com/learning-and-development/

**Internal**
- `knowledge-base/` — 內容草稿
- `docs/POSITIONING.md` — 兩站定位
- `docs/ARCHITECTURE.md` — 技術架構
