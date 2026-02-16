function checkSquadSynergies() {
    GAME.canUseShieldWall = squad.some(m => m.type === 'SOLDIER' && m.level >= 3);
    const indicator = document.getElementById('tactic-name');
    if (!GAME.canUseShieldWall && GAME.formation === 'SHIELD') toggleFormation();
    document.getElementById('tutorial').innerHTML = `WASD: Move<br>SPACE: Toggle Formation (${GAME.canUseShieldWall ? 'READY' : 'LOCKED - Need Lvl 3 Soldier'})<br>Q: Burn Luck (Ultimate)`;
}

function toggleFormation() {
    if (!GAME.canUseShieldWall) { addFloatingText(player.x, player.y - 40, "NEED LVL 3 SOLDIER", "gray"); return; }
    GAME.formation = GAME.formation === 'WEDGE' ? 'SHIELD' : 'WEDGE';
    const indicator = document.getElementById('tactic-name');
    indicator.innerText = GAME.formation;
    indicator.style.color = GAME.formation === 'WEDGE' ? '#d4af37' : '#4169e1';
    addFloatingText(player.x, player.y - 30, GAME.formation, "#fff");
}

function burnLuck() {
    if (GAME.luck >= GAME.maxLuck * 0.5) { 
        enemies.forEach(e => takeEnemyDamage(e, 9999));
        ctx.fillStyle = "white"; ctx.fillRect(0,0,GAME.width, GAME.height);
        GAME.luck = 0; GAME.maxLuck = Math.max(5, GAME.maxLuck - 5); GAME.luckBurnCount++;
        addFloatingText(player.x, player.y - 50, "LUCK BURNED!", "red");
    } else { addFloatingText(player.x, player.y - 30, "NOT ENOUGH LUCK", "gray"); }
}

function addSquadMate(type, race = null, name = null) {
    if (squad.length >= CONFIG.MAX_TOTAL_SQUAD_SIZE) return;
    if (squad.length === 6 && META.gold >= CONFIG.SECOND_LEADER_COST) {
        META.gold -= CONFIG.SECOND_LEADER_COST; saveGame();
        addFloatingText(player.x, player.y, "-20 Gold", "gold");
    }
    if (!race) race = Object.keys(RACES)[Math.floor(Math.random() * 6)];
    if (!name) name = getRandomName(race);
    squad.push(new SquadMate(type, squad.length, race, name)); 
    checkSquadSynergies(); updateUI();
}

function takeEnemyDamage(enemy, dmg, knockback = false) {
    enemy.hp -= dmg;
    if (Math.random() > 0.5) addFloatingText(enemy.x, enemy.y, dmg, "#fff");
    if (knockback) {
        const angle = Math.atan2(enemy.y - player.y, enemy.x - player.x);
        enemy.x += Math.cos(angle) * 20; enemy.y += Math.sin(angle) * 20;
    }
    if (enemy.hp <= 0 && !enemy.markedForDeletion) {
        enemy.markedForDeletion = true;
        pickups.push(new XPOrb(enemy.x, enemy.y, enemy.xp));
        let dropChance = 0.1; 
        if (META.upgrades['merchant']) dropChance += 0.05;
        if (Math.random() < dropChance) pickups.push(new GoldOrb(enemy.x + 5, enemy.y + 5));
        GAME.luck = Math.min(GAME.luck + 1, GAME.maxLuck);
        GAME.score += 10; currentRunStats.kills++;
    }
}

function takePlayerDamage(amount) {
    let dmg = amount;
    if (GAME.formation === 'SHIELD') dmg = Math.ceil(dmg * 0.5); 
    if (META.upgrades['leather']) dmg = Math.max(1, dmg - 1);
    GAME.hp -= dmg;
    addFloatingText(player.x, player.y, `-${dmg}`, "red");
    if (GAME.hp <= 0) gameOver();
}

function gainXP(amount) {
    let finalAmt = amount;
    if (META.upgrades['cells']) finalAmt = Math.ceil(amount * 1.1);
    if (META.upgrades['grounds']) finalAmt = Math.ceil(amount * 1.2);
    GAME.xp += finalAmt;
    if (GAME.xp >= GAME.xpReq) levelUp();
}

function levelUp() {
    GAME.state = 'LEVELUP'; GAME.level++; GAME.xp = 0;
    GAME.xpReq = Math.floor(GAME.xpReq * CONFIG.XP_SCALING);
    if (META.upgrades['hospital']) GAME.hp = Math.min(GAME.hp + 20, GAME.maxHp);
    
    const grid = document.getElementById('upgrade-grid'); grid.innerHTML = '';
    
    // Create Columns
    const leftCol = document.createElement('div');
    leftCol.className = 'upgrade-column';
    const h1 = document.createElement('div'); h1.className = 'column-header'; h1.innerText = "Promote Squad";
    leftCol.appendChild(h1);
    
    const rightCol = document.createElement('div');
    rightCol.className = 'upgrade-column';
    const h2 = document.createElement('div'); h2.className = 'column-header'; h2.innerText = "Recruit New";
    rightCol.appendChild(h2);

    // Existing Squad -> Left Column
    squad.forEach((mate) => {
        const def = CLASS_DEFS[mate.type];
        const card = document.createElement('div'); card.className = 'upgrade-card'; card.style.borderColor = '#4169e1';
        let bonus = "Stats \u2191";
        if(mate.level===2) {
             const m = {"SOLDIER":"Shield Wall","CLERIC":"Auto Heal","MAGE":"Fireball","WITCH":"Fear","SCOUNDREL":"Traps","FOLK_HERO":"Magnet"};
             bonus = "Unlock: " + m[mate.type];
        }
        card.innerHTML = `<img src="${ASSETS[def.imgKey]?.src}" class="card-icon"><div class="card-title">UPGRADE</div><div class="card-role" style="color:${def.color}">${def.name} Lvl ${mate.level} \u2192 ${mate.level+1}</div><div class="card-desc" style="color:#aaf">${bonus}</div>`;
        card.onclick = () => { mate.upgrade(); closeLevelUp(); };
        leftCol.appendChild(card);
    });

    // New Recruits -> Right Column
    if (squad.length === 6) { // 2nd Leader Logic
        const choices = Object.keys(CLASS_DEFS).sort(() => 0.5 - Math.random()).slice(0, 3);
        choices.forEach(key => {
            const def = CLASS_DEFS[key];
            const rKey = Object.keys(RACES)[Math.floor(Math.random()*6)];
            const canAfford = META.gold >= CONFIG.SECOND_LEADER_COST;
            const card = document.createElement('div'); card.className = `upgrade-card ${!canAfford?'disabled':''}`; card.style.borderColor = canAfford?'#d4af37':'#444';
            card.innerHTML = `<img src="${ASSETS[def.imgKey]?.src}" class="card-icon"><div class="card-title">CAPTAIN</div><div class="card-role">${RACES[rKey].name} ${def.name}</div><div class="card-desc" style="color: gold">Cost: ${CONFIG.SECOND_LEADER_COST}g</div>`;
            if (canAfford) card.onclick = () => { addSquadMate(key, rKey); closeLevelUp(); };
            rightCol.appendChild(card);
        });
    } else if (squad.length < CONFIG.MAX_TOTAL_SQUAD_SIZE) {
        const choices = Object.keys(CLASS_DEFS).sort(() => 0.5 - Math.random()).slice(0, 3);
        choices.forEach(key => {
            const def = CLASS_DEFS[key];
            const rKey = Object.keys(RACES)[Math.floor(Math.random()*6)];
            const card = document.createElement('div'); card.className = 'upgrade-card'; card.style.borderColor = '#d4af37';
            card.innerHTML = `<img src="${ASSETS[def.imgKey]?.src}" class="card-icon"><div class="card-title">RECRUIT</div><div class="card-role">${RACES[rKey].name} ${def.name}</div>`;
            card.onclick = () => { addSquadMate(key, rKey); closeLevelUp(); };
            rightCol.appendChild(card);
        });
    }
    
    // Rations Fallback (Always available option on the right)
    const ration = document.createElement('div'); ration.className = 'upgrade-card'; ration.style.borderColor = '#00ff00';
    ration.innerHTML = `<div class="card-title">RATIONS</div><div class="card-desc">Heal 30% HP</div>`;
    ration.onclick = () => { GAME.hp = Math.min(GAME.maxHp, GAME.hp + (GAME.maxHp*0.3)); closeLevelUp(); };
    rightCol.appendChild(ration);
    
    grid.appendChild(leftCol);
    grid.appendChild(rightCol);
    
    document.getElementById('levelup-screen').classList.remove('hidden');
}

function closeLevelUp() { document.getElementById('levelup-screen').classList.add('hidden'); GAME.state = 'PLAY'; }

function gameOver() {
    GAME.state = 'GAMEOVER'; saveGame();
    document.getElementById('death-stats').innerText = `Survived: ${document.getElementById('timer').innerText} | Level: ${GAME.level} | Gold: ${META.gold}`;
    const rezBtn = document.getElementById('resurrect-btn');
    if (META.gold >= 10) { rezBtn.classList.remove('btn-disabled'); rezBtn.innerHTML = "RESURRECT LEADER (10g)"; }
    else { rezBtn.classList.add('btn-disabled'); rezBtn.innerHTML = "RESURRECT LEADER (Too Poor)"; }
    document.getElementById('gameover-screen').classList.remove('hidden');
}

function resurrectLeader() {
    if (META.gold >= 10 && player) {
        META.gold -= 10;
        const leader = squad[0];
        META.roster.push({ type: leader.type, race: leader.race, name: leader.name, kills: currentRunStats.kills, gp: currentRunStats.gold });
        saveGame(); location.reload();
    }
}
