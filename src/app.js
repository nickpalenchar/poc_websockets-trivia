import { createServer } from 'http';
import { staticServer } from './staticServer.js';

const { PORT = 8080 } = process.env;

const server = createServer((req, res) => {
  console.log('New request!', { path: req.url  });

  staticServer(req, res);

});

server.listen(PORT);

