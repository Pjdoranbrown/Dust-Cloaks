class SquadMate extends Entity {
    // Animation configuration for SOLDIER sprite sheet
    static SOLDIER_ANIMATION_STATES = {
        IDLE: { row: 0, frameCount: 4 },
        RUN: { row: 1, frameCount: 4 },
        DAMAGE: { row: 8, frameCount: 4 },
        DEAD: { row: 9, frameCount: 4 }
    };
    
    // Animation configuration for MAGE sprite sheet
    static MAGE_ANIMATION_STATES = {
        IDLE: { row: 0, frameCount: 4 },
        RUN: { row: 1, frameCount: 4 },
        CAST: { row: 2, frameCount: 4 },  // Row 2 used for cast; rows 3-8 reserved for future cast variants
        DAMAGE: { row: 9, frameCount: 4 },
        DEAD: { row: 10, frameCount: 4 }
    };

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
        
        // Animation state tracking
        this.currentAnimationState = 'IDLE';
        this.frameIndex = 0;
        this.animationTimer = 0;
        this.facingLeft = false;
        this.lastHp = this.stats.maxHp || 100;
    }

    applyRaceStats() {
        const r = RACES[this.race];
        if (r) {
            if (r.dmgMult) this.stats.damage = Math.ceil(this.stats.damage * r.dmgMult);
            if (r.dmgFlat) this.stats.damage += r.dmgFlat;
            if (r.cooldownMult) this.stats.cooldown = Math.ceil(this.stats.cooldown * r.cooldownMult);
        }
    }

    updateAnimation() {
        // Only animate SOLDIER and MAGE types
        if (this.type !== 'SOLDIER' && this.type !== 'MAGE') return;
        
        // Animation configuration
        const FRAME_DELAY = 10; // Advance frame every 10 game frames
        
        // Advance animation timer
        this.animationTimer++;
        
        if (this.animationTimer >= FRAME_DELAY) {
            this.animationTimer = 0;
            
            // Get the appropriate animation states for this class
            const animationStates = this.type === 'SOLDIER' 
                ? SquadMate.SOLDIER_ANIMATION_STATES 
                : SquadMate.MAGE_ANIMATION_STATES;
            
            const state = animationStates[this.currentAnimationState];
            if (state) {
                this.frameIndex++;
                
                // Handle frame cycling
                if (this.currentAnimationState === 'DEAD') {
                    // Death animation holds on final frame
                    if (this.frameIndex >= state.frameCount) {
                        this.frameIndex = state.frameCount - 1;
                    }
                } else if (this.currentAnimationState === 'DAMAGE' || this.currentAnimationState === 'CAST') {
                    // Damage and Cast animations play once then return to idle
                    if (this.frameIndex >= state.frameCount) {
                        this.frameIndex = 0;
                        this.currentAnimationState = 'IDLE';
                    }
                } else {
                    // Idle and Run cycle continuously
                    if (this.frameIndex >= state.frameCount) {
                        this.frameIndex = 0;
                    }
                }
            }
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
            this.x = leaderX; this.y = leaderY;
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

        // Animation state determination for SOLDIER and MAGE
        if (this.type === 'SOLDIER' || this.type === 'MAGE') {
            // Determine facing direction from leader angle or movement
            if (leaderAngle !== undefined) {
                this.facingLeft = Math.cos(leaderAngle) < 0;
            }
            
            // Check for death state
            if (this.hp !== undefined && this.hp <= 0) {
                if (this.currentAnimationState !== 'DEAD') {
                    this.currentAnimationState = 'DEAD';
                    this.frameIndex = 0;
                }
            }
            // Check for damage state
            else if (this.hp !== undefined && this.lastHp !== undefined && this.hp < this.lastHp) {
                if (this.currentAnimationState !== 'DAMAGE') {
                    this.currentAnimationState = 'DAMAGE';
                    this.frameIndex = 0;
                }
            }
            // Check for run state (moving toward target)
            else if (targetX !== undefined && targetY !== undefined) {
                const distToTarget = Math.hypot(targetX - this.x, targetY - this.y);
                if (distToTarget > 5) {
                    this.currentAnimationState = 'RUN';
                    // Update facing based on movement direction
                    this.facingLeft = (targetX - this.x) < 0;
                } else {
                    this.currentAnimationState = 'IDLE';
                }
            }
            // Default to idle
            else {
                this.currentAnimationState = 'IDLE';
            }
            
            // Update lastHp for damage detection
            if (this.hp !== undefined) {
                this.lastHp = this.hp;
            }
        }

        if (this.level >= 3) this.handleSpecials();
        if (this.cooldownTimer > 0) this.cooldownTimer--;
        else this.performAttack(leaderAngle);
        
        // Update animation
        this.updateAnimation();
    }

    handleSpecials() {
        if (this.type === 'CLERIC') {
            this.specialTimer++;
            if (this.specialTimer >= 600) {
                GAME.hp = Math.min(GAME.hp + 15, GAME.maxHp);
                addFloatingText(this.x, this.y - 20, "+SQUAD HEAL", "#gold");
                this.specialTimer = 0;
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

    draw() {
        if (this.index === 0) return; 
        const img = ASSETS[this.stats.imgKey];
        if (img && img.complete && img.naturalWidth !== 0) {
            const size = this.radius * 3.0; 
            
            // Use sprite sheet animation for SOLDIER and MAGE types
            if (this.type === 'SOLDIER' || this.type === 'MAGE') {
                // Get the appropriate animation states for this class
                const animationStates = this.type === 'SOLDIER' 
                    ? SquadMate.SOLDIER_ANIMATION_STATES 
                    : SquadMate.MAGE_ANIMATION_STATES;
                
                const state = animationStates[this.currentAnimationState];
                if (state) {
                    // Calculate frame position in sprite sheet
                    // Frames 0-3 are right-facing (columns 0-3), frames 4-7 are left-facing (columns 4-7)
                    const baseFrame = this.facingLeft ? 4 : 0;
                    const frameX = (baseFrame + this.frameIndex) * 16;
                    const frameY = state.row * 16;
                    
                    // Draw the sprite frame
                    ctx.drawImage(
                        img,
                        frameX, frameY, 16, 16,  // Source: frame position and size in sprite sheet
                        this.x - size/2, this.y - size/2, size, size  // Destination: screen position and size
                    );
                } else {
                    // Fallback to full image if state not found
                    ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
                }
            } else {
                // Other classes use full image
                ctx.drawImage(img, this.x - size/2, this.y - size/2, size, size);
            }
            
            if (this.index === 6) {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
                ctx.lineWidth = 2;
                ctx.strokeStyle = "#D4AF37";
                ctx.stroke();
            }
        } else {
            super.draw();
        }
    }

    performAttack(angle) {
        const enemy = getNearestEnemy(this.x, this.y, this.stats.range);
        if (this.type === 'SOLDIER' && enemy) {
            projectiles.push(new MeleeSwipe(this.x, this.y, enemy.x, enemy.y, this.stats.damage));
            this.cooldownTimer = this.stats.cooldown;
        } else if (this.type === 'MAGE' && enemy) {
            projectiles.push(new MagicMissile(this.x, this.y, enemy, this.stats.damage));
            this.cooldownTimer = this.stats.cooldown;
        } else if (this.type === 'SCOUNDREL') {
            if (enemy) {
                projectiles.push(new DaggerMelee(this.x, this.y, enemy.x, enemy.y, this.stats.damage));
                this.cooldownTimer = this.stats.cooldown;
            }
            if (this.level >= 3 && Math.random() > 0.7) projectiles.push(new Trap(this.x, this.y, this.stats.damage));
        } else if (this.type === 'CLERIC' && getNearestEnemy(this.x, this.y, this.stats.range)) {
            projectiles.push(new Shockwave(this.x, this.y, this.stats.range, this.stats.damage));
            this.cooldownTimer = this.stats.cooldown;
        } else if (this.type === 'WITCH' && enemy) {
            projectiles.push(new PoisonBolt(this.x, this.y, enemy, this.stats.damage, this.level >= 3));
            this.cooldownTimer = this.stats.cooldown;
        } else if (this.type === 'FOLK_HERO') {
            projectiles.push(new StraightShot(this.x, this.y, angle, this.stats.damage));
            this.cooldownTimer = this.stats.cooldown;
        }
    }
}
