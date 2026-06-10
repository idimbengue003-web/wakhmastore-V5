const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cluster = require('cluster');

if (cluster.isMaster) {
  console.log('[Supervisor] Starting worker...');
  
  const worker = cluster.fork();
  
  worker.on('exit', (code, signal) => {
    console.log(`[Supervisor] Worker died (${code}/${signal}). Restarting in 1s...`);
    setTimeout(() => {
      cluster.fork();
    }, 1000);
  });
} else {
  const dev = false;
  const app = next({ dev });
  const handle = app.getRequestHandler();

  // Request serialization queue
  let processing = false;
  const queue = [];

  function processQueue() {
    if (processing || queue.length === 0) return;
    processing = true;
    const { req, res, parsedUrl } = queue.shift();
    
    handle(req, res, parsedUrl).then(() => {
      processing = false;
      setImmediate(processQueue);
    }).catch((err) => {
      console.error('[Worker] Request error:', err.message);
      processing = false;
      setImmediate(processQueue);
    });
  }

  app.prepare().then(() => {
    createServer((req, res) => {
      const parsedUrl = parse(req.url, true);
      queue.push({ req, res, parsedUrl });
      processQueue();
    }).listen(3000, () => {
      console.log('[Worker] Ready on http://localhost:3000');
    });
  }).catch((err) => {
    console.error('[Worker] Failed to start:', err);
    process.exit(1);
  });
}
