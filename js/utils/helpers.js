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
        SOLDIER: 'assets/specialties/soldier.png', MAGE: 'assets/specialties/mage.png', CLERIC: 'assets/terrain/tiles/tile_0098.png',
        SCOUNDREL: 'assets/terrain/tiles/tile_0100.png', WITCH: 'assets/terrain/tiles/tile_0111.png', FOLK_HERO: 'assets/terrain/tiles/tile_0112.png',
        BACKGROUND: 'assets/tileset/battlefield_tileset.png',
        RAT: 'assets/terrain/tiles/tile_0123.png', BAT: 'assets/terrain/tiles/tile_0120.png', OGRE: 'assets/terrain/tiles/tile_0109.png', CRAB: 'assets/terrain/tiles/tile_0110.png',
        // Camp Buildings
        TENT: 'assets/buildings/tent.png', STABLE: 'assets/buildings/stable.png', HOUSE: 'assets/buildings/house.png',
        BROTHEL: 'assets/buildings/houseChimney.png', ALCHEMY: 'assets/ui/runis.png', MAGE_TOWER: 'assets/buildings/towerTall.png',
        CHAPEL: 'assets/buildings/church.png', CHURCH: 'assets/buildings/churchLarge.png', PENS: 'assets/buildings/dock.png', RANGER: 'assets/buildings/houseSmall.png',
        // New Buildings
        TOWER_WATCH: 'assets/buildings/towerWatch.png', FENCE: 'assets/structures/fence.png', WALL: 'assets/structures/wall.png', 
        PINES: 'assets/nature/treePinesSmall.png', FIRE: 'assets/effects/campfire.png'
    };
    for(let key in sources) {
        const img = new Image();
        img.src = sources[key];
        ASSETS[key] = img;
    }
}
