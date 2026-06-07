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
