// Utility Functions

// Loads assets such as images and sounds
function loadAssets(assets, callback) {
    let loadedAssets = 0;
    const totalAssets = assets.length;

    assets.forEach(asset => {
        const img = new Image();
        img.src = asset;
        img.onload = () => {
            loadedAssets++;
            if (loadedAssets === totalAssets) {
                callback();
            }
        };
    });
}

// Generates a random name
function getRandomName() {
    const names = ['Alice', 'Bob', 'Charlie', 'Diana'];
    return names[Math.floor(Math.random() * names.length)];
}

// Adds floating text to the screen
function addFloatingText(text, x, y) {
    const floatText = document.createElement('div');
    floatText.innerText = text;
    floatText.style.position = 'absolute';
    floatText.style.left = `${x}px`;
    floatText.style.top = `${y}px`;
    document.body.appendChild(floatText);
    setTimeout(() => floatText.remove(), 2000);
}

// Checks for collision between two objects
function checkCollision(rect1, rect2) {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

// Gets the nearest enemy from a list of enemies
function getNearestEnemy(player, enemies) {
    let nearestEnemy = null;
    let nearestDistance = Infinity;

    enemies.forEach(enemy => {
        const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);
        if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestEnemy = enemy;
        }
    });
    return nearestEnemy;
}