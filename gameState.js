// =============================================================================
// GAMESTATE.JS - Game state and persistence (EXACT from original)
// =============================================================================

import { CONFIG } from './config.js';

export const GAME = {
    state: 'START',
    width: window.innerWidth,
    height: window.innerHeight,
    frames: 0,
    time: 0,
    score: 0,
    level: 1,
    xp: 0,
    xpReq: CONFIG.XP_BASE_REQ,
    formation: 'WEDGE', 
    luck: 0,
    maxLuck: 20, 
    luckBurnCount: 0,
    hp: 100,
    maxHp: 100,
    canUseShieldWall: false
};

export const META = {
    gold: 0,
    upgrades: {}, 
    roster: []
};

export const keys = { 
    w:false, 
    a:false, 
    s:false, 
    d:false, 
    space:false, 
    q:false 
};

const SAVE_KEY = 'dust_cloaks_v3';

export function loadGame() {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            META.gold = parsed.gold || 0;
            META.upgrades = parsed.upgrades || {};
            META.roster = parsed.roster || [];
        } catch(e) { 
            console.error("Save Corrupt"); 
        }
    }
}

export function saveGame() {
    const data = {
        gold: META.gold,
        upgrades: META.upgrades,
        roster: META.roster
    };
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
}
