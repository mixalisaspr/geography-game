// Συγκεντρώνει τις χώρες όλων των περιοχών της Ευρώπης.
// Κάθε αρχείο περιοχής εξάγει ένα αντικείμενο { idΧώρας: χώρα }.

import { CENTRAL } from './central.js';
import { CENTRAL2 } from './central2.js';
import { WEST } from './west.js';

export const REGIONS = { ...CENTRAL, ...CENTRAL2, ...WEST };
