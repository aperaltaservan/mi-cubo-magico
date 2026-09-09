// ============================================================
//  sw.js — Que funcione sin conexión
// ============================================================
//  Plantilla: el servidor le mete la huella de esta versión y la
//  lista de ficheros antes de servirlo. Por eso vive en la raíz,
//  que es lo que le da mando sobre toda la página.
//
//  Dos reglas, y sólo dos:
//
//    · La portada va SIEMPRE a la red primero. Es la que reparte
//      las direcciones nuevas tras un despliegue, así que no puede
//      quedarse vieja teniendo conexión. Sin conexión se saca la
//      guardada, que para eso está.
//
//    · Lo versionado (/v/…) sale de la caché sin preguntar. Su
//      dirección lleva dentro una huella de su contenido, así que
//      lo guardado no puede estar viejo: si el contenido cambiara,
//      la dirección sería otra.
//
//  Esa segunda regla es la que hace que esto sea seguro. Un service
//  worker mal hecho deja a la gente con código viejo y no hay forma
//  de sacarla de ahí; aquí no puede pasar, porque nada se guarda
//  bajo una dirección que pueda significar dos cosas distintas.
//
//  Al activarse se borran las cachés de versiones anteriores, así
//  que no se va acumulando basura despliegue tras despliegue.
// ============================================================

const HUELLA = '__HUELLA__';
const CACHE = 'cubo-' + HUELLA;
const RECURSOS = __RECURSOS__;

self.addEventListener('install', (e) => {
  e.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Uno a uno y sin rendirse: si un fichero fallara, addAll tiraría
    // la instalación entera y nos quedaríamos sin nada guardado.
    await Promise.allSettled(RECURSOS.map(async (ruta) => {
      const res = await fetch(ruta, { cache: 'reload' });
      if (res.ok) await cache.put(ruta, res);
    }));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (e) => {
  e.waitUntil((async () => {
    for (const nombre of await caches.keys()) {
      if (nombre !== CACHE) await caches.delete(nombre);
    }
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  const esPortada = req.mode === 'navigate'
    || url.pathname === '/' || url.pathname === '/index.html';

  // Guardar tarda más que contestar. Sin waitUntil, el navegador puede
  // dar por terminado el trabajo y matar al worker a mitad de escritura,
  // y entonces lo que creíamos guardado no está.
  const guardar = (peticion, respuesta) =>
    e.waitUntil(caches.open(CACHE).then((c) => c.put(peticion, respuesta)));

  if (esPortada) {
    e.respondWith((async () => {
      try {
        const res = await fetch(req);
        if (res.ok) guardar('/', res.clone());
        return res;
      } catch (err) {
        const guardada = await caches.match('/');
        if (guardada) return guardada;
        throw err;
      }
    })());
    return;
  }

  if (url.pathname.startsWith('/v/')) {
    e.respondWith((async () => {
      const guardado = await caches.match(req);
      if (guardado) return guardado;
      const res = await fetch(req);
      if (res.ok) guardar(req, res.clone());
      return res;
    })());
  }
});
