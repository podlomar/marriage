import { Instance, instaceCount } from '../dist/instance.js';
import { PrintedInstance } from '../dist/printed.js';

// 4-NtK0cks5bJM

const count = instaceCount(4);

for(let i = 0; i < count; i++) {
  const instance = Instance.fromOrd(4, i);
  const brutes = instance.bruteAllStablePairings();

  if (brutes.length > 1) {
    const pairings = brutes.map((brute) => brute.print()).join(',');
    console.log(`ord: ${i}, code: ${instance.encode()}, count: ${brutes.length}, stable: ${pairings}`);
  }
}


// for(let i = 0; i < 10000000; i++) {
//   const instance = Instance.random(7);
//   const quicks = instance.quickAllStablePairings();
//   const brutes = instance.bruteAllStablePairings();

//   if (i % 1000 === 0) {
//     console.log(i);
//   }

//   if (quicks.length !== brutes.length) {
//     console.log('code', instance.encode());
//   }
// }
