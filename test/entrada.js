// ============================================================
//  test/entrada.js — Meter giros sin cubo conectado
// ============================================================
//  Sin cubo, el teclado y los botones de la pantalla son la unica
//  manera de mover el cubo, asi que conviene que esten atados:
//  la tecla R y el primer boton naranja tienen que hacer lo mismo.
// ============================================================

import { FACES } from '../js/cube.js';
import {
  TECLAS, giroDeTecla, escribiendo, textoGiro, construirPad,
} from '../js/entrada.js';

let fallos = 0;
let pruebas = 0;
function ok(cond, msg) {
  pruebas++;
  if (!cond) { fallos++; console.log('  FALLA: ' + msg); }
}
function seccion(t) { console.log('--- ' + t + ' ---'); }

// ------------------------------------------------------------
seccion('cada cara tiene su letra, y son las de la notacion');
ok(Object.keys(TECLAS).length === 6, 'tienen que ser seis teclas');
for (const f of FACES) {
  ok(TECLAS[f.toLowerCase()] === f, 'la tecla ' + f.toLowerCase() + ' gira ' + f);
}

// ------------------------------------------------------------
seccion('mayusculas = giro al reves, como la prima');
for (const f of FACES) {
  const baja = giroDeTecla({ key: f.toLowerCase() });
  const alta = giroDeTecla({ key: f, shiftKey: true });
  ok(baja.face === f && baja.amount === 1, f.toLowerCase() + ' es ' + f);
  ok(alta.face === f && alta.amount === 3, 'Mayus+' + f + ' es ' + f + "'");
}
// el navegador manda key en mayuscula cuando esta Mayus, y hay que
// aceptar las dos formas o con el bloqueo de mayusculas no giraria nada
ok(giroDeTecla({ key: 'R' }).amount === 1, 'una R sin Mayus sigue siendo R');

// ------------------------------------------------------------
seccion('lo que no es un giro, no gira');
for (const t of ['a', 'z', ' ', 'Enter', 'Escape', 'ArrowUp', '1', '']) {
  ok(giroDeTecla({ key: t }) === null, '"' + t + '" no es un giro');
}
ok(giroDeTecla(null) === null, 'sin evento, nada');
// Ctrl+R es recargar y Alt+F es un menu: no se pueden robar
for (const mod of ['ctrlKey', 'altKey', 'metaKey']) {
  const e = { key: 'r' };
  e[mod] = true;
  ok(giroDeTecla(e) === null, mod + ' + r no gira (es un atajo del navegador)');
}

// ------------------------------------------------------------
seccion('escribiendo en un campo, las letras son letras');
ok(escribiendo({ tagName: 'INPUT' }) === true, 'un input escribe');
ok(escribiendo({ tagName: 'TEXTAREA' }) === true, 'un textarea escribe');
ok(escribiendo({ tagName: 'SELECT' }) === true, 'un select escribe');
ok(escribiendo({ tagName: 'DIV', isContentEditable: true }) === true, 'editable escribe');
ok(escribiendo({ tagName: 'BUTTON' }) === false, 'un boton no escribe');
ok(escribiendo(null) === false, 'sin elemento, no escribe');

// ------------------------------------------------------------
seccion('notacion');
ok(textoGiro('R', 1) === 'R', 'R');
ok(textoGiro('R', 2) === 'R2', 'R2');
ok(textoGiro('R', 3) === "R'", "R'");

// ------------------------------------------------------------
seccion('el boton y la tecla hacen lo mismo');
// Un DOM de mentira, lo justo para que construirPad funcione en Node.
class Nodo {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.style = {};
    this.innerHTML = '';
    this.attrs = {};
    this.onclick = null;
  }

  appendChild(n) { this.children.push(n); return n; }
  setAttribute(k, v) { this.attrs[k] = v; }

  set innerHTMLValue(v) { this.innerHTML = v; }
}
globalThis.document = { createElement: (t) => new Nodo(t) };

const pad = new Nodo('div');
const dados = [];
construirPad(pad, {
  caras: FACES,
  hexOf: () => '#123456',
  corto: (f) => 'C' + f,
  onMove: (face, amount) => dados.push({ face, amount }),
});

ok(pad.children.length === 12, 'seis caras por dos sentidos son doce botones');

// Esta es la formula que usa app.js para saber que boton corresponde a
// la tecla que acabas de pulsar. Si el orden del pad cambiara sin tocar
// la formula, parpadearia el boton equivocado: por eso se comprueba.
const indiceDe = (face, amount) =>
  (amount === 3 ? FACES.length : 0) + FACES.indexOf(face);

for (const amount of [1, 3]) {
  for (const f of FACES) {
    const i = indiceDe(f, amount);
    const b = pad.children[i];
    ok(b.attrs['aria-label'] === textoGiro(f, amount),
      'el boton ' + i + ' es ' + textoGiro(f, amount) + ', no ' + b.attrs['aria-label']);
    // la tecla escrita en el boton tiene que ser la que hace ese giro
    const escrita = (b.innerHTML.match(/<kbd>(.*?)<\/kbd>/) || [])[1];
    ok(escrita === (amount === 1 ? f : '⇧' + f),
      'el boton ' + textoGiro(f, amount) + ' anuncia la tecla ' + escrita);
    // y pulsarlo tiene que dar exactamente el mismo giro que la tecla
    dados.length = 0;
    b.onclick();
    const porTecla = giroDeTecla({ key: f.toLowerCase(), shiftKey: amount === 3 });
    ok(dados.length === 1
      && dados[0].face === porTecla.face
      && dados[0].amount === porTecla.amount,
      'boton y tecla coinciden en ' + textoGiro(f, amount));
  }
}

// ------------------------------------------------------------
seccion('la app nunca pide un giro que no se pueda teclear');
// Sin cubo, el teclado son seis letras: si algun paso pidiera M, S, x
// o un giro de dos capas, el modo sin cubo se quedaria atascado ahi.
// Los patrones estan escritos con capas medias a proposito, asi que
// esto comprueba de verdad que se expanden antes de ensenarlos.
const { expandAlg } = await import('../js/cube.js');
const { PATRONES } = await import('../js/patrones.js');
const { SETS } = await import('../js/algs.js');

function tecleable(alg, de) {
  for (const m of expandAlg(alg)) {
    ok(TECLAS[m.face.toLowerCase()] === m.face,
      de + ': la cara ' + m.face + ' no tiene tecla');
    ok([1, 2, 3].includes(m.amount),
      de + ': el giro ' + m.amount + ' no se puede dar');
  }
}

for (const p of PATRONES) tecleable(p.alg, 'patrón ' + p.id);
for (const kind of Object.keys(SETS)) {
  for (const c of SETS[kind].casos) {
    tecleable(c.alg, kind + ' ' + c.name);
    if (c.setup) tecleable(c.setup, kind + ' ' + c.name + ' (montaje)');
  }
}
console.log('  ' + PATRONES.length + ' patrones y '
  + Object.values(SETS).reduce((a, s) => a + s.casos.length, 0)
  + ' casos, todos tecleables');

console.log('');
console.log('total entrada: ' + pruebas + ' pruebas OK, ' + fallos + ' fallos');
if (fallos) process.exit(1);
