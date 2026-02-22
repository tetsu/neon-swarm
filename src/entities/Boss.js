class Boss extends Enemy {
    constructor() {
        super();
        this.speed = 50; // Slower than normal
        this.color = '#f0f'; // Neon Pink / Magenta
        this.maxHp = 1000;
        this.isBoss = true;
    }

    spawn(game, x, y) {
        super.spawn(game, x, y);
        this.size = 40; // 4x size
        this.maxHp = 500 + (game.player.level * 100);
        this.hp = this.maxHp;

        // Show Boss UI
        document.getElementById('boss-hp-container').classList.remove('hidden');
        this.updateBossUI();
    }

    takeDamage(amount) {
        super.takeDamage(amount);
        this.updateBossUI();
    }

    updateBossUI() {
        if (this.hp <= 0) {
            document.getElementById('boss-hp-container').classList.add('hidden');
        } else {
            const pct = Math.max(0, this.hp / this.maxHp) * 100;
            document.getElementById('boss-hp-fill').style.width = pct + '%';
        }
    }

    die() {
        this.active = false;

        // Hide UI
        document.getElementById('boss-hp-container').classList.add('hidden');

        // Huge explosion
        this.game.triggerExplosion(this.x, this.y, 200, 50);

        // Add huge score
        this.game.score += 1000;
        this.game.updateUI();

        // Feature Set C: Drop Loot Chest (trigger special upgrade state)
        this.game.triggerBossLoot();
    }

    // Draw overridden to add complex boss geometry if desired, 
    // or just rely on the larger size and different color inherited from Enemy.
    draw(ctx) {
        if (!this.active) return;

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(Date.now() / 1000); // Slow spin

        ctx.beginPath();
        // Inner core
        ctx.rect(-this.size / 2, -this.size / 2, this.size, this.size);
        // Outer rings
        ctx.rect(-this.size / 1.5, -this.size / 1.5, this.size * 1.33, this.size * 1.33);

        if (this.hitFlashTimer > 0) {
            ctx.fillStyle = '#fff';
            ctx.shadowBlur = 30;
            ctx.shadowColor = '#fff';
            ctx.fill();
        } else {
            ctx.fillStyle = '#000';
            ctx.lineWidth = 3;
            ctx.strokeStyle = this.color;
            ctx.shadowBlur = 20;
            ctx.shadowColor = this.color;
            ctx.fill();
            ctx.stroke();
        }

        ctx.restore();
    }
}

window.Boss = Boss;
