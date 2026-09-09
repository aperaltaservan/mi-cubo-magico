// ============================================================
//  i18n.js — La app en español y en inglés
// ============================================================
//  La clave de cada texto es el propio texto en español. No hay
//  que inventarse nombres ('home.subtitulo' y cosas así) y el
//  código se sigue leyendo: t('Gira una cara') dice lo que hace.
//  El diccionario de textos.js sólo lleva la traducción inglesa.
//
//  En el HTML se marca con data-i18n el elemento cuyo contenido
//  hay que traducir, sin escribir la clave: la clave es lo que ya
//  pone dentro. Para los atributos, data-i18n-title.
//
//  Si falta una traducción se ve el español y se avisa por la
//  consola, que es mejor que enseñar una clave suelta o un hueco.
// ============================================================

import { EN } from './textos.js';

const CLAVE = 'cubo-magico-idioma';
export const IDIOMAS = {
  es: { nombre: 'Español', bandera: '🇪🇸', voz: 'es-ES' },
  en: { nombre: 'English', bandera: '🇬🇧', voz: 'en-US' },
};

/** Espacios y saltos de línea del HTML no cuentan para buscar la clave */
const normalizar = (s) => String(s).trim().replace(/\s+/g, ' ');

const faltan = new Set();
let actual = detectar();

function detectar() {
  try {
    const guardado = localStorage.getItem(CLAVE);
    if (guardado && IDIOMAS[guardado]) return guardado;
  } catch (e) { /* navegador sin almacenamiento */ }
  const nav = (typeof navigator !== 'undefined' && navigator.language) || 'es';
  return String(nav).toLowerCase().startsWith('en') ? 'en' : 'es';
}

export function idioma() { return actual; }

export function fijarIdioma(codigo) {
  if (!IDIOMAS[codigo]) return false;
  actual = codigo;
  try { localStorage.setItem(CLAVE, codigo); } catch (e) { /* da igual */ }
  if (typeof document !== 'undefined') {
    document.documentElement.lang = codigo;
    traducirDOM();
  }
  return true;
}

/**
 * Traduce un texto. La clave es el español.
 * @param {string} es  el texto tal cual en español
 * @param {object} [vars]  valores para los huecos {nombre}
 */
export function t(es, vars) {
  if (!es) return es;
  let salida = es;
  if (actual !== 'es') {
    const clave = normalizar(es);
    const trad = EN[clave];
    // Sin traducción se enseña el español. No se avisa por consola: hay
    // textos que no la necesitan (los nombres de los casos ya están en
    // inglés: "Sune", "OLL 21 · Double Headlights") y llenarían la
    // consola de ruido. De que no falte ninguno de los que sí hacen
    // falta se encarga test/i18n.js, que los saca del propio código.
    if (trad === undefined) faltan.add(clave);
    else salida = trad;
  }
  if (!vars) return salida;
  return salida.replace(/\{(\w+)\}/g, (todo, k) =>
    (vars[k] === undefined ? todo : vars[k]));
}

/** Lo que se ha pedido y no estaba traducido (para depurar: cubo.sinTraducir()) */
export function sinTraducir() { return [...faltan]; }

/**
 * Traduce el HTML ya escrito. Guarda el español original la primera
 * vez, para poder volver a él al cambiar de idioma.
 */
export function traducirDOM(raiz) {
  const donde = raiz || document;
  for (const el of donde.querySelectorAll('[data-i18n]')) {
    if (el.dataset.es === undefined) el.dataset.es = el.innerHTML;
    el.innerHTML = t(el.dataset.es);
  }
  for (const el of donde.querySelectorAll('[data-i18n-title]')) {
    if (el.dataset.esTitle === undefined) el.dataset.esTitle = el.title;
    el.title = t(el.dataset.esTitle);
  }
  for (const el of donde.querySelectorAll('[data-i18n-label]')) {
    const original = el.getAttribute('aria-label') || '';
    if (el.dataset.esLabel === undefined) el.dataset.esLabel = original;
    el.setAttribute('aria-label', t(el.dataset.esLabel));
  }
}

/** El idioma en el que hay que hablar */
export function locale() { return IDIOMAS[actual].voz; }
