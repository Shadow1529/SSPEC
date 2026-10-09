// Security Toolsuite Simulators (Wireshark, Hydra, Hashcat, Top)
import { audio } from './audio.js';

export function runWireshark(appendOutput) {
    appendOutput("[+] CAPTURING LIVE PACKETS ON INTERFACE eth0 (PRESS CTRL+C TO CANCEL)...");
    return setInterval(() => {
        const protos = ['TCP', 'UDP', 'TLSv1.3', 'HTTP/2', 'DNS'];
        const proto = protos[Math.floor(Math.random() * protos.length)];
        appendOutput(`[${new Date().toTimeString().split(' ')[0]}] ${proto} 192.168.1.10 -> 10.0.0.5:443 [LEN=1042]`);
        audio.streamTick();
    }, 120);
}

export function runHydra(target, appendOutput, onComplete) {
    appendOutput(`[+] Starting Hydra v9.2 SSH Brute-Force against ${target}:22...`);
    let count = 0;
    return setInterval(() => {
        count++;
        const pass = Math.random().toString(36).substring(2, 10);
        appendOutput(`[ATTEMPT ${count}] Trying root:${pass} ... FAILED`);
        if (count >= 12) {
            audio.alert();
            appendOutput(`\n[SUCCESS] PASSWORD DISCOVERED: root:P@ssw0rd2026!\n`);
            onComplete();
        }
    }, 100);
}

export function runHashcat(appendOutput, onComplete) {
    appendOutput("[+] Initializing Hashcat v6.2.5 CUDA Hash Cracker...");
    let progress = 0;
    return setInterval(() => {
        progress += 20;
        appendOutput(`Progress: [${'='.repeat(progress / 5)}${' '.repeat(20 - progress / 5)}] ${progress}%`);
        if (progress >= 100) {
            audio.alert();
            appendOutput("\n[+] Hash Cracked: $6$rounds=5000$root -> admin123\n");
            onComplete();
        }
    }, 200);
}