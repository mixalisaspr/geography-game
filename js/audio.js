// Ήχοι με Web Audio – χωρίς αρχεία. Ο ήχος ξεκινά μόνο μετά από άγγιγμα του χρήστη.

export class Sound {
  constructor() {
    this.ctx = null;
    this.muted = false;
    this.engine = null;
  }

  unlock() {
    if (this.ctx) {
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return;
    }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = this.muted ? 0 : 0.7;
    this.master.connect(this.ctx.destination);
  }

  setMuted(m) {
    this.muted = m;
    if (this.master) this.master.gain.value = m ? 0 : 0.7;
  }

  tone(freq, dur = 0.15, type = 'sine', vol = 0.25, delay = 0, slideTo = null) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime + delay;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(this.master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }

  noise(dur = 0.4, vol = 0.3, filter = 800, type = 'lowpass') {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const len = Math.floor(this.ctx.sampleRate * dur);
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const f = this.ctx.createBiquadFilter();
    f.type = type;
    f.frequency.value = filter;
    const g = this.ctx.createGain();
    g.gain.value = vol;
    src.connect(f).connect(g).connect(this.master);
    src.start(t);
  }

  pickup() {
    [523, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.18, 'triangle', 0.22, i * 0.07));
  }
  correct() {
    this.tone(660, 0.15, 'triangle', 0.25);
    this.tone(990, 0.3, 'triangle', 0.25, 0.12);
  }
  wrong() {
    this.tone(330, 0.2, 'square', 0.12);
    this.tone(220, 0.35, 'square', 0.12, 0.15);
  }
  explosion() {
    this.noise(1.1, 0.55, 500);
    this.noise(0.35, 0.3, 2500, 'bandpass');
    this.tone(120, 0.6, 'sine', 0.35, 0, 35);
    this.tone(90, 0.8, 'triangle', 0.25, 0.05, 30);
  }
  point() {
    this.tone(880, 0.1, 'triangle', 0.22);
    this.tone(1175, 0.12, 'triangle', 0.22, 0.08);
    this.tone(1568, 0.22, 'triangle', 0.22, 0.16);
  }
  splash() {
    this.noise(0.7, 0.35, 1200, 'bandpass');
  }
  checkpoint() {
    this.tone(880, 0.12, 'sine', 0.2);
    this.tone(1320, 0.25, 'sine', 0.18, 0.1);
  }
  finish() {
    [523, 659, 784, 659, 784, 1047].forEach((f, i) => this.tone(f, 0.22, 'triangle', 0.22, i * 0.11));
  }
  /** Νόμισμα: ο τόνος ανεβαίνει όσο τα μαζεύεις στη σειρά. */
  coin(chain = 0) {
    const f = 988 * 2 ** (Math.min(chain, 12) / 12);
    this.tone(f, 0.07, 'square', 0.07);
    this.tone(f * 1.5, 0.12, 'square', 0.06, 0.05);
  }
  gem() {
    [1319, 1568, 2093].forEach((f, i) => this.tone(f, 0.16, 'sine', 0.16, i * 0.06));
  }
  land(strength = 1) {
    this.noise(0.14, 0.12 + 0.12 * strength, 260);
  }
  perfect() {
    [784, 1047, 1319].forEach((f, i) => this.tone(f, 0.14, 'triangle', 0.16, i * 0.06));
  }
  click() {
    this.tone(700, 0.05, 'square', 0.06);
  }

  /** Ήχος μηχανής: καλείται κάθε frame. */
  engineUpdate(active, spin, gas) {
    if (!this.ctx) return;
    if (!this.engine && active) {
      const o1 = this.ctx.createOscillator();
      const o2 = this.ctx.createOscillator();
      const f = this.ctx.createBiquadFilter();
      const g = this.ctx.createGain();
      o1.type = 'sawtooth';
      o2.type = 'square';
      f.type = 'lowpass';
      f.frequency.value = 600;
      g.gain.value = 0;
      o1.connect(f);
      o2.connect(f);
      f.connect(g).connect(this.master);
      o1.start();
      o2.start();
      this.engine = { o1, o2, f, g };
    }
    if (!this.engine) return;
    const t = this.ctx.currentTime;
    const base = 48 + Math.abs(spin) * 3.2 + (gas ? 14 : 0);
    this.engine.o1.frequency.setTargetAtTime(base, t, 0.05);
    this.engine.o2.frequency.setTargetAtTime(base * 0.5, t, 0.05);
    this.engine.f.frequency.setTargetAtTime(400 + Math.abs(spin) * 25 + (gas ? 300 : 0), t, 0.05);
    this.engine.g.gain.setTargetAtTime(active ? (gas ? 0.07 : 0.035) : 0, t, 0.08);
  }
}
