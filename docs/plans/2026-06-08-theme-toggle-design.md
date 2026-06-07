# 亮色 / 暗色主題切換功能 — 設計文件

**日期：** 2026-06-08
**專案：** Don't HackMe（GitHub Pages 靜態資安學習平台）
**目標：** 為每個頁面加入亮色 / 暗色主題切換滑條，語法簡單（高職生可維護），不大改現有結構。

---

## 1. 需求摘要

- 每個頁面右上角都有一個**滑動切換的滑條**，可切亮色 / 暗色。
- 手機模式下，滑條**不可被漢堡選單蓋住**（永遠看得到）。
- 選擇要能**記憶**（跨頁面、下次再來也記得）。
- 預設**深色**（維持現狀）。
- 這是 GitHub Pages 靜態站，完成度高，只加功能、不大改。

## 2. 已確認的設計決定

| 項目 | 決定 |
| --- | --- |
| 亮色範圍 | 首頁、排行榜做完整亮色 |
| 房間頁(room.html) | 標頭 / 任務卡 / 題目區轉亮色；**終端機視窗維持深色** |
| 首頁 hero 裝飾終端機 | 維持深色 |
| 預設主題 | 深色 |
| 記憶方式 | `localStorage`，key = `dh-theme` |
| 滑條外觀 | Bootstrap 原生 `form-switch` + 🌙 / ☀️ 圖示 |
| 滑條位置（首頁/排行榜） | 導覽列 `.navbar-collapse` **外側**、漢堡按鈕前，手機永遠可見 |
| 滑條位置（房間頁） | 現有 `.header-right` 內 |

## 3. 採用方案：Bootstrap `data-bs-theme` 切換 + 少量亮色覆蓋

切換時把 `<html>` 的 `data-bs-theme` 在 `dark` / `light` 間切，Bootstrap 元件自動變色。
首頁與排行榜的內容多由 JS 以 Bootstrap class 動態產生（`.card`、`.table`、`.text-muted`、`.badge`…），會自動跟著主題；
只需用一個附加 CSS 檔補上少數「寫死深色」的地方。

**未採用：**
- CSS 變數重構（要大改現有 CSS，違反「不要大改」）。
- 兩套完整 CSS 檔互換（重複多、維護累）。

## 4. 檔案異動

### 新增（2 個）

- **`css/theme-light.css`** — 所有 `[data-bs-theme="light"]` 亮色覆蓋：
  - 品牌色：重新宣告 `--bs-primary` 藍、`--bs-success` 綠等（其餘背景/文字交給 Bootstrap 內建亮色預設）。
  - 導覽列背景（`.app-navbar` 的亮色值）。
  - 房間頁 chrome 亮色覆蓋：`.header`、`.room-info-card`、`.task-card`、`.task-header`、`.question-item`、`.answer-input`、`.tag`、文字色等（約 15–20 條）。`.terminal-panel` 區塊**不覆蓋**（維持深色）。
- **`js/theme.js`** — 讀目前主題設定滑條狀態 + 監聽 `change` 切換 + 寫入 `localStorage`。讀寫包 try/catch，失敗 fallback 深色。

### 修改（小改）

- **`index.html` / `leaderboard.html` / `room.html`**
  - `<head>` 最前面加 3 行防閃爍 inline script（CSS 載入前先套用 localStorage 主題）。
  - `<head>` 引用 `css/theme-light.css`。
  - 加入滑條 HTML。
  - body 結尾引用 `js/theme.js`。
- **`index.html` / `leaderboard.html`**
  - 導覽列 inline `style="background:rgba(22,27,34,0.95);..."` → 改為 class `.app-navbar`（深色值移到 styles.css，亮色值在 theme-light.css）。
  - 滑條放 `.navbar-collapse` 外側、`.navbar-toggler` 前，`ms-auto` 推右，`order-lg-last` 桌面回最右。
- **`js/leaderboard.js`**
  - 表格 `class="table table-dark table-hover"` → 移除 `table-dark`，讓表格自動跟主題。
- **`.gitignore`（新增）**
  - 忽略：作業系統垃圾檔（`Thumbs.db`、`.DS_Store`、`desktop.ini`）、備份 zip（`備份*.zip`、`*.zip`）、編輯器設定（`.vscode/`、`.idea/`）、Claude Code 紀錄（`.claude/`）。
  - 額外動作：`git rm --cached 備份001.zip`（已追蹤的備份檔移除追蹤，本機檔案保留）。

### 不動

- 所有現有深色 CSS、終端機相關（`.terminal-panel`、`.hero-terminal`、`js/terminal.js`）、資料檔、其他邏輯。

## 5. 切換機制（資料流）

```
進入頁面
  → <head> inline script 讀 localStorage('dh-theme')（無則 'dark'）
  → 設定 <html data-bs-theme>（CSS 套用，無閃爍）
  → 頁面渲染
  → body 結尾 theme.js 依目前主題設定滑條 checked 狀態
使用者切滑條
  → theme.js 改 <html data-bs-theme>
  → 寫入 localStorage('dh-theme')
```

## 6. 錯誤處理

- localStorage 讀 / 寫皆包 try/catch；在無痕模式或被瀏覽器封鎖時 fallback 為預設深色，不報錯。
- 滑條元素以 id 取得前先判斷是否存在（`if (!sw) return;`），避免缺元素時出錯。

## 7. 測試方式（本機瀏覽器，靜態站）

逐一在三個頁面驗證：
1. 切換滑條 → 主題即時改變。
2. 重新整理 → 記住上次選擇。
3. 從首頁切亮色 → 跳到排行榜 / 房間頁仍是亮色（跨頁記憶）。
4. 縮到手機寬度 → 滑條可見、**不被漢堡選單蓋住**。
5. 亮色模式下各區塊文字 / 卡片 / 表格 / 按鈕皆清楚可讀。
6. 房間頁終端機視窗在亮色模式仍維持深色。
7. 預設（清掉 localStorage）首次進站為深色。

## 8. 風險與緩解

| 風險 | 緩解 |
| --- | --- |
| 寫死顏色遺漏，亮色某處看不清 | 測試步驟 5 逐區檢查；發現再補 theme-light.css |
| inline navbar 背景無法被 CSS 覆蓋 | 改成 `.app-navbar` class 處理 |
| 重整時主題閃爍 | head inline script 在 CSS 前先套用 |
