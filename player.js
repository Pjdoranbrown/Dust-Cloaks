// =============================================================================
// PLAYER.JS - Player object and initialization
// =============================================================================

import { GAME } from './gameState.js';
import { CLASS_DEFS, RACES } from './config.js';

// Player object (the leader)
export const player = {
    x: 0,
    y: 0,
    radius: 12,
    angle: 0,
    color: '#ffffff',
    classKey: null,
    raceKey: null,
    imgKey: null,
    raceHpMult: 1.0,
    raceDmgMult: 1.0,
    raceSpeedMult: 1.0,
    raceLuckBonus: 0
};

// Initialize player with chosen class and race
export function initPlayer(classKey, raceKey) {
    const classDef = CLASS_DEFS[classKey];
    const race = RACES[raceKey];
    
    player.x = GAME.width / 2;
    player.y = GAME.height / 2;
    player.classKey = classKey;
    player.raceKey = raceKey;
    player.color = classDef.color;
    player.imgKey = classDef.imgKey;
    
    // Apply race modifiers
    player.raceHpMult = race.hpMult;
    player.raceDmgMult = race.dmgMult;
    player.raceSpeedMult = race.speedMult;
    player.raceLuckBonus = race.luckBonus;
    
    // Set max HP based on class and race
    const baseHp = classDef.hp;
    GAME.maxHp = Math.floor(baseHp * race.hpMult);
    GAME.hp = GAME.maxHp;
    
    // Set max luck
    GAME.maxLuck = 100 + race.luckBonus * 10;
    GAME.luck = 0;
}
