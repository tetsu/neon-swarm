class Projectile {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.vx = 0;
        this.vy = 0;
        this.speed = 500;
        this.damage = 10;
        this.size = 4;
        this.target = null;
        this.game = null;
        this.penetration = 1;
        this.hitTargets = new Set(); // To avoid hitting tracking the same enemy multiple times in one frame
    }

    spawn(x, y, target, penetration = 1) {
        this.active = true;
        this.x = x;
        this.y = y;
        this.target = target;
        this.game = target.game;
        this.penetration = penetration;
        this.hitTargets.clear();
        this.modified = false; // Reset modification flag for damage boosters

        // Calculate velocity
        const dx = target.x - x;
        const dy = target.y - y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 0) {
            this.vx = (dx / dist) * this.speed;
            this.vy = (dy / dist) * this.speed;
        }
    }

    update(dt) {
        if (!this.active) return;

        this.x += this.vx * dt;
        this.y += this.vy * dt;

        // Collision with any active enemies (since it can pierce now, we check all close enough)
        if (this.game && this.game.enemies) {
            for (let i = 0; i < this.game.enemies.active.length; i++) {
                const enemy = this.game.enemies.active[i];
                if (this.hitTargets.has(enemy)) continue;

                const dx = enemy.x - this.x;
                const dy = enemy.y - this.y;
                const distSq = dx * dx + dy * dy;
                const hitDist = enemy.size + this.size;

                if (distSq < hitDist * hitDist) {
                    enemy.takeDamage(this.damage);
                    this.hitTargets.add(enemy);
                    this.penetration--;

                    if (this.penetration <= 0) {
                        this.active = false;
                        break;
                    }
                }
            }
        }

        // Off screen kill
        if (this.x < -50 || this.x > window.innerWidth + 50 ||
            this.y < -50 || this.y > window.innerHeight + 50) {
            this.active = false;
        }
    }

    draw(ctx) {
        if (!this.active) return;

        // Feature Set B: Dynamic Scaling of Color Saturation based on player level
        const level = this.game ? this.game.player.level : 1;
        // Base lightness 80%, saturation increases with level
        const saturation = Math.min(100, 50 + (level * 5));
        const color = `hsl(180, ${saturation}%, 60%)`; // Cyanish

        ctx.save();
        ctx.translate(this.x, this.y);

        ctx.beginPath();
        ctx.arc(0, 0, this.size, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();

        ctx.shadowBlur = 10 + (level); // Glow increases slightly
        ctx.shadowColor = color;
        ctx.fillStyle = color;
        ctx.fill();

        ctx.restore();
    }
}

window.Projectile = Projectile;
