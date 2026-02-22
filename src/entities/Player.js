class Player {
    constructor(game) {
        this.game = game;
        this.x = window.innerWidth / 2;
        this.y = window.innerHeight / 2;
        this.size = 15;
        this.speed = 200; // pixels per second
        this.color = '#0ff';

        this.level = 1;
        this.xp = 0;
        this.xpNeeded = 10;

        this.attackTimer = 0;
        this.attackCooldown = 1.0; // seconds

        this.hp = 100;
        this.maxHp = 100;
    }

    update(dt) {
        // Movement
        const axis = Input.getAxis();
        if (axis.x !== 0 || axis.y !== 0) {
            this.x += axis.x * this.speed * dt;
            this.y += axis.y * this.speed * dt;
        } else if (Input.mouse.isDown) {
            // Move towards mouse if clicked inside playing state
            const dx = Input.mouse.x - this.x;
            const dy = Input.mouse.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            if (dist > 5) {
                this.x += (dx / dist) * this.speed * dt;
                this.y += (dy / dist) * this.speed * dt;
            }
        }

        // Keep in bounds
        this.x = Math.max(this.size, Math.min(window.innerWidth - this.size, this.x));
        this.y = Math.max(this.size, Math.min(window.innerHeight - this.size, this.y));

        // Auto Attack
        this.attackTimer += dt;
        if (this.attackTimer >= this.attackCooldown) {
            this.attack();
            this.attackTimer = 0;
        }
    }

    attack() {
        if (!this.game.enemies || this.game.enemies.active.length === 0) return;

        // Find nearest enemy
        let nearest = null;
        let minDist = Infinity;

        for (let i = 0; i < this.game.enemies.active.length; i++) {
            const enemy = this.game.enemies.active[i];
            const dx = enemy.x - this.x;
            const dy = enemy.y - this.y;
            const distSq = dx * dx + dy * dy;

            if (distSq < minDist) {
                minDist = distSq;
                nearest = enemy;
            }
        }

        if (nearest) {
            // Fire projectile
            const proj = this.game.projectiles.get();
            proj.spawn(this.x, this.y, nearest);
        }
    }

    gainXp(amount) {
        this.xp += amount;
        if (this.xp >= this.xpNeeded) {
            this.levelUp();
        }
        this.game.updateUI();
    }

    levelUp() {
        this.xp -= this.xpNeeded;
        this.level++;
        this.xpNeeded = Math.floor(this.xpNeeded * 1.5);
        this.game.triggerLevelUp();
    }

    draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        // Player Ship (Triangle)
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, this.size);
        ctx.lineTo(-this.size, this.size);
        ctx.closePath();

        ctx.fillStyle = '#000';
        ctx.fill();
        ctx.lineWidth = 2;
        ctx.strokeStyle = this.color;
        ctx.stroke();

        // Neon Glow
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke();

        ctx.restore();
    }
}

window.Player = Player;
