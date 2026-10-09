<div align="center">

# ⚡ SSPEC // SYSTEM SPECTRA COMMAND

> **An immersive, feature-dense, modular "hacker-style" terminal web simulator built with vanilla ES6 JavaScript and HTML5 Canvas.**

[![Status](https://img.shields.io/badge/STATUS-OPERATIONAL-success?style=for-the-badge&logo=linux&logoColor=white)](https://sspec.vercel.app)
[![License](https://img.shields.io/badge/LICENSE-MIT-blue?style=for-the-badge&logo=open-source-initiative&logoColor=white)](LICENSE)
[![Architecture](https://img.shields.io/badge/ARCH-MODULAR%20ES6-orange?style=for-the-badge&logo=javascript&logoColor=white)](src/main.js)
[![Vite / Vercel](https://img.shields.io/badge/DEPLOYED-VERCEL-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com)

</div>

---

## 🖥️ Overview

**SSPEC** is a fully interactive, browser-based operating environment simulation. Designed with a retro cyberpunk aesthetic, it features a complete hierarchical virtual filesystem, a custom Web Audio API synthesizer, a Matrix code rain canvas engine, live browser DevTools telemetry streaming, and a full suite of simulated cybersecurity hacking tools—all without external dependencies or heavy frameworks.

---

## 📂 Modern Project Architecture

```text
sspec/
├── index.html                  # Main application markup & DOM structure
├── style.css                   # Cyberpunk theme, layout & CRT visual effects
├── README.md                   # Project documentation
├── LICENSE                     # MIT open-source license
├── api/
│   └── telemetry.js            # External API integrations & target geolocation
└── src/
    ├── audio.js                # Web Audio API sound synthesizer engine
    ├── devtools.js             # Browser DevTools console interceptor & telemetry
    ├── matrix.js               # HTML5 Canvas Matrix rain visual engine
    ├── security.js             # Cybersecurity toolsuite (Wireshark, Hydra, Hashcat)
    ├── vfs.js                  # Hierarchical Virtual Filesystem & Nano editor
    └── main.js                 # Core TTY input controller & command router