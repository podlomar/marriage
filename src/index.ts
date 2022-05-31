import path from 'path';
import express from 'express';
import { Instance, instaceCount } from './instance.js';
import { PrintedInstance } from './printed.js';

const port = process.env.PORT || 2000;

const server = express();

const renderInstance = (instance: Instance, inject: string = ''): string => {
  const originalPrinted = new PrintedInstance(instance);
  const pairing = instance.findStablePairing();
  const solved = originalPrinted.printPairing(pairing, true);

  const stable = instance.findAllStablePairings();
  const stablePrinted = stable.map((pairing) => (
    `<pre>${pairing.printAsLetters()}: ${pairing.totalU}/${pairing.weightedU} ${pairing.totalL}/${pairing.weightedL} ${pairing.total}/${pairing.wieghted}</pre>`
  ));

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
      <pre>${originalPrinted.print(true)}</pre>
      <pre>${solved}</pre>
      <pre>U: ${pairing.totalU}/${pairing.weightedU}, L: ${pairing.totalL}/${pairing.weightedL}, total: ${pairing.total}/${pairing.wieghted}</pre>
      ${stablePrinted.join('')}
    </body>
    </html>
  `;
};

server.use('/', express.static('web'));

server.get('/random/:size', (req, res) => {
  const { size } = req.params;
  const instance = Instance.random(Number(size));
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