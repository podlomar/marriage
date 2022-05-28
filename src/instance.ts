import { factorial, choose, getCombination, permutations } from "./comb.js";
import type { Pairing } from "./pairing.js";

export interface Instance {
  size: number,
  sideA: number[][],
  sideB: number[][],
};

export const instaceCount = (size: number): number => {
  const oneSide = choose(factorial(size) + size - 1, size);
  return oneSide * oneSide;
};

export const buildInstance = (size: number, ord: number): Instance | null => {
  const nf = factorial(size);
  const count = choose(nf + size - 1, size);
  const total = count * count;

  if (ord < 0 || ord > (total - 1)) {
    return null;
  }

  const i = Math.floor(ord / count);
  const j = ord % count;
  const elms = new Array(size).fill(null).map((_, i) => i);

  let iter = permutations(elms);
  const sideA = getCombination(iter, iter.next().value, i, nf, size) as number[][];
  iter = permutations(elms);
  const sideB = getCombination(iter, iter.next().value, j, nf, size) as number[][];

  return { size: size, sideA: sideA, sideB: sideB };
}

const emptyPairing = (size: number): Pairing => ({
  pairs: new Array(size).fill(-1),
  sideA: new Array(size).fill(-1),
  sideB: new Array(size).fill(size),
  scoreA: -1,
  scoreB: -1,
  totalScore: -1,
});

export const printInstance = (
  instance: Instance,
  pairing?: Pairing,
) => {
  if (pairing === undefined) {
    pairing = emptyPairing(instance.size);
  }

  const axis = new Array(instance.size).fill(null).map((_, i) => i).join(' ');

  let result = `${axis}             ${axis}\n`;

  for(let i = 0; i < instance.size; i++) {
    const prefsA = instance.sideA[i].map((pref, idx) => (
      idx < pairing!.sideA[i] ? ' ' : pref
    )).join(' ');
    const prefsB = instance.sideB[i].map((pref, idx) => (
      idx <= pairing!.sideB[i] ? pref : ' '
    )).join(' ');
    const partner = pairing.pairs[i] === -1 ? '-' : pairing.pairs[i];

    result += `${prefsA} | ${i}/${partner}   ${i} | ${prefsB}\n`;
  }
  
  return result;
}
