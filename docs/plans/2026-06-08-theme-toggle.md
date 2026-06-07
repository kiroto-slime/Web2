# 亮色/暗色主題切換 Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 為 Don't HackMe 三個頁面加入右上角亮色/暗色切換滑條，記憶選擇、預設深色、手機不被漢堡選單蓋住，且不大改現有結構。

**Architecture:** 用 Bootstrap 原生 `data-bs-theme` 在 `<html>` 上切 `dark`/`light`。首頁與排行榜的 Bootstrap 元件自動變色，只用一個附加 `css/theme-light.css` 補寫死深色處；一個共用 `js/theme.js` 處理滑條與 `localStorage`。終端機視窗永遠深色。

**Tech Stack:** 純靜態 HTML / CSS / Vanilla JS、Bootstrap 5.3.3、GitHub Pages。

**設計文件：** `docs/plans/2026-06-08-theme-toggle-design.md`

**測試方式：** 本專案無測試框架，採**本機瀏覽器手動驗證**（用 VS Code Live Server 或直接以瀏覽器開檔）。每個 Task 都附明確的觀察結果。

---

## Task 0: 加入 .gitignore 並移除已追蹤的備份檔

**Files:**
- Create: `.gitignore`

**Step 1: 建立 `.gitignore`**

內容：

```gitignore
# 作業系統垃圾檔
Thumbs.db
ehthumbs.db
desktop.ini
.DS_Store

# 備份檔
備份*.zip
*.zip

# 編輯器設定
.vscode/
.idea/

# Claude Code 紀錄
.claude/
```

**Step 2: 把已追蹤的備份檔移出追蹤（本機保留）**

Run:
```bash
git rm --cached 備份001.zip
```
Expected: 顯示 `rm '備份001.zip'`，且本機檔案仍在。

**Step 3: 驗證**

Run:
```bash
git status
```
Expected: `備份001.zip` 出現在「to be committed」的 deleted（從 git 移除），且不再被追蹤；`.gitignore` 為新檔。

**Step 4: Commit**

```bash
git add .gitignore
git commit -m "chore: add .gitignore and untrack backup zip"
```

---

## Task 1: 導覽列背景改為可換色的 class（首頁 + 排行榜）

把 inline 寫死的深色背景搬到 styles.css，亮色模式才能覆蓋。

**Files:**
- Modify: `css/styles.css`（檔尾新增）
- Modify: `index.html:14-15`
- Modify: `leaderboard.html:17-18`

**Step 1: 在 `css/styles.css` 檔尾新增 `.app-navbar`**

```css
/* ===== 導覽列背景（可被亮色主題覆蓋）===== */
.app-navbar {
    background: rgba(22,27,34,0.95);
    backdrop-filter: blur(12px);
}
```

**Step 2: 修改 `index.html` 導覽列**

把：
```html
<nav class="navbar navbar-expand-lg sticky-top border-bottom border-secondary"
     style="background:rgba(22,27,34,0.95);backdrop-filter:blur(12px)">
```
改成：
```html
<nav class="navbar navbar-expand-lg sticky-top border-bottom border-secondary app-navbar">
```

**Step 3: 同樣修改 `leaderboard.html` 導覽列**（與 Step 2 相同改法）

**Step 4: 瀏覽器驗證**

開 `index.html` 與 `leaderboard.html`。
Expected: 外觀與原本完全相同（深色半透明導覽列、有模糊效果）。

**Step 5: Commit**

```bash
git add css/styles.css index.html leaderboard.html
git commit -m "refactor: move navbar background to .app-navbar class"
```

---

## Task 2: 排行榜表格移除強制深色

`table-dark` 會強制深色，移除後表格才會跟著主題。

**Files:**
- Modify: `js/leaderboard.js:104`

**Step 1: 修改表格 class**

把：
```js
<table class="table table-dark table-hover mb-0">
```
改成：
```js
<table class="table table-hover mb-0">
```

**Step 2: 瀏覽器驗證（目前仍深色主題）**

開 `leaderboard.html`。
Expected: 表格仍清楚可讀（深色主題下 Bootstrap `.table` 本來就會用深色變數）。前三名底色、文字顏色正常。

**Step 3: Commit**

```bash
git add js/leaderboard.js
git commit -m "refactor: drop forced table-dark so leaderboard table follows theme"
```

---

## Task 3: 建立共用 theme.js（切換邏輯 + localStorage）

**Files:**
- Create: `js/theme.js`

**Step 1: 建立 `js/theme.js`**

```js
'use strict';

/* 亮/暗主題切換：依滑條切 <html data-bs-theme>，並用 localStorage 記住 */
(function () {
    var KEY = 'dh-theme';
    var sw = document.getElementById('themeSwitch');
    if (!sw) return;                       // 頁面沒有滑條就不做事

    // 依目前主題設定滑條開關狀態（深色關、亮色開）
    var now = document.documentElement.getAttribute('data-bs-theme') || 'dark';
    sw.checked = (now === 'light');

    // 切換時改主題並記住
    sw.addEventListener('change', function () {
        var theme = sw.checked ? 'light' : 'dark';
        document.documentElement.setAttribute('data-bs-theme', theme);
        try {
            localStorage.setItem(KEY, theme);
        } catch (e) {
            /* 無痕模式或被封鎖時略過，不影響使用 */
        }
    });
})();
```

**Step 2: 驗證（語法）**

此時尚無滑條 HTML，`theme.js` 也還沒被引用，僅確認檔案存在、無語法錯誤（可在瀏覽器 devtools 貼上執行，應無報錯）。

**Step 3: Commit**

```bash
git add js/theme.js
git commit -m "feat: add shared theme toggle script"
```

---

## Task 4: 建立 theme-light.css（亮色覆蓋）

**Files:**
- Create: `css/theme-light.css`

**Step 1: 建立 `css/theme-light.css`**

```css
/* =========================================================
   亮色主題覆蓋（只在 data-bs-theme="light" 時生效）
   背景/文字大多交給 Bootstrap 內建亮色預設，這裡只補：
   1) 品牌色   2) 導覽列背景   3) 房間頁寫死深色的 chrome
   終端機視窗（.terminal-panel / .hero-terminal）不覆蓋，維持深色。
   ========================================================= */

/* ── 1. 品牌色（沿用深色的藍/綠/黃/紅）── */
[data-bs-theme="light"] {
    --bs-primary:        #1f6feb;
    --bs-primary-rgb:    31,111,235;
    --bs-success:        #2da44e;
    --bs-success-rgb:    45,164,78;
    --bs-warning:        #bf8700;
    --bs-warning-rgb:    191,135,0;
    --bs-danger:         #cf222e;
    --bs-danger-rgb:     207,34,46;
    --bs-link-color:     #1f6feb;
    --bs-link-hover-color:#1a5fcc;
}

[data-bs-theme="light"] .btn-primary {
    --bs-btn-bg:            #1f6feb;
    --bs-btn-border-color:  #1f6feb;
    --bs-btn-hover-bg:      #1a5fcc;
    --bs-btn-hover-border-color: #1a5fcc;
    --bs-btn-active-bg:     #1a5fcc;
    color: #fff !important;
}

/* form-control 亮色（覆蓋 styles.css 寫死的深色 input）*/
[data-bs-theme="light"] .form-control {
    background-color: #ffffff;
    border-color: #d0d7de;
    color: #1f2328;
}
[data-bs-theme="light"] .form-control:focus {
    background-color: #ffffff;
    border-color: #1f6feb;
    color: #1f2328;
    box-shadow: 0 0 0 0.25rem rgba(31,111,235,0.25);
}

/* ── 2. 導覽列背景 ── */
[data-bs-theme="light"] .app-navbar {
    background: rgba(255,255,255,0.95);
}

/* ── 3. 房間頁 chrome（題目區轉亮，終端機維持深色）── */
[data-bs-theme="light"] .header {
    background: #f6f8fa;
    border-bottom-color: #d0d7de;
}
[data-bs-theme="light"] .logo { color: #1f2328; }
[data-bs-theme="light"] .room-title-header { color: #57606a; }
[data-bs-theme="light"] .progress-label { color: #57606a; }
[data-bs-theme="light"] .progress-track { background: #d0d7de; }
[data-bs-theme="light"] .header-sep { background: #d0d7de; }
[data-bs-theme="light"] .btn-back { color: #57606a; }
[data-bs-theme="light"] .btn-back:hover { color: #1f2328; background: rgba(0,0,0,0.05); }
[data-bs-theme="light"] .btn-split {
    background: #ffffff; border-color: #d0d7de; color: #1f2328;
}
[data-bs-theme="light"] .btn-split:hover { background: #f3f4f6; border-color: #1f6feb; color: #1f6feb; }

[data-bs-theme="light"] .room-info-card {
    background: #ffffff; border-color: #d0d7de;
}
[data-bs-theme="light"] .room-name { color: #1f2328; }
[data-bs-theme="light"] .room-desc { color: #57606a; }

[data-bs-theme="light"] .task-card {
    background: #ffffff; border-color: #d0d7de;
}
[data-bs-theme="light"] .task-header:hover { background: #f3f4f6; }
[data-bs-theme="light"] .task-title { color: #1f2328; }
[data-bs-theme="light"] .task-subtitle { color: #8c959f; }
[data-bs-theme="light"] .task-body { border-top-color: #d0d7de; }
[data-bs-theme="light"] .task-description { color: #57606a; border-bottom-color: #d0d7de; }

[data-bs-theme="light"] .question-item {
    background: #f6f8fa; border-color: #d0d7de;
}
[data-bs-theme="light"] .question-text { color: #1f2328; }
[data-bs-theme="light"] .answer-input {
    background: #ffffff; border-color: #d0d7de; color: #1f2328;
}
[data-bs-theme="light"] .answer-input:focus { border-color: #1f6feb; }
```

**Step 2: 驗證（暫時手動）**

在瀏覽器 devtools 把 `<html>` 的 `data-bs-theme` 手動改成 `light`（Task 5 以後才有滑條）。
注意：此檔尚未被任何頁面引用，本步驟僅在引用後生效，留待 Task 5/6/7 一併驗證。

**Step 3: Commit**

```bash
git add css/theme-light.css
git commit -m "feat: add light theme override stylesheet"
```

---

## Task 5: 首頁接上主題切換（index.html）

**Files:**
- Modify: `index.html`（head、navbar、body 結尾）

**Step 1: head 加防閃爍 script + 引用亮色 CSS**

在 `index.html` `<head>` 內、`css/styles.css` 連結**之前**加入：

```html
<script>
    (function () {
        try {
            var t = localStorage.getItem('dh-theme') || 'dark';
            document.documentElement.setAttribute('data-bs-theme', t);
        } catch (e) {}
    })();
</script>
```

在 `css/home.css` 連結**之後**加入：

```html
<link rel="stylesheet" href="css/theme-light.css">
```

**Step 2: 導覽列加滑條（放 collapse 外側，手機不被漢堡蓋住）**

在 `<a class="navbar-brand">…</a>` 之後、`<button class="navbar-toggler">` 之前，插入：

```html
<div class="form-check form-switch d-flex align-items-center gap-1 m-0 ms-auto me-2 order-lg-last">
    <span style="font-size:14px">🌙</span>
    <input class="form-check-input m-0" type="checkbox" role="switch" id="themeSwitch">
    <span style="font-size:14px">☀️</span>
</div>
```

**Step 3: body 結尾引用 theme.js**

在 `<script src="js/home.js"></script>` 之後加入：

```html
<script src="js/theme.js"></script>
```

**Step 4: 瀏覽器驗證**

開 `index.html`：
- Expected: 預設深色，右上角有滑條（🌙 + 開關 + ☀️）。
- 點滑條 → 整頁切亮色（白底、卡片變白、按鈕藍色清楚）；hero 裝飾終端機維持深色。
- 重整 → 仍是亮色（記憶生效）。
- 縮到手機寬度（devtools 切手機）→ 滑條在右上角可見，漢堡選單在更右側，**滑條沒被選單蓋住**；展開漢堡選單時滑條仍可見。

**Step 5: Commit**

```bash
git add index.html
git commit -m "feat: wire theme toggle into home page"
```

---

## Task 6: 排行榜接上主題切換（leaderboard.html）

**Files:**
- Modify: `leaderboard.html`（head、navbar、body 結尾）

**Step 1: head 加防閃爍 script + 引用亮色 CSS**

在 `<head>`、`css/styles.css` 之前加入與 Task 5 Step 1 相同的 inline script；
在 `css/leaderboard.css` 之後加入 `<link rel="stylesheet" href="css/theme-light.css">`。

**Step 2: 導覽列加滑條**

與 Task 5 Step 2 相同，插入到 `navbar-brand` 之後、`navbar-toggler` 之前。

**Step 3: body 結尾引用 theme.js**

在 `<script src="js/leaderboard.js"></script>`（或最後一支 script）之後加入：

```html
<script src="js/theme.js"></script>
```

**Step 4: 瀏覽器驗證**

開 `leaderboard.html`：
- Expected: 滑條可切換；亮色下表格、頒獎台、卡片、徽章皆清楚可讀。
- 從首頁切亮色後再點到排行榜 → 仍是亮色（跨頁記憶）。
- 手機寬度 → 滑條不被漢堡選單蓋住。

**Step 5: Commit**

```bash
git add leaderboard.html
git commit -m "feat: wire theme toggle into leaderboard page"
```

---

## Task 7: 房間頁接上主題切換（room.html）

房間頁無漢堡選單，滑條放現有 `.header-right`。

**Files:**
- Modify: `room.html`（head、header-right、body 結尾）

**Step 1: head 加防閃爍 script + 引用亮色 CSS**

在 `<head>`、`css/styles.css` 之前加入與 Task 5 Step 1 相同 inline script；
在 `css/styles.css` 之後加入 `<link rel="stylesheet" href="css/theme-light.css">`。

**Step 2: header-right 加滑條**

在 `<div class="header-right">` 內、最前面（progress-wrap 之前）插入：

```html
<div class="form-check form-switch d-flex align-items-center gap-1 m-0">
    <span style="font-size:14px">🌙</span>
    <input class="form-check-input m-0" type="checkbox" role="switch" id="themeSwitch">
    <span style="font-size:14px">☀️</span>
</div>
```

**Step 3: body 結尾引用 theme.js**

在 `<script src="js/app.js"></script>` 之後加入：

```html
<script src="js/theme.js"></script>
```

**Step 4: 瀏覽器驗證**

開 `room.html`：
- Expected: 右上角有滑條。亮色下標頭、房間資訊卡、任務卡、題目區、輸入框皆轉亮且清楚。
- **終端機視窗（按 Split View 開啟）在亮色模式仍維持深色。**
- 跨頁記憶：從首頁切亮色 → 進房間頁仍亮色。

**Step 5: Commit**

```bash
git add room.html
git commit -m "feat: wire theme toggle into room page"
```

---

## Task 8: 全站總驗收

**Step 1: 清空 localStorage 驗證預設**

在 devtools Console：`localStorage.removeItem('dh-theme')` 後重整每頁。
Expected: 三頁皆為深色（預設）。

**Step 2: 逐項走過驗收清單**

- [ ] 三頁都有滑條，位置在右上角
- [ ] 切換即時生效（三頁）
- [ ] 重整記住選擇（三頁）
- [ ] 跨頁記憶（首頁→排行榜→房間頁一致）
- [ ] 手機寬度滑條不被漢堡選單蓋住（首頁、排行榜）
- [ ] 亮色下文字/卡片/表格/按鈕清楚可讀（三頁）
- [ ] 終端機視窗（房間頁 + 首頁 hero）維持深色
- [ ] 無 console 報錯

**Step 3: （若有任何區塊亮色看不清）補 theme-light.css 對應規則，再 commit**

**Step 4: 最終 commit（若 Step 3 有改）**

```bash
git add -A
git commit -m "fix: polish light theme readability"
```
