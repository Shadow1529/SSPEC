// Hierarchical Virtual Filesystem State & Utilities
export let currentPath = "/home/guest";

export const fileSystem = {
    "/": { type: "dir" },
    "/bin": { type: "dir" },
    "/etc": { type: "dir" },
    "/etc/config.json": { 
        type: "file", 
        content: '{\n  "system": "SSPEC-NODE-01",\n  "status": "OPERATIONAL",\n  "encryption": "AES-256-GCM"\n}' 
    },
    "/etc/motd": { type: "file", content: "Welcome to SSPEC OS Terminal.\nAll unauthorized access logged." },
    "/home": { type: "dir" },
    "/home/guest": { type: "dir" },
    "/home/guest/index.html": { type: "file", content: "<!DOCTYPE html>\n<html>\n<body><h1>SSPEC OS</h1></body>\n</html>" },
    "/home/guest/style.css": { type: "file", content: "body { background: #000; color: #0f0; }" },
    "/home/guest/script.js": { type: "file", content: "console.log('SSPEC Engine Active');" },
    "/var": { type: "dir" },
    "/var/log": { type: "dir" },
    "/var/log/syslog": { type: "file", content: "[SYS_BOOT] Kernel 5.15 loaded successfully." },
    "/root": { type: "dir", restricted: true },
    "/root/id_rsa": { type: "file", content: "-----BEGIN OPENSSH PRIVATE KEY-----\n..." }
};

export function setCurrentPath(path) {
    currentPath = path;
}

export function resolvePath(target) {
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