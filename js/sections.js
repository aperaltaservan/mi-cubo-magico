// ============================================================
//  sections.js — Tutorial, cronómetro y entrenador de Fridrich
// ============================================================

import {
  solvedState, applyAlg, applyMove, isSolved, randomScramble,
  algToString, expandAlg, moveToString, invertAlg, simplifyAlg,
} from './cube.js';
import {
  SETS, recognise, setupFor, OLL_DONE, F2L_DONE, CROSS_DONE,
  solutionFrom, pairSlotDone, restoDone, resuelveElCaso, mapearAlg,
  estadoDelCaso, pegatinasUltimaCapa, rutaAlCaso,
} from './algs.js';
import { isoCubeSVG } from './cube3d.js';
import { solve } from './solver.js';
import * as mis from './myalgs.js';
import { LESSONS, lessonById, nextLesson } from './lessons.js';
import * as S from './stats.js';
import { t } from './i18n.js';

let ctx = null;
const $ = (s) => document.querySelector(s);
const $$ = (s) => Array.from(document.querySelectorAll(s));

export function init(context) {
  ctx = context;
  initTutorial();
  initTimer();
  initFridrich();
}

/** Aviso de que el cubo ha cambiado de estado */
export function onState(state) {
  if (ctx.app.screen === 'tutorial') renderTutorial();
  if (ctx.app.screen === 'fridrich') renderGuia();
  if (ctx.app.screen === 'timer') timerOnState(state);
  if (ctx.app.screen === 'drill') drillOnState(state);
}

/** Aviso de cambio de pantalla */
export function onScreen(name) {
  if (name === 'tutorial') renderTutorial();
  if (name === 'timer') {
    if (!timer.scramble) nuevaMezcla();
    // al entrar, el crono se prepara segun haya cubo conectado o no
    else if (['idle', 'resolver', 'mezclando', 'listo'].includes(timer.fase)) {
      replantearMezcla();
    }
    renderTimer();
  }
  if (name === 'fridrich') { soltarGuia(); renderFridrich(); }
  // al cambiar de idioma se vuelve a entrar en la pantalla de siempre; el
  // entrenador escribe sus textos desde el codigo, asi que hay que repintarlo
  if (name === 'drill' && drill.caso) renderDrill();
  if (name !== 'timer') timerReset();
}

// ============================================================
//  Utilidades comunes
// ============================================================
const escenas = new Map();
function escena(hostId) {
  if (!escenas.has(hostId)) {
    const host = $('#' + hostId);
    const size = Math.min(46, Math.floor((Math.min(window.innerWidth, 520) - 120) / 3.6));
    escenas.set(hostId, ctx.newScene(host, size));
  }
  const sc = escenas.get(hostId);
  sc.setColors(ctx.hexMap());
  return sc;
}

/** Anima un algoritmo en una escena, movimiento a movimiento */
async function playAlg(sc, alg, desde) {
  if (sc.reproduciendo) return;
  sc.reproduciendo = true;
  let st = desde || solvedState();
  sc.render(st);
  await new Promise((r) => setTimeout(r, 260));
  for (const m of expandAlg(alg)) {
    st = applyMove(st, m.face, m.amount);
    await sc.turn(m.face, m.amount, st, 300);
    await new Promise((r) => setTimeout(r, 60));
  }
  sc.reproduciendo = false;
  return st;
}

function chips(alg) {
  return (Array.isArray(alg) ? alg : expandAlg(alg)).map((m) =>
    `<span style="background:${ctx.hexOf(m.face)};color:#1c1030">${moveToString(m)}</span>`).join('');
}

// ============================================================
//  1. Tutorial guiado
// ============================================================
function initTutorial() {
  $('#tut-curso').onclick = () => { ctx.fx.click(); ctx.startGame('curso'); };
  $('#les-practicar').onclick = () => {
    ctx.fx.click();
    ctx.startGame('curso', leccionActual);
  };
  $('#les-demo').onclick = () => {
    const l = lessonById(leccionActual);
    ctx.fx.click();
    playAlg(escena('les-scene'), l.demo, demoDesde(l.demo));
  };
  $('#les-demo2').onclick = () => {
    const l = lessonById(leccionActual);
    ctx.fx.click();
    playAlg(escena('les-scene'), l.demo2, demoDesde(l.demo2));
  };
}

/** Empieza la demo desde un cubo al que le falta justo ese algoritmo */
function demoDesde(alg) {
  return applyAlg(solvedState(), invertAlg(expandAlg(alg)));
}

let leccionActual = 'daisy';

function renderTutorial() {
  const st = ctx.app.state;
  const box = $('#tut-lista');
  box.innerHTML = '';
  const siguiente = nextLesson(st);
  $('#tut-estado').textContent = isSolved(st)
    ? t('¡Cubo resuelto! Mézclalo para practicar.')
    : t('Vas por: {leccion}', { leccion: siguiente.emoji + ' ' + t(siguiente.title) });
  LESSONS.forEach((l, i) => {
    const hecha = l.check(st);
    const p = Math.round(Math.max(0, Math.min(1, l.progreso(st))) * 100);
    const b = document.createElement('button');
    b.className = 'leccion' + (hecha ? ' hecha' : '');
    b.innerHTML = `<div class="n">${hecha ? '✓' : i + 1}</div>
      <div class="txt"><b>${l.emoji} ${t(l.title)}</b><em>${t(l.idea)}</em>
      <div class="barra"><i style="width:${p}%"></i></div></div>`;
    b.onclick = () => { ctx.fx.click(); abrirLeccion(l.id); };
    box.appendChild(b);
  });
}

function abrirLeccion(id) {
  leccionActual = id;
  const l = lessonById(id);
  $('#les-titulo').textContent = l.emoji + ' ' + t(l.title);
  $('#les-idea').textContent = t(l.idea);
  $('#les-texto').innerHTML = l.texto.map((p) => '<p>' + t(p) + '</p>').join('');
  $('#les-truco').innerHTML = '💡 ' + t(l.truco);
  $('#les-formula').innerHTML = l.demo ? chips(l.demo) : '';
  $('#les-demo').style.display = l.demo ? '' : 'none';
  $('#les-demo').textContent = t('▶️ {nombre}',
    { nombre: t(l.demoNombre || 'Ver el movimiento') });
  $('#les-demo2').style.display = l.demo2 ? '' : 'none';
  if (l.demo2) $('#les-demo2').textContent = t('▶️ {nombre}', { nombre: t(l.demo2Nombre) });
  ctx.go('lesson');
  const sc = escena('les-scene');
  sc.render(l.demo ? demoDesde(l.demo) : ctx.app.state);
  if (l.demo) setTimeout(() => playAlg(sc, l.demo, demoDesde(l.demo)), 350);
}

// ============================================================
//  2. Cronómetro
// ============================================================
//  Con el cubo conectado sigue el guion de una competición:
//
//    mezclando -> aplicas la mezcla y te aviso cuando está bien
//    listo     -> pulsas y empiezan los 15 segundos de inspección
//    inspección-> al PRIMER GIRO arranca el crono (y se acaba la
//                 inspección; si te pasaste, +2 o DNF como en la WCA)
//    corriendo -> para SOLO en cuanto el cubo queda resuelto
//
//  Sin cubo funciona a la manera clásica: barra espaciadora.

const timer = {
  fase: 'idle',        // idle | resolver | mezclando | listo | inspeccion | preparando | armado | corriendo
  scramble: null,
  objetivo: null,
  hist: [],            // giros dados desde que empezaste a mezclar
  fuera: false,        // te has salido de la mezcla
  t0: 0,
  raf: 0,
  inspeccion: true,
  t0insp: 0,
  penalInsp: 0,
  avisos: 0,
  seleccion: -1,
};
let sesiones = null;

function solves() { return sesiones.sesiones[sesiones.actual].solves; }
function guardar() { S.saveSessions(sesiones); }
const conCubo = () => ctx.app.mode === 'state';

function initTimer() {
  sesiones = S.loadSessions();
  $('#tm-nueva').onclick = () => { ctx.fx.click(); nuevaMezcla(); };
  $('#tm-borrar').onclick = () => {
    if (!solves().length) return;
    if (!confirm(t('¿Vaciar la sesión? Se borran {n} tiempos.', { n: solves().length }))) return;
    sesiones.sesiones[sesiones.actual].solves = [];
    guardar(); renderTimer();
  };
  $('#tm-insp').onclick = () => {
    timer.inspeccion = !timer.inspeccion;
    $('#tm-insp').classList.toggle('on', timer.inspeccion);
    ctx.toast(t(timer.inspeccion ? 'Inspección de 15 s activada' : 'Inspección desactivada'));
    renderTimer();
  };
  $$('#tm-penal button').forEach((b) => {
    b.onclick = () => {
      const i = timer.seleccion < 0 ? solves().length - 1 : timer.seleccion;
      if (i < 0) return;
      ctx.fx.click();
      if (b.dataset.pen === 'del') solves().splice(i, 1);
      else solves()[i].penalty = b.dataset.pen === '0' ? 0 : b.dataset.pen === '2' ? 2 : S.DNF;
      timer.seleccion = -1;
      guardar(); renderTimer();
    };
  });

  document.addEventListener('keydown', (e) => {
    if (ctx.app.screen !== 'timer' || e.repeat || e.code !== 'Space') return;
    e.preventDefault(); pulsar();
  });
  document.addEventListener('keyup', (e) => {
    if (ctx.app.screen !== 'timer' || e.code !== 'Space') return;
    e.preventDefault(); soltar();
  });
  // El numero y el boton hacen lo mismo que la barra: se pulsa, se suelta
  // y arranca. Se usa pointerdown/up y no click a proposito, para que el
  // gesto sea el mismo con raton, con dedo y con tecla.
  for (const sel of ['#tm-display', '#tm-arrancar']) {
    const el = $(sel);
    el.addEventListener('pointerdown', (e) => { e.preventDefault(); pulsar(); });
    el.addEventListener('pointerup', (e) => { e.preventDefault(); soltar(); });
    el.addEventListener('pointercancel', () => soltar());
  }
  // El boton no debe responder ademas por su cuenta a la barra ni al Enter:
  // de eso ya se encarga el manejador de arriba y si no contaria dos veces.
  $('#tm-arrancar').addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'Enter') e.preventDefault();
  });
  $('#tm-insp').classList.toggle('on', timer.inspeccion);
}

function nuevaMezcla() {
  cancelAnimationFrame(timer.raf);
  timer.scramble = randomScramble(21);
  timer.objetivo = applyAlg(solvedState(), timer.scramble);
  timer.hist = [];
  timer.fuera = false;
  timer.seleccion = -1;
  timer.penalInsp = 0;
  timer.t0insp = 0;
  timer.avisos = 0;
  // una mezcla oficial se aplica sobre el cubo resuelto: si no lo esta,
  // primero te guio para resolverlo en vez de dejarte esperando
  timer.fase = !conCubo() ? 'idle'
    : (isSolved(ctx.app.state) ? 'mezclando' : 'resolver');
  renderTimer();
}

function timerReset() {
  cancelAnimationFrame(timer.raf);
  if (['corriendo', 'armado', 'preparando', 'inspeccion'].includes(timer.fase)) {
    timer.penalInsp = 0;
    timer.t0insp = 0;
    if (conCubo()) replantearMezcla(); else timer.fase = 'idle';
  }
}

// --- pulsaciones (sin cubo, y para arrancar la inspección con cubo) -----
function pulsar() {
  if (timer.fase === 'corriendo') { if (!conCubo()) parar(); return; }

  if (conCubo()) {
    if (timer.fase === 'listo' && timer.inspeccion) empezarInspeccion();
    return;
  }
  if (timer.fase === 'idle' && timer.inspeccion) { empezarInspeccion(); return; }
  timer.fase = 'preparando';
  renderTimer();
  clearTimeout(timer.armar);
  timer.armar = setTimeout(() => {
    if (timer.fase === 'preparando') { timer.fase = 'armado'; ctx.fx.tone(520, 0.06, 'sine', 0.1); renderTimer(); }
  }, 400);
}

function soltar() {
  if (conCubo()) return;
  clearTimeout(timer.armar);
  if (timer.fase === 'armado') { arrancar(); return; }
  if (timer.fase === 'preparando') {
    // si te arrepientes a medias vuelves a la inspeccion, no al principio:
    // los quince segundos siguen corriendo aunque sueltes la barra
    timer.fase = timer.t0insp ? 'inspeccion' : 'idle';
    renderTimer();
    if (timer.t0insp) tick();
  }
}

function empezarInspeccion() {
  timer.fase = 'inspeccion';
  timer.t0insp = performance.now();
  timer.penalInsp = 0;
  timer.avisos = 0;
  ctx.fx.tone(440, 0.09, 'sine', 0.12);
  ctx.fx.say(t('Inspección'));
  renderTimer();
  tick();
}

function arrancar() {
  // La penalización se calcula aquí, del tiempo real transcurrido, no del
  // bucle de dibujo: si el navegador deja de refrescar, seguiría valiendo.
  // Se mira el reloj de la inspeccion, no la fase: sin cubo, pulsar para
  // armar el crono ya ha sacado al timer de la fase 'inspeccion', y
  // mirando la fase el +2 y el DNF no se ponian nunca.
  if (timer.t0insp) {
    timer.penalInsp = S.inspectionPenalty((performance.now() - timer.t0insp) / 1000);
    timer.t0insp = 0;
  }
  timer.fase = 'corriendo';
  timer.t0 = performance.now();
  ctx.fx.tone(880, 0.08, 'sine', 0.12);
  renderTimer();
  tick();
}

function parar() {
  cancelAnimationFrame(timer.raf);
  const ms = performance.now() - timer.t0;
  timer.fase = 'idle';
  const penalty = timer.penalInsp || 0;
  solves().push({
    ms: Math.round(ms), penalty,
    scramble: algToString(timer.scramble), fecha: Date.now(),
  });
  guardar();
  ctx.fx.good();
  if (penalty === 2) ctx.toast(t('Inspección pasada de 15 s: +2'));
  else if (penalty === S.DNF) ctx.toast(t('Inspección pasada de 17 s: DNF'));

  const s = solves();
  const ao5 = S.average(s, 5);
  if (s.length >= 5 && ao5 !== Infinity && ao5 === S.bestAverage(s, 5)) {
    ctx.toast(t('¡Nueva mejor media de 5! {tiempo}', { tiempo: S.formatTime(ao5) }));
    ctx.fx.fanfare(); ctx.fx.confetti(null, 60);
  } else if (!penalty && S.bestSolve(s) === s[s.length - 1] && s.length > 1) {
    ctx.toast(t('¡Nuevo récord personal!'));
    ctx.fx.fanfare();
  }
  nuevaMezcla();
}

function tick() {
  const paso = () => {
    if (timer.fase === 'corriendo') {
      $('#tm-display').textContent = S.formatTime(performance.now() - timer.t0);
    } else if (timer.fase === 'inspeccion') {
      const seg = (performance.now() - timer.t0insp) / 1000;
      // los avisos de 8 y 12 segundos, como canta un juez
      if (timer.avisos === 0 && seg >= 8) { timer.avisos = 1; ctx.fx.tone(660, 0.1, 'sine', 0.12); ctx.fx.say(t('ocho')); }
      if (timer.avisos === 1 && seg >= 12) { timer.avisos = 2; ctx.fx.tone(760, 0.1, 'sine', 0.12); ctx.fx.say(t('doce')); }
      const disp = $('#tm-display');
      disp.className = 'timer-big ' + (seg > 15 ? 'penal' : seg > 12 ? 'aviso' : 'inspeccion');
      disp.textContent = seg <= 15 ? String(Math.ceil(15 - seg)) : (seg <= 17 ? '+2' : 'DNF');
    } else return;
    timer.raf = requestAnimationFrame(paso);
  };
  timer.raf = requestAnimationFrame(paso);
}

/** Lo que queda de la mezcla desde donde este el cubo */
function faltaMezcla() {
  return simplifyAlg(invertAlg(timer.hist).concat(timer.scramble || []));
}

/**
 * ¿La guía de la mezcla sigue valiendo? Se comprueba de verdad: aplicar lo
 * que falta tiene que dejar el cubo exactamente en la mezcla pedida. Si el
 * cubo ha cambiado por otro lado (otra pantalla, otra partida), no vale y
 * hay que replantear en vez de dejarte esperando.
 */
function guiaMezclaValida() {
  if (!timer.scramble || !timer.objetivo) return false;
  return applyAlg(ctx.app.state, faltaMezcla()).join('') === timer.objetivo.join('');
}

/** Coloca la fase de mezcla mirando cómo está el cubo ahora mismo */
function replantearMezcla() {
  if (!conCubo()) { timer.fase = 'idle'; return; }
  if (ctx.app.state.join('') === timer.objetivo.join('')) { timer.fase = 'listo'; return; }
  if (guiaMezclaValida()) { timer.fase = 'mezclando'; return; }
  timer.hist = [];
  timer.fuera = false;
  timer.fase = isSolved(ctx.app.state) ? 'mezclando' : 'resolver';
}

/** ¿`faltan` es el final de la mezcla, o te has ido por otro lado? */
function enRuta(faltan) {
  const base = timer.scramble || [];
  if (faltan.length > base.length) return false;
  const desde = base.length - faltan.length;
  return faltan.every((m, k) =>
    m.face === base[desde + k].face && m.amount === base[desde + k].amount);
}

/** Con cubo inteligente el cronómetro lo maneja el propio cubo */
function timerOnState(state) {
  if (!conCubo()) { renderTimer(); return; }
  const sc = escena('tm-scene');
  if (!sc.animating) sc.render(state);

  if (timer.fase === 'resolver') {
    if (isSolved(state)) {
      timer.fase = 'mezclando';
      timer.hist = [];
      ctx.fx.good();
      ctx.fx.say(t('Ya está. Ahora aplica la mezcla'));
    }
    renderTimer();
    return;
  }

  if (timer.fase === 'mezclando') {
    if (ctx.lastMove) timer.hist.push(ctx.lastMove);
    if (!guiaMezclaValida()) replantearMezcla();
    if (timer.objetivo && state.join('') === timer.objetivo.join('')) {
      timer.fase = 'listo';
      timer.fuera = false;
      ctx.fx.good();
      ctx.fx.say(t(timer.inspeccion ? 'Mezcla lista. Pulsa para inspeccionar' : 'Listo'));
    }
    renderTimer();
    return;
  }
  // el primer giro arranca el crono, venga de la inspección o no
  if (timer.fase === 'listo' || timer.fase === 'inspeccion') { arrancar(); return; }
  if (timer.fase === 'corriendo' && isSolved(state)) parar();
}

function renderTimer() {
  const disp = $('#tm-display');
  const est = $('#tm-estado');
  const cubo = conCubo();
  const sc = escena('tm-scene');
  // Con cubo la escena es tu cubo. Sin cubo tu cubo no lo ve nadie, asi
  // que se ensena como tiene que quedar al aplicar la mezcla: sirve para
  // comprobar que la has hecho bien antes de arrancar.
  if (!sc.animating) sc.render(cubo ? ctx.app.state : (timer.objetivo || ctx.app.state));
  pintarMezcla();

  disp.className = 'timer-big' + (timer.fase === 'armado' ? ' listo'
    : timer.fase === 'preparando' ? ' esperando'
      : timer.fase === 'inspeccion' ? ' inspeccion' : '');

  if (timer.fase === 'idle') {
    const u = solves()[solves().length - 1];
    disp.textContent = u ? S.formatSolve(u) : '0.00';
  } else if (timer.fase === 'mezclando') disp.textContent = String(faltaMezcla().length);
  else if (timer.fase === 'resolver') disp.textContent = '—';
  else if (timer.fase === 'listo') disp.textContent = timer.inspeccion ? '15' : '0.00';
  else if (timer.fase === 'preparando') disp.textContent = '…';
  // el numero lo lleva el bucle de dibujo, pero se pone ya al arrancar:
  // asi no se queda un instante con lo que decia antes
  else if (timer.fase === 'corriendo') disp.textContent = S.formatTime(performance.now() - timer.t0);
  else if (timer.fase === 'armado') disp.textContent = t('¡YA!');

  // lo que se arrastra de la inspeccion, dicho donde se vea
  const notaPenal = timer.fase !== 'corriendo' ? ''
    : timer.penalInsp === 2 ? ' ' + t('<b>(+2 de inspección)</b>')
      : timer.penalInsp === S.DNF ? ' ' + t('<b>(DNF de inspección)</b>') : '';

  if (cubo) {
    const faltan = timer.fase === 'mezclando' ? faltaMezcla() : [];
    est.innerHTML = {
      resolver: t('El cubo no está resuelto. <b>Te guío para resolverlo</b> y luego mezclamos.'),
      mezclando: timer.fuera
        ? t('<b>Ese giro no era.</b> Aquí tienes el camino de vuelta: <b>{n}</b> giros.',
          { n: faltan.length })
        : t('Sigue la mezcla: <b>quedan {n}</b> giros.', { n: faltan.length }),
      listo: t(timer.inspeccion
        ? '<b>Pulsa</b> (o barra espaciadora) y empiezan los <b>15 s de inspección</b>.'
        : '<b>Listo.</b> El crono arranca en cuanto muevas.'),
      inspeccion: t('Mira el cubo. <b>Al primer giro arranca el crono.</b>'),
      corriendo: t('Corriendo… paro solo al resolverlo.') + notaPenal,
    }[timer.fase] || t('Sujeta el cubo con el <b>blanco abajo</b> y el <b>verde delante</b>.');
  } else {
    est.innerHTML = {
      corriendo: t('Corriendo. <b>Barra espaciadora</b> o el botón para parar.') + notaPenal,
      inspeccion: t('Inspección. Mantén pulsado y <b>suelta</b> para arrancar.'),
      preparando: t('Sigue pulsando…'),
      armado: t('<b>¡Suelta!</b>'),
    }[timer.fase] || t(timer.inspeccion
      ? 'Aplica la mezcla a tu cubo. Luego <b>barra espaciadora</b> (o el botón) '
        + 'y empiezan los <b>15 s de inspección</b>.'
      : 'Aplica la mezcla a tu cubo. Luego <b>mantén la barra</b> (o el botón) '
        + 'y suelta para arrancar.');
  }
  pintarBotonCrono(cubo);

  $('#tm-penal').style.display = solves().length ? 'flex' : 'none';
  renderStats();
  renderHistorial();
}

/**
 * El boton de arrancar y parar. Hace lo mismo que la barra espaciadora,
 * que es lo que hace falta en un movil y en cualquier sitio donde no haya
 * teclado. Con cubo conectado el crono lo maneja el propio cubo, y ahi el
 * boton solo sirve para abrir la inspeccion.
 */
function pintarBotonCrono(cubo) {
  const b = $('#tm-arrancar');
  if (cubo) {
    const util = timer.fase === 'listo' && timer.inspeccion;
    b.className = (util ? '' : 'hidden ') + 'btn primary';
    b.textContent = t('👁️ Empezar la inspección');
    return;
  }
  b.className = 'btn ' + (timer.fase === 'corriendo' ? 'danger' : 'primary');
  b.textContent = t(timer.fase === 'corriendo' ? '⏹️ Parar'
    : timer.fase === 'armado' ? '¡Suelta!'
      : timer.fase === 'preparando' ? 'Sigue pulsando…'
        : timer.fase === 'inspeccion' ? '▶️ Mantén y suelta para arrancar'
          : timer.inspeccion ? '👁️ Empezar la inspección' : '▶️ Arrancar');
}

/**
 * La mezcla, giro a giro. Si te equivocas no te deja esperando: te marca
 * el error y te dice como deshacerlo.
 */
function pintarMezcla() {
  const caja = $('#tm-scramble');
  const tarjeta = $('#tm-move');
  if (!timer.scramble) { caja.textContent = '—'; tarjeta.innerHTML = ''; return; }

  const guiando = conCubo() && timer.fase === 'mezclando';
  const faltan = guiando ? faltaMezcla() : [];
  const ruta = guiando ? enRuta(faltan) : true;
  timer.fuera = guiando && !ruta;
  // Si vas bien se tacha lo hecho sobre la mezcla; si te has salido, se
  // ensena el camino de vuelta, que es lo que necesitas ver en ese momento.
  const lista = timer.fuera ? faltan : timer.scramble;
  const hechos = timer.fuera ? 0 : (guiando ? timer.scramble.length - faltan.length : -1);

  caja.className = 'scramble' + (timer.fuera ? ' error' : '');
  caja.innerHTML = lista.map((m, k) => {
    const clase = !guiando ? '' : k < hechos ? 'hecho' : k === hechos ? 'now' : '';
    return `<span class="${clase}" style="color:${ctx.hexOf(m.face)}">${moveToString(m)}</span>`;
  }).join(' ');

  if (guiando && faltan.length) {
    const m = faltan[0];
    tarjeta.innerHTML = ctx.moveCard(m.face, m.amount);
  } else if (timer.fase === 'resolver') {
    try {
      const m = solve(ctx.app.state).moves[0];
      tarjeta.innerHTML = m ? ctx.moveCard(m.face, m.amount) : '';
    } catch (e) { tarjeta.innerHTML = ''; }
  } else {
    tarjeta.innerHTML = '';
  }
}

function renderStats() {
  const r = S.summary(solves());
  const celda = (etq, v) => `<div><b>${v}</b><span>${etq}</span></div>`;
  const f = (x) => (x === null ? '—' : x === Infinity ? 'DNF' : S.formatTime(x));
  $('#tm-stats').innerHTML =
    celda('intentos', r.total) +
    celda('mejor', r.mejor ? S.formatSolve(r.mejor) : '—') +
    celda('media', f(r.media)) +
    celda('mo3', f(r.mo3)) +
    celda('ao5', f(r.ao5)) +
    celda('ao12', f(r.ao12)) +
    celda('mejor ao5', f(r.mejorAo5)) +
    celda('mejor ao12', f(r.mejorAo12)) +
    celda('ao50', f(r.ao50));
}

function renderHistorial() {
  const box = $('#tm-historial');
  const s = solves();
  box.innerHTML = '';
  s.slice().reverse().slice(0, 60).forEach((sv, k) => {
    const i = s.length - 1 - k;
    const d = document.createElement('div');
    if (i === (timer.seleccion < 0 ? s.length - 1 : timer.seleccion)) d.className = 'sel';
    d.innerHTML = `<b>${i + 1}</b><span>${S.formatSolve(sv)}</span><em>${sv.scramble || ''}</em>`;
    d.onclick = () => { timer.seleccion = i; renderHistorial(); };
    box.appendChild(d);
  });
}

// ============================================================
//  3. Fridrich: guia en vivo y entrenador de casos
// ============================================================
const CLAVE_CASOS = 'cubo-magico-casos-v1';
let casoStats = {};
let pestana = 'guia';
const drill = {
  caso: null, kind: null, fase: 'preparar', objetivo: null,
  t0: 0, raf: 0, hist: [], base: null, setup: null, ruta: null,
  grabando: false, grabados: [],
};

function cargarCasos() {
  try { casoStats = JSON.parse(localStorage.getItem(CLAVE_CASOS) || '{}'); }
  catch (e) { casoStats = {}; }
}
function guardarCasos() {
  try { localStorage.setItem(CLAVE_CASOS, JSON.stringify(casoStats)); } catch (e) { /* nada */ }
}
function statsDe(kind, id) {
  return casoStats[kind + ':' + id] || { intentos: 0, mejor: null, ultimos: [] };
}

// --- apagar la ultima capa (solo en F2L) -------------------------------
//  Entrenando F2L la ultima capa es ruido: son piezas que vas a mover
//  luego de todas formas. Apagadas, lo unico que se ve de colores es el
//  par que vas a meter, que es lo que hay que aprender a mirar. Se apaga
//  la PIEZA entera, asi que un hueco con una esquina de arriba dentro se
//  ve negro: justo lo que significa, que ese hueco esta libre.
const CLAVE_NEGRAS = 'cubo-magico-f2l-negras';
let negras = false;

function cargarNegras() {
  try { negras = localStorage.getItem(CLAVE_NEGRAS) === '1'; } catch (e) { negras = false; }
}
function alternarNegras() {
  negras = !negras;
  try { localStorage.setItem(CLAVE_NEGRAS, negras ? '1' : '0'); } catch (e) { /* nada */ }
}
/** Texto del boton: dice lo que va a hacer, como el de grabar */
function pintarBotonNegras(id, visible) {
  const b = $(id);
  b.style.display = visible ? '' : 'none';
  if (!visible) return;
  b.innerHTML = t(negras ? '🌈 Encender la última capa' : '🌑 Apagar la última capa');
  b.title = t('Deja a la vista sólo el par que vas a meter');
}
/** Las pegatinas que van apagadas en un caso de F2L, o ninguna */
function apagadasDe(kind, state) {
  return kind === 'F2L' && negras ? pegatinasUltimaCapa(state) : null;
}

function initFridrich() {
  cargarCasos();
  cargarNegras();
  $$('#fr-tabs button').forEach((b) => {
    b.onclick = () => {
      ctx.fx.click();
      pestana = b.dataset.tab;
      $$('#fr-tabs button').forEach((x) => x.classList.toggle('on', x === b));
      renderFridrich();
    };
  });
  $('#dr-siguiente').onclick = () => { ctx.fx.click(); nuevoDrill(drill.kind); };
  $('#dr-repetir').onclick = () => { ctx.fx.click(); repetirCaso(); };
  $('#dr-auto').onclick = () => { ctx.fx.click(); ctx.setState(applyAlg(solvedState(), drill.setup)); };
  $('#dr-grabar').onclick = () => { ctx.fx.click(); alternarGrabacion(); };
  $('#dr-escribir').onclick = () => { ctx.fx.click(); escribirAlgoritmo(); };
  $('#dr-negras').onclick = () => {
    ctx.fx.click();
    alternarNegras();
    escenaDrill();            // setApagado repinta solo con lo que ya hubiera
    renderDrill();
  };
  $('#fr-negras').onclick = () => { ctx.fx.click(); alternarNegras(); renderFridrich(); };
}

/** La escena del entrenador, con la última capa apagada si toca */
function escenaDrill() {
  const sc = escena('dr-scene');
  sc.setApagado(drill.kind === 'F2L' && negras ? pegatinasUltimaCapa : null);
  return sc;
}

function renderFridrich() {
  const esGuia = pestana === 'guia';
  $('#fr-guia').style.display = esGuia ? '' : 'none';
  $('#fr-casos').style.display = esGuia ? 'none' : '';
  // en la lista de casos no hay nada que girar, solo se elige
  ctx.padEn(esGuia ? 'fridrich' : null);
  if (esGuia) { renderGuia(); return; }

  const set = SETS[pestana];
  const hechos = set.casos.filter((c) => statsDe(pestana, c.id).intentos > 0).length;
  $('#fr-resumen').textContent = t('{n} casos de {set} · {hechos} practicados',
    { n: set.casos.length, set: set.nombre, hechos });
  pintarBotonNegras('#fr-negras', pestana === 'F2L');
  const colores = ctx.hexMap();
  const box = $('#fr-lista');
  box.innerHTML = '';
  for (const grupo of set.grupos) {
    const delGrupo = set.casos.filter((c) => c.group === grupo);
    if (!delGrupo.length) continue;
    const cab = document.createElement('div');
    cab.className = 'grupo-cab';
    cab.textContent = t(grupo) + ' · ' + delGrupo.length;
    box.appendChild(cab);
    for (const c of delGrupo) {
      const st = statsDe(pestana, c.id);
      const b = document.createElement('button');
      if (st.intentos) b.classList.add('hecho');
      const veces = st.intentos === 1 ? t('1 intento')
        : t('{n} intentos', { n: st.intentos });
      // la miniatura se dibuja del estado en el que se ve el caso, asi que
      // no puede mentir: es exactamente lo que te vas a encontrar
      const estado = estadoDelCaso(c);
      b.innerHTML = isoCubeSVG(estado, colores,
        { px: 7, apagadas: apagadasDe(pestana, estado) })
        + `<div><b>${t(c.name)}</b><em>${st.intentos
          ? t('mejor {tiempo} · {veces}', { tiempo: S.formatTime(st.mejor), veces })
          : t('{n} algoritmos', { n: mis.algsDe(pestana, c).length })}</em></div>`;
      b.onclick = () => { ctx.fx.click(); abrirDrill(pestana, c); };
      box.appendChild(b);
    }
  }
}

// La guia se queda FIJA mientras vas haciendo la formula. Si volviera a
// mirar el cubo en cada giro, el caso desapareceria en cuanto empiezas
// (a mitad de un algoritmo el cubo ya no esta en ese caso) y te quedarias
// a medias sin saber como seguir.
const guia = { kind: null, caso: null, base: null, hist: [], visto: null };

function soltarGuia() { guia.base = null; guia.hist = []; guia.caso = null; }

/** ¿`faltan` es lo que queda de `base` habiendo seguido la formula? */
function esResto(base, faltan) {
  if (faltan.length > base.length) return false;
  const desde = base.length - faltan.length;
  return faltan.every((m, k) =>
    m.face === base[desde + k].face && m.amount === base[desde + k].amount);
}

function renderGuia() {
  const st = ctx.app.state;
  const clave = st.join('');
  const cambio = guia.visto !== null && guia.visto !== clave;
  const mv = cambio ? ctx.lastMove : null;
  guia.visto = clave;

  const sc = escena('fr-scene');
  if (!sc.animating) sc.render(st);

  // 1) ¿seguimos dentro del caso que ya estabamos ensenando?
  if (guia.base) {
    if (mv) guia.hist.push(mv);
    const faltan = simplifyAlg(invertAlg(guia.hist).concat(guia.base));
    if (faltan.length && faltan.length <= guia.base.length + 2) {
      pintarGuia(guia.kind, guia.caso, guia.base, faltan, guia.hueco);
      return;
    }
    soltarGuia();          // o lo has terminado, o te has ido a otra cosa
  }

  // 2) miramos el cubo y buscamos el caso
  const r = recognise(st);
  $('#fr-paso').textContent = {
    cruz: t('1 · La cruz'), F2L: t('2 · F2L'), OLL: t('3 · OLL'), PLL: t('4 · PLL'), hecho: t('✅ Resuelto'),
  }[r.paso] || r.paso;

  if (r.caso && r.kind) {
    const alg = mis.algElegido(r.kind, r.caso);
    let base;
    if (r.hueco) {
      // el par no está en el hueco de delante: se resuelve en el marco girado
      // y luego se traducen las caras al cubo tal y como lo tienes en la mano
      const sol = solutionFrom(r.hueco.estadoGirado, alg, 'F2L');
      base = sol ? mapearAlg(sol, r.hueco.aReal) : null;
    } else {
      base = solutionFrom(st, alg, r.kind);
    }
    if (base) {
      guia.kind = r.kind; guia.caso = r.caso; guia.base = base; guia.hist = [];
      guia.hueco = r.hueco || null;
      pintarGuia(r.kind, r.caso, base, base, r.hueco);
      return;
    }
  }

  // Piezas atrapadas en un hueco: hay que sacarlas antes de poder juntar el par
  if (r.paso === 'F2L' && r.sacar) {
    guia.kind = null;
    guia.caso = { name: 'Saca el par del hueco' };
    guia.base = r.sacar.moves;
    guia.hist = [];
    guia.hueco = { hueco: r.sacar.hueco };
    pintarGuia(null, guia.caso, r.sacar.moves, r.sacar.moves, guia.hueco);
    $('#fr-tip').innerHTML = t('Las piezas de este par están metidas donde no toca. '
      + 'Con estos tres giros salen arriba y ya se pueden colocar.');
    return;
  }

  // La cruz no tiene algoritmo: se hace a ojo. Pero para no dejarte tirado,
  // te la guío con el método sencillo hasta tenerla.
  if (r.paso === 'cruz') {
    try {
      const plan = solve(st);
      const hasta = [];
      let prueba = st;
      for (const m of plan.moves) {
        if (CROSS_DONE(prueba)) break;
        prueba = applyMove(prueba, m.face, m.amount);
        hasta.push(m);
      }
      if (hasta.length) {
        guia.kind = null; guia.caso = { name: 'La cruz blanca' }; guia.base = hasta;
        guia.hist = []; guia.hueco = null;
        pintarGuia(null, guia.caso, hasta, hasta);
        $('#fr-tip').innerHTML = t('La cruz se hace a ojo, sin fórmula. Te la guío para que '
          + 'no te quedes parado, pero con práctica la verás sola.');
        return;
      }
    } catch (e) { /* estado imposible: seguimos abajo */ }
  }

  $('#fr-caso').textContent = t(r.texto);
  $('#fr-move').innerHTML = '';
  $('#fr-alg').innerHTML = '';
  $('#fr-tip').textContent = r.paso === 'cruz'
    ? t('Haz primero la cruz blanca abajo; entonces empiezo a guiarte.')
    : r.paso === 'hecho' ? t('Mézclalo y te voy diciendo cada caso.') : '';
  $('#fr-caso').onclick = null;
  $('#fr-caso').style.cursor = '';
}

function pintarGuia(kind, caso, base, faltan, hueco) {
  const siguiendo = faltan.length < base.length;
  $('#fr-caso').innerHTML = (siguiendo ? '<span class="siguiendo">' + t('SIGUIENDO') + '</span><br>' : '')
    + t(caso.name)
    + (hueco ? t('<small>hueco de la cara {color}</small>', { color: ctx.colorFem(hueco.hueco) }) : '');
  $('#fr-caso').onclick = kind ? () => abrirDrill(kind, caso) : null;
  $('#fr-caso').style.cursor = kind ? 'pointer' : '';

  // si vas siguiendo la formula, se tacha lo hecho; si te has salido,
  // se ensena lo que falta desde donde estas
  const enOrden = esResto(base, faltan);
  const lista = enOrden ? base : faltan;
  const hechos = enOrden ? base.length - faltan.length : 0;
  $('#fr-alg').innerHTML = lista.map((m, k) => {
    const clase = k < hechos ? 'hecho' : k === hechos ? 'now' : '';
    const fondo = k === hechos ? `background:${ctx.hexOf(m.face)};color:#1c1030` : '';
    return `<span class="${clase}" style="${fondo}">${moveToString(m)}${m.ajuste ? '*' : ''}</span>`;
  }).join('');

  const m = faltan[0];
  $('#fr-move').innerHTML = m ? ctx.moveCard(m.face, m.amount) : '';
  $('#fr-tip').innerHTML = !m ? ''
    : m.ajuste ? t('<b>Giro de ajuste</b> antes de la fórmula.')
      : siguiendo ? t('Quedan {n}. Toca el nombre del caso para entrenarlo.', { n: faltan.length })
        : t('Toca el nombre del caso para entrenarlo aparte.');
}

// --- entrenar un caso ---------------------------------------------------
function abrirDrill(kind, caso) {
  drill.kind = kind;
  drill.caso = caso;
  drill.grabando = false;
  drill.grabados = [];
  drill.setup = setupFor(caso);
  drill.objetivo = applyAlg(solvedState(), drill.setup);
  drill.base = solutionFrom(drill.objetivo, mis.algElegido(kind, caso), kind);
  colocarCaso([]);
  $('#dr-titulo').textContent = kind + ' · ' + t(caso.name);
  ctx.go('drill');
  renderDrill();
  escenaDrill().render(drill.objetivo);
}

/**
 * Deja el entrenador listo para (volver a) hacer el caso desde donde
 * esté el cubo ahora mismo. `deshacer` son los giros que se han dado
 * desde que se puso el caso, que suelen ser el camino corto de vuelta.
 */
function colocarCaso(deshacer) {
  cancelAnimationFrame(drill.raf);
  const puesto = ctx.app.state.join('') === drill.objetivo.join('');
  drill.ruta = puesto ? [] : rutaAlCaso(ctx.app.state, drill.objetivo, deshacer, drill.setup);
  drill.hist = [];
  drill.fase = puesto ? 'listo' : 'preparar';
  drill.t0 = 0;
  $('#dr-tiempo').textContent = '—';
}

/** Volver a hacer el mismo caso, esté el cubo como esté */
function repetirCaso() {
  if (!drill.caso) return;
  drill.grabando = false;
  drill.grabados = [];
  colocarCaso(drill.hist);
  if (!drill.ruta) ctx.toast(t('Resuelve el cubo y te preparo el caso otra vez'), 3200);
  renderDrill();
}

function nuevoDrill(kind) {
  const lista = SETS[kind].casos;
  abrirDrill(kind, lista[(Math.random() * lista.length) | 0]);
}

/** Lo que falta desde donde este el cubo: deshacer lo hecho y seguir el plan */
function restante(plan) {
  const base = plan || drill.base;
  if (!base) return [];
  return simplifyAlg(invertAlg(drill.hist).concat(base));
}

/**
 * Pinta una lista de giros con el siguiente resaltado en su color. Con
 * `tope` se corta: una vuelta al caso desde un cubo revuelto puede ser
 * de cien giros, y cien fichas en pantalla no las lee nadie. Los que
 * importan son los primeros; el resto se cuenta.
 */
function pasos(lista, tope) {
  const corta = tope && lista.length > tope ? lista.slice(0, tope) : lista;
  return corta.map((m, i) => {
    const fondo = i === 0 ? `background:${ctx.hexOf(m.face)};color:#1c1030` : '';
    return `<span class="${i === 0 ? 'now' : ''}" style="${fondo}">`
      + `${moveToString(m)}${m.ajuste ? '*' : ''}</span>`;
  }).join('')
    + (corta.length < lista.length
      ? `<span class="mas">+${lista.length - corta.length}</span>` : '');
}

function renderDrill() {
  const c = drill.caso;
  const st = statsDe(drill.kind, c.id);
  const celda = (e, v) => `<div><b>${v}</b><span>${e}</span></div>`;
  const media = st.ultimos.length
    ? S.formatTime(st.ultimos.reduce((a, b) => a + b, 0) / st.ultimos.length) : '—';
  $('#dr-stats').innerHTML = celda('intentos', st.intentos)
    + celda('mejor', st.mejor ? S.formatTime(st.mejor) : '—')
    + celda('media 5', media);
  $('#dr-auto').style.display = ctx.app.mode === 'state' ? 'none' : '';
  pintarBotonNegras('#dr-negras', drill.kind === 'F2L');
  renderAlgos();

  if (drill.grabando) {
    $('#dr-fase').textContent = t('🔴 Grabando tu algoritmo');
    $('#dr-move').innerHTML = '';
    $('#dr-formula').innerHTML = drill.grabados.length ? chips(drill.grabados) : '';
    $('#dr-tip').innerHTML = t('Resuelve el caso a tu manera. Paro solo al terminarlo, '
      + 'o pulsa <b>⏹ Parar</b>.');
    return;
  }

  if (drill.fase === 'preparar') {
    $('#dr-fase').textContent = t('1 · Prepara el caso');
    // Sin ruta no se puede guiar desde aquí: se cae a la mezcla de
    // siempre, que sale del cubo resuelto y por eso hay que decirlo.
    if (!drill.ruta) {
      $('#dr-move').innerHTML = '';
      $('#dr-formula').innerHTML = chips(drill.setup);
      $('#dr-tip').innerHTML =
        t('Con el cubo <b>resuelto</b>, aplica esta mezcla. Te aviso cuando llegues.');
      $('#dr-tiempo').textContent = '—';
      return;
    }
    const faltan = restante(drill.ruta);
    $('#dr-formula').innerHTML = pasos(faltan, 14);
    $('#dr-move').innerHTML = faltan[0] ? ctx.moveCard(faltan[0].face, faltan[0].amount) : '';
    $('#dr-tip').innerHTML = (ctx.app.mode === 'state'
      ? t('Haz estos giros y te dejo el caso puesto. Te aviso al llegar.')
      : t('Haz estos giros, o pulsa <b>⚡ Prepararlo en la pantalla</b>.'))
      // el camino corto es deshacer lo hecho; si sale largo es que no lo
      // hay, y entonces vale la pena decir por qué son tantos giros
      + (faltan.length > 25
        ? ' ' + t('El cubo está muy revuelto: esto lo resuelve y lo vuelve a mezclar.') : '');
    $('#dr-tiempo').textContent = '—';
    return;
  }
  if (drill.fase === 'hecho') {
    $('#dr-fase').textContent = t('✅ Conseguido');
    $('#dr-move').innerHTML = '';
    $('#dr-formula').innerHTML = chips(drill.base || []);
    $('#dr-tip').textContent = t('Pulsa 🔁 para repetirlo, o 🔀 para otro caso.');
    return;
  }

  const faltan = restante();
  $('#dr-fase').textContent = t(drill.fase === 'listo' ? '2 · ¡Resuélvelo!' : '⏱️ Corriendo');
  $('#dr-formula').innerHTML = pasos(faltan);
  const m = faltan[0];
  if (m) {
    $('#dr-move').innerHTML = ctx.moveCard(m.face, m.amount);
    $('#dr-tip').innerHTML = t(m.ajuste
      ? '<b>Giro de ajuste</b>: coloca la cara de arriba antes de la fórmula.'
      : (drill.kind === 'F2L'
        ? 'Junta la esquina con su arista y mete el par en su hueco.'
        : 'Sigue la fórmula. El asterisco marca los giros de ajuste.'));
  }
}

// --- gestor de algoritmos ----------------------------------------------
function renderAlgos() {
  const lista = mis.algsDe(drill.kind, drill.caso);
  const sel = mis.indiceElegido(drill.kind, drill.caso);
  $('#dr-algos-n').textContent = lista.length === 1 ? t('1 guardado')
    : t('{n} guardados', { n: lista.length });
  const box = $('#dr-algos');
  box.innerHTML = '';
  lista.forEach((a, i) => {
    const fila = document.createElement('div');
    fila.className = 'fila' + (i === sel ? ' sel' : '');
    fila.innerHTML = `<span class="tick">${i === sel ? '✅' : '○'}</span>`
      + `<code>${a.alg}</code>`
      + `<span class="etq">${a.propio ? 'tuyo' : 'de serie'}</span>`
      + (a.propio ? '<button class="del" title="Borrar">🗑</button>' : '');
    fila.onclick = (e) => {
      if (e.target.classList.contains('del')) {
        mis.borrar(drill.kind, drill.caso, a.alg);
        ctx.toast('Algoritmo borrado');
        recalcularBase();
        return;
      }
      ctx.fx.click();
      mis.elegir(drill.kind, drill.caso, i);
      recalcularBase();
    };
    box.appendChild(fila);
  });
  // se graba de los giros que llegan, vengan del cubo o del teclado
  $('#dr-grabar').innerHTML = t(drill.grabando ? '⏹ Parar'
    : ctx.sinCubo() ? '🔴 Grabar con el teclado' : '🔴 Grabar con el cubo');
  $('#dr-grabar').classList.toggle('grabando', drill.grabando);
}

/** Al cambiar de algoritmo preferido hay que rehacer la guia del caso */
function recalcularBase() {
  const alg = mis.algElegido(drill.kind, drill.caso);
  const desde = drill.fase === 'preparar' ? drill.objetivo
    : applyAlg(drill.objetivo, drill.hist);
  const sol = solutionFrom(desde, alg, drill.kind);
  if (sol) { drill.base = sol; drill.hist = []; }
  renderDrill();
}

function escribirAlgoritmo() {
  const texto = prompt('Escribe el algoritmo para ' + drill.caso.name
    + '\n\nPuedes usar R U F D L B, giros de cubo (x y z), dobles (r u f)'
    + ' y capas del medio (M E S).');
  if (texto === null) return;
  guardarAlgoritmo(texto);
}

function guardarAlgoritmo(texto) {
  const v = mis.validar(texto, drill.caso, drill.kind, resuelveElCaso);
  if (!v.ok) { ctx.toast('❌ ' + v.error, 3200); ctx.fx.oops(); return false; }
  const r = mis.anadir(drill.kind, drill.caso, v.alg);
  if (!r.ok) { ctx.toast(r.error, 2600); return false; }
  ctx.fx.good();
  ctx.toast(t('✅ Guardado y elegido como preferido'));
  recalcularBase();
  return true;
}

// --- grabar leyendo los giros del cubo ---------------------------------
function alternarGrabacion() {
  if (drill.grabando) { terminarGrabacion(false); return; }
  if (drill.fase === 'preparar') {
    ctx.toast(t('Prepara antes el caso: así sé desde dónde grabas'), 3000);
    return;
  }
  drill.grabando = true;
  drill.grabados = [];
  drill.estadoAlEmpezar = ctx.app.state.slice();
  ctx.fx.tone(660, 0.12, 'square', 0.14);
  ctx.toast(t('🔴 Grabando: resuelve el caso a tu manera'));
  renderDrill();
}

function terminarGrabacion(automatico) {
  drill.grabando = false;
  const movs = drill.grabados.slice();
  drill.grabados = [];
  if (!movs.length) { ctx.toast(t('No has hecho ningún giro')); renderDrill(); return; }
  const texto = mis.limpiarGrabacion(movs);
  if (!texto) { ctx.toast(t('Sólo has girado la cara de arriba')); renderDrill(); return; }
  if (!automatico && !resuelveElCaso(texto, drill.caso, drill.kind)) {
    ctx.toast(t('❌ Eso no resuelve el caso, no lo guardo'), 3200);
    ctx.fx.oops();
    renderDrill();
    return;
  }
  if (confirm(t('¿Guardar este algoritmo?') + '\n\n' + texto + '\n\n'
    + t('({n} giros grabados, {limpios} tras limpiar los ajustes)',
      { n: movs.length, limpios: texto.split(' ').length }))) {
    guardarAlgoritmo(texto);
  } else {
    renderDrill();
  }
}

function drillOnState(state) {
  const sc = escenaDrill();
  if (!sc.animating) sc.render(state);

  if (drill.fase === 'preparar') {
    if (state.join('') === drill.objetivo.join('')) {
      drill.fase = 'listo';
      drill.hist = [];
      ctx.fx.good();
      renderDrill();
      return;
    }
    if (ctx.lastMove) drill.hist.push(ctx.lastMove);
    // Si te has ido lejos del plan, se busca otro camino en vez de
    // pedirte que deshagas medio cubo para volver a empezar.
    if (drill.ruta) {
      const faltan = restante(drill.ruta);
      if (faltan.length > drill.ruta.length + 4) {
        const otra = rutaAlCaso(state, drill.objetivo, [], drill.setup);
        if (otra && otra.length < faltan.length) { drill.ruta = otra; drill.hist = []; }
      }
    }
    renderDrill();
    return;
  }

  const mv = ctx.lastMove;
  if (mv) {
    drill.hist.push(mv);
    if (drill.grabando) drill.grabados.push(mv);
  }

  if (drill.fase === 'listo' && !drill.grabando) {
    drill.fase = 'corriendo';
    drill.t0 = performance.now();
    const paso = () => {
      if (drill.fase !== 'corriendo') return;
      $('#dr-tiempo').textContent = S.formatTime(performance.now() - drill.t0);
      drill.raf = requestAnimationFrame(paso);
    };
    drill.raf = requestAnimationFrame(paso);
  }

  const listo = drill.kind === 'PLL' ? isSolved(state)
    : drill.kind === 'OLL' ? (F2L_DONE(state) && OLL_DONE(state))
      : (pairSlotDone(state) && restoDone(state));

  if (listo && drill.grabando) { terminarGrabacion(true); return; }

  if (listo && drill.fase === 'corriendo') {
    cancelAnimationFrame(drill.raf);
    const ms = Math.round(performance.now() - drill.t0);
    drill.fase = 'hecho';
    const st = statsDe(drill.kind, drill.caso.id);
    st.intentos++;
    st.mejor = st.mejor === null ? ms : Math.min(st.mejor, ms);
    st.ultimos = [...st.ultimos, ms].slice(-5);
    casoStats[drill.kind + ':' + drill.caso.id] = st;
    guardarCasos();
    $('#dr-tiempo').textContent = S.formatTime(ms);
    ctx.fx.fanfare();
  }
  renderDrill();
}
