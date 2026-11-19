// Περιεχόμενο του παιχνιδιού: χώρες, πόλεις (πίστες), αντικείμενα συλλογής,
// σύντομες πληροφορίες, ερωτήσεις και θέματα (φόντο / εμπόδια).
//
// Για να προσθέσεις χώρα: πρόσθεσε μια εγγραφή στο COUNTRIES και βάλε το id της
// στα `neighbors` των χωρών με τις οποίες συνορεύει (τα σύνορα πρέπει να είναι αμφίδρομα).
//
// Θέμα πόλης (theme):
//   sky:        [πάνω, κάτω] χρώματα ουρανού
//   far, mid:   χρώματα μακρινών βουνών / κοντινών λόφων
//   ground,top: χρώμα εδάφους / επιφάνειας
//   surface:    'grass' | 'road' | 'sand' | 'cobble' | 'snow'
//   water:      null | 'sea' | 'lake' | 'river'  (θάλασσα/λίμνη στο φόντο, νερό στα κενά της πίστας)
//   landmarks:  αξιοθέατα στο φόντο (βλ. js/render.js → LANDMARKS)
//   obstacles:  εμπόδια πάνω στην πίστα (column, amphora, rock, crate, barrel, hay, log)
//   deco:       δέντρα (olive, cypress, pine, palm, birch)
//   hills:      πόσο λοφώδης είναι η πίστα (πολλαπλασιαστής)
//
// Χώρα: `neighbors` = κοινά σύνορα στη στεριά, `sea` = σύνδεση με πλοίο/γέφυρα/σήραγγα.
// Και τα δύο πρέπει να είναι αμφίδρομα (το ελέγχει τεστ).
//
// Οι κάρτες κάθε πόλης (2 αντικείμενα + 2 πληροφορίες, το καθένα με `quiz`) βρίσκονται
// στο js/data/cards*.js. Πρέπει να είναι ΣΥΝΤΟΜΕΣ (μία πρόταση) και να μιλούν για τη ΧΩΡΑ
// – για την πόλη μόνο αν είναι κάτι πολύ γνωστό. Η ερώτηση απαντιέται από το ίδιο το κείμενο.
// Η ΠΡΩΤΗ απάντηση είναι η σωστή – ανακατεύονται στο παιχνίδι.

import { T } from './helpers.js';
import { REGIONS } from './regions.js';
import { CARDS } from './cards.js';

export const START_COUNTRY = 'greece';

export const COUNTRIES = {
  greece: {
    name: 'Ελλάδα',
    flag: '🇬🇷',
    colors: ['#0d5eaf', '#ffffff'],
    capital: 'Αθήνα',
    language: 'Ελληνικά',
    currency: 'Ευρώ (€)',
    lonLat: [22.5, 39.3], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['albania', 'north-macedonia', 'bulgaria', 'turkey'],
    sea: ['italy', 'cyprus'],
    intro:
      'Η χώρα του ήλιου και της θάλασσας, με περίπου 6.000 νησιά και νησίδες! Εδώ γεννήθηκαν η δημοκρατία, το θέατρο και οι Ολυμπιακοί Αγώνες.',
    cities: [
      {
        id: 'athens',
        name: 'Αθήνα',
        intro:
          'Η πρωτεύουσα της Ελλάδας και μία από τις αρχαιότερες πόλεις του κόσμου. Πάνω από την πόλη δεσπόζει η Ακρόπολη.',
        theme: T({
          sky: ['#5fb8f2', '#fff0d2'],
          far: '#b8a68c',
          mid: '#a3a86b',
          ground: '#b58a55',
          top: '#93a64a',
          landmarks: ['parthenon'],
          obstacles: ['column', 'amphora', 'rock'],
          deco: ['olive', 'cypress'],
          hills: 0.8,
        }),
      },
      {
        id: 'thessaloniki',
        name: 'Θεσσαλονίκη',
        intro:
          'Η δεύτερη μεγαλύτερη πόλη της Ελλάδας, χτισμένη στον Θερμαϊκό κόλπο. Ο Λευκός Πύργος είναι το σύμβολό της.',
        theme: T({
          sky: ['#78bff0', '#ffd9b0'],
          far: '#93a7bd',
          mid: '#8ea56f',
          surface: 'road',
          ground: '#8d7a66',
          top: '#5d5f66',
          water: 'sea',
          waterColor: '#2c86c9',
          landmarks: ['whiteTower'],
          obstacles: ['barrel', 'crate', 'rock'],
          deco: ['cypress', 'pine'],
          hills: 0.9,
        }),
      },
      {
        id: 'heraklion',
        name: 'Ηράκλειο',
        intro:
          'Η μεγαλύτερη πόλη της Κρήτης, του μεγαλύτερου ελληνικού νησιού. Κοντά της βρίσκεται η Κνωσός, το ανάκτορο του θρυλικού βασιλιά Μίνωα.',
        theme: T({
          sky: ['#4fb0ef', '#fff3c9'],
          far: '#a99f8d',
          mid: '#9fa86a',
          surface: 'sand',
          ground: '#c49a62',
          top: '#e2c48a',
          water: 'sea',
          waterColor: '#1f9bd1',
          landmarks: ['fortress', 'windmill'],
          obstacles: ['amphora', 'rock', 'barrel'],
          deco: ['olive', 'palm'],
          hills: 1.1,
        }),
      },
    ],
  },

  albania: {
    name: 'Αλβανία',
    flag: '🇦🇱',
    colors: ['#e41e20', '#000000'],
    capital: 'Τίρανα',
    language: 'Αλβανικά',
    currency: 'Λεκ',
    lonLat: [20.0, 41.1], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['greece', 'north-macedonia', 'montenegro'],
    intro:
      'Οι Αλβανοί ονομάζουν τη χώρα τους «Σκιπερία» (Shqipëria), που συχνά μεταφράζεται «χώρα των αετών». Γι’ αυτό στη σημαία της υπάρχει ένας μαύρος δικέφαλος αετός.',
    cities: [
      {
        id: 'tirana',
        name: 'Τίρανα',
        intro: 'Η πρωτεύουσα της Αλβανίας από το 1920, γνωστή για τα πολύχρωμα βαμμένα κτίριά της.',
        theme: T({
          sky: ['#7cc4f2', '#ffe2c6'],
          far: '#8fa3b5',
          mid: '#8bad6a',
          surface: 'road',
          ground: '#8f7559',
          top: '#5a5c63',
          landmarks: ['clocktower', 'mosque'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['pine', 'cypress'],
        }),
      },
      {
        id: 'shkoder',
        name: 'Σκόδρα',
        intro:
          'Μία από τις αρχαιότερες πόλεις της Αλβανίας, δίπλα στη λίμνη της Σκόδρας, τη μεγαλύτερη λίμνη των Βαλκανίων.',
        theme: T({
          sky: ['#86c7ee', '#f2efd6'],
          far: '#7f95a8',
          mid: '#7ea866',
          water: 'lake',
          waterColor: '#3a8fb8',
          landmarks: ['fortress'],
          obstacles: ['rock', 'log', 'hay'],
          deco: ['pine', 'birch'],
          hills: 1.1,
        }),
      },
      {
        id: 'vlore',
        name: 'Αυλώνα',
        intro: 'Παραθαλάσσια πόλη στο σημείο όπου συναντιούνται η Αδριατική και το Ιόνιο πέλαγος.',
        theme: T({
          sky: ['#4db2f0', '#fff0cf'],
          far: '#9aa29a',
          mid: '#93ab6c',
          surface: 'sand',
          ground: '#c09663',
          top: '#dcc08a',
          water: 'sea',
          waterColor: '#1d96cf',
          landmarks: ['lighthouse', 'mosque'],
          obstacles: ['barrel', 'rock', 'amphora'],
          deco: ['olive', 'palm'],
        }),
      },
    ],
  },

  'north-macedonia': {
    name: 'Βόρεια Μακεδονία',
    flag: '🇲🇰',
    colors: ['#d20000', '#ffe600'],
    capital: 'Σκόπια',
    language: 'Μακεδονική (σλαβική γλώσσα) και Αλβανικά',
    currency: 'Δηνάριο',
    lonLat: [21.7, 41.6], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['greece', 'albania', 'bulgaria', 'serbia'],
    intro:
      'Μια ορεινή χώρα χωρίς θάλασσα, αλλά με όμορφες λίμνες. Ονομάζεται «Βόρεια Μακεδονία» από το 2019, μετά τη Συμφωνία των Πρεσπών με την Ελλάδα.',
    cities: [
      {
        id: 'skopje',
        name: 'Σκόπια',
        intro: 'Η πρωτεύουσα και μεγαλύτερη πόλη της χώρας, χτισμένη στις όχθες του ποταμού Αξιού (Βαρντάρη).',
        theme: T({
          sky: ['#7dc0ee', '#ffe4c4'],
          far: '#8c9fb0',
          mid: '#8aa766',
          surface: 'road',
          ground: '#8e7458',
          top: '#5b5d64',
          water: 'river',
          waterColor: '#4f8fae',
          landmarks: ['bridge', 'fortress'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['pine', 'birch'],
        }),
      },
      {
        id: 'ohrid',
        name: 'Αχρίδα',
        intro:
          'Πόλη στις όχθες της λίμνης Αχρίδας. Λέγεται ότι κάποτε είχε 365 εκκλησίες – μία για κάθε μέρα του χρόνου!',
        theme: T({
          sky: ['#8ccdf2', '#f7ecd8'],
          far: '#7c93a8',
          mid: '#79a463',
          water: 'lake',
          waterColor: '#2f88b5',
          landmarks: ['cliffChurch'],
          obstacles: ['rock', 'log', 'hay'],
          deco: ['pine', 'cypress'],
          hills: 1.15,
        }),
      },
      {
        id: 'bitola',
        name: 'Μπίτολα',
        intro:
          'Η Μπίτολα, γνωστή στα ελληνικά και ως Μοναστήρι, βρίσκεται στους πρόποδες του όρους Περιστέρι (Πελίστερ).',
        theme: T({
          sky: ['#79c0ef', '#fde6c8'],
          far: '#8a9cab',
          mid: '#86a663',
          landmarks: ['clocktower', 'parthenon'],
          obstacles: ['column', 'rock', 'crate'],
          deco: ['pine', 'birch'],
          hills: 1.2,
          snow: true,
        }),
      },
    ],
  },

  bulgaria: {
    name: 'Βουλγαρία',
    flag: '🇧🇬',
    colors: ['#00966e', '#d62612'],
    capital: 'Σόφια',
    language: 'Βουλγαρικά',
    currency: 'Ευρώ (€) – από το 2026· πριν ήταν το λεβ',
    lonLat: [25.3, 42.7], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['greece', 'north-macedonia', 'serbia', 'romania', 'turkey'],
    intro:
      'Μια χώρα με βουνά, τη Μαύρη Θάλασσα και τριαντάφυλλα. Παράξενο αλλά αληθινό: πολλοί Βούλγαροι κουνάνε το κεφάλι πάνω-κάτω για να πουν «όχι» και δεξιά-αριστερά για να πουν «ναι»!',
    cities: [
      {
        id: 'sofia',
        name: 'Σόφια',
        intro: 'Η πρωτεύουσα της Βουλγαρίας, χτισμένη στους πρόποδες του βουνού Βίτοσα.',
        theme: T({
          sky: ['#7fbfe9', '#eef0f2'],
          far: '#8fa0b8',
          mid: '#7ca064',
          surface: 'cobble',
          ground: '#86725e',
          top: '#c9a646',
          landmarks: ['cathedral'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['pine', 'birch'],
          snow: true,
        }),
      },
      {
        id: 'plovdiv',
        name: 'Φιλιππούπολη',
        intro:
          'Η δεύτερη μεγαλύτερη πόλη της Βουλγαρίας (Πλόβντιβ) και μία από τις αρχαιότερες πόλεις της Ευρώπης που κατοικούνται συνεχώς.',
        theme: T({
          sky: ['#6db9ee', '#ffe9c9'],
          far: '#a39c95',
          mid: '#8fa765',
          ground: '#a57c51',
          top: '#86a948',
          landmarks: ['theater'],
          obstacles: ['column', 'rock', 'amphora'],
          deco: ['cypress', 'birch'],
        }),
      },
      {
        id: 'varna',
        name: 'Βάρνα',
        intro: 'Η «θαλασσινή πρωτεύουσα» της Βουλγαρίας, στις ακτές της Μαύρης Θάλασσας.',
        theme: T({
          sky: ['#6eb7e6', '#f3ead9'],
          far: '#8ea0ad',
          mid: '#86a66a',
          surface: 'sand',
          ground: '#b8925f',
          top: '#d8bf8a',
          water: 'sea',
          waterColor: '#2a6f9e',
          landmarks: ['lighthouse', 'cathedral'],
          obstacles: ['barrel', 'crate', 'rock'],
          deco: ['pine', 'birch'],
        }),
      },
    ],
  },

  turkey: {
    name: 'Τουρκία',
    flag: '🇹🇷',
    colors: ['#e30a17', '#ffffff'],
    capital: 'Άγκυρα',
    language: 'Τουρκικά',
    currency: 'Τουρκική λίρα',
    lonLat: [31.0, 39.6], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['greece', 'bulgaria'],
    intro:
      'Μια μεγάλη χώρα που απλώνεται σε δύο ηπείρους: ένα μικρό κομμάτι της βρίσκεται στην Ευρώπη και το μεγαλύτερο στην Ασία (Μικρά Ασία).',
    cities: [
      {
        id: 'istanbul',
        name: 'Κωνσταντινούπολη',
        intro:
          'Η μεγαλύτερη πόλη της Τουρκίας (Ιστανμπούλ), χτισμένη και στις δύο πλευρές του Βοσπόρου – μισή στην Ευρώπη και μισή στην Ασία!',
        theme: T({
          sky: ['#6fb3e6', '#ffd6a8'],
          far: '#8f9db2',
          mid: '#879f6c',
          surface: 'cobble',
          ground: '#8b7661',
          top: '#a89a87',
          water: 'sea',
          waterColor: '#2878b0',
          landmarks: ['mosque'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['cypress', 'pine'],
        }),
      },
      {
        id: 'ankara',
        name: 'Άγκυρα',
        intro: 'Η πρωτεύουσα της Τουρκίας από το 1923, στην καρδιά της Ανατολίας.',
        theme: T({
          sky: ['#79bdea', '#f6e3c0'],
          far: '#b2a38c',
          mid: '#b3a36b',
          ground: '#b08959',
          top: '#b9a258',
          landmarks: ['parthenon', 'fortress'],
          obstacles: ['rock', 'crate', 'hay'],
          deco: ['birch'],
          hills: 0.9,
        }),
      },
      {
        id: 'goreme',
        name: 'Γκιόρεμε (Καππαδοκία)',
        intro:
          'Μια μικρή πόλη στην Καππαδοκία, ανάμεσα σε παράξενους βράχους σε σχήμα καμινάδας: τις «νεραϊδοκαμινάδες».',
        theme: T({
          sky: ['#f6a96b', '#ffe6b8'],
          far: '#c79f7c',
          mid: '#c9a77d',
          surface: 'sand',
          ground: '#c08c5e',
          top: '#dcb68a',
          landmarks: ['chimneys'],
          obstacles: ['rock', 'amphora', 'hay'],
          deco: ['birch'],
          balloons: true,
          hills: 1.2,
        }),
      },
    ],
  },

  serbia: {
    name: 'Σερβία',
    flag: '🇷🇸',
    colors: ['#c6363c', '#0c4076'],
    capital: 'Βελιγράδι',
    language: 'Σερβικά',
    currency: 'Σερβικό δηνάριο',
    lonLat: [20.9, 44.1], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['north-macedonia', 'bulgaria', 'romania', 'hungary', 'croatia', 'bosnia', 'montenegro'],
    intro:
      'Μια χώρα χωρίς θάλασσα, που τη διασχίζει ο μεγάλος ποταμός Δούναβης. Τα σερβικά γράφονται και με κυριλλικά και με λατινικά γράμματα!',
    cities: [
      {
        id: 'belgrade',
        name: 'Βελιγράδι',
        intro:
          'Η πρωτεύουσα της Σερβίας, εκεί όπου ο ποταμός Σάβας συναντά τον Δούναβη. Το όνομά της σημαίνει «Λευκή Πόλη».',
        theme: T({
          sky: ['#7fb8e4', '#f1e6d6'],
          far: '#8e9cad',
          mid: '#7c9f63',
          surface: 'road',
          ground: '#86705a',
          top: '#55575e',
          water: 'river',
          waterColor: '#4d7f9c',
          landmarks: ['fortress', 'cathedral'],
          obstacles: ['crate', 'barrel', 'log'],
          deco: ['birch', 'pine'],
        }),
      },
      {
        id: 'novi-sad',
        name: 'Νόβι Σαντ',
        intro: 'Η δεύτερη μεγαλύτερη πόλη της Σερβίας, στις όχθες του Δούναβη, στην πεδιάδα της Βοϊβοντίνας.',
        theme: T({
          sky: ['#86c2ec', '#fbeec8'],
          far: '#a4b0b8',
          mid: '#9cb466',
          ground: '#8d6e4c',
          top: '#8fb747',
          water: 'river',
          waterColor: '#4f86a5',
          landmarks: ['fortress', 'clocktower'],
          obstacles: ['hay', 'log', 'crate'],
          deco: ['birch'],
          hills: 0.75,
        }),
      },
      {
        id: 'nis',
        name: 'Νις',
        intro: 'Μία από τις αρχαιότερες πόλεις των Βαλκανίων, γνωστή στα αρχαία χρόνια ως Ναϊσσός.',
        theme: T({
          sky: ['#78b9e8', '#fbe4c6'],
          far: '#8c9bab',
          mid: '#82a464',
          landmarks: ['fortress'],
          obstacles: ['rock', 'log', 'crate'],
          deco: ['pine', 'birch'],
          hills: 1.2,
        }),
      },
    ],
  },

  montenegro: {
    name: 'Μαυροβούνιο',
    flag: '🇲🇪',
    colors: ['#c40308', '#d4af37'],
    capital: 'Ποντγκόριτσα',
    language: 'Μαυροβουνιακά',
    currency: 'Ευρώ (€)',
    lonLat: [19.3, 42.8], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['albania', 'serbia', 'bosnia', 'croatia'],
    intro:
      'Το όνομά του σημαίνει «μαύρο βουνό», από τα σκοτεινά δασωμένα βουνά του. Μικρή χώρα, αλλά με ψηλά βουνά και υπέροχες ακτές στην Αδριατική.',
    cities: [
      {
        id: 'podgorica',
        name: 'Ποντγκόριτσα',
        intro: 'Η πρωτεύουσα του Μαυροβουνίου, εκεί όπου συναντιούνται οι ποταμοί Μόρατσα και Ριμπνίτσα.',
        theme: T({
          sky: ['#78bbe9', '#f8e6cc'],
          far: '#6f8396',
          mid: '#6f9a5c',
          surface: 'road',
          ground: '#80705f',
          top: '#55575e',
          water: 'river',
          waterColor: '#3f93a8',
          landmarks: ['bridge', 'cathedral'],
          obstacles: ['rock', 'crate', 'log'],
          deco: ['pine', 'cypress'],
        }),
      },
      {
        id: 'kotor',
        name: 'Κότορ',
        intro: 'Μια μεσαιωνική πόλη μέσα σε έναν βαθύ κόλπο της Αδριατικής, που μοιάζει με φιόρδ.',
        theme: T({
          sky: ['#6db4e8', '#fbe9d0'],
          far: '#5f7387',
          mid: '#6f975c',
          surface: 'cobble',
          ground: '#8a7a66',
          top: '#b3a58f',
          water: 'sea',
          waterColor: '#1f7fa8',
          landmarks: ['fortress'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['cypress', 'olive'],
          hills: 1.3,
        }),
      },
      {
        id: 'budva',
        name: 'Μπούντβα',
        intro: 'Μία από τις αρχαιότερες πόλεις της Αδριατικής, με παλιά πόλη μέσα σε τείχη και πολλές παραλίες.',
        theme: T({
          sky: ['#55b1ee', '#fff1d4'],
          far: '#71879b',
          mid: '#7da163',
          surface: 'sand',
          ground: '#bd9563',
          top: '#e0c58f',
          water: 'sea',
          waterColor: '#1a92c4',
          landmarks: ['fortress', 'lighthouse'],
          obstacles: ['barrel', 'rock', 'amphora'],
          deco: ['palm', 'olive'],
        }),
      },
    ],
  },

  romania: {
    name: 'Ρουμανία',
    flag: '🇷🇴',
    colors: ['#002b7f', '#fcd116'],
    capital: 'Βουκουρέστι',
    language: 'Ρουμανικά',
    currency: 'Λέου',
    lonLat: [24.9, 45.9], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['bulgaria', 'serbia', 'hungary', 'ukraine', 'moldova'],
    intro:
      'Τα ρουμανικά είναι λατινογενής γλώσσα, συγγενική με τα ιταλικά! Η χώρα έχει τα βουνά Καρπάθια, πυκνά δάση και το Δέλτα του Δούναβη.',
    cities: [
      {
        id: 'bucharest',
        name: 'Βουκουρέστι',
        intro: 'Η πρωτεύουσα και μεγαλύτερη πόλη της Ρουμανίας, που κάποτε την έλεγαν «Μικρό Παρίσι».',
        theme: T({
          sky: ['#82bde8', '#f3e4d2'],
          far: '#9aa6b4',
          mid: '#86a467',
          surface: 'road',
          ground: '#87735f',
          top: '#56585f',
          landmarks: ['palace', 'arch'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['birch', 'pine'],
          hills: 0.85,
        }),
      },
      {
        id: 'brasov',
        name: 'Μπρασόβ',
        intro: 'Μια μεσαιωνική πόλη στην Τρανσυλβανία, ανάμεσα στα βουνά Καρπάθια.',
        theme: T({
          sky: ['#7ab4e0', '#e9eef0'],
          far: '#6d8096',
          mid: '#5f8e55',
          ground: '#7a6450',
          top: '#5f9c45',
          landmarks: ['castle'],
          obstacles: ['log', 'rock', 'hay'],
          deco: ['pine'],
          snow: true,
          hills: 1.3,
        }),
      },
      {
        id: 'constanta',
        name: 'Κωνστάντζα',
        intro:
          'Το μεγαλύτερο λιμάνι της Ρουμανίας, στη Μαύρη Θάλασσα. Στην αρχαιότητα ήταν η ελληνική αποικία Τόμις.',
        theme: T({
          sky: ['#74b8e6', '#f6ead6'],
          far: '#8c9eae',
          mid: '#89a76b',
          surface: 'sand',
          ground: '#b48f60',
          top: '#d6bd8b',
          water: 'sea',
          waterColor: '#2a6e99',
          landmarks: ['lighthouse', 'mosque'],
          obstacles: ['barrel', 'crate', 'amphora'],
          deco: ['birch'],
          hills: 0.9,
        }),
      },
    ],
  },

  croatia: {
    name: 'Κροατία',
    flag: '🇭🇷',
    colors: ['#ff0000', '#171796'],
    capital: 'Ζάγκρεμπ',
    language: 'Κροατικά',
    currency: 'Ευρώ (€)',
    lonLat: [16.0, 45.3], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['hungary', 'serbia', 'bosnia', 'montenegro', 'slovenia'],
    intro:
      'Η Κροατία έχει πάνω από 1.000 νησιά και νησίδες στην Αδριατική θάλασσα και μία από τις πιο όμορφες ακτογραμμές της Ευρώπης.',
    cities: [
      {
        id: 'zagreb',
        name: 'Ζάγκρεμπ',
        intro: 'Η πρωτεύουσα της Κροατίας, με μια γραφική Πάνω Πόλη και μια ζωντανή Κάτω Πόλη.',
        theme: T({
          sky: ['#7db8e6', '#eee9e0'],
          far: '#8296a8',
          mid: '#76a05f',
          surface: 'road',
          ground: '#806c58',
          top: '#55575e',
          landmarks: ['stMark', 'gothic'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['birch', 'pine'],
        }),
      },
      {
        id: 'split',
        name: 'Σπλιτ',
        intro: 'Μεγάλη πόλη της Δαλματίας, χτισμένη γύρω από το παλάτι ενός Ρωμαίου αυτοκράτορα!',
        theme: T({
          sky: ['#4fb0ee', '#fff0d0'],
          far: '#8f9a9c',
          mid: '#8ba468',
          surface: 'cobble',
          ground: '#a38c72',
          top: '#d8cdb8',
          water: 'sea',
          waterColor: '#1a8fc4',
          landmarks: ['parthenon', 'clocktower'],
          obstacles: ['column', 'amphora', 'rock'],
          deco: ['palm', 'cypress'],
        }),
      },
      {
        id: 'dubrovnik',
        name: 'Ντουμπρόβνικ',
        intro: 'Το «μαργαριτάρι της Αδριατικής», μια πόλη που περιβάλλεται από τεράστια πέτρινα τείχη.',
        theme: T({
          sky: ['#4aaeee', '#ffeccc'],
          far: '#7f8e98',
          mid: '#87a065',
          surface: 'cobble',
          ground: '#a08a70',
          top: '#d6cbb5',
          water: 'sea',
          waterColor: '#168ac0',
          landmarks: ['fortress'],
          obstacles: ['crate', 'barrel', 'amphora'],
          deco: ['cypress', 'palm'],
          hills: 1.15,
        }),
      },
    ],
  },

  bosnia: {
    name: 'Βοσνία-Ερζεγοβίνη',
    flag: '🇧🇦',
    colors: ['#002395', '#fecb00'],
    capital: 'Σαράγεβο',
    language: 'Βοσνιακά, Κροατικά και Σερβικά',
    currency: 'Μετατρέψιμο μάρκο',
    lonLat: [17.8, 44.2], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['croatia', 'serbia', 'montenegro'],
    intro:
      'Μια ορεινή χώρα με δύο περιοχές: τη Βοσνία στον βορρά και την Ερζεγοβίνη στον νότο. Έχει μόνο περίπου 20 χιλιόμετρα ακτής, γύρω από την πόλη Νέουμ!',
    cities: [
      {
        id: 'sarajevo',
        name: 'Σαράγεβο',
        intro: 'Η πρωτεύουσα, μια πόλη όπου τζαμιά, εκκλησίες και συναγωγές βρίσκονται η μία δίπλα στην άλλη.',
        theme: T({
          sky: ['#7cb3df', '#eceef0'],
          far: '#71849a',
          mid: '#6b9659',
          surface: 'cobble',
          ground: '#7f6b57',
          top: '#a99c8a',
          landmarks: ['mosque', 'cathedral'],
          obstacles: ['crate', 'rock', 'log'],
          deco: ['pine'],
          snow: true,
          hills: 1.2,
        }),
      },
      {
        id: 'mostar',
        name: 'Μόσταρ',
        intro:
          'Η μεγαλύτερη πόλη της Ερζεγοβίνης, γνωστή για το παλιό της γεφύρι πάνω από τον σμαραγδένιο ποταμό Νερέτβα.',
        theme: T({
          sky: ['#5eb4ec', '#fdeccb'],
          far: '#9aa0a0',
          mid: '#8aa466',
          surface: 'cobble',
          ground: '#a48d72',
          top: '#cfc4ad',
          water: 'river',
          waterColor: '#2aa198',
          landmarks: ['bridge', 'mosque'],
          obstacles: ['rock', 'crate', 'amphora'],
          deco: ['cypress', 'olive'],
          hills: 1.1,
        }),
      },
      {
        id: 'banja-luka',
        name: 'Μπάνια Λούκα',
        intro: 'Η δεύτερη μεγαλύτερη πόλη της χώρας, γεμάτη πράσινο, στις όχθες του ποταμού Βρμπας.',
        theme: T({
          sky: ['#79b9e6', '#f0ecd8'],
          far: '#7d90a2',
          mid: '#699b55',
          ground: '#7c6650',
          top: '#62a443',
          water: 'river',
          waterColor: '#3d8f8a',
          landmarks: ['fortress', 'mosque'],
          obstacles: ['log', 'rock', 'hay'],
          deco: ['birch', 'pine'],
        }),
      },
    ],
  },

  hungary: {
    name: 'Ουγγαρία',
    flag: '🇭🇺',
    colors: ['#ce2939', '#477050'],
    capital: 'Βουδαπέστη',
    language: 'Ουγγρικά',
    currency: 'Φιορίνι',
    lonLat: [19.4, 47.1], // θέση στον χάρτη (μήκος, πλάτος)
    neighbors: ['romania', 'serbia', 'croatia', 'austria', 'slovenia', 'slovakia', 'ukraine'],
    intro:
      'Τα ουγγρικά δεν μοιάζουν με τις γλώσσες των γειτόνων τους – συγγενεύουν μακρινά με τα φινλανδικά! Η χώρα έχει πολλές θερμές πηγές και τη μεγάλη λίμνη Μπάλατον.',
    cities: [
      {
        id: 'budapest',
        name: 'Βουδαπέστη',
        intro:
          'Η πρωτεύουσα της Ουγγαρίας. Δημιουργήθηκε το 1873 από την ένωση τριών πόλεων: της Βούδας και της Όμπουντα στους λόφους και της Πέστης στην πεδιάδα, με τον Δούναβη ανάμεσα.',
        theme: T({
          sky: ['#7fb6e3', '#f3e2cf'],
          far: '#8b9aab',
          mid: '#7aa063',
          surface: 'road',
          ground: '#84705c',
          top: '#55575e',
          water: 'river',
          waterColor: '#4a7e9e',
          landmarks: ['parliament', 'bridge'],
          obstacles: ['crate', 'barrel', 'rock'],
          deco: ['birch', 'pine'],
        }),
      },
      {
        id: 'szeged',
        name: 'Σέγκεντ',
        intro:
          'Η «πόλη του ήλιου» της Ουγγαρίας, με τις περισσότερες ώρες ηλιοφάνειας στη χώρα, στις όχθες του ποταμού Τίσα.',
        theme: T({
          sky: ['#58b2f0', '#fff3cc'],
          far: '#a9b3b5',
          mid: '#a3b86a',
          ground: '#94704a',
          top: '#99bb4a',
          water: 'river',
          waterColor: '#4d8aa6',
          landmarks: ['gothic'],
          obstacles: ['hay', 'crate', 'barrel'],
          deco: ['birch'],
          hills: 0.7,
        }),
      },
      {
        id: 'pecs',
        name: 'Πετς',
        intro: 'Μια ζεστή πόλη στον νότο της Ουγγαρίας, στους πρόποδες του όρους Μέτσεκ.',
        theme: T({
          sky: ['#6cb5ea', '#fbe7c8'],
          far: '#8c9ba6',
          mid: '#82a463',
          surface: 'cobble',
          ground: '#8f7a63',
          top: '#c2b29a',
          landmarks: ['gothic', 'mosque'],
          obstacles: ['amphora', 'rock', 'crate'],
          deco: ['birch', 'pine'],
          hills: 1.1,
        }),
      },
    ],
  },
};

// Οι υπόλοιπες χώρες της Ευρώπης βρίσκονται σε ξεχωριστά αρχεία ανά περιοχή (js/data/regions.js).
Object.assign(COUNTRIES, REGIONS);

// Συμπληρώνει ids/αναφορές ώστε το υπόλοιπο παιχνίδι να μη χρειάζεται να τα ψάχνει.
for (const [countryId, c] of Object.entries(COUNTRIES)) {
  c.sea = c.sea || [];
  c.id = countryId;
  c.cities.forEach((city, ci) => {
    city.countryId = countryId;
    city.index = ci;
    // κάρτες των checkpoints (js/data/cards*.js): αντικείμενο, πληροφορία, αντικείμενο, πληροφορία
    const cards = CARDS[city.id] || [];
    city.items = cards.filter((k) => k.kind === 'item');
    city.infos = cards.filter((k) => k.kind === 'info');
    // όλες οι πίστες είναι πλέον «rider»: μεγάλα άλματα, γκρεμοί, τούμπες, νέοι πόντοι
    city.rider = city.rider ?? true;
    city.items.forEach((it, ii) => {
      it.id = `${city.id}-${ii}`;
      it.cityId = city.id;
      it.countryId = countryId;
    });
  });
}

export const COUNTRY_IDS = Object.keys(COUNTRIES);

/**
 * Όλες οι «γειτονικές» χώρες: με κοινά σύνορα στη στεριά (`neighbors`)
 * ή με σύνδεση από θάλασσα, γέφυρα ή σήραγγα (`sea`, π.χ. Ελλάδα–Κύπρος).
 */
export function links(countryId) {
  const c = COUNTRIES[countryId];
  return [...c.neighbors, ...c.sea];
}

export function getCity(cityId) {
  for (const c of Object.values(COUNTRIES)) {
    const city = c.cities.find((x) => x.id === cityId);
    if (city) return city;
  }
  return null;
}

export function allItems() {
  return Object.values(COUNTRIES).flatMap((c) => c.cities.flatMap((city) => city.items));
}

/** Απόσταση (σε «σύνορα») από τη χώρα εκκίνησης – χρησιμοποιείται για τη δυσκολία. */
export function countryTier(countryId) {
  const dist = { [START_COUNTRY]: 0 };
  const queue = [START_COUNTRY];
  while (queue.length) {
    const cur = queue.shift();
    for (const n of links(cur)) {
      if (dist[n] === undefined) {
        dist[n] = dist[cur] + 1;
        queue.push(n);
      }
    }
  }
  return dist[countryId] ?? 0;
}

export function cityDifficulty(city) {
  const tier = countryTier(city.countryId);
  return Math.min(1, (tier * 3 + city.index) / 11);
}
