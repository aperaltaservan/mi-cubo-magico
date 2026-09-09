// ============================================================
//  server.js — Servidor de ficheros mínimo, sin dependencias
// ============================================================
//  El Bluetooth Web sólo funciona en https o en localhost, por
//  eso hace falta servir la app en vez de abrir el archivo a
//  pelo. Vale igual para el doble clic en INICIAR.bat que para
//  el contenedor de un servidor.
// ============================================================
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT) || 8080;
const HOST = process.env.HOST || '0.0.0.0';   // en un contenedor hay que
                                              // escuchar en todas las interfaces
const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.webmanifest': 'application/manifest+json',
};

const servidor = createServer(async (req, res) => {
  // Sonda de salud: la usan Docker y Dokploy para saber si esto vive
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, uptime: Math.round(process.uptime()) }));
    return;
  }

  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    if (path === '/') path = '/index.html';
    const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end('no'); return; }

    const info = await stat(file);
    if (!info.isFile()) throw new Error('no es un fichero');
    const marca = info.mtime.toUTCString();

    // El navegador puede reusar lo que ya tiene, pero preguntando siempre:
    // así no se queda con código viejo tras publicar una versión nueva.
    if (req.headers['if-modified-since'] === marca) {
      res.writeHead(304, { 'Cache-Control': 'no-cache', 'Last-Modified': marca });
      res.end();
      return;
    }

    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
      'Last-Modified': marca,
      'Content-Length': body.length,
      'X-Content-Type-Options': 'nosniff',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (e) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('No encontrado');
  }
});

servidor.listen(PORT, HOST, () => {
  const enDocker = process.env.DOKPLOY || process.env.CONTENEDOR;
  console.log('');
  console.log('   Mi Cubo Magico esta en marcha');
  console.log(enDocker
    ? '   Escuchando en ' + HOST + ':' + PORT
    : '   Abre en Chrome o Edge:  http://localhost:' + PORT);
  console.log('');
  if (!enDocker) console.log('   (para cerrar: Ctrl+C)');
});

// En un contenedor, Docker manda SIGTERM al parar: hay que cerrar bien
for (const senal of ['SIGTERM', 'SIGINT']) {
  process.on(senal, () => {
    servidor.close(() => process.exit(0));
    setTimeout(() => process.exit(0), 3000).unref();
  });
}
