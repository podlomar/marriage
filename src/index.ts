import express from 'express';
import { buildInstance, printInstance, instaceCount } from './instance.js';
import { findPairing } from './pairing.js';

const port = process.env.PORT || 2000;

const server = express();

server.get('/gen/:size', (req, res) => {
  const { size } = req.params;
  
  const count = instaceCount(Number(size));
  const randomOrd = Math.floor(Math.random() * count);

  res.redirect(`/gen/${size}/${randomOrd}`);
});

server.get('/gen/:size/:ord', (req, res) => {
  const { size, ord } = req.params;
  const count = instaceCount(Number(size));
  const instance = buildInstance(Number(size), Number(ord));
  if (instance === null) {
    return res.send('no instace');
  }

  const originalPrinted = printInstance(instance);
  const pairing = findPairing(instance);  
  const solvedPrinted = printInstance(instance, pairing);

  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Marriages</title>
    </head>
    <body>
      <pre>ord: ${ord} of ${count}</pre>
      <pre>${originalPrinted}</pre>
      <pre>${solvedPrinted}</pre>
      <pre>scoreA: ${pairing.scoreA}, scoreB: ${pairing.scoreB}, total: ${pairing.totalScore}</pre>
    </body>
    </html>
  `);
});

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});