import { Instance } from '../dist/instance.js';

const instance = Instance.random(5);
const code = instance.encode();

console.info(code);
console.info(Instance.decode(code).encode());

