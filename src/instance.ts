import { factorial, choose, getCombination, permutations, shuffle } from "./comb.js";
import { encode, decode } from "./encoder.js";
import { Pairing } from "./pairing.js";

export class Instance {
  public readonly size: number; 
  public readonly prefsM: number[][];
  public readonly prefsW: number[][];

  public constructor(size: number, prefsM: number[][], prefsW: number[][]) {
    this.size = size;
    this.prefsM = prefsM;
    this.prefsW = prefsW;
  }

  public static fromOrd(size: number, ord: number): Instance | null {
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
    const prefsM = getCombination(iter, iter.next().value, i, nf, size) as number[][];
    iter = permutations(elms);
    const prefsW = getCombination(iter, iter.next().value, j, nf, size) as number[][];
  
    return new Instance(size, prefsM, prefsW);
  }

  public static random(size: number): Instance {
    const elements: number[] = new Array(size).fill(null).map((_, i) => i);
  
    const prefsM = elements.map(() => shuffle(elements));
    const prefsW = elements.map(() => shuffle(elements));

    return new Instance(size, prefsM, prefsW);
  }

  public static decode(code: string) {
    const [size, ...data] = decode(code);
    const prefsM: number[][] = new Array(size);
    const prefsW: number[][] = new Array(size);

    for (let i = 0; i < size; i += 1) {
      const mOffset = i * size;
      const wOffset = size * size + i * size;
      prefsM[i] = data.slice(mOffset, mOffset + size);
      prefsW[i] = data.slice(wOffset, wOffset + size);
    }

    return new Instance(size, prefsM, prefsW);
  }

  public findNextStablePairing(pairing: Pairing): Pairing | null {
    while (pairing.nextFreeM !== null) {
      const freeM = pairing.nextFreeM;
      const prefW = this.prefsM[freeM][pairing.scoresM[freeM]];
      const mRank = this.prefsW[prefW].findIndex((pref) => pref === freeM);
      const prevMRank = pairing.scoresW[prefW];
      if (mRank < prevMRank) {
        if (prevMRank < this.size) {
          const m = this.prefsW[prefW][prevMRank];
          if (!pairing.reject(m, prefW)) {
            return null;
          }
        }
         
        pairing.marry(freeM, prefW, mRank);
      }
      else {
        if (pairing.scoresM[freeM] < this.size - 1) {
          pairing.scoresM[freeM]++;
        } else {
          return null;
        }
      }

      pairing.moveToNextFreeM();
    }
  
    return pairing;
  }
  
  public findAllPairings(): Pairing[] {
    const elements = new Array(this.size).fill(null).map((_, i) => i);
    return Array.from(permutations(elements)).map((pairs) => Pairing.fromPairs(this, pairs));
  }

  public findAllSolutions(initPairing: Pairing, depth: number = 0): Pairing[] {
    const result: Pairing[] = [];
    const breakStart = initPairing.breaked === -1 ? 0 : initPairing.breaked;

    for(let m = breakStart; m < initPairing.pairs.length; m++) {
      const breaked = initPairing.break(m);
      if (breaked === null) {
        continue;
      }
      
      const pairing = this.findNextStablePairing(breaked);
      if (pairing === null) {
        continue;
      }
    
      // console.log(' '.repeat(depth * 2), `break ${m} => ${pairing.print()}`);
      result.push(pairing);
      result.push(...this.findAllSolutions(pairing, depth + 1));
    }
    
    return result;
  }

  public bruteAllStablePairings(): Pairing[] {
    return this.findAllPairings().filter((pairing) => this.isStablePairng(pairing));
  }

  public quickAllStablePairings(): Pairing[] {
    const pairing = this.findNextStablePairing(Pairing.empty(this.size)) as Pairing;
    const results = this.findAllSolutions(pairing);

    return [pairing, ...results];
  }

  public isStablePairng(pairing: Pairing): boolean {
    const { pairs } = pairing;
    
    for(let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++) {
        if (pairs[i] !== j) {
          const scoreA = this.prefsM[i].findIndex((pref) => pref === j);
          const scoreB = this.prefsW[j].findIndex((pref) => pref === i);
  
          if (scoreA < pairing.scoresM[i] && scoreB < pairing.scoresW[j]) {
            return false;
          }
        }
      }
    }
  
    return true;
  }

  public encode() {
    return encode([
      this.size,
      ...this.prefsM.flat(),
      ...this.prefsW.flat(),
    ]);
  }
};
