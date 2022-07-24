import { Instance } from "./instance.js";
import { Pairing } from "./pairing.js";

const printM = (m: number, useLetters: boolean): string => useLetters 
  ? String.fromCharCode(65 + m) 
  : String(m);

const printW = (w: number, size: number, useLetters: boolean): string => useLetters 
  ? String.fromCharCode(122 - size + 1 + w) 
  : String(w);

export class PrintedInstance {
  private readonly instance: Instance;
  private axis: number[];

  public constructor(instance: Instance) {
    this.instance = instance;
    this.axis = new Array(this.instance.size).fill(null).map((_, i) => i);
  }

  private printAxis(): string {
    const printedAxis = this.axis.join(' ');
    return `${printedAxis}             ${printedAxis}\n`;
  }

  public print(useLetters: boolean = false) {
    let result = this.printAxis();
  
    for(let i = 0; i < this.instance.size; i++) {
      const prefsM = this.instance.prefsM[i]
        .map((pref) => printW(pref, this.instance.size, useLetters))
        .join(' ');
      const prefsW = this.instance.prefsW[i]
        .map((pref) => printM(pref, useLetters))
        .join(' ');
      result += `${prefsM} | ${printM(i, useLetters)}/-   ${printW(i, this.instance.size, useLetters)} | ${prefsW}\n`;
    }
    
    return result;
  }

  public printPairing(pairing: Pairing, useLetters: boolean = false): string {
    let result = this.printAxis();

    for(let i = 0; i < this.instance.size; i++) {
      const j = pairing.pairs[i];

      const prefsM = this.instance.prefsM[i].map((pref, idx) => (
        idx < pairing!.scoresM[i] ? ' ' : printW(pref, this.instance.size, useLetters)
      )).join(' ');
      const prefsW = this.instance.prefsW[j].map((pref, idx) => (
        idx <= pairing!.scoresW[j] ? printM(pref, useLetters) : ' '
      )).join(' ');
  
      result += `${prefsM} | ${printM(i, useLetters)} --- ${printW(j, this.instance.size, useLetters)} | ${prefsW}\n`;
    }
    
    return result;
  }
}
