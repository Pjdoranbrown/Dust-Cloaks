class Projectile extends Entity {
    constructor(x, y, r, color, damage, duration) {
        super(x, y, r, color);
        this.damage = damage;
        this.duration = META.upgrades['engineering'] ? Math.floor(duration * 1.2) : duration;
    }
    update() {
        this.duration--;
        if (this.duration <= 0) this.markedForDeletion = true;
    }
}

class MagicMissile extends Projectile {
    constructor(x, y, target, damage) {
        super(x, y, 5, '#87CEEB', damage, 60);
        this.target = target;
        this.speed = META.upgrades['carpentry'] ? 8.4 : 7;
    }
    update() {
        super.update();
        if (this.target && !this.target.markedForDeletion) {
            const dx = this.target.x - this.x;
            const dy = this.target.y - this.y;
            const dist = Math.hypot(dx, dy);
            this.x += (dx / dist) * this.speed;
            this.y += (dy / dist) * this.speed;
            if (dist < 10) { takeEnemyDamage(this.target, this.damage); this.markedForDeletion = true; }
        } else { this.markedForDeletion = true; }
    }
}

class FireballZone extends Projectile {
    constructor(x, y) { super(x, y, 60, 'rgba(255, 69, 0, 0.4)', 5, 240); }
    update() {
        super.update();
        if (this.duration % 20 === 0) {
            enemies.forEach(e => { if (Math.hypot(e.x - this.x, e.y - this.y) < this.radius) takeEnemyDamage(e, this.damage, false); });
        }
    }
}

class MeleeSwipe extends Projectile {
    constructor(x, y, tx, ty, damage) {
        super(x, y, 35, 'rgba(200,200,200,0.5)', damage, 8);
        enemies.forEach(e => { if (Math.hypot(e.x - x, e.y - y) < 45) takeEnemyDamage(e, damage, true); });
    }
}

class DaggerMelee extends Projectile {
    constructor(x, y, tx, ty, damage) {
        super(x, y, 10, '#fff', damage, 5);
        const angle = Math.atan2(ty - y, tx - x);
        const hx = x + Math.cos(angle) * 20;
        const hy = y + Math.sin(angle) * 20;
        enemies.forEach(e => { if (Math.hypot(e.x - hx, e.y - hy) < 20) takeEnemyDamage(e, damage); });
    }
}

class Trap extends Projectile {
    constructor(x, y, damage) { super(x, y, 15, '#8B4513', damage, 600); this.active = true; }
    update() {
        if (!this.active) { this.markedForDeletion = true; return; }
        this.duration--;
        if (this.duration <= 0) this.markedForDeletion = true;
        enemies.forEach(e => {
            if (Math.hypot(e.x - this.x, e.y - this.y) < this.radius + e.radius) {
                takeEnemyDamage(e, this.damage);
                e.slowTimer = 180;
                this.active = false;
                addFloatingText(this.x, this.y, "SNAP!", "red");
            }
        });
    }
}

class Shockwave extends Projectile {
    constructor(x, y, range, damage) {
        super(x, y, range, 'rgba(255, 215, 0, 0.3)', damage, 15);
        enemies.forEach(e => {
             if (Math.hypot(e.x - x, e.y - y) < range) {
                 takeEnemyDamage(e, damage, true);
                 const angle = Math.atan2(e.y - y, e.x - x);
                 e.x += Math.cos(angle) * 30; e.y += Math.sin(angle) * 30;
             }
        });
    }
}

class PoisonBolt extends Projectile {
    constructor(x, y, target, damage, causesFear) {
        super(x, y, 6, '#800080', damage, 60);
        this.target = target; this.causesFear = causesFear;
        this.speed = META.upgrades['carpentry'] ? 7.2 : 6;
    }
    update() {
        super.update();
        if (this.target && !this.target.markedForDeletion) {
             const dx = this.target.x - this.x; const dy = this.target.y - this.y;
             const dist = Math.hypot(dx, dy);
             this.x += (dx/dist)*this.speed; this.y += (dy/dist)*this.speed;
             if (dist < 10) {
                 takeEnemyDamage(this.target, this.damage);
                 this.target.poisoned = true; this.target.poisonDmg = 2;
                 if (this.causesFear) this.target.fearTimer = 120;
                 this.markedForDeletion = true;
             }
        } else { this.markedForDeletion = true; }
    }
}

class StraightShot extends Projectile {
    constructor(x, y, angle, damage) {
        super(x, y, 5, '#228B22', damage, 60);
        let speed = META.upgrades['carpentry'] ? 12 : 10;
        this.vx = Math.cos(angle) * speed; this.vy = Math.sin(angle) * speed;
    }
    update() {
        super.update();
        this.x += this.vx; this.y += this.vy;
        enemies.forEach(e => {
            if (checkCollision(this, e)) { takeEnemyDamage(e, this.damage); this.markedForDeletion = true; }
        });
    }
}
