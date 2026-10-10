// A tiny static server. `npm start` serves the repo at http://127.0.0.1:4187 ; the tests start their own.
import http from 'http';
import fs from 'fs';
import path from 'path';
import {fileURLToPath} from 'url';
const TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json',
  '.md': 'text/markdown'
};
export function serve(root, port) {
  root = path.resolve(root);
  return new Promise(res => {
    const s = http.createServer((q, r) => {
      let p = decodeURIComponent(q.url.split('?')[0]);
      if (p.endsWith('/')) p += 'index.html';
      const f = path.join(root, p);
      if (!f.startsWith(root)) {
        r.writeHead(403);
        return r.end();
      }
      fs.readFile(f, (e, d) => {
        if (e) {
          r.writeHead(404);
          return r.end('not found ' + p);
        }
        r.writeHead(200, {
          'content-type': TYPES[path.extname(f)] || 'application/octet-stream',
          'cache-control': 'no-store'
        });
        r.end(d);
      });
    });
    s.listen(port || 0, '127.0.0.1', () =>
      res({server: s, port: s.address().port, url: 'http://127.0.0.1:' + s.address().port})
    );
  });
}
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const r = await serve(process.argv[2] || '.', +process.argv[3] || 4187);
  console.log('serving on ' + r.url + '  (open ' + r.url + '/ for the table list)');
}
