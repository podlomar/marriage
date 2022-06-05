import { Instance, Pairing } from "./instance.js";

const printPref = (pref: number, offset: number, useLetters: boolean): string => useLetters 
  ? String.fromCharCode(offset + pref) 
  : String(pref);

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
      const prefsU = this.instance.prefsM[i]
        .map((pref) => printPref(pref, 97, useLetters))
        .join(' ');
      const prefsL = this.instance.prefsW[i]
        .map((pref) => printPref(pref, 65, useLetters))
        .join(' ');
      result += `${prefsU} | ${printPref(i, 65, useLetters)}/-   ${printPref(i, 97, useLetters)} | ${prefsL}\n`;
    }
    
    return result;
  }

  public printPairing(pairing: Pairing, useLetters: boolean = false): string {
    let result = this.printAxis();

    for(let i = 0; i < this.instance.size; i++) {
      const j = pairing.pairs[i];

      const prefsU = this.instance.prefsM[i].map((pref, idx) => (
        idx < pairing!.scoresM[i] ? ' ' : printPref(pref, 97, useLetters)
      )).join(' ');
      const prefsL = this.instance.prefsW[j].map((pref, idx) => (
        idx <= pairing!.scoresW[j] ? printPref(pref, 65, useLetters) : ' '
      )).join(' ');
  
      result += `${prefsU} | ${printPref(i, 65, useLetters)} --- ${printPref(j, 97, useLetters)} | ${prefsL}\n`;
    }
    
    return result;
  }
}

