// =============================================================================
// ASSETS.JS - Asset loading (EXACT filenames from original)
// =============================================================================

export const ASSETS = {};

export function loadAssets() {
    const sources = {
        SOLDIER: 'tile_0087.png',
        MAGE: 'tile_0084.png',
        CLERIC: 'tile_0098.png',
        SCOUNDREL: 'tile_0100.png',
        WITCH: 'tile_0111.png',
        FOLK_HERO: 'tile_0112.png',
        BACKGROUND: 'battlfield_tileset.png',
        RAT: 'tile_0123.png',
        BAT: 'tile_0120.png',
        OGRE: 'tile_0109.png',
        CRAB: 'tile_0110.png'
    };
    
    for(let key in sources) {
        const img = new Image();
        img.src = sources[key];
        ASSETS[key] = img;
    }
}
