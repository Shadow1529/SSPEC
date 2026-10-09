// Web Audio API Synthesizer Engine
export class SoundEngine {
    constructor() {
        this.ctx = null;
        this.enabled = true;
    }

    init() {
        if (!this.ctx) {
            const AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) this.ctx = new AudioCtx();
        }
    }

    playTone(frequency, type, duration, volume = 0.05) {
        if (!this.enabled) return;
        this.init();
        if (!this.ctx) return;

        try {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = type;
            osc.frequency.setValueAtTime(frequency, this.ctx.currentTime);
            gain.gain.setValueAtTime(volume, this.ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration);

            osc.connect(gain);
            gain.connect(this.ctx.destination);
            osc.start();
            osc.stop(this.ctx.currentTime + duration);
        } catch (e) {}
    }

    keyClick() { this.playTone(800 + Math.random() * 200, 'square', 0.015, 0.02); }
    enter() { this.playTone(400, 'sine', 0.08, 0.04); }
    error() { this.playTone(150, 'sawtooth', 0.2, 0.08); }
    streamTick() { this.playTone(1200 + Math.random() * 400, 'sine', 0.01, 0.01); }
    alert() {
        this.playTone(880, 'square', 0.1, 0.08);
        setTimeout(() => this.playTone(440, 'square', 0.15, 0.08), 100);
    }
}

export const audio = new SoundEngine();