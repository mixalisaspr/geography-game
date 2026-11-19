// Νησιά της Μεσογείου: Κύπρος, Μάλτα (συνδέονται μέσω θάλασσας)
import { THEMES, city } from './helpers.js';

const MED = { sky: ['#4fb0ef', '#fff0cf'], far: '#b8a68c', mid: '#a7a86b' };

export const ISLANDS = {
  cyprus: {
    name: 'Κύπρος',
    flag: '🇨🇾',
    colors: ['#ffffff', '#d57800', '#ffffff'],
    capital: 'Λευκωσία',
    language: 'Ελληνικά και Τουρκικά',
    currency: 'Ευρώ (€)',
    lonLat: [33.2, 35.0],
    neighbors: [],
    sea: ['greece'],
    intro: 'Το τρίτο μεγαλύτερο νησί της Μεσογείου. Σύμφωνα με τη μυθολογία, εδώ γεννήθηκε η θεά Αφροδίτη μέσα από τα κύματα!',
    cities: [
      city('nicosia', 'Λευκωσία', 'Η πρωτεύουσα της Κύπρου, στο κέντρο του νησιού, με παλιά ενετικά τείχη.', { ...THEMES.old, ...MED, landmarks: ['fortress', 'church'], deco: ['olive', 'cypress'] }),
      city('limassol', 'Λεμεσός', 'Η δεύτερη μεγαλύτερη πόλη της Κύπρου, με μεγάλο λιμάνι και παραλίες.', { ...THEMES.coast, landmarks: ['theater', 'fortress'] }),
      city('paphos', 'Πάφος', 'Μια παραθαλάσσια πόλη με αρχαία ψηφιδωτά, κοντά στο σημείο όπου, κατά τον μύθο, γεννήθηκε η Αφροδίτη.', { ...THEMES.coast, landmarks: ['lighthouse', 'theater'] }),
    ],
  },

  malta: {
    name: 'Μάλτα',
    flag: '🇲🇹',
    colors: ['#ffffff', '#cf142b'],
    capital: 'Βαλέτα',
    language: 'Μαλτέζικα και Αγγλικά',
    currency: 'Ευρώ (€)',
    lonLat: [14.4, 35.9],
    neighbors: [],
    sea: ['italy'],
    intro: 'Το μικρότερο κράτος της Ευρωπαϊκής Ένωσης: ένα μικρό αρχιπέλαγος στη μέση της Μεσογείου, με ναούς πιο παλιούς από τις πυραμίδες της Αιγύπτου!',
    cities: [
      city('valletta', 'Βαλέτα', 'Η πρωτεύουσα της Μάλτας, από τις μικρότερες πρωτεύουσες της Ευρώπης, χτισμένη από ιππότες.', { ...THEMES.coast, surface: 'cobble', ground: '#c9a46a', top: '#e0cf9f', landmarks: ['fortress', 'cathedral'] }),
      city('gozo', 'Γκόζο', 'Το δεύτερο μεγαλύτερο νησί της Μάλτας, πιο ήσυχο και πράσινο.', { ...THEMES.coast, landmarks: ['lighthouse', 'church'] }),
    ],
  },
};
