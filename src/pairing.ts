import type { Instance } from "./instance.js";

export interface Pairing {
  pairs: number[],
  sideA: number[],
  sideB: number[],
  scoreA: number,
  scoreB: number,
  totalScore: number,
}

export const findPairing = (instance: Instance): Pairing => {
  const men = new Array(instance.size).fill(0);
  const women = new Array(instance.size).fill(instance.size);
  const pairs = new Array(instance.size).fill(-1);

  let freeMen = instance.size;
  let i = 0;
  
  while (freeMen !== 0) {
    if (pairs[i] === -1) {
      const pref = instance.sideA[i][men[i]];
      const prefIndex = instance.sideB[pref].findIndex((womenPref) => womenPref === i);
      if (prefIndex < women[pref]) {
        if (women[pref] < instance.size) {
          const manIdx = instance.sideB[pref][women[pref]];
          pairs[manIdx] = -1;
          men[manIdx]++;
          freeMen++;
        }
        
        women[pref] = prefIndex;
        pairs[i] = pref;
        freeMen--;
      }
      else {
        men[i]++;
      }
    }

    i = (i + 1) % instance.size;
  }

  const scoreA = men.reduce((sum, x) => sum + x, 0);
  const scoreB = women.reduce((sum, x) => sum + x, 0);

  return {
    pairs,
    sideA: men,
    sideB: women,
    scoreA,
    scoreB,
    totalScore: scoreA + scoreB,
  }
}