// DevTools Console Interceptor for Sub-Terminal Log Streaming
export const devConsoleBuffer = [];

export function initDevToolsInterceptor() {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    console.log = function(...args) {
        originalLog.apply(console, args);
        devConsoleBuffer.push(`[DEV-CONSOLE:LOG] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
    };

    console.warn = function(...args) {
        originalWarn.apply(console, args);
        devConsoleBuffer.push(`[DEV-CONSOLE:WARN] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
    };

    console.error = function(...args) {
        originalError.apply(console, args);
        devConsoleBuffer.push(`[DEV-CONSOLE:ERROR] ${args.map(a => typeof a === 'object' ? JSON.stringify(a) : a).join(' ')}`);
    };

    console.log("SSPEC DevTools Interceptor hook registered.");
}

export function generateDevLog() {
    if (devConsoleBuffer.length > 0) return devConsoleBuffer.shift();

    const memory = window.performance && window.performance.memory ? 
        `(JS Heap: ${(window.performance.memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB)` : '';

    const logs = [
        `[DEVTOOL] Active DOM Nodes: ${document.querySelectorAll('*').length}`,
        `[DEVTOOL] Viewport: ${window.innerWidth}x${window.innerHeight} | URL: ${window.location.href}`,
        `[DEVTOOL] Memory Telemetry ${memory}`,
        `[HTTP-LOG] 127.0.0.1 - "GET /index.html HTTP/1.1" 200 OK`
    ];
    return logs[Math.floor(Math.random() * logs.length)];
}