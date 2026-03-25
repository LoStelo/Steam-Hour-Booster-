const express = require('express');
const SteamUser = require('steam-user');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const client = new SteamUser();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

let session = {
    username: "N/A",
    game_id: null,
    game_name: "",
    running: false,
    error: null
};

const GAME_MAP = {
    "252490": "Rust", 
    "730": "Counter-Strike 2", 
    "1808500": "ARC Raiders",
    "218620": "PAYDAY 2", 
    "230410": "Warframe", 
    "221100": "DayZ",
    "4000": "Garry's Mod", 
    "107410": "Arma 3", 
    "2799860": "Inazuma Eleven: Victory Road"
};

// --- LOGICA STEAM ---

client.on('loggedOn', (details) => {
    console.log(`[STEAM] Login OK per ${session.username}`);
    session.running = true;
    session.error = null;
    client.setPersona(SteamUser.EPersonaState.Online);
    client.gamesPlayed(parseInt(session.game_id));
});

// Listener UNICO per gli errori (accorpato)
client.on('error', (err) => {
    console.error("[STEAM ERROR]", err.message);
    session.running = false;
    
    if (err.message === "BadRPC" || err.message === "InvalidPassword") {
        session.error = "Credenziali o Codice Steam Guard errati.";
    } else if (err.message === "RateLimitExceeded") {
        session.error = "Troppi tentativi falliti. Aspetta 30 minuti.";
    } else if (err.message === "LoggedInElsewhere") {
        session.error = "Account loggato altrove. Booster interrotto.";
    } else {
        session.error = "Errore: " + err.message;
    }
});

client.on('sentry', (sentry) => {
    fs.writeFileSync('sentry.bin', sentry);
});

// --- ROTTE WEB ---

app.get('/', (req, res) => {
    res.render('index', { session: session });
});

app.post('/start', (req, res) => {
    const { username, password, game_id, auth_code } = req.body;

    // 1. BLOCCO DI SICUREZZA: Se il codice manca o non è di 5 caratteri, non tentare nemmeno il login
    if (!auth_code || auth_code.trim().length !== 5) {
        session.error = "Errore: Devi inserire un codice Steam Guard di 5 caratteri.";
        return res.redirect('/');
    }

    if (client.steamID) client.logOff();

    session.username = username;
    session.game_id = game_id;
    session.game_name = GAME_MAP[game_id] || `AppID: ${game_id}`;
    session.error = null;

    // 2. INVIO RICHIESTA: Il codice viene inviato obbligatoriamente
    client.logOn({
        accountName: username,
        password: password,
        twoFactorCode: auth_code.toUpperCase().trim() // Forza maiuscolo e pulisce spazi
    });

    // Aspettiamo la risposta da Steam prima di ricaricare la pagina
    setTimeout(() => res.redirect('/'), 4000);
});

app.post('/stop', (req, res) => {
    session.running = false;
    client.logOff();
    res.redirect('/');
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server pronto su http://localhost:${PORT}`));