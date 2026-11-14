// Συγκεντρώνει τις χώρες όλων των περιοχών της Ευρώπης.
// Κάθε αρχείο περιοχής εξάγει ένα αντικείμενο { idΧώρας: χώρα }.

import { CENTRAL } from './central.js';
import { CENTRAL2 } from './central2.js';
import { WEST } from './west.js';
import { WEST2 } from './west2.js';
import { NORTH } from './north.js';
import { EAST } from './east.js';

export const REGIONS = { ...CENTRAL, ...CENTRAL2, ...WEST, ...WEST2, ...NORTH, ...EAST };
