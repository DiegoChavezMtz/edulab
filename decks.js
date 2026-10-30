// Deck 1: El viaje a la luna (7 diapositivas, 15 min). Deck 2: Producto Dekids. Deck 3: Cierre.
const decks = [
  [
    { overline:'EL VIAJE A LA LUNA · 01', title:'¿A QUÉ LUNA VAS A VIAJAR HOY?', body:'Mañana nos vamos a la luna.', marker:true, duration:120000 },
    { overline:'EL NIÑO INTERIOR · 02', title:'EL NIÑO INTERIOR Y LA CARGA DE LA DUDA', body:'Un adulto pide presupuesto, riesgos y razones para no ir. Un niño agarra su mochila para empacar.', marker:true, duration:90000 },
    { overline:'EL SEÑOR “HACER AMIGOS” · 03', title:'EL SEÑOR “HACER AMIGOS”', body:'Mi superpoder es hablar, conectar y escuchar a quien sea, de lo que sea. Romper barreras en un segundo.', marker:true, duration:120000 },
    { overline:'HISTORIA DE ORIGEN · 04', title:'¿CUÁL ES SU HISTORIA DE ORIGEN?', body:'Piensa en eso que te sale natural, disfrutas tanto que no parece trabajo o transforma los lugares a los que llegas. Di tu nombre de superhéroe y el momento en que descubriste tu poder.', marker:true, duration:210000 },
    { overline:'MENTALIDAD DEKIDS · 05', title:'LA MENTALIDAD DEKIDS Y TU SUEÑO SIN LÍMITES', body:'Para un niño, el mundo es un lienzo donde toda aventura puede hacerse realidad. Hoy venimos a recuperar esa chispa.', marker:true, duration:210000 },
    { overline:'IDEAS QUE VUELAN · 06', title:'EL PODER DE LAS IDEAS QUE VUELAN', body:'Escribe tu superpoder y ese objetivo imposible. Dóblalo, constrúyelo y a la cuenta de tres: ¡háganlos volar!', marker:true, duration:90000 },
    { overline:'¡A LA LUNA! · 07', title:'¡A LA LUNA!', body:'Deja la prudencia excesiva y los pretextos en la puerta. Si decidimos ir a la luna, empacamos la mochila y nos vamos.', marker:true, duration:60000 }
  ],
  [
    { overline:'DIEGO · PRODUCTOS DEKIDS · 01', title:'IMPOSIBLE', body:'¿Cuánto tarda en construirse una herramienta educativa de verdad? ¿Un juego, una plataforma, algo con IA adentro?', marker:false, duration:45000 },
    { overline:'GESTIÓN · RESTART · 02', title:'CONSTRUIMOS TODO ESTO EN UNA NOCHE', body:'Cada herramienta nació la noche antes de usarla con jóvenes reales. Lo imposible cambia cuando cambias dónde está la dificultad.', marker:true, duration:45000 },
    { overline:'GESTIÓN · RESTART · 03', title:'RESTART: LA GESTIÓN QUE ANTICIPA', body:'Evalúa el avance de cada joven, detecta patrones y orienta de forma preventiva. La IA propone; el equipo revisa y conversa.', marker:false, duration:45000 },
    { overline:'HERRAMIENTAS PARA APRENDER · 04', title:'NO VIDEOS. HERRAMIENTAS.', body:'No queremos que un joven solo mire. Queremos que haga algo.', marker:true, duration:45000 },
    { overline:'DETECTIVES SQL · 05', title:'UN SELECT ES UNA PISTA', body:'Un WHERE es un interrogatorio. Un JOIN une testimonios. Resolver un caso convierte aprender SQL en querer saber quién fue.', marker:true, duration:45000 },
    { overline:'MOKI · 06', title:'CREAR AGENTES, NO SOLO USARLOS', body:'Entender qué instrucciones reciben, qué pasos siguen y por qué a veces fallan. Cuando construyes uno, deja de parecer magia.', marker:false, duration:45000 },
    { overline:'LANDING MAKER · 07', title:'SE APRENDE ARMANDO', body:'Encabezado, llamado a la acción, orden de una oferta: la estructura de una página se entiende al construirla.', marker:false, duration:45000 },
    { overline:'SOFÍA · CIBERSEGURIDAD · 08', title:'CADA DECISIÓN TIENE CONSECUENCIAS', body:'Una novela visual para entender phishing: le pasa a Sofía y tú decides qué hacer.', marker:true, duration:45000 },
    { overline:'APRENDER · 09', title:'UN VIDEO SE VE. ESTO SE VIVE.', body:'Las herramientas responden, se adaptan y acompañan: aprendizaje autónomo y también guiado.', marker:true, duration:45000 },
    { overline:'EL PROBLEMA · 10', title:'LA IA NO VA AL LADO', body:'Las plataformas genéricas sirven para todos y por eso no sirven bien para nadie. La IA tiene que estar dentro de la experiencia.', marker:false, duration:45000 },
    { overline:'TEASER · 11', title:'EL SIGUIENTE RETO: FINANZAS PERSONALES', body:'Si funciona para aprender SQL con detectives, ¿funcionará con el tema que todos sabemos que deberíamos dominar?', marker:true, duration:45000 },
    { overline:'LECCIONES · 12', title:'3 COSAS QUE APRENDIMOS', body:'Construyendo herramientas educativas, una noche a la vez.', marker:false, duration:45000 },
    { overline:'LECCIÓN 01 · 13', title:'LA IA MOVIÓ EL CUELLO DE BOTELLA', body:'Antes lo caro era construir. Hoy lo caro es saber qué construir. La velocidad del código no reemplaza tener claridad.', marker:false, duration:45000 },
    { overline:'LECCIÓN 02 · 14', title:'LA IMAGINACIÓN ES HUMANA', body:'La IA devuelve lo promedio. Las personas entendemos qué le duele, qué aburre y qué emociona a quien aprende.', marker:true, duration:45000 },
    { overline:'LECCIÓN 03 · 15', title:'UN EQUIPO CHICO PUEDE PIVOTAR', body:'Los detectives empezaron como un minijuego tipo RPG; al probarlos con jóvenes se volvieron otra cosa. Cambiamos entre sesiones.', marker:false, duration:45000 },
    { overline:'CIERRE · 16', title:'LO IMPOSIBLE AHORA ES IMAGINAR BIEN', body:'Entender a la persona del otro lado y atrevernos a cambiar de rumbo cuando algo no funciona.', marker:true, duration:45000 }
  ],
  [
    { overline:'CIERRE · 01', title:'DEKIDS TAMBIÉN EMPEZÓ CON UN SUEÑO', body:'Todo gran viaje empieza cuando alguien se atreve a imaginarlo.', marker:false, duration:45000 },
    { overline:'CIERRE · 02', title:'¿CONSUMIDORES O CREADORES?', body:'Vivimos avances exponenciales: tecnología, inteligencia artificial y futuro. La pregunta es qué elegimos hacer con ellos.', marker:true, duration:45000,
      poll:{ options:['Consumidores','Creadores'], caption:'Conteo en vivo' }, notes:'Registra los votos con +1 en la vista de presentador (P).' },
    { overline:'CIERRE · 03', title:'LA TRIPULACIÓN', body:'No despegamos solos. Somos personas que hacen mejores las ideas cuando las construyen en equipo.', marker:false, duration:45000 },
    { overline:'CIERRE · 04', title:'CENTRO DE LANZAMIENTO', body:'Apps y webs · Modelos con impacto · Soluciones reales.', marker:true, duration:45000 },
    { overline:'CIERRE · 05', title:'NUEVA GENERACIÓN DE TRIPULANTES', body:'Restarts, empresas y escuelas: crean soluciones donde antes solo había problemas.', marker:false, duration:45000 },
    { overline:'CIERRE · 06', title:'SUMARSE A LA MISIÓN', body:'¿Quién más se atreve a despegar?', marker:true, duration:45000 },
    { overline:'CIERRE · 07', title:'LANCEMOS TU SUEÑO HOY', body:'¿Qué hizo posible hoy convertir ese sueño en realidad con IA?', marker:true, duration:45000 },
    { overline:'CIERRE · 08', title:'TODOS SOMOS DEKIDZERS', body:'Hoy ya vivieron la experiencia de serlo.', marker:true, duration:45000 },
    { overline:'CIERRE · 09', title:'HECHO EN DEKIDS', body:'Ejemplos reales de sitios web, presentaciones y materiales interactivos.', marker:false, duration:45000 },
    { overline:'CIERRE · 10', title:'UNIVERSO DEKIDS', body:'Pensar más lejos: emprendimiento, educación financiera, inteligencia artificial y tecnología. Núcleo: confianza, comunidad, creatividad y habilidades.', marker:false, duration:45000 },
    { overline:'CIERRE · 11', title:'NUEVOS DEKIDZERS, CREAR COMUNIDAD', body:'Solo pueden surgir de crear: comunidad.', marker:true, duration:45000 },
    { overline:'CIERRE · 12', title:'RETO DE CIERRE: SUPERPODERES', body:'Encuentra a alguien cuyo superpoder complemente el tuyo.', marker:true, duration:45000 },
    { overline:'CIERRE · 13', title:'HOY LO CONSTRUIMOS JUNTOS', body:'Dekids comenzó con un sueño. Porque el futuro no se espera: se crea juntos. Sala de Reserva.', marker:false, duration:45000 }
  ]
];

// `art` varía la decoración; `fx` (efecto de pantalla) se reserva para momentos clave más abajo.
const closingEffects = [
  ['rocket','rocket'], ['warp','stars'], ['constellation','stars'], ['blueprint','orbit'],
  ['lift','rocket'], ['orbit','orbit'], ['countdown','rocket'], ['celebrate','stars'],
  ['blueprint','orbit'], ['constellation','stars'], ['celebrate','stars'], ['burst','rocket'], ['warp','rocket']
];
decks[2].forEach((scene, index) => { [scene.fx, scene.art] = closingEffects[index]; });
const productEffects = [
  ['warp','stars'], ['rocket','rocket'], ['blueprint','orbit'], ['burst','stars'],
  ['countdown','rocket'], ['constellation','stars'], ['blueprint','orbit'], ['orbit','rocket'],
  ['celebrate','stars'], ['blueprint','orbit'], ['rocket','rocket'], ['burst','stars'],
  ['countdown','orbit'], ['constellation','stars'], ['lift','rocket'], ['warp','rocket']
];
decks[1].forEach((scene, index) => { [scene.fx, scene.art] = productEffects[index]; });

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
// Deck 3 (Cierre): despegue, contador de manos, universo y final.
setMoment(2, 5, { moment:'counter', counter:{ label:'Manos levantadas' }, art:'stars' });
setMoment(2, 6, { moment:'liftoff', art:'stars' });
setMoment(2, 9, { moment:'universe', art:'stars', universe:{ core:['Confianza', 'Comunidad', 'Creatividad', 'Habilidades'], planets:['Emprendimiento', 'Educación financiera', 'Inteligencia artificial', 'Tecnología'] } });
setMoment(2, 12, { moment:'finale', art:'stars' });
setMoment(1, 0, { moment:'strike', strike:{ part:'IM', word:'IMPOSIBLE' } });
setMoment(1, 4, { code:'SELECT nombre\nFROM sospechosos\nWHERE coartada IS NULL;' });

// Solo los momentos clave llevan efecto de pantalla; el resto usa la transición base (palabras + salida).
const keyMoments = [
  {}, // deck 1: sin efectos de pantalla, cada escena trae su ilustración
  { 0:'warp', 1:'burst', 10:'countdown', 15:'burst' },
  { 0:'warp', 3:'blueprint', 7:'celebrate' } // 7 y 13 llevan su propio momento (cierre.js)
];
decks.forEach((deck, d) => deck.forEach((scene, i) => { scene.fx = keyMoments[d][i] || 'fade'; }));

// Nombres para el operador (teclas 1, 2, 3).
const deckNames = ['El viaje a la luna', 'Producto Dekids', 'Cierre'];
