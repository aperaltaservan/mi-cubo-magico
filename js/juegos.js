// ============================================================
//  juegos.js — Las reglas de los dos juegos de colores
// ============================================================
//  Aquí vive lo que se puede decidir sin pantalla: qué color cae,
//  cuál se apaga al girar una cara, cómo es el camino y a qué ritmo
//  va la cosa. Este fichero no toca el DOM ni sabe del cubo, así que
//  se prueba en Node (test/juegos.js) sin navegador.
//
//  Los dos juegos enseñan lo mismo, que es lo primero que hay que
//  saber del cubo: ver un color y encontrar esa cara. Uno con prisa
//  y otro sin ella, porque a los cuatro años no todos los días se
//  tienen las mismas ganas de correr.
// ============================================================

import { FACES, MOVE_PERM } from './cube.js';

/**
 * Una cara al azar, evitando las que ya estén en juego. Que caigan
 * dos gotas del mismo color a la vez no rompe nada (se apaga la de
 * más abajo), pero para un niño es un lío: mejor que no pase.
 * @param {function(): number} rnd
 * @param {string[]} [evitar]
 */
export function caraAlAzar(rnd, evitar = []) {
  const libres = FACES.filter((f) => !evitar.includes(f));
  const donde = libres.length ? libres : FACES;
  return donde[Math.min(donde.length - 1, (rnd() * donde.length) | 0)];
}

// ------------------------------------------------------------
//  Lluvia de colores
// ------------------------------------------------------------
//  Va acelerando, pero con suelo: por deprisa que se ponga siempre
//  quedan más de dos segundos para reaccionar y las gotas nunca se
//  amontonan más de tres a la vez. Un juego imposible no es difícil,
//  es un juego roto.
export const LLUVIA = {
  caidaInicial: 6000, caidaMinima: 2400,
  esperaInicial: 3000, esperaMinima: 1000,
  vidas: 3, aLaVez: 3,
  // lo más que se deja avanzar de una vez, en milisegundos
  topeFotograma: 200,
};

/**
 * Cuánto tarda en caer una gota y cuánto se espera hasta la siguiente,
 * en milisegundos, según cuántas lleves apagadas.
 * @param {number} apagadas
 * @returns {{caida: number, espera: number}}
 */
export function ritmoLluvia(apagadas) {
  const n = Math.max(0, apagadas | 0);
  return {
    caida: Math.max(LLUVIA.caidaMinima, LLUVIA.caidaInicial - n * 140),
    espera: Math.max(LLUVIA.esperaMinima, LLUVIA.esperaInicial - n * 90),
  };
}

/**
 * Adelanta las gotas un fotograma y devuelve las que han tocado suelo.
 *
 * `dt` viene acotado a propósito. El navegador para los fotogramas cuando
 * la página no se ve (el móvil bloqueado, otra pestaña), pero el reloj
 * sigue corriendo: sin tope, al volver todas las gotas llegarían al suelo
 * de golpe y la partida se habría acabado sola sin que el niño tocara
 * nada. Con tope, una pausa sólo congela el juego.
 *
 * @param {{y: number, caida: number}[]} gotas  se les cambia la `y`
 * @param {number} dt  milisegundos desde el fotograma anterior
 * @returns {object[]} las que acaban de tocar el suelo
 */
export function avanzarGotas(gotas, dt) {
  const paso = Math.min(LLUVIA.topeFotograma, Math.max(0, dt || 0));
  const caidas = [];
  for (const g of gotas) {
    if (g.y >= 1) continue;
    g.y = Math.min(1, g.y + paso / g.caida);
    if (g.y >= 1) caidas.push(g);
  }
  return caidas;
}

/**
 * Qué gota apaga un giro de esa cara: la de ese color que va más abajo,
 * que es la que está a punto de caerse y la que el niño está mirando.
 * @param {{face: string, y: number}[]} gotas  y de 0 (arriba) a 1 (suelo)
 * @param {string} face
 * @returns {number} el índice en `gotas`, o -1 si ninguna es de ese color
 */
export function gotaQueSeApaga(gotas, face) {
  let mejor = -1;
  for (let i = 0; i < gotas.length; i++) {
    if (gotas[i].face !== face) continue;
    if (mejor < 0 || gotas[i].y > gotas[mejor].y) mejor = i;
  }
  return mejor;
}

// ------------------------------------------------------------
//  El caminito
// ------------------------------------------------------------
export const CAMINO = { primero: 8, crece: 2, tope: 16 };

/** Cuántas baldosas tiene el camino número `n` (el primero es el 0) */
export function largoDelCamino(n) {
  return Math.min(CAMINO.tope, CAMINO.primero + Math.max(0, n | 0) * CAMINO.crece);
}

/**
 * Un camino de baldosas de colores. Nunca dos iguales seguidas: si lo
 * fueran, el niño giraría dos veces la misma cara sin saber si ha
 * avanzado, y encima la segunda vuelta desharía la primera.
 * @param {number} largo
 * @param {function(): number} rnd
 * @returns {string[]} las caras, en orden
 */
export function caminoNuevo(largo, rnd = Math.random) {
  const out = [];
  for (let i = 0; i < Math.max(1, largo | 0); i++) {
    out.push(caraAlAzar(rnd, out.length ? [out[out.length - 1]] : []));
  }
  return out;
}

// ------------------------------------------------------------
//  Sigue la estrella
// ------------------------------------------------------------
//  Se marca una pegatina y hay que decir a dónde ha ido después de
//  girar. Es la idea que le falta a un niño que empieza y la que más
//  cuesta: que las piezas no desaparecen ni cambian de color, que se
//  mueven enteras y van a un sitio que se puede seguir con el ojo.
//  Quien entiende eso deja de girar al azar.

/** Las caras que se ven en la pantalla desde la vista de siempre */
export const VISIBLES = ['U', 'F', 'R'];

export function caraDe(i) { return FACES[(i / 9) | 0]; }
export function seVe(i) { return VISIBLES.includes(caraDe(i)); }
export function esCentro(i) { return i % 9 === 4; }

/**
 * Dónde acaba la pegatina `i` después de ese giro.
 *
 * MOVE_PERM está escrita como "lo nuevo de j sale de lo viejo de i", así
 * que para seguir una pegatina hay que leerla al revés: buscar el hueco
 * que se queda con lo que había en `i`.
 */
export function destinoDePegatina(i, face, amount = 1) {
  const perm = MOVE_PERM[face];
  if (!perm) return i;
  let idx = i;
  for (let k = 0; k < ((amount % 4) + 4) % 4; k++) idx = perm.indexOf(idx);
  return idx;
}

/** Una pegatina para marcar: de las que se ven, y nunca un centro */
export function estrellaNueva(rnd = Math.random) {
  const sitios = [];
  for (let i = 0; i < 54; i++) if (seVe(i) && !esCentro(i)) sitios.push(i);
  return sitios[Math.min(sitios.length - 1, (rnd() * sitios.length) | 0)];
}

/**
 * Un giro que mueva la estrella y la deje a la vista. Si la pregunta se
 * pudiera contestar sin mirar —porque la pieza no se mueve, o porque se
 * va detrás y no hay nada que señalar— no es una pregunta.
 */
export function giroParaEstrella(i, rnd = Math.random) {
  const buenos = [];
  for (const face of FACES) {
    for (const amount of [1, 2, 3]) {
      const destino = destinoDePegatina(i, face, amount);
      if (destino !== i && seVe(destino) && !esCentro(destino)) buenos.push({ face, amount });
    }
  }
  if (!buenos.length) return null;
  return buenos[Math.min(buenos.length - 1, (rnd() * buenos.length) | 0)];
}

/**
 * Los señuelos de la pregunta: pegatinas que se ven y que son **del
 * mismo color** que la buena. Si fueran de otro color no habría nada que
 * seguir, bastaría con buscar el único rojo de la pantalla. Si no hay
 * bastantes de ese color se completan con las que sea, que peor es
 * quedarse sin pregunta.
 */
export function senuelos(state, destino, cuantos = 2, rnd = Math.random) {
  const mismos = [], otros = [];
  for (let i = 0; i < 54; i++) {
    if (i === destino || !seVe(i) || esCentro(i)) continue;
    (state[i] === state[destino] ? mismos : otros).push(i);
  }
  const saca = (lista, n) => {
    const copia = lista.slice();
    const out = [];
    while (out.length < n && copia.length) {
      out.push(copia.splice(Math.min(copia.length - 1, (rnd() * copia.length) | 0), 1)[0]);
    }
    return out;
  };
  const elegidos = saca(mismos, cuantos);
  return elegidos.concat(saca(otros, cuantos - elegidos.length));
}

/** Cuántas opciones tiene la pregunta: se van poniendo más con los aciertos */
export function opcionesDeRonda(aciertos) {
  return Math.min(4, 3 + Math.floor(Math.max(0, aciertos) / 5));
}
