const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cluster = require('cluster');

if (cluster.isMaster) {
  console.log('[Supervisor] Starting worker...');

  const worker = cluster.fork();

  worker.on('exit', (code, signal) => {
    console.log(`[Supervisor] Worker died (${code}/${signal}). Restarting in 2s...`);
    setTimeout(() => {
      cluster.fork();
    }, 2000);
  });
} else {
  const dev = false;
  const app = next({ dev });
  const handle = app.getRequestHandler();

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      handle(req, res, parsedUrl).catch((err) => {
        console.error('[Worker] Request error:', err.message);
        if (!res.headersSent) {
          res.statusCode = 500;
          res.end('Internal Server Error');
        }
      });
    }).listen(3000, '0.0.0.0', () => {
      console.log('[Worker] Ready on http://0.0.0.0:3000');
    });
  }).catch((err) => {
    console.error('[Worker] Failed to start:', err);
    process.exit(1);
  });
}
