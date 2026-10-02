const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

const MIME_TYPES = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'text/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp3': 'audio/mpeg',
  '.m4a': 'audio/mp4'
};

const server = http.createServer((req, res) => {
  console.log(`${req.method} ${req.url}`);

  const cleanPath = req.url.split('?')[0];

  // 1. Forward /uploads/ requests to backend/uploads if not found in root
  if (cleanPath.startsWith('/uploads/')) {
    const rootUploads = path.join(__dirname, cleanPath);
    const backendUploads = path.join(__dirname, 'backend', cleanPath);
    if (fs.existsSync(backendUploads)) {
      serveFile(backendUploads, res);
      return;
    } else if (fs.existsSync(rootUploads)) {
      serveFile(rootUploads, res);
      return;
    }
  }

  // 2. Reverse proxy /api and /admin API calls to FastAPI backend on port 8000
  if (cleanPath.startsWith('/api/') || cleanPath.startsWith('/admin/') || cleanPath === '/health') {
    const proxyReq = http.request({
      hostname: '127.0.0.1',
      port: 8000,
      path: req.url,
      method: req.method,
      headers: {
        ...req.headers,
        host: '127.0.0.1:8000'
      }
    }, (proxyRes) => {
      res.writeHead(proxyRes.statusCode, proxyRes.headers);
      proxyRes.pipe(res);
    });

    proxyReq.on('error', (err) => {
      console.warn(`Proxy to backend failed: ${err.message}`);
      res.statusCode = 502;
      res.setHeader('Content-Type', 'application/json');
      res.end(JSON.stringify({ detail: 'Backend server at port 8000 is unreachable.' }));
    });

    req.pipe(proxyReq);
    return;
  }

  // 3. Static site file serving
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : cleanPath);
  
  if (!filePath.startsWith(__dirname)) {
    res.statusCode = 403;
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (err) {
      // If file not found, try appending .html (clean URLs support)
      const htmlFilePath = filePath + '.html';
      fs.stat(htmlFilePath, (htmlErr, htmlStats) => {
        if (!htmlErr && htmlStats.isFile()) {
          serveFile(htmlFilePath, res);
        } else {
          // Serve index.html or 404
          res.statusCode = 404;
          res.setHeader('Content-Type', 'text/plain');
          res.end('404 Not Found');
        }
      });
      return;
    }

    if (stats.isDirectory()) {
      filePath = path.join(filePath, 'index.html');
      fs.stat(filePath, (indexErr) => {
        if (indexErr) {
          res.statusCode = 404;
          res.end('Not Found');
        } else {
          serveFile(filePath, res);
        }
      });
    } else {
      serveFile(filePath, res);
    }
  });
});

function serveFile(filePath, res) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.statusCode = 500;
      res.end('Server Error');
      return;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', contentType);
    res.end(data);
  });
}

server.listen(PORT, () => {
  console.log(`Local test server is running at: http://localhost:${PORT}/`);
  console.log('Press Ctrl+C to stop the server.');
});
