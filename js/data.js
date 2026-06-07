
const ROOMS = [
    {
        id: 1,
        title: 'Linux 基礎知識',
        description: '學習 Linux 命令列的核心概念，透過互動終端機完成實際挑戰。',
        icon: '🐧',
        difficulty: 'beginner',
        difficultyLabel: '初級',
        tags: ['Linux', 'CLI', 'Terminal'],
        totalTasks: 5,
        totalQuestions: 10,
        available: true,
        url: 'room.html',
    },
    {
        id: 2,
        title: 'Web 基礎',
        description: '了解 HTTP 協定、HTML 結構、瀏覽器開發者工具與基本網路安全概念。',
        icon: '🌐',
        difficulty: 'beginner',
        difficultyLabel: '初級',
        tags: ['Web', 'HTTP', 'HTML'],
        totalTasks: 6,
        totalQuestions: 12,
        available: false,
        url: null,
    },
    {
        id: 3,
        title: '網路掃描入門',
        description: '使用 nmap 進行網路掃描，學習埠號識別、服務探測與基本偵察技術。',
        icon: '📡',
        difficulty: 'intermediate',
        difficultyLabel: '中級',
        tags: ['Network', 'nmap', 'Recon'],
        totalTasks: 4,
        totalQuestions: 8,
        available: false,
        url: null,
    },
    {
        id: 4,
        title: 'CTF 入門',
        description: '認識 CTF（奪旗賽）的基本題型，涵蓋 Misc、Crypto、Web 與 Pwn 簡介。',
        icon: '🚩',
        difficulty: 'beginner',
        difficultyLabel: '初級',
        tags: ['CTF', 'Misc', 'Crypto'],
        totalTasks: 5,
        totalQuestions: 10,
        available: false,
        url: null,
    },
    {
        id: 5,
        title: '權限提升',
        description: '探索 Linux 系統中的提權技術，包含 SUID、sudo 誤設定、cron 任務漏洞等。',
        icon: '⚡',
        difficulty: 'intermediate',
        difficultyLabel: '中級',
        tags: ['Linux', 'PrivEsc', 'Security'],
        totalTasks: 6,
        totalQuestions: 12,
        available: false,
        url: null,
    },
    {
        id: 6,
        title: 'SQL 注入',
        description: '深入了解 SQL Injection 原理、常見攻擊方式（Union、Blind），以及防禦對策。',
        icon: '💉',
        difficulty: 'intermediate',
        difficultyLabel: '中級',
        tags: ['Web', 'SQL', 'Injection'],
        totalTasks: 5,
        totalQuestions: 10,
        available: false,
        url: null,
    },
];

const LEARNING_PATHS = [
    {
        id: 'linux',
        title: 'Linux 入門路徑',
        icon: '🐧',
        color: '#f0a500',
        roomCount: 3,
        desc: '從零開始掌握 Linux，建立命令列基礎。',
    },
    {
        id: 'web',
        title: 'Web 安全路徑',
        icon: '🌐',
        color: '#58a6ff',
        roomCount: 3,
        desc: '網頁漏洞原理、識別與防禦。',
    },
    {
        id: 'ctf',
        title: 'CTF 挑戰路徑',
        icon: '🚩',
        color: '#f85149',
        roomCount: 4,
        desc: '從零到競賽，快速建立解題能力。',
    },
    {
        id: 'pwn',
        title: 'pwn 挑戰',
        icon:'👾',
        color: '#49eaf8',
        roomCount: 2,
        desc: 'binary 漏洞原理'
    }
];

/* ── 排行榜靜態資料 ──
 * 欄位說明：
 *   score          = correctAnswers×100 + roomBonus(500) + timeBonus(最高300)
 *   timeSpent      = 秒數
 *   date           = Unix timestamp（毫秒）
 */
const LEADERBOARD_DATA = [
    { id:1, name:'slimebvs',      roomId:1, roomTitle:'Linux 基礎知識', score:1788, correctAnswers:10, totalQuestions:10, timeSpent:120,  date:1748966400000 },
    { id:2, name:'ousu',       roomId:1, roomTitle:'Linux 基礎知識', score:1740, correctAnswers:10, totalQuestions:10, timeSpent:600,  date:1748880000000 },
    { id:3, name:'zero_day',   roomId:1, roomTitle:'Linux 基礎知識', score:1680, correctAnswers:10, totalQuestions:10, timeSpent:1200, date:1748793600000 },
    { id:4, name:'holydragon',        roomId:1, roomTitle:'Linux 基礎知識', score:1560, correctAnswers:10, totalQuestions:10, timeSpent:2400, date:1748707200000 },
];
