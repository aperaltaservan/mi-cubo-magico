import * as C from '../js/cube.js';
import { Solver } from '../js/solver.js';

const SIDES = ['F', 'R', 'B', 'L'];
const D_EDGE = { F: 'DF', R: 'DR', B: 'DB', L: 'DL' };
const D_CORNER = { F: 'DFR', R: 'DRB', B: 'DBL', L: 'DLF' };
const M_EDGE = { F: 'FR', R: 'BR', B: 'BL', L: 'FL' };

function crossOk(s) { return SIDES.every((X) => C.edgeSolved(s, D_EDGE[X])); }
function layer1Ok(s) { return crossOk(s) && SIDES.every((X) => C.cornerSolved(s, D_CORNER[X])); }
function layer2Ok(s) { return layer1Ok(s) && SIDES.every((X) => C.edgeSolved(s, M_EDGE[X])); }

let seed = 987654321;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

const tally = {};
function note(k) { tally[k] = (tally[k] || 0) + 1; }

for (let i = 0; i < 300; i++) {
  const scr = C.randomScramble(25, rnd);
  const sv = new Solver(C.applyAlg(C.solvedState(), scr));
  try {
    sv.solveDaisy();
    if (sv.petals() !== 4) { note('1-margarita mal'); continue; }
    sv.solveCross();
    if (!crossOk(sv.s)) { note('2-cruz mal'); continue; }
    sv.solveFirstCorners();
    if (!layer1Ok(sv.s)) { note('3-primera capa mal'); continue; }
    sv.solveMiddle();
    if (!layer2Ok(sv.s)) { note('4-segunda capa mal'); continue; }
    sv.solveYellowCross();
    if (!layer2Ok(sv.s)) { note('5-cruz amarilla rompe abajo'); continue; }
    if (sv.uEdgeOriented().length !== 4) { note('5-cruz amarilla mal'); continue; }
    sv.solveLastEdges();
    if (!layer2Ok(sv.s)) { note('6-bordes rompe abajo'); continue; }
    if (sv.edgesPlaced() !== 4) { note('6-bordes mal'); continue; }
    sv.solveCornerPositions();
    if (!layer2Ok(sv.s) || sv.edgesPlaced() !== 4) { note('7-colocar esq rompe'); continue; }
    if (sv.cornersPlaced() !== 4) { note('7-colocar esq mal'); continue; }
    sv.solveCornerOrientation();
    if (!C.isSolved(sv.s)) { note('8-girar esq mal'); continue; }
    note('OK');
  } catch (e) {
    note('EXCEPCION ' + e.message);
  }
}

for (const k of Object.keys(tally).sort()) console.log(String(tally[k]).padStart(4) + '  ' + k);
