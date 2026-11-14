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
// τελική ταχύτητα της μηχανής στη «rider» πίστα (για το πλάτος των γκρεμών)
const RIDER_TOP = 560;

/**
 * @param {object} o
 * @param {string} o.seed
 * @param {number} o.difficulty 0..1
 * @param {string|null} o.water  'sea' | 'lake' | 'river' | null
 * @param {string[]} o.obstacles τύποι εμποδίων
 * @param {number} o.hills πολλαπλασιαστής λόφων
 */
export function generateTrack({ seed, difficulty = 0, water = null, obstacles = ['rock'], hills = 1, checkpointCount = 4, style = 'classic' }) {
  // style 'rider': πολύ πιο δύσκολη πίστα με μεγάλα άλματα πάνω από γκρεμούς, ψηλές πτώσεις,
  // τραπέζια και μεγάλα εμπόδια (προς το παρόν μόνο στην Αθήνα)
  const rider = style === 'rider';
  const rnd = mulberry32(hashStr(seed));
  const R = (a, b) => a + (b - a) * rnd();
  const pick = (arr) => arr[Math.floor(rnd() * arr.length)];
  const d = Math.max(0, Math.min(1, difficulty));
  // στις rider πίστες η μηχανή τρέχει πιο γρήγορα: πιο ομαλοί λόφοι, αλλιώς σε πετάνε σε κάθε κορυφή
  const amp = rider ? Math.min(1.05, (0.55 + 0.5 * d) * hills) : (0.55 + 0.75 * d) * hills;

  const points = [];
  const obs = [];
  const gaps = [];
  const checkpoints = [];
  const jumps = [];
  const savepoints = [];
  const spans = []; // ποιο κομμάτι πίστας είναι πού (για αποσφαλμάτωση/τεστ)
  const SAVE_EVERY = rider ? 3600 : 1200; // σημεία επαναφοράς (χωρίς popup) ανάμεσα στα checkpoints
  let lastSave = 0;
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
  // σημαιάκι επαναφοράς, αν έχουμε προχωρήσει αρκετά από το προηγούμενο
  const maybeSave = () => {
    if (x - lastSave <= SAVE_EVERY) return;
    flat(80);
    savepoints.push(x);
    lastSave = x;
    flat(80);
  };

  const features = {
    rolling() {
      const len = rider ? R(800, 1300) : R(500, 900);
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
      const wl = R(95, 130);
      const a = R(6, 11) * (0.7 + 0.5 * d); // ομαλά, ώστε ο τροχός να μη «σφηνώνει» στις γούβες
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
      // σειρά από εμπόδια (2–5, περισσότερα στις δύσκολες πόλεις)
      const count = 2 + Math.floor(rnd() * (2 + 2 * d));
      flat(90);
      for (let i = 0; i < count; i++) {
        // το κιβώτιο είναι μικρή ράμπα: μόνο πρώτο στη σειρά, ώστε να μην προσγειώνεσαι πάνω του
        let type = pick(obstacles);
        if (type === 'crate' && i > 0) type = obstacles.find((t) => t !== 'crate') || 'rock';
        const ox = x + 40;
        const k = rider ? R(1.5, 2.1) : 1;
        flat((type === 'crate' ? R(300, 360) : R(230, 300)) * (rider ? 1.35 : 1));
        obs.push(makeObstacle(type, ox, y, rnd, k));
        maybeSave();
      }
    },
    hillObstacles() {
      // λόφος με εμπόδια στην κορυφή και στους πρόποδες
      flat(80);
      obs.push(makeObstacle(pick(obstacles), x + 40, y, rnd));
      flat(200);
      const h = Math.min(R(40, 80) * amp, 75); // κλίση το πολύ ~25°
      maybeSave();
      curve(260, (t) => -h * (1 - Math.cos(Math.PI * t)) * 0.5);
      flat(60);
      obs.push(makeObstacle(pick(obstacles), x + 40, y, rnd));
      flat(200);
      curve(260, (t) => h * (1 - Math.cos(Math.PI * t)) * 0.5);
      flat(60);
      obs.push(makeObstacle(pick(obstacles), x + 40, y, rnd));
      flat(200);
    },
  };

  // ---- χαρακτηριστικά της «rider» πίστας: μεγάλα άλματα και εμπόδια ----
  // ράμπα που ανεβαίνει h σε μήκος len, με απότομο χείλος (για να πετάξεις)
  const ramp = (len, h) => curve(len, (t) => -h * t * t);
  // γκρεμός (ή νερό, στις πόλεις με θάλασσα/λίμνη/ποτάμι): κενό πλάτους w,
  // προσγείωση στο ύψος landY (με κατηφόρα προς baseY)
  const pit = (w, landY, baseY, steep = 0) => {
    const lipX = x;
    const lipY = y;
    const deathY = Math.max(lipY, landY) + (water ? 28 : 70);
    const bottom = deathY + 420;
    push(lipX + 3, bottom);
    push(lipX + w - 3, bottom);
    push(lipX + w, landY);
    gaps.push({ x0: lipX, x1: lipX + w, waterY: deathY, bottom, pit: !water, topY: Math.min(lipY, landY) });
    // κατηφόρα προσγείωσης: ξεκινάει με κλίση, τελειώνει οριζόντια
    const dh = baseY - landY;
    if (steep) {
      // απότομη, ίσια κατηφόρα προσγείωσης (για πολύ ψηλά άλματα) που σβήνει ομαλά στο τέλος
      const d1 = dh * 0.8;
      curve(d1 / steep, (t) => d1 * t);
      const d2 = dh - d1;
      curve((2 * d2) / steep, (t) => d2 * (1 - (1 - t) * (1 - t)));
      return;
    }
    curve(Math.max(420, Math.abs(dh) * 3.6), (t) => dh * (1 - (1 - t) * (1 - t)));
  };
  // ένταση: η πίστα ξεκινά πιο ήπια και φτάνει στο πλήρες μέγεθος στο ~40% της διαδρομής
  const TOTAL = 80000 + 40000 * d;
  const I = () => 0.65 + 0.35 * Math.min(1, Math.max(0, x / (TOTAL * 0.4)));
  const sign = (gapAhead, flips = 0, back = 200) => jumps.push({ x: x - back, rampX: x, pit: gapAhead && !water, water: gapAhead && !!water, flips });
  // πτήση από ράμπα ύψους h και μήκους len, με προσγείωση drop πιο χαμηλά: { vx, vy, T (χρόνος), range }
  const flight = (h, len, drop, v0 = RIDER_TOP) => {
    const th = Math.atan((2 * h) / len);
    const v = Math.sqrt(Math.max(220 * 220, v0 * v0 - 2 * 760 * h * 0.7));
    const vy = v * Math.sin(th);
    const vx = v * Math.cos(th);
    const T = (vy + Math.sqrt(Math.max(0, vy * vy + 2 * 760 * drop))) / 760;
    return { vx, vy, T, range: vx * T };
  };
  // υλικό των μεγάλων όγκων: μάρμαρο όπου υπάρχουν αρχαίοι κίονες, αλλιώς πέτρα
  const blockMat = obstacles.includes('column') ? 'marble' : 'stone';
  Object.assign(features, {
    whoops() {
      // μεγάλες «καμπούρες» στη σειρά: σε πετάνε αν δεν κόψεις γκάζι
      const n = 3 + Math.floor(rnd() * 3);
      const wl = R(320, 420);
      const a = R(28, 44) * I();
      curve(n * wl, (t) => -a * (1 - Math.cos(2 * Math.PI * n * t)) * 0.5);
    },
    bigJump() {
      // φόρα, ψηλή ράμπα, γκρεμός, προσγείωση πιο χαμηλά σε κατηφόρα
      flat(R(380, 480));
      sign(true);
      const baseY = y;
      const h = R(50, 72) * (0.85 + 0.15 * I());
      const len = R(170, 210);
      ramp(len, h);
      // πόσο μακριά πετάει η μηχανή με φουλ γκάζι (περίπου) → πλάτος γκρεμού λίγο μικρότερο
      const drop = R(40, 130) * I();
      const th = Math.atan((2 * h) / len);
      const v = Math.sqrt(Math.max(220 * 220, RIDER_TOP * RIDER_TOP - 2 * 760 * h * 0.7));
      const vy = v * Math.sin(th);
      const range = v * Math.cos(th) * ((vy + Math.sqrt(vy * vy + 2 * 760 * drop)) / 760);
      const w = Math.max(130, Math.min(380, range * R(0.6, 0.78)));
      const landY = y + drop;
      pit(w, landY, Math.max(baseY, landY + 30));
      flat(R(260, 380));
    },
    megaDrop() {
      // μακριά ανηφόρα, μικρό πλατό και ψηλή πτώση σε κατηφόρα
      const h = R(160, 270) * I();
      curve(Math.max(R(500, 700), (h * Math.PI) / 2 / 0.5), (t) => -h * (1 - Math.cos(Math.PI * t)) * 0.5);
      flat(R(120, 200));
      sign(false);
      flat(200);
      const lipX = x;
      const lipY = y;
      const drop = h * R(0.75, 0.95);
      push(lipX + 6, lipY + 18);
      push(lipX + drop * 0.55, lipY + drop * 0.75);
      const y0 = y;
      const target = lipY + h;
      curve(Math.max(480, (target - y0) * 4.5), (t) => (target - y0) * (1 - (1 - t) * (1 - t)));
      flat(R(260, 380));
    },
    tabletop() {
      // ράμπα, ψηλό «τραπέζι» (μερικές φορές με εμπόδιο πάνω), κατηφόρα
      flat(R(260, 360));
      sign(false);
      const h = R(75, 115) * I();
      ramp(R(150, 190), h);
      flat(R(420, 640));
      curve(R(300, 380), (t) => h * (1 - (1 - t) * (1 - t)));
      flat(R(260, 380));
    },
    block() {
      // ψηλός μαρμάρινος όγκος: πρέπει να πηδήξεις πάνω του από μια μικρή ράμπα
      flat(R(280, 360));
      sign(false);
      const baseY = y;
      const h = R(30, 42) * (0.8 + 0.2 * I());
      ramp(R(110, 135), h);
      const lipX = x;
      push(lipX + 6, baseY - h * 0.65);
      push(lipX + 30, baseY);
      flat(R(20, 50));
      const bw = R(110, 220);
      const bh = h + R(0, 16) * I();
      obs.push(makeBlock(x + bw / 2, y, bw, bh, blockMat));
      flat(bw + bh * 1.5 + R(300, 400));
    },
    megaRamp() {
      // «εκτοξευτήρας»: ψηλός λόφος, φόρα, μεγάλη ράμπα και τεράστιο άλμα πάνω από φαράγγι
      // με προσγείωση πολύ πιο χαμηλά – αρκετός χρόνος στον αέρα για 2 ή 3 τούμπες
      maybeSave();
      const base0 = y;
      const D = R(600, 900) * I();
      curve(Math.max(R(900, 1200), (D * Math.PI) / 2 / 0.5), (t) => -D * (1 - Math.cos(Math.PI * t)) * 0.5);
      // σημαιάκι στην κορυφή: αν πέσεις στο μεγάλο άλμα, το ξαναδοκιμάζεις αμέσως
      flat(80);
      savepoints.push(x);
      lastSave = x;
      flat(R(520, 680));
      const h = R(140, 170);
      const len = R(290, 330);
      const drop = D * R(0.82, 0.95) + h;
      // στο χείλος η μηχανή έχει σχεδόν όλη της την ταχύτητα· προσγειώνεσαι σε μακριά κατηφόρα
      const th = Math.atan((2 * h) / len);
      const vx = RIDER_TOP * Math.cos(th);
      const vy = RIDER_TOP * Math.sin(th);
      const T = (vy + Math.sqrt(vy * vy + 2 * 760 * drop * 0.75)) / 760;
      sign(true, T > 1.75 ? 3 : 2);
      ramp(len, h);
      const w = Math.max(260, Math.min(480, vx * R(0.7, 0.92)));
      const lipX = x;
      const lipY = y;
      pit(w, lipY + drop * 0.25, Math.max(base0, lipY + drop), 0.9);
      gaps[gaps.length - 1].launch = { x: lipX, y: lipY, vx, vy: -vy, T };
      flat(R(420, 540));
    },
    islands() {
      // «νησάκια»: 2–3 άλματα στη σειρά, από πλατφόρμα σε πλατφόρμα, κάθε μία λίγο πιο χαμηλά
      const n = 2 + Math.floor(rnd() * 2);
      const total = n * 45;
      curve(Math.max(520, total * 4), (t) => -total * (1 - Math.cos(Math.PI * t)) * 0.5);
      maybeSave();
      flat(R(380, 460));
      for (let i = 0; i < n; i++) {
        sign(true);
        const h = R(26, 36);
        const len = R(115, 135);
        const drop = R(30, 55);
        const f = flight(h, len, drop + h);
        ramp(len, h);
        const w = Math.max(120, Math.min(260, f.range * R(0.4, 0.5)));
        const landY = y + h + drop;
        pit(w, landY, landY + 12);
        flat(Math.max(120, f.range * 0.55 - 300) + R(80, 140));
        maybeSave();
      }
      flat(R(260, 360));
    },
    stepUp() {
      // άλμα προς τα πάνω: ράμπα, γκρεμός και προσγείωση σε ψηλότερο πλάτωμα
      flat(R(420, 520));
      sign(true);
      const base0 = y;
      const h = R(70, 92) * (0.85 + 0.15 * I());
      const len = R(190, 220);
      const up = R(10, 34) * I(); // πόσο πιο ψηλά από το χείλος της ράμπας προσγειώνεσαι
      const f = flight(h, len, -up);
      ramp(len, h);
      const w = Math.max(110, Math.min(230, f.range * R(0.42, 0.55)));
      const landY = y - up;
      pit(w, landY, landY);
      flat(R(200, 300));
      // κατηφόρα πίσω στο αρχικό ύψος
      const back = base0 - y;
      curve(Math.max(420, Math.abs(back) * 3.4), (t) => back * (1 - Math.cos(Math.PI * t)) * 0.5);
      flat(R(240, 340));
    },
    valleyLaunch() {
      // βαθιά κοιλάδα που σε εκτοξεύει από την απέναντι πλευρά πάνω από γκρεμό
      flat(R(260, 340));
      const base0 = y;
      const D = R(130, 210) * I();
      curve(Math.max(520, D * 3.6), (t) => D * (1 - Math.cos(Math.PI * t)) * 0.5);
      sign(true, 0, 40);
      const h = D * R(0.75, 0.95);
      const len = Math.max(260, h * 2.3);
      const drop = R(60, 140) * I();
      const f = flight(h, len, drop, RIDER_TOP * 1.05);
      ramp(len, h);
      const w = Math.max(150, Math.min(420, f.range * R(0.48, 0.6)));
      const landY = y + drop;
      pit(w, landY, Math.max(base0, landY + 30));
      flat(R(300, 400));
    },
    stairs() {
      // σκαλοπάτια προς τα κάτω (ή πάνω, με απαλές ράμπες)
      const n = 3 + Math.floor(rnd() * 3);
      // πριν από τα σκαλοπάτια, μια ομαλή ανηφόρα ώστε να μη χανόμαστε προς τα κάτω
      const total = n * 34;
      curve(Math.max(500, total * 4), (t) => -total * (1 - Math.cos(Math.PI * t)) * 0.5);
      flat(160);
      for (let i = 0; i < n; i++) {
        flat(R(240, 320));
        const s = R(26, 42);
        push(x + 5, y + s * 0.6);
        push(x + 20, y + s * 0.4);
        flat(40);
      }
      flat(R(200, 280));
    },
  });

  const weights = rider
    ? [
        ['rolling', 1.2],
        ['climb', 1],
        ['whoops', 1.6],
        ['bigJump', 3.2 + d],
        ['megaDrop', 2 + 0.5 * d],
        ['tabletop', 2],
        ['block', 2.4],
        ['megaRamp', 2.2 + 0.6 * d],
        ['islands', 1.8 + 0.5 * d],
        ['stepUp', 1.6 + 0.4 * d],
        ['valleyLaunch', 1.8],
        ['stairs', 1.2],
        ['obstacle', 2.4],
        ['hillObstacles', 0.8],
      ]
    : [
    ['rolling', 3],
    ['climb', 2],
    ['valley', 1.4],
    ['bumps', 1 + d],
    ['kicker', 1.2 + d],
    ['obstacle', 5.5],
    ['hillObstacles', 1.5 + d],
      ];
  const totalW = weights.reduce((s, w) => s + w[1], 0);
  let last = '';
  let last2 = '';
  const used = new Set();
  // ποτέ το ίδιο κομμάτι δύο φορές στη σειρά, και σπάνια το ίδιο με το προ-προηγούμενο
  const pickFeature = () => {
    for (let tries = 0; tries < 6; tries++) {
      let r = rnd() * totalW;
      for (const [name, w] of weights) {
        r -= w;
        if (r <= 0) {
          if ((name !== last && name !== last2) || tries === 5) return name;
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

  // Πίστες ~80.000–120.000 μονάδες, δηλαδή 16.000–24.000 από checkpoint σε checkpoint
  // (περίπου 1 λεπτό οδήγησης ανά κομμάτι, 4–6 λεπτά ανά πίστα): μαθαίνεις κάτι νέο κάθε λεπτό
  const length = TOTAL;
  const parts = checkpointCount + 1;
  const chunk = length / parts;
  lastSave = x;
  for (let k = 0; k < parts; k++) {
    const end = x + chunk;
    let guaranteedJump = !!water && !rider; // σε κάθε κομμάτι πόλης με νερό υπάρχει σίγουρα ένα άλμα πάνω από νερό
    while (x < end) {
      let f = pickFeature();
      // κάθε πίστα έχει σίγουρα μεγάλο άλμα, όγκο και νησάκια
      const must = rider && x - (end - chunk) < 5000 ? [null, 'megaRamp', 'block', 'islands', null][k] : null;
      if (must && !used.has(must)) f = must;
      if (rider && y > 200) f = 'climb';
      used.add(f); // μην κατεβαίνουμε συνέχεια πιο χαμηλά
      if (guaranteedJump && x > end - chunk / 2) {
        f = 'kicker';
        guaranteedJump = false;
      }
      last2 = last;
      last = f;
      const fx0 = x;
      features[f]();
      spans.push({ f, x0: fx0, x1: x });
      flat(rider ? R(160, 280) : R(50, 110));
      maybeSave();
    }
    lastSave = x;
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
    for (const cp of [...checkpoints, ...savepoints]) {
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
    savepoints,
    startX,
    finishX,
    style,
    spans,
    endX: x,
    minY: points.reduce((m, p) => Math.min(m, p.y), Infinity),
    maxY: points.reduce((m, p) => (gaps.some((g) => p.x > g.x0 && p.x < g.x1) ? m : Math.max(m, p.y)), -Infinity),
  };
}

// Κάθε εμπόδιο έχει "poly": πολυγραμμή από αριστερά προς τα δεξιά πάνω από την κορυφή του
// (έτσι οι κάθετες της είναι προς τα έξω), με άκρα πάνω στο έδαφος.
export function makeObstacle(type, x, baseY, rnd = Math.random, k = 1) {
  const o = { type, x, y: baseY, seed: Math.floor(rnd() * 1e6), k };
  // Στρογγυλό εμπόδιο πάνω σε μικρό ανάχωμα: η πολυγραμμή ξεκινά από το έδαφος, ανεβαίνει
  // εφαπτομενικά (~37°) στην έλλειψη, περνά από την κορυφή και κατεβαίνει συμμετρικά.
  const mound = (rx, ry, L) => {
    rx *= k;
    ry *= k;
    L *= k;
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
      o.r = 12 * k;
      o.poly = mound(12, 12, 36);
      break;
    }
    case 'barrel':
      o.r = 12 * k;
      o.poly = mound(12, 12, 36);
      break;
    case 'log':
      o.r = 10 * k;
      o.poly = mound(10, 10, 30);
      break;
    case 'hay':
      o.r = 14 * k;
      o.poly = mound(14, 14, 42);
      break;
    case 'amphora': {
      // ξαπλωμένος αμφορέας
      o.rx = 24 * k;
      o.ry = 10 * k;
      o.poly = mound(24, 10, 30);
      break;
    }
    case 'rock': {
      const h = (14 + rnd() * 8) * k;
      const w = (84 + rnd() * 20) * k;
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
      const s = 22 * k;
      o.s = s;
      o.poly = [
        { x: x - s / 2 - 34 * k, y: baseY },
        { x: x - s / 2, y: baseY - s },
        { x: x + s / 2, y: baseY - s },
        { x: x + s / 2 + 30 * k, y: baseY },
      ];
      break;
    }
  }
  return o;
}

/** Μεγάλος μαρμάρινος όγκος (σχεδόν κάθετα τοιχώματα) – για την «rider» πίστα. */
export function makeBlock(x, baseY, w, h, material = 'marble') {
  return {
    type: 'block',
    material,
    x,
    y: baseY,
    w,
    h,
    poly: [
      { x: x - w / 2 - 2, y: baseY },
      { x: x - w / 2, y: baseY - h + 4 },
      { x: x - w / 2 + 4, y: baseY - h },
      { x: x + w / 2 - 6, y: baseY - h },
      { x: x + w / 2 + h * 0.4, y: baseY - h * 0.55 },
      { x: x + w / 2 + h * 1.5, y: baseY },
    ],
  };
}
