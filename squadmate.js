// =============================================================================
// SQUADMATE.JS - Squad mate class and formation logic
// =============================================================================

import { GAME, META } from './gameState.js';
import { CLASS_DEFS, RACES, WEAPON_DEFS } from './config.js';
import { ASSETS } from './assets.js';
import { enemies } from './enemy.js';
import { projectiles, Projectile } from './projectile.js';
import { distance } from './utils.js';

export const squad = [];

export class SquadMate {
    constructor(classKey, raceKey, name, isSecondLeader = false) {
        this.classKey = classKey;
        this.raceKey = raceKey;
        this.name = name;
        this.isSecondLeader = isSecondLeader;
        
        const classDef = CLASS_DEFS[classKey];
        const race = RACES[raceKey];
        
        this.x = 0;
        this.y = 0;
        this.targetX = 0;
        this.targetY = 0;
        this.radius = isSecondLeader ? 10 : 8;
        this.color = classDef.color;
        this.imgKey = classDef.imgKey;
        this.weaponKey = classDef.weapon;
        
        // Stats with race modifiers
        this.hp = Math.floor(classDef.hp * race.hpMult);
        this.maxHp = this.hp;
        this.dmgMult = classDef.dmgMult * race.dmgMult;
        this.cooldownMult = classDef.cooldownMult;
        this.rangeMult = classDef.rangeMult;
        
        // Combat
        this.cooldown = 0;
        this.healCooldown = 0;
    }
    
    update(leaderX, leaderY, leaderAngle, formation) {
        // Formation positioning
        const index = squad.indexOf(this);
        const { x, y } = this.getFormationPosition(index, leaderX, leaderY, leaderAngle, formation);
        
        this.targetX = x;
        this.targetY = y;
        
        // Smooth movement
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 2) {
            const speed = 3;
            this.x += (dx / dist) * Math.min(speed, dist);
            this.y += (dy / dist) * Math.min(speed, dist);
        }
        
        // Cleric healing
        if (this.classKey === 'CLERIC') {
            this.healCooldown--;
            if (this.healCooldown <= 0) {
                if (GAME.hp < GAME.maxHp) {
                    GAME.hp = Math.min(GAME.maxHp, GAME.hp + 0.5);
                }
                this.healCooldown = 120;
            }
        }
        
        // Combat
        this.cooldown--;
        if (this.cooldown <= 0) {
            this.attack();
        }
    }
    
    getFormationPosition(index, leaderX, leaderY, leaderAngle, formation) {
        if (formation === 'WEDGE') {
            return this.getWedgePosition(index, leaderX, leaderY, leaderAngle);
        } else {
            return this.getShieldWallPosition(index, leaderX, leaderY, leaderAngle);
        }
    }
    
    getWedgePosition(index, leaderX, leaderY, leaderAngle) {
        const spacing = 30;
        const row = Math.floor(index / 2);
        const side = index % 2 === 0 ? -1 : 1;
        
        const perpAngle = leaderAngle + Math.PI / 2;
        const backAngle = leaderAngle + Math.PI;
        
        const x = leaderX + Math.cos(backAngle) * (row * spacing) + Math.cos(perpAngle) * (side * spacing * (Math.floor(index/2) + 1));
        const y = leaderY + Math.sin(backAngle) * (row * spacing) + Math.sin(perpAngle) * (side * spacing * (Math.floor(index/2) + 1));
        
        return { x, y };
    }
    
    getShieldWallPosition(index, leaderX, leaderY, leaderAngle) {
        const spacing = 25;
        const perpAngle = leaderAngle + Math.PI / 2;
        const frontAngle = leaderAngle;
        
        const centerOffset = (squad.length - 1) / 2;
        const offset = index - centerOffset;
        
        const x = leaderX + Math.cos(frontAngle) * 20 + Math.cos(perpAngle) * (offset * spacing);
        const y = leaderY + Math.sin(frontAngle) * 20 + Math.sin(perpAngle) * (offset * spacing);
        
        return { x, y };
    }
    
    attack() {
        const weaponDef = WEAPON_DEFS[this.weaponKey];
        if (!weaponDef) return;
        
        // Find nearest enemy
        let nearestEnemy = null;
        let minDist = Infinity;
        
        const effectiveRange = weaponDef.range * this.rangeMult;
        
        enemies.forEach(e => {
            const d = distance(this.x, this.y, e.x, e.y);
            if (d < minDist && d < effectiveRange) {
                minDist = d;
                nearestEnemy = e;
            }
        });
        
        if (nearestEnemy) {
            // Fire projectile
            projectiles.push(new Projectile(
                this.x, 
                this.y, 
                nearestEnemy.x, 
                nearestEnemy.y, 
                weaponDef,
                this.dmgMult
            ));
            
            this.cooldown = weaponDef.cooldown * this.cooldownMult;
        }
    }
    
    draw(ctx) {
        const img = ASSETS[this.imgKey];
        if (img && img.complete && img.naturalWidth !== 0) {
            const size = this.radius * (this.isSecondLeader ? 3.0 : 2.5);
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
            
            if (this.isSecondLeader) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#FFD700";
                ctx.stroke();
            }
        } else {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
}

// Add a new squad mate
export function addSquadMate(classKey, raceKey, name = null, isSecondLeader = false) {
    const mate = new SquadMate(classKey, raceKey, name, isSecondLeader);
    squad.push(mate);
}
