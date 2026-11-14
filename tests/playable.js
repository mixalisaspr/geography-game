// Κοινός κώδικας για τα τεστ «βγαίνει κάθε πίστα;». Μοιράζεται σε 4 αρχεία
// (playable-0..3.test.js) ώστε το node --test να τα τρέχει παράλληλα.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { COUNTRIES } from '../js/data/countries.js';
import { trackForCity } from '../js/levels.js';
import { LevelSim } from '../js/physics.js';

// Οδηγός «άνθρωπος»: αφήνει το γκάζι όταν σηκώνεται πολύ η μύτη, αλλά αντιδρά με καθυστέρηση 0,25 s.
// Στο έδαφος κοιτάει τη γωνία ως προς την κλίση, άρα στις ανηφόρες κρατάει γκάζι.
export const human = () => {
  const hist = [];
  return (b) => {
    hist.push(b.angle);
    const a = hist[Math.max(0, hist.length - 16)];
    if (!b.grounded) return { gas: a > -0.2, brake: a < -0.7 };
    const n = b.contact[0] || b.contact[1];
    return { gas: b.angle - Math.atan2(n.x, -n.y) > -0.45, brake: false };
  };
};

// «Ικανός» παίκτης για τη δύσκολη rider πίστα: στον αέρα προβλέπει πού θα προσγειωθεί και ευθυγραμμίζει
// τη μηχανή με το έδαφος εκεί. Αντιδρά με καθυστέρηση 0,15 s.
export const skilledRider = (world, lag = 9) => {
  const q = [];
  const decide = (b) => {
    if (!b.grounded) {
      const c = b.center;
      const v = b.velocity;
      let px = c.x;
      let py = c.y;
      let vy = v.y;
      for (let k = 0; k < 120; k++) {
        px += v.x / 60;
        vy += 760 / 60;
        py += vy / 60;
        if (py + 14 >= world.surfaceY(px)) break;
      }
      const slope = Math.atan2(world.surfaceY(px + 20) - world.surfaceY(px - 20), 40);
      const err = b.angle - slope + 0.3 * b.angularVelocity();
      return { gas: err > 0.1, brake: err < -0.1 };
    }
    const n = b.contact[0] || b.contact[1];
    return { gas: b.angle - Math.atan2(n.x, -n.y) > -0.45, brake: false };
  };
  return (b) => {
    q.push(decide(b));
    return q.length > lag ? q.shift() : { gas: true, brake: false };
  };
};

export function playableShard(shard, shards = 4) {
  const cities = Object.values(COUNTRIES)
    .flatMap((c) => c.cities)
    .filter((_, i) => i % shards === shard);
  test(`ένας ικανός παίκτης (ισιώνει στον αέρα, αντιδρά με 0,15 s καθυστέρηση) τερματίζει κάθε πίστα (μέρος ${shard + 1}/${shards})`, () => {
    for (const city of cities) {
      const sim = new LevelSim(trackForCity(city));
      const ctl = city.rider ? skilledRider(sim.world) : human();
      for (let t = 0; t < 2400 && sim.state !== 'finished'; t += 1 / 60) sim.update(1 / 60, ctl(sim.bike));
      assert.equal(sim.state, 'finished', `${city.id}: δεν τερμάτισε (πρόοδος ${sim.progress.toFixed(2)})`);
      assert.ok(sim.crashes <= 6, `${city.id}: ${sim.crashes} πτώσεις`);
    }
  });
}
