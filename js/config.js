const CONFIG = {
    // Game configuration constants
    MAX_HEALTH: 100,
    INITIAL_MONEY: 50,
    // Add other CONFIG constants here
};

const RACES = {
    HUMAN: {
        name: 'Human',
        description: 'Versatile and adaptive.',
        stats: {
            strength: 5,
            agility: 5,
            intelligence: 5
        }
    },
    ELF: {
        name: 'Elf',
        description: 'Agile and keen-eyed.',
        stats: {
            strength: 3,
            agility: 8,
            intelligence: 6
        }
    }
    // Add other RACES definitions here
};

const NAMES = [
    'Warrior',
    'Mage',
    'Rogue'
    // Add other NAMES here
];

const CLASS_DEFS = {
    WARRIOR: {
        health: 150,
        mana: 50,
        attack: 20
    },
    MAGE: {
        health: 100,
        mana: 100,
        attack: 15
    }
    // Add other CLASS_DEFS here
};

const ENEMY_DEFS = {
    ORC: {
        health: 80,
        attack: 25
    },
    SKELETON: {
        health: 60,
        attack: 15
    }
    // Add other ENEMY_DEFS here
};

const UPGRADES = {
    HEALTH_BOOST: {
        type: 'health',
        amount: 20
    },
    ATTACK_BOOST: {
        type: 'attack',
        amount: 5
    }
    // Add other UPGRADES here
};