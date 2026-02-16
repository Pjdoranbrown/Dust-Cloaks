function startCreation() {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('char-creation-screen').classList.remove('hidden');
    creationData = { race: null, classKey: null, name: "" };
    showCreationStep('race');
    renderRaceSelection();
}

function showCreationStep(step) {
    document.querySelectorAll('.creation-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`step-${step}`).classList.add('active');
    const titles = { 'race': "Select Race", 'class': "Select Speciality", 'name': "Enter Name" };
    document.getElementById('creation-title').innerText = titles[step];
}

function renderRaceSelection() {
    const grid = document.getElementById('race-selection-grid');
    grid.innerHTML = '';
    for (const key in RACES) {
        const race = RACES[key];
        const card = document.createElement('div');
        card.className = 'upgrade-card';
        card.innerHTML = `<div class="card-title">${race.name}</div><div class="card-desc">${race.desc}</div><div class="card-desc" style="color:#8b0000; margin-top:5px; font-weight:bold;">${race.statsText}</div>`;
        card.onclick = () => { creationData.race = key; showCreationStep('class'); renderClassSelection(); };
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
        card.innerHTML = `<img src="${ASSETS[def.iconKey || def.imgKey]?.src}" class="card-icon"><div class="card-title" style="color:${def.color}">${def.name}</div><div class="card-desc">${def.desc}</div>`;
        card.onclick = () => { creationData.classKey = key; showCreationStep('name'); randomizeName(); };
        grid.appendChild(card);
    }
}

function randomizeName() {
    document.getElementById('char-name-input').value = getRandomName(creationData.race);
}

function finalizeCreation() {
    const nameInput = document.getElementById('char-name-input').value;
    creationData.name = nameInput || getRandomName(creationData.race);
    document.getElementById('char-creation-screen').classList.add('hidden');
    startGame(creationData);
}

function closeCreation() {
    document.getElementById('char-creation-screen').classList.add('hidden');
    document.getElementById('start-screen').classList.remove('hidden');
}
