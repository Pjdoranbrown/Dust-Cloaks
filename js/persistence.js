function loadGame() {
    const data = localStorage.getItem(SAVE_KEY);
    if (data) {
        try {
            const parsed = JSON.parse(data);
            META.gold = parsed.gold || 0;
            META.upgrades = parsed.upgrades || {};
            META.roster = parsed.roster || [];
        } catch(e) { console.error("Save Corrupt"); }
    }
    updateGoldUI();
    renderCampVisuals(); // Show visuals on load
}

function saveGame() {
    localStorage.setItem(SAVE_KEY, JSON.stringify(META));
    updateGoldUI();
}

function updateGoldUI() {
    const displays = ['gold-display', 'camp-gold', 'gold-hud'];
    displays.forEach(id => {
        const el = document.getElementById(id);
        if(el) el.innerText = (id === 'gold-hud' ? '' : 'Gold: ') + META.gold;
    });
}
