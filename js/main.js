import { Game } from './game.js';
import { UI } from './ui.js';
import { Sound } from './audio.js';
import { loadSave } from './progress.js';

const sound = new Sound();
const game = new Game(document.getElementById('game'), sound);
const ui = new UI({ game, sound, data: loadSave() });

// για αποσφαλμάτωση από την κονσόλα
window.geomichani = { game, ui };

if ('serviceWorker' in navigator && location.protocol !== 'file:' && !['localhost', '127.0.0.1'].includes(location.hostname)) {
  navigator.serviceWorker.register('./sw.js').catch(() => {});
}
