// Main Entry Point
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d', { alpha: false }); // Optimize for no transparency on base canvas

    // Instantiate game engine
    const game = new Game(canvas, ctx);

    // Also we need to ensure Input is initialized before we start doing heavy logic,
    // we'll hook Input to the canvas/window
    // Input.init(canvas); 

    game.init();
});
