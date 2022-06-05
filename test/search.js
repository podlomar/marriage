import { Instance, Pairing } from '../dist/instance.js';
import { PrintedInstance } from '../dist/printed.js';

// 4-NtK0cks5bJM

for(let i = 0; i < 10000000; i++) {
  const instance = Instance.random(7);
  const quicks = instance.quickAllStablePairings();
  const brutes = instance.bruteAllStablePairings();

  if (i % 1000 === 0) {
    console.log(i);
  }

  if (quicks.length !== brutes.length) {
    console.log('code', instance.encode());
  }
}
