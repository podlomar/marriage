import { Instance } from "../instance.js";
import { Pairing } from "../pairing.js";

export type PantDisplay = 'default' | 'big' | 'empty';
export type PantKind = 'm' | 'w';

export const PantView = (
  instance: Instance, p: number, kind: PantKind, display: PantDisplay, useLetters: boolean
): string => {
  let className = "pant";
  if (display === 'empty') {
    className += ' pant--empty';
  } else if (display === 'big') {
    className += ' pant--big';
  }

  let content = '';
  if (kind === 'm') {
    content = useLetters ? String.fromCharCode(65 + p) : String(p);
    className += ' square';
  } else {
    content = useLetters ? String.fromCharCode(122 - instance.size + 1 + p) : String(p);
    className += ' circle';
  }

  return `<div class="${className}">${content}</div>`;
};

export interface MatchDisplay {
  useLetters?: boolean,
  sort?: boolean,
}

export const MatchView = (
  instance: Instance, pairing?: Pairing, display?: MatchDisplay
): string => {
  const definiteDisplay = {
    useLetters: true,
    sorted: true,
    ...display,
  }
  
  const sorted = new Array(instance.size).fill(0).map((_, idx) => idx);
  if (pairing !== undefined && definiteDisplay.sort) {
    sorted.sort((x, y) => {
      const scoreX = pairing.scoresM[x] + pairing.scoresW[pairing.pairs[x]];
      const scoreY = pairing.scoresM[y] + pairing.scoresW[pairing.pairs[y]];
      return scoreX - scoreY;
    });
  }

  let result = '<div class="pairings__lines">\n';

  for(let k = 0; k < instance.size; k++) {
    const i = sorted[k];
    const j = pairing === undefined ? i : pairing.pairs[i];
    
    const prefsM = instance.prefsM[i]
      .map((pref, idx) => PantView(
        instance,
        pref,
        'w',
        pairing === undefined || idx > pairing.scoresM[i] ? 'empty' : 'default',
        definiteDisplay.useLetters,
      ))
      .reverse()
      .join('\n');

    const prefsW = instance.prefsW[j]
      .map((pref, idx) => PantView(
        instance,
        pref,
        'm',
        pairing === undefined || idx > pairing.scoresW[j] ? 'empty' : 'default',
        definiteDisplay.useLetters,
      ))
      .join('\n');

    const line = `
      <div class="line">
        ${prefsM}
        ${PantView(instance, i, 'm', 'big', definiteDisplay.useLetters,)}
        <div class="spacer">${pairing === undefined ? '' : '↔'}</div>
        ${PantView(instance, j, 'w', 'big', definiteDisplay.useLetters,)}
        ${prefsW}
      </div>
    `;

    result += line;
  }
  
  return result + '</div>';
};
