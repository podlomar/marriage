import express from 'express';
import { Instance, instaceCount, Pairing } from './instance.js';
import { PrintedInstance } from './printed.js';

const port = process.env.PORT || 2000;

const server = express();

const renderPairings = (pairings: Pairing[]) => pairings.map(
  (pairing) => (
    `<pre>${pairing.print()}: ${pairing.totalM} ${pairing.totalW} ${pairing.total}</pre>`
  )
).join('');

const renderInstance = (instance: Instance, inject: string = ''): string => {
  const originalPrinted = new PrintedInstance(instance);
  const pairing = instance.findNextStablePairing(Pairing.empty(instance.size)) as Pairing;
  const solved = originalPrinted.printPairing(pairing);

  // const brutes = instance.bruteAllStablePairings();
  // const brutesPrinted = renderPairings(brutes);

  const quicks = instance.quickAllStablePairings();
  const quicksPrinted = renderPairings(quicks);

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
      <pre>${originalPrinted.print()}</pre>
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
  const instance = Instance.random(Number(size));
  console.log('code', instance.encode());
  const result = renderInstance(instance, `<pre>code: ${instance.encode()}</pre>`);
  res.send(result);
});

server.get('/code/:code', (req, res) => {
  const { code } = req.params;
  const instance = Instance.decode(code);
  const result = renderInstance(instance, `<pre>code: ${code}</pre>`);
  res.send(result);
});

server.get('/gen/:size', (req, res) => {
  const { size } = req.params;
  
  const count = instaceCount(Number(size));
  const randomOrd = Math.floor(Math.random() * count);

  res.redirect(`/gen/${size}/${randomOrd}`);
});

server.get('/gen/:size/:ord', (req, res) => {
  const { size, ord } = req.params;
  const count = instaceCount(Number(size));
  const instance = Instance.fromOrd(Number(size), Number(ord));
  if (instance === null) {
    return res.send('No instance');
  }
  const result = renderInstance(instance, `<pre>ord: ${ord} of ${count}</pre>`);

  res.send(result);
});

server.listen(port, () => {
  console.info(`listening on ${port}...`);
});
