// ============================================================
//  test/sw.js — Que el modo sin conexión no deje a nadie colgado
// ============================================================
//  Un service worker mal hecho es peor que no tenerlo: deja a la
//  gente con código viejo y no hay manera de sacarla de ahí. Como
//  no se puede pedir "recarga forzada" a alguien que está en el
//  metro con su hijo y un cubo, esto conviene tenerlo atado.
//
//  Aquí no se simula un navegador entero: se EJECUTA el sw.js de
//  verdad, el mismo que sirve el servidor, dentro de un entorno
//  fingido con lo justo (caches, fetch, self). Y luego se le
//  pregunta lo que importa:
//
//    · ¿guarda lo que hace falta al instalarse?
//    · ¿la portada va a la red primero, aun teniendo copia?
//    · ¿y sin conexión, saca la copia en vez de fallar?
//    · ¿lo versionado sale de la caché sin tocar la red?
//    · ¿al activarse borra las cachés de versiones anteriores?
// ============================================================

import { createContext, runInContext } from 'node:vm';
import { readFileSync } from 'node:fs';

let fallos = 0;
let pruebas = 0;
function ok(cond, msg) {
  pruebas++;
  if (!cond) { fallos++; console.log('  FALLA: ' + msg); }
}
function seccion(t) { console.log('--- ' + t + ' ---'); }

const HUELLA = 'abc123abc123';
const RECURSOS = ['/', '/v/' + HUELLA + '/js/app.js', '/v/' + HUELLA + '/css/styles.css'];

// ---------- un navegador de mentira, lo justo ----------
function montar({ sinRed = false, cachesPrevias = [] } = {}) {
  const almacen = new Map();               // nombre -> Map(url -> texto)
  for (const n of cachesPrevias) almacen.set(n, new Map());

  const clave = (r) => (typeof r === 'string' ? r : r.url).replace('https://cubo', '');
  const laCache = (nombre) => ({
    async put(req, res) { almacen.get(nombre).set(clave(req), await res.text()); },
    async match(req) {
      const v = almacen.get(nombre).get(clave(req));
      return v === undefined ? undefined : new Response(v);
    },
    async keys() { return [...almacen.get(nombre).keys()]; },
  });

  let pedidosARed = [];
  const contexto = {
    console,
    URL,
    Response,
    caches: {
      async open(nombre) {
        if (!almacen.has(nombre)) almacen.set(nombre, new Map());
        return laCache(nombre);
      },
      async keys() { return [...almacen.keys()]; },
      async delete(nombre) { return almacen.delete(nombre); },
      async match(req) {
        for (const nombre of almacen.keys()) {
          const r = await laCache(nombre).match(req);
          if (r) return r;
        }
        return undefined;
      },
    },
    async fetch(req) {
      const url = clave(req);
      pedidosARed.push(url);
      if (sinRed) throw new TypeError('sin conexión');
      return new Response('de la red: ' + url, { status: 200 });
    },
  };
  const oyentes = {};
  contexto.self = contexto;
  contexto.addEventListener = (tipo, fn) => { oyentes[tipo] = fn; };
  contexto.skipWaiting = async () => {};
  contexto.clients = { claim: async () => {} };
  contexto.location = { origin: 'https://cubo' };
  createContext(contexto);

  const plantilla = readFileSync('sw.js', 'utf8');
  runInContext(plantilla
    .replace('__HUELLA__', HUELLA)
    .replace('__RECURSOS__', JSON.stringify(RECURSOS)), contexto);

  return {
    almacen,
    oyentes,
    get pedidos() { return pedidosARed; },
    limpiaPedidos() { pedidosARed = []; },
    async lanzar(tipo, evento) {
      const esperas = [];
      const respuestas = [];
      await oyentes[tipo]({
        ...evento,
        waitUntil: (p) => esperas.push(p),
        respondWith: (p) => respuestas.push(p),
      });
      // Primero la respuesta y luego los waitUntil: el worker los pide
      // desde dentro de respondWith, así que antes todavía no existen.
      const res = respuestas.length ? await respuestas[0] : null;
      await Promise.all(esperas);
      return res;
    },
  };
}

const peticion = (ruta, mode = 'no-cors') =>
  ({ url: 'https://cubo' + ruta, method: 'GET', mode });

// ------------------------------------------------------------
seccion('al instalarse guarda la app entera');
{
  const sw = montar();
  await sw.lanzar('install', {});
  const guardados = [...sw.almacen.get('cubo-' + HUELLA).keys()];
  ok(guardados.length === RECURSOS.length,
    'tiene que guardar los ' + RECURSOS.length + ', y guarda ' + guardados.length);
  for (const r of RECURSOS) ok(guardados.includes(r), 'falta por guardar: ' + r);
}

// ------------------------------------------------------------
seccion('la portada va a la red primero, aunque tenga copia');
// Es la que reparte las direcciones nuevas tras un despliegue: si se
// sirviera de la caché, el arreglo del versionado no valdría de nada.
{
  const sw = montar();
  await sw.lanzar('install', {});
  sw.limpiaPedidos();
  const res = await sw.lanzar('fetch', { request: peticion('/', 'navigate') });
  ok(sw.pedidos.includes('/'), 'tiene que preguntar a la red');
  ok((await res.text()).startsWith('de la red'), 'y devolver lo de la red');
}

// ------------------------------------------------------------
seccion('sin conexión, la portada sale de la copia guardada');
{
  const sw = montar({ sinRed: true });
  // la caché queda como la habría dejado una visita anterior con red
  const cache = new Map([['/', 'la portada guardada']]);
  sw.almacen.set('cubo-' + HUELLA, cache);
  const res = await sw.lanzar('fetch', { request: peticion('/', 'navigate') });
  ok(res !== null, 'sin conexión tiene que contestar algo');
  ok((await res.text()) === 'la portada guardada', 'y ser la copia guardada');
}

// ------------------------------------------------------------
seccion('lo versionado sale de la caché sin tocar la red');
// Su dirección lleva dentro una huella del contenido, así que lo
// guardado no puede estar viejo: si cambiara, la dirección sería otra.
{
  const sw = montar();
  await sw.lanzar('install', {});
  sw.limpiaPedidos();
  const res = await sw.lanzar('fetch', { request: peticion('/v/' + HUELLA + '/js/app.js') });
  ok(sw.pedidos.length === 0, 'no tenía que ir a la red, y fue a: ' + sw.pedidos);
  ok(res !== null, 'tiene que contestar de la caché');
}

// ------------------------------------------------------------
seccion('lo versionado que no esté guardado sí se pide, y se guarda');
{
  const sw = montar();
  await sw.lanzar('install', {});
  sw.limpiaPedidos();
  const nueva = '/v/' + HUELLA + '/js/otro.js';
  await sw.lanzar('fetch', { request: peticion(nueva) });
  ok(sw.pedidos.includes(nueva), 'la primera vez hay que pedirlo');
  ok([...sw.almacen.get('cubo-' + HUELLA).keys()].includes(nueva),
    'y queda guardado para la próxima');
}

// ------------------------------------------------------------
seccion('lo de fuera no se toca');
{
  const sw = montar();
  await sw.lanzar('install', {});
  const res = await sw.lanzar('fetch', { request: { url: 'https://otra-web/x.js', method: 'GET' } });
  ok(res === null, 'una petición a otro sitio se deja pasar tal cual');
  const post = await sw.lanzar('fetch', { request: { url: 'https://cubo/', method: 'POST' } });
  ok(post === null, 'y un POST también');
}

// ------------------------------------------------------------
seccion('al activarse borra las versiones viejas');
// Si no, cada despliegue dejaría su copia y el móvil se iría llenando.
{
  const sw = montar({ cachesPrevias: ['cubo-viejo1', 'cubo-viejo2', 'cubo-' + HUELLA] });
  await sw.lanzar('activate', {});
  const quedan = [...sw.almacen.keys()];
  ok(quedan.length === 1, 'tiene que quedar una sola caché, y quedan ' + quedan.length);
  ok(quedan[0] === 'cubo-' + HUELLA, 'y ser la de ahora, no ' + quedan[0]);
}

console.log('');
console.log(pruebas + ' pruebas del modo sin conexión OK, ' + fallos + ' fallos');
if (fallos) process.exit(1);
