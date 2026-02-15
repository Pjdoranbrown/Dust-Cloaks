// =============================================================================
// GAME.JS - Main game loop, update, draw, and core gameplay
// =============================================================================

import { setGameFunctions } from './pickup.js';
import { levelUp } from './ui.js';
import { GAME, META, keys, saveGame } from './gameState.js';
import { CONFIG } from './config.js';
import { ASSETS } from './assets.js';
import { player } from './player.js';
import { squad } from './squadmate.js';
import { enemies, Enemy } from './enemy.js';
import { projectiles } from './projectile.js';
import { pickups } from './pickup.js';
import { updateUI, gameOver } from './ui.js';

// Connect the functions after module loads
setGameFunctions(addFloatingText, levelUp);

// Floating text array
export const floatingTexts = [];

// Canvas and context
let canvas, ctx;

// Initialize game (called after assets load)
export function initGame() {
    canvas = document.getElementById('gameCanvas');
    ctx = canvas.getContext('2d');
    canvas.width = GAME.width;
    canvas.height = GAME.height;
    
    // Keyboard input
    document.addEventListener('keydown', (e) => {
        if (e.key === 'w' || e.key === 'W') keys.w = true;
        if (e.key === 'a' || e.key === 'A') keys.a = true;
        if (e.key === 's' || e.key === 'S') keys.s = true;
        if (e.key === 'd' || e.key === 'D') keys.d = true;
    });
    
    document.addEventListener('keyup', (e) => {
        if (e.key === 'w' || e.key === 'W') keys.w = false;
        if (e.key === 'a' || e.key === 'A') keys.a = false;
        if (e.key === 's' || e.key === 'S') keys.s = false;
        if (e.key === 'd' || e.key === 'D') keys.d = false;
    });
}

// Start the game loop
export function startGameLoop() {
    GAME.state = 'PLAY';
    animate();
}

// Add floating text
export function addFloatingText(x, y, text, color) {
    floatingTexts.push({
        x, y, text, color, life: 30
    });
}

// Main update function
function update() {
    if (GAME.state !== 'PLAY') return;
    
    GAME.frames++;
    if (GAME.frames % 60 === 0) {
        GAME.time++;
        // Passive regen from housing upgrade
        if (META.upgrades['housing']) {
            if (GAME.hp < GAME.maxHp) {
                GAME.hp = Math.min(GAME.maxHp, GAME.hp + 0.5);
            }
        }
    }
    
    // Enemy spawning
    if (GAME.frames % CONFIG.ENEMY_SPAWN_RATE === 0) {
        enemies.push(new Enemy());
    }
    
    // Player movement
    let moveSpeed = GAME.formation === 'WEDGE' ? CONFIG.PLAYER_SPEED_WEDGE : CONFIG.PLAYER_SPEED_SHIELD;
    if (META.upgrades['stables']) moveSpeed *= 1.1;
    if (player.raceSpeedMult) moveSpeed *= player.raceSpeedMult;
    
    let dx = 0, dy = 0;
    if (keys.w) dy -= 1;
    if (keys.s) dy += 1;
    if (keys.a) dx -= 1;
    if (keys.d) dx += 1;
    
    if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        dx = (dx / len) * moveSpeed;
        dy = (dy / len) * moveSpeed;
        
        player.x += dx;
        player.y += dy;
        player.angle = Math.atan2(dy, dx);
    }
    
    // Keep player in bounds
    player.x = Math.max(10, Math.min(GAME.width - 10, player.x));
    player.y = Math.max(10, Math.min(GAME.height - 10, player.y));
    
    // Update squad
    squad.forEach(mate => mate.update(player.x, player.y, player.angle, GAME.formation));
    
    // Update enemies
    enemies.forEach(e => e.update());
    enemies.length = 0;
    enemies.push(...enemies.filter(e => !e.markedForDeletion));
    
    // Update projectiles
    projectiles.forEach(p => p.update());
    projectiles.length = 0;
    projectiles.push(...projectiles.filter(p => !p.markedForDeletion));
    
    // Update pickups
    pickups.forEach(p => p.update());
    pickups.length = 0;
    pickups.push(...pickups.filter(p => !p.markedForDeletion));
    
    // Update floating texts
    floatingTexts.forEach(t => {
        t.y -= 0.5;
        t.life--;
    });
    floatingTexts.length = 0;
    floatingTexts.push(...floatingTexts.filter(t => t.life > 0));
    
    // Check win condition (20 minutes)
    if (GAME.time >= 20 * 60) {
        GAME.state = 'WIN';
        saveGame();
        document.getElementById('win-screen').classList.remove('hidden');
    }
    
    // Check game over
    if (GAME.hp <= 0) {
        gameOver();
    }
    
    updateUI();
}

// Main draw function
function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw tiled background
    const bgImg = ASSETS['BACKGROUND'];
    if (bgImg && bgImg.complete && bgImg.naturalWidth !== 0) {
        const pattern = ctx.createPattern(bgImg, 'repeat');
        ctx.fillStyle = pattern;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Draw pickups
    pickups.forEach(p => p.draw(ctx));
    
    // Draw player
    const leaderImg = ASSETS[player.imgKey];
    if (leaderImg && leaderImg.complete && leaderImg.naturalWidth !== 0) {
        const size = player.radius * 3.0;
        ctx.drawImage(leaderImg, player.x - size/2, player.y - size/2, size, size);
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius * 1.5, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#D4AF37";
        ctx.stroke();
    } else {
        ctx.beginPath();
        ctx.arc(player.x, player.y, player.radius, 0, Math.PI * 2);
        ctx.fillStyle = player.color;
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "#fff";
        ctx.stroke();
    }
    
    // Draw squad
    squad.forEach(mate => mate.draw(ctx));
    
    // Draw enemies
    enemies.forEach(e => e.draw(ctx));
    
    // Draw projectiles
    projectiles.forEach(p => p.draw(ctx));
    
    // Draw floating text
    floatingTexts.forEach(t => {
        ctx.fillStyle = t.color;
        ctx.font = "bold 16px Courier New";
        ctx.fillText(t.text, t.x, t.y);
    });
}

// Animation loop
function animate() {
    update();
    draw();
    if (GAME.state === 'PLAY' || GAME.state === 'LEVELUP') {
        requestAnimationFrame(animate);
    }
}
