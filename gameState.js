// =============================================================================
// GAMESTATE.JS - Game state variables and save/load functionality
// =============================================================================

// Main game state
export const GAME = {
    state: 'MENU',
    width: 1280,
    height: 720,
    hp: 100,
    maxHp: 100,
    xp: 0,
    xpReq: 10,
    level: 1,
    time: 0,
    frames: 0,
    formation: 'WEDGE',
    luck: 0,
    maxLuck: 100
};

// Meta-progression (persists between runs)
export const META = {
    gold: 0,
    upgrades: {},
    unlockedClasses: { TANK: true, ARCHER: true },
    hasPlayedBefore: false
};

// Keyboard input state
export const keys = {
    w: false,
    a: false,
    s: false,
    d: false
};

// Save game data to localStorage
export function saveGame() {
    const saveData = {
        gold: META.gold,
        upgrades: META.upgrades,
        unlockedClasses: META.unlockedClasses,
        hasPlayedBefore: true
    };
    localStorage.setItem('dustCloaksSave', JSON.stringify(saveData));
}

// Load game data from localStorage
export function loadGame() {
    const saved = localStorage.getItem('dustCloaksSave');
    if (saved) {
        const data = JSON.parse(saved);
        META.gold = data.gold || 0;
        META.upgrades = data.upgrades || {};
        META.unlockedClasses = data.unlockedClasses || { TANK: true, ARCHER: true };
        META.hasPlayedBefore = data.hasPlayedBefore || false;
    }
}

// Reset game state for new run
export function resetGameState(leaderClass, leaderRace) {
    GAME.state = 'PLAY';
    GAME.hp = 100;
    GAME.maxHp = 100;
    GAME.xp = 0;
    GAME.xpReq = 10;
    GAME.level = 1;
    GAME.time = 0;
    GAME.frames = 0;
    GAME.formation = 'WEDGE';
    GAME.luck = 0;
    GAME.maxLuck = 100;
}
