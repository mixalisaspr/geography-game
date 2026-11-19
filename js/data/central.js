// Κεντρική Ευρώπη (μέρος 1): Σλοβενία, Αυστρία, Ιταλία
import { THEMES, city } from './helpers.js';

export const CENTRAL = {
  slovenia: {
    name: 'Σλοβενία',
    flag: '🇸🇮',
    colors: ['#ffffff', '#005da4', '#ed1c24'],
    capital: 'Λιουμπλιάνα',
    language: 'Σλοβενικά',
    currency: 'Ευρώ (€)',
    lonLat: [14.8, 46.1],
    neighbors: ['italy', 'austria', 'hungary', 'croatia'],
    intro: 'Μικρή χώρα με Άλπεις, σπηλιές και λίγα χιλιόμετρα ακτής στην Αδριατική. Πάνω από τη μισή της έκταση καλύπτεται από δάση!',
    cities: [
      city('ljubljana', 'Λιουμπλιάνα', 'Η πρωτεύουσα της Σλοβενίας, με ένα ποτάμι να τη διασχίζει και ένα κάστρο πάνω σε λόφο.', { ...THEMES.city, water: 'river', waterColor: '#3f8a8c', landmarks: ['castle', 'bridge'] }),
      city('bled', 'Μπλεντ', 'Μια λίμνη στις Άλπεις με ένα μικρό νησάκι και μια εκκλησία στη μέση του νερού.', { ...THEMES.alps, water: 'lake', waterColor: '#2f9bb0', landmarks: ['cliffChurch', 'castle'] }),
      city('piran', 'Πιράν', 'Μια μικρή πόλη στη σλοβενική ακτή της Αδριατικής, με σπίτια σε βενετσιάνικο ρυθμό.', { ...THEMES.coast, landmarks: ['clocktower', 'lighthouse'] }),
    ],
  },

  austria: {
    name: 'Αυστρία',
    flag: '🇦🇹',
    colors: ['#ed2939', '#ffffff', '#ed2939'],
    capital: 'Βιέννη',
    language: 'Γερμανικά',
    currency: 'Ευρώ (€)',
    lonLat: [14.5, 47.6],
    neighbors: ['hungary', 'slovenia', 'italy', 'germany', 'czechia', 'slovakia', 'switzerland'],
    intro: 'Μια ορεινή χώρα στην καρδιά της Ευρώπης: σχεδόν τα δύο τρίτα της είναι Άλπεις! Είναι η πατρίδα πολλών μεγάλων μουσικών.',
    cities: [
      city('vienna', 'Βιέννη', 'Η πρωτεύουσα της Αυστρίας, πόλη των παλατιών, των καφέ και της κλασικής μουσικής.', { ...THEMES.city, water: 'river', waterColor: '#4a7e9e', landmarks: ['palace', 'gothic'] }),
      city('salzburg', 'Σάλτσμπουργκ', 'Μια όμορφη πόλη ανάμεσα στα βουνά, με ένα τεράστιο κάστρο πάνω από την παλιά πόλη.', { ...THEMES.alps, water: 'river', waterColor: '#4f8fae', landmarks: ['fortress', 'church'] }),
      city('innsbruck', 'Ίνσμπρουκ', 'Η πρωτεύουσα του Τιρόλου, περικυκλωμένη από ψηλά χιονισμένα βουνά.', { ...THEMES.alps, landmarks: ['church', 'castle'] }),
    ],
  },

  italy: {
    name: 'Ιταλία',
    flag: '🇮🇹',
    colors: ['#009246', '#ffffff', '#ce2b37'],
    capital: 'Ρώμη',
    language: 'Ιταλικά',
    currency: 'Ευρώ (€)',
    lonLat: [12.5, 42.8],
    neighbors: ['austria', 'slovenia', 'switzerland', 'france'],
    sea: ['greece', 'malta'],
    intro: 'Η χώρα σε σχήμα μπότας! Είναι από τις χώρες με τα περισσότερα μνημεία παγκόσμιας κληρονομιάς της UNESCO, και η πατρίδα της πίτσας.',
    cities: [
      city('rome', 'Ρώμη', 'Η «Αιώνια Πόλη», πρωτεύουσα της Ιταλίας και κάποτε κέντρο της Ρωμαϊκής Αυτοκρατορίας.', { ...THEMES.old, sky: ['#5fb5ee', '#ffe6c2'], landmarks: ['colosseum', 'arch'], obstacles: ['column', 'amphora', 'rock'], deco: ['cypress', 'olive'] }),
      city('venice', 'Βενετία', 'Μια πόλη χτισμένη πάνω σε πάνω από 100 νησάκια, όπου οι δρόμοι είναι κανάλια με νερό!', { ...THEMES.old, water: 'sea', waterColor: '#2e8b9a', landmarks: ['clocktower', 'bridge'], deco: ['cypress'] }),
      city('naples', 'Νάπολη', 'Μια ζωντανή πόλη στη νότια Ιταλία, δίπλα στη θάλασσα και στο ηφαίστειο Βεζούβιο.', { ...THEMES.coast, landmarks: ['castle', 'lighthouse'] }),
    ],
  },
};
