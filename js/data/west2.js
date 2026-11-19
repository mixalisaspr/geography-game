// Δυτική Ευρώπη (μέρος 2): Ισπανία, Πορτογαλία, Ηνωμένο Βασίλειο, Ιρλανδία
import { THEMES, city } from './helpers.js';

const SUNNY = { sky: ['#4fb0ef', '#fff0cf'], far: '#b8a68c', mid: '#a7a86b', ground: '#b58a55', top: '#c2a45c', deco: ['olive', 'palm'] };
const RAINY = { sky: ['#9bb7cc', '#e6eaee'], far: '#7d8fa0', mid: '#5f9a55' };

export const WEST2 = {
  spain: {
    name: 'Ισπανία',
    flag: '🇪🇸',
    colors: ['#aa151b', '#f1bf00', '#aa151b'],
    capital: 'Μαδρίτη',
    language: 'Ισπανικά',
    currency: 'Ευρώ (€)',
    lonLat: [-3.7, 40.3],
    neighbors: ['france', 'portugal'],
    intro: 'Μια μεγάλη ηλιόλουστη χώρα με φλαμένκο, κάστρα και πανέμορφες παραλίες. Τα ισπανικά τα μιλούν εκατοντάδες εκατομμύρια άνθρωποι σε όλο τον κόσμο!',
    cities: [
      city('madrid', 'Μαδρίτη', 'Η πρωτεύουσα της Ισπανίας, στο κέντρο της χώρας και σε μεγάλο υψόμετρο.', { ...THEMES.city, ...SUNNY, surface: 'road', top: '#55575e', landmarks: ['palace', 'arch'] }),
      city('barcelona', 'Βαρκελώνη', 'Μεγάλη πόλη δίπλα στη Μεσόγειο, πρωτεύουσα της Καταλονίας.', { ...THEMES.coast, landmarks: ['gothic', 'lighthouse'] }),
      city('seville', 'Σεβίλλη', 'Η πρωτεύουσα της Ανδαλουσίας, στον νότο της Ισπανίας, η πατρίδα του φλαμένκο.', { ...THEMES.plain, ...SUNNY, water: 'river', waterColor: '#4f8fa6', landmarks: ['clocktower', 'gothic'] }),
    ],
  },

  portugal: {
    name: 'Πορτογαλία',
    flag: '🇵🇹',
    colors: ['#046a38', '#da291c'],
    capital: 'Λισαβόνα',
    language: 'Πορτογαλικά',
    currency: 'Ευρώ (€)',
    lonLat: [-8.2, 39.6],
    neighbors: ['spain'],
    intro: 'Η δυτικότερη χώρα της ηπειρωτικής Ευρώπης, δίπλα στον Ατλαντικό Ωκεανό. Από εδώ ξεκίνησαν μεγάλοι θαλασσοπόροι για να εξερευνήσουν τον κόσμο!',
    cities: [
      city('lisbon', 'Λισαβόνα', 'Η πρωτεύουσα της Πορτογαλίας, χτισμένη σε λόφους δίπλα στον ποταμό Τάγο.', { ...THEMES.coast, ...SUNNY, surface: 'cobble', top: '#cfc4ad', water: 'sea', landmarks: ['fortress', 'bridge'] }),
      city('porto', 'Πόρτο', 'Η δεύτερη μεγαλύτερη πόλη της Πορτογαλίας, πάνω στον ποταμό Ντούρο, με πολύχρωμα σπίτια.', { ...THEMES.old, water: 'river', waterColor: '#3f7f95', landmarks: ['bridge', 'clocktower'] }),
      city('faro', 'Φάρο (Αλγκάρβε)', 'Η πρωτεύουσα του Αλγκάρβε, της ηλιόλουστης νότιας ακτής της Πορτογαλίας.', { ...THEMES.coast, landmarks: ['lighthouse', 'church'] }),
    ],
  },

  uk: {
    name: 'Ηνωμένο Βασίλειο',
    flag: '🇬🇧',
    colors: ['#012169', '#ffffff', '#c8102e'],
    capital: 'Λονδίνο',
    language: 'Αγγλικά',
    currency: 'Λίρα στερλίνα',
    lonLat: [-2.0, 53.5],
    neighbors: ['ireland'],
    sea: ['france'],
    intro: 'Το Ηνωμένο Βασίλειο αποτελείται από τέσσερις χώρες: την Αγγλία, τη Σκωτία, την Ουαλία και τη Βόρεια Ιρλανδία. Συνδέεται με τη Γαλλία μέσω μιας σήραγγας κάτω από τη θάλασσα!',
    cities: [
      city('london', 'Λονδίνο', 'Η πρωτεύουσα του Ηνωμένου Βασιλείου, πάνω στον ποταμό Τάμεση.', { ...THEMES.city, ...RAINY, water: 'river', waterColor: '#4a6a80', landmarks: ['bigben', 'palace'] }),
      city('edinburgh', 'Εδιμβούργο', 'Η πρωτεύουσα της Σκωτίας, με ένα κάστρο πάνω σε έναν βράχο από παλιό ηφαίστειο.', { ...THEMES.north, ...RAINY, landmarks: ['fortress', 'castle'], hills: 1.3 }),
      city('liverpool', 'Λίβερπουλ', 'Πόλη-λιμάνι στη βορειοδυτική Αγγλία, η πατρίδα των Beatles.', { ...THEMES.city, ...RAINY, water: 'sea', waterColor: '#4a6a80', landmarks: ['clocktower', 'gothic'] }),
    ],
  },

  ireland: {
    name: 'Ιρλανδία',
    flag: '🇮🇪',
    colors: ['#169b62', '#ffffff', '#ff883e'],
    capital: 'Δουβλίνο',
    language: 'Ιρλανδικά και Αγγλικά',
    currency: 'Ευρώ (€)',
    lonLat: [-8.0, 53.2],
    neighbors: ['uk'],
    intro: 'Το «Σμαραγδένιο Νησί», με καταπράσινα λιβάδια και πολλή βροχή. Σύμβολό του είναι το τριφύλλι!',
    cities: [
      city('dublin', 'Δουβλίνο', 'Η πρωτεύουσα της Ιρλανδίας, πάνω στον ποταμό Λίφι.', { ...THEMES.city, ...RAINY, water: 'river', waterColor: '#4a6a7a', landmarks: ['church', 'bridge'] }),
      city('galway', 'Γκόλγουεϊ', 'Μια ζωντανή πόλη στη δυτική ακτή της Ιρλανδίας, κοντά στους Βράχους του Μόχερ.', { ...THEMES.north, ...RAINY, water: 'sea', waterColor: '#3d6f8a', landmarks: ['lighthouse', 'castle'], hills: 1.2 }),
    ],
  },
};
