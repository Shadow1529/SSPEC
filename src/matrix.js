// Canvas Matrix Rain Engine
export class MatrixRain {
    constructor(canvasElement) {
        this.canvas = canvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.interval = null;
        this.color = '#00ff00';
        this.speed = 33;
        this.chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789@#$%^&*()*&^%<>/\\{}[]';
        this.drops = [];
    }

    init() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.drops = Array(Math.floor(this.canvas.width / 16)).fill(1);
    }

    draw() {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.fillStyle = this.color;
        this.ctx.font = '15px monospace';

        for (let i = 0; i < this.drops.length; i++) {
            const text = this.chars.charAt(Math.floor(Math.random() * this.chars.length));
            this.ctx.fillText(text, i * 16, this.drops[i] * 16);
            if (this.drops[i] * 16 > this.canvas.height && Math.random() > 0.975) {
                this.drops[i] = 0;
            }
            this.drops[i]++;
        }
    }

    start(color = '#00ff00', speed = 33) {
        this.color = color;
        this.speed = speed;
        this.init();
        this.canvas.style.display = 'block';
        if (this.interval) clearInterval(this.interval);
        this.interval = setInterval(() => this.draw(), this.speed);
    }

    stop() {
        this.canvas.style.display = 'none';
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }
}