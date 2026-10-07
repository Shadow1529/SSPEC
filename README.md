# SSPEC Command Terminal

A lightweight, retro "matrix/hacker" web terminal that displays real-time Roblox game statistics (CCU, Favorites, Total Visits, Owner, and creation dates) using live API requests directly in your browser.

![SSPEC Terminal Preview](https://img.shields.io/badge/Status-Active-00ff66?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-00ff66?style=flat-square)

---

## Features

- **Green-on-Black Hacker Aesthetic**: CRT terminal styling with custom scrollbars and neon glow effects.
- **Live Roblox Game Tracking**: Pull real-time concurrent players (CCU), favorites, visits, owner info, and dates via Place ID.
- **CORS Bypass**: Integrated proxy handling for browser-native API fetching.
- **Interactive Terminal**: Supports interactive commands like `stats`, `help`, and `clear`.

---

## Interactive Commands

| Command | Usage | Description |
| :--- | :--- | :--- |
| `stats` | `stats <PlaceID>` | Fetches real-time metrics for a Roblox game (e.g., `stats 920587237`) |
| `help` | `help` | Displays the command menu |
| `clear` | `clear` | Clears the terminal screen |

---

## File Structure

```text
my-sspec-terminal/
├── index.html    # Terminal UI structure
├── style.css     # Cyberpunk/Matrix green theme styling
├── script.js    # Command line processing & Roblox API integration
└── README.md     # Project documentation
