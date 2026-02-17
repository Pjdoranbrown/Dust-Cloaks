function update() {
    if (GAME.state !== 'PLAY') return;
    GAME.frames++;
    if (GAME.frames % 60 === 0) { GAME.time++; if (META.upgrades['housing'] && GAME.hp < GAME.maxHp) GAME.hp = Math.min(GAME.maxHp, GAME.hp + 0.5); }
    if (GAME.frames % CONFIG.ENEMY_SPAWN_RATE === 0) enemies.push(new Enemy());

    let moveSpeed = (GAME.formation === 'WEDGE' ? CONFIG.PLAYER_SPEED_WEDGE : CONFIG.PLAYER_SPEED_SHIELD) * (META.upgrades['stables'] ? 1.1 : 1.0) * (player.raceSpeedMult || 1.0);
    let dx = 0, dy = 0;
    if (keys.w) dy -= 1; if (keys.s) dy += 1; if (keys.a) dx -= 1; if (keys.d) dx += 1;
    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx = (dx/len) * moveSpeed; dy = (dy/len) * moveSpeed;
        player.x += dx; player.y += dy; player.angle = Math.atan2(dy, dx);
    }
    player.x = Math.max(10, Math.min(GAME.width-10, player.x));
    player.y = Math.max(10, Math.min(GAME.height-10, player.y));

    squad.forEach(mate => mate.update(player.x, player.y, player.angle, GAME.formation));
    enemies.forEach(e => e.update()); enemies = enemies.filter(e => !e.markedForDeletion);
    projectiles.forEach(p => p.update()); projectiles = projectiles.filter(p => !p.markedForDeletion);
    pickups.forEach(p => p.update()); pickups = pickups.filter(p => !p.markedForDeletion);
    floatingTexts.forEach(t => { t.y -= 0.5; t.life--; }); floatingTexts = floatingTexts.filter(t => t.life > 0);

    if (GAME.time >= 20 * 60) { GAME.state = 'WIN'; saveGame(); document.getElementById('win-screen').classList.remove('hidden'); }
    updateUI();
}

function draw() {
    ctx.clearRect(0,0, canvas.width, canvas.height);
    const bgImg = ASSETS['BACKGROUND'];
    if (bgImg && bgImg.complete) { ctx.fillStyle = ctx.createPattern(bgImg, 'repeat'); ctx.fillRect(0, 0, canvas.width, canvas.height); }
    pickups.forEach(p => p.draw());
    
    // Draw Leader
    const leaderImg = ASSETS[player.imgKey];
    if (leaderImg && leaderImg.complete) {
        const size = player.radius * 3.0;
        
        // For SOLDIER, MAGE, and WITCH, use sprite sheet frame extraction
        if (squad[0] && (squad[0].type === 'SOLDIER' || squad[0].type === 'MAGE' || squad[0].type === 'WITCH')) {
            const mate = squad[0];
            const animationStates = mate.getAnimationStates();
            
            const state = animationStates ? animationStates[mate.currentAnimationState] : null;
            if (state) {
                // Frame size depends on the class
                const frameSize = mate.type === 'WITCH' ? 24 : 32;
                
                // Calculate frame position in sprite sheet
                // Frames 0-3 are right-facing (columns 0-3), frames 4-7 are left-facing (columns 4-7)
                const baseFrame = mate.facingLeft ? 4 : 0;
                const frameX = (baseFrame + mate.frameIndex) * frameSize;
                const frameY = state.row * frameSize;
                
                // Draw the sprite frame
                ctx.drawImage(
                    leaderImg,
                    frameX, frameY, frameSize, frameSize,  // Source: frame position and size in sprite sheet
                    player.x - size/2, player.y - size/2, size, size  // Destination: screen position and size
                );
            } else {
                // Fallback to full image if state not found
                ctx.drawImage(leaderImg, player.x - size/2, player.y - size/2, size, size);
            }
        } else {
            // Other classes use full image
            ctx.drawImage(leaderImg, player.x - size/2, player.y - size/2, size, size);
        }
        
        ctx.beginPath(); ctx.arc(player.x, player.y, player.radius * 1.5, 0, Math.PI * 2);
        ctx.lineWidth = 2; ctx.strokeStyle = "#D4AF37"; ctx.stroke();
    }
    squad.forEach(mate => mate.draw());
    enemies.forEach(e => e.draw());
    projectiles.forEach(p => p.draw());
    floatingTexts.forEach(t => { ctx.fillStyle = t.color; ctx.font = "bold 16px Courier New"; ctx.fillText(t.text, t.x, t.y); });
}

function animate() {
    update(); draw();
    if (GAME.state === 'PLAY' || GAME.state === 'LEVELUP') requestAnimationFrame(animate);
}
