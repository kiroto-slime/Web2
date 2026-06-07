'use strict';

class VirtualFS {
    constructor() {
        this.tree = {
            '/': {
                type: 'dir',
                children: {
                    home: {
                        type: 'dir',
                        children: {
                            slime: {
                                type: 'dir',
                                children: {
                                    '.secret.txt': {
                                        type: 'file',
                                        content: 'FLAG{linux_basics_unlocked}\n'
                                    },
                                    'readme.txt': {
                                        type: 'file',
                                        content: 'Welcome to Don\'t Hack Me!\nThis is your home directory.\nTry: ls, cd, cat, pwd\n'
                                    },
                                    'notes.md': {
                                        type: 'file',
                                        content: '# Study Notes\n\n## Basic Commands\n- ls   : list files\n- cd   : change directory\n- pwd  : print working directory\n- cat  : display file content\n- echo : print text\n- man  : manual pages\n'
                                    },
                                    documents: {
                                        type: 'dir',
                                        children: {
                                            'report.txt': {
                                                type: 'file',
                                                content: 'System Report\n=============\nDate: 2026-05-29\nStatus: Hello World.\n'
                                            }
                                        }
                                    },
                                    downloads: { type: 'dir', children: {} }
                                }
                            }
                        }
                    },
                    etc: {
                        type: 'dir',
                        children: {
                            'hostname': { type: 'file', content: 'hacklab\n' },
                            'os-release': {
                                type: 'file',
                                content: 'NAME="Ubuntu"\nVERSION="22.04.3 LTS (Jammy Jellyfish)"\nID=ubuntu\nID_LIKE=debian\nHOME_URL="https://www.ubuntu.com/"\nSUPPORT_URL="https://help.ubuntu.com/"\n'
                            },
                            'passwd': {
                                type: 'file',
                                content: 'root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\slime:x:1000:1000:slime,,,:/home/slime:/bin/bash\n'
                            }
                        }
                    },
                    var: { type: 'dir', children: { log: { type: 'dir', children: {} } } },
                    tmp: { type: 'dir', children: {} },
                    bin: { type: 'dir', children: {} },
                    usr: { type: 'dir', children: { bin: { type: 'dir', children: {} } } }
                }
            }
        };
        this.cwd = '/home/slime';
    }

    resolve(path) {
        if (!path) return this.cwd;
        const parts = (path.startsWith('/') ? path : this.cwd + '/' + path)
            .split('/')
            .filter(Boolean);
        const stack = [];
        for (const p of parts) {
            if (p === '.') continue;
            else if (p === '..') stack.pop();
            else stack.push(p);
        }
        return '/' + stack.join('/');
    }

    getNode(absPath) {
        if (absPath === '/') return this.tree['/'];
        const parts = absPath.split('/').filter(Boolean);
        let node = this.tree['/'];
        for (const p of parts) {
            if (!node || node.type !== 'dir' || !node.children[p]) return null;
            node = node.children[p];
        }
        return node;
    }

    basename(absPath) {
        const parts = absPath.split('/').filter(Boolean);
        return parts[parts.length - 1] || '/';
    }

    parentPath(absPath) {
        const parts = absPath.split('/').filter(Boolean);
        parts.pop();
        return '/' + parts.join('/');
    }
}

class Terminal {
    constructor(opts) {
        this.outputEl  = opts.outputEl;
        this.inputEl   = opts.inputEl;
        this.promptEl  = opts.promptEl;
        this.chromeTitleEl = opts.chromeTitleEl;

        this.fs      = new VirtualFS();
        this.history = [];
        this.histIdx = -1;
        this.user    = 'slime';
        this.host    = 'slimebvs.net';

        this._bindEvents();
        this._printBanner();
        this._updatePrompt();
    }

    _bindEvents() {
        this.inputEl.addEventListener('keydown', e => this._onKey(e));

        document.getElementById('terminalBody').addEventListener('click', () => {
            this.inputEl.focus();
        });
    }

    _onKey(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            const raw = this.inputEl.value;
            this._echoCommand(raw);
            this.inputEl.value = '';
            if (raw.trim()) {
                this.history.unshift(raw);
                if (this.history.length > 200) this.history.pop();
            }
            this.histIdx = -1;
            this._run(raw.trim());
            this._scrollBottom();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            if (this.histIdx < this.history.length - 1) {
                this.histIdx++;
                this.inputEl.value = this.history[this.histIdx] || '';
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            if (this.histIdx > 0) {
                this.histIdx--;
                this.inputEl.value = this.history[this.histIdx] || '';
            } else {
                this.histIdx = -1;
                this.inputEl.value = '';
            }
        } else if (e.key === 'l' && e.ctrlKey) {
            e.preventDefault();
            this._clearOutput();
        } else if (e.key === 'c' && e.ctrlKey) {
            e.preventDefault();
            this._echoCommand(this.inputEl.value + '^C');
            this.inputEl.value = '';
        }
    }

    _echoCommand(raw) {
        const line = document.createElement('div');
        line.className = 't-line cmd-echo';
        const prompt = document.createElement('span');
        prompt.className = 't-prompt';
        prompt.textContent = this._promptStr() + ' ';
        const cmd = document.createElement('span');
        cmd.className = 't-cmd';
        cmd.textContent = raw;
        line.appendChild(prompt);
        line.appendChild(cmd);
        this.outputEl.appendChild(line);
    }

    _print(text, cls = '') {
        const lines = String(text).split('\n');
        lines.forEach((l, i) => {
            if (i === lines.length - 1 && l === '') return;
            const div = document.createElement('div');
            div.className = 't-line' + (cls ? ' ' + cls : '');
            div.textContent = l;
            this.outputEl.appendChild(div);
        });
    }

    _printHTML(html) {
        const div = document.createElement('div');
        div.className = 't-line';
        div.innerHTML = html;
        this.outputEl.appendChild(div);
    }

    _clearOutput() {
        this.outputEl.innerHTML = '';
    }

    _scrollBottom() {
        const body = document.getElementById('terminalBody');
        body.scrollTop = body.scrollHeight;
    }

    _promptStr() {
        const rel = this.fs.cwd.replace('/home/slime', '~');
        return `${this.user}@${this.host}:${rel}$`;
    }

    _updatePrompt() {
        const rel = this.fs.cwd.replace('/home/slime', '~');
        this.promptEl.innerHTML = `<span class="t-prompt">${this.user}@${this.host}:${rel}$&nbsp;</span>`;
        if (this.chromeTitleEl) {
            this.chromeTitleEl.textContent = `${this.user}@${this.host}: ${rel}`;
        }
    }

    _printBanner() {
        const lines = [
            ' ██╗  ██╗ █████╗  ██████╗██╗  ██╗██╗      █████╗ ██████╗ ',
            ' ██║  ██║██╔══██╗██╔════╝██║ ██╔╝██║     ██╔══██╗██╔══██╗',
            ' ███████║███████║██║     █████╔╝ ██║     ███████║██████╔╝',
            ' ██╔══██║██╔══██║██║     ██╔═██╗ ██║     ██╔══██║██╔══██╗',
            ' ██║  ██║██║  ██║╚██████╗██║  ██╗███████╗██║  ██║██████╔╝',
            ' ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝╚═╝  ╚═╝╚══════╝╚═╝  ╚═╝╚═════╝ ',
        ];
        lines.forEach(l => this._print(l, 'banner'));
        this._print('');
        this._print('Ubuntu 22.04.3 LTS  —  Don\' Hack Me Terminal', 't-info');
        this._print(`Last login: Thu May 29 09:00:00 2026`, 't-dim');
        this._print('Type `help` to see available commands.', 't-dim');
        this._print('');
    }

    _run(raw) {
        if (!raw) { this._updatePrompt(); return; }

        const tokens = this._tokenize(raw);
        const cmd    = tokens[0];
        const args   = tokens.slice(1);

        const cmds = {
            help:    () => this._cmdHelp(),
            clear:   () => this._clearOutput(),
            cls:     () => this._clearOutput(),
            pwd:     () => this._cmdPwd(),
            ls:      () => this._cmdLs(args),
            'ls -la':() => this._cmdLs(['-la']),
            cd:      () => this._cmdCd(args),
            cat:     () => this._cmdCat(args),
            echo:    () => this._cmdEcho(args),
            whoami:  () => this._cmdWhoami(),
            uname:   () => this._cmdUname(args),
            date:    () => this._cmdDate(),
            history: () => this._cmdHistory(),
            mkdir:   () => this._cmdMkdir(args),
            touch:   () => this._cmdTouch(args),
            rm:      () => this._cmdRm(args),
            man:     () => this._cmdMan(args),
            id:      () => this._cmdId(),
            hostname:() => this._print('slimebvs'),
            env:     () => this._cmdEnv(),
            printenv:() => this._cmdEnv(),
            exit:    () => this._print('Type Ctrl+C or close the terminal panel.', 't-dim'),
            logout:  () => this._print('Type Ctrl+C or close the terminal panel.', 't-dim'),
        };

        const fn = cmds[cmd];
        if (fn) {
            fn();
        } else {
            this._print(`${cmd}: command not found`, 't-error');
            this._print(`Try 'help' for available commands.`, 't-dim');
        }

        this._updatePrompt();
    }

    _tokenize(raw) {
        const tokens = [];
        let cur = '';
        let inQuote = false;
        let qChar = '';
        for (let i = 0; i < raw.length; i++) {
            const c = raw[i];
            if (inQuote) {
                if (c === qChar) inQuote = false;
                else cur += c;
            } else if (c === '"' || c === "'") {
                inQuote = true;
                qChar = c;
            } else if (c === ' ') {
                if (cur) { tokens.push(cur); cur = ''; }
            } else {
                cur += c;
            }
        }
        if (cur) tokens.push(cur);
        return tokens;
    }

    _cmdHelp() {
        const cmds = [
            ['help',        'Show this help message'],
            ['clear',       'Clear the terminal screen'],
            ['pwd',         'Print working directory'],
            ['ls [path]',   'List directory contents'],
            ['ls -la',      'List with details'],
            ['cd [dir]',    'Change directory'],
            ['cat <file>',  'Display file contents'],
            ['echo <text>', 'Print text to screen'],
            ['whoami',      'Print current user'],
            ['uname [-a]',  'Print system information'],
            ['date',        'Show current date and time'],
            ['hostname',    'Show hostname'],
            ['id',          'Show user/group IDs'],
            ['env',         'Show environment variables'],
            ['mkdir <dir>', 'Create a directory'],
            ['touch <file>','Create an empty file'],
            ['rm <file>',   'Remove a file'],
            ['history',     'Show command history'],
            ['man <cmd>',   'Show manual for a command'],
        ];
        this._print('Available commands:', 't-info');
        this._print('');
        cmds.forEach(([c, d]) => {
            this._printHTML(
                `  <span class="t-exec">${c.padEnd(18)}</span><span class="t-dim">${d}</span>`
            );
        });
        this._print('');
        this._print('Shortcuts: Ctrl+L (clear)  ↑↓ (history)', 't-dim');
    }

    _cmdPwd() {
        this._print(this.fs.cwd);
    }

    _cmdLs(args) {
        const showAll    = args.includes('-a') || args.includes('-la') || args.includes('-al');
        const showDetail = args.includes('-l') || args.includes('-la') || args.includes('-al');
        const pathArg    = args.find(a => !a.startsWith('-'));
        const targetPath = pathArg ? this.fs.resolve(pathArg) : this.fs.cwd;
        const node       = this.fs.getNode(targetPath);

        if (!node) {
            this._print(`ls: cannot access '${pathArg}': No such file or directory`, 't-error');
            return;
        }
        if (node.type === 'file') {
            this._print(this.fs.basename(targetPath), 't-file');
            return;
        }

        const entries = Object.entries(node.children);
        if (entries.length === 0 && !showAll) {
            return;
        }

        if (showDetail) {
            this._print(`total ${entries.length * 4 + 8}`);
            if (showAll) {
                this._printHTML(`<span class="t-dir">drwxr-xr-x</span><span class="t-dim">  2 slime slime  4096 May 29 09:00 .</span>`);
                this._printHTML(`<span class="t-dir">drwxr-xr-x</span><span class="t-dim">  3 slime slime  4096 May 29 09:00 ..</span>`);
            }
            entries.forEach(([name, child]) => {
                if (!showAll && name.startsWith('.')) return;
                const isDir = child.type === 'dir';
                const perm = isDir ? 'drwxr-xr-x' : '-rw-r--r--';
                const size = isDir ? '4096' : String((child.content || '').length).padStart(4);
                const cls  = isDir ? 't-dir' : 't-file';
                this._printHTML(
                    `<span class="${isDir ? 't-dim' : 't-dim'}">${perm}  1 slime slime ${size} May 29 09:00 </span><span class="${cls}">${name}</span>`
                );
            });
        } else {
            const names = entries
                .filter(([n]) => showAll || !n.startsWith('.'))
                .map(([n, c]) => ({ n, isDir: c.type === 'dir' }));
            const line = names.map(({ n, isDir }) =>
                `<span class="${isDir ? 't-dir' : 't-file'}">${n}</span>`
            ).join('  ');
            if (line) this._printHTML(line);
        }
    }

    _cmdCd(args) {
        const target = args[0];
        if (!target || target === '~') {
            this.fs.cwd = '/home/slime';
            return;
        }
        const abs = this.fs.resolve(target);
        const node = this.fs.getNode(abs);
        if (!node) {
            this._print(`cd: ${target}: No such file or directory`, 't-error');
        } else if (node.type !== 'dir') {
            this._print(`cd: ${target}: Not a directory`, 't-error');
        } else {
            this.fs.cwd = abs;
        }
    }

    _cmdCat(args) {
        if (!args.length) {
            this._print('cat: missing operand', 't-error');
            return;
        }
        args.forEach(arg => {
            const abs = this.fs.resolve(arg);
            const node = this.fs.getNode(abs);
            if (!node) {
                this._print(`cat: ${arg}: No such file or directory`, 't-error');
            } else if (node.type === 'dir') {
                this._print(`cat: ${arg}: Is a directory`, 't-error');
            } else {
                this._print(node.content.replace(/\n$/, ''));
            }
        });
    }

    _cmdEcho(args) {
        this._print(args.join(' '));
    }

    _cmdWhoami() {
        this._print(this.user);
    }

    _cmdUname(args) {
        if (args.includes('-a')) {
            this._print('Linux Don\' Hack Me 5.15.0-91-generic #101-Ubuntu SMP Tue Nov 14 13:30:08 UTC 2023 x86_64 x86_64 x86_64 GNU/Linux');
        } else {
            this._print('Linux');
        }
    }

    _cmdDate() {
        this._print(new Date().toString());
    }

    _cmdHistory() {
        if (!this.history.length) {
            this._print('No commands in history.', 't-dim');
            return;
        }
        [...this.history].reverse().forEach((cmd, i) => {
            this._printHTML(
                `<span class="t-dim">${String(i + 1).padStart(4)}  </span><span class="t-file">${cmd}</span>`
            );
        });
    }

    _cmdMkdir(args) {
        if (!args.length) {
            this._print('mkdir: missing operand', 't-error');
            return;
        }
        args.forEach(arg => {
            const abs    = this.fs.resolve(arg);
            const parent = this.fs.getNode(this.fs.parentPath(abs));
            const name   = this.fs.basename(abs);
            if (!parent || parent.type !== 'dir') {
                this._print(`mkdir: cannot create directory '${arg}': No such file or directory`, 't-error');
            } else if (parent.children[name]) {
                this._print(`mkdir: cannot create directory '${arg}': File exists`, 't-error');
            } else {
                parent.children[name] = { type: 'dir', children: {} };
            }
        });
    }

    _cmdTouch(args) {
        if (!args.length) {
            this._print('touch: missing file operand', 't-error');
            return;
        }
        args.forEach(arg => {
            const abs    = this.fs.resolve(arg);
            const parent = this.fs.getNode(this.fs.parentPath(abs));
            const name   = this.fs.basename(abs);
            if (!parent || parent.type !== 'dir') {
                this._print(`touch: cannot touch '${arg}': No such file or directory`, 't-error');
            } else if (!parent.children[name]) {
                parent.children[name] = { type: 'file', content: '' };
            }
        });
    }

    _cmdRm(args) {
        const filtered = args.filter(a => !a.startsWith('-'));
        if (!filtered.length) {
            this._print('rm: missing operand', 't-error');
            return;
        }
        filtered.forEach(arg => {
            const abs    = this.fs.resolve(arg);
            const parent = this.fs.getNode(this.fs.parentPath(abs));
            const name   = this.fs.basename(abs);
            if (!parent || !parent.children[name]) {
                this._print(`rm: cannot remove '${arg}': No such file or directory`, 't-error');
            } else if (parent.children[name].type === 'dir' && !args.includes('-r') && !args.includes('-rf')) {
                this._print(`rm: cannot remove '${arg}': Is a directory (use -r to remove directories)`, 't-error');
            } else {
                delete parent.children[name];
            }
        });
    }

    _cmdId() {
        this._print('uid=1000(slime) gid=1000(slime) groups=1000(slime),4(adm),24(cdrom),27(sudo),30(dip),46(plugdev)');
    }

    _cmdEnv() {
        const vars = [
            'USER=slime', 'HOME=/home/slime', 'SHELL=/bin/bash',
            'TERM=xterm-256color', 'LANG=en_US.UTF-8', 'PWD=' + this.fs.cwd,
            'HOSTNAME=hacklab', 'PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin',
        ];
        vars.forEach(v => this._print(v));
    }

    _cmdMan(args) {
        if (!args.length) {
            this._print('What manual page do you want?', 't-error');
            return;
        }
        const pages = {
            ls:   'LS(1)\nList directory contents.\n\nUSAGE: ls [OPTION]... [FILE]...\n  -a   do not ignore entries starting with .\n  -l   use a long listing format',
            cd:   'CD(1)\nChange the shell working directory.\n\nUSAGE: cd [dir]\n  With no argument, changes to HOME (~).',
            cat:  'CAT(1)\nConcatenate files and print on the standard output.\n\nUSAGE: cat [FILE]...',
            pwd:  'PWD(1)\nPrint the name of the current working directory.\n\nUSAGE: pwd',
            echo: 'ECHO(1)\nDisplay a line of text.\n\nUSAGE: echo [STRING]...',
            rm:   'RM(1)\nRemove files or directories.\n\nUSAGE: rm [OPTION]... FILE...\n  -r   remove directories and their contents recursively',
            mkdir:'MKDIR(1)\nMake directories.\n\nUSAGE: mkdir [OPTION]... DIRECTORY...',
            touch:'TOUCH(1)\nChange file timestamps / create empty files.\n\nUSAGE: touch [FILE]...',
        };
        const page = pages[args[0]];
        if (page) {
            this._print(page, 't-info');
        } else {
            this._print(`No manual entry for ${args[0]}`, 't-warn');
        }
    }

    focus() {
        this.inputEl.focus();
    }
}
