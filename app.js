const canvas = document.getElementById('reef');
const ctx = canvas.getContext('2d');
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let width, height, dpr, time = 0, paused = false;
let nodes = [];
const bgPulse = { energy: 0, ring: 1 }; // lo anima pulseBackground() al cambiar de escena

function setup() {
  dpr = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth; height = window.innerHeight;
  canvas.width = width * dpr; canvas.height = height * dpr;
  canvas.style.width = width + 'px'; canvas.style.height = height + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.min(125, Math.round(width / 15));
  nodes = Array.from({length: count}, (_, i) => {
    const side = i % 2 ? 1 : -1;
    const edge = Math.pow(Math.random(), .63) * .46 + .09;
    return { x: width * (.5 + side * edge), y: Math.random() * height, r: Math.random() * 2 + .5,
      drift: (Math.random()-.5) * .0009, phase: Math.random()*Math.PI*2, hue: Math.random()>.43 ? 69 : 220,
      speed: Math.random()*.55+.18 };
  });
}
function draw(t) {
  if (!paused) time = t * .001;
  const boost = 1 + bgPulse.energy * .7;
  ctx.clearRect(0,0,width,height);
  const bg = ctx.createRadialGradient(width*.5,height*.48,0,width*.5,height*.5,Math.max(width,height)*.72);
  bg.addColorStop(0,'#071427'); bg.addColorStop(.38,'#050b16'); bg.addColorStop(1,'#01040b'); ctx.fillStyle=bg;ctx.fillRect(0,0,width,height);
  const positions=[];
  for (const n of nodes) {
    const y = n.y + Math.sin(time*n.speed+n.phase)*26;
    const x = n.x + Math.sin(time*.37+n.phase)*width*.018 + Math.cos(time*.21+n.phase)*width*n.drift*100;
    positions.push({x,y,n});
  }
  ctx.lineWidth=.7;
  for(let i=0;i<positions.length;i++) for(let j=i+1;j<positions.length;j++) {
    const a=positions[i],b=positions[j], dx=a.x-b.x,dy=a.y-b.y,dist=Math.hypot(dx,dy);
    if(dist<145) { const alpha=Math.min(.6,(1-dist/145)*.19*(1+bgPulse.energy*1.6)); ctx.strokeStyle=`hsla(${a.n.hue},100%,60%,${alpha})`;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke(); }
  }
  for (const {x,y,n} of positions) { const glow=ctx.createRadialGradient(x,y,0,x,y,n.r*7*boost); glow.addColorStop(0,`hsla(${n.hue},100%,62%,.94)`);glow.addColorStop(1,`hsla(${n.hue},100%,55%,0)`);ctx.fillStyle=glow;ctx.beginPath();ctx.arc(x,y,n.r*7*boost,0,Math.PI*2);ctx.fill(); }
  if (bgPulse.ring < 1) {
    ctx.strokeStyle = `hsla(69,100%,60%,${(1 - bgPulse.ring) * .22})`; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(width * .5, height * .5, bgPulse.ring * Math.max(width, height) * .62, 0, Math.PI * 2); ctx.stroke();
  }
  if(!reduceMotion) requestAnimationFrame(draw);
}
window.addEventListener('resize',setup); setup(); requestAnimationFrame(draw);
document.querySelector('.sound-toggle').addEventListener('click', (e) => { paused=!paused; e.currentTarget.setAttribute('aria-pressed',paused); e.currentTarget.innerHTML = paused ? 'MOTION <span>OFF</span>' : 'MOTION <span>ON</span>'; if(!paused) requestAnimationFrame(draw); });

const stage = document.querySelector('.stage');
const show = document.querySelector('.show');
const operatorToggle = document.querySelector('.operator-toggle');
const operatorPanel = document.querySelector('.operator-panel');
let activeDeck = null, activeScene = 0, showTimer = null, countdownInterval = null, showPaused = false;
let sceneStartedAt = 0, sceneRemaining = 0, deckStartedAt = 0, mode = 'auto';
const STORAGE_KEY = 'edulab-stage-position';
const MODE_KEY = 'edulab-stage-mode';
const VOTES_KEY = 'edulab-stage-votes';
let votes = {};
try { votes = JSON.parse(localStorage.getItem(VOTES_KEY) || '{}'); } catch {}
const channel = 'BroadcastChannel' in window ? new BroadcastChannel('edulab-stage') : null;
try { if (localStorage.getItem(MODE_KEY) === 'manual') mode = 'manual'; } catch {}

// ---- Extras por escena: media, QR y votación manual.
const voteKey = () => `${activeDeck}:${activeScene}`;
function sceneVotes(scene) { return votes[voteKey()] || (votes[voteKey()] = Array(scene.poll ? scene.poll.options.length : 1).fill(0)); }
function escapeHtml(text) { return String(text).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c])); }
function renderPoll(scene) {
  const counts = sceneVotes(scene), total = counts.reduce((a, b) => a + b, 0);
  const box = document.getElementById('showExtra');
  let poll = box.querySelector('.poll');
  if (!poll) {
    box.innerHTML = `<div class="poll">${scene.poll.options.map((label) => `<div class="poll-row"><div class="poll-head"><span>${escapeHtml(label)}</span><b>0</b></div><div class="poll-track"><i></i></div></div>`).join('')}</div>` + (scene.poll.caption ? `<div class="extra-caption">${escapeHtml(scene.poll.caption)}</div>` : '');
    poll = box.querySelector('.poll');
  }
  poll.querySelectorAll('.poll-row').forEach((row, i) => {
    moments.countTo(row.querySelector('b'), counts[i], reduceMotion);
    row.classList.toggle('leader', total > 0 && counts[i] === Math.max(...counts) && counts.filter((c) => c === counts[i]).length === 1);
    row.querySelector('i').style.width = total ? `${(counts[i] / total) * 100}%` : '0';
  });
}
// Contador de manos: número gigante que rebota; cada aumento lanza un cohete por la pantalla.
function renderCounter(scene) {
  const box = document.getElementById('showExtra');
  let counter = box.querySelector('.counter');
  if (!counter) {
    box.innerHTML = `<div class="counter"><b>0</b><span>${escapeHtml(scene.counter.label)}</span></div>`;
    counter = box.querySelector('.counter');
  }
  const number = counter.querySelector('b'), next = sceneVotes(scene)[0], previous = Number(number.dataset.v || 0);
  moments.countTo(number, next, reduceMotion);
  if (next > previous && !reduceMotion) moments.launchMini?.();
}
function renderExtra(scene) {
  const box = document.getElementById('showExtra');
  const media = scene.media, qr = scene.qr;
  show.classList.toggle('has-extra', Boolean(media || qr || scene.poll || scene.code || scene.counter || scene.universe || scene.illustration || scene.timer || scene.qrSlot)); // scene.launch: el momento activa has-extra a mitad de la escena
  show.classList.toggle('wide-extra', Boolean(scene.universe)); // el universo ocupa la mayor parte de la pantalla
  if (scene.poll) { box.innerHTML = ''; renderPoll(scene); return; }
  if (scene.counter) { box.innerHTML = ''; renderCounter(scene); return; }
  if (scene.universe || scene.illustration || scene.launch || scene.timer) { box.innerHTML = ''; return; } // lo construye moments (cierre.js / viaje.js)
  const caption = (text) => text ? `<div class="extra-caption">${escapeHtml(text)}</div>` : '';
  if (scene.qrSlot && !qr) {                       // espacio reservado para el QR (agrega qr:{ url, label } a la escena para activarlo)
    box.innerHTML = '<div class="qr-box"><img src="media/qr.png" alt="QR" /></div>';
  } else if (qr) {
    box.innerHTML = `<div class="qr-box">${moments.qrSvg(qr.url, !reduceMotion)}</div><div class="qr-url">${escapeHtml(qr.label || qr.url)}</div>`;
  } else if (scene.code) {
    box.innerHTML = '<pre class="code-box"><code id="codeOut"></code><i class="caret"></i></pre>';
  } else if (media) {
    const src = escapeHtml(media.src);
    const tag = media.type === 'video' ? `<video src="${src}" autoplay muted loop playsinline></video>`
      : media.type === 'iframe' ? `<iframe src="${src}" title="${escapeHtml(media.caption || 'Demo')}" loading="eager" sandbox="allow-scripts allow-same-origin"></iframe>`
      : `<img src="${src}" alt="${escapeHtml(media.caption || '')}" />`;
    box.innerHTML = tag + caption(media.caption);
  } else box.innerHTML = '';
}
function vote(optionIndex, delta) {
  if (activeDeck === null) return;
  const scene = decks[activeDeck][activeScene];
  const options = scene.poll ? scene.poll.options : scene.counter ? [scene.counter.label] : null;
  if (!options || !options[optionIndex]) return;
  const counts = sceneVotes(scene);
  counts[optionIndex] = Math.max(0, counts[optionIndex] + delta);
  try { localStorage.setItem(VOTES_KEY, JSON.stringify(votes)); } catch {}
  scene.poll ? renderPoll(scene) : renderCounter(scene); publish();
}
function resetVotes() {
  if (activeDeck === null || !(decks[activeDeck][activeScene].poll || decks[activeDeck][activeScene].counter)) return;
  delete votes[voteKey()];
  try { localStorage.setItem(VOTES_KEY, JSON.stringify(votes)); } catch {}
  const current = decks[activeDeck][activeScene];
  current.poll ? renderPoll(current) : renderCounter(current); publish();
}

function sceneDuration() { return decks[activeDeck][activeScene].duration || 4200; }
function savePosition() {
  try { activeDeck === null ? localStorage.removeItem(STORAGE_KEY) : localStorage.setItem(STORAGE_KEY, JSON.stringify({ deck: activeDeck, scene: activeScene, startedAt: deckStartedAt })); } catch {}
}
function clearShowTimer() { if (showTimer) clearTimeout(showTimer); if (countdownInterval) clearInterval(countdownInterval); showTimer = null; countdownInterval = null; }
// hold: la escena no tiene tiempo; se queda hasta que el orador avance (flecha →, clicker o click).
const isHold = () => activeDeck !== null && Boolean(decks[activeDeck][activeScene]?.hold);
function armTimer(ms) { clearShowTimer(); sceneRemaining = ms; sceneStartedAt = performance.now(); if (mode === 'auto' && !isHold()) showTimer = setTimeout(nextScene, ms); }
function timeLeft() { return isHold() ? 0 : mode === 'auto' && !showPaused && activeDeck !== null ? Math.max(0, sceneRemaining - (performance.now() - sceneStartedAt)) : sceneRemaining; }
function renderCountdown(scene) {
  const label = document.getElementById('showTimer');
  label.classList.toggle('active', Boolean(scene.countdown));
  if (!scene.countdown) { label.textContent = ''; return; }
  const update = () => {
    const seconds = Math.ceil(timeLeft() / 1000);
    label.textContent = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;
    moments.tick(label, seconds, reduceMotion);
  };
  update();
  countdownInterval = setInterval(update, 250);
}

function updateTag() {
  const tag = document.querySelector('.system-tag');
  tag.innerHTML = activeDeck === null ? '<i></i> LIVE / STANDBY' : `<i></i> LIVE / ${showPaused ? 'PAUSED' : 'PLAYING'} · ${mode === 'auto' ? 'AUTO' : 'MANUAL'}`;
}
function publish() {
  channel?.postMessage({ type: 'state', state: {
    deck: activeDeck, scene: activeScene, paused: showPaused, mode, hold: isHold(), remaining: activeDeck === null ? 0 : timeLeft(), startedAt: deckStartedAt,
    votes: activeDeck === null ? null : votes[voteKey()] || null
  } });
}
// ---- Animación (Anime.js). El reloj real es performance.now() + setTimeout (no se detiene si la ventana
// queda tapada); Anime solo dibuja: la entrada de la escena, la salida y la barra de progreso.
const { animate, createTimeline, splitText, stagger, utils } = anime;
const progressFill = document.getElementById('progressFill');
const EXIT_MS = 260;
let swapTimer = null, shown = false;
let split = null, entryTl = null, exitAnims = [], progressAnim = null;

// Pulso: cada cambio de escena enciende un instante la red de moléculas y lanza un anillo desde el centro.
function pulseBackground(strength = 1) {
  if (reduceMotion) return;
  animate(bgPulse, { energy: [strength, 0], duration: 1400, ease: 'outExpo' });
  animate(bgPulse, { ring: [0, 1], duration: 1700, ease: 'outQuad' });
}

// Pantalla de espera: el logotipo entra (letras, pincelada que se dibuja, firma) y luego "respira".
let heroSplit = null, heroTl = null, heroBreath = null;
function stopHero() { heroTl?.cancel(); heroBreath?.cancel(); heroTl = heroBreath = null; }
function playHero() {
  stopHero();
  if (reduceMotion) return;
  heroSplit?.revert();
  heroSplit = splitText('.edu', { chars: true });
  const wipeFrom = 'inset(-20% 100% -20% -5%)', wipeTo = 'inset(-20% -5% -20% -5%)';
  utils.set(['.eyebrow', '.byline', '.status', '.brush span', heroSplit.chars], { opacity: 0 });
  utils.set('.brush-wrap', { clipPath: wipeFrom });
  utils.set('.wordmark', { scale: 1 });
  heroTl = createTimeline({ defaults: { ease: 'outExpo' } })
    .add('.eyebrow', { opacity: [0, 1], y: [14, 0], duration: 700 }, 100)
    .add(heroSplit.chars, { opacity: [0, 1], y: ['.35em', 0], scale: [.9, 1], duration: 900, delay: stagger(60) }, 250)
    .add('.brush-wrap', { clipPath: [wipeFrom, wipeTo], duration: 900, ease: 'inOutQuart' }, 650)
    .add('.brush span', { opacity: [0, 1], duration: 500 }, 1100)
    .add('.byline', { opacity: [0, 1], y: [12, 0], duration: 600 }, 1300)
    .add('.status', { opacity: [0, 1], y: [12, 0], duration: 600 }, 1500);
  heroBreath = animate('.wordmark', { scale: [1, 1.012], duration: 4200, delay: 2400, loop: true, alternate: true, ease: 'inOutSine' });
}

function stopSceneAnimations() { entryTl?.cancel(); exitAnims.forEach((a) => a.cancel()); exitAnims = []; }
function sceneNodes() { return { overline: document.getElementById('showOverline'), body: document.getElementById('showBody'), extra: document.getElementById('showExtra') }; }
function playEntry(scene) {
  const { overline, body, extra } = sceneNodes();
  const chars = split.chars;
  stopSceneAnimations();
  if (reduceMotion) { utils.set([overline, body, extra, chars], { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }); moments.start(scene, momentCtx(scene, true)); return; }
  utils.set([overline, body, extra, chars], { opacity: 0 });
  entryTl = createTimeline({ defaults: { ease: 'outExpo' } });
  if (!scene.holdTitle) {                       // holdTitle: el texto lo revela el momento (ctx.reveal / ctx.revealWord)
    const gap = Math.min(32, 700 / Math.max(1, chars.length));
    entryTl
      .add(overline, { opacity: [0, 1], y: [16, 0], duration: 500 }, 0)
      .add(chars, titleIn(scene, gap), 100)
      .add(body, { opacity: [0, 1], y: [16, 0], duration: 600 }, 500);
  }
  entryTl.add(extra, { opacity: [0, 1], y: [24, 0], duration: 700 }, 650);
  moments.start(scene, momentCtx(scene, false));
}
const titleIn = (scene, gap) => scene.marker
  ? { opacity: [0, 1], y: ['-.6em', 0], rotate: { from: (el, i) => ((i * 37) % 29) - 14, to: 0 }, duration: 750, ease: 'outBack(2.2)', delay: stagger(gap) }
  : { opacity: [0, 1], y: ['.5em', 0], scale: [.92, 1], duration: 650, delay: stagger(gap) };

// ---- Título dinámico: pintar, revelar por partes y cambiar de frase (usado por los momentos).
function paintTitle(scene, text = scene.title) {
  const title = document.getElementById('showTitle');
  split?.revert();
  title.textContent = text;
  title.className = `${scene.marker ? 'marker ' : ''}${text.length > 26 ? 'long-title' : ''}`;
  split = splitText(title, { words: true, chars: true });
  return title;
}
// parts: cualquiera de 'overline', 'chars', 'body'; words: índices de palabras a revelar (si no, todos los caracteres)
function revealTitle(scene, { parts = ['overline', 'chars', 'body'], words = null } = {}) {
  const { overline, body } = sceneNodes();
  if (parts.includes('overline')) animate(overline, { opacity: [0, 1], y: [16, 0], duration: 500, ease: 'outExpo' });
  if (parts.includes('chars') && split) {
    const chars = words ? words.flatMap((i) => [...(split.words[i]?.querySelectorAll('[data-char]') || [])]) : split.chars;
    animate(chars, { ...titleIn(scene, Math.min(32, 700 / Math.max(1, chars.length))), delay: stagger(Math.min(32, 700 / Math.max(1, chars.length))) });
  }
  if (parts.includes('body')) animate(body, { opacity: [0, 1], y: [16, 0], duration: 600, delay: 300, ease: 'outExpo' });
}
let retitleTimer = null;
// Cambia la frase: las letras actuales se disuelven hacia arriba y entra la nueva. hold: la nueva queda oculta para que el momento la revele.
function retitle(scene, text, { hold = false, exit = true } = {}) {
  clearTimeout(retitleTimer);
  const old = exit ? (split?.chars || []) : [];                 // exit:false → el momento ya animó la salida y el cambio es inmediato
  if (old.length && !reduceMotion) animate(old, { opacity: 0, y: '-.35em', rotate: () => utils.random(-12, 12), duration: 320, ease: 'in(2)', delay: stagger(Math.min(14, 220 / old.length), { from: 'random' }) });
  retitleTimer = setTimeout(() => {
    const title = paintTitle(scene, text);
    fitTitle(title);
    utils.set(split.chars, { opacity: 0 });
    if (!hold) revealTitle(scene, { parts: ['chars'] });
  }, old.length && !reduceMotion ? 420 : 0);
}
function showSceneText(scene, text) {
  show.classList.remove('no-text'); show.classList.add('has-extra');
  utils.set(document.getElementById('showOverline'), { opacity: 0 });
  retitle(scene, text, { exit: false });
  revealTitle(scene, { parts: ['overline'] });
}
const momentCtx = (scene, reduce) => ({
  split, reduce, continuing: Boolean(scene.continues), getSplit: () => split,
  reveal: (opts) => revealTitle(scene, opts), retitle: (text, opts) => retitle(scene, text, opts), showText: (text) => showSceneText(scene, text)
});
function playExit(next) {
  const { overline, body, extra } = sceneNodes();
  stopSceneAnimations();
  if (reduceMotion || !split) return;
  if (!next?.continues) moments.fade();                  // si la siguiente escena continúa el mismo fondo (mesa), no se funde la capa: así no hay corte
  const chars = split.chars;
  exitAnims = [
    animate(chars, { opacity: 0, y: '-.25em', duration: 180, ease: 'in(2)', delay: stagger(Math.min(8, 70 / chars.length), { from: 'last' }) }),
    animate([overline, body, extra], { opacity: 0, y: -12, duration: 180, ease: 'in(2)' })
  ];
}
// La barra se dibuja con Anime pero se sincroniza con el reloj real (pausa, reanudar, cambio de modo, pestaña oculta).
function syncProgress() { progressAnim?.seek(sceneDuration() - timeLeft()); }
function startProgress() {
  progressAnim?.cancel(); progressAnim = null;
  if (mode === 'manual' || isHold()) { utils.set(progressFill, { scaleX: 1 }); return; }
  utils.set(progressFill, { scaleX: 0 });
  progressAnim = animate(progressFill, { scaleX: [0, 1], duration: sceneDuration(), ease: 'linear', autoplay: false });
  syncProgress();
  if (!showPaused) progressAnim.play();
}
document.addEventListener('visibilitychange', () => { if (!document.hidden && !showPaused) syncProgress(); });

function standby() {
  clearTimeout(swapTimer); shown = false; stopSceneAnimations(); moments.clear(); setBackdrop(null); progressAnim?.cancel(); progressAnim = null;
  clearShowTimer(); activeDeck = null; activeScene = 0; showPaused = false;
  stage.classList.remove('presenting'); show.classList.remove('active','running','paused'); show.setAttribute('aria-hidden','true');
  document.getElementById('showExtra').innerHTML = ''; show.classList.remove('has-extra');
  updateTag(); savePosition(); publish();
  playHero();
}
// Los títulos se achican hasta caber (máx. ~58% del alto y sin que una palabra se salga del ancho).
function fitTitle(title) {
  title.style.fontSize = '';
  const scene = activeDeck !== null ? decks[activeDeck][activeScene] : null;
  const maxHeight = innerHeight * (scene?.titleMaxH || .58);                       // escenas con bandas arriba/abajo (p. ej. carruseles) reservan menos alto
  let size = parseFloat(getComputedStyle(title).fontSize);
  const maxWidth = innerWidth * (show.classList.contains("wide-extra") ? .26 : show.classList.contains("has-extra") ? .44 : .8);
  const widest = () => Math.max(0, ...[...title.querySelectorAll(':scope > [data-word]')].map((w) => w.getBoundingClientRect().width));
  for (let i = 0; i < 16 && (title.offsetHeight > maxHeight || widest() > maxWidth) && size > 28; i++) { size *= .93; title.style.fontSize = `${size}px`; }
}
// Re-ajusta el título cuando termina de cargar una fuente o cambia el tamaño de la ventana (p. ej. al pasar a pantalla completa con F).
let refitTimer = null;
let lastSize = [innerWidth, innerHeight];
const refitTitle = () => { clearTimeout(refitTimer); refitTimer = setTimeout(() => { if (activeDeck !== null && shown) fitTitle(document.getElementById('showTitle')); }, 120); };
// Las ilustraciones se dibujan con el tamaño de pantalla del momento en que empiezan: si la pantalla cambia de tamaño, se vuelven a dibujar para que nada quede descentrado o cortado.
let resizeTimer = null;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => {
    if ([innerWidth, innerHeight].every((v, i) => Math.abs(v - lastSize[i]) < 2)) return;
    lastSize = [innerWidth, innerHeight];
    if (activeDeck !== null && shown) { fitTitle(document.getElementById('showTitle')); replayMoment(); }
  }, 350);
});
window.addEventListener('resize', refitTitle);
document.fonts?.addEventListener?.('loadingdone', refitTitle);
document.fonts?.ready.then(refitTitle);

// Fondo sólido con doble búfer: el tema nuevo se funde sobre el anterior (la red de moléculas no se asoma entre diapositivas).
let backdropKey = null, backdropTimer = null;
function setBackdrop(key) {
  const box = document.getElementById('showBackdrop'), [a, b] = box.children;
  show.toggleAttribute('data-solid', Boolean(key));
  if (key === backdropKey) return;
  backdropKey = key;
  clearTimeout(backdropTimer);
  if (!key) { [a, b].forEach((el) => { el.classList.remove('on'); el.style.zIndex = ''; }); return; }
  const [cur, next] = a.classList.contains('on') ? [a, b] : [b, a];
  // el fondo nuevo se funde ENCIMA del anterior, que se mantiene opaco hasta que termina: nunca queda translúcido (no se asoma la red de moléculas)
  next.dataset.bd = key; cur.style.zIndex = 1; next.style.zIndex = 2; void next.offsetWidth;
  next.classList.add('on');
  backdropTimer = setTimeout(() => { cur.style.transition = 'none'; cur.classList.remove('on'); void cur.offsetWidth; cur.style.transition = ''; }, 760);
}
// Pinta el contenido de la escena; el título entra palabra por palabra (--i controla el retraso).
function paintScene(scene) {
  shown = true; moments.clear();
  show.dataset.theme = scene.theme || decks[activeDeck].theme || '';
  setBackdrop(decks[activeDeck].solid ? (scene.theme || 'neon') : null);
  show.classList.toggle('no-text', Boolean(scene.hideText));
  show.dataset.fx = scene.fx || 'fade';
  show.dataset.art = scene.art || 'rocket';
  document.getElementById('showNumber').textContent = String(activeDeck + 1).padStart(2,'0');
  document.getElementById('showOverline').textContent = scene.overline;
  const title = paintTitle(scene);
  document.getElementById('showBody').textContent = scene.body;
  document.getElementById('sceneIndex').textContent = String(activeScene + 1).padStart(2,'0');
  document.getElementById('sceneTotal').textContent = String(decks[activeDeck].length).padStart(2,'0');
  show.style.setProperty('--scene-duration', `${sceneDuration()}ms`);
  show.classList.toggle('manual', mode === 'manual' || Boolean(scene.hold));
  renderExtra(scene);
  fitTitle(title); // después de renderExtra: el ancho disponible depende de si hay columna extra
  show.classList.remove('reveal','running'); void show.offsetWidth; show.classList.add('reveal','running');
  pulseBackground(shown ? .8 : 1);
  playEntry(scene);
  startProgress();
}
// Los tiempos arrancan de inmediato; si ya había una escena en pantalla, sale (EXIT_MS) antes de que entre la nueva.
function renderScene() {
  clearTimeout(swapTimer);
  const scene = decks[activeDeck][activeScene];
  showPaused = false; show.classList.remove('paused');
  armTimer(sceneDuration());
  renderCountdown(scene);
  if (shown) { playExit(scene); swapTimer = setTimeout(() => paintScene(scene), EXIT_MS); }
  else paintScene(scene);
  updateTag(); savePosition(); publish();
}
function launch(deck, scene = 0, startedAt = Date.now()) {
  if (!decks[deck]?.[scene]) return;
  clearShowTimer(); stopHero(); activeDeck = deck; activeScene = scene; showPaused = false; deckStartedAt = startedAt;
  stage.classList.add('presenting'); show.classList.add('active'); show.setAttribute('aria-hidden','false');
  renderScene();
}
function goTo(scene) { if (activeDeck === null || !decks[activeDeck][scene]) return; activeScene = scene; renderScene(); }
function nextScene() { if (activeDeck === null) return; if (activeScene < decks[activeDeck].length - 1) goTo(activeScene + 1); else standby(); }
function previousScene() { if (activeDeck === null) return; goTo(Math.max(0, activeScene - 1)); }
function toggleTimeline() {
  if (activeDeck === null || mode === 'manual' || isHold()) return;
  showPaused = !showPaused;
  show.classList.toggle('paused', showPaused);
  if (showPaused) { sceneRemaining = Math.max(0, sceneRemaining - (performance.now() - sceneStartedAt)); clearShowTimer(); progressAnim?.pause(); }
  else { armTimer(sceneRemaining); renderCountdown(decks[activeDeck][activeScene]); syncProgress(); progressAnim?.play(); }
  updateTag(); publish();
}
function toggleMode() {
  const wasPaused = showPaused;
  mode = mode === 'auto' ? 'manual' : 'auto';
  try { localStorage.setItem(MODE_KEY, mode); } catch {}
  showPaused = false;
  if (activeDeck !== null) {
    show.classList.remove('paused'); show.classList.toggle('manual', mode === 'manual');
    clearShowTimer();
    if (mode === 'auto') armTimer(sceneDuration()); else sceneRemaining = sceneDuration();
    startProgress();
  }
  updateTag(); publish();
}
// Repite el efecto de la escena actual sin esperar la entrada (útil para el avión de papel, el QR o el tachado).
function replayMoment() {
  if (activeDeck === null || !shown) return;
  const scene = decks[activeDeck][activeScene];
  if (scene.code) document.getElementById('codeOut') && (document.getElementById('codeOut').innerHTML = '');
  if (scene.qr) document.querySelectorAll('#showExtra .qr-box rect').forEach((r) => { r.style.opacity = 0; });
  if (scene.hideText) { show.classList.add('no-text'); show.classList.remove('has-extra'); }           // vuelve a ocultarse el texto si la escena lo muestra más tarde
  if (scene.holdTitle || scene.retitles) {                     // volver al estado inicial del título
    clearTimeout(retitleTimer);
    const title = paintTitle(scene); fitTitle(title);
    const { overline, body } = sceneNodes();
    utils.set(scene.holdTitle ? [overline, body, split.chars] : [split.chars], { opacity: scene.holdTitle ? 0 : 1, y: 0, rotate: 0, scale: 1 });
  }
  moments.start(scene, momentCtx(scene, reduceMotion), true);
}
function openPresenter() { window.open('presenter.html', 'edulab-presenter', 'width=1180,height=760'); }

// Comandos compartidos por el teclado del escenario y la vista del presentador.
function runCommand(cmd) {
  if (cmd.type === 'launch') launch(cmd.deck);
  else if (cmd.type === 'goto') goTo(cmd.scene);
  else if (cmd.type === 'next') nextScene();
  else if (cmd.type === 'prev') previousScene();
  else if (cmd.type === 'toggle') toggleTimeline();
  else if (cmd.type === 'mode') toggleMode();
  else if (cmd.type === 'standby') standby();
  else if (cmd.type === 'vote') vote(cmd.option, cmd.delta || 1);
  else if (cmd.type === 'resetVotes') resetVotes();
  else if (cmd.type === 'moment') replayMoment();
  else if (cmd.type === 'hello') publish();
}
channel && (channel.onmessage = (event) => { if (event.data?.type === 'cmd') runCommand(event.data.cmd); });
setInterval(() => { if (activeDeck !== null) publish(); }, 500);

operatorToggle.addEventListener('click', () => { const open = operatorPanel.classList.toggle('open'); operatorPanel.setAttribute('aria-hidden',!open); operatorToggle.setAttribute('aria-expanded',open); });
window.addEventListener('keydown', (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const key = event.key.toLowerCase();
  if (['1','2','3'].includes(key)) launch(Number(key)-1);
  else if (key === 's') standby();
  else if (event.code === 'Space') { event.preventDefault(); toggleTimeline(); }
  else if (['arrowright','pagedown','arrowdown'].includes(key)) { event.preventDefault(); nextScene(); }
  else if (['arrowleft','pageup','arrowup'].includes(key)) { event.preventDefault(); previousScene(); }
  else if (key === 'm') toggleMode();
  else if (key === 'e') replayMoment();
  else if (key === 'p') openPresenter();
  else if (key === 'o') operatorToggle.click();
  else if (key === 'f' && !document.fullscreenElement) document.documentElement.requestFullscreen?.();
});
// Click/tap: derecha avanza, tercio izquierdo retrocede (ignora botones y el panel).
stage.addEventListener('click', (event) => {
  if (activeDeck === null || event.target.closest('button, .operator-panel')) return;
  event.clientX < window.innerWidth / 3 ? previousScene() : nextScene();
});
playHero();
// Tras un refresh en medio de la charla, vuelve a la escena donde iba (y conserva el cronómetro del deck).
try {
  const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
  if (saved) launch(saved.deck, saved.scene, saved.startedAt || Date.now());
} catch {}
