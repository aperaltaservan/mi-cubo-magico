// ============================================================
//  test/servidor.js — Que un despliegue llegue de verdad
// ============================================================
//  Esto no es celo: pasó. Con Cloudflare por delante, el
//  `Cache-Control: no-cache` del origen se sustituye por un
//  `max-age` de horas, y el navegador se quedaba con el
//  index.html nuevo y el app.js viejo. La página traía botones
//  que el código cacheado no sabía encender, y desde fuera
//  parecía que el botón estaba roto.
//
//  La solución es que la dirección de cada recurso lleve dentro
//  una huella del código. Da igual lo que haga la caché de quien
//  esté delante: tras un despliegue la dirección es otra.
//
//  Aquí se levanta el servidor de verdad y se comprueba.
// ============================================================

import { spawn } from 'node:child_process';
import { connect } from 'node:net';
import { readFileSync, writeFileSync } from 'node:fs';

let fallos = 0;
let pruebas = 0;
function ok(cond, msg) {
  pruebas++;
  if (!cond) { fallos++; console.log('  FALLA: ' + msg); }
}
function seccion(t) { console.log('--- ' + t + ' ---'); }

const PUERTO = 8123 + (process.pid % 400);
const base = 'http://127.0.0.1:' + PUERTO;

/** Levanta el servidor y espera a que conteste */
async function arrancar(puerto, comoServidor = true) {
  const env = { ...process.env, PORT: String(puerto) };
  if (comoServidor) env.CONTENEDOR = '1'; else delete env.CONTENEDOR;
  const hijo = spawn(process.execPath, ['server.js'], { env, stdio: 'ignore' });
  for (let i = 0; i < 60; i++) {
    try {
      const r = await fetch('http://127.0.0.1:' + puerto + '/health');
      if (r.ok) return { hijo, salud: await r.json() };
    } catch (e) { /* todavía no escucha */ }
    await new Promise((r) => setTimeout(r, 100));
  }
  hijo.kill();
  throw new Error('el servidor no arrancó');
}

/** Pide una ruta tal cual, sin que nadie la normalice por el camino */
function pedirCrudo(puerto, ruta) {
  return new Promise((res, rej) => {
    const s = connect(puerto, '127.0.0.1', () => {
      s.write('GET ' + ruta + ' HTTP/1.1\r\nHost: x\r\nConnection: close\r\n\r\n');
    });
    let todo = '';
    s.on('data', (d) => { todo += d; });
    s.on('end', () => res(Number((todo.match(/^HTTP\/1\.1 (\d+)/) || [])[1])));
    s.on('error', rej);
  });
}

const { hijo, salud } = await arrancar(PUERTO);
try {
  // ------------------------------------------------------------
  seccion('la sonda de salud dice qué versión sirve');
  ok(salud.ok === true, 'tiene que decir que está vivo');
  ok(/^[0-9a-f]{12}$/.test(salud.version || ''),
    'la versión tiene que ser una huella: ' + salud.version);

  // ------------------------------------------------------------
  seccion('la portada reparte direcciones con la versión dentro');
  const portada = await fetch(base + '/');
  const html = await portada.text();
  ok(html.includes('/v/' + salud.version + '/js/app.js'),
    'el script tiene que ir versionado');
  ok(html.includes('/v/' + salud.version + '/css/styles.css'),
    'la hoja de estilos tiene que ir versionada');
  ok(!/src="js\/app\.js"/.test(html), 'no puede quedar la ruta sin versión');
  // el icono va incrustado en la propia página y no se toca
  ok(html.includes('data:image/svg+xml'), 'el favicon incrustado sigue ahí');

  // ------------------------------------------------------------
  seccion('la portada no se puede cachear');
  // Es la que reparte las direcciones nuevas: si se quedara pegada,
  // versionar no serviría de nada.
  const cc = portada.headers.get('cache-control') || '';
  ok(/no-store/.test(cc), 'la portada tiene que ser no-store, y es: ' + cc);

  // ------------------------------------------------------------
  seccion('los recursos versionados se pueden guardar para siempre');
  const app = await fetch(base + '/v/' + salud.version + '/js/app.js');
  ok(app.status === 200, 'el app.js versionado tiene que servirse');
  const ccApp = app.headers.get('cache-control') || '';
  ok(/immutable/.test(ccApp), 'tiene que ser immutable, y es: ' + ccApp);
  ok((app.headers.get('content-type') || '').includes('text/javascript'),
    'y servirse como javascript');

  // ------------------------------------------------------------
  seccion('todo el árbol de módulos cuelga del mismo prefijo');
  // Los módulos se importan con rutas relativas ('./cube.js'), así que
  // versionando la entrada se renuevan todos a la vez. Si esto fallara,
  // el navegador mezclaría código nuevo con código viejo.
  for (const f of ['js/cube.js', 'js/i18n.js', 'js/textos.js', 'js/sections.js',
    'js/entrada.js', 'css/styles.css']) {
    const r = await fetch(base + '/v/' + salud.version + '/' + f);
    ok(r.status === 200, f + ' tiene que servirse con el prefijo de versión');
  }

  // ------------------------------------------------------------
  seccion('el manifiesto y los iconos, para instalarla en el móvil');
  ok(html.includes('rel="manifest"'), 'la portada tiene que enlazar el manifiesto');
  ok(html.includes('rel="apple-touch-icon"'),
    'y el icono de iOS, que no mira el manifiesto');

  const man = await fetch(base + '/manifest.webmanifest');
  ok(man.status === 200, 'el manifiesto tiene que servirse');
  ok((man.headers.get('content-type') || '').includes('manifest'),
    'con su tipo, o el navegador lo ignora: ' + man.headers.get('content-type'));
  const datos = await man.json();
  for (const campo of ['name', 'short_name', 'start_url', 'display', 'icons']) {
    ok(datos[campo] !== undefined, 'al manifiesto le falta ' + campo);
  }
  ok(datos.display === 'standalone', 'tiene que abrirse sin barra del navegador');
  ok(datos.start_url === '/', 'start_url va a la raíz, no a una versión concreta');
  ok(datos.icons.some((i) => i.sizes === '192x192'), 'hace falta el icono de 192');
  ok(datos.icons.some((i) => i.sizes === '512x512'), 'y el de 512');
  ok(datos.icons.some((i) => i.purpose === 'maskable'),
    'y uno maskable, para que Android lo recorte sin comerse el dibujo');

  // los iconos del manifiesto tienen que existir de verdad
  for (const icono of datos.icons) {
    const r = await fetch(base + icono.src);
    ok(r.status === 200, 'el icono ' + icono.src + ' no se sirve');
    const b = Buffer.from(await r.arrayBuffer());
    ok(b.subarray(0, 8).toString('hex') === '89504e470d0a1a0a',
      icono.src + ' tiene que ser un PNG de verdad');
    const lado = Number(icono.sizes.split('x')[0]);
    ok(b.readUInt32BE(16) === lado && b.readUInt32BE(20) === lado,
      icono.src + ' dice ' + icono.sizes + ' pero mide otra cosa');
  }
  // y el de iOS, que va por su cuenta
  const apple = await fetch(base + '/icons/apple-touch-icon.png');
  ok(apple.status === 200, 'el icono de iOS tiene que servirse');
  ok(Buffer.from(await apple.arrayBuffer()).readUInt32BE(16) === 180,
    'el icono de iOS mide 180');

  // ------------------------------------------------------------
  seccion('el service worker, para funcionar sin conexión');
  const sw = await fetch(base + '/sw.js');
  ok(sw.status === 200, 'el service worker tiene que servirse desde la raíz');
  ok((sw.headers.get('content-type') || '').includes('javascript'),
    'con tipo javascript, o el navegador lo rechaza');
  ok(!/immutable/.test(sw.headers.get('cache-control') || ''),
    'y sin prometer que es inmutable: es lo que trae las versiones nuevas');
  const fuente = await sw.text();
  ok(!fuente.includes('__HUELLA__') && !fuente.includes('__RECURSOS__'),
    'no puede quedar ningún hueco de la plantilla sin rellenar');
  ok(fuente.includes(salud.version), 'tiene que llevar dentro la versión de ahora');
  const lista = JSON.parse(fuente.match(/const RECURSOS = (\[.*?\]);/s)[1]);
  ok(lista.includes('/'), 'la portada tiene que guardarse, o no arranca sin conexión');
  ok(lista.every((r) => r === '/' || r.startsWith('/v/' + salud.version)),
    'todo lo demás va versionado, que es lo que hace seguro cachearlo');
  ok(lista.some((r) => r.endsWith('/js/app.js')), 'y el código, claro');
  ok(lista.some((r) => r.endsWith('/css/styles.css')), 'y los estilos');
  // lo que promete guardar tiene que existir de verdad
  for (const ruta of lista) {
    const r = await fetch(base + ruta, { method: 'HEAD' });
    ok(r.status === 200, 'promete guardar ' + ruta + ' pero da ' + r.status);
  }

  // ------------------------------------------------------------
  seccion('sólo se sirve la app');
  // fetch() normaliza los '..' antes de enviar, así que para probar de
  // verdad la travesía hay que hablar por el socket a pelo.
  for (const malo of ['/package.json', '/server.js', '/../server.js',
    '/js/../server.js', '/v/abc/../../server.js', '/%2e%2e/server.js',
    '/js/sub/otro.js']) {
    const codigo = await pedirCrudo(PUERTO, malo);
    ok(codigo === 404 || codigo === 403,
      malo + ' no debería servirse (dio ' + codigo + ')');
  }
  // y lo que sí es de la app, se sirve
  ok(await pedirCrudo(PUERTO, '/js/app.js') === 200, 'js/app.js sí se sirve');
} finally {
  hijo.kill();
}

// ------------------------------------------------------------
seccion('en local no se promete que nada sea inmutable');
// Trabajando en el proyecto el código cambia con la dirección igual, y
// una promesa de inmutable dejaría al navegador con la copia vieja. Es
// la trampa que tiende el propio versionado a quien lo programa.
{
  const local = await arrancar(PUERTO + 2, false);
  try {
    const r = await fetch('http://127.0.0.1:' + (PUERTO + 2)
      + '/v/' + local.salud.version + '/js/app.js');
    const cc = r.headers.get('cache-control') || '';
    ok(!/immutable/.test(cc), 'en local no puede ser immutable, y es: ' + cc);
    ok(/no-cache/.test(cc), 'en local se revalida siempre, y es: ' + cc);
  } finally { local.hijo.kill(); }
}

// ------------------------------------------------------------
seccion('la huella cambia si cambia el código');
// Si no cambiara, un despliegue nuevo reusaría las direcciones viejas
// y volveríamos justo al problema que esto arregla.
const RUTA = 'js/textos.js';
const original = readFileSync(RUTA);
try {
  writeFileSync(RUTA, Buffer.concat([original, Buffer.from('\n// huella\n')]));
  const otro = await arrancar(PUERTO + 1);
  ok(otro.salud.version !== salud.version,
    'con el código cambiado la huella tiene que ser otra');
  otro.hijo.kill();
} finally {
  writeFileSync(RUTA, original);
}

console.log('');
console.log(pruebas + ' pruebas del servidor OK, ' + fallos + ' fallos');
if (fallos) process.exit(1);
