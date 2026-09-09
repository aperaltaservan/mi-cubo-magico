// ============================================================
//  textos.js — La traducción inglesa
// ============================================================
//  La clave es el texto en español tal cual está escrito en el
//  código o en el HTML, con los espacios normalizados. Así no hay
//  que inventar nombres de clave ni mantenerlos sincronizados.
//
//  Los <b>, <small> y demás forman parte de la clave y hay que
//  respetarlos en la traducción: son parte del texto.
//
//  test/i18n.js comprueba que no falte ninguno y que las etiquetas
//  cuadren entre el español y el inglés.
// ============================================================

export const EN = {
  // ---------- Inicio y navegación ----------
  'Mi Cubo Mágico': 'My Magic Cube',
  'Aprende a resolver el cubo paso a paso': 'Learn to solve the cube, step by step',
  'Conectar mi cubo<small>Cubo inteligente Xiaomi / GiiKER</small>':
    'Connect my cube<small>Xiaomi / GiiKER smart cube</small>',
  'Jugar sin cubo<small>Con el teclado o los botones de la pantalla</small>':
    'Play without a cube<small>With the keyboard or the on-screen buttons</small>',
  '🔍 No sale mi cubo en la lista': "🔍 My cube isn't in the list",
  'Para peques': 'For little ones',
  'Para peques<small>Juegos para empezar de cero</small>':
    'For little ones<small>Games to start from scratch</small>',
  'Aprender a resolverlo': 'Learn to solve it',
  'Aprender a resolverlo<small>Método principiante, lección a lección</small>':
    'Learn to solve it<small>Beginner method, lesson by lesson</small>',
  'Cronómetro': 'Timer',
  'Cronómetro<small>Mezclas y medias al estilo WCA</small>':
    'Timer<small>WCA-style scrambles and averages</small>',
  'Patrones': 'Patterns',
  'Patrones<small>Dibujos con el cubo, paso a paso</small>':
    'Patterns<small>Pictures on the cube, step by step</small>',
  'Fridrich (CFOP)<small>F2L, OLL y PLL con estadísticas</small>':
    'Fridrich (CFOP)<small>F2L, OLL and PLL with stats</small>',
  '🎨 Volver a enseñar los colores': '🎨 Teach the colours again',
  '🔧 Diagnóstico': '🔧 Diagnostics',
  'Diagnóstico': 'Diagnostics',
  'Creado por': 'Made by',
  'Código en GitHub': 'Code on GitHub',
  'Voz': 'Voice',
  'Idioma / Language': 'Idioma / Language',

  // ---------- Ayuda del Bluetooth ----------
  'Buscar el cubo': 'Find the cube',
  'Tu cubo debería salir en la lista con un nombre que empieza por <b>Gi</b> (por ejemplo <code>GiC41183</code>). Si no sale, es que no está emitiendo. Repasa esto por orden:':
    'Your cube should appear in the list with a name starting with <b>Gi</b> (for example <code>GiC41183</code>). If it does not, it is not broadcasting. Check these in order:',
  "<b>La pila.</b> El Xiaomi Smart Rubik's Cube lleva <b>pila de botón</b> (no se carga por USB). Si está gastada, el cubo enciende a ratos pero no llega a emitir. Es la causa más habitual: prueba con una pila nueva.":
    "<b>The battery.</b> The Xiaomi Smart Rubik's Cube takes a <b>coin cell</b> (it does not charge over USB). When it is flat the cube flickers on but never broadcasts. This is the most common cause: try a fresh battery.",
  '<b>Despierta el cubo</b>: gira una cara justo antes de darle a buscar. Se duerme en un par de minutos y deja de anunciarse.':
    '<b>Wake the cube up</b>: turn a face right before you hit search. It falls asleep after a couple of minutes and stops announcing itself.',
  '<b>Ciérralo en el móvil</b>. Si la app del cubo lo tiene cogido, el ordenador no lo verá. Ciérrala y desconéctalo del móvil.':
    '<b>Close it on your phone</b>. If the cube app has hold of it, the computer will not see it. Close the app and disconnect the cube from the phone.',
  '<b>Quítalo de los dispositivos de Windows</b> si lo emparejaste alguna vez (Configuración → Bluetooth). Estos cubos no se emparejan: el navegador habla con ellos directamente.':
    '<b>Remove it from your system Bluetooth devices</b> if you ever paired it (Settings → Bluetooth). These cubes are not meant to be paired: the browser talks to them directly.',
  '<b>Bluetooth del ordenador</b>:': '<b>Your computer’s Bluetooth</b>:',
  'El botón de abajo busca <b>sin ningún filtro</b>. Sirve para saber de quién es la culpa: si salen otros aparatos pero no el cubo, el problema es del cubo; si no sale absolutamente nada, es del Bluetooth del ordenador.':
    'The button below searches <b>with no filter at all</b>. It tells you where the fault lies: if other devices show up but not the cube, the cube is the problem; if nothing shows up at all, it is your computer’s Bluetooth.',
  'Ver todos los aparatos<small>Sin filtros: busca el tuyo en la lista</small>':
    'Show every device<small>No filters: find yours in the list</small>',
  'comprobando…': 'checking…',
  'sí, funciona': 'yes, it works',
  'apagado o sin adaptador': 'off, or no adapter',
  '— enciéndelo en Windows': '— turn it on in your system settings',
  'no lo sé': 'no idea',
  'Elige tu cubo en la lista del navegador…': 'Pick your cube from the browser’s list…',
  'No apareció ningún cubo. Pulsa <b>🔍 No sale mi cubo en la lista</b>.':
    'No cube showed up. Tap <b>🔍 My cube isn’t in the list</b>.',
  '<hr>Copia esto y pásamelo: con ello puedo dar soporte a tu modelo.':
    '<hr>Copy this and send it over: with it I can add support for your model.',
  '<b>No has elegido ningún aparato</b><br>Si la lista salía vacía, repasa los cuatro puntos de arriba: lo más habitual es que el cubo esté dormido o cogido por el móvil.':
    '<b>You did not pick a device</b><br>If the list came up empty, go back over the four points above: usually the cube is asleep or held by your phone.',

  // ---------- Enseñar los colores ----------
  'Enseñar los colores': 'Teach the colours',
  'Saltar (arriesgado)': 'Skip (risky)',
  'Vamos a conocer tu cubo': 'Let’s get to know your cube',
  'Empezar': 'Start',
  'Volver a empezar': 'Start again',
  'Vas a girar las seis caras una vez. Así aprendo tu cubo de verdad, sin suposiciones.':
    'You are going to turn each of the six faces once. That way I learn your actual cube, with no guessing.',
  'Gira la cara {color}': 'Turn the {color} face',
  'Busca la cara cuyo <b>centro</b> es {color} y dale un cuarto de vuelta.':
    'Find the face whose <b>centre</b> is {color} and give it a quarter turn.',
  '¿Qué hay a la derecha?': 'What is on the right?',
  '¿Qué color te queda en la cara de la <b>derecha</b>?':
    'Which colour ends up on the <b>right</b> face?',
  'Con el blanco abajo y el verde delante, ¿qué color queda a la derecha?':
    'With white on the bottom and green in front, which colour is on the right?',
  'Último paso': 'Last step',
  'Mira el cubo de frente a la cara <b>BLANCA</b> y gírala un cuarto de vuelta en el sentido de las agujas del reloj.':
    'Look straight at the <b>WHITE</b> face and turn it a quarter turn clockwise.',
  'Mirando la cara blanca, gírala en el sentido de la flecha':
    'Facing the white side, turn it the way the arrow points',
  'Listo. Tu cubo cuenta al revés y ya lo sé.': 'Done. Your cube counts backwards and now I know it.',
  '¡Listo!': 'All set!',
  'Sin problema. Fíjate en girar la cara cuyo <b>centro</b> es del color que te pido, y con el cubo quieto en la mano.':
    'No problem. Make sure you turn the face whose <b>centre</b> is the colour I ask for, holding the cube still.',
  'Lo intentamos otra vez': 'Let’s try again',
  'Esa cara ya la hemos hecho: es la {color}': 'We already did that face: it is the {color} one',
  'La última la deduzco yo 😉': 'I can work the last one out myself 😉',
  'Eso ha sido media vuelta. Gírala <b>solo un cuarto</b>.':
    'That was a half turn. Give it <b>only a quarter</b>.',
  'Falta la cara {color}': 'The {color} face is missing',
  'Faltan caras por girar': 'Some faces have not been turned yet',
  'El color {color} aparece {veces} veces': 'The colour {color} appears {veces} times',

  // ---------- Menú y estado ----------
  '👁️ Leyendo el cubo': '👁️ Reading the cube',
  '✅ Cubo al día': '✅ Cube up to date',
  '⚠️ Púlsame con el cubo resuelto': '⚠️ Tap me with the cube solved',
  '¿Seguro? Pulsa otra vez': 'Are you sure? Tap again',
  'Conectado a {nombre}': 'Connected to {nombre}',
  'Modo sin cubo: gira con el teclado (U R F D L B, con Mayúsculas al revés) o con los botones de la pantalla.':
    'No-cube mode: turn with the keyboard (U R F D L B, Shift for the other way) or with the on-screen buttons.',
  '¡Conectado! Leo tu cubo directamente': 'Connected! I can read your cube directly',
  '¡Cubo conectado!': 'Cube connected!',
  'He visto que el cubo está resuelto ✅': 'I can see the cube is solved ✅',
  '¡Genial! Ahora sé cómo está tu cubo': 'Great! Now I know how your cube looks',
  'No conozco esa cara del cubo (código {code})': 'I do not know that face of the cube (code {code})',

  // ---------- Tarjeta de movimiento y colores ----------
  'Cara {cara}': '{cara} face',
  'dos vueltas enteras': 'two full turns',
  'hacia la flecha': 'the way the arrow points',
  'al revés de la flecha': 'against the arrow',
  'Cara {cara}, dos vueltas': '{cara} face, two turns',
  ', al revés': ', backwards',
  'blanco': 'white',
  'amarillo': 'yellow',
  'verde': 'green',
  'azul': 'blue',
  'rojo': 'red',
  'naranja': 'orange',
  'BLA': 'WHI',
  'AMA': 'YEL',
  'VER': 'GRN',
  'AZU': 'BLU',
  'ROJ': 'RED',
  'NAR': 'ORA',
  '(Mayúsculas + {tecla})': '(Shift + {tecla})',

  // ---------- Juegos para peques ----------
  'Conoce tu cubo': 'Meet your cube',
  'Conoce tu cubo<small>Gira caras y aprende sus colores</small>':
    'Meet your cube<small>Turn faces and learn their colours</small>',
  'Deshaz la mezcla': 'Undo the scramble',
  'Deshaz la mezcla<small>Del 1 al 8 · el juego para empezar</small>':
    'Undo the scramble<small>Levels 1 to 8 · the game to start with</small>',
  'El mono dice': 'Monkey says',
  'El mono dice<small>Repite la secuencia · juego de memoria</small>':
    'Monkey says<small>Repeat the sequence · memory game</small>',
  'El caminito<small>Lleva al pollito girando la cara de cada baldosa</small>':
    'The little path<small>Walk the chick along by turning each tile’s face</small>',
  'Apaga los colores<small>Caen colores · gira esa cara antes de que lleguen al suelo</small>':
    'Switch the colours off<small>Colours fall · turn that face before they hit the floor</small>',
  'Resuélvelo conmigo': 'Solve it with me',
  'Resuélvelo conmigo<small>El método completo, paso a paso</small>':
    'Solve it with me<small>The whole method, step by step</small>',
  'Con 4 años, empieza por <b>El caminito</b>, que no tiene prisa, y sigue con <b>Deshaz la mezcla</b> y <b>El mono dice</b>.':
    'For a four-year-old, start with <b>The little path</b>, which is in no hurry, then go on to <b>Undo the scramble</b> and <b>Monkey says</b>.',
  'Elige cuántos movimientos quieres deshacer': 'Choose how many moves you want to undo',
  'Empieza por el 1. Cuando lo consigas se abre el siguiente.':
    'Start at 1. Each one you beat opens the next.',

  '🎈 Conoce tu cubo': '🎈 Meet your cube',
  '🔍 Comprobación': '🔍 Checking',
  'Leo tu cubo directamente. Gira unas caras y comprueba que la pantalla va igual: colores incluidos.':
    'I am reading your cube directly. Turn a few faces and check the screen matches, colours and all.',
  'Gira unas cuantas caras y mira si el cubo de la pantalla hace exactamente lo mismo que el tuyo.':
    'Turn a few faces and see whether the cube on screen does exactly what yours does.',
  '¿Se mueve igual?<small>gira una cara y compara</small>':
    'Does it move the same?<small>turn a face and compare</small>',
  'Comprobando que te entiendo bien': 'Checking that I read you right',
  '✅ Sí, se mueve igual': '✅ Yes, it moves the same',
  '❌ No, hace otra cosa': '❌ No, it does something else',
  '¡Perfecto! Ya podemos jugar': 'Perfect! Now we can play',
  'Gira una cara y comprueba si el cubo de la pantalla hace lo mismo':
    'Turn a face and check whether the cube on screen does the same',
  'Gira las caras que quieras. Te diré de qué color son.':
    'Turn any faces you like. I will tell you their colours.',
  'Gira una cara<small>a ver de qué color es</small>':
    'Turn a face<small>let’s see what colour it is</small>',
  '¿Cuántos colores encuentras?': 'How many colours can you find?',
  'Gira una cara del cubo': 'Turn a face of the cube',
  '¡Muy bien!': 'Well done!',
  'Caras reconocidas: {n} de 6': 'Faces recognised: {n} of 6',
  'Colores encontrados: {n} de 6': 'Colours found: {n} of 6',
  '¡Bravo! Has encontrado los seis colores': 'Bravo! You found all six colours',
  '¡Has encontrado los 6 colores! 🎉': 'You found all 6 colours! 🎉',

  '🔙 Nivel {n}': '🔙 Level {n}',
  'Haz {n} movimiento tú, los que quieras. Yo me los apunto.':
    'Make {n} move of your own, whichever you like. I will write it down.',
  'Haz {n} movimientos tú, los que quieras. Yo me los apunto.':
    'Make {n} moves of your own, whichever you like. I will write them down.',
  'Mezcla tú<small>{n} movimiento</small>': 'Your turn to scramble<small>{n} move</small>',
  'Mezcla tú<small>{n} movimientos</small>': 'Your turn to scramble<small>{n} moves</small>',
  'Haz {n} movimiento tú': 'Make {n} move yourself',
  'Haz {n} movimientos tú': 'Make {n} moves yourself',
  '🔍 ¡Ahora al revés!': '🔍 Now backwards!',
  'Deshaz los movimientos, del último al primero.': 'Undo the moves, last one first.',
  'Ahora deshazlo, del último al primero': 'Now undo it, last one first',
  'Te quedan {n}': '{n} to go',
  '🔍 Quedan {n}': '🔍 {n} left',
  '¿Te acuerdas?<small>Quedan {n}</small>': 'Do you remember?<small>{n} left</small>',
  '¡LO HAS CONSEGUIDO!<small>{estrellas}</small>': 'YOU DID IT!<small>{estrellas}</small>',
  '¡Muy bien! Lo has conseguido': 'Well done! You did it',
  '➡️ Siguiente nivel': '➡️ Next level',
  '🏠 Volver al menú': '🏠 Back to the menu',

  '🏆 Resuélvelo conmigo': '🏆 Solve it with me',
  'Antes de empezar…<small>necesito saber cómo está tu cubo</small>':
    'Before we start…<small>I need to know how your cube looks</small>',
  'Pon el cubo RESUELTO y pulsa el botón de abajo.':
    'Set the cube to SOLVED and press the button below.',
  '✅ Ya está resuelto': '✅ It is solved now',
  'Pon el cubo resuelto y pulsa el botón de arriba para volver a empezar.':
    'Solve the cube and press the button above to start over.',
  'No pasa nada, seguimos por aquí 😊': 'No worries, let’s carry on from here 😊',
  'No pasa nada, seguimos desde aquí 😊': 'No worries, we carry on from here 😊',
  '¡CUBO RESUELTO!<small>⭐⭐⭐</small>': 'CUBE SOLVED!<small>⭐⭐⭐</small>',
  'Lo has hecho tú. Enséñaselo a todo el mundo 🏆': 'You did it yourself. Go show everyone 🏆',
  '🏆 ¡Terminado!': '🏆 Finished!',
  '¡Cubo resuelto! Eres un campeón': 'Cube solved! You are a champion',
  'Pon el cubo resuelto y vuelve a empezar.': 'Solve the cube and start again.',
  'Ups…<small>{error}</small>': 'Oops…<small>{error}</small>',

  '📚 Curso guiado': '📚 Guided course',
  'Curso guiado<small>De principio a fin, pasando de paso solo</small>':
    'Guided course<small>Start to finish, moving on by itself</small>',
  'El cubo está resuelto<small>mézclalo para empezar</small>':
    'The cube is solved<small>scramble it to begin</small>',
  'Desordena el cubo y el curso arrancará solo.':
    'Scramble the cube and the course will start on its own.',
  '¡CUBO RESUELTO!<small>has hecho los ocho pasos</small>':
    'CUBE SOLVED!<small>you did all eight steps</small>',
  'Ya sabes resolverlo entero. Mézclalo y repítelo hasta que te salga solo.':
    'Now you can solve the whole thing. Scramble it and repeat until it comes out by itself.',
  '¡Cubo resuelto! Has completado los ocho pasos.':
    'Cube solved! You have completed all eight steps.',
  '📚 Volver al tutorial': '📚 Back to the lessons',
  '🏆 Curso terminado': '🏆 Course finished',
  'Paso conseguido': 'Step complete',
  'Muy bien. Ahora: {siguiente}': 'Well done. Now: {siguiente}',
  'siguiente paso…': 'next step…',
  'Siguiente paso: {siguiente}': 'Next step: {siguiente}',

  '🐵 El mono dice': '🐵 Monkey says',
  'Mira al mono<small>y luego repites tú</small>':
    'Watch the monkey<small>then you repeat</small>',
  'Fíjate bien…': 'Watch closely…',
  '🐵 Mira: {n} giro': '🐵 Watch: {n} turn',
  '🐵 Mira: {n} giros': '🐵 Watch: {n} turns',
  '¡Ahora tú!': 'Your turn!',
  '¡Ahora tú!<small>repite los {n} giros</small>': 'Your turn!<small>repeat the {n} turns</small>',
  '🐵 ¡Ahora tú! 0 de {n}': '🐵 Your turn! 0 of {n}',
  '🐵 Vas {i} de {n}': '🐵 You are on {i} of {n}',
  '¡MUY BIEN!<small>ronda {n} superada</small>': 'WELL DONE!<small>round {n} passed</small>',
  'Casi. Era la cara {color}': 'So close. It was the {color} face',
  'Era la cara <b>{color}</b>. Tu récord: <b>{mejor}</b>':
    'It was the <b>{color}</b> face. Your record: <b>{mejor}</b>',
  'Tu récord: {n} giros seguidos': 'Your record: {n} turns in a row',

  // ---------- Apaga los colores ----------
  '🫧 Apaga los colores': '🫧 Switch the colours off',
  '🫧 Apagados: {n}': '🫧 Switched off: {n}',
  '¡A apagar!<small>gira la cara del color que cae</small>':
    'Lights out!<small>turn the face of the colour that is falling</small>',
  'Cuando caiga un color, <b>gira esa cara</b>. ¡Para donde quieras!':
    'When a colour falls, <b>turn that face</b>. Either way round!',
  'Gira la cara del color que cae': 'Turn the face of the colour that is falling',
  'Gira la cara <b>{color}</b>': 'Turn the <b>{color}</b> face',
  'Tu récord: {n} apagados': 'Your record: {n} switched off',
  '¡Se han caído!<small>has apagado {n}</small>':
    'They fell!<small>you switched {n} off</small>',
  '¡Récord nuevo! 🎉': 'A new record! 🎉',
  '¡Récord!': 'A record!',
  'Tu récord: <b>{n}</b>': 'Your record: <b>{n}</b>',
  'Se han caído. Otra vez': 'They fell. Try again',

  // ---------- El caminito ----------
  '🐥 El caminito': '🐥 The little path',
  '🐥 Baldosa {i} de {n}': '🐥 Tile {i} of {n}',
  'gira esa cara': 'turn that face',
  'Gira la cara <b>{color}</b> y el pollito salta a esa baldosa':
    'Turn the <b>{color}</b> face and the chick hops onto that tile',
  'Tu mejor camino: {n} baldosas': 'Your longest path: {n} tiles',
  'Esa no. Busca la baldosa <b>{color}</b>': 'Not that one. Look for the <b>{color}</b> tile',
  '¡Bien! Ahora la <b>{color}</b>': 'Nice! Now the <b>{color}</b> one',
  '¡HA LLEGADO!<small>{n} baldosas</small>': 'IT MADE IT!<small>{n} tiles</small>',
  'El pollito ha llegado a su regalo 🎁': 'The chick has reached its present 🎁',
  '¡Récord! El pollito ha llegado': 'A record! The chick made it',
  '¡Muy bien! El pollito ha llegado': 'Well done! The chick made it',
  '➡️ Otro camino': '➡️ Another path',

  // ---------- Patrones ----------
  'Dibujos que puedes hacer con el cubo. Te guío giro a giro.':
    'Pictures you can make on the cube. I guide you turn by turn.',
  'Todos salen del cubo <b>resuelto</b>. Si no lo está, primero te ayudo a resolverlo.':
    'They all start from a <b>solved</b> cube. If yours is not, I will help you solve it first.',
  '1 · Primero, cubo resuelto': '1 · First, solve the cube',
  '2 · {patron}': '2 · {patron}',
  'Quedan {n} giros para que quede así.': '{n} turns to go until it looks like this.',
  '🎨 Patrón terminado': '🎨 Pattern finished',
  '{patron} ¡Ya está!<small>mira qué bonito</small>':
    '{patron} There it is!<small>look how good that is</small>',
  '¡{patron}! Mira qué bonito': '{patron}! Look how good that is',
  '↩️ Deshacerlo': '↩️ Undo it',
  '🎨 Otro patrón': '🎨 Another pattern',
  '↩️ Deshaciendo {patron}': '↩️ Undoing {patron}',
  '↩️ Deshacer {patron}': '↩️ Undo {patron}',
  '↩️ Deshecho': '↩️ Undone',
  '¡CUBO RESUELTO!<small>como estaba</small>': 'CUBE SOLVED!<small>just as it was</small>',
  'Listo para otro patrón.': 'Ready for another pattern.',

  'Damero': 'Checkerboard',
  'Las seis caras a cuadros, como un tablero de ajedrez.':
    'All six faces chequered, like a chessboard.',
  'Cuatro puntos': 'Four spots',
  'Cuatro caras con un lunar en el centro.': 'Four faces with a dot in the middle.',
  'Seis puntos': 'Six spots',
  'Las seis caras con un lunar en medio, como un dado.':
    'All six faces with a dot in the middle, like a die.',
  'Las cruces': 'The crosses',
  'Una cruz de otro color en cuatro caras.': 'A cross in another colour on four faces.',
  'Tetris': 'Tetris',
  'Las caras partidas en dos mitades, como piezas encajadas.':
    'The faces split in two, like interlocking bricks.',
  'Cubo dentro del cubo': 'Cube in a cube',
  'Parece que hay un cubo pequeño metido en una esquina.':
    'It looks like a small cube tucked into one corner.',
  'Cubo, cubo y cubo': 'Cube in a cube in a cube',
  'Tres cubos metidos uno dentro de otro.': 'Three cubes nested one inside the other.',
  'Anaconda': 'Anaconda',
  'Una serpiente que da la vuelta al cubo.': 'A snake winding all the way round the cube.',
  'Pitón': 'Python',
  'Otra serpiente, hermana de la anaconda.': 'Another snake, sister to the anaconda.',
  'Mamba negra': 'Black mamba',
  'La tercera serpiente de la familia.': 'The third snake in the family.',
  'Rayas': 'Stripes',
  'El cubo a rayas de arriba abajo.': 'The cube striped from top to bottom.',
  'Superflip': 'Superflip',
  'Las esquinas en su sitio y todos los bordes del revés. El más famoso: es de los cubos más difíciles de resolver que existen.':
    'Corners in place and every edge flipped. The famous one: among the hardest cube positions there are.',

  // ---------- Tutorial ----------
  'Toca un paso para ver la explicación y practicarlo con tu cubo.':
    'Tap a step to see the explanation and practise it with your cube.',
  'Ocho pasos. Uno cada vez.': 'Eight steps. One at a time.',
  '¡Cubo resuelto! Mézclalo para practicar.': 'Cube solved! Scramble it to practise.',
  'Vas por: {leccion}': 'You are on: {leccion}',
  'Lección': 'Lesson',
  '🎯 Practicar con mi cubo': '🎯 Practise with my cube',
  '▶️ Ver el movimiento': '▶️ Watch the move',
  '▶️ {nombre}': '▶️ {nombre}',

  'La margarita': 'The daisy',
  'Reunir arriba las cuatro piezas blancas de los bordes.':
    'Gather the four white edge pieces on top.',
  'Coge el cubo con el <b>amarillo arriba</b> y el <b>blanco abajo</b>. Así vas a trabajar siempre.':
    'Hold the cube with <b>yellow on top</b> and <b>white on the bottom</b>. That is how you will always work.',
  'Busca las cuatro piezas de <b>dos colores</b> que tienen blanco. Hay que subirlas arriba, alrededor del centro amarillo, con el <b>blanco mirando al techo</b>.':
    'Find the four <b>two-colour</b> pieces that have white on them. Bring them to the top, around the yellow centre, with the <b>white facing the ceiling</b>.',
  'Queda una flor: el centro amarillo es el corazón y las cuatro piezas blancas los pétalos.':
    'You get a flower: the yellow centre is the heart and the four white pieces are the petals.',
  'Si una pieza blanca está arriba pero con el blanco de lado, gira esa cara para sacarla y vuelve a intentarlo.':
    'If a white piece is on top but with the white on the side, turn that face to pull it out and try again.',
  'Ya tienes la margarita': 'You have the daisy',

  'Bajar los pétalos': 'Drop the petals',
  'Convertir la margarita en la cruz blanca de abajo.':
    'Turn the daisy into the white cross underneath.',
  'Mira un pétalo: además del blanco tiene <b>otro color</b> en el lado.':
    'Look at one petal: besides the white it has <b>another colour</b> on its side.',
  'Gira la cara de arriba hasta que ese color quede <b>justo encima del centro de su mismo color</b>.':
    'Turn the top face until that colour sits <b>right above the centre of the same colour</b>.',
  'Ahora gira esa cara <b>dos vueltas enteras</b> y el pétalo baja a su sitio.':
    'Now turn that face <b>two full turns</b> and the petal drops into place.',
  'Repite con los cuatro. Al terminar tienes una cruz blanca abajo y los lados cuadran con los centros.':
    'Repeat with all four. When you finish you have a white cross underneath and the sides line up with the centres.',
  'Si bajas un pétalo sin hacer coincidir el color, quedará torcido. Primero el color, luego dos vueltas.':
    'If you drop a petal without matching the colour it ends up crooked. Colour first, then two turns.',
  'Cruz blanca terminada': 'White cross done',

  'Las esquinas de abajo': 'The bottom corners',
  'Completar la primera capa con el movimiento mágico.':
    'Finish the first layer with the magic move.',
  'Busca una <b>esquina con blanco</b> que esté en la capa de arriba.':
    'Find a <b>corner with white on it</b> sitting in the top layer.',
  'Gíra la cara de arriba hasta ponerla <b>justo encima del hueco donde le toca</b>: sus otros dos colores tienen que coincidir con los dos centros de al lado.':
    'Turn the top face until it sits <b>right above the slot it belongs in</b>: its other two colours must match the two centres beside it.',
  'Ahora repite el <b>movimiento mágico</b> hasta que la esquina caiga en su sitio. A veces hace falta repetirlo cinco veces: no pasa nada, es normal.':
    'Now repeat the <b>magic move</b> until the corner drops into place. Sometimes it takes five goes: that is perfectly normal.',
  'Si una esquina blanca está abajo pero mal puesta, haz el movimiento mágico una vez para sacarla y vuelve a empezar con ella.':
    'If a white corner is at the bottom but in the wrong place, do the magic move once to pop it out and start again with it.',
  'El movimiento mágico': 'The magic move',
  'Primera capa completa': 'First layer complete',

  'El cinturón': 'The belt',
  'Colocar las cuatro piezas de la capa del medio.':
    'Place the four pieces of the middle layer.',
  'Da la vuelta mentalmente: ahora trabajamos la <b>capa de en medio</b>.':
    'Shift your attention: now we work on the <b>middle layer</b>.',
  'Busca arriba una pieza de borde <b>que no tenga amarillo</b>. Gira arriba hasta que su color de delante coincida con el centro de esa cara: se forma una <b>T</b>.':
    'Find an edge piece on top <b>with no yellow on it</b>. Turn the top until its front colour matches the centre of that face: a <b>T</b> appears.',
  'Mira el color de arriba de esa pieza: si señala a la <b>derecha</b>, usa la fórmula de la derecha; si señala a la <b>izquierda</b>, la de la izquierda.':
    'Look at the top colour of that piece: if it points <b>right</b>, use the right-hand formula; if it points <b>left</b>, the left-hand one.',
  'Si no queda arriba ninguna pieza sin amarillo, haz la fórmula de la derecha en un hueco mal puesto para sacar la pieza que estorba.':
    'If no yellow-free piece is left on top, do the right-hand formula on a wrongly filled slot to pop out the piece in the way.',
  'Fórmula de la derecha': 'Right-hand formula',
  'Fórmula de la izquierda': 'Left-hand formula',
  'Dos capas terminadas': 'Two layers done',

  'La cruz amarilla': 'The yellow cross',
  'Dibujar la cruz amarilla en el techo.': 'Draw the yellow cross on the top.',
  'Mira sólo la cara de arriba. Verás una de estas tres formas: un <b>punto</b>, una <b>L</b> o una <b>línea</b>.':
    'Look at the top face only. You will see one of three shapes: a <b>dot</b>, an <b>L</b> or a <b>line</b>.',
  'Con la <b>línea</b>: ponla horizontal y haz la fórmula una vez.':
    'With the <b>line</b>: lay it horizontal and do the formula once.',
  'Con la <b>L</b>: colócala mirando arriba y a la izquierda, y haz la fórmula.':
    'With the <b>L</b>: point it up and to the left, then do the formula.',
  'Con el <b>punto</b>: haz la fórmula y saldrá una L o una línea; luego sigue.':
    'With the <b>dot</b>: do the formula and an L or a line will appear; then carry on.',
  'Es siempre la misma fórmula. Lo único que cambia es cómo colocas el cubo antes.':
    'It is always the same formula. The only thing that changes is how you hold the cube first.',
  'Fórmula de la cruz': 'Cross formula',
  'Cruz amarilla hecha': 'Yellow cross done',

  'Colocar los bordes': 'Place the edges',
  'Que cada borde de arriba mire a su color.':
    'Get every top edge facing its own colour.',
  'Gira la cara de arriba hasta que <b>al menos un borde</b> coincida con el centro de su cara.':
    'Turn the top face until <b>at least one edge</b> matches the centre of its face.',
  'Si coinciden los cuatro, este paso ya está.': 'If all four match, this step is done.',
  'Si no, pon el que ya coincide <b>detrás</b> y haz la fórmula. Puede que haga falta repetirla.':
    'If not, put the matching one <b>at the back</b> and do the formula. You may need to repeat it.',
  'Este paso va antes que las esquinas. Si lo haces al revés, las esquinas pueden quedar imposibles de colocar.':
    'This step comes before the corners. Do it the other way round and the corners can end up impossible to place.',
  'Fórmula de los bordes': 'Edge formula',
  'Bordes colocados': 'Edges in place',

  'Colocar las esquinas': 'Place the corners',
  'Llevar cada esquina a su rincón, aunque quede girada.':
    'Get every corner to its own corner, twisted or not.',
  'Mira las cuatro esquinas de arriba. Busca una que esté <b>en su rincón</b>: sus tres colores son los de las tres caras que toca, aunque estén del revés.':
    'Look at the four top corners. Find one that is <b>in its own corner</b>: its three colours belong to the three faces it touches, even if they are turned the wrong way.',
  'Pon esa esquina <b>delante y a la derecha</b> y haz la fórmula. Las otras tres bailan.':
    'Put that corner <b>front right</b> and do the formula. The other three dance around.',
  'Si no hay ninguna en su sitio, haz la fórmula una vez desde donde sea y aparecerá una.':
    'If none is in place, do the formula once from anywhere and one will turn up.',
  'Aquí no importa que estén giradas. Sólo que cada una esté en su rincón.':
    'It does not matter here that they are twisted. Only that each one is in its own corner.',
  'Baile de esquinas': 'Corner dance',
  'Esquinas en su sitio': 'Corners in place',

  'Girar las esquinas': 'Twist the corners',
  'El último paso: poner el amarillo hacia arriba.':
    'The last step: get the yellow facing up.',
  'Pon una esquina que tenga el amarillo <b>de lado</b> en la posición de delante-derecha.':
    'Put a corner with its yellow <b>on the side</b> into the front-right position.',
  'Repite la fórmula hasta que esa esquina tenga el <b>amarillo arriba</b>. Serán dos o cuatro veces.':
    'Repeat the formula until that corner has its <b>yellow on top</b>. It takes two or four goes.',
  '<b>El cubo se va a desordenar por abajo. No lo arregles.</b> Es normal y se coloca solo.':
    '<b>The cube will look a mess underneath. Do not fix it.</b> That is normal and it sorts itself out.',
  'Cuando la esquina esté bien, gira <b>sólo la cara de arriba</b> para traer la siguiente y repite.':
    'Once the corner is right, turn <b>only the top face</b> to bring the next one round and repeat.',
  'Al colocar la última, el cubo entero se resuelve como por arte de magia.':
    'As you finish the last one the whole cube solves itself, like magic.',
  'Entre esquina y esquina sólo se gira la cara de arriba. Si giras otra cosa, se rompe el truco.':
    'Between corners you only turn the top face. Turn anything else and the trick breaks.',
  'Girar la esquina': 'Twist the corner',
  '¡Cubo resuelto!': 'Cube solved!',

  // ---------- Solucionador: pasos y explicaciones ----------
  'Pon las 4 piezas blancas del borde alrededor del centro amarillo, con el blanco mirando hacia arriba.':
    'Put the 4 white edge pieces around the yellow centre, with the white facing up.',
  'Vamos a hacer una flor: el centro amarillo es el corazón y las cuatro piezas blancas son los pétalos.':
    'We are making a flower: the yellow centre is the heart and the four white pieces are the petals.',
  'Gira cada pétalo hasta que su color de al lado coincida con el centro de esa cara, y baja la pieza girando esa cara dos veces.':
    'Turn each petal until its side colour matches the centre of that face, then drop the piece by turning that face twice.',
  'Cada pétalo tiene que caer en su sitio. Primero busca su color, y luego lo bajas dando dos vueltas.':
    'Each petal has to fall into its place. Find its colour first, then drop it with two turns.',
  'Coloca las 4 esquinas blancas. Pon la esquina justo encima de su hueco y repite el movimiento mágico hasta que entre.':
    'Place the 4 white corners. Put the corner right above its slot and repeat the magic move until it goes in.',
  'El movimiento mágico: derecha arriba, derecha abajo. Repite hasta que la esquina caiga en su casita.':
    'The magic move: right up, right down. Repeat until the corner drops into its little house.',
  'Coloca las 4 piezas del medio con la fórmula de la derecha o de la izquierda.':
    'Place the 4 middle pieces with the right-hand or left-hand formula.',
  'Ahora el cinturón del cubo. Busca una pieza de arriba que no tenga amarillo y mándala a su hueco.':
    'Now the belt of the cube. Find a top piece with no yellow and send it to its slot.',
  'Haz la cruz amarilla arriba con la fórmula F R U R’ U’ F’.':
    'Make the yellow cross on top with the formula F R U R’ U’ F’.',
  'Ahora dibujamos una cruz amarilla en el techo del cubo.':
    'Now we draw a yellow cross on the roof of the cube.',
  'Lleva cada borde amarillo a su cara: el color del lado tiene que coincidir con el centro.':
    'Take each yellow edge to its face: the side colour has to match the centre.',
  'Los bordes de arriba tienen que mirar a su casa. Cada uno con su color.':
    'The top edges have to face their own home. Each one with its colour.',
  'Lleva cada esquina amarilla a su sitio (aunque esté girada).':
    'Take each yellow corner to its place (twisted or not).',
  'Cada esquina tiene que ir a su rincón. Todavía no importa si está del revés.':
    'Each corner has to go to its own corner. It does not matter yet if it is the wrong way round.',
  'Gira cada esquina con R’ D’ R D hasta que el amarillo mire arriba.':
    'Twist each corner with R’ D’ R D until the yellow faces up.',
  'Ojo: el cubo se va a desordenar por abajo. No pasa nada, es magia: al final vuelve solo.':
    'Careful: the cube will look a mess underneath. Never mind, it is magic: it comes back on its own.',

  'Saca la pieza blanca de arriba': 'Pull the white piece out of the top',
  'Esta pieza blanca está arriba, pero con el blanco mirando de lado. Si la bajásemos así quedaría torcida, así que primero la sacamos de ahí girando su cara.':
    'This white piece is on top but with the white facing sideways. Dropping it like that would leave it crooked, so first we pull it out by turning its face.',
  'Deja sitio libre arriba': 'Make room on top',
  'Giramos sólo la cara de arriba para que el hueco donde va a llegar la pieza esté libre. Así no tiramos un pétalo que ya estaba puesto.':
    'We turn only the top face so the spot the piece is heading for is free. That way we do not knock out a petal already in place.',
  'Sube la pieza blanca de abajo': 'Bring the white piece up from the bottom',
  'Esta pieza blanca está abajo pero en el sitio equivocado. Dos vueltas de su cara la suben arriba con el blanco hacia el techo, que es donde la queremos para la margarita.':
    'This white piece is at the bottom but in the wrong place. Two turns of its face bring it up with the white facing the ceiling, which is where we want it for the daisy.',
  'Saca la pieza blanca de abajo': 'Pull the white piece out of the bottom',
  'Está abajo y con el blanco de lado, así que no sirve. La sacamos para volver a colocarla bien.':
    'It is at the bottom with the white on its side, so it is no good there. We pull it out to place it properly.',
  'Sube el pétalo': 'Raise the petal',
  'Con este giro la pieza blanca sube a la cara de arriba con el blanco hacia el techo.':
    'This turn brings the white piece up to the top face with the white facing the ceiling.',
  'Coloca el pétalo': 'Place the petal',
  'Movemos la pieza blanca hacia la cara de arriba.': 'We move the white piece up to the top face.',
  'Aparta el pétalo': 'Move the petal aside',
  'Devuelve la cara a su sitio': 'Put the face back',
  'Busca el color del pétalo': 'Find the petal’s colour',
  'Cada pétalo tiene un segundo color. Giramos arriba hasta ponerlo justo encima del centro de ese mismo color: es su cara, y ahí es donde tiene que caer.':
    'Each petal has a second colour. We turn the top until it sits right above the centre of that same colour: that is its face, and that is where it has to fall.',
  'Baja el pétalo (dos vueltas)': 'Drop the petal (two turns)',
  'Dos vueltas enteras de esa cara: la pieza baja al fondo con el blanco abajo y el otro color pegado a su centro. Media vuelta no valdría, quedaría del revés.':
    'Two full turns of that face: the piece goes down to the bottom with the white underneath and the other colour against its centre. A single quarter turn would not do; it would end up the wrong way round.',
  'Saca la esquina de su hueco': 'Pull the corner out of its slot',
  'Esta esquina está en el hueco pero mal puesta. La sacamos arriba para volver a meterla bien.':
    'This corner is in the slot but the wrong way. We pull it up to put it back in properly.',
  'Pon la esquina encima de su casita': 'Put the corner above its little house',
  'Giramos arriba hasta que la esquina quede justo encima del hueco al que pertenece. Sus dos colores de los lados tienen que coincidir con los dos centros de al lado.':
    'We turn the top until the corner sits right above the slot it belongs to. Its two side colours have to match the two centres beside it.',
  'Movimiento mágico': 'Magic move',
  'Estos cuatro giros sacan la esquina del hueco, la voltean un poco y la vuelven a meter. Repitiéndolos, la esquina acaba cayendo con el blanco hacia abajo.':
    'These four turns take the corner out of the slot, twist it a little and put it back. Keep repeating and the corner ends up landing with the white facing down.',
  'Alinea la pieza con su color': 'Line the piece up with its colour',
  'Giramos arriba hasta que el color de delante de la pieza coincida con su centro. Se forma una T, y eso indica que la pieza ya está encima de su cara.':
    'We turn the top until the front colour of the piece matches its centre. A T appears, and that tells you the piece is above its own face.',
  'La pieza tiene que bajar al hueco de la derecha. La fórmula la aparta, mete la esquina en medio para hacer sitio, y la deja caer en su ranura.':
    'The piece has to drop into the right-hand slot. The formula moves it aside, tucks the corner in to make room, and lets it fall into its groove.',
  'Igual que la de la derecha pero al espejo, porque la pieza va al hueco de la izquierda.':
    'The same as the right-hand one but mirrored, because the piece goes to the left-hand slot.',
  'Saca la pieza que está mal': 'Pop out the piece that is wrong',
  'No queda arriba ninguna pieza aprovechable, así que expulsamos una que está mal metida para poder volver a colocarla desde arriba.':
    'There is no usable piece left on top, so we push out one that went in wrong to place it again from above.',
  'Fórmula de la cruz amarilla': 'Yellow cross formula',
  'Esta fórmula gira tres bordes de arriba. Aplicada desde la posición correcta, convierte el punto en L, la L en línea y la línea en cruz.':
    'This formula flips three top edges. Done from the right position it turns the dot into an L, the L into a line and the line into a cross.',
  'Fórmula de los bordes de arriba': 'Top edges formula',
  'Rota tres bordes de la última capa entre ellos, sin tocar nada de abajo. Repitiéndola desde la posición adecuada, cada borde acaba mirando a su color.':
    'It cycles three last-layer edges between them without touching anything below. Repeat it from the right position and every edge ends up facing its colour.',
  'Intercambia tres esquinas de arriba dejando quieta la que ya está en su rincón. Todavía pueden quedar giradas: eso se arregla en el último paso.':
    'It swaps three top corners and leaves the one already in its corner alone. They may still be twisted: the last step sorts that out.',
  'Trae la siguiente esquina al frente': 'Bring the next corner to the front',
  'Esta esquina ya tiene el amarillo arriba. Giramos sólo la cara de arriba para traer la siguiente que esté mal, sin tocar nada más.':
    'This corner already has its yellow on top. We turn only the top face to bring round the next one that is wrong, touching nothing else.',
  'Gira la esquina (repite hasta que el amarillo mire arriba)':
    'Twist the corner (repeat until the yellow faces up)',
  'Estos cuatro giros voltean la esquina de delante-derecha un poquito. El cubo se desordena por abajo: es normal y volverá solo cuando todas las esquinas estén giradas.':
    'These four turns twist the front-right corner a little. The cube gets messy underneath: that is normal and it comes back on its own once every corner is twisted.',
  'Y ya está: recoloca la capa de arriba': 'And that is it: line the top layer up',
  'Último giro para alinear la capa de arriba con el resto. El cubo queda resuelto.':
    'One last turn to line the top layer up with the rest. The cube is solved.',
  'Gira la cara de arriba': 'Turn the top face',
  'Ajustamos la cara de arriba para colocar las piezas en la posición que necesita la fórmula.':
    'We adjust the top face to put the pieces where the formula needs them.',
  'Solo falta girar arriba': 'Only the top layer left to turn',
  'Todo está en su sitio; sólo falta alinear la última capa.':
    'Everything is in place; the last layer just needs lining up.',
  'El cubo no ha quedado resuelto': 'The cube did not end up solved',

  // ---------- Cronómetro ----------
  'Inspección 15s': '15s inspection',
  '🔀 Otra mezcla': '🔀 Another scramble',
  '🗑️ Vaciar sesión': '🗑️ Clear session',
  '¿Vaciar la sesión? Se borran {n} tiempos.': 'Clear the session? That deletes {n} times.',
  'Inspección de 15 s activada': '15 s inspection on',
  'Inspección desactivada': 'Inspection off',
  'Inspección': 'Inspection',
  'Inspección pasada de 15 s: +2': 'Inspection over 15 s: +2',
  'Inspección pasada de 17 s: DNF': 'Inspection over 17 s: DNF',
  '¡Nueva mejor media de 5! {tiempo}': 'New best average of 5! {tiempo}',
  '¡Nuevo récord personal!': 'New personal best!',
  'Ya está. Ahora aplica la mezcla': 'That is it. Now apply the scramble',
  'Mezcla lista. Pulsa para inspeccionar': 'Scramble ready. Press to inspect',
  'Listo': 'Ready',
  '¡YA!': 'GO!',
  '¡Suelta!': 'Let go!',
  '<b>¡Suelta!</b>': '<b>Let go!</b>',
  'Sigue pulsando…': 'Keep holding…',
  'El cubo no está resuelto. <b>Te guío para resolverlo</b> y luego mezclamos.':
    'The cube is not solved. <b>I will guide you through solving it</b> and then we scramble.',
  '<b>Ese giro no era.</b> Aquí tienes el camino de vuelta: <b>{n}</b> giros.':
    '<b>That was not the turn.</b> Here is the way back: <b>{n}</b> turns.',
  'Sigue la mezcla: <b>quedan {n}</b> giros.': 'Follow the scramble: <b>{n} turns</b> to go.',
  '<b>Pulsa</b> (o barra espaciadora) y empiezan los <b>15 s de inspección</b>.':
    '<b>Press</b> (or hit space) and the <b>15 s inspection</b> starts.',
  '<b>Listo.</b> El crono arranca en cuanto muevas.':
    '<b>Ready.</b> The timer starts the moment you turn something.',
  'Mira el cubo. <b>Al primer giro arranca el crono.</b>':
    'Look at the cube. <b>The first turn starts the timer.</b>',
  'Corriendo… paro solo al resolverlo.': 'Running… I stop by myself when it is solved.',
  'Sujeta el cubo con el <b>blanco abajo</b> y el <b>verde delante</b>.':
    'Hold the cube with <b>white on the bottom</b> and <b>green in front</b>.',
  'Corriendo. <b>Barra espaciadora</b> o el botón para parar.':
    'Running. <b>Space bar</b> or the button to stop.',
  'Inspección. Mantén pulsado y <b>suelta</b> para arrancar.':
    'Inspection. Hold down and <b>let go</b> to start.',
  'Aplica la mezcla a tu cubo. Luego <b>barra espaciadora</b> (o el botón) y empiezan los <b>15 s de inspección</b>.':
    'Apply the scramble to your cube. Then <b>space bar</b> (or the button) and the <b>15 s inspection</b> starts.',
  'Aplica la mezcla a tu cubo. Luego <b>mantén la barra</b> (o el botón) y suelta para arrancar.':
    'Apply the scramble to your cube. Then <b>hold the space bar</b> (or the button) and let go to start.',
  '👁️ Empezar la inspección': '👁️ Start the inspection',
  '⏹️ Parar': '⏹️ Stop',
  '▶️ Mantén y suelta para arrancar': '▶️ Hold and let go to start',
  '▶️ Arrancar': '▶️ Start',
  'Arrancar': 'Start',
  'ocho': 'eight',
  'doce': 'twelve',
  'intentos': 'solves',
  'mejor': 'best',
  'media': 'mean',
  'MEJOR AO5': 'BEST AO5',
  'MEJOR AO12': 'BEST AO12',

  // ---------- Fridrich ----------
  'Guía': 'Guide',
  'Mientras resuelves te digo en qué paso estás y qué caso de OLL o PLL tienes delante, con su algoritmo.':
    'As you solve, I tell you which step you are on and which OLL or PLL case you are looking at, with its algorithm.',
  'Mezcla el cubo': 'Scramble the cube',
  '{n} casos de {set} · {hechos} practicados': '{n} {set} cases · {hechos} practised',
  '1 intento': '1 solve',
  '{n} intentos': '{n} solves',
  'mejor {tiempo} · {veces}': 'best {tiempo} · {veces}',
  '{n} algoritmos': '{n} algorithms',
  '1 · La cruz': '1 · Cross',
  '2 · F2L': '2 · F2L',
  '3 · OLL': '3 · OLL',
  '4 · PLL': '4 · PLL',
  '✅ Resuelto': '✅ Solved',
  'Todavía falta la cruz de abajo': 'The bottom cross is not done yet',
  'La cruz blanca': 'The white cross',
  'Saca el par atrapado': 'Free the trapped pair',
  'F2L: {n} de 4 pares': 'F2L: {n} of 4 pairs',
  'OLL desconocido': 'unknown OLL',
  'PLL desconocido': 'unknown PLL',
  'Sólo falta girar la cara de arriba': 'Only the top face left to turn',
  'Las piezas de este par están metidas donde no toca. Primero se saca el par y luego se mete bien.':
    'The pieces of this pair are stuck in the wrong place. First get the pair out, then put it in properly.',
  'La cruz se hace a ojo, sin fórmula. Te la guío para que no te quedes parado, pero con práctica la verás sola.':
    'The cross is done by eye, with no formula. I guide you so you are not stuck, but with practice you will see it yourself.',
  'Mézclalo y te voy diciendo cada caso.': 'Scramble it and I will call out each case.',
  '<small>hueco de la cara {color}</small>': '<small>{color} face slot</small>',
  '<b>Giro de ajuste</b> antes de la fórmula.': '<b>Adjustment turn</b> before the formula.',
  'Quedan {n}. Toca el nombre del caso para entrenarlo.':
    '{n} to go. Tap the case name to drill it.',
  'Toca el nombre del caso para entrenarlo aparte.': 'Tap the case name to drill it separately.',
  'Bordes': 'Edges',
  'Esquinas': 'Corners',
  'Adyacentes': 'Adjacent',
  'Ciclos': 'Cycles',
  'Diagonales': 'Diagonals',
  'Cruz': 'Cross',
  'Punto': 'Dot',
  'Cuadrados': 'Squares',
  'Forma de L': 'L shape',
  'Línea': 'Line',
  'H (doble Sune)': 'H (double Sune)',
  'T (camaleón)': 'T (chameleon)',
  'U (cabeza de toro)': 'U (bull’s head)',
  'L (diagonal)': 'L (diagonal)',

  // ---------- apagar la última capa ----------
  '🌑 Apagar la última capa': '🌑 Turn the last layer off',
  '🌈 Encender la última capa': '🌈 Turn the last layer back on',
  'Deja a la vista sólo el par que vas a meter':
    'Leaves only the pair you are about to insert in sight',

  // ---------- Entrenar un caso ----------
  'Caso': 'Case',
  'Otro caso': 'Another case',
  'Repetir este caso': 'Do this case again',
  'Pulsa 🔁 para repetirlo, o 🔀 para otro caso.':
    'Press 🔁 to do it again, or 🔀 for another case.',
  'Haz estos giros y te dejo el caso puesto. Te aviso al llegar.':
    'Make these turns and I will set the case up. I will tell you when you get there.',
  'Haz estos giros, o pulsa <b>⚡ Prepararlo en la pantalla</b>.':
    'Make these turns, or press <b>⚡ Set it up on screen</b>.',
  'El cubo está muy revuelto: esto lo resuelve y lo vuelve a mezclar.':
    'The cube is quite scrambled: this solves it and sets the case up again.',
  'Resuelve el cubo y te preparo el caso otra vez':
    'Solve the cube and I will set the case up again',
  'Prepara el caso': 'Set the case up',
  '⚡ Prepararlo en la pantalla': '⚡ Set it up on screen',
  'Algoritmos': 'Algorithms',
  '✏️ Escribir': '✏️ Type it',
  '🔴 Grabar con el cubo': '🔴 Record with the cube',
  '🔴 Grabar con el teclado': '🔴 Record with the keyboard',
  '⏹ Parar': '⏹ Stop',
  '🔴 Grabando tu algoritmo': '🔴 Recording your algorithm',
  'Resuelve el caso a tu manera. Paro solo al terminarlo, o pulsa <b>⏹ Parar</b>.':
    'Solve the case your own way. I stop when you finish, or press <b>⏹ Stop</b>.',
  '1 · Prepara el caso': '1 · Set the case up',
  'Con el cubo <b>resuelto</b>, aplica esta mezcla. Te aviso cuando llegues.':
    'With the cube <b>solved</b>, apply this scramble. I will tell you when you get there.',
  'Pulsa <b>⚡ Prepararlo en la pantalla</b> y luego resuélvelo': 'Press <b>⚡ Set it up on screen</b> and then solve it',
  '✅ Conseguido': '✅ Got it',
  'Pulsa 🔀 arriba para otro caso.': 'Press 🔀 above for another case.',
  '2 · ¡Resuélvelo!': '2 · Solve it!',
  '⏱️ Corriendo': '⏱️ Running',
  '<b>Giro de ajuste</b>: coloca la cara de arriba antes de la fórmula.':
    '<b>Adjustment turn</b>: line the top face up before the formula.',
  'Junta la esquina con su arista y mete el par en su hueco.':
    'Join the corner to its edge and put the pair into its slot.',
  'Sigue la fórmula. El asterisco marca los giros de ajuste.':
    'Follow the formula. The asterisk marks the adjustment turns.',
  '1 guardado': '1 saved',
  '{n} guardados': '{n} saved',
  'de serie': 'built in',
  'Escribe el algoritmo para {caso} con la notación de siempre. Valen los giros de dos capas (r u f) y capas del medio (M E S).':
    'Type the algorithm for {caso} in the usual notation. Wide turns (r u f) and slice turns (M E S) are fine.',
  'Prepara antes el caso: así sé desde dónde grabas': 'Set the case up first, so I know where you are recording from',
  '🔴 Grabando: resuelve el caso a tu manera': '🔴 Recording: solve the case your own way',
  'No has hecho ningún giro': 'You did not turn anything',
  'Sólo has girado la cara de arriba': 'You only turned the top face',
  '❌ Eso no resuelve el caso, no lo guardo': '❌ That does not solve the case, so I am not saving it',
  '¿Guardar este algoritmo?': 'Save this algorithm?',
  '({n} giros grabados, {limpios} tras limpiar los ajustes)':
    '({n} turns recorded, {limpios} after trimming the adjustments)',
  'Demasiado largo (más de 40 giros).': 'Too long (more than 40 turns).',
  'Ese algoritmo no resuelve este caso. Compruébalo.':
    'That algorithm does not solve this case. Check it.',
  'Ese algoritmo ya está en la lista.': 'That algorithm is already in the list.',
  'Guardado ✅': 'Saved ✅',
  '¿Borrar este algoritmo?': 'Delete this algorithm?',

  // ---------- Diagnóstico ----------
  'Estado:': 'Status:',
  'Batería:': 'Battery:',
  'Último giro:': 'Last turn:',
  'El cubo:': 'The cube:',
  'Paquete:': 'Packet:',
  'Códigos del cubo → cara y color:': 'Cube codes → face and colour:',
  'Si al girar una cara la app dice otra cara distinta, vuelve a enseñar los colores. Si gira en el sentido contrario, pulsa el botón de arriba.':
    'If turning a face makes the app name a different one, teach it the colours again. If it turns the wrong way, press the button above.',
  'El cubo gira al revés': 'The cube turns backwards',
  'conectado a {nombre}': 'connected to {nombre}',
  'sin conexión': 'not connected',
  'código {code} · cantidad {amount} → cara {cara}': 'code {code} · amount {amount} → face {cara}',
  'dice que está RESUELTO': 'says it is SOLVED',
  'dice que está mezclado': 'says it is scrambled',
  'Explicar cada movimiento': 'Explain every move',
  'Pista': 'Hint',


  // ---------- lo que faltaba: conexión y colores ----------
  'No he podido usar ese aparato':
    'I could not use that device',
  'Lo que expone:':
    'What it exposes:',
  'Copia esto y pásamelo: con ello puedo dar soporte a tu modelo.':
    'Copy this and send it over: with it I can add support for your model.',
  'El centro nunca cambia de sitio: es el color de esa cara.':
    'The centre never moves: it is that face’s colour.',
  'Coge el cubo con el <b>blanco abajo</b> y el <b>verde de frente</b>.':
    'Hold the cube with <b>white on the bottom</b> and <b>green facing you</b>.',
  'Mira el cubo de frente a la cara <b>BLANCA</b> y gírala un cuarto de vuelta <b>en el sentido de la flecha</b>.':
    'Look straight at the <b>WHITE</b> face and give it a quarter turn <b>the way the arrow points</b>.',
  'Algo no cuadra':
    'Something does not add up',
  'Vamos a repetirlo.':
    'Let’s go through it again.',
  'Gira la <b>{color}</b>.':
    'Turn the <b>{color}</b> one.',
  'Esa no. Gira la cara <b>BLANCA</b> siguiendo la flecha.':
    'Not that one. Turn the <b>WHITE</b> face the way the arrow points.',
  'Gira una cara':
    'Turn a face',
  'sin calibrar':
    'not calibrated',
  '· leyendo el estado completo':
    '· reading the full state',
  '· siguiendo los giros':
    '· following the turns',
  '· paquete cifrado (i3s)':
    '· encrypted packet (i3s)',
  '· paquete sin cifrar':
    '· plain packet',

  // ---------- lo que faltaba: juegos ----------
  'Deshaz este movimiento':
    'Undo this move',
  '🌀 Mezclando':
    '🌀 Scrambling',
  'El cubo ha vuelto a su sitio 🎉':
    'The cube is back where it started 🎉',
  'Preparando':
    'Getting ready',
  '🔍 Te explico cada movimiento':
    '🔍 I explain every move',
  'Modo detalle apagado':
    'Detail mode off',
  'Los patrones salen del cubo resuelto. Te lo dejo listo.':
    'Patterns start from a solved cube. Let me get it ready for you.',
  'Ese giro no era: te llevo de vuelta.':
    'That was not the turn: I will take you back.',
  '{patron} ¡{NOMBRE}!<small>mira tu cubo</small>':
    '{patron} {NOMBRE}!<small>look at your cube</small>',
  'Vamos a dejarlo como estaba.':
    'Let’s put it back the way it was.',
  'Mira':
    'Watch',
  'Hazlo igual que el mono.':
    'Do it just like the monkey.',
  '🔁 Otra vez':
    '🔁 Again',

  // ---------- lo que faltaba: algoritmos y cronómetro ----------
  'No has escrito nada.':
    'You did not type anything.',
  'No entiendo "{que}".':
    'I do not understand "{que}".',
  'Ese algoritmo no mueve nada.':
    'That algorithm does not move anything.',
  '<b>(+2 de inspección)</b>':
    '<b>(+2 from inspection)</b>',
  '<b>(DNF de inspección)</b>':
    '<b>(DNF from inspection)</b>',
  'con el teclado.':
    'with the keyboard.',
  'con tu cubo.':
    'with your cube.',
  'Las piezas de este par están metidas donde no toca. Con estos tres giros salen arriba y ya se pueden colocar.':
    'The pieces of this pair are stuck in the wrong place. These three turns bring them up so you can place them.',
  '✅ Guardado y elegido como preferido':
    '✅ Saved and set as your favourite',

  // ---------- nombres de los casos de F2L y OLL ----------
  'Los dos arriba':
    'Both on top',
  'Los dos dentro':
    'Both in the slot',
  'Formas de I':
    'I shapes',
  'Formas de L':
    'L shapes',
  'Formas de T':
    'T shapes',
  'Formas de C':
    'C shapes',
  'Formas de P':
    'P shapes',
  'Formas de W':
    'W shapes',
  'Salto de caballo':
    'Knight move',
  'Formas raras':
    'Odd shapes',

  // ---------- los 41 casos de F2L, que siguen un patrón ----------
  'F2L 1 · par junto, blanco de lado':
    'F2L 1 · pair joined, white on the side',
  'F2L 2 · par separado, blanco de lado':
    'F2L 2 · pair split, white on the side',
  'F2L 3 · par junto, blanco de lado':
    'F2L 3 · pair joined, white on the side',
  'F2L 4 · par separado, blanco de lado':
    'F2L 4 · pair split, white on the side',
  'F2L 5 · par junto, blanco arriba':
    'F2L 5 · pair joined, white on top',
  'F2L 6 · par junto, blanco arriba':
    'F2L 6 · pair joined, white on top',
  'F2L 7 · par separado, blanco arriba':
    'F2L 7 · pair split, white on top',
  'F2L 8 · par separado, blanco arriba':
    'F2L 8 · pair split, white on top',
  'F2L 9 · par junto, blanco arriba':
    'F2L 9 · pair joined, white on top',
  'F2L 10 · par separado, blanco arriba':
    'F2L 10 · pair split, white on top',
  'F2L 11 · par junto, blanco de lado':
    'F2L 11 · pair joined, white on the side',
  'F2L 12 · par junto, blanco de lado':
    'F2L 12 · pair joined, white on the side',
  'F2L 13 · par junto, blanco de lado':
    'F2L 13 · pair joined, white on the side',
  'F2L 14 · par separado, blanco de lado':
    'F2L 14 · pair split, white on the side',
  'F2L 15 · par separado, blanco de lado':
    'F2L 15 · pair split, white on the side',
  'F2L 16 · par separado, blanco de lado':
    'F2L 16 · pair split, white on the side',
  'F2L 17 · par junto, blanco de lado':
    'F2L 17 · pair joined, white on the side',
  'F2L 18 · par junto, blanco de lado':
    'F2L 18 · pair joined, white on the side',
  'F2L 19 · par junto, blanco de lado':
    'F2L 19 · pair joined, white on the side',
  'F2L 20 · par separado, blanco de lado':
    'F2L 20 · pair split, white on the side',
  'F2L 21 · par separado, blanco de lado':
    'F2L 21 · pair split, white on the side',
  'F2L 22 · par separado, blanco de lado':
    'F2L 22 · pair split, white on the side',
  'F2L 23 · par junto, blanco arriba':
    'F2L 23 · pair joined, white on top',
  'F2L 24 · par separado, blanco arriba':
    'F2L 24 · pair split, white on top',
  'F2L 31 · arista metida del revés':
    'F2L 31 · edge in the wrong way round',
  'F2L 33 · arista metida del revés':
    'F2L 33 · edge in the wrong way round',
  'F2L 35 · arista metida del revés':
    'F2L 35 · edge in the wrong way round',
  'F2L 25 · esquina metida girada':
    'F2L 25 · corner in, twisted',
  'F2L 26 · esquina metida girada':
    'F2L 26 · corner in, twisted',
  'F2L 27 · esquina metida girada':
    'F2L 27 · corner in, twisted',
  'F2L 28 · esquina metida girada':
    'F2L 28 · corner in, twisted',
  'F2L 29 · esquina bien, arista fuera':
    'F2L 29 · corner right, edge out',
  'F2L 30 · esquina bien, arista fuera':
    'F2L 30 · corner right, edge out',
  'F2L 32 · arista bien, esquina fuera':
    'F2L 32 · edge right, corner out',
  'F2L 34 · arista bien, esquina fuera':
    'F2L 34 · edge right, corner out',
  'F2L 36 · arista bien, esquina fuera':
    'F2L 36 · edge right, corner out',
  'F2L 37 · esquina y arista metidas pero mal':
    'F2L 37 · corner and edge both in, both wrong',
  'F2L 38 · esquina y arista metidas pero mal':
    'F2L 38 · corner and edge both in, both wrong',
  'F2L 39 · esquina y arista metidas pero mal':
    'F2L 39 · corner and edge both in, both wrong',
  'F2L 40 · esquina y arista metidas pero mal':
    'F2L 40 · corner and edge both in, both wrong',
  'F2L 41 · esquina y arista metidas pero mal':
    'F2L 41 · corner and edge both in, both wrong',

  // ---------- grupos de casos que quedaban ----------
  'Cruz hecha': 'Cross done',
  'Rayos': 'Lightning bolts',
  'Peces': 'Fish',
  'Esquinas listas': 'Corners oriented',
  'Otros': 'Others',
  'Esquina metida': 'Corner in the slot',
  'Arista metida': 'Edge in the slot',

  // ---------- guía de Fridrich ----------
  'Haz primero la cruz blanca abajo; entonces empiezo a guiarte.':
    'Do the white cross underneath first; then I start guiding you.',
  'SIGUIENDO':
    'IN PROGRESS',

  // ---------- iPhone y iPad ----------
  'El cubo en iPhone':
    'The cube on iPhone',
  'En iPhone y iPad, <b>Safari no puede hablar por Bluetooth</b>. Es cosa de Apple, no de esta app: y como en iOS <b>todos</b> los navegadores (Chrome, Firefox, Edge) usan por dentro el motor de Safari, con ninguno funciona.':
    'On iPhone and iPad, <b>Safari cannot talk over Bluetooth</b>. That is Apple, not this app: and since on iOS <b>every</b> browser (Chrome, Firefox, Edge) runs the Safari engine underneath, none of them can either.',
  'Tienes dos caminos:':
    'You have two options:',
  '1 · Sin el cubo — funciona todo lo demás':
    '1 · Without the cube — everything else works',
  'El tutorial, el cronómetro, los patrones, los juegos y el entrenador de Fridrich van perfectos en Safari. Los giros los das en la pantalla.':
    'The lessons, the timer, the patterns, the games and the Fridrich trainer all work fine in Safari. You make the turns on screen.',
  'Jugar sin cubo<small>Aquí mismo, sin instalar nada</small>':
    'Play without a cube<small>Right here, nothing to install</small>',
  '2 · Con el cubo — hace falta Bluefy':
    '2 · With the cube — you need Bluefy',
  '<b>Bluefy</b> es un navegador gratuito de la App Store que sí trae Bluetooth. Instálalo, abre <b>esta misma dirección</b> dentro de él y el cubo conecta igual que en un ordenador.':
    '<b>Bluefy</b> is a free browser on the App Store that does have Bluetooth. Install it, open <b>this same address</b> inside it, and the cube connects just as it does on a computer.',
  'Instala <b>Bluefy</b> desde la App Store.':
    'Install <b>Bluefy</b> from the App Store.',
  'Copia el enlace con el botón de abajo.':
    'Copy the link with the button below.',
  'Abre Bluefy y <b>pégalo</b> en su barra de direcciones.':
    'Open Bluefy and <b>paste it</b> into its address bar.',
  'Copiar el enlace':
    'Copy the link',
  '📱 Bluefy en la App Store':
    '📱 Bluefy on the App Store',
  'En iPhone, Safari no puede usar el Bluetooth. <b>Toca arriba</b> y te cuento cómo conectarlo igualmente.':
    'On iPhone, Safari cannot use Bluetooth. <b>Tap above</b> and I will show you how to connect it anyway.',
  'Tu navegador no tiene <b>Bluetooth Web</b>.<br>Ábrela con <b>Chrome</b> o <b>Edge</b> desde <code>http://localhost:8080</code> (ejecuta <code>INICIAR.bat</code>).':
    'Your browser has no <b>Web Bluetooth</b>.<br>Open it in <b>Chrome</b> or <b>Edge</b> from <code>http://localhost:8080</code> (run <code>INICIAR.bat</code>).',
  'Para usar el Bluetooth abre la página desde <code>http://localhost:8080</code> (ejecuta <code>INICIAR.bat</code>), no con doble clic en el archivo.':
    'To use Bluetooth, open the page from <code>http://localhost:8080</code> (run <code>INICIAR.bat</code>), not by double-clicking the file.',
  'Enlace copiado. Ábrelo en Bluefy.':
    'Link copied. Open it in Bluefy.',
  'Ya te la he seleccionado: cópiala y ábrela en Bluefy.':
    'I have selected it for you: copy it and open it in Bluefy.',

  'Mejor aún: en <b>🔧 Diagnóstico</b> puedes <b>grabar</b> lo que dice tu cubo al hacer unos giros conocidos. Eso es lo que hace falta para escribir su decodificador y comprobarlo.':
    'Better still: in <b>🔧 Diagnostics</b> you can <b>record</b> what your cube says while you make a known set of turns. That is what it takes to write its decoder and check it.',

  // ---------- grabar un cubo desconocido ----------
  '🎙️ Grabar un cubo que no entiendo': '🎙️ Record a cube I do not understand',
  'La app sólo sabe hablar con los Xiaomi/GiiKER. Si tienes un <b>GAN</b>, un <b>MoYu</b> o un <b>QiYi</b>, esto graba lo que dice tu cubo al hacer unos giros conocidos. Con ese volcado se puede escribir su decodificador; sin él, sólo se puede adivinar.':
    'The app only knows how to talk to Xiaomi/GiiKER cubes. If you have a <b>GAN</b>, a <b>MoYu</b> or a <b>QiYi</b>, this records what your cube says while you make a known set of turns. With that dump its decoder can be written; without it, it can only be guessed at.',
  'Pon el cubo <b>resuelto</b>, con el blanco abajo y el verde delante. Dale a grabar y haz estos giros, uno cada vez, esperando un segundo entre uno y el siguiente. Al terminar el cubo tiene que estar resuelto otra vez; si no, se te ha saltado alguno.':
    'Start with the cube <b>solved</b>, white on the bottom and green at the front. Hit record and make these turns, one at a time, waiting a second between each one. The cube has to end up solved again; if it does not, you skipped one.',
  'El navegador sólo deja ver los servicios que la app pide por adelantado. Si tu cubo sale mudo, eso también hay que apuntarlo: significa que usa un servicio que todavía no conocemos.':
    'The browser only lets you see the services the app asks for up front. If your cube comes out silent, that is worth reporting too: it means it uses a service we do not know about yet.',
  '🕵️ Escuchar cualquier cubo': '🕵️ Listen to any cube',
  '🕵️ Escuchando a {nombre}': '🕵️ Listening to {nombre}',
  '🔴 Grabar': '🔴 Record',
  '📋 Copiar el volcado': '📋 Copy the dump',
  'Escuchando a {nombre}: {n} avisos enganchados':
    'Listening to {nombre}: hooked up to {n} feeds',
  'Conectado a {nombre}, pero no avisa de nada':
    'Connected to {nombre}, but it does not report anything',
  'Conecta antes un cubo, o pulsa 🕵️ Escuchar cualquier cubo':
    'Connect a cube first, or press 🕵️ Listen to any cube',
  'Grabando: haz los giros de arriba, uno cada vez':
    'Recording: make the turns above, one at a time',
  '{n} avisos apuntados': '{n} messages logged',
  'Primero graba algo': 'Record something first',
  'Volcado copiado. Pégalo en una incidencia de GitHub':
    'Dump copied. Paste it into a GitHub issue',
  'Ya te lo he seleccionado: cópialo a mano':
    'I have selected it for you: copy it by hand',
  'El aparato se ha desconectado': 'The device has disconnected',

  // ---------- añadir a la pantalla de inicio ----------
  '📲 Añadir a la pantalla de inicio':
    '📲 Add to the home screen',
  'Añadir a la pantalla de inicio':
    'Add to the home screen',
  'Queda como una app más: con su icono, a pantalla completa y sin la barra del navegador. Sigue siendo la misma página, así que no ocupa casi nada.':
    'It ends up like any other app: its own icon, full screen, no browser bar. It is still the same page, so it takes up next to nothing.',
  '¡Instalada! Búscala en tu pantalla de inicio.':
    'Installed! Look for it on your home screen.',
  'Ya la tienes instalada: estás usándola así ahora mismo.':
    'You already have it installed: that is how you are using it right now.',
  'Toca <b>Compartir</b> en la barra de Safari (el cuadrado con la flecha hacia arriba).':
    'Tap <b>Share</b> in the Safari bar (the square with the arrow pointing up).',
  'Baja y elige <b>Añadir a inicio</b>.':
    'Scroll down and choose <b>Add to Home Screen</b>.',
  'Dale a <b>Añadir</b>. Ya la tienes con las demás apps.':
    'Tap <b>Add</b>. There it is, alongside your other apps.',
  'Tiene que ser <b>Safari</b>: desde Chrome o Firefox en iPhone esta opción no aparece.':
    'It has to be <b>Safari</b>: from Chrome or Firefox on iPhone this option does not appear.',
  'Abre el menú del navegador (los tres puntos).':
    'Open the browser menu (the three dots).',
  'Elige <b>Instalar</b> o <b>Añadir a la pantalla de inicio</b>.':
    'Choose <b>Install</b> or <b>Add to Home screen</b>.',
  'En Chrome y Edge suele salir también un icono de instalar en la barra de direcciones.':
    'In Chrome and Edge there is usually an install icon in the address bar too.',
};
