# ⚡Steam Web Booster v1.1

**Steam Web Booster** is a lightweight **Node.js** web application designed to automatically increase your "hours played" on any Steam game. It is optimized to run 24/7 on dedicated servers, VPS, or containers (such as Proxmox LXC). 🎮

---

## ✨ Features
* 🚀 **Direct Login**: Enter your credentials and Steam Guard (2FA) code in a single, simple interface.
* 🛡️ **Session Security**: Automatically handles Sentry files to remember your machine and avoid repeated 2FA requests.
* 📊 **Web Dashboard**: A clean UI to monitor your boosting status and switch games on the fly.
* ⚙️ **Game Flexibility**: Choose from a list of popular games or manually enter any **AppID**.
* 📉 **High Efficiency**: Extremely low resource footprint (<70MB RAM).

---

## 🛠️ Requirements
* **Node.js** (v18.x or higher) 🟢
* **npm** (comes with Node.js) 📦

---

## 🚀 Installation Guide

1. **Clone the repository**:
   ```
   git clone https://github.com/LoStelo/Steam-Hour-Booster- 
   cd Steam-Hour-Booster-
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
# Installa PM2 globalmente
npm install pm2 -g

# Avvia il booster
pm2 start server.js --name "steam-booster"

# Configura l'avvio al boot
pm2 startup
pm2 save
```

## ⚠️ Security Notes
- Sentry.bin: This file is generated after your first successful login. It acts as a secure access "token." Never upload this file to GitHub or share it with others. 🔐
- Steam Guard: You must have the Steam Mobile App ready to generate the required code for the initial login.

## 📝 Licenza
This project is distributed under the MIT License.
