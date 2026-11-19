// Όλες οι κάρτες των checkpoints, ανά πόλη (id πόλης → [αντικείμενο, πληροφορία, αντικείμενο, πληροφορία]).
// Κανόνες: μία σύντομη πρόταση ανά κάρτα, γνωστά πράγματα για τη χώρα
// (ή για την πόλη, μόνο αν είναι πολύ διάσημη), και ερώτηση που απαντιέται από το κείμενο.

import { CARDS_SOUTH } from './cards-south.js';
import { CARDS_CENTRAL } from './cards-central.js';
import { CARDS_WEST_NORTH } from './cards-west-north.js';

export const CARDS = { ...CARDS_SOUTH, ...CARDS_CENTRAL, ...CARDS_WEST_NORTH };
