// =============================================================================
// ENEMY.JS - Enemy class and behavior
// =============================================================================

import { GAME } from './gameState.js';
import { ASSETS } from './assets.js';
import { player } from './player.js';
import { distance } from './utils.js';

export const enemies = [];

export class Enemy {
    constructor() {
        this.radius = 8;
        this.hp = 10 + Math.floor(GAME.level * 0.5);
        this.maxHp = this.hp;
        this.speed = 0.8 + (GAME.level * 0.02);
        this.color = '#ff4444';
        this.markedForDeletion = false;
        
        // Spawn from edges
        const side = Math.floor(Math.random() * 4);
        if (side === 0) { // Top
            this.x = Math.random() * GAME.width;
            this.y = -20;
        } else if (side === 1) { // Right
            this.x = GAME.width + 20;
            this.y = Math.random() * GAME.height;
        } else if (side === 2) { // Bottom
            this.x = Math.random() * GAME.width;
            this.y = GAME.height + 20;
        } else { // Left
            this.x = -20;
            this.y = Math.random() * GAME.height;
        }
    }
    
    update() {
        // Move toward player
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 0) {
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
        }
        
        // Check collision with player (damage player)
        if (distance(this.x, this.y, player.x, player.y) < this.radius + player.radius) {
            GAME.hp -= 0.5;
            if (GAME.hp <= 0) {
                GAME.hp = 0;
            }
        }
        
        // Remove if HP depleted
        if (this.hp <= 0) {
            this.markedForDeletion = true;
        }
    }
    
    draw(ctx) {
        const img = ASSETS['ENEMY'];
        if (img && img.complete && img.naturalWidth !== 0) {
            const size = this.radius * 2.5;
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
        
        // HP bar
        const barWidth = this.radius * 2;
        const barHeight = 3;
        const hpPct = this.hp / this.maxHp;
        
        ctx.fillStyle = '#000';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth, barHeight);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x - barWidth/2, this.y - this.radius - 8, barWidth * hpPct, barHeight);
    }
    
    takeDamage(amount) {
        this.hp -= amount;
    }
}
