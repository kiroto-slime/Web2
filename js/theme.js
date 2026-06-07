'use strict';

/* 亮/暗/跟隨系統 主題：
   localStorage 'dh-theme' 可為 'light' | 'dark' | 'system'（預設 dark）
   - 導覽列滑條 #themeSwitch：亮/暗 快切
   - 設定頁 radio name="themePref"：三態完整控制 */
(function () {
    var KEY = 'dh-theme';

    function getPref() {
        try { return localStorage.getItem(KEY) || 'dark'; } catch (e) { return 'dark'; }
    }
    function setPref(v) {
        try { localStorage.setItem(KEY, v); } catch (e) {}
    }
    function systemTheme() {
        return (window.matchMedia &&
            window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
    }
    function resolve(pref) { return pref === 'system' ? systemTheme() : pref; }
    function apply(pref) {
        document.documentElement.setAttribute('data-bs-theme', resolve(pref));
    }

    // 進頁先套用目前設定（theme.js 是最終權威，會修正 head 先前的設定）
    apply(getPref());

    // 跟隨系統時，系統亮暗改變要即時反應
    if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', function () {
            if (getPref() === 'system') apply('system');
        });
    }

    // 導覽列滑條（亮/暗快切）
    var sw = document.getElementById('themeSwitch');
    if (sw) {
        sw.checked = (resolve(getPref()) === 'light');
        sw.addEventListener('change', function () {
            var pref = sw.checked ? 'light' : 'dark';
            setPref(pref);
            apply(pref);
        });
    }

    // 設定頁三態 radio
    var radios = document.querySelectorAll('input[name="themePref"]');
    if (radios.length) {
        radios.forEach(function (r) {
            if (r.value === getPref()) r.checked = true;
            r.addEventListener('change', function () {
                if (!r.checked) return;
                setPref(r.value);
                apply(r.value);
                if (sw) sw.checked = (resolve(r.value) === 'light');
            });
        });
    }
})();
