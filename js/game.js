// Βρόχος παιχνιδιού: τρέχει τη φυσική (LevelSim), ζωγραφίζει (Renderer) και στέλνει events στο UI.

import { LevelSim, autopilot } from './physics.js';
import { Renderer } from './render.js';
import { trackForCity } from './levels.js';
import { COUNTRIES, cityDifficulty } from './data/countries.js';
import { RIDER_SCORE, flipBase, trickPoints } from './progress.js';

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
    this.coinChain = 0;
    this.lastCoinAt = -9;
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
      rider: track.style === 'rider',
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
      this.lastMult = 0;
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
        r.floatText(c.x + 50, c.y - 30, sim.rider ? `−${RIDER_SCORE.crash}` : '−1', '#ff6b6b', 30);
        this.emit('crash', e.reason);
      }
    } else if (e.type === 'flip') {
      if (this.mode === 'play') {
        const kind = e.count === 2 ? 'Διπλή τούμπα' : e.count === 3 ? 'Τριπλή τούμπα' : e.count > 3 ? `${e.count}× τούμπα` : 'Τούμπα';
        const name = `${kind} ${e.dir === 'front' ? 'μπροστά' : 'πίσω'}`;
        const pts = trickPoints(flipBase(e.count), e.mult);
        r.floatText(c.x, c.y - 80, `🔄 ${name}! +${pts}`, '#fde047', e.count > 1 ? 34 : 28);
        if (e.count > 1) r.burst(c.x, c.y - 30, '#fde047', 26, 260, 200, ['⭐', '🔄', '✨']);
        this.comboFx(e.mult, c);
        this.sound.tone(660, 0.1, 'square', 0.1);
        this.sound.tone(990, 0.14, 'square', 0.1, 0.09);
        this.emit('flip', e.count, pts, e.mult);
      }
    } else if (e.type === 'perfect') {
      if (this.mode === 'play') {
        const pts = trickPoints(RIDER_SCORE.perfect, e.mult);
        r.floatText(c.x, c.y - 56, `✨ Τέλεια προσγείωση! +${pts}`, '#a7f3d0', 22);
        r.burst(c.x, c.y + 10, '#a7f3d0', 10, 160, 200);
        this.comboFx(e.mult, c);
        this.sound.perfect();
        this.emit('perfect', pts, e.mult);
      }
    } else if (e.type === 'land') {
      const k = Math.min(1, e.air / 1.5);
      r.dust(c.x, sim.bike.p[0].y + 14, 6 + Math.round(10 * k));
      r.shake = Math.max(r.shake, 0.15 + 0.3 * k);
      if (this.mode === 'play') this.sound.land(k);
    } else if (e.type === 'pickup') {
      const gem = e.kind === 'gem';
      r.burst(e.x, e.y, gem ? '#7dd3fc' : '#fde047', gem ? 12 : 5, gem ? 200 : 110, 200);
      if (this.mode === 'play') {
        if (gem) {
          r.floatText(e.x, e.y - 24, `💎 +${RIDER_SCORE.gem}`, '#bae6fd', 22);
          this.sound.gem();
        } else {
          this.coinChain = sim.time - this.lastCoinAt < 1.2 ? this.coinChain + 1 : 0;
          this.lastCoinAt = sim.time;
          this.sound.coin(this.coinChain);
        }
        this.emit('pickup', e.kind);
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

  /** Ο πολλαπλασιαστής ανέβηκε: δείξ' το πάνω από τη μηχανή. */
  comboFx(mult, c) {
    if (mult < 2 || mult === this.lastMult) {
      this.lastMult = mult;
      return;
    }
    this.lastMult = mult;
    this.renderer.floatText(c.x, c.y - 112, `🔥 Σερί x${mult}!`, '#fb923c', 24);
  }

  stats() {
    const s = this.sim;
    return { time: s.time, crashes: s.crashes };
  }
}
