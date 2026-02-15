// =============================================================================
// UTILS.JS - Utility functions (EXACT from original)
// =============================================================================

import { NAMES } from './config.js';

export function getRandomName(raceKey) {
    const list = NAMES[raceKey] || NAMES.HUMAN;
    return list[Math.floor(Math.random() * list.length)];
}

export function checkCollision(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    const dist = Math.hypot(dx, dy);
    return dist < (c1.radius + c2.radius);
}
