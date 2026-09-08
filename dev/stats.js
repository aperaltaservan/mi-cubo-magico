import * as C from '../js/cube.js';
import { solve } from '../js/solver.js';
let seed = 42;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const sum = {}, cnt = {};
const N = 2000;
for (let i = 0; i < N; i++) {
  const st = C.applyAlg(C.solvedState(), C.randomScramble(25, rnd));
  for (const p of solve(st).allPhases) {
    sum[p.name] = (sum[p.name] || 0) + p.moves.length;
    cnt[p.name] = (cnt[p.name] || 0) + 1;
  }
}
let tot = 0;
for (const k of Object.keys(sum)) {
  const m = sum[k] / N; tot += m;
  console.log('  ' + k.padEnd(24) + m.toFixed(1).padStart(6) + ' movimientos de media');
}
console.log('  ' + 'TOTAL'.padEnd(24) + tot.toFixed(1).padStart(6));
