// Βρόχος παιχνιδιού: τρέχει τη φυσική (LevelSim), ζωγραφίζει (Renderer) και στέλνει events στο UI.

import { LevelSim, autopilot } from './physics.js';
import { Renderer } from './render.js';
import { trackForCity } from './levels.js';
import { COUNTRIES, cityDifficulty } from './data/countries.js';

export class Game {
  constructor(canvas, sound) {
    this.renderer = new Renderer(canvas);
    this.sound = sound;
    this.input = { gas: false, brake: false };
    this.mode = 'idle'; // idle | demo | play
    this.paused = false;
    this.sim = null;
    this.city = null;
    this.handlers = {};
    this.finishTimer = 0;
    this.last = performance.now();
    window.addEventListener('resize', () => this.renderer.resize());
    requestAnimationFrame(this.frame);
  }

  on(name, fn) {
    this.handlers[name] = fn;
  }
  emit(name, ...args) {
    this.handlers[name]?.(...args);
  }

  load(city, mode = 'play') {
    const country = COUNTRIES[city.countryId];
    const track = trackForCity(city);
    this.city = city;
    this.country = country;
    this.sim = new LevelSim(track);
    this.mode = mode;
    this.paused = false;
    this.finishTimer = 0;
    this.input.gas = this.input.brake = false;
    const helmet = country.colors[0].toLowerCase() === '#ffffff' ? country.colors[1] : country.colors[0];
    this.renderer.setLevel({
      track,
      theme: city.theme,
      country,
      city,
      look: { helmet, jacket: '#1f3b63', bikeColor: '#f25c05' },
      checkpointLabels: [city.items[0].emoji, '📖', city.items[1].emoji, '📖'],
      showTips: cityDifficulty(city) < 0.2, // στην Ελλάδα οι πινακίδες λένε και τι να κάνεις
    });
    this.renderer.snapCamera(this.sim.bike);
  }

  stop() {
    this.mode = 'idle';
    this.sound.engineUpdate(false, 0, false);
  }

  pause() {
    this.paused = true;
    this.input.gas = this.input.brake = false;
  }
  resume() {
    this.paused = false;
    this.last = performance.now();
  }

  restartFromStart() {
    if (this.city) this.load(this.city, 'play');
  }

  frame = (now) => {
    requestAnimationFrame(this.frame);
    const dt = Math.min(0.05, (now - this.last) / 1000);
    this.last = now;
    if (this.mode === 'idle' || !this.sim) return;
    const sim = this.sim;
    const r = this.renderer;

    let input = this.input;
    if (this.mode === 'demo') input = autopilot(sim.bike);

    if (!this.paused) {
      const events = sim.update(dt, input);
      for (const e of events) this.handleEvent(e);
      if (this.mode === 'play' && sim.state === 'finished' && this.finishTimer > 0) {
        this.finishTimer -= dt;
        if (this.finishTimer <= 0) this.emit('finish', this.stats());
      }
      r.update(dt, sim, input);
    }
    r.draw(sim);
    const active = this.mode === 'play' && !this.paused && sim.state === 'running';
    this.sound.engineUpdate(active, sim.bike.spin[0], input.gas);
    if (this.mode === 'play') this.emit('progress', sim.progress, sim);
  };

  handleEvent(e) {
    const sim = this.sim;
    const r = this.renderer;
    const c = sim.bike.center;
    if (e.type === 'crash') {
      r.shake = 0.6;
      if (e.reason === 'water') {
        r.burst(c.x, sim.world.gapAt(c.x)?.waterY ?? c.y, '#cfe9ff', 30, 260, 500);
        r.floatText(c.x, c.y - 60, 'Πλατς! 💦', '#bfe3ff', 30);
        if (this.mode === 'play') this.sound.splash();
      } else {
        r.explode(c.x, c.y - 14, sim.bike);
        r.floatText(c.x, c.y - 70, 'ΜΠΟΥΜ! 💥', '#ffd166', 34);
        if (this.mode === 'play') this.sound.explosion();
      }
      if (this.mode === 'play') {
        r.floatText(c.x + 50, c.y - 30, '−1', '#ff6b6b', 30);
        this.emit('crash', e.reason);
      }
    } else if (e.type === 'savepoint') {
      r.floatText(e.x, sim.world.groundY(e.x) - 70, '✔ Σημείο επαναφοράς', '#bbf7d0', 16);
      if (this.mode === 'play') this.sound.tone(990, 0.12, 'sine', 0.12);
    } else if (e.type === 'respawn') {
      r.floatText(c.x, c.y - 60, 'Ξανά!', '#ffffff');
    } else if (e.type === 'checkpoint') {
      const x = sim.track.checkpoints[e.index];
      const gy = sim.world.groundY(x);
      const label = r.level.checkpointLabels[e.index];
      r.burst(x, gy - 130, '#fff', 14, 200, 120, [label, '✨']);
      if (this.mode === 'play') {
        this.sound.checkpoint();
        this.pause();
        this.emit('checkpoint', e.index);
      }
    } else if (e.type === 'finish') {
      const x = sim.track.finishX;
      r.burst(x + 48, sim.world.groundY(x) - 130, '#facc15', 30, 260, 150, ['🎉', '⭐', '🏁']);
      if (this.mode === 'play') {
        this.sound.finish();
        this.finishTimer = 1.2;
      } else {
        // στο demo ξεκινάμε ξανά
        setTimeout(() => this.mode === 'demo' && this.load(this.city, 'demo'), 1500);
      }
    }
  }

  stats() {
    const s = this.sim;
    return { time: s.time, crashes: s.crashes };
  }
}
