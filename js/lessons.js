// ============================================================
//  lessons.js — Tutorial guiado del metodo principiante
// ============================================================
//  Cada leccion explica un paso, ensena la formula moviendo el
//  cubo de la pantalla, y luego se practica con el cubo de verdad.
//  El `check` dice cuando la leccion esta conseguida.
// ============================================================

import { CROSS_DONE, F1_DONE, F2L_DONE, U_CROSS, OLL_DONE, pairsDone } from './algs.js';
import { EDGES, CORNERS, edgeSolved, cornerSolved, isSolved, applyMove } from './cube.js';

const SIDES = ['F', 'R', 'B', 'L'];
const U_EDGE = { F: 'UF', R: 'UR', B: 'UB', L: 'UL' };
const U_CORNER = { F: 'URF', R: 'UBR', B: 'ULB', L: 'UFL' };

const petals = (s) => SIDES.filter((X) => s[EDGES[U_EDGE[X]][0]] === 'D').length;
const cornersPlaced = (s) => SIDES.filter((X) => {
  const t = CORNERS[U_CORNER[X]];
  return [s[t[0]], s[t[1]], s[t[2]]].slice().sort().join('')
    === U_CORNER[X].split('').sort().join('');
}).length;

export const LESSONS = [
  {
    id: 'daisy', emoji: '🌼', title: 'La margarita',
    idea: 'Reunir arriba las cuatro piezas blancas de los bordes.',
    texto: [
      'Coge el cubo con el <b>amarillo arriba</b> y el <b>blanco abajo</b>. Así vas a trabajar siempre.',
      'Busca las cuatro piezas de <b>dos colores</b> que tienen blanco. Hay que subirlas arriba, ' +
      'alrededor del centro amarillo, con el <b>blanco mirando al techo</b>.',
      'Queda una flor: el centro amarillo es el corazón y las cuatro piezas blancas los pétalos.',
    ],
    truco: 'Si una pieza blanca está arriba pero con el blanco de lado, gira esa cara para sacarla y vuelve a intentarlo.',
    demo: null,
    // Si la cruz ya esta hecha, este paso sobra: no hay que deshacerla.
    check: (s) => petals(s) === 4 || CROSS_DONE(s),
    progreso: (s) => (CROSS_DONE(s) ? 1 : petals(s) / 4),
    hecho: 'Ya tienes la margarita',
  },
  {
    id: 'cross', emoji: '⬇️', title: 'Bajar los pétalos',
    idea: 'Convertir la margarita en la cruz blanca de abajo.',
    texto: [
      'Mira un pétalo: además del blanco tiene <b>otro color</b> en el lado.',
      'Gira la cara de arriba hasta que ese color quede <b>justo encima del centro de su mismo color</b>.',
      'Ahora gira esa cara <b>dos vueltas enteras</b> y el pétalo baja a su sitio.',
      'Repite con los cuatro. Al terminar tienes una cruz blanca abajo y los lados cuadran con los centros.',
    ],
    truco: 'Si bajas un pétalo sin hacer coincidir el color, quedará torcido. Primero el color, luego dos vueltas.',
    demo: 'F2',
    check: CROSS_DONE,
    progreso: (s) => SIDES.filter((X) => edgeSolved(s, { F: 'DF', R: 'DR', B: 'DB', L: 'DL' }[X])).length / 4,
    hecho: 'Cruz blanca terminada',
  },
  {
    id: 'corners1', emoji: '🧱', title: 'Las esquinas de abajo',
    idea: 'Completar la primera capa con el movimiento mágico.',
    texto: [
      'Busca una <b>esquina con blanco</b> que esté en la capa de arriba.',
      'Gíra la cara de arriba hasta ponerla <b>justo encima del hueco donde le toca</b>: ' +
      'sus otros dos colores tienen que coincidir con los dos centros de al lado.',
      'Ahora repite el <b>movimiento mágico</b> hasta que la esquina caiga en su sitio. ' +
      'A veces hace falta repetirlo cinco veces: no pasa nada, es normal.',
    ],
    truco: 'Si una esquina blanca está abajo pero mal puesta, haz el movimiento mágico una vez para sacarla y vuelve a empezar con ella.',
    demo: "R U R' U'",
    demoNombre: 'El movimiento mágico',
    check: F1_DONE,
    progreso: (s) => (CROSS_DONE(s) ? 0.5 + SIDES.filter((X) => cornerSolved(s, { F: 'DFR', R: 'DRB', B: 'DBL', L: 'DLF' }[X])).length / 8 : 0),
    hecho: 'Primera capa completa',
  },
  {
    id: 'middle', emoji: '🎀', title: 'El cinturón',
    idea: 'Colocar las cuatro piezas de la capa del medio.',
    texto: [
      'Da la vuelta mentalmente: ahora trabajamos la <b>capa de en medio</b>.',
      'Busca arriba una pieza de borde <b>que no tenga amarillo</b>. Gira arriba hasta que su color ' +
      'de delante coincida con el centro de esa cara: se forma una <b>T</b>.',
      'Mira el color de arriba de esa pieza: si señala a la <b>derecha</b>, usa la fórmula de la derecha; ' +
      'si señala a la <b>izquierda</b>, la de la izquierda.',
    ],
    truco: 'Si no queda arriba ninguna pieza sin amarillo, haz la fórmula de la derecha en un hueco mal puesto para sacar la pieza que estorba.',
    demo: "U R U' R' U' F' U F",
    demoNombre: 'Fórmula de la derecha',
    demo2: "U' L' U L U F U' F'",
    demo2Nombre: 'Fórmula de la izquierda',
    check: F2L_DONE,
    progreso: (s) => (F1_DONE(s) ? 0.5 + pairsDone(s) / 8 : 0),
    hecho: 'Dos capas terminadas',
  },
  {
    id: 'cross2', emoji: '⭐', title: 'La cruz amarilla',
    idea: 'Dibujar la cruz amarilla en el techo.',
    texto: [
      'Mira sólo la cara de arriba. Verás una de estas tres formas: un <b>punto</b>, ' +
      'una <b>L</b> o una <b>línea</b>.',
      'Con la <b>línea</b>: ponla horizontal y haz la fórmula una vez.',
      'Con la <b>L</b>: colócala mirando arriba y a la izquierda, y haz la fórmula.',
      'Con el <b>punto</b>: haz la fórmula y saldrá una L o una línea; luego sigue.',
    ],
    truco: 'Es siempre la misma fórmula. Lo único que cambia es cómo colocas el cubo antes.',
    demo: "F R U R' U' F'",
    demoNombre: 'Fórmula de la cruz',
    check: U_CROSS,
    progreso: (s) => SIDES.filter((X) => s[EDGES[U_EDGE[X]][0]] === 'U').length / 4,
    hecho: 'Cruz amarilla hecha',
  },
  {
    id: 'plle', emoji: '🏁', title: 'Colocar los bordes',
    idea: 'Que cada borde de arriba mire a su color.',
    texto: [
      'Gira la cara de arriba hasta que <b>al menos un borde</b> coincida con el centro de su cara.',
      'Si coinciden los cuatro, este paso ya está.',
      'Si no, pon el que ya coincide <b>detrás</b> y haz la fórmula. Puede que haga falta repetirla.',
    ],
    truco: 'Este paso va antes que las esquinas. Si lo haces al revés, las esquinas pueden quedar imposibles de colocar.',
    demo: "R U' R U R U R U' R' U' R2",
    demoNombre: 'Fórmula de los bordes',
    check: (s) => SIDES.every((X) => edgeSolved(s, U_EDGE[X])),
    progreso: (s) => SIDES.filter((X) => edgeSolved(s, U_EDGE[X])).length / 4,
    hecho: 'Bordes colocados',
  },
  {
    id: 'pllc', emoji: '📍', title: 'Colocar las esquinas',
    idea: 'Llevar cada esquina a su rincón, aunque quede girada.',
    texto: [
      'Mira las cuatro esquinas de arriba. Busca una que esté <b>en su rincón</b>: ' +
      'sus tres colores son los de las tres caras que toca, aunque estén del revés.',
      'Pon esa esquina <b>delante y a la derecha</b> y haz la fórmula. Las otras tres bailan.',
      'Si no hay ninguna en su sitio, haz la fórmula una vez desde donde sea y aparecerá una.',
    ],
    truco: 'Aquí no importa que estén giradas. Sólo que cada una esté en su rincón.',
    demo: "U R U' L' U R' U' L",
    demoNombre: 'Baile de esquinas',
    check: (s) => cornersPlaced(s) === 4,
    progreso: (s) => cornersPlaced(s) / 4,
    hecho: 'Esquinas en su sitio',
  },
  {
    id: 'ollc', emoji: '🔄', title: 'Girar las esquinas',
    idea: 'El último paso: poner el amarillo hacia arriba.',
    texto: [
      'Pon una esquina que tenga el amarillo <b>de lado</b> en la posición de delante-derecha.',
      'Repite la fórmula hasta que esa esquina tenga el <b>amarillo arriba</b>. Serán dos o cuatro veces.',
      '<b>El cubo se va a desordenar por abajo. No lo arregles.</b> Es normal y se coloca solo.',
      'Cuando la esquina esté bien, gira <b>sólo la cara de arriba</b> para traer la siguiente y repite.',
      'Al colocar la última, el cubo entero se resuelve como por arte de magia.',
    ],
    truco: 'Entre esquina y esquina sólo se gira la cara de arriba. Si giras otra cosa, se rompe el truco.',
    demo: "R' D' R D",
    demoNombre: 'Girar la esquina',
    check: isSolved,
    progreso: (s) => SIDES.filter((X) => s[CORNERS[U_CORNER[X]][0]] === 'U').length / 4,
    hecho: '¡Cubo resuelto!',
  },
];

export function lessonById(id) { return LESSONS.find((l) => l.id === id); }

/** Que leccion toca segun como este el cubo */
export function nextLesson(state) {
  return LESSONS.find((l) => !l.check(state)) || LESSONS[LESSONS.length - 1];
}
