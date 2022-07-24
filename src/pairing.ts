import { decode, encode } from "./encoder.js";
import type { Instance } from "./instance.js";

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
  
  public constructor(pairs: number[], scoresM: number[], scoresW: number[], breaked: number = -1) {
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

  public static decode(code: string): Pairing {
    const data = decode(code);
    const size = data.length / 3;

    const pairs = data.slice(0, size);
    const scoresM = data.slice(size, 2 * size);
    const scoresW = data.slice(2*size);
    
    return new Pairing(pairs, scoresM, scoresW);
  }

  public encode(): string {
    return encode([...this.pairs, ...this.scoresM, ...this.scoresW]);
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

export const findBestPairing = (pairings: Pairing[]): Pairing => {
  let index = -1;
  let score = Infinity;

  for(let i = 0; i < pairings.length; i++ ) {
    if(pairings[i].total < score) {
      score = pairings[i].total;
      index = i;
    }
  }

  return pairings[index];
}

// export const instaceCount = (size: number): number => {
//   const oneSide = choose(factorial(size) + size - 1, size);
//   return oneSide * oneSide;
// };
