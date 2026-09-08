// Bateria de pruebas: el solucionador tiene que resolver cualquier mezcla.
import * as C from '../js/cube.js';
import { solve } from '../js/solver.js';

let pass = 0, fail = 0;
function ok(name, cond, extra) {
  if (cond) { pass++; }
  else { fail++; console.log('FALLO: ' + name + (extra ? '  ' + extra : '')); }
}

// --- modelo ---
ok('estado resuelto es valido', C.validateState(C.solvedState()) === null);
for (const f of C.FACES) ok(f + '^4 = id', C.isSolved(C.applyAlg(C.solvedState(), [f, f, f, f].join(' '))));
ok('sexy^6 = id', C.isSolved(C.applyAlg(C.solvedState(), "R U R' U' ".repeat(6))));
ok("(R' D' R D)^6 = id", C.isSolved(C.applyAlg(C.solvedState(), "R' D' R D ".repeat(6))));
ok('invertir alg deshace', C.isSolved(C.applyAlg(C.applyAlg(C.solvedState(), "R U2 F' L D B'"), C.invertAlg("R U2 F' L D B'"))));
ok('simplify junta caras', C.algToString(C.simplifyAlg("R R R2 U U'")) === '');

// generador reproducible
let seed = 123456789;
function rnd() { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; }

// --- solucionador ---
const N = 5000;
let totalMoves = 0, maxMoves = 0, worst = null;
const phaseMax = {};
let solverFail = 0;
const t0 = Date.now();

for (let i = 0; i < N; i++) {
  const scramble = C.randomScramble(25, rnd);
  const state = C.applyAlg(C.solvedState(), scramble);
  try {
    const plan = solve(state);
    const end = C.applyAlg(state, plan.moves);
    if (!C.isSolved(end)) {
      solverFail++;
      if (!worst) console.log('  no resuelve: ' + C.algToString(scramble));
      continue;
    }
    totalMoves += plan.length;
    if (plan.length > maxMoves) { maxMoves = plan.length; worst = C.algToString(scramble); }
    for (const p of plan.allPhases) {
      phaseMax[p.name] = Math.max(phaseMax[p.name] || 0, p.moves.length);
    }
  } catch (e) {
    solverFail++;
    if (solverFail <= 3) console.log('  excepcion: ' + e.message + '  en  ' + C.algToString(scramble));
  }
}
const dt = Date.now() - t0;
ok(N + ' mezclas aleatorias resueltas', solverFail === 0, solverFail + ' fallos');

// --- casos limite ---
ok('cubo ya resuelto', solve(C.solvedState()).length === 0);
for (const alg of ['U', "R'", 'F2', "U R U' R'", "R U R' U R U2 R'", "F R U R' U' F'",
  'D2 L2 B2 R2 U2 F2', "R U R' U R U2 R' U R U R' U R U2 R'"]) {
  const st = C.applyAlg(C.solvedState(), alg);
  let good = false;
  try { good = C.isSolved(C.applyAlg(st, solve(st).moves)); } catch (e) { good = false; }
  ok('caso: ' + alg, good);
}

// --- estados imposibles ---
{
  const bad = C.solvedState(); const t = bad[0]; bad[0] = bad[9]; bad[9] = t;
  let threw = false;
  try { solve(bad); } catch (e) { threw = true; }
  ok('rechaza estado imposible', threw);
}

console.log('');
console.log('Media de movimientos: ' + (totalMoves / (N - solverFail)).toFixed(1) +
  '   maximo: ' + maxMoves + '   (' + dt + ' ms para ' + N + ' cubos)');
console.log('Maximo por fase:');
for (const k of Object.keys(phaseMax)) console.log('   ' + k.padEnd(26) + phaseMax[k]);
console.log('');
console.log(pass + ' pruebas OK, ' + fail + ' fallos');
if (fail) process.exitCode = 1;
