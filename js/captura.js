// ============================================================
//  captura.js — Apuntar lo que dice un cubo que no entendemos
// ============================================================
//  La app sólo sabe hablar con los Xiaomi/GiiKER. Para un GAN, un
//  MoYu o un QiYi haría falta escribir su decodificador, y eso no
//  se puede hacer a ciegas: hay que ver qué manda un cubo de
//  verdad al dar un giro que se sabe cuál es.
//
//  Esto es justo eso, y nada más: se apunta cada aviso que llega
//  con la hora a la que llegó, y se junta con el guion de giros
//  que se pidió hacer. Unos bytes sueltos no dicen nada; unos
//  bytes con "esto salió al girar la cara de arriba" lo dicen
//  todo.
//
//  Aquí no se toca el DOM ni el Bluetooth: entra lo que llega y
//  sale un texto. Así se prueba en Node (test/captura.js).
// ============================================================

/**
 * Los giros que se piden, en orden.
 *
 * Las seis caras, en los dos sentidos, y dos dobles al final. Y
 * está montado a propósito para que el conjunto NO cambie el cubo:
 * cada giro se deshace con el siguiente. Así quien graba tiene una
 * comprobación que no depende de nosotros —si al terminar el cubo
 * no está resuelto, es que se saltó un giro y hay que repetirlo—,
 * y quien lea el volcado sabe que el último paquete describe otra
 * vez el cubo resuelto.
 */
export const GUION = [
  { face: 'U', amount: 1 }, { face: 'U', amount: 3 },
  { face: 'R', amount: 1 }, { face: 'R', amount: 3 },
  { face: 'F', amount: 1 }, { face: 'F', amount: 3 },
  { face: 'D', amount: 1 }, { face: 'D', amount: 3 },
  { face: 'L', amount: 1 }, { face: 'L', amount: 3 },
  { face: 'B', amount: 1 }, { face: 'B', amount: 3 },
  { face: 'U', amount: 2 }, { face: 'U', amount: 2 },
  { face: 'R', amount: 2 }, { face: 'R', amount: 2 },
];

/** Cuántos avisos se guardan como mucho, para no llenar la memoria */
export const TOPE = 600;

/** Bytes en hexadecimal, como se leen: `a1 3f 00 …` */
export function hex(bytes) {
  return Array.from(bytes || []).map((b) => b.toString(16).padStart(2, '0')).join(' ');
}

/**
 * Empieza una grabación.
 * @param {object} info  { aparato, navegador, servicios, guion }
 * @param {number} t0  el reloj al empezar; los avisos se apuntan relativos a él
 */
export function nuevaCaptura(info, t0 = 0) {
  return { info: info || {}, t0, avisos: [], perdidos: 0 };
}

/**
 * Apunta un aviso. Devuelve false cuando ya no caben más: la grabación
 * sigue viva (el contador de perdidos lo dice en el volcado) pero deja
 * de crecer, que es mejor que quedarse sin memoria a media prueba.
 */
export function anotar(cap, aviso) {
  if (!cap || !aviso || !aviso.bytes || !aviso.bytes.length) return false;
  if (cap.avisos.length >= TOPE) { cap.perdidos++; return false; }
  cap.avisos.push({
    ms: Math.max(0, Math.round((aviso.t || 0) - cap.t0)),
    char: aviso.char || '?',
    bytes: Array.from(aviso.bytes),
  });
  return true;
}

/** Los giros del guion en notación, numerados: `1 U   2 U'   3 R …` */
export function guionEnTexto(guion = GUION) {
  return guion
    .map((m, i) => (i + 1) + ' ' + m.face + (m.amount === 2 ? '2' : m.amount === 3 ? "'" : ''))
    .join('   ');
}

/**
 * El volcado, listo para pegar en una incidencia. Va todo en un texto
 * plano y con comentarios en castellano porque lo va a copiar una
 * persona, no un programa: si hace falta, se lee a ojo.
 */
export function volcado(cap) {
  if (!cap) return '';
  const i = cap.info || {};
  const L = [];
  L.push('# Mi Cubo Mágico · volcado de un cubo');
  L.push('# Pégalo tal cual en https://github.com/aperaltaservan/mi-cubo-magico/issues');
  L.push('#');
  L.push('# aparato:   ' + (i.aparato || '?'));
  L.push('# navegador: ' + (i.navegador || '?'));
  L.push('# servicios visibles:');
  const servicios = i.servicios || [];
  if (!servicios.length) L.push('#   (ninguno; el navegador sólo deja ver los que la app pide)');
  for (const s of servicios) {
    L.push('#   ' + s.service);
    for (const c of s.chars || []) L.push('#     ' + c);
  }
  L.push('#');
  L.push('# El cubo partía de RESUELTO y se hicieron estos giros, en este orden,');
  L.push('# esperando un segundo entre uno y el siguiente:');
  L.push('#   ' + guionEnTexto(i.guion || GUION));
  L.push('# El guion no cambia el cubo: al terminar tenía que estar resuelto otra vez.');
  L.push('#');
  L.push('# ms = milisegundos desde que se empezó a grabar');
  L.push('# ms      característica                        bytes');
  if (!cap.avisos.length) {
    L.push('(ningún aviso: el cubo no dijo nada, o el navegador no deja ver su servicio)');
  }
  for (const a of cap.avisos) {
    L.push(String(a.ms).padStart(7) + '  ' + String(a.char).padEnd(38) + '  ' + hex(a.bytes));
  }
  if (cap.perdidos) L.push('(' + cap.perdidos + ' avisos más, no guardados: se llegó al tope)');
  return L.join('\n');
}
