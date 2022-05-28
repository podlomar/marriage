import { buildInstance } from '../dist/instance.js';
import { findPairing } from '../dist/pairing.js';

const instance = buildInstance(4, 10869627);
const pairing = findPairing(instance);

console.log(pairing);
