// Βαλτική και Ανατολική Ευρώπη: Εσθονία, Λετονία, Λιθουανία, Ουκρανία, Μολδαβία
import { THEMES, city } from './helpers.js';

const BALTIC = { ...THEMES.north, sky: ['#8fbfe0', '#e8eef2'] };

export const EAST = {
  estonia: {
    name: 'Εσθονία',
    flag: '🇪🇪',
    colors: ['#0072ce', '#000000', '#ffffff'],
    capital: 'Ταλίν',
    language: 'Εσθονικά',
    currency: 'Ευρώ (€)',
    lonLat: [25.5, 58.7],
    neighbors: ['latvia'],
    sea: ['finland'],
    intro: 'Μια μικρή χώρα στη Βαλτική, από τις πιο «ψηφιακές» του κόσμου: εδώ φτιάχτηκε το Skype, και οι πολίτες μπορούν να ψηφίσουν από το διαδίκτυο!',
    cities: [
      city('tallinn', 'Ταλίν', 'Η πρωτεύουσα της Εσθονίας, με μια από τις καλύτερα διατηρημένες μεσαιωνικές πόλεις της Ευρώπης.', { ...THEMES.old, ...BALTIC, surface: 'cobble', top: '#b3a58f', water: 'sea', waterColor: '#3d6f8a', landmarks: ['fortress', 'church'], obstacles: ['crate', 'barrel', 'rock'] }),
      city('tartu', 'Τάρτου', 'Η πόλη των φοιτητών της Εσθονίας, με το παλαιότερο πανεπιστήμιο της χώρας.', { ...BALTIC, water: 'river', waterColor: '#3d6f7a', landmarks: ['church', 'clocktower'] }),
    ],
  },

  latvia: {
    name: 'Λετονία',
    flag: '🇱🇻',
    colors: ['#9e3039', '#ffffff', '#9e3039'],
    capital: 'Ρίγα',
    language: 'Λετονικά',
    currency: 'Ευρώ (€)',
    lonLat: [24.9, 56.9],
    neighbors: ['estonia', 'lithuania'],
    intro: 'Μια χώρα της Βαλτικής με μεγάλα δάση και αμμουδιές. Οι Λετονοί αγαπούν το τραγούδι: στη Γιορτή του Τραγουδιού τραγουδούν μαζί δεκάδες χιλιάδες άνθρωποι!',
    cities: [
      city('riga', 'Ρίγα', 'Η πρωτεύουσα της Λετονίας και η μεγαλύτερη πόλη των χωρών της Βαλτικής.', { ...THEMES.city, ...BALTIC, surface: 'road', top: '#55575e', water: 'river', waterColor: '#4a6a80', landmarks: ['gothic', 'church'] }),
      city('jurmala', 'Γιούρμαλα', 'Πόλη με μια αμμουδιά μήκους 33 χιλιομέτρων στον Κόλπο της Ρίγας.', { ...BALTIC, surface: 'sand', ground: '#a88a5f', top: '#e2cf9a', water: 'sea', waterColor: '#3d6f8a', landmarks: ['lighthouse', 'church'] }),
    ],
  },

  lithuania: {
    name: 'Λιθουανία',
    flag: '🇱🇹',
    colors: ['#fdb913', '#006a44', '#c1272d'],
    capital: 'Βίλνιους',
    language: 'Λιθουανικά',
    currency: 'Ευρώ (€)',
    lonLat: [23.9, 55.3],
    neighbors: ['latvia', 'poland'],
    intro: 'Η νοτιότερη χώρα της Βαλτικής. Η λιθουανική είναι από τις αρχαιότερες ζωντανές γλώσσες της Ευρώπης!',
    cities: [
      city('vilnius', 'Βίλνιους', 'Η πρωτεύουσα της Λιθουανίας, με μια μεγάλη παλιά πόλη γεμάτη εκκλησίες.', { ...THEMES.old, ...BALTIC, surface: 'cobble', top: '#b3a58f', water: 'river', waterColor: '#4a6a80', landmarks: ['parthenon', 'gothic'], obstacles: ['crate', 'barrel', 'rock'] }),
      city('trakai', 'Τράκαι', 'Μια μικρή πόλη ανάμεσα σε λίμνες, με ένα κάστρο πάνω σε νησί.', { ...BALTIC, water: 'lake', waterColor: '#3d7f9a', landmarks: ['castle', 'church'] }),
    ],
  },

  ukraine: {
    name: 'Ουκρανία',
    flag: '🇺🇦',
    colors: ['#0057b7', '#ffd700'],
    capital: 'Κίεβο',
    language: 'Ουκρανικά',
    currency: 'Γρίβνα',
    lonLat: [31.0, 49.0],
    neighbors: ['poland', 'slovakia', 'hungary', 'romania', 'moldova'],
    intro: 'Η μεγαλύτερη χώρα που βρίσκεται ολόκληρη μέσα στην Ευρώπη. Τα χωράφια της με σιτάρι και ηλιοτρόπια θυμίζουν τη σημαία της: γαλάζιος ουρανός πάνω από κίτρινα στάχυα.',
    cities: [
      city('kyiv', 'Κίεβο', 'Η πρωτεύουσα της Ουκρανίας, πάνω στον μεγάλο ποταμό Δνείπερο.', { ...THEMES.city, water: 'river', waterColor: '#4a7a9e', landmarks: ['cathedral', 'church'] }),
      city('lviv', 'Λβιβ', 'Μια πόλη στη δυτική Ουκρανία, με πλακόστρωτα, καφέ και μια παλιά πόλη μνημείο της UNESCO.', { ...THEMES.old, landmarks: ['clocktower', 'church'] }),
      city('odesa', 'Οδησσός', 'Μεγάλο λιμάνι της Ουκρανίας στη Μαύρη Θάλασσα, με μια διάσημη μνημειώδη σκάλα.', { ...THEMES.coast, deco: ['birch', 'pine'], waterColor: '#2a6f9e', landmarks: ['palace', 'lighthouse'] }),
    ],
  },

  moldova: {
    name: 'Μολδαβία',
    flag: '🇲🇩',
    colors: ['#0046ae', '#ffd200', '#cc092f'],
    capital: 'Κισινάου',
    language: 'Ρουμανικά',
    currency: 'Μολδαβικό λέου',
    lonLat: [28.5, 47.2],
    neighbors: ['romania', 'ukraine'],
    intro: 'Μια μικρή χώρα ανάμεσα στη Ρουμανία και την Ουκρανία, με λόφους, αμπέλια και χωριά. Οι κάτοικοι μιλούν ρουμανικά.',
    cities: [
      city('chisinau', 'Κισινάου', 'Η πρωτεύουσα της Μολδαβίας, μια πόλη με πολλά πάρκα και δέντρα.', { ...THEMES.city, landmarks: ['arch', 'cathedral'] }),
      city('orheiul-vechi', 'Παλιό Ορχέι', 'Ένα αρχαιολογικό τοπίο με ένα μοναστήρι σκαμμένο μέσα σε βράχο, πάνω από ένα ποτάμι.', { ...THEMES.plain, water: 'river', waterColor: '#4f8a7a', landmarks: ['cliffChurch'], hills: 1.1 }),
    ],
  },
};
