# Neon Swarm: Overdrive

A high-performance HTML5 Canvas "Bullet Heaven" roguelike built with vanilla JavaScript.

## Features

- **The Satisfying Crunch**: Enemies have a chance to trigger a chain reaction explosion upon death, damaging nearby swarm members.
- **Visual Chaos**: Projectile colors shift and intensify as you level up. A custom Chromatic Aberration post-processing effect scales in intensity based on the size of the swarm on screen.
- **The Boss Vibe**: Survive for 60 seconds to face the Giant Glitch Boss.

## Controls

- **WASD** or **Arrow Keys**: Move your ship.
- **Mouse**: Click and drag to steer your ship toward the cursor.
- **Auto-Attack**: Your ship automatically fires at the nearest enemy every 1.0 second.

## How to Run Locally

Since this project uses pure HTML/JS/CSS without a bundler, you can run it using any simple local web server to avoid CORS issues from `file://` protocols (though it may run directly from the file system as well).

Using Python:
```bash
python3 -m http.server 8000
```
Then navigate to `http://localhost:8000` in your browser.

Using Node.js (`http-server`):
```bash
npx http-server
```

## Architecture

- **Vanilla JS (ES6 Classes)**: No external frameworks.
- **Object Pooling**: Pre-allocates enemies, projectiles, data cubes, and particles to maintain a stable 60fps even with hundreds of entities on screen.
- **Custom Post-Processing**: Fast `<canvas>` composition techniques are used for global visual effects like Chromatic Aberration.
