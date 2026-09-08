// ============================================================
//  cube3d.js — Cubo 3D con transformaciones CSS (sin librerias)
// ============================================================

import { stickerGeometry, FACES } from './cube.js';

// Giro horario de cada cara traducido a rotaciones CSS
// (en CSS el eje Y apunta hacia abajo, por eso algunos signos cambian)
const CSS_ROT = {
  U: (d) => `rotateY(${-90 * d}deg)`,
  D: (d) => `rotateY(${90 * d}deg)`,
  R: (d) => `rotateX(${90 * d}deg)`,
  L: (d) => `rotateX(${-90 * d}deg)`,
  F: (d) => `rotateZ(${90 * d}deg)`,
  B: (d) => `rotateZ(${-90 * d}deg)`,
};

const AXIS = { U: [1, 1], D: [1, -1], R: [0, 1], L: [0, -1], F: [2, 1], B: [2, -1] };

// Angulos de camara para que se vea bien cada cara
export const VIEWS = {
  F: [-24, -34], R: [-24, -124], B: [-24, -214], L: [-24, -304],
  U: [-64, -34], D: [26, -34],
};

const FACE_TRANSFORM = {
  '0,0,1': 'translateZ(HALFpx)',                        // frente
  '0,0,-1': 'rotateY(180deg) translateZ(HALFpx)',       // detras
  '1,0,0': 'rotateY(90deg) translateZ(HALFpx)',         // derecha
  '-1,0,0': 'rotateY(-90deg) translateZ(HALFpx)',       // izquierda
  '0,1,0': 'rotateX(90deg) translateZ(HALFpx)',         // arriba
  '0,-1,0': 'rotateX(-90deg) translateZ(HALFpx)',       // abajo
};

export class Cube3D {
  /**
   * @param {HTMLElement} host  contenedor
   * @param {object} opts  { size, colors }  colors: {U:'#fff',...}
   */
  constructor(host, opts = {}) {
    this.host = host;
    this.size = opts.size || 62;
    this.gap = opts.gap || 4;
    this.colors = opts.colors || {
      U: '#ffd93d', R: '#ff8c42', F: '#4caf50', D: '#fafafa', L: '#e53935', B: '#2196f3',
    };
    this.rotX = VIEWS.F[0];
    this.rotY = VIEWS.F[1];
    this.animating = false;
    this._build();
    this._enableDrag();
  }

  _build() {
    this.host.innerHTML = '';
    this.host.classList.add('scene');
    this.root = document.createElement('div');
    this.root.className = 'cube3d';
    this.host.appendChild(this.root);

    const S = this.size;
    const step = S + this.gap;

    // 26 cubitos
    this.cubies = new Map();
    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          if (!x && !y && !z) continue;
          const el = document.createElement('div');
          el.className = 'cubie';
          el.style.width = el.style.height = S + 'px';
          el.style.marginLeft = el.style.marginTop = -S / 2 + 'px';
          const base = `translate3d(${x * step}px, ${-y * step}px, ${z * step}px)`;
          el.dataset.base = base;
          el.style.transform = base;
          // 6 caritas
          for (const key of Object.keys(FACE_TRANSFORM)) {
            const [fx, fy, fz] = key.split(',').map(Number);
            const face = document.createElement('div');
            face.className = 'cubie-face';
            face.style.transform = FACE_TRANSFORM[key].replace('HALF', String(S / 2));
            face.dataset.n = key;
            el.appendChild(face);
          }
          this.root.appendChild(el);
          this.cubies.set([x, y, z].join(','), el);
        }
      }
    }

    // indice pegatina -> elemento de carita
    this.stickerEls = [];
    for (let i = 0; i < 54; i++) {
      const g = stickerGeometry(i);
      const cubie = this.cubies.get(g.pos.join(','));
      const el = cubie.querySelector(`[data-n="${g.normal.join(',')}"]`);
      this.stickerEls.push(el);
    }
    this._applyView();
  }

  _applyView() {
    this.root.style.transform =
      `rotateX(${this.rotX}deg) rotateY(${this.rotY}deg)`;
  }

  _enableDrag() {
    let start = null;
    const down = (e) => {
      const p = e.touches ? e.touches[0] : e;
      start = { x: p.clientX, y: p.clientY, rx: this.rotX, ry: this.rotY };
    };
    const move = (e) => {
      if (!start) return;
      const p = e.touches ? e.touches[0] : e;
      this.rotY = start.ry + (p.clientX - start.x) * 0.45;
      this.rotX = Math.max(-89, Math.min(89, start.rx - (p.clientY - start.y) * 0.45));
      this.root.style.transition = 'none';
      this._applyView();
      if (e.cancelable) e.preventDefault();
    };
    const up = () => { start = null; this.root.style.transition = ''; };
    this.host.addEventListener('mousedown', down);
    this.host.addEventListener('touchstart', down, { passive: true });
    window.addEventListener('mousemove', move);
    window.addEventListener('touchmove', move, { passive: false });
    window.addEventListener('mouseup', up);
    window.addEventListener('touchend', up);
  }

  /** Gira la camara para que se vea bien una cara */
  lookAt(face, instant = false) {
    const [rx, ry] = VIEWS[face] || VIEWS.F;
    // elige la vuelta mas corta
    let target = ry;
    while (target - this.rotY > 180) target -= 360;
    while (this.rotY - target > 180) target += 360;
    if (instant) this.root.style.transition = 'none';
    this.rotX = rx; this.rotY = target;
    this._applyView();
    if (instant) requestAnimationFrame(() => { this.root.style.transition = ''; });
  }

  setColors(colors) { this.colors = colors; }

  /** Pinta el estado (array de 54 letras de cara) */
  render(state) {
    this.state = state.slice();
    for (let i = 0; i < 54; i++) {
      this.stickerEls[i].style.background = this.colors[state[i]] || '#333';
      this.stickerEls[i].classList.add('painted');
    }
  }

  /** Resalta unas pegatinas (para explicar un paso) */
  highlight(indices) {
    for (const el of this.stickerEls) el.classList.remove('hi');
    for (const i of indices || []) this.stickerEls[i].classList.add('hi');
  }

  /**
   * Anima un giro y deja pintado `newState`.
   * @returns {Promise<void>}
   */
  turn(face, amount, newState, ms = 420) {
    return new Promise((resolve) => {
      const dir = amount === 3 ? -1 : amount;         // 3 vueltas = una al reves
      const [axis, sign] = AXIS[face];
      const layer = [];
      for (const [key, el] of this.cubies) {
        const c = key.split(',').map(Number);
        if (c[axis] === sign) layer.push(el);
      }
      const rot = CSS_ROT[face](dir);
      this.animating = true;
      for (const el of layer) {
        el.style.transition = `transform ${ms}ms cubic-bezier(.4,.9,.3,1)`;
        el.style.transform = rot + ' ' + el.dataset.base;
      }
      setTimeout(() => {
        for (const el of layer) {
          el.style.transition = 'none';
          el.style.transform = el.dataset.base;
        }
        if (newState) this.render(newState);
        requestAnimationFrame(() => {
          for (const el of layer) el.style.transition = '';
          this.animating = false;
          resolve();
        });
      }, ms);
    });
  }
}

/** Dibuja una flecha curva que indica el sentido del giro */
export function arrowSVG(clockwise, color = '#222') {
  const d = clockwise
    ? 'M15 48 A22 22 0 1 1 45 48'
    : 'M45 48 A22 22 0 1 0 15 48';
  const hx = clockwise ? 45 : 15;
  const rot = clockwise ? 45 : -45;   // orienta la punta con la tangente
  return `<svg viewBox="0 0 60 64" class="arrow" aria-hidden="true">
    <path d="${d}" fill="none" stroke="${color}" stroke-width="9" stroke-linecap="round"/>
    <polygon points="${hx},60 ${hx - 9},42 ${hx + 9},42" fill="${color}"
             transform="rotate(${rot} ${hx} 48)"/>
  </svg>`;
}
