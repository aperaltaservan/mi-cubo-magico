import { decode, toFacelets, VALUE_COLOR } from '../js/xiaomi.js';
import * as C from '../js/cube.js';

let ok = 0, bad = 0;
const t = (n, c, extra) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (extra?'  '+extra:'')); } };

// --- giros del cubo entero ---
const rots = C.allRotations();
t('24 orientaciones', rots.length === 24, 'salen ' + rots.length);
for (const m of rots) {
  const s = C.rotateFrame(C.solvedState(), m);
  if (!C.isSolved(s)) { t('girar el cubo resuelto lo deja resuelto', false, JSON.stringify(m)); break; }
}
t('girar el cubo resuelto lo deja resuelto', rots.every(m => C.isSolved(C.rotateFrame(C.solvedState(), m))));
{
  // girar el marco y luego resolver debe dar el mismo numero de movimientos
  const scr = C.applyAlg(C.solvedState(), "R U2 F' L D B' R2 U F");
  const m = C.findRotation('B', 'D', 'D', 'F');
  const r = C.rotateFrame(scr, m);
  t('el giro de marco da un estado valido', C.validateState(r) === null, C.validateState(r));
  const { solve } = await import('../js/solver.js');
  // tras girar el marco la primera capa es otra cara, asi que la solucion
  // es distinta; lo que tiene que seguir cumpliendose es que resuelva
  t('sigue resolviendose tras girar el marco', C.isSolved(C.applyAlg(r, solve(r).moves)));
  // y girar el marco de ida y vuelta tiene que dejarlo como estaba
  const inv = C.allRotations().find(x => C.FACES.every(f => x[m[f]] === f));
  t('girar el marco es reversible', C.rotateFrame(r, inv).join('') === scr.join(''));
}

// --- decodificador con paquetes sinteticos ---
function packet(cp, co, ep, eo) {
  const b = new Uint8Array(20);
  for (let i = 0; i < 4; i++) b[i] = (cp[i*2] << 4) | cp[i*2+1];
  for (let i = 0; i < 4; i++) b[4+i] = (co[i*2] << 4) | co[i*2+1];
  for (let i = 0; i < 6; i++) b[8+i] = (ep[i*2] << 4) | ep[i*2+1];
  let v14 = 0, v15 = 0;
  for (let i = 0; i < 8; i++) if (eo[i] === 2) v14 |= 128 >> i;
  for (let i = 0; i < 4; i++) if (eo[8+i] === 2) v15 |= 128 >> i;
  b[14] = v14; b[15] = v15;
  return b;
}
let seed = 7;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };
const shuffle = (a) => { for (let i = a.length-1; i > 0; i--) { const j = (rnd()*(i+1))|0; [a[i],a[j]]=[a[j],a[i]]; } return a; };

let malos = 0, colorMal = 0, piezaMal = 0;
for (let n = 0; n < 800; n++) {
  const cp = shuffle([1,2,3,4,5,6,7,8]);
  const co = Array.from({length:8}, () => 1 + ((rnd()*3)|0));
  const ep = shuffle([1,2,3,4,5,6,7,8,9,10,11,12]);
  const eo = Array.from({length:12}, () => 1 + ((rnd()*2)|0));
  const vals = decode(packet(cp, co, ep, eo));
  if (!vals) { malos++; continue; }
  const cuenta = {};
  for (const v of vals) cuenta[v] = (cuenta[v]||0)+1;
  if (Object.keys(cuenta).length !== 6 || Object.values(cuenta).some(c => c !== 9)) { colorMal++; continue; }
  const r = toFacelets(vals);
  if (!r) { malos++; continue; }
  // cada esquina y arista del modelo debe llevar colores de caras distintas
  for (const name of C.CORNER_NAMES) {
    const s = C.CORNERS[name].map(i => r.state[i]);
    if (new Set(s.map(f => f==='U'||f==='D' ? 'y' : f==='R'||f==='L' ? 'x' : 'z')).size !== 3) piezaMal++;
  }
  for (const name of C.EDGE_NAMES) {
    const s = C.EDGES[name].map(i => r.state[i]);
    if (new Set(s.map(f => f==='U'||f==='D' ? 'y' : f==='R'||f==='L' ? 'x' : 'z')).size !== 2) piezaMal++;
  }
}
t('800 paquetes sinteticos decodifican', malos === 0, malos + ' fallos');
t('siempre 9 pegatinas de cada color', colorMal === 0, colorMal + ' fallos');
t('las piezas caen en posiciones validas', piezaMal === 0, piezaMal + ' fallos');

console.log(ok + ' pruebas OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
