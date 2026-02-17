const CONFIG = {
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

const RACES = {
    ELVES: { name: "Elf", moveSpeed: 1.10, hp: -15, desc: "A race as diverse as the realms they inhabit. Fleet of foot but fragile.", statsText: "Movement Speed: +10% | Max HP: -15" },
    GREENSKINS: { name: "Green Skin", moveSpeed: 0.95, dmgMult: 1.10, hp: 15, desc: "Fierce orcs, cunning goblins, and brutal hobgoblins. Tough survivors who hit hard.", statsText: "Max HP: +15 | Damage: +10% | Speed: -5%" },
    HUMAN: { name: "Human", dmgFlat: 5, hp: 5, moveSpeed: 1.05, luck: -3, desc: "Ambitious and adaptable. Good at everything, but cursed by fate.", statsText: "All Stats: +3 (Approx) | Luck: -3" },
    MUDDLED: { name: "Muddled", dmgFlat: 2, hp: 2, moveSpeed: 1.05, luck: 2, desc: "Those of mixed heritage who straddle the line between worlds.", statsText: "All Stats: +1 | Luck: +2" },
    OUTSIDER: { name: "Outsider", cooldownMult: 0.85, hp: -20, desc: "Born of infernal or divine unions. Channel power quickly but unstable forms.", statsText: "Attack Speed: +15% | Max HP: -20" },
    SHORTFOLK: { name: "Short Folk", dmgMult: 1.05, moveSpeed: 0.95, luck: 5, desc: "Dwarves, gnomes, and halflings. Stout and lucky.", statsText: "Luck: +5 | Damage: +5% | Speed: -5%" }
};

const NAMES = {
    ELVES: ["Aelrindel", "Faenor", "Lyra", "Thalia", "Silaqui", "Erendil"],
    GREENSKINS: ["Grok", "Mog", "Snagga", "Kruel", "Boz", "Griznut"],
    HUMAN: ["Baldric", "Osric", "Edith", "Wulf", "Godfrey", "Rowan"],
    MUDDLED: ["Half-Jack", "Mix", "Cross", "Blur", "Twain", "Mingle"],
    OUTSIDER: ["Xol", "Vex", "Null", "Void", "Entropy", "Kaos"],
    SHORTFOLK: ["Bramble", "Took", "Pip", "Knub", "Shorty", "Fumble"]
};

const CLASS_DEFS = {
    SOLDIER: { name: 'Soldier', role: 'Vanguard', color: '#404040', desc: 'Melee sweep. Lvl 3 unlocks Shield Wall formation.', range: 60, cooldown: 60, damage: 18, imgKey: 'SOLDIER', iconKey: 'SOLDIER_ICON' },
    SCOUNDREL: { name: 'Scoundrel', role: 'DPS', color: '#1a1a1a', desc: 'Single Target Stab. Lvl 3 drops slowing traps.', range: 40, cooldown: 40, damage: 35, imgKey: 'SCOUNDREL', iconKey: 'SCOUNDREL' },
    MAGE: { name: 'Mage', role: 'Artillery', color: '#00008b', desc: 'Fast projectiles. Lvl 3 summons Fireball Zones.', range: 400, cooldown: 35, damage: 12, imgKey: 'MAGE', iconKey: 'MAGE_ICON' },
    CLERIC: { name: 'Cleric', role: 'Support', color: '#b8860b', desc: 'AoE Knockback. Lvl 3 heals squad every 10s.', range: 80, cooldown: 80, damage: 12, imgKey: 'CLERIC', iconKey: 'CLERIC' },
    WITCH: { name: 'Witch', role: 'Debuffer', color: '#4b0082', desc: 'Permanent Poison DoT. Lvl 3 Fears enemies.', range: 250, cooldown: 70, damage: 3, imgKey: 'WITCH', iconKey: 'WITCH_ICON' },
    FOLK_HERO: { name: 'Folk Hero', role: 'Control', color: '#006400', desc: 'Directional shot. Lvl 3 increases XP collection.', range: 300, cooldown: 50, damage: 14, imgKey: 'FOLK_HERO', iconKey: 'FOLK_HERO' }
};

const ENEMY_DEFS = {
    RAT: { name: 'Rat', hp: 15, speed: 0.8, damage: 3, xp: 5, imgKey: 'RAT', color: '#654321', scale: 2.0 },
    BAT: { name: 'Bat', hp: 10, speed: 2.0, damage: 4, xp: 8, imgKey: 'BAT', color: '#333333', scale: 2.0 },
    OGRE: { name: 'Ogre', hp: 120, speed: 0.6, damage: 15, xp: 30, imgKey: 'OGRE', color: '#2e8b57', scale: 3.5 },
    CRAB: { name: 'Crab', hp: 50, speed: 2.5, damage: 12, xp: 20, imgKey: 'CRAB', color: '#cd5c5c', scale: 2.5 }
};

const UPGRADES = [
    { category: "Camp Followers", id: "brothel", name: "Brothel", desc: "Max Luck +2", cost: 50, imgKey: 'BROTHEL', x: 15 },
    { category: "Camp Followers", id: "kitchen", name: "Kitchen", desc: "Max HP +20", cost: 50, imgKey: 'FIRE', x: 20 },
    { category: "Camp Followers", id: "housing", name: "Housing", desc: "HP Regen +0.5/sec", cost: 100, imgKey: 'HOUSE', x: 25 },
    { category: "Command", id: "command", name: "Command Tent", desc: "Attack Cooldowns -5%", cost: 300, imgKey: 'TENT', x: 55 },
    { category: "Command", id: "guildhall", name: "Guild Hall", desc: "Start at Level 2", cost: 500 },
    { category: "Magical", id: "alchemy", name: "Alchemy Lab", desc: "Witch Damage +25%", cost: 150, imgKey: 'ALCHEMY', x: 85 },
    { category: "Magical", id: "magetower", name: "Mage Tower", desc: "Mage Damage +25%", cost: 150, imgKey: 'MAGE_TOWER', x: 95 },
    { category: "Medical", id: "hospital", name: "Field Hospital", desc: "Heal 20 HP on Level Up", cost: 100 },
    { category: "Medical", id: "herbalist", name: "Herbalist", desc: "Pickup Range +20%", cost: 75, imgKey: 'PINES', x: 90 },
    { category: "Economy", id: "merchant", name: "Merchant Stalls", desc: "Gold Drop Rate +5%", cost: 200 },
    { category: "Economy", id: "cells", name: "Prisoner Cells", desc: "XP Gain +10%", cost: 100, imgKey: 'WALL', x: 10 },
    { category: "Class Specific", id: "ranger", name: "Ranger's Hut", desc: "Folk Hero Damage +25%", cost: 150, imgKey: 'RANGER', x: 75 },
    { category: "Class Specific", id: "chapel", name: "Chapel", desc: "Cleric Damage +25%", cost: 150, imgKey: 'CHAPEL', x: 35 },
    { category: "Class Specific", id: "church", name: "Church", desc: "Max HP +50", cost: 250, imgKey: 'CHURCH', x: 45 },
    { category: "Class Specific", id: "pens", name: "Slave Pens", desc: "Scoundrel Damage +25%", cost: 150, imgKey: 'PENS', x: 5 },
    { category: "Storage", id: "armory", name: "Armory", desc: "Soldier Damage +25%", cost: 150, imgKey: 'TOWER_WATCH', x: 60 },
    { category: "Storage", id: "stables", name: "Stables", desc: "Move Speed +10%", cost: 100, imgKey: 'STABLE', x: 65 },
    { category: "Training", id: "grounds", name: "Training Grounds", desc: "XP Gain +20%", cost: 200, imgKey: 'FENCE', x: 50 },
    { category: "Workshops", id: "blacksmith", name: "Blacksmith Forge", desc: "Global Damage +10%", cost: 300 },
    { category: "Workshops", id: "carpentry", name: "Carpentry Shop", desc: "Projectile Speed +20%", cost: 100 },
    { category: "Workshops", id: "engineering", name: "Engineering", desc: "Effect Duration +20%", cost: 150 },
    { category: "Workshops", id: "leather", name: "Leatherworking", desc: "Damage Reduction +1", cost: 200 },
];
