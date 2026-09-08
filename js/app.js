// ============================================================
//  app.js — Pantallas, juegos y pegamento general
// ============================================================

import {
  FACES, OPPOSITE, solvedState, applyMove, isSolved,
  invertAlg, simplifyAlg, moveToString, rotateFrame, findRotation,
} from './cube.js';
import { decode, toFacelets, VALUE_COLOR } from './xiaomi.js';
import { solve, PHASE_INFO, detalleDe } from './solver.js';
import { SmartCube } from './giiker.js';
import { Calibration, COLOR_HEX, COLOR_OPPOSITE, COLORS } from './calibrate.js';
import { Cube3D, arrowSVG } from './cube3d.js';
import { fx } from './fx.js';
import { lessonById, LESSONS } from './lessons.js';
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
function colorFem(face) { return COLOR_FEM[colorOf(face)] || colorOf(face); }
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
  if (name !== 'play') { stopGame(); }
  if (name === 'menu') refreshMenu();
  if (name === 'levels') buildLevels();
  if (name === 'diag') refreshDiag();
  sections.onScreen(name);
}

function toast(msg, ms = 1900) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), ms);
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
    toast('No conozco esa cara del cubo (código ' + detail.code + ')');
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
      toast('¡Conectado! Leo tu cubo directamente');
      if (yaVisto) go('menu');
      else startGame('explore', null, true);
      return;
    }
    app.mode = 'moves';
    const first = localStorage.getItem(KEY + '-cal') !== '2';
    go(first ? 'cal' : 'menu');
    if (!first) toast('¡Cubo conectado!');
  } catch (err) {
    if (err && err.name === 'NotFoundError' && !anyDevice) {
      // El usuario cerro el dialogo, o no habia nada que enseñar
      $('#home-note').innerHTML =
        'No apareció ningún cubo. Pulsa <b>🔍 No sale mi cubo en la lista</b>.';
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
  let html = '<b>No he podido usar ese aparato</b><br>' + msg;
  if (err && err.report && err.report.length) {
    html += '<hr><b>Lo que expone:</b><br>' + err.report.map((r) =>
      '<code>' + r.service + '</code><br>' +
      r.chars.map((c) => '&nbsp;&nbsp;· <code>' + c + '</code>').join('<br>')).join('<br>');
    html += '<hr>Copia esto y pásamelo: con ello puedo dar soporte a tu modelo.';
  } else if (err && err.name === 'NotFoundError') {
    html = '<b>No has elegido ningún aparato</b><br>Si la lista salía vacía, ' +
      'repasa los cuatro puntos de arriba: lo más habitual es que el cubo esté ' +
      'dormido o cogido por el móvil.';
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
    $('#cal-title').textContent = 'Gira la cara ' + (COLOR_FEM[color] || color).toUpperCase();
    $('#cal-text').innerHTML =
      'Busca la cara cuyo <b>centro</b> es ' + color + ' y dale un cuarto de vuelta.' +
      '<br><small>El centro nunca cambia de sitio: es el color de esa cara.</small>';
    $('#cal-start').classList.add('hidden');
    fx.say('Gira la cara ' + COLOR_FEM[color]);
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
    $('#cal-title').textContent = '¿Qué hay a la derecha?';
    $('#cal-text').innerHTML =
      'Coge el cubo con el <b>blanco abajo</b> y el <b>verde de frente</b>.<br>' +
      '¿Qué color te queda en la cara de la <b>derecha</b>?';
    const box = $('#cal-choice');
    box.classList.remove('hidden');
    box.innerHTML = '';
    box.style.gridTemplateColumns = 'repeat(2,1fr)';
    for (const color of ['rojo', 'naranja']) {
      const b = document.createElement('button');
      b.style.background = COLOR_HEX[color];
      b.textContent = color.toUpperCase();
      b.onclick = () => { fx.click(); calibration.chooseRight(color); };
      box.appendChild(b);
    }
    fx.say('Con el blanco abajo y el verde delante, ¿qué color queda a la derecha?');
  },

  askDirection() {
    calProgress(7, 8);
    $('#cal-choice').classList.add('hidden');
    $('#cal-emoji').innerHTML = arrowSVG(true, '#fff')
      .replace('class="arrow"', 'style="width:120px;height:120px"');
    $('#cal-title').textContent = 'Último paso';
    $('#cal-text').innerHTML =
      'Mira el cubo de frente a la cara <b>BLANCA</b> y gírala un cuarto de vuelta ' +
      '<b>en el sentido de la flecha</b>.';
    fx.say('Mirando la cara blanca, gírala en el sentido de la flecha');
  },

  fail(msg) {
    $('#cal-choice').classList.add('hidden');
    $('#cal-emoji').textContent = '🤔';
    $('#cal-title').textContent = 'Algo no cuadra';
    $('#cal-text').innerHTML = msg + '<br>Vamos a repetirlo.';
    $('#cal-start').classList.remove('hidden');
    $('#cal-start').textContent = 'Volver a empezar';
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
    toast(result.invert ? 'Listo. Tu cubo cuenta al revés y ya lo sé.' : '¡Listo!');
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
    chip.textContent = '👁️ Leyendo el cubo';
  } else if (app.synced) {
    chip.className = 'chip ok';
    chip.textContent = '✅ Cubo al día';
  } else {
    chip.className = 'chip warn';
    chip.textContent = '⚠️ Púlsame con el cubo resuelto';
  }
  $('#menu-note').textContent = connected
    ? 'Conectado a ' + app.cube.name
    : 'Modo sin cubo: usarás los botones de la pantalla.';
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
    if (!era) toast('He visto que el cubo está resuelto ✅');
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
    chip.textContent = '¿Seguro? Pulsa otra vez';
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
  toast('¡Genial! Ahora sé cómo está tu cubo');
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
//  Panel de instrucción
// ------------------------------------------------------------
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
  return `<div class="face-chip" style="background:${hexOf(face)}"></div>${arrow}`
    + `<div class="move-text">Cara ${name}<small>${twice ? 'dos vueltas enteras' : cw ? 'hacia la flecha' : 'al revés de la flecha'}</small></div>`;
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
  if (amount === 2) fx.say('Cara ' + name + ', dos vueltas');
  else fx.say('Cara ' + name + (amount === 3 ? ', al revés' : ''));
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
//  Teclado en pantalla (modo sin cubo)
// ------------------------------------------------------------
function buildPad() {
  const pad = $('#pad');
  pad.innerHTML = '';
  for (const amount of [1, 3]) {
    for (const f of FACES) {
      const b = document.createElement('button');
      b.style.background = hexOf(f);
      b.innerHTML = `<span>${amount === 1 ? '↻' : '↺'}</span>${COLOR_SHORT[colorOf(f)] || ''}`;
      b.onclick = () => doMove(f, amount, false);
      pad.appendChild(b);
    }
  }
}

function padVisible(on) {
  $('#pad').classList.toggle('hidden', !on);
  if (on) buildPad();
}

// ------------------------------------------------------------
//  JUEGO 1 — Conoce tu cubo
// ------------------------------------------------------------
function gameExplore(verify) {
  const seen = new Set();
  return {
    title: verify ? '🔍 Comprobación' : '🎈 Conoce tu cubo',
    start() {
      if (verify) {
        $('#play-tip').textContent = app.mode === 'state'
          ? 'Leo tu cubo directamente. Gira unas caras y comprueba que la pantalla va igual: colores incluidos.'
          : 'Gira unas cuantas caras y mira si el cubo de la pantalla hace exactamente lo mismo que el tuyo.';
        clearMove('<div class="move-text" style="text-align:center">¿Se mueve igual?<small>gira una cara y compara</small></div>');
        setSteps(6, 0, 'Comprobando que te entiendo bien');
        setFormula(null); setBar(0);
        const a = $('#play-action'), b = $('#play-action2');
        a.classList.remove('hidden');
        a.textContent = '✅ Sí, se mueve igual';
        a.onclick = () => { fx.click(); fx.fanfare(); toast('¡Perfecto! Ya podemos jugar'); go('menu'); };
        b.classList.remove('hidden');
        b.textContent = '❌ No, hace otra cosa';
        b.onclick = () => {
          fx.click();
          go('cal');
          $('#cal-start').classList.remove('hidden');
          $('#cal-start').textContent = 'Volver a empezar';
          $('#cal-emoji').textContent = '🔁';
          $('#cal-title').textContent = 'Lo intentamos otra vez';
          $('#cal-text').innerHTML = 'Sin problema. Fíjate en girar la cara cuyo <b>centro</b> ' +
            'es del color que te pido, y con el cubo quieto en la mano.';
        };
        fx.say('Gira una cara y comprueba si el cubo de la pantalla hace lo mismo');
        return;
      }
      $('#play-tip').textContent = 'Gira las caras que quieras. Te diré de qué color son.';
      clearMove('<div class="move-text" style="text-align:center">Gira una cara<small>a ver de qué color es</small></div>');
      setFormula(null);
      setSteps(6, 0, '¿Cuántos colores encuentras?');
      setBar(0);
      fx.say('Gira una cara del cubo');
    },
    onMove(face, amount) {
      seen.add(face);
      showMove(face, amount, '¡Muy bien!');
      sayMove(face, amount);
      setSteps(6, seen.size, verify ? 'Caras reconocidas: ' + seen.size + ' de 6'
        : 'Colores encontrados: ' + seen.size + ' de 6');
      setBar(seen.size / 6 * 100);
      if (seen.size === 6 && !verify) {
        award('explore', 3);
        fx.fanfare(); fx.confetti();
        fx.say('¡Bravo! Has encontrado los seis colores');
        $('#play-tip').textContent = '¡Has encontrado los 6 colores! 🎉';
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
    showMove(m.face, m.amount, 'Deshaz este movimiento');
    if (force) sayMove(m.face, m.amount);
  }

  function armHint() {
    clearTimeout(hintTimer);
    hintShown = false;
    const left = simplifyAlg(history).length;
    if (level <= 2) { showHint(false); return; }
    clearMove('<div class="move-text" style="text-align:center">¿Te acuerdas?<small>Quedan ' + left + '</small></div>');
    hintTimer = setTimeout(() => showHint(true), 7000);
  }

  return {
    title: '🔙 Nivel ' + level,
    start() {
      target = app.state.slice();
      $('#play-tip').textContent = 'Haz ' + level + (level === 1 ? ' movimiento' : ' movimientos') +
        ' tú, los que quieras. Yo me los apunto.';
      clearMove('<div class="move-text" style="text-align:center">Mezcla tú<small>' + level +
        (level === 1 ? ' movimiento' : ' movimientos') + '</small></div>');
      setFormula(null);
      setSteps(level, 0, '🌀 Mezclando');
      setBar(0);
      fx.say('Haz ' + level + (level === 1 ? ' movimiento' : ' movimientos') + ' tú');
    },
    stop() { clearTimeout(hintTimer); },
    onMove(face, amount) {
      if (phase === 'scramble') {
        history.push({ face, amount });
        done++;
        setSteps(level, done, '🌀 Mezclando');
        setBar(done / level * 50);
        if (done >= level) {
          phase = 'solve';
          setSteps(level, 0, '🔍 ¡Ahora al revés!');
          $('#play-tip').textContent = 'Deshaz los movimientos, del último al primero.';
          fx.good();
          fx.say('Ahora deshazlo, del último al primero');
          setTimeout(armHint, 900);
        } else {
          showMove(face, amount, 'Te quedan ' + (level - done));
        }
        return;
      }
      // fase de deshacer
      history.push({ face, amount });
      const left = simplifyAlg(history).length;
      setSteps(level, Math.max(0, level - left), '🔍 Quedan ' + left);
      setBar(50 + (level - left) / level * 50);
      if (app.state.join('') === target.join('')) {
        clearTimeout(hintTimer);
        phase = 'done';
        const stars = hintShown ? 2 : 3;
        award('undo' + level, stars);
        if (level >= app.maxLevel && app.maxLevel < 8) { app.maxLevel = level + 1; save(); }
        clearMove('<div class="move-text" style="text-align:center">¡LO HAS CONSEGUIDO!<small>' +
          '⭐'.repeat(stars) + '</small></div>');
        $('#play-tip').textContent = 'El cubo ha vuelto a su sitio 🎉';
        setBar(100);
        fx.fanfare(); fx.confetti();
        fx.say('¡Muy bien! Lo has conseguido');
        $('#play-action').classList.remove('hidden');
        $('#play-action').textContent = level < 8 ? '➡️ Siguiente nivel' : '🏠 Volver al menú';
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
      clearMove('<div class="move-text" style="text-align:center">Ups…<small>' + e.message + '</small></div>');
      $('#play-tip').textContent = 'Pon el cubo resuelto y pulsa el botón de arriba para volver a empezar.';
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
      clearMove('<div class="move-text" style="text-align:center">¡CUBO RESUELTO!<small>⭐⭐⭐</small></div>');
      $('#play-tip').textContent = 'Lo has hecho tú. Enséñaselo a todo el mundo 🏆';
      setFormula(null); setBar(100);
      setSteps(PHASE_INFO.length, PHASE_INFO.length, '🏆 ¡Terminado!');
      award('solve', 3);
      fx.fanfare(); fx.confetti(document.body, 160);
      fx.say('¡Cubo resuelto! Eres un campeón');
      $('#play-action').classList.remove('hidden');
      $('#play-action').textContent = '🏠 Volver al menú';
      $('#play-action').onclick = () => { fx.click(); go('menu'); };
      return;
    }
    const ph = plan.phases[0];
    const idx = PHASE_INFO.findIndex((p) => p.id === ph.id);
    setSteps(PHASE_INFO.length, idx, ph.emoji + ' ' + ph.name);
    setBar(100 - (plan.length / total) * 100);

    const chunk = ph.chunks[ci];
    if (!chunk) { replan(); render(); return; }
    const m = chunk.alg[mi];
    setFormula(chunk.alg, mi);
    showMove(m.face, m.amount, chunk.hint || ph.kid);
    if (ph.id !== lastPhaseId) {
      lastPhaseId = ph.id;
      fx.say(ph.name + '. ' + ph.kid, { rate: 1 });
      setTimeout(() => sayMove(m.face, m.amount), 300);
    } else {
      sayMove(m.face, m.amount);
    }
  }

  return {
    title: '🏆 Resuélvelo conmigo',
    start() {
      $('#play-action').classList.add('hidden');
      if (!app.synced && app.mode !== 'state') {
        clearMove('<div class="move-text" style="text-align:center">Antes de empezar…<small>necesito saber cómo está tu cubo</small></div>');
        $('#play-tip').textContent = 'Pon el cubo RESUELTO y pulsa el botón de abajo.';
        setFormula(null); setSteps(PHASE_INFO.length, 0, 'Preparando');
        $('#play-action').classList.remove('hidden');
        $('#play-action').textContent = '✅ Ya está resuelto';
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
        $('#play-tip').textContent = 'No pasa nada, seguimos por aquí 😊';
      }
      render();
    },
    onJump() {            // el cubo dio mas de un giro de golpe
      if (replan()) render();
    },
    hint() {
      if (!plan || !plan.phases.length) return;
      const ph = plan.phases[0];
      fx.say(ph.kid, { rate: 1 });
      $('#play-tip').textContent = ph.goal;
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

    setSteps(LESSONS.length, LESSONS.findIndex((l) => l.id === lec.id), lec.emoji + ' ' + lec.title);
    setBar(Math.max(0, Math.min(100, lec.progreso(app.state) * 100)));
    setFormula(chunk.alg, mi);
    showMove(m.face, m.amount, modoDetalle
      ? (detalleDe(chunk.hint) || chunk.hint || lec.idea)
      : (chunk.hint || lec.idea));
  }

  function presentar(lec) {
    mostrando = lec.id;
    $('#play-title').textContent = lec.emoji + ' ' + lec.title;
    fx.sayMany([lec.title + '.', lec.idea, ...lec.texto]);   // la explicacion entera
  }

  function celebrar(siguiente) {
    fase = 'celebrando';
    const anterior = lessonById(mostrando);
    if (anterior) award('lesson-' + anterior.id, 3);
    fx.confetti(null, 50);
    fx.fanfare();
    clearMove('<div class="move-text" style="text-align:center">' +
      (anterior ? anterior.hecho : 'Paso conseguido') + '<small>siguiente paso…</small></div>');
    $('#play-tip').textContent = siguiente
      ? 'Muy bien. Ahora: ' + siguiente.emoji + ' ' + siguiente.title : '';
    setFormula(null);
    fx.say((anterior ? anterior.hecho + '. ' : '') +
      (siguiente ? 'Siguiente paso: ' + siguiente.title : ''));
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
    clearMove('<div class="move-text" style="text-align:center">¡CUBO RESUELTO!<small>has hecho los ocho pasos</small></div>');
    $('#play-tip').textContent = 'Ya sabes resolverlo entero. Mézclalo y repítelo hasta que te salga solo.';
    setFormula(null); setBar(100);
    setSteps(LESSONS.length, LESSONS.length, '🏆 Curso terminado');
    award('curso', 3);
    fx.fanfare(); fx.confetti(document.body, 160);
    fx.say('¡Cubo resuelto! Has completado los ocho pasos.');
    $('#play-action').classList.remove('hidden');
    $('#play-action').textContent = '📚 Volver al tutorial';
    $('#play-action').onclick = () => { fx.click(); go('tutorial'); };
  }

  const juego = {
    title: '📚 Curso guiado',
    start() {
      $('#play-action').classList.add('hidden');
      $('#btn-detalle').classList.toggle('on', modoDetalle);
      if (isSolved(app.state)) {
        fase = 'fin';
        clearMove('<div class="move-text" style="text-align:center">El cubo está resuelto<small>mézclalo para empezar</small></div>');
        $('#play-tip').textContent = 'Desordena el cubo y el curso arrancará solo.';
        setSteps(LESSONS.length, 0, '📚 Curso guiado'); setBar(0);
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
        $('#play-tip').textContent = 'No pasa nada, seguimos desde aquí 😊';
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
      $('#play-tip').textContent = lec.truco.replace(/<[^>]+>/g, '');
      fx.say(lec.truco);
    },

    detalle() {
      modoDetalle = !modoDetalle;
      $('#btn-detalle').classList.toggle('on', modoDetalle);
      toast(modoDetalle ? '🔍 Te explico cada movimiento' : 'Modo detalle apagado');
      pintar();
      if (modoDetalle && plan && plan.phases.length) {
        const c = plan.phases[0].chunks[ci];
        const t = detalleDe(c && c.hint);
        if (t) fx.say(t);
      }
    },

    repetir() {
      const lec = lessonById(mostrando);
      if (lec) fx.sayMany([lec.title + '.', lec.idea, ...lec.texto]);
    },
  };
  return juego;
}

// ------------------------------------------------------------
//  Motor de juegos
// ------------------------------------------------------------
function startGame(kind, arg, verify) {
  stopGame();
  go('play');
  initCube3D();
  repaint();
  padVisible(!(app.cube && app.cube.connected));
  $('#play-action').classList.add('hidden');
  $('#play-action2').classList.add('hidden');
  $('#play-formula').innerHTML = '';
  app.game = kind === 'explore' ? gameExplore(verify)
    : kind === 'undo' ? gameUndo(arg)
      : kind === 'curso' ? gameCurso(arg)
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
  $('#d-conn').textContent = (c && c.connected ? 'conectado a ' + c.name : 'sin conexión') +
    (app.mode === 'state' ? ' · leyendo el estado completo' : ' · siguiendo los giros');
  $('#d-bat').textContent = c && c.battery != null ? c.battery + ' %' : '—';
  $('#d-move').textContent = lastMoveInfo
    ? 'código ' + lastMoveInfo.code + ' · cantidad ' + lastMoveInfo.amount + '  →  cara ' +
    (app.codeToSolver[lastMoveInfo.code] || '?') + ' (' +
    (app.codeColor[lastMoveInfo.code] || 'sin calibrar') + ')'
    : '—';
  $('#d-state').textContent = lastPacket
    ? (lastPacket.solved ? 'dice que está RESUELTO' : 'dice que está mezclado') +
      (lastPacket.encrypted ? ' · paquete cifrado (i3s)' : ' · paquete sin cifrar')
    : '—';
  $('#d-raw').textContent = lastPacket
    ? Array.from(lastPacket.bytes).map((b) => b.toString(16).padStart(2, '0')).join(' ')
    : '—';
  $('#d-frame').textContent = Object.keys(app.codeToSolver).sort()
    .map((c) => c + '→' + app.codeToSolver[c] + ' (' + (app.codeColor[c] || '?') + ')')
    .join('   ') || 'sin calibrar';
  $('#d-invert').classList.toggle('on', app.invert);
  $('#d-invert').textContent = (app.invert ? '✅' : '🔁') + ' El cubo gira al revés';
}

// ------------------------------------------------------------
//  Arranque
// ------------------------------------------------------------
function boot() {
  load();
  fx.init();

  $('#btn-connect').onclick = () => { fx.click(); connect(false); };
  $('#btn-scan').onclick = async () => {
    fx.click();
    go('scan');
    $('#scan-report').classList.add('hidden');
    const el = $('#scan-avail');
    try {
      const ok = await navigator.bluetooth.getAvailability();
      el.innerHTML = ok
        ? '<b style="color:#8de08d">sí, funciona</b>'
        : '<b style="color:#ff9a9a">apagado o sin adaptador</b> — enciéndelo en Windows';
    } catch (e) { el.textContent = 'no lo sé'; }
  };
  $('#btn-scan-all').onclick = () => {
    fx.click();
    $('#scan-note').textContent = 'Elige tu cubo en la lista del navegador…';
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
    $('#cal-start').textContent = 'Empezar';
    $('#cal-emoji').textContent = '👋';
    $('#cal-title').textContent = 'Vamos a conocer tu cubo';
    $('#cal-text').innerHTML = 'Vas a girar las seis caras una vez. Así aprendo tu cubo ' +
      'de verdad, sin suponer nada.';
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

  if (!SmartCube.available) {
    $('#btn-connect').disabled = true;
    $('#btn-connect').style.opacity = .5;
    $('#home-note').innerHTML =
      'Tu navegador no tiene <b>Bluetooth Web</b>.<br>Abre esta página con <b>Chrome</b> o <b>Edge</b> ' +
      'desde <code>http://localhost:8080</code> (ejecuta <code>INICIAR.bat</code>).';
  } else if (!window.isSecureContext) {
    $('#home-note').innerHTML =
      'Para usar el Bluetooth abre la página desde <code>http://localhost:8080</code> ' +
      '(ejecuta <code>INICIAR.bat</code>), no con doble clic en el archivo.';
  }

  sections.init({
    app, go, toast, fx, hexMap, hexOf, startGame,
    moveCard, colorFem,
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
