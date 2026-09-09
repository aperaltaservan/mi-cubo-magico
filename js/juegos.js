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

import { FACES } from './cube.js';

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
