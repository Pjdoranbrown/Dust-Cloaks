// =============================================================================
// GAME.JS - Main entry point that wires all modules together
// =============================================================================

import { loadAssets, ASSETS } from './assets.js';
import { loadGame, saveGame, GAME, META, keys } from './gameState.js';
import { CONFIG, CLASS_DEFS, RACES } from './config.js';
import { SquadMate, injectDependencies as injectSquadmateDeps } from './squadmate.js';
import { Enemy, injectEnemyDependencies } from './enemy.js';
import { 
    MeleeSwipe, MagicMissile, DaggerMelee, Shockwave, PoisonBolt, 
    StraightShot, Trap, FireballZone, injectProjectileDependencies 
} from './projectiles.js';
import { XPOrb, GoldOrb, injectPickupDependencies } from './pickups.js';
import {
    update, draw, animate, addFloatingText, getNearestEnemy,
    checkSquadSynergies, toggleFormation, burnLuck, addSquadMate,
    takeEnemyDamage, takePlayerDamage, gainXP, gameOver,
    injectMainloopDependencies
} from './mainloop.js';
import {
    updateGoldUI, startCreation, openRoster, openCamp, openManual,
    closeCreation, closeRoster, closeCamp, closeManual,
    randomizeName, finalizeCreation, resurrectLeader,
    injectUIDependencies
} from './ui.js';

// Canvas setup
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Resize canvas
window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    GAME.width = canvas.width;
    GAME.height = canvas.height;
});
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Game state arrays
let player = null;
let squad = [];
let enemies = [];
let pickups = [];
let projectiles = [];
let floatingTexts = [];
let currentRunStats = { kills: 0, gold: 0 };

// Input handling
window.addEventListener('keydown', e => {
    if(e.key === ' ' || e.key === 'Spacebar') {
        if(GAME.state === 'PLAY' && !keys.space) toggleFormation();
        keys.space = true;
    }
    if(e.key.toLowerCase() === 'q') {
        if(GAME.state === 'PLAY' && !keys.q) burnLuck();
        keys.q = true;
    }
    if(['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)) {
        keys[e.key.toLowerCase().replace('arrowup','w').replace('arrowleft','a').replace('arrowdown','s').replace('arrowright','d')] = true;
    }
});

window.addEventListener('keyup', e => {
    if(e.key === ' ' || e.key === 'Spacebar') keys.space = false;
    if(e.key.toLowerCase() === 'q') keys.q = false;
    if(['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)) {
        keys[e.key.toLowerCase().replace('arrowup','w').replace('arrowleft','a').replace('arrowdown','s').replace('arrowright','d')] = false;
    }
});

// Initialize game
function initGame(charData) {
    player = {
        x: GAME.width / 2,
        y: GAME.height / 2,
        radius: 12,
        color: '#D4AF37', 
        angle: 0,
        imgKey: CLASS_DEFS[charData.classKey || charData.type].imgKey
    };
    
    squad.length = 0;
    enemies.length = 0;
    pickups.length = 0;
    projectiles.length = 0;
    floatingTexts.length = 0;
    
    currentRunStats = { kills: 0, gold: 0 };
    
    addSquadMate(charData.classKey || charData.type, charData.race || 'HUMAN', charData.name);
}

// Start game from UI
function startGameFromUI(charData) {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('ui-layer').classList.remove('hidden');
    
    GAME.state = 'PLAY';
    GAME.hp = GAME.maxHp;
    GAME.score = 0;
    GAME.time = 0;
    GAME.level = 1;
    GAME.xp = 0;
    GAME.xpReq = CONFIG.XP_BASE_REQ;
    GAME.luck = 5;
    GAME.maxLuck = 20;
    GAME.luckBurnCount = 0;
    GAME.formation = 'WEDGE';
    
    if (META.upgrades['brothel']) GAME.maxLuck += 2;
    if (META.upgrades['kitchen']) { GAME.maxHp += 20; GAME.hp = GAME.maxHp; }
    if (META.upgrades['church']) { GAME.maxHp += 50; GAME.hp = GAME.maxHp; }
    
    initGame(charData);

    const race = RACES[charData.race || 'HUMAN'];
    if (race) {
        if (race.hp) { GAME.maxHp += race.hp; GAME.hp = GAME.maxHp; }
        if (race.luck) { GAME.maxLuck += race.luck; GAME.luck = Math.min(GAME.luck, GAME.maxLuck); }
        player.raceSpeedMult = race.moveSpeed || 1.0;
    } else {
        player.raceSpeedMult = 1.0;
    }
    
    animate();
}

// Inject dependencies into all modules
injectSquadmateDeps({
    ctx, squad, projectiles, player,
    getNearestEnemy, addFloatingText, checkSquadSynergies,
    MeleeSwipe, MagicMissile, DaggerMelee, Shockwave, PoisonBolt, StraightShot, Trap, FireballZone
});

injectEnemyDependencies({
    player, ctx, takeEnemyDamage, takePlayerDamage
});

injectProjectileDependencies({
    enemies, takeEnemyDamage, addFloatingText
});

injectPickupDependencies({
    player, squad, currentRunStats, gainXP, addFloatingText
});

injectMainloopDependencies({
    ctx, canvas, player, squad, enemies, projectiles, pickups, floatingTexts, currentRunStats,
    SquadMate, Enemy, XPOrb, GoldOrb
});

injectUIDependencies({
    currentRunStats, squad, player, initGame, startGameFromUI
});

// Make UI functions available globally for onclick handlers
window.gameUI = {
    startCreation,
    openRoster,
    openCamp,
    openManual,
    closeCreation,
    closeRoster,
    closeCamp,
    closeManual,
    randomizeName,
    finalizeCreation,
    resurrectLeader
};

// Initialize on load
loadAssets();
loadGame();
updateGoldUI();

console.log('Dust Cloaks loaded successfully!');
