/**
 * SSPEC OPERATIONAL ENVIRONMENT - MAIN TERMINAL CONTROLLER
 * Version: 5.1.0-DEVTERMINAL
 * Kernel: Linux sspec-node 5.15.0-x86_64
 */

// ==========================================
// 1. DEVTOOLS CONSOLE INTERCEPTOR ENGINE
// ==========================================
const devConsoleBuffer = [];
const originalConsoleLog = console.log;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = function(...args) {
    originalConsoleLog.apply(console, args);
    const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    devConsoleBuffer.push(`[DEV-CONSOLE:LOG] ${formatted}`);
};

console.warn = function(...args) {
    originalConsoleWarn.apply(console, args);
    const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    devConsoleBuffer.push(`[DEV-CONSOLE:WARN] ${formatted}`);
};

console.error = function(...args) {
    originalConsoleError.apply(console, args);
    const formatted = args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ');
    devConsoleBuffer.push(`[DEV-CONSOLE:ERROR] ${formatted}`);
};

// Seed initial buffer with diagnostic logs
console.log("SSPEC DevTools Interceptor hook registered successfully.");
console.warn("V8 engine memory diagnostics attached to active window context.");

// ==========================================
// 2. ASCII ART & BANNER DEFINITIONS
// ==========================================
const SSPEC_ART = `
   _____ _____ _____ _____ ____ 
  / ____/ ____|  __ \\ ____/ ___|
 | (___| (___ | |__) | |__| |   
  \\___ \\\\___ \\|  ___/  __| |   
  ____) |___) | |   | |__| |___ 
 |_____/_____/|_|   |_____\\____|
  ------------------------------
    [ SYSTEM SPECTRA COMMAND ]
`;

const SSPEC_FULL_BANNER = `
================================================================================
${SSPEC_ART}
  HOST       : sspec-node-01 (tty1)
  ARCH       : x86_64 GNU/Linux
  KERNEL     : 5.15.0-SSPEC-V5.1-RELEASE
  BUILD      : 2026.10.08.0510
  SECURITY   : ENCRYPTION MESH & DEVTOOLS HOOKS ACTIVE
--------------------------------------------------------------------------------
  Type 'help' for standard user commands.
  Type 'sspec admin run' followed by 'admin help' for root protocols.
  Type 'install terminal' to launch sub-terminal streaming real site logs.
  Press 'TAB' for autocompletion | 'CTRL+C' to cancel live streams.
================================================================================
`;

// ==========================================
// 3. AUDIO SYNTHESIZER ENGINE (Web Audio API)
// ==========================================
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioContextClass = window.AudioContext || window.webkitAudioContext;
            if (AudioContextClass) {
                this.ctx = new AudioContextClass();
            }
        }
    }

    playTone(frequency, type, duration, volume = 0.05) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const oscillator = this.ctx.createOscillator();
            const gainNode = this.ctx.createGain();

            oscillator.type = type;
            oscillator.frequency.setValueAtTime(frequency, this.ctx.currentTime);

            gainNode.gain.setValueAtTime(volume, this.ctx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            oscillator.connect(gainNode);
            gainNode.connect(this.ctx.destination);

            oscillator.start();
            oscillator.stop(this.ctx.currentTime + duration);
        } catch (e) {
            // Fallback for hardware context restriction
        }
    }

    keyClick() {
        this.playTone(800 + Math.random() * 200, 'square', 0.015, 0.02);
    }

    enter() {
        this.playTone(400, 'sine', 0.08, 0.04);
    }

    error() {
        this.playTone(150, 'sawtooth', 0.2, 0.08);
    }

    streamTick() {
        this.playTone(1200 + Math.random() * 400, 'sine', 0.01, 0.01);
    }

    alert() {
        this.playTone(880, 'square', 0.1, 0.08);
        setTimeout(() => this.playTone(440, 'square', 0.15, 0.08), 100);
    }
}

const audio = new SoundEngine();

// ==========================================
// 4. DOM ELEMENTS SELECTION & CRT INJECTION
// ==========================================
const outputDiv = document.getElementById('output');
const inputField = document.getElementById('command-input');
const bannerPre = document.getElementById('banner');
const promptSpan = document.querySelector('.prompt');
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

const winTerm = document.getElementById('window-terminal');
const winHeader = document.getElementById('win-header');
const winOutput = document.getElementById('win-output');
const winInput = document.getElementById('win-input');

// Inject retro CRT overlay style dynamically
const crtStyle = document.createElement('style');
crtStyle.id = 'crt-style-sheet';
crtStyle.innerHTML = `
    .crt-effect::after {
        content: " ";
        display: block;
        position: fixed;
        top: 0; left: 0; bottom: 0; right: 0;
        background: linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.03), rgba(0, 255, 0, 0.01), rgba(0, 0, 255, 0.03));
        z-index: 9999;
        background-size: 100% 3px, 6px 100%;
        pointer-events: none;
    }
`;
document.head.appendChild(crtStyle);

// ==========================================
// 5. HIERARCHICAL VIRTUAL FILESYSTEM
// ==========================================
let currentPath = "/home/guest";

const fileSystem = {
    "/": { type: "dir" },
    "/bin": { type: "dir" },
    "/etc": { type: "dir" },
    "/etc/config.json": { 
        type: "file", 
        content: '{\n  "system": "SSPEC-NODE-01",\n  "status": "OPERATIONAL",\n  "firewall": "ENABLED",\n  "encryption": "AES-256-GCM"\n}' 
    },
    "/etc/motd": { 
        type: "file", 
        content: "Welcome to SSPEC OS Terminal.\nAll unauthorized access strictly logged." 
    },
    "/home": { type: "dir" },
    "/home/guest": { type: "dir" },
    "/home/guest/index.html": { 
        type: "file", 
        content: "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <title>tty1 - sspec-node</title>\n</head>\n<body>\n    <div id=\"cli\">...</div>\n</body>\n</html>" 
    },
    "/home/guest/style.css": { 
        type: "file", 
        content: "body { background-color: #000; color: #00ff00; font-family: monospace; }" 
    },
    "/home/guest/script.js": { 
        type: "file", 
        content: "// SSPEC Kernel Engine Active\nconsole.log(\"SSPEC operational environment loaded.\");" 
    },
    "/var": { type: "dir" },
    "/var/log": { type: "dir" },
    "/var/log/syslog": { 
        type: "file", 
        content: "[SYS_BOOT] Kernel 5.15 loaded successfully.\n[NET_INIT] Interface eth0 bound to 10.0.2.15" 
    },
    "/root": { type: "dir", restricted: true },
    "/root/id_rsa": { 
        type: "file", 
        content: "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAABG5cbd3321...\n-----END OPENSSH PRIVATE KEY-----" 
    }
};

// ==========================================
// 6. GLOBAL STATE VARIABLES
// ==========================================
let isInstalled = false;
let installStep = 0;
let isAdmin = false;
let isHacking = false;
let activeInterval = null;
let webLogInterval = null;
let hackInterval = null;
let commandHistory = [];
let historyIndex = -1;
let currentEditingFile = null;
let isEditing = false;
let editingContent = "";

// Matrix Canvas Engine States
let matrixInterval = null;
let matrixColor = '#00ff00';
let matrixSpeed = 33;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%<>/\\{}[]';
let drops = [];

const COMMAND_LIST = [
    'pip install start', 'pip install stop', 'admin help', 'help', 'ls', 'cd', 'pwd', 
    'cat', 'touch', 'mkdir', 'rm', 'echo', 'nano', 'whoami', 'clear', 'exit', 'banner', 
    'matrix', 'system status', 'portscan local', 'traceroute', 'theme', 'calc', 'history', 
    'uptime', 'date', 'wireshark', 'tcpdump', 'hydra', 'hashcat', 'top', 'htop', 'ping', 
    'sound', 'crt', 'install terminal', 'open terminal', 'sspec hack true'
];

// ==========================================
// 7. MATRIX RAIN CANVAS ENGINE
// ==========================================
function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 16);
    drops = Array(columns).fill(1);
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = matrixColor;
    ctx.font = '15px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) {
            drops[i] = 0;
        }
        drops[i]++;
    }
}

function startMatrix() {
    initMatrix();
    canvas.style.display = 'block';
    if (matrixInterval) clearInterval(matrixInterval);
    matrixInterval = setInterval(drawMatrix, matrixSpeed);
}

function stopMatrix() {
    canvas.style.display = 'none';
    if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
    }
}

window.addEventListener('resize', initMatrix);

// Boot System Message Initialization
bannerPre.textContent = '';
appendOutput("Linux sspec-node 5.15.0-x86_64 tty1 (Uninitialized)");
appendOutput("[CRITICAL] SSPEC Kernel environment not detected.");
appendOutput("Type 'sspec install' to initiate system installation and configuration.\n");

// ==========================================
// 8. HELPER UTILITIES & PATH RESOLVER
// ==========================================
function appendOutput(text) {
    outputDiv.textContent += text + "\n";
    const cli = document.getElementById('cli') || document.body;
    cli.scrollTop = cli.scrollHeight;
}

function appendWinOutput(text) {
    if (!winOutput) return;
    winOutput.textContent += text + "\n";
    const winBody = winOutput.parentElement;
    if (winBody) {
        winBody.scrollTop = winBody.scrollHeight;
    }
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

function updatePrompt() {
    const user = isAdmin ? 'root' : 'guest';
    const host = isAdmin ? 'sspec-admin' : 'sspec-node';
    const char = isAdmin ? '#' : '$';
    promptSpan.textContent = `${user}@${host}:${currentPath}${char}`;
}

function resolvePath(target) {
    if (!target) return currentPath;
    if (target.startsWith('/')) return target;

    let parts = currentPath.split('/').concat(target.split('/')).filter(Boolean);
    let stack = [];
    for (let p of parts) {
        if (p === '..') {
            stack.pop();
        } else if (p !== '.') {
            stack.push(p);
        }
    }
    return '/' + stack.join('/');
}

// ==========================================
// 9. REAL WEBSITE & DEV CONSOLE LOG GENERATOR FOR SUB-TERMINAL
// ==========================================
function generateRealWebConsoleLog() {
    // Return explicit developer console logs if buffer contains items
    if (devConsoleBuffer.length > 0) {
        return devConsoleBuffer.shift();
    }

    // Capture real active browser runtime telemetry
    const memoryStats = window.performance && window.performance.memory ? 
        `(JS Heap: ${(window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB / ${(window.performance.memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB)` : '';

    const resources = window.performance ? window.performance.getEntriesByType('resource') : [];
    const randomRes = resources.length > 0 ? resources[Math.floor(Math.random() * resources.length)] : null;

    const realLogGenerators = [
        `[REAL-DEVTOOL:DOM] Active Nodes: ${document.querySelectorAll('*').length} elements in document`,
        `[REAL-DEVTOOL:ENV] URL: ${window.location.href} | Viewport: ${window.innerWidth}x${window.innerHeight}`,
        `[REAL-DEVTOOL:NAV] UserAgent: ${navigator.userAgent}`,
        `[REAL-DEVTOOL:STORAGE] Active Cookies: ${document.cookie ? document.cookie.split(';').length : 0} | LocalStorage Keys: ${localStorage.length}`,
        `[REAL-DEVTOOL:MEM] V8 Engine ${memoryStats}`,
        randomRes ? `[REAL-NETWORK-RES] Fetch target: ${randomRes.name.substring(0, 55)}... [Duration: ${randomRes.duration.toFixed(1)}ms]` : `[REAL-DEVTOOL:PERF] HighRes Timer: ${performance.now().toFixed(2)}ms`,
        `[HTTP-SERVER-LOG] [${formatTimestamp()}] 127.0.0.1 - "GET ${window.location.pathname || '/'} HTTP/1.1" 200 - ${Math.floor(Math.random() * 120 + 10)}ms`
    ];

    return realLogGenerators[Math.floor(Math.random() * realLogGenerators.length)];
}

// ==========================================
// 10. PIP INFINITE PACKAGE STREAM GENERATOR
// ==========================================
const pipPackages = [
    "scapy==2.5.0", "impacket==0.10.0", "pwntools==4.11.0", "metasploit-framework", 
    "cryptography==41.0.3", "requests-html", "paramiko==3.3.0", "pycryptodome", 
    "sqlmap-engine", "nmap-python-wrapper", "wifi-cracker-core", "exploit-db-sync"
];

function generatePipHackerLog() {
    const randomPkg = pipPackages[Math.floor(Math.random() * pipPackages.length)];
    const size = (Math.random() * 12 + 1.2).toFixed(1);
    const speed = Math.floor(Math.random() * 8000 + 1200);

    const logs = [
        `Collecting ${randomPkg}...`,
        `  Downloading ${randomPkg} (${size} MB) [================================] 100% ${speed} kB/s`,
        `  Building wheel for ${randomPkg} (setup.py) ... done`,
        `  Stored in directory: /root/.cache/pip/wheels/${Math.random().toString(36).substring(2, 10)}`,
        `[+] Injecting memory payload into 0x7FFF${Math.floor(Math.random()*8999+1000)}...`,
        `[>] OVERRIDING BACKDOOR AT PORT ${Math.floor(Math.random()*8000+1000)}`,
        `Installing collected packages: ${randomPkg}`,
        `Successfully installed ${randomPkg}`,
        `[>] MEMORY DUMP [0x${Math.floor(Math.random()*100000).toString(16)}]: ${Math.random().toString(36).substring(2, 14)}`,
        `[+] Extracting shadow hash: $6$rounds=5000$${Math.random().toString(36).substring(2, 12)}...`,
        `[!] SYSTEM OVERHEAT WARNING: Core ${Math.floor(Math.random()*8)} at ${Math.floor(Math.random()*30+65)}°C`
    ];

    return logs[Math.floor(Math.random() * logs.length)];
}

function startPipHackerStream() {
    if (activeInterval) clearInterval(activeInterval);
    audio.alert();
    appendOutput("\n[+] PIP INFINITE PACKAGE & EXPLOIT INJECTION STARTED...");
    appendOutput("[!] TYPE 'pip install stop' OR PRESS 'CTRL + C' TO ABORT STREAM.\n");

    activeInterval = setInterval(() => {
        appendOutput(generatePipHackerLog());
        audio.streamTick();
    }, 70);
}

function stopActiveStream() {
    if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = null;
    }
    appendOutput("\n[-] ACTIVE STREAM TERMINATED SUCCESSFULLY.");
    appendOutput("Restoring terminal session...\n");
}

// ==========================================
// 11. INTERACTIVE INSTALLER LOGIC
// ==========================================
async function handleInstaller(input) {
    const val = input.toLowerCase();

    if (installStep === 1) {
        if (val === 'n' || val === 'no') {
            appendOutput("[!] Installation aborted by user.");
            installStep = 0;
            return;
        }
        appendOutput("[+] Allocating virtual storage partition (1024MB)... [OK]");
        await sleep(250);
        appendOutput("[+] Synchronizing repository manifests...");
        await sleep(350);
        
        appendOutput("\n[QUESTION 1/2] Enable secret administrator escalation subroutines? [Y/n]");
        installStep = 2;
        return;
    }

    if (installStep === 2) {
        if (val === 'n' || val === 'no') {
            appendOutput("[*] Admin modules disabled.");
        } else {
            appendOutput("[*] Admin modules enabled & mapped to 'sspec admin run'.");
        }
        await sleep(250);

        appendOutput("\n[QUESTION 2/2] Deploy security diagnostic suite & DevTools interceptors? [Y/n]");
        installStep = 3;
        return;
    }

    if (installStep === 3) {
        appendOutput("\n[+] COMPILING SSPEC SYSTEM KERNEL...");
        inputField.style.display = 'none';

        const logs = [
            "Unpacking core packages: sspec-base_5.1.0_x86_64.tar.gz...",
            "Building kernel targets: vfs.o audio_synth.o crypto_aead.o ui_tty.o",
            "Resolving dynamic library dependencies: libssl.so.3, libc.so.6...",
            "Hooking browser DevTools console event listeners...",
            "Generating system keypairs at /etc/sspec/keys/...",
            "Mounting virtual filesystem table /etc/fstab...",
            "Configuring network interfaces (eth0: 10.0.2.15/24)...",
            "Setting executable flags on /bin/sspec...",
            "[========================================>] 100% Complete",
            "[SUCCESS] SSPEC KERNEL INITIALIZED SUCCESSFULLY!"
        ];

        for (const log of logs) {
            appendOutput(`  -> ${log}`);
            audio.keyClick();
            await sleep(200 + Math.random() * 180);
        }

        await sleep(500);
        outputDiv.textContent = '';
        
        appendOutput(SSPEC_FULL_BANNER);

        isInstalled = true;
        installStep = 0;
        inputField.style.display = 'inline-block';
        inputField.focus();
        updatePrompt();
    }
}

// ==========================================
// 12. FLOATING SUB-TERMINAL OVERLAY LOGIC
// ==========================================
let isDragging = false;
let offsetX, offsetY;

if (winHeader) {
    winHeader.addEventListener('mousedown', (e) => {
        isDragging = true;
        offsetX = e.clientX - winTerm.offsetLeft;
        offsetY = e.clientY - winTerm.offsetTop;
    });
}

document.addEventListener('mousemove', (e) => {
    if (isDragging && winTerm) {
        winTerm.style.left = `${e.clientX - offsetX}px`;
        winTerm.style.top = `${e.clientY - offsetY}px`;
    }
});

document.addEventListener('mouseup', () => {
    isDragging = false;
});

function startWebLogs() {
    if (webLogInterval) clearInterval(webLogInterval);
    webLogInterval = setInterval(() => {
        if (winTerm && winTerm.style.display !== 'none') {
            appendWinOutput(generateRealWebConsoleLog());
            audio.streamTick();
        }
    }, 800);
}

function stopWebLogs() {
    if (webLogInterval) {
        clearInterval(webLogInterval);
        webLogInterval = null;
    }
}

function openWinTerminal() {
    if (!winTerm) return;
    winTerm.style.display = 'flex';
    winOutput.textContent = '';
    appendWinOutput("=== SSPEC ROOT SUB-TERMINAL [REAL WEBSITE LOG STREAM] ===");
    appendWinOutput("[+] Intercepting live browser DevTools console & website telemetry...");
    appendWinOutput("Type 'help' inside this window for sub-terminal controls.\n");
    startWebLogs();
    if (winInput) winInput.focus();
}

function closeWinTerminal() {
    if (winTerm) winTerm.style.display = 'none';
    stopWebLogs();
    inputField.focus();
}

function toggleWinMin() {
    if (!winOutput) return;
    const winBody = winOutput.parentElement;
    if (winBody.style.display === 'none') {
        winBody.style.display = 'flex';
        winTerm.style.height = '55vh';
    } else {
        winBody.style.display = 'none';
        winTerm.style.height = 'auto';
    }
}

// ==========================================
// 13. TARGET IP GEOLOCATION LOOKUP
// ==========================================
async function revealTargetFullData() {
    appendOutput("\n[!] TARGET LOCK ACQUIRED.");
    appendOutput("[+] EXTRACTING COMPLETE HOST IDENTITY & ENVIRONMENT...\n");

    const screenRes = `${window.screen.width}x${window.screen.height}`;
    const userAgent = navigator.userAgent;
    const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const cores = navigator.hardwareConcurrency || "UNKNOWN";
    const lang = navigator.language || "en-US";

    try {
        const response = await fetch("https://ipapi.co/json/");
        if (!response.ok) throw new Error("API Limit");
        const data = await response.json();

        appendOutput("=================== TARGET IDENTIFIED ===================");
        appendOutput(` PUBLIC IP   : ${data.ip || "UNKNOWN"}`);
        appendOutput(` CITY        : ${data.city || "UNKNOWN"}`);
        appendOutput(` REGION      : ${data.region || "UNKNOWN"}`);
        appendOutput(` COUNTRY     : ${data.country_name || "UNKNOWN"}`);
        appendOutput(` ISP         : ${data.org || "UNKNOWN"}`);
        appendOutput(` LAT / LONG  : ${data.latitude}, ${data.longitude}`);
        appendOutput(` TIMEZONE    : ${timeZone}`);
        appendOutput(` LANGUAGE    : ${lang}`);
        appendOutput(` SCREEN RES  : ${screenRes}`);
        appendOutput(` CPU CORES   : ${cores}`);
        appendOutput(` USER AGENT  : ${userAgent}`);
        appendOutput("========================================================\n");
    } catch (err) {
        try {
            const simpleRes = await fetch("https://api.ipify.org?format=json");
            const simpleData = await simpleRes.json();
            appendOutput("=================== TARGET IDENTIFIED ===================");
            appendOutput(` PUBLIC IP   : ${simpleData.ip}`);
            appendOutput(` TIMEZONE    : ${timeZone}`);
            appendOutput(` LANGUAGE    : ${lang}`);
            appendOutput(` SCREEN RES  : ${screenRes}`);
            appendOutput(` CPU CORES   : ${cores}`);
            appendOutput(` USER AGENT  : ${userAgent}`);
            appendOutput("========================================================\n");
        } catch (e) {
            appendOutput("[!] TARGET DISGUISED (VPN/Proxy Detected or Offline)\n");
        }
    }

    inputField.style.display = 'inline-block';
    inputField.focus();
}

// ==========================================
// 14. KEYBOARD SHORTCUTS & TAB COMPLETION
// ==========================================
window.addEventListener('keydown', function(e) {
    audio.keyClick();

    // CTRL + C: Cancel active background streams
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (isHacking) {
            clearInterval(hackInterval);
            isHacking = false;
            appendOutput("\n[^C] OVERRIDE SEQUENCE TERMINATED BY USER.");
            inputField.style.display = 'inline-block';
            inputField.focus();
        } else if (activeInterval) {
            stopActiveStream();
        }
    }

    // CTRL + L: Clear output
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        outputDiv.textContent = '';
    }

    // CTRL + U: Clear input line
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        inputField.value = '';
    }

    // TAB Key Autocompletion
    if (e.key === 'Tab' && document.activeElement === inputField) {
        e.preventDefault();
        const inputVal = inputField.value;
        if (!inputVal) return;

        const matches = COMMAND_LIST.filter(c => c.startsWith(inputVal.toLowerCase()));
        if (matches.length === 1) {
            inputField.value = matches[0];
        } else if (matches.length > 1) {
            appendOutput(`\nAutocompletion options:\n  ${matches.join('   ')}`);
            updatePrompt();
        }
    }

    // Command History Navigation (Up/Down Arrows)
    if (document.activeElement === inputField) {
        if (e.key === 'ArrowUp') {
            if (commandHistory.length > 0 && historyIndex < commandHistory.length - 1) {
                historyIndex++;
                inputField.value = commandHistory[commandHistory.length - 1 - historyIndex];
            }
            e.preventDefault();
        } else if (e.key === 'ArrowDown') {
            if (historyIndex > 0) {
                historyIndex--;
                inputField.value = commandHistory[commandHistory.length - 1 - historyIndex];
            } else if (historyIndex === 0) {
                historyIndex = -1;
                inputField.value = '';
            }
            e.preventDefault();
        }
    }
});

// ==========================================
// 15. MAIN TERMINAL INPUT ENGINE
// ==========================================
inputField.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
        audio.enter();
        const rawInput = inputField.value.trim();
        inputField.value = '';

        if (!rawInput && installStep === 0 && !isEditing) return;

        // --- NANO TEXT EDITOR MODE ---
        if (isEditing) {
            if (rawInput.toLowerCase() === ':q') {
                isEditing = false;
                appendOutput(`\n[NANO] Closed editor without saving '${currentEditingFile}'.`);
                currentEditingFile = null;
                return;
            }
            if (rawInput.toLowerCase() === ':w' || rawInput.toLowerCase() === ':wq') {
                fileSystem[currentEditingFile] = { type: 'file', content: editingContent.trim() };
                isEditing = false;
                appendOutput(`\n[NANO] Saved changes to '${currentEditingFile}'.`);
                currentEditingFile = null;
                return;
            }
            editingContent += rawInput + "\n";
            appendOutput(`  ${rawInput}`);
            return;
        }

        const currentPrompt = promptSpan.textContent;
        appendOutput(`${currentPrompt} ${rawInput}`);

        if (rawInput) {
            commandHistory.push(rawInput);
            historyIndex = -1;
        }

        if (installStep > 0) {
            await handleInstaller(rawInput);
            return;
        }

        const parts = rawInput.split(/\s+/);
        const fullCmdLower = rawInput.toLowerCase();
        const cmd = parts[0].toLowerCase();

        // Guard for uninitialized kernel
        if (!isInstalled) {
            if (fullCmdLower === 'sspec install') {
                appendOutput("\n[!] INITIALIZING SSPEC SYSTEM INSTALLER...");
                appendOutput("[+] Checking target architecture: x86_64... OK");
                appendOutput("[+] Verifying sandbox permissions... OK");
                appendOutput("\nDo you want to proceed with SSPEC Kernel installation? [Y/n]");
                installStep = 1;
                return;
            } else {
                appendOutput(`bash: ${cmd}: command not found.`);
                appendOutput(`[CRITICAL ERROR] Kernel uninitialized. Run 'sspec install' to configure system.\n`);
                return;
            }
        }

        if (fullCmdLower === 'pip install start') {
            startPipHackerStream();
            return;
        }

        if (fullCmdLower === 'pip install stop') {
            stopActiveStream();
            return;
        }

        // --- BANNER COMMAND ---
        if (fullCmdLower === 'banner' || fullCmdLower === 'sspec banner') {
            appendOutput(SSPEC_FULL_BANNER);
            return;
        }

        // --- ROOT ESCALATION ---
        if (fullCmdLower === 'sspec admin run') {
            isAdmin = true;
            promptSpan.style.color = '#ff0055';
            inputField.style.color = '#ff0055';
            inputField.style.caretColor = '#ff0055';
            updatePrompt();
            audio.alert();

            appendOutput("\n[*** SECRET ACCESS GRANTED ***]");
            appendOutput(SSPEC_ART);
            appendOutput("SYSTEM SPECTRA ADMIN KERNEL UNLOCKED.");
            appendOutput("Type 'admin help' or 'help' to list elevated commands.\n");
            return;
        }

        // --- ADMIN HELP DIRECTORY ---
        if (fullCmdLower === 'admin help') {
            if (!isAdmin) {
                audio.error();
                appendOutput("bash: admin help: Permission denied. Run 'sspec admin run' first to elevate to root.\n");
                return;
            }
            appendOutput("================ SSPEC ROOT COMMANDS ================");
            appendOutput("  admin help         - Display this administrator help menu");
            appendOutput("  install terminal   - Launch floating sub-terminal streaming real site logs");
            appendOutput("  pip install start  - Stream infinite Python security package downloads");
            appendOutput("  pip install stop   - Stop active streaming process");
            appendOutput("  banner             - Re-render complete system banner");
            appendOutput("  matrix [args]      - Controls: matrix true/false, red/blue/green, fast/slow");
            appendOutput("  sspec hack true    - Run override diagnostic dump & IP lookup");
            appendOutput("  system status      - View live hardware, RAM & system metrics");
            appendOutput("  wireshark          - Capture live network traffic packets");
            appendOutput("  hydra <target>     - SSH brute-force attack simulator");
            appendOutput("  hashcat <hash>     - GPU hash cracker engine simulator");
            appendOutput("  top / htop         - Live process monitor");
            appendOutput("  ping <host>        - Network latency test");
            appendOutput("  portscan local     - Execute loopback port audit");
            appendOutput("  traceroute <host>  - Trace routing path to host");
            appendOutput("  theme <color>      - UI Themes: green, cyber, red");
            appendOutput("  sound <on/off>     - Toggle audio synthesizer");
            appendOutput("  crt <on/off>       - Toggle retro CRT scanline effect");
            appendOutput("  exit               - Drop root privileges back to guest");
            appendOutput("=====================================================\n");
            return;
        }

        // --- SUB-TERMINAL OVERLAY CONTROL (REAL WEBSITE LOG STREAM) ---
        if (fullCmdLower === 'install terminal' || fullCmdLower === 'open terminal') {
            if (!isAdmin) {
                audio.error();
                appendOutput("bash: install terminal: Permission denied. Admin required.\n");
                return;
            }
            appendOutput("[+] Launching root sub-terminal window [Real-time Website Log Stream]...\n");
            openWinTerminal();
            return;
        }

        // --- DIAGNOSTIC OVERRIDE DUMP (sspec hack true) ---
        if (fullCmdLower === 'sspec hack true') {
            if (!isAdmin) {
                audio.error();
                appendOutput("bash: sspec: Permission denied. Admin required.\n");
                return;
            }

            appendOutput("\n[!] INITIALIZING OVERRIDE PROTOCOL...");
            appendOutput("[!] PRESS 'CTRL + C' TO CANCEL.\n");
            
            isHacking = true;
            inputField.style.display = 'none';

            let lineCount = 0;
            const maxLines = 30;

            hackInterval = setInterval(async () => {
                appendOutput(generatePipHackerLog());
                lineCount++;

                if (lineCount >= maxLines) {
                    clearInterval(hackInterval);
                    isHacking = false;
                    await revealTargetFullData();
                }
            }, 60);
            return;
        }

        // --- MATRIX RAIN CONTROLS ---
        if (cmd === 'matrix') {
            if (!isAdmin) {
                audio.error();
                appendOutput("bash: matrix: Permission denied. Admin required.\n");
                return;
            }
            const arg = parts[1] ? parts[1].toLowerCase() : '';

            if (arg === 'true' || arg === 'start') {
                startMatrix();
                appendOutput("[+] Matrix rain background activated.\n");
            } else if (arg === 'false' || arg === 'stop') {
                stopMatrix();
                appendOutput("[-] Matrix rain background deactivated.\n");
            } else if (arg === 'red') {
                matrixColor = '#ff0055';
                startMatrix();
                appendOutput("[+] Matrix color updated to RED.\n");
            } else if (arg === 'blue') {
                matrixColor = '#00ccff';
                startMatrix();
                appendOutput("[+] Matrix color updated to BLUE.\n");
            } else if (arg === 'green') {
                matrixColor = '#00ff00';
                startMatrix();
                appendOutput("[+] Matrix color updated to GREEN.\n");
            } else if (arg === 'fast') {
                matrixSpeed = 15;
                startMatrix();
                appendOutput("[+] Matrix speed set to FAST.\n");
            } else if (arg === 'slow') {
                matrixSpeed = 60;
                startMatrix();
                appendOutput("[+] Matrix speed set to SLOW.\n");
            } else {
                appendOutput("Usage: matrix <true|false|red|blue|green|fast|slow>\n");
            }
            return;
        }

        // --- SYSTEM METRICS DIAGNOSTIC ---
        if (fullCmdLower === 'system status') {
            appendOutput("\n--- SSPEC SYSTEM METRICS ---");
            appendOutput(`CPU Usage    : ${Math.floor(Math.random() * 25 + 5)}% [8 Cores]`);
            appendOutput(`RAM Usage    : ${Math.floor(Math.random() * 1024 + 2048)}MB / 8192MB`);
            appendOutput(`Kernel       : Linux sspec-node 5.15.0-x86_64`);
            appendOutput(`Uptime       : 14 days, 03 hours, 22 mins`);
            appendOutput(`Active Sockets: ${Math.floor(Math.random() * 12 + 4)} ESTABLISHED\n`);
            return;
        }

        // --- AUDIO SYNTHESIZER TOGGLE ---
        if (fullCmdLower === 'sound on') {
            audio.enabled = true;
            appendOutput("[+] Terminal audio feedback ENABLED.\n");
            return;
        } else if (fullCmdLower === 'sound off') {
            audio.enabled = false;
            appendOutput("[-] Terminal audio feedback DISABLED.\n");
            return;
        }

        // --- CRT SCANLINE TOGGLE ---
        if (fullCmdLower === 'crt on') {
            document.body.classList.add('crt-effect');
            appendOutput("[+] Retro CRT scanline overlay ACTIVATED.\n");
            return;
        } else if (fullCmdLower === 'crt off') {
            document.body.classList.remove('crt-effect');
            appendOutput("[-] Retro CRT scanline overlay DEACTIVATED.\n");
            return;
        }

        // --- SECURITY TOOLS ---
        if (cmd === 'wireshark' || cmd === 'tcpdump') {
            appendOutput("[+] CAPTURING LIVE PACKETS ON INTERFACE eth0 (PRESS CTRL+C TO CANCEL)...");
            activeInterval = setInterval(() => {
                const protocols = ['TCP', 'UDP', 'TLSv1.3', 'HTTP/2', 'DNS'];
                const proto = protocols[Math.floor(Math.random() * protocols.length)];
                const src = `192.168.1.${Math.floor(Math.random()*254+1)}`;
                const dst = `10.0.0.${Math.floor(Math.random()*254+1)}`;
                appendOutput(`[${formatTimestamp()}] ${proto} ${src}:${Math.floor(Math.random()*8000+1000)} -> ${dst}:443 [LEN=${Math.floor(Math.random()*1200+64)}]`);
                audio.streamTick();
            }, 120);
            return;
        }

        if (cmd === 'hydra') {
            const target = parts[1] || "192.168.1.1";
            appendOutput(`[+] Starting Hydra v9.2 SSH Brute-Force against ${target}:22...`);
            let count = 0;
            activeInterval = setInterval(() => {
                count++;
                const pass = Math.random().toString(36).substring(2, 10);
                appendOutput(`[ATTEMPT ${count}] Trying root:${pass} ... FAILED`);
                if (count >= 15) {
                    clearInterval(activeInterval);
                    activeInterval = null;
                    audio.alert();
                    appendOutput(`\n[SUCCESS] PASSWORD DISCOVERED: root:P@ssw0rd2026!\n`);
                }
            }, 100);
            return;
        }

        if (cmd === 'hashcat') {
            appendOutput("[+] Initializing Hashcat v6.2.5 CUDA Hash Cracker...");
            appendOutput("Speed: 14,250.4 MH/s | Temp: 72°C | GPU Utilization: 99%");
            let progress = 0;
            activeInterval = setInterval(() => {
                progress += 10;
                appendOutput(`Progress: [${'='.repeat(progress / 5)}${' '.repeat(20 - progress / 5)}] ${progress}%`);
                if (progress >= 100) {
                    clearInterval(activeInterval);
                    activeInterval = null;
                    audio.alert();
                    appendOutput("\n[+] Hash Cracked: $6$rounds=5000$root -> admin123\n");
                }
            }, 150);
            return;
        }

        if (cmd === 'top' || cmd === 'htop') {
            appendOutput("[+] LIVE SYSTEM PROCESS MONITOR (PRESS CTRL+C TO CANCEL)");
            activeInterval = setInterval(() => {
                outputDiv.textContent = '';
                appendOutput(`SSPEC-NODE TOP MONITOR - ${formatTimestamp()}`);
                appendOutput(`Tasks: 42 total, 1 running, 41 sleeping`);
                appendOutput(`%Cpu(s): ${(Math.random()*15+2).toFixed(1)} us, ${(Math.random()*5+1).toFixed(1)} sy, 0.0 id`);
                appendOutput(`MiB Mem : 8192.0 total, ${(Math.random()*500+3000).toFixed(1)} used`);
                appendOutput("\n  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND");
                appendOutput(` 1024 root      20   0  712400  84200  31200 S   8.3   1.0   0:14.22 sspec-kernel`);
                appendOutput(` 1088 guest     20   0  120400  12400   4100 S   2.1   0.2   0:02.11 node-server`);
                appendOutput(` 2041 guest     20   0  412400  42400  11200 R   1.2   0.5   0:00.89 htop-engine`);
            }, 500);
            return;
        }

        if (cmd === 'ping') {
            const host = parts[1] || "8.8.8.8";
            appendOutput(`PING ${host} (${host}) 56(84) bytes of data.`);
            activeInterval = setInterval(() => {
                const ms = (Math.random() * 12 + 8).toFixed(2);
                appendOutput(`64 bytes from ${host}: icmp_seq=1 ttl=118 time=${ms} ms`);
                audio.streamTick();
            }, 800);
            return;
        }

        // --- FILESYSTEM COMMANDS ---
        if (cmd === 'pwd') {
            appendOutput(currentPath + "\n");
            return;
        }

        if (cmd === 'cd') {
            let target = resolvePath(parts[1]);
            if (fileSystem[target] && fileSystem[target].type === 'dir') {
                if (fileSystem[target].restricted && !isAdmin) {
                    audio.error();
                    appendOutput(`cd: permission denied: ${parts[1]}\n`);
                } else {
                    currentPath = target;
                    updatePrompt();
                }
            } else {
                audio.error();
                appendOutput(`cd: no such file or directory: ${parts[1] || ''}\n`);
            }
            return;
        }

        if (cmd === 'ls') {
            let entries = Object.keys(fileSystem).filter(p => {
                if (p === '/') return false;
                let parent = p.substring(0, p.lastIndexOf('/')) || '/';
                return parent === currentPath;
            }).map(p => p.substring(p.lastIndexOf('/') + 1));

            appendOutput(entries.length ? entries.join("  ") + "\n" : "[Empty Directory]\n");
            return;
        }

        if (cmd === 'cat') {
            let target = resolvePath(parts[1]);
            if (fileSystem[target] && fileSystem[target].type === 'file') {
                appendOutput(fileSystem[target].content + "\n");
            } else {
                audio.error();
                appendOutput(`cat: ${parts[1] || ''}: No such file\n`);
            }
            return;
        }

        if (cmd === 'touch') {
            if (!parts[1]) {
                appendOutput("touch: missing file operand\n");
                return;
            }
            let target = resolvePath(parts[1]);
            fileSystem[target] = { type: "file", content: "" };
            appendOutput(`Created file: ${parts[1]}\n`);
            return;
        }

        if (cmd === 'mkdir') {
            if (!parts[1]) {
                appendOutput("mkdir: missing directory operand\n");
                return;
            }
            let target = resolvePath(parts[1]);
            fileSystem[target] = { type: "dir" };
            appendOutput(`Created directory: ${parts[1]}\n`);
            return;
        }

        if (cmd === 'rm') {
            let target = resolvePath(parts[1]);
            if (fileSystem[target]) {
                delete fileSystem[target];
                appendOutput(`Removed file/directory: ${parts[1]}\n`);
            } else {
                appendOutput(`rm: cannot remove '${parts[1] || ''}': No such file or directory\n`);
            }
            return;
        }

        if (cmd === 'echo') {
            if (rawInput.includes('>')) {
                const echoParts = rawInput.substring(5).split('>');
                const text = echoParts[0].trim().replace(/^["']|["']$/g, '');
                const fileName = echoParts[1].trim();

                let target = resolvePath(fileName);
                fileSystem[target] = { type: "file", content: text };
                appendOutput(`Wrote content to ${fileName}\n`);
            } else {
                appendOutput(rawInput.substring(5) + "\n");
            }
            return;
        }

        // --- INTERACTIVE NANO TEXT EDITOR ---
        if (cmd === 'nano') {
            if (!parts[1]) {
                appendOutput("nano: missing file argument\n");
                return;
            }
            currentEditingFile = resolvePath(parts[1]);
            isEditing = true;
            editingContent = fileSystem[currentEditingFile]?.content || "";

            appendOutput(`\n--- NANO EDITOR: ${parts[1]} ---`);
            appendOutput("Type text line by line. Commands: ':w' to save, ':q' to exit\n");
            if (editingContent) {
                appendOutput("Current Content:");
                appendOutput(editingContent);
            }
            return;
        }

        // --- NETWORK & PORTSCAN DIAGNOSTICS ---
        if (fullCmdLower === 'portscan local') {
            appendOutput("[+] Scanning localhost loopback (127.0.0.1)...");
            appendOutput("PORT     STATE  SERVICE");
            appendOutput("22/tcp   OPEN   ssh");
            appendOutput("80/tcp   OPEN   http (nginx/1.18)");
            appendOutput("443/tcp  OPEN   https (tls-v1.3)");
            appendOutput("3306/tcp OPEN   mysql-db");
            if (isAdmin) appendOutput("9999/tcp OPEN   sspec-backdoor-daemon");
            appendOutput("");
            return;
        }

        if (cmd === 'traceroute') {
            const host = parts[1] || "sspec.vercel.app";
            appendOutput(`traceroute to ${host}, 30 hops max, 60 byte packets`);
            
            const hops = [
                `1  _gateway (192.168.1.1)  0.421 ms`,
                `2  10.240.0.1 (10.240.0.1)  4.120 ms`,
                `3  core1.fra1.hetzner.com  12.331 ms`,
                `4  vercel-peering.fra1.net  14.882 ms`,
                `5  ${host}  18.102 ms`
            ];

            for (const hop of hops) {
                await sleep(250);
                appendOutput(` ${hop}`);
            }
            appendOutput("");
            return;
        }

        // --- UI THEME SWITCHER ---
        if (cmd === 'theme') {
            const themeColor = parts[1] ? parts[1].toLowerCase() : '';
            if (themeColor === 'cyber') {
                document.body.style.backgroundColor = '#0a0a1a';
                promptSpan.style.color = '#00f3ff';
                inputField.style.color = '#00f3ff';
                appendOutput("[+] Theme updated to CYBER BLUE.\n");
            } else if (themeColor === 'red') {
                document.body.style.backgroundColor = '#100000';
                promptSpan.style.color = '#ff0055';
                inputField.style.color = '#ff0055';
                appendOutput("[+] Theme updated to RED CRITICAL.\n");
            } else if (themeColor === 'matrix' || themeColor === 'green') {
                document.body.style.backgroundColor = '#000000';
                promptSpan.style.color = '#00ff00';
                inputField.style.color = '#00ff00';
                appendOutput("[+] Theme updated to MATRIX GREEN.\n");
            } else {
                appendOutput("Usage: theme <green|cyber|red>\n");
            }
            return;
        }

        // --- MATH CALCULATOR ---
        if (cmd === 'calc') {
            const expr = parts.slice(1).join("");
            if (!expr) {
                appendOutput("calc: missing expression (e.g., calc 25*4+10)\n");
                return;
            }
            try {
                const result = Function(`'use strict'; return (${expr})`)();
                appendOutput(`Result: ${result}\n`);
            } catch (err) {
                appendOutput(`calc: invalid mathematical expression '${expr}'\n`);
            }
            return;
        }

        // --- MISC UTILITIES ---
        if (cmd === 'history') {
            appendOutput("--- COMMAND HISTORY ---");
            commandHistory.forEach((item, index) => {
                appendOutput(` ${index + 1}  ${item}`);
            });
            appendOutput("");
            return;
        }

        if (cmd === 'uptime') {
            appendOutput(" 13:49:38 up 14 days,  3:22,  2 users,  load average: 0.15, 0.20, 0.18\n");
            return;
        }

        if (cmd === 'date') {
            appendOutput(`${new Date().toString()}\n`);
            return;
        }

        if (cmd === 'whoami') {
            appendOutput(isAdmin ? "root-admin (uid=0 gid=0)\n" : "guest (uid=1000 gid=1000)\n");
            return;
        }

        if (cmd === 'help') {
            appendOutput("SSPEC Operational Commands:");
            appendOutput("  sspec admin run    - Elevate to root administrator mode");
            appendOutput("  admin help         - List root administrator tools");
            appendOutput("  install terminal   - Open sub-terminal with live site DevTools stream");
            appendOutput("  pip install start  - Infinite hacker stream");
            appendOutput("  pip install stop   - Stop active streaming stream");
            appendOutput("  ls, cd, pwd        - Navigation tools");
            appendOutput("  cat, touch, mkdir  - File manipulation");
            appendOutput("  rm, echo, nano     - File management & interactive editing");
            appendOutput("  wireshark / hydra  - Security diagnostics");
            appendOutput("  hashcat / htop     - GPU cracker & process monitor");
            appendOutput("  ping / traceroute  - Network latency & routing tests");
            appendOutput("  sound on / off     - Toggle audio synthesizer");
            appendOutput("  crt on / off       - Toggle CRT visual scanlines");
            appendOutput("  calc / history     - Calculator & command history");
            appendOutput("  clear / exit       - Terminal controls\n");
            return;
        }

        if (cmd === 'clear') {
            outputDiv.textContent = '';
            return;
        }

        if (cmd === 'exit') {
            if (isAdmin) {
                isAdmin = false;
                promptSpan.style.color = '#00ff00';
                inputField.style.color = '#00ff00';
                inputField.style.caretColor = '#00ff00';
                updatePrompt();
                appendOutput("Downgraded to guest privileges.\n");
            } else {
                appendOutput("Session closed.");
                inputField.disabled = true;
            }
            return;
        }

        audio.error();
        appendOutput(`bash: ${cmd}: command not found\n`);
    }
});

// ==========================================
// 16. FLOATING SUB-TERMINAL INPUT CONTROLLER
// ==========================================
if (winInput) {
    winInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const rawInput = winInput.value.trim();
            winInput.value = '';

            if (!rawInput) return;

            appendWinOutput(`root@sspec-window:~# ${rawInput}`);
            const parts = rawInput.split(/\s+/);
            const cmd = parts[0].toLowerCase();

            if (cmd === 'help' || cmd === 'admin help') {
                appendWinOutput("Sub-terminal controls:");
                appendWinOutput("  logs start         - Resume live website DevTools log stream");
                appendWinOutput("  logs stop          - Pause live stream");
                appendWinOutput("  clear              - Clear window output");
                appendWinOutput("  whoami             - Display privilege level");
                appendWinOutput("  exit               - Close floating window\n");
            } else if (cmd === 'logs') {
                const subArg = parts[1] ? parts[1].toLowerCase() : '';
                if (subArg === 'start') {
                    startWebLogs();
                    appendWinOutput("[+] Web log stream resumed.\n");
                } else if (subArg === 'stop') {
                    stopWebLogs();
                    appendWinOutput("[-] Web log stream paused.\n");
                } else {
                    appendWinOutput("Usage: logs <start|stop>\n");
                }
            } else if (cmd === 'clear') {
                winOutput.textContent = '';
            } else if (cmd === 'whoami') {
                appendWinOutput("root (uid=0 gid=0)\n");
            } else if (cmd === 'exit') {
                closeWinTerminal();
            } else {
                appendWinOutput(`sh: ${cmd}: command not found\n`);
            }
        }
    });
}