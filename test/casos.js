// Los 119 casos entrenables: mezcla, reconocimiento y solución literal.
import * as C from '../js/cube.js';
import * as A from '../js/algs.js';
import { isoCubeSVG, APAGADO } from '../js/cube3d.js';

let ok = 0, bad = 0;
const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (x !== undefined ? '  ' + x : '')); } };
let seed = 20260908;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

console.log('--- inventario ---');
t('41 casos de F2L', A.SETS.F2L.casos.length === 41, A.SETS.F2L.casos.length);
t('57 casos de OLL', A.SETS.OLL.casos.length === 57, A.SETS.OLL.casos.length);
t('21 casos de PLL', A.SETS.PLL.casos.length === 21, A.SETS.PLL.casos.length);

console.log('--- cada caso: mezclarlo y resolverlo siguiendo la pantalla ---');
for (const kind of ['F2L', 'OLL', 'PLL']) {
  let malos = 0, sinReconocer = 0, ajustes = 0, total = 0;
  for (const caso of A.SETS[kind].casos) {
    for (let rep = 0; rep < 3; rep++) {
      total++;
      const st = C.applyAlg(C.solvedState(), A.setupFor(caso, rnd));
      // el caso tiene que reconocerse mirando el cubo
      const r = A.recognise(st);
      if (!r.caso || r.caso.id !== caso.id) sinReconocer++;
      // y la secuencia que se muestra tiene que resolverlo tal cual
      const sol = A.solutionFrom(st, caso.alg, kind);
      if (!sol) { malos++; continue; }
      if (sol.some((m) => m.ajuste)) ajustes++;
      const fin = C.applyAlg(st, sol);
      const listo = kind === 'PLL' ? C.isSolved(fin)
        : kind === 'OLL' ? (A.F2L_DONE(fin) && A.OLL_DONE(fin))
          : (A.pairSlotDone(fin) && A.restoDone(fin));
      if (!listo) { malos++; console.log('   no resuelve: ' + kind + ' ' + caso.id); }
    }
  }
  t(kind + ': ' + total + ' mezclas resueltas', malos === 0, malos + ' fallos');
  t(kind + ': todos reconocidos', sinReconocer === 0, sinReconocer + ' sin reconocer');
  console.log('  ' + kind + ': ' + ajustes + ' de ' + total + ' necesitaban giro de ajuste');
}

console.log('--- unicidad y cobertura ---');
{
  const vistas = new Set();
  for (const c of A.SETS.OLL.casos) vistas.add(A.casoOLLcompleto(A.estadoDelCaso(c)));
  t('los 57 OLL son casos distintos', vistas.size === 57, vistas.size);
  const vistasP = new Set();
  for (const c of A.SETS.PLL.casos) vistasP.add(A.casoPLL(A.estadoDelCaso(c)));
  t('los 21 PLL son casos distintos', vistasP.size === 21, vistasP.size);
  const vistasF = new Set(A.SETS.F2L.casos.map((c) => c.caso));
  t('los 41 F2L son casos distintos', vistasF.size === 41, vistasF.size);
}

console.log('--- validación de algoritmos propios ---');
{
  const caso = A.SETS.PLL.casos.find((c) => c.id === 'T');
  t('acepta el suyo', A.resuelveElCaso(caso.alg, caso, 'PLL'));
  t('acepta uno equivalente con ajuste', A.resuelveElCaso("U " + caso.alg, caso, 'PLL'));
  t('rechaza otro algoritmo', !A.resuelveElCaso("R U R' U'", caso, 'PLL'));
  const oll = A.SETS.OLL.casos[10];
  t('acepta el alternativo si lo hay', !oll.alt || !oll.alt.length || A.resuelveElCaso(oll.alt[0], oll, 'OLL'));
  let altOk = 0, altTotal = 0;
  for (const c of A.SETS.OLL.casos) for (const a of (c.alt || [])) {
    altTotal++; if (A.resuelveElCaso(a, c, 'OLL')) altOk++;
  }
  t('todos los alternativos valen', altOk === altTotal, altOk + '/' + altTotal);
  console.log('  algoritmos alternativos incluidos: ' + altTotal);
}

console.log('');
console.log(ok + ' pruebas de casos OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;

console.log('--- tus algoritmos ---');
{
  const mis = await import('../js/myalgs.js');
  const caso = A.SETS.PLL.casos.find((c) => c.id === 'T');

  // limpiar una grabación: junta giros y quita los ajustes de los extremos
  const grabado = [
    { face: 'U', amount: 1 },                       // ajuste inicial
    ...C.expandAlg("R U R' U' R' F R2 U' R' U' R U R' F'"),
    { face: 'U', amount: 3 },                       // ajuste final
  ];
  const limpio = mis.limpiarGrabacion(grabado);
  t('la grabación quita los ajustes', limpio === "R U R' U' R' F R2 U' R' U' R U R' F'", limpio);
  t('y sigue resolviendo el caso', A.resuelveElCaso(limpio, caso, 'PLL'));

  t('junta giros repetidos',
    mis.limpiarGrabacion(C.expandAlg("R R F")) === 'R2 F',
    mis.limpiarGrabacion(C.expandAlg('R R F')));

  // guardar, elegir y borrar
  const n0 = mis.algsDe('PLL', caso).length;
  const alt = "R U R' U' R' F R2 U' R' U' R U R' F' U";
  t('no acepta uno repetido', !mis.anadir('PLL', caso, caso.alg).ok);
  mis.anadir('PLL', caso, alt);
  t('se guarda el nuevo', mis.algsDe('PLL', caso).length === n0 + 1);
  t('y pasa a ser el preferido', mis.algElegido('PLL', caso) === alt);
  mis.elegir('PLL', caso, 0);
  t('se puede volver al de serie', mis.algElegido('PLL', caso) === caso.alg);
  mis.borrar('PLL', caso, alt);
  t('se puede borrar el propio', mis.algsDe('PLL', caso).length === n0);
  t('no borra los de serie', !mis.borrar('PLL', caso, caso.alg));

  // un algoritmo propio tiene que servir igual en el entrenador
  const propio = "R2 U R U R' U' R' U' R' U R'";     // Ub, no resuelve la T
  t('rechaza el que no toca', !A.resuelveElCaso(propio, caso, 'PLL'));
}

console.log('--- la guía en vivo, de la cruz al final ---');
{
  const { solve } = await import('../js/solver.js');
  let seed2 = 8080;
  const r2 = () => { seed2 = (seed2 * 1103515245 + 12345) & 0x7fffffff; return seed2 / 0x7fffffff; };

  // Misma lógica que la pantalla: reconocer, seguir la secuencia entera,
  // y sólo entonces volver a mirar el cubo. Congelar el caso mientras se
  // sigue es justo lo que hace que se pueda seguir.
  function siguiendoLaGuia(inicial) {
    let st = inicial, n = 0;
    const pasosVistos = new Set();
    while (n < 500 && !C.isSolved(st)) {
      const r = A.recognise(st);
      pasosVistos.add(r.paso);
      let base = null;
      if (r.caso && r.kind) {
        const alg = r.caso.alg;
        base = r.hueco
          ? (A.solutionFrom(r.hueco.estadoGirado, alg, 'F2L')
            && A.mapearAlg(A.solutionFrom(r.hueco.estadoGirado, alg, 'F2L'), r.hueco.aReal))
          : A.solutionFrom(st, alg, r.kind);
      } else if (r.paso === 'F2L' && r.sacar) {
        base = r.sacar.moves;
      } else if (r.paso === 'cruz') {
        base = [];
        let t = st;
        for (const m of solve(st).moves) {
          if (A.CROSS_DONE(t)) break;
          t = C.applyMove(t, m.face, m.amount);
          base.push(m);
        }
      }
      if (!base || !base.length) break;
      for (const m of base) { st = C.applyMove(st, m.face, m.amount); n++; }
    }
    return { resuelto: C.isSolved(st), n, pasos: [...pasosVistos] };
  }

  let malos = 0, maxN = 0;
  const pasos = new Set();
  for (let i = 0; i < 40; i++) {
    const r = siguiendoLaGuia(C.applyAlg(C.solvedState(), C.randomScramble(25, r2)));
    if (!r.resuelto) malos++;
    maxN = Math.max(maxN, r.n);
    r.pasos.forEach((p) => pasos.add(p));
  }
  t('40 cubos resueltos siguiendo la guía', malos === 0, malos + ' atascados');
  t('la guía pasa por los cuatro pasos',
    ['cruz', 'F2L', 'OLL', 'PLL'].every((p) => pasos.has(p)), [...pasos].join(' '));
  console.log('  máximo de movimientos guiados: ' + maxN);
}

console.log('--- apagar la última capa (entrenador de F2L) ---');
{
  let malas = 0, aMedias = 0, delPar = 0;
  for (const kind of ['F2L', 'OLL', 'PLL']) {
    for (const caso of A.SETS[kind].casos) {
      const st = A.estadoDelCaso(caso);
      const off = new Set(A.pegatinasUltimaCapa(st));
      // 4 esquinas (3 pegatinas) + 4 aristas (2) + el centro de arriba
      if (off.size !== 21) malas++;
      // se apaga la pieza entera o nada: media pieza apagada no se entiende
      for (const pieza of C.cubies()) {
        const dentro = pieza.filter((i) => off.has(i)).length;
        if (dentro && dentro !== pieza.length) aMedias++;
      }
      // y nunca el par que hay que meter, que es justo lo que se quiere ver
      const esq = C.findCorner(st, 'D', 'F', 'R');
      const ari = C.findEdge(st, 'F', 'R');
      if (C.CORNERS[esq.name].some((i) => off.has(i))) delPar++;
      if (C.EDGES[ari.name].some((i) => off.has(i))) delPar++;
    }
  }
  t('119 casos: se apagan las 21 pegatinas de arriba', malas === 0, malas + ' mal');
  t('se apaga la pieza entera, nunca media', aMedias === 0, aMedias + ' a medias');
  t('el par de F2L nunca se apaga', delPar === 0, delPar + ' veces');

  // apagarlas y volver a mirar: el color de arriba tiene que desaparecer
  // del dibujo, porque solo lo llevan piezas de la ultima capa
  const colores = { U: '#f1c40f', R: '#e67e22', F: '#27ae60', D: '#ecf0f1', L: '#c0392b', B: '#2980b9' };
  let conAmarillo = 0;
  for (const caso of A.SETS.F2L.casos) {
    const st = A.estadoDelCaso(caso);
    const svg = isoCubeSVG(st, colores, { px: 8, apagadas: A.pegatinasUltimaCapa(st) });
    if (svg.includes(colores.U)) conAmarillo++;
  }
  t('con la última capa apagada no queda ni un amarillo', conAmarillo === 0, conAmarillo + ' casos');
}

console.log('--- la miniatura del caso ---');
{
  let malas = 0, sinApagar = 0;
  const colores = { U: '#f1c40f', R: '#e67e22', F: '#27ae60', D: '#ecf0f1', L: '#c0392b', B: '#2980b9' };
  const vistas = new Map();
  for (const kind of ['F2L', 'OLL', 'PLL']) {
    for (const caso of A.SETS[kind].casos) {
      const svg = isoCubeSVG(A.estadoDelCaso(caso), colores, { px: 8 });
      // tres caras de nueve pegatinas, y ninguna coordenada rota
      if ((svg.match(/<polygon/g) || []).length !== 27) { malas++; continue; }
      if (/NaN|undefined/.test(svg)) { malas++; continue; }
      if (svg.includes(APAGADO)) sinApagar++;      // sin pedirlo, no se apaga nada
      const clave = kind + ':' + svg;
      vistas.set(clave, (vistas.get(clave) || 0) + 1);
    }
  }
  t('119 miniaturas con sus 27 pegatinas', malas === 0, malas + ' mal dibujadas');
  t('sin pedirlo, no se apaga nada', sinApagar === 0, sinApagar + ' apagadas de más');
  // la del cubo resuelto no puede parecerse a ningun caso: si un caso se
  // dibujara igual, la miniatura no estaria diciendo nada
  const resuelta = isoCubeSVG(C.solvedState(), colores, { px: 8 });
  const iguales = [...vistas.keys()].filter((k) => k.endsWith(resuelta)).length;
  t('ninguna miniatura sale como el cubo resuelto', iguales === 0, iguales + ' iguales');
  console.log('  miniaturas distintas: ' + vistas.size + ' de 119');
}

console.log('');
console.log('total casos: ' + ok + ' pruebas OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
