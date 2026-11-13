import { test } from 'node:test';
import assert from 'node:assert/strict';

import { COUNTRIES, COUNTRY_IDS, START_COUNTRY, allItems, cityDifficulty } from '../js/data/countries.js';
import { generateTrack } from '../js/track.js';
import { trackForCity } from '../js/levels.js';
import { LevelSim, autopilot } from '../js/physics.js';
import { LANDMARKS } from '../js/render.js';
import {
  availableCountries,
  canPlayCountry,
  emptySave,
  isCityUnlocked,
  nextCity,
  recordCityResult,
} from '../js/progress.js';

const OBSTACLES = ['column', 'amphora', 'rock', 'crate', 'barrel', 'hay', 'log'];
const TREES = ['olive', 'cypress', 'pine', 'palm', 'birch'];
const allCities = () => Object.values(COUNTRIES).flatMap((c) => c.cities);

test('τα σύνορα είναι αμφίδρομα και δείχνουν σε υπαρκτές χώρες', () => {
  for (const [id, c] of Object.entries(COUNTRIES)) {
    assert.ok(c.neighbors.length > 0, `${id} χωρίς γείτονες`);
    for (const n of c.neighbors) {
      assert.ok(COUNTRIES[n], `${id}: άγνωστος γείτονας ${n}`);
      assert.ok(COUNTRIES[n].neighbors.includes(id), `${n} δεν έχει γείτονα την ${id}`);
    }
  }
});

test('όλες οι χώρες είναι προσβάσιμες ξεκινώντας από την Ελλάδα', () => {
  const seen = new Set([START_COUNTRY]);
  const q = [START_COUNTRY];
  while (q.length) for (const n of COUNTRIES[q.shift()].neighbors) if (!seen.has(n)) seen.add(n) && q.push(n);
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
    for (const it of city.items) assert.ok(it.emoji && it.name && it.desc, `${city.id}: ελλιπές αντικείμενο`);
    assert.equal(city.facts.length, 2, `${city.id}: χρειάζονται 2 πληροφορίες`);
    const q = city.quiz;
    assert.ok(q.q && q.explain, `${city.id}: ελλιπής ερώτηση`);
    assert.equal(q.options.length, 3, `${city.id}: 3 απαντήσεις`);
    assert.equal(new Set(q.options).size, 3, `${city.id}: διπλές απαντήσεις`);
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

test('η πίστα είναι ντετερμινιστική και έχει 3 checkpoints πριν από τον τερματισμό', () => {
  for (const city of allCities()) {
    const a = trackForCity(city);
    const b = trackForCity(city);
    assert.deepEqual(a.points, b.points, `${city.id}: μη ντετερμινιστική`);
    assert.equal(a.checkpoints.length, 3);
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
    while (t < 120 && sim.state !== 'finished') {
      sim.update(1 / 60, autopilot(sim.bike));
      t += 1 / 60;
    }
    assert.equal(sim.state, 'finished', `${city.id}: δεν τερμάτισε (πρόοδος ${sim.progress.toFixed(2)})`);
    assert.ok(sim.crashes <= 2, `${city.id}: πολλές πτώσεις (${sim.crashes})`);
  }
});

test('η πρώτη πίστα (Αθήνα) βγαίνει και μόνο με γκάζι – φιλική για αρχάριους', () => {
  const sim = new LevelSim(trackForCity(COUNTRIES.greece.cities[0]));
  for (let t = 0; t < 90 && sim.state !== 'finished'; t += 1 / 60) sim.update(1 / 60, { gas: true, brake: false });
  assert.equal(sim.state, 'finished');
  assert.ok(sim.crashes <= 1, `πτώσεις: ${sim.crashes}`);
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
  assert.deepEqual(availableCountries(d).sort(), [...COUNTRIES.greece.neighbors].sort());
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
  for (const n of COUNTRIES.bulgaria.neighbors) if (n !== 'greece') assert.ok(av.includes(n), n);
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
