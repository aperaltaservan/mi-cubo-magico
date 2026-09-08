// Script de desarrollo: genera los 41 casos de F2L del hueco delantero-derecho.
//
// No se copian de ninguna tabla: se recorren en anchura todas las formas de
// sacar el par del hueco con secuencias que NO tocan el resto del cubo. Como
// cada caso se alcanza por un camino conocido, su solucion es ese camino al
// reves, y por tanto es correcta por construccion.
import * as C from '../js/cube.js';
import { writeFileSync } from 'node:fs';

const SIDES = ['F', 'R', 'B', 'L'];
const M_EDGE = { F: 'FR', R: 'BR', B: 'BL', L: 'FL' };
const D_EDGE = { F: 'DF', R: 'DR', B: 'DB', L: 'DL' };
const D_CORNER = { F: 'DFR', R: 'DRB', B: 'DBL', L: 'DLF' };

const crossOk = (s) => SIDES.every((X) => C.edgeSolved(s, D_EDGE[X]));
const restoOk = (s) => crossOk(s)
  && ['R', 'B', 'L'].every((X) => C.cornerSolved(s, D_CORNER[X]) && C.edgeSolved(s, M_EDGE[X]));
const parOk = (s) => C.cornerSolved(s, 'DFR') && C.edgeSolved(s, 'FR');

const U_CORNERS = ['URF', 'UFL', 'ULB', 'UBR'];   // orden ciclico de U
const U_EDGES = ['UF', 'UL', 'UB', 'UR'];

/** Donde esta la esquina blanca-verde-naranja del hueco y como esta girada */
function esquina(s) {
  const loc = C.findCorner(s, 'D', 'F', 'R');
  const ori = C.CORNERS[loc.name].findIndex((i) => s[i] === 'D');
  const iu = U_CORNERS.indexOf(loc.name);
  return { dentro: loc.name === 'DFR', iu, ori };
}
/** Donde esta la arista verde-naranja y como esta girada */
function arista(s) {
  const loc = C.findEdge(s, 'F', 'R');
  const ori = C.EDGES[loc.name][0] === loc.idx ? 0 : 1;
  const iu = U_EDGES.indexOf(loc.name);
  return { dentro: loc.name === 'FR', iu, ori };
}

/** Identidad del caso: la pareja, salvo giro de la cara de arriba */
function clave(s) {
  const c = esquina(s), a = arista(s);
  let best = null;
  for (let k = 0; k < 4; k++) {
    const cc = c.dentro ? 'S' + c.ori : 'U' + ((c.iu + k) % 4) + c.ori;
    const aa = a.dentro ? 'S' + a.ori : 'U' + ((a.iu + k) % 4) + a.ori;
    const key = cc + '|' + aa;
    if (best === null || key < best) best = key;
  }
  return best;
}

// Movimientos del recorrido: sacan o mueven el par sin romper lo demas
const PASOS = [
  'U', 'U2', "U'",
  "R U R'", "R U' R'", "R U2 R'", "R' U R", "R' U' R", "R' U2 R",
  "F' U F", "F' U' F", "F' U2 F", "F U F'", "F U' F'", "F U2 F'",
  "R' F R F'", "F R' F' R", "R U R' U'", "U R U' R'",
];

// --- recorrido en anchura sobre las configuraciones validas ---
const inicio = C.solvedState();
const visto = new Map();                 // estado -> camino de movimientos
visto.set(inicio.join(''), []);
let frontera = [{ s: inicio, camino: [] }];
const casos = new Map();                 // clave -> mejor solucion

while (frontera.length) {
  const siguiente = [];
  for (const nodo of frontera) {
    for (const paso of PASOS) {
      const alg = C.expandAlg(paso);
      const s2 = C.applyAlg(nodo.s, alg);
      if (!restoOk(s2)) continue;        // ha roto el resto del cubo: fuera
      const k = s2.join('');
      if (visto.has(k)) continue;
      const camino = nodo.camino.concat(alg);
      visto.set(k, camino);
      siguiente.push({ s: s2, camino });
      if (parOk(s2)) continue;           // este es el cubo ya hecho
      const cl = clave(s2);
      const solucion = C.simplifyAlg(C.invertAlg(camino));
      const previo = casos.get(cl);
      if (!previo || solucion.length < previo.solucion.length) {
        casos.set(cl, { solucion, estado: s2 });
      }
    }
  }
  frontera = siguiente;
  if (visto.size > 4000) break;          // de sobra: solo hay 150 configuraciones
}

console.log('configuraciones alcanzadas: ' + visto.size);
console.log('casos distintos encontrados: ' + casos.size + ' (esperados 41)');

// --- comprobar cada solucion ---
let malos = 0;
for (const [cl, c] of casos) {
  const fin = C.applyAlg(c.estado, c.solucion);
  if (!(parOk(fin) && restoOk(fin))) { malos++; console.log('  FALLA la solución de ' + cl); }
}
console.log('soluciones que no meten el par: ' + malos);

// --- nombres y grupos ---
function describe(s) {
  const c = esquina(s), a = arista(s);
  if (c.dentro && a.dentro) return { grupo: 'Los dos dentro', desc: 'esquina y arista metidas pero mal' };
  if (c.dentro) return { grupo: 'Esquina metida', desc: c.ori === 0 ? 'esquina bien, arista fuera' : 'esquina metida girada' };
  if (a.dentro) return { grupo: 'Arista metida', desc: a.ori === 0 ? 'arista bien, esquina fuera' : 'arista metida del revés' };
  // los dos arriba: ¿el par va junto?
  const juntos = (c.iu === a.iu) || ((c.iu + 1) % 4 === a.iu);
  const blanco = c.ori === 0 ? 'blanco arriba' : 'blanco de lado';
  return {
    grupo: 'Los dos arriba',
    desc: (juntos ? 'par junto' : 'par separado') + ', ' + blanco,
  };
}

const lista = [...casos.entries()].map(([cl, c]) => ({ cl, ...c, ...describe(c.estado) }));
const ORDEN = ['Los dos arriba', 'Esquina metida', 'Arista metida', 'Los dos dentro'];
lista.sort((a, b) => (ORDEN.indexOf(a.grupo) - ORDEN.indexOf(b.grupo))
  || (a.solucion.length - b.solucion.length) || a.cl.localeCompare(b.cl));
lista.forEach((c, i) => { c.num = i + 1; });

const porGrupo = {};
for (const c of lista) porGrupo[c.grupo] = (porGrupo[c.grupo] || 0) + 1;
console.log('por grupo: ' + JSON.stringify(porGrupo));
console.log('longitud de solución: min ' + Math.min(...lista.map((c) => c.solucion.length))
  + ' max ' + Math.max(...lista.map((c) => c.solucion.length)));

const cuerpo = lista.map((c) => '  { id: ' + JSON.stringify('f2l' + c.num)
  + ', num: ' + c.num
  + ', name: ' + JSON.stringify('F2L ' + c.num + ' · ' + c.desc)
  + ', group: ' + JSON.stringify(c.grupo)
  + ', caso: ' + JSON.stringify(c.cl)
  + ', alg: ' + JSON.stringify(C.algToString(c.solucion))
  + ' },').join('\n');

writeFileSync('js/f2l.js', `// ============================================================
//  f2l.js — Los 41 casos de la segunda capa (hueco delantero-derecho)
// ============================================================
//  Generado por dev/build_f2l.js. Los casos no salen de ninguna
//  tabla: se recorren todas las formas de sacar el par del hueco
//  sin tocar el resto del cubo, asi que la solucion de cada caso
//  es ese camino al reves y es correcta por construccion.
//
//  No editar a mano: vuelve a generarlo con
//      node dev/build_f2l.js
// ============================================================

export const F2L_GRUPOS = ${JSON.stringify(ORDEN)};

export const F2L_CASES = [
${cuerpo}
];
`, 'utf8');
console.log('escrito js/f2l.js con ' + lista.length + ' casos');
