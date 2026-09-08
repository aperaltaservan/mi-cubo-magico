// ============================================================
//  xiaomi.js — Lectura del estado real del cubo
// ============================================================
//  El paquete de 20 bytes no trae solo los ultimos giros: trae
//  el estado completo (posicion y giro de esquinas y aristas).
//  Este decodificador es un port del que usa la app oficial,
//  tomado de github.com/wachino/xiaomi-mi-smart-rubik-cube
//  (probado contra un cubo real).
//
//  Devuelve 54 numeros del 1 al 6 en el mismo orden de pegatinas
//  que usa cube.js:  U=0..8  R=9..17  F=18..26  D=27..35
//                    L=36..44  B=45..53
//
//  Los numeros son los colores internos del cubo:
//    1 verde   2 amarillo   3 rojo   4 blanco   5 naranja   6 azul
// ============================================================

export const VALUE_COLOR = {
  1: 'verde', 2: 'amarillo', 3: 'rojo', 4: 'blanco', 5: 'naranja', 6: 'azul',
};

// --- Colocacion de una esquina -----------------------------------------
function cornerSet(cube, orient, p1, p2, p3, c1, c2, c3, yFirst) {
  if (orient === 3) { cube[p1] = c1; cube[p2] = c2; cube[p3] = c3; return 0; }
  const a = yFirst ? 2 : 1;
  if (orient === a) { cube[p1] = c3; cube[p2] = c1; cube[p3] = c2; return 0; }
  if (orient === (a === 1 ? 2 : 1)) { cube[p1] = c2; cube[p2] = c3; cube[p3] = c1; return 0; }
  return 1;
}

// Los 8 juegos de colores posibles de una esquina
const CORNER_COLORS = [
  null, [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 2],
  [6, 3, 2], [6, 4, 3], [6, 5, 4], [6, 2, 5],
];

function placeCorner(cube, piece, orient, f1, f2, f3, yFirst) {
  const c = CORNER_COLORS[piece];
  if (!c) return 2;
  return cornerSet(cube, orient, f1, f2, f3, c[0], c[1], c[2], yFirst);
}

// --- Colocacion de una arista ------------------------------------------
const EDGE_COLORS = [
  null, [1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [4, 3],
  [4, 5], [2, 5], [6, 2], [6, 3], [6, 4], [6, 5],
];

function placeEdge(cube, piece, orient, p1, p2) {
  const c = EDGE_COLORS[piece];
  if (!c) return 4;
  if (orient === 1) { cube[p1] = c[0]; cube[p2] = c[1]; return 0; }
  if (orient === 2) { cube[p1] = c[1]; cube[p2] = c[0]; return 0; }
  return 3;
}

// Ciclo de 4 posiciones: el contenido avanza a1 -> a2 -> a3 -> a4 -> a1
function cycle4(cube, a1, a2, a3, a4) {
  const t = cube[a4];
  cube[a4] = cube[a3];
  cube[a3] = cube[a2];
  cube[a2] = cube[a1];
  cube[a1] = t;
}

/**
 * Descifra los paquetes de los modelos i3s. La clave es la misma que usa
 * la app oficial; aqui se suma el complemento en vez de restar, que es
 * la misma operacion.
 */
const KEY = [
  80, 175, 152, 32, 170, 119, 19, 137, 218, 230, 63, 95,
  46, 130, 106, 175, 163, 243, 20, 7, 167, 21, 168, 232,
  143, 175, 42, 125, 126, 57, 254, 87, 217, 91, 85, 215,
];

export function decode(raw) {
  if (!raw || raw.length !== 20) return null;
  let d = raw;
  if (raw[18] === 167) {
    const o1 = raw[19] & 15;
    const o2 = raw[19] >> 4;
    d = new Uint8Array(20);
    for (let i = 0; i < 19; i++) d[i] = (raw[i] - KEY[o1 + i] - KEY[o2 + i]) & 0xff;
    d[19] = raw[19];
  }

  const cube = new Uint8Array(55);
  let bad = 0;

  const cp = [], co = [], ep = [], eo = [];
  for (let i = 0; i < 4; i++) { cp.push(d[i] >> 4, d[i] & 15); }
  for (let i = 4; i < 8; i++) { co.push(d[i] >> 4, d[i] & 15); }
  for (let i = 8; i < 14; i++) { ep.push(d[i] >> 4, d[i] & 15); }
  for (let b = 0; b < 8; b++) eo.push((d[14] & (128 >> b)) !== 0 ? 2 : 1);
  for (let b = 0; b < 4; b++) eo.push((d[15] & (128 >> b)) !== 0 ? 2 : 1);

  // centros (nunca se mueven)
  cube[32] = 1; cube[41] = 2; cube[50] = 3;
  cube[14] = 4; cube[23] = 5; cube[5] = 6;

  // esquinas: la mitad se recorre en un sentido y la otra mitad en el otro
  const CORNER_SLOTS = [
    [34, 43, 54, false], [36, 52, 18, true], [30, 16, 27, false], [28, 25, 45, true],
    [1, 48, 37, true], [3, 12, 46, false], [9, 21, 10, true], [7, 39, 19, false],
  ];
  CORNER_SLOTS.forEach((s, i) => {
    bad |= placeCorner(cube, cp[i], co[i], s[0], s[1], s[2], s[3]);
  });

  const EDGE_SLOTS = [
    [31, 44], [35, 53], [33, 17], [29, 26], [40, 51], [15, 49],
    [13, 24], [42, 22], [4, 38], [2, 47], [6, 11], [8, 20],
  ];
  EDGE_SLOTS.forEach((s, i) => {
    bad |= placeEdge(cube, ep[i], eo[i], s[0], s[1]);
  });

  // reordenar al formato estandar de pegatinas
  cycle4(cube, 1, 7, 9, 3);
  cycle4(cube, 4, 8, 6, 2);
  for (const [a, b, c, e] of [
    [37, 19, 10, 46], [38, 20, 11, 47], [39, 21, 12, 48], [40, 22, 13, 49],
    [41, 23, 14, 50], [42, 24, 15, 51], [43, 25, 16, 52], [44, 26, 17, 53],
    [45, 27, 18, 54], [34, 28, 30, 36], [31, 29, 33, 35],
  ]) cycle4(cube, a, b, c, e);

  if (bad !== 0) return null;
  return Array.from(cube).slice(1);
}

/**
 * Pasa las 54 pegatinas (numeros 1..6) a letras de cara del modelo,
 * usando los centros: el centro de cada cara dice que numero le toca.
 * Devuelve tambien que color real tiene cada cara.
 */
export function toFacelets(values, valueColor = VALUE_COLOR) {
  if (!values || values.length !== 54) return null;
  const FACES = ['U', 'R', 'F', 'D', 'L', 'B'];
  const valueToFace = {};
  const faceColor = {};
  for (let f = 0; f < 6; f++) {
    const centre = values[f * 9 + 4];
    if (valueToFace[centre]) return null;        // dos centros iguales
    valueToFace[centre] = FACES[f];
    faceColor[FACES[f]] = valueColor[centre];
  }
  const state = values.map((v) => valueToFace[v]);
  if (state.some((x) => !x)) return null;
  return { state, faceColor, valueToFace };
}
