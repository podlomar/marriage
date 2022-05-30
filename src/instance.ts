import { factorial, choose, getCombination, permutations, shuffle } from "./comb.js";
import base64url from 'base64url';

export const computeBlockSize = (instanceSize: number) => {
  let blockSize = 1;
  let power = 2;
  
  while(power < instanceSize) {
    power *= 2;
    blockSize++;
  }

  return blockSize;
}

export class Instance {
  public readonly size: number; 
  public readonly prefsU: number[][];
  public readonly prefsL: number[][];

  public constructor(size: number, prefsU: number[][], prefsL: number[][]) {
    this.size = size;
    this.prefsU = prefsU;
    this.prefsL = prefsL;
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
    const prefsU = getCombination(iter, iter.next().value, i, nf, size) as number[][];
    iter = permutations(elms);
    const prefsL = getCombination(iter, iter.next().value, j, nf, size) as number[][];
  
    return new Instance(size, prefsU, prefsL);
  }

  public static random(size: number): Instance {
    const elements: number[] = new Array(size).fill(null).map((_, i) => i);
  
    const prefsU = elements.map(() => shuffle(elements));
    const prefsL = elements.map(() => shuffle(elements));

    return new Instance(size, prefsU, prefsL);
  }

  public static decode(code: string) {
    const slashIndex = code.indexOf('-');
    const size = Number(code.slice(0, slashIndex));
    const blockSize = computeBlockSize(size);
    const bytes = Array.from(
      base64url.toBuffer(code.slice(slashIndex + 1)).values()
    );
    const bits = bytes.map((byte) => byte.toString(2).padStart(8, '0')).join('');

    const prefsU: number[][] = new Array(size);
    const prefsL: number[][] = new Array(size);

    for (let i = 0; i < size; i += 1) {
      prefsU[i] = [];
      prefsL[i] = [];
      
      const iOffset = i * 2 * size * blockSize;
      
      for (let j = 0; j < size; j += 1) {
        const jOffsetA = iOffset + j * blockSize
        const prefA = parseInt(bits.slice(jOffsetA, jOffsetA + blockSize), 2);
        prefsU[i].push(prefA);

        const jOffsetB = iOffset + size * blockSize + j * blockSize
        const prefB = parseInt(bits.slice(jOffsetB, jOffsetB + blockSize), 2);
        prefsL[i].push(prefB);
      }
    }

    return new Instance(size, prefsU, prefsL);
  }

  public findStablePairing(): Pairing {
    const scoresU = new Array(this.size).fill(0);
    const scoresL = new Array(this.size).fill(this.size);
    const pairs = new Array(this.size).fill(-1);
  
    let freeUs = this.size;
    let i = 0;
    
    while (freeUs !== 0) {
      if (pairs[i] === -1) {
        const pref = this.prefsU[i][scoresU[i]];
        const prefIndex = this.prefsL[pref].findIndex((womenPref) => womenPref === i);
        if (prefIndex < scoresL[pref]) {
          if (scoresL[pref] < this.size) {
            const aIdx = this.prefsL[pref][scoresL[pref]];
            pairs[aIdx] = -1;
            scoresU[aIdx]++;
            freeUs++;
          }
          
          scoresL[pref] = prefIndex;
          pairs[i] = pref;
          freeUs--;
        }
        else {
          scoresU[i]++;
        }
      }
  
      i = (i + 1) % this.size;
    }
  
    return new Pairing(pairs, scoresU, scoresL);
  }
  
  public findAllPairings(): Pairing[] {
    const elements = new Array(this.size).fill(null).map((_, i) => i);
    return Array.from(permutations(elements)).map((pairs) => Pairing.fromPairs(this, pairs));
  }

  public findAllStablePairings(): Pairing[] {
    return this.findAllPairings().filter((pairing) => this.isStablePairng(pairing));
  }

  public isStablePairng(pairing: Pairing): boolean {
    const { pairs } = pairing;
    
    for(let i = 0; i < this.size; i++) {
      for(let j = 0; j < this.size; j++) {
        if (pairs[i] !== j) {
          const scoreA = this.prefsU[i].findIndex((pref) => pref === j);
          const scoreB = this.prefsL[j].findIndex((pref) => pref === i);
  
          if (scoreA < pairing.scoresU[i] && scoreB < pairing.scoresL[j]) {
            return false;
          }
        }
      }
    }
  
    return true;
  }

  public encode() {
    let bits = '';
    const blockSize = computeBlockSize(this.size);

    for(let i = 0; i < this.size; i++) {
      const lineA = this.prefsU[i].map(
        (pref) => pref.toString(2).padStart(blockSize, '0')
      ).join('');
      const lineB = this.prefsL[i].map(
        (pref) => pref.toString(2).padStart(blockSize, '0')
      ).join('');
      
      bits = bits + lineA + lineB;
    }

    const bytes = [];
    for(let i = 0; i < bits.length; i += 8) {
      const chunk = bits.slice(i, i + 8);
      const byte = chunk.length < 8 ? chunk.padEnd(8, '0') : chunk;

      bytes.push(parseInt(byte, 2));
    }

    return `${this.size}-${base64url.encode(Buffer.from(bytes))}`;
  }
};

export class Pairing {
  public pairs: number[];
  public scoresU: number[];
  public scoresL: number[];

  public constructor(pairs: number[], scoresU: number[], scoresL: number[]) {
    this.pairs = pairs;
    this.scoresU = scoresU;
    this.scoresL = scoresL;
  }

  public static fromPairs(instance: Instance, pairs: number[]): Pairing {
    const scoresU: number[] = new Array(instance.size).fill(-1);
    const scoresL: number[] = new Array(instance.size).fill(-1);

    for(let i = 0; i < instance.size; i++) {
      const j = pairs[i];
      scoresU[i] = instance.prefsU[i].findIndex((k) => k === j);
      scoresL[j] = instance.prefsL[j].findIndex((k) => k === i);
    }
    
    return new Pairing(pairs, scoresU, scoresL);
  }

  public static empty(size: number): Pairing {
    return new Pairing(
      new Array(size).fill(-1),
      new Array(size).fill(-1),
      new Array(size).fill(size),
    );
  };

  public printAsLetters(): string {
    return this.pairs.map((val) => String.fromCharCode(val + 97)).join('');
  }

  public get totalU() {
    return this.scoresU.reduce((sum, x) => sum + x, 0);
  }

  public get totalL() {
    return this.scoresL.reduce((sum, x) => sum + x, 0);
  }

  public get total() {
    return this.totalU + this.totalL;
  }

  public get weightedU() {
    return this.scoresU.reduce((sum, x) => sum + x * x, 0);
  }

  public get weightedL() {
    return this.scoresL.reduce((sum, x) => sum + x * x, 0);
  }

  public get wieghted() {
    return this.weightedU + this.weightedL;
  }
}

export const instaceCount = (size: number): number => {
  const oneSide = choose(factorial(size) + size - 1, size);
  return oneSide * oneSide;
};
