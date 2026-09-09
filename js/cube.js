// ============================================================
//  cube.js — Modelo del cubo 3x3 (54 pegatinas)
// ============================================================
//  Las permutaciones de cada giro NO estan escritas a mano:
//  se derivan rotando las coordenadas 3D de cada pegatina, asi
//  que son correctas por construccion.
//
//  Indices de pegatina:  U=0..8  R=9..17  F=18..26
//                        D=27..35 L=36..44 B=45..53
//  Dentro de cada cara: indice = fila*3 + columna
// ============================================================

export const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];
export const FACE_INDEX = { U: 0, R: 1, F: 2, D: 3, L: 4, B: 5 };
export const OPPOSITE = { U: 'D', D: 'U', L: 'R', R: 'L', F: 'B', B: 'F' };

// Vecino a la derecha / izquierda mirando esa cara de frente (con U arriba)
export const RIGHT_OF = { F: 'R', R: 'B', B: 'L', L: 'F' };
export const LEFT_OF = { F: 'L', L: 'B', B: 'R', R: 'F' };

// --- Geometria: posicion 3D y normal de cada pegatina -------------------
// x: derecha(+1)  y: arriba(+1)  z: frente(+1)
const NORMALS = {
  U: [0, 1, 0], R: [1, 0, 0], F: [0, 0, 1],
  D: [0, -1, 0], L: [-1, 0, 0], B: [0, 0, -1],
};

function stickerPos(face, row, col) {
  switch (face) {
    case 'U': return [col - 1, 1, row - 1];
    case 'D': return [col - 1, -1, 1 - row];
    case 'F': return [col - 1, 1 - row, 1];
    case 'B': return [1 - col, 1 - row, -1];
    case 'R': return [1, 1 - row, 1 - col];
    case 'L': return [-1, 1 - row, col - 1];
  }
}

const POS = [];      // POS[i] = [x,y,z] de la pegatina i
const NRM = [];      // NRM[i] = normal de la pegatina i
for (const face of FACES) {
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      POS.push(stickerPos(face, r, c));
      NRM.push(NORMALS[face]);
    }
  }
}

const KEY = new Map();
POS.forEach((p, i) => KEY.set(p.join(',') + '|' + NRM[i].join(','), i));

// Rotacion de 90 grados alrededor de un eje.
// Pares ciclicos: eje x -> (y,z), eje y -> (z,x), eje z -> (x,y)
const CYCLIC = { 0: [1, 2], 1: [2, 0], 2: [0, 1] };

function rot90(v, axis, cw) {
  const [u, w] = CYCLIC[axis];
  const out = v.slice();
  if (cw) { out[u] = v[w]; out[w] = -v[u]; }
  else { out[u] = -v[w]; out[w] = v[u]; }
  return out;
}

// Construye la permutacion de un giro horario de `face` (visto desde fuera)
function buildMove(face) {
  const n = NORMALS[face];
  const axis = n.findIndex((c) => c !== 0);
  const sign = n[axis];              // +1 o -1
  const cw = sign > 0;
  const perm = new Array(54);
  for (let i = 0; i < 54; i++) perm[i] = i;
  for (let i = 0; i < 54; i++) {
    if (POS[i][axis] !== sign) continue;      // no pertenece a esa capa
    const p2 = rot90(POS[i], axis, cw);
    const n2 = rot90(NRM[i], axis, cw);
    const j = KEY.get(p2.join(',') + '|' + n2.join(','));
    perm[j] = i;                              // nuevo[j] = viejo[i]
  }
  return perm;
}

export const MOVE_PERM = {};
for (const f of FACES) MOVE_PERM[f] = buildMove(f);

// Coordenada 3D de cada pegatina (la usa el render 3D)
export function stickerGeometry(i) { return { pos: POS[i], normal: NRM[i] }; }

// Las pegatinas del mismo cubito comparten posicion. Agrupadas asi se puede
// hablar de piezas enteras (apagar una, resaltarla) sin listas escritas a mano.
const CUBIE = new Map();
POS.forEach((p, i) => {
  const k = p.join(',');
  if (!CUBIE.has(k)) CUBIE.set(k, []);
  CUBIE.get(k).push(i);
});

/** Todos los cubitos, cada uno con sus pegatinas (1, 2 o 3) */
export function cubies() { return [...CUBIE.values()]; }

// --- Giros del cubo entero ---------------------------------------------
// Un "mapa de caras" dice a que posicion va cada cara: {F:'L', ...} significa
// que la cara que estaba delante pasa a estar a la izquierda.

const ROT_Y = { U: 'U', D: 'D', F: 'L', L: 'B', B: 'R', R: 'F' };  // como girar U
const ROT_X = { R: 'R', L: 'L', F: 'U', U: 'B', B: 'D', D: 'F' };  // como girar R

function composeMaps(a, b) {          // primero a, luego b
  const out = {};
  for (const f of FACES) out[f] = b[a[f]];
  return out;
}

/** Las 24 orientaciones posibles del cubo, como mapas de caras */
export function allRotations() {
  const id = {}; for (const f of FACES) id[f] = f;
  const seen = new Map([[FACES.map((f) => id[f]).join(''), id]]);
  let frontier = [id];
  while (frontier.length) {
    const next = [];
    for (const m of frontier) {
      for (const g of [ROT_X, ROT_Y]) {
        const c = composeMaps(m, g);
        const k = FACES.map((f) => c[f]).join('');
        if (!seen.has(k)) { seen.set(k, c); next.push(c); }
      }
    }
    frontier = next;
  }
  return Array.from(seen.values());
}

/**
 * Gira el cubo entero. Devuelve el estado visto desde la nueva orientacion:
 * las pegatinas cambian de sitio y las letras se renombran.
 */
export function rotateFrame(state, map) {
  const col = (f) => NORMALS[map[f]];
  const M = [col('R'), col('U'), col('F')];        // columnas de la matriz
  const apply = (v) => [
    M[0][0] * v[0] + M[1][0] * v[1] + M[2][0] * v[2],
    M[0][1] * v[0] + M[1][1] * v[1] + M[2][1] * v[2],
    M[0][2] * v[0] + M[1][2] * v[1] + M[2][2] * v[2],
  ];
  const out = new Array(54);
  for (let i = 0; i < 54; i++) {
    const j = KEY.get(apply(POS[i]).join(',') + '|' + apply(NRM[i]).join(','));
    out[j] = map[state[i]];
  }
  return out;
}

const ROT_Z = { F: 'F', B: 'B', U: 'R', R: 'D', D: 'L', L: 'U' };  // como girar F
const ROTATIONS = { x: ROT_X, y: ROT_Y, z: ROT_Z };

// Movimientos de dos capas (r, l, u, d, f, b).
//
// Visto desde los centros del cubo (que es como lo mide el cubo inteligente),
// girar dos capas equivale a girar la cara opuesta y quedarte el cubo torcido
// en la mano: r = "gira la cara L" + "ahora sujetas el cubo girado x".
const WIDE = {
  r: { opp: 'L', axis: 'x', dir: 1 }, l: { opp: 'R', axis: 'x', dir: 3 },
  u: { opp: 'D', axis: 'y', dir: 1 }, d: { opp: 'U', axis: 'y', dir: 3 },
  f: { opp: 'B', axis: 'z', dir: 1 }, b: { opp: 'F', axis: 'z', dir: 3 },
};

// Capas intermedias. Visto desde los centros, girar la capa del medio es lo
// mismo que girar las dos capas de fuera al reves: M = R + L' (y el cubo te
// queda torcido en la mano). Por eso el cubo inteligente lo entiende igual.
const SLICE = {
  M: { a: 'R', b: 'L', axis: 'x', dir: 3 },
  E: { a: 'U', b: 'D', axis: 'y', dir: 3 },
  S: { a: 'B', b: 'F', axis: 'z', dir: 1 },
};

/**
 * Traduce notacion completa (giros de cubo x/y/z y movimientos de dos capas)
 * a giros de cara puros, que es lo unico que entiende el cubo.
 * Los giros de cubo no cambian el cubo, solo como lo sujetas.
 */
export function expandAlg(alg) {
  if (Array.isArray(alg)) return alg;
  const at = {};                       // que cara hay en cada posicion
  for (const f of FACES) at[f] = f;
  const out = [];
  const turnFrame = (rot, times) => {
    for (let k = 0; k < ((times % 4) + 4) % 4; k++) {
      const next = {};
      for (const f of FACES) next[rot[f]] = at[f];
      for (const f of FACES) at[f] = next[f];
    }
  };

  for (const tok of String(alg).trim().split(/\s+/)) {
    if (!tok) continue;
    const base = tok[0];
    const suf = tok.slice(1);
    let amount = 1;
    if (suf === "'" || suf === '3') amount = 3;
    else if (suf === '2') amount = 2;
    else if (suf !== '') throw new Error('Movimiento no valido: ' + tok);

    if (ROTATIONS[base]) { turnFrame(ROTATIONS[base], amount); continue; }

    const w = WIDE[base];
    if (w) {
      out.push({ face: at[w.opp], amount });
      turnFrame(ROTATIONS[w.axis], w.dir * amount);
      continue;
    }

    const sl = SLICE[base];
    if (sl) {
      out.push({ face: at[sl.a], amount });
      out.push({ face: at[sl.b], amount: (4 - amount) % 4 });
      turnFrame(ROTATIONS[sl.axis], sl.dir * amount);
      continue;
    }

    if (!FACES.includes(base)) throw new Error('Movimiento no valido: ' + tok);
    out.push({ face: at[base], amount });
  }
  return out;
}

/** Encuentra la orientacion que lleva la cara `a` a `toA` y `b` a `toB` */
export function findRotation(a, toA, b, toB) {
  const all = allRotations();
  return all.find((m) => m[a] === toA && m[b] === toB)
    || all.find((m) => m[a] === toA)
    || null;
}

// --- Estado -------------------------------------------------------------
export function solvedState() {
  const s = [];
  for (const f of FACES) for (let i = 0; i < 9; i++) s.push(f);
  return s;
}

export function isSolved(s) {
  for (let i = 0; i < 54; i++) if (s[i] !== FACES[(i / 9) | 0]) return false;
  return true;
}

export function cloneState(s) { return s.slice(); }

/** Aplica un giro simple. amount: 1 horario, 2 doble, 3 antihorario. */
export function applyMove(s, face, amount = 1) {
  const n = ((amount % 4) + 4) % 4;
  const perm = MOVE_PERM[face];
  let out = s.slice();
  for (let k = 0; k < n; k++) {
    const next = new Array(54);
    for (let i = 0; i < 54; i++) next[i] = out[perm[i]];
    out = next;
  }
  return out;
}

// --- Notacion -----------------------------------------------------------
export function parseAlg(alg) {
  if (Array.isArray(alg)) return alg;
  const out = [];
  for (const tok of String(alg).trim().split(/\s+/)) {
    if (!tok) continue;
    const face = tok[0].toUpperCase();
    if (!FACES.includes(face)) throw new Error('Movimiento no valido: ' + tok);
    let amount = 1;
    const suf = tok.slice(1);
    if (suf === "'" || suf === '3') amount = 3;
    else if (suf === '2') amount = 2;
    else if (suf !== '') throw new Error('Movimiento no valido: ' + tok);
    out.push({ face, amount });
  }
  return out;
}

export function moveToString(m) {
  return m.face + (m.amount === 2 ? '2' : m.amount === 3 ? "'" : '');
}

export function algToString(alg) { return parseAlg(alg).map(moveToString).join(' '); }

export function applyAlg(s, alg) {
  let out = s;
  for (const m of parseAlg(alg)) out = applyMove(out, m.face, m.amount);
  return out === s ? s.slice() : out;
}

export function invertAlg(alg) {
  return parseAlg(alg).slice().reverse().map((m) => ({
    face: m.face,
    amount: m.amount === 2 ? 2 : (4 - m.amount) % 4,
  }));
}

/** Une movimientos consecutivos de la misma cara y elimina los nulos. */
export function simplifyAlg(alg) {
  const out = [];
  for (const m of parseAlg(alg)) {
    const last = out[out.length - 1];
    if (last && last.face === m.face) {
      const a = (last.amount + m.amount) % 4;
      out.pop();
      if (a !== 0) out.push({ face: m.face, amount: a });
    } else if (m.amount % 4 !== 0) {
      out.push({ face: m.face, amount: m.amount % 4 });
    }
  }
  return out;
}

export function randomScramble(n = 20, rnd = Math.random) {
  const alg = [];
  let prev = null, prev2 = null;
  while (alg.length < n) {
    const face = FACES[(rnd() * 6) | 0];
    if (face === prev) continue;
    if (prev2 === face && OPPOSITE[prev] === face) continue;
    const amount = 1 + ((rnd() * 3) | 0);
    alg.push({ face, amount });
    prev2 = prev; prev = face;
  }
  return alg;
}

// --- Piezas -------------------------------------------------------------
export const EDGES = {
  UR: [5, 10], UF: [7, 19], UL: [3, 37], UB: [1, 46],
  DR: [32, 16], DF: [28, 25], DL: [30, 43], DB: [34, 52],
  FR: [23, 12], FL: [21, 41], BL: [50, 39], BR: [48, 14],
};

export const CORNERS = {
  URF: [8, 9, 20], UFL: [6, 18, 38], ULB: [0, 36, 47], UBR: [2, 45, 11],
  DFR: [29, 26, 15], DLF: [27, 44, 24], DBL: [33, 53, 42], DRB: [35, 17, 51],
};

export const EDGE_NAMES = Object.keys(EDGES);
export const CORNER_NAMES = Object.keys(CORNERS);

/** Arista que lleva los colores a y b. idx = pegatina donde esta `a`. */
export function findEdge(s, a, b) {
  for (const name of EDGE_NAMES) {
    const [i, j] = EDGES[name];
    if (s[i] === a && s[j] === b) return { name, idx: i, other: j };
    if (s[j] === a && s[i] === b) return { name, idx: j, other: i };
  }
  return null;
}

/** Esquina con los tres colores dados. idx = pegatina donde esta `a`. */
export function findCorner(s, a, b, c) {
  const want = [a, b, c].slice().sort().join('');
  for (const name of CORNER_NAMES) {
    const t = CORNERS[name];
    const got = [s[t[0]], s[t[1]], s[t[2]]].slice().sort().join('');
    if (got === want) {
      const idx = t.find((k) => s[k] === a);
      return { name, idx, stickers: t };
    }
  }
  return null;
}

export function faceOf(i) { return FACES[(i / 9) | 0]; }

export function edgeSolved(s, name) {
  const [i, j] = EDGES[name];
  return s[i] === faceOf(i) && s[j] === faceOf(j);
}

export function cornerSolved(s, name) {
  return CORNERS[name].every((i) => s[i] === faceOf(i));
}

/** Comprueba que un estado es un cubo legal (mismo numero de cada color,
 *  piezas validas, paridades correctas). Devuelve null si esta bien. */
export function validateState(s) {
  const count = {};
  for (const c of s) count[c] = (count[c] || 0) + 1;
  for (const f of FACES) if (count[f] !== 9) return 'Debe haber 9 pegatinas de cada color';
  for (let i = 0; i < 6; i++) if (s[i * 9 + 4] !== FACES[i]) return 'Los centros no coinciden';

  const seenE = new Set(), seenC = new Set();
  let eo = 0, co = 0;
  for (const name of EDGE_NAMES) {
    const [i, j] = EDGES[name];
    const key = [s[i], s[j]].sort().join('');
    if (seenE.has(key)) return 'Hay dos aristas iguales';
    seenE.add(key);
  }
  for (const name of CORNER_NAMES) {
    const t = CORNERS[name];
    const key = [s[t[0]], s[t[1]], s[t[2]]].sort().join('');
    if (seenC.has(key)) return 'Hay dos esquinas iguales';
    seenC.add(key);
  }
  // orientacion de aristas
  for (const name of EDGE_NAMES) {
    const [i, j] = EDGES[name];
    const a = s[i], b = s[j];
    const good = (a === 'U' || a === 'D') || ((a === 'F' || a === 'B') && b !== 'U' && b !== 'D');
    if (!good) eo++;
  }
  if (eo % 2 !== 0) return 'Hay una arista girada';
  // orientacion de esquinas
  for (const name of CORNER_NAMES) {
    const t = CORNERS[name];
    const k = t.findIndex((x) => s[x] === 'U' || s[x] === 'D');
    if (k < 0) return 'Esquina invalida';
    co += k;
  }
  if (co % 3 !== 0) return 'Hay una esquina girada';
  return null;
}
