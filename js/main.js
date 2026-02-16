// ==========================================
// MAIN ENTRY POINT
// ==========================================

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
