function getRandomName(raceKey) {
    const list = NAMES[raceKey] || NAMES.HUMAN;
    return list[Math.floor(Math.random() * list.length)];
}

function addFloatingText(x, y, text, color) {
    floatingTexts.push({ x, y, text, color, life: 30 });
}

function checkCollision(c1, c2) {
    const dx = c1.x - c2.x;
    const dy = c1.y - c2.y;
    return Math.hypot(dx, dy) < c1.radius + c2.radius;
}

function getNearestEnemy(x, y, range) {
    let nearest = null;
    let minDst = range;
    for (const e of enemies) {
        const dst = Math.hypot(e.x - x, e.y - y);
        if (dst < minDst) { minDst = dst; nearest = e; }
    }
    return nearest;
}

function loadAssets() {
    const sources = {
        SOLDIER: 'tile_0087.png', MAGE: 'tile_0084.png', CLERIC: 'tile_0098.png',
        SCOUNDREL: 'tile_0100.png', WITCH: 'tile_0111.png', FOLK_HERO: 'tile_0112.png',
        BACKGROUND: 'battlfield_tileset.png',
        RAT: 'tile_0123.png', BAT: 'tile_0120.png', OGRE: 'tile_0109.png', CRAB: 'tile_0110.png',
        // Camp Buildings
        TENT: 'tent.png', STABLE: 'stable.png', HOUSE: 'house.png',
        BROTHEL: 'houseChimney.png', ALCHEMY: 'runis.png', MAGE_TOWER: 'towerTall.png',
        CHAPEL: 'church.png', CHURCH: 'churchLarge.png', PENS: 'dock.png', RANGER: 'houseSmall.png',
        // New Buildings
        TOWER_WATCH: 'towerWatch.png', FENCE: 'fence.png', WALL: 'wall.png', 
        PINES: 'treePinesSmall.png', FIRE: 'campfire.png'
    };
    for(let key in sources) {
        const img = new Image();
        img.src = sources[key];
        ASSETS[key] = img;
    }
}
