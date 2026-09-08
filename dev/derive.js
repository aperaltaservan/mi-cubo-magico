// Script de desarrollo: comprueba el modelo y averigua el efecto exacto
// de los algoritmos de la ultima capa.
import * as C from '../js/cube.js';

const S = C.solvedState;

function check(name, cond) {
  console.log((cond ? 'OK   ' : 'FALLO') + '  ' + name);
  if (!cond) process.exitCode = 1;
}

console.log('--- comprobaciones del modelo ---');
check('R^4 = identidad', C.isSolved(C.applyAlg(S(), 'R R R R')));
check('U^4 = identidad', C.isSolved(C.applyAlg(S(), 'U U U U')));
for (const f of C.FACES) check(f + '^4 = identidad', C.isSolved(C.applyAlg(S(), [f, f, f, f].join(' '))));
check('sexy^6 = identidad', C.isSolved(C.applyAlg(S(), "R U R' U' ".repeat(6))));
check("(R U R' U')^3 != id", !C.isSolved(C.applyAlg(S(), "R U R' U' ".repeat(3))));
check('superflip valido', C.validateState(C.applyAlg(S(), "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2")) === null);
check('estado resuelto valido', C.validateState(S()) === null);
check('(R U R U R U R U R U R U) = id', C.isSolved(C.applyAlg(S(), 'R U '.repeat(6))));

// Comprobacion visual de un giro R
{
  const t = C.applyAlg(S(), 'R');
  console.log('tras R -> U:', t.slice(0, 9).join(''), ' F:', t.slice(18, 27).join(''), ' B:', t.slice(45, 54).join(''), ' D:', t.slice(27, 36).join(''));
}
{
  const t = C.applyAlg(S(), 'U');
  console.log('tras U -> F:', t.slice(18, 27).join(''), ' L:', t.slice(36, 45).join(''), ' B:', t.slice(45, 54).join(''), ' R:', t.slice(9, 18).join(''));
}

// --- efecto de los algoritmos de ultima capa ---------------------------
function pieceMap(alg) {
  const s = C.applyAlg(S(), alg);
  const edges = {}, corners = {};
  for (const name of C.EDGE_NAMES) {
    const [i, j] = C.EDGES[name];
    edges[name] = s[i] + s[j];
  }
  for (const name of C.CORNER_NAMES) {
    const t = C.CORNERS[name];
    corners[name] = s[t[0]] + s[t[1]] + s[t[2]];
  }
  return { edges, corners };
}

function report(label, alg) {
  const { edges, corners } = pieceMap(alg);
  const movedE = C.EDGE_NAMES.filter((n) => edges[n] !== n);
  const movedC = C.CORNER_NAMES.filter((n) => corners[n] !== n);
  console.log('\n### ' + label + '   [' + alg + ']');
  console.log('  aristas movidas : ' + movedE.map((n) => n + '<-' + edges[n]).join('  '));
  console.log('  esquinas movidas: ' + movedC.map((n) => n + '<-' + corners[n]).join('  '));
}

console.log('\n--- algoritmos de ultima capa ---');
report('cruz amarilla (FRURUF)', "F R U R' U' F'");
report('permutar esquinas (URULURUL)', "U R U' L' U R' U' L");
report('permutar esquinas inv', "L' U R U' L U R' U'");
report('sune', "R U R' U R U2 R'");
report('U-perm a', "R U' R U R U R U' R' U' R2");
report('U-perm b', "R2 U R U R' U' R' U' R' U R'");
report('insertar derecha', "U R U' R' U' F' U F");
report('insertar izquierda', "U' L' U L U F U' F'");
report('twist corner (RDRD x2)', "R' D' R D R' D' R D");
report('twist corner (RDRD x4)', "R' D' R D R' D' R D R' D' R D R' D' R D");
report('sexy', "R U R' U'");
