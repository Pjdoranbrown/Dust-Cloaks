// =============================================================================
// SQUADMATE.JS - Squad companion class and logic (EXACT from original)
// =============================================================================

import { Entity } from './entities.js';
import { CONFIG, CLASS_DEFS, RACES } from './config.js';
import { GAME, META } from './gameState.js';
import { ASSETS } from './assets.js';

// These will be injected by game.js to avoid circular dependencies
let ctx, squad, projectiles, player;
let getNearestEnemy, addFloatingText, checkSquadSynergies;
let MeleeSwipe, MagicMissile, DaggerMelee, Shockwave, PoisonBolt, StraightShot, Trap, FireballZone;

export function injectDependencies(deps) {
    ctx = deps.ctx;
    squad = deps.squad;
    projectiles = deps.projectiles;
    player = deps.player;
    getNearestEnemy = deps.getNearestEnemy;
    addFloatingText = deps.addFloatingText;
    checkSquadSynergies = deps.checkSquadSynergies;
    MeleeSwipe = deps.MeleeSwipe;
    MagicMissile = deps.MagicMissile;
    DaggerMelee = deps.DaggerMelee;
    Shockwave = deps.Shockwave;
    PoisonBolt = deps.PoisonBolt;
    StraightShot = deps.StraightShot;
    Trap = deps.Trap;
    FireballZone = deps.FireballZone;
}

export class SquadMate extends Entity {
    constructor(type, index, raceKey = 'HUMAN', name = 'Grunt') {
        super(0, 0, 10, CLASS_DEFS[type].color);
        this.type = type;
        this.race = raceKey;
        this.name = name;
        this.stats = { ...CLASS_DEFS[type] };
        this.cooldownTimer = 0;
        this.specialTimer = 0; 
        this.index = index; 
        this.level = META.upgrades['guildhall'] ? 2 : 1; 
        this.applyUpgrades();
        this.applyRaceStats();
    }

    applyRaceStats() {
        const r = RACES[this.race];
        if (r) {
            if (r.dmgMult) this.stats.damage = Math.ceil(this.stats.damage * r.dmgMult);
            if (r.dmgFlat) this.stats.damage += r.dmgFlat;
            if (r.cooldownMult) this.stats.cooldown = Math.ceil(this.stats.cooldown * r.cooldownMult);
        }
    }

    applyUpgrades() {
        if (META.upgrades['blacksmith']) this.stats.damage = Math.ceil(this.stats.damage * 1.1);
        if (META.upgrades['command']) this.stats.cooldown = Math.ceil(this.stats.cooldown * 0.95);
        
        let dmgMult = 1.0;
        if (this.type === 'WITCH' && META.upgrades['alchemy']) dmgMult = 1.25;
        if (this.type === 'MAGE' && META.upgrades['magetower']) dmgMult = 1.25;
        if (this.type === 'FOLK_HERO' && META.upgrades['ranger']) dmgMult = 1.25;
        if (this.type === 'CLERIC' && META.upgrades['chapel']) dmgMult = 1.25;
        if (this.type === 'SCOUNDREL' && META.upgrades['pens']) dmgMult = 1.25;
        if (this.type === 'SOLDIER' && META.upgrades['armory']) dmgMult = 1.25;
        
        this.stats.damage = Math.ceil(this.stats.damage * dmgMult);
    }

    upgrade() {
        this.level++;
        if (this.type === 'CLERIC') {
            this.stats.damage = Math.floor(this.stats.damage * 1.5);
            this.stats.range += 15; 
        } else if (this.type === 'FOLK_HERO') {
            this.stats.damage += 5;
            this.stats.cooldown = Math.max(10, Math.floor(this.stats.cooldown * 0.8)); 
        } else if (this.type === 'MAGE') {
            this.stats.damage += 5;
        } else if (this.type === 'SCOUNDREL') {
            this.stats.damage += 10;
            this.stats.cooldown = Math.max(10, Math.floor(this.stats.cooldown * 0.9));
        } else if (this.type === 'SOLDIER') {
            this.stats.damage += 5;
            this.stats.cooldown = Math.max(10, Math.floor(this.stats.cooldown * 0.9));
        }
        
        checkSquadSynergies();
        addFloatingText(player.x, player.y, `LVL UP!`, "#4169e1");
    }

    update(leaderX, leaderY, leaderAngle, formation) {
        let targetX, targetY;
        const spacing = 25;
        let commanderX = leaderX;
        let commanderY = leaderY;
        let commanderAngle = leaderAngle;

        if (this.index >= 7) {
            const leader2 = squad[6];
            commanderX = leader2.x;
            commanderY = leader2.y;
        } 
        
        if (this.index === 0) {
            this.x = leaderX;
            this.y = leaderY;
        } else if (this.index === 6) {
            const trailDist = 80;
            targetX = leaderX - Math.cos(leaderAngle) * trailDist;
            targetY = leaderY - Math.sin(leaderAngle) * trailDist;
            this.x += (targetX - this.x) * (CONFIG.SQUAD_FOLLOW_SPEED * 0.8);
            this.y += (targetY - this.y) * (CONFIG.SQUAD_FOLLOW_SPEED * 0.8);
        } else {
            const localIndex = this.index >= 7 ? this.index - 6 : this.index; 
            
            if (formation === 'WEDGE') {
                const side = localIndex % 2 === 0 ? 1 : -1;
                const row = Math.ceil(localIndex / 2);
                const offsetX = -row * spacing * 1.5; 
                const offsetY = side * row * spacing; 
                const rotX = offsetX * Math.cos(commanderAngle) - offsetY * Math.sin(commanderAngle);
                const rotY = offsetX * Math.sin(commanderAngle) + offsetY * Math.cos(commanderAngle);
                targetX = commanderX + rotX;
                targetY = commanderY + rotY;
            } else { 
                const totalMates = 5; 
                const angleStep = (Math.PI * 2) / totalMates;
                const angle = (localIndex - 1) * angleStep;
                targetX = commanderX + Math.cos(angle) * spacing;
                targetY = commanderY + Math.sin(angle) * spacing;
            }
            this.x += (targetX - this.x) * CONFIG.SQUAD_FOLLOW_SPEED;
            this.y += (targetY - this.y) * CONFIG.SQUAD_FOLLOW_SPEED;
        }

        if (this.level >= 3) {
            if (this.type === 'CLERIC') {
                this.specialTimer++;
                if (this.specialTimer >= 600) {
                    GAME.hp = Math.min(GAME.hp + 15, GAME.maxHp);
                    addFloatingText(this.x, this.y - 20, "+SQUAD HEAL", "#gold");
                    this.specialTimer = 0;
                    ctx.save();
                    ctx.beginPath();
                    ctx.arc(this.x, this.y, 100, 0, Math.PI*2);
                    ctx.strokeStyle = "gold";
                    ctx.lineWidth = 3;
                    ctx.stroke();
                    ctx.restore();
                }
            } else if (this.type === 'MAGE') {
                this.specialTimer++;
                if (this.specialTimer >= 240) { 
                     const fx = this.x + (Math.random() * 300 - 150);
                     const fy = this.y + (Math.random() * 300 - 150);
                     projectiles.push(new FireballZone(fx, fy));
                     this.specialTimer = 0;
                }
            }
        }

        if (this.cooldownTimer > 0) this.cooldownTimer--;
        else this.performAttack(leaderAngle);
    }
    
    draw(ctx) {
        if (this.index === 0) return; 
        
        const img = ASSETS[this.stats.imgKey];
        if (img && img.complete && img.naturalWidth !== 0) {
            const size = this.radius * 3.0; 
            ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
            
            if (this.index === 6) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#D4AF37";
                ctx.stroke();
            }
        } else {
            super.draw(ctx);
        }
    }

    performAttack(angle) {
        const enemy = getNearestEnemy(this.x, this.y, this.stats.range);
        
        if (this.type === 'SOLDIER' && enemy) {
            projectiles.push(new MeleeSwipe(this.x, this.y, enemy.x, enemy.y, this.stats.damage));
            this.cooldownTimer = this.stats.cooldown;
        } 
        else if (this.type === 'MAGE' && enemy) {
            projectiles.push(new MagicMissile(this.x, this.y, enemy, this.stats.damage));
            this.cooldownTimer = this.stats.cooldown;
        }
        else if (this.type === 'SCOUNDREL') {
             if (enemy) {
                projectiles.push(new DaggerMelee(this.x, this.y, enemy.x, enemy.y, this.stats.damage));
                this.cooldownTimer = this.stats.cooldown;
             }
             if (this.level >= 3 && Math.random() > 0.7) { 
                 projectiles.push(new Trap(this.x, this.y, this.stats.damage));
             }
        }
        else if (this.type === 'CLERIC') {
            if (getNearestEnemy(this.x, this.y, this.stats.range)) { 
                projectiles.push(new Shockwave(this.x, this.y, this.stats.range, this.stats.damage));
                this.cooldownTimer = this.stats.cooldown;
            }
        }
        else if (this.type === 'WITCH' && enemy) {
            const causesFear = this.level >= 3;
            projectiles.push(new PoisonBolt(this.x, this.y, enemy, this.stats.damage, causesFear));
            this.cooldownTimer = this.stats.cooldown;
        }
        else if (this.type === 'FOLK_HERO') {
            projectiles.push(new StraightShot(this.x, this.y, angle, this.stats.damage));
            this.cooldownTimer = this.stats.cooldown;
        }
    }
}
