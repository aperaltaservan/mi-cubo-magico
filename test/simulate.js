// ============================================================
//  Simulador del cubo real
// ============================================================
//  Construye paquetes de 20 bytes como los que manda el cubo,
//  para poder probar el decodificador de verdad (ida y vuelta)
//  sin tener el cubo delante.
//
//  La correspondencia ranura -> pegatinas no se escribe a mano:
//  se descubre sondeando el propio decodificador.
// ============================================================

import { decode, toFacelets } from '../js/xiaomi.js';
import * as C from '../js/cube.js';

const CORNER_COLORS = [
  null, [1, 2, 3], [1, 3, 4], [1, 4, 5], [1, 5, 2],
  [6, 3, 2], [6, 4, 3], [6, 5, 4], [6, 2, 5],
];
const EDGE_COLORS = [
  null, [1, 2], [1, 3], [1, 4], [1, 5], [2, 3], [4, 3],
  [4, 5], [2, 5], [6, 2], [6, 3], [6, 4], [6, 5],
];
const CENTRES = [4, 13, 22, 31, 40, 49];

export function buildPacket(cp, co, ep, eo) {
  const b = new Uint8Array(20);
  for (let i = 0; i < 4; i++) b[i] = (cp[i * 2] << 4) | cp[i * 2 + 1];
  for (let i = 0; i < 4; i++) b[4 + i] = (co[i * 2] << 4) | co[i * 2 + 1];
  for (let i = 0; i < 6; i++) b[8 + i] = (ep[i * 2] << 4) | ep[i * 2 + 1];
  let v14 = 0, v15 = 0;
  for (let i = 0; i < 8; i++) if (eo[i] === 2) v14 |= 128 >> i;
  for (let i = 0; i < 4; i++) if (eo[8 + i] === 2) v15 |= 128 >> i;
  b[14] = v14; b[15] = v15;
  return b;
}

/** Descubre en qué pegatinas escribe cada ranura, sondeando el decodificador */
function discoverLayout() {
  const corners = [];   // corners[slot][orient] = [pos de c1, c2, c3]
  for (let slot = 0; slot < 8; slot++) {
    corners[slot] = {};
    for (const orient of [1, 2, 3]) {
      const cp = new Array(8).fill(7);     // piezas "de relleno": colores 6,5,4
      const co = new Array(8).fill(3);
      cp[slot] = 1;                        // la sonda: colores 1,2,3
      co[slot] = orient;
      const vals = decode(buildPacket(cp, co, new Array(12).fill(12), new Array(12).fill(1)));
      if (!vals) throw new Error('la sonda de esquina no decodifica');
      const pos = [1, 2, 3].map((color) => {
        const hits = vals.map((v, i) => (v === color && !CENTRES.includes(i) ? i : -1))
          .filter((i) => i >= 0);
        if (hits.length !== 1) throw new Error('sonda ambigua en esquina ' + slot);
        return hits[0];
      });
      corners[slot][orient] = pos;
    }
  }

  const edges = [];
  for (let slot = 0; slot < 12; slot++) {
    edges[slot] = {};
    for (const orient of [1, 2]) {
      const ep = new Array(12).fill(12);   // relleno: colores 6,5
      const eo = new Array(12).fill(1);
      ep[slot] = 1;                        // sonda: colores 1,2
      eo[slot] = orient;
      const vals = decode(buildPacket(new Array(8).fill(7), new Array(8).fill(3), ep, eo));
      if (!vals) throw new Error('la sonda de arista no decodifica');
      const pos = [1, 2].map((color) => {
        const hits = vals.map((v, i) => (v === color && !CENTRES.includes(i) ? i : -1))
          .filter((i) => i >= 0);
        if (hits.length !== 1) throw new Error('sonda ambigua en arista ' + slot);
        return hits[0];
      });
      edges[slot][orient] = pos;
    }
  }
  return { corners, edges };
}

export const LAYOUT = discoverLayout();

/** Colores del cubo (1..6) -> paquete de 20 bytes */
export function encode(values) {
  const cp = new Array(8), co = new Array(8);
  for (let slot = 0; slot < 8; slot++) {
    let hecho = false;
    for (let piece = 1; piece <= 8 && !hecho; piece++) {
      for (const orient of [1, 2, 3]) {
        const pos = LAYOUT.corners[slot][orient];
        const c = CORNER_COLORS[piece];
        if (values[pos[0]] === c[0] && values[pos[1]] === c[1] && values[pos[2]] === c[2]) {
          cp[slot] = piece; co[slot] = orient; hecho = true; break;
        }
      }
    }
    if (!hecho) return null;
  }
  const ep = new Array(12), eo = new Array(12);
  for (let slot = 0; slot < 12; slot++) {
    let hecho = false;
    for (let piece = 1; piece <= 12 && !hecho; piece++) {
      for (const orient of [1, 2]) {
        const pos = LAYOUT.edges[slot][orient];
        const c = EDGE_COLORS[piece];
        if (values[pos[0]] === c[0] && values[pos[1]] === c[1]) {
          ep[slot] = piece; eo[slot] = orient; hecho = true; break;
        }
      }
    }
    if (!hecho) return null;
  }
  return buildPacket(cp, co, ep, eo);
}

// En el marco propio del cubo: U=azul(6) R=naranja(5) F=amarillo(2)
//                              D=verde(1) L=rojo(3) B=blanco(4)
export const FACE_VALUE = { U: 6, R: 5, F: 2, D: 1, L: 3, B: 4 };

/** Estado del modelo (letras) -> paquete del cubo */
export function stateToPacket(state) {
  return encode(state.map((f) => FACE_VALUE[f]));
}

// ------------------------------------------------------------
//  Pruebas
// ------------------------------------------------------------
const esNode = typeof process !== 'undefined' && process.argv && process.argv[1];
if (esNode && process.argv[1].endsWith('simulate.js')) {
  let ok = 0, bad = 0;
  const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (x ? '  ' + x : '')); } };

  t('el sondeo encuentra las 8 esquinas', LAYOUT.corners.length === 8);
  t('el sondeo encuentra las 12 aristas', LAYOUT.edges.length === 12);

  // ida y vuelta con el cubo resuelto
  const solved = C.solvedState();
  const pkt = stateToPacket(solved);
  t('el cubo resuelto se codifica', !!pkt);
  t('ida y vuelta del cubo resuelto',
    decode(pkt).join(',') === solved.map((f) => FACE_VALUE[f]).join(','));

  // ida y vuelta con 500 mezclas
  let seed = 20260908;
  const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
  let fallos = 0;
  for (let i = 0; i < 500; i++) {
    const st = C.applyAlg(C.solvedState(), C.randomScramble(25, rnd));
    const p = stateToPacket(st);
    if (!p) { fallos++; continue; }
    const back = decode(p);
    if (!back || back.join(',') !== st.map((f) => FACE_VALUE[f]).join(',')) fallos++;
  }
  t('500 mezclas: ida y vuelta exacta', fallos === 0, fallos + ' fallos');

  // el estado leído es un cubo válido y coincide con el modelo
  {
    const st = C.applyAlg(C.solvedState(), "R U2 F' L D B' R2 U");
    const r = toFacelets(decode(stateToPacket(st)));
    t('el estado leído es válido', C.validateState(r.state) === null);
    t('el estado leído coincide con el modelo', r.state.join('') === st.join(''));
    t('detecta los colores por los centros',
      r.faceColor.D === 'verde' && r.faceColor.B === 'blanco' && r.faceColor.U === 'azul');
  }

  console.log(ok + ' pruebas del simulador OK, ' + bad + ' fallos');
  if (bad) process.exitCode = 1;
}
