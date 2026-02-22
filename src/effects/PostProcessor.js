class PostProcessor {
    constructor(canvas, ctx) {
        this.canvas = canvas;
        this.ctx = ctx;

        // Create an offscreen canvas for rendering the raw scene
        this.offCanvas = document.createElement('canvas');
        this.offCtx = this.offCanvas.getContext('2d', { alpha: false });
        this.resize();

        this.intensity = 0; // Chromatic aberration intensity
    }

    resize() {
        this.offCanvas.width = this.canvas.width;
        this.offCanvas.height = this.canvas.height;
    }

    setIntensity(enemyCount) {
        // More enemies = more intensity
        // Maxes out around 500 enemies
        this.intensity = Math.min(10, (enemyCount / 500) * 10);
    }

    begin() {
        // Clear offscreen
        this.offCtx.fillStyle = '#050505';
        this.offCtx.fillRect(0, 0, this.offCanvas.width, this.offCanvas.height);
        return this.offCtx; // Return context to draw onto
    }

    end() {
        // Fast compositing approach for chromatic aberration
        if (this.intensity < 0.5) {
            // No effect needed, draw direct
            this.ctx.drawImage(this.offCanvas, 0, 0);
            return;
        }

        // Clear main canvas
        this.ctx.fillStyle = '#050505';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Screen blend mode for additive colors
        this.ctx.globalCompositeOperation = 'screen';

        // Draw Red channel offset left
        this.ctx.drawImage(this.offCanvas, -this.intensity, 0);

        // Draw Blue channel offset right
        // We simulate RGB splitting using color matrix composites or just drawing the canvas with offsets
        // Standard Canvas API doesn't have direct color-channel masks without slow putImageData
        // But drawing the same canvas with slight opacity and offset gives a "glitchy" aberration 
        // effect that is very fast and achieves the "Visual Chaos" vibe.

        this.ctx.globalAlpha = 0.5;
        this.ctx.drawImage(this.offCanvas, this.intensity, 0);
        this.ctx.drawImage(this.offCanvas, 0, this.intensity);

        // Reset state
        this.ctx.globalAlpha = 1.0;
        this.ctx.globalCompositeOperation = 'source-over';
    }
}

window.PostProcessor = PostProcessor;
