// ============================================================
//  solver.js — Metodo principiante (capa por capa)
// ============================================================
//  Resuelve con los MISMOS algoritmos que se ensenan a mano,
//  para que la app pueda ir explicando lo que hace.
//  La primera capa se construye abajo (cara D).
// ============================================================

import {
  EDGES, CORNERS, RIGHT_OF, LEFT_OF, OPPOSITE,
  applyMove, applyAlg, parseAlg, faceOf, findEdge, findCorner,
  edgeSolved, cornerSolved, isSolved, validateState,
} from './cube.js';

const SIDES = ['F', 'R', 'B', 'L'];
const U_CYCLE = ['F', 'L', 'B', 'R'];   // U (horario) manda F -> L -> B -> R -> F

const U_EDGE = { F: 'UF', R: 'UR', B: 'UB', L: 'UL' };
const D_EDGE = { F: 'DF', R: 'DR', B: 'DB', L: 'DL' };
const M_EDGE = { F: 'FR', R: 'BR', B: 'BL', L: 'FL' };
const U_CORNER = { F: 'URF', R: 'UBR', B: 'ULB', L: 'UFL' };
const D_CORNER = { F: 'DFR', R: 'DRB', B: 'DBL', L: 'DLF' };

/** k tal que U^k lleva una pieza de la posicion `from` a la posicion `to` */
function uRot(from, to) {
  return (U_CYCLE.indexOf(to) - U_CYCLE.indexOf(from) + 4) % 4;
}

/** Sustituye R/L/F/B en un algoritmo escrito para el frente F */
function relative(alg, front) {
  const map = {
    F: front, B: OPPOSITE[front],
    R: RIGHT_OF[front], L: LEFT_OF[front],
    U: 'U', D: 'D',
  };
  return parseAlg(alg).map((m) => ({ face: map[m.face], amount: m.amount }));
}

// --- Definicion de las fases (textos para el nino) ---------------------
export const PHASE_INFO = [
  {
    id: 'daisy', emoji: '🌼', name: 'La margarita',
    goal: 'Pon las 4 piezas blancas del borde alrededor del centro amarillo, con el blanco mirando hacia arriba.',
    kid: 'Vamos a hacer una flor: el centro amarillo es el corazón y las cuatro piezas blancas son los pétalos.',
  },
  {
    id: 'cross', emoji: '⬇️', name: 'Bajar los pétalos',
    goal: 'Gira cada pétalo hasta que su color de al lado coincida con el centro de esa cara, y baja la pieza girando esa cara dos veces.',
    kid: 'Cada pétalo tiene que caer en su sitio. Primero busca su color, y luego lo bajas dando dos vueltas.',
  },
  {
    id: 'corners1', emoji: '🧱', name: 'Las esquinas de abajo',
    goal: 'Coloca las 4 esquinas blancas. Pon la esquina justo encima de su hueco y repite el movimiento mágico hasta que entre.',
    kid: 'El movimiento mágico: derecha arriba, derecha abajo. Repite hasta que la esquina caiga en su casita.',
  },
  {
    id: 'middle', emoji: '🎀', name: 'El cinturón',
    goal: 'Coloca las 4 piezas del medio con la fórmula de la derecha o de la izquierda.',
    kid: 'Ahora el cinturón del cubo. Busca una pieza de arriba que no tenga amarillo y mándala a su hueco.',
  },
  {
    id: 'cross2', emoji: '⭐', name: 'La cruz amarilla',
    goal: 'Haz la cruz amarilla arriba con la fórmula F R U R’ U’ F’.',
    kid: 'Ahora dibujamos una cruz amarilla en el techo del cubo.',
  },
  {
    id: 'plle', emoji: '🏁', name: 'Colocar los bordes',
    goal: 'Lleva cada borde amarillo a su cara: el color del lado tiene que coincidir con el centro.',
    kid: 'Los bordes de arriba tienen que mirar a su casa. Cada uno con su color.',
  },
  {
    id: 'pllc', emoji: '📍', name: 'Colocar las esquinas',
    goal: 'Lleva cada esquina amarilla a su sitio (aunque esté girada).',
    kid: 'Cada esquina tiene que ir a su rincón. Todavía no importa si está del revés.',
  },
  {
    id: 'ollc', emoji: '🔄', name: 'Girar las esquinas',
    goal: 'Gira cada esquina con R’ D’ R D hasta que el amarillo mire arriba.',
    kid: 'Ojo: el cubo se va a desordenar por abajo. No pasa nada, es magia: al final vuelve solo.',
  },
];

class Solver {
  constructor(state) {
    this.s = state.slice();
    this.moves = [];
    this.phases = [];
    this.cur = null;
  }

  phase(id) {
    const info = PHASE_INFO.find((p) => p.id === id);
    this.cur = { ...info, chunks: [], moves: [] };
    this.phases.push(this.cur);
  }

  /** Aplica un trozo de algoritmo y lo registra como un paso ensenable */
  chunk(alg, hint) {
    const list = parseAlg(alg);
    if (!list.length) return;
    for (const m of list) {
      this.s = applyMove(this.s, m.face, m.amount);
      this.moves.push(m);
      this.cur.moves.push(m);
    }
    this.cur.chunks.push({ alg: list, hint: hint || '' });
  }

  /** Simula un algoritmo sin aplicarlo */
  peek(alg) { return applyAlg(this.s, alg); }

  /**
   * Busca en anchura la secuencia mas corta de formulas que cumple `goal`.
   * `options` = [{alg, hint}]. Devuelve la lista de opciones o null.
   * Es exhaustiva, asi que no se queda atascada como una busqueda voraz.
   */
  search(options, goal, maxDepth = 3) {
    if (goal(this.s)) return [];
    let level = [{ state: this.s, path: [] }];
    for (let d = 0; d < maxDepth; d++) {
      const next = [];
      for (const node of level) {
        for (const opt of options) {
          const st = applyAlg(node.state, opt.alg);
          const path = node.path.concat([opt]);
          if (goal(st)) return path;
          next.push({ state: st, path });
        }
      }
      level = next;
    }
    return null;
  }

  /** Aplica el resultado de search() como trozos ensenables */
  applySearch(options, goal, maxDepth, errMsg) {
    const path = this.search(options, goal, maxDepth);
    if (!path) throw new Error(errMsg);
    for (const opt of path) this.chunk(opt.alg, opt.hint);
  }

  // ---------------------------------------------------------------
  // Fase 1: la margarita (4 aristas blancas arriba, blanco hacia U)
  // ---------------------------------------------------------------
  isPetal(X, s = this.s) { return s[EDGES[U_EDGE[X]][0]] === 'D'; }

  petals(s = this.s) { return SIDES.filter((X) => this.isPetal(X, s)).length; }

  /** k tal que despues de U^k la ranura de arriba junto a `S` esta libre */
  freeUSlot(S) {
    for (let k = 0; k < 4; k++) {
      const t = applyMove(this.s, 'U', k);
      if (t[EDGES[U_EDGE[S]][0]] !== 'D') return k;
    }
    return 0;
  }

  crossDone(s = this.s) { return SIDES.every((X) => edgeSolved(s, D_EDGE[X])); }

  solveDaisy() {
    if (this.crossDone()) return;      // la cruz ya esta: no la deshagas
    this.phase('daisy');
    let guard = 0;

    // Una arista blanca esta "resuelta" si ya es petalo o si ya esta puesta
    // en la cruz de abajo. Las que estan puestas NO se tocan: si las
    // subieramos otra vez, quien siguiera la guia se quedaria en bucle.
    const puesta = (X) => edgeSolved(this.s, D_EDGE[X]);
    const pendiente = () => {
      for (const X of SIDES) {
        if (puesta(X)) continue;
        const loc = findEdge(this.s, 'D', X);
        if (loc.name.includes('U') && faceOf(loc.idx) === 'U') continue;   // ya es petalo
        return { X, loc };
      }
      return null;
    };
    /** k para que la ranura de arriba junto a `S` quede libre de petalos */
    const huecoLibre = (S) => {
      for (let k = 0; k < 4; k++) {
        const t = applyMove(this.s, 'U', k);
        if (t[EDGES[U_EDGE[S]][0]] !== 'D') return k;
      }
      return 0;
    };

    let target;
    while ((target = pendiente())) {
      if (++guard > 40) throw new Error('No consigo hacer la margarita');
      const slot = target.loc.name;
      const dFace = faceOf(target.loc.idx);

      if (slot.includes('U')) {
        // Arriba pero con el blanco de lado. Hay que sacarla girando una cara
        // lateral: elegimos una cuya arista de la cruz no este ya colocada.
        const S = slot.replace('U', '');
        const libre = puesta(S) ? SIDES.find((T) => !puesta(T)) || S : S;
        const k = uRot(S, libre);
        if (k) this.chunk([{ face: 'U', amount: k }], 'Gira la cara de arriba');
        this.chunk([{ face: libre, amount: 1 }], 'Saca la pieza blanca de arriba');
      } else if (slot.includes('D')) {
        // Abajo y mal puesta: esa cara no tiene nada que proteger.
        const S = slot.replace('D', '');
        const k = huecoLibre(S);
        if (k) this.chunk([{ face: 'U', amount: k }], 'Deja sitio libre arriba');
        this.chunk([{ face: S, amount: dFace === 'D' ? 2 : 1 }],
          dFace === 'D' ? 'Sube la pieza blanca de abajo' : 'Saca la pieza blanca de abajo');
      } else {
        // Capa del medio: se sube girando la cara que NO lleva el blanco.
        const [A, B] = slot.split('');
        const other = dFace === A ? B : A;
        let amount = 1;
        for (const a of [1, 3]) {
          const t = applyMove(this.s, other, a);
          if (t[EDGES[U_EDGE[other]][0]] === 'D') { amount = a; break; }
        }
        if (!puesta(other)) {
          const k = huecoLibre(other);
          if (k) this.chunk([{ face: 'U', amount: k }], 'Deja sitio libre arriba');
          this.chunk([{ face: other, amount }], 'Sube el pétalo');
        } else {
          // Esa cara ya tiene su arista de la cruz puesta: la subimos, la
          // apartamos con un giro de arriba y devolvemos la cara a su sitio.
          this.chunk([{ face: other, amount }], 'Sube el pétalo');
          let k = 1;
          for (let cand = 1; cand < 4; cand++) {
            const t = applyMove(this.s, 'U', cand);
            if (t[EDGES[U_EDGE[other]][0]] !== 'D') { k = cand; break; }
          }
          this.chunk([{ face: 'U', amount: k }], 'Aparta el pétalo');
          this.chunk([{ face: other, amount: (4 - amount) % 4 }], 'Devuelve la cara a su sitio');
        }
      }
    }
  }

  // ---------------------------------------------------------------
  // Fase 2: bajar los petalos -> cruz blanca abajo
  // ---------------------------------------------------------------
  solveCross() {
    if (this.crossDone()) return;
    this.phase('cross');
    for (let n = 0; n < 4; n++) {
      // De todos los petalos, el que menos haya que girar. Elegir "el primero
      // que aparezca" haria que la solucion cambiase de idea despues de cada
      // giro de U, y quien la siguiera se quedaria dando vueltas.
      let found = null;
      for (const X of SIDES) {
        const [ui, si] = EDGES[U_EDGE[X]];
        if (this.s[ui] !== 'D') continue;
        const cand = { X, side: this.s[si], k: uRot(X, this.s[si]) };
        if (!found || cand.k < found.k) found = cand;
      }
      if (!found) break;
      const k = found.k;
      if (k) this.chunk([{ face: 'U', amount: k }], 'Busca el color del pétalo');
      this.chunk([{ face: found.side, amount: 2 }], 'Baja el pétalo (dos vueltas)');
    }
    for (const X of SIDES) {
      if (!edgeSolved(this.s, D_EDGE[X])) throw new Error('La cruz blanca no ha salido');
    }
  }

  // ---------------------------------------------------------------
  // Fase 3: esquinas de la primera capa
  // ---------------------------------------------------------------
  solveFirstCorners() {
    this.phase('corners1');
    for (const X of SIDES) {
      const slotName = D_CORNER[X];
      const [a, b, c] = slotName.split('');
      if (cornerSolved(this.s, slotName)) continue;
      const r = RIGHT_OF[X];
      let guard = 0;
      while (!cornerSolved(this.s, slotName)) {
        if (++guard > 12) throw new Error('No consigo colocar la esquina ' + slotName);
        const loc = findCorner(this.s, a, b, c);
        if (loc.name.includes('D')) {
          // esta abajo pero mal: sacala
          const Z = SIDES.find((y) => D_CORNER[y] === loc.name);
          const rz = RIGHT_OF[Z];
          this.chunk(relative("R U R' U'", Z), 'Saca la esquina de su hueco');
          continue;
        }
        // esta arriba: ponla encima de su hueco
        const Z = SIDES.find((y) => U_CORNER[y] === loc.name);
        const k = uRot(Z, X);
        if (k) this.chunk([{ face: 'U', amount: k }], 'Pon la esquina encima de su casita');
        let n = 0;
        while (!cornerSolved(this.s, slotName)) {
          if (++n > 6) break;
          this.chunk(relative("R U R' U'", X), 'Movimiento mágico');
        }
      }
    }
  }

  // ---------------------------------------------------------------
  // Fase 4: segunda capa (el cinturon)
  // ---------------------------------------------------------------
  middleDone() { return SIDES.every((X) => edgeSolved(this.s, M_EDGE[X])); }

  solveMiddle() {
    this.phase('middle');
    let guard = 0;
    while (!this.middleDone()) {
      if (++guard > 20) throw new Error('No consigo la segunda capa');
      // arista de arriba sin amarillo
      let cand = null;
      for (const X of SIDES) {
        const [ui, si] = EDGES[U_EDGE[X]];
        if (this.s[ui] !== 'U' && this.s[si] !== 'U') { cand = { X, top: this.s[ui], side: this.s[si] }; break; }
      }
      if (cand) {
        const k = uRot(cand.X, cand.side);
        if (k) this.chunk([{ face: 'U', amount: k }], 'Alinea la pieza con su color');
        const f = cand.side;
        if (cand.top === RIGHT_OF[f]) {
          this.chunk(relative("U R U' R' U' F' U F", f), 'Fórmula de la derecha');
        } else {
          this.chunk(relative("U' L' U L U F U' F'", f), 'Fórmula de la izquierda');
        }
      } else {
        // no hay candidatas: expulsa una pieza mal puesta
        const X = SIDES.find((y) => !edgeSolved(this.s, M_EDGE[y]));
        this.chunk(relative("U R U' R' U' F' U F", X), 'Saca la pieza que está mal');
      }
    }
  }

  // ---------------------------------------------------------------
  // Fase 5: cruz amarilla
  // ---------------------------------------------------------------
  uEdgeOriented(s = this.s) {
    return SIDES.filter((X) => s[EDGES[U_EDGE[X]][0]] === 'U');
  }

  solveYellowCross() {
    this.phase('cross2');
    const options = SIDES.map((f) => ({
      alg: relative("F R U R' U' F'", f),
      hint: 'Fórmula de la cruz amarilla',
    }));
    this.applySearch(
      options,
      (s) => this.uEdgeOriented(s).length === 4,
      3,
      'No consigo la cruz amarilla',
    );
  }

  crossShape() {
    const o = this.uEdgeOriented();
    if (o.length === 0) return 'Punto: solo el centro amarillo';
    if (o.length === 2) {
      const [a, b] = o;
      return OPPOSITE[a] === b ? 'Línea amarilla' : 'Forma de L';
    }
    return 'Cruz amarilla';
  }

  // ---------------------------------------------------------------
  // Fase 6: colocar los bordes de arriba  (va ANTES que las esquinas:
  // asi la permutacion de esquinas queda siempre par y se puede
  // arreglar con ciclos de tres)
  // ---------------------------------------------------------------
  edgesPlaced(s = this.s) {
    return SIDES.filter((X) => edgeSolved(s, U_EDGE[X])).length;
  }

  solveLastEdges() {
    this.phase('plle');
    const options = [];
    for (const f of SIDES) {
      for (const alg of ["R U' R U R U R U' R' U' R2", "R2 U R U R' U' R' U' R' U R'"]) {
        options.push({ alg: relative(alg, f), hint: 'Fórmula de los bordes de arriba' });
      }
    }
    for (let k = 1; k < 4; k++) {
      options.push({ alg: [{ face: 'U', amount: k }], hint: 'Gira la cara de arriba' });
    }
    this.applySearch(options, (s) => this.edgesPlaced(s) === 4, 4,
      'No consigo colocar los bordes de arriba');
  }

  // ---------------------------------------------------------------
  // Fase 7: colocar las esquinas de arriba
  // ---------------------------------------------------------------
  cornersPlaced(s = this.s) {
    return SIDES.filter((X) => {
      const name = U_CORNER[X];
      const t = CORNERS[name];
      const got = [s[t[0]], s[t[1]], s[t[2]]].slice().sort().join('');
      return got === name.split('').sort().join('');
    }).length;
  }

  solveCornerPositions() {
    this.phase('pllc');
    // Ojo: aqui ya NO se puede girar U suelto, romperia los bordes.
    const options = [];
    for (const f of SIDES) {
      for (const alg of ["U R U' L' U R' U' L", "L' U R U' L U R' U'"]) {
        options.push({ alg: relative(alg, f), hint: 'Baile de esquinas' });
      }
    }
    this.applySearch(options, (s) => this.cornersPlaced(s) === 4, 3,
      'No consigo colocar las esquinas');
  }

  // ---------------------------------------------------------------
  // Fase 8: girar las esquinas de arriba  (R' D' R D)
  // ---------------------------------------------------------------
  cornersOriented(s = this.s) {
    return SIDES.every((X) => {
      const t = CORNERS[U_CORNER[X]];
      return s[t[0]] === 'U';
    });
  }

  solveCornerOrientation() {
    this.phase('ollc');
    let guard = 0;
    while (!this.cornersOriented()) {
      if (++guard > 60) throw new Error('No consigo girar las esquinas');
      if (this.s[CORNERS.URF[0]] === 'U') {
        this.chunk([{ face: 'U', amount: 1 }], 'Trae la siguiente esquina al frente');
      } else {
        this.chunk("R' D' R D", 'Gira la esquina (repite hasta que el amarillo mire arriba)');
      }
    }
    for (let k = 1; k < 4; k++) {
      if (isSolved(applyMove(this.s, 'U', k))) {
        this.chunk([{ face: 'U', amount: k }], 'Y ya está: recoloca la capa de arriba');
        break;
      }
    }
  }

  run() {
    this.solveDaisy();
    this.solveCross();
    this.solveFirstCorners();
    this.solveMiddle();
    this.solveYellowCross();
    this.solveLastEdges();
    this.solveCornerPositions();
    this.solveCornerOrientation();
    if (!isSolved(this.s)) throw new Error('El cubo no ha quedado resuelto');
    return this;
  }
}

/**
 * Resuelve un estado y devuelve el plan por fases.
 * @returns {{phases, allPhases, moves, length}}
 */
export function solve(state) {
  const problem = validateState(state);
  if (problem) throw new Error(problem);
  const sv = new Solver(state).run();
  return {
    phases: sv.phases.filter((p) => p.moves.length > 0),
    allPhases: sv.phases,
    moves: sv.moves,
    length: sv.moves.length,
  };
}

export { Solver };

// ============================================================
//  Por que se hace cada movimiento (modo detalle del tutorial)
// ============================================================
export const DETALLES = {
  'Saca la pieza blanca de arriba':
    'Esta pieza blanca está arriba, pero con el blanco mirando de lado. Si la bajásemos así '
    + 'quedaría torcida, así que primero la sacamos de ahí girando su cara.',
  'Deja sitio libre arriba':
    'Giramos sólo la cara de arriba para que el hueco donde va a llegar la pieza esté libre. '
    + 'Así no tiramos un pétalo que ya estaba puesto.',
  'Sube la pieza blanca de abajo':
    'Esta pieza blanca está abajo pero en el sitio equivocado. Dos vueltas de su cara la suben '
    + 'arriba con el blanco hacia el techo, que es donde la queremos para la margarita.',
  'Saca la pieza blanca de abajo':
    'Está abajo y con el blanco de lado, así que no sirve. La sacamos para volver a colocarla bien.',
  'Sube el pétalo': 'Con este giro la pieza blanca sube a la cara de arriba con el blanco hacia el techo.',
  'Coloca el pétalo': 'Movemos la pieza blanca hacia la cara de arriba.',
  'Busca el color del pétalo':
    'Cada pétalo tiene un segundo color. Giramos arriba hasta ponerlo justo encima del centro '
    + 'de ese mismo color: es su cara, y ahí es donde tiene que caer.',
  'Baja el pétalo (dos vueltas)':
    'Dos vueltas enteras de esa cara: la pieza baja al fondo con el blanco abajo y el otro color '
    + 'pegado a su centro. Media vuelta no valdría, quedaría del revés.',
  'Saca la esquina de su hueco':
    'Esta esquina está en el hueco pero mal puesta. La sacamos arriba para volver a meterla bien.',
  'Pon la esquina encima de su casita':
    'Giramos arriba hasta que la esquina quede justo encima del hueco al que pertenece. '
    + 'Sus dos colores de los lados tienen que coincidir con los dos centros de al lado.',
  'Movimiento mágico':
    'Estos cuatro giros sacan la esquina del hueco, la voltean un poco y la vuelven a meter. '
    + 'Repitiéndolos, la esquina acaba cayendo con el blanco hacia abajo.',
  'Alinea la pieza con su color':
    'Giramos arriba hasta que el color de delante de la pieza coincida con su centro. '
    + 'Se forma una T, y eso indica que la pieza ya está encima de su cara.',
  'Fórmula de la derecha':
    'La pieza tiene que bajar al hueco de la derecha. La fórmula la aparta, mete la esquina en '
    + 'medio para hacer sitio, y la deja caer en su ranura.',
  'Fórmula de la izquierda':
    'Igual que la de la derecha pero al espejo, porque la pieza va al hueco de la izquierda.',
  'Saca la pieza que está mal':
    'No queda arriba ninguna pieza aprovechable, así que expulsamos una que está mal metida '
    + 'para poder volver a colocarla desde arriba.',
  'Fórmula de la cruz amarilla':
    'Esta fórmula gira tres bordes de arriba. Aplicada desde la posición correcta, convierte '
    + 'el punto en L, la L en línea y la línea en cruz.',
  'Fórmula de los bordes de arriba':
    'Rota tres bordes de la última capa entre ellos, sin tocar nada de abajo. Repitiéndola '
    + 'desde la posición adecuada, cada borde acaba mirando a su color.',
  'Baile de esquinas':
    'Intercambia tres esquinas de arriba dejando quieta la que ya está en su rincón. '
    + 'Todavía pueden quedar giradas: eso se arregla en el último paso.',
  'Trae la siguiente esquina al frente':
    'Esta esquina ya tiene el amarillo arriba. Giramos sólo la cara de arriba para traer la '
    + 'siguiente que esté mal, sin tocar nada más.',
  'Gira la esquina (repite hasta que el amarillo mire arriba)':
    'Estos cuatro giros voltean la esquina de delante-derecha un poquito. El cubo se desordena '
    + 'por abajo: es normal y volverá solo cuando todas las esquinas estén giradas.',
  'Y ya está: recoloca la capa de arriba':
    'Último giro para alinear la capa de arriba con el resto. El cubo queda resuelto.',
  'Gira la cara de arriba': 'Ajustamos la cara de arriba para colocar las piezas en la posición que necesita la fórmula.',
  'Solo falta girar arriba': 'Todo está en su sitio; sólo falta alinear la última capa.',
};

export function detalleDe(hint) { return DETALLES[hint] || ''; }
