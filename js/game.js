'use strict';

/* 密碼破解小遊戲（Wordle 風）：猜 4 字母資安單字，6 次機會 */
(function () {
    var WORDS = ['hack', 'root', 'bash', 'port', 'sudo', 'nmap', 'grep', 'ping', 'code', 'flag', 'leak', 'byte'];
    var ROWS = 6, LEN = 4;
    var answer, row, over, startTime;

    var boardEl = document.getElementById('gbBoard');
    var inputEl = document.getElementById('gbInput');
    var msgEl   = document.getElementById('gbMsg');

    function newGame() {
        answer = WORDS[Math.floor(Math.random() * WORDS.length)];
        row = 0; over = false; startTime = Date.now();
        msgEl.textContent = '';
        inputEl.value = ''; inputEl.disabled = false;
        boardEl.innerHTML = '';
        for (var r = 0; r < ROWS; r++) {
            var tr = document.createElement('div');
            tr.className = 'd-flex gap-2 justify-content-center mb-2';
            for (var c = 0; c < LEN; c++) {
                var cell = document.createElement('div');
                cell.className = 'gb-cell d-flex align-items-center justify-content-center fw-bold';
                cell.id = 'g' + r + '_' + c;
                tr.appendChild(cell);
            }
            boardEl.appendChild(tr);
        }
        inputEl.focus();
    }

    function guess() {
        if (over) return;
        var g = (inputEl.value || '').toLowerCase().trim();
        if (g.length !== LEN) { msgEl.textContent = '請輸入 ' + LEN + ' 個英文字母'; return; }
        if (!/^[a-z]+$/.test(g)) { msgEl.textContent = '只能輸入英文字母'; return; }
        msgEl.textContent = '';

        for (var c = 0; c < LEN; c++) {
            var cell = document.getElementById('g' + row + '_' + c);
            cell.textContent = g[c].toUpperCase();
            if (g[c] === answer[c]) cell.classList.add('gb-correct');
            else if (answer.indexOf(g[c]) >= 0) cell.classList.add('gb-present');
            else cell.classList.add('gb-absent');
        }

        if (g === answer) {
            over = true; inputEl.disabled = true;
            var sec = Math.floor((Date.now() - startTime) / 1000);
            var score = (ROWS - row) * 100 + Math.max(0, 120 - sec);
            msgEl.innerHTML = '🎉 破解成功！用了 ' + (row + 1) + ' 次、' + sec + ' 秒，得分 <span class="text-primary fw-bold">' + score + '</span>';
            return;
        }

        row++;
        inputEl.value = '';
        if (row >= ROWS) {
            over = true; inputEl.disabled = true;
            msgEl.innerHTML = '💥 機會用完了！答案是 <span class="text-primary fw-bold">' + answer.toUpperCase() + '</span>';
        }
    }

    document.getElementById('gbGuess').addEventListener('click', guess);
    document.getElementById('gbRestart').addEventListener('click', newGame);
    inputEl.addEventListener('keydown', function (e) { if (e.key === 'Enter') guess(); });

    newGame();
})();
