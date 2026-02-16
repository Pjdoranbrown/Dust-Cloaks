function updateUI() {
    document.getElementById('hp-bar').style.width = `${Math.max(0, (GAME.hp/GAME.maxHp)*100)}%`;
    document.getElementById('xp-bar').style.width = `${Math.min(100, (GAME.xp/GAME.xpReq)*100)}%`;
    document.getElementById('luck-bar').style.width = `${Math.min(100, (GAME.luck/GAME.maxLuck)*100)}%`;
    document.getElementById('luck-text').innerText = `${GAME.luck} / ${GAME.maxLuck}`;
    const mins = Math.floor(GAME.time / 60).toString().padStart(2, '0');
    const secs = (GAME.time % 60).toString().padStart(2, '0');
    document.getElementById('timer').innerText = `${mins}:${secs}`;
    document.getElementById('squad-count').innerText = `${squad.length}/${CONFIG.MAX_TOTAL_SQUAD_SIZE}`;
    document.getElementById('level-display').innerText = GAME.level;
    document.getElementById('gold-hud').innerText = META.gold;
}
