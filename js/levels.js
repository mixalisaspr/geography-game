import { cityDifficulty } from './data/countries.js';
import { generateTrack } from './track.js';
import { generatePickups } from './pickups.js';

const cache = new Map();

/** Φτιάχνει (ντετερμινιστικά) την πίστα μιας πόλης από το θέμα της. */
export function trackForCity(city) {
  if (cache.has(city.id)) return cache.get(city.id);
  const track = buildTrack(city);
  cache.set(city.id, track);
  return track;
}

export function buildTrack(city) {
  const t = city.theme;
  const track = generateTrack({
    seed: `geomichani:${city.id}`,
    difficulty: cityDifficulty(city),
    water: t.water,
    obstacles: t.obstacles,
    hills: t.hills,
    style: city.rider ? 'rider' : 'classic',
  });
  track.pickups = generatePickups(track, `geomichani:${city.id}`);
  return track;
}
