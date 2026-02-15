// =============================================================================
// UI.JS - All UI and menu screens (EXACT from original)
// =============================================================================

import { META, saveGame } from './gameState.js';
import { CONFIG, CLASS_DEFS, RACES, UPGRADES } from './config.js';
import { ASSETS } from './assets.js';
import { getRandomName } from './utils.js';

// Dependencies injected by game.js
let currentRunStats, squad, player, initGame, startGameFromUI;

export function injectUIDependencies(deps) {
    currentRunStats = deps.currentRunStats;
    squad = deps.squad;
    player = deps.player;
    initGame = deps.initGame;
    startGameFromUI = deps.startGameFromUI;
}

let creationData = { race: null, classKey: null, name: "" };

export function updateGoldUI() {
    const displays = ['gold-display', 'camp-gold', 'gold-hud'];
    displays.forEach(id => {
        const el = document.getElementById(id);
        if(el) {
            el.innerText = (id === 'gold-hud' ? '' : 'Gold: ') + META.gold;
        }
    });
}

export function startCreation() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('char-creation-screen').classList.remove('hidden');
    creationData = { race: null, classKey: null, name: "" };
    showCreationStep('race');
    renderRaceSelection();
}

function showCreationStep(step) {
    document.querySelectorAll('.creation-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    const titles = {
        'race': "Select Race",
        'class': "Select Speciality",
        'name': "Enter Name"
    };
    document.getElementById('creation-title').innerText = titles[step];
}

function renderRaceSelection() {
    const grid = document.getElementById('race-selection-grid');
    grid.innerHTML = '';
    for (const key in RACES) {
        const race = RACES[key];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="card-title">${race.name}</div>
            <div class="card-desc">${race.desc}</div>
            <div class="card-desc" style="color:#8b0000; margin-top:5px; font-weight:bold;">${race.statsText}</div>
        `;
        card.onclick = () => {
            creationData.race = key;
            showCreationStep('class');
            renderClassSelection();
        };
        grid.appendChild(card);
    }
}

function renderClassSelection() {
    const grid = document.getElementById('char-selection-grid');
    grid.innerHTML = '';
    for (const key in CLASS_DEFS) {
        const def = CLASS_DEFS[key];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
        card.innerHTML = `
            <img src="${imgSrc}" class="card-icon">
            <div class="card-title" style="color:${def.color}">${def.name}</div>
            <div class="card-desc">${def.desc}</div>
        `;
        card.onclick = () => {
            creationData.classKey = key;
            showCreationStep('name');
            randomizeName();
        };
        grid.appendChild(card);
    }
}

export function randomizeName() {
    const name = getRandomName(creationData.race);
    document.getElementById('char-name-input').value = name;
}

export function finalizeCreation() {
    const nameInput = document.getElementById('char-name-input').value;
    creationData.name = nameInput || getRandomName(creationData.race);
    document.getElementById('char-creation-screen').classList.add('hidden');
    startGameFromUI(creationData);
}

export function closeCreation() {
    document.getElementById('char-creation-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

export function openRoster() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('roster-screen').classList.remove('hidden');
    const grid = document.getElementById('roster-grid');
    grid.innerHTML = '';
    if (META.roster.length === 0) {
        grid.innerHTML = "<p>No active mercenaries available.</p>";
        return;
    }
    META.roster.forEach((char, index) => {
        const def = CLASS_DEFS[char.type];
        const race = RACES[char.race];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
        card.innerHTML = `
            <img src="${imgSrc}" class="card-icon">
            <div class="card-title" style="color:${def.color}">${char.name}</div>
            <div class="card-role">${race.name} ${def.name}</div>
            <div class="card-desc">Kills: ${char.kills || 0}<br>Earned: ${char.gp || 0}g</div>
        `;
        card.onclick = () => {
            META.roster.splice(index, 1);
            saveGame();
            document.getElementById('roster-screen').classList.add('hidden');
            startGameFromUI(char);
        };
        grid.appendChild(card);
    });
}

export function closeRoster() {
    document.getElementById('roster-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

export function resurrectLeader() {
    if (META.gold >= 10 && player) {
        META.gold -= 10;
        const leader = squad[0];
        const charData = {
            type: leader.type,
            race: leader.race,
            name: leader.name,
            kills: currentRunStats.kills,
            gp: currentRunStats.gold
        };
        META.roster.push(charData);
        saveGame();
        location.reload();
    }
}

export function openCamp() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('camp-screen').classList.remove('hidden');
    renderCamp();
}

export function closeCamp() {
    document.getElementById('camp-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

function renderCamp() {
    const grid = document.getElementById('camp-grid');
    grid.innerHTML = '';
    let lastCategory = '';
    UPGRADES.forEach(upg => {
        if (upg.category !== lastCategory) {
            const header = document.createElement('div');
            header.className = 'camp-section';
            header.innerText = upg.category;
            grid.appendChild(header);
            lastCategory = upg.category;
        }
        const owned = META.upgrades[upg.id];
        const btn = document.createElement('div');
        btn.className = 'upgrade-btn' + (owned ? ' purchased' : '');
        btn.innerHTML = `
            <span class="upgrade-name">${upg.name}</span>
            <span class="upgrade-cost">${owned ? 'OWNED' : upg.cost + 'g'}</span>
            <div class="upgrade-desc">${upg.desc}</div>
        `;
        if (!owned) {
            btn.onclick = () => {
                if (META.gold >= upg.cost) {
                    META.gold -= upg.cost;
                    META.upgrades[upg.id] = true;
                    saveGame();
                    renderCamp();
                }
            };
        }
        grid.appendChild(btn);
    });
}

export function openManual() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('manual-screen').classList.remove('hidden');
    renderManual();
}

export function closeManual() {
    document.getElementById('manual-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}

function renderManual() {
    const container = document.getElementById('manual-content');
    container.innerHTML = '';
    const raceHeader = document.createElement('div');
    raceHeader.className = 'manual-section-header';
    raceHeader.innerText = "Backgrounds (Races)";
    container.appendChild(raceHeader);
    for (const key in RACES) {
        const race = RACES[key];
        const card = document.createElement('div');
        card.className = 'manual-card';
        card.innerHTML = `
            <div class="manual-card-header">
                <div class="manual-title">${race.name}</div>
            </div>
            <div class="manual-desc" style="margin-bottom:10px;">${race.desc}</div>
            <div class="manual-stats">
                <div class="manual-stat-row" style="color: #8b0000; text-align:center;">${race.statsText}</div>
            </div>
        `;
        container.appendChild(card);
    }
    const classHeader = document.createElement('div');
    classHeader.className = 'manual-section-header';
    classHeader.innerText = "Specialties (Classes)";
    classHeader.style.marginTop = "30px";
    container.appendChild(classHeader);
    for (const key in CLASS_DEFS) {
        const def = CLASS_DEFS[key];
        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
        const attackSpeed = (60 / def.cooldown).toFixed(1);
        const card = document.createElement('div');
        card.className = 'manual-card';
        card.innerHTML = `
            <div class="manual-card-header">
                <img src="${imgSrc}" class="manual-icon">
                <div>
                    <div class="manual-title">${def.name}</div>
                    <div class="manual-role">${def.role}</div>
                </div>
            </div>
            <div class="manual-stats">
                <div class="manual-stat-row"><span>Damage:</span> <span style="color:#8b0000">${def.damage}</span></div>
                <div class="manual-stat-row"><span>Range:</span> <span style="color:#00008b">${def.range}</span></div>
                <div class="manual-stat-row"><span>Attack Speed:</span> <span style="color:#006400">${attackSpeed}/sec</span></div>
            </div>
            <div class="manual-desc">${def.desc}</div>
        `;
        container.appendChild(card);
    }
}
