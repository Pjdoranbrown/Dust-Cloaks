// =============================================================================
// ASSETS.JS - Image loading and asset management
// =============================================================================

export const ASSETS = {};

export function loadAssets(callback) {
    const imagesToLoad = [
        { key: 'TANK', src: 'tankIcon.png' },
        { key: 'ARCHER', src: 'archerIcon.png' },
        { key: 'MAGE', src: 'mageIcon.png' },
        { key: 'ROGUE', src: 'rogueIcon.png' },
        { key: 'CLERIC', src: 'clericIcon.png' },
        { key: 'PALADIN', src: 'paladinIcon.png' },
        { key: 'PROJ_ARROW', src: 'projArrow.png' },
        { key: 'PROJ_MAGIC', src: 'projMagic.png' },
        { key: 'PROJ_DAGGER', src: 'projDagger.png' },
        { key: 'PROJ_MACE', src: 'projMace.png' },
        { key: 'PROJ_HAMMER', src: 'projHammer.png' },
        { key: 'PROJ_SHIELD', src: 'projShield.png' },
        { key: 'ENEMY', src: 'enemyIcon.png' },
        { key: 'PICKUP_XP', src: 'pickupXP.png' },
        { key: 'PICKUP_GOLD', src: 'pickupGold.png' },
        { key: 'BACKGROUND', src: 'backgroundTile.png' },
        { key: 'UPGRADE_STABLES', src: 'upgradeStables.png' },
        { key: 'UPGRADE_BARRACKS', src: 'upgradeBarracks.png' },
        { key: 'UPGRADE_ARMORY', src: 'upgradeArmory.png' },
        { key: 'UPGRADE_HOUSING', src: 'upgradeHousing.png' }
    ];

    let loaded = 0;
    const total = imagesToLoad.length;

    imagesToLoad.forEach(({ key, src }) => {
        const img = new Image();
        img.onload = () => {
            loaded++;
            if (loaded === total) {
                callback();
            }
        };
        img.onerror = () => {
            console.warn(`Failed to load image: ${src}`);
            loaded++;
            if (loaded === total) {
                callback();
            }
        };
        img.src = src;
        ASSETS[key] = img;
    });
}
