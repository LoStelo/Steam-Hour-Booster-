const express = require('express');
const SteamUser = require('steam-user');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'templates'));

const instances = {}; 
const ACTIVATION_TIMEOUT = 30000; // 30 secondi
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
        session: sessionStatus 
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
        // Logica di auto-rimozione se bloccato in attivazione
        if (!instances[user].running && (now - instances[user].initTime > ACTIVATION_TIMEOUT)) {
            console.log(`[SYSTEM] Timeout attivazione per ${user}. Rimozione.`);
            instances[user].client.logOff();
            delete instances[user];
        } else {
            // Calcolo ore dinamico
            let hours = "0.0";
            if (instances[user].running && instances[user].startTime) {
                hours = ((now - instances[user].startTime) / 3600000).toFixed(1);
            }
            
            statusData[user] = {
                status: instances[user].status,
                color: instances[user].color,
                running: instances[user].running,
                hours: hours,
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
    }

    const client = new SteamUser();
    const selectedGames = Array.isArray(game_ids) ? game_ids : [game_ids];
    
    // Gestione nomi: se è un gioco cercato, usiamo il nome inviato dal form
    const gameNames = selectedGames.map(id => {
        if (GAME_MAP[id]) return GAME_MAP[id];
        return (custom_names && custom_names[id]) ? custom_names[id] : `AppID: ${id}`;
    });

    instances[username] = {
        client: client,
        games: gameNames,
        running: false,
        status: "In attivazione...",
        color: "warning",
        initTime: Date.now()
    };

    client.logOn({
        accountName: username,
        password: password,
        twoFactorCode: auth_code.toUpperCase().trim()
    });

    client.on('loggedOn', () => {
        const now = new Date();
        instances[username].running = true;
        instances[username].status = "In corso";
        instances[username].color = "success";
        instances[username].startTime = now.getTime(); 
        instances[username].startDate = now.toLocaleString('it-IT', { 
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        });
        client.setPersona(SteamUser.EPersonaState.Online);
        client.gamesPlayed(selectedGames.map(id => parseInt(id)));
    });

    client.on('error', (err) => {
        if (instances[username]) {
            instances[username].running = false;
            instances[username].status = "Errore: " + err.message;
            instances[username].color = "danger";
        }
    });

    setTimeout(() => res.redirect('/'), 2000);
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