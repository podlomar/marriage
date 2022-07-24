import express from 'express';
import { promises as fs } from 'fs';
import { Instance } from './instance.js';
import { findBestPairing, Pairing } from "./pairing.js";
import { PrintedInstance } from './printed.js';
import { PageView } from './render/page.js';

const port = process.env.PORT || 2000;

const server = express();

const renderPairings = (pairings: Pairing[], useLetters: boolean) => pairings.map(
  (pairing) => (
    `<pre>${pairing.print(useLetters)}: ${pairing.totalM} ${pairing.totalW} ${pairing.total}</pre>`
  )
).join('');

const renderInstance = (instance: Instance, useLetters: boolean, inject: string = ''): string => {
  const originalPrinted = new PrintedInstance(instance);
  const pairing = instance.findNextStablePairing(Pairing.empty(instance.size)) as Pairing;
  const solved = originalPrinted.printPairing(pairing, useLetters);

  // const brutes = instance.bruteAllStablePairings();
  // const brutesPrinted = renderPairings(brutes);

  const quicks = instance.quickAllStablePairings();
  const quicksPrinted = renderPairings(quicks, useLetters);

  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Marriages</title>
    </head>
    <body>
      ${inject}
      <pre>${originalPrinted.print(useLetters)}</pre>
      <pre>${solved}</pre>
      <pre>Men: ${pairing.totalM}, Women: ${pairing.totalW}, total: ${pairing.total}</pre>
      <hr />
      ${quicksPrinted}
    </body>
    </html>
  `;
};

server.use('/', express.static('web'));

server.get('/random/:size', (req, res) => {
  const { size } = req.params;
  const { letters } = req.query;
  
  const instance = Instance.random(Number(size));
  const result = renderInstance(instance, Boolean(letters), `<pre>code: ${instance.encode()}</pre>`);
  res.send(result);
});

interface CachedEntry {
  code: string,
  size: 5,
  pairings: string[],
  note?: string,
};

server.get('/code/:code', async (req, res) => {
  const { code } = req.params;
  const { letters } = req.query;

  const instance = Instance.decode(code);
  const pairings = instance.quickAllStablePairings();
  const best = findBestPairing(pairings);
  
  pairings.forEach((pairing) => {
    console.log(pairing.encode())
  });

  res.send(PageView(instance, `/code/${code}`, best, pairings, { sort: true }));
});

server.get('/code/:code/:pairingCode', async (req, res) => {
  const { code, pairingCode } = req.params;
  const { letters } = req.query;

  const cached = await fs.readFile('cached/index.json', 'utf-8');
  const entries = JSON.parse(cached) as CachedEntry[];
  const entry = entries.find((e) => e.code === code);
  
  if (entry === undefined) {
    res.sendStatus(404);
    return;
  }

  const instance = Instance.decode(code);
  // const pairings = instance.quickAllStablePairings();
  const pairings = entry.pairings.map((code) => Pairing.decode(code));
  const pairing = Pairing.decode(pairingCode as string);
  // const best = findBestPairing(pairings);

  // pairings.forEach((pairing) => {
  //   console.log(pairing)
  // });
  
  res.send(PageView(instance, `/code/${code}`, pairing, pairings, { sort: true }));
});

// server.get('/gen/:size', (req, res) => {
//   const { size } = req.params;
  
//   const count = instaceCount(Number(size));
//   const randomOrd = Math.floor(Math.random() * count);

//   res.redirect(`/gen/${size}/${randomOrd}`);
// });

// server.get('/gen/:size/:ord', (req, res) => {
//   const { size, ord } = req.params;
//   const count = instaceCount(Number(size));
//   const instance = Instance.fromOrd(Number(size), Number(ord));
//   if (instance === null) {
//     return res.send('No instance');
//   }
//   const result = renderInstance(instance, `<pre>ord: ${ord} of ${count}</pre>`);

//   res.send(result);
// });

server.use(express.static('web'));

server.listen(port, () => {
  console.info(`listening on ${port}...`);
});
