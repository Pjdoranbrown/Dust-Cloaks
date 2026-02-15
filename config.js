// =============================================================================
// CONFIG.JS - All game configuration, definitions, and constants
// =============================================================================

export const CONFIG = {
    PLAYER_SPEED_WEDGE: 2.5,
    PLAYER_SPEED_SHIELD: 1.8,
    ENEMY_SPAWN_RATE: 60,
    MAX_TOTAL_SQUAD_SIZE: 12,
    SECOND_LEADER_COST: 25,
    SQUAD_LIMIT_BEFORE_SECOND: 6,
    PICKUP_RANGE: 80
};

// Character Class Definitions
export const CLASS_DEFS = {
    TANK: { 
        name: "Tank", 
        color: "#228B22", 
        imgKey: "TANK",
        weapon: "SHIELD", 
        hp: 30, 
        dmgMult: 0.8, 
        cooldownMult: 1.0, 
        rangeMult: 0.9,
        desc: "+50% HP, -20% Damage, Blocks for Leader" 
    },
    ARCHER: { 
        name: "Archer", 
        color: "#8B4513", 
        imgKey: "ARCHER",
        weapon: "BOW", 
        hp: 20, 
        dmgMult: 1.0, 
        cooldownMult: 0.9, 
        rangeMult: 1.3,
        desc: "Ranged Attacks, +30% Range, -10% Cooldown" 
    },
    MAGE: { 
        name: "Mage", 
        color: "#4169E1", 
        imgKey: "MAGE",
        weapon: "STAFF", 
        hp: 15, 
        dmgMult: 1.5, 
        cooldownMult: 1.2, 
        rangeMult: 1.1,
        desc: "+50% Damage, -25% HP, Magic AoE Attacks" 
    },
    ROGUE: { 
        name: "Rogue", 
        color: "#8B008B", 
        imgKey: "ROGUE",
        weapon: "DAGGER", 
        hp: 18, 
        dmgMult: 0.7, 
        cooldownMult: 0.5, 
        rangeMult: 0.8,
        desc: "Rapid Attacks, -50% Cooldown, -30% Damage" 
    },
    CLERIC: { 
        name: "Cleric", 
        color: "#FFD700", 
        imgKey: "CLERIC",
        weapon: "MACE", 
        hp: 25, 
        dmgMult: 0.9, 
        cooldownMult: 1.0, 
        rangeMult: 1.0,
        desc: "+25% HP, Heals Leader over time" 
    },
    PALADIN: { 
        name: "Paladin", 
        color: "#FF6347", 
        imgKey: "PALADIN",
        weapon: "HAMMER", 
        hp: 28, 
        dmgMult: 1.2, 
        cooldownMult: 1.1, 
        rangeMult: 0.95,
        desc: "+40% HP, +20% Damage, Balanced Fighter" 
    }
};

// Race Definitions
export const RACES = {
    HUMAN: { 
        name: "Human", 
        hpMult: 1.0, 
        dmgMult: 1.0, 
        speedMult: 1.0, 
        luckBonus: 0,
        desc: "Balanced in all ways" 
    },
    ELF: { 
        name: "Elf", 
        hpMult: 0.9, 
        dmgMult: 1.1, 
        speedMult: 1.15, 
        luckBonus: 1,
        desc: "-10% HP, +10% Damage, +15% Speed, +1 Luck" 
    },
    DWARF: { 
        name: "Dwarf", 
        hpMult: 1.2, 
        dmgMult: 1.0, 
        speedMult: 0.9, 
        luckBonus: 0,
        desc: "+20% HP, -10% Speed" 
    },
    ORC: { 
        name: "Orc", 
        hpMult: 1.1, 
        dmgMult: 1.15, 
        speedMult: 0.95, 
        luckBonus: -1,
        desc: "+10% HP, +15% Damage, -5% Speed, -1 Luck" 
    },
    HALFLING: { 
        name: "Halfling", 
        hpMult: 0.85, 
        dmgMult: 0.9, 
        speedMult: 1.2, 
        luckBonus: 2,
        desc: "-15% HP, -10% Damage, +20% Speed, +2 Luck" 
    },
    GNOME: { 
        name: "Gnome", 
        hpMult: 0.9, 
        dmgMult: 1.05, 
        speedMult: 1.05, 
        luckBonus: 1,
        desc: "-10% HP, +5% Damage, +5% Speed, +1 Luck" 
    }
};

// Weapon Definitions
export const WEAPON_DEFS = {
    BOW: { 
        damage: 8, 
        cooldown: 50, 
        range: 300, 
        speed: 6, 
        color: "#8B4513", 
        imgKey: "PROJ_ARROW",
        desc: "Ranged, Fast Projectiles" 
    },
    STAFF: { 
        damage: 15, 
        cooldown: 90, 
        range: 250, 
        speed: 4, 
        color: "#4169E1", 
        imgKey: "PROJ_MAGIC",
        piercing: true,
        desc: "High Damage, Piercing AoE" 
    },
    DAGGER: { 
        damage: 5, 
        cooldown: 30, 
        range: 200, 
        speed: 8, 
        color: "#8B008B", 
        imgKey: "PROJ_DAGGER",
        desc: "Rapid Fire, Lower Damage" 
    },
    MACE: { 
        damage: 10, 
        cooldown: 60, 
        range: 220, 
        speed: 5, 
        color: "#FFD700", 
        imgKey: "PROJ_MACE",
        desc: "Balanced Damage and Speed" 
    },
    HAMMER: { 
        damage: 12, 
        cooldown: 70, 
        range: 240, 
        speed: 5, 
        color: "#FF6347", 
        imgKey: "PROJ_HAMMER",
        desc: "High Damage, Moderate Speed" 
    },
    SHIELD: { 
        damage: 6, 
        cooldown: 80, 
        range: 180, 
        speed: 4, 
        color: "#228B22", 
        imgKey: "PROJ_SHIELD",
        desc: "Defensive, Protects Leader" 
    }
};

// Camp Upgrade Definitions
export const UPGRADE_DEFS = {
    stables: { 
        name: "Stables", 
        cost: 15, 
        desc: "Increases movement speed by 10%", 
        imgKey: "UPGRADE_STABLES" 
    },
    barracks: { 
        name: "Barracks", 
        cost: 20, 
        desc: "Unlocks a second leader slot for larger squad", 
        imgKey: "UPGRADE_BARRACKS" 
    },
    armory: { 
        name: "Armory", 
        cost: 25, 
        desc: "+20% Damage for all units", 
        imgKey: "UPGRADE_ARMORY" 
    },
    housing: { 
        name: "Housing", 
        cost: 10, 
        desc: "Passive HP regen during runs", 
        imgKey: "UPGRADE_HOUSING" 
    }
};

// Name Pools for Random Generation
export const NAME_POOLS = {
    HUMAN: ["Aldric", "Brenna", "Cedric", "Dara", "Eamon", "Fiona", "Gareth", "Helena", "Ivan", "Jora"],
    ELF: ["Aelindra", "Thalion", "Lirien", "Faelor", "Silmara", "Galion", "Aelis", "Tauriel", "Celeborn", "Galadriel"],
    DWARF: ["Thorin", "Balin", "Dwalin", "Gimli", "Oin", "Gloin", "Bombur", "Bofur", "Nori", "Dori"],
    ORC: ["Grok", "Thrak", "Morg", "Uruk", "Drog", "Skar", "Grash", "Brug", "Zog", "Narg"],
    HALFLING: ["Bilbo", "Frodo", "Samwise", "Merry", "Pippin", "Rosie", "Hamfast", "Lobelia", "Otho", "Ponto"],
    GNOME: ["Fizzlebang", "Tinkerton", "Sparkwhistle", "Cogsworth", "Gimbal", "Nibblet", "Wobblesprocket", "Fizzgig", "Bimble", "Quilby"]
};
