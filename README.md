# 🧩 Mi Cubo Mágico

App para conectar un **cubo inteligente Xiaomi / GiiKER** por Bluetooth: enseña a un
niño pequeño a resolverlo desde cero, y sirve de tutorial, cronómetro de velocidad y
entrenador de Fridrich para quien ya sabe.

Todo funciona en local, sin instalar nada y sin internet.

---

## Cómo se arranca

Doble clic en **`INICIAR.bat`**.

Se abre el navegador en `http://localhost:8080`. Ya está.

> El Bluetooth del navegador sólo funciona en `https` o en `localhost`, por eso hace
> falta el `.bat` y no vale abrir `index.html` con doble clic. Necesitas **Chrome o
> Edge** (Firefox y Safari no tienen Bluetooth Web).

---

## La primera vez

1. Enciende el cubo y pulsa **Conectar mi cubo**. Elígelo en la lista del navegador.
2. Ya está. La app **lee el cubo entero** en cada aviso que manda, así que sabe cómo
   está sin que le expliques nada: ni calibrar colores, ni empezar con el cubo resuelto.
3. Te deja en una pantalla de comprobación: gira unas caras y mira que el cubo de la
   pantalla haga lo mismo. Si algo no cuadra, dile que no.

Da igual el estado en que esté el cubo, y da igual que lo desordenes a mitad de partida:
la app se entera y sigue desde donde esté. Si se desconecta y vuelve, tampoco pasa nada.

> Si tu cubo fuese de un modelo que no sabemos leer entero, la app lo detecta y pasa
> sola a un modo de reserva: te pide girar cinco caras para aprender los colores y
> parte del cubo resuelto. Con los Xiaomi / GiiKER no hace falta.

---

## Qué hay dentro

| | Sección | Para quién |
|---|---|---|
| 👶 | **Para peques** | Tres juegos para empezar de cero |
| 📚 | **Aprender a resolverlo** | Tutorial del método principiante, lección a lección |
| ⏱️ | **Cronómetro** | Mezclas y medias al estilo WCA |
| 🚀 | **Fridrich (CFOP)** | Guía en vivo y entrenador de OLL y PLL |

---

## 👶 Para peques

### 🎈 Conoce tu cubo
Juego libre. El niño gira lo que quiera y la app le dice el color: *"cara verde"*.
Gana una estrella cuando encuentra los seis colores. Es el primer paso: aprender que
el cubo tiene caras y que cada una tiene su color.

### 🔙 Deshaz la mezcla ← **empieza por aquí**
El juego importante para un niño de 4 años.

- **Nivel 1**: el niño da **un** giro, el que quiera. La app le dice: *"ahora deshazlo"*.
- **Nivel 2**: dos giros. **Nivel 3**: tres… hasta ocho.

Cada nivel se desbloquea al superar el anterior. En los niveles 1 y 2 la pista se ve
desde el principio; a partir del 3 la app espera 7 segundos para que lo intente solo,
y luego se la enseña. Tres estrellas si lo hace sin pista.

Esto es lo que de verdad enseña a un niño pequeño: entender que un giro se deshace
girando al revés. Es la base de todo lo demás y da resultados rápido.

### 🏆 Resuélvelo conmigo
El método completo, un movimiento cada vez, con **ocho pasos** que tienen nombre:

| | Paso | Qué es |
|---|---|---|
| 🌼 | La margarita | Las cuatro piezas blancas alrededor del centro amarillo |
| ⬇️ | Bajar los pétalos | La cruz blanca abajo |
| 🧱 | Las esquinas de abajo | Primera capa terminada |
| 🎀 | El cinturón | La capa del medio |
| ⭐ | La cruz amarilla | `F R U R' U' F'` |
| 🏁 | Colocar los bordes | Los bordes de arriba en su sitio |
| 📍 | Colocar las esquinas | Cada esquina a su rincón |
| 🔄 | Girar las esquinas | `R' D' R D` hasta que el amarillo mire arriba |

En cada movimiento verás: la **cara de color** que hay que girar, una **flecha** con el
sentido, y el **cubo de la pantalla haciendo el gesto en bucle**, para que un niño que
todavía no lee pueda simplemente copiarlo. Además lo dice en voz alta.

Si se equivoca no pasa nada: la app recalcula sola y sigue desde donde esté.

> **Aviso del paso 🔄**: en "girar las esquinas" el cubo *parece* que se rompe por
> abajo. Es normal, y al terminar el paso vuelve solo. A los niños les encanta.

---

## 📚 Aprender a resolverlo (tutorial)

### Curso guiado
El botón grande de arriba. Va de principio a fin **pasando de un paso al siguiente solo**:
te lee la explicación entera del paso en voz alta, te guía movimiento a movimiento, y
cuando terminas ese paso lo celebra y **encadena con el siguiente** sin que toques nada.

Dos botones en la barra de arriba:

- **🔍 Detalle**: en vez de la pista corta, te explica **por qué** hay que hacer ese
  movimiento concreto. Por ejemplo, en vez de "deja sitio libre arriba", te dice
  *"giramos sólo la cara de arriba para que el hueco donde va a llegar la pieza esté
  libre; así no tiramos un pétalo que ya estaba puesto"*. Con el detalle apagado, ese
  mismo botón vuelve a leerte la explicación del paso.
- **💡 Pista**: el truco del paso, el error típico y cómo evitarlo.

### Las ocho lecciones sueltas
Debajo del curso está la lista, para consultar un paso concreto. Cada lección tiene la
explicación escrita, **el cubo de la pantalla haciendo la fórmula solo** (arrancando
desde un cubo al que le falta justo eso, repetible) y el truco.

La lista marca en verde los pasos que tu cubo ya tiene hechos ahora mismo, con barra de
progreso. Como la app lee el cubo, el tutorial siempre sabe por dónde vas.

---

## ⏱️ Cronómetro

Cronómetro de velocidad completo, con todo guardado en el navegador.

**Con el cubo conectado sigue el guion de una competición**, y lo maneja el propio cubo:

1. **Te guía la mezcla giro a giro**, con la tarjeta de color y tachando los que ya has
   hecho. Si te equivocas te lo dice (`Ese giro no era`) y te enseña **el camino de vuelta**,
   en vez de dejarte esperando sin saber qué pasa. Y si entras con el cubo a medias, primero
   te guía para resolverlo: una mezcla oficial se aplica sobre el cubo resuelto.
2. Pulsas (o barra espaciadora) y empiezan los **15 segundos de inspección**, con los
   avisos de **8 y 12 segundos** cantados en voz alta, como un juez.
3. **Al primer giro arranca el cronómetro** y se acaba la inspección.
4. **Para solo** en el instante en que el cubo queda resuelto.

El cubo se ve en pantalla todo el rato, así que compruebas de un vistazo que la app y tu
cubo van a la par. En ningún momento te quedas parado sin saber qué hacer: la pantalla
siempre tiene un giro que enseñarte.

Las **penalizaciones de inspección** se aplican solas: pasar de 15 s es `+2` y pasar de
17 s es `DNF`, y te lo dice mientras resuelves. Se calculan del tiempo real transcurrido,
no del refresco de pantalla, así que valen aunque el navegador se ralentice.

Sin cubo funciona a la manera clásica: mantienes la barra espaciadora, se pone verde y
sueltas para arrancar.

**Estadísticas**: intentos, mejor, media de la sesión, mo3, ao5, ao12, ao50, y las mejores
ao5 y ao12 de toda la sesión. Las medias siguen las reglas WCA: se quitan el mejor y el
peor, un DNF cuenta como el peor, y con dos DNF la media es DNF.

**Correcciones a mano**: toca un tiempo del historial y márcalo `OK`, `+2`, `DNF` o
bórralo. El botón 👁️ apaga o enciende la inspección.

Los colores de la mezcla te dicen qué cara girar, así que no hay que adivinar la
orientación: sujeta el cubo con el **blanco abajo** y el **verde delante**.

---

## 🚀 Fridrich (CFOP)

### Guía en vivo
Mientras resuelves, la app mira tu cubo y te dice **en qué paso estás** (cruz, F2L, OLL o
PLL), **qué caso tienes delante** y **su algoritmo**. Es la forma rápida de aprender a
reconocer casos: resuelves como sabes y la app te va poniendo nombre a lo que ves.

En cuanto empiezas una fórmula, **la guía se queda fija en ese caso** y va tachando lo que
ya has hecho, con la tarjeta de color del giro que toca. Si no se congelara, el caso
desaparecería al primer giro —a mitad de un algoritmo el cubo ya no está en ese caso— y te
quedarías a medias. Si te equivocas, no pierde el caso: te enseña cómo deshacerlo y sigue.

Guía los cuatro pasos de punta a punta:

- **La cruz** no tiene fórmula, se hace a ojo; pero para que no te quedes parado te la
  guía con el método sencillo.
- **F2L**: reconoce el par de **cualquiera de los cuatro huecos**, no sólo el de delante, y
  te dice de qué hueco se trata por su color. Si las piezas están atrapadas en un hueco
  equivocado, te enseña los tres giros para sacarlas.
- **OLL y PLL**: el caso con su nombre y el algoritmo que tengas elegido.

Toca el nombre del caso y saltas a entrenarlo aparte.

### Entrenador de casos — los 119, completos

| | Casos | Agrupados por |
|---|---|---|
| **F2L** | 41 | dónde están la esquina y la arista |
| **OLL** | 57 | la forma del amarillo (punto, rayo, pez, cruz…) |
| **PLL** | 21 | bordes, esquinas, adyacentes, diagonales, ciclos |

Toca un caso y la app te da **la mezcla que lo prepara**. Cuando tu cubo llega a ese caso
te avisa, cronometra, y **te guía movimiento a movimiento con el giro de ajuste incluido**
(marcado con `*`): un algoritmo sólo funciona si antes colocas la cara de arriba, y ese
giro depende de cómo haya caído la mezcla.

Guarda **el mejor tiempo y la media de tus últimos 5 intentos por caso**, para que veas
cuáles llevas flojos. Sin cubo conectado, un botón prepara el caso en la pantalla.

### Tus propios algoritmos

Cada caso trae uno o dos algoritmos de serie, pero **puedes añadir los tuyos y elegir cuál
usar**. El que elijas es el que se usa en todas partes: en el entrenador y en la guía en
vivo.

Dos formas de añadir uno:

- **🔴 Grabar con el cubo.** Prepara el caso, dale a grabar y **resuélvelo a tu manera**.
  La app lee tus giros, **para sola** en cuanto el caso queda resuelto, quita los giros de
  ajuste del principio y del final (que dependen de la mezcla, no del algoritmo) y junta
  los giros repetidos. Te enseña el resultado limpio y lo guardas si te convence.
- **✏️ Escribir.** Lo tecleas. Admite `R U F D L B`, giros de cubo (`x y z`), dobles
  (`r u f`) y capas del medio (`M E S`).

**Nada se guarda sin comprobarlo**: si el algoritmo no resuelve ese caso, la app te lo
dice y no lo acepta. Y si te has equivocado escribiendo, te señala el trozo que no
entiende.

---

## Consejos para enseñar a un niño de 4 años

- No empieces por resolver el cubo entero. Empieza por **Deshaz la mezcla, nivel 1**,
  y quédate ahí varios días. Cuando haga el 3 sin pistas, va sobrado.
- Una sesión de 5 minutos al día vale más que media hora un domingo.
- El botón 🔊 apaga la voz si molesta; el 💡 da una pista.
- El cubo de la pantalla se puede girar arrastrando con el dedo.

---

## Si algo no va

| Problema | Qué hacer |
|---|---|
| No aparece el cubo al conectar | Pantalla **🔍 No sale mi cubo en la lista**: pila de botón gastada, cubo dormido, o cogido por el móvil |
| Los colores de la pantalla no son los del cubo | Menú → **🔧 Diagnóstico** y mándame lo que ponga |
| El botón de conectar está apagado | No estás en Chrome/Edge, o no has abierto por `localhost` |
| Cambias el código y no se nota | Recarga forzada con Ctrl+Shift+R |

En **Diagnóstico** se ve la batería, el último giro recibido y el paquete de datos en
crudo: sirve para comprobar que el cubo está hablando bien con la app.

---

## Notas técnicas

**Protocolo.** Servicio BLE `0000aadb-…` / característica `0000aadc-…`, paquetes de
20 bytes. Es el protocolo de los cubos Xiaomi/GiiKER. **Los cubos GAN usan otro
protocolo distinto y no funcionarán.**

**Lectura del estado.** El paquete no trae sólo los últimos giros: los 16 primeros
bytes son el cubo entero (posición y giro de las 8 esquinas y las 12 aristas). El
decodificador de `js/xiaomi.js` es un port del que usa la app oficial, tomado de
[wachino/xiaomi-mi-smart-rubik-cube](https://github.com/wachino/xiaomi-mi-smart-rubik-cube),
y devuelve las 54 pegatinas en el mismo orden que usa `cube.js`. Los modelos i3s
mandan el paquete cifrado (byte 18 = `0xa7`) y se descifra antes.

Eso hace que la app no tenga que suponer nada: los colores de cada cara salen de los
centros, el marco se gira solo para dejar el blanco abajo (que es como se explica el
método), y el giro que se anima se deduce comparando el estado nuevo con el anterior.
No hay tabla de códigos de cara que pueda estar mal, no hace falta partir del cubo
resuelto, y si desordenas el cubo de golpe la app se entera y replanifica.

**El modo de reserva** (seguir los giros en vez de leer el estado) sigue ahí por si
aparece un cubo que no sepamos decodificar; entonces sí hace falta calibrar.

**El solucionador** está en `js/solver.js` y usa los mismos algoritmos que se enseñan a
mano, para poder explicar cada paso. Donde el reconocimiento de casos es delicado
(cruz amarilla y última capa) hace una búsqueda en anchura corta y exhaustiva, así que
no se queda atascado nunca. El orden de la última capa es *bordes → esquinas* porque
al revés la permutación de esquinas puede quedar impar e irresoluble con ciclos de tres.

**Seguir la pantalla tiene que resolver el cubo.** Suena obvio, pero es justo donde
estaban los fallos: comprobar que *existe* una solución no es lo mismo que comprobar que
**la que se enseña** funciona. Ahora `test/trainer.js` hace lo segundo, y así cazó tres
errores reales:

1. **Faltaba el giro de ajuste** en los entrenadores de OLL y PLL. La mezcla de
   preparación lleva un giro al azar de la cara de arriba, así que el algoritmo tal cual
   no resolvía: **67 de 84 casos** necesitaban ese ajuste previo.
2. **El tutorial pedía un paso ya hecho.** La lección de la margarita se daba por
   pendiente aunque la cruz estuviera puesta, y el curso se quedaba pidiendo un paso que
   el solucionador ya había saltado.
3. **El curso se quedaba dando vueltas.** Recalculaba la solución después de *cada* giro,
   y eso no puede funcionar en un método por capas: a mitad de un algoritmo el cubo rompe
   a propósito lo ya hecho, así que la guía volvía atrás y deshacía lo que acababa de
   pedir. Ahora sigue el plan con un índice y sólo recalcula si te equivocas. La prueba
   verifica 80 cubos siguiendo la guía y 60 más metiendo errores a propósito, y comprueba
   además que el paso mostrado **nunca retrocede**.

De paso se arregló una inestabilidad real del solucionador: la fase de la margarita
volvía a subir aristas que ya estaban colocadas en la cruz.

**Ningún algoritmo entra sin verificarse.** Ni los de serie ni los tuyos.

Los **57 OLL** vienen del conjunto estándar de
[Roman-/oll_trainer](https://github.com/Roman-/oll_trainer); `dev/build_oll.js` los
descarga, normaliza la notación y comprueba uno a uno que respetan las dos primeras capas,
que orientan la última y que **cada uno es un caso distinto**. Los 57 cubren las 58
orientaciones posibles de la última capa (57 casos + el resuelto): el conjunto completo,
comprobado por cálculo, no por confianza.

Los **41 casos de F2L** no se copian de ninguna tabla: `dev/build_f2l.js` recorre en
anchura todas las formas de sacar el par del hueco con secuencias que no tocan el resto
del cubo. Cada caso se alcanza por un camino conocido, así que **su solución es ese camino
al revés y es correcta por construcción**. Salen exactamente 41, repartidos 24 / 6 / 6 / 5
entre los cuatro grupos, que es justo lo que predice el recuento teórico.

Los **21 PLL** están escritos a mano y verificados igual. Esa prueba cazó dos errores
reales: una "Z" que era en realidad otra vez la U-perm (tenía 20 casos creyendo que eran
21), y un algoritmo de OLL que no correspondía a ese paso.

Para regenerar los conjuntos: `npm run build`.

**Los algoritmos que grabas o escribes** pasan por el mismo filtro antes de guardarse:
`test/casos.js` comprueba que el validador acepta los buenos, rechaza los que no resuelven
el caso, y señala la notación que no entiende.

La notación admite giros de cubo (`x y z`), movimientos de dos capas (`r u f`) y capas
intermedias (`M E S`); todo se traduce a giros de cara, que es lo único que hace falta
para guiar y lo único que el cubo detecta con seguridad. La traducción también está
comprobada: por ejemplo, la H-perm escrita con capas intermedias tiene que dar exactamente
el mismo caso que la H-perm escrita sólo con caras.

**Pruebas:**

```bash
npm test
```

Cuatro bloques:

- `test.js` — modelo del cubo y **5000 mezclas aleatorias** resueltas.
- `protocol.js` — análisis de paquetes contra datos reales de un cubo.
- `geometry.js` — giros del cubo entero y 800 paquetes sintéticos decodificados.
- `simulate.js` — construye un **codificador** sondeando al decodificador y comprueba
  la ida y vuelta exacta en 500 mezclas. Es lo que permite probar toda la cadena
  (cubo → paquete → estado → ayuda) sin tener el cubo delante.
- `algs.js` — los algoritmos de PLL, uno a uno, y el reconocedor de casos.
- `casos.js` — los **119 casos** (41 F2L + 57 OLL + 21 PLL): que se pueden mezclar,
  reconocer y resolver siguiendo la pantalla, el guardado de tus algoritmos, y que
  **la guía en vivo resuelve el cubo entero** desde la cruz hasta el final.
- `stats.js` — las medias WCA, incluidos los casos raros del DNF.
- `trainer.js` — que seguir lo que se muestra en pantalla resuelva de verdad: los
  entrenadores con su giro de ajuste, los casos de F2L, y el curso guiado de punta a
  punta con y sin errores del usuario.

Media de 166
movimientos por cubo. Es un método largo a propósito: repite pocas fórmulas muchas
veces (`R U R' U'` y `R' D' R D`), que es justo lo que hace falta para que un niño lo
memorice. Un método más corto exigiría reconocer muchos más casos.

**Archivos:**

```
index.html        pantallas
css/styles.css    estilos
js/cube.js        modelo del cubo (giros derivados de la geometría 3D)
js/solver.js      método principiante por capas
js/giiker.js      Bluetooth: conexión y paquetes
js/xiaomi.js      lectura del estado real del cubo
js/calibrate.js   modo de reserva: aprender el cubo a mano
js/cube3d.js      cubo 3D con transformaciones CSS, sin librerías
js/fx.js          voz, sonidos y confeti
js/algs.js        los tres conjuntos y el reconocimiento de casos
js/oll.js         los 57 OLL      (generado, no editar a mano)
js/f2l.js         los 41 F2L      (generado, no editar a mano)
js/myalgs.js      tus algoritmos: guardar, validar y elegir
js/lessons.js     contenido del tutorial
js/stats.js       medias al estilo WCA
js/sections.js    tutorial, cronómetro y entrenador
js/app.js         pantallas y juegos
server.js         servidor local
test/, dev/       pruebas y utilidades de desarrollo
```

Desde la consola del navegador hay un manejador para trastear:
`cubo.app`, `cubo.doMove('R', 1)`, `cubo.fakeMove('U', 1)` (simula un giro del cubo físico).
