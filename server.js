// ============================================================
//  server.js — Servidor de ficheros mínimo, sin dependencias
// ============================================================
//  El Bluetooth Web sólo funciona en https o en localhost, por
//  eso hace falta servir la app en vez de abrir el archivo a
//  pelo. Vale igual para el doble clic en INICIAR.bat que para
//  el contenedor de un servidor.
//
//  Las URLs de los recursos llevan dentro una huella del código:
//
//      /v/a3f9c1d2/js/app.js
//
//  La huella se calcula al arrancar, del contenido de todos los
//  ficheros que se sirven, y cambia en cuanto cambia cualquiera.
//  Es la única manera de no depender de la caché de quien esté
//  delante: da igual lo que haga un proxy con las cabeceras,
//  porque tras un despliegue la dirección es OTRA y no la tiene.
//
//  Esto no era un capricho: con Cloudflare por delante, un
//  `Cache-Control: no-cache` del origen se sustituye por un
//  `max-age` de horas, y el navegador se quedaba con el
//  index.html nuevo y el app.js viejo. La página traía botones
//  que el código cacheado no sabía encender.
//
//  Como los módulos se importan unos a otros con rutas relativas
//  ('./cube.js'), basta con versionar la entrada: todo el árbol
//  cuelga del mismo prefijo y se renueva junto.
// ============================================================
import { createServer } from 'node:http';
import { readFile, stat, readdir } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';

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

// ------------------------------------------------------------
//  Huella del código
// ------------------------------------------------------------
const CARPETAS = ['js', 'css', 'icons'];
const SUELTOS = ['index.html', 'manifest.webmanifest', 'sw.js'];

/** Todo lo que se sirve, en orden estable */
async function ficheros() {
  const lista = [];
  for (const carpeta of CARPETAS) {
    let nombres;
    try { nombres = (await readdir(join(ROOT, carpeta))).sort(); }
    catch (e) { continue; }
    for (const n of nombres) lista.push(carpeta + '/' + n);
  }
  return lista;
}

/** Calcula una huella corta del contenido de la app */
async function calcularHuella() {
  const h = createHash('sha1');
  for (const ruta of [...await ficheros(), ...SUELTOS]) {
    h.update(ruta);
    h.update(await readFile(join(ROOT, ruta)));
  }
  return h.digest('hex').slice(0, 12);
}

// En un servidor la huella se calcula una vez, al arrancar: el código no
// cambia por debajo. Trabajando en local sí cambia a cada rato, y si se
// quedara fija el navegador serviría de su caché la copia "immutable" que
// ya tiene, con la dirección igual y el contenido distinto. Así que fuera
// del contenedor se recalcula en cada visita a la portada y los recursos
// no se marcan immutable.
const EN_SERVIDOR = Boolean(process.env.DOKPLOY || process.env.CONTENEDOR);
let HUELLA = await calcularHuella();
const prefijo = () => '/v/' + HUELLA;

/** El index.html, con los recursos apuntando a la versión de ahora */
async function portada() {
  if (!EN_SERVIDOR) HUELLA = await calcularHuella();   // en local, al vuelo
  const p = prefijo();
  const html = await readFile(join(ROOT, 'index.html'), 'utf8');
  return Buffer.from(html
    .replace('href="css/styles.css"', 'href="' + p + '/css/styles.css"')
    .replace('src="js/app.js"', 'src="' + p + '/js/app.js"')
    .replace('href="manifest.webmanifest"', 'href="' + p + '/manifest.webmanifest"')
    .replace('href="icons/apple-touch-icon.png"',
      'href="' + p + '/icons/apple-touch-icon.png"'), 'utf8');
}

/**
 * El manifiesto, con sus iconos versionados igual que todo lo demás.
 * start_url y scope se dejan en la raíz a propósito: es la dirección
 * que se guarda en la pantalla de inicio y tiene que seguir valiendo
 * cuando la versión cambie.
 */
async function manifiesto() {
  const txt = await readFile(join(ROOT, 'manifest.webmanifest'), 'utf8');
  return Buffer.from(txt.replaceAll('"/icons/', '"' + prefijo() + '/icons/'), 'utf8');
}

/**
 * El service worker, con la huella y la lista de ficheros de esta
 * versión metidas dentro. Va servido desde la raíz porque el alcance
 * de un service worker es la carpeta desde la que se sirve, y éste
 * tiene que mandar sobre toda la página.
 */
async function serviceWorker() {
  if (!EN_SERVIDOR) HUELLA = await calcularHuella();
  const p = prefijo();
  const recursos = ['/', p + '/manifest.webmanifest',
    ...(await ficheros()).map((f) => p + '/' + f)];
  const txt = await readFile(join(ROOT, 'sw.js'), 'utf8');
  return Buffer.from(txt
    .replace('__HUELLA__', HUELLA)
    .replace('__RECURSOS__', JSON.stringify(recursos)), 'utf8');
}

const servidor = createServer(async (req, res) => {
  // Sonda de salud: la usan Docker y Dokploy para saber si esto vive.
  // Dice también qué versión está sirviendo, que es la forma rápida de
  // comprobar si un despliegue ha entrado de verdad.
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
    res.end(JSON.stringify({ ok: true, version: HUELLA, uptime: Math.round(process.uptime()) }));
    return;
  }

  try {
    let path = decodeURIComponent(new URL(req.url, 'http://x').pathname);

    // La portada nunca se cachea: es la que reparte las direcciones
    // nuevas, y si se quedara pegada no serviría de nada versionar.
    if (path === '/' || path === '/index.html') {
      const body = await portada();
      res.writeHead(200, {
        'Content-Type': TYPES['.html'],
        'Cache-Control': 'no-store, must-revalidate',
        'Content-Length': body.length,
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
      return;
    }

    // El service worker manda sobre toda la página, así que va desde
    // la raíz y sin versión en la dirección: el navegador lo revalida
    // solo, y lo que cambia dentro es la huella que lleva escrita.
    if (path === '/sw.js') {
      const body = await serviceWorker();
      res.writeHead(200, {
        'Content-Type': TYPES['.js'],
        'Cache-Control': 'no-cache',
        'Content-Length': body.length,
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
      return;
    }

    // Un recurso con versión: como la dirección cambia con el
    // contenido, se puede guardar para siempre sin miedo.
    const versionado = path.startsWith('/v/');
    if (versionado) path = path.replace(/^\/v\/[^/]+/, '');

    // El manifiesto se sirve reescrito, para que sus iconos lleven la
    // versión. Cachearlo poco: es barato y así un cambio de nombre o de
    // color entra sin esperar.
    if (path === '/manifest.webmanifest') {
      const body = await manifiesto();
      res.writeHead(200, {
        'Content-Type': TYPES['.webmanifest'],
        'Cache-Control': 'no-cache',
        'Content-Length': body.length,
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : body);
      return;
    }

    // Sólo se sirve la app: la portada, los estilos, los módulos, los
    // iconos y el manifiesto. Ni el server.js ni el package.json tienen
    // nada que hacer en el navegador.
    if (!/^\/(css|js|icons)\/[\w.-]+$/.test(path)
      && path !== '/manifest.webmanifest') throw new Error('fuera de la app');

    const file = join(ROOT, normalize(path).replace(/^(\.\.[/\\])+/, ''));
    if (!file.startsWith(ROOT)) { res.writeHead(403).end('no'); return; }

    const info = await stat(file);
    if (!info.isFile()) throw new Error('no es un fichero');
    const marca = info.mtime.toUTCString();
    // Sólo se promete inmutable en el servidor, donde la huella se fija al
    // arrancar. En local el código cambia con la dirección igual, y esa
    // promesa dejaría al navegador con la copia vieja.
    const cache = versionado && EN_SERVIDOR
      ? 'public, max-age=31536000, immutable'
      : 'no-cache';

    if (!versionado && req.headers['if-modified-since'] === marca) {
      res.writeHead(304, { 'Cache-Control': cache, 'Last-Modified': marca });
      res.end();
      return;
    }

    const body = await readFile(file);
    res.writeHead(200, {
      'Content-Type': TYPES[extname(file)] || 'application/octet-stream',
      'Cache-Control': cache,
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
  console.log('   Mi Cubo Magico esta en marcha  (version ' + HUELLA + ')');
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
