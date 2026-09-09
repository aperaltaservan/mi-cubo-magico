// ============================================================
//  plataforma.js — Saber dónde estamos corriendo
// ============================================================
//  Sólo hace falta para una cosa, pero importa: en iPhone y iPad
//  no hay Bluetooth en el navegador y no lo va a haber. Apple
//  obliga a que todos los navegadores de iOS usen el motor de
//  Safari, así que Chrome y Firefox tampoco pueden.
//
//  Decirle a alguien con un iPhone que abra Chrome, o que ejecute
//  un .bat, no le sirve de nada: hay que reconocerlo y contarle lo
//  que sí puede hacer.
//
//  Va aparte y como función pura para poder probarlo, que es de
//  esas cosas que se rompen en silencio cuando cambian los
//  navegadores.
// ============================================================

/**
 * ¿Es un iPhone o un iPad?
 * @param {string} ua  el user agent
 * @param {number} tactil  puntos táctiles (navigator.maxTouchPoints)
 */
export function esIOS(ua, tactil) {
  const cadena = String(ua || '');
  if (/iPhone|iPad|iPod/i.test(cadena)) return true;
  // El iPad, desde iPadOS 13, se anuncia como un Mac de escritorio.
  // Lo único que lo delata es que tiene pantalla táctil, porque
  // ningún Mac la tiene.
  return /Macintosh/.test(cadena) && Number(tactil) > 1;
}

/** Lo mismo, preguntándoselo al navegador de verdad */
export function enIOS() {
  if (typeof navigator === 'undefined') return false;
  return esIOS(navigator.userAgent, navigator.maxTouchPoints);
}
