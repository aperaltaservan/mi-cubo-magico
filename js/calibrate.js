// ============================================================
//  calibrate.js — Aprender el cubo de verdad
// ============================================================
//  Cada cubo numera sus caras a su manera y no hay una tabla
//  fiable. En vez de suponerla, se la preguntamos al cubo:
//
//   1. El usuario gira las 6 caras -> aprendemos codigo -> color.
//   2. Una pregunta ("con el blanco abajo y el verde delante,
//      ¿que color queda a la derecha?") fija la orientacion.
//   3. Un giro de prueba fija el sentido de las agujas del reloj.
//
//  Con eso el mapa codigo -> cara del solucionador queda
//  determinado por la geometria real del cubo, sin suposiciones.
// ============================================================

import { t } from './i18n.js';

export const COLORS = ['blanco', 'amarillo', 'verde', 'azul', 'rojo', 'naranja'];

export const COLOR_HEX = {
  blanco: '#fafafa', amarillo: '#ffd93d', verde: '#4caf50',
  azul: '#2196f3', naranja: '#ff8c42', rojo: '#e53935',
};

export const COLOR_OPPOSITE = {
  blanco: 'amarillo', amarillo: 'blanco', verde: 'azul',
  azul: 'verde', rojo: 'naranja', naranja: 'rojo',
};

// Con el blanco abajo y el verde delante, la cara de arriba es la amarilla
// y la de detras la azul. Solo falta saber si a la derecha queda el rojo o
// el naranja: eso depende del cubo y por eso se pregunta.
export function buildMaps(codeColor, rightColor) {
  const byColor = {};
  for (const code of Object.keys(codeColor)) byColor[codeColor[code]] = Number(code);

  const wanted = {
    D: 'blanco', U: 'amarillo', F: 'verde', B: 'azul',
    R: rightColor, L: COLOR_OPPOSITE[rightColor],
  };

  const solverToCode = {};
  const codeToSolver = {};
  const faceColor = {};
  for (const solverFace of Object.keys(wanted)) {
    const color = wanted[solverFace];
    const code = byColor[color];
    if (!code) return { error: t('Falta la cara {color}', { color: t(color) }) };
    solverToCode[solverFace] = code;
    codeToSolver[code] = solverFace;
    faceColor[solverFace] = color;
  }
  return { solverToCode, codeToSolver, faceColor };
}

/** Comprueba que las 6 caras tienen los 6 colores, sin repetir */
export function checkColors(codeColor) {
  const seen = Object.values(codeColor);
  if (seen.length !== 6) return t('Faltan caras por girar');
  for (const c of COLORS) {
    if (seen.filter((x) => x === c).length !== 1) {
      return t('El color {color} aparece {veces} veces',
        { color: t(c), veces: seen.filter((x) => x === c).length });
    }
  }
  return null;
}

/**
 * Maquina de estados de la calibracion.
 * `ui` recibe los avisos para pintar la pantalla.
 */
export class Calibration {
  constructor(ui) {
    this.ui = ui;
    this.stage = 'colors';
    this.idx = 0;               // color que estamos preguntando
    this.codeColor = {};        // codigo del cubo -> color
    this.rightColor = null;
    this.invert = false;
    this.render();
  }

  get pending() { return COLORS.filter((c) => !Object.values(this.codeColor).includes(c)); }
  get step() { return 6 - this.pending.length + (this.stage === 'colors' ? 1 : 7); }

  render() {
    if (this.stage === 'colors') {
      const color = this.pending[0];
      this.ui.askColor(color, 6 - this.pending.length, 6);
    } else if (this.stage === 'right') {
      this.ui.askRight();
    } else if (this.stage === 'direction') {
      this.ui.askDirection();
    }
  }

  /** Un giro del cubo fisico */
  onMove(detail) {
    const code = detail.code;
    if (this.stage === 'colors') {
      if (this.codeColor[code]) {
        this.ui.warn(t('Esa cara ya la hemos hecho: es la {color}',
          { color: t(this.codeColor[code]) })
          + ' ' + t('Gira la <b>{color}</b>.', { color: t(this.pending[0]) }));
        return;
      }
      this.codeColor[code] = this.pending[0];
      this.ui.gotColor();
      // Si ya conocemos 5 codigos y todos estan entre 1 y 6, el sexto es el
      // que falta: nos ahorramos un giro sin suponer nada raro.
      if (this.pending.length === 1) {
        const seen = Object.keys(this.codeColor).map(Number);
        const missing = [1, 2, 3, 4, 5, 6].filter((c) => !seen.includes(c));
        if (seen.every((c) => c >= 1 && c <= 6) && missing.length === 1) {
          this.codeColor[missing[0]] = this.pending[0];
          this.ui.note(t('La última la deduzco yo 😉'));
        }
      }
      if (this.pending.length === 0) this.stage = 'right';
      this.render();
      return;
    }

    if (this.stage === 'direction') {
      const white = Number(Object.keys(this.codeColor).find((c) => this.codeColor[c] === 'blanco'));
      if (code !== white) {
        this.ui.warn(t('Esa no. Gira la cara <b>BLANCA</b> siguiendo la flecha.'));
        return;
      }
      if (detail.amount === 2) {
        this.ui.warn(t('Eso ha sido media vuelta. Gírala <b>solo un cuarto</b>.'));
        return;
      }
      this.invert = detail.amount === 3;
      this.finish();
    }
  }

  /** Respuesta a la pregunta de la derecha */
  chooseRight(color) {
    this.rightColor = color;
    this.stage = 'direction';
    this.render();
  }

  /** Sexta cara deducida sin girarla (por si el usuario no puede) */
  inferLast(code) {
    if (this.pending.length === 1) this.codeColor[code] = this.pending[0];
  }

  finish() {
    const problem = checkColors(this.codeColor);
    if (problem) { this.ui.fail(problem); return; }
    const maps = buildMaps(this.codeColor, this.rightColor);
    if (maps.error) { this.ui.fail(maps.error); return; }
    this.ui.done({ ...maps, codeColor: this.codeColor, invert: this.invert });
  }
}
