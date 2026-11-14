import { test } from 'node:test';
import assert from 'node:assert/strict';

import { COUNTRIES, COUNTRY_IDS, START_COUNTRY, allItems, cityDifficulty, links } from '../js/data/countries.js';
import { mapLayout } from '../js/map-layout.js';
import { generateTrack } from '../js/track.js';
import { trackForCity } from '../js/levels.js';
import { LevelSim, autopilot } from '../js/physics.js';
import { LANDMARKS } from '../js/render.js';
import { finalQuiz } from '../js/ui.js';
import {
  availableCountries,
  canPlayCountry,
  emptySave,
  isCityUnlocked,
  nextCity,
  recordCityResult,
  runPoints,
  totalPoints,
} from '../js/progress.js';

const OBSTACLES = ['column', 'amphora', 'rock', 'crate', 'barrel', 'hay', 'log'];
const TREES = ['olive', 'cypress', 'pine', 'palm', 'birch'];
const allCities = () => Object.values(COUNTRIES).flatMap((c) => c.cities);

test('τα σύνορα είναι αμφίδρομα και δείχνουν σε υπαρκτές χώρες', () => {
  for (const [id, c] of Object.entries(COUNTRIES)) {
    assert.ok(links(id).length > 0, `${id} χωρίς γείτονες ή θαλάσσια σύνδεση`);
    for (const n of c.neighbors) {
      assert.ok(COUNTRIES[n], `${id}: άγνωστος γείτονας ${n}`);
      assert.ok(COUNTRIES[n].neighbors.includes(id), `${n} δεν έχει γείτονα την ${id}`);
    }
    for (const n of c.sea) {
      assert.ok(COUNTRIES[n], `${id}: άγνωστη θαλάσσια σύνδεση ${n}`);
      assert.ok(COUNTRIES[n].sea.includes(id), `${n} δεν έχει θαλάσσια σύνδεση με ${id}`);
      assert.ok(!c.neighbors.includes(n), `${id}–${n}: και στεριά και θάλασσα`);
    }
  }
});

test('στον χάρτη οι χώρες δεν πέφτουν η μία πάνω στην άλλη', () => {
  const { pos } = mapLayout(COUNTRIES);
  for (let i = 0; i < COUNTRY_IDS.length; i++)
    for (let j = i + 1; j < COUNTRY_IDS.length; j++) {
      const a = pos[COUNTRY_IDS[i]];
      const b = pos[COUNTRY_IDS[j]];
      assert.ok(Math.hypot(a.x - b.x, a.y - b.y) > 120, `${COUNTRY_IDS[i]} – ${COUNTRY_IDS[j]}`);
    }
});

test('όλες οι χώρες είναι προσβάσιμες ξεκινώντας από την Ελλάδα', () => {
  const seen = new Set([START_COUNTRY]);
  const q = [START_COUNTRY];
  while (q.length) for (const n of links(q.shift())) if (!seen.has(n)) seen.add(n) && q.push(n);
  assert.deepEqual([...seen].sort(), [...COUNTRY_IDS].sort());
});

test('η Ελλάδα έχει Αθήνα, Θεσσαλονίκη και Ηράκλειο', () => {
  assert.deepEqual(
    COUNTRIES.greece.cities.map((c) => c.name),
    ['Αθήνα', 'Θεσσαλονίκη', 'Ηράκλειο'],
  );
});

test('κάθε πόλη έχει πλήρες περιεχόμενο και έγκυρο θέμα', () => {
  const ids = new Set();
  for (const city of allCities()) {
    assert.ok(!ids.has(city.id), `διπλό id πόλης ${city.id}`);
    ids.add(city.id);
    assert.ok(city.name && city.intro, city.id);
    assert.equal(city.items.length, 2, `${city.id}: χρειάζονται 2 αντικείμενα`);
    for (const it of city.items) {
      assert.ok(it.emoji && it.name && it.desc, `${city.id}: ελλιπές αντικείμενο`);
      assert.ok(it.fact && it.fact !== it.desc, `${city.id}: το αντικείμενο «${it.name}» χρειάζεται δική του πληροφορία`);
    }
    assert.equal(city.facts, undefined, `${city.id}: οι πληροφορίες ανήκουν στα αντικείμενα`);
    assert.equal(city.infos.length, 2, `${city.id}: χρειάζονται 2 πληροφορίες για τη διαδρομή`);
    const qs = [...city.items.map((i) => i.quiz), ...city.infos.map((i) => i.quiz)];
    for (const info of city.infos) assert.ok(info.text, `${city.id}: κενή πληροφορία`);
    assert.equal(new Set(qs.map((q) => q.q)).size, 4, `${city.id}: ίδια ερώτηση δύο φορές`);
    for (const q of qs) {
      assert.ok(q.q, `${city.id}: ελλιπής ερώτηση`);
      assert.equal(q.options.length, 3, `${city.id}: 3 απαντήσεις`);
      assert.equal(new Set(q.options).size, 3, `${city.id}: διπλές απαντήσεις`);
    }
    const t = city.theme;
    for (const l of t.landmarks) assert.ok(LANDMARKS[l], `${city.id}: άγνωστο αξιοθέατο ${l}`);
    for (const o of t.obstacles) assert.ok(OBSTACLES.includes(o), `${city.id}: άγνωστο εμπόδιο ${o}`);
    for (const d of t.deco) assert.ok(TREES.includes(d), `${city.id}: άγνωστο δέντρο ${d}`);
    assert.ok([null, 'sea', 'lake', 'river'].includes(t.water), `${city.id}: water`);
  }
  const itemIds = allItems().map((i) => i.id);
  assert.equal(new Set(itemIds).size, itemIds.length, 'διπλά ids αντικειμένων');
});

test('η δυσκολία ξεκινά εύκολα από την Αθήνα και μένει στο [0,1]', () => {
  assert.equal(cityDifficulty(COUNTRIES.greece.cities[0]), 0);
  for (const c of allCities()) {
    const d = cityDifficulty(c);
    assert.ok(d >= 0 && d <= 1);
  }
});

test('η πίστα είναι ντετερμινιστική, μεγάλη, και έχει 4 checkpoints πριν από τον τερματισμό', () => {
  for (const city of allCities()) {
    const a = trackForCity(city);
    const b = trackForCity(city);
    assert.deepEqual(a.points, b.points, `${city.id}: μη ντετερμινιστική`);
    assert.equal(a.checkpoints.length, 4);
    assert.ok(a.finishX - a.startX >= 60000, `${city.id}: πολύ μικρή πίστα (${Math.round(a.finishX)})`);
    assert.ok(a.obstacles.length >= 60, `${city.id}: λίγα εμπόδια (${a.obstacles.length})`);
    let prev = a.startX;
    for (const cp of a.checkpoints) {
      assert.ok(cp > prev, `${city.id}: checkpoints εκτός σειράς`);
      prev = cp;
      assert.ok(!a.gaps.some((g) => cp > g.x0 - 50 && cp < g.x1 + 50), `${city.id}: checkpoint μέσα σε κενό`);
    }
    assert.ok(a.finishX > prev);
    for (let i = 1; i < a.points.length; i++) assert.ok(a.points[i].x > a.points[i - 1].x, `${city.id}: x όχι αύξον`);
  }
});

test('πόλεις χωρίς νερό δεν έχουν κενά με νερό', () => {
  const t = generateTrack({ seed: 'x', difficulty: 1, water: null, obstacles: ['rock'] });
  assert.equal(t.gaps.length, 0);
});

test('κάθε πίστα τερματίζεται από τον αυτόματο πιλότο (άρα είναι βατή)', () => {
  for (const city of allCities()) {
    const sim = new LevelSim(trackForCity(city));
    let t = 0;
    while (t < 1500 && sim.state !== 'finished') {
      sim.update(1 / 60, autopilot(sim.bike));
      t += 1 / 60;
    }
    assert.equal(sim.state, 'finished', `${city.id}: δεν τερμάτισε (πρόοδος ${sim.progress.toFixed(2)})`);
    assert.ok(sim.crashes <= 2, `${city.id}: πολλές πτώσεις (${sim.crashes})`);
  }
});

test('αν κρατάς συνέχεια γκάζι πέφτεις σε κάθε πίστα – πρέπει να το αφήνεις στα άλματα', () => {
  for (const city of allCities()) {
    const sim = new LevelSim(trackForCity(city));
    for (let t = 0; t < 120 && sim.state !== 'finished'; t += 1 / 60) sim.update(1 / 60, { gas: true, brake: false });
    assert.ok(sim.crashes >= 2, `${city.id}: μόνο ${sim.crashes} πτώσεις με σκέτο γκάζι`);
  }
});

// Οδηγός «άνθρωπος»: αφήνει το γκάζι όταν σηκώνεται η μύτη, αλλά αντιδρά με καθυστέρηση 0,25 s.
const human = () => {
  const hist = [];
  return (b) => {
    hist.push(b.angle);
    const a = hist[Math.max(0, hist.length - 16)];
    if (!b.grounded) return { gas: a > -0.2, brake: a < -0.7 };
    // στο έδαφος κοιτάει τη γωνία ως προς την κλίση (στις ανηφόρες κρατάει γκάζι)
    const n = b.contact[0] || b.contact[1];
    return { gas: b.angle - Math.atan2(n.x, -n.y) > -0.45, brake: false };
  };
};

test('ένας παίκτης που αφήνει το γκάζι (με καθυστέρηση) τερματίζει κάθε πίστα', () => {
  for (const city of allCities()) {
    const sim = new LevelSim(trackForCity(city));
    const ctl = human();
    for (let t = 0; t < 1500 && sim.state !== 'finished'; t += 1 / 60) sim.update(1 / 60, ctl(sim.bike));
    assert.equal(sim.state, 'finished', city.id);
    assert.ok(sim.crashes <= 3, `${city.id}: ${sim.crashes} πτώσεις`);
  }
});

test('το mini quiz έχει μία ερώτηση για κάθε checkpoint, με το κείμενο που είδε ο παίκτης', () => {
  for (const city of allCities()) {
    const qs = finalQuiz(city);
    assert.equal(qs.length, trackForCity(city).checkpoints.length, city.id);
    qs.forEach((q, i) => {
      assert.equal(q.checkpoint, i + 1);
      assert.ok(q.source.length > 20, `${city.id}: λείπει η πηγή της ερώτησης`);
    });
  }
});

test('ανάμεσα στα checkpoints υπάρχουν σημεία επαναφοράς, ώστε μια πτώση να μη σε γυρνάει πολύ πίσω', () => {
  for (const city of allCities()) {
    const t = trackForCity(city);
    const stops = [t.startX, ...t.checkpoints, ...t.savepoints, t.finishX].sort((a, b) => a - b);
    for (let i = 1; i < stops.length; i++) {
      assert.ok(stops[i] - stops[i - 1] < 3600, `${city.id}: ${Math.round(stops[i] - stops[i - 1])} μονάδες χωρίς σημείο επαναφοράς`);
    }
  }
});

test('μετά από πτώση ξαναξεκινάς από το τελευταίο σημείο επαναφοράς', () => {
  const t = trackForCity(COUNTRIES.greece.cities[0]);
  const sim = new LevelSim(t);
  const sp = t.savepoints.find((x) => x > t.checkpoints[0]);
  sim.reached = 0;
  sim.bike.place(sp + 5, sim.world.groundY(sp + 5));
  sim.update(1 / 60, { gas: false, brake: false });
  assert.equal(sim.savedX, sp);
  assert.equal(sim.respawnX(), sp);
});

test('κάθε άλμα έχει πινακίδα προειδοποίησης πριν από τη ράμπα', () => {
  for (const city of allCities()) {
    const t = trackForCity(city);
    for (const g of t.gaps) assert.ok(t.jumps.some((j) => j.water && j.x < g.x0 && g.x0 - j.x < 600), `${city.id}: κενό χωρίς πινακίδα`);
  }
});

test('η μηχανή πέφτει αν προσγειωθεί με το κεφάλι', () => {
  const t = generateTrack({ seed: 'flat', difficulty: 0, water: null, obstacles: ['rock'] });
  const sim = new LevelSim(t);
  sim.bike.place(100, sim.world.groundY(100) - 120, Math.PI); // ανάποδα στον αέρα
  let crashed = false;
  for (let i = 0; i < 240 && !crashed; i++) crashed = sim.update(1 / 120, { gas: false, brake: false }).some((e) => e.type === 'crash');
  assert.ok(crashed);
});

test('ξεκινάς μόνο από την Ελλάδα', () => {
  const d = emptySave();
  assert.deepEqual(availableCountries(d), ['greece']);
  assert.ok(!canPlayCountry(d, 'bulgaria'));
  assert.ok(isCityUnlocked(d, COUNTRIES.greece.cities[0]));
  assert.ok(!isCityUnlocked(d, COUNTRIES.greece.cities[1]));
});

const finishCountry = (d, id) => {
  let res;
  for (const city of COUNTRIES[id].cities) res = recordCityResult(d, city, { stars: 2, quiz: true, time: 30 });
  return res;
};

test('μετά την Ελλάδα ανοίγουν μόνο οι γείτονές της', () => {
  const d = emptySave();
  recordCityResult(d, COUNTRIES.greece.cities[0], { stars: 3, quiz: true, time: 20 });
  assert.equal(nextCity(d, 'greece').id, 'thessaloniki');
  assert.deepEqual(availableCountries(d), ['greece']);
  const r = finishCountry(d, 'greece');
  assert.equal(r.countryCompleted, true);
  assert.equal(d.lastCompleted, 'greece');
  assert.deepEqual(availableCountries(d).sort(), [...links('greece')].sort());
  assert.ok(!canPlayCountry(d, 'serbia'));
  assert.ok(canPlayCountry(d, 'greece')); // ξαναπαίζεται
});

test('η επόμενη χώρα πρέπει να συνορεύει με αυτή που τελείωσε τελευταία', () => {
  const d = emptySave();
  finishCountry(d, 'greece');
  // ξεκινάει την Αλβανία αλλά τελειώνει πρώτα τη Βουλγαρία
  recordCityResult(d, COUNTRIES.albania.cities[0], { stars: 1, quiz: false, time: 50 });
  finishCountry(d, 'bulgaria');
  const av = availableCountries(d);
  for (const n of links('bulgaria')) if (n !== 'greece') assert.ok(av.includes(n), n);
  assert.ok(av.includes('albania'), 'η χώρα σε εξέλιξη μένει διαθέσιμη');
  assert.ok(!av.includes('hungary'));
  assert.ok(!av.includes('greece'), 'οι ολοκληρωμένες δεν μετρούν ως «νέες»');
});

test('σε αδιέξοδο ανοίγουν οι γείτονες όλων των ολοκληρωμένων χωρών', () => {
  const d = emptySave();
  finishCountry(d, 'greece');
  finishCountry(d, 'bulgaria');
  finishCountry(d, 'turkey'); // όλοι οι γείτονες της Τουρκίας είναι ήδη ολοκληρωμένοι
  const av = availableCountries(d);
  assert.ok(av.length > 0);
  assert.ok(av.includes('albania') && av.includes('serbia') && av.includes('romania'));
});

test('κρατάει τα καλύτερα αστέρια', () => {
  const d = emptySave();
  const city = COUNTRIES.greece.cities[0];
  recordCityResult(d, city, { stars: 3, quiz: true, time: 20 });
  recordCityResult(d, city, { stars: 1, quiz: false, time: 40 });
  assert.equal(d.cities[city.id].stars, 3);
  assert.equal(d.cities[city.id].quiz, true);
  assert.equal(d.cities[city.id].bestTime, 20);
});

test('πόντοι: +1 για κάθε σωστή απάντηση, −1 για κάθε πτώση· κρατιέται το ρεκόρ', () => {
  assert.equal(runPoints(2, 0), 2);
  assert.equal(runPoints(2, 3), -1);
  const d = emptySave();
  const [a, b] = COUNTRIES.greece.cities;
  assert.equal(recordCityResult(d, a, { stars: 2, quiz: true, time: 30, points: 1 }).newBest, true);
  assert.equal(recordCityResult(d, a, { stars: 2, quiz: true, time: 30, points: 0 }).newBest, false);
  assert.equal(d.cities[a.id].points, 1);
  assert.equal(recordCityResult(d, a, { stars: 3, quiz: true, time: 25, points: 2 }).newBest, true);
  recordCityResult(d, b, { stars: 1, quiz: false, time: 40, points: -2 });
  assert.equal(totalPoints(d), 0);
});

test('κάθε πτώση με το κεφάλι μετράει μία φορά', () => {
  const t = generateTrack({ seed: 'flat', difficulty: 0, water: null, obstacles: ['rock'] });
  const sim = new LevelSim(t);
  let crashes = 0;
  for (let n = 0; n < 3; n++) {
    sim.bike.place(sim.bike.center.x, sim.world.groundY(sim.bike.center.x) - 120, Math.PI);
    for (let i = 0; i < 600; i++) {
      const ev = sim.update(1 / 120, { gas: false, brake: false });
      crashes += ev.filter((e) => e.type === 'crash').length;
      if (ev.some((e) => e.type === 'respawn')) break;
    }
  }
  assert.equal(crashes, 3);
  assert.equal(sim.crashes, 3);
});
