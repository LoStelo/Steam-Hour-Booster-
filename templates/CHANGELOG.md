# Changelog

All notable changes to the **Steam Web Booster** project will be documented in this file.

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