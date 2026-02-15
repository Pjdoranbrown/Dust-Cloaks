// =============================================================================
// UTILS.JS - Utility and helper functions
// =============================================================================

import { NAME_POOLS } from './config.js';

// Get a random name based on race
export function getRandomName(raceKey) {
    const pool = NAME_POOLS[raceKey] || NAME_POOLS.HUMAN;
    return pool[Math.floor(Math.random() * pool.length)];
}

// Calculate distance between two points
export function distance(x1, y1, x2, y2) {
    return Math.hypot(x2 - x1, y2 - y1);
}

// Check circle collision
export function circleCollision(x1, y1, r1, x2, y2, r2) {
    return distance(x1, y1, x2, y2) < (r1 + r2);
}

// Clamp a value between min and max
export function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}
