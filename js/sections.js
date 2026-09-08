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
} from './algs.js';
import { solve } from './solver.js';
import * as mis from './myalgs.js';
import { LESSONS, lessonById, nextLesson } from './lessons.js';
import * as S from './stats.js';

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
    ? '¡Cubo resuelto! Mézclalo para practicar.'
    : 'Ahora te toca: ' + siguiente.emoji + ' ' + siguiente.title;
  LESSONS.forEach((l, i) => {
    const hecha = l.check(st);
    const p = Math.round(Math.max(0, Math.min(1, l.progreso(st))) * 100);
    const b = document.createElement('button');
    b.className = 'leccion' + (hecha ? ' hecha' : '');
    b.innerHTML = `<div class="n">${hecha ? '✓' : i + 1}</div>
      <div class="txt"><b>${l.emoji} ${l.title}</b><em>${l.idea}</em>
      <div class="barra"><i style="width:${p}%"></i></div></div>`;
    b.onclick = () => { ctx.fx.click(); abrirLeccion(l.id); };
    box.appendChild(b);
  });
}

function abrirLeccion(id) {
  leccionActual = id;
  const l = lessonById(id);
  $('#les-titulo').textContent = l.emoji + ' ' + l.title;
  $('#les-idea').textContent = l.idea;
  $('#les-texto').innerHTML = l.texto.map((t) => '<p>' + t + '</p>').join('');
  $('#les-truco').innerHTML = '💡 ' + l.truco;
  $('#les-formula').innerHTML = l.demo ? chips(l.demo) : '';
  $('#les-demo').style.display = l.demo ? '' : 'none';
  $('#les-demo').textContent = '▶️ ' + (l.demoNombre || 'Ver el movimiento');
  $('#les-demo2').style.display = l.demo2 ? '' : 'none';
  if (l.demo2) $('#les-demo2').textContent = '▶️ ' + l.demo2Nombre;
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
    if (!confirm('¿Vaciar la sesión? Se borran ' + solves().length + ' tiempos.')) return;
    sesiones.sesiones[sesiones.actual].solves = [];
    guardar(); renderTimer();
  };
  $('#tm-insp').onclick = () => {
    timer.inspeccion = !timer.inspeccion;
    $('#tm-insp').classList.toggle('on', timer.inspeccion);
    ctx.toast(timer.inspeccion ? 'Inspección de 15 s activada' : 'Inspección desactivada');
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
  const disp = $('#tm-display');
  disp.addEventListener('pointerdown', (e) => { e.preventDefault(); pulsar(); });
  disp.addEventListener('pointerup', (e) => { e.preventDefault(); soltar(); });
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
  if (timer.fase === 'armado') arrancar();
  else if (timer.fase === 'preparando') { timer.fase = 'idle'; renderTimer(); }
}

function empezarInspeccion() {
  timer.fase = 'inspeccion';
  timer.t0insp = performance.now();
  timer.penalInsp = 0;
  timer.avisos = 0;
  ctx.fx.tone(440, 0.09, 'sine', 0.12);
  ctx.fx.say('Inspección');
  tick();
}

function arrancar() {
  // La penalización se calcula aquí, del tiempo real transcurrido, no del
  // bucle de dibujo: si el navegador deja de refrescar, seguiría valiendo.
  if (timer.fase === 'inspeccion') {
    timer.penalInsp = S.inspectionPenalty((performance.now() - timer.t0insp) / 1000);
  }
  timer.fase = 'corriendo';
  timer.t0 = performance.now();
  ctx.fx.tone(880, 0.08, 'sine', 0.12);
  $('#tm-display').className = 'timer-big';
  $('#tm-estado').innerHTML = conCubo()
    ? 'Corriendo… paro solo al resolverlo.' + (timer.penalInsp === 2 ? ' <b>(+2 de inspección)</b>'
      : timer.penalInsp === S.DNF ? ' <b>(DNF de inspección)</b>' : '')
    : 'Pulsa para parar';
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
  if (penalty === 2) ctx.toast('Inspección pasada de 15 s: +2');
  else if (penalty === S.DNF) ctx.toast('Inspección pasada de 17 s: DNF');

  const s = solves();
  const ao5 = S.average(s, 5);
  if (s.length >= 5 && ao5 !== Infinity && ao5 === S.bestAverage(s, 5)) {
    ctx.toast('¡Nueva mejor media de 5! ' + S.formatTime(ao5));
    ctx.fx.fanfare(); ctx.fx.confetti(null, 60);
  } else if (!penalty && S.bestSolve(s) === s[s.length - 1] && s.length > 1) {
    ctx.toast('¡Nuevo récord personal!');
    ctx.fx.fanfare();
  }
  nuevaMezcla();
}

function tick() {
  const paso = () => {
    if (timer.fase === 'corriendo') {
      $('#tm-display').textContent = S.formatTime(performance.now() - timer.t0);
    } else if (timer.fase === 'inspeccion') {
      const t = (performance.now() - timer.t0insp) / 1000;
      // los avisos de 8 y 12 segundos, como canta un juez
      if (timer.avisos === 0 && t >= 8) { timer.avisos = 1; ctx.fx.tone(660, 0.1, 'sine', 0.12); ctx.fx.say('ocho'); }
      if (timer.avisos === 1 && t >= 12) { timer.avisos = 2; ctx.fx.tone(760, 0.1, 'sine', 0.12); ctx.fx.say('doce'); }
      const disp = $('#tm-display');
      disp.className = 'timer-big ' + (t > 17 ? 'penal' : t > 15 ? 'penal' : t > 12 ? 'aviso' : 'inspeccion');
      disp.textContent = t <= 15 ? String(Math.ceil(15 - t)) : (t <= 17 ? '+2' : 'DNF');
      $('#tm-estado').innerHTML = conCubo()
        ? 'Mira el cubo. <b>Al primer giro arranca el crono.</b>'
        : 'Suelta la barra para arrancar';
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
  const sc = escena('tm-scene');
  if (!sc.animating) sc.render(state);
  if (!conCubo()) return;

  if (timer.fase === 'resolver') {
    if (isSolved(state)) {
      timer.fase = 'mezclando';
      timer.hist = [];
      ctx.fx.good();
      ctx.fx.say('Ya está. Ahora aplica la mezcla');
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
      ctx.fx.say(timer.inspeccion ? 'Mezcla lista. Pulsa para inspeccionar' : 'Listo');
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
  if (!sc.animating) sc.render(ctx.app.state);
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
  else if (timer.fase === 'armado') disp.textContent = '¡YA!';

  if (cubo) {
    const faltan = timer.fase === 'mezclando' ? faltaMezcla() : [];
    est.innerHTML = {
      resolver: 'El cubo no está resuelto. <b>Te guío para resolverlo</b> y luego mezclamos.',
      mezclando: timer.fuera
        ? '<b>Ese giro no era.</b> Aquí tienes el camino de vuelta: <b>'
          + faltan.length + '</b> giros.'
        : 'Sigue la mezcla: <b>quedan ' + faltan.length + '</b> giros.',
      listo: timer.inspeccion
        ? '<b>Pulsa</b> (o barra espaciadora) y empiezan los <b>15 s de inspección</b>.'
        : '<b>Listo.</b> El crono arranca en cuanto muevas.',
      inspeccion: 'Mira el cubo. <b>Al primer giro arranca el crono.</b>',
      corriendo: 'Corriendo… paro solo al resolverlo.',
    }[timer.fase] || 'Sujeta el cubo con el <b>blanco abajo</b> y el <b>verde delante</b>.';
  } else {
    est.innerHTML = timer.fase === 'corriendo' ? 'Pulsa para parar'
      : timer.fase === 'inspeccion' ? 'Suelta la barra para arrancar'
        : 'Mantén la <b>barra espaciadora</b> (o toca el número) y suelta para arrancar';
  }

  $('#tm-penal').style.display = solves().length ? 'flex' : 'none';
  renderStats();
  renderHistorial();
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
  t0: 0, raf: 0, hist: [], base: null, setup: null,
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

function initFridrich() {
  cargarCasos();
  $$('#fr-tabs button').forEach((b) => {
    b.onclick = () => {
      ctx.fx.click();
      pestana = b.dataset.tab;
      $$('#fr-tabs button').forEach((x) => x.classList.toggle('on', x === b));
      renderFridrich();
    };
  });
  $('#dr-siguiente').onclick = () => { ctx.fx.click(); nuevoDrill(drill.kind); };
  $('#dr-auto').onclick = () => { ctx.fx.click(); ctx.setState(applyAlg(solvedState(), drill.setup)); };
  $('#dr-grabar').onclick = () => { ctx.fx.click(); alternarGrabacion(); };
  $('#dr-escribir').onclick = () => { ctx.fx.click(); escribirAlgoritmo(); };
}

function renderFridrich() {
  const esGuia = pestana === 'guia';
  $('#fr-guia').style.display = esGuia ? '' : 'none';
  $('#fr-casos').style.display = esGuia ? 'none' : '';
  if (esGuia) { renderGuia(); return; }

  const set = SETS[pestana];
  const hechos = set.casos.filter((c) => statsDe(pestana, c.id).intentos > 0).length;
  $('#fr-resumen').textContent = `${set.casos.length} casos de ${set.nombre} · ${hechos} practicados`;
  const box = $('#fr-lista');
  box.innerHTML = '';
  for (const grupo of set.grupos) {
    const delGrupo = set.casos.filter((c) => c.group === grupo);
    if (!delGrupo.length) continue;
    const cab = document.createElement('div');
    cab.className = 'grupo-cab';
    cab.textContent = grupo + ' · ' + delGrupo.length;
    box.appendChild(cab);
    for (const c of delGrupo) {
      const st = statsDe(pestana, c.id);
      const b = document.createElement('button');
      if (st.intentos) b.classList.add('hecho');
      const veces = st.intentos === 1 ? '1 intento' : st.intentos + ' intentos';
      b.innerHTML = `<div><b>${c.name}</b><em>${st.intentos
        ? 'mejor ' + S.formatTime(st.mejor) + ' · ' + veces
        : mis.algsDe(pestana, c).length + ' algoritmos'}</em></div>`;
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
    cruz: '1 · La cruz', F2L: '2 · F2L', OLL: '3 · OLL', PLL: '4 · PLL', hecho: '✅ Resuelto',
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
    $('#fr-tip').innerHTML = 'Las piezas de este par están metidas donde no toca. '
      + 'Con estos tres giros salen arriba y ya se pueden colocar.';
    return;
  }

  // La cruz no tiene algoritmo: se hace a ojo. Pero para no dejarte tirado,
  // te la guío con el método sencillo hasta tenerla.
  if (r.paso === 'cruz') {
    try {
      const plan = solve(st);
      const hasta = [];
      let t = st;
      for (const m of plan.moves) {
        if (CROSS_DONE(t)) break;
        t = applyMove(t, m.face, m.amount);
        hasta.push(m);
      }
      if (hasta.length) {
        guia.kind = null; guia.caso = { name: 'La cruz blanca' }; guia.base = hasta;
        guia.hist = []; guia.hueco = null;
        pintarGuia(null, guia.caso, hasta, hasta);
        $('#fr-tip').innerHTML = 'La cruz se hace a ojo, sin fórmula. Te la guío para que '
          + 'no te quedes parado, pero con práctica la verás sola.';
        return;
      }
    } catch (e) { /* estado imposible: seguimos abajo */ }
  }

  $('#fr-caso').textContent = r.texto;
  $('#fr-move').innerHTML = '';
  $('#fr-alg').innerHTML = '';
  $('#fr-tip').textContent = r.paso === 'cruz'
    ? 'Haz primero la cruz blanca abajo; entonces empiezo a guiarte.'
    : r.paso === 'hecho' ? 'Mézclalo y te voy diciendo cada caso.' : '';
  $('#fr-caso').onclick = null;
  $('#fr-caso').style.cursor = '';
}

function pintarGuia(kind, caso, base, faltan, hueco) {
  const siguiendo = faltan.length < base.length;
  $('#fr-caso').innerHTML = (siguiendo ? '<span class="siguiendo">SIGUIENDO</span><br>' : '')
    + caso.name
    + (hueco ? '<small>hueco de la cara ' + ctx.colorFem(hueco.hueco) + '</small>' : '');
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
    : m.ajuste ? '<b>Giro de ajuste</b> antes de la fórmula.'
      : siguiendo ? 'Quedan ' + faltan.length + '. Toca el nombre del caso para entrenarlo.'
        : 'Toca el nombre del caso para entrenarlo aparte.';
}

// --- entrenar un caso ---------------------------------------------------
function abrirDrill(kind, caso) {
  drill.kind = kind;
  drill.caso = caso;
  drill.fase = 'preparar';
  drill.hist = [];
  drill.grabando = false;
  drill.grabados = [];
  cancelAnimationFrame(drill.raf);
  drill.setup = setupFor(caso);
  drill.objetivo = applyAlg(solvedState(), drill.setup);
  drill.base = solutionFrom(drill.objetivo, mis.algElegido(kind, caso), kind);
  $('#dr-titulo').textContent = kind + ' · ' + caso.name;
  ctx.go('drill');
  renderDrill();
  escena('dr-scene').render(drill.objetivo);
}

function nuevoDrill(kind) {
  const lista = SETS[kind].casos;
  abrirDrill(kind, lista[(Math.random() * lista.length) | 0]);
}

/** Lo que falta desde donde este el cubo: deshacer lo hecho y seguir el plan */
function restante() {
  if (!drill.base) return [];
  return simplifyAlg(invertAlg(drill.hist).concat(drill.base));
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
  renderAlgos();

  if (drill.grabando) {
    $('#dr-fase').textContent = '🔴 Grabando tu algoritmo';
    $('#dr-move').innerHTML = '';
    $('#dr-formula').innerHTML = drill.grabados.length ? chips(drill.grabados) : '';
    $('#dr-tip').innerHTML = 'Resuelve el caso a tu manera. Paro solo al terminarlo, '
      + 'o pulsa <b>⏹ Parar</b>.';
    return;
  }

  if (drill.fase === 'preparar') {
    $('#dr-fase').textContent = '1 · Prepara el caso';
    $('#dr-move').innerHTML = '';
    $('#dr-formula').innerHTML = chips(drill.setup);
    $('#dr-tip').innerHTML = ctx.app.mode === 'state'
      ? 'Con el cubo <b>resuelto</b>, aplica esta mezcla. Te aviso cuando llegues.'
      : 'Pulsa el botón de abajo y te lo preparo en la pantalla.';
    $('#dr-tiempo').textContent = '—';
    return;
  }
  if (drill.fase === 'hecho') {
    $('#dr-fase').textContent = '✅ Conseguido';
    $('#dr-move').innerHTML = '';
    $('#dr-formula').innerHTML = chips(drill.base || []);
    $('#dr-tip').textContent = 'Pulsa 🔀 arriba para otro caso.';
    return;
  }

  const faltan = restante();
  $('#dr-fase').textContent = drill.fase === 'listo' ? '2 · ¡Resuélvelo!' : '⏱️ Corriendo';
  $('#dr-formula').innerHTML = faltan.map((m, i) => {
    const fondo = i === 0 ? `background:${ctx.hexOf(m.face)};color:#1c1030` : '';
    return `<span class="${i === 0 ? 'now' : ''}" style="${fondo}">${moveToString(m)}${m.ajuste ? '*' : ''}</span>`;
  }).join('');
  const m = faltan[0];
  if (m) {
    $('#dr-move').innerHTML = ctx.moveCard(m.face, m.amount);
    $('#dr-tip').innerHTML = m.ajuste
      ? '<b>Giro de ajuste</b>: coloca la cara de arriba antes de la fórmula.'
      : (drill.kind === 'F2L'
        ? 'Junta la esquina con su arista y mete el par en su hueco.'
        : 'Sigue la fórmula. El asterisco marca los giros de ajuste.');
  }
}

// --- gestor de algoritmos ----------------------------------------------
function renderAlgos() {
  const lista = mis.algsDe(drill.kind, drill.caso);
  const sel = mis.indiceElegido(drill.kind, drill.caso);
  $('#dr-algos-n').textContent = lista.length === 1 ? '1 guardado' : lista.length + ' guardados';
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
  $('#dr-grabar').innerHTML = drill.grabando ? '⏹ Parar' : '🔴 Grabar con el cubo';
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
  ctx.toast('✅ Guardado y elegido como preferido');
  recalcularBase();
  return true;
}

// --- grabar leyendo los giros del cubo ---------------------------------
function alternarGrabacion() {
  if (drill.grabando) { terminarGrabacion(false); return; }
  if (drill.fase === 'preparar') {
    ctx.toast('Prepara antes el caso: así sé desde dónde grabas', 3000);
    return;
  }
  drill.grabando = true;
  drill.grabados = [];
  drill.estadoAlEmpezar = ctx.app.state.slice();
  ctx.fx.tone(660, 0.12, 'square', 0.14);
  ctx.toast('🔴 Grabando: resuelve el caso a tu manera');
  renderDrill();
}

function terminarGrabacion(automatico) {
  drill.grabando = false;
  const movs = drill.grabados.slice();
  drill.grabados = [];
  if (!movs.length) { ctx.toast('No has hecho ningún giro'); renderDrill(); return; }
  const texto = mis.limpiarGrabacion(movs);
  if (!texto) { ctx.toast('Sólo has girado la cara de arriba'); renderDrill(); return; }
  if (!automatico && !resuelveElCaso(texto, drill.caso, drill.kind)) {
    ctx.toast('❌ Eso no resuelve el caso, no lo guardo', 3200);
    ctx.fx.oops();
    renderDrill();
    return;
  }
  if (confirm('¿Guardar este algoritmo?\n\n' + texto
    + '\n\n(' + movs.length + ' giros grabados, ' + texto.split(' ').length + ' tras limpiar los ajustes)')) {
    guardarAlgoritmo(texto);
  } else {
    renderDrill();
  }
}

function drillOnState(state) {
  const sc = escena('dr-scene');
  if (!sc.animating) sc.render(state);

  if (drill.fase === 'preparar') {
    if (state.join('') === drill.objetivo.join('')) {
      drill.fase = 'listo';
      drill.hist = [];
      ctx.fx.good();
      renderDrill();
    }
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
