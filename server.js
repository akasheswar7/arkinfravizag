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

  // Normalize URL path and prevent directory traversal
  let filePath = path.join(__dirname, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  
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
