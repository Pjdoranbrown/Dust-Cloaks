// =============================================================================
// ENEMY.JS - Enemy class and behavior (EXACT from original)
// =============================================================================

import { Entity } from './entities.js';
import { GAME } from './gameState.js';
import { ENEMY_DEFS } from './config.js';
import { ASSETS } from './assets.js';
import { checkCollision } from './utils.js';

// Dependencies injected by game.js
let player, ctx, takeEnemyDamage, takePlayerDamage;

export function injectEnemyDependencies(deps) {
    player = deps.player;
    ctx = deps.ctx;
    takeEnemyDamage = deps.takeEnemyDamage;
    takePlayerDamage = deps.takePlayerDamage;
}

export class Enemy extends Entity {
    constructor() {
        // Spawn Logic
        const time = GAME.time;
        let typeKey = 'RAT';
        if (time < 30) typeKey = 'RAT';
        else if (time < 60) typeKey = Math.random() > 0.5 ? 'BAT' : 'RAT';
        else if (time < 90) typeKey = Math.random() > 0.2 ? 'BAT' : 'RAT';
        else {
            const rand = Math.random();
            if (rand < 0.1) typeKey = 'RAT';
            else if (rand < 0.55) typeKey = 'OGRE';
            else typeKey = 'CRAB';
        }

        const stats = ENEMY_DEFS[typeKey];
        const side = Math.floor(Math.random() * 4);
        let x, y;
        const pad = 50;
        if (side === 0) { x = Math.random() * GAME.width; y = -pad; }
        else if (side === 1) { x = GAME.width + pad; y = Math.random() * GAME.height; }
        else if (side === 2) { x = Math.random() * GAME.width; y = GAME.height + pad; }
        else { x = -pad; y = Math.random() * GAME.height; }

        super(x, y, 12, stats.color);
        this.typeStats = stats;
        this.hp = stats.hp + (GAME.level * 3);
        this.maxSpeed = stats.speed * (0.9 + Math.random() * 0.2);
        this.damage = stats.damage;
        this.xp = stats.xp;
        if (typeKey === 'OGRE') this.radius = 20;

        // Status Effects
        this.poisoned = false;
        this.poisonDmg = 0;
        this.fearTimer = 0;
        this.slowTimer = 0;
    }

    update() {
        // Handle Status Effects
        if (this.poisoned && GAME.frames % 60 === 0) {
            takeEnemyDamage(this, this.poisonDmg, false);
        }

        if (this.slowTimer > 0) this.slowTimer--;
        if (this.fearTimer > 0) this.fearTimer--;

        // Movement Logic
        let dx = player.x - this.x;
        let dy = player.y - this.y;
        
        if (this.fearTimer > 0) {
            // Circle/Run away: Move perpendicular
             const temp = dx;
             dx = -dy;
             dy = temp;
        }

        const dist = Math.hypot(dx, dy);
        let currentSpeed = this.maxSpeed;
        if (this.slowTimer > 0) currentSpeed *= 0.5;

        if (dist > 0) {
            this.x += (dx / dist) * currentSpeed;
            this.y += (dy / dist) * currentSpeed;
        }

        if (checkCollision(this, player)) {
            takePlayerDamage(this.damage);
            this.markedForDeletion = true; 
        }
    }

    draw(ctx) {
        const img = ASSETS[this.typeStats.imgKey];
        if (img && img.complete && img.naturalWidth !== 0) {
            const size = this.radius * this.typeStats.scale; 
            ctx.save();
            if (this.poisoned) ctx.filter = 'sepia(1) hue-rotate(50deg)';
            if (this.fearTimer > 0) ctx.filter = 'invert(1)';
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
            ctx.restore();
        } else {
            super.draw(ctx);
        }
    }
}
