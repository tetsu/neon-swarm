class Particle {
    constructor() {
        this.active = false;
        this.x = 0;
        this.y = 0;
        this.radius = 0;
        this.maxRadius = 50;
        this.lifetime = 0;
        this.maxLifetime = 0.3; // 300ms
        this.color = '#fff';
    }

    spawn(x, y, maxRadius = 50, color = '#fff') {
        this.active = true;
        this.x = x;
        this.y = y;
        this.maxRadius = maxRadius;
        this.radius = 0;
        this.lifetime = 0;
        this.color = color;
    }

    update(dt) {
        if (!this.active) return;

        this.lifetime += dt;
        if (this.lifetime >= this.maxLifetime) {
            this.active = false;
            return;
        }

        // Ease out quad expansion
        const t = this.lifetime / this.maxLifetime;
        this.radius = this.maxRadius * (1 - (1 - t) * (1 - t));
    }

    draw(ctx) {
        if (!this.active) return;

        const alpha = 1 - (this.lifetime / this.maxLifetime);

        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);

        ctx.fillStyle = `rgba(255, 255, 255, ${alpha * 0.5})`;
        ctx.fill();

        ctx.lineWidth = 2;
        ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.stroke();

        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.stroke();
        ctx.restore();
    }
}

window.Particle = Particle;
