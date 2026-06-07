'use strict';

class LeaderboardPage {
    constructor() {
        this.entries = LEADERBOARD_DATA;   // 直接使用 data.js 裡的靜態陣列
        this._populateRoomFilter();
        this._render('all');
        this._bindEvents();
    }

    /* ── 排序：先比分數（高→低），同分再比耗時（少→多）── */
    _sorted(roomFilter) {
        const list = roomFilter === 'all'
            ? [...this.entries]
            : this.entries.filter(e => String(e.roomId) === String(roomFilter));

        return list.sort((a, b) =>
            b.score !== a.score ? b.score - a.score : a.timeSpent - b.timeSpent
        );
    }

    /* ── 把所有不重複的房間名稱塞進下拉選單 ── */
    _populateRoomFilter() {
        const select = document.getElementById('roomFilter');
        const seen   = new Set();
        this.entries.forEach(e => {
            if (!seen.has(e.roomId)) {
                seen.add(e.roomId);
                const opt = document.createElement('option');
                opt.value       = e.roomId;
                opt.textContent = e.roomTitle;
                select.appendChild(opt);
            }
        });
    }

    /* ── 整體渲染 ── */
    _render(filter) {
        const sorted = this._sorted(filter);
        this._renderPodium(sorted.slice(0, 3));
        this._renderTable(sorted);
    }

    /* ── 頒獎台（前三名）── */
    _renderPodium(top) {
        /* 視覺順序：左=2nd，中=1st，右=3rd */
        const order   = [top[1], top[0], top[2]];
        const medals  = ['🥈', '🥇', '🥉'];
        const labels  = ['2nd', '1st', '3rd'];
        const classes = ['podium-block-second', 'podium-block-first', 'podium-block-third'];

        const slots = order.map((e, i) => {
            if (!e) return `
                <div class="podium-slot">
                    <div class="podium-info"></div>
                    <div class="podium-block ${classes[i]}" style="opacity:0.2">
                        <span class="podium-rank">${labels[i]}</span>
                    </div>
                </div>`;

            return `
                <div class="podium-slot">
                    <div class="podium-info">
                        <span class="podium-medal">${medals[i]}</span>
                        <span class="podium-name">${this._esc(e.name)}</span>
                        <span class="podium-score">${e.score.toLocaleString()}</span>
                        <span class="podium-time">${this._fmtTime(e.timeSpent)}</span>
                    </div>
                    <div class="podium-block ${classes[i]}">
                        <span class="podium-rank">${labels[i]}</span>
                    </div>
                </div>`;
        });

        document.getElementById('podiumWrap').innerHTML =
            `<div class="podium-stage">${slots.join('')}</div>`;
    }

    /* ── 完整排名表格（Bootstrap table）── */
    _renderTable(sorted) {
        const rows = sorted.map((e, idx) => {
            const rank  = idx + 1;
            const medal = rank <= 3 ? ['🥇','🥈','🥉'][rank-1] : `<span class="text-muted">#${rank}</span>`;
            const rowCls = rank === 1 ? 'table-warning' : rank === 2 ? 'table-secondary' : rank === 3 ? '' : '';
            return `
                <tr class="${rowCls}">
                    <td class="text-center fs-5">${medal}</td>
                    <td>
                        <div class="d-flex align-items-center gap-2">
                            <div class="lb-av">${e.name[0].toUpperCase()}</div>
                            <span class="fw-semibold">${this._esc(e.name)}</span>
                        </div>
                    </td>
                    <td class="text-muted small">${this._esc(e.roomTitle)}</td>
                    <td class="fw-bold text-primary">${e.score.toLocaleString()}</td>
                    <td class="text-muted">${e.correctAnswers} / ${e.totalQuestions}</td>
                    <td class="text-muted">${this._fmtTime(e.timeSpent)}</td>
                    <td class="text-muted small">${this._fmtDate(e.date)}</td>
                </tr>`;
        });

        document.getElementById('lbTableWrap').innerHTML = `
            <div class="table-responsive">
                <table class="table table-dark table-hover mb-0">
                    <thead class="text-muted small">
                        <tr>
                            <th class="text-center" style="width:52px">#</th>
                            <th>玩家</th><th>房間</th>
                            <th>得分</th><th>答對</th><th>耗時</th><th>日期</th>
                        </tr>
                    </thead>
                    <tbody>${rows.join('')}</tbody>
                </table>
            </div>`;
    }

    /* ── 事件 ── */
    _bindEvents() {
        document.getElementById('roomFilter').addEventListener('change', e => {
            this._render(e.target.value);
        });

        /* 清除按鈕保留，但只是重置畫面（靜態資料不可真正刪除）*/
        document.getElementById('clearBtn').addEventListener('click', () => {
            alert('靜態模式：排行榜資料寫死在 data.js，無法從介面刪除。');
        });
    }

    /* ── 工具 ── */
    _fmtTime(s) {
        if (s == null) return '—';
        return `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`;
    }

    _fmtDate(ts) {
        return new Date(ts).toLocaleDateString('zh-TW', {
            month:'short', day:'numeric'
        });
    }

    _esc(str) {
        return String(str)
            .replace(/&/g,'&amp;').replace(/</g,'&lt;')
            .replace(/>/g,'&gt;').replace(/"/g,'&quot;');
    }
}

document.addEventListener('DOMContentLoaded', () => new LeaderboardPage());
