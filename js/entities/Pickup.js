class XPOrb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = 'XP';
    }

    collect() {
        console.log('XP collected!');
    }
}

class GoldOrb {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.type = 'Gold';
    }

    collect() {
        console.log('Gold collected!');
    }
}

module.exports = { XPOrb, GoldOrb };