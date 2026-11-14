// Νομίσματα και διαμάντια πάνω στην πίστα (ντετερμινιστικά, από τον σπόρο της πίστας).
//  - νομίσματα: σειρές λίγο πάνω από το έδαφος, τα μαζεύεις περνώντας
//  - διαμάντια: στον αέρα πάνω από γκρεμούς/νερό, στην τροχιά ενός καλού άλματος
// Δεν αλλάζουν την πίστα ούτε τη φυσική· μόνο δίνουν πόντους.

import { hashStr, mulberry32 } from './track.js';

function groundY(pts, x) {
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
  return a.y + ((b.y - a.y) * (x - a.x)) / (b.x - a.x || 1);
}

export function generatePickups(track, seed = 'pickups') {
  const rnd = mulberry32(hashStr(`${seed}:pickups`));
  const R = (a, b) => a + rnd() * (b - a);
  const pts = track.points;
  const out = [];
  // ψηλότερο σημείο εδάφους ή εμποδίου γύρω από το x
  const spans = track.obstacles.map((o) => {
    let x0 = Infinity;
    let x1 = -Infinity;
    let top = Infinity;
    for (const p of o.poly) {
      x0 = Math.min(x0, p.x);
      x1 = Math.max(x1, p.x);
      top = Math.min(top, p.y);
    }
    return { x0, x1, top };
  });
  const surface = (x) => {
    let y = groundY(pts, x);
    for (const s of spans) if (x > s.x0 - 20 && x < s.x1 + 20) y = Math.min(y, s.top);
    return y;
  };
  const nearGap = (x, m) => track.gaps.some((g) => x > g.x0 - m && x < g.x1 + m);
  const nearFlag = (x) => track.checkpoints.some((c) => Math.abs(c - x) < 200);

  // σειρές νομισμάτων
  let x = track.startX + 500;
  while (x < track.finishX - 500) {
    const n = 4 + Math.floor(rnd() * 3);
    const wave = rnd() < 0.35 ? R(14, 26) : 0; // μερικές σειρές κάνουν «κύμα»
    for (let i = 0; i < n; i++) {
      const cx = x + i * 58;
      if (nearGap(cx, 120) || nearFlag(cx)) continue;
      out.push({ kind: 'coin', x: cx, y: surface(cx) - 38 - wave * Math.sin((i / (n - 1)) * Math.PI) });
    }
    x += n * 58 + R(1500, 2600);
  }

  // διαμάντια πάνω από κάθε κενό
  for (const g of track.gaps) {
    const y0 = groundY(pts, g.x0 - 2);
    const y1 = groundY(pts, g.x1 + 2);
    const w = g.x1 - g.x0;
    const n = w > 260 ? 3 : w > 120 ? 2 : 1;
    for (let i = 1; i <= n; i++) {
      const t = i / (n + 1);
      out.push({ kind: 'gem', x: g.x0 + w * t, y: y0 + (y1 - y0) * t - 46 - Math.min(90, w * 0.22) * 4 * t * (1 - t) });
    }
  }
  out.sort((a, b) => a.x - b.x);
  return out;
}
