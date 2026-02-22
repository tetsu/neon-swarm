class Game {
    constructor(canvas, context) {
        this.canvas = canvas;
        this.ctx = context;

        // Game State Enum
        this.STATE = {
            MENU: 0,
            PLAYING: 1,
            UPGRADE_SELECT: 2,
            GAMEOVER: 3
        };

        this.currentState = this.STATE.MENU;
        this.lastTime = 0;
        this.frameId = null;

        this.score = 0;
        this.playTime = 0;

        // Entities & Pools
        this.player = new Player(this);
        this.enemies = new Pool(() => new Enemy(), 500);
        this.projectiles = new Pool(() => new Projectile(), 100);
        this.dataCubes = new Pool(() => new DataCube(), 200);
        this.particles = new Pool(() => new Particle(), 50);

        // Boss
        this.boss = new Boss();
        this.bossSpawned = false;

        // Effects
        this.postProcessor = new PostProcessor(canvas, context);

        // Spawning Logic
        this.spawnTimer = 0;
        this.spawnRate = 1.0; // Seconds between spawns

        this.loop = this.loop.bind(this);
    }

    init() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
        this.frameId = requestAnimationFrame(this.loop);
        this.bindUI();
    }

    bindUI() {
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('restart-btn').addEventListener('click', () => {
            document.getElementById('gameover-screen').classList.add('hidden');
            this.startGame();
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.postProcessor.resize();
    }

    startGame() {
        this.currentState = this.STATE.PLAYING;
        this.score = 0;
        this.playTime = 0;
        this.bossSpawned = false;

        this.player = new Player(this);
        this.enemies.releaseAll();
        this.projectiles.releaseAll();
        this.dataCubes.releaseAll();
        this.particles.releaseAll();
        this.boss.active = false;

        this.spawnRate = 1.0;

        document.getElementById('menu-screen').classList.add('hidden');
        document.getElementById('hud').classList.remove('hidden');
        this.updateUI();
    }

    triggerLevelUp() {
        this.currentState = this.STATE.UPGRADE_SELECT;

        // Show 3 upgrade options for normal level up
        this.showUpgrades(3);
    }

    triggerBossLoot() {
        this.currentState = this.STATE.UPGRADE_SELECT;

        // Create 3 upgrade options for boss kill
        this.showUpgrades(3);
    }

    getAvailableUpgrades() {
        return [
            { title: 'Rapid Fire', desc: 'Decrease attack cooldown', apply: () => { this.player.attackCooldown = Math.max(0.1, this.player.attackCooldown * 0.85); } },
            { title: 'Agility', desc: 'Increase movement speed', apply: () => { this.player.speed += 50; } },
            {
                title: 'Damage Up', desc: 'Increase projectile damage', apply: () => {
                    if (!this.player.damageMult) this.player.damageMult = 1;
                    this.player.damageMult += 0.5;
                }
            },
            {
                title: 'Piercing Rounds', desc: 'Projectiles pass through +1 enemy', apply: () => {
                    this.player.penetration += 1;
                }
            },
            {
                title: 'Multi-Shot', desc: 'Fire at +1 additional target simultaneously', apply: () => {
                    this.player.multiShot += 1;
                }
            },
            {
                title: 'Overclocked Lasers', desc: 'Massively increase projectile flight speed', apply: () => {
                    if (!this.gameProjSpeedMult) this.gameProjSpeedMult = 1;
                    this.gameProjSpeedMult *= 1.5;
                }
            }
        ];
    }

    showUpgrades(count) {
        document.getElementById('hud').classList.add('hidden');
        const screen = document.getElementById('upgrade-screen');
        screen.classList.remove('hidden');

        const container = document.getElementById('upgrade-options');
        container.innerHTML = '';

        // Get all available upgrades and shuffle them
        const availableUpgrades = this.getAvailableUpgrades();
        // Simple Fisher-Yates shuffle
        for (let i = availableUpgrades.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [availableUpgrades[i], availableUpgrades[j]] = [availableUpgrades[j], availableUpgrades[i]];
        }

        // Pick top 'count' upgrades (ensures no duplicates)
        const selectedUpgrades = availableUpgrades.slice(0, count);

        for (let i = 0; i < selectedUpgrades.length; i++) {
            const upg = selectedUpgrades[i];

            const card = document.createElement('div');
            card.className = 'upgrade-card';
            card.innerHTML = `<h3>${upg.title}</h3><p>${upg.desc}</p>`;

            card.addEventListener('click', () => {
                upg.apply();
                container.innerHTML = '';
                screen.classList.add('hidden');
                document.getElementById('hud').classList.remove('hidden');

                this.currentState = this.STATE.PLAYING;
            });

            container.appendChild(card);
        }
    }

    gameOver() {
        this.currentState = this.STATE.GAMEOVER;
        document.getElementById('hud').classList.add('hidden');
        document.getElementById('boss-hp-container').classList.add('hidden');
        document.getElementById('gameover-screen').classList.remove('hidden');
        document.getElementById('final-score').innerText = this.score;
        document.getElementById('final-level').innerText = this.player.level;
    }

    updateUI() {
        document.getElementById('score-val').innerText = this.score;
        document.getElementById('level-val').innerText = this.player.level;

        const xpPct = (this.player.xp / this.player.xpNeeded) * 100;
        document.getElementById('xp-bar-fill').style.width = xpPct + '%';

        // Pass damage mult to projectiles spawn if implemented there, or handle in projectile.
    }

    triggerExplosion(x, y, radius, damage) {
        // Visual
        const p = this.particles.get();
        p.spawn(x, y, radius, '#fff'); // White flash

        // AOE Damage
        const radSq = radius * radius;
        for (let i = 0; i < this.enemies.active.length; i++) {
            const enemy = this.enemies.active[i];
            const dx = enemy.x - x;
            const dy = enemy.y - y;
            if ((dx * dx + dy * dy) <= radSq) {
                enemy.takeDamage(damage);
            }
        }

        // Also damage boss if in range
        if (this.boss.active) {
            const dx = this.boss.x - x;
            const dy = this.boss.y - y;
            if ((dx * dx + dy * dy) <= radSq) {
                this.boss.takeDamage(damage);
            }
        }
    }

    spawnEnemy() {
        // Spawn at edges
        let x, y;
        if (Math.random() < 0.5) {
            x = Math.random() < 0.5 ? -10 : window.innerWidth + 10;
            y = Math.random() * window.innerHeight;
        } else {
            x = Math.random() * window.innerWidth;
            y = Math.random() < 0.5 ? -10 : window.innerHeight + 10;
        }

        const enemy = this.enemies.get();
        enemy.spawn(this, x, y);
    }

    loop(timestamp) {
        const dt = Math.min((timestamp - this.lastTime) / 1000 || 0, 0.1); // Cap dt
        this.lastTime = timestamp;

        this.update(dt);
        this.draw();

        this.frameId = requestAnimationFrame(this.loop);
    }

    update(dt) {
        if (this.currentState !== this.STATE.PLAYING) return;

        this.playTime += dt;

        // Update entities
        this.player.update(dt);
        this.projectiles.update(dt);
        this.enemies.update(dt);
        this.dataCubes.update(dt);
        this.particles.update(dt);

        if (this.boss.active) {
            this.boss.update(dt);
        }

        // Projectile modifiers
        for (let p of this.projectiles.active) {
            if (!p.modified) {
                if (this.player.damageMult) p.damage *= this.player.damageMult;
                if (this.gameProjSpeedMult) {
                    p.vx *= this.gameProjSpeedMult;
                    p.vy *= this.gameProjSpeedMult;
                }
                p.modified = true;
            }
        }

        // Spawn standard enemies
        this.spawnTimer += dt;
        if (this.spawnTimer >= this.spawnRate) {
            this.spawnTimer = 0;
            // Spawn multiple depending on time (scales MUCH slower now)
            const count = Math.floor(1 + (this.playTime / 60)); // Add just 1 extra enemy every 60 seconds
            for (let i = 0; i < count; i++) this.spawnEnemy();

            // Increase diff (drain spawn rate extremely slowly)
            this.spawnRate = Math.max(0.7, this.spawnRate - 0.001);
        }

        // Boss logic (60s feature set C)
        if (this.playTime >= 60 && !this.bossSpawned) {
            this.bossSpawned = true;
            // Spawn just off top of screen
            this.boss.spawn(this, window.innerWidth / 2, -50);
        }
    }

    draw() {
        if (this.currentState === this.STATE.MENU) return; // Keep menu clean

        // Draw to post processor offscreen canvas
        const ctx = this.postProcessor.begin();

        this.dataCubes.draw(ctx);
        this.enemies.draw(ctx);
        if (this.boss.active) this.boss.draw(ctx);
        this.player.draw(ctx);
        this.projectiles.draw(ctx);
        this.particles.draw(ctx);

        // Chromatic Aberration mapping to swarm size
        this.postProcessor.setIntensity(this.enemies.active.length);
        this.postProcessor.end(); // Draws to actual canvas
    }
}

window.Game = Game;
