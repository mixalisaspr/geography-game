// Βρόχος παιχνιδιού: τρέχει τη φυσική (LevelSim), ζωγραφίζει (Renderer) και στέλνει events στο UI.

import { LevelSim, autopilot } from './physics.js';
import { Renderer, shade } from './render.js';
import { trackForCity } from './levels.js';
import { COUNTRIES } from './data/countries.js';

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
      look: { helmet, jacket: shade(country.colors[1] === '#ffffff' ? '#1f2937' : country.colors[1], -0.1), bikeColor: '#f25c05' },
      checkpointLabels: [city.items[0].emoji, '❓', city.items[1].emoji],
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
        r.floatText(c.x, c.y - 40, 'Πλατς! 💦', '#bfe3ff');
        if (this.mode === 'play') this.sound.splash();
      } else {
        r.burst(sim.bike.p[2].x, sim.bike.p[2].y, '#ffd166', 10, 120, 0, ['⭐', '💫']);
        r.floatText(c.x, c.y - 50, 'Ωχ!', '#ffd166');
        if (this.mode === 'play') this.sound.crash();
      }
      if (this.mode === 'play') this.emit('crash', e.reason);
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
