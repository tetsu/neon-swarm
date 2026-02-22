# Neon Swarm: Overdrive

A high-performance HTML5 Canvas "Bullet Heaven" roguelike built with vanilla JavaScript.

![Live Demo](https://img.shields.io/badge/Play-Live_Demo-brightgreen?style=for-the-badge&logo=github)
**Play the game here:** [https://tetsu.github.io/neon-swarm](https://tetsu.github.io/neon-swarm)

[GitHub Repository](https://github.com/tetsu/neon-swarm)

## Features

- **The Satisfying Crunch**: Enemies have a chance to trigger a chain reaction explosion upon death, damaging nearby swarm members.
- **Visual Chaos**: Projectile colors shift and intensify as you level up. A custom Chromatic Aberration post-processing effect scales in intensity based on the size of the swarm on screen.
- **The Boss Vibe**: Survive for 60 seconds to face the Giant Glitch Boss.

## Controls

- **WASD** or **Arrow Keys**: Move your ship.
- **Mouse**: Click and drag to steer your ship toward the cursor.
- **Auto-Attack**: Your ship automatically fires at the nearest enemy every 1.0 second.

## How to Run Locally

You do not need any backend server, Python, or Node.js to run this game. Because all assets and scripts are standard browser-compatible JavaScript, you can run it purely locally!

1. Open the project folder.
2. Double-click **`index.html`** to open it in your default web browser (Chrome, Firefox, Safari, Edge).
3. The game will run instantly.

Using Node.js (`http-server`):
```bash
npx http-server
```

## Architecture

- **Vanilla JS (ES6 Classes)**: No external frameworks.
- **Object Pooling**: Pre-allocates enemies, projectiles, data cubes, and particles to maintain a stable 60fps even with hundreds of entities on screen.
- **Custom Post-Processing**: Fast `<canvas>` composition techniques are used for global visual effects like Chromatic Aberration.
