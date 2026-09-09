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
async function arrancar(puerto) {
  const hijo = spawn(process.execPath, ['server.js'], {
    env: { ...process.env, PORT: String(puerto), CONTENEDOR: '1' },
    stdio: 'ignore',
  });
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
