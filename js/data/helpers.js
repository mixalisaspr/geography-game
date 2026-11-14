// Βοηθητικά για συμπαγή γραφή περιεχομένου.
// Σε κάθε ερώτηση η ΠΡΩΤΗ απάντηση είναι η σωστή (ανακατεύονται στο παιχνίδι).

export const BASE = {
  sky: ['#69c0f5', '#fde8c4'],
  far: '#9fb4c8',
  mid: '#86a865',
  ground: '#9c7349',
  top: '#78ad45',
  surface: 'grass',
  water: null,
  waterColor: '#2b8fd8',
  landmarks: [],
  obstacles: ['rock', 'crate'],
  deco: ['pine'],
  hills: 1,
  snow: false,
  balloons: false,
};

export const T = (o) => ({ ...BASE, ...o });

/** Αντικείμενο συλλογής: emoji, όνομα, περιγραφή, «Ήξερες ότι…», ερώτηση + 3 απαντήσεις. */
export const item = (emoji, name, desc, fact, q, options) => ({ emoji, name, desc, fact, quiz: { q, options } });

/** Πληροφορία διαδρομής + ερώτηση για το mini quiz. */
export const info = (text, q, options) => ({ text, quiz: { q, options } });

/** Πόλη (πίστα). */
export const city = (id, name, intro, items, infos, theme) => ({ id, name, intro, items, infos, theme: T(theme) });

// Έτοιμα «πακέτα» θέματος για να μη γράφουμε τα ίδια χρώματα ξανά και ξανά
export const THEMES = {
  city: { surface: 'road', ground: '#84705c', top: '#55575e', deco: ['birch', 'pine'], obstacles: ['crate', 'barrel', 'rock'] },
  old: { surface: 'cobble', ground: '#8a7a66', top: '#b3a58f', obstacles: ['crate', 'barrel', 'rock'] },
  north: { sky: ['#8fbfe0', '#e8eef2'], far: '#7d8fa3', mid: '#5f8e5a', ground: '#6f604f', top: '#5e9c48', deco: ['pine', 'birch'], obstacles: ['log', 'rock', 'hay'] },
  alps: { sky: ['#6fb3ea', '#eef3f6'], far: '#8496ab', mid: '#6a9c58', ground: '#7a6650', top: '#69a84a', deco: ['pine'], obstacles: ['log', 'rock', 'hay'], snow: true, hills: 1.3 },
  coast: { surface: 'sand', ground: '#b8925f', top: '#dcc08a', water: 'sea', waterColor: '#1f8fc8', deco: ['palm', 'olive'], obstacles: ['barrel', 'rock', 'amphora'] },
  plain: { sky: ['#7ec0ec', '#f6edd2'], mid: '#9cb466', ground: '#8d6e4c', top: '#8fb747', deco: ['birch'], obstacles: ['hay', 'log', 'crate'], hills: 0.75 },
};
