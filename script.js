/**
 * SSPEC OPERATIONAL ENVIRONMENT - MAIN TERMINAL CONTROLLER
 * Version: 4.0.0-NEXTGEN
 * Kernel: Linux sspec-node 5.15.0-x86_64
 */

// ==========================================
// ASCII ART & BANNER DEFINITIONS
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
  KERNEL     : 5.15.0-SSPEC-V4-NEXTGEN
  BUILD      : 2026.10.08.0200
  SECURITY   : ENCRYPTION MESH ACTIVE
--------------------------------------------------------------------------------
  Type 'help' for available terminal controls.
  Press 'TAB' for command autocompletion | 'CTRL+C' to cancel live streams.
================================================================================
`;

// ==========================================
// AUDIO SYNTHESIZER ENGINE (Web Audio API)
// ==========================================
class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
    }

    playTone(freq, type, duration, vol = 0.05) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
            gain.gain.setValueAtTime(vol, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    keyClick() { this.playTone(800 + Math.random() * 200, 'square', 0.015, 0.02); }
    enter() { this.playTone(400, 'sine', 0.08, 0.04); }
    error() { this.playTone(150, 'sawtooth', 0.2, 0.08); }
    streamTick() { this.playTone(1200 + Math.random() * 400, 'sine', 0.01, 0.01); }
    alert() {
        this.playTone(880, 'square', 0.1, 0.08);
        setTimeout(() => this.playTone(440, 'square', 0.15, 0.08), 100);
    }
}

const audio = new SoundEngine();

// ==========================================
// DOM ELEMENTS SELECTION & INJECT CRT STYLES
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

// Inject CRT visual effect dynamically
const crtStyle = document.createElement('style');
crtStyle.id = 'crt-style';
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
// HIERARCHICAL VIRTUAL FILESYSTEM
// ==========================================
let currentPath = "/home/guest";

const fileSystem = {
    "/": { type: "dir" },
    "/bin": { type: "dir" },
    "/etc": { type: "dir" },
    "/etc/config.json": { type: "file", content: '{\n  "system": "SSPEC-NODE-01",\n  "status": "OPERATIONAL"\n}' },
    "/etc/motd": { type: "file", content: "Welcome to SSPEC OS Terminal.\nAll unauthorized access strictly logged." },
    "/home": { type: "dir" },
    "/home/guest": { type: "dir" },
    "/home/guest/index.html": { type: "file", content: "<!DOCTYPE html>\n<html>\n<body>\n  <h1>SSPEC OS</h1>\n</body>\n</html>" },
    "/home/guest/style.css": { type: "file", content: "body { background: #000; color: #0f0; }" },
    "/home/guest/script.js": { type: "file", content: "console.log('SSPEC Engine Active');" },
    "/var": { type: "dir" },
    "/var/log": { type: "dir" },
    "/var/log/syslog": { type: "file", content: "[SYS_BOOT] Kernel 5.15 loaded successfully." },
    "/root": { type: "dir", restricted: true },
    "/root/id_rsa": { type: "file", content: "-----BEGIN OPENSSH PRIVATE KEY-----\nb3BlbnNzaC1rZXktdjEAAAA...\n-----END OPENSSH PRIVATE KEY-----" }
};

// ==========================================
// GLOBAL STATE VARIABLES
// ==========================================
let isInstalled = false;
let installStep = 0;
let isAdmin = false;
let isHacking = false;
let activeInterval = null;
let webLogInterval = null;
let commandHistory = [];
let historyIndex = -1;
let currentEditingFile = null;
let isEditing = false;
let editingContent = "";

// Matrix Engine States
let matrixInterval = null;
let matrixColor = '#00ff00';
let matrixSpeed = 33;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%<>/\\{}[]';
let drops = [];

const COMMAND_LIST = [
    'pip install start', 'pip install stop', 'help', 'ls', 'cd', 'pwd', 'cat', 'touch', 
    'mkdir', 'rm', 'nano', 'whoami', 'clear', 'exit', 'banner', 'matrix', 'system status', 
    'portscan local', 'traceroute', 'theme', 'calc', 'history', 'uptime', 'date', 
    'wireshark', 'hydra', 'hashcat', 'top', 'ping', 'sound', 'crt', 'install terminal'
];

// ==========================================
// MATRIX RAIN ENGINE
// ==========================================
function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    drops = Array(Math.floor(canvas.width / 16)).fill(1);
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = matrixColor;
    ctx.font = '15px monospace';

    for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        ctx.fillText(text, i * 16, drops[i] * 16);
        if (drops[i] * 16 > canvas.height && Math.random() > 0.975) drops[i] = 0;
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
    if (matrixInterval) { clearInterval(matrixInterval); matrixInterval = null; }
}

window.addEventListener('resize', initMatrix);

// Boot System Message
bannerPre.textContent = '';
appendOutput("Linux sspec-node 5.15.0-x86_64 tty1 (Uninitialized)");
appendOutput("[CRITICAL] SSPEC Kernel environment not detected.");
appendOutput("Type 'sspec install' to initiate system installation and configuration.\n");

// ==========================================
// HELPER UTILITIES & PATH RESOLVER
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
    winBody.scrollTop = winBody.scrollHeight;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function formatTimestamp() { return new Date().toTimeString().split(' ')[0]; }

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
        if (p === '..') stack.pop();
        else if (p !== '.') stack.push(p);
    }
    return '/' + stack.join('/');
}

// ==========================================
// PIP INFINITE HACKER STREAM GENERATOR
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

function stopPipHackerStream() {
    if (activeInterval) {
        clearInterval(activeInterval);
        activeInterval = null;
    }
    appendOutput("\n[-] PIP STREAM TERMINATED SUCCESSFULLY.");
    appendOutput("Restoring terminal session...\n");
}

// ==========================================
// INTERACTIVE INSTALLER
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
        appendOutput(val === 'n' ? "[*] Admin modules disabled." : "[*] Admin modules enabled & mapped to 'sspec admin run'.");
        await sleep(250);
        appendOutput("\n[QUESTION 2/2] Deploy security diagnostic suite (wireshark, hydra, hashcat)? [Y/n]");
        installStep = 3;
        return;
    }

    if (installStep === 3) {
        appendOutput("\n[+] COMPILING SSPEC SYSTEM KERNEL...");
        inputField.style.display = 'none';

        const logs = [
            "Unpacking core packages: sspec-base_4.0.0_x86_64.tar.gz...",
            "Building kernel targets: vfs.o audio_synth.o crypto_aead.o ui_tty.o",
            "Resolving dynamic library dependencies: libssl.so.3, libc.so.6...",
            "Mounting virtual filesystem root hierarchy...",
            "[========================================>] 100% Complete",
            "[SUCCESS] SSPEC KERNEL INITIALIZED SUCCESSFULLY!"
        ];

        for (const log of logs) {
            appendOutput(`  -> ${log}`);
            audio.keyClick();
            await sleep(200 + Math.random() * 150);
        }

        await sleep(400);
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
// KEYBOARD CONTROLLER & TAB COMPLETION
// ==========================================
window.addEventListener('keydown', function(e) {
    audio.keyClick();

    // Cancel Active Stream with CTRL+C
    if (e.ctrlKey && e.key.toLowerCase() === 'c') {
        if (activeInterval) {
            clearInterval(activeInterval);
            activeInterval = null;
            appendOutput("\n[^C] PROCESS TERMINATED BY USER.");
            inputField.style.display = 'inline-block';
            inputField.focus();
        }
    }

    // Clear Screen with CTRL+L
    if (e.ctrlKey && e.key.toLowerCase() === 'l') {
        e.preventDefault();
        outputDiv.textContent = '';
    }

    // Clear Line with CTRL+U
    if (e.ctrlKey && e.key.toLowerCase() === 'u') {
        e.preventDefault();
        inputField.value = '';
    }

    // TAB AUTOCOMPLETION
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

    // Command History Navigation
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
// MAIN TERMINAL ENGINE
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
                appendOutput(`\n[NANO] Closed editor without saving.`);
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

        appendOutput(`${promptSpan.textContent} ${rawInput}`);

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

        if (!isInstalled) {
            if (fullCmdLower === 'sspec install') {
                appendOutput("\n[!] INITIALIZING SSPEC SYSTEM INSTALLER...");
                appendOutput("Do you want to proceed with SSPEC Kernel installation? [Y/n]");
                installStep = 1;
            } else {
                appendOutput(`bash: ${cmd}: command not found.`);
                appendOutput(`[CRITICAL ERROR] Kernel uninitialized. Run 'sspec install' to configure system.\n`);
            }
            return;
        }

        // --- COMMAND ROUTER ---
        switch (fullCmdLower) {
            case 'pip install start':
                startPipHackerStream();
                return;
            case 'pip install stop':
                stopPipHackerStream();
                return;
            case 'banner':
            case 'sspec banner':
                appendOutput(SSPEC_FULL_BANNER);
                return;
            case 'sspec admin run':
                isAdmin = true;
                promptSpan.style.color = '#ff0055';
                inputField.style.color = '#ff0055';
                inputField.style.caretColor = '#ff0055';
                updatePrompt();
                audio.alert();
                appendOutput("\n[*** ROOT ESCALATION GRANTED ***]");
                appendOutput("SYSTEM SPECTRA ADMIN KERNEL UNLOCKED.\n");
                return;
            case 'system status':
                appendOutput("\n--- SSPEC SYSTEM METRICS ---");
                appendOutput(`CPU Usage    : ${Math.floor(Math.random() * 25 + 5)}% [8 Cores]`);
                appendOutput(`RAM Usage    : ${Math.floor(Math.random() * 1024 + 2048)}MB / 8192MB`);
                appendOutput(`Kernel       : Linux sspec-node 5.15.0-x86_64`);
                appendOutput(`Uptime       : 14 days, 03 hours, 22 mins\n`);
                return;
            case 'pwd':
                appendOutput(currentPath);
                return;
            case 'sound on':
                audio.enabled = true;
                appendOutput("[+] Terminal audio feedback ENABLED.");
                return;
            case 'sound off':
                audio.enabled = false;
                appendOutput("[-] Terminal audio feedback DISABLED.");
                return;
            case 'crt on':
                document.body.classList.add('crt-effect');
                appendOutput("[+] Retro CRT scanline effect ACTIVATED.");
                return;
            case 'crt off':
                document.body.classList.remove('crt-effect');
                appendOutput("[-] Retro CRT scanline effect DEACTIVATED.");
                return;
        }

        // PARAMETER-BASED COMMANDS
        if (cmd === 'cd') {
            let target = resolvePath(parts[1]);
            if (fileSystem[target] && fileSystem[target].type === 'dir') {
                if (fileSystem[target].restricted && !isAdmin) {
                    audio.error();
                    appendOutput(`cd: permission denied: ${parts[1]}`);
                } else {
                    currentPath = target;
                    updatePrompt();
                }
            } else {
                audio.error();
                appendOutput(`cd: no such file or directory: ${parts[1] || ''}`);
            }
        } 
        else if (cmd === 'ls') {
            let entries = Object.keys(fileSystem).filter(p => {
                if (p === '/') return false;
                let parent = p.substring(0, p.lastIndexOf('/')) || '/';
                return parent === currentPath;
            }).map(p => p.substring(p.lastIndexOf('/') + 1));

            appendOutput(entries.length ? entries.join("  ") : "[Empty Directory]");
        }
        else if (cmd === 'cat') {
            let target = resolvePath(parts[1]);
            if (fileSystem[target] && fileSystem[target].type === 'file') {
                appendOutput(fileSystem[target].content);
            } else {
                audio.error();
                appendOutput(`cat: ${parts[1] || ''}: No such file`);
            }
        }
        else if (cmd === 'touch') {
            if (!parts[1]) return appendOutput("touch: missing file operand");
            let target = resolvePath(parts[1]);
            fileSystem[target] = { type: "file", content: "" };
            appendOutput(`Created file: ${parts[1]}`);
        }
        else if (cmd === 'mkdir') {
            if (!parts[1]) return appendOutput("mkdir: missing directory operand");
            let target = resolvePath(parts[1]);
            fileSystem[target] = { type: "dir" };
            appendOutput(`Created directory: ${parts[1]}`);
        }
        else if (cmd === 'rm') {
            let target = resolvePath(parts[1]);
            if (fileSystem[target]) {
                delete fileSystem[target];
                appendOutput(`Removed: ${parts[1]}`);
            } else {
                appendOutput(`rm: cannot remove '${parts[1] || ''}': No such file`);
            }
        }
        else if (cmd === 'wireshark' || cmd === 'tcpdump') {
            appendOutput("[+] CAPTURING LIVE PACKETS ON INTERFACE eth0 (PRESS CTRL+C TO CANCEL)...");
            activeInterval = setInterval(() => {
                const protocols = ['TCP', 'UDP', 'TLSv1.3', 'HTTP/2', 'DNS'];
                const proto = protocols[Math.floor(Math.random() * protocols.length)];
                const src = `192.168.1.${Math.floor(Math.random()*254+1)}`;
                const dst = `10.0.0.${Math.floor(Math.random()*254+1)}`;
                appendOutput(`[${formatTimestamp()}] ${proto} ${src}:${Math.floor(Math.random()*8000+1000)} -> ${dst}:443 [LEN=${Math.floor(Math.random()*1200+64)}]`);
                audio.streamTick();
            }, 120);
        }
        else if (cmd === 'hydra') {
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
                    appendOutput(`\n[SUCCESS] PASSWORD DISCOVERED: root:P@ssw0rd2026!`);
                }
            }, 100);
        }
        else if (cmd === 'hashcat') {
            appendOutput("[+] Initializing Hashcat v6.2.5 CUDA Hash Cracker...");
            appendOutput("Speed: 14,250.4 MH/s | Temp: 72°C | GPU Utilization: 99%");
            let progress = 0;
            activeInterval = setInterval(() => {
                progress += 10;
                appendOutput(`Progress: [${'='.repeat(progress / 5)}${' '.repeat(20 - progress / 5)}] ${progress}%`);
                if (progress >= 100) {
                    clearInterval(activeInterval);
                    activeInterval = null;
                    appendOutput("\n[+] Hash Cracked: $6$rounds=5000$root -> admin123");
                }
            }, 150);
        }
        else if (cmd === 'top' || cmd === 'htop') {
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
        }
        else if (cmd === 'ping') {
            const host = parts[1] || "8.8.8.8";
            appendOutput(`PING ${host} (${host}) 56(84) bytes of data.`);
            activeInterval = setInterval(() => {
                const ms = (Math.random() * 12 + 8).toFixed(2);
                appendOutput(`64 bytes from ${host}: icmp_seq=1 ttl=118 time=${ms} ms`);
                audio.streamTick();
            }, 800);
        }
        else if (cmd === 'nano') {
            if (!parts[1]) return appendOutput("nano: missing file argument");
            currentEditingFile = resolvePath(parts[1]);
            isEditing = true;
            editingContent = fileSystem[currentEditingFile]?.content || "";
            appendOutput(`\n--- NANO EDITOR: ${parts[1]} ---`);
            appendOutput("Type text line by line. Commands: ':w' to save, ':q' to exit\n");
            if (editingContent) appendOutput("Current Content:\n" + editingContent);
        }
        else if (cmd === 'calc') {
            try {
                const expr = parts.slice(1).join("");
                appendOutput(`Result: ${Function(`'use strict'; return (${expr})`)()}`);
            } catch (err) {
                appendOutput("calc: invalid math expression");
            }
        }
        else if (cmd === 'help') {
            appendOutput("SSPEC Terminal Commands:");
            appendOutput("  pip install start / stop - Infinite hacker stream");
            appendOutput("  ls, cd <dir>, pwd        - File navigation");
            appendOutput("  cat, touch, mkdir, rm    - File management");
            appendOutput("  nano <file>              - Text editor");
            appendOutput("  wireshark / hydra        - Security diagnostics");
            appendOutput("  hashcat / htop / ping    - System monitoring");
            appendOutput("  sound on / off           - Audio synthesizer toggle");
            appendOutput("  crt on / off             - CRT visual effect toggle");
            appendOutput("  clear / whoami / exit    - Shell controls");
        }
        else if (cmd === 'clear') {
            outputDiv.textContent = '';
        }
        else if (cmd === 'whoami') {
            appendOutput(isAdmin ? "root-admin (uid=0 gid=0)" : "guest (uid=1000 gid=1000)");
        }
        else if (cmd === 'exit') {
            if (isAdmin) {
                isAdmin = false;
                promptSpan.style.color = '#00ff00';
                inputField.style.color = '#00ff00';
                inputField.style.caretColor = '#00ff00';
                updatePrompt();
                appendOutput("Downgraded to guest privileges.");
            } else {
                appendOutput("Session terminated.");
                inputField.disabled = true;
            }
        }
        else {
            audio.error();
            appendOutput(`bash: ${cmd}: command not found`);
        }
    }
});