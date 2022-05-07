import express from 'express';
import { generate } from './instance-gen.js';

const port = process.env.PORT || 2000;

const server = express();
server.use(express.json());

server.get('/gen/:size', (req, res) => {
  const { size } = req.params;
  res.send(generate(Number(size)));
});

server.listen(port, () => {
  console.log(`listening on ${port}...`);
});