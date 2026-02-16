function initGame(charData) {
    player = {
        x: GAME.width / 2, y: GAME.height / 2, radius: 12, color: '#D4AF37', angle: 0,
        imgKey: CLASS_DEFS[charData.classKey || charData.type].imgKey
    };
    squad = []; enemies = []; pickups = []; projectiles = []; floatingTexts = [];
    currentRunStats = { kills: 0, gold: 0 };
    addSquadMate(charData.classKey || charData.type, charData.race || 'HUMAN', charData.name);
}

function startGame(charData) {
    document.getElementById('start-screen').classList.add('hidden');
    document.getElementById('ui-layer').classList.remove('hidden');
    GAME.state = 'PLAY'; GAME.hp = GAME.maxHp; GAME.score = 0; GAME.time = 0;
    GAME.level = 1; GAME.xp = 0; GAME.xpReq = CONFIG.XP_BASE_REQ;
    GAME.luck = 5; GAME.maxLuck = 20; GAME.luckBurnCount = 0; GAME.formation = 'WEDGE';
    
    if (META.upgrades['brothel']) GAME.maxLuck += 2;
    if (META.upgrades['kitchen']) { GAME.maxHp += 20; GAME.hp = GAME.maxHp; }
    if (META.upgrades['church']) { GAME.maxHp += 50; GAME.hp = GAME.maxHp; }
    
    initGame(charData);
    const race = RACES[charData.race || 'HUMAN'];
    if (race) {
        if (race.hp) { GAME.maxHp += race.hp; GAME.hp = GAME.maxHp; }
        if (race.luck) { GAME.maxLuck += race.luck; GAME.luck = Math.min(GAME.luck, GAME.maxLuck); }
        player.raceSpeedMult = race.moveSpeed || 1.0;
    } else { player.raceSpeedMult = 1.0; }
    animate();
}

window.onload = function() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    GAME.width = canvas.width;
    GAME.height = canvas.height;
    
    loadAssets();
    loadGame();
    
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth; canvas.height = window.innerHeight;
        GAME.width = canvas.width; GAME.height = canvas.height;
    });

    window.addEventListener('keydown', e => {
        if(e.key === ' ' || e.key === 'Spacebar') { if(GAME.state === 'PLAY' && !keys.space) toggleFormation(); keys.space = true; }
        if(e.key.toLowerCase() === 'q') { if(GAME.state === 'PLAY' && !keys.q) burnLuck(); keys.q = true; }
        if(['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)) {
            keys[e.key.toLowerCase().replace('arrowup','w').replace('arrowleft','a').replace('arrowdown','s').replace('arrowright','d')] = true;
        }
    });

    window.addEventListener('keyup', e => {
        if(e.key === ' ' || e.key === 'Spacebar') keys.space = false;
        if(e.key.toLowerCase() === 'q') keys.q = false;
        if(['w','a','s','d','ArrowUp','ArrowLeft','ArrowDown','ArrowRight'].includes(e.key)) {
            keys[e.key.toLowerCase().replace('arrowup','w').replace('arrowleft','a').replace('arrowdown','s').replace('arrowright','d')] = false;
        }
    });
};
