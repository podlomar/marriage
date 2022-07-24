import { Instance } from '../dist/instance.js';

const size = 4;
const minPairings = 7;

while (true) {
  const instance = Instance.random(size);
  const stable = instance.quickAllStablePairings();
  if (stable.length >= minPairings) {
    console.log(stable.length, instance.encode());
  }
}