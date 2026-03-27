# ⚡Steam Web Booster v2.0

**Steam Web Booster** is a lightweight **Node.js** web application designed to automatically increase your "hours played" on any Steam game. It is optimized to run 24/7 on dedicated servers, VPS, or containers (such as Proxmox LXC). 🎮

---

## ✨ Features
* 🚀 **Smart UI (v2.0)**: A new dynamic dashboard to seamlessly enter credentials, Steam Guard (2FA) codes, and select games. Active sessions now update in real-time without requiring a page refresh.
* 🛡️ **Session Security**: Automatically handles Sentry files to remember your machine and avoid repeated 2FA requests.
* 📊 **Web Dashboard**: A clean UI to monitor your boosting status and switch games on the fly.
* 📊 **Live Monitoring**: Real-time status tracking with adaptive polling (saves data and CPU).
* ⚙️ **Game Flexibility**: Search and add any Steam game via the integrated search bar or select from presets.
* 📉 **High Efficiency**: Extremely low resource footprint (<70MB RAM).

---

## 🛠️ Requirements
* **Node.js** (v18.x or higher) 🟢
* **npm** (comes with Node.js) 📦

---

## 🚀 Installation Guide

1. **Clone the repository**:
   ```
   git clone https://github.com/LoStelo/SteamWebBooster
   cd SteamWebBooster
   ```

2. **Install dependencies**:
   ```
   npm install
   ```
3. **Launch the application**:
   ```
   node server.js
   ```
The interface will be accessible at http://YOUR-SERVER-IP:8000.

## 🔄 Running 24/7 (Recommended)
To ensure the app stays active even after closing the terminal or restarting the server, using PM2 is highly recommended:
```
# Install PM2 globally
npm install pm2 -g

# Start the booster
pm2 start server.js --name "steam-booster"

# Configure auto-start on boot
pm2 startup
pm2 save
```

## ⚠️ Security Notes
- Sentry.bin: This file is generated after your first successful login. It acts as a secure access "token." Never upload this file to GitHub or share it with others. 🔐
- Steam Guard: You must have the Steam Mobile App ready to generate the required code for the initial login.
- Smart Refresh: Starting from v2.0, the dashboard intelligently slows down once your status is "Running" to minimize server impact.

## 📝 License
This project is distributed under the MIT License.
