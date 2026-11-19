// Δυτική Ευρώπη (μέρος 1): Γαλλία, Βέλγιο, Ολλανδία, Λουξεμβούργο
import { THEMES, city } from './helpers.js';

export const WEST = {
  france: {
    name: 'Γαλλία',
    flag: '🇫🇷',
    colors: ['#0055a4', '#ffffff', '#ef4135'],
    capital: 'Παρίσι',
    language: 'Γαλλικά',
    currency: 'Ευρώ (€)',
    lonLat: [2.5, 46.6],
    neighbors: ['belgium', 'luxembourg', 'germany', 'switzerland', 'italy', 'spain'],
    sea: ['uk'],
    intro: 'Η χώρα με τους περισσότερους τουρίστες στον κόσμο! Έχει πάνω από 1.000 είδη τυριών, τις Άλπεις, παραλίες και τον ποταμό Σηκουάνα.',
    cities: [
      city('paris', 'Παρίσι', 'Η πρωτεύουσα της Γαλλίας, η «Πόλη του Φωτός», πάνω στον ποταμό Σηκουάνα.', { ...THEMES.city, water: 'river', waterColor: '#4a7390', landmarks: ['eiffel', 'arch'] }),
      city('marseille', 'Μασσαλία', 'Το μεγαλύτερο λιμάνι της Γαλλίας, στη Μεσόγειο, και η αρχαιότερη πόλη της χώρας.', { ...THEMES.coast, landmarks: ['fortress', 'lighthouse'] }),
      city('lyon', 'Λυών', 'Η πόλη όπου συναντιούνται οι ποταμοί Ροδανός και Σαόνη, γνωστή για το καλό της φαγητό.', { ...THEMES.city, water: 'river', waterColor: '#3f7f95', landmarks: ['cathedral', 'bridge'] }),
    ],
  },

  belgium: {
    name: 'Βέλγιο',
    flag: '🇧🇪',
    colors: ['#000000', '#fdda24', '#ef3340'],
    capital: 'Βρυξέλλες',
    language: 'Ολλανδικά, Γαλλικά και Γερμανικά',
    currency: 'Ευρώ (€)',
    lonLat: [4.6, 50.6],
    neighbors: ['france', 'luxembourg', 'germany', 'netherlands'],
    intro: 'Μια μικρή χώρα με τρεις επίσημες γλώσσες, διάσημη για τις σοκολάτες, τις βάφλες και τα κόμικς της!',
    cities: [
      city('brussels', 'Βρυξέλλες', 'Η πρωτεύουσα του Βελγίου και η «πρωτεύουσα» της Ευρωπαϊκής Ένωσης.', { ...THEMES.city, landmarks: ['gothic', 'clocktower'] }),
      city('bruges', 'Μπριζ', 'Μια μεσαιωνική πόλη με κανάλια και πέτρινες γέφυρες.', { ...THEMES.old, water: 'river', waterColor: '#3d6f7a', landmarks: ['clocktower', 'church'] }),
      city('antwerp', 'Αμβέρσα', 'Μεγάλο λιμάνι του Βελγίου, γνωστό σε όλο τον κόσμο ως πόλη των διαμαντιών.', { ...THEMES.city, water: 'river', waterColor: '#4a6f80', landmarks: ['gothic', 'palace'] }),
    ],
  },

  netherlands: {
    name: 'Ολλανδία',
    flag: '🇳🇱',
    colors: ['#ae1c28', '#ffffff', '#21468b'],
    capital: 'Άμστερνταμ',
    language: 'Ολλανδικά',
    currency: 'Ευρώ (€)',
    lonLat: [5.5, 52.2],
    neighbors: ['belgium', 'germany'],
    intro: 'Περίπου το ένα τέταρτο της χώρας βρίσκεται κάτω από το επίπεδο της θάλασσας! Οι Ολλανδοί την προστατεύουν με αναχώματα και φράγματα.',
    cities: [
      city('amsterdam', 'Άμστερνταμ', 'Η πρωτεύουσα της Ολλανδίας, με δεκάδες κανάλια και χιλιάδες ποδήλατα.', { ...THEMES.city, water: 'river', waterColor: '#3f6f86', landmarks: ['dutchMill', 'clocktower'], hills: 0.5, obstacles: ['crate', 'barrel', 'hay'] }),
      city('rotterdam', 'Ρότερνταμ', 'Η πόλη με το μεγαλύτερο λιμάνι της Ευρώπης και πολλά μοντέρνα, παράξενα κτίρια.', { ...THEMES.city, water: 'sea', waterColor: '#3f6f86', landmarks: ['dutchMill', 'bridge'], hills: 0.5 }),
      city('the-hague', 'Χάγη', 'Η πόλη όπου βρίσκονται η κυβέρνηση της Ολλανδίας και το Διεθνές Δικαστήριο, δίπλα στη Βόρεια Θάλασσα.', { ...THEMES.coast, sky: ['#8fbfe0', '#eef0f0'], deco: ['birch'], landmarks: ['palace', 'dutchMill'], hills: 0.5 }),
    ],
  },

  luxembourg: {
    name: 'Λουξεμβούργο',
    flag: '🇱🇺',
    colors: ['#ef3340', '#ffffff', '#00a3e0'],
    capital: 'Λουξεμβούργο',
    language: 'Λουξεμβουργιανά, Γαλλικά και Γερμανικά',
    currency: 'Ευρώ (€)',
    lonLat: [6.1, 49.8],
    neighbors: ['belgium', 'germany', 'france'],
    intro: 'Μία από τις μικρότερες χώρες της Ευρώπης – και το μοναδικό Μεγάλο Δουκάτο του κόσμου, με μεγάλο δούκα αντί για βασιλιά!',
    cities: [
      city('luxembourg-city', 'Λουξεμβούργο (πόλη)', 'Η πρωτεύουσα, χτισμένη πάνω σε απότομους βράχους πάνω από φαράγγια.', { ...THEMES.old, landmarks: ['fortress', 'bridge'], hills: 1.2 }),
      city('vianden', 'Βιάντεν', 'Μικρή πόλη στα δάση του βορρά, με ένα τεράστιο κάστρο πάνω σε λόφο.', { ...THEMES.north, water: 'river', waterColor: '#3f7f7a', landmarks: ['castle'], hills: 1.2 }),
    ],
  },
};
