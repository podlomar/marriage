import { Instance, Pairing } from '../dist/instance.js';
import { PrintedInstance } from '../dist/printed.js';

// 4-NtK0cks5bJM

const instance = Instance.decode('3-hhJSYYA');
const printed = new PrintedInstance(instance);
console.log(printed.print());
instance.quickAllStablePairings();

