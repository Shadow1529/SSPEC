/**
 * SSPEC OPERATIONAL ENVIRONMENT - MAIN TERMINAL CONTROLLER
 * Version: 3.5.0-RELEASE
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
  KERNEL     : 5.15.0-SSPEC-V3-RELEASE
  BUILD      : 2026.10.08.0149
  SECURITY   : ACTIVE (SANDBOXED ENCLAVE)
--------------------------------------------------------------------------------
  Type 'help' for standard user commands.
  Type 'admin help' or 'sspec admin run' for root escalation protocols.
================================================================================
`;

// ==========================================
// DOM ELEMENTS SELECTION
// ==========================================
const outputDiv = document.getElementById('output');
const inputField = document.getElementById('command-input');
const bannerPre = document.getElementById('banner');
const promptSpan = document.querySelector('.prompt');
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Floating Sub-Terminal Elements
const winTerm = document.getElementById('window-terminal');
const winHeader = document.getElementById('win-header');
const winOutput = document.getElementById('win-output');
const winInput = document.getElementById('win-input');

// ==========================================
// VIRTUAL FILESYSTEM STATE
// ==========================================
const virtualFiles = {
    "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <title>tty1 - sspec-node</title>\n</head>\n<body>\n    <div id="cli">...</div>\n</body>\n</html>`,
    "style.css": `body { background-color: #000; color: #00ff00; font-family: monospace; }`,
    "script.js": `// SSPEC Kernel Engine Active\nconsole.log("SSPEC operational environment loaded.");`,
    "config.json": `{\n  "system": "SSPEC-NODE-01",\n  "status": "OPERATIONAL",\n  "firewall": "ENABLED",\n  "encryption": "AES-256-GCM"\n}`,
    "motd.txt": `Welcome to SSPEC OS Terminal.\nAll unauthorized access strictly logged.`,
    "id_rsa.pub": `ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABgQC3N8... root@sspec-node`
};

// System Execution States
let isInstalled = false;
let installStep = 0;
let isAdmin = false;
let isHacking = false;
let hackInterval = null;
let webLogInterval = null;
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

// ==========================================
// MATRIX RAIN CANVAS ENGINE
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

// INITIALIZE SYSTEM BOOT STATE
bannerPre.textContent = '';
appendOutput("Linux sspec-node 5.15.0-x86_64 tty1 (Uninitialized)");
appendOutput("[CRITICAL] SSPEC Kernel environment not detected.");
appendOutput("Type 'sspec install' to initiate system installation and configuration.\n");

// ==========================================
// HELPER UTILITIES
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

function formatTimestamp() {
    const now = new Date();
    return now.toTimeString().split(' ')[0];
}

// ==========================================
// INTERACTIVE INSTALLER LOGIC
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

        appendOutput("\n[QUESTION 2/2] Deploy security diagnostic suite (nmap, traceroute, live-logger)? [Y/n]");
        installStep = 3;
        return;
    }

    if (installStep === 3) {
        appendOutput("\n[+] COMPILING SSPEC SYSTEM KERNEL...");
        inputField.style.display = 'none';

        const logs = [
            "Unpacking core packages: sspec-base_3.5.0_x86_64.tar.gz...",
            "Building kernel targets: vfs.o net_stack.o crypto_aead.o ui_tty.o",
            "Resolving dynamic library dependencies: libssl.so.3, libc.so.6...",
            "Generating system keypairs at /etc/sspec/keys/...",
            "Mounting virtual filesystem table /etc/fstab...",
            "Configuring network interfaces (eth0: 10.0.2.15/24)...",
            "Setting executable flags on /bin/sspec...",
            "[========================================>] 100% Complete",
            "[SUCCESS] SSPEC KERNEL INITIALIZED SUCCESSFULLY!"
        ];

        for (const log of logs) {
            appendOutput(`  -> ${log}`);
            await sleep(200 + Math.random() * 180);
        }

        await sleep(500);
        outputDiv.textContent = '';
        
        appendOutput(SSPEC_FULL_BANNER);

        isInstalled = true;
        installStep = 0;
        inputField.style.display = 'inline-block';
        inputField.focus();
    }
}

// ==========================================
// HACK MODE & DATA EXTRACTION GENERATORS
// ==========================================
function generateHackLog() {
    const logs = [
        `[+] Injecting memory payload into 0x7FFF${Math.floor(Math.random()*8999+1000)}...`,
        `[>] Bypassing firewall rule #104 at node ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.0.1`,
        `[!] OVERRIDING SECURE PROTOCOL AT PORT ${Math.floor(Math.random()*8000+1000)}`,
        `[+] Decrypting AES-256 payload... [${Math.floor(Math.random()*100)}%]`,
        `[>] MEMORY DUMP [0x${Math.floor(Math.random()*100000).toString(16)}]: ${Math.random().toString(36).substring(2, 12)}`,
        `[+] Extracting shadow hashes: $6$rounds=10000$${Math.random().toString(36).substring(2, 12)}...`,
        `[>] FORGING AUTHORIZATION TOKEN: bearer_${Math.random().toString(36).substring(2, 14)}`
    ];
    return logs[Math.floor(Math.random() * logs.length)];
}

function generateWebLog(filterCode = null) {
    const ips = ["192.168.1.45", "10.0.0.12", "172.16.254.1", "185.220.101.5", "45.33.32.156", "104.21.55.2"];
    const methods = ["GET", "POST", "GET", "HEAD", "PUT", "DELETE"];
    const paths = ["/index.html", "/api/v1/auth", "/style.css", "/script.js", "/admin/login", "/config.json", "/api/v1/system"];
    const statusCodes = [200, 200, 200, 304, 401, 403, 404, 500];

    const ip = ips[Math.floor(Math.random() * ips.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    let status = filterCode ? parseInt(filterCode) : statusCodes[Math.floor(Math.random() * statusCodes.length)];
    
    return `[${formatTimestamp()}] ${ip} - "${method} ${path} HTTP/1.1" ${status} - ${Math.floor(Math.random() * 1500 + 40)}ms`;
}

function startWebLogs(filterCode = null) {
    if (webLogInterval) clearInterval(webLogInterval);
    webLogInterval = setInterval(() => {
        if (winTerm && winTerm.style.display !== 'none') {
            appendWinOutput(generateWebLog(filterCode));
        }
    }, 1000);
}

function stopWebLogs() {
    if (webLogInterval) {
        clearInterval(webLogInterval);
        webLogInterval = null;
    }
}

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
// FLOATING SUB-TERMINAL WINDOW LOGIC
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

function openWinTerminal() {
    if (!winTerm) return;
    winTerm.style.display = 'flex';
    winOutput.textContent = '';
    appendWinOutput("=== SSPEC ROOT SUB-TERMINAL OVERLAY [LIVE HTTP STREAM] ===");
    appendWinOutput("Streaming server logs... Type 'help' for overlay controls.\n");
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
// KEYBOARD COMMAND INTERCEPTORS
// ==========================================
window.addEventListener('keydown', function(e) {
    // Intercept CTRL + C during hack mode
    if (e.ctrlKey && e.key.toLowerCase() === 'c' && isHacking) {
        clearInterval(hackInterval);
        isHacking = false;
        appendOutput("\n[^C] HACK SEQUENCE TERMINATED BY USER.");
        appendOutput("Returning to active shell...\n");
        inputField.style.display = 'inline-block';
        inputField.focus();
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
// MAIN TERMINAL INPUT ENGINE
// ==========================================
inputField.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
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
                virtualFiles[currentEditingFile] = editingContent.trim();
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

        // Track Command History
        if (rawInput) {
            commandHistory.push(rawInput);
            historyIndex = -1;
        }

        // --- INSTALLER MODE DIRECTIVE ---
        if (installStep > 0) {
            await handleInstaller(rawInput);
            return;
        }

        const parts = rawInput.split(/\s+/);
        const fullCmdLower = rawInput.toLowerCase();
        const cmd = parts[0].toLowerCase();

        // --- UNINITIALIZED KERNEL GUARD ---
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

        // --- INSTALLED SYSTEM COMMANDS ROUTER ---

        // BANNER COMMAND
        if (fullCmdLower === 'banner' || fullCmdLower === 'sspec banner') {
            appendOutput(SSPEC_FULL_BANNER);
            return;
        }

        // SECRET ADMIN ACCESS
        if (fullCmdLower === 'sspec admin run') {
            isAdmin = true;
            promptSpan.textContent = 'root@sspec-admin:~#';
            promptSpan.style.color = '#ff0055';
            inputField.style.color = '#ff0055';
            inputField.style.caretColor = '#ff0055';

            appendOutput("\n[*** SECRET ACCESS GRANTED ***]");
            appendOutput(SSPEC_ART);
            appendOutput("SYSTEM SPECTRA ADMIN KERNEL UNLOCKED.");
            appendOutput("Type 'admin help' or 'help' to list elevated commands.\n");
            return;
        }

        // HACK MODE DIAGNOSTIC DUMP
        if (fullCmdLower === 'sspec hack true') {
            if (!isAdmin) {
                appendOutput("bash: sspec: Permission denied. Admin required.\n");
                return;
            }

            appendOutput("\n[!] INITIALIZING OVERRIDE PROTOCOL...");
            appendOutput("[!] PRESS 'CTRL + C' TO CANCEL.\n");
            
            isHacking = true;
            inputField.style.display = 'none';

            let lineCount = 0;
            const maxLines = 40;

            hackInterval = setInterval(async () => {
                appendOutput(generateHackLog());
                lineCount++;

                if (lineCount >= maxLines) {
                    clearInterval(hackInterval);
                    isHacking = false;
                    await revealTargetFullData();
                }
            }, 60);
            return;
        }

        // ADMIN HELP DIRECTORY
        if (fullCmdLower === 'admin help') {
            if (!isAdmin) {
                appendOutput("bash: admin: Permission denied. Escalation required.\n");
                return;
            }
            appendOutput("================ SSPEC ROOT COMMANDS ================");
            appendOutput("  banner             - Re-render complete system banner");
            appendOutput("  install terminal   - Launch live desktop sub-terminal overlay");
            appendOutput("  matrix [args]      - Controls: matrix true/false, red/blue/green, fast/slow");
            appendOutput("  sspec hack true    - Run stream override diagnostic dump");
            appendOutput("  system status      - View hardware, RAM & system metrics");
            appendOutput("  portscan local     - Execute loopback port audit");
            appendOutput("  traceroute <host>  - Trace network routing path to host");
            appendOutput("  theme <color>      - UI Themes: green, cyber, matrix, red");
            appendOutput("  exit               - Drop root privileges back to guest");
            appendOutput("=====================================================\n");
            return;
        }

        // MATRIX RAIN CONTROLS & COLOR/SPEED MODIFIERS
        if (cmd === 'matrix') {
            if (!isAdmin) {
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

        // MOUNT SUB-TERMINAL OVERLAY
        if (fullCmdLower === 'install terminal' || fullCmdLower === 'open terminal') {
            if (!isAdmin) {
                appendOutput("bash: install terminal: Permission denied. Admin required.\n");
                return;
            }
            appendOutput("[+] Mounting root desktop window terminal overlay...\n");
            openWinTerminal();
            return;
        }

        // SYSTEM METRICS DIAGNOSTIC
        if (fullCmdLower === 'system status') {
            if (!isAdmin) {
                appendOutput("bash: system status: Permission denied.\n");
                return;
            }
            appendOutput("\n--- SSPEC SYSTEM METRICS ---");
            appendOutput(`CPU Usage    : ${Math.floor(Math.random() * 25 + 5)}% [8 Cores]`);
            appendOutput(`RAM Usage    : ${Math.floor(Math.random() * 1024 + 2048)}MB / 8192MB`);
            appendOutput(`Kernel       : Linux sspec-node 5.15.0-x86_64`);
            appendOutput(`Uptime       : 14 days, 03 hours, 22 mins`);
            appendOutput(`Active Sockets: ${Math.floor(Math.random() * 12 + 4)} ESTABLISHED\n`);
            return;
        }

        // INTERNAL LOCAL SCAN
        if (fullCmdLower === 'portscan local') {
            if (!isAdmin) {
                appendOutput("bash: portscan: Permission denied.\n");
                return;
            }
            appendOutput("[+] Scanning localhost loopback (127.0.0.1)...");
            appendOutput("PORT     STATE  SERVICE");
            appendOutput("21/tcp   CLOSED ftp");
            appendOutput("22/tcp   OPEN   ssh");
            appendOutput("80/tcp   OPEN   http (nginx/1.18)");
            appendOutput("443/tcp  OPEN   https (tls-v1.3)");
            appendOutput("3306/tcp OPEN   mysql-db");
            appendOutput("8080/tcp OPEN   http-proxy");
            appendOutput("9999/tcp OPEN   sspec-backdoor-daemon\n");
            return;
        }

        // TRACEROUTE SIMULATOR
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
                await sleep(300);
                appendOutput(` ${hop}`);
            }
            appendOutput("");
            return;
        }

        // UI THEME SWITCHER
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

        // NANO INTERACTIVE TEXT EDITOR
        if (cmd === 'nano') {
            const fileName = parts[1];
            if (!fileName) {
                appendOutput("nano: missing file argument\n");
                return;
            }
            currentEditingFile = fileName;
            isEditing = true;
            editingContent = virtualFiles[fileName] || "";

            appendOutput(`\n--- NANO EDITOR: ${fileName} ---`);
            appendOutput("Type text line by line. Commands: ':w' to save, ':q' to exit\n");
            if (editingContent) {
                appendOutput("Current Content:");
                appendOutput(editingContent);
            }
            return;
        }

        // MATH CALCULATOR COMMAND
        if (cmd === 'calc') {
            const expr = parts.slice(1).join("");
            if (!expr) {
                appendOutput("calc: missing mathematical expression (e.g., calc 25*4+10)\n");
                return;
            }
            try {
                // Safe evaluated expression
                const result = Function(`'use strict'; return (${expr})`)();
                appendOutput(`Result: ${result}\n`);
            } catch (err) {
                appendOutput(`calc: invalid expression '${expr}'\n`);
            }
            return;
        }

        // COMMAND HISTORY LIST
        if (cmd === 'history') {
            appendOutput("--- COMMAND HISTORY ---");
            commandHistory.forEach((item, index) => {
                appendOutput(` ${index + 1}  ${item}`);
            });
            appendOutput("");
            return;
        }

        // UPTIME & DATE COMMANDS
        if (cmd === 'uptime') {
            appendOutput(" 13:49:38 up 14 days,  3:22,  2 users,  load average: 0.15, 0.20, 0.18\n");
            return;
        }

        if (cmd === 'date') {
            appendOutput(`${new Date().toString()}\n`);
            return;
        }

        // STANDARD SHELL COMMAND SUITE
        if (cmd === 'help') {
            if (isAdmin) {
                appendOutput("Available commands (ROOT PRIVILEGES ACTIVE):");
                appendOutput("  banner             - Display full system info ASCII banner");
                appendOutput("  admin help         - Display root command suite");
                appendOutput("  install terminal   - Launch desktop GUI window terminal");
                appendOutput("  matrix <args>      - Toggle/customize background rain");
                appendOutput("  sspec hack true    - Run stream override diagnostic dump");
                appendOutput("  system status      - Hardware & memory diagnostics");
                appendOutput("  portscan local     - Internal system port audit");
                appendOutput("  traceroute <host>  - Trace network route to target");
                appendOutput("  theme <color>      - Change shell color theme");
                appendOutput("  nano <file>        - Interactive text editor");
                appendOutput("  calc <expr>        - Evaluate math expression");
                appendOutput("  history            - Display command execution history");
                appendOutput("  ls / cat / touch   - File management");
                appendOutput("  clear / exit       - System controls\n");
            } else {
                appendOutput("Available commands:");
                appendOutput("  banner             - Display system banner");
                appendOutput("  ls                 - List directory files");
                appendOutput("  cat <file>         - Display file contents");
                appendOutput("  nano <file>        - Open text editor");
                appendOutput("  touch <file>       - Create a new file");
                appendOutput("  rm <file>          - Remove a file");
                appendOutput("  echo <text> > <f>  - Write text to a file");
                appendOutput("  whoami             - Print current user level");
                appendOutput("  nmap <target>      - Port scan host");
                appendOutput("  calc <expr>        - Quick calculator");
                appendOutput("  history            - Command history");
                appendOutput("  uptime / date      - System clock status");
                appendOutput("  clear              - Clear terminal screen");
                appendOutput("  exit               - Terminate session\n");
            }

        } else if (cmd === 'ls') {
            appendOutput(Object.keys(virtualFiles).join("  ") + "\n");

        } else if (cmd === 'cat') {
            const fileName = parts[1];
            if (!fileName) {
                appendOutput("cat: missing file operand\n");
            } else if (virtualFiles[fileName] !== undefined) {
                appendOutput(virtualFiles[fileName] + "\n");
            } else {
                appendOutput(`cat: ${fileName}: No such file or directory\n`);
            }

        } else if (cmd === 'touch') {
            const fileName = parts[1];
            if (fileName) {
                virtualFiles[fileName] = "";
                appendOutput(`Created file: ${fileName}\n`);
            } else {
                appendOutput("touch: missing file operand\n");
            }

        } else if (cmd === 'rm') {
            const fileName = parts[1];
            if (virtualFiles[fileName] !== undefined) {
                delete virtualFiles[fileName];
                appendOutput(`Removed file: ${fileName}\n`);
            } else {
                appendOutput(`rm: cannot remove '${fileName || ''}': No such file or directory\n`);
            }

        } else if (cmd === 'echo') {
            if (rawInput.includes('>')) {
                const echoParts = rawInput.substring(5).split('>');
                const text = echoParts[0].trim().replace(/^["']|["']$/g, '');
                const fileName = echoParts[1].trim();

                virtualFiles[fileName] = text;
                appendOutput(`Wrote to ${fileName}\n`);
            } else {
                appendOutput(rawInput.substring(5) + "\n");
            }

        } else if (cmd === 'whoami') {
            appendOutput(isAdmin ? "root-admin (uid=0 gid=0)\n" : "guest (uid=1000 gid=1000)\n");

        } else if (cmd === 'nmap') {
            const target = parts[1] || "127.0.0.1";
            appendOutput(`Starting Nmap 7.92 ( https://nmap.org ) at target ${target}...`);
            await sleep(350);
            appendOutput("PORT     STATE SERVICE");
            appendOutput("22/tcp   open  ssh");
            appendOutput("80/tcp   open  http");
            appendOutput("443/tcp  open  https");
            if (isAdmin) appendOutput("9999/tcp open  sspec-admin-backdoor");
            appendOutput("\nNmap done: 1 IP address scanned in 0.38 seconds\n");

        } else if (cmd === 'clear') {
            outputDiv.textContent = '';

        } else if (cmd === 'exit') {
            if (isAdmin) {
                isAdmin = false;
                stopMatrix();
                promptSpan.textContent = 'guest@sspec-node:~$';
                promptSpan.style.color = '#00ff00';
                inputField.style.color = '#00ff00';
                inputField.style.caretColor = '#00ff00';
                appendOutput("Admin session closed. Downgraded to guest privileges.\n");
            } else {
                appendOutput("Session terminated.");
                inputField.disabled = true;
            }

        } else {
            appendOutput(`bash: ${cmd}: command not found\n`);
        }
    }
});

// ==========================================
// FLOATING SUB-TERMINAL CONTROLLER
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
                appendWinOutput("Sub-terminal commands:");
                appendWinOutput("  logs start         - Resume website access log stream");
                appendWinOutput("  logs stop          - Pause website access log stream");
                appendWinOutput("  logs <status_code> - Filter logs by HTTP status code (e.g. logs 401)");
                appendWinOutput("  clear              - Clear window terminal output");
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
                } else if (!isNaN(parseInt(subArg))) {
                    startWebLogs(subArg);
                    appendWinOutput(`[+] Filtering web log stream for HTTP status ${subArg}...\n`);
                } else {
                    appendWinOutput("Usage: logs <start|stop|status_code>\n");
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