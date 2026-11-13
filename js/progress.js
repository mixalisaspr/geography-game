// Πρόοδος του παίκτη: ποιες πόλεις/χώρες ολοκληρώθηκαν, συλλογή, ποιες χώρες είναι διαθέσιμες.
// Οι συναρτήσεις δέχονται το αντικείμενο `data`, ώστε να μπορούν να ελεγχθούν και χωρίς browser.

import { COUNTRIES, START_COUNTRY } from './data/countries.js';

const KEY = 'geomichani-save-v1';

export function emptySave() {
  return {
    cities: {}, // cityId → { stars, quiz: bool, bestTime }
    items: {}, // itemId → timestamp
    completedCountries: [], // με τη σειρά που ολοκληρώθηκαν
    lastCompleted: null,
    seenCountryIntro: {},
    muted: false,
    seenHelp: false,
  };
}

export function loadSave(storage = globalThis.localStorage) {
  try {
    const raw = storage?.getItem(KEY);
    if (!raw) return emptySave();
    return { ...emptySave(), ...JSON.parse(raw) };
  } catch {
    return emptySave();
  }
}

export function writeSave(data, storage = globalThis.localStorage) {
  try {
    storage?.setItem(KEY, JSON.stringify(data));
  } catch {
    /* π.χ. ιδιωτική περιήγηση – απλώς δεν αποθηκεύουμε */
  }
}

export const isCityDone = (data, cityId) => !!data.cities[cityId];

export function isCountryDone(data, countryId) {
  return COUNTRIES[countryId].cities.every((c) => isCityDone(data, c.id));
}

export function isCountryStarted(data, countryId) {
  return COUNTRIES[countryId].cities.some((c) => isCityDone(data, c.id));
}

/** Ξεκλειδωμένη πόλη: η πρώτη κάθε χώρας, ή όταν έχει τελειώσει η προηγούμενη. */
export function isCityUnlocked(data, city) {
  if (city.index === 0) return true;
  return isCityDone(data, COUNTRIES[city.countryId].cities[city.index - 1].id);
}

/** Η επόμενη πόλη που πρέπει να παιχτεί σε μια χώρα (ή null αν έχουν τελειώσει όλες). */
export function nextCity(data, countryId) {
  return COUNTRIES[countryId].cities.find((c) => !isCityDone(data, c.id)) || null;
}

/**
 * Χώρες στις οποίες μπορεί να πάει ο παίκτης *για πρώτη φορά*:
 *  - στην αρχή μόνο η Ελλάδα,
 *  - μετά, μόνο οι γείτονες της χώρας που ολοκλήρωσε τελευταία,
 *  - (+ όσες έχει ήδη ξεκινήσει και δεν έχει τελειώσει).
 * Αν η τελευταία χώρα δεν έχει άλλους ελεύθερους γείτονες, ανοίγουν οι γείτονες
 * όλων των ολοκληρωμένων χωρών, ώστε ο παίκτης να μην κολλάει ποτέ.
 */
export function availableCountries(data) {
  const done = new Set(Object.keys(COUNTRIES).filter((id) => isCountryDone(data, id)));
  if (!done.size) {
    const started = Object.keys(COUNTRIES).filter((id) => isCountryStarted(data, id));
    return [...new Set([START_COUNTRY, ...started])];
  }
  const out = new Set();
  const last = data.lastCompleted && done.has(data.lastCompleted) ? data.lastCompleted : [...done].pop();
  for (const n of COUNTRIES[last].neighbors) if (!done.has(n)) out.add(n);
  if (!out.size) {
    for (const d of done) for (const n of COUNTRIES[d].neighbors) if (!done.has(n)) out.add(n);
  }
  for (const id of Object.keys(COUNTRIES)) if (!done.has(id) && isCountryStarted(data, id)) out.add(id);
  return [...out];
}

/** Κατάσταση χώρας για τον χάρτη: 'done' | 'available' | 'locked'. */
export function countryState(data, countryId) {
  if (isCountryDone(data, countryId)) return 'done';
  return availableCountries(data).includes(countryId) ? 'available' : 'locked';
}

export function canPlayCountry(data, countryId) {
  return countryState(data, countryId) !== 'locked';
}

/**
 * Καταγράφει αποτέλεσμα πόλης. Επιστρέφει { countryCompleted: bool }.
 * stars: 1..3, quiz: σωστή απάντηση
 */
export function recordCityResult(data, city, { stars, quiz, time }) {
  const wasDone = isCountryDone(data, city.countryId);
  const prev = data.cities[city.id];
  data.cities[city.id] = {
    stars: Math.max(stars, prev?.stars || 0),
    quiz: !!(quiz || prev?.quiz),
    bestTime: prev?.bestTime ? Math.min(prev.bestTime, time) : time,
  };
  const nowDone = isCountryDone(data, city.countryId);
  if (nowDone && !wasDone) {
    if (!data.completedCountries.includes(city.countryId)) data.completedCountries.push(city.countryId);
    data.lastCompleted = city.countryId;
    return { countryCompleted: true };
  }
  return { countryCompleted: false };
}

export function collectItem(data, itemId) {
  if (data.items[itemId]) return false;
  data.items[itemId] = Date.now();
  return true;
}

export function totalStars(data) {
  return Object.values(data.cities).reduce((s, c) => s + (c.stars || 0), 0);
}
