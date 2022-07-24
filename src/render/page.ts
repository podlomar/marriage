import { Instance } from "../instance.js";
import { Pairing } from "../pairing.js";
import { MatchView, MatchDisplay } from "./match.js";
import { ScoreView } from "./score.js";

export const PageView = (
  instance: Instance,
  linkBase: string,
  pairing?: Pairing,
  pairings?: Pairing[],
  display?: MatchDisplay
): string => {
  const sortedPairings = pairings === undefined
    ? []
    : [...pairings];

  sortedPairings.sort((p, q) => p.total - q.total);

  const scores = pairings === undefined
    ? []
    : sortedPairings.map((p) => ScoreView(p, linkBase));
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link rel="stylesheet" href="/style.css" />
      
      <title>Marriages</title>
    </head>
    <body>
      <div class="container">
        <div class="pairings">
          ${pairing === undefined ? '' : (`
            <div class="pairings__score">
              ${ScoreView(pairing)}
            </div>
          `)}
          ${MatchView(instance, pairing, display)}
        </div>

        <div class="scores-list">
          ${scores.join('')}
        </div>
      </div>
    </body>
    </html>
  `;
};

// ${inject}
//       <pre>${originalPrinted.print(useLetters)}</pre>
//       <pre>${solved}</pre>
//       <pre>Men: ${pairing.totalM}, Women: ${pairing.totalW}, total: ${pairing.total}</pre>
//       <hr />
//       ${quicksPrinted}