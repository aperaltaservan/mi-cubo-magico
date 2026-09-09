// ============================================================
//  test/i18n.js — Que no falte nada por traducir
// ============================================================
//  La clave de cada texto es el propio español, así que se pueden
//  sacar del código: todas las llamadas t('…') y todos los nodos
//  marcados con data-i18n en el HTML. Lo que aparezca ahí tiene que
//  estar en textos.js, y la traducción tiene que llevar las mismas
//  etiquetas y los mismos huecos {…} que el original: si no, la
//  página inglesa saldría con un <b> suelto o con un {n} sin valor.
// ============================================================

import { readFileSync, readdirSync } from 'node:fs';
import { EN } from '../js/textos.js';
import { LESSONS } from '../js/lessons.js';
import { PHASE_INFO, DETALLES } from '../js/solver.js';
import { PATRONES } from '../js/patrones.js';
import { SETS } from '../js/algs.js';

let fallos = 0;
let pruebas = 0;
function ok(cond, msg) {
  pruebas++;
  if (!cond) { fallos++; console.log('  FALLA: ' + msg); }
}
function seccion(t) { console.log('--- ' + t + ' ---'); }

const normalizar = (s) => String(s).trim().replace(/\s+/g, ' ');
const tiene = (clave) => EN[normalizar(clave)] !== undefined;

// ------------------------------------------------------------
seccion('las llamadas a t() del código');
// Sólo se sacan las literales de una pieza: t('…') o t("…"), con
// las concatenaciones de varias líneas ya unidas. Lo que se pasa
// en una variable (los textos de las lecciones, por ejemplo) se
// comprueba aparte, más abajo, recorriendo los propios datos.
const ficheros = readdirSync('js').filter((f) => f.endsWith('.js'));
const usadas = new Set();
for (const f of ficheros) {
  let src = readFileSync('js/' + f, 'utf8');
  // une 'aaa ' + 'bbb' en una sola literal, que es como se escriben
  // los textos largos para no pasarse de ancho de línea
  for (let i = 0; i < 6; i++) {
    src = src.replace(/'([^'\\]*)'\s*\+\s*'/g, "'$1")
      .replace(/'([^'\\]*)'\s*\n\s*\+\s*'/g, "'$1");
  }
  for (const m of src.matchAll(/\bt\(\s*'((?:[^'\\]|\\.)*)'/g)) {
    const clave = m[1].replace(/\\n/g, '\n').replace(/\\'/g, "'");
    if (clave.trim()) usadas.add(normalizar(clave));
  }
}
console.log('  ' + usadas.size + ' textos pedidos desde el código');
for (const clave of usadas) ok(tiene(clave), 'sin traducir: ' + clave);

// ------------------------------------------------------------
seccion('los textos marcados en el HTML');
const html = readFileSync('index.html', 'utf8');
const enHtml = [];
for (const m of html.matchAll(/<([a-z0-9]+)([^>]*?)\sdata-i18n(?:=""|(?=[\s>]))([^>]*)>([\s\S]*?)<\/\1>/g)) {
  enHtml.push(normalizar(m[4]));
}
for (const m of html.matchAll(/data-i18n-title[^>]*>|title="([^"]+)"[^>]*data-i18n-title/g)) {
  if (m[1]) enHtml.push(normalizar(m[1]));
}
// los title="" de los botones marcados
for (const m of html.matchAll(/<[^>]*\btitle="([^"]+)"[^>]*\bdata-i18n-title\b[^>]*>/g)) {
  enHtml.push(normalizar(m[1]));
}
console.log('  ' + enHtml.length + ' textos marcados en el HTML');
ok(enHtml.length > 50, 'el HTML tiene que estar marcado (salen ' + enHtml.length + ')');
for (const clave of enHtml) ok(tiene(clave), 'sin traducir (HTML): ' + clave);

// ------------------------------------------------------------
seccion('los textos que viven en los datos');
// Estos no se pasan a t() como literal, sino por variable: t(l.title).
// Se recorren los datos para que no se escape ninguno.
const deDatos = [];
for (const l of LESSONS) {
  deDatos.push(l.title, l.idea, l.truco, l.hecho, ...l.texto);
  if (l.demoNombre) deDatos.push(l.demoNombre);
  if (l.demo2Nombre) deDatos.push(l.demo2Nombre);
}
for (const p of PHASE_INFO) deDatos.push(p.name, p.goal, p.kid);
for (const [pista, detalle] of Object.entries(DETALLES)) deDatos.push(pista, detalle);
for (const p of PATRONES) deDatos.push(p.nombre, p.desc);
for (const kind of Object.keys(SETS)) {
  for (const c of SETS[kind].casos) deDatos.push(c.name);
}
// Los grupos son pocos, salen siempre en pantalla y muchos no llevan
// acentos ('Rayos', 'Peces'), asi que se exigen todos sin heuristica.
for (const kind of Object.keys(SETS)) {
  for (const g of SETS[kind].grupos) {
    ok(tiene(g), 'grupo sin traducir: ' + kind + ' / ' + g);
  }
}
console.log('  ' + deDatos.length + ' textos en lecciones, pasos, patrones y casos');
for (const clave of deDatos) {
  // Los nombres de caso ya vienen en inglés (OLL 21 · Double Headlights,
  // Sune, J (a)…): sólo hacen falta los que están en castellano.
  if (!/[áéíóúñ¿¡]|\b(de|la|el|los|las|con|para|que)\b/i.test(clave)) continue;
  ok(tiene(clave), 'sin traducir (datos): ' + clave);
}

// ------------------------------------------------------------
// Textos que se escriben igual en los dos idiomas. Se listan a mano para
// que una traducción olvidada no pase por buena por descuido.
const IGUALES = new Set([
  'Idioma / Language',        // el propio selector, en los dos idiomas a la vez
  '2 · {patron}',             // sólo numeración y el nombre del patrón, ya traducido
  '▶️ {nombre}',              // sólo un icono y el nombre de la fórmula
  'L (diagonal)',             // el nombre del caso es el mismo
  '2 · F2L', '3 · OLL', '4 · PLL',     // rótulos de los pasos del método
  'Tetris', 'Anaconda', 'Superflip',   // nombres propios de los patrones
]);

seccion('las traducciones respetan etiquetas y huecos');
const etiquetas = (s) => (String(s).match(/<\/?[a-z]+[^>]*>/g) || []).sort().join('');
const huecos = (s) => (String(s).match(/\{\w+\}/g) || []).sort().join('');
for (const [es, en] of Object.entries(EN)) {
  ok(etiquetas(es) === etiquetas(en),
    'etiquetas distintas en: ' + es.slice(0, 55));
  ok(huecos(es) === huecos(en), 'huecos distintos en: ' + es.slice(0, 55));
  ok(String(en).trim().length > 0, 'traducción vacía: ' + es.slice(0, 55));
  ok(es !== en || IGUALES.has(es),
    'igual en los dos idiomas y no está en la lista de los que sí lo son: ' + es.slice(0, 55));
}

// ------------------------------------------------------------
seccion('el diccionario no tiene claves sin espacios normalizados');
for (const clave of Object.keys(EN)) {
  ok(clave === normalizar(clave), 'clave con espacios raros: ' + JSON.stringify(clave.slice(0, 50)));
}

console.log('');
console.log(pruebas + ' pruebas de idioma OK, ' + fallos + ' fallos');
if (fallos) process.exit(1);
