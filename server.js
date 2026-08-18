import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';

const root = new URL('./public/', import.meta.url).pathname;
const port = Number(process.env.PORT || 3000);

const types = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml; charset=utf-8'],
]);

function safePath(urlPath) {
  const requested = urlPath === '/' ? '/index.html' : decodeURIComponent(urlPath);
  const resolved = normalize(join(root, requested));
  return resolved.startsWith(root) ? resolved : join(root, 'index.html');
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url || '/', `http://${request.headers.host}`);
    const filePath = safePath(url.pathname);
    const body = await readFile(filePath);
    response.writeHead(200, { 'Content-Type': types.get(extname(filePath)) || 'application/octet-stream' });
    response.end(body);
  } catch (error) {
    response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    response.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Armani AI is online at http://localhost:${port}`);
});
