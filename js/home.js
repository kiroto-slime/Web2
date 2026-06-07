
/* ── Prompt HTML 常數（先定義，DEMO_SCRIPT 才能引用）── */
const PROMPT_HTML = '<span style="color:#58a6ff;font-weight:600">slime@slimebvs.net:~$</span>&nbsp;';
const MSF_PROMPT  = '<span style="color:#f85149;font-weight:600">msf6</span> <span style="color:#e6edf3;font-weight:600">&gt;</span>&nbsp;';
const MSF_EX      = '<span style="color:#f85149;font-weight:600">msf6</span> <span style="color:#888">exploit(<span style="color:#f0a500">ms17_010_eternalblue</span>)</span> <span style="color:#e6edf3;font-weight:600">&gt;</span>&nbsp;';

const DEMO_SCRIPT = [
    { kind: 'prompt', text: 'whoami' },
    { kind: 'out',    text: '╰─ <span style="color:#e6edf3">slime</span>' },
    { kind: 'prompt', text: 'msfconsole -q' },
    { kind: 'out',    text: '<span style="color:#f85149">       =[ metasploit v6.4.12-dev                   ]=</span>' },
    { kind: 'out',    text: '<span style="color:#888">+ -- --=[ 2300+ exploits  |  900+ payloads          ]=</span>' },
    { kind: 'msf',    text: 'search ms17_010',                p: MSF_PROMPT },
    { kind: 'out',    text: '&nbsp;&nbsp;<span style="color:#888">0</span>&nbsp;&nbsp;<span style="color:#39ff88">exploit/windows/smb/ms17_010_eternalblue</span>&nbsp;&nbsp;<span style="color:#f0a500">excellent</span>' },
    { kind: 'msf',    text: 'use 0',                          p: MSF_PROMPT },
    { kind: 'out',    text: '<span style="color:#58a6ff">[*]</span> Using exploit/windows/smb/ms17_010_eternalblue' },
    { kind: 'msf',    text: 'set RHOSTS 10.10.10.40',         p: MSF_EX },
    { kind: 'out',    text: '<span style="color:#e6edf3">RHOSTS =&gt; 10.10.10.40</span>' },
    { kind: 'msf',    text: 'run',                               p: MSF_EX },
    { kind: 'out',    text: '<span style="color:#58a6ff">[*]</span> Successfully obtained Shell'},
    { kind: 'out',    text: '<span style="color:#e6edf3">hackme  > whoami</span>'},
    { kind: 'out',    text:'╰─ <span style="color:#e6edf3">hackme</span>'},
    { kind: 'out',    text:'╰─ ^C'},
    { kind: 'prompt',    text:''}

];

const CHAR_DELAY    = 42;
const LINE_PAUSE    = 420;

const MAX_LINES     = 8;

function runHeroTypewriter(el) {
    let lines     = [];
    let scriptIdx = 0;

    function render(extra) {
        el.innerHTML = lines.join('<br>') + (lines.length && extra ? '<br>' : '') + (extra || '');
    }

    function pushLine(content) {
        content.split('\n').forEach(l => {
            lines.push(l);
            while (lines.length > MAX_LINES) lines.shift();
        });
    }

    /* 通用逐字打字：支援任意 promptHtml */
    function typeAny(promptHtml, line, cb) {
        let i = 0;
        function tick() {
            i++;
            render(promptHtml + line.slice(0, i) + '<span style="color:#39ff88;opacity:0.8">█</span>');
            if (i < line.length) setTimeout(tick, CHAR_DELAY);
            else setTimeout(cb, LINE_PAUSE);
        }
        setTimeout(tick, 160);
    }

    function printOut(line, cb) {
        pushLine(line);
        render();
        setTimeout(cb, LINE_PAUSE * 0.6);
    }

    function next() {


        const step = DEMO_SCRIPT[scriptIdx++];

        if (step.kind === 'prompt' || step.kind === 'msf') {
            const ph = step.p || PROMPT_HTML;
            if (step.text === '') {
                pushLine(ph);
                render();
                return;
            }
            typeAny(ph, step.text, () => {
                pushLine(ph + step.text);
                next();
            });
        } else {
            printOut(step.text, next);
        }
    }

    next();
}

/* ─── HomePage class ─── */
class HomePage {
    constructor() {
        this._renderPaths();
        this._renderRooms('all');
        this._bindFilters();
        runHeroTypewriter(document.getElementById('heroTerminalContent'));
    }

    _getAnsweredCount(roomId) {
        try {
            const raw = localStorage.getItem(`progress_room_${roomId}`);
            if (!raw) return 0;
            return Object.keys(JSON.parse(raw)).length;
        } catch { return 0; }
    }

    _renderPaths() {
        const grid = document.getElementById('pathsGrid');
        grid.innerHTML = LEARNING_PATHS.map(p => `
            <div class="col-sm-6 col-xl-3">
                <div class="card h-100 border-secondary path-card"
                     style="border-top:3px solid ${p.color} !important;cursor:pointer">
                    <div class="card-body d-flex gap-3 align-items-start">
                        <div class="fs-1 lh-1 flex-shrink-0">${p.icon}</div>
                        <div>
                            <div class="fw-semibold mb-1">${p.title}</div>
                            <div class="text-muted small mb-2">${p.desc}</div>
                            <span class="badge border border-secondary text-secondary fw-normal">
                                ${p.roomCount} 個房間
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        `).join('');
    }

    _renderRooms(filter) {
        const grid = document.getElementById('roomsGrid');
        const list = filter === 'all'
            ? ROOMS
            : ROOMS.filter(r => r.difficulty === filter);

        grid.innerHTML = list.map(room => {
            const answered = this._getAnsweredCount(room.id);
            const pct      = room.totalQuestions > 0
                ? Math.round((answered / room.totalQuestions) * 100)
                : 0;
            const diffCls  = room.difficulty === 'beginner'
                ? 'bg-success'
                : room.difficulty === 'intermediate'
                    ? 'bg-warning text-dark'
                    : 'bg-danger';

            return `
                <div class="col-sm-6 col-xl-4">
                    <div class="card h-100 border-secondary room-card${room.available ? '' : ' locked opacity-50'}"
                         ${room.available ? `style="cursor:pointer" onclick="window.location.href='${room.url}'"` : ''}>

                        ${!room.available ? `
                            <div class="coming-soon-overlay">
                                <span class="badge border border-secondary text-secondary px-3 py-2 fs-6">
                                    🔒 即將推出
                                </span>
                            </div>` : ''}

                        <div class="card-body d-flex flex-column gap-2">
                            <div class="d-flex justify-content-between align-items-start">
                                <span class="fs-2 lh-1">${room.icon}</span>
                                <span class="badge ${diffCls}">${room.difficultyLabel}</span>
                            </div>
                            <h6 class="card-title fw-bold mb-0">${room.title}</h6>
                            <p class="card-text text-muted small flex-grow-1">${room.description}</p>
                            <div class="d-flex flex-wrap gap-1">
                                ${room.tags.map(t => `
                                    <span class="badge border border-secondary text-muted fw-normal small">${t}</span>
                                `).join('')}
                            </div>
                            <div class="mt-1">
                                <div class="d-flex justify-content-between text-muted small mb-1">
                                    <span>${answered} / ${room.totalQuestions} 題完成</span>
                                    <span>${pct}%</span>
                                </div>
                                <div class="progress" style="height:4px">
                                    <div class="progress-bar" style="width:${pct}%"></div>
                                </div>
                            </div>
                            ${room.available
                                ? `<button class="btn btn-primary btn-sm mt-1 room-enter-btn">進入房間 →</button>`
                                : ''}
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    _bindFilters() {
        document.querySelectorAll('#filterGroup button').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('#filterGroup button').forEach(b => {
                    b.className = 'btn btn-outline-secondary btn-sm';
                });
                btn.className = 'btn btn-primary btn-sm active';
                this._renderRooms(btn.dataset.filter);
            });
        });
    }
}

document.addEventListener('DOMContentLoaded', () => new HomePage());
