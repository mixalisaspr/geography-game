// Βόρεια Ευρώπη: Δανία, Νορβηγία, Σουηδία, Φινλανδία, Ισλανδία
import { THEMES, city } from './helpers.js';

const ARCTIC = {
  ...THEMES.north,
  sky: ['#3b4f7a', '#a8c4d8'],
  far: '#7d8ea6',
  mid: '#9fb2b8',
  surface: 'snow',
  ground: '#6f6a66',
  top: '#ffffff',
  snow: true,
  deco: ['pine'],
};

export const NORTH = {
  denmark: {
    name: 'Δανία',
    flag: '🇩🇰',
    colors: ['#c8102e', '#ffffff', '#c8102e'],
    capital: 'Κοπεγχάγη',
    language: 'Δανικά',
    currency: 'Δανική κορόνα',
    lonLat: [9.5, 56.0],
    neighbors: ['germany'],
    sea: ['sweden', 'norway'],
    intro: 'Η χώρα των Βίκινγκ και του LEGO! Η Δανία έχει εκατοντάδες νησιά, και κανένα σημείο της δεν απέχει πολύ από τη θάλασσα.',
    cities: [
      city('copenhagen', 'Κοπεγχάγη', 'Η πρωτεύουσα της Δανίας, μια πόλη γεμάτη ποδήλατα, κανάλια και πολύχρωμα σπίτια.', { ...THEMES.city, sky: ['#8fbfe0', '#e8eef2'], water: 'sea', waterColor: '#3d6f8a', landmarks: ['palace', 'clocktower'], hills: 0.7 }),
      city('billund', 'Μπίλουντ', 'Μικρή πόλη στη Γιουτλάνδη, όπου γεννήθηκαν τα τουβλάκια LEGO.', { ...THEMES.plain, sky: ['#8fbfe0', '#eef2f0'], landmarks: ['church', 'castle'] }),
      city('aarhus', 'Ώρχους', 'Η δεύτερη μεγαλύτερη πόλη της Δανίας, με ένα πολύχρωμο μουσείο τέχνης.', { ...THEMES.city, sky: ['#8fbfe0', '#e8eef2'], water: 'sea', waterColor: '#3d6f8a', landmarks: ['gothic', 'clocktower'], hills: 0.7 }),
    ],
  },

  norway: {
    name: 'Νορβηγία',
    flag: '🇳🇴',
    colors: ['#ba0c2f', '#ffffff', '#00205b'],
    capital: 'Όσλο',
    language: 'Νορβηγικά',
    currency: 'Νορβηγική κορόνα',
    lonLat: [9.0, 61.5],
    neighbors: ['sweden', 'finland'],
    sea: ['denmark', 'iceland'],
    intro: 'Η χώρα των φιόρδ, με βαθιούς κόλπους ανάμεσα σε ψηλά βουνά. Στον βορρά της, το καλοκαίρι ο ήλιος δεν δύει για βδομάδες!',
    cities: [
      city('oslo', 'Όσλο', 'Η πρωτεύουσα της Νορβηγίας, στην άκρη ενός μεγάλου φιόρδ.', { ...THEMES.north, surface: 'road', top: '#55575e', water: 'sea', waterColor: '#2f6a86', landmarks: ['palace', 'church'], snow: true }),
      city('bergen', 'Μπέργκεν', 'Πόλη ανάμεσα σε επτά βουνά, η «πύλη των φιόρδ» στη δυτική Νορβηγία.', { ...THEMES.north, sky: ['#9bb7cc', '#e6eaee'], water: 'sea', waterColor: '#2f6a86', landmarks: ['church', 'lighthouse'], hills: 1.4 }),
      city('tromso', 'Τρόμσο', 'Πόλη στον μακρινό βορρά της Νορβηγίας, πάνω από τον Αρκτικό Κύκλο.', { ...ARCTIC, water: 'sea', waterColor: '#2a557a', landmarks: ['church'] }),
    ],
  },

  sweden: {
    name: 'Σουηδία',
    flag: '🇸🇪',
    colors: ['#006aa7', '#fecc00', '#006aa7'],
    capital: 'Στοκχόλμη',
    language: 'Σουηδικά',
    currency: 'Σουηδική κορόνα',
    lonLat: [15.5, 62.0],
    neighbors: ['norway', 'finland'],
    sea: ['denmark'],
    intro: 'Μια μεγάλη χώρα με δάση, λίμνες και πάνω από 250.000 νησιά! Από εδώ είναι οι ABBA και η Πίπη Φακιδομύτη.',
    cities: [
      city('stockholm', 'Στοκχόλμη', 'Η πρωτεύουσα της Σουηδίας, χτισμένη πάνω σε 14 νησιά.', { ...THEMES.city, sky: ['#8fbfe0', '#e8eef2'], water: 'sea', waterColor: '#3d6f8a', landmarks: ['palace', 'church'] }),
      city('gothenburg', 'Γκέτεμποργκ', 'Η δεύτερη μεγαλύτερη πόλη της Σουηδίας, με μεγάλο λιμάνι στη δυτική ακτή.', { ...THEMES.city, sky: ['#8fbfe0', '#e8eef2'], water: 'sea', waterColor: '#3d6f8a', landmarks: ['clocktower', 'lighthouse'] }),
      city('kiruna', 'Κιρούνα', 'Η βορειότερη πόλη της Σουηδίας, στη Λαπωνία, πάνω από τον Αρκτικό Κύκλο.', { ...ARCTIC, landmarks: ['church'] }),
    ],
  },

  finland: {
    name: 'Φινλανδία',
    flag: '🇫🇮',
    colors: ['#ffffff', '#002f6c', '#ffffff'],
    capital: 'Ελσίνκι',
    language: 'Φινλανδικά και Σουηδικά',
    currency: 'Ευρώ (€)',
    lonLat: [26.0, 63.0],
    neighbors: ['sweden', 'norway'],
    sea: ['estonia'],
    intro: 'Η «χώρα των χιλίων λιμνών» – στην πραγματικότητα έχει πάνω από 180.000! Εδώ γεννήθηκε η σάουνα.',
    cities: [
      city('helsinki', 'Ελσίνκι', 'Η πρωτεύουσα της Φινλανδίας, στις ακτές της Βαλτικής Θάλασσας.', { ...THEMES.city, sky: ['#8fbfe0', '#e8eef2'], water: 'sea', waterColor: '#3d6f8a', landmarks: ['cathedral', 'fortress'] }),
      city('rovaniemi', 'Ροβανιέμι', 'Η πρωτεύουσα της φινλανδικής Λαπωνίας, πάνω στη γραμμή του Αρκτικού Κύκλου – η «πόλη του Άι-Βασίλη»!', { ...ARCTIC, landmarks: ['church'] }),
      city('turku', 'Τούρκου', 'Η αρχαιότερη πόλη της Φινλανδίας και παλιά της πρωτεύουσα, πάνω στον ποταμό Αούρα.', { ...THEMES.north, water: 'river', waterColor: '#3d6f8a', landmarks: ['fortress', 'cathedral'] }),
    ],
  },

  iceland: {
    name: 'Ισλανδία',
    flag: '🇮🇸',
    colors: ['#02529c', '#ffffff', '#dc1e35'],
    capital: 'Ρέικιαβικ',
    language: 'Ισλανδικά',
    currency: 'Ισλανδική κορόνα',
    lonLat: [-18.5, 64.9],
    neighbors: [],
    sea: ['norway'],
    intro: 'Η «χώρα του πάγου και της φωτιάς»: ένα νησί με παγετώνες, ηφαίστεια και θερμοπίδακες στη μέση του Ατλαντικού!',
    cities: [
      city('reykjavik', 'Ρέικιαβικ', 'Η πρωτεύουσα της Ισλανδίας και η βορειότερη πρωτεύουσα κράτους στον κόσμο.', { ...THEMES.north, sky: ['#7fa9cf', '#e3edf2'], far: '#6f7c86', mid: '#7a8f6a', ground: '#4f4a46', top: '#6f8f4a', water: 'sea', waterColor: '#2f5f7a', deco: ['birch'], landmarks: ['church', 'lighthouse'] }),
      city('vik', 'Βικ', 'Ένα χωριό στη νότια ακτή της Ισλανδίας, με μια κατάμαυρη αμμουδιά.', { ...THEMES.north, sky: ['#7fa9cf', '#e3edf2'], far: '#6f7c86', mid: '#6f8a5f', surface: 'sand', ground: '#3a3836', top: '#2a2a2a', water: 'sea', waterColor: '#2f5f7a', deco: ['birch'], landmarks: ['lighthouse', 'church'], obstacles: ['rock', 'log', 'hay'] }),
    ],
  },
};
