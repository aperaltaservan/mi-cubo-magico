// ============================================================
//  entrada.js — Meter giros cuando no hay cubo conectado
// ============================================================
//  Dos maneras, y las dos hacen lo mismo:
//
//    · El teclado de verdad. Una letra por cara, que son las mismas
//      letras de la notación (U R F D L B), y con Mayúsculas el giro
//      al revés, que es lo que significa la prima: R = R, ⇧R = R'.
//      Quien aprende a resolver el cubo aprende esas letras igual,
//      así que el teclado enseña notación en vez de estorbar.
//
//    · Los botones de la pantalla, para el móvil y para quien todavía
//      no se sabe las letras. Cada botón lleva escrita su tecla.
//
//  Este fichero no toca el DOM por su cuenta ni sabe del cubo: recibe
//  lo que necesita, así que se puede probar en Node sin navegador.
// ============================================================

/** Tecla -> cara. Es la propia notación, en minúscula para comparar. */
export const TECLAS = { u: 'U', r: 'R', f: 'F', d: 'D', l: 'L', b: 'B' };

/**
 * Traduce una pulsación en un giro, o devuelve null si esa tecla no
 * es de girar. Los atajos del navegador (Ctrl+R para recargar, por
 * ejemplo) se dejan pasar: sólo miramos la letra pelada.
 * @param {{key?:string, shiftKey?:boolean, ctrlKey?:boolean,
 *          altKey?:boolean, metaKey?:boolean}} e
 * @returns {{face:string, amount:number}|null}
 */
export function giroDeTecla(e) {
  if (!e || e.ctrlKey || e.altKey || e.metaKey) return null;
  const cara = TECLAS[String(e.key || '').toLowerCase()];
  if (!cara) return null;
  return { face: cara, amount: e.shiftKey ? 3 : 1 };
}

/**
 * ¿El foco está en un sitio donde se escribe? Entonces una "r" es una
 * letra, no un giro. Hoy la app no tiene campos de texto, pero esto
 * evita que el día que se añada uno deje de poderse escribir en él.
 */
export function escribiendo(el) {
  if (!el) return false;
  const t = String(el.tagName || '').toLowerCase();
  return t === 'input' || t === 'textarea' || t === 'select' || el.isContentEditable === true;
}

/** Cómo se escribe un giro en notación: U, U', U2 */
export function textoGiro(face, amount) {
  return face + (amount === 2 ? '2' : amount === 3 ? "'" : '');
}

/**
 * Rellena el teclado de pantalla: una columna por cara, arriba el giro
 * a favor del reloj y abajo el contrario, y en cada botón la tecla que
 * hace exactamente eso mismo.
 * @param {HTMLElement} pad  contenedor
 * @param {object} o  { caras, hexOf, corto, onMove }
 */
export function construirPad(pad, { caras, hexOf, corto, onMove }) {
  pad.innerHTML = '';
  for (const amount of [1, 3]) {
    for (const f of caras) {
      const b = document.createElement('button');
      b.type = 'button';
      b.style.background = hexOf(f);
      b.title = textoGiro(f, amount) + (amount === 3 ? ' (Mayúsculas + ' + f + ')' : '');
      b.setAttribute('aria-label', textoGiro(f, amount));
      b.innerHTML = `<span aria-hidden="true">${amount === 1 ? '↻' : '↺'}</span>`
        + `<em>${corto(f)}</em>`
        + `<kbd>${amount === 1 ? f : '⇧' + f}</kbd>`;
      b.onclick = () => onMove(f, amount);
      pad.appendChild(b);
    }
  }
}
