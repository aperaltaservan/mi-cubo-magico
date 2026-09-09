// ============================================================
//  patrones.js — Dibujos que se pueden hacer con el cubo
// ============================================================
//  Todos parten del cubo RESUELTO. La app comprueba antes que lo
//  esté y, si no, te guía para dejarlo así.
//
//  Cada algoritmo se verifica en test/patrones.js: que se
//  entienda, que deje un cubo válido, que no lo deje resuelto y
//  que no repita otro patrón. Los que tienen una forma que se
//  puede describir con una regla (damero, puntos, superflip)
//  se comprueban además contra esa regla.
//
//  La miniatura de cada patrón no está dibujada a mano: se
//  calcula aplicando el algoritmo, así que lo que ves es
//  exactamente lo que te va a salir.
// ============================================================

export const PATRONES = [
  {
    id: 'damero', nombre: 'Damero', emoji: '🏁',
    desc: 'Las seis caras a cuadros, como un tablero de ajedrez.',
    dificultad: 1,
    alg: 'M2 E2 S2',
  },
  {
    id: 'cuatro-puntos', nombre: 'Cuatro puntos', emoji: '⚫',
    desc: 'Cuatro caras con un lunar en el centro.',
    dificultad: 1,
    alg: "F2 B2 U D' R2 L2 U D'",
  },
  {
    id: 'seis-puntos', nombre: 'Seis puntos', emoji: '🎲',
    desc: 'Las seis caras con un lunar en medio, como un dado.',
    dificultad: 1,
    alg: "U D' R L' F B' U D'",
  },
  {
    id: 'cruz', nombre: 'Las cruces', emoji: '➕',
    desc: 'Una cruz de otro color en cuatro caras.',
    dificultad: 1,
    alg: 'U2 R2 L2 U2 R2 L2',
  },
  {
    id: 'tetris', nombre: 'Tetris', emoji: '🧱',
    desc: 'Las caras partidas en dos mitades, como piezas encajadas.',
    dificultad: 1,
    alg: "L R F B U' D' L' R'",
  },
  {
    id: 'cubo-en-cubo', nombre: 'Cubo dentro del cubo', emoji: '📦',
    desc: 'Parece que hay un cubo pequeño metido en una esquina.',
    dificultad: 2,
    alg: "F L F U' R U F2 L2 U' L' B D' B' L2 U",
  },
  {
    id: 'cubo-en-cubo-en-cubo', nombre: 'Cubo, cubo y cubo', emoji: '🎁',
    desc: 'Tres cubos metidos uno dentro de otro.',
    dificultad: 3,
    alg: "U' L' U' F' R2 B' R F U B2 U B' L U' F U R F'",
  },
  {
    id: 'anaconda', nombre: 'Anaconda', emoji: '🐍',
    desc: 'Una serpiente que da la vuelta al cubo.',
    dificultad: 2,
    alg: "L U B' U' R L' B R' F B' D R D' F'",
  },
  {
    id: 'python', nombre: 'Pitón', emoji: '🐉',
    desc: 'Otra serpiente, hermana de la anaconda.',
    dificultad: 2,
    alg: "F2 R' B' U R' L F' L F' B D' R B L2",
  },
  {
    id: 'mamba', nombre: 'Mamba negra', emoji: '🖤',
    desc: 'La tercera serpiente de la familia.',
    dificultad: 2,
    alg: "R U B' U' R L' B R' F B' D R D' F'",
  },
  {
    id: 'rayas', nombre: 'Rayas', emoji: '🦓',
    desc: 'El cubo a rayas de arriba abajo.',
    dificultad: 3,
    alg: "F U F R L2 B D' R D2 L D' B R2 L F U F",
  },
  {
    id: 'superflip', nombre: 'Superflip', emoji: '🌀',
    desc: 'Las esquinas en su sitio y todos los bordes del revés. '
      + 'El más famoso: es de los cubos más difíciles de resolver que existen.',
    dificultad: 3,
    alg: "U R2 F B R B2 R U2 L B2 R U' D' R2 F R' L B2 U2 F2",
  },
];

export function patronPorId(id) { return PATRONES.find((p) => p.id === id) || null; }
