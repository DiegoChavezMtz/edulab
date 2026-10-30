// Deck 1: El viaje a la luna (7 diapositivas, 15 min). Deck 2: Producto Dekids. Deck 3: Cierre.
const decks = [
  [
    { overline:'EL VIAJE A LA LUNA · 01', title:'¿QUIÉN ME ACOMPAÑA A ...?', body:'Mañana nos vamos a la luna.', marker:true, duration:120000 },
    { overline:'EL NIÑO INTERIOR · 02', title:'EL NIÑO INTERIOR Y LA CARGA DE LA DUDA', body:'Un adulto pide presupuesto, riesgos y razones para no ir. Un niño agarra su mochila para empacar.', marker:true, duration:90000 },
    { overline:'MR. HACER AMIGOS · 03', title:'MR. HACER AMIGOS', body:'Mi superpoder es hablar, conectar y escuchar a quien sea, de lo que sea. Romper barreras en un segundo.', marker:true, duration:120000 },
    { overline:'HISTORIA DE ORIGEN · 04', title:'¿CUÁL ES SU HISTORIA DE ORIGEN?', body:'Piensa en eso que te sale natural, disfrutas tanto que no parece trabajo o transforma los lugares a los que llegas. Di tu nombre de superhéroe y el momento en que descubriste tu poder.', marker:true, duration:210000 },
    { overline:'MENTALIDAD DEKIDS · 05', title:'LA MENTALIDAD DEKIDS Y TU SUEÑO SIN LÍMITES', body:'Para un niño, el mundo es un lienzo donde toda aventura puede hacerse realidad. Hoy venimos a recuperar esa chispa.', marker:true, duration:210000 },
    { overline:'IDEAS QUE VUELAN · 06', title:'EL PODER DE LAS IDEAS QUE VUELAN', body:'Escribe tu superpoder y ese objetivo imposible. Dóblalo, constrúyelo y a la cuenta de tres: ¡háganlos volar!', marker:true, duration:90000 },
    { overline:'¡A LA LUNA! · 07', title:'¡A LA LUNA!', body:'Deja la prudencia excesiva y los pretextos en la puerta. Si decidimos ir a la luna, empacamos la mochila y nos vamos.', marker:true, duration:60000 }
  ],
  [
    { overline:'PRODUCTOS DEKIDS · 01', title:'HOJA EN BLANCO', body:'', duration:90000, hideText:true },
    { overline:'IA · 02', title:'INTELIGENCIA ARTESANAL', body:'', duration:75000, holdTitle:true },
    { overline:'IA · 03', title:'LA IA NOS LLEVA MÁS RÁPIDO Y MEJOR A DONDE NOS IMAGINAMOS', body:'', duration:75000 },
    { overline:'PROCESO · 04', title:'BUSCAR. PROBAR. EQUIVOCARSE. RETOMAR.', body:'', duration:120000, holdTitle:true },
    { overline:'APRENDER · 05', title:'DIFICULTADES DESEABLES', body:'', duration:90000 },
    { overline:'DISEÑO · 06', title:'QUE NO SE VEA TAN IA', body:'', duration:75000, retitles:true },
    { overline:'EL RECELO · 07', title:'“¿PARA QUÉ ATENDER UN CURSO SI LE PREGUNTO A MI IA?”', body:'', duration:60000 },
    { overline:'EL RECELO · 08', title:'TIENE RAZÓN', body:'', duration:60000, marker:true, retitles:true },
    { overline:'DISEÑO · 09', title:'INCOMODAR, PERO BIEN', body:'', duration:90000, retitles:true, marker:true },
    { overline:'SQL · 10', title:'¿CÓMO LE ENSEÑAN SQL A JÓVENES NO TÉCNICOS?', body:'', duration:60000 },
    { overline:'PROCESO · 11', title:'ITERACIONES MÁS RÁPIDAS', body:'', duration:90000 },
    { overline:'HERRAMIENTAS · 12', title:'MÚLTIPLES HERRAMIENTAS PARA DIFERENTES TEMAS', body:'', duration:120000, titleMaxH:.34 },
    { overline:'DEKIDS · 13', title:'QUE SEA MÁS DEKIDS', body:'', duration:75000 },
    { overline:'DEKIDS · 14', title:'IMAGINAR ES LO MÁS PODEROSO QUE PODEMOS HACER', body:'', duration:150000, hideText:true, retitles:true }
  ],
  [
    { overline:'CIERRE · 01', title:'DEKIDS TAMBIÉN EMPEZÓ CON UN SUEÑO', body:'Todo gran viaje empieza cuando alguien se atreve a imaginarlo.', marker:false, duration:60000 },
    { overline:'CIERRE · 02', title:'EL CENTRO DE LANZAMIENTO', body:'', marker:true, duration:60000,
      launch:{ center:['Apps y webs', 'Modelos con impacto', 'Soluciones reales'], crew:['Restarts', 'Empresas', 'Escuelas'], caption:'Crean soluciones donde antes solo había problemas', at:[20000, 40000] },
      notes:'0:00 título grande · 0:20 el título se encoge y aparece el recuadro 1 · 0:40 aparece el recuadro 2. E repite la secuencia (acelerada).' },
    { overline:'CIERRE · 03', title:'LA TRIPULACIÓN', body:'No despegamos solos: las ideas mejoran cuando se construyen en equipo.', marker:true, duration:30000,
      crew:{ src:'media/tripulacion.jpg', alt:'La tripulación Dekids con sus playeras Restart', label:'TRIPULACIÓN DEKIDS' } },
    { overline:'CIERRE · 04', title:'UNIVERSO DEKIDS', body:'Pensar más lejos: emprendimiento, educación financiera, inteligencia artificial y tecnología.', marker:false, duration:40000 },
    { overline:'CIERRE · 05', title:'LANCEMOS TU SUEÑO HOY', body:'¿Qué hizo posible hoy convertir ese sueño en realidad con IA?', marker:true, hold:true, duration:15000,
      notes:'Sin tiempo: la escena se queda hasta que avances con la flecha →.' },
    { overline:'CIERRE · 06', title:'DOS MINUTOS', body:'Dale al botón para iniciar o reiniciar.', marker:true, hold:true, duration:120000, timer:{ seconds:120 },
      notes:'Botón en pantalla (o E) inicia y reinicia el temporizador. Avanza con → cuando termines.' },
    { overline:'CIERRE · 07', title:'TODOS SOMOS DEKIDSERS', body:'Hoy ya vivieron la experiencia de serlo.', marker:true, duration:10000 },
    { overline:'CIERRE · 08', title:'NUEVOS DEKIDSERS SOLO PUEDEN SURGIR DE CREAR COMUNIDAD', body:'', marker:false, duration:240000 },
    { overline:'CIERRE · 09', title:'HOY LO CONSTRUIMOS JUNTOS', body:'Dekids comenzó con un sueño. Porque el futuro no se espera: se crea juntos.', marker:true, hold:true, duration:30000, qrSlot:true,
      notes:'Espacio reservado para el QR. Para activarlo, agrega qr:{ url:\'https://…\', label:\'…\' } a esta escena en decks.js.' }
  ]
];

// `art` varía la decoración; `fx` (efecto de pantalla) se reserva para momentos clave más abajo.
const closingEffects = [
  ['rocket','rocket'], ['blueprint','orbit'], ['constellation','stars'], ['warp','stars'],
  ['countdown','rocket'], ['burst','stars'], ['celebrate','stars'], ['constellation','stars'], ['burst','stars']
];
decks[2].forEach((scene, index) => { [scene.fx, scene.art] = closingEffects[index]; });

// Momentos animados (ver moments.js): tachado, luna, avión de papel y consulta SQL escrita.
// `art` se pone en 'stars' donde el momento ya ocupa la pantalla.
const setMoment = (deck, index, fields) => Object.assign(decks[deck][index], fields);
// Deck 1 (El viaje a la luna): estética de sueño de niño (tema 'dream', ilustraciones en viaje.js).
decks[0].theme = 'dream';
setMoment(0, 0, { moment:'dream1' });
setMoment(0, 1, { moment:'dream2', illustration:true });
setMoment(0, 2, { moment:'plain' }); // solo texto
setMoment(0, 3, { moment:'dream4', illustration:true });
setMoment(0, 4, { moment:'dream5', illustration:true });
setMoment(0, 5, { moment:'dream6', illustration:true });
setMoment(0, 6, { moment:'dream7' });
// Deck 2 (Producto Dekids): mesa de trabajo con una hoja de papel; cada diapositiva tiene su animación (papel.js, papel2.js).
decks[1].solid = true; // fondo sólido: la red de moléculas no se ve entre diapositivas
// Tono café (mesa de madera) solo en las diapositivas 1 a 4; de la 5 en adelante: colores y estética neón de EduLab.
setMoment(1, 0, { moment:'papel1', theme:'table' });
setMoment(1, 1, { moment:'papel2', illustration:true, theme:'table', continues:true });
setMoment(1, 2, { moment:'papel3', illustration:true, theme:'table', continues:true });
setMoment(1, 3, { moment:'papel4', illustration:true, theme:'table', continues:true });
setMoment(1, 4, { moment:'papel5', art:'stars' });
setMoment(1, 5, { moment:'papel6', art:'stars' });
setMoment(1, 6, { moment:'papel7', theme:'horror', art:'stars' });
setMoment(1, 7, { moment:'papel8', art:'stars' });
setMoment(1, 8, { moment:'papel9', art:'stars' });
setMoment(1, 9, { moment:'plain', art:'stars' });
setMoment(1, 10, { moment:'papel11', theme:'blueprint', illustration:true, art:'stars' });
setMoment(1, 11, { moment:'papel12', captures:[], art:'stars' });
setMoment(1, 12, { moment:'papel13', art:'stars' });
setMoment(1, 13, { moment:'papel14', art:'stars' });
// Deck 3 (Cierre): centro de lanzamiento, tripulación (foto), universo, despegue, temporizador, comunidad y final con QR.
setMoment(2, 1, { moment:'launchcenter', art:'stars' });
setMoment(2, 2, { moment:'crew', art:'stars', illustration:true });
setMoment(2, 3, { moment:'universe', art:'stars', universe:{ core:['Confianza', 'Comunidad', 'Creatividad', 'Habilidades'], planets:['Emprendimiento', 'Educación financiera', 'Inteligencia artificial', 'Tecnología'] } });
setMoment(2, 4, { moment:'liftoff', art:'stars' });
setMoment(2, 5, { moment:'timer', art:'stars' });
setMoment(2, 7, { moment:'community', art:'stars' });
setMoment(2, 8, { moment:'finale', art:'stars' });

// Solo los momentos clave llevan efecto de pantalla; el resto usa la transición base (palabras + salida).
const keyMoments = [
  {}, // deck 1: sin efectos de pantalla, cada escena trae su ilustración
  { 7:'constellation', 9:'warp' }, // deck 2: cada escena trae su animación; las de solo texto llevan un efecto neón
  { 0:'warp', 1:'blueprint', 6:'celebrate' } // el resto lleva su propio momento (cierre.js)
];
decks.forEach((deck, d) => deck.forEach((scene, i) => { scene.fx = keyMoments[d][i] || 'fade'; }));

// Nombres para el operador (teclas 1, 2, 3).
const deckNames = ['El viaje a la luna', 'Producto Dekids', 'Cierre'];
