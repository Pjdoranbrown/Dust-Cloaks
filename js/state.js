// state.js

const SAVE_KEY = 'game_save';

const META = { 
    version: '1.0', 
    lastUpdated: '2026-02-15'
};

const GAME = { 
    state: {},
    save: function() {
        localStorage.setItem(SAVE_KEY, JSON.stringify(this.state));
    },
    load: function() {
        this.state = JSON.parse(localStorage.getItem(SAVE_KEY)) || {};
    }
};

const creationData = {
    level: 1,
    experience: 0,
};

const currentRunStats = {
    gold: 0,
    runs: 0,
};

const keys = {
    UP: 38,
    DOWN: 40,
    LEFT: 37,
    RIGHT: 39,
};

function loadGame() {
    GAME.load();
    updateGoldUI();
}

function saveGame() {
    GAME.save();
}

function updateGoldUI() {
    document.getElementById('gold_ui').innerText = `Gold: ${currentRunStats.gold}`;
}

// Load game on startup
loadGame();