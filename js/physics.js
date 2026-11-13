// Απλή φυσική μηχανής με position-based dynamics:
// τρία σημεία (πίσω τροχός, μπροστινός τροχός, κεφάλι αναβάτη) δεμένα σε άκαμπτο τρίγωνο.
// Οι τροχοί έχουν δική τους περιστροφή και τριβή με το έδαφος. Αν το κεφάλι ακουμπήσει κάτι → πτώση.

export const CFG = {
  gravity: 760,
  wheelR: 14,
  headR: 9,
  wheelBase: 58,
  motorAcc: 140, // rad/s² στον πίσω τροχό
  maxSpin: 33, // rad/s  → ~460 μονάδες/s
  brakeK: 10,
  reverseSpin: -7,
  leanAir: 7,
  leanGround: 5,
  wheelieAssist: 20,
  maxAngVel: 4,
  airLeanDelay: 0.25,
  grip: 0.85,
  iterations: 5,
  dt: 1 / 120,
};

// Τοπικές θέσεις των σημείων (κέντρο ανάμεσα στους τροχούς, y προς τα κάτω)
const LOCAL = [
  { x: -CFG.wheelBase / 2, y: 0 },
  { x: CFG.wheelBase / 2, y: 0 },
  { x: -5, y: -48 },
];
const INV_MASS = [1, 1, 1.25];

function wrapAngle(a) {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

export class World {
  constructor(track) {
    this.track = track;
    this.B = 64;
    this.buckets = new Map();
    this.segs = [];
    this.stamp = 0;
    this.addPolyline(track.points);
    for (const o of track.obstacles) this.addPolyline(o.poly);
  }

  addPolyline(pts) {
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i];
      const b = pts[i + 1];
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 1e-6) continue;
      const seg = { ax: a.x, ay: a.y, bx: b.x, by: b.y, dx, dy, len2: len * len, nx: dy / len, ny: -dx / len, s: 0 };
      this.segs.push(seg);
      const b0 = Math.floor(Math.min(a.x, b.x) / this.B);
      const b1 = Math.floor(Math.max(a.x, b.x) / this.B);
      for (let k = b0; k <= b1; k++) {
        if (!this.buckets.has(k)) this.buckets.set(k, []);
        this.buckets.get(k).push(seg);
      }
    }
  }

  /** Σπρώχνει τον κύκλο (p, r) έξω από τα τμήματα. Επιστρέφει το (μη κανονικοποιημένο) άθροισμα κάθετων ή null. */
  collide(p, r) {
    const id = ++this.stamp;
    const b0 = Math.floor((p.x - r) / this.B);
    const b1 = Math.floor((p.x + r) / this.B);
    let hit = false;
    let sx = 0;
    let sy = 0;
    for (let k = b0; k <= b1; k++) {
      const list = this.buckets.get(k);
      if (!list) continue;
      for (const s of list) {
        if (s.s === id) continue;
        s.s = id;
        const rx = p.x - s.ax;
        const ry = p.y - s.ay;
        const t = (rx * s.dx + ry * s.dy) / s.len2;
        if (t >= 0 && t <= 1) {
          const dist = rx * s.nx + ry * s.ny;
          if (dist < r && dist > -r) {
            const push = r - dist;
            p.x += s.nx * push;
            p.y += s.ny * push;
            sx += s.nx;
            sy += s.ny;
            hit = true;
          }
        } else {
          const qx = t < 0 ? s.ax : s.bx;
          const qy = t < 0 ? s.ay : s.by;
          const ex = p.x - qx;
          const ey = p.y - qy;
          const d2 = ex * ex + ey * ey;
          if (d2 < r * r && d2 > 1e-9 && ex * s.nx + ey * s.ny > 0) {
            const dd = Math.sqrt(d2);
            const push = r - dd;
            p.x += (ex / dd) * push;
            p.y += (ey / dd) * push;
            sx += ex / dd;
            sy += ey / dd;
            hit = true;
          }
        }
      }
    }
    return hit ? { x: sx, y: sy } : null;
  }

  /** Ύψος εδάφους (y) στο x – δυαδική αναζήτηση στην πολυγραμμή. */
  groundY(x) {
    const pts = this.track.points;
    let lo = 0;
    let hi = pts.length - 1;
    if (x <= pts[0].x) return pts[0].y;
    if (x >= pts[hi].x) return pts[hi].y;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (pts[mid].x <= x) lo = mid;
      else hi = mid;
    }
    const a = pts[lo];
    const b = pts[hi];
    const t = (x - a.x) / (b.x - a.x || 1);
    return a.y + (b.y - a.y) * t;
  }

  /** Ψηλότερο σημείο (εδάφους ή εμποδίου) στο x – για τοποθέτηση της μηχανής. */
  surfaceY(x) {
    let y = this.groundY(x);
    for (const o of this.track.obstacles) {
      const pts = o.poly;
      if (x < pts[0].x || x > pts[pts.length - 1].x) continue;
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i];
        const b = pts[i + 1];
        if ((x - a.x) * (x - b.x) <= 0 && a.x !== b.x) {
          y = Math.min(y, a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x));
        }
      }
    }
    return y;
  }

  gapAt(x) {
    for (const g of this.track.gaps) if (x > g.x0 && x < g.x1) return g;
    return null;
  }
}

export class Bike {
  constructor() {
    this.p = LOCAL.map(() => ({ x: 0, y: 0, vx: 0, vy: 0, px: 0, py: 0 }));
    this.spin = [0, 0];
    this.wheelAngle = [0, 0];
    this.contact = [null, null];
    this.headHit = false;
    this.lastAirTime = 0;
    this.airTime = 0;
  }

  place(x, groundY, angle = 0) {
    const cy = groundY - CFG.wheelR - 0.5;
    const c = Math.cos(angle);
    const s = Math.sin(angle);
    this.p.forEach((pt, i) => {
      const l = LOCAL[i];
      pt.x = x + l.x * c - l.y * s;
      pt.y = cy + l.x * s + l.y * c;
      pt.vx = pt.vy = 0;
    });
    this.spin = [0, 0];
    this.contact = [null, null];
    this.headHit = false;
    this.airTime = 0;
  }

  get angle() {
    const [r, f] = this.p;
    return Math.atan2(f.y - r.y, f.x - r.x);
  }
  get center() {
    const [r, f] = this.p;
    return { x: (r.x + f.x) / 2, y: (r.y + f.y) / 2 };
  }
  get velocity() {
    const [r, f] = this.p;
    return { x: (r.vx + f.vx) / 2, y: (r.vy + f.vy) / 2 };
  }
  get grounded() {
    return !!(this.contact[0] || this.contact[1]);
  }

  angularVelocity() {
    let cx = 0;
    let cy = 0;
    for (const p of this.p) {
      cx += p.x;
      cy += p.y;
    }
    cx /= 3;
    cy /= 3;
    let num = 0;
    let den = 0;
    for (const p of this.p) {
      const rx = p.x - cx;
      const ry = p.y - cy;
      num += rx * p.vy - ry * p.vx;
      den += rx * rx + ry * ry;
    }
    return den > 0 ? num / den : 0;
  }

  /** input: { gas: bool, brake: bool }. Επιστρέφει true αν το κεφάλι χτύπησε. */
  step(dt, input, world, alive = true) {
    const P = this.p;
    const gas = alive && input.gas;
    const brake = alive && input.brake;
    const grounded = this.grounded;

    // βαρύτητα + λίγη αντίσταση αέρα
    for (const p of P) {
      p.vy += CFG.gravity * dt;
      p.vx *= 1 - 0.04 * dt;
      p.vy *= 1 - 0.04 * dt;
    }

    // κλίση: γκάζι → μύτη πάνω, φρένο → μύτη κάτω (κυρίως στον αέρα)
    const lean = (gas ? -1 : 0) + (brake ? 1 : 0);
    // στα μικρά «πηδηματάκια» δεν γέρνουμε αμέσως – μόνο σε πραγματικά άλματα
    const inAir = !grounded && this.airTime > CFG.airLeanDelay;
    let alpha = 0;
    if (grounded) {
      // γωνία ως προς την κλίση του εδάφους (αρνητική = μύτη πάνω)
      const n = this.contact[0] || this.contact[1];
      const rel = wrapAngle(this.angle - Math.atan2(n.x, -n.y));
      if (gas) alpha -= CFG.leanGround * Math.max(0, Math.min(1, 1 + rel / 0.35));
      if (brake) alpha += CFG.leanGround;
      // υποβοήθηση: αν η σούζα πάει να γίνει ανατροπή, κατεβάζουμε απαλά τη μύτη
      if (alive && rel < -0.4) alpha += CFG.wheelieAssist * Math.min(1, (-rel - 0.4) / 0.3);
    } else if (inAir) {
      alpha = lean * CFG.leanAir;
    }
    if (alpha !== 0) {
      const w = this.angularVelocity();
      if (!(Math.sign(w) === Math.sign(alpha) && Math.abs(w) > CFG.maxAngVel)) {
        let cx = 0;
        let cy = 0;
        for (const p of P) {
          cx += p.x;
          cy += p.y;
        }
        cx /= 3;
        cy /= 3;
        for (const p of P) {
          p.vx += -(p.y - cy) * alpha * dt;
          p.vy += (p.x - cx) * alpha * dt;
        }
      }
    }
    if (lean === 0 && !grounded) {
      // ελαφριά απόσβεση περιστροφής στον αέρα για πιο «φιλική» αίσθηση
      const w = this.angularVelocity();
      const damp = -w * 1.2 * dt;
      let cx = 0;
      let cy = 0;
      for (const p of P) {
        cx += p.x;
        cy += p.y;
      }
      cx /= 3;
      cy /= 3;
      for (const p of P) {
        p.vx += -(p.y - cy) * damp;
        p.vy += (p.x - cx) * damp;
      }
    }

    // μοτέρ / φρένο στις περιστροφές των τροχών
    if (gas) {
      this.spin[0] = Math.min(CFG.maxSpin, this.spin[0] + CFG.motorAcc * dt);
    } else {
      this.spin[0] *= 1 - 0.25 * dt;
    }
    if (brake) {
      const fwd = this.forwardSpeed();
      if (fwd > 25) {
        const k = Math.max(0, 1 - CFG.brakeK * dt);
        this.spin[0] *= k;
        this.spin[1] *= k;
      } else {
        this.spin[0] = Math.max(CFG.reverseSpin, this.spin[0] - 30 * dt);
      }
    }
    this.spin[1] *= 1 - 0.1 * dt;

    // πρόβλεψη θέσεων
    for (const p of P) {
      p.px = p.x;
      p.py = p.y;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }

    const n0 = [null, null];
    let headHit = false;
    for (let it = 0; it < CFG.iterations; it++) {
      this.solveConstraints();
      for (let i = 0; i < 2; i++) {
        const n = world.collide(P[i], CFG.wheelR);
        if (n) n0[i] = n0[i] ? { x: n0[i].x + n.x, y: n0[i].y + n.y } : n;
      }
      if (world.collide(P[2], CFG.headR)) headHit = true;
    }
    this.solveConstraints();

    // ταχύτητες από τις θέσεις
    for (const p of P) {
      p.vx = (p.x - p.px) / dt;
      p.vy = (p.y - p.py) / dt;
    }

    // τριβή τροχών ↔ έδαφος
    for (let i = 0; i < 2; i++) {
      const n = n0[i];
      if (!n) {
        this.contact[i] = null;
        continue;
      }
      const l = Math.hypot(n.x, n.y) || 1;
      const nx = n.x / l;
      const ny = n.y / l;
      this.contact[i] = { x: nx, y: ny };
      const p = P[i];
      const tx = -ny;
      const ty = nx;
      const vn = p.vx * nx + p.vy * ny;
      if (vn < 0) {
        p.vx -= nx * vn;
        p.vy -= ny * vn;
      }
      const vt = p.vx * tx + p.vy * ty;
      const slip = this.spin[i] * CFG.wheelR - vt;
      const J = (slip / 3) * CFG.grip;
      p.vx += tx * J;
      p.vy += ty * J;
      this.spin[i] -= (2 * J) / CFG.wheelR;
    }

    for (let i = 0; i < 2; i++) this.wheelAngle[i] += this.spin[i] * dt;

    if (this.grounded) {
      if (this.airTime > 0) this.lastAirTime = this.airTime;
      this.airTime = 0;
    } else this.airTime += dt;

    this.headHit = headHit;
    return headHit;
  }

  forwardSpeed() {
    const a = this.angle;
    const v = this.velocity;
    return v.x * Math.cos(a) + v.y * Math.sin(a);
  }

  solveConstraints() {
    const P = this.p;
    for (const [i, j] of [
      [0, 1],
      [0, 2],
      [1, 2],
    ]) {
      const a = P[i];
      const b = P[j];
      const rest = Math.hypot(LOCAL[j].x - LOCAL[i].x, LOCAL[j].y - LOCAL[i].y);
      const dx = b.x - a.x;
      const dy = b.y - a.y;
      const d = Math.hypot(dx, dy) || 1e-6;
      const diff = (d - rest) / d;
      const wa = INV_MASS[i];
      const wb = INV_MASS[j];
      const k = diff / (wa + wb);
      a.x += dx * k * wa;
      a.y += dy * k * wa;
      b.x -= dx * k * wb;
      b.y -= dy * k * wb;
    }
  }
}

/**
 * Η λογική μιας πίστας: μηχανή, checkpoints, τερματισμός, πτώσεις, επαναφορά.
 * Δεν ξέρει τίποτα για οθόνη – το game.js τη ζωγραφίζει και αντιδρά στα events.
 */
export class LevelSim {
  constructor(track) {
    this.track = track;
    this.world = new World(track);
    this.bike = new Bike();
    this.reached = -1; // τελευταίο checkpoint που περάσαμε
    this.state = 'running'; // running | crashed | finished
    this.time = 0;
    this.crashes = 0;
    this.crashTimer = 0;
    this.crashReason = null;
    this.acc = 0;
    this.respawn(track.startX);
  }

  respawn(x) {
    const gy = this.world.surfaceY(x);
    this.bike.place(x, gy, 0);
    // μικρή ώθηση ώστε η μηχανή να «κάτσει» στο έδαφος
    this.state = 'running';
  }

  respawnX() {
    return this.reached >= 0 ? this.track.checkpoints[this.reached] : this.track.startX;
  }

  get progress() {
    const c = this.bike.center.x;
    return Math.max(0, Math.min(1, (c - this.track.startX) / (this.track.finishX - this.track.startX)));
  }

  /** Προχωράει τον χρόνο. Επιστρέφει λίστα με events. */
  update(frameDt, input) {
    const events = [];
    this.acc += Math.min(frameDt, 0.1);
    while (this.acc >= CFG.dt) {
      this.acc -= CFG.dt;
      this.fixedStep(input, events);
      if (events.some((e) => e.type === 'checkpoint' || e.type === 'finish')) {
        this.acc = 0;
        break;
      }
    }
    return events;
  }

  fixedStep(input, events) {
    const dt = CFG.dt;
    const bike = this.bike;
    if (this.state === 'finished') {
      bike.step(dt, { gas: false, brake: true }, this.world, true);
      return;
    }
    const alive = this.state === 'running';
    if (alive) this.time += dt;
    const hit = bike.step(dt, input, this.world, alive);

    if (this.state === 'running') {
      let reason = null;
      if (hit) reason = 'head';
      else {
        for (const p of bike.p) {
          const g = this.world.gapAt(p.x);
          if (g && p.y > g.waterY + 4) {
            reason = 'water';
            break;
          }
        }
        if (!reason && bike.center.y > this.track.maxY + 900) reason = 'fall';
      }
      if (reason) {
        this.state = 'crashed';
        this.crashReason = reason;
        this.crashTimer = reason === 'water' ? 1.4 : 1.8;
        this.crashes++;
        events.push({ type: 'crash', reason });
        return;
      }
      const cx = bike.center.x;
      const next = this.reached + 1;
      if (next < this.track.checkpoints.length && cx >= this.track.checkpoints[next]) {
        this.reached = next;
        events.push({ type: 'checkpoint', index: next });
      } else if (cx >= this.track.finishX) {
        this.state = 'finished';
        events.push({ type: 'finish' });
      }
    } else if (this.state === 'crashed') {
      this.crashTimer -= dt;
      if (this.crashTimer <= 0) {
        this.respawn(this.respawnX());
        events.push({ type: 'respawn' });
      }
    }
  }
}

/** Απλός «αυτόματος πιλότος» – χρησιμοποιείται σε τεστ και στο demo της αρχικής οθόνης. */
export function autopilot(bike) {
  const a = bike.angle; // < 0 : μύτη πάνω
  if (!bike.grounded) {
    if (a < -0.3) return { gas: false, brake: true };
    if (a > 0.3) return { gas: true, brake: false };
    return { gas: false, brake: false };
  }
  if (a < -0.55) return { gas: false, brake: false };
  return { gas: true, brake: false };
}
