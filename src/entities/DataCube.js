class DataCube {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.size = 6;
        this.game = null;
        this.color = '#3f3'; // Neon green
        this.collectRange = 100;
        this.speed = 300;
        this.xpValue = 1;
    }

    spawn(game, x, y, xpValue = 1) {
        this.active = true;
        this.game = game;
        this.x = x;
        this.y = y;
        this.xpValue = xpValue;

        // Scale size slightly with xpValue, but keep base around 6. Max addition is +10.
        this.size = 6 + Math.min(10, Math.floor((xpValue - 1) * 2));
    }

    update(dt) {
        if (!this.active) return;

        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const distSq = dx * dx + dy * dy;

        // Apply magnet multiplier if exists
        const magnetMult = (this.game && this.game.gameMagnetMult) ? this.game.gameMagnetMult : 1;
        const actualRange = this.collectRange * magnetMult;

        // Attraction to player
        if (distSq < actualRange * actualRange) {
            const dist = Math.sqrt(distSq);
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;

            // Collection
            if (dist < this.game.player.size + this.size) {
                this.game.player.gainXp(this.xpValue);
                this.active = false;
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        // Spin slowly based on time
        ctx.rotate(Date.now() / 500);

        ctx.beginPath();
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);

        ctx.fillStyle = '#000';
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        ctx.fill();
        ctx.stroke();

        // Glow
        ctx.shadowBlur = 5;
        ctx.shadowColor = this.color;
        ctx.stroke();

        ctx.restore();
    }
}

window.DataCube = DataCube;
