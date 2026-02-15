class Enemy {
    constructor(x, y, health) {
        this.x = x;
        this.y = y;
        this.health = health;
    }

    update() {
        // Logic to update enemy position, state, etc.
        this.x += 1; // Example update
    }

    draw(ctx) {
        // Logic to draw enemy on canvas using the context "ctx"
        ctx.fillStyle = 'red'; // Example color
        ctx.fillRect(this.x, this.y, 50, 50); // Example drawing
    }
}

export default Enemy;