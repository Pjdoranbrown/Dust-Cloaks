function openRoster() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('roster-screen').classList.remove('hidden');
    const grid = document.getElementById('roster-grid');
    grid.innerHTML = '';
    if (META.roster.length === 0) { grid.innerHTML = "<p>No active mercenaries available.</p>"; return; }
    META.roster.forEach((char, index) => {
        const def = CLASS_DEFS[char.type];
        const race = RACES[char.race];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `<img src="${ASSETS[def.imgKey]?.src}" class="card-icon"><div class="card-title" style="color:${def.color}">${char.name}</div><div class="card-role">${race.name} ${def.name}</div><div class="card-desc">Kills: ${char.kills||0}<br>Earned: ${char.gp||0}g</div>`;
        card.onclick = () => { META.roster.splice(index, 1); saveGame(); document.getElementById('roster-screen').classList.add('hidden'); startGame(char); };
        grid.appendChild(card);
    });
}
function closeRoster() { document.getElementById('roster-screen').classList.add('hidden'); document.getElementById('start-screen').classList.remove('hidden'); }

function renderCamp() {
    const grid = document.getElementById('camp-grid');
    grid.innerHTML = '';
    let currentCat = '';
    UPGRADES.forEach(u => {
        if (u.category !== currentCat) {
            const header = document.createElement('div');
            header.className = 'camp-section'; header.innerText = u.category;
            grid.appendChild(header); currentCat = u.category;
        }
        const isBought = META.upgrades[u.id];
        const btn = document.createElement('div');
        btn.className = `upgrade-btn ${isBought ? 'purchased' : ''}`;
        
        // Add Icon if exists
        const iconHtml = u.imgKey && ASSETS[u.imgKey] ? `<img src="${ASSETS[u.imgKey].src}" class="upgrade-btn-icon">` : '';
        
        btn.innerHTML = `
            ${iconHtml}
            <div style="flex-grow:1;">
                <span class="upgrade-name">${u.name}</span>
                <span class="upgrade-cost">${isBought ? 'OWNED' : u.cost + 'g'}</span>
            </div>
            <div class="upgrade-desc">${u.desc}</div>
        `;
        if (!isBought) btn.onclick = () => buyUpgrade(u.id, u.cost);
        grid.appendChild(btn);
    });
}

function buyUpgrade(id, cost) {
    if (META.gold >= cost) { 
        META.gold -= cost; 
        META.upgrades[id] = true; 
        saveGame(); 
        renderCamp(); 
        renderCampVisuals(); // Update visuals immediately
    }
}

function renderCampVisuals() {
    const container = document.getElementById('camp-visuals');
    if (!container) return;
    container.innerHTML = '';
    
    UPGRADES.forEach(u => {
        if (META.upgrades[u.id] && u.imgKey && ASSETS[u.imgKey]) {
            const img = document.createElement('img');
            img.src = ASSETS[u.imgKey].src;
            img.className = 'camp-building';
            img.style.left = u.x + '%';
            container.appendChild(img);
        }
    });
}

function openCamp() { document.getElementById('start-screen').classList.add('hidden'); document.getElementById('camp-screen').classList.remove('hidden'); renderCamp(); }
function closeCamp() { document.getElementById('camp-screen').classList.add('hidden'); document.getElementById('start-screen').classList.remove('hidden'); }

function openManual() {
    const container = document.getElementById('manual-content'); container.innerHTML = '';
    const raceHeader = document.createElement('div'); raceHeader.className = 'manual-section-header'; raceHeader.innerText = "Backgrounds (Races)"; container.appendChild(raceHeader);
    for (const key in RACES) {
        const r = RACES[key];
        container.innerHTML += `<div class="manual-card"><div class="manual-card-header"><div class="manual-title">${r.name}</div></div><div class="manual-desc" style="margin-bottom:10px;">${r.desc}</div><div class="manual-stats"><div class="manual-stat-row" style="color: #8b0000; text-align:center;">${r.statsText}</div></div></div>`;
    }
    const classHeader = document.createElement('div'); classHeader.className = 'manual-section-header'; classHeader.innerText = "Specialties (Classes)"; classHeader.style.marginTop = "30px"; container.appendChild(classHeader);
    for (const key in CLASS_DEFS) {
        const d = CLASS_DEFS[key];
        const as = (60 / d.cooldown).toFixed(1);
        container.innerHTML += `<div class="manual-card"><div class="manual-card-header"><img src="${ASSETS[d.imgKey]?.src}" class="manual-icon"><div><div class="manual-title">${d.name}</div><div class="manual-role">${d.role}</div></div></div><div class="manual-stats"><div class="manual-stat-row"><span>Damage:</span> <span style="color:#8b0000">${d.damage}</span></div><div class="manual-stat-row"><span>Range:</span> <span style="color:#00008b">${d.range}</span></div><div class="manual-stat-row"><span>Attack Speed:</span> <span style="color:#006400">${as}/sec</span></div></div><div class="manual-desc">${d.desc}</div></div>`;
    }
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('manual-screen').classList.remove('hidden');
}
function closeManual() { document.getElementById('manual-screen').classList.add('hidden'); document.getElementById('start-screen').classList.remove('hidden'); }
