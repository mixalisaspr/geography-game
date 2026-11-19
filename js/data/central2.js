// Κεντρική Ευρώπη (μέρος 2): Ελβετία, Γερμανία, Τσεχία, Σλοβακία, Πολωνία
import { THEMES, city } from './helpers.js';

export const CENTRAL2 = {
  switzerland: {
    name: 'Ελβετία',
    flag: '🇨🇭',
    colors: ['#da291c', '#ffffff', '#da291c'],
    capital: 'Βέρνη',
    language: 'Γερμανικά, Γαλλικά, Ιταλικά και Ρομανικά',
    currency: 'Ελβετικό φράγκο',
    lonLat: [8.2, 46.8],
    neighbors: ['austria', 'italy', 'germany', 'france'],
    intro: 'Μια ορεινή χώρα με λίμνες και Άλπεις, που έχει τέσσερις επίσημες γλώσσες! Είναι γνωστή για τις σοκολάτες, τα τυριά και τα ρολόγια της.',
    cities: [
      city('bern', 'Βέρνη', 'Η πρωτεύουσα της Ελβετίας, με μια μεσαιωνική παλιά πόλη πάνω σε μια στροφή του ποταμού Άαρε.', { ...THEMES.old, water: 'river', waterColor: '#3a9fb0', landmarks: ['clocktower', 'gothic'], deco: ['pine', 'birch'] }),
      city('zurich', 'Ζυρίχη', 'Η μεγαλύτερη πόλη της Ελβετίας, δίπλα σε μια μεγάλη λίμνη.', { ...THEMES.city, water: 'lake', waterColor: '#3a9fc4', landmarks: ['church', 'gothic'] }),
      city('zermatt', 'Τσέρματ', 'Ένα χωριό στις Άλπεις, στους πρόποδες του διάσημου βουνού Μάτερχορν.', { ...THEMES.alps, hills: 1.4, landmarks: ['church', 'castle'] }),
    ],
  },

  germany: {
    name: 'Γερμανία',
    flag: '🇩🇪',
    colors: ['#000000', '#dd0000', '#ffce00'],
    capital: 'Βερολίνο',
    language: 'Γερμανικά',
    currency: 'Ευρώ (€)',
    lonLat: [10.4, 51.1],
    neighbors: ['austria', 'switzerland', 'czechia', 'poland', 'france', 'luxembourg', 'belgium', 'netherlands', 'denmark'],
    intro: 'Η χώρα με τον μεγαλύτερο πληθυσμό στην Ευρωπαϊκή Ένωση. Οι Γερμανοί φτιάχνουν πάνω από 1.000 είδη λουκάνικων και χιλιάδες είδη ψωμιού!',
    cities: [
      city('berlin', 'Βερολίνο', 'Η πρωτεύουσα της Γερμανίας, μια μεγάλη πόλη με πολλή ιστορία, μουσεία και πάρκα.', { ...THEMES.city, water: 'river', waterColor: '#4a7390', landmarks: ['gate', 'parliament'] }),
      city('munich', 'Μόναχο', 'Η πρωτεύουσα της Βαυαρίας, στον νότο της Γερμανίας, κοντά στις Άλπεις.', { ...THEMES.city, snow: true, landmarks: ['castle', 'gothic'] }),
      city('hamburg', 'Αμβούργο', 'Μεγάλο λιμάνι στον βορρά της Γερμανίας, με κανάλια και γέφυρες.', { ...THEMES.city, sky: ['#8fbfe0', '#e8eef2'], water: 'river', waterColor: '#3f6f8f', landmarks: ['clocktower', 'gothic'] }),
    ],
  },

  czechia: {
    name: 'Τσεχία',
    flag: '🇨🇿',
    colors: ['#ffffff', '#d7141a', '#11457e'],
    capital: 'Πράγα',
    language: 'Τσεχικά',
    currency: 'Τσεχική κορόνα',
    lonLat: [15.4, 49.8],
    neighbors: ['germany', 'poland', 'slovakia', 'austria'],
    intro: 'Μια χώρα με πάνω από 2.000 κάστρα και πύργους – από τις χώρες με τα περισσότερα κάστρα στον κόσμο!',
    cities: [
      city('prague', 'Πράγα', 'Η «πόλη με τους εκατό πύργους», πρωτεύουσα της Τσεχίας, πάνω στον ποταμό Μολδάβα (Βλτάβα).', { ...THEMES.old, water: 'river', waterColor: '#4a7f99', landmarks: ['castle', 'bridge'] }),
      city('brno', 'Μπρνο', 'Η δεύτερη μεγαλύτερη πόλη της Τσεχίας, στην περιοχή της Μοραβίας.', { ...THEMES.city, landmarks: ['gothic', 'fortress'] }),
      city('cesky-krumlov', 'Τσέσκι Κρούμλοφ', 'Μια παραμυθένια μεσαιωνική πόλη, μέσα σε μια μεγάλη στροφή του ποταμού Μολδάβα.', { ...THEMES.old, water: 'river', waterColor: '#3f8a7a', landmarks: ['castle', 'church'], deco: ['pine'] }),
    ],
  },

  slovakia: {
    name: 'Σλοβακία',
    flag: '🇸🇰',
    colors: ['#ffffff', '#0b4ea2', '#ee1c25'],
    capital: 'Μπρατισλάβα',
    language: 'Σλοβακικά',
    currency: 'Ευρώ (€)',
    lonLat: [19.7, 48.7],
    neighbors: ['czechia', 'poland', 'hungary', 'austria', 'ukraine'],
    intro: 'Μια ορεινή χώρα στην καρδιά της Ευρώπης, με τα βουνά Τάτρα και χιλιάδες σπηλιές. Ήταν ενωμένη με την Τσεχία ως το 1993.',
    cities: [
      city('bratislava', 'Μπρατισλάβα', 'Η πρωτεύουσα της Σλοβακίας, πάνω στον Δούναβη, πολύ κοντά στα σύνορα με την Αυστρία και την Ουγγαρία.', { ...THEMES.city, water: 'river', waterColor: '#4a7e9e', landmarks: ['fortress', 'bridge'] }),
      city('kosice', 'Κόσιτσε', 'Η δεύτερη μεγαλύτερη πόλη της Σλοβακίας, με έναν μεγάλο γοτθικό καθεδρικό ναό.', { ...THEMES.old, landmarks: ['gothic', 'clocktower'] }),
      city('poprad', 'Πόπραντ (Τάτρα)', 'Η πόλη στους πρόποδες των Ψηλών Τάτρα, των ψηλότερων βουνών της Σλοβακίας.', { ...THEMES.alps, landmarks: ['church'] }),
    ],
  },

  poland: {
    name: 'Πολωνία',
    flag: '🇵🇱',
    colors: ['#ffffff', '#dc143c'],
    capital: 'Βαρσοβία',
    language: 'Πολωνικά',
    currency: 'Ζλότι',
    lonLat: [19.4, 52.1],
    neighbors: ['germany', 'czechia', 'slovakia', 'lithuania', 'ukraine'],
    intro: 'Μια μεγάλη χώρα με πεδιάδες, δάση και τη Βαλτική Θάλασσα στον βορρά. Στα δάση της ζουν άγριοι βίσονες, τα μεγαλύτερα ζώα της στεριάς της Ευρώπης!',
    cities: [
      city('warsaw', 'Βαρσοβία', 'Η πρωτεύουσα της Πολωνίας, πάνω στον ποταμό Βιστούλα.', { ...THEMES.city, water: 'river', waterColor: '#4d7e9c', landmarks: ['palace', 'castle'] }),
      city('krakow', 'Κρακοβία', 'Η παλιά βασιλική πρωτεύουσα της Πολωνίας, με μια από τις μεγαλύτερες μεσαιωνικές πλατείες της Ευρώπης.', { ...THEMES.old, landmarks: ['castle', 'gothic'] }),
      city('gdansk', 'Γκντανσκ', 'Πόλη-λιμάνι στη Βαλτική Θάλασσα, με πολύχρωμα σπίτια και μεγάλη ναυτική ιστορία.', { ...THEMES.north, surface: 'cobble', top: '#b3a58f', water: 'sea', waterColor: '#3d7196', landmarks: ['clocktower', 'gothic'], obstacles: ['barrel', 'crate', 'rock'] }),
    ],
  },
};
