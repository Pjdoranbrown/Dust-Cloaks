// =============================================================================
// MAINLOOP.JS - Main game loop and core game functions (EXACT from original)
// =============================================================================

import { GAME, META, keys, saveGame } from './gameState.js';
import { CONFIG, CLASS_DEFS, RACES } from './config.js';
import { ASSETS } from './assets.js';
import { getRandomName } from './utils.js';

// Dependencies injected by game.js
let ctx, canvas, player, squad, enemies, projectiles, pickups, floatingTexts, currentRunStats;
let SquadMate, Enemy, XPOrb, GoldOrb;

export function injectMainloopDependencies(deps) {
    ctx = deps.ctx;
    canvas = deps.canvas;
    player = deps.player;
    squad = deps.squad;
    enemies = deps.enemies;
    projectiles = deps.projectiles;
    pickups = deps.pickups;
    floatingTexts = deps.floatingTexts;
    currentRunStats = deps.currentRunStats;
    SquadMate = deps.SquadMate;
    Enemy = deps.Enemy;
    XPOrb = deps.XPOrb;
    GoldOrb = deps.GoldOrb;
}

export function getNearestEnemy(x, y, range) {
    let nearest = null;
    let minDst = range;
    for (const e of enemies) {
        const dst = Math.hypot(e.x - x, e.y - y);
        if (dst < minDst) {
            minDst = dst;
            nearest = e;
        }
    }
    return nearest;
}

export function addFloatingText(x, y, text, color) {
    floatingTexts.push({
        x, y, text, color, life: 30
    });
}

export function checkSquadSynergies() {
    GAME.canUseShieldWall = squad.some(m => m.type === 'SOLDIER' && m.level >= 3);
    
    const indicator = document.getElementById('tactic-name');
    if (!GAME.canUseShieldWall && GAME.formation === 'SHIELD') {
        toggleFormation(); 
    }
    
    const tut = document.getElementById('tutorial');
    tut.innerHTML = `
        WASD: Move<br>
        SPACE: Toggle Formation (${GAME.canUseShieldWall ? 'READY' : 'LOCKED - Need Lvl 3 Soldier'})<br>
        Q: Burn Luck (Ultimate)
    `;
}

export function toggleFormation() {
    if (!GAME.canUseShieldWall) {
        addFloatingText(player.x, player.y - 40, "NEED LVL 3 SOLDIER", "gray");
        return;
    }
    
    GAME.formation = GAME.formation === 'WEDGE' ? 'SHIELD' : 'WEDGE';
    const indicator = document.getElementById('tactic-name');
    indicator.innerText = GAME.formation;
    indicator.style.color = GAME.formation === 'WEDGE' ? '#d4af37' : '#4169e1';
    addFloatingText(player.x, player.y - 30, GAME.formation, "#fff");
}

export function burnLuck() {
    if (GAME.luck >= GAME.maxLuck * 0.5) { 
        enemies.forEach(e => {
            takeEnemyDamage(e, 9999);
        });
        ctx.fillStyle = "white";
        ctx.fillRect(0,0,GAME.width, GAME.height);
        GAME.luck = 0;
        GAME.maxLuck = Math.max(5, GAME.maxLuck - 5); 
        GAME.luckBurnCount++;
        addFloatingText(player.x, player.y - 50, "LUCK BURNED!", "red");
    } else {
        addFloatingText(player.x, player.y - 30, "NOT ENOUGH LUCK", "gray");
    }
}

export function addSquadMate(type, race = null, name = null) {
    if (squad.length >= CONFIG.MAX_TOTAL_SQUAD_SIZE) return;
    
    if (squad.length === 6) {
        if (META.gold >= CONFIG.SECOND_LEADER_COST) {
            META.gold -= CONFIG.SECOND_LEADER_COST;
            saveGame();
            addFloatingText(player.x, player.y, "-20 Gold", "gold");
        }
    }
    
    if (!race) {
        const raceKeys = Object.keys(RACES);
        race = raceKeys[Math.floor(Math.random() * raceKeys.length)];
    }
    if (!name) {
        name = getRandomName(race);
    }
    
    squad.push(new SquadMate(type, squad.length, race, name)); 
    checkSquadSynergies();
    updateUI();
}

export function takeEnemyDamage(enemy, dmg, knockback = false) {
    enemy.hp -= dmg;
    if (Math.random() > 0.5) addFloatingText(enemy.x, enemy.y, dmg, "#fff");
    
    if (knockback) {
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        enemy.x += Math.cos(angle) * 20;
        enemy.y += Math.sin(angle) * 20;
    }

    if (enemy.hp <= 0 && !enemy.markedForDeletion) {
        enemy.markedForDeletion = true;
        pickups.push(new XPOrb(enemy.x, enemy.y, enemy.xp));
        
        let dropChance = 0.1;
        if (META.upgrades['merchant']) dropChance += 0.05;
        if (Math.random() < dropChance) {
            pickups.push(new GoldOrb(enemy.x + 5, enemy.y + 5));
        }
        
        GAME.luck = Math.min(GAME.luck + 1, GAME.maxLuck);
        GAME.score += 10;
        currentRunStats.kills++;
    }
}

export function takePlayerDamage(amount) {
    let dmg = amount;
    if (GAME.formation === 'SHIELD') dmg = Math.ceil(dmg * 0.5); 
    if (META.upgrades['leather']) dmg = Math.max(1, dmg - 1);
    
    GAME.hp -= dmg;
    addFloatingText(player.x, player.y, `-${dmg}`, "red");
    if (GAME.hp <= 0) gameOver();
}

export function gainXP(amount) {
    let finalAmt = amount;
    if (META.upgrades['cells']) finalAmt = Math.ceil(amount * 1.1);
    if (META.upgrades['grounds']) finalAmt = Math.ceil(amount * 1.2);
    
    GAME.xp += finalAmt;
    if (GAME.xp >= GAME.xpReq) {
        levelUp();
    }
}

export function levelUp() {
    GAME.state = 'LEVELUP';
    GAME.level++;
    GAME.xp = 0;
    GAME.xpReq = Math.floor(GAME.xpReq * CONFIG.XP_SCALING);
    
    if (META.upgrades['hospital']) {
        GAME.hp = Math.min(GAME.hp + 20, GAME.maxHp);
    }
    
    const grid = document.getElementById('upgrade-grid');
    grid.innerHTML = '';
    
    const existingHeader = document.createElement('div');
    existingHeader.className = 'section-header';
    existingHeader.innerText = "PROMOTE SQUAD";
    grid.appendChild(existingHeader);

    squad.forEach((mate) => {
        const def = CLASS_DEFS[mate.type];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.style.borderColor = '#4169e1'; 
        
        let bonusText = "Stats &uarr;";
        if (mate.level === 2) {
            if (mate.type === 'SOLDIER') bonusText = "Unlock: Shield Wall";
            if (mate.type === 'CLERIC') bonusText = "Unlock: Auto Heal";
            if (mate.type === 'MAGE') bonusText = "Unlock: Fireball";
            if (mate.type === 'WITCH') bonusText = "Unlock: Fear";
            if (mate.type === 'SCOUNDREL') bonusText = "Unlock: Traps";
            if (mate.type === 'FOLK_HERO') bonusText = "Unlock: Magnet";
        }

        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';

        card.innerHTML = `
            <img src="${imgSrc}" class="card-icon">
            <div class="card-title">UPGRADE</div>
            <div class="card-role" style="color:${def.color}">${def.name} Lvl ${mate.level} &rarr; ${mate.level+1}</div>
            <div class="card-desc" style="color:#aaf">${bonusText}</div>
        `;
        card.onclick = () => {
            mate.upgrade();
            closeLevelUp();
        };
        grid.appendChild(card);
    });

    const recruitHeader = document.createElement('div');
    recruitHeader.className = 'section-header';
    recruitHeader.innerText = "RECRUIT NEW";
    recruitHeader.style.marginTop = "20px";
    grid.appendChild(recruitHeader);

    if (squad.length === 6) {
        const classKeys = Object.keys(CLASS_DEFS);
        const shuffled = classKeys.sort(() => 0.5 - Math.random());
        const choices = shuffled.slice(0, 3);
        
        choices.forEach(key => {
            const def = CLASS_DEFS[key];
            const raceKey = Object.keys(RACES)[Math.floor(Math.random() * 6)];
            const race = RACES[raceKey];
            
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            const canAfford = META.gold >= CONFIG.SECOND_LEADER_COST;
            
            card.style.borderColor = canAfford ? '#d4af37' : '#444'; 
            if (!canAfford) card.classList.add('disabled');
            
            const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';

            card.innerHTML = `
                <img src="${imgSrc}" class="card-icon">
                <div class="card-title">RECRUIT CAPTAIN</div>
                <div class="card-role" style="color:${def.color}">${race.name} ${def.name}</div>
                <div class="card-desc" style="color: gold">Cost: ${CONFIG.SECOND_LEADER_COST}g</div>
            `;
            
            if (canAfford) {
                card.onclick = () => {
                    addSquadMate(key, raceKey);
                    closeLevelUp();
                };
            }
            grid.appendChild(card);
        });
        
        if (META.gold < CONFIG.SECOND_LEADER_COST) {
             const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.style.borderColor = '#00ff00';
            card.innerHTML = `
                <div class="card-title">RATIONS</div>
                <div class="card-desc">Heal 30% HP</div>
            `;
            card.onclick = () => {
                GAME.hp = Math.min(GAME.maxHp, GAME.hp + (GAME.maxHp * 0.3));
                closeLevelUp();
            };
            grid.appendChild(card);
        }

    } else if (squad.length < CONFIG.MAX_TOTAL_SQUAD_SIZE) {
        const classKeys = Object.keys(CLASS_DEFS);
        const shuffled = classKeys.sort(() => 0.5 - Math.random());
        const choices = shuffled.slice(0, 3);
        
        choices.forEach(key => {
            const def = CLASS_DEFS[key];
            const raceKey = Object.keys(RACES)[Math.floor(Math.random() * 6)];
            const race = RACES[raceKey];
            const name = getRandomName(raceKey);

            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.style.borderColor = '#d4af37'; 
            const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';

            card.innerHTML = `
                <img src="${imgSrc}" class="card-icon">
                <div class="card-title">RECRUIT</div>
                <div class="card-role" style="color:${def.color}">${race.name} ${def.name}</div>
                <div class="card-desc">${name}</div>
            `;
            card.onclick = () => {
                addSquadMate(key, raceKey, name);
                closeLevelUp();
            };
            grid.appendChild(card);
        });
    } else {
         const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.style.borderColor = '#00ff00';
        card.innerHTML = `
            <div class="card-title">RATIONS</div>
            <div class="card-desc">Heal 30% HP</div>
        `;
        card.onclick = () => {
            GAME.hp = Math.min(GAME.maxHp, GAME.hp + (GAME.maxHp * 0.3));
            closeLevelUp();
        };
        grid.appendChild(card);
    }
    
    document.getElementById('levelup-screen').classList.remove('hidden');
}

function closeLevelUp() {
    document.getElementById('levelup-screen').classList.add('hidden');
    GAME.state = 'PLAY';
}

export function gameOver() {
    GAME.state = 'GAMEOVER';
    saveGame(); 
    document.getElementById('death-stats').innerText = `Survived: ${document.getElementById('timer').innerText} | Level: ${GAME.level} | Gold: ${META.gold}`;
    
    const rezBtn = document.getElementById('resurrect-btn');
    if (META.gold >= 10) {
        rezBtn.classList.remove('btn-disabled');
        rezBtn.innerHTML = "RESURRECT LEADER (10g)";
    } else {
        rezBtn.classList.add('btn-disabled');
        rezBtn.innerHTML = "RESURRECT LEADER (Too Poor)";
    }
    
    document.getElementById('gameover-screen').classList.remove('hidden');
}

export function update() {
    if (GAME.state !== 'PLAY') return;

    GAME.frames++;
    if (GAME.frames % 60 === 0) {
        GAME.time++;
        if (META.upgrades['housing']) {
            if (GAME.hp < GAME.maxHp) GAME.hp = Math.min(GAME.maxHp, GAME.hp + 0.5);
        }
    }

    if (GAME.frames % CONFIG.ENEMY_SPAWN_RATE === 0) {
        enemies.push(new Enemy());
    }

    let moveSpeed = GAME.formation === 'WEDGE' ? CONFIG.PLAYER_SPEED_WEDGE : CONFIG.PLAYER_SPEED_SHIELD;
    if (META.upgrades['stables']) moveSpeed *= 1.1;
    if (player && player.raceSpeedMult) moveSpeed *= player.raceSpeedMult;
    
    let dx = 0, dy = 0;
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx = (dx/len) * moveSpeed;
        dy = (dy/len) * moveSpeed;
        
        player.x += dx;
        player.y += dy;
        player.angle = Math.atan2(dy, dx);
    }
    
    player.x = Math.max(10, Math.min(GAME.width-10, player.x));
    player.y = Math.max(10, Math.min(GAME.height-10, player.y));

    squad.forEach(mate => mate.update(player.x, player.y, player.angle, GAME.formation));
    
    enemies.forEach(e => e.update());
    enemies = enemies.filter(e => !e.markedForDeletion);
    
    projectiles.forEach(p => p.update());
    projectiles = projectiles.filter(p => !p.markedForDeletion);
    
    pickups.forEach(p => p.update());
    pickups = pickups.filter(p => !p.markedForDeletion);
    
    floatingTexts.forEach(t => {
        t.y -= 0.5;
        t.life--;
    });
    floatingTexts = floatingTexts.filter(t => t.life > 0);

    if (GAME.time >= 20 * 60) { 
        GAME.state = 'WIN';
        saveGame();
        document.getElementById('win-screen').classList.remove('hidden');
    }
    
    updateUI();
}

export function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    
    const bgImg = ASSETS['BACKGROUND'];
    if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
        const ptrn = ctx.createPattern(bgImg, 'repeat'); 
        ctx.fillStyle = ptrn;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    pickups.forEach(p => p.draw(ctx));

    const leaderImg = ASSETS[player.imgKey]; 
    if (leaderImg && leaderImg.complete && leaderImg.naturalWidth !== 0) {
        const size = player.radius * 3.0;
        ctx.drawImage(leaderImg, player.x - size/2, player.y - size/2, size, size);
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 1.5, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#D4AF37";
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    }
    
    squad.forEach(mate => mate.draw(ctx));
    enemies.forEach(e => e.draw(ctx));
    projectiles.forEach(p => p.draw(ctx));

    floatingTexts.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = "bold 16px Courier New";
        ctx.fillText(t.text, t.x, t.y);
    });
}

export function updateUI() {
    const hpPct = (GAME.hp / GAME.maxHp) * 100;
    document.getElementById('hp-bar').style.width = `${Math.max(0, hpPct)}%`;
    const xpPct = (GAME.xp / GAME.xpReq) * 100;
    document.getElementById('xp-bar').style.width = `${Math.min(100, xpPct)}%`;
    const luckPct = (GAME.luck / GAME.maxLuck) * 100;
    document.getElementById('luck-bar').style.width = `${Math.min(100, luckPct)}%`;
    document.getElementById('luck-text').innerText = `${GAME.luck} / ${GAME.maxLuck}`;
    const mins = Math.floor(GAME.time / 60).toString().padStart(2, '0');
    const secs = (GAME.time % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${mins}:${secs}`;
    document.getElementById('squad-count').innerText = `${squad.length}/${CONFIG.MAX_TOTAL_SQUAD_SIZE}`;
    document.getElementById('level-display').innerText = GAME.level;
    document.getElementById('gold-hud').innerText = META.gold;
}

export function animate() {
    update();
    draw();
    if (GAME.state === 'PLAY' || GAME.state === 'LEVELUP') {
        requestAnimationFrame(animate);
    }
}
