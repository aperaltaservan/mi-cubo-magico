// Los juegos de colores: que sean jugables, no sólo que no revienten.
import * as C from '../js/cube.js';
const { FACES } = C;
import {
  caraAlAzar, ritmoLluvia, avanzarGotas, gotaQueSeApaga,
  caminoNuevo, largoDelCamino, LLUVIA, CAMINO,
  destinoDePegatina, estrellaNueva, giroParaEstrella, senuelos,
  opcionesDeRonda, seVe, esCentro,
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

console.log('--- sigue la estrella: a dónde va una pegatina ---');
{
  // La comprobación que vale: seguir la pegatina con applyMove, que es el
  // motor de verdad de la app, y ver si dice lo mismo. Si destinoDePegatina
  // leyera la permutación al revés, esto lo cazaría en el primer giro.
  let malos = 0, total = 0;
  for (const face of FACES) {
    for (const amount of [1, 2, 3]) {
      // un cubo con 54 valores distintos: así se ve a dónde va cada pegatina
      const marcas = Array.from({ length: 54 }, (_, i) => i);
      const tras = C.applyMove(marcas, face, amount);
      for (let i = 0; i < 54; i++) {
        total++;
        if (destinoDePegatina(i, face, amount) !== tras.indexOf(i)) malos++;
      }
    }
  }
  t('seguir una pegatina coincide con girar el cubo', malos === 0,
    malos + ' de ' + total + ' mal');

  // dar la vuelta entera deja cada pegatina donde estaba
  let vueltas = 0;
  for (const face of FACES) {
    for (let i = 0; i < 54; i++) {
      let x = i;
      for (let k = 0; k < 4; k++) x = destinoDePegatina(x, face, 1);
      if (x !== i) vueltas++;
    }
  }
  t('cuatro cuartos de vuelta no mueven nada', vueltas === 0, vueltas + ' descolocadas');
  t('una cara no mueve las pegatinas de la opuesta',
    destinoDePegatina(0, 'D', 1) === 0 && destinoDePegatina(30, 'U', 1) === 30);
}

console.log('--- la pregunta de la estrella tiene que ser una pregunta ---');
{
  let fuera = 0, centro = 0;
  for (let i = 0; i < 400; i++) {
    const e = estrellaNueva(rnd);
    if (!seVe(e)) fuera++;
    if (esCentro(e)) centro++;
  }
  t('la estrella siempre se ve', fuera === 0, fuera + ' escondidas');
  t('y nunca cae en un centro', centro === 0, centro + ' centros');

  // desde cualquier pegatina del cubo, incluidas las que no se ven, tiene
  // que haber un giro que la traiga a la vista: si no, el juego se atasca
  let sinGiro = 0, quieta = 0, escondida = 0;
  for (let i = 0; i < 54; i++) {
    if (esCentro(i)) continue;
    const g = giroParaEstrella(i, rnd);
    if (!g) { sinGiro++; continue; }
    const destino = destinoDePegatina(i, g.face, g.amount);
    if (destino === i) quieta++;
    if (!seVe(destino)) escondida++;
  }
  t('desde cualquier pegatina hay giro que vale', sinGiro === 0, sinGiro + ' sin salida');
  t('el giro siempre la mueve', quieta === 0, quieta + ' se quedan quietas');
  t('y la deja a la vista', escondida === 0, escondida + ' se esconden');
  t('un centro no tiene giro que valga', giroParaEstrella(4, rnd) === null);
}

console.log('--- los señuelos ---');
{
  const st = C.applyAlg(C.solvedState(), C.randomScramble(20, rnd));
  let malColor = 0, repetido = 0, esLaBuena = 0, invisible = 0, pocos = 0;
  for (let k = 0; k < 300; k++) {
    const destino = estrellaNueva(rnd);
    const cuantos = 2 + (k % 3);
    const lista = senuelos(st, destino, cuantos, rnd);
    if (lista.length < cuantos) pocos++;
    if (new Set(lista).size !== lista.length) repetido++;
    for (const i of lista) {
      if (i === destino) esLaBuena++;
      if (!seVe(i) || esCentro(i)) invisible++;
    }
  }
  t('nunca sale la respuesta como señuelo', esLaBuena === 0, esLaBuena + ' veces');
  t('ni se repiten entre ellos', repetido === 0, repetido + ' repetidos');
  t('todos se ven y ninguno es un centro', invisible === 0, invisible + ' imposibles');
  t('salen los que se piden', pocos === 0, pocos + ' rondas cortas');

  // lo que hace que haya que seguir la pieza: en el cubo resuelto hay ocho
  // pegatinas de cada color a la vista, así que los señuelos son del mismo
  const resuelto = C.solvedState();
  let distinto = 0;
  for (let k = 0; k < 200; k++) {
    const destino = estrellaNueva(rnd);
    for (const i of senuelos(resuelto, destino, 3, rnd)) {
      if (resuelto[i] !== resuelto[destino]) distinto++;
    }
  }
  t('los señuelos son del mismo color que la buena', distinto === 0,
    distinto + ' de otro color');
}

console.log('--- la ronda se va poniendo más difícil ---');
{
  let baja = 0;
  let previo = opcionesDeRonda(0);
  t('empieza con tres opciones', previo === 3, previo);
  for (let n = 1; n < 200; n++) {
    const o = opcionesDeRonda(n);
    if (o < previo) baja++;
    previo = o;
  }
  t('sólo se ponen más opciones', baja === 0, baja + ' veces al revés');
  t('pero no más de cuatro', opcionesDeRonda(9999) === 4, opcionesDeRonda(9999));
}

console.log('');
console.log(ok + ' pruebas de los juegos OK, ' + bad + ' fallos');
if (bad) process.exitCode = 1;
