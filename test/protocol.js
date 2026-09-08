// Prueba del analisis de paquetes con datos reales del cubo del usuario
import { parsePacket, newMoves, looksSolved } from '../js/giiker.js';
const hex = (s) => new Uint8Array(s.split(' ').map((h) => parseInt(h, 16)));
let ok = 0, bad = 0;
const t = (n, c) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n); } };

const real = hex('12 34 56 78 33 33 33 33 12 34 56 78 9a bc 00 00 23 23 22 c1');
const p = parsePacket(real);
t('paquete real: resuelto', p.solved === true);
t('paquete real: sin cifrar', p.encrypted === false);
t('paquete real: 4 giros de historial', p.moves.length === 4);
t('paquete real: ultimo giro cara 2 x3', p.moves[0].code === 2 && p.moves[0].amount === 3);

// un cubo con una esquina movida no puede estar resuelto
t('detecta mezclado', !looksSolved(hex('21 34 56 78 33 33 33 33 12 34 56 78 9a bc 00 00 23 23 22 c1')));
t('detecta arista girada', !looksSolved(hex('12 34 56 78 33 33 33 33 12 34 56 78 9a bc 80 00 23 23 22 c1')));

// historial: un giro nuevo
const a = parsePacket(real).moves;
const b = parsePacket(hex('12 34 56 78 33 33 33 33 12 34 56 78 9a bc 00 00 41 23 23 22')).moves;
const nuevos = newMoves(a, b);
t('detecta 1 giro nuevo', nuevos.length === 1 && nuevos[0].code === 4 && nuevos[0].amount === 1);

// dos giros seguidos perdiendo un aviso
const c = parsePacket(hex('12 34 56 78 33 33 33 33 12 34 56 78 9a bc 00 00 53 41 23 23')).moves;
const dos = newMoves(a, c);
t('recupera 2 giros perdidos', dos.length === 2 && dos[0].code === 4 && dos[1].code === 5);

// paquete cifrado: solo 2 giros de historial
const enc = new Uint8Array(20); enc[18] = 0xa7; enc[19] = 0x00;
t('cifrado -> 2 giros', parsePacket(enc).moves.length === 2 && parsePacket(enc).encrypted);

console.log(ok + ' pruebas de protocolo OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
