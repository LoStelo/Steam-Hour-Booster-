const express = require('express');
const SteamUser = require('steam-user');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use('/assets', express.static(path.join(__dirname, 'assets')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

const instances = {}; 
const ACTIVATION_TIMEOUT = 30000; // 30 secondi
const pkg = require('./package.json');
const VERSION = pkg.version;
let sessionStatus = { error: null };

// Default Games Mapping 
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

app.get('/', (req, res) => {
    res.render('index', { 
        instances: instances, 
        session: sessionStatus,
        version: VERSION
    });
});

// Ricerca giochi su API Steam
app.get('/search-game', async (req, res) => {
    const term = req.query.term;
    if (!term || term.length < 2) return res.json([]);

    try {
        const response = await axios.get(`https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(term)}&l=italian&cc=IT`);
        
        // Parole "vietate" che identificano quasi sempre un DLC o contenuto extra
        const forbiddenKeywords = [
            'dlc', 'addon', 'add-on', 'expansion', 'bundle', 'pack', 'pass', 
            'content', 'soundtrack', 'ost', 'artbook', 'edition', 'upgrade'
        ];

        const games = response.data.items
            .filter(item => {
                const name = item.name.toLowerCase();
                //  Non deve contenere le parole vietate
                const isForbidden = forbiddenKeywords.some(keyword => name.includes(keyword));
           
                return !isForbidden;
            })
            .map(item => ({
                id: item.id,
                name: item.name,
                icon: item.tiny_image
            }));
        
        res.json(games);
    } catch (error) {
        res.status(500).json([]);
    }
});

app.get('/api/status', (req, res) => {
    const statusData = {};
    const now = Date.now();

    Object.keys(instances).forEach(user => {
        if (!instances[user].running && (now - instances[user].initTime > ACTIVATION_TIMEOUT)) {
            console.log(`[SYSTEM] Timeout attivazione per ${user}. Rimozione.`);
            instances[user].client.logOff();
            delete instances[user];
        } else {
            let timeDisplay = "0.0h";
            if (instances[user].running && instances[user].startTime) {
                const diffMs = now - instances[user].startTime;
                const diffMins = Math.floor(diffMs / 60000);
                
                if (diffMins < 60) {
                    timeDisplay = `${diffMins}m`;
                } else {
                    timeDisplay = `${(diffMs / 3600000).toFixed(1)}h`;
                }
            }
            
            statusData[user] = {
                status: instances[user].status,
                color: instances[user].color,
                running: instances[user].running,
                hours: timeDisplay,
                startDate: instances[user].startDate,
                games: instances[user].games
            };
        }
    });
    res.json(statusData);
});

app.post('/start', (req, res) => {
    const { username, password, game_ids, auth_code, custom_names } = req.body;

    if (instances[username]) {
        instances[username].client.logOff();
        delete instances[username];
    }

    const client = new SteamUser();
    const selectedGames = Array.isArray(game_ids) ? game_ids : [game_ids];
    const gameAppIds = selectedGames.map(id => parseInt(id));
    
    const gameNames = selectedGames.map(id => {
        if (GAME_MAP[id]) return GAME_MAP[id];
        return (custom_names && custom_names[id]) ? custom_names[id] : `AppID: ${id}`;
    });

    instances[username] = {
        client: client,
        games: gameNames,
        running: false,
        status: "Connecting...",
        color: "warning",
        initTime: Date.now(),
        startTime: null // Verrà popolato solo quando effettivamente in gioco
    };

    client.on('steamGuard', (domain, callback) => {
        console.log(`[ALERT] Codice Guard errato per ${username}.`);
        if (instances[username]) {
            instances[username].status = "Error: Invalid Guard Code";
            instances[username].color = "danger";
            instances[username].client.logOff();
        }
    });

    client.logOn({
        accountName: username,
        password: password,
        twoFactorCode: auth_code ? auth_code.toUpperCase().trim() : null
    });

    client.on('loggedOn', () => {
        instances[username].status = "Logging in...";
        client.setPersona(SteamUser.EPersonaState.Online);
        client.gamesPlayed(gameAppIds);
    });

    client.on('playingState', (blocked, playingAppIds) => {
        if (instances[username] && !instances[username].running) {
            const now = new Date();
            instances[username].running = true;
            instances[username].status = "Running";
            instances[username].color = "success";
            instances[username].startTime = now.getTime(); // MOMENTO ESATTO START
            instances[username].startDate = now.toLocaleString('it-IT', { 
                day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
            });
            console.log(`[BOOSTER] ${username} ha iniziato il boost ora.`);
        }
    });

    client.on('error', (err) => {
        console.log(`[STEAM ERROR] ${username}: ${err.message}`);
        if (instances[username]) {
            instances[username].running = false;
            instances[username].status = "Error: " + err.message;
            instances[username].color = "danger";
            instances[username].client.logOff();
        }
    });

    setTimeout(() => res.redirect('/'), 1500);
});

app.post('/stop', (req, res) => {
    const { username } = req.body;
    if (instances[username]) {
        instances[username].client.logOff();
        delete instances[username];
    }
    res.redirect('/');
});

const PORT = 8000;
app.listen(PORT, () => console.log(`Server pronto su http://localhost:${PORT}`));