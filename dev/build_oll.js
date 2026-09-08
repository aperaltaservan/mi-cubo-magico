// Script de desarrollo: descarga el conjunto estándar de los 57 OLL,
// normaliza la notación y VERIFICA cada algoritmo antes de escribirlo.
// Nada entra en la app sin pasar la comprobación.
import * as C from '../js/cube.js';
import { writeFileSync } from 'node:fs';

const FUENTE = 'https://raw.githubusercontent.com/Roman-/oll_trainer/master/scripts/algsinfo.js';

const SIDES = ['F', 'R', 'B', 'L'];
const CICLO = ['F', 'L', 'B', 'R'];
const U_EDGE = { F: 'UF', R: 'UR', B: 'UB', L: 'UL' };
const M_EDGE = { F: 'FR', R: 'BR', B: 'BL', L: 'FL' };
const D_EDGE = { F: 'DF', R: 'DR', B: 'DB', L: 'DL' };
const D_CORNER = { F: 'DFR', R: 'DRB', B: 'DBL', L: 'DLF' };
const U_CORNER = { F: 'URF', R: 'UBR', B: 'ULB', L: 'UFL' };

const f2lOk = (s) => SIDES.every((X) => C.edgeSolved(s, D_EDGE[X])
  && C.cornerSolved(s, D_CORNER[X]) && C.edgeSolved(s, M_EDGE[X]));
const ollOk = (s) => s.slice(0, 9).every((x) => x === 'U');

/** Identidad de un caso OLL: giros de esquinas + aristas volteadas, salvo rotación */
function casoOLL(s) {
  const tw = CICLO.map((X) => C.CORNERS[U_CORNER[X]].findIndex((i) => s[i] === 'U'));
  const eo = CICLO.map((X) => (s[C.EDGES[U_EDGE[X]][0]] === 'U' ? 1 : 0));
  let best = null;
  for (let a = 0; a < 4; a++) {
    const k = [0, 1, 2, 3].map((i) => tw[(i + a) % 4]).join('')
      + '-' + [0, 1, 2, 3].map((i) => eo[(i + a) % 4]).join('');
    if (best === null || k < best) best = k;
  }
  return best;
}

/** La notación de la fuente usa paréntesis de agarre y cosas como U2' */
function normaliza(alg) {
  return String(alg)
    .replace(/[()]/g, ' ')
    .replace(/’/g, "'")
    .replace(/2'/g, '2')
    .replace(/\s+/g, ' ')
    .trim();
}

const res = await fetch(FUENTE);
const texto = await res.text();

// grupos
const grupos = {};
const mg = texto.match(/var algsGroups = \{([\s\S]*?)\};/);
for (const linea of mg[1].split('\n')) {
  const m = linea.match(/"([^"]+)"\s*:\s*\[([^\]]*)\]/);
  if (!m) continue;
  for (const n of m[2].split(',')) {
    const num = parseInt(n.trim(), 10);
    if (num) grupos[num] = m[1];
  }
}

// casos
const mi = texto.match(/var algsInfo = \{([\s\S]*)\n\};/);
const cuerpo = mi[1];
const casos = [];
const re = /(\d+):\s*\{\s*"name":\s*"([^"]*)",\s*"a":\s*"([^"]*)",\s*"a2":\s*"([^"]*)",?\s*\}/g;
let m;
while ((m = re.exec(cuerpo))) {
  casos.push({ num: +m[1], name: m[2], a: normaliza(m[3]), a2: normaliza(m[4]) });
}
console.log('casos leídos de la fuente: ' + casos.length);

// --- verificación uno por uno ---
const GRUPO_ES = {
  'All Edges Oriented Correctly': 'Cruz hecha',
  'T-Shapes': 'Formas de T',
  'Squares': 'Cuadrados',
  'C-Shapes': 'Formas de C',
  'W-Shapes': 'Formas de W',
  'Corners Correct, Edges Flipped': 'Esquinas listas',
  'P-Shapes': 'Formas de P',
  'I-Shapes': 'Formas de I',
  'Fish-Shapes': 'Peces',
  'Knight Move Shapes': 'Salto de caballo',
  'Awkward Shapes': 'Formas raras',
  'L-Shapes': 'Formas de L',
  'Lightning Bolts': 'Rayos',
  'No Edges Flipped Correctly': 'Punto',
};

const buenos = [];
const rechazados = [];
const vistos = new Map();

for (const c of casos) {
  const candidatos = [c.a, c.a2].filter(Boolean);
  let elegido = null;
  const otros = [];
  for (const alg of candidatos) {
    let expandido;
    try { expandido = C.expandAlg(alg); }
    catch (e) { rechazados.push([c.num, alg, 'notación: ' + e.message]); continue; }
    const caso = C.applyAlg(C.solvedState(), C.invertAlg(expandido));
    if (!f2lOk(caso)) { rechazados.push([c.num, alg, 'rompe F2L']); continue; }
    if (ollOk(caso)) { rechazados.push([c.num, alg, 'el caso ya está orientado']); continue; }
    const fin = C.applyAlg(caso, expandido);
    if (!ollOk(fin) || !f2lOk(fin)) { rechazados.push([c.num, alg, 'no orienta']); continue; }
    if (!elegido) elegido = { alg, caso }; else otros.push(alg);
  }
  if (!elegido) { console.log('  SIN ALGORITMO VÁLIDO: OLL ' + c.num + ' (' + c.name + ')'); continue; }

  const clave = casoOLL(elegido.caso);
  if (vistos.has(clave)) {
    console.log('  REPETIDO: OLL ' + c.num + ' es el mismo caso que OLL ' + vistos.get(clave));
    continue;
  }
  vistos.set(clave, c.num);
  buenos.push({
    id: 'oll' + c.num, num: c.num, name: 'OLL ' + c.num + ' · ' + c.name,
    group: GRUPO_ES[grupos[c.num]] || grupos[c.num] || 'Otros',
    alg: elegido.alg, alt: otros, clave,
  });
}

console.log('verificados: ' + buenos.length + ' | rechazados: ' + rechazados.length
  + ' | casos distintos: ' + vistos.size);
for (const r of rechazados.slice(0, 12)) console.log('   rechazado OLL ' + r[0] + ': ' + r[2] + '  [' + r[1] + ']');

// --- ¿está completo? 57 casos + el resuelto = 58 clases posibles ---
const todas = new Set();
for (let tw = 0; tw < 81; tw++) {
  const t = [tw % 3, ((tw / 3) | 0) % 3, ((tw / 9) | 0) % 3, ((tw / 27) | 0) % 3];
  if ((t[0] + t[1] + t[2] + t[3]) % 3 !== 0) continue;
  for (let eo = 0; eo < 16; eo++) {
    const e = [eo & 1, (eo >> 1) & 1, (eo >> 2) & 1, (eo >> 3) & 1];
    if ((e[0] + e[1] + e[2] + e[3]) % 2 !== 0) continue;
    let best = null;
    for (let a = 0; a < 4; a++) {
      const k = [0, 1, 2, 3].map((i) => t[(i + a) % 4]).join('')
        + '-' + [0, 1, 2, 3].map((i) => e[(i + a) % 4]).join('');
      if (best === null || k < best) best = k;
    }
    todas.add(best);
  }
}
console.log('clases de orientación posibles (incluida la resuelta): ' + todas.size);
const faltan = [...todas].filter((k) => !vistos.has(k) && k !== '0000-1111');
console.log('clases sin algoritmo: ' + faltan.length + (faltan.length ? '  ' + faltan.join(' ') : ''));

// --- escribir el fichero ---
buenos.sort((a, b) => a.num - b.num);
const grupoOrden = ['Cruz hecha', 'Punto', 'Formas de I', 'Formas de L', 'Rayos', 'Peces',
  'Formas de T', 'Formas de C', 'Formas de P', 'Formas de W', 'Cuadrados',
  'Salto de caballo', 'Formas raras', 'Esquinas listas', 'Otros'];

const cuerpoJS = buenos.map((c) => '  { id: ' + JSON.stringify(c.id)
  + ', num: ' + c.num
  + ', name: ' + JSON.stringify(c.name)
  + ', group: ' + JSON.stringify(c.group)
  + ', alg: ' + JSON.stringify(c.alg)
  + (c.alt.length ? ', alt: ' + JSON.stringify(c.alt) : '')
  + ' },').join('\n');

const salida = `// ============================================================
//  oll.js — Los 57 casos de OLL (orientar la última capa)
// ============================================================
//  Generado por dev/build_oll.js a partir del conjunto estándar
//  de github.com/Roman-/oll_trainer, y VERIFICADO uno por uno:
//  cada algoritmo respeta las dos primeras capas, orienta la
//  última, y su caso es distinto de todos los demás. Entre los
//  ${buenos.length} cubren las ${todas.size - 1} orientaciones posibles.
//
//  No editar a mano: vuelve a generarlo con
//      node dev/build_oll.js
// ============================================================

export const OLL_GRUPOS = ${JSON.stringify(grupoOrden, null, 0).replace(/","/g, '", "')};

export const OLL_FULL = [
${cuerpoJS}
];
`;
writeFileSync('js/oll.js', salida, 'utf8');
console.log('escrito js/oll.js con ' + buenos.length + ' casos');
