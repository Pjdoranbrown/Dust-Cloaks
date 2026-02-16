const SAVE_KEY = 'dust_cloaks_v3';
let META = { gold: 0, upgrades: {}, roster: [] };
let canvas, ctx;
let ASSETS = {};

// Game State
let GAME = {
    state: 'START', width: 0, height: 0, frames: 0, time: 0, score: 0,
    level: 1, xp: 0, xpReq: CONFIG.XP_BASE_REQ,
    formation: 'WEDGE', luck: 0, maxLuck: 20, luckBurnCount: 0,
    hp: 100, maxHp: 100, canUseShieldWall: false
};
let creationData = { race: null, classKey: null, name: "" };
let currentRunStats = { kills: 0, gold: 0 };
let keys = { w:false, a:false, s:false, d:false, space:false, q:false };

// Entities Lists
let player;
let squad = [];
let enemies = [];
let pickups = [];
let projectiles = [];
let floatingTexts = [];
