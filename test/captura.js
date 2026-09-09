// Grabar un cubo desconocido: el guion y el volcado tienen que servir
// para escribir su decodificador sin tenerlo delante.
import * as C from '../js/cube.js';
import {
  GUION, TOPE, hex, nuevaCaptura, anotar, volcado, guionEnTexto,
} from '../js/captura.js';

let ok = 0, bad = 0;
const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (x !== undefined ? '  ' + x : '')); } };

console.log('--- el guion de giros ---');
{
  // lo que hace útil al guion: NO cambia el cubo. Así quien graba puede
  // comprobar solo que no se ha saltado ninguno, sin fiarse de nosotros
  const fin = C.applyAlg(C.solvedState(), GUION);
  t('el guion deja el cubo como estaba', C.isSolved(fin));

  const caras = new Set(GUION.map((m) => m.face));
  t('pasa por las seis caras', caras.size === 6, [...caras].join(''));
  const sentidos = new Set(GUION.map((m) => m.amount));
  t('en los dos sentidos y con dobles',
    sentidos.has(1) && sentidos.has(3) && sentidos.has(2), [...sentidos].join(''));
  for (const m of GUION) {
    if (!C.FACES.includes(m.face) || ![1, 2, 3].includes(m.amount)) {
      t('todos los giros son válidos', false, JSON.stringify(m));
      break;
    }
  }
  t('todos los giros son válidos', true);
  // corto de hacer: un niño no, pero un adulto lo hace en un minuto
  t('no es interminable', GUION.length <= 20, GUION.length + ' giros');

  const texto = guionEnTexto();
  t('el guion se escribe en notación', /^1 U\s+2 U'\s+3 R/.test(texto), texto.slice(0, 30));
  t('los numera todos', texto.includes(String(GUION.length) + ' '), texto.slice(-12));
}

console.log('--- apuntar avisos ---');
{
  const cap = nuevaCaptura({ aparato: 'GAN_1234' }, 1000);
  t('empieza vacía', cap.avisos.length === 0);
  anotar(cap, { t: 1000, char: 'aadc', bytes: [0x12, 0x34] });
  anotar(cap, { t: 1812, char: 'aadc', bytes: new Uint8Array([0xff, 0x00]) });
  t('apunta los dos', cap.avisos.length === 2);
  t('el primero va en cero', cap.avisos[0].ms === 0, cap.avisos[0].ms);
  t('el segundo, relativo al principio', cap.avisos[1].ms === 812, cap.avisos[1].ms);
  t('guarda los bytes, vengan como vengan',
    hex(cap.avisos[1].bytes) === 'ff 00', hex(cap.avisos[1].bytes));

  // un aviso vacío no aporta nada y ensuciaría el volcado
  anotar(cap, { t: 2000, char: 'aadc', bytes: [] });
  anotar(cap, null);
  t('los avisos vacíos no se apuntan', cap.avisos.length === 2, cap.avisos.length);

  // un reloj que va hacia atrás no puede dar milisegundos negativos
  anotar(cap, { t: 10, char: 'aadc', bytes: [1] });
  t('nunca sale un tiempo negativo', cap.avisos[2].ms === 0, cap.avisos[2].ms);
}

console.log('--- el tope, para no quedarse sin memoria ---');
{
  const cap = nuevaCaptura({}, 0);
  for (let i = 0; i < TOPE + 25; i++) anotar(cap, { t: i, char: 'x', bytes: [i & 0xff] });
  t('deja de crecer en el tope', cap.avisos.length === TOPE, cap.avisos.length);
  t('pero cuenta los que se pierden', cap.perdidos === 25, cap.perdidos);
  t('y lo dice en el volcado', volcado(cap).includes('25 avisos más'));
}

console.log('--- el volcado ---');
{
  const cap = nuevaCaptura({
    aparato: 'GAN_1234',
    navegador: 'Chrome/999 (prueba)',
    servicios: [{ service: '6e400001-b5a3', chars: ['6e400003 [avisar]'] }],
  }, 500);
  anotar(cap, { t: 500, char: '6e400003', bytes: [0xa1, 0x0f] });
  anotar(cap, { t: 1500, char: '6e400003', bytes: [0xa1, 0x10] });
  const v = volcado(cap);

  t('dice de qué aparato es', v.includes('GAN_1234'));
  t('y con qué navegador', v.includes('Chrome/999'));
  t('lista los servicios', v.includes('6e400001-b5a3') && v.includes('6e400003 [avisar]'));
  t('lleva el guion dentro', v.includes("1 U") && v.includes("12 B'"), v.split('\n').find((l) => l.includes('1 U')));
  t('avisa de que el cubo tiene que acabar resuelto', /resuelto/i.test(v));
  t('lleva los bytes en hexadecimal', v.includes('a1 0f') && v.includes('a1 10'));
  t('y los tiempos', v.includes('1000'), v.split('\n').pop());
  t('en el orden en que llegaron', v.indexOf('a1 0f') < v.indexOf('a1 10'));
  t('dónde pegarlo', v.includes('github.com/aperaltaservan/mi-cubo-magico/issues'));

  // el caso que más va a pasar: un cubo que no dice nada porque el
  // navegador no deja ver su servicio. El volcado tiene que explicarlo
  const mudo = volcado(nuevaCaptura({ aparato: 'Cosa rara' }, 0));
  t('un cubo mudo también da volcado', mudo.includes('Cosa rara'));
  t('y explica que no dijo nada', mudo.includes('ningún aviso'));
  t('sin servicios, lo dice', mudo.includes('ninguno'));
  t('sin captura no revienta', volcado(null) === '');
}

console.log('');
console.log(ok + ' pruebas de captura OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
