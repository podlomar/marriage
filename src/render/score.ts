import { Pairing } from "../pairing";

export const ScoreView = (pairing: Pairing, linkBase?: string): string => {
  if (pairing === undefined) {
    return '';
  }
  
  const score = `
    <div class="score">
      <div class="score--square">${pairing.totalM}</div>
      <div class="score--total">${pairing.total}</div>
      <div class="score--circle">${pairing.totalW}</div>
    </div>
  `;

  if (linkBase !== undefined) {
    const code = pairing.encode();
    return `
      <a href="${linkBase}/${code}" class="score-link">
        ${score}
      </a>
    `;
  }

  return score;
};
