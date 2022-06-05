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
    const slashIndex = code.indexOf('-');
    const size = Number(code.slice(0, slashIndex));
    const blockSize = computeBlockSize(size);
    const bytes = Array.from(
      base64url.toBuffer(code.slice(slashIndex + 1)).values()
    );
    const bits = bytes.map((byte) => byte.toString(2).padStart(8, '0')).join('');

    const prefsM: number[][] = new Array(size);
    const prefsW: number[][] = new Array(size);

    for (let i = 0; i < size; i += 1) {
      prefsM[i] = [];
      prefsW[i] = [];
      
      const iOffset = i * 2 * size * blockSize;
      
      for (let j = 0; j < size; j += 1) {
        const jOffsetM = iOffset + j * blockSize
        const prefM = parseInt(bits.slice(jOffsetM, jOffsetM + blockSize), 2);
        prefsM[i].push(prefM);

        const jOffsetW = iOffset + size * blockSize + j * blockSize
        const prefW = parseInt(bits.slice(jOffsetW, jOffsetW + blockSize), 2);
        prefsW[i].push(prefW);
      }
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
    let bits = '';
    const blockSize = computeBlockSize(this.size);

    for(let i = 0; i < this.size; i++) {
      const lineA = this.prefsM[i].map(
        (pref) => pref.toString(2).padStart(blockSize, '0')
      ).join('');
      const lineB = this.prefsW[i].map(
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

type FreeMs = {
  count: number,
  next: number,
} | null;

export class Pairing {
  private freeMs: FreeMs

  public breaked: number;
  public pairs: number[];
  public scoresM: number[];
  public scoresW: number[];
  
  public constructor(pairs: number[], scoresM: number[], scoresW: number[], breaked: number) {
    this.breaked = breaked;
    this.pairs = pairs;
    this.scoresM = scoresM;
    this.scoresW = scoresW;
    
    const freeMCount = pairs.filter((w) => w === -1).length;

    if (freeMCount === 0) {
      this.freeMs = null;
    } else {
      this.freeMs = {
        count: freeMCount,
        next: pairs.findIndex((w) => w === -1),
      };
    }
  }

  public static fromPairs(instance: Instance, pairs: number[]): Pairing {
    const scoresM: number[] = new Array(instance.size).fill(-1);
    const scoresW: number[] = new Array(instance.size).fill(-1);

    for(let i = 0; i < instance.size; i++) {
      const j = pairs[i];
      scoresM[i] = instance.prefsM[i].findIndex((k) => k === j);
      scoresW[j] = instance.prefsW[j].findIndex((k) => k === i);

      if (scoresM[i] === -1) {
        scoresM[i] = 0;
      }

      if (scoresW[i] === -1) {
        scoresW[i] = instance.size;
      }
    }
    
    return new Pairing(pairs, scoresM, scoresW, -1);
  }

  public static empty(size: number): Pairing {
    return new Pairing(
      new Array(size).fill(-1),
      new Array(size).fill(0),
      new Array(size).fill(size),
      -1,
    );
  };

  public print(useLetters: boolean = false): string {
    return this.pairs.map(
      (val) => useLetters 
        ? String.fromCharCode(val + 97)
        : String(val)
    ).join('');
  }

  public break(m: number): Pairing | null {
    if (this.freeMs !== null) {
      return this;
    }
    
    if (m < this.breaked) {
      return null;
    }

    if (this.scoresM[m] === this.pairs.length - 1) {
      return null;
    }

    const w = this.pairs[m];

    if (this.scoresW[w] === 0) {
      return null;
    }

    const pairing = new Pairing(
      [...this.pairs],
      [...this.scoresM],
      [...this.scoresW],
      m,
    )

    pairing.reject(m, w);
    return pairing;
  }

  public marry(m: number, w: number, mRank: number): void {
    if (this.freeMs === null) {
      return;
    }

    this.pairs[m] = w;
    this.scoresW[w] = mRank;
    this.freeMs.count--;
  }

  public reject(m: number, w: number): boolean {
    if (this.pairs[m] === -1) {
      return true;
    }

    if(w === this.pairs.length) {
      return true;
    }

    if (this.pairs[m] !== w) {
      return true;
    }

    if (m < this.breaked) {
      return false;
    }
    
    if(this.scoresM[m] === this.pairs.length - 1) {
      return false;
    }

    this.pairs[m] = -1;
    this.scoresM[m]++;
    
    if (this.freeMs === null) {
      this.freeMs = {
        count: 1,
        next: m,
      }
      return true;
    }
    
    this.freeMs.count++;
    return true;
  }

  public get nextFreeM(): number | null {
    if(this.freeMs === null) {
      return null;
    }

    return this.freeMs.next;
  }

  public moveToNextFreeM = () => {
    if (this.freeMs === null) {
      return null;
    }

    const size = this.pairs.length;
    for(let i = 0; i < size; i++) {
      if (this.pairs[this.freeMs.next] === -1) {
        return;
      }

      this.freeMs.next = (this.freeMs.next + 1) % size;
    }

    this.freeMs = null;
  }

  // public moveToNextFreeM = () => {
  //   if (this.freeMs === null) {
  //     return null;
  //   }

  //   const size = this.breaked === -1 ? this.pairs.length : this.pairs.length - this.breaked;
  //   const offset = this.breaked === -1 ? 0 : this.breaked;

  //   let next = this.freeMs.next - offset;
  //   for(let i = 0; i < size; i++) {
  //     const pos = offset + next;
  //     if (this.pairs[pos] === -1) {
  //       this.freeMs.next = pos;
  //       return;
  //     }

  //     next = (next + 1) % size;
  //   }

  //   this.freeMs = null;
  // }

  public get totalM() {
    return this.scoresM.reduce((sum, x) => sum + x, 0);
  }

  public get totalW() {
    return this.scoresW.reduce((sum, x) => sum + x, 0);
  }

  public get total() {
    return this.totalM + this.totalW;
  }
}

export const instaceCount = (size: number): number => {
  const oneSide = choose(factorial(size) + size - 1, size);
  return oneSide * oneSide;
};
