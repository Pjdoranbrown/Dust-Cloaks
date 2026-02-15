// =============================================================================
// PICKUP.JS - Pickup class for XP gems and gold
// =============================================================================

import { GAME, META } from './gameState.js';
import { CONFIG } from './config.js';
import { ASSETS } from './assets.js';
import { player } from './player.js';
import { distance } from './utils.js';

// Import these separately to avoid circular dependency
let addFloatingText;
let levelUp;

// This function will be called by game.js to provide the imports
export function setGameFunctions(floatingTextFn, levelUpFn) {
    addFloatingText = floatingTextFn;
    levelUp = levelUpFn;
}

export const pickups = [];

export class Pickup {
    constructor(x, y, type, value) {
        this.x = x;
        this.y = y;
        this.type = type; // 'XP' or 'GOLD'
        this.value = value;
        this.radius = 6;
        this.markedForDeletion = false;
        this.magnetSpeed = 0;
    }
    
    update() {
        // Check if player is nearby
        const dist = distance(this.x, this.y, player.x, player.y);
        
        if (dist < CONFIG.PICKUP_RANGE) {
            // Magnetic pull toward player
            const dx = player.x - this.x;
            const dy = player.y - this.y;
            this.magnetSpeed = Math.min(8, this.magnetSpeed + 0.5);
            
            if (dist > 0) {
                this.x += (dx / dist) * this.magnetSpeed;
                this.y += (dy / dist) * this.magnetSpeed;
            }
        }
        
        // Check collection
        if (dist < player.radius + this.radius) {
            if (this.type === 'XP') {
                GAME.xp += this.value;
                if (addFloatingText) {
                    addFloatingText(this.x, this.y, `+${this.value} XP`, '#4169e1');
                }
                
                // Level up check
                if (GAME.xp >= GAME.xpReq) {
                    GAME.xp -= GAME.xpReq;
                    GAME.level++;
                    GAME.xpReq = Math.floor(GAME.xpReq * 1.15);
                    if (levelUp) {
                        levelUp();
                    }
                }
            } else if (this.type === 'GOLD') {
                META.gold += this.value;
                if (addFloatingText) {
                    addFloatingText(this.x, this.y, `+${this.value}g`, '#ffd700');
                }
            }
            
            this.markedForDeletion = true;
        }
    }
    
    draw(ctx) {
        const imgKey = this.type === 'XP' ? 'PICKUP_XP' : 'PICKUP_GOLD';
        const img = ASSETS[imgKey];
        
        if (img && img.complete && img.naturalWidth !== 0) {
            const size = this.radius * 2.5;
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.type === 'XP' ? '#4169e1' : '#ffd700';
            ctx.fill();
        }
    }
}
