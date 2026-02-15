// =============================================================================
// PICKUPS.JS - XP and Gold pickup classes (EXACT from original)
// =============================================================================

import { Entity } from './entities.js';
import { CONFIG } from './config.js';
import { GAME, META, saveGame } from './gameState.js';

// Dependencies injected by game.js
let player, squad, currentRunStats, gainXP, addFloatingText;

export function injectPickupDependencies(deps) {
    player = deps.player;
    squad = deps.squad;
    currentRunStats = deps.currentRunStats;
    gainXP = deps.gainXP;
    addFloatingText = deps.addFloatingText;
}

export class XPOrb extends Entity {
    constructor(x, y, val) {
        super(x, y, 4, '#4169e1');
        this.value = val;
    }
    update() {
        let pickupRange = CONFIG.BASE_PICKUP_RADIUS;
        if (META.upgrades['herbalist']) pickupRange *= 1.2;

        const hasFolkHero = squad.some(m => m.type === 'FOLK_HERO' && m.level >= 3);
        if (hasFolkHero) pickupRange *= 2.5;

        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < pickupRange) { 
            this.x += (player.x - this.x) * 0.15;
            this.y += (player.y - this.y) * 0.15;
        }
        if (dist < player.radius + 10) {
            gainXP(this.value);
            this.markedForDeletion = true;
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

export class GoldOrb extends Entity {
    constructor(x, y) {
        super(x, y, 5, '#ffd700');
    }
    update() {
        let pickupRange = CONFIG.BASE_PICKUP_RADIUS;
        const dist = Math.hypot(player.x - this.x, player.y - this.y);
        if (dist < pickupRange) { 
            this.x += (player.x - this.x) * 0.15;
            this.y += (player.y - this.y) * 0.15;
        }
        if (dist < player.radius + 10) {
            currentRunStats.gold += 1;
            META.gold += 1;
            saveGame();
            addFloatingText(this.x, this.y, "+1g", "gold");
            this.markedForDeletion = true;
        }
    }
    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = "gold";
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}
