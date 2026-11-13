import { cityDifficulty } from './data/countries.js';
import { generateTrack } from './track.js';

/** Φτιάχνει (ντετερμινιστικά) την πίστα μιας πόλης από το θέμα της. */
export function trackForCity(city) {
  const t = city.theme;
  return generateTrack({
    seed: `geomichani:${city.id}`,
    difficulty: cityDifficulty(city),
    water: t.water,
    obstacles: t.obstacles,
    hills: t.hills,
  });
}
