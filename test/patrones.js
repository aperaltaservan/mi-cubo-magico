// Cada patrón tiene que salir de verdad, y el que dice ser.
import * as C from '../js/cube.js';
import { PATRONES } from '../js/patrones.js';

let ok = 0, bad = 0;
const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (x !== undefined ? '  ' + x : '')); } };

const cara = (s, i) => s.slice(i * 9, i * 9 + 9);      // U R F D L B
const centro = (s, i) => s[i * 9 + 4];
const esquinasYcentro = [0, 2, 4, 6, 8];
const bordes = [1, 3, 5, 7];

console.log('--- cada patrón sale y es distinto ---');
const vistos = new Map();
for (const p of PATRONES) {
  let st;
  try { st = C.applyAlg(C.solvedState(), C.expandAlg(p.alg)); }
  catch (e) { t(p.id, false, 'no se entiende: ' + e.message); continue; }
  if (C.validateState(st) !== null) { t(p.id, false, 'cubo inválido: ' + C.validateState(st)); continue; }
  if (C.isSolved(st)) { t(p.id, false, 'no hace nada'); continue; }
  const clave = st.join('');
  if (vistos.has(clave)) { t(p.id, false, 'es el mismo patrón que ' + vistos.get(clave)); continue; }
  vistos.set(clave, p.id);
  // y deshacerlo tiene que devolver el cubo resuelto
  if (!C.isSolved(C.applyAlg(st, C.invertAlg(C.expandAlg(p.alg))))) {
    t(p.id, false, 'no se puede deshacer'); continue;
  }
  ok++;
}
console.log('  ' + PATRONES.length + ' patrones, ' + vistos.size + ' distintos');

console.log('--- los que tienen forma definible, se comprueban ---');
{
  const st = (id) => C.applyAlg(C.solvedState(), C.expandAlg(PATRONES.find((p) => p.id === id).alg));

  // Damero: en cada cara, esquinas+centro de un color y bordes de otro
  const d = st('damero');
  let bien = true;
  for (let f = 0; f < 6; f++) {
    const c = cara(d, f);
    const a = new Set(esquinasYcentro.map((i) => c[i]));
    const b = new Set(bordes.map((i) => c[i]));
    if (a.size !== 1 || b.size !== 1 || [...a][0] === [...b][0]) bien = false;
  }
  t('damero: cuadros de dos colores en las 6 caras', bien);

  // Seis puntos: cada cara con 8 iguales y el centro distinto
  const sp = st('seis-puntos');
  let caras = 0;
  for (let f = 0; f < 6; f++) {
    const c = cara(sp, f);
    const fuera = new Set([...esquinasYcentro, ...bordes].filter((i) => i !== 4).map((i) => c[i]));
    if (fuera.size === 1 && [...fuera][0] !== c[4]) caras++;
  }
  t('seis puntos: las 6 caras con lunar', caras === 6, caras + ' caras');

  // Cuatro puntos: cuatro caras con lunar, dos enteras
  const cp = st('cuatro-puntos');
  let conLunar = 0, enteras = 0;
  for (let f = 0; f < 6; f++) {
    const c = cara(cp, f);
    const fuera = new Set([0, 1, 2, 3, 5, 6, 7, 8].map((i) => c[i]));
    if (fuera.size === 1) { if (c[4] === [...fuera][0]) enteras++; else conLunar++; }
  }
  t('cuatro puntos: 4 con lunar y 2 enteras', conLunar === 4 && enteras === 2,
    conLunar + ' con lunar, ' + enteras + ' enteras');

  // Superflip: esquinas resueltas y los 12 bordes del revés
  const sf = st('superflip');
  const esquinasBien = C.CORNER_NAMES.every((n) => C.cornerSolved(sf, n));
  const bordesDelReves = C.EDGE_NAMES.every((n) => {
    const [i, j] = C.EDGES[n];
    return sf[i] === C.faceOf(j) && sf[j] === C.faceOf(i);
  });
  t('superflip: esquinas en su sitio', esquinasBien);
  t('superflip: los 12 bordes del revés', bordesDelReves);
}

console.log('--- se pueden hacer desde el cubo resuelto y sin trampas ---');
{
  let largos = 0;
  for (const p of PATRONES) {
    const n = C.expandAlg(p.alg).length;
    if (n > 30) largos++;
  }
  t('ningún patrón pasa de 30 giros', largos === 0, largos + ' demasiado largos');
  const dif = new Set(PATRONES.map((p) => p.dificultad));
  t('los patrones vienen con dificultad', [...dif].every((d) => d >= 1 && d <= 3));
  t('todos tienen nombre y descripción',
    PATRONES.every((p) => p.nombre && p.desc && p.emoji && p.id));
}

console.log('');
console.log(ok + ' pruebas de patrones OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
