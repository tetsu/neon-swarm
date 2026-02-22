class Pool {
    constructor(createFunc, initialSize = 100) {
        this.createFunc = createFunc;
        this.pool = [];
        this.active = [];

        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFunc());
        }
    }

    get() {
        let item;
        if (this.pool.length > 0) {
            item = this.pool.pop();
        } else {
            item = this.createFunc(); // Expand pool if needed
        }
        this.active.push(item);
        return item;
    }

    release(item) {
        const index = this.active.indexOf(item);
        if (index > -1) {
            this.active.splice(index, 1);
        }
        this.pool.push(item);
    }

    releaseAll() {
        while (this.active.length > 0) {
            const item = this.active.pop();
            this.pool.push(item);
        }
    }

    update(dt, ...args) {
        // Iterate backwards so we can remove items safely
        for (let i = this.active.length - 1; i >= 0; i--) {
            const item = this.active[i];
            if (item.active === false) {
                this.active.splice(i, 1);
                this.pool.push(item);
            } else {
                if (item.update) item.update(dt, ...args);
            }
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.active.length; i++) {
            if (this.active[i].draw) this.active[i].draw(ctx);
        }
    }
}

window.Pool = Pool;
