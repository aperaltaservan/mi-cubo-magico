// ============================================================
//  myalgs.js — Tus algoritmos
// ============================================================
//  Cada caso trae uno o dos algoritmos de serie, pero puedes
//  anadir los tuyos (escribiendolos o GRABANDOLOS con el cubo)
//  y elegir cual quieres usar por defecto.
//
//  Nada se guarda sin comprobarlo antes: un algoritmo solo se
//  acepta si de verdad resuelve su caso.
// ============================================================

import { expandAlg, algToString, simplifyAlg, moveToString } from './cube.js';

const CLAVE = 'cubo-magico-misalgs-v1';

let datos = null;

function cargar() {
  if (datos) return datos;
  try { datos = JSON.parse(localStorage.getItem(CLAVE) || '{}'); }
  catch (e) { datos = {}; }
  return datos;
}
function guardar() {
  try { localStorage.setItem(CLAVE, JSON.stringify(datos)); } catch (e) { /* nada */ }
}
function ficha(kind, id) {
  const d = cargar();
  const k = kind + ':' + id;
  if (!d[k]) d[k] = { propios: [], elegido: 0 };
  return d[k];
}

/** Todos los algoritmos de un caso: los de serie y los tuyos */
import { t } from './i18n.js';

export function algsDe(kind, caso) {
  const f = ficha(kind, caso.id);
  const serie = [caso.alg, ...(caso.alt || [])].filter(Boolean);
  return [
    ...serie.map((alg) => ({ alg, propio: false })),
    ...f.propios.map((alg) => ({ alg, propio: true })),
  ];
}

/** Cual esta elegido como preferido (indice dentro de algsDe) */
export function indiceElegido(kind, caso) {
  const f = ficha(kind, caso.id);
  const total = algsDe(kind, caso).length;
  return Math.min(Math.max(0, f.elegido | 0), total - 1);
}

/** El algoritmo que usa la app para este caso */
export function algElegido(kind, caso) {
  const lista = algsDe(kind, caso);
  return lista[indiceElegido(kind, caso)].alg;
}

export function elegir(kind, caso, indice) {
  ficha(kind, caso.id).elegido = indice;
  guardar();
}

/**
 * Comprueba un algoritmo antes de aceptarlo.
 * `resuelve` viene de fuera (algs.js) para no cruzar importaciones.
 */
export function validar(algTexto, caso, kind, resuelve) {
  const limpio = String(algTexto).trim();
  if (!limpio) return { ok: false, error: t('No has escrito nada.') };
  let movs;
  try { movs = expandAlg(limpio); }
  catch (e) {
    return { ok: false, error: t('No entiendo "{que}".', { que: e.message.split(': ')[1] }) };
  }
  if (!movs.length) return { ok: false, error: t('Ese algoritmo no mueve nada.') };
  if (movs.length > 40) return { ok: false, error: t('Demasiado largo (más de 40 giros).') };
  if (!resuelve(limpio, caso, kind)) {
    return { ok: false, error: t('Ese algoritmo no resuelve este caso. Compruébalo.') };
  }
  return { ok: true, alg: limpio };
}

export function anadir(kind, caso, alg) {
  const f = ficha(kind, caso.id);
  const serie = [caso.alg, ...(caso.alt || [])].filter(Boolean);
  if (serie.includes(alg) || f.propios.includes(alg)) {
    return { ok: false, error: t('Ese algoritmo ya está en la lista.') };
  }
  f.propios.push(alg);
  f.elegido = serie.length + f.propios.length - 1;   // el nuevo pasa a ser el preferido
  guardar();
  return { ok: true };
}

export function borrar(kind, caso, alg) {
  const f = ficha(kind, caso.id);
  const i = f.propios.indexOf(alg);
  if (i < 0) return false;
  f.propios.splice(i, 1);
  const serie = [caso.alg, ...(caso.alt || [])].filter(Boolean).length;
  if (f.elegido >= serie + f.propios.length) f.elegido = 0;
  guardar();
  return true;
}

/**
 * Limpia un algoritmo recien grabado: junta giros de la misma cara y
 * quita los giros de ajuste del principio y del final, que dependen de
 * como haya caido la mezcla y no forman parte del algoritmo.
 */
export function limpiarGrabacion(movs) {
  let lista = simplifyAlg(movs);
  while (lista.length && lista[0].face === 'U') lista = lista.slice(1);
  while (lista.length && lista[lista.length - 1].face === 'U') lista = lista.slice(0, -1);
  return algToString(lista);
}

export function borrarTodo() {
  datos = {};
  guardar();
}

export { moveToString };
