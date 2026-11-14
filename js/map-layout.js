// Θέσεις των χωρών στον χάρτη: γεωγραφική προβολή (μήκος/πλάτος) και μετά
// ελαφριά «χαλάρωση» ώστε οι κόμβοι να μην πέφτουν ο ένας πάνω στον άλλο.
// Καθαρή λογική – ίδιο αποτέλεσμα κάθε φορά.

const K = 58; // μονάδες χάρτη ανά μοίρα πλάτους
const COS = 0.64; // συμπίεση του μήκους (~ cos 50°)
const MIN_DIST = 170; // ελάχιστη απόσταση κόμβων

export const project = ([lon, lat]) => ({ x: (lon + 26) * COS * K, y: (72 - lat) * K });

export const SEAS = [
  ['Αιγαίο', [25.2, 38.2]],
  ['Ιόνιο', [18.6, 38.0]],
  ['Αδριατική', [15.6, 43.0]],
  ['Μαύρη Θάλασσα', [34.0, 43.5]],
  ['Μεσόγειος', [6.0, 38.5]],
  ['Βόρεια Θάλασσα', [3.0, 56.5]],
  ['Βαλτική', [19.0, 57.5]],
  ['Ατλαντικός Ωκεανός', [-15.0, 48.0]],
  ['Νορβηγική Θάλασσα', [2.0, 66.0]],
];

const cache = new Map();

/** countries: { id: { lonLat } } → { pos: { id: {x, y} }, bounds: {x, y, w, h} } */
export function mapLayout(countries) {
  const ids = Object.keys(countries);
  const key = ids.join(',');
  if (cache.has(key)) return cache.get(key);
  const home = Object.fromEntries(ids.map((id) => [id, project(countries[id].lonLat)]));
  const pos = Object.fromEntries(ids.map((id) => [id, { ...home[id] }]));
  for (let it = 0; it < 300; it++) {
    for (let i = 0; i < ids.length; i++) {
      for (let j = i + 1; j < ids.length; j++) {
        const a = pos[ids[i]];
        const b = pos[ids[j]];
        let dx = b.x - a.x;
        let dy = b.y - a.y;
        let d = Math.hypot(dx, dy);
        if (d >= MIN_DIST) continue;
        if (d < 1e-6) {
          dx = 1;
          dy = 0;
          d = 1;
        }
        const push = (MIN_DIST - d) / 2;
        a.x -= (dx / d) * push;
        a.y -= (dy / d) * push;
        b.x += (dx / d) * push;
        b.y += (dy / d) * push;
      }
    }
    // ελατήριο προς τη γεωγραφική θέση
    for (const id of ids) {
      pos[id].x += (home[id].x - pos[id].x) * 0.04;
      pos[id].y += (home[id].y - pos[id].y) * 0.04;
    }
  }
  for (const id of ids) {
    pos[id].x = Math.round(pos[id].x);
    pos[id].y = Math.round(pos[id].y);
  }
  const xs = ids.map((id) => pos[id].x);
  const ys = ids.map((id) => pos[id].y);
  const pad = 140;
  const bounds = {
    x: Math.min(...xs) - pad,
    y: Math.min(...ys) - pad,
    w: Math.max(...xs) - Math.min(...xs) + pad * 2,
    h: Math.max(...ys) - Math.min(...ys) + pad * 2,
  };
  const res = { pos, bounds };
  cache.set(key, res);
  return res;
}

/** Ορθογώνιο που περιέχει τις δοσμένες χώρες (για αρχικό ζουμ). */
export function fitBox(pos, ids, minW = 1000, aspect = 1.6) {
  const xs = ids.map((id) => pos[id].x);
  const ys = ids.map((id) => pos[id].y);
  const pad = 170;
  let x0 = Math.min(...xs) - pad;
  let x1 = Math.max(...xs) + pad;
  let y0 = Math.min(...ys) - pad;
  let y1 = Math.max(...ys) + pad;
  let w = Math.max(minW, x1 - x0);
  let h = Math.max(w / aspect, y1 - y0);
  w = Math.max(w, h * aspect);
  const cx = (x0 + x1) / 2;
  const cy = (y0 + y1) / 2;
  return { x: cx - w / 2, y: cy - h / 2, w, h };
}
