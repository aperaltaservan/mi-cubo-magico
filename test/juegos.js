// Los juegos de colores: que sean jugables, no sólo que no revienten.
import { FACES } from '../js/cube.js';
import {
  caraAlAzar, ritmoLluvia, avanzarGotas, gotaQueSeApaga,
  caminoNuevo, largoDelCamino, LLUVIA, CAMINO,
} from '../js/juegos.js';

let ok = 0, bad = 0;
const t = (n, c, x) => { if (c) ok++; else { bad++; console.log('FALLO: ' + n + (x !== undefined ? '  ' + x : '')); } };

let seed = 987654321;
const rnd = () => { seed = (seed * 1103515245 + 12345) & 0x7fffffff; return seed / 0x7fffffff; };

console.log('--- una cara al azar ---');
{
  const salen = new Set();
  let repetida = 0, invalida = 0;
  for (let i = 0; i < 3000; i++) {
    const evitar = i % 3 === 0 ? [] : [FACES[(rnd() * 6) | 0], FACES[(rnd() * 6) | 0]];
    const f = caraAlAzar(rnd, evitar);
    if (!FACES.includes(f)) invalida++;
    if (evitar.includes(f)) repetida++;
    salen.add(f);
  }
  t('siempre sale una cara de verdad', invalida === 0, invalida + ' inválidas');
  t('nunca sale una de las que hay que evitar', repetida === 0, repetida + ' repetidas');
  t('salen las seis caras', salen.size === 6, [...salen].join(''));
  // el caso límite: si hay que evitarlas todas, mejor repetir que no dar nada
  t('con las seis ocupadas devuelve una igual', FACES.includes(caraAlAzar(rnd, FACES)));
  // y rnd() puede devolver 1 en un mal día: no puede salirse del array
  t('con rnd() = 1 no se sale del array', caraAlAzar(() => 1) === FACES[FACES.length - 1]);
}

console.log('--- el ritmo de la lluvia ---');
{
  let sube = 0, lenta = 0, sinTiempo = 0;
  let previo = ritmoLluvia(0);
  for (let n = 1; n <= 400; n++) {
    const r = ritmoLluvia(n);
    if (r.caida > previo.caida || r.espera > previo.espera) sube++;
    if (r.caida < LLUVIA.caidaMinima || r.espera < LLUVIA.esperaMinima) lenta++;
    // por deprisa que se ponga, tiene que seguir dando tiempo a mirar y girar
    if (r.caida < 2000) sinTiempo++;
    previo = r;
  }
  t('la lluvia sólo va a más', sube === 0, sube + ' veces al revés');
  t('nunca baja de su suelo', lenta === 0, lenta + ' por debajo');
  t('siempre quedan al menos dos segundos', sinTiempo === 0, sinTiempo + ' imposibles');
  // y con tres gotas a la vez como mucho, no se puede amontonar el cubo entero
  t('nunca caen más gotas que caras', LLUVIA.aLaVez < FACES.length, LLUVIA.aLaVez);
  const tope = ritmoLluvia(99999);
  t('acaba parándose en el mínimo',
    tope.caida === LLUVIA.caidaMinima && tope.espera === LLUVIA.esperaMinima,
    JSON.stringify(tope));
}

console.log('--- las gotas bajan, y una pausa no las tira ---');
{
  const nueva = () => ({ face: 'U', y: 0, caida: 6000 });
  // un fotograma normal baja lo que le toca: 16 ms de 6000 son 16/6000
  const g = nueva();
  avanzarGotas([g], 16);
  t('un fotograma baja lo justo', Math.abs(g.y - 16 / 6000) < 1e-9, g.y);

  // 6000 ms de fotogramas de 16 ms la dejan justo en el suelo, ni antes ni después
  const g2 = nueva();
  let toco = 0, vueltas = 0;
  while (vueltas++ < 1000) {
    if (avanzarGotas([g2], 16).length) { toco = vueltas; break; }
  }
  t('llega al suelo cuando toca', toco === Math.ceil(6000 / 16), toco);
  t('y no se pasa de 1', g2.y === 1, g2.y);

  // ESTO es lo que importa: el móvil bloqueado diez minutos. Sin el tope,
  // al volver caerían todas de golpe y la partida se acabaría sola.
  const dormidas = [nueva(), nueva(), nueva()];
  const caidas = avanzarGotas(dormidas, 10 * 60 * 1000);
  t('una pausa larga no tira ninguna gota', caidas.length === 0, caidas.length + ' caídas');
  t('y apenas las mueve', dormidas.every((x) => x.y <= LLUVIA.topeFotograma / 6000 + 1e-9),
    dormidas.map((x) => x.y).join(' '));

  // un dt raro (negativo, nulo, sin valor) no puede mover nada hacia atrás
  const g3 = nueva(); g3.y = 0.5;
  avanzarGotas([g3], -999); avanzarGotas([g3], 0); avanzarGotas([g3]);
  t('un dt raro no la mueve hacia atrás', g3.y === 0.5, g3.y);

  // y una que ya está en el suelo no se cuenta dos veces
  const g4 = nueva(); g4.y = 1;
  t('la que ya cayó no vuelve a caer', avanzarGotas([g4], 120).length === 0);
}

console.log('--- qué gota se apaga ---');
{
  const gotas = [
    { face: 'U', y: 0.2 }, { face: 'R', y: 0.9 },
    { face: 'U', y: 0.7 }, { face: 'F', y: 0.5 },
  ];
  t('se apaga la de ese color que va más abajo', gotaQueSeApaga(gotas, 'U') === 2,
    gotaQueSeApaga(gotas, 'U'));
  t('con una sola de ese color, esa', gotaQueSeApaga(gotas, 'R') === 1);
  t('sin ninguna de ese color, ninguna', gotaQueSeApaga(gotas, 'B') === -1);
  t('sin gotas, ninguna', gotaQueSeApaga([], 'U') === -1);
  // girar cara a cara tiene que ir vaciando la pantalla, nunca atascarse
  let quedan = gotas.slice();
  let vueltas = 0;
  while (quedan.length && vueltas++ < 50) {
    const i = gotaQueSeApaga(quedan, quedan[0].face);
    if (i < 0) break;
    quedan.splice(i, 1);
  }
  t('apagando color a color se vacía', quedan.length === 0, quedan.length + ' atascadas');
}

console.log('--- el caminito ---');
{
  let malLargo = 0, seguidas = 0, invalida = 0;
  const colores = new Set();
  for (let i = 0; i < 500; i++) {
    const largo = 2 + ((rnd() * 15) | 0);
    const camino = caminoNuevo(largo, rnd);
    if (camino.length !== largo) malLargo++;
    for (let k = 0; k < camino.length; k++) {
      if (!FACES.includes(camino[k])) invalida++;
      if (k && camino[k] === camino[k - 1]) seguidas++;
      colores.add(camino[k]);
    }
  }
  t('el camino tiene las baldosas que se le piden', malLargo === 0, malLargo + ' mal');
  t('todas las baldosas son de una cara de verdad', invalida === 0, invalida + ' inválidas');
  t('nunca dos baldosas iguales seguidas', seguidas === 0, seguidas + ' seguidas');
  t('se usan los seis colores', colores.size === 6, [...colores].join(''));
  // un camino de una baldosa es legal: es el caso de borde de "no hay anterior"
  t('un camino de una baldosa vale', caminoNuevo(1, rnd).length === 1);
  t('un camino de cero se queda en una', caminoNuevo(0, rnd).length === 1);
}

console.log('--- lo largos que se van poniendo ---');
{
  let baja = 0;
  let previo = largoDelCamino(0);
  t('el primero es el corto', previo === CAMINO.primero, previo);
  for (let n = 1; n < 60; n++) {
    const largo = largoDelCamino(n);
    if (largo < previo) baja++;
    previo = largo;
  }
  t('los caminos sólo se alargan', baja === 0, baja + ' veces al revés');
  t('pero no sin fin', largoDelCamino(999) === CAMINO.tope, largoDelCamino(999));
}

console.log('');
console.log(ok + ' pruebas de los juegos OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
