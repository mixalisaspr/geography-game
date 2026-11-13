// Διαδικαστική δημιουργία πίστας. Καθαρή λογική (χωρίς DOM) ώστε να τρέχει και σε Node για τεστ.
// Συντεταγμένες: x προς τα δεξιά, y προς τα κάτω (όπως ο canvas). Το έδαφος είναι πολυγραμμή.

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashStr(s) {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const STEP = 14;

/**
 * @param {object} o
 * @param {string} o.seed
 * @param {number} o.difficulty 0..1
 * @param {string|null} o.water  'sea' | 'lake' | 'river' | null
 * @param {string[]} o.obstacles τύποι εμποδίων
 * @param {number} o.hills πολλαπλασιαστής λόφων
 */
export function generateTrack({ seed, difficulty = 0, water = null, obstacles = ['rock'], hills = 1, checkpointCount = 4 }) {
  const rnd = mulberry32(hashStr(seed));
  const R = (a, b) => a + (b - a) * rnd();
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const d = Math.max(0, Math.min(1, difficulty));
  const amp = (0.55 + 0.75 * d) * hills;

  const points = [];
  const obs = [];
  const gaps = [];
  const checkpoints = [];
  const jumps = [];
  let x = -600;
  let y = 0;

  const push = (nx, ny) => {
    points.push({ x: nx, y: ny });
    x = nx;
    y = ny;
  };
  const curve = (len, fn) => {
    const x0 = x;
    const y0 = y;
    const n = Math.max(1, Math.round(len / STEP));
    for (let i = 1; i <= n; i++) {
      const t = i / n;
      push(x0 + len * t, y0 + fn(t));
    }
  };
  const flat = (len) => curve(len, () => 0);

  const features = {
    rolling() {
      const len = R(500, 900);
      const a1 = R(18, 55) * amp * (rnd() < 0.5 ? 1 : -1);
      const a2 = R(5, 18) * amp;
      curve(len, (t) => -a1 * (1 - Math.cos(2 * Math.PI * t)) * 0.5 - a2 * (1 - Math.cos(6 * Math.PI * t)) * 0.5);
    },
    climb() {
      let dir = rnd() < 0.5 ? -1 : 1; // -1: ανηφόρα (y μικραίνει)
      if (y < -170) dir = 1;
      if (y > 140) dir = -1;
      const dh = R(70, 170) * amp * dir;
      // περιορισμός κλίσης ώστε να είναι πάντα ανεβαίνεται
      const maxSlope = 0.42 + 0.22 * d;
      const len = Math.max(R(380, 620), (Math.abs(dh) * Math.PI) / 2 / maxSlope);
      curve(len, (t) => dh * (1 - Math.cos(Math.PI * t)) * 0.5);
    },
    valley() {
      const a = R(45, 110) * amp;
      const len = Math.max(R(380, 600), a * 5.5);
      curve(len, (t) => a * (1 - Math.cos(2 * Math.PI * t)) * 0.5);
    },
    bumps() {
      const n = 3 + Math.floor(rnd() * (3 + 3 * d));
      const wl = R(70, 100);
      const a = R(8, 15) * (0.7 + 0.6 * d);
      curve(n * wl, (t) => -a * (1 - Math.cos(2 * Math.PI * n * t)) * 0.5);
    },
    kicker() {
      const useGap = water && rnd() < 0.55 + 0.35 * d;
      if (useGap) flat(260); // φόρα πριν από το άλμα
      jumps.push({ x: x - 220, rampX: x, water: useGap }); // πινακίδα προειδοποίησης πριν από τη ράμπα
      const h = R(26, 38) + 10 * d;
      const rampLen = R(110, 140);
      curve(rampLen, (t) => -h * t * t);
      const lipX = x;
      const lipY = y;
      const baseY = lipY + h;
      if (useGap) {
        // κενό με νερό: πήδα το!
        const w = R(55, 80) + 40 * d;
        const landY = lipY + R(22, 40);
        const waterY = Math.max(landY, baseY) + 28;
        const bottom = waterY + 380;
        push(lipX + 3, bottom);
        push(lipX + w - 3, bottom);
        push(lipX + w, landY);
        gaps.push({ x0: lipX, x1: lipX + w, waterY, bottom });
        // απαλή κατηφόρα προσγείωσης πίσω στο αρχικό ύψος
        const y0 = y;
        curve(300, (t) => (baseY - y0) * (1 - Math.cos(Math.PI * t)) * 0.5);
      } else {
        // «drop»: απότομη πτώση πίσω στο αρχικό επίπεδο, προσγείωση σε ίσιωμα
        push(lipX + 6, lipY + h * 0.35);
        push(lipX + 40, baseY);
        flat(120);
      }
    },
    obstacle() {
      const count = d > 0.35 && rnd() < 0.5 ? 2 : 1;
      flat(90);
      for (let i = 0; i < count; i++) {
        const type = pick(obstacles);
        const ox = x + 40;
        flat(200);
        obs.push(makeObstacle(type, ox, y, rnd));
      }
    },
  };

  const weights = [
    ['rolling', 3],
    ['climb', 2],
    ['valley', 1.4],
    ['bumps', 1 + d],
    ['kicker', 1.2 + d],
    ['obstacle', 2.6],
  ];
  const totalW = weights.reduce((s, w) => s + w[1], 0);
  let last = '';
  const pickFeature = () => {
    for (let tries = 0; tries < 5; tries++) {
      let r = rnd() * totalW;
      for (const [name, w] of weights) {
        r -= w;
        if (r <= 0) {
          if (name !== last || tries === 4) return name;
          break;
        }
      }
    }
    return 'rolling';
  };

  // Εκκίνηση
  push(x, y);
  flat(800); // x = 200
  const startX = 0;

  // μεγάλες πίστες: ~6.500–11.500 μονάδες (περίπου 30–50 δευτερόλεπτα οδήγησης)
  const length = 6500 + 5000 * d;
  const parts = checkpointCount + 1;
  const chunk = length / parts;
  for (let k = 0; k < parts; k++) {
    const end = x + chunk;
    let guaranteedJump = (k === 1 || k === 3) && water; // σε παραθαλάσσιες πόλεις υπάρχει σίγουρα ένα άλμα πάνω από νερό
    while (x < end) {
      let f = pickFeature();
      if (guaranteedJump) {
        f = 'kicker';
        guaranteedJump = false;
      }
      last = f;
      features[f]();
      flat(R(50, 110));
    }
    if (k < parts - 1) {
      // ίσιωμα με checkpoint στη μέση
      const cx = x + 140;
      flat(280);
      checkpoints.push(cx);
    }
  }
  flat(160);
  const finishX = x;
  // οι πινακίδες να μη «πέφτουν» πάνω στις σημαίες των checkpoints
  for (const j of jumps) {
    for (const cp of checkpoints) {
      if (Math.abs(j.x - cp) < 90) j.x = cp + 90 < j.rampX - 30 ? cp + 90 : cp - 90;
    }
  }
  flat(900);

  return {
    points,
    obstacles: obs,
    gaps,
    checkpoints,
    jumps,
    startX,
    finishX,
    endX: x,
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.filter((p) => !gaps.some((g) => p.x > g.x0 && p.x < g.x1)).map((p) => p.y)),
  };
}

// Κάθε εμπόδιο έχει "poly": πολυγραμμή από αριστερά προς τα δεξιά πάνω από την κορυφή του
// (έτσι οι κάθετες της είναι προς τα έξω), με άκρα πάνω στο έδαφος.
export function makeObstacle(type, x, baseY, rnd = Math.random) {
  const o = { type, x, y: baseY, seed: Math.floor(rnd() * 1e6) };
  // Στρογγυλό εμπόδιο πάνω σε μικρό ανάχωμα: η πολυγραμμή ξεκινά από το έδαφος, ανεβαίνει
  // εφαπτομενικά (~37°) στην έλλειψη, περνά από την κορυφή και κατεβαίνει συμμετρικά.
  const mound = (rx, ry, L) => {
    const cy = baseY - ry;
    // εφαπτομένη από το σημείο (-L, -ry) προς κύκλο ακτίνας ry (σε κλίμακα y), μετά τεντώνουμε σε x
    const D = Math.hypot(L, ry);
    const phi = Math.atan2(-ry, -L);
    const a0 = phi - Math.acos(ry / D) + 2 * Math.PI;
    const a1 = Math.PI - a0;
    const n = 10;
    const pts = [{ x: x - L * (rx / ry), y: baseY }];
    for (let i = 0; i <= n; i++) {
      const a = a0 + ((a1 - a0) * i) / n;
      pts.push({ x: x + rx * Math.cos(a), y: cy - ry * Math.sin(a) });
    }
    pts.push({ x: x + L * (rx / ry), y: baseY });
    o.moundL = L * (rx / ry);
    return pts;
  };
  switch (type) {
    case 'column': {
      // πεσμένος μαρμάρινος κίονας (ξαπλωμένος κύλινδρος)
      o.r = 12;
      o.poly = mound(12, 12, 36);
      break;
    }
    case 'barrel':
      o.r = 12;
      o.poly = mound(12, 12, 36);
      break;
    case 'log':
      o.r = 10;
      o.poly = mound(10, 10, 30);
      break;
    case 'hay':
      o.r = 14;
      o.poly = mound(14, 14, 42);
      break;
    case 'amphora': {
      // ξαπλωμένος αμφορέας
      o.rx = 24;
      o.ry = 10;
      o.poly = mound(24, 10, 30);
      break;
    }
    case 'rock': {
      const h = 14 + rnd() * 8;
      const w = 84 + rnd() * 20;
      o.h = h;
      o.w = w;
      o.poly = [
        { x: x - w / 2, y: baseY },
        { x: x - w * 0.16, y: baseY - h * 0.85 },
        { x: x + w * 0.04, y: baseY - h },
        { x: x + w * 0.22, y: baseY - h * 0.8 },
        { x: x + w / 2, y: baseY },
      ];
      break;
    }
    case 'crate':
    default: {
      // κιβώτιο με σανίδες-ράμπες μπροστά και πίσω
      o.type = 'crate';
      const s = 22;
      o.s = s;
      o.poly = [
        { x: x - s / 2 - 34, y: baseY },
        { x: x - s / 2, y: baseY - s },
        { x: x + s / 2, y: baseY - s },
        { x: x + s / 2 + 30, y: baseY },
      ];
      break;
    }
  }
  return o;
}
