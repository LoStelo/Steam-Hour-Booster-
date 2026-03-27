# Changelog

All notable changes to the **Steam Web Booster** project will be documented in this file.

## [2.1.0] - 2026-03-27

### 🛡️ Security & Reliability (Critical)
- **Anti-Lockout Logic**: Implemented immediate socket termination (`logOff`) upon Steam Guard failure. This prevents the "confirmation loop" that leads to `RateLimitExceeded` and account temporary blocks.
- **Fail-Safe Instance Cleanup**: The server now explicitly destroys ghost instances and clears memory before attempting a new login for the same user.

### ✨ Features
- **Precision Hour Counter 100%**: Replaced login-based timers with `playingState` event tracking. The counter now starts only when Steam servers confirm the account is effectively "In-Game".
- **Dynamic Time Formatting**: 
    - **Minutes View**: Shows `+Xm` for the first hour to provide real-time progression feedback.
    - **Auto-Switch**: Automatically toggles to decimal hours (`+1.1h`) after 60 minutes.
- **Single Source of Truth (Version)**: The UI now pulls the version number directly from `package.json`, ensuring consistency across the dashboard.

### 🌐 Multi Languages support
- **Language Persistence**: The dashboard now remembers your language choice (IT/EN) using `localStorage`.
- **UI Synchronization**: Fixed a bug where the language flag didn't match the active translation on page load.

---

## [2.0.0] - 2026-03-27

### 🚀 Added
- **Smart Polling System**: The UI now intelligently detects account states.
    - **Fast Mode (2s)**: Triggered during login and activation for instant feedback.
    - **Eco Mode (30s)**: Engaged when sessions are stable to reduce CPU and network overhead.
- **Partial UI Injection**: Account cards are updated dynamically via AJAX/Fetch without refreshing the entire page.
- **Auto-Sleep Controller**: The monitoring process completely halts if no accounts are active, saving browser resources.
- **Status Pulse Animation**: Added a breathing visual effect for accounts in the "Activating" phase.

### ⚡ Optimized
- **Zero-Latency UX**: The main form remains interactable and preserves input even while account statuses are updating.
- **Enhanced Search Debounce**: Game search is now throttled to 400ms to prevent API rate-limiting and flickering.
- **Reduced Server Load**: Minimized redundant status requests once accounts reach a "Running" state.

### 🗑️ Removed
- **Global Page Refresh**: Removed the legacy `window.location.reload()` which caused form data loss and UI flashing.

---

## [1.1.0] - 2026-03-26
### 🚀 Added
- **Initial Web Dashboard**: First implementation of the EJS-based monitoring interface.
- **Steam Guard Support**: Ability to input 2FA codes directly from the UI.
- **Multi-Game Selection**: Support for boosting multiple AppIDs simultaneously.
- **PM2 Compatibility**: Optimized process naming for production environments.