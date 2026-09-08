// ============================================================
//  algs.js — Algoritmos de Fridrich (CFOP)
// ============================================================
//  Cada algoritmo se comprueba solo (test/algs.js): si uno
//  estuviera mal escrito, las pruebas lo cazan.
//
//  Notacion: se admiten giros de cubo (x, y, z). No se usan
//  movimientos de capa intermedia porque el cubo inteligente no
//  los detecta y ademas complican la explicacion.
// ============================================================

import { OLL_FULL, OLL_GRUPOS } from './oll.js';
import { F2L_CASES, F2L_GRUPOS } from './f2l.js';

// --- PLL: permutar la ultima capa (21 casos) ---------------------------
export const PLL = [
  { id: 'Aa', name: 'A (a)', group: 'Esquinas', alg: "x R' U R' D2 R U' R' D2 R2" },
  { id: 'Ab', name: 'A (b)', group: 'Esquinas', alg: "x R2 D2 R U R' D2 R U' R" },
  { id: 'E', name: 'E', group: 'Esquinas', alg: "x' R U' R' D R U R' D' R U R' D R U' R' D'" },
  { id: 'Ua', name: 'U (a)', group: 'Bordes', alg: "R U' R U R U R U' R' U' R2" },
  { id: 'Ub', name: 'U (b)', group: 'Bordes', alg: "R2 U R U R' U' R' U' R' U R'" },
  { id: 'H', name: 'H', group: 'Bordes', alg: "R2 U2 R U2 R2 U2 R2 U2 R U2 R2" },
  { id: 'Z', name: 'Z', group: 'Bordes', alg: "M2 U M2 U M' U2 M2 U2 M' U2" },
  { id: 'Ja', name: 'J (a)', group: 'Adyacentes', alg: "R' U L' U2 R U' R' U2 R L" },
  { id: 'Jb', name: 'J (b)', group: 'Adyacentes', alg: "R U R' F' R U R' U' R' F R2 U' R' U'" },
  { id: 'T', name: 'T', group: 'Adyacentes', alg: "R U R' U' R' F R2 U' R' U' R U R' F'" },
  { id: 'F', name: 'F', group: 'Adyacentes', alg: "R' U' F' R U R' U' R' F R2 U' R' U' R U R' U R" },
  { id: 'Ra', name: 'R (a)', group: 'Adyacentes', alg: "R U' R' U' R U R D R' U' R D' R' U2 R' U'" },
  { id: 'Rb', name: 'R (b)', group: 'Adyacentes', alg: "R2 F R U R U' R' F' R U2 R' U2 R" },
  { id: 'Ga', name: 'G (a)', group: 'Ciclos', alg: "R2 U R' U R' U' R U' R2 U' D R' U R D'" },
  { id: 'Gb', name: 'G (b)', group: 'Ciclos', alg: "R' U' R U D' R2 U R' U R U' R U' R2 D" },
  { id: 'Gc', name: 'G (c)', group: 'Ciclos', alg: "R2 U' R U' R U R' U R2 U D' R U' R' D" },
  { id: 'Gd', name: 'G (d)', group: 'Ciclos', alg: "R U R' U' D R2 U' R U' R' U R' U R2 D'" },
  { id: 'V', name: 'V', group: 'Diagonales', alg: "R' U R' U' y R' F' R2 U' R' U R' F R F" },
  { id: 'Y', name: 'Y', group: 'Diagonales', alg: "F R U' R' U' R U R' F' R U R' U' R' F R F'" },
  { id: 'Na', name: 'N (a)', group: 'Diagonales', alg: "R U R' U R U R' F' R U R' U' R' F R2 U' R' U2 R U' R'" },
  { id: 'Nb', name: 'N (b)', group: 'Diagonales', alg: "R' U R U' R' F' U' F R U R' F R' F' R U' R" },
];

// --- OLL de dos pasos --------------------------------------------------
// Primero la cruz amarilla (3 casos) y despues las esquinas (7 casos).
// Es el paso natural al salir del metodo principiante.
export const OLL_CROSS = [
  { id: 'punto', name: 'Punto', group: 'Cruz', alg: "F R U R' U' F' U2 F R U R' U' F'" },
  { id: 'L', name: 'Forma de L', group: 'Cruz', alg: "F R U R' U' F'" },
  { id: 'linea', name: 'Línea', group: 'Cruz', alg: "F R U R' U' F'" },
];

export const OLL_CORNERS = [
  { id: 'sune', name: 'Sune', group: 'Esquinas', alg: "R U R' U R U2 R'" },
  { id: 'antisune', name: 'Antisune', group: 'Esquinas', alg: "R U2 R' U' R U' R'" },
  { id: 'H', name: 'H (doble Sune)', group: 'Esquinas', alg: "R U R' U R U' R' U R U2 R'" },
  { id: 'pi', name: 'Pi', group: 'Esquinas', alg: "R U2 R2 U' R2 U' R2 U2 R" },
  { id: 'T', name: 'T (camaleón)', group: 'Esquinas', alg: "r U R' U' r' F R F'" },
  { id: 'U', name: 'U (cabeza de toro)', group: 'Esquinas', alg: "R2 D R' U2 R D' R' U2 R'" },
  { id: 'L', name: 'L (diagonal)', group: 'Esquinas', alg: "F R' F' r U R U' r'" },
];

export const OLL = [...OLL_CORNERS];

/** Todos los casos entrenables, con su tipo */
export function allCases() {
  return [
    ...PLL.map((c) => ({ ...c, kind: 'PLL' })),
    ...OLL_CORNERS.map((c) => ({ ...c, kind: 'OLL' })),
  ];
}

// ============================================================
//  Reconocer en que caso esta el cubo
// ============================================================
import {
  CORNERS, EDGES, edgeSolved, cornerSolved, isSolved, findCorner, findEdge,
  applyAlg, applyMove, invertAlg, expandAlg, solvedState, simplifyAlg,
  rotateFrame, findRotation,
} from './cube.js';

const SIDES = ['F', 'R', 'B', 'L'];
const CICLO = ['F', 'L', 'B', 'R'];          // U horario manda F -> L -> B -> R
const U_EDGE = { F: 'UF', R: 'UR', B: 'UB', L: 'UL' };
const M_EDGE = { F: 'FR', R: 'BR', B: 'BL', L: 'FL' };
const D_EDGE = { F: 'DF', R: 'DR', B: 'DB', L: 'DL' };
const D_CORNER = { F: 'DFR', R: 'DRB', B: 'DBL', L: 'DLF' };
const U_CORNER = { F: 'URF', R: 'UBR', B: 'ULB', L: 'UFL' };

export const CROSS_DONE = (s) => SIDES.every((X) => edgeSolved(s, D_EDGE[X]));
export const F1_DONE = (s) => CROSS_DONE(s) && SIDES.every((X) => cornerSolved(s, D_CORNER[X]));
export const F2L_DONE = (s) => F1_DONE(s) && SIDES.every((X) => edgeSolved(s, M_EDGE[X]));
export const U_CROSS = (s) => SIDES.every((X) => s[EDGES[U_EDGE[X]][0]] === 'U');
export const OLL_DONE = (s) => U_CROSS(s) && SIDES.every((X) => s[CORNERS[U_CORNER[X]][0]] === 'U');

/** Cuantos pares de la segunda capa estan puestos (0 a 4) */
export function pairsDone(s) {
  if (!CROSS_DONE(s)) return 0;
  return SIDES.filter((X) => cornerSolved(s, D_CORNER[X]) && edgeSolved(s, M_EDGE[X])).length;
}

/** Identidad de un caso PLL: la permutacion salvo giro de U delante y detras */
export function casoPLL(s) {
  const co = [], eo = [];
  for (let i = 0; i < 4; i++) {
    const X = CICLO[i];
    const t = CORNERS[U_CORNER[X]];
    const cols = [s[t[0]], s[t[1]], s[t[2]]].filter((c) => c !== 'U').sort().join('');
    co.push(CICLO.indexOf(SIDES.find((Y) => U_CORNER[Y].split('')
      .filter((c) => c !== 'U').sort().join('') === cols)));
    const e = EDGES[U_EDGE[X]];
    eo.push(CICLO.indexOf([s[e[0]], s[e[1]]].filter((c) => c !== 'U')[0]));
  }
  let best = null;
  for (let a = 0; a < 4; a++) {
    for (let b = 0; b < 4; b++) {
      const k = [0, 1, 2, 3].map((i) => (co[(i + a) % 4] + b) % 4).join('')
        + '-' + [0, 1, 2, 3].map((i) => (eo[(i + a) % 4] + b) % 4).join('');
      if (best === null || k < best) best = k;
    }
  }
  return best;
}

/** Identidad de un caso OLL de esquinas (solo los giros), salvo rotacion */
export function casoOLL(s) {
  const tw = CICLO.map((X) => CORNERS[U_CORNER[X]].findIndex((i) => s[i] === 'U'));
  let best = null;
  for (let a = 0; a < 4; a++) {
    const k = [0, 1, 2, 3].map((i) => tw[(i + a) % 4]).join('');
    if (best === null || k < best) best = k;
  }
  return best;
}

/** Identidad completa de un caso OLL: giros de esquinas y aristas volteadas */
export function casoOLLcompleto(s) {
  const tw = CICLO.map((X) => CORNERS[U_CORNER[X]].findIndex((i) => s[i] === 'U'));
  const eo = CICLO.map((X) => (s[EDGES[U_EDGE[X]][0]] === 'U' ? 1 : 0));
  let best = null;
  for (let a = 0; a < 4; a++) {
    const k = [0, 1, 2, 3].map((i) => tw[(i + a) % 4]).join('')
      + '-' + [0, 1, 2, 3].map((i) => eo[(i + a) % 4]).join('');
    if (best === null || k < best) best = k;
  }
  return best;
}

// Indice: identidad de caso -> ficha del caso
const INDICE_PLL = new Map();
const INDICE_OLL = new Map();
// Ojo: el cubo te ensena el caso que hay que RESOLVER, o sea el inverso de
// lo que hace el algoritmo. Por eso el indice se construye deshaciendolo.
for (const c of PLL) {
  INDICE_PLL.set(casoPLL(applyAlg(solvedState(), invertAlg(expandAlg(c.alg)))), c);
}
// Con los 57 casos, la identidad tiene que mirar tambien las aristas.
for (const c of OLL_FULL) {
  INDICE_OLL.set(casoOLLcompleto(applyAlg(solvedState(), invertAlg(expandAlg(c.alg)))), c);
}

/** Que forma de cruz amarilla hay arriba */
export function crossShape(s) {
  const o = SIDES.filter((X) => s[EDGES[U_EDGE[X]][0]] === 'U');
  if (o.length === 4) return 'hecha';
  if (o.length === 0) return 'punto';
  if (o.length !== 2) return null;
  const opuestas = { F: 'B', B: 'F', R: 'L', L: 'R' };
  return opuestas[o[0]] === o[1] ? 'linea' : 'L';
}

/**
 * Mira el cubo y dice en que paso de Fridrich esta y, si toca, que caso.
 */
export function recognise(s) {
  if (!CROSS_DONE(s)) return { paso: 'cruz', texto: 'Todavía falta la cruz de abajo' };
  const pares = pairsDone(s);
  if (pares < 4) {
    // se busca un hueco cuyo par este a mano; si hay varios, el primero
    for (const X of HUECOS) {
      const h = casoF2LenHueco(s, X);
      if (h) {
        return { paso: 'F2L', pares, caso: h.caso, kind: 'F2L', hueco: h,
          texto: h.caso.name };
      }
    }
    const sacar = sacarPar(s);
    return { paso: 'F2L', pares, kind: 'F2L', sacar,
      texto: sacar ? 'Saca el par atrapado' : 'F2L: ' + pares + ' de 4 pares' };
  }
  if (!OLL_DONE(s)) {
    const caso = INDICE_OLL.get(casoOLLcompleto(s));
    return { paso: 'OLL', caso, kind: 'OLL',
      texto: caso ? caso.name : 'OLL desconocido' };
  }
  // ultima capa orientada: mira la permutacion
  let resuelto = false;
  for (let k = 0; k < 4; k++) {
    const t = applyMove(s, 'U', k);
    if (SIDES.every((X) => edgeSolved(t, U_EDGE[X]) && cornerSolved(t, U_CORNER[X]))) resuelto = true;
  }
  if (resuelto) return { paso: 'hecho', texto: 'Sólo falta girar la cara de arriba' };
  const caso = INDICE_PLL.get(casoPLL(s));
  return { paso: 'PLL', caso, kind: 'PLL', texto: caso ? caso.name : 'PLL desconocido' };
}

/**
 * Mezcla que deja el cubo en un caso concreto: deshacer el algoritmo,
 * con un giro de U al azar por delante para que no salga siempre igual.
 */
export function setupFor(caso, rnd = Math.random) {
  const auf = (rnd() * 4) | 0;
  const alg = invertAlg(expandAlg(caso.alg));
  return auf ? [...alg, { face: 'U', amount: auf }] : alg;
}

// --- Los tres conjuntos entrenables -----------------------------------
export const SETS = {
  F2L: { nombre: 'F2L', casos: F2L_CASES, grupos: F2L_GRUPOS },
  OLL: { nombre: 'OLL', casos: OLL_FULL, grupos: OLL_GRUPOS },
  PLL: { nombre: 'PLL', casos: PLL, grupos: ['Bordes', 'Esquinas', 'Adyacentes', 'Diagonales', 'Ciclos'] },
};

export function casoPorId(kind, id) {
  return (SETS[kind] ? SETS[kind].casos : []).find((c) => c.id === id) || null;
}

// Los cuatro huecos, nombrados por su cara de delante
export const HUECOS = ['F', 'R', 'B', 'L'];

/** Gira el cubo para que el hueco `X` quede delante-derecha */
function rotacionHueco(X) { return findRotation(X, 'F', 'U', 'U'); }

/** Cambia las caras de un algoritmo segun un mapa de caras */
export function mapearAlg(alg, mapa) {
  return expandAlg(alg).map((m) => ({ face: mapa[m.face] || m.face, amount: m.amount, ajuste: m.ajuste }));
}

/**
 * Mira el hueco `X` y, si sus dos piezas estan a mano (en la capa de arriba
 * o en el propio hueco), dice en que caso de F2L esta.
 * Devuelve tambien como pasar el algoritmo al marco real del cubo.
 */
export function casoF2LenHueco(s, X) {
  const rot = rotacionHueco(X);
  if (!rot) return null;
  const sr = rotateFrame(s, rot);
  if (pairSlotDone(sr)) return null;              // ese par ya esta hecho
  const alcanzable = (nombre) => nombre.includes('U') || nombre === 'DFR' || nombre === 'FR';
  const lc = findCorner(sr, 'D', 'F', 'R');
  const le = findEdge(sr, 'F', 'R');
  if (!alcanzable(lc.name) || !alcanzable(le.name)) return null;
  const caso = casoF2L(sr, true);
  if (!caso) return null;
  const inv = {};
  for (const f of Object.keys(rot)) inv[rot[f]] = f;   // marco girado -> real
  return { caso, hueco: X, rot, aReal: inv, estadoGirado: sr };
}

/**
 * Cuando ningun par esta a mano es que las piezas estan atrapadas en un
 * hueco. Esto elige que hueco vaciar para poder seguir: prueba a sacar
 * cada uno y se queda con el que deja un caso reconocible.
 */
export function sacarPar(s) {
  let reserva = null;
  for (const X of HUECOS) {
    const rot = rotacionHueco(X);
    if (!rot) continue;
    const sr = rotateFrame(s, rot);
    if (pairSlotDone(sr)) continue;              // ese hueco ya esta bien
    const inv = {};
    for (const f of Object.keys(rot)) inv[rot[f]] = f;
    const moves = mapearAlg("R U R'", inv);
    const despues = applyAlg(s, moves);
    if (!reserva) reserva = { hueco: X, moves };
    for (const Y of HUECOS) if (casoF2LenHueco(despues, Y)) return { hueco: X, moves };
  }
  return reserva;
}

/** Reconoce en cual de los 41 casos de F2L esta el hueco delantero-derecho */
export function casoF2L(s, laxo) {
  if (pairSlotDone(s)) return null;
  if (!laxo && !restoDone(s)) return null;
  const U_C = ['URF', 'UFL', 'ULB', 'UBR'];
  const U_E = ['UF', 'UL', 'UB', 'UR'];
  const lc = findCorner(s, 'D', 'F', 'R');
  const le = findEdge(s, 'F', 'R');
  const c = { dentro: lc.name === 'DFR', iu: U_C.indexOf(lc.name),
    ori: CORNERS[lc.name].findIndex((i) => s[i] === 'D') };
  const a = { dentro: le.name === 'FR', iu: U_E.indexOf(le.name),
    ori: EDGES[le.name][0] === le.idx ? 0 : 1 };
  let best = null;
  for (let k = 0; k < 4; k++) {
    const cc = c.dentro ? 'S' + c.ori : 'U' + ((c.iu + k) % 4) + c.ori;
    const aa = a.dentro ? 'S' + a.ori : 'U' + ((a.iu + k) % 4) + a.ori;
    const key = cc + '|' + aa;
    if (best === null || key < best) best = key;
  }
  return F2L_CASES.find((x) => x.caso === best) || null;
}

// ============================================================
//  La solucion completa de verdad, desde donde este el cubo
// ============================================================
//  Un algoritmo de OLL o PLL solo funciona si antes ajustas la
//  cara de arriba. Esto devuelve la secuencia COMPLETA (ajuste
//  incluido) que resuelve el caso desde el estado actual, que es
//  lo que hay que ensenar; si no, se sigue la formula al pie de
//  la letra y no sale.
// ============================================================
export function solutionFrom(state, alg, kind) {
  const movs = expandAlg(typeof alg === 'string' || Array.isArray(alg) ? alg : alg.alg);
  const listo = kind === 'PLL'
    ? (s) => SIDES.every((X) => edgeSolved(s, U_EDGE[X]) && cornerSolved(s, U_CORNER[X]))
    : kind === 'OLL' ? (s) => OLL_DONE(s) && F2L_DONE(s)
      : (s) => pairSlotDone(s);
  for (let antes = 0; antes < 4; antes++) {
    const inicio = antes ? applyMove(state, 'U', antes) : state;
    const tras = applyAlg(inicio, movs);
    for (let despues = 0; despues < 4; despues++) {
      const fin = despues ? applyMove(tras, 'U', despues) : tras;
      if (!listo(fin)) continue;
      const out = [];
      if (antes) out.push({ face: 'U', amount: antes, ajuste: true });
      out.push(...movs);
      if (despues) out.push({ face: 'U', amount: despues, ajuste: true });
      return out;
    }
  }
  return null;
}

/** El estado en el que se ve ese caso (deshaciendo su algoritmo de serie) */
export function estadoDelCaso(caso) {
  return applyAlg(solvedState(), invertAlg(expandAlg(caso.alg)));
}

/** ¿Este algoritmo resuelve de verdad ese caso? (para validar los tuyos) */
export function resuelveElCaso(alg, caso, kind) {
  try { return !!solutionFrom(estadoDelCaso(caso), alg, kind); }
  catch (e) { return false; }
}

// ============================================================
//  Entrenador de la segunda capa (F2L)
// ============================================================
//  Los casos no se sacan de una tabla: se fabrican sacando el par
//  del hueco con secuencias que solo tocan ese hueco y la capa de
//  arriba. Asi el caso es valido siempre y ademas conocemos la
//  solucion (es la secuencia al reves).

const EXTRACCIONES = [
  "R U R'", "R U' R'", "R U2 R'", "R' F R F'",
  "F' U F", "F' U' F", "F' U2 F", "F R' F' R",
];

const PAR = { esquina: 'DFR', arista: 'FR' };

/** El hueco de delante-derecha esta hecho y el resto tambien (salvo arriba) */
export function pairSlotDone(s) {
  return cornerSolved(s, PAR.esquina) && edgeSolved(s, PAR.arista);
}
export function restoDone(s) {
  const otros = ['R', 'B', 'L'];
  return CROSS_DONE(s) && otros.every((X) => cornerSolved(s, D_CORNER[X]) && edgeSolved(s, M_EDGE[X]));
}
export function f2lCaseOk(s) { return restoDone(s) && !pairSlotDone(s); }

/**
 * Fabrica un caso de F2L: devuelve la mezcla que lo prepara y la
 * solucion (que es esa mezcla al reves).
 */
export function f2lCase(rnd = Math.random) {
  for (let intento = 0; intento < 60; intento++) {
    const trozos = 1 + ((rnd() * 3) | 0);
    let setup = [];
    for (let i = 0; i < trozos; i++) {
      setup = setup.concat(expandAlg(EXTRACCIONES[(rnd() * EXTRACCIONES.length) | 0]));
      const u = (rnd() * 4) | 0;
      if (u) setup.push({ face: 'U', amount: u });
    }
    setup = simplifyAlg(setup);
    const st = applyAlg(solvedState(), setup);
    if (f2lCaseOk(st) && setup.length >= 3 && setup.length <= 11) {
      return { setup, solucion: simplifyAlg(invertAlg(setup)), estado: st };
    }
  }
  return null;
}

/**
 * Como meter el par desde donde este el cubo. Primero prueba a deshacer
 * lo hecho; si queda largo, busca algo mas corto con R, U y F.
 */
export function solveF2LPair(state, historial, setup) {
  const porDeshacer = simplifyAlg(invertAlg(historial || []).concat(invertAlg(setup || [])));
  const corto = buscarPar(state, porDeshacer.length - 1);
  return corto || porDeshacer;
}

const CARAS_PAR = ['R', 'U', 'F'];
function buscarPar(state, maxProf) {
  const tope = Math.min(maxProf === undefined ? 8 : maxProf, 9);
  for (let prof = 0; prof <= tope; prof++) {
    const r = dfsPar(state, prof, null, []);
    if (r) return r;
  }
  return null;
}
function dfsPar(s, prof, ultima, camino) {
  if (pairSlotDone(s) && restoDone(s)) return camino.slice();
  if (prof === 0) return null;
  for (const face of CARAS_PAR) {
    if (face === ultima) continue;
    let t = s;
    for (let amount = 1; amount <= 3; amount++) {
      t = applyMove(t, face, 1);
      camino.push({ face, amount });
      const r = dfsPar(t, prof - 1, face, camino);
      camino.pop();
      if (r) return r;
    }
  }
  return null;
}
