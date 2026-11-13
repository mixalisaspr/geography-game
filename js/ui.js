// Οθόνες και παράθυρα (DOM): αρχική, χάρτης, συλλογή, popups πίστας, αποτελέσματα.
// Εδώ βρίσκεται και η «ροή» του παιχνιδιού (τι ανοίγει μετά από τι).

import { COUNTRIES, COUNTRY_IDS, START_COUNTRY, allItems, getCity } from './data/countries.js';
import {
  availableCountries,
  canPlayCountry,
  collectItem,
  countryState,
  isCityDone,
  isCityUnlocked,
  isCountryDone,
  nextCity,
  recordCityResult,
  runPoints,
  totalPoints,
  totalStars,
  writeSave,
} from './progress.js';

// Σειρά των checkpoints σε κάθε πίστα
const CHECKPOINTS = [
  { type: 'item', i: 0 },
  { type: 'info', i: 0 },
  { type: 'item', i: 1 },
  { type: 'info', i: 1 },
];

/** Οι ερωτήσεις του mini quiz: μία για κάθε checkpoint, με το κείμενο που είδε ο παίκτης. */
export function finalQuiz(city) {
  return CHECKPOINTS.map((cp, n) => {
    if (cp.type === 'item') {
      const it = city.items[cp.i];
      return { ...it.quiz, checkpoint: n + 1, source: `${it.emoji} ${it.name}: ${it.desc} ${it.fact}` };
    }
    const info = city.infos[cp.i];
    return { ...info.quiz, checkpoint: n + 1, source: `📖 ${info.text}` };
  });
}

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/** «την Ελλάδα», «τη Βουλγαρία», «το Μαυροβούνιο» */
export function accusative(country) {
  if (country.id === 'montenegro') return `το ${country.name}`;
  const keepN = /^[ΑΆΕΈΗΉΙΊΟΌΥΎΩΏΚΠΤΞΨ]|^(ΓΚ|ΜΠ|ΝΤ|ΤΣ|ΤΖ)/i.test(country.name.toUpperCase());
  return `${keepN ? 'την' : 'τη'} ${country.name}`;
}

function starsHtml(n, max = 3) {
  let s = '';
  for (let i = 0; i < max; i++) s += `<span class="star ${i < n ? 'on' : ''}">★</span>`;
  return s;
}

function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fmtTime(t) {
  const m = Math.floor(t / 60);
  const s = Math.floor(t % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

export class UI {
  constructor({ game, sound, data }) {
    this.game = game;
    this.sound = sound;
    this.data = data;
    this.run = null; // στοιχεία της τρέχουσας διαδρομής
    this.screens = {
      home: $('#screen-home'),
      map: $('#screen-map'),
      collection: $('#screen-collection'),
    };
    this.hud = $('#hud');
    this.modal = $('#modal');
    this.modalBox = $('#modal .modal-box');

    this.bindControls();
    this.bindGameEvents();
    this.sound.setMuted(!!data.muted);
    this.showHome();
  }

  save() {
    writeSave(this.data);
  }

  // ---------------- οθόνες ----------------
  showScreen(name) {
    for (const [k, el] of Object.entries(this.screens)) el.hidden = k !== name;
    this.hud.hidden = name !== null;
    document.body.dataset.screen = name || 'play';
  }

  showHome() {
    this.closeModal();
    this.showScreen('home');
    // demo στο φόντο: η τελευταία πόλη που παίχτηκε ή η Αθήνα
    const demoCity = getCity(this.data.lastCity || 'athens') || getCity('athens');
    this.game.load(demoCity, 'demo');
    const items = allItems();
    const got = items.filter((i) => this.data.items[i.id]).length;
    const doneCountries = COUNTRY_IDS.filter((id) => isCountryDone(this.data, id)).length;
    const el = this.screens.home;
    el.innerHTML = `
      <div class="home-card">
        <div class="logo">
          <span class="logo-bike">🏍️</span>
          <h1>ΓεωΜηχανή</h1>
          <p class="tagline">Ταξίδεψε με τη μηχανή σου από χώρα σε χώρα!</p>
        </div>
        <div class="home-stats">
          <span>🌍 ${doneCountries}/${COUNTRY_IDS.length} χώρες</span>
          <span>🎒 ${got}/${items.length} αντικείμενα</span>
          <span>🏆 ${totalPoints(this.data)} πόντοι</span>
          <span>⭐ ${totalStars(this.data)}</span>
        </div>
        <button class="btn big primary" data-act="play">▶ Παίξε</button>
        <div class="row">
          <button class="btn" data-act="collection">🎒 Συλλογή</button>
          <button class="btn" data-act="help">❓ Πώς παίζεται</button>
          <button class="btn icon" data-act="mute" aria-label="Ήχος">${this.data.muted ? '🔇' : '🔊'}</button>
        </div>
      </div>`;
    el.onclick = (ev) => {
      const act = ev.target.closest('[data-act]')?.dataset.act;
      if (!act) return;
      this.sound.unlock();
      this.sound.click();
      if (act === 'play') {
        this.goFullscreen();
        if (!this.data.seenHelp) this.showHelp(() => this.showMap());
        else this.showMap();
      } else if (act === 'collection') this.showCollection();
      else if (act === 'help') this.showHelp();
      else if (act === 'mute') {
        this.data.muted = !this.data.muted;
        this.sound.setMuted(this.data.muted);
        this.save();
        ev.target.closest('[data-act]').textContent = this.data.muted ? '🔇' : '🔊';
      }
    };
  }

  goFullscreen() {
    const touch = matchMedia('(pointer: coarse)').matches;
    if (!touch || document.fullscreenElement) return;
    const el = document.documentElement;
    const p = el.requestFullscreen?.({ navigationUI: 'hide' });
    p?.then(() => screen.orientation?.lock?.('landscape').catch(() => {})).catch(() => {});
  }

  // ---------------- χάρτης ----------------
  showMap(focusId = null) {
    this.closeModal();
    this.game.stop();
    this.showScreen('map');
    const data = this.data;
    const avail = availableCountries(data);
    const pos = Object.fromEntries(COUNTRY_IDS.map((id) => [id, COUNTRIES[id].map]));
    // ακμές (σύνορα)
    let edges = '';
    const seen = new Set();
    for (const a of COUNTRY_IDS)
      for (const b of COUNTRIES[a].neighbors) {
        const key = [a, b].sort().join('|');
        if (seen.has(key)) continue;
        seen.add(key);
        const sa = countryState(data, a);
        const sb = countryState(data, b);
        let cls = 'locked';
        if (sa === 'done' && sb === 'done') cls = 'done';
        else if ((sa === 'done' && sb === 'available') || (sb === 'done' && sa === 'available')) cls = 'open';
        const A = pos[a];
        const B = pos[b];
        edges += `<line class="edge ${cls}" x1="${A.x}" y1="${A.y}" x2="${B.x}" y2="${B.y}"/>`;
      }
    let nodes = '';
    for (const id of COUNTRY_IDS) {
      const c = COUNTRIES[id];
      const st = countryState(data, id);
      const p = pos[id];
      const doneCities = c.cities.filter((x) => isCityDone(data, x.id)).length;
      const stripes = c.colors
        .map((col, i) => `<rect x="-40" y="${-40 + (80 / c.colors.length) * i}" width="80" height="${80 / c.colors.length + 1}" fill="${col}"/>`)
        .join('');
      nodes += `
        <g class="node ${st} ${focusId === id ? 'focus' : ''}" data-id="${id}" transform="translate(${p.x} ${p.y})" tabindex="0" role="button" aria-label="${esc(c.name)}">
          <circle class="halo" r="54"/>
          <clipPath id="clip-${id}"><circle r="40"/></clipPath>
          <g clip-path="url(#clip-${id})" class="stripes">${stripes}</g>
          <circle class="ring" r="40"/>
          <text class="flag" y="12">${c.flag}</text>
          <text class="cname" y="68">${esc(c.name)}</text>
          ${st === 'locked' ? '<text class="lock" x="30" y="-26">🔒</text>' : ''}
          ${st === 'done' ? '<text class="lock" x="30" y="-26">✅</text>' : ''}
          ${st !== 'locked' && doneCities < c.cities.length ? `<text class="cprog" y="90">${doneCities}/${c.cities.length} πόλεις</text>` : ''}
        </g>`;
    }
    const last = data.lastCompleted ? COUNTRIES[data.lastCompleted] : null;
    const hint = !last
      ? `Το ταξίδι ξεκινά από την <b>Ελλάδα</b> 🇬🇷 – πάτησέ την!`
      : avail.length
        ? `Ολοκλήρωσες ${esc(accusative(last))}! Διάλεξε μια χώρα που <b>συνορεύει</b> μαζί της.`
        : `Συγχαρητήρια! Ολοκλήρωσες όλες τις χώρες! 🏆`;
    const items = allItems();
    const got = items.filter((i) => data.items[i.id]).length;
    const el = this.screens.map;
    el.innerHTML = `
      <header class="bar">
        <button class="btn icon" data-act="home" aria-label="Πίσω">⬅</button>
        <div class="bar-title">
          <h2>Χάρτης ταξιδιού</h2>
          <p class="hint">${hint}</p>
        </div>
        <button class="btn" data-act="collection">🎒 ${got}/${items.length}</button>
      </header>
      <div class="map-wrap">
        <svg class="map" viewBox="0 0 1200 710" preserveAspectRatio="xMidYMid meet">
          <defs>
            <radialGradient id="sea" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#bfe3f7"/><stop offset="1" stop-color="#9fd2ef"/></radialGradient>
          </defs>
          <ellipse class="sea" cx="770" cy="700" rx="200" ry="120"/>
          <ellipse class="sea" cx="330" cy="720" rx="140" ry="110"/>
          <ellipse class="sea" cx="150" cy="470" rx="90" ry="210" transform="rotate(-35 150 470)"/>
          <ellipse class="sea" cx="1010" cy="310" rx="150" ry="120"/>
          <text class="sea-label" x="820" y="660">Αιγαίο</text>
          <text class="sea-label" x="300" y="680">Ιόνιο</text>
          <text class="sea-label" x="150" y="480" transform="rotate(55 150 480)">Αδριατική</text>
          <text class="sea-label" x="1010" y="300">Μαύρη Θάλασσα</text>
          ${edges}
          ${nodes}
        </svg>
      </div>`;
    el.onclick = (ev) => {
      const act = ev.target.closest('[data-act]')?.dataset.act;
      if (act) {
        this.sound.click();
        if (act === 'home') this.showHome();
        if (act === 'collection') this.showCollection();
        return;
      }
      const node = ev.target.closest('.node');
      if (node) {
        this.sound.click();
        this.openCountry(node.dataset.id);
      }
    };
    el.onkeydown = (ev) => {
      if ((ev.key === 'Enter' || ev.key === ' ') && ev.target.classList?.contains('node')) {
        ev.preventDefault();
        this.openCountry(ev.target.dataset.id);
      }
    };
  }

  openCountry(id) {
    const c = COUNTRIES[id];
    const data = this.data;
    const st = countryState(data, id);
    const playable = canPlayCountry(data, id);
    const neighbors = c.neighbors.map((n) => `<span class="chip">${COUNTRIES[n].flag} ${esc(COUNTRIES[n].name)}</span>`).join('');
    const cities = c.cities
      .map((city) => {
        const done = isCityDone(data, city.id);
        const unlocked = playable && isCityUnlocked(data, city);
        const stars = data.cities[city.id]?.stars || 0;
        return `<button class="city ${done ? 'done' : ''}" data-city="${city.id}" ${unlocked ? '' : 'disabled'}>
            <span class="city-num">${city.index + 1}</span>
            <span class="city-name">${esc(city.name)}</span>
            <span class="city-items">${city.items.map((i) => (data.items[i.id] ? i.emoji : '❔')).join(' ')}</span>
            <span class="city-stars">${unlocked ? (done ? `${starsHtml(stars)}<small class="city-pts">🏆 ${data.cities[city.id].points ?? 0}</small>` : '▶') : '🔒'}</span>
          </button>`;
      })
      .join('');
    let lockMsg = '';
    if (!playable) {
      const last = data.lastCompleted ? COUNTRIES[data.lastCompleted] : COUNTRIES[START_COUNTRY];
      lockMsg = data.lastCompleted
        ? `<p class="lockmsg">🔒 Μπορείς να πας μόνο σε χώρες που συνορεύουν με ${esc(accusative(last))}, τη χώρα που ολοκλήρωσες τελευταία.</p>`
        : `<p class="lockmsg">🔒 Πρώτα ολοκλήρωσε την Ελλάδα!</p>`;
    }
    const next = playable ? nextCity(data, id) : null;
    this.openModal(
      `<div class="sheet-grid">
        <div class="col">
          <div class="country-head">
            <span class="big-flag">${c.flag}</span>
            <div>
              <h2>${esc(c.name)}</h2>
              <p class="muted">${st === 'done' ? '✅ Ολοκληρώθηκε' : st === 'available' ? 'Διαθέσιμη' : 'Κλειδωμένη'}</p>
            </div>
          </div>
          <dl class="facts">
            <dt>Πρωτεύουσα</dt><dd>${esc(c.capital)}</dd>
            <dt>Γλώσσα</dt><dd>${esc(c.language)}</dd>
            <dt>Νόμισμα</dt><dd>${esc(c.currency)}</dd>
          </dl>
          <p class="intro">${esc(c.intro)}</p>
          <p class="label">Συνορεύει με:</p>
          <div class="chips">${neighbors}</div>
        </div>
        <div class="col">
          ${lockMsg}
          <p class="label first">Πίστες:</p>
          <div class="cities">${cities}</div>
        </div>
      </div>
      <div class="actions">
        <button class="btn" data-act="close">Κλείσιμο</button>
        ${next ? `<button class="btn primary" data-city="${next.id}">▶ ${esc(next.name)}</button>` : ''}
      </div>`,
      (ev) => {
        const cityBtn = ev.target.closest('[data-city]');
        if (cityBtn && !cityBtn.disabled) {
          this.sound.click();
          this.startCity(getCity(cityBtn.dataset.city));
          return;
        }
        if (ev.target.closest('[data-act="close"]')) {
          this.sound.click();
          this.closeModal();
        }
      },
      'sheet',
    );
  }

  // ---------------- συλλογή ----------------
  showCollection() {
    this.closeModal();
    this.game.stop();
    this.showScreen('collection');
    const data = this.data;
    const items = allItems();
    const got = items.filter((i) => data.items[i.id]).length;
    let html = `
      <header class="bar">
        <button class="btn icon" data-act="back" aria-label="Πίσω">⬅</button>
        <div class="bar-title"><h2>Η συλλογή μου</h2><p class="hint">🎒 ${got} από ${items.length} αντικείμενα</p></div>
        <button class="btn" data-act="map">🗺️ Χάρτης</button>
      </header><div class="collection">`;
    for (const id of COUNTRY_IDS) {
      const c = COUNTRIES[id];
      const cItems = c.cities.flatMap((x) => x.items);
      const n = cItems.filter((i) => data.items[i.id]).length;
      html += `<section><h3>${c.flag} ${esc(c.name)} <span class="muted">${n}/${cItems.length}</span></h3><div class="grid">`;
      for (const it of cItems) {
        const has = !!data.items[it.id];
        html += has
          ? `<button class="item" data-item="${it.id}"><span class="emoji">${it.emoji}</span><span class="iname">${esc(it.name)}</span></button>`
          : `<div class="item locked"><span class="emoji">❔</span><span class="iname">${esc(getCity(it.cityId).name)}</span></div>`;
      }
      html += `</div></section>`;
    }
    html += `</div>`;
    const el = this.screens.collection;
    el.innerHTML = html;
    el.onclick = (ev) => {
      const act = ev.target.closest('[data-act]')?.dataset.act;
      if (act === 'back') {
        this.sound.click();
        this.showHome();
        return;
      }
      if (act === 'map') {
        this.sound.click();
        this.showMap();
        return;
      }
      const b = ev.target.closest('[data-item]');
      if (b) {
        this.sound.click();
        const it = items.find((i) => i.id === b.dataset.item);
        const city = getCity(it.cityId);
        this.openModal(
          `<div class="item-card">
            <div class="item-emoji">${it.emoji}</div>
            <div class="item-text">
              <h2>${esc(it.name)}</h2>
              <p class="muted">${COUNTRIES[it.countryId].flag} ${esc(city.name)}, ${esc(COUNTRIES[it.countryId].name)}</p>
              <p>${esc(it.desc)}</p>
            </div>
          </div>
          <div class="actions"><button class="btn primary" data-act="close">OK</button></div>`,
          (e) => e.target.closest('[data-act="close"]') && this.closeModal(),
        );
      }
    };
  }

  showHelp(after) {
    this.data.seenHelp = true;
    this.save();
    this.openModal(
      `<h2>Πώς παίζεται</h2>
      <div class="help">
        <div class="help-row"><span class="key">▶</span><p><b>Γκάζι</b> (δεξιά πλευρά της οθόνης ή →): η μηχανή προχωράει. Στον αέρα γέρνει <b>πίσω</b>.</p></div>
        <div class="help-row"><span class="key">◀</span><p><b>Φρένο</b> (αριστερή πλευρά ή ←): φρενάρει / κάνει όπισθεν. Στον αέρα γέρνει <b>μπροστά</b>.</p></div>
        <div class="help-row"><span class="key">⚠️</span><p>Αν κρατάς συνέχεια γκάζι, θα αναποδογυρίσεις! Στα <b>άλματα</b> (πινακίδα ⚠️) <b>άφησε το γκάζι</b> μόλις σηκωθείς στον αέρα.</p></div>
        <div class="help-row"><span class="key">🚩</span><p>Στα <b>checkpoints</b> μαζεύεις αντικείμενα 🎒 και διαβάζεις πληροφορίες 📖 για τη χώρα. Αν πέσεις, συνεχίζεις από το τελευταίο checkpoint.</p></div>
        <div class="help-row"><span class="key">🎓</span><p>Στον τερματισμό σε περιμένει ένα <b>mini quiz</b> με όσα έμαθες. Κάθε σωστή απάντηση σού δίνει <b>+1 πόντο</b> 🏆.</p></div>
        <div class="help-row"><span class="key">💥</span><p>Αν πέσεις με το κεφάλι, η μηχανή <b>εκρήγνυται</b> και χάνεις <b>1 πόντο</b>! Το ίδιο αν πέσεις στο νερό.</p></div>
        <div class="help-row"><span class="key">🗺️</span><p>Όταν τελειώσεις όλες τις πόλεις μιας χώρας, μπορείς να πας μόνο σε μια χώρα που <b>συνορεύει</b> μαζί της.</p></div>
      </div>
      <div class="actions"><button class="btn primary" data-act="ok">Κατάλαβα!</button></div>`,
      (ev) => {
        if (ev.target.closest('[data-act="ok"]')) {
          this.sound.click();
          this.closeModal();
          after?.();
        }
      },
    );
  }

  // ---------------- πίστα ----------------
  startCity(city) {
    this.closeModal();
    const country = COUNTRIES[city.countryId];
    this.data.lastCity = city.id;
    this.save();
    this.showScreen(null);
    this.hud.hidden = false;
    this.run = { city, answers: [], correct: 0, crashes: 0, items: [] };
    this.game.load(city, 'play');
    this.game.pause();
    $('#hud-city').textContent = `${country.flag} ${city.name}`;
    this.updateBag();
    this.updatePoints();
    this.renderProgressMarkers();
    this.openModal(
      `<div class="level-intro">
        <p class="muted">${country.flag} ${esc(country.name)} · Πόλη ${city.index + 1}/${country.cities.length}</p>
        <h2>${esc(city.name)}</h2>
        <p>${esc(city.intro)}</p>
        <p class="label">Θα βρεις στη διαδρομή:</p>
        <div class="to-find">${CHECKPOINTS.map((c) => `<span>${c.type === 'item' ? city.items[c.i].emoji : '📖'}</span>`).join('')}<span>🎓</span></div>
        <p class="muted points-rule">Διάβασε προσεκτικά: στο τέλος σε περιμένει <b>mini quiz</b>! 🏆 Σωστή απάντηση: <b>+1</b> · 💥 Πτώση: <b>−1</b></p>
      </div>
      <div class="actions"><button class="btn" data-act="map">🗺️ Χάρτης</button><button class="btn primary big" data-act="go">Πάμε! 🏍️</button></div>`,
      (ev) => {
        const act = ev.target.closest('[data-act]')?.dataset.act;
        if (act === 'go') {
          this.sound.unlock();
          this.sound.click();
          this.closeModal();
          this.game.resume();
        } else if (act === 'map') this.showMap(city.countryId);
      },
    );
  }

  get points() {
    return this.run ? runPoints(this.run.correct, this.run.crashes) : 0;
  }

  updateBag() {
    const city = this.run?.city;
    if (!city) return;
    const n = city.items.filter((i) => this.data.items[i.id]).length;
    $('#hud-bag').textContent = `🎒 ${n}/${city.items.length}`;
  }

  updatePoints(change = 0) {
    const el = $('#hud-points');
    el.textContent = `🏆 ${this.points}`;
    el.classList.toggle('negative', this.points < 0);
    if (change) {
      el.classList.remove('up', 'down');
      void el.offsetWidth; // επανεκκίνηση του animation
      el.classList.add(change > 0 ? 'up' : 'down');
    }
  }

  onCrash() {
    if (!this.run) return;
    this.run.crashes++;
    this.updatePoints(-1);
  }

  renderProgressMarkers() {
    const sim = this.game.sim;
    const span = sim.track.finishX - sim.track.startX;
    const labels = this.game.renderer.level.checkpointLabels;
    $('#hud-markers').innerHTML = sim.track.checkpoints
      .map((x, i) => `<span class="marker" data-i="${i}" style="left:${((x - sim.track.startX) / span) * 100}%">${labels[i]}</span>`)
      .join('');
  }

  onCheckpoint(index) {
    const city = this.run.city;
    $(`#hud-markers .marker[data-i="${index}"]`)?.classList.add('done');
    const cp = CHECKPOINTS[index];
    const label = `Checkpoint ${index + 1}/${CHECKPOINTS.length}`;
    const remember = '<p class="remember">🎓 Θυμήσου το – θα σε ρωτήσω στο τέλος!</p>';
    let html;
    if (cp.type === 'item') {
      const item = city.items[cp.i];
      const isNew = collectItem(this.data, item.id);
      this.run.items.push(item);
      this.save();
      this.updateBag();
      this.sound.pickup();
      html = `<div class="item-card">
          <div class="item-emoji pop">${item.emoji}</div>
          <div class="item-text">
            <p class="muted">${label} ${isNew ? '· <b class="new">ΝΕΟ!</b>' : ''}</p>
            <h2>Μάζεψες: ${esc(item.name)}</h2>
            <p>${esc(item.desc)}</p>
          </div>
        </div>
        <div class="did-you-know"><b>📖 Ήξερες ότι…</b><p>${esc(item.fact)}</p></div>`;
    } else {
      const info = city.infos[cp.i];
      this.sound.checkpoint();
      html = `<div class="info-card">
          <p class="muted">${label} · Πληροφορία</p>
          <div class="info-emoji pop">📖</div>
          <div class="did-you-know big"><b>Ήξερες ότι…</b><p>${esc(info.text)}</p></div>
        </div>`;
    }
    this.openModal(
      `${html}${remember}<div class="actions"><button class="btn primary big" data-act="go">Συνέχεια ▶</button></div>`,
      (ev) => {
        if (ev.target.closest('[data-act="go"]')) {
          this.sound.click();
          this.closeModal();
          this.game.resume();
        }
      },
    );
  }

  /** Mini quiz στον τερματισμό, με ερωτήσεις από όσα είδε ο παίκτης στη διαδρομή. */
  startFinalQuiz(stats) {
    const questions = finalQuiz(this.run.city);
    let n = 0;
    const ask = () => {
      const q = questions[n];
      const correct = q.options[0];
      const opts = shuffle(q.options);
      const dots = questions
        .map((_, k) => `<span class="dot ${k < n ? (this.run.answers[k] ? 'ok' : 'bad') : k === n ? 'cur' : ''}"></span>`)
        .join('');
      let answered = false;
      this.openModal(
        `<div class="quiz">
          <div class="quiz-head"><span class="muted">🎓 Mini quiz · Ερώτηση ${n + 1}/${questions.length}</span><span class="dots">${dots}</span></div>
          <h2>${esc(q.q)}</h2>
          <div class="answers">${opts.map((o) => `<button class="btn answer" data-a="${esc(o)}">${esc(o)}</button>`).join('')}</div>
          <div class="feedback" hidden></div>
        </div>
        <div class="actions"><button class="btn primary big" data-act="next" hidden>${n + 1 < questions.length ? 'Επόμενη ▶' : 'Αποτελέσματα 🏁'}</button></div>`,
        (ev) => {
          const a = ev.target.closest('.answer');
          if (a && !answered) {
            answered = true;
            const ok = a.dataset.a === correct;
            this.run.answers.push(ok);
            if (ok) {
              this.run.correct++;
              this.updatePoints(+1);
              this.sound.correct();
              setTimeout(() => this.sound.point(), 250);
            } else this.sound.wrong();
            for (const b of this.modalBox.querySelectorAll('.answer')) {
              b.disabled = true;
              if (b.dataset.a === correct) b.classList.add('right');
              else if (b === a) b.classList.add('wrong');
            }
            const fb = $('.feedback', this.modalBox);
            fb.hidden = false;
            fb.className = `feedback ${ok ? 'ok' : 'bad'}`;
            fb.innerHTML = `<b>${ok ? '✅ Σωστά! +1 πόντος 🏆' : `❌ Η σωστή απάντηση: ${esc(correct)}`}</b>
              <p class="source"><span class="muted">Το είδες στο checkpoint ${q.checkpoint}:</span><br>${esc(q.source)}</p>`;
            $('[data-act="next"]', this.modalBox).hidden = false;
            this.modalBox.scrollTo({ top: this.modalBox.scrollHeight, behavior: 'smooth' });
            return;
          }
          if (ev.target.closest('[data-act="next"]')) {
            this.sound.click();
            n++;
            if (n < questions.length) ask();
            else this.showResults(stats);
          }
        },
      );
    };
    this.openModal(
      `<div class="results">
        <div class="confetti">🎓</div>
        <h2>Τερμάτισες! Ώρα για mini quiz!</h2>
        <p>${questions.length} ερωτήσεις για όσα είδες στη διαδρομή. Κάθε σωστή απάντηση: <b>+1 πόντος</b> 🏆</p>
      </div>
      <div class="actions"><button class="btn primary big" data-act="start">Ξεκίνα ▶</button></div>`,
      (ev) => {
        if (ev.target.closest('[data-act="start"]')) {
          this.sound.click();
          ask();
        }
      },
    );
  }

  onFinish(stats) {
    this.game.pause();
    this.run.answers = [];
    this.run.correct = 0;
    this.startFinalQuiz(stats);
  }

  showResults({ time }) {
    const run = this.run;
    const city = run.city;
    const country = COUNTRIES[city.countryId];
    const { correct, crashes } = run;
    const nQuiz = run.answers.length;
    const quizStar = correct >= nQuiz - 1;
    const points = this.points;
    const stars = 1 + (quizStar ? 1 : 0) + (crashes <= 1 ? 1 : 0);
    const prevBest = this.data.cities[city.id]?.points;
    const { countryCompleted, newBest } = recordCityResult(this.data, city, { stars, quiz: correct === nQuiz, time, points });
    this.save();
    const nextInCountry = country.cities[city.index + 1];
    const plural = (k, one, many) => `${k} ${k === 1 ? one : many}`;
    this.openModal(
      `<div class="results">
        <p class="muted">${country.flag} ${esc(country.name)}</p>
        <h2>🏁 ${esc(city.name)} – Αποτελέσματα</h2>
        <div class="score-box ${points < 0 ? 'negative' : ''}">
          <div class="score">🏆 ${points} ${Math.abs(points) === 1 ? 'πόντος' : 'πόντοι'}</div>
          <div class="score-lines">
            <span class="plus">🎓 ${plural(correct, 'σωστή απάντηση', 'σωστές απαντήσεις')}: +${correct}</span>
            <span class="minus">💥 ${plural(crashes, 'πτώση', 'πτώσεις')}: −${crashes}</span>
          </div>
          ${newBest && prevBest !== undefined ? '<div class="record">🎉 Νέο ρεκόρ!</div>' : prevBest !== undefined ? `<div class="muted">Ρεκόρ: ${prevBest}</div>` : ''}
        </div>
        <div class="big-stars">${starsHtml(stars)}</div>
        <ul class="star-reasons">
          <li class="on">★ Τερμάτισες τη διαδρομή</li>
          <li class="${quizStar ? 'on' : ''}">★ Τουλάχιστον ${nQuiz - 1}/${nQuiz} στο mini quiz (είχες ${correct})</li>
          <li class="${crashes <= 1 ? 'on' : ''}">★ Το πολύ 1 πτώση (είχες ${crashes})</li>
        </ul>
        <p>⏱️ Χρόνος: <b>${fmtTime(time)}</b> · Μάζεψες: ${city.items.map((i) => `<span title="${esc(i.name)}">${i.emoji}</span>`).join(' ')}</p>
      </div>
      <div class="actions">
        <button class="btn" data-act="again">↻ Ξανά</button>
        <button class="btn" data-act="map">🗺️ Χάρτης</button>
        ${!countryCompleted && nextInCountry ? `<button class="btn primary" data-act="next">▶ ${esc(nextInCountry.name)}</button>` : ''}
        ${countryCompleted ? `<button class="btn primary" data-act="country">Συνέχεια ▶</button>` : ''}
      </div>`,
      (ev) => {
        const act = ev.target.closest('[data-act]')?.dataset.act;
        if (!act) return;
        this.sound.click();
        if (act === 'again') this.startCity(city);
        else if (act === 'map') this.showMap(city.countryId);
        else if (act === 'next') this.startCity(nextInCountry);
        else if (act === 'country') this.showCountryComplete(country);
      },
    );
  }

  showCountryComplete(country) {
    const avail = availableCountries(this.data);
    const items = country.cities.flatMap((c) => c.items);
    this.openModal(
      `<div class="results">
        <div class="confetti">🎉</div>
        <h2>Ολοκλήρωσες ${esc(accusative(country))}! ${country.flag}</h2>
        <p>Μάζεψες ${items.filter((i) => this.data.items[i.id]).length} από ${items.length} αντικείμενα:</p>
        <div class="to-find">${items.map((i) => `<span>${this.data.items[i.id] ? i.emoji : '❔'}</span>`).join('')}</div>
        ${
          avail.length
            ? `<p class="label">Τώρα μπορείς να ταξιδέψεις σε μια χώρα που συνορεύει με ${esc(accusative(country))}:</p>
               <div class="chips">${avail.map((id) => `<button class="chip btn" data-country="${id}">${COUNTRIES[id].flag} ${esc(COUNTRIES[id].name)}</button>`).join('')}</div>`
            : `<p><b>🏆 Ολοκλήρωσες ολόκληρο το ταξίδι! Είσαι πραγματικός εξερευνητής!</b></p>`
        }
      </div>
      <div class="actions"><button class="btn primary big" data-act="map">🗺️ Στον χάρτη</button></div>`,
      (ev) => {
        const cBtn = ev.target.closest('[data-country]');
        if (cBtn) {
          this.sound.click();
          this.showMap(cBtn.dataset.country);
          this.openCountry(cBtn.dataset.country);
          return;
        }
        if (ev.target.closest('[data-act="map"]')) {
          this.sound.click();
          this.showMap();
        }
      },
    );
  }

  showPause() {
    if (this.game.mode !== 'play' || this.modal.classList.contains('open')) return;
    this.game.pause();
    this.openModal(
      `<h2>⏸ Παύση</h2>
      <p class="muted">${COUNTRIES[this.run.city.countryId].flag} ${esc(this.run.city.name)}</p>
      <div class="stack">
        <button class="btn primary big" data-act="resume">▶ Συνέχεια</button>
        <button class="btn" data-act="restart">↻ Από την αρχή</button>
        <button class="btn" data-act="help">❓ Πώς παίζεται</button>
        <button class="btn" data-act="mute">${this.data.muted ? '🔇 Ήχος: κλειστός' : '🔊 Ήχος: ανοιχτός'}</button>
        <button class="btn" data-act="map">🗺️ Έξοδος στον χάρτη</button>
      </div>`,
      (ev) => {
        const act = ev.target.closest('[data-act]')?.dataset.act;
        if (!act) return;
        this.sound.click();
        if (act === 'resume') {
          this.closeModal();
          this.game.resume();
        } else if (act === 'restart') this.startCity(this.run.city);
        else if (act === 'help') this.showHelp(() => this.showPause());
        else if (act === 'mute') {
          this.data.muted = !this.data.muted;
          this.sound.setMuted(this.data.muted);
          this.save();
          ev.target.textContent = this.data.muted ? '🔇 Ήχος: κλειστός' : '🔊 Ήχος: ανοιχτός';
        } else if (act === 'map') this.showMap(this.run.city.countryId);
      },
    );
  }

  // ---------------- modal ----------------
  openModal(html, onClick, variant = '') {
    this.modalBox.className = `modal-box ${variant}`;
    this.modalBox.innerHTML = html;
    this.modalBox.onclick = onClick;
    this.modal.classList.add('open');
    this.modal.hidden = false;
    this.modalBox.scrollTop = 0;
    const focusable = this.modalBox.querySelector('.btn.primary, .answer, .btn');
    focusable?.focus({ preventScroll: true });
  }

  closeModal() {
    this.modal.classList.remove('open');
    this.modal.hidden = true;
    this.modalBox.innerHTML = '';
    this.modalBox.onclick = null;
  }

  // ---------------- χειρισμός ----------------
  bindControls() {
    const input = this.game.input;
    const layer = $('#touch-layer');
    const pointers = new Map();
    const gasBtn = $('#pedal-gas');
    const brakeBtn = $('#pedal-brake');
    const refresh = () => {
      const vals = [...pointers.values()];
      input.gas = vals.includes('gas') || this.keys.gas;
      input.brake = vals.includes('brake') || this.keys.brake;
      gasBtn.classList.toggle('active', input.gas);
      brakeBtn.classList.toggle('active', input.brake);
    };
    this.keys = { gas: false, brake: false };
    const down = (ev) => {
      if (this.game.mode !== 'play' || this.game.paused) return;
      ev.preventDefault();
      this.sound.unlock();
      const side = ev.clientX < window.innerWidth / 2 ? 'brake' : 'gas';
      pointers.set(ev.pointerId, side);
      try {
        layer.setPointerCapture?.(ev.pointerId);
      } catch {
        /* μερικοί browsers δεν το επιτρέπουν – δεν πειράζει */
      }
      refresh();
    };
    const up = (ev) => {
      pointers.delete(ev.pointerId);
      refresh();
    };
    layer.addEventListener('pointerdown', down);
    layer.addEventListener('pointerup', up);
    layer.addEventListener('pointercancel', up);
    layer.addEventListener('lostpointercapture', up);
    layer.addEventListener('contextmenu', (e) => e.preventDefault());

    const keyMap = {
      ArrowRight: 'gas',
      ArrowUp: 'gas',
      KeyD: 'gas',
      KeyW: 'gas',
      ArrowLeft: 'brake',
      ArrowDown: 'brake',
      KeyA: 'brake',
      KeyS: 'brake',
    };
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Escape' || e.code === 'KeyP') {
        if (this.game.mode === 'play' && !this.game.paused) this.showPause();
        return;
      }
      const k = keyMap[e.code];
      if (!k || this.game.mode !== 'play') return;
      e.preventDefault();
      this.sound.unlock();
      this.keys[k] = true;
      refresh();
    });
    window.addEventListener('keyup', (e) => {
      const k = keyMap[e.code];
      if (!k) return;
      this.keys[k] = false;
      refresh();
    });
    this.resetInput = () => {
      pointers.clear();
      this.keys.gas = this.keys.brake = false;
      refresh();
    };

    $('#btn-pause').addEventListener('click', () => {
      this.sound.click();
      this.showPause();
    });
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        if (this.game.mode === 'play' && !this.game.paused) this.showPause();
        this.sound.ctx?.suspend?.();
      } else this.sound.ctx?.resume?.();
    });
  }

  bindGameEvents() {
    const g = this.game;
    g.on('checkpoint', (i) => {
      this.resetInput();
      this.onCheckpoint(i);
    });
    g.on('crash', () => this.onCrash());
    g.on('finish', (stats) => {
      this.resetInput();
      this.onFinish(stats);
    });
    g.on('progress', (p) => {
      const bar = $('#hud-progress');
      if (bar) bar.style.width = `${p * 100}%`;
    });
  }
}
