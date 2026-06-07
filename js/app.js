'use strict';

const TASKS = [
    {
        id: 1,
        title: 'Task 1: 旗開得勝',
        subtitle: '學習如何操作終端',
        description:
            'Linux 系統中通常採用 Terminal 來操作' +
            '每個命令都遵循這種格式 : <code>command [options] [arguments]</code> ' +
            '首先，請在右側終端機中探索一些基本命令。',
        questions: [
            {
                id: 'q1_1',
                text: '列印當前目錄的命令是什麼？?',
                answer: 'pwd',
                hint: 'pwd ?',
            },
            {
                id: 'q1_2',
                text: '哪個命令可以顯示目前登入的使用者?',
                answer: 'whoami',
                hint: '我是誰？',
            },
        ],
    },
    {
        id: 2,
        title: 'Task 2: 探索文件系統',
        subtitle: '文件列表',
        description:
            '<code>ls</code> 命令可以列出檔案和資料夾。' +
            '使用 <code>ls -la</code> 查看隱藏文件以及權限和文件大小等詳細信息。',
        questions: [
            {
                id: 'q2_1',
                text: '要讓 `ls` 指令顯示隱藏文件，需要傳遞什麼參數？',
                answer: '-a',
                hint: 'a...a...apple ?',
            },
            {
                id: 'q2_2',
                text: '/home/ubuntu 目錄下那個隱藏較深的檔案叫什麼名字?',
                answer: '.secret.txt',
                hint: '執行看看上面的指令？',
            },
        ],
    },
    {
        id: 3,
        title: 'Task 3: 可愛的貓咪',
        subtitle: '使用 cat 顯示文件內容',
        description:
            '使用 <code>cat &lt;filename&gt;</code> 讀取檔案的內容 ' +
            '嘗試讀取 <code>readme.txt</code> 和 <code>.secret.txt</code>',
        questions: [
            {
                id: 'q3_1',
                text: '哪個命令可以讀取文件並顯示檔案內容 ?',
                answer: 'cat',
                hint: '聽說你也喜歡貓',
            },
            {
                id: 'q3_2',
                text: '.secret.txt 的內容是什麼?  (格式: FLAG{...})',
                answer: 'FLAG{linux_basics_unlocked}',
                hint: '神奇貓咪總是可以找到隱密的東西',
            },
        ],
    },
    {
        id: 4,
        title: 'Task 4: 古老光碟',
        subtitle: '古老光碟可以帶你探索 Linux 的世界',
        description:
            '使用 <code>cd &lt;directory&gt;</code> 改變目前的目錄。' +
            '使用 <code>cd ..</code> 往上一層, 以及 <code>cd ~</code> 或 <code>cd</code> 回家。 ' +
            '嘗試進入 <code>documents/</code> 並讀取檔案內容',
        questions: [
            {
                id: 'q4_1',
                text: '什麼指令可以立即回到你的主目錄 ?',
                answer: 'cd',
                hint: '古老光碟可以攜帶你',
            },
            {
                id: 'q4_2',
                text: '在路徑中，你的主目錄的簡寫形式是什麼?',
                answer: '~',
                hint: '古老光碟可能喜歡衝浪',
            },
        ],
    },
    {
        id: 5,
        title: 'Task 5: 你需要幫忙？',
        subtitle: '或許辣個男人可以協助你',
        description:
            'Linux 內建系統。使用 <code>man &lt;指令&gt;</code> 要查看任何命令的手冊，請繼續閱讀。 ' +
            '大多數指令允許 <code><command>--help</code> 取得協助 。 ' +
            '嘗試在終端機中使用 <code>man ls</code> or <code>man cat</code>.',
        questions: [
            {
                id: 'q5_1',
                text: '如何取得 `cat` 的指令介紹?',
                answer: 'man cat',
                hint: '聽說辣個男人也喜歡貓',
            },
            {
                id: 'q5_2',
                text: '通常使用哪個標誌可以快速列印命令的使用資訊?',
                answer: '--help',
                hint: '扣除兩次 help ?',
            },
        ],
    },
];

const STORAGE_KEY = 'progress_room_1';

class App {
    constructor() {
        this.tasks              = TASKS;
        this.progress           = this._loadProgress();
        this.taskOpen           = {};
        this.splitActive        = false;
        this.terminal           = null;
        this.startTime          = null;   // 第一題答對時開始計時
        this.completedThisSession = false; // 避免重複彈出 modal

        this._initUI();
        this._initTerminal();
        this._bindSplitBtn();
    }

    _loadProgress() {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            return raw ? JSON.parse(raw) : {};
        } catch { return {}; }
    }

    _saveProgress() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(this.progress));
        } catch {}
    }

    _initUI() {
        this._renderTasks();
        this._updateProgress();
    }

    _initTerminal() {
        this.terminal = new Terminal({
            outputEl:       document.getElementById('terminalOutput'),
            inputEl:        document.getElementById('terminalInput'),
            promptEl:       document.getElementById('promptText'),
            chromeTitleEl:  document.getElementById('chromeTitle'),
        });
    }

    _bindSplitBtn() {
        const btn       = document.getElementById('toggleTerminal');
        const closeBtn  = document.getElementById('closeTerminal');

        btn.addEventListener('click', () => this._toggleSplit());
        closeBtn.addEventListener('click', () => this._closeSplit());
    }

    _toggleSplit() {
        if (this.splitActive) {
            this._closeSplit();
        } else {
            this._openSplit();
        }
    }

    _openSplit() {
        this.splitActive = true;
        const main      = document.getElementById('mainContent');
        const panel     = document.getElementById('terminalPanel');
        const btn       = document.getElementById('toggleTerminal');
        const divider   = document.getElementById('divider');

        main.classList.add('split');
        panel.classList.remove('hidden');
        divider.style.display = 'block';
        btn.classList.add('active');
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="14" rx="1" fill="currentColor"/>
                <rect x="9" y="1" width="6" height="14" rx="1" fill="currentColor" opacity="0.5"/>
            </svg>
            Hide Terminal
        `;

        setTimeout(() => this.terminal.focus(), 100);
    }

    _closeSplit() {
        this.splitActive = false;
        const main    = document.getElementById('mainContent');
        const panel   = document.getElementById('terminalPanel');
        const btn     = document.getElementById('toggleTerminal');
        const divider = document.getElementById('divider');

        main.classList.remove('split');
        panel.classList.add('hidden');
        divider.style.display = 'none';
        btn.classList.remove('active');
        btn.innerHTML = `
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="6" height="14" rx="1" fill="currentColor" opacity="0.5"/>
                <rect x="9" y="1" width="6" height="14" rx="1" fill="currentColor"/>
            </svg>
            Split View
        `;
    }

    _renderTasks() {
        const container = document.getElementById('tasksList');
        container.innerHTML = '';

        this.tasks.forEach((task, idx) => {
            const allPrev   = this.tasks.slice(0, idx).every(t => this._taskDone(t));
            const isDone    = this._taskDone(task);
            const isLocked  = idx > 0 && !allPrev;
            const isOpen    = !!this.taskOpen[task.id];
            const isActive  = !isDone && !isLocked;

            const card = document.createElement('div');
            card.className = [
                'task-card',
                isDone   ? 'completed' : '',
                isActive ? 'active'    : '',
                isLocked ? 'locked'    : '',
                isOpen   ? 'open'      : '',
            ].filter(Boolean).join(' ');
            card.id = `task-${task.id}`;

            card.innerHTML = `
                <div class="task-header" data-taskid="${task.id}">
                    <div class="task-number">${isDone ? '✓' : task.id}</div>
                    <div class="task-info">
                        <div class="task-title">${task.title}</div>
                        <div class="task-subtitle">${isLocked ? '🔒 Complete previous task first' : task.subtitle}</div>
                    </div>
                    <span class="task-status">${isDone ? '✅' : isLocked ? '🔒' : '▸'}</span>
                    <span class="task-chevron">▾</span>
                </div>
                <div class="task-body">
                    <div class="task-description">${task.description}</div>
                    <div class="questions-list">
                        ${task.questions.map(q => this._renderQuestion(q)).join('')}
                    </div>
                </div>
            `;

            card.querySelector('.task-header').addEventListener('click', () => {
                if (isLocked) return;
                this._toggleTask(task.id);
            });

            card.querySelectorAll('[data-qid]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const qid   = btn.dataset.qid;
                    const input = card.querySelector(`#input-${qid}`);
                    this._checkAnswer(task, qid, input);
                });
            });

            card.querySelectorAll('[data-hint]').forEach(btn => {
                btn.addEventListener('click', () => {
                    const hintEl = card.querySelector(`#hint-${btn.dataset.hint}`);
                    hintEl.classList.toggle('visible');
                    btn.textContent = hintEl.classList.contains('visible') ? '🙈 Hide Hint' : '💡 Hint';
                });
            });

            card.querySelectorAll('.answer-input').forEach(input => {
                input.addEventListener('keydown', e => {
                    if (e.key === 'Enter') {
                        const qid = input.dataset.inputqid;
                        this._checkAnswer(task, qid, input);
                    }
                });

                const qid = input.dataset.inputqid;
                if (this.progress[qid]) {
                    input.value    = this.progress[qid].value;
                    input.disabled = true;
                    input.classList.add('correct');
                }
            });

            container.appendChild(card);
        });
    }

    _renderQuestion(q) {
        const done = !!this.progress[q.id];
        return `
            <div class="question-item" id="qitem-${q.id}">
                <div class="question-text">${q.text}</div>
                <div class="answer-row">
                    <input
                        type="text"
                        class="answer-input"
                        id="input-${q.id}"
                        data-inputqid="${q.id}"
                        placeholder="Your answer..."
                        ${done ? 'disabled value="' + this.progress[q.id].value + '"' : ''}
                        ${done ? 'class="answer-input correct"' : ''}
                    >
                    <button class="btn-check" data-qid="${q.id}" ${done ? 'disabled' : ''}>
                        ${done ? '✓ Correct' : 'Submit'}
                    </button>
                </div>
                ${q.hint ? `
                    <button class="btn-hint" data-hint="${q.id}">💡 Hint</button>
                    <div class="hint-box" id="hint-${q.id}">💡 ${q.hint}</div>
                ` : ''}
                <div class="feedback-msg" id="feedback-${q.id}"></div>
            </div>
        `;
    }

    _toggleTask(taskId) {
        this.taskOpen[taskId] = !this.taskOpen[taskId];
        this._renderTasks();
    }

    _checkAnswer(task, qid, input) {
        if (!input || input.disabled) return;

        const question = task.questions.find(q => q.id === qid);
        if (!question) return;

        const userVal  = input.value.trim();
        const correct  = question.answer.trim().toLowerCase();
        const feedback = document.getElementById(`feedback-${qid}`);
        const btn      = document.querySelector(`[data-qid="${qid}"]`);

        if (!userVal) {
            this._showFeedback(feedback, 'Please enter an answer.', 'wrong');
            return;
        }

        if (userVal.toLowerCase() === correct) {
            input.disabled = true;
            input.classList.add('correct');
            input.classList.remove('wrong');
            if (btn) { btn.textContent = '✓ Correct'; btn.disabled = true; }
            this._showFeedback(feedback, '✓ Correct! Well done.', 'correct');
            /* 第一題答對時開始計時 */
            if (!this.startTime) this.startTime = Date.now();

            this.progress[qid] = { value: userVal };
            this._saveProgress();
            this._updateProgress();
            this._maybeUnlockNext(task);

            /* 如果這次作答讓所有任務全部完成，顯示完成 Modal */
            if (!this.completedThisSession && this._allDone()) {
                this.completedThisSession = true;
                setTimeout(() => this._showCompletionModal(), 700);
            }
        } else {
            input.classList.add('wrong');
            setTimeout(() => input.classList.remove('wrong'), 400);
            this._showFeedback(feedback, '✗ Incorrect. Try again.', 'wrong');
        }
    }

    _showFeedback(el, msg, type) {
        if (!el) return;
        el.textContent = msg;
        el.className   = `feedback-msg show ${type}`;
        setTimeout(() => el.classList.remove('show'), 3000);
    }

    _taskDone(task) {
        return task.questions.every(q => !!this.progress[q.id]);
    }

    _maybeUnlockNext(task) {
        if (this._taskDone(task)) {
            this._renderTasks();
        }
    }

    _allDone() {
        return this.tasks.every(t => this._taskDone(t));
    }

    _updateProgress() {
        const total = this.tasks.length;
        const done  = this.tasks.filter(t => this._taskDone(t)).length;
        const pct   = total ? Math.round((done / total) * 100) : 0;

        document.getElementById('progressLabel').textContent = `${done} / ${total} tasks`;
        document.getElementById('progressFill').style.width  = pct + '%';
    }

    /* ── 計算分數 ── */
    _calcScore() {
        const correct   = Object.keys(this.progress).length;
        const base      = correct * 100;
        const roomBonus = this._allDone() ? 500 : 0;
        const elapsed   = this.startTime
            ? Math.floor((Date.now() - this.startTime) / 1000)
            : 0;
        const timeBonus = Math.max(0, 300 - Math.floor(elapsed / 10));
        return { total: base + roomBonus + timeBonus, base, roomBonus, timeBonus, elapsed };
    }

    /* ── 完成 Modal（Bootstrap modal）── */
    _showCompletionModal() {
        const { total, base, roomBonus, timeBonus, elapsed } = this._calcScore();
        const mm = String(Math.floor(elapsed / 60));
        const ss = String(elapsed % 60).padStart(2, '0');

        const modalEl = document.createElement('div');
        modalEl.className = 'modal fade';
        modalEl.setAttribute('tabindex', '-1');
        modalEl.innerHTML = `
            <div class="modal-dialog modal-dialog-centered">
                <div class="modal-content border-secondary">
                    <div class="modal-header border-0 flex-column text-center pb-0">
                        <div style="font-size:3rem;line-height:1">🎉</div>
                        <h5 class="modal-title fw-bold mt-2">恭喜完成所有任務！</h5>
                        <p class="text-muted small mb-0">Linux 基礎知識</p>
                    </div>
                    <div class="modal-body pt-3">
                        <div class="list-group list-group-flush rounded border border-secondary">
                            <div class="list-group-item d-flex justify-content-between border-secondary bg-transparent">
                                <span class="text-secondary">答題基本分</span>
                                <span class="fw-semibold">+${base}</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between border-secondary bg-transparent">
                                <span class="text-secondary">完成房間獎勵</span>
                                <span class="fw-semibold">+${roomBonus}</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between border-secondary bg-transparent">
                                <span class="text-secondary">時間獎勵（${mm}:${ss}）</span>
                                <span class="fw-semibold">+${timeBonus}</span>
                            </div>
                            <div class="list-group-item d-flex justify-content-between border-0 bg-transparent fw-bold">
                                <span>總分</span>
                                <span class="text-primary fs-4 fw-bold">${total.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer border-secondary">
                        <button type="button" class="btn btn-outline-secondary"
                                data-bs-dismiss="modal">繼續</button>
                        <a href="leaderboard.html" class="btn btn-primary">查看排行榜</a>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(modalEl);
        const bsModal = new bootstrap.Modal(modalEl);
        bsModal.show();

        modalEl.addEventListener('hidden.bs.modal', () => {
            bsModal.dispose();
            modalEl.remove();
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new App();
});
