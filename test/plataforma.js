// ============================================================
//  test/plataforma.js — Reconocer un iPhone
// ============================================================
//  Si esto falla en un sentido, a alguien con un iPhone se le dice
//  que abra Chrome y ejecute un .bat, que en un móvil no existe.
//  Si falla en el otro, a alguien con un ordenador se le esconde el
//  botón de conectar teniendo el Bluetooth ahí mismo.
// ============================================================

import { esIOS } from '../js/plataforma.js';

let fallos = 0;
let pruebas = 0;
function ok(cond, msg) {
  pruebas++;
  if (!cond) { fallos++; console.log('  FALLA: ' + msg); }
}

const UA = {
  iphoneSafari: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) '
    + 'AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.5 Mobile/15E148 Safari/604.1',
  iphoneChrome: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) '
    + 'AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/126.0 Mobile/15E148 Safari/604.1',
  iphoneFirefox: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) '
    + 'AppleWebKit/605.1.15 (KHTML, like Gecko) FxiOS/127.0 Mobile/15E148 Safari/605.1.15',
  ipadViejo: 'Mozilla/5.0 (iPad; CPU OS 12_5 like Mac OS X) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/12.1 Mobile/15E148 Safari/604.1',
  ipadOS: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  macSafari: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 '
    + '(KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  macChrome: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  windows: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36',
  android: 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 '
    + '(KHTML, like Gecko) Chrome/126.0.0.0 Mobile Safari/537.36',
};

console.log('--- los tres navegadores de iPhone son el mismo por dentro ---');
ok(esIOS(UA.iphoneSafari, 5) === true, 'Safari en iPhone');
ok(esIOS(UA.iphoneChrome, 5) === true, 'Chrome en iPhone (es WebKit por dentro)');
ok(esIOS(UA.iphoneFirefox, 5) === true, 'Firefox en iPhone (también)');
ok(esIOS(UA.ipadViejo, 5) === true, 'iPad antiguo, que sí se anuncia como iPad');

console.log('--- el iPad moderno se hace pasar por un Mac ---');
// Desde iPadOS 13 manda el user agent de un Mac de escritorio. Lo único
// que lo delata es la pantalla táctil, que ningún Mac tiene.
ok(esIOS(UA.ipadOS, 5) === true, 'iPad con user agent de Mac pero táctil');
ok(esIOS(UA.macSafari, 0) === false, 'un Mac de verdad no es iOS');
ok(esIOS(UA.macChrome, 0) === false, 'Chrome en Mac tampoco');
ok(esIOS(UA.macSafari, 1) === false, 'un solo punto táctil no basta (ratón)');

console.log('--- lo demás, no ---');
ok(esIOS(UA.windows, 0) === false, 'Windows');
ok(esIOS(UA.android, 5) === false, 'Android, que sí tiene Bluetooth en Chrome');

console.log('--- sin datos, no se adivina ---');
ok(esIOS('', 0) === false, 'sin user agent');
ok(esIOS(undefined, undefined) === false, 'sin nada');
ok(esIOS(null, NaN) === false, 'con basura');

console.log('');
console.log(pruebas + ' pruebas de plataforma OK, ' + fallos + ' fallos');
if (fallos) process.exit(1);
