// =============================================================================
// UI.JS - All UI, menus, and screen management
// =============================================================================

import { GAME, META, saveGame, resetGameState } from './gameState.js';
import { CONFIG, CLASS_DEFS, RACES, UPGRADE_DEFS } from './config.js';
import { ASSETS } from './assets.js';
import { player, initPlayer } from './player.js';
import { squad, addSquadMate } from './squadmate.js';
import { getRandomName } from './utils.js';
import { startGameLoop } from './game.js';

// Initialize all UI event listeners
export function initUI() {
    // Main Menu
    document.getElementById('play-btn').onclick = () => showCharCreation();
    document.getElementById('manual-btn').onclick = () => showManual();
    document.getElementById('camp-btn').onclick = () => showCamp();
    document.getElementById('roster-btn').onclick = () => showRoster();
    
    // Character Creation
    document.getElementById('create-char-btn').onclick = () => createCharacter();
    document.getElementById('cancel-create-btn').onclick = () => showMainMenu();
    
    // Camp
    document.getElementById('camp-back-btn').onclick = () => showMainMenu();
    
    // Roster
    document.getElementById('roster-back-btn').onclick = () => showMainMenu();
    
    // Manual
    document.getElementById('manual-back-btn').onclick = () => showMainMenu();
    
    // Game Over
    document.getElementById('resurrect-btn').onclick = () => resurrect();
    document.getElementById('gameover-menu-btn').onclick = () => {
        showMainMenu();
        document.getElementById('gameover-screen').classList.add('hidden');
    };
    
    // Win Screen
    document.getElementById('win-menu-btn').onclick = () => {
        showMainMenu();
        document.getElementById('win-screen').classList.add('hidden');
    };
    
    // Formation toggle
    document.addEventListener('keydown', (e) => {
        if (e.key === ' ' && GAME.state === 'PLAY') {
            e.preventDefault();
            toggleFormation();
        }
    });
}

// Show main menu
function showMainMenu() {
    hideAllScreens();
    document.getElementById('start-screen').classList.remove('hidden');
}

// Show character creation
function showCharCreation() {
    hideAllScreens();
    document.getElementById('char-creation-screen').classList.remove('hidden');
    populateCharCreation();
}

// Show manual
function showManual() {
    hideAllScreens();
    document.getElementById('manual-screen').classList.remove('hidden');
    populateManual();
}

// Show camp (upgrades)
function showCamp() {
    hideAllScreens();
    document.getElementById('camp-screen').classList.remove('hidden');
    populateCamp();
}

// Show roster
function showRoster() {
    hideAllScreens();
    document.getElementById('roster-screen').classList.remove('hidden');
    populateRoster();
}

// Hide all screens
function hideAllScreens() {
    const screens = document.querySelectorAll('.screen');
    screens.forEach(s => s.classList.add('hidden'));
}

// Populate character creation screen
function populateCharCreation() {
    const classGrid = document.getElementById('class-grid');
    const raceGrid = document.getElementById('race-grid');
    
    classGrid.innerHTML = '';
    raceGrid.innerHTML = '';
    
    // Classes
    Object.keys(CLASS_DEFS).forEach(key => {
        const def = CLASS_DEFS[key];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.dataset.class = key;
        
        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
        card.innerHTML = `
            <img src="${imgSrc}" class="card-icon">
            <div class="card-title">${def.name}</div>
            <div class="card-desc">${def.desc}</div>
        `;
        
        card.onclick = () => {
            document.querySelectorAll('#class-grid .upgrade-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        };
        
        classGrid.appendChild(card);
    });
    
    // Races
    Object.keys(RACES).forEach(key => {
        const race = RACES[key];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.dataset.race = key;
        
        card.innerHTML = `
            <div class="card-title">${race.name}</div>
            <div class="card-desc">${race.desc}</div>
        `;
        
        card.onclick = () => {
            document.querySelectorAll('#race-grid .upgrade-card').forEach(c => c.classList.remove('selected'));
            card.classList.add('selected');
        };
        
        raceGrid.appendChild(card);
    });
}

// Create character and start game
function createCharacter() {
    const selectedClass = document.querySelector('#class-grid .upgrade-card.selected');
    const selectedRace = document.querySelector('#race-grid .upgrade-card.selected');
    
    if (!selectedClass || !selectedRace) {
        alert('Please select both a class and a race!');
        return;
    }
    
    const classKey = selectedClass.dataset.class;
    const raceKey = selectedRace.dataset.race;
    
    // Initialize game
    resetGameState();
    initPlayer(classKey, raceKey);
    
    // Hide all screens and show game
    hideAllScreens();
    document.getElementById('ui-layer').style.display = 'block';
    
    // Start game loop
    startGameLoop();
}

// Populate manual
function populateManual() {
    const content = document.getElementById('manual-content');
    content.innerHTML = `
        <div class="manual-section-header">CLASSES</div>
    `;
    
    Object.keys(CLASS_DEFS).forEach(key => {
        const def = CLASS_DEFS[key];
        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <img src="${imgSrc}" class="card-icon">
            <div class="card-title">${def.name}</div>
            <div class="card-desc">${def.desc}</div>
        `;
        content.appendChild(card);
    });
    
    content.innerHTML += `<div class="manual-section-header">RACES</div>`;
    
    Object.keys(RACES).forEach(key => {
        const race = RACES[key];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <div class="card-title">${race.name}</div>
            <div class="card-desc">${race.desc}</div>
        `;
        content.appendChild(card);
    });
}

// Populate camp (upgrades)
function populateCamp() {
    const grid = document.getElementById('camp-grid');
    grid.innerHTML = '<div class="camp-section">CAMP UPGRADES</div>';
    
    Object.keys(UPGRADE_DEFS).forEach(key => {
        const def = UPGRADE_DEFS[key];
        const owned = META.upgrades[key];
        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
        
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        if (owned) card.classList.add('disabled');
        
        card.innerHTML = `
            <img src="${imgSrc}" class="card-icon">
            <div class="card-title">${def.name}</div>
            <div class="card-desc">${def.desc}</div>
            <div class="card-cost">${owned ? 'OWNED' : def.cost + 'g'}</div>
        `;
        
        if (!owned) {
            card.onclick = () => {
                if (META.gold >= def.cost) {
                    META.gold -= def.cost;
                    META.upgrades[key] = true;
                    saveGame();
                    populateCamp(); // Refresh
                    updateUI();
                } else {
                    alert('Not enough gold!');
                }
            };
        }
        
        grid.appendChild(card);
    });
    
    grid.innerHTML += `<div style="width: 100%; text-align: center; margin-top: 30px; font-size: 24px;">Gold: ${META.gold}</div>`;
}

// Populate roster
function populateRoster() {
    const grid = document.getElementById('roster-grid');
    grid.innerHTML = '<div class="camp-section">YOUR HEROES</div>';
    
    if (squad.length === 0) {
        grid.innerHTML += '<div style="width: 100%; text-align: center; color: #666;">No heroes recruited yet. Start a run to recruit!</div>';
        return;
    }
    
    squad.forEach(mate => {
        const def = CLASS_DEFS[mate.classKey];
        const race = RACES[mate.raceKey];
        const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
        
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `
            <img src="${imgSrc}" class="card-icon">
            <div class="card-title">${mate.name}</div>
            <div class="card-role" style="color:${def.color}">${race.name} ${def.name}</div>
            <div class="card-desc">HP: ${mate.hp}/${mate.maxHp}</div>
        `;
        grid.appendChild(card);
    });
}

// Level up screen
export function levelUp() {
    GAME.state = 'LEVELUP';
    const grid = document.getElementById('levelup-grid');
    grid.innerHTML = '';
    
    // Check if can recruit second leader
    if (squad.length === CONFIG.SQUAD_LIMIT_BEFORE_SECOND && !META.upgrades['barracks']) {
        const card = document.createElement('div');
        card.className = 'upgrade-card btn-disabled';
        card.innerHTML = `
            <div class="card-title">SECOND LEADER</div>
            <div class="card-desc">Unlock at Camp - Build Barracks</div>
        `;
        grid.appendChild(card);
    } else if (squad.length === CONFIG.SQUAD_LIMIT_BEFORE_SECOND && META.upgrades['barracks']) {
        // Offer second leader choices
        const classKeys = Object.keys(CLASS_DEFS);
        const shuffled = classKeys.sort(() => 0.5 - Math.random());
        const choices = shuffled.slice(0, 3);
        
        choices.forEach(key => {
            const def = CLASS_DEFS[key];
            const raceKey = Object.keys(RACES)[Math.floor(Math.random() * 6)];
            const race = RACES[raceKey];
            const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
            
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.style.borderColor = '#FFD700';
            card.innerHTML = `
                <img src="${imgSrc}" class="card-icon">
                <div class="card-title">SECOND LEADER (${CONFIG.SECOND_LEADER_COST}g)</div>
                <div class="card-role" style="color:${def.color}">${race.name} ${def.name}</div>
            `;
            
            if (META.gold >= CONFIG.SECOND_LEADER_COST) {
                card.onclick = () => {
                    META.gold -= CONFIG.SECOND_LEADER_COST;
                    addSquadMate(key, raceKey, null, true);
                    closeLevelUp();
                };
            } else {
                card.classList.add('disabled');
            }
            grid.appendChild(card);
        });
        
        // Also add Rations option
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
        // Standard recruit
        const classKeys = Object.keys(CLASS_DEFS);
        const shuffled = classKeys.sort(() => 0.5 - Math.random());
        const choices = shuffled.slice(0, 3);
        
        choices.forEach(key => {
            const def = CLASS_DEFS[key];
            const raceKey = Object.keys(RACES)[Math.floor(Math.random() * 6)];
            const race = RACES[raceKey];
            const name = getRandomName(raceKey);
            const imgSrc = ASSETS[def.imgKey] ? ASSETS[def.imgKey].src : '';
            
            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.style.borderColor = '#d4af37';
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
        // Full roster - offer rations
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

// Toggle formation
function toggleFormation() {
    GAME.formation = GAME.formation === 'WEDGE' ? 'SHIELD' : 'WEDGE';
    document.getElementById('formation-indicator').innerText = `Formation: ${GAME.formation}`;
}

// Resurrect after death
function resurrect() {
    if (META.gold >= 10) {
        META.gold -= 10;
        GAME.hp = GAME.maxHp * 0.5;
        GAME.state = 'PLAY';
        document.getElementById('gameover-screen').classList.add('hidden');
        saveGame();
        updateUI();
    }
}

// Update HUD
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

// Game over screen
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
