class Enemy {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.size = 10;
        this.speed = 100;
        this.color = '#f33'; // Neon Red
        this.hp = 10;
        this.game = null;
        this.hitFlashTimer = 0;
    }

    spawn(game, x, y) {
        this.active = true;
        this.game = game;
        this.x = x;
        this.y = y;
        this.hp = 10 + (game.player.level * 2); // Scale with player level
        this.hitFlashTimer = 0;
    }

    takeDamage(amount) {
        this.hp -= amount;
        this.hitFlashTimer = 0.1; // 100ms flash

        if (this.hp <= 0) {
            this.die();
        }
    }

    die() {
        this.active = false;

        // Drop XP
        const drop = this.game.dataCubes.get();
        drop.spawn(this.game, this.x, this.y);

        // Chain Reaction Logic (Feature Set A)
        if (Math.random() < 0.10) { // 10% chance
            this.game.triggerExplosion(this.x, this.y, 50, 5); // radius 50, damage 5
        }

        // Add score
        this.game.score += 10;
        this.game.updateUI();
    }

    update(dt) {
        if (!this.active) return;

        if (this.hitFlashTimer > 0) {
            this.hitFlashTimer -= dt;
        }

        // Swarm towards player
        const dx = this.game.player.x - this.x;
        const dy = this.game.player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
        }

        // Collision with player
        if (dist < this.size + this.game.player.size) {
            this.game.player.hp -= 10 * dt; // Damage over time while touching
            if (this.game.player.hp <= 0) {
                this.game.gameOver();
            }
        }
    }

    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.beginPath();
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 15;
            ctx.shadowColor = '#fff';
        } else {
            ctx.fillStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeStyle = this.color;
            ctx.shadowBlur = 10;
            ctx.shadowColor = this.color;
        }

        ctx.fill();
        if (this.hitFlashTimer <= 0) ctx.stroke();

        ctx.restore();
    }
}

window.Enemy = Enemy;
