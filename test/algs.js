// Comprueba uno por uno los algoritmos de Fridrich.
import * as C from '../js/cube.js';
import { PLL, OLL_CORNERS, casoPLL, casoOLL, recognise, setupFor } from '../js/algs.js';

const SIDES = ['F', 'R', 'B', 'L'];
const U_EDGE = { F: 'UF', R: 'UR', B: 'UB', L: 'UL' };
const M_EDGE = { F: 'FR', R: 'BR', B: 'BL', L: 'FL' };
const D_EDGE = { F: 'DF', R: 'DR', B: 'DB', L: 'DL' };
const D_CORNER = { F: 'DFR', R: 'DRB', B: 'DBL', L: 'DLF' };
const U_CORNER = { F: 'URF', R: 'UBR', B: 'ULB', L: 'UFL' };

/** ¿Están las dos primeras capas intactas? */
function f2lOk(s) {
  return SIDES.every((X) => C.edgeSolved(s, D_EDGE[X]) && C.cornerSolved(s, D_CORNER[X])
    && C.edgeSolved(s, M_EDGE[X]));
}
/** ¿Toda la cara de arriba amarilla? */
function orientedOk(s) {
  return SIDES.every((X) => s[C.EDGES[U_EDGE[X]][0]] === 'U' && s[C.CORNERS[U_CORNER[X]][0]] === 'U');
}
/** ¿Cuántas piezas de arriba están ya en su sitio? */
function lastLayerSolved(s) {
  return SIDES.every((X) => C.edgeSolved(s, U_EDGE[X]) && C.cornerSolved(s, U_CORNER[X]));
}

let ok = 0, bad = 0;
const fail = (n, why) => { bad++; console.log('  FALLO  ' + n.padEnd(8) + why); };

console.log('--- expandir notación con giros de cubo ---');
{
  const a = C.applyAlg(C.solvedState(), C.expandAlg("y R U R' U'"));
  const b = C.applyAlg(C.solvedState(), "B U B' U'");
  if (a.join('') === b.join('')) ok++; else fail('y', 'y R != B');
  // tras x, la posicion U la ocupa la cara F
  const c = C.applyAlg(C.solvedState(), C.expandAlg("x U x'"));
  const d = C.applyAlg(C.solvedState(), "F");
  if (c.join('') === d.join('')) ok++; else fail('x', 'x U no es F');
  if (C.expandAlg("x y z x' y' z'").length === 0) ok++; else fail('rot', 'los giros no deben mover nada');
  // movimientos de dos capas: r equivale a girar L y quedarte el cubo torcido
  const e = C.applyAlg(C.solvedState(), C.expandAlg('r'));
  const f = C.applyAlg(C.solvedState(), 'L');
  if (e.join('') === f.join('')) ok++; else fail('r', 'r no equivale a L visto desde los centros');
  const g = C.applyAlg(C.solvedState(), C.expandAlg("r U R' U' r' F R F'"));
  if (C.validateState(g) === null) ok++; else fail('r-alg', 'algoritmo con dobles invalido');
  if (C.isSolved(C.applyAlg(C.solvedState(), C.expandAlg("r U r' U' r U r' U' r U r' U' r U r' U' r U r' U' r U r' U'")))) ok++;
  else fail('r-orden', 'r U r U-inverso repetido 6 veces deberia volver al inicio');
}

console.log('--- PLL (permutar la última capa) ---');
const seenPerm = new Map();
for (const c of PLL) {
  let st;
  try { st = C.applyAlg(C.solvedState(), C.expandAlg(c.alg)); }
  catch (e) { fail(c.id, 'no se entiende: ' + e.message); continue; }
  if (!f2lOk(st)) { fail(c.id, 'rompe las dos primeras capas'); continue; }
  if (!orientedOk(st)) { fail(c.id, 'desorienta la cara de arriba'); continue; }
  if (lastLayerSolved(st)) { fail(c.id, 'no hace nada'); continue; }
  // ¿un giro de U lo dejaría resuelto? entonces no es un PLL de verdad
  let trivial = false;
  for (let k = 1; k < 4; k++) if (lastLayerSolved(C.applyMove(st, 'U', k))) trivial = true;
  if (trivial) { fail(c.id, 'es solo un giro de U'); continue; }
  // Cada caso tiene que ser distinto de verdad: dos algoritmos son el mismo
  // caso si se diferencian en un giro de U antes y/o después (AUF).
  const key = casoPLL(st);
  const dup = seenPerm.get(key);
  if (dup) { fail(c.id, 'es el mismo caso que ' + dup); continue; }
  seenPerm.set(key, c.id);
  ok++;
}
console.log('  casos PLL distintos: ' + seenPerm.size + ' de 21');
if (seenPerm.size !== 21) { bad++; console.log('  FALLO  faltan casos PLL'); }

console.log('--- OLL de esquinas (con la cruz ya hecha) ---');
const seenOll = new Map();
for (const c of OLL_CORNERS) {
  let alg;
  try { alg = C.expandAlg(c.alg); }
  catch (e) { fail(c.id, 'no se entiende: ' + e.message); continue; }
  // el caso es el cubo tras deshacer el algoritmo
  const caso = C.applyAlg(C.solvedState(), C.invertAlg(alg));
  if (!f2lOk(caso)) { fail(c.id, 'rompe las dos primeras capas'); continue; }
  const cruz = SIDES.every((X) => caso[C.EDGES[U_EDGE[X]][0]] === 'U');
  if (!cruz) { fail(c.id, 'el caso no tiene la cruz amarilla hecha'); continue; }
  const esquinasMal = SIDES.filter((X) => caso[C.CORNERS[U_CORNER[X]][0]] !== 'U').length;
  if (esquinasMal === 0) { fail(c.id, 'no hay nada que orientar'); continue; }
  // y el algoritmo tiene que orientarlo todo
  if (!orientedOk(C.applyAlg(caso, alg))) { fail(c.id, 'no orienta la última capa'); continue; }
  const key = casoOLL(caso);
  const dup = seenOll.get(key);
  if (dup) { fail(c.id, 'es el mismo caso que ' + dup); continue; }
  seenOll.set(key, c.id);
  ok++;
}
console.log('  casos de esquinas distintos: ' + seenOll.size + ' de 7');
if (seenOll.size !== 7) { bad++; console.log('  FALLO  faltan casos de esquinas'); }

console.log('');
console.log(ok + ' algoritmos verificados, ' + bad + ' con problemas');
if (bad) process.exitCode = 1;

console.log('--- reconocer el caso mirando el cubo ---');
{
  let fallos = 0;
  for (const c of PLL) {
    const st = C.applyAlg(C.solvedState(), setupFor(c, () => 0.5));
    const r = recognise(st);
    if (r.paso !== 'PLL' || !r.caso || r.caso.id !== c.id) {
      fallos++; console.log('  FALLO  ' + c.id + ' se reconoce como ' + r.paso + ' ' + (r.caso ? r.caso.id : ''));
    }
    // El algoritmo tiene que resolverlo ajustando la cara de arriba antes
    // (el giro de ajuste lo hace el que resuelve, como en un entrenador real)
    let bien = false;
    for (let antes = 0; antes < 4 && !bien; antes++) {
      const fin = C.applyAlg(C.applyMove(st, 'U', antes), C.expandAlg(c.alg));
      for (let k = 0; k < 4; k++) if (C.isSolved(C.applyMove(fin, 'U', k))) bien = true;
    }
    if (!bien) { fallos++; console.log('  FALLO  ' + c.id + ' no resuelve su propia mezcla'); }
  }
  if (!fallos) ok += 2; else bad += fallos;
  console.log('  21 casos PLL: mezcla, reconocimiento y solución ' + (fallos ? 'CON FALLOS' : 'OK'));

  let f2 = 0;
  for (const c of OLL_CORNERS) {
    const st = C.applyAlg(C.solvedState(), setupFor(c, () => 0.5));
    const r = recognise(st);
    // el reconocedor trabaja con los 57 casos; aqui solo miramos el paso
    if (r.paso !== 'OLL' || !r.caso) {
      f2++; console.log('  FALLO  OLL ' + c.id + ' se reconoce como ' + r.paso);
    }
    let orienta = false;
    for (let antes = 0; antes < 4 && !orienta; antes++) {
      if (C.applyAlg(C.applyMove(st, 'U', antes), C.expandAlg(c.alg))
        .slice(0, 9).every((x) => x === 'U')) orienta = true;
    }
    if (!orienta) { f2++; console.log('  FALLO  OLL ' + c.id + ' no orienta desde su mezcla'); }
  }
  if (!f2) ok += 2; else bad += f2;
  console.log('  7 casos OLL: mezcla, reconocimiento y solución ' + (f2 ? 'CON FALLOS' : 'OK'));

  // pasos previos
  const mezcla = C.applyAlg(C.solvedState(), 'R U2 F D L B2 R U');
  const paso = recognise(mezcla).paso;
  if (paso === 'cruz' || paso === 'F2L') ok++; else { bad++; console.log('  FALLO  mezcla suelta -> ' + paso); }
  if (recognise(C.solvedState()).paso === 'hecho') ok++; else { bad++; console.log('  FALLO  resuelto'); }
}

console.log('');
console.log('total: ' + ok + ' verificaciones, ' + bad + ' problemas');
if (bad) process.exitCode = 1;
