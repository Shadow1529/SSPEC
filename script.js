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

const outputDiv = document.getElementById('output');
const inputField = document.getElementById('command-input');
const bannerPre = document.getElementById('banner');
const promptSpan = document.querySelector('.prompt');
const canvas = document.getElementById('matrix-canvas');
const ctx = canvas.getContext('2d');

// Floating Window Terminal Elements
const winTerm = document.getElementById('window-terminal');
const winHeader = document.getElementById('win-header');
const winOutput = document.getElementById('win-output');
const winInput = document.getElementById('win-input');

// Virtual Filesystem
const virtualFiles = {
    "index.html": `<!DOCTYPE html>\n<html lang="en">\n<head>\n    <title>tty1 - sspec-node</title>\n</head>\n<body>\n    <div id="cli">...</div>\n</body>\n</html>`,
    "style.css": `body { background-color: #000; color: #00ff00; }`,
    "script.js": `// SSPEC Kernel Active\nconsole.log("Terminal ready.");`,
    "config.json": `{\n  "system": "SSPEC-NODE-01",\n  "status": "OPERATIONAL"\n}`
};

// System States
let isInstalled = false;
let installStep = 0;
let isAdmin = false;
let isHacking = false;
let hackInterval = null;
let webLogInterval = null;

// Matrix Rain Animation Engine
let matrixInterval = null;
const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%';
let drops = [];

function initMatrix() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const columns = Math.floor(canvas.width / 16);
    drops = Array(columns).fill(1);
}

function drawMatrix() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#00ff00';
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
    if (!matrixInterval) matrixInterval = setInterval(drawMatrix, 33);
}

function stopMatrix() {
    canvas.style.display = 'none';
    if (matrixInterval) {
        clearInterval(matrixInterval);
        matrixInterval = null;
    }
}

window.addEventListener('resize', initMatrix);

// Unconfigured Startup Screen
bannerPre.textContent = '';
appendOutput("Linux sspec-node 5.15.0-x86_64 tty1 (Uninitialized)");
appendOutput("[CRITICAL] SSPEC Kernel environment not detected.");
appendOutput("Type 'sspec install' to initiate system installation and configuration.\n");

function appendOutput(text) {
    outputDiv.textContent += text + "\n";
    const cli = document.getElementById('cli');
    cli.scrollTop = cli.scrollHeight;
}

function appendWinOutput(text) {
    if (!winOutput) return;
    winOutput.textContent += text + "\n";
    const winBody = winOutput.parentElement;
    winBody.scrollTop = winBody.scrollHeight;
}

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Interactive CLI Installer
async function handleInstaller(input) {
    const val = input.toLowerCase();

    if (installStep === 1) {
        if (val === 'n' || val === 'no') {
            appendOutput("[!] Installation aborted by user.");
            installStep = 0;
            return;
        }
        appendOutput("[+] Allocating virtual disk space (512MB)... [OK]");
        await sleep(300);
        appendOutput("[+] Fetching package repository metadata...");
        await sleep(400);
        
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
        await sleep(300);

        appendOutput("\n[QUESTION 2/2] Install network diagnostic tools (nmap, ip-grabber)? [Y/n]");
        installStep = 3;
        return;
    }

    if (installStep === 3) {
        appendOutput("\n[+] STARTING KERNEL COMPILATION...");
        inputField.style.display = 'none';

        const logs = [
            "Unpacking sspec-core_v2.4.0_x86_64.tar.gz...",
            "Compiling modules: virtual_fs.c network_stack.c crypto_engine.c",
            "Building binary tree structure...",
            "[====================>] 100% Download complete",
            "Linking system dependencies: libssl.so, libc.so.6...",
            "Writing configuration to /etc/sspec/config.json...",
            "Setting execution permissions for /bin/sspec...",
            "Finalizing RAM allocation and initial boot image...",
            "[SUCCESS] SSPEC KERNEL INSTALLED SUCCESSFULLY!"
        ];

        for (const log of logs) {
            appendOutput(`  -> ${log}`);
            await sleep(250 + Math.random() * 200);
        }

        await sleep(600);
        outputDiv.textContent = '';
        
        appendOutput(SSPEC_ART);
        appendOutput("Linux sspec-node 5.15.0-x86_64 tty1");
        appendOutput("[SYSTEM READY] SSPEC Operational Environment active.");
        appendOutput("Type 'help' to display available system commands.\n");

        isInstalled = true;
        installStep = 0;
        inputField.style.display = 'inline-block';
        inputField.focus();
    }
}

// Target Data Extraction Generator
function generateHackLog() {
    const logs = [
        `[+] Injecting payload into 0x7FFF${Math.floor(Math.random()*8999+1000)}...`,
        `[>] Bypassing firewall node ${Math.floor(Math.random()*255)}.${Math.floor(Math.random()*255)}.0.1`,
        `[!] OVERRIDING SECURE PROTOCOL AT PORT ${Math.floor(Math.random()*8000+1000)}`,
        `[+] Decrypting RSA-4096 key... [${Math.floor(Math.random()*100)}%]`,
        `[>] DUMPING MEMORY ADDR 0x${Math.floor(Math.random()*100000).toString(16)}: ${Math.random().toString(36).substring(2, 12)}`,
        `[+] Extracting hashes: $6$rounds=5000$${Math.random().toString(36).substring(2, 10)}...`
    ];
    return logs[Math.floor(Math.random() * logs.length)];
}

// Sub-Terminal Web Access Generator
function generateWebLog() {
    const ips = ["192.168.1.45", "10.0.0.12", "172.16.254.1", "185.220.101.5", "45.33.32.156"];
    const methods = ["GET", "POST", "GET", "HEAD", "PUT"];
    const paths = ["/index.html", "/api/v1/auth", "/style.css", "/script.js", "/admin/login", "/config.json"];
    const statusCodes = [200, 200, 200, 304, 401, 404, 500];

    const ip = ips[Math.floor(Math.random() * ips.length)];
    const method = methods[Math.floor(Math.random() * methods.length)];
    const path = paths[Math.floor(Math.random() * paths.length)];
    const status = statusCodes[Math.floor(Math.random() * statusCodes.length)];
    const time = new Date().toISOString().split('T')[1].slice(0, 8);

    return `[${time}] ${ip} - "${method} ${path} HTTP/1.1" ${status} - ${Math.floor(Math.random() * 2000 + 100)}ms`;
}

function startWebLogs() {
    if (!webLogInterval) {
        webLogInterval = setInterval(() => {
            if (winTerm && winTerm.style.display !== 'none') {
                appendWinOutput(generateWebLog());
            }
        }, 1200);
    }
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

// Window Dragging Logic
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
    appendWinOutput("=== SSPEC ROOT SUB TERMINAL [LIVE WEBSITE LOGS ACTIVE] ===");
    appendWinOutput("Streaming HTTP access logs...\nType 'help' for overlay commands.\n");
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

// CTRL + C Intercept
window.addEventListener('keydown', function(e) {
    if (e.ctrlKey && e.key.toLowerCase() === 'c' && isHacking) {
        clearInterval(hackInterval);
        isHacking = false;
        appendOutput("\n[^C] HACK SEQUENCE TERMINATED BY USER.");
        appendOutput("Returning to shell...\n");
        inputField.style.display = 'inline-block';
        inputField.focus();
    }
});

// Main Input Handler
inputField.addEventListener('keydown', async function(e) {
    if (e.key === 'Enter') {
        const rawInput = inputField.value.trim();
        inputField.value = '';

        if (!rawInput && installStep === 0) return;

        const currentPrompt = promptSpan.textContent;
        appendOutput(`${currentPrompt} ${rawInput}`);

        // --- INSTALLER STEP MODE ---
        if (installStep > 0) {
            await handleInstaller(rawInput);
            return;
        }

        const parts = rawInput.split(/\s+/);
        const fullCmdLower = rawInput.toLowerCase();
        const cmd = parts[0].toLowerCase();

        // --- UNINITIALIZED SYSTEM GUARD ---
        if (!isInstalled) {
            if (fullCmdLower === 'sspec install') {
                appendOutput("\n[!] INITIALIZING SSPEC SYSTEM INSTALLER...");
                appendOutput("[+] Checking architecture: x86_64... OK");
                appendOutput("[+] Checking root privileges... OK");
                appendOutput("\nDo you want to proceed with SSPEC Kernel installation? [Y/n]");
                installStep = 1;
                return;
            } else {
                appendOutput(`bash: ${cmd}: command not found.`);
                appendOutput(`[CRITICAL ERROR] Kernel uninitialized. Run 'sspec install' to configure system.\n`);
                return;
            }
        }

        // --- INSTALLED SYSTEM COMMANDS ---

        // Secret Admin Login
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

        // Secret Hack Mode
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

        // Admin Help
        if (fullCmdLower === 'admin help') {
            if (!isAdmin) {
                appendOutput("bash: admin: Permission denied. Escalation required.\n");
                return;
            }
            appendOutput("================ SSPEC ROOT COMMANDS ================");
            appendOutput("  install terminal   - Launch live sub-terminal overlay with web logs");
            appendOutput("  matrix true        - Enable Matrix visual rain effect");
            appendOutput("  matrix false       - Disable Matrix visual rain effect");
            appendOutput("  sspec hack true    - Run stream override diagnostic dump");
            appendOutput("  system status      - View hardware, RAM & system uptime metrics");
            appendOutput("  portscan local     - Execute internal port diagnostic scan");
            appendOutput("  exit               - Drop privileges back to guest");
            appendOutput("=====================================================\n");
            return;
        }

        // GUI Window Terminal Mount
        if (fullCmdLower === 'install terminal' || fullCmdLower === 'open terminal') {
            if (!isAdmin) {
                appendOutput("bash: install terminal: Permission denied. Admin required.\n");
                return;
            }
            appendOutput("[+] Mounting root desktop window terminal overlay...\n");
            openWinTerminal();
            return;
        }

        // System Status Command
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
            appendOutput(`Active Sockets: ${Math.floor(Math.random() * 12 + 4)} active ESTABLISHED\n`);
            return;
        }

        // Portscan Local Command
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

        // Matrix Controls
        if (fullCmdLower === 'matrix true') {
            if (!isAdmin) {
                appendOutput("bash: matrix: Permission denied. Admin required.\n");
                return;
            }
            startMatrix();
            appendOutput("[+] Matrix rain background activated.\n");
            return;
        }

        if (fullCmdLower === 'matrix false') {
            if (!isAdmin) {
                appendOutput("bash: matrix: Permission denied. Admin required.\n");
                return;
            }
            stopMatrix();
            appendOutput("[-] Matrix rain background deactivated.\n");
            return;
        }

        // Standard Shell Commands
        if (cmd === 'help') {
            if (isAdmin) {
                appendOutput("Available commands (ROOT PRIVILEGES ACTIVE):");
                appendOutput("  admin help         - Display root/admin command suite");
                appendOutput("  install terminal   - Launch desktop GUI window terminal");
                appendOutput("  matrix true/false  - Toggle background Matrix animation");
                appendOutput("  sspec hack true    - Run stream override diagnostic dump");
                appendOutput("  system status      - Hardware & memory diagnostics");
                appendOutput("  portscan local     - Internal system port scan");
                appendOutput("  ls / cat / touch   - Standard virtual file operations");
                appendOutput("  clear / exit       - System controls\n");
            } else {
                appendOutput("Available commands:");
                appendOutput("  ls                 - List directory files");
                appendOutput("  cat <file>         - Display file contents");
                appendOutput("  touch <file>       - Create a new file");
                appendOutput("  rm <file>          - Remove a file");
                appendOutput("  echo <text> > <f>  - Write text to a file");
                appendOutput("  whoami             - Print current user level");
                appendOutput("  nmap <target>      - Port scan host");
                appendOutput("  clear              - Clear terminal screen");
                appendOutput("  exit               - Terminate current session\n");
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
            appendOutput(`Starting Nmap 7.92 at target ${target}...`);
            await new Promise(r => setTimeout(r, 300));
            appendOutput("PORT     STATE SERVICE");
            appendOutput("22/tcp   open  ssh");
            appendOutput("80/tcp   open  http");
            appendOutput("443/tcp  open  https");
            if (isAdmin) appendOutput("9999/tcp open  sspec-admin-backdoor");
            appendOutput("");

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
                appendOutput("Admin session closed. Downgraded to guest.\n");
            } else {
                appendOutput("Session terminated.");
                inputField.disabled = true;
            }

        } else {
            appendOutput(`bash: ${cmd}: command not found\n`);
        }
    }
});

// Window Sub-Terminal Input Handler
if (winInput) {
    winInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            const rawInput = winInput.value.trim();
            winInput.value = '';

            if (!rawInput) return;

            appendWinOutput(`root@sspec-window:~# ${rawInput}`);
            const cmd = rawInput.toLowerCase();

            if (cmd === 'help' || cmd === 'admin help') {
                appendWinOutput("Sub-terminal commands:");
                appendWinOutput("  logs start - Resume website access log stream");
                appendWinOutput("  logs stop  - Pause website access log stream");
                appendWinOutput("  clear logs - Clear window terminal output");
                appendWinOutput("  whoami     - Display privilege level");
                appendWinOutput("  exit       - Close floating window\n");
            } else if (cmd === 'logs start') {
                startWebLogs();
                appendWinOutput("[+] Web log stream resumed.\n");
            } else if (cmd === 'logs stop') {
                stopWebLogs();
                appendWinOutput("[-] Web log stream paused.\n");
            } else if (cmd === 'clear logs' || cmd === 'clear') {
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