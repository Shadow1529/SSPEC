import { audio } from './audio.js';
import { fileSystem, currentPath, setCurrentPath, resolvePath } from './vfs.js';
import { MatrixRain } from './matrix.js';
import { initDevToolsInterceptor, generateDevLog } from './devtools.js';
import { fetchTargetGeolocation } from '../api/telemetry.js';
import { runWireshark, runHydra, runHashcat } from './security.js';

initDevToolsInterceptor();

const canvas = document.getElementById('matrix-canvas');
const matrix = new MatrixRain(canvas);

const outputDiv = document.getElementById('output');
const inputField = document.getElementById('command-input');
const bannerPre = document.getElementById('banner');
const promptSpan = document.querySelector('.prompt');

const winTerm = document.getElementById('window-terminal');
const winHeader = document.getElementById('win-header');
const winOutput = document.getElementById('win-output');
const winInput = document.getElementById('win-input');

let isInstalled = false;
let installStep = 0;
let isAdmin = false;
let activeInterval = null;
let webLogInterval = null;
let commandHistory = [];
let historyIndex = -1;
let isEditing = false;
let currentEditingFile = null;
let editingContent = "";

const COMMAND_LIST = [
    'pip install start', 'pip install stop', 'admin help', 'help', 'ls', 'cd', 'pwd', 
    'cat', 'touch', 'mkdir', 'rm', 'echo', 'nano', 'whoami', 'clear', 'exit', 'banner', 
    'matrix', 'system status', 'portscan local', 'traceroute', 'theme', 'calc', 'history', 
    'uptime', 'date', 'wireshark', 'hydra', 'hashcat', 'top', 'ping', 'sound', 'crt', 
    'install terminal', 'sspec admin run'
];

function appendOutput(text) {
    outputDiv.textContent += text + "\n";
    const cli = document.getElementById('cli') || document.body;
    cli.scrollTop = cli.scrollHeight;
}

function updatePrompt() {
    const user = isAdmin ? 'root' : 'guest';
    const host = isAdmin ? 'sspec-admin' : 'sspec-node';
    const char = isAdmin ? '#' : '$';
    promptSpan.textContent = `${user}@${host}:${currentPath}${char}`;
}

bannerPre.textContent = '';
appendOutput("Linux sspec-node 5.15.0-x86_64 tty1 (Uninitialized)");
appendOutput("[CRITICAL] SSPEC Kernel environment not detected.");
appendOutput("Type 'sspec install' to initiate system installation.\n");

// Main Event Listeners & Input Handlers
inputField.addEventListener('keydown', async function(e) {
    audio.keyClick();
    if (e.key === 'Enter') {
        audio.enter();
        const rawInput = inputField.value.trim();
        inputField.value = '';

        if (!rawInput && installStep === 0 && !isEditing) return;

        if (isEditing) {
            if (rawInput.toLowerCase() === ':q') {
                isEditing = false;
                appendOutput(`\n[NANO] Closed editor.`);
                return;
            }
            if (rawInput.toLowerCase() === ':w') {
                fileSystem[currentEditingFile] = { type: 'file', content: editingContent.trim() };
                isEditing = false;
                appendOutput(`\n[NANO] Saved file.`);
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
            if (installStep === 1) {
                appendOutput("[+] Allocating virtual partition... [OK]");
                installStep = 2;
                appendOutput("\n[QUESTION] Enable admin escalation subroutines? [Y/n]");
                return;
            } else if (installStep === 2) {
                installStep = 3;
                appendOutput("\n[+] COMPILING SSPEC KERNEL...");
                await new Promise(r => setTimeout(r, 600));
                outputDiv.textContent = '';
                appendOutput("[SUCCESS] SSPEC KERNEL INITIALIZED!");
                isInstalled = true;
                installStep = 0;
                updatePrompt();
                return;
            }
        }

        const parts = rawInput.split(/\s+/);
        const cmd = parts[0].toLowerCase();
        const full = rawInput.toLowerCase();

        if (!isInstalled) {
            if (full === 'sspec install') {
                appendOutput("\n[!] INITIALIZING INSTALLER...");
                installStep = 1;
                appendOutput("Proceed with installation? [Y/n]");
            } else {
                appendOutput(`bash: ${cmd}: command not found. Run 'sspec install' first.`);
            }
            return;
        }

        // Command Router
        if (full === 'help') {
            appendOutput("SSPEC Commands: help, ls, cd, pwd, cat, nano, wireshark, hydra, hashcat, clear, exit");
        } else if (full === 'sspec admin run') {
            isAdmin = true;
            promptSpan.style.color = '#ff0055';
            inputField.style.color = '#ff0055';
            updatePrompt();
            audio.alert();
            appendOutput("\n[*** ROOT ESCALATION GRANTED ***]\n");
        } else if (full === 'install terminal') {
            if (!isAdmin) return appendOutput("Permission denied. Run 'sspec admin run' first.");
            winTerm.style.display = 'flex';
            winOutput.textContent = "=== LIVE DEVTOOLS TELEMETRY STREAM ===\n";
            webLogInterval = setInterval(() => appendWinOutput(generateDevLog()), 800);
        } else if (cmd === 'clear') {
            outputDiv.textContent = '';
        } else {
            audio.error();
            appendOutput(`bash: ${cmd}: command not found`);
        }
    }
});