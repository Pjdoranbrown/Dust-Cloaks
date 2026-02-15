// =============================================================================
// PROJECTILE.JS - Projectile class and behavior
// =============================================================================

import { GAME, META } from './gameState.js';
import { ASSETS } from './assets.js';
import { enemies } from './enemy.js';
import { pickups, Pickup } from './pickup.js';
import { distance } from './utils.js';
import { addFloatingText } from './game.js';

export const projectiles = [];

export class Projectile {
    constructor(x, y, targetX, targetY, weaponDef, damageMult = 1.0) {
        this.x = x;
        this.y = y;
        this.radius = 4;
        this.speed = weaponDef.speed;
        this.color = weaponDef.color;
        this.imgKey = weaponDef.imgKey;
        this.markedForDeletion = false;
        this.piercing = weaponDef.piercing || false;
        this.hitEnemies = new Set();
        this.range = weaponDef.range;
        this.startX = x;
        this.startY = y;
        
        // Apply damage multiplier and armory bonus
        let baseDamage = weaponDef.damage;
        if (META.upgrades['armory']) baseDamage *= 1.2;
        this.damage = baseDamage * damageMult;
        
        // Calculate velocity
        const dx = targetX - x;
        const dy = targetY - y;
        const dist = Math.hypot(dx, dy);
        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        } else {
            this.vx = 0;
            this.vy = 0;
        }
    }
    
    update() {
        this.x += this.vx;
        this.y += this.vy;
        
        // Check if traveled too far
        const traveled = distance(this.startX, this.startY, this.x, this.y);
        if (traveled > this.range) {
            this.markedForDeletion = true;
            return;
        }
        
        // Check collision with enemies
        enemies.forEach(enemy => {
            if (this.markedForDeletion && !this.piercing) return;
            if (this.piercing && this.hitEnemies.has(enemy)) return;
            
            if (distance(this.x, this.y, enemy.x, enemy.y) < this.radius + enemy.radius) {
                enemy.takeDamage(this.damage);
                addFloatingText(enemy.x, enemy.y - 10, `-${Math.floor(this.damage)}`, '#ff6666');
                
                if (this.piercing) {
                    this.hitEnemies.add(enemy);
                } else {
                    this.markedForDeletion = true;
                }
                
                // Drop XP/Gold on enemy death
                if (enemy.hp <= 0) {
                    // XP gem
                    pickups.push(new Pickup(enemy.x, enemy.y, 'XP', 1));
                    
                    // Gold drop (luck-based)
                    const goldChance = 0.05 + (GAME.luck / GAME.maxLuck) * 0.15;
                    if (Math.random() < goldChance) {
                        pickups.push(new Pickup(enemy.x, enemy.y, 'GOLD', 1));
                    }
                    
                    // Luck increase
                    GAME.luck = Math.min(GAME.maxLuck, GAME.luck + 1);
                }
            }
        });
        
        // Remove if out of bounds
        if (this.x < -50 || this.x > GAME.width + 50 || this.y < -50 || this.y > GAME.height + 50) {
            this.markedForDeletion = true;
        }
    }
    
    draw(ctx) {
        const img = ASSETS[this.imgKey];
        if (img && img.complete && img.naturalWidth !== 0) {
            const size = this.radius * 3;
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}
