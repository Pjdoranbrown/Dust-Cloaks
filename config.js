// =============================================================================
// CONFIG.JS - Game configuration and definitions (EXACT copy from original)
// =============================================================================

export const CONFIG = {
    PLAYER_SPEED_WEDGE: 3.5,
    PLAYER_SPEED_SHIELD: 2.0,
    SQUAD_FOLLOW_SPEED: 0.1, 
    ENEMY_SPAWN_RATE: 25, 
    XP_BASE_REQ: 10,
    XP_SCALING: 1.5,
    MAX_TOTAL_SQUAD_SIZE: 12,
    SQUAD_SIZE_PER_LEADER: 6,
    SECOND_LEADER_COST: 20,
    BASE_PICKUP_RADIUS: 100
};

export const CLASS_DEFS = {
    SOLDIER: { 
        name: 'Soldier', role: 'Vanguard', color: '#404040',
        desc: 'Melee sweep. Lvl 3 unlocks Shield Wall formation.', 
        range: 60, cooldown: 60, damage: 18, imgKey: 'SOLDIER'
    },
    SCOUNDREL: { 
        name: 'Scoundrel', role: 'DPS', color: '#1a1a1a', 
        desc: 'Single Target Stab. Lvl 3 drops slowing traps.', 
        range: 40, cooldown: 40, damage: 35, imgKey: 'SCOUNDREL' 
    },
    MAGE: { 
        name: 'Mage', role: 'Artillery', color: '#00008b', 
        desc: 'Fast projectiles. Lvl 3 summons Fireball Zones.', 
        range: 400, cooldown: 35, damage: 12, imgKey: 'MAGE'
    },
    CLERIC: { 
        name: 'Cleric', role: 'Support', color: '#b8860b', 
        desc: 'AoE Knockback. Lvl 3 heals squad every 10s.', 
        range: 80, cooldown: 80, damage: 12, imgKey: 'CLERIC'
    },
    WITCH: { 
        name: 'Witch', role: 'Debuffer', color: '#4b0082', 
        desc: 'Permanent Poison DoT. Lvl 3 Fears enemies.', 
        range: 250, cooldown: 70, damage: 3, imgKey: 'WITCH' 
    },
    FOLK_HERO: { 
        name: 'Folk Hero', role: 'Control', color: '#006400', 
        desc: 'Directional shot. Lvl 3 increases XP collection.', 
        range: 300, cooldown: 50, damage: 14, imgKey: 'FOLK_HERO'
    }
};

export const ENEMY_DEFS = {
    RAT: {
        name: 'Rat', hp: 15, speed: 0.8, damage: 3, xp: 5, 
        imgKey: 'RAT', color: '#654321', scale: 2.0
    },
    BAT: {
        name: 'Bat', hp: 10, speed: 2.0, damage: 4, xp: 8, 
        imgKey: 'BAT', color: '#333333', scale: 2.0
    },
    OGRE: {
        name: 'Ogre', hp: 120, speed: 0.6, damage: 15, xp: 30, 
        imgKey: 'OGRE', color: '#2e8b57', scale: 3.5
    },
    CRAB: {
        name: 'Crab', hp: 35, speed: 1.2, damage: 7, xp: 12, 
        imgKey: 'CRAB', color: '#8b4513', scale: 2.5
    }
};

export const RACES = {
    HUMAN: { 
        name: "Human", 
        hp: 0, dmgFlat: 0, dmgMult: 1.0, cooldownMult: 1.0, moveSpeed: 1.0, luck: 0,
        desc: "Native to the valley. Baseline stats and no modifiers; what you see is what you get.",
        statsText: "Baseline: No modifiers" 
    },
    ELVES: { 
        name: "Elves", 
        hp: -10, dmgMult: 1.1, cooldownMult: 0.95, moveSpeed: 1.05,
        desc: "The long-lived and sharp-eyed. Faster to act and precise with damage, but fragile.",
        statsText: "Attack Speed: +5% | Damage: +10% | Speed: +5% | Max HP: -10" 
    },
    GREENSKINS: { 
        name: "Greenskins", 
        hp: 10, dmgFlat: 3, moveSpeed: 0.95,
        desc: "Orcs and goblins. Brutal and hardy, but slower to maneuver.",
        statsText: "Flat Damage: +3 | Max HP: +10 | Speed: -5%" 
    },
    MUDDLED: { 
        name: "Muddled Blood", 
        dmgMult: 1.05, luck: 3,
        desc: "Half-bloods of all kinds. A bit of everything, unpredictable but often lucky.",
        statsText: "Luck: +3 | Damage: +5%" 
    },
    OUTSIDER: { 
        name: "Outsider", 
        cooldownMult: 0.85, hp: -20,
        desc: "Born of infernal, divine or otherworldly unions. They channel power quickly but their forms are unstable.",
        statsText: "Attack Speed: +15% | Max HP: -20" 
    },
    SHORTFOLK: { 
        name: "Short Folk", 
        dmgMult: 1.05, moveSpeed: 0.95, luck: 5,
        desc: "Dwarves, gnomes, and halflings. Stout and surprisingly dangerous, they find fortune where others find death.",
        statsText: "Luck: +5 | Damage: +5% | Speed: -5%" 
    }
};

export const NAMES = {
    ELVES: ["Aelrindel", "Faenor", "Lyra", "Thalia", "Silaqui", "Erendil"],
    GREENSKINS: ["Grok", "Mog", "Snagga", "Kruel", "Boz", "Griznut"],
    HUMAN: ["Baldric", "Osric", "Edith", "Wulf", "Godfrey", "Rowan"],
    MUDDLED: ["Half-Jack", "Mix", "Cross", "Blur", "Twain", "Mingle"],
    OUTSIDER: ["Xol", "Vex", "Null", "Void", "Entropy", "Kaos"],
    SHORTFOLK: ["Bramble", "Took", "Pip", "Knub", "Shorty", "Fumble"]
};

export const UPGRADES = [
    { category: "Camp Followers", id: "brothel", name: "Brothel", desc: "Max Luck +2", cost: 50 },
    { category: "Camp Followers", id: "kitchen", name: "Kitchen", desc: "Max HP +20", cost: 50 },
    { category: "Camp Followers", id: "housing", name: "Housing", desc: "HP Regen +0.5/sec", cost: 100 },
    { category: "Command", id: "command", name: "Command Tent", desc: "Attack Cooldowns -5%", cost: 300 },
    { category: "Command", id: "guildhall", name: "Guild Hall", desc: "Start at Level 2", cost: 500 },
    { category: "Magical", id: "alchemy", name: "Alchemy Lab", desc: "Witch Damage +25%", cost: 150 },
    { category: "Magical", id: "magetower", name: "Mage Tower", desc: "Mage Damage +25%", cost: 150 },
    { category: "Medical", id: "hospital", name: "Field Hospital", desc: "Heal 20 HP on Level Up", cost: 100 },
    { category: "Medical", id: "herbalist", name: "Herbalist", desc: "Pickup Range +20%", cost: 75 },
    { category: "Economy", id: "merchant", name: "Merchant Stalls", desc: "Gold Drop Rate +5%", cost: 200 },
    { category: "Training", id: "carpentry", name: "Carpentry", desc: "Folk Hero Projectile Speed +20%", cost: 120 }
];
