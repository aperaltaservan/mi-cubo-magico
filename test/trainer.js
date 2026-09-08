// Lo que ve el usuario en pantalla tiene que resolver el caso AL PIE DE LA LETRA.
import * as C from '../js/cube.js';
import * as A from '../js/algs.js';

let ok = 0, bad = 0;
const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (x !== undefined ? '  ' + x : '')); } };

let seed = 4242;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

console.log('--- PLL y OLL: seguir la pantalla literalmente ---');
{
  let malPLL = 0, malOLL = 0, conAjuste = 0;
  for (let rep = 0; rep < 4; rep++) {
    for (const c of A.PLL) {
      const st = C.applyAlg(C.solvedState(), A.setupFor(c, rnd));
      const sol = A.solutionFrom(st, c, 'PLL');
      if (!sol) { malPLL++; continue; }
      if (sol.some((m) => m.ajuste)) conAjuste++;
      if (!C.isSolved(C.applyAlg(st, sol))) { malPLL++; console.log('  no resuelve ' + c.id); }
    }
    for (const c of A.OLL_CORNERS) {
      const st = C.applyAlg(C.solvedState(), A.setupFor(c, rnd));
      const sol = A.solutionFrom(st, c, 'OLL');
      if (!sol) { malOLL++; continue; }
      const fin = C.applyAlg(st, sol);
      if (!(A.F2L_DONE(fin) && A.OLL_DONE(fin))) { malOLL++; console.log('  no orienta ' + c.id); }
    }
  }
  t('84 PLL resueltos siguiendo la pantalla', malPLL === 0, malPLL + ' fallos');
  t('28 OLL resueltos siguiendo la pantalla', malOLL === 0, malOLL + ' fallos');
  console.log('  (' + conAjuste + ' de 84 necesitaban giro de ajuste: por eso fallaba antes)');
}

console.log('--- F2L: fabricar el caso y meter el par ---');
{
  let malos = 0, noResuelve = 0, largos = 0;
  for (let i = 0; i < 200; i++) {
    const caso = A.f2lCase(rnd);
    if (!caso) { malos++; continue; }
    if (!A.f2lCaseOk(caso.estado)) { malos++; continue; }
    const fin = C.applyAlg(caso.estado, caso.solucion);
    if (!(A.pairSlotDone(fin) && A.restoDone(fin))) noResuelve++;
    if (caso.solucion.length > 12) largos++;
  }
  t('200 casos de F2L válidos', malos === 0, malos + ' malos');
  t('la solución mete el par', noResuelve === 0, noResuelve + ' fallos');
  console.log('  casos con solución larga (>12): ' + largos);

  // si el usuario se desvía, hay que saber recalcular
  let sinSalida = 0;
  for (let i = 0; i < 60; i++) {
    const caso = A.f2lCase(rnd);
    if (!caso) continue;
    let st = caso.estado;
    const hist = [];
    for (let k = 0; k < 2; k++) {          // dos giros a lo loco
      const m = { face: ['R', 'U', 'F'][(rnd() * 3) | 0], amount: 1 + ((rnd() * 3) | 0) };
      st = C.applyMove(st, m.face, m.amount); hist.push(m);
    }
    const sol = A.solveF2LPair(st, hist, caso.setup);
    const fin = C.applyAlg(st, sol);
    if (!(A.pairSlotDone(fin) && A.restoDone(fin))) sinSalida++;
  }
  t('se recupera si el usuario se desvía', sinSalida === 0, sinSalida + ' fallos');
}

console.log('');
console.log(ok + ' pruebas del entrenador OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;

console.log('--- el tutorial no puede pedir un paso ya hecho ---');
{
  const L = await import('../js/lessons.js');
  // cubo con la cruz blanca hecha pero sin margarita
  const conCruz = C.applyAlg(C.solvedState(), "R U R' U' R U R' U' F' U F");
  if (A.CROSS_DONE(conCruz)) {
    t('con la cruz hecha no pide la margarita', L.nextLesson(conCruz).id !== 'daisy',
      'pide ' + L.nextLesson(conCruz).id);
    t('la margarita cuenta como hecha', L.LESSONS[0].check(conCruz));
  } else { t('preparar cubo con cruz', false, 'la mezcla de prueba rompe la cruz'); }

  // la leccion que toca y la fase del solucionador tienen que coincidir
  const { solve } = await import('../js/solver.js');
  let seed2 = 777;
  const r2 = () => { seed2 = (seed2 * 1103515245 + 12345) & 0x7fffffff; return seed2 / 0x7fffffff; };
  let desajustes = 0;
  for (let i = 0; i < 200; i++) {
    const st = C.applyAlg(C.solvedState(), C.randomScramble(20, r2));
    const plan = solve(st);
    if (!plan.phases.length) continue;
    if (plan.phases[0].id !== L.nextLesson(st).id) desajustes++;
  }
  t('la lección y el paso del solucionador coinciden', desajustes === 0, desajustes + ' desajustes');
}

console.log('');
console.log('total entrenador: ' + ok + ' pruebas OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;

console.log('--- seguir la guía movimiento a movimiento ---');
{
  const { solve } = await import('../js/solver.js');
  let seed3 = 31337;
  const r3 = () => { seed3 = (seed3 * 1103515245 + 12345) & 0x7fffffff; return seed3 / 0x7fffffff; };

  // Asi trabaja la interfaz: sigue el plan y solo recalcula si te desvias.
  // (Recalcular en cada giro no puede funcionar en ningun metodo por capas:
  // a mitad de un algoritmo el cubo rompe a proposito lo ya hecho.)
  function seguir(inicial, erroresQueMeter) {
    let st = inicial, plan = solve(st), idx = 0, n = 0, errores = erroresQueMeter;
    const caras = ['U', 'R', 'F', 'D', 'L', 'B'];
    while (n < 900 && !C.isSolved(st)) {
      if (idx >= plan.moves.length) { plan = solve(st); idx = 0; if (!plan.moves.length) break; }
      let m = plan.moves[idx];
      if (errores > 0 && n > 0 && n % 37 === 0) {      // el usuario se equivoca
        errores--;
        m = { face: caras[(r3() * 6) | 0], amount: 1 + ((r3() * 3) | 0) };
        st = C.applyMove(st, m.face, m.amount);
        plan = solve(st); idx = 0; n++;
        continue;
      }
      st = C.applyMove(st, m.face, m.amount);
      idx++; n++;
    }
    return { resuelto: C.isSolved(st), n };
  }

  let malos = 0, maxN = 0;
  for (let i = 0; i < 80; i++) {
    const r = seguir(C.applyAlg(C.solvedState(), C.randomScramble(22, r3)), 0);
    if (!r.resuelto) malos++;
    maxN = Math.max(maxN, r.n);
  }
  t('80 cubos siguiendo la guía', malos === 0, malos + ' sin resolver');

  let malos2 = 0;
  for (let i = 0; i < 60; i++) {
    const r = seguir(C.applyAlg(C.solvedState(), C.randomScramble(22, r3)), 3);
    if (!r.resuelto) malos2++;
    maxN = Math.max(maxN, r.n);
  }
  t('60 cubos con 3 errores del usuario', malos2 === 0, malos2 + ' sin resolver');
  console.log('  máximo de movimientos: ' + maxN);

  // Y el paso que se muestra tiene que ir siempre hacia delante, nunca atras.
  let retrocesos = 0;
  for (let i = 0; i < 40; i++) {
    let st = C.applyAlg(C.solvedState(), C.randomScramble(22, r3));
    let plan = solve(st), idx = 0, ultimaFase = -1, n = 0;
    const orden = ['daisy', 'cross', 'corners1', 'middle', 'cross2', 'plle', 'pllc', 'ollc'];
    while (n < 900 && !C.isSolved(st)) {
      if (idx >= plan.moves.length) { plan = solve(st); idx = 0; if (!plan.moves.length) break; }
      // la fase que se ensena es la del plan que se esta siguiendo
      if (idx === 0 && plan.phases.length) {
        const f = orden.indexOf(plan.phases[0].id);
        if (f < ultimaFase) retrocesos++;
        ultimaFase = f;
      }
      const m = plan.moves[idx];
      st = C.applyMove(st, m.face, m.amount);
      idx++; n++;
    }
  }
  t('el tutorial nunca retrocede de paso', retrocesos === 0, retrocesos + ' retrocesos');
}

console.log('');
console.log('total entrenador: ' + ok + ' pruebas OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
