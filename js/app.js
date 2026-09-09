// ============================================================
//  app.js — Pantallas, juegos y pegamento general
// ============================================================

import {
  FACES, OPPOSITE, solvedState, applyMove, applyAlg, expandAlg, isSolved,
  invertAlg, simplifyAlg, moveToString, rotateFrame, findRotation,
} from './cube.js';
import { decode, toFacelets, VALUE_COLOR } from './xiaomi.js';
import { solve, PHASE_INFO, detalleDe } from './solver.js';
import { SmartCube } from './giiker.js';
import { Calibration, COLOR_HEX, COLOR_OPPOSITE, COLORS } from './calibrate.js';
import { Cube3D, arrowSVG, netHTML } from './cube3d.js';
import { fx } from './fx.js';
import { lessonById, LESSONS } from './lessons.js';
import { PATRONES, patronPorId } from './patrones.js';
import { giroDeTecla, escribiendo, construirPad } from './entrada.js';
import {
  caraAlAzar, ritmoLluvia, avanzarGotas, gotaQueSeApaga,
  caminoNuevo, largoDelCamino, LLUVIA,
} from './juegos.js';
import { t, idioma, fijarIdioma, IDIOMAS, traducirDOM, sinTraducir } from './i18n.js';
import { enIOS } from './plataforma.js';
import * as sections from './sections.js';

// ------------------------------------------------------------
//  Colores
// ------------------------------------------------------------
// "la cara ROJA", no "la cara ROJO"
const COLOR_FEM = {
  blanco: 'blanca', amarillo: 'amarilla', verde: 'verde',
  azul: 'azul', rojo: 'roja', naranja: 'naranja',
};
const COLOR_SHORT = {
  blanco: 'BLA', amarillo: 'AMA', verde: 'VER',
  azul: 'AZU', rojo: 'ROJ', naranja: 'NAR',
};
// Esquema estandar visto con el blanco abajo y el verde delante
const DEFAULT_SCHEME = {
  D: 'blanco', U: 'amarillo', F: 'verde', B: 'azul', R: 'naranja', L: 'rojo',
};

// ------------------------------------------------------------
//  Estado global
// ------------------------------------------------------------
const app = {
  cube: null,
  state: solvedState(),
  synced: false,
  faceColor: { ...DEFAULT_SCHEME },
  codeColor: {},        // codigo de cara del cubo -> color
  codeToSolver: {},     // codigo de cara del cubo -> cara del solucionador
  solverToCode: {},
  invert: false,
  stars: {},
  maxLevel: 1,
  game: null,
  screen: 'home',
  mode: 'moves',        // 'state' cuando podemos leer el cubo entero
  frameRot: null,       // giro para poner el blanco abajo
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => Array.from(document.querySelectorAll(sel));

function colorOf(face) { return app.faceColor[face] || 'blanco'; }
// En espanol la cara es femenina ("la cara blanca"); en ingles no hay
// genero, asi que ahi vale el nombre del color tal cual.
function colorFem(face) {
  const c = colorOf(face);
  return idioma() === 'es' ? (COLOR_FEM[c] || c) : t(c);
}
function hexOf(face) { return COLOR_HEX[colorOf(face)] || '#888'; }
function hexMap() {
  const m = {};
  for (const f of FACES) m[f] = hexOf(f);
  return m;
}

// ------------------------------------------------------------
//  Guardado
// ------------------------------------------------------------
const KEY = 'cubo-magico-v1';
function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify({
      faceColor: app.faceColor, invert: app.invert,
      codeColor: app.codeColor, codeToSolver: app.codeToSolver,
      solverToCode: app.solverToCode,
      stars: app.stars, maxLevel: app.maxLevel,
      state: app.state.join(''), synced: app.synced,
      voice: fx.voiceOn,
    }));
  } catch (e) { /* modo privado */ }
}
function load() {
  try {
    const d = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (d.faceColor) app.faceColor = d.faceColor;
    if (d.codeToSolver && Object.keys(d.codeToSolver).length === 6) {
      app.codeColor = d.codeColor || {};
      app.codeToSolver = d.codeToSolver;
      app.solverToCode = d.solverToCode || {};
    }
    if (d.state && d.state.length === 54) app.state = d.state.split('');
    app.invert = !!d.invert;
    app.stars = d.stars || {};
    app.maxLevel = d.maxLevel || 1;
    app.synced = !!d.synced;
    if (d.voice === false) fx.voiceOn = false;
  } catch (e) { /* nada */ }
}

// ------------------------------------------------------------
//  Pantallas
// ------------------------------------------------------------
function go(name) {
  app.screen = name;
  if (name !== 'cal') calibration = null;   // no dejar la calibracion a medias
  $$('.screen').forEach((s) => s.classList.toggle('active', s.id === 'screen-' + name));
  // En las pantallas donde se juega el sitio hace falta, y ademas un nino
  // podria pulsar los enlaces sin querer: el pie solo sale en reposo.
  $('#pie').classList.toggle('hidden', name === 'play' || name === 'drill');
  if (name !== 'play') { stopGame(); }
  if (name === 'menu') refreshMenu();
  if (name === 'levels') buildLevels();
  if (name === 'patrones') buildPatrones();
  if (name === 'diag') refreshDiag();
  if (name === 'instalar') pintarInstalacion();
  padEn(name === 'play' || name === 'drill' ? name : null);
  sections.onScreen(name);
}

function toast(msg, ms = 1900) {
  const aviso = document.createElement('div');
  aviso.className = 'toast';
  aviso.textContent = msg;
  document.body.appendChild(aviso);
  setTimeout(() => aviso.remove(), ms);
}

// ------------------------------------------------------------
//  Cubo 3D
// ------------------------------------------------------------
let cube3d = null;
function initCube3D() {
  if (cube3d) return;
  const size = Math.min(62, Math.floor((Math.min(window.innerWidth, 520) - 90) / 3.4));
  cube3d = new Cube3D($('#scene'), { size, colors: hexMap() });
  cube3d.render(app.state);
}

function repaint() {
  if (!cube3d) return;
  cube3d.setColors(hexMap());
  cube3d.render(app.state);
}

// ------------------------------------------------------------
//  Lectura directa del estado del cubo
// ------------------------------------------------------------
//  El paquete trae el cubo entero, asi que no hace falta ni
//  calibrar caras ni partir de "resuelto": lo leemos y ya.

/** Adopta el estado que manda el cubo. Devuelve false si no se entiende. */
function readCubeState(raw) {
  const values = decode(raw);
  if (!values) return false;
  const r = toFacelets(values, VALUE_COLOR);
  if (!r) return false;

  if (!app.frameRot) {
    // Colocamos el marco con el blanco abajo y el verde delante, que es
    // como se explica el metodo (primera capa blanca, techo amarillo).
    const caraDe = (color) => Object.keys(r.faceColor).find((f) => r.faceColor[f] === color);
    const rot = findRotation(caraDe('blanco'), 'D', caraDe('verde'), 'F');
    if (!rot) return false;
    app.frameRot = rot;
    app.faceColor = {};
    for (const f of Object.keys(r.faceColor)) app.faceColor[rot[f]] = r.faceColor[f];
    if (cube3d) cube3d.setColors(hexMap());
  }
  const next = rotateFrame(r.state, app.frameRot);
  if (next.join('') === app.state.join('')) return true;   // sin cambios

  const mv = deriveMove(app.state, next);
  app.lastMove = mv;
  app.state = next;
  app.synced = true;
  save();
  if (cube3d) {
    if (mv && !cube3d.animating) cube3d.turn(mv.face, mv.amount, next, 280);
    else cube3d.render(next);
  }
  if (app.game) {
    if (mv && app.game.onMove) app.game.onMove(mv.face, mv.amount);
    else if (app.game.onJump) app.game.onJump();
  }
  sections.onState(app.state);
  return true;
}

/** Que giro convierte un estado en el otro (para animar la pantalla) */
function deriveMove(prev, next) {
  for (const f of FACES) {
    for (const a of [1, 2, 3]) {
      if (applyMove(prev, f, a).join('') === next.join('')) return { face: f, amount: a };
    }
  }
  return null;
}

// ------------------------------------------------------------
//  Entrada de movimientos
// ------------------------------------------------------------
function onPhysicalMove(detail) {
  const face = app.codeToSolver[detail.code];
  if (!face) {
    toast(t('No conozco esa cara del cubo (código {code})', { code: detail.code }));
    return;
  }
  let amt = detail.amount;
  if (app.invert && amt !== 2) amt = (4 - amt) % 4;
  doMove(face, amt, true);
}

function doMove(face, amount, fromCube) {
  const next = applyMove(app.state, face, amount);
  app.lastMove = { face, amount };
  app.state = next;
  save();
  if (cube3d) {
    if (cube3d.animating) cube3d.render(next);
    else cube3d.turn(face, amount, next, 280);
  }
  if (!fromCube) fx.click();
  if (app.game && app.game.onMove) app.game.onMove(face, amount);
  sections.onState(app.state);
}

// ------------------------------------------------------------
//  Conexión
// ------------------------------------------------------------
async function connect(anyDevice) {
  try {
    const cube = new SmartCube();
    cube.addEventListener('move', (e) => {
      lastMoveInfo = e.detail;
      if (calibration) calibration.onMove(e.detail);
      else if (app.mode !== 'state') onPhysicalMove(e.detail);
      if (app.screen === 'diag') refreshDiag();
    });
    cube.addEventListener('packet', (e) => {
      lastPacket = e.detail;
      if (app.mode === 'state') {
        if (!readCubeState(e.detail.raw)) app.mode = 'moves';
      } else if (e.detail.solved) {
        autoSync();   // sin lectura directa, al menos detectamos "resuelto"
      }
      if (app.screen === 'diag') refreshDiag();
    });
    cube.addEventListener('battery', () => { if (app.screen === 'diag') refreshDiag(); });
    cube.addEventListener('disconnect', () => {
      toast('El cubo se ha desconectado');
      refreshMenu();
    });
    await cube.connect({ anyDevice });
    app.cube = cube;
    fx.good();

    // ¿Podemos leer el cubo entero? Entonces no hace falta calibrar nada.
    app.frameRot = null;
    if (cube.lastPacket && readCubeState(cube.lastPacket.raw)) {
      app.mode = 'state';
      app.synced = true;
      save();
      const yaVisto = localStorage.getItem(KEY + '-ok') === '1';
      localStorage.setItem(KEY + '-ok', '1');
      toast(t('¡Conectado! Leo tu cubo directamente'));
      if (yaVisto) go('menu');
      else startGame('explore', null, true);
      return;
    }
    app.mode = 'moves';
    const first = localStorage.getItem(KEY + '-cal') !== '2';
    go(first ? 'cal' : 'menu');
    if (!first) toast(t('¡Cubo conectado!'));
  } catch (err) {
    if (err && err.name === 'NotFoundError' && !anyDevice) {
      // El usuario cerro el dialogo, o no habia nada que enseñar
      $('#home-note').innerHTML =
        t('No apareció ningún cubo. Pulsa <b>🔍 No sale mi cubo en la lista</b>.');
      return;
    }
    console.error(err);
    reportConnectionError(err);
  }
}

/** Enseña por que ha fallado la conexion, con el detalle tecnico si lo hay */
function reportConnectionError(err) {
  const box = $('#scan-report');
  const msg = (err && err.message) || String(err);
  let html = '<b>' + t('No he podido usar ese aparato') + '</b><br>' + msg;
  if (err && err.report && err.report.length) {
    html += '<hr><b>' + t('Lo que expone:') + '</b><br>' + err.report.map((r) =>
      '<code>' + r.service + '</code><br>' +
      r.chars.map((c) => '&nbsp;&nbsp;· <code>' + c + '</code>').join('<br>')).join('<br>');
    html += '<hr>' + t('Copia esto y pásamelo: con ello puedo dar soporte a tu modelo.');
  } else if (err && err.name === 'NotFoundError') {
    html = t('<b>No has elegido ningún aparato</b><br>Si la lista salía vacía, '
      + 'repasa los cuatro puntos de arriba: lo más habitual es que el cubo esté '
      + 'dormido o cogido por el móvil.');
  }
  box.innerHTML = html;
  box.classList.remove('hidden');
  go('scan');
}
// ------------------------------------------------------------
//  Calibración: aprender el cubo real
// ------------------------------------------------------------
let calibration = null;
let lastMoveInfo = null;
let lastPacket = null;

function swatchHTML(color) {
  return '<div style="width:96px;height:96px;border-radius:24px;margin:0 auto;' +
    'border:5px solid rgba(0,0,0,.25);box-shadow:inset 0 -10px 18px rgba(0,0,0,.18);' +
    'background:' + COLOR_HEX[color] + '"></div>';
}

function calProgress(done, total) {
  const box = $('#cal-prog');
  box.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const b = document.createElement('b');
    b.textContent = i + 1;
    if (i < done) b.className = 'done';
    else if (i === done) b.className = 'now';
    box.appendChild(b);
  }
}

const calUI = {
  askColor(color, done) {
    calProgress(done, 8);
    $('#cal-choice').classList.add('hidden');
    $('#cal-emoji').innerHTML = swatchHTML(color);
    const nombre = idioma() === 'es' ? (COLOR_FEM[color] || color) : t(color);
    $('#cal-title').textContent = t('Gira la cara {color}', { color: nombre.toUpperCase() });
    $('#cal-text').innerHTML =
      t('Busca la cara cuyo <b>centro</b> es {color} y dale un cuarto de vuelta.',
        { color: idioma() === 'es' ? color : t(color) })
      + '<br><small>' + t('El centro nunca cambia de sitio: es el color de esa cara.') + '</small>';
    $('#cal-start').classList.add('hidden');
    fx.say(t('Gira la cara {color}', { color: nombre }));
  },
  gotColor() { fx.good(); },
  note(msg) { toast(msg); },
  warn(html) { $('#cal-text').innerHTML = html; fx.oops(); },

  askRight() {
    calProgress(6, 8);
    $('#cal-emoji').innerHTML =
      '<div style="display:flex;gap:6px;justify-content:center;align-items:flex-end">' +
      '<div style="width:54px;height:54px;border-radius:12px;background:' + COLOR_HEX.verde + '"></div>' +
      '<div style="width:34px;height:34px;border-radius:10px;background:#7a6a92;' +
      'display:grid;place-items:center;font-size:1.2rem">?</div></div>' +
      '<div style="width:96px;height:22px;border-radius:8px;margin:4px auto 0;background:' +
      COLOR_HEX.blanco + '"></div>';
    $('#cal-title').textContent = t('¿Qué hay a la derecha?');
    $('#cal-text').innerHTML =
      t('Coge el cubo con el <b>blanco abajo</b> y el <b>verde de frente</b>.') + '<br>'
      + t('¿Qué color te queda en la cara de la <b>derecha</b>?');
    const box = $('#cal-choice');
    box.classList.remove('hidden');
    box.innerHTML = '';
    box.style.gridTemplateColumns = 'repeat(2,1fr)';
    for (const color of ['rojo', 'naranja']) {
      const b = document.createElement('button');
      b.style.background = COLOR_HEX[color];
      b.textContent = t(color).toUpperCase();
      b.onclick = () => { fx.click(); calibration.chooseRight(color); };
      box.appendChild(b);
    }
    fx.say(t('Con el blanco abajo y el verde delante, ¿qué color queda a la derecha?'));
  },

  askDirection() {
    calProgress(7, 8);
    $('#cal-choice').classList.add('hidden');
    $('#cal-emoji').innerHTML = arrowSVG(true, '#fff')
      .replace('class="arrow"', 'style="width:120px;height:120px"');
    $('#cal-title').textContent = t('Último paso');
    $('#cal-text').innerHTML =
      t('Mira el cubo de frente a la cara <b>BLANCA</b> y gírala un cuarto de vuelta '
        + '<b>en el sentido de la flecha</b>.');
    fx.say(t('Mirando la cara blanca, gírala en el sentido de la flecha'));
  },

  fail(msg) {
    $('#cal-choice').classList.add('hidden');
    $('#cal-emoji').textContent = '🤔';
    $('#cal-title').textContent = t('Algo no cuadra');
    $('#cal-text').innerHTML = msg + '<br>' + t('Vamos a repetirlo.');
    $('#cal-start').classList.remove('hidden');
    $('#cal-start').textContent = t('Volver a empezar');
    calibration = null;
    fx.oops();
  },

  done(result) {
    calibration = null;
    app.codeColor = result.codeColor;
    app.codeToSolver = result.codeToSolver;
    app.solverToCode = result.solverToCode;
    app.faceColor = result.faceColor;
    app.invert = result.invert;
    localStorage.setItem(KEY + '-cal', '2');
    save();
    repaint();
    fx.fanfare();
    calProgress(8, 8);
    toast(result.invert ? t('Listo. Tu cubo cuenta al revés y ya lo sé.') : t('¡Listo!'));
    startGame('explore', null, true);   // modo comprobación
  },
};

function startCalibration() {
  $('#cal-start').classList.add('hidden');
  calibration = new Calibration(calUI);
}

function useDefaultCalibration() {
  // Suposición del protocolo GiiKER: códigos 1..6 = B,D,L,U,R,F
  const guess = { 1: 'B', 2: 'D', 3: 'L', 4: 'U', 5: 'R', 6: 'F' };
  app.codeToSolver = guess;
  app.solverToCode = {};
  app.codeColor = {};
  for (const code of Object.keys(guess)) {
    app.solverToCode[guess[code]] = Number(code);
    app.codeColor[code] = DEFAULT_SCHEME[guess[code]];
  }
  app.faceColor = { ...DEFAULT_SCHEME };
}


// ------------------------------------------------------------
//  Menú
// ------------------------------------------------------------
function refreshMenu() {
  const chip = $('#chip-sync');
  const connected = app.cube && app.cube.connected;
  if (app.mode === 'state') {
    chip.className = 'chip ok';
    chip.textContent = t('👁️ Leyendo el cubo');
  } else if (app.synced) {
    chip.className = 'chip ok';
    chip.textContent = t('✅ Cubo al día');
  } else {
    chip.className = 'chip warn';
    chip.textContent = t('⚠️ Púlsame con el cubo resuelto');
  }
  $('#menu-note').textContent = connected
    ? t('Conectado a {nombre}', { nombre: app.cube.name })
    : t('Modo sin cubo: gira con el teclado (U R F D L B, con Mayúsculas al revés) '
      + 'o con los botones de la pantalla.');
  $('#btn-recal').classList.toggle('hidden', !connected || app.mode === 'state');
  $('#btn-diag').classList.toggle('hidden', !connected);
  $$('#btn-voice, #btn-voice2').forEach((b) => b.classList.toggle('on', fx.voiceOn));
}

/** El cubo dice que está resuelto: ponemos el marcador a cero sin molestar */
function autoSync() {
  const yaEstaba = app.synced && isSolved(app.state);
  app.state = solvedState();
  const era = app.synced;
  app.synced = true;
  save();
  repaint();
  if (!yaEstaba) {
    if (!era) toast(t('He visto que el cubo está resuelto ✅'));
    if (app.screen === 'menu') refreshMenu();
    if (app.game && app.game.resync) app.game.resync();
  }
}

let syncArmed = false;
function askSync() {
  if (app.mode === 'state') {
    toast('No hace falta: leo tu cubo directamente 👁️');
    return;
  }
  const chip = $('#chip-sync');
  if (!syncArmed) {
    syncArmed = true;
    chip.className = 'chip warn';
    chip.textContent = t('¿Seguro? Pulsa otra vez');
    setTimeout(() => { syncArmed = false; refreshMenu(); }, 4000);
    return;
  }
  syncArmed = false;
  markSynced();
}

function markSynced() {
  app.state = solvedState();
  app.synced = true;
  save();
  repaint();
  fx.good();
  toast(t('¡Genial! Ahora sé cómo está tu cubo'));
  refreshMenu();
}

// ------------------------------------------------------------
//  Niveles
// ------------------------------------------------------------
function buildLevels() {
  const box = $('#levels');
  box.innerHTML = '';
  for (let n = 1; n <= 8; n++) {
    const b = document.createElement('button');
    const st = app.stars['undo' + n] || 0;
    b.innerHTML = n + '<span class="stars">' + (st ? '⭐'.repeat(Math.min(st, 3)) : '&nbsp;') + '</span>';
    if (n > app.maxLevel) b.disabled = true;
    b.onclick = () => { fx.click(); startGame('undo', n); };
    box.appendChild(b);
  }
}

// ------------------------------------------------------------
//  Patrones
// ------------------------------------------------------------
/** Cómo queda el cubo con ese patrón (se calcula, no se dibuja a mano) */
function estadoPatron(pat) {
  return applyAlg(solvedState(), expandAlg(pat.alg));
}

function buildPatrones() {
  const box = $('#pat-lista');
  box.innerHTML = '';
  for (const pat of PATRONES) {
    const b = document.createElement('button');
    const hecho = (app.stars['patron-' + pat.id] || 0) > 0;
    if (hecho) b.classList.add('hecho');
    b.innerHTML = netHTML(estadoPatron(pat), hexMap(), 6)
      + `<b>${pat.emoji} ${t(pat.nombre)}</b>`
      + `<em>${'●'.repeat(pat.dificultad)}${'○'.repeat(3 - pat.dificultad)}`
      + `${hecho ? ' ✓' : ''}</em>`;
    b.onclick = () => { fx.click(); startGame('patron', pat.id); };
    box.appendChild(b);
  }
}

// ------------------------------------------------------------
//  Panel de instrucción
// ------------------------------------------------------------
let juegoActual = { kind: null, arg: null, verify: false };
let previewTimer = null;
function stopPreview() { clearInterval(previewTimer); clearTimeout(showMove._t); previewTimer = null; }

/** Tarjeta de "gira esta cara": color + flecha + texto */
function moveCard(face, amount) {
  const name = colorFem(face).toUpperCase();
  const cw = amount !== 3;
  const twice = amount === 2;
  const arrow = twice
    ? arrowSVG(true, '#24123f') + '<div class="move-x2">×2</div>'
    : arrowSVG(cw, '#24123f');
  const pie = twice ? t('dos vueltas enteras')
    : cw ? t('hacia la flecha') : t('al revés de la flecha');
  return `<div class="face-chip" style="background:${hexOf(face)}"></div>${arrow}`
    + `<div class="move-text">${t('Cara {cara}', { cara: name })}<small>${pie}</small></div>`;
}

function showMove(face, amount, extra) {
  $('#play-move').innerHTML = moveCard(face, amount);
  if (extra !== undefined) $('#play-tip').textContent = extra;
  if (!cube3d) return;

  // El cubo de la pantalla enseña el movimiento una y otra vez, para que un
  // nino que todavia no lee pueda simplemente copiarlo.
  stopPreview();
  cube3d.lookAt(face);
  const play = () => { if (cube3d && !cube3d.animating) cube3d.turn(face, amount, null, 750); };
  showMove._t = setTimeout(play, 520);
  previewTimer = setInterval(play, 2600);
}

function clearMove(html) {
  stopPreview();
  $('#play-move').innerHTML = html || '';
}

function sayMove(face, amount) {
  const name = colorFem(face);
  if (amount === 2) fx.say(t('Cara {cara}, dos vueltas', { cara: name }));
  else fx.say(t('Cara {cara}', { cara: name }) + (amount === 3 ? t(', al revés') : ''));
}

function setFormula(list, idx) {
  const box = $('#play-formula');
  if (!list || !list.length) { box.innerHTML = ''; return; }
  box.innerHTML = list.map((m, i) => {
    const cls = i < idx ? 'done' : i === idx ? 'now' : '';
    return `<span class="${cls}" style="${i === idx ? 'background:' + hexOf(m.face) + ';color:#1c1030' : ''}">${moveToString(m)}</span>`;
  }).join('');
}

function setSteps(total, doneCount, curLabel) {
  const box = $('#play-steps');
  box.innerHTML = '';
  for (let i = 0; i < total; i++) {
    const b = document.createElement('b');
    b.textContent = i + 1;
    if (i < doneCount) b.className = 'done';
    else if (i === doneCount) b.className = 'now';
    box.appendChild(b);
  }
  if (curLabel !== undefined) $('#play-phase').innerHTML = curLabel;
}

function setBar(pct) { $('#play-bar').style.width = Math.max(0, Math.min(100, pct)) + '%'; }

// ------------------------------------------------------------
//  Meter giros sin cubo: teclado de verdad y botones en pantalla
// ------------------------------------------------------------
//  El teclado de pantalla es UNO solo y se muda a la pantalla que lo
//  necesite (jugar, la guia de Fridrich, entrenar un caso). Antes vivia
//  dentro de la pantalla de juego y por eso el resto del modo sin cubo
//  se quedaba sin manera de mover el cubo.
//
//  Las teclas de verdad valen exactamente donde se ven los botones. Asi
//  la regla es facil de tener en la cabeza y, sobre todo, con un cubo
//  conectado no hay teclas que muevan el cubo de la pantalla y lo dejen
//  diciendo una cosa distinta de la que tienes en la mano.

let padPantalla = null;

/** ¿Estamos sin cubo, o sea, hay que dar nosotros los giros? */
function sinCubo() { return !(app.cube && app.cube.connected); }


/** Mete el teclado de pantalla en `pantalla`, o lo quita con null */
function padEn(pantalla) {
  const pad = $('#pad');
  const hueco = pantalla && sinCubo()
    ? $('#screen-' + pantalla + ' .pad-slot')
    : null;
  padPantalla = hueco ? pantalla : null;
  pad.classList.toggle('hidden', !hueco);
  if (!hueco) return;
  if (pad.parentElement !== hueco) hueco.appendChild(pad);
  construirPad(pad, {
    caras: FACES,
    hexOf,
    corto: (f) => t(COLOR_SHORT[colorOf(f)] || ''),
    onMove: (f, amount) => doMove(f, amount, false),
  });
}

// ------------------------------------------------------------
//  JUEGO 1 — Conoce tu cubo
// ------------------------------------------------------------
function gameExplore(verify) {
  const seen = new Set();
  return {
    get title() { return verify ? t('🔍 Comprobación') : t('🎈 Conoce tu cubo'); },
    start() {
      if (verify) {
        $('#play-tip').textContent = app.mode === 'state'
          ? t('Leo tu cubo directamente. Gira unas caras y comprueba que la pantalla va igual: colores incluidos.')
          : t('Gira unas cuantas caras y mira si el cubo de la pantalla hace exactamente lo mismo que el tuyo.');
        clearMove('<div class="move-text" style="text-align:center">' + t('¿Se mueve igual?<small>gira una cara y compara</small>') + '</div>');
        setSteps(6, 0, t('Comprobando que te entiendo bien'));
        setFormula(null); setBar(0);
        const a = $('#play-action'), b = $('#play-action2');
        a.classList.remove('hidden');
        a.textContent = t('✅ Sí, se mueve igual');
        a.onclick = () => { fx.click(); fx.fanfare(); toast(t('¡Perfecto! Ya podemos jugar')); go('menu'); };
        b.classList.remove('hidden');
        b.textContent = t('❌ No, hace otra cosa');
        b.onclick = () => {
          fx.click();
          go('cal');
          $('#cal-start').classList.remove('hidden');
          $('#cal-start').textContent = t('Volver a empezar');
          $('#cal-emoji').textContent = '🔁';
          $('#cal-title').textContent = t('Lo intentamos otra vez');
          $('#cal-text').innerHTML = t('Sin problema. Fíjate en girar la cara cuyo <b>centro</b> '
            + 'es del color que te pido, y con el cubo quieto en la mano.');
        };
        fx.say(t('Gira una cara y comprueba si el cubo de la pantalla hace lo mismo'));
        return;
      }
      $('#play-tip').textContent = t('Gira las caras que quieras. Te diré de qué color son.');
      clearMove('<div class="move-text" style="text-align:center">' + t('Gira una cara<small>a ver de qué color es</small>') + '</div>');
      setFormula(null);
      setSteps(6, 0, t('¿Cuántos colores encuentras?'));
      setBar(0);
      fx.say(t('Gira una cara del cubo'));
    },
    onMove(face, amount) {
      seen.add(face);
      showMove(face, amount, t('¡Muy bien!'));
      sayMove(face, amount);
      setSteps(6, seen.size, verify
        ? t('Caras reconocidas: {n} de 6', { n: seen.size })
        : t('Colores encontrados: {n} de 6', { n: seen.size }));
      setBar(seen.size / 6 * 100);
      if (seen.size === 6 && !verify) {
        award('explore', 3);
        fx.fanfare(); fx.confetti();
        fx.say(t('¡Bravo! Has encontrado los seis colores'));
        $('#play-tip').textContent = t('¡Has encontrado los 6 colores! 🎉');
      }
    },
  };
}

// ------------------------------------------------------------
//  JUEGO 2 — Deshaz la mezcla
// ------------------------------------------------------------
function gameUndo(level) {
  let phase = 'scramble';
  let done = 0;
  let history = [];
  let target = null;
  let hintTimer = null;
  let hintShown = false;

  function nextUndo() {
    const inv = invertAlg(simplifyAlg(history));
    return inv[0] || null;
  }

  function showHint(force) {
    const m = nextUndo();
    if (!m) return;
    hintShown = true;
    showMove(m.face, m.amount, t('Deshaz este movimiento'));
    if (force) sayMove(m.face, m.amount);
  }

  function armHint() {
    clearTimeout(hintTimer);
    hintShown = false;
    const left = simplifyAlg(history).length;
    if (level <= 2) { showHint(false); return; }
    clearMove('<div class="move-text" style="text-align:center">' + t('¿Te acuerdas?<small>Quedan {n}</small>', { n: left }) + '</div>');
    hintTimer = setTimeout(() => showHint(true), 7000);
  }

  return {
    get title() { return t('🔙 Nivel {n}', { n: level }); },
    start() {
      target = app.state.slice();
      const uno = level === 1;
      $('#play-tip').textContent = uno
        ? t('Haz {n} movimiento tú, los que quieras. Yo me los apunto.', { n: level })
        : t('Haz {n} movimientos tú, los que quieras. Yo me los apunto.', { n: level });
      clearMove('<div class="move-text" style="text-align:center">' + (uno
        ? t('Mezcla tú<small>{n} movimiento</small>', { n: level })
        : t('Mezcla tú<small>{n} movimientos</small>', { n: level })) + '</div>');
      setFormula(null);
      setSteps(level, 0, t('🌀 Mezclando'));
      setBar(0);
      fx.say(uno ? t('Haz {n} movimiento tú', { n: level })
        : t('Haz {n} movimientos tú', { n: level }));
    },
    stop() { clearTimeout(hintTimer); },
    onMove(face, amount) {
      if (phase === 'scramble') {
        history.push({ face, amount });
        done++;
        setSteps(level, done, t('🌀 Mezclando'));
        setBar(done / level * 50);
        if (done >= level) {
          phase = 'solve';
          setSteps(level, 0, t('🔍 ¡Ahora al revés!'));
          $('#play-tip').textContent = t('Deshaz los movimientos, del último al primero.');
          fx.good();
          fx.say(t('Ahora deshazlo, del último al primero'));
          setTimeout(armHint, 900);
        } else {
          showMove(face, amount, t('Te quedan {n}', { n: level - done }));
        }
        return;
      }
      // fase de deshacer
      history.push({ face, amount });
      const left = simplifyAlg(history).length;
      setSteps(level, Math.max(0, level - left), t('🔍 Quedan {n}', { n: left }));
      setBar(50 + (level - left) / level * 50);
      if (app.state.join('') === target.join('')) {
        clearTimeout(hintTimer);
        phase = 'done';
        const stars = hintShown ? 2 : 3;
        award('undo' + level, stars);
        if (level >= app.maxLevel && app.maxLevel < 8) { app.maxLevel = level + 1; save(); }
        clearMove('<div class="move-text" style="text-align:center">' + t('¡LO HAS CONSEGUIDO!<small>{estrellas}</small>',
          { estrellas: '⭐'.repeat(stars) }) + '</div>');
        $('#play-tip').textContent = t('El cubo ha vuelto a su sitio 🎉');
        setBar(100);
        fx.fanfare(); fx.confetti();
        fx.say(t('¡Muy bien! Lo has conseguido'));
        $('#play-action').classList.remove('hidden');
        $('#play-action').textContent = level < 8 ? t('➡️ Siguiente nivel') : t('🏠 Volver al menú');
        $('#play-action').onclick = () => {
          fx.click();
          if (level < 8) startGame('undo', level + 1); else go('menu');
        };
        return;
      }
      if (left > level + 3) {
        $('#play-tip').textContent = 'Te ayudo un poquito 😊';
        showHint(true);
      } else {
        armHint();
      }
    },
    onJump() {
      if (phase === 'solve' && app.state.join('') === target.join('')) {
        this.onMove('U', 4);      // fuerza la comprobacion de victoria
      }
    },
    hint() { showHint(true); },
  };
}

// ------------------------------------------------------------
//  JUEGO 3 — Resuélvelo conmigo
// ------------------------------------------------------------
function gameSolve() {
  let plan = null;
  let total = 1;
  let ci = 0, mi = 0;      // indice de formula y de movimiento
  let lastPhaseId = null;

  function replan(announce) {
    try {
      plan = solve(app.state);
    } catch (e) {
      plan = null;
      clearMove('<div class="move-text" style="text-align:center">' + t('Ups…<small>{error}</small>', { error: e.message }) + '</div>');
      $('#play-tip').textContent = t('Pon el cubo resuelto y pulsa el botón de arriba para volver a empezar.');
      app.synced = false; save();
      return false;
    }
    ci = 0; mi = 0;
    if (announce || plan.length > total) total = Math.max(plan.length, 1);
    return true;
  }

  function render() {
    if (!plan) return;
    if (!plan.phases.length) {
      // resuelto
      clearMove('<div class="move-text" style="text-align:center">' + t('¡CUBO RESUELTO!<small>⭐⭐⭐</small>') + '</div>');
      $('#play-tip').textContent = t('Lo has hecho tú. Enséñaselo a todo el mundo 🏆');
      setFormula(null); setBar(100);
      setSteps(PHASE_INFO.length, PHASE_INFO.length, t('🏆 ¡Terminado!'));
      award('solve', 3);
      fx.fanfare(); fx.confetti(document.body, 160);
      fx.say(t('¡Cubo resuelto! Eres un campeón'));
      $('#play-action').classList.remove('hidden');
      $('#play-action').textContent = t('🏠 Volver al menú');
      $('#play-action').onclick = () => { fx.click(); go('menu'); };
      return;
    }
    const ph = plan.phases[0];
    const idx = PHASE_INFO.findIndex((p) => p.id === ph.id);
    setSteps(PHASE_INFO.length, idx, ph.emoji + ' ' + t(ph.name));
    setBar(100 - (plan.length / total) * 100);

    const chunk = ph.chunks[ci];
    if (!chunk) { replan(); render(); return; }
    const m = chunk.alg[mi];
    setFormula(chunk.alg, mi);
    showMove(m.face, m.amount, t(chunk.hint || ph.kid));
    if (ph.id !== lastPhaseId) {
      lastPhaseId = ph.id;
      fx.say(t(ph.name) + '. ' + t(ph.kid), { rate: 1 });
      setTimeout(() => sayMove(m.face, m.amount), 300);
    } else {
      sayMove(m.face, m.amount);
    }
  }

  return {
    get title() { return t('🏆 Resuélvelo conmigo'); },
    start() {
      $('#play-action').classList.add('hidden');
      if (!app.synced && app.mode !== 'state') {
        clearMove('<div class="move-text" style="text-align:center">' + t('Antes de empezar…<small>necesito saber cómo está tu cubo</small>') + '</div>');
        $('#play-tip').textContent = t('Pon el cubo RESUELTO y pulsa el botón de abajo.');
        setFormula(null); setSteps(PHASE_INFO.length, 0, t('Preparando'));
        $('#play-action').classList.remove('hidden');
        $('#play-action').textContent = t('✅ Ya está resuelto');
        $('#play-action').onclick = () => {
          markSynced();
          $('#play-action').classList.add('hidden');
          if (replan(true)) render();
        };
        return;
      }
      if (replan(true)) render();
    },
    onMove(face, amount) {
      if (!plan) { if (replan(true)) render(); return; }
      const ph = plan.phases[0];
      const chunk = ph && ph.chunks[ci];
      const expected = chunk && chunk.alg[mi];
      if (expected && expected.face === face && expected.amount === amount) {
        fx.tone(760, 0.08, 'sine', 0.13);
        mi++;
        if (mi >= chunk.alg.length) { ci++; mi = 0; }
        plan.length -= 1;
        if (!ph.chunks[ci]) { replan(); }
        else if (plan.length <= 0) { replan(); }
      } else {
        fx.oops();
        replan();
        $('#play-tip').textContent = t('No pasa nada, seguimos por aquí 😊');
      }
      render();
    },
    onJump() {            // el cubo dio mas de un giro de golpe
      if (replan()) render();
    },
    hint() {
      if (!plan || !plan.phases.length) return;
      const ph = plan.phases[0];
      fx.say(t(ph.kid), { rate: 1 });
      $('#play-tip').textContent = t(ph.goal);
    },
  };
}

// ------------------------------------------------------------
//  JUEGO 4 — Practicar una lección del tutorial
// ------------------------------------------------------------
let modoDetalle = false;

/**
 * Curso guiado: recorre los ocho pasos del metodo de principio a fin.
 * Quien manda es el solucionador: la leccion que se ensena es siempre la
 * del paso que toca ahora mismo, asi que el curso avanza solo y nunca
 * puede pedir un paso que ya estaba hecho.
 */
/**
 * Curso guiado: los ocho pasos del metodo, de principio a fin.
 *
 * Sigue el plan del solucionador con un indice, igual que "Resuelvelo
 * conmigo", y solo vuelve a calcular si te equivocas. Recalcular en cada
 * giro no funcionaria: a mitad de un algoritmo el cubo rompe a proposito
 * lo ya hecho, y la guia se pondria a dar vueltas.
 */
function gameCurso(desdeId) {
  let plan = null;
  let ci = 0, mi = 0;            // formula actual y movimiento dentro de ella
  let mostrando = null;          // leccion que se esta ensenando
  let fase = 'guiando';          // guiando | celebrando | fin
  let temporizador = 0;

  function replanificar() {
    try { plan = solve(app.state); ci = 0; mi = 0; return true; }
    catch (e) {
      plan = null;
      clearMove('<div class="move-text" style="text-align:center">Ups…<small>' + e.message + '</small></div>');
      $('#play-tip').textContent = 'Pon el cubo resuelto y vuelve a empezar.';
      return false;
    }
  }

  function pintar() {
    if (fase !== 'guiando' || !plan) return;
    if (!plan.phases.length) { terminar(); return; }

    const faseSolver = plan.phases[0];
    const lec = lessonById(faseSolver.id) || LESSONS[0];
    if (mostrando !== lec.id) presentar(lec);

    const chunk = faseSolver.chunks[ci];
    if (!chunk) { if (replanificar()) pintar(); return; }
    const m = chunk.alg[mi];
    if (!m) { if (replanificar()) pintar(); return; }

    setSteps(LESSONS.length, LESSONS.findIndex((l) => l.id === lec.id), lec.emoji + ' ' + t(lec.title));
    setBar(Math.max(0, Math.min(100, lec.progreso(app.state) * 100)));
    setFormula(chunk.alg, mi);
    showMove(m.face, m.amount, t(modoDetalle
      ? (detalleDe(chunk.hint) || chunk.hint || lec.idea)
      : (chunk.hint || lec.idea)));
  }

  function presentar(lec) {
    mostrando = lec.id;
    $('#play-title').textContent = lec.emoji + ' ' + t(lec.title);
    fx.sayMany([t(lec.title) + '.', t(lec.idea), ...lec.texto.map((p) => t(p))]);
  }

  function celebrar(siguiente) {
    fase = 'celebrando';
    const anterior = lessonById(mostrando);
    if (anterior) award('lesson-' + anterior.id, 3);
    fx.confetti(null, 50);
    fx.fanfare();
    const rotulo = siguiente ? siguiente.emoji + ' ' + t(siguiente.title) : '';
    clearMove('<div class="move-text" style="text-align:center">' + t(anterior ? anterior.hecho : 'Paso conseguido')
      + '<small>' + t('siguiente paso…') + '</small></div>');
    $('#play-tip').textContent = siguiente
      ? t('Muy bien. Ahora: {siguiente}', { siguiente: rotulo }) : '';
    setFormula(null);
    fx.say((anterior ? t(anterior.hecho) + '. ' : '')
      + (siguiente ? t('Siguiente paso: {siguiente}', { siguiente: t(siguiente.title) }) : ''));
    clearTimeout(temporizador);
    temporizador = setTimeout(() => {
      if (app.game !== juego) return;
      fase = 'guiando';
      mostrando = null;
      pintar();
    }, 2200);
  }

  function terminar() {
    fase = 'fin';
    mostrando = null;
    clearMove('<div class="move-text" style="text-align:center">' + t('¡CUBO RESUELTO!<small>has hecho los ocho pasos</small>') + '</div>');
    $('#play-tip').textContent = t('Ya sabes resolverlo entero. Mézclalo y repítelo hasta que te salga solo.');
    setFormula(null); setBar(100);
    setSteps(LESSONS.length, LESSONS.length, t('🏆 Curso terminado'));
    award('curso', 3);
    fx.fanfare(); fx.confetti(document.body, 160);
    fx.say(t('¡Cubo resuelto! Has completado los ocho pasos.'));
    $('#play-action').classList.remove('hidden');
    $('#play-action').textContent = t('📚 Volver al tutorial');
    $('#play-action').onclick = () => { fx.click(); go('tutorial'); };
  }

  const juego = {
    get title() { return t('📚 Curso guiado'); },
    start() {
      $('#play-action').classList.add('hidden');
      $('#btn-detalle').classList.toggle('on', modoDetalle);
      if (isSolved(app.state)) {
        fase = 'fin';
        clearMove('<div class="move-text" style="text-align:center">' + t('El cubo está resuelto<small>mézclalo para empezar</small>') + '</div>');
        $('#play-tip').textContent = t('Desordena el cubo y el curso arrancará solo.');
        setSteps(LESSONS.length, 0, t('📚 Curso guiado')); setBar(0);
        return;
      }
      fase = 'guiando';
      if (replanificar()) pintar();
    },
    stop() { clearTimeout(temporizador); },

    onMove(face, amount) {
      if (fase === 'fin') {
        if (isSolved(app.state)) return;
        fase = 'guiando'; mostrando = null;
        if (replanificar()) pintar();
        return;
      }
      if (fase === 'celebrando') return;      // deja terminar la celebracion
      if (!plan) { if (replanificar()) pintar(); return; }

      const faseSolver = plan.phases[0];
      const chunk = faseSolver && faseSolver.chunks[ci];
      const esperado = chunk && chunk.alg[mi];

      if (esperado && esperado.face === face && esperado.amount === amount) {
        fx.tone(760, 0.08, 'sine', 0.13);
        mi++;
        if (mi >= chunk.alg.length) { ci++; mi = 0; }
        if (!faseSolver.chunks[ci]) {
          // se acabo el paso: celebrar y pasar al siguiente automaticamente
          const antes = faseSolver.id;
          if (!replanificar()) return;
          const siguiente = plan.phases.length ? lessonById(plan.phases[0].id) : null;
          if (!plan.phases.length) { terminar(); return; }
          if (plan.phases[0].id !== antes) { celebrar(siguiente); return; }
        }
      } else {
        fx.oops();
        if (!replanificar()) return;
        $('#play-tip').textContent = t('No pasa nada, seguimos desde aquí 😊');
      }
      pintar();
    },

    onJump() {
      if (fase === 'celebrando') return;
      if (replanificar()) { fase = 'guiando'; pintar(); }
    },

    hint() {
      const lec = lessonById(mostrando);
      if (!lec) return;
      $('#play-tip').textContent = t(lec.truco).replace(/<[^>]+>/g, '');
      fx.say(t(lec.truco));
    },

    detalle() {
      modoDetalle = !modoDetalle;
      $('#btn-detalle').classList.toggle('on', modoDetalle);
      toast(modoDetalle ? t('🔍 Te explico cada movimiento') : t('Modo detalle apagado'));
      pintar();
      if (modoDetalle && plan && plan.phases.length) {
        const c = plan.phases[0].chunks[ci];
        const det = detalleDe(c && c.hint);
        if (det) fx.say(t(det));
      }
    },

    repetir() {
      const lec = lessonById(mostrando);
      if (lec) fx.sayMany([t(lec.title) + '.', t(lec.idea), ...lec.texto.map((p) => t(p))]);
    },
  };
  return juego;
}

// ------------------------------------------------------------
//  JUEGO 5 — Hacer un patrón
// ------------------------------------------------------------
function gamePatron(id) {
  const pat = patronPorId(id);
  const alg = expandAlg(pat.alg);
  const objetivo = estadoPatron(pat);
  let fase = 'resolver';        // resolver | haciendo | hecho
  let plan = null, pi = 0;      // para dejar el cubo resuelto primero
  let hist = [];                // giros dados ya dentro del patrón

  const restante = () => simplifyAlg(invertAlg(hist).concat(alg));

  function objetivoHTML(txt) {
    return '<div class="objetivo">' + netHTML(objetivo, hexMap(), 7)
      + '<span>' + txt + '</span></div>';
  }

  function pintar() {
    if (fase === 'hecho') return;

    if (fase === 'resolver') {
      if (isSolved(app.state)) { fase = 'haciendo'; hist = []; pintar(); return; }
      // El plan se calcula una vez y se sigue. Recalcularlo en cada giro
      // haria que la guia cambiase de idea y se quedase dando vueltas.
      if (!plan) {
        try { plan = solve(app.state); pi = 0; } catch (e) {
          clearMove('<div class="move-text" style="text-align:center">' + t('Ups…<small>{error}</small>', { error: e.message }) + '</div>');
          return;
        }
      }
      const m = plan.moves[pi];
      if (!m) { plan = null; pintar(); return; }
      setSteps(2, 0, t('1 · Primero, cubo resuelto'));
      setBar(0);
      setFormula(plan.moves.slice(pi, pi + 10), 0);
      showMove(m.face, m.amount, t('Los patrones salen del cubo resuelto. Te lo dejo listo.'));
      return;
    }

    const faltan = restante();
    if (!faltan.length) { terminar(); return; }
    setSteps(2, 1, t('2 · {patron}', { patron: pat.emoji + ' ' + t(pat.nombre) }));
    setBar(Math.round((1 - faltan.length / alg.length) * 100));
    const enOrden = faltan.length <= alg.length
      && faltan.every((m, k) => {
        const d = alg.length - faltan.length;
        return alg[d + k] && m.face === alg[d + k].face && m.amount === alg[d + k].amount;
      });
    const lista = enOrden ? alg : faltan;
    const hechos = enOrden ? alg.length - faltan.length : 0;
    setFormula(lista, hechos);
    const m = faltan[0];
    showMove(m.face, m.amount, '');
    $('#play-tip').innerHTML = objetivoHTML(enOrden
      ? t('Quedan {n} giros para que quede así.', { n: faltan.length })
      : t('Ese giro no era: te llevo de vuelta.'));
  }

  function terminar() {
    fase = 'hecho';
    clearMove('<div class="move-text" style="text-align:center">' + t('{patron} ¡{NOMBRE}!<small>mira tu cubo</small>',
      { patron: pat.emoji, NOMBRE: t(pat.nombre).toUpperCase() }) + '</div>');
    $('#play-tip').innerHTML = objetivoHTML(t(pat.desc));
    setFormula(null);
    setBar(100);
    setSteps(2, 2, t('🎨 Patrón terminado'));
    award('patron-' + pat.id, 3);
    fx.fanfare(); fx.confetti();
    fx.say(t('¡{patron}! Mira qué bonito', { patron: t(pat.nombre) }));
    $('#play-action').classList.remove('hidden');
    $('#play-action').textContent = t('↩️ Deshacerlo');
    $('#play-action').onclick = () => { fx.click(); startGame('deshacer-patron', id); };
    $('#play-action2').classList.remove('hidden');
    $('#play-action2').textContent = t('🎨 Otro patrón');
    $('#play-action2').onclick = () => { fx.click(); go('patrones'); };
  }

  return {
    get title() { return pat.emoji + ' ' + t(pat.nombre); },
    start() {
      $('#play-action').classList.add('hidden');
      $('#play-action2').classList.add('hidden');
      fase = isSolved(app.state) ? 'haciendo' : 'resolver';
      hist = [];
      fx.say(t(pat.nombre) + '. ' + t(pat.desc), { rate: 1 });
      pintar();
    },
    onMove(face, amount) {
      if (fase === 'resolver') {
        const esperado = plan && plan.moves[pi];
        if (esperado && esperado.face === face && esperado.amount === amount) pi++;
        else plan = null;                       // te has desviado: replanifico
        if (isSolved(app.state)) { fase = 'haciendo'; hist = []; plan = null; pi = 0; }
      } else if (fase === 'haciendo') {
        hist.push({ face, amount });
      }
      pintar();
    },
    onJump() { plan = null; pi = 0; if (fase === 'haciendo') hist = []; pintar(); },
    hint() { fx.say(pat.desc); $('#play-tip').innerHTML = objetivoHTML(pat.desc); },
  };
}

/** Deshacer un patrón es hacer su algoritmo al revés */
function gameDeshacerPatron(id) {
  const pat = patronPorId(id);
  const alg = invertAlg(expandAlg(pat.alg));
  let hist = [];
  const restante = () => simplifyAlg(invertAlg(hist).concat(alg));

  function pintar() {
    const faltan = restante();
    if (!faltan.length) {
      clearMove('<div class="move-text" style="text-align:center">' + t('¡CUBO RESUELTO!<small>como estaba</small>') + '</div>');
      $('#play-tip').textContent = t('Listo para otro patrón.');
      setFormula(null); setBar(100); setSteps(1, 1, t('↩️ Deshecho'));
      fx.fanfare(); fx.confetti();
      $('#play-action').classList.remove('hidden');
      $('#play-action').textContent = t('🎨 Otro patrón');
      $('#play-action').onclick = () => { fx.click(); go('patrones'); };
      return;
    }
    setSteps(1, 0, t('↩️ Deshaciendo {patron}', { patron: t(pat.nombre) }));
    setBar(Math.round((1 - faltan.length / alg.length) * 100));
    setFormula(faltan.slice(0, 12), 0);
    showMove(faltan[0].face, faltan[0].amount, t('Vamos a dejarlo como estaba.'));
  }

  return {
    get title() { return t('↩️ Deshacer {patron}', { patron: t(pat.nombre) }); },
    start() { $('#play-action').classList.add('hidden'); $('#play-action2').classList.add('hidden'); pintar(); },
    onMove(face, amount) { hist.push({ face, amount }); pintar(); },
    onJump() { hist = []; pintar(); },
  };
}

// ------------------------------------------------------------
//  JUEGO 6 — El mono dice (memoria)
// ------------------------------------------------------------
//  Como el juego clásico de repetir secuencias, pero con el cubo:
//  el mono hace unos giros en la pantalla y el niño los repite.
//  Cada ronda añade un giro más.
function gameSimon() {
  let secuencia = [];
  let idx = 0;
  let fase = 'mirando';         // mirando | repitiendo | fallo
  const mejorClave = 'simon';

  const CARAS = ['U', 'R', 'F', 'D', 'L', 'B'];

  function nuevaRonda() {
    // no repetir la misma cara dos veces seguidas: se ve mucho mejor
    const ultima = secuencia.length ? secuencia[secuencia.length - 1].face : null;
    let face = CARAS[(Math.random() * 6) | 0];
    while (face === ultima) face = CARAS[(Math.random() * 6) | 0];
    secuencia.push({ face, amount: Math.random() < 0.5 ? 1 : 3 });
    mostrar();
  }

  async function mostrar() {
    fase = 'mirando';
    idx = 0;
    setSteps(secuencia.length, 0, secuencia.length === 1
      ? t('🐵 Mira: {n} giro', { n: secuencia.length })
      : t('🐵 Mira: {n} giros', { n: secuencia.length }));
    setBar(0);
    setFormula(null);
    clearMove('<div class="move-text" style="text-align:center">' + t('Mira al mono<small>y luego repites tú</small>') + '</div>');
    $('#play-tip').textContent = t('Fíjate bien…');
    fx.say(t('Mira'));
    await new Promise((r) => setTimeout(r, 700));

    let st = app.state.slice();
    for (const m of secuencia) {
      if (app.game !== juego) return;
      st = applyMove(st, m.face, m.amount);
      $('#play-move').innerHTML = moveCard(m.face, m.amount);
      sayMove(m.face, m.amount);
      if (cube3d) await cube3d.turn(m.face, m.amount, st, 560);
      await new Promise((r) => setTimeout(r, 260));
    }
    if (app.game !== juego) return;
    // el cubo de la pantalla vuelve a como está el de verdad
    if (cube3d) cube3d.render(app.state);
    fase = 'repitiendo';
    setSteps(secuencia.length, 0, t('🐵 ¡Ahora tú! 0 de {n}', { n: secuencia.length }));
    clearMove('<div class="move-text" style="text-align:center">' + t('¡Ahora tú!<small>repite los {n} giros</small>',
      { n: secuencia.length }) + '</div>');
    $('#play-tip').textContent = t('Hazlo igual que el mono.');
    fx.say(t('¡Ahora tú!'));
  }

  function acierto() {
    idx++;
    fx.tone(700 + idx * 60, 0.09, 'sine', 0.14);
    setSteps(secuencia.length, idx, t('🐵 Vas {i} de {n}', { i: idx, n: secuencia.length }));
    setBar(idx / secuencia.length * 100);
    if (idx < secuencia.length) return;
    // ronda superada
    const mejor = app.stars[mejorClave] || 0;
    if (secuencia.length > mejor) { app.stars[mejorClave] = secuencia.length; save(); }
    clearMove('<div class="move-text" style="text-align:center">' + t('¡MUY BIEN!<small>ronda {n} superada</small>',
      { n: secuencia.length }) + '</div>');
    fx.good(); fx.confetti(null, 40);
    if (secuencia.length % 3 === 0) { fx.fanfare(); fx.confetti(null, 90); }
    fx.say(t('¡Muy bien!'));
    setTimeout(() => { if (app.game === juego) nuevaRonda(); }, 1500);
  }

  function fallo(face, amount) {
    fase = 'fallo';
    fx.oops();
    const esperado = secuencia[idx];
    clearMove(moveCard(esperado.face, esperado.amount));
    $('#play-tip').innerHTML = t('Era la cara <b>{color}</b>. Tu récord: <b>{mejor}</b>',
      { color: colorFem(esperado.face).toUpperCase(), mejor: app.stars[mejorClave] || 0 });
    setFormula(null);
    fx.say(t('Casi. Era la cara {color}', { color: colorFem(esperado.face) }));
    $('#play-action').classList.remove('hidden');
    $('#play-action').textContent = t('🔁 Otra vez');
    $('#play-action').onclick = () => { fx.click(); startGame('simon'); };
  }

  const juego = {
    get title() { return t('🐵 El mono dice'); },
    start() {
      $('#play-action').classList.add('hidden');
      $('#play-action2').classList.add('hidden');
      secuencia = [];
      const mejor = app.stars[mejorClave] || 0;
      if (mejor) toast(t('Tu récord: {n} giros seguidos', { n: mejor }));
      nuevaRonda();
    },
    onMove(face, amount) {
      if (fase !== 'repitiendo') return;
      const esperado = secuencia[idx];
      if (esperado.face === face && esperado.amount === amount) acierto();
      else fallo(face, amount);
    },
    onJump() { /* varios giros de golpe: no se puede juzgar, se deja pasar */ },
    hint() {
      if (fase !== 'repitiendo') return;
      const m = secuencia[idx];
      $('#play-move').innerHTML = moveCard(m.face, m.amount);
      sayMove(m.face, m.amount);
    },
  };
  return juego;
}

// ------------------------------------------------------------
//  JUEGO 5 — Apaga los colores
// ------------------------------------------------------------
//  Caen luces de colores y hay que apagarlas girando esa cara antes
//  de que toquen el suelo. Es lo mas sencillo que se puede pedir con
//  un cubo delante: ver un color y encontrar su cara. Ni notacion ni
//  sentido de giro; vale cualquier vuelta. Y quien todavia no lee se
//  entera igual, porque el color de la que va primera se dice en voz
//  alta en cuanto cambia.

/** Pone el tablero de un juego de colores en lugar del cubo 3D */
function usarLienzo(html) {
  $('#scene').classList.add('hidden');
  const box = $('#play-lienzo');
  box.classList.remove('hidden');
  box.innerHTML = html;
  return box.firstElementChild;
}

const CARRILES = 4;

function gameLluvia() {
  let gotas = [];              // { face, y, nacida, caida, carril, el }
  let apagadas = 0;
  let vidas = LLUVIA.vidas;
  let fin = false;
  let raf = 0, espera = 0, ultimo = 0;
  let dicha = null;            // el color que ya se ha dicho en voz alta
  let campo = null;

  // el recorrido de caida: el alto del campo menos la gota y el suelo
  const alto = () => Math.max(90, campo.clientHeight - 78);

  function hud() {
    setSteps(0, 0, t('🫧 Apagados: {n}', { n: apagadas })
      + ' · ' + '💛'.repeat(vidas) + '🖤'.repeat(LLUVIA.vidas - vidas));
  }

  /** La gota que va mas abajo: la que hay que mirar */
  function primera() {
    let g0 = null;
    for (const g of gotas) if (!g0 || g.y > g0.y) g0 = g;
    return g0;
  }

  function nace() {
    const face = caraAlAzar(Math.random, gotas.map((g) => g.face));
    const libres = [];
    for (let c = 0; c < CARRILES; c++) if (!gotas.some((g) => g.carril === c)) libres.push(c);
    const carril = libres.length ? libres[(Math.random() * libres.length) | 0] : 0;
    const el = document.createElement('i');
    el.className = 'gota';
    el.style.left = (13 + carril * 24.7) + '%';
    el.style.background = hexOf(face);
    el.style.boxShadow = '0 0 22px ' + hexOf(face);
    campo.appendChild(el);
    gotas.push({ face, y: 0, caida: ritmoLluvia(apagadas).caida, carril, el });
  }

  /** La saca del juego: apagada de un giro (crece) o caida al suelo (se aplasta) */
  function quita(g, apagada) {
    gotas = gotas.filter((x) => x !== g);
    g.el.style.transition = 'transform .3s ease, opacity .3s ease, filter .3s ease';
    g.el.style.transform = `translateY(${(g.y * alto()).toFixed(1)}px) `
      + (apagada ? 'scale(1.9)' : 'scale(.45)');
    g.el.style.opacity = '0';
    g.el.style.filter = 'brightness(.25)';
    setTimeout(() => g.el.remove(), 340);
  }

  function parpadeo() {
    campo.classList.add('fallo');
    setTimeout(() => campo.classList.remove('fallo'), 210);
  }

  function toca(g) {
    quita(g, false);
    vidas--;
    dicha = null;
    fx.oops();
    parpadeo();
    hud();
    if (vidas <= 0) acabar();
  }

  function acabar() {
    fin = true;
    cancelAnimationFrame(raf);
    const mejor = app.stars.lluvia || 0;
    award('lluvia', apagadas);
    clearMove('<div class="move-text" style="text-align:center">'
      + t('¡Se han caído!<small>has apagado {n}</small>', { n: apagadas }) + '</div>');
    setBar(0);
    if (apagadas > mejor) {
      $('#play-tip').innerHTML = t('¡Récord nuevo! 🎉');
      fx.fanfare();
      fx.confetti();
      fx.say(t('¡Récord!'));
    } else {
      $('#play-tip').innerHTML = t('Tu récord: <b>{n}</b>', { n: mejor });
      fx.say(t('Se han caído. Otra vez'));
    }
    $('#play-action').classList.remove('hidden');
    $('#play-action').textContent = t('🔁 Otra vez');
    $('#play-action').onclick = () => { fx.click(); startGame('lluvia'); };
  }

  function paso(ahora) {
    if (fin) return;
    // se avanza por lo que ha durado el fotograma, y con tope: mirar el
    // reloj haría que una pausa del navegador tirase todas las gotas de
    // golpe. Ese recorte vive en juegos.js, con su prueba
    const dt = ultimo ? ahora - ultimo : 16;
    ultimo = ahora;
    const h = alto();
    const caidas = avanzarGotas(gotas, dt);
    for (const g of gotas) g.el.style.transform = `translateY(${(g.y * h).toFixed(1)}px)`;
    for (const g of caidas) toca(g);
    if (fin) return;
    const g0 = primera();
    setBar(g0 ? g0.y * 100 : 0);
    // el color se dice sólo cuando cambia el que va primero: dicho en cada
    // gota, la voz acabaria yendo por detras del juego
    if (!g0) dicha = null;
    else if (g0.face !== dicha) { dicha = g0.face; fx.say(colorFem(g0.face)); }

    espera -= Math.min(LLUVIA.topeFotograma, dt);
    if (espera <= 0 && gotas.length < LLUVIA.aLaVez) {
      nace();
      espera = ritmoLluvia(apagadas).espera;
    }
    raf = requestAnimationFrame(paso);
  }

  return {
    get title() { return t('🫧 Apaga los colores'); },
    start() {
      campo = usarLienzo('<div class="lluvia"><div class="suelo"></div></div>');
      gotas = []; apagadas = 0; vidas = LLUVIA.vidas; fin = false; dicha = null;
      setFormula(null);
      setBar(0);
      hud();
      clearMove('<div class="move-text" style="text-align:center">'
        + t('¡A apagar!<small>gira la cara del color que cae</small>') + '</div>');
      $('#play-tip').innerHTML = t('Cuando caiga un color, <b>gira esa cara</b>. ¡Para donde quieras!');
      const mejor = app.stars.lluvia || 0;
      if (mejor) toast(t('Tu récord: {n} apagados', { n: mejor }));
      fx.say(t('Gira la cara del color que cae'));
      espera = 700;
      ultimo = 0;
      raf = requestAnimationFrame(paso);
    },
    stop() { fin = true; cancelAnimationFrame(raf); },
    onMove(face) {
      if (fin) return;
      const i = gotaQueSeApaga(gotas, face);
      if (i < 0) { fx.oops(); parpadeo(); return; }
      quita(gotas[i], true);
      apagadas++;
      dicha = null;
      fx.tone(560 + Math.min(apagadas, 20) * 30, 0.1, 'sine', 0.16);
      if (apagadas % 10 === 0) { fx.good(); fx.confetti(null, 40); }
      hud();
    },
    onJump() { /* varios giros de golpe: no se sabe cual era, se deja pasar */ },
    hint() {
      const g0 = primera();
      if (!g0) return;
      g0.el.classList.add('pista');
      setTimeout(() => g0.el.classList.remove('pista'), 1400);
      $('#play-tip').innerHTML = t('Gira la cara <b>{color}</b>',
        { color: colorFem(g0.face).toUpperCase() });
      fx.say(t('Cara {cara}', { cara: colorFem(g0.face) }));
    },
  };
}

// ------------------------------------------------------------
//  JUEGO 6 — El caminito
// ------------------------------------------------------------
//  Lo mismo que la lluvia (ver un color, encontrar su cara) pero sin
//  reloj: el pollito avanza una baldosa por cada cara acertada y no
//  pasa nada por tardar. A los cuatro anos no todos los dias se tienen
//  las mismas ganas de correr.

function gameCamino(nivel) {
  const n = Math.max(0, nivel | 0);
  const camino = caminoNuevo(largoDelCamino(n));
  let en = 0;             // en que baldosa esta el pollito (la 0 es la casa)
  let seguidos = 0;       // fallos seguidos, para ayudar sin que lo pida
  let campo = null;

  const color = (i) => colorFem(camino[i]).toUpperCase();

  function pintar(salta) {
    const celdas = [];
    for (let i = 0; i <= camino.length; i++) {
      const clases = ['baldosa'];
      if (i < en) clases.push('hecha');
      if (i === en) clases.push('aqui');
      if (i === en && salta) clases.push('salta');
      if (i === en + 1) clases.push('toca');
      const fondo = i === 0 ? '' : 'background:' + hexOf(camino[i - 1]);
      const dentro = i === en ? '🐥' : i === 0 ? '🏠' : i === camino.length ? '🎁' : '';
      celdas.push(`<i class="${clases.join(' ')}" style="${fondo}">${dentro}</i>`);
    }
    campo.innerHTML = celdas.join('');
  }

  function marcador() {
    setSteps(0, 0, t('🐥 Baldosa {i} de {n}', { i: en, n: camino.length }));
    setBar(en / camino.length * 100);
    // la tarjeta grande enseña el color que toca: quien no lee necesita
    // una mancha de color, no una frase
    if (en < camino.length) {
      clearMove(`<div class="face-chip" style="background:${hexOf(camino[en])}"></div>`
        + `<div class="move-text">${t('Cara {cara}', { cara: color(en) })}`
        + `<small>${t('gira esa cara')}</small></div>`);
    }
  }

  function ganar() {
    const mejor = app.stars.camino || 0;
    award('camino', camino.length);
    clearMove('<div class="move-text" style="text-align:center">'
      + t('¡HA LLEGADO!<small>{n} baldosas</small>', { n: camino.length }) + '</div>');
    $('#play-tip').textContent = t('El pollito ha llegado a su regalo 🎁');
    fx.fanfare();
    fx.confetti();
    fx.say(camino.length > mejor ? t('¡Récord! El pollito ha llegado')
      : t('¡Muy bien! El pollito ha llegado'));
    $('#play-action').classList.remove('hidden');
    $('#play-action').textContent = t('➡️ Otro camino');
    $('#play-action').onclick = () => { fx.click(); startGame('camino', n + 1); };
  }

  return {
    get title() { return t('🐥 El caminito'); },
    start() {
      campo = usarLienzo('<div class="camino"></div>');
      pintar(false);
      setFormula(null);
      marcador();
      $('#play-tip').innerHTML = t('Gira la cara <b>{color}</b> y el pollito salta a esa baldosa',
        { color: color(0) });
      const mejor = app.stars.camino || 0;
      if (mejor) toast(t('Tu mejor camino: {n} baldosas', { n: mejor }));
      fx.say(t('Cara {cara}', { cara: colorFem(camino[0]) }));
    },
    onMove(face) {
      if (en >= camino.length) return;
      if (face !== camino[en]) {
        seguidos++;
        fx.oops();
        $('#play-tip').innerHTML = t('Esa no. Busca la baldosa <b>{color}</b>', { color: color(en) });
        if (seguidos >= 2) this.hint();
        return;
      }
      seguidos = 0;
      en++;
      fx.tone(500 + en * 45, 0.1, 'sine', 0.16);
      pintar(true);
      marcador();
      if (en >= camino.length) { ganar(); return; }
      $('#play-tip').innerHTML = t('¡Bien! Ahora la <b>{color}</b>', { color: color(en) });
      fx.say(colorFem(camino[en]));
    },
    onJump() { /* varios giros de golpe: no se sabe cual era, se deja pasar */ },
    hint() {
      if (en >= camino.length) return;
      $('#play-tip').innerHTML = t('Gira la cara <b>{color}</b>', { color: color(en) });
      fx.say(t('Cara {cara}', { cara: colorFem(camino[en]) }));
      // y se le senala la baldosa, por si todavia no lee
      const b = campo.children[en + 1];
      if (!b) return;
      b.classList.add('salta');
      setTimeout(() => b.classList.remove('salta'), 460);
    },
  };
}

// ------------------------------------------------------------
//  Motor de juegos
// ------------------------------------------------------------
function startGame(kind, arg, verify) {
  juegoActual = { kind, arg, verify };
  stopGame();
  go('play');
  initCube3D();
  repaint();
  $('#play-action').classList.add('hidden');
  $('#play-action2').classList.add('hidden');
  $('#play-formula').innerHTML = '';
  // el tablero de colores lo pide quien lo necesita; los demas, el cubo
  $('#scene').classList.remove('hidden');
  $('#play-lienzo').classList.add('hidden');
  $('#play-lienzo').innerHTML = '';
  app.game = kind === 'explore' ? gameExplore(verify)
    : kind === 'undo' ? gameUndo(arg)
      : kind === 'curso' ? gameCurso(arg)
        : kind === 'patron' ? gamePatron(arg)
          : kind === 'deshacer-patron' ? gameDeshacerPatron(arg)
            : kind === 'simon' ? gameSimon()
              : kind === 'lluvia' ? gameLluvia()
                : kind === 'camino' ? gameCamino(arg)
                  : gameSolve();
  $('#play-title').textContent = app.game.title;
  app.game.start();
}

function stopGame() {
  stopPreview();
  if (app.game && app.game.stop) app.game.stop();
  app.game = null;
  fx.shutUp();
}

function award(id, stars) {
  if ((app.stars[id] || 0) < stars) { app.stars[id] = stars; save(); }
}

// ------------------------------------------------------------
//  Diagnóstico
// ------------------------------------------------------------
function refreshDiag() {
  const c = app.cube;
  $('#d-conn').textContent =
    (c && c.connected ? t('conectado a {nombre}', { nombre: c.name }) : t('sin conexión'))
    + (app.mode === 'state' ? ' ' + t('· leyendo el estado completo') : ' ' + t('· siguiendo los giros'));
  $('#d-bat').textContent = c && c.battery != null ? c.battery + ' %' : '—';
  $('#d-move').textContent = lastMoveInfo
    ? t('código {code} · cantidad {amount} → cara {cara}', {
      code: lastMoveInfo.code,
      amount: lastMoveInfo.amount,
      cara: app.codeToSolver[lastMoveInfo.code] || '?',
    }) + ' (' + t(app.codeColor[lastMoveInfo.code] || 'sin calibrar') + ')'
    : '—';
  $('#d-state').textContent = lastPacket
    ? (lastPacket.solved ? t('dice que está RESUELTO') : t('dice que está mezclado'))
      + ' ' + t(lastPacket.encrypted ? '· paquete cifrado (i3s)' : '· paquete sin cifrar')
    : '—';
  $('#d-raw').textContent = lastPacket
    ? Array.from(lastPacket.bytes).map((b) => b.toString(16).padStart(2, '0')).join(' ')
    : '—';
  $('#d-frame').textContent = Object.keys(app.codeToSolver).sort()
    .map((c) => c + '→' + app.codeToSolver[c] + ' (' + t(app.codeColor[c] || '?') + ')')
    .join('   ') || t('sin calibrar');
  $('#d-invert').classList.toggle('on', app.invert);
  $('#d-invert').textContent = (app.invert ? '✅' : '🔁') + ' ' + t('El cubo gira al revés');
}

// ------------------------------------------------------------
//  Añadir a la pantalla de inicio
// ------------------------------------------------------------
//  Cuando el navegador quiere, avisa de que la app se puede instalar
//  y nos deja guardar ese aviso para sacarlo al pulsar el botón. Pero
//  no siempre avisa: Chrome ya no exige un service worker para dejar
//  instalar desde su menú, pero sí lo sigue mirando para lanzar ese
//  aviso. Y en iOS no existe nada parecido: Safari sólo lo ofrece por
//  su menú de compartir.
//
//  Por eso el botón se enseña siempre que la app no esté ya instalada,
//  y al pulsarlo hace lo mejor que pueda: si el navegador nos dio su
//  aviso, lo lanza; si no, explica dónde está la opción. Así no depende
//  de una condición que cambia con cada versión de cada navegador.

/**
 * Guarda la app para poder usarla sin conexión. Es lo que la hace
 * servir de verdad en un móvil: el cronómetro y las lecciones
 * funcionan en el coche o donde no haya cobertura.
 *
 * Todo el cuidado está en sw.js. Aquí sólo se registra, y si algo
 * falla se sigue como siempre: no funcionar sin conexión no es
 * motivo para dejar de funcionar con ella.
 */
function registrarServiceWorker() {
  if (!('serviceWorker' in navigator) || !window.isSecureContext) return;
  navigator.serviceWorker.register('/sw.js').catch(() => { /* da igual */ });
}

let avisoInstalar = null;

/** ¿Ya está instalada, o sea, abierta desde la pantalla de inicio? */
function yaInstalada() {
  return window.matchMedia('(display-mode: standalone)').matches
    || navigator.standalone === true;
}

function prepararInstalacion() {
  const boton = $('#btn-instalar');

  const mostrar = (si) => boton.classList.toggle('hidden', !si);
  mostrar(!yaInstalada());

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();          // el navegador no lo saca por su cuenta
    avisoInstalar = e;           // lo sacamos nosotros al pulsar el botón
    mostrar(!yaInstalada());
  });

  window.addEventListener('appinstalled', () => {
    avisoInstalar = null;
    mostrar(false);
    toast(t('¡Instalada! Búscala en tu pantalla de inicio.'), 3000);
  });

  boton.onclick = async () => {
    fx.click();
    if (avisoInstalar) {
      avisoInstalar.prompt();
      const { outcome } = await avisoInstalar.userChoice;
      avisoInstalar = null;
      if (outcome === 'accepted') mostrar(false);
      return;
    }
    go('instalar');
  };
}

/** Las instrucciones, que cambian según dónde estés */
function pintarInstalacion() {
  const paso = (n, texto) => '<p><b>' + n + '.</b> ' + texto + '</p>';
  const caja = $('#instalar-pasos');

  if (yaInstalada()) {
    caja.innerHTML = '<p>' + t('Ya la tienes instalada: estás usándola así ahora mismo.') + '</p>';
    $('#instalar-nota').textContent = '';
    return;
  }

  if (enIOS()) {
    caja.innerHTML = paso(1, t('Toca <b>Compartir</b> en la barra de Safari '
      + '(el cuadrado con la flecha hacia arriba).'))
      + paso(2, t('Baja y elige <b>Añadir a inicio</b>.'))
      + paso(3, t('Dale a <b>Añadir</b>. Ya la tienes con las demás apps.'));
    $('#instalar-nota').innerHTML = t('Tiene que ser <b>Safari</b>: desde Chrome o '
      + 'Firefox en iPhone esta opción no aparece.');
    return;
  }

  caja.innerHTML = paso(1, t('Abre el menú del navegador (los tres puntos).'))
    + paso(2, t('Elige <b>Instalar</b> o <b>Añadir a la pantalla de inicio</b>.'));
  $('#instalar-nota').innerHTML = t('En Chrome y Edge suele salir también un icono '
    + 'de instalar en la barra de direcciones.');
}

// ------------------------------------------------------------
//  Idioma
// ------------------------------------------------------------
//  El texto estatico lo repinta traducirDOM; lo que dibuja el
//  JavaScript hay que volver a dibujarlo, y por eso se repite la
//  pantalla en la que estas. El juego en marcha se reinicia: sus
//  carteles ya estaban escritos y no se pueden traducir a medias.

function pintarIdiomas() {
  const box = $('#idiomas');
  if (!box) return;
  box.innerHTML = '';
  for (const [codigo, info] of Object.entries(IDIOMAS)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'idioma' + (codigo === idioma() ? ' on' : '');
    b.innerHTML = `<span>${info.bandera}</span>${info.nombre}`;
    b.onclick = () => { fx.click(); cambiarIdioma(codigo); };
    box.appendChild(b);
  }
}

function cambiarIdioma(codigo) {
  if (codigo === idioma()) return;
  fijarIdioma(codigo);          // guarda, marca <html lang> y traduce el HTML
  document.title = t('Mi Cubo Mágico');
  pintarIdiomas();
  fx.setIdioma(codigo);
  const juego = app.game;
  const pantalla = app.screen;
  if (juego && pantalla === 'play') { startGame(juegoActual.kind, juegoActual.arg, juegoActual.verify); }
  else { go(pantalla); }
  toast(t('Idioma / Language') + ': ' + IDIOMAS[codigo].nombre);
}

// ------------------------------------------------------------
//  Arranque
// ------------------------------------------------------------
function boot() {
  load();
  fx.init();
  document.documentElement.lang = idioma();
  document.title = t('Mi Cubo Mágico');
  traducirDOM();
  fx.setIdioma(idioma());

  // Las letras giran el cubo alli donde se ven los botones. Va aqui y no
  // en el cuerpo del modulo para que importar app.js no ate nada por su
  // cuenta antes de que exista la pagina.
  document.addEventListener('keydown', (e) => {
    // e.repeat: dejar la tecla pulsada no debe poner el cubo a dar vueltas
    if (!padPantalla || e.repeat || escribiendo(e.target)) return;
    const giro = giroDeTecla(e);
    if (!giro) return;
    e.preventDefault();
    doMove(giro.face, giro.amount, false);
    // el boton equivalente parpadea, para ir atando la tecla con su color
    const i = (giro.amount === 3 ? FACES.length : 0) + FACES.indexOf(giro.face);
    const b = $('#pad').children[i];
    if (b) {
      b.classList.add('pulsado');
      setTimeout(() => b.classList.remove('pulsado'), 160);
    }
  });

  $('#btn-connect').onclick = () => { fx.click(); connect(false); };
  $('#btn-scan').onclick = async () => {
    fx.click();
    go('scan');
    $('#scan-report').classList.add('hidden');
    const el = $('#scan-avail');
    try {
      const ok = await navigator.bluetooth.getAvailability();
      el.innerHTML = ok
        ? '<b style="color:#8de08d">' + t('sí, funciona') + '</b>'
        : '<b style="color:#ff9a9a">' + t('apagado o sin adaptador') + '</b> '
          + t('— enciéndelo en Windows');
    } catch (e) { el.textContent = t('no lo sé'); }
  };
  $('#btn-scan-all').onclick = () => {
    fx.click();
    $('#scan-note').textContent = t('Elige tu cubo en la lista del navegador…');
    connect(true);
  };

  $('#btn-nocube').onclick = () => {
    fx.click();
    app.state = solvedState(); app.synced = true; save();
    go('menu');
  };
  $$('[data-go]').forEach((b) => { b.onclick = () => { fx.click(); go(b.dataset.go); }; });
  $$('[data-game]').forEach((b) => {
    b.onclick = () => {
      fx.click();
      if (b.dataset.game === 'undo') go('levels');
      else startGame(b.dataset.game);
    };
  });

  $('#chip-sync').onclick = askSync;
  $('#btn-recal').onclick = () => {
    fx.click();
    calibration = null;
    go('cal');
    $('#cal-choice').classList.add('hidden');
    $('#cal-start').classList.remove('hidden');
    $('#cal-start').textContent = t('Empezar');
    $('#cal-emoji').textContent = '👋';
    $('#cal-title').textContent = t('Vamos a conocer tu cubo');
    $('#cal-text').innerHTML = t('Vas a girar las seis caras una vez. Así aprendo tu cubo '
      + 'de verdad, sin suposiciones.');
    $('#cal-prog').innerHTML = '';
  };
  $('#btn-diag').onclick = () => go('diag');
  $('#cal-start').onclick = () => { fx.click(); startCalibration(); };
  $('#cal-skip').onclick = () => {
    fx.click();
    calibration = null;
    useDefaultCalibration();
    localStorage.setItem(KEY + '-cal', '2');
    save(); repaint();
    toast('Voy a suponer. Si algo va raro, vuelve a calibrar.');
    startGame('explore', null, true);
  };
  $('#d-invert').onclick = () => { app.invert = !app.invert; save(); refreshDiag(); };
  $('#btn-hint').onclick = () => { fx.click(); if (app.game && app.game.hint) app.game.hint(); };
  $('#btn-detalle').onclick = () => {
    fx.click();
    if (app.game && app.game.detalle) app.game.detalle();
    else if (app.game && app.game.repetir) app.game.repetir();
  };

  const toggleVoice = () => {
    fx.voiceOn = !fx.voiceOn;
    if (!fx.voiceOn) fx.shutUp();
    save();
    $$('#btn-voice, #btn-voice2').forEach((b) => b.classList.toggle('on', fx.voiceOn));
  };
  $('#btn-voice').onclick = toggleVoice;
  $('#btn-voice2').onclick = toggleVoice;

  // En iPhone y iPad no hay Bluetooth en el navegador y no lo va a haber:
  // Apple obliga a que todos usen el motor de Safari, así que Chrome y
  // Firefox tampoco pueden. Decirle a alguien con un iPhone que abra
  // Chrome o que ejecute un .bat no le sirve de nada, así que ahí se le
  // manda a una pantalla que explica lo que sí puede hacer.
  if (!SmartCube.available && enIOS()) {
    $('#btn-connect').onclick = () => { fx.click(); go('ios'); };
    $('#home-note').innerHTML = t('En iPhone, Safari no puede usar el Bluetooth. '
      + '<b>Toca arriba</b> y te cuento cómo conectarlo igualmente.');
  } else if (!SmartCube.available) {
    $('#btn-connect').disabled = true;
    $('#btn-connect').style.opacity = .5;
    $('#home-note').innerHTML = t('Tu navegador no tiene <b>Bluetooth Web</b>.<br>'
      + 'Ábrela con <b>Chrome</b> o <b>Edge</b> desde <code>http://localhost:8080</code> '
      + '(ejecuta <code>INICIAR.bat</code>).');
  } else if (!window.isSecureContext) {
    $('#home-note').innerHTML = t('Para usar el Bluetooth abre la página desde '
      + '<code>http://localhost:8080</code> (ejecuta <code>INICIAR.bat</code>), '
      + 'no con doble clic en el archivo.');
  }

  prepararInstalacion();
  registrarServiceWorker();

  $('#ios-sincubo').onclick = () => { fx.click(); $('#btn-nocube').click(); };
  $('#ios-url').textContent = location.href.replace(/^https?:\/\//, '');
  $('#ios-copiar').onclick = async () => {
    fx.click();
    try {
      await navigator.clipboard.writeText(location.href);
      toast(t('Enlace copiado. Ábrelo en Bluefy.'), 3000);
    } catch (e) {
      // Si el navegador no deja tocar el portapapeles, al menos se deja
      // la dirección seleccionada para copiarla de un toque largo.
      const el = $('#ios-url');
      const rango = document.createRange();
      rango.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(rango);
      el.scrollIntoView({ block: 'center' });
      toast(t('Ya te la he seleccionado: cópiala y ábrela en Bluefy.'), 3500);
    }
  };

  pintarIdiomas();
  $('#btn-idioma').onclick = () => {
    fx.click();
    const codigos = Object.keys(IDIOMAS);
    cambiarIdioma(codigos[(codigos.indexOf(idioma()) + 1) % codigos.length]);
  };

  sections.init({
    app, go, toast, fx, hexMap, hexOf, startGame,
    moveCard, colorFem, padEn, sinCubo, t, idioma,
    get lastMove() { return app.lastMove; },
    newScene: (host, size) => new Cube3D(host, { size, colors: hexMap() }),
    setState: (st) => {
      app.state = st.slice();
      save();
      repaint();
      sections.onState(app.state);
    },
  });

  // Manejador para depurar desde la consola del navegador.
  // cubo.fakeMove('U', 1) simula un giro del cubo fisico.
  window.cubo = {
    app, fx, go, doMove, startGame,
    startCalibration,
    // que textos se han pedido y no estaban traducidos
    sinTraducir, idioma, cambiarIdioma,
    // Simula un paquete del cubo, igual que si llegara por Bluetooth
    feedPacket(raw) {
      app.mode = 'state';
      return readCubeState(raw);
    },
    fakeMove(code, amount) {
      const detail = { cubeFace: '?', amount, code };
      lastMoveInfo = detail;
      if (calibration) calibration.onMove(detail);
      else onPhysicalMove(detail);
    },
    get cube3d() { return cube3d; },
  };
}

boot();
