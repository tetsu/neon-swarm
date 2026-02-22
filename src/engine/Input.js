class InputManager {
    constructor() {
        this.keys = {
            w: false,
            a: false,
            s: false,
            d: false,
            ArrowUp: false,
            ArrowLeft: false,
            ArrowDown: false,
            ArrowRight: false
        };

        this.mouse = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            isDown: false
        };

        this._bindEvents();
    }

    _bindEvents() {
        window.addEventListener('keydown', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = true;
            }
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = true;
            }
        });

        window.addEventListener('keyup', (e) => {
            if (this.keys.hasOwnProperty(e.key.toLowerCase())) {
                this.keys[e.key.toLowerCase()] = false;
            }
            if (this.keys.hasOwnProperty(e.key)) {
                this.keys[e.key] = false;
            }
        });

        window.addEventListener('mousemove', (e) => {
            this.mouse.x = e.clientX;
            this.mouse.y = e.clientY;
        });

        window.addEventListener('mousedown', (e) => {
            this.mouse.isDown = true;
        });

        window.addEventListener('mouseup', (e) => {
            this.mouse.isDown = false;
        });
    }

    getAxis() {
        let x = 0;
        let y = 0;

        if (this.keys.a || this.keys.ArrowLeft) x -= 1;
        if (this.keys.d || this.keys.ArrowRight) x += 1;
        if (this.keys.w || this.keys.ArrowUp) y -= 1;
        if (this.keys.s || this.keys.ArrowDown) y += 1;

        // Normalize
        if (x !== 0 && y !== 0) {
            const length = Math.sqrt(x * x + y * y);
            x /= length;
            y /= length;
        }

        return { x, y };
    }
}

const Input = new InputManager(); // Singleton
window.Input = Input;
