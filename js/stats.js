// ============================================================
//  stats.js — Tiempos y medias al estilo WCA
// ============================================================
//  Reglas de la WCA que se aplican aqui:
//   - Penalizacion +2: se suman 2 segundos al tiempo.
//   - DNF: no cuenta como tiempo; en una media es el peor.
//   - Media de N (ao5, ao12...): se quitan el mejor y el peor y
//     se promedia el resto. Con dos o mas DNF, la media es DNF.
//   - Mean de N (mo3): promedio de todos; un DNF la anula.
// ============================================================

export const DNF = 'DNF';

/** Tiempo efectivo de un intento: numero de ms, o Infinity si es DNF */
export function effective(solve) {
  if (!solve || solve.penalty === DNF) return Infinity;
  return solve.ms + (solve.penalty === 2 ? 2000 : 0);
}

export function formatTime(ms) {
  if (ms === Infinity || ms === null || ms === undefined) return 'DNF';
  const cs = Math.floor(ms / 10);
  const s = Math.floor(cs / 100);
  const centesimas = String(cs % 100).padStart(2, '0');
  if (s < 60) return s + '.' + centesimas;
  const m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2, '0') + '.' + centesimas;
}

export function formatSolve(solve) {
  if (!solve) return '—';
  if (solve.penalty === DNF) return 'DNF(' + formatTime(solve.ms) + ')';
  return formatTime(effective(solve)) + (solve.penalty === 2 ? '+' : '');
}

/** Media WCA de los N ultimos intentos (quitando mejor y peor) */
export function average(solves, n) {
  if (!solves || solves.length < n) return null;
  const ventana = solves.slice(-n).map(effective);
  const dnfs = ventana.filter((t) => t === Infinity).length;
  if (dnfs > 1) return Infinity;
  const ordenados = ventana.slice().sort((a, b) => a - b);
  const centro = ordenados.slice(1, -1);
  return centro.reduce((a, b) => a + b, 0) / centro.length;
}

/** Media aritmetica de los N ultimos (un DNF la anula) */
export function mean(solves, n) {
  if (!solves || solves.length < n) return null;
  const ventana = solves.slice(-n).map(effective);
  if (ventana.some((t) => t === Infinity)) return Infinity;
  return ventana.reduce((a, b) => a + b, 0) / ventana.length;
}

/** La mejor media de N que se ha hecho en toda la sesion */
export function bestAverage(solves, n) {
  if (!solves || solves.length < n) return null;
  let best = null;
  for (let i = n; i <= solves.length; i++) {
    const a = average(solves.slice(0, i), n);
    if (a !== null && a !== Infinity && (best === null || a < best)) best = a;
  }
  return best;
}

export function bestSolve(solves) {
  const validos = solves.filter((s) => effective(s) !== Infinity);
  if (!validos.length) return null;
  return validos.reduce((a, b) => (effective(a) <= effective(b) ? a : b));
}

export function worstSolve(solves) {
  const validos = solves.filter((s) => effective(s) !== Infinity);
  if (!validos.length) return null;
  return validos.reduce((a, b) => (effective(a) >= effective(b) ? a : b));
}

/** Resumen completo de una sesion */
export function summary(solves) {
  const validos = solves.filter((s) => effective(s) !== Infinity);
  return {
    total: solves.length,
    validos: validos.length,
    mejor: bestSolve(solves),
    peor: worstSolve(solves),
    media: validos.length
      ? validos.reduce((a, s) => a + effective(s), 0) / validos.length : null,
    mo3: mean(solves, 3),
    ao5: average(solves, 5),
    ao12: average(solves, 12),
    ao50: average(solves, 50),
    ao100: average(solves, 100),
    mejorAo5: bestAverage(solves, 5),
    mejorAo12: bestAverage(solves, 12),
  };
}

// ------------------------------------------------------------
//  Guardado en el navegador
// ------------------------------------------------------------
const CLAVE = 'cubo-magico-tiempos-v1';

export function loadSessions() {
  try {
    const d = JSON.parse(localStorage.getItem(CLAVE) || 'null');
    if (d && d.sesiones && d.sesiones.length) return d;
  } catch (e) { /* nada */ }
  return { actual: 0, sesiones: [{ nombre: 'Sesión 1', solves: [] }] };
}

export function saveSessions(data) {
  try { localStorage.setItem(CLAVE, JSON.stringify(data)); } catch (e) { /* nada */ }
}

/**
 * Penalización de la inspección según la WCA: hasta 15 s nada,
 * entre 15 y 17 s son +2 segundos, y a partir de 17 s es DNF.
 * Se calcula del tiempo transcurrido, no del bucle de dibujo: así vale
 * aunque el navegador deje de refrescar (pantalla apagada, otra pestaña...).
 */
export function inspectionPenalty(segundos) {
  if (segundos > 17) return DNF;
  if (segundos > 15) return 2;
  return 0;
}
