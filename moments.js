// Momentos de la Fase 2: animaciones con contenido propio (Anime.js). Todo es visual y cancelable:
// el avance de escenas nunca depende de estas animaciones.
const moments = (() => {
  const { animate } = anime;
  const NS = 'http://www.w3.org/2000/svg';
  const COLORS = ['#d9ff20', '#ff3bb9', '#22d7ff'];
  const layer = (behind = false) => document.getElementById(behind ? 'showMomentsBack' : 'showMoments');
  const bothLayers = () => [layer(false), layer(true)].filter(Boolean);
  const CENTER = 'transform-box:fill-box;transform-origin:center;'; // para que scale/rotate de un elemento SVG giren sobre sí mismo
  let running = [];
  const registry = {}; // momentos extra registrados desde otros archivos (cierre.js)
  let tickState = { seconds: null };

  const track = (animation) => { running.push(animation); return animation; };
  const later = (ms, fn) => track(animate({ t: 0 }, { t: 1, duration: Math.max(1, ms), ease: 'linear', onComplete: fn }));
  const svgEl = (name, attrs = {}, parent) => {
    const el = document.createElementNS(NS, name);
    Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
    parent?.appendChild(el);
    return el;
  };
  const escapeText = (text) => String(text).replace(/[&<>"']/g, (c) => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  function mount(behind = false) {
    const root = layer(behind);
    root.querySelector('svg')?.remove();
    return svgEl('svg', { width: '100%', height: '100%', viewBox: `0 0 ${innerWidth} ${innerHeight}` }, root);
  }

  // Chispas que salen de un punto y se desvanecen.
  function burst(svg, x, y, { count = 16, spread = 110, size = 4 } = {}) {
    const dots = Array.from({ length: count }, (_, i) => svgEl('circle', { cx: x, cy: y, r: size * (.6 + Math.random() * .9), fill: COLORS[i % COLORS.length], style: CENTER }, svg));
    const angles = dots.map((_, i) => (i / count) * Math.PI * 2 + Math.random() * .5);
    const reach = dots.map(() => spread * (.45 + Math.random() * .65));
    animate(dots, {
      translateX: (el, i) => Math.cos(angles[i]) * reach[i],
      translateY: (el, i) => Math.sin(angles[i]) * reach[i],
      opacity: [1, 0], scale: [1, .2], duration: 750, ease: 'outExpo',
      onComplete: () => dots.forEach((d) => d.remove())
    });
  }
  function fadingDot(svg, x, y, color, size = 3, life = 650) {
    const dot = svgEl('circle', { cx: x, cy: y, r: size, fill: color, style: CENTER }, svg);
    animate(dot, { opacity: [.85, 0], scale: [1, .1], duration: life, ease: 'outQuad', onComplete: () => dot.remove() });
  }

  // "IMPOSIBLE": dos trazos a mano tachan la palabra (o solo "IM") y lo tachado se apaga.
  function strike(scene, ctx, delay) {
    later(delay, () => {
      const cfg = scene.strike, words = ctx.split?.words;
      if (!cfg || !words) return;
      const word = words.find((w) => w.textContent.toUpperCase().includes((cfg.word || cfg.part || '').toUpperCase().slice(0, 4)));
      if (!word) return;
      const chars = [...word.querySelectorAll('[data-char]')];
      const struck = cfg.part ? chars.slice(0, cfg.part.length) : chars;
      const rects = struck.map((c) => c.getBoundingClientRect());
      const left = Math.min(...rects.map((r) => r.left)), right = Math.max(...rects.map((r) => r.right));
      const top = Math.min(...rects.map((r) => r.top)), bottom = Math.max(...rects.map((r) => r.bottom));
      const mid = (top + bottom) / 2, h = bottom - top, pad = h * .08, width = Math.max(6, Math.min(18, h * .09));
      const svg = mount();
      const strokes = [
        `M${left - pad} ${mid + h * .06} Q${(left + right) / 2} ${mid - h * .14} ${right + pad} ${mid - h * .04}`,
        `M${right + pad} ${mid + h * .12} Q${(left + right) / 2} ${mid + h * .02} ${left - pad} ${mid + h * .2}`
      ].map((d) => svgEl('path', { d, fill: 'none', stroke: '#ff3bb9', 'stroke-width': width, 'stroke-linecap': 'round', style: 'filter:drop-shadow(0 0 10px #ff3bb9)' }, svg));
      strokes.forEach((path, i) => {
        const length = path.getTotalLength();
        path.style.strokeDasharray = length; path.style.strokeDashoffset = length;
        track(animate(path, { strokeDashoffset: [length, 0], duration: 480, delay: i * 260, ease: 'outQuad' }));
      });
      later(900, () => {
        track(animate(struck, { opacity: .3, duration: 500, ease: 'outQuad' }));
        burst(svg, right, mid, { count: 12, spread: 90 });
      });
    });
  }

  // Avión de papel: grande (~26% del ancho), cruza la pantalla por una curva con balanceo y una estela gruesa;
  // se repite mientras la escena siga en pantalla.
  function plane(delay) {
    const run = () => {
      const svg = mount(), W = innerWidth, H = innerHeight, S = (W * .26) / 74; // el avión mide ~74 unidades de largo
      const [p0, p1, p2, p3] = [[-W * .3, H * .95], [W * .2, H * .02], [W * .62, H * 1.1], [W * 1.3, H * .2]];
      const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p0[k] + 3*u*u*t*p1[k] + 3*u*t*t*p2[k] + t*t*t*p3[k]); };
      const slope = (t) => { const u = 1 - t; const d = [0, 1].map((k) => 3*u*u*(p1[k]-p0[k]) + 6*u*t*(p2[k]-p1[k]) + 3*t*t*(p3[k]-p2[k])); return Math.atan2(d[1], d[0]); };
      const g = svgEl('g', {}, svg); // sin drop-shadow: un filtro sobre algo tan grande baja los fps
      svgEl('path', { d: 'M52 0L-22 -19L3 3Z', fill: '#ffffff' }, g);
      svgEl('path', { d: 'M52 0L3 3L-15 18Z', fill: '#d9ff20' }, g);
      svgEl('path', { d: 'M3 3L-22 -19L-15 18Z', fill: '#22d7ff', opacity: .85 }, g);
      svgEl('path', { d: 'M52 0L-10 2', stroke: '#030711', 'stroke-width': 1.2, opacity: .35, fill: 'none' }, g); // pliegue central
      svgEl('path', { d: 'M3 3L-22 -19L-30 -2Z', fill: '#ff3bb9', opacity: .9 }, g);                          // cola
      const state = { t: 0 };
      let lastTrail = 0, n = 0;
      track(animate(state, {
        t: [0, 1], duration: 3800, ease: 'inOutSine',
        onUpdate: () => {
          const [x, y] = at(state.t), h = slope(state.t);
          const size = S * (.85 + .3 * Math.sin(state.t * Math.PI));       // más grande al pasar por el centro
          const roll = 1 + .22 * Math.sin(state.t * 16);                    // balanceo
          g.setAttribute('transform', `translate(${x} ${y}) rotate(${h * 180 / Math.PI}) scale(${size} ${size * roll})`);
          if (state.t - lastTrail > .011) {
            lastTrail = state.t;
            const tx = x - Math.cos(h) * 28 * size, ty = y - Math.sin(h) * 28 * size, jitter = () => (Math.random() - .5) * 10 * size;
            fadingDot(svg, tx + jitter(), ty + jitter(), COLORS[n++ % 3], 2.4 * size, 900);
          }
        },
        onComplete: () => { g.remove(); later(3500, run); }
      }));
    };
    later(delay, run);
  }

  // Cohete reutilizable (dibujado apuntando a +x, con fuego a la izquierda). `place` lo coloca y aviva la llama.
  function makeRocket(parent, { glow = true } = {}) {
    const ship = svgEl('g', { opacity: 0, style: glow ? 'filter:drop-shadow(0 0 14px rgba(217,255,32,.55))' : '' }, parent);
    const flame = svgEl('g', {}, ship);
    svgEl('path', { d: 'M-30 -12C-62 -13 -84 -5 -104 0C-84 5 -62 13 -30 12Z', fill: '#ff3bb9', opacity: .92 }, flame);
    svgEl('path', { d: 'M-30 -8C-54 -9 -70 -3 -86 0C-70 3 -54 9 -30 8Z', fill: '#d9ff20' }, flame);
    svgEl('path', { d: 'M-30 -4C-44 -4 -56 -1 -66 0C-56 1 -44 4 -30 4Z', fill: '#ffffff' }, flame);
    svgEl('path', { d: 'M-14 -14L-36 -36L-36 -10Z', fill: '#ff3bb9' }, ship);
    svgEl('path', { d: 'M-14 14L-36 36L-36 10Z', fill: '#ff3bb9' }, ship);
    svgEl('path', { d: 'M66 0C46 -18 6 -20 -30 -14L-30 14C6 20 46 18 66 0Z', fill: '#f4f7ff' }, ship);
    svgEl('path', { d: 'M66 0C56 -9 47 -15 38 -18L38 18C47 15 56 9 66 0Z', fill: '#d9ff20' }, ship);
    svgEl('circle', { cx: 8, cy: 0, r: 8, fill: '#030711', stroke: '#22d7ff', 'stroke-width': 3 }, ship);
    const place = (x, y, heading, scale, flameSize, alpha = 1) => {
      ship.setAttribute('transform', `translate(${x} ${y}) rotate(${heading * 180 / Math.PI}) scale(${scale})`);
      const flicker = flameSize * (1 + .14 * Math.sin(performance.now() / 38));
      flame.setAttribute('transform', `translate(-30 0) scale(${flicker} ${.85 + .2 * Math.sin(performance.now() / 53)}) translate(30 0)`);
      ship.setAttribute('opacity', alpha);
    };
    return { ship, flame, place };
  }

  // Onda expansiva: un aro que crece y se apaga.
  function ring(svg, x, y, maxR, { color = '#fff', duration = 900, width = 5 } = {}) {
    const c = svgEl('circle', { cx: x, cy: y, r: maxR, fill: 'none', stroke: color, 'stroke-width': width, style: CENTER + 'vector-effect:non-scaling-stroke;' }, svg);
    animate(c, { scale: [.02, 1], opacity: [.95, 0], duration, ease: 'outQuad', onComplete: () => c.remove() });
  }

  // Misión a la luna: la luna sube detrás del texto; un cohete grande despega abajo a la izquierda, cruza toda la
  // pantalla por delante del texto dejando fuego y humo, impacta en la órbita con ondas y se queda orbitando.
  function moon(delay) {
    const back = mount(true), front = mount(false), W = innerWidth, H = innerHeight;
    const cx = W * .88, cy = H * .22, r = H * .13, rx = r * 1.75, ry = r * .5, tilt = -16 * Math.PI / 180;
    const orbitPoint = (a) => { const lx = Math.cos(a) * rx, ly = Math.sin(a) * ry; return [cx + lx * Math.cos(tilt) - ly * Math.sin(tilt), cy + lx * Math.sin(tilt) + ly * Math.cos(tilt)]; };
    const orbitHeading = (a) => Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx) + tilt;

    // Luna (capa trasera): una g exterior sube y una interior "rebota" con el impacto.
    const rise = svgEl('g', { opacity: 0, style: 'filter:drop-shadow(0 0 38px rgba(170,215,255,.6))' }, back);
    const bump = svgEl('g', { style: CENTER }, rise);
    svgEl('circle', { cx, cy, r, fill: '#d6e3ff' }, bump);
    [[-.35, -.25, .2], [.3, .1, .26], [-.1, .4, .14], [.35, -.45, .12]].forEach(([dx, dy, k]) => svgEl('circle', { cx: cx + dx * r, cy: cy + dy * r, r: k * r, fill: '#a9bbe0', opacity: .75 }, bump));
    track(animate(rise, { opacity: [0, 1], translateY: [H * .4, 0], duration: 1400, delay, ease: 'outExpo' }));

    // Cohete (capa delantera).
    const { ship, place } = makeRocket(front);

    // Ruta: parte abajo a la izquierda y llega tangente a la órbita (a = π), así el empalme es continuo.
    const a0 = Math.PI, p0 = [W * .075, H * .9], p3 = orbitPoint(a0), h3 = orbitHeading(a0);
    const reach = Math.hypot(p3[0] - p0[0], p3[1] - p0[1]) * .34;
    const p1 = [W * .36, H * .5], p2 = [p3[0] - Math.cos(h3) * reach, p3[1] - Math.sin(h3) * reach];
    const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p0[k] + 3*u*u*t*p1[k] + 3*u*t*t*p2[k] + t*t*t*p3[k]); };
    const slope = (t) => { const u = 1 - t; const d = [0, 1].map((k) => 3*u*u*(p1[k]-p0[k]) + 6*u*t*(p2[k]-p1[k]) + 3*t*t*(p3[k]-p2[k])); return Math.atan2(d[1], d[0]); };
    const S0 = 2.1, S1 = .95, h0 = slope(0);

    // 1) Ignición en la plataforma: tiembla, el fuego crece y sale humo.
    const lit = { f: 0, jitter: 1 };
    track(animate(lit, {
      f: [0, 1], duration: 900, delay: delay + 150, ease: 'inQuad',
      onBegin: () => ship.setAttribute('opacity', 1),
      onUpdate: () => {
        const sx = (Math.random() - .5) * 5 * lit.f, sy = (Math.random() - .5) * 4 * lit.f;
        place(p0[0] + sx, p0[1] + sy, h0, S0, .25 + lit.f * .85);
        if (Math.random() < .5) fadingDot(front, p0[0] - 55 + Math.random() * 30, p0[1] + 30 + Math.random() * 20, 'rgba(210,220,240,.35)', 10 + Math.random() * 12, 1000);
      }
    }));

    // 2) Despegue: acelera y cruza la pantalla dejando una estela de fuego y humo.
    const flight = { t: 0 }; let lastEmit = 0, n = 0;
    later(delay + 1050, () => {
      ring(front, p0[0], p0[1], 140, { color: '#d9ff20', duration: 700, width: 4 });
      burst(front, p0[0], p0[1], { count: 22, spread: 150, size: 5 });
      track(animate(flight, {
        t: [0, 1], duration: 2700, ease: 'inOutQuart',
        onUpdate: () => {
          const [x, y] = at(flight.t), h = slope(flight.t), s = S0 + (S1 - S0) * flight.t;
          place(x, y, h, s, 1.1);
          const now = performance.now(); if (now - lastEmit < 18) return; lastEmit = now;
          const tx = x - Math.cos(h) * 62 * s, ty = y - Math.sin(h) * 62 * s, j = () => (Math.random() - .5) * 8 * s;
          fadingDot(front, tx + j(), ty + j(), COLORS[n++ % 3], (6 + Math.random() * 4) * s, 520);
          if (n % 2 === 0) fadingDot(front, tx - Math.cos(h) * 24 + j(), ty - Math.sin(h) * 24 + j(), 'rgba(205,215,235,.3)', (11 + Math.random() * 9) * s, 950);
        },
        onComplete: arrive
      }));
    });

    // 3) Llegada: destello, ondas sobre la luna, rebote de la luna, chispas y el fondo se enciende.
    function arrive() {
      const flash = svgEl('rect', { width: W, height: H, fill: '#fff', opacity: 0 }, front);
      animate(flash, { opacity: [.3, 0], duration: 520, ease: 'outQuad', onComplete: () => flash.remove() });
      [0, 160, 320].forEach((wait, i) => later(wait, () => ring(front, cx, cy, r * (2.3 + i * .35), { color: COLORS[i], duration: 1000 + i * 150, width: 5 - i })));
      track(animate(bump, { scale: [1, 1.14, 1], duration: 900, ease: 'outElastic(1, .5)' }));
      burst(front, p3[0], p3[1], { count: 44, spread: 240, size: 5.5 });
      if (typeof pulseBackground === 'function') pulseBackground(1.5);
      // 4) Órbita: continúa desde el mismo punto y se atenúa al pasar por detrás de la luna.
      const orbit = { a: a0 };
      track(animate(orbit, {
        a: [a0, a0 + Math.PI * 2], duration: 7500, ease: 'linear', loop: true,
        onUpdate: () => {
          const [x, y] = orbitPoint(orbit.a);
          place(x, y, orbitHeading(orbit.a), S1, .45, Math.sin(orbit.a) < 0 ? .45 : 1);
        }
      }));
    }
  }

  // Estela de partículas mientras el cohete decorativo hace su entrada (la trayectoria sigue siendo CSS).
  function rocketTrail() {
    const rocket = document.querySelector('.rocket-doodle');
    if (!rocket || getComputedStyle(rocket).display === 'none') return;
    const svg = mount(); let last = 0, n = 0;
    const state = { t: 0 };
    track(animate(state, {
      t: [0, 1], duration: 1350, delay: 180, ease: 'linear',
      onUpdate: () => {
        if (state.t - last < .03) return; last = state.t;
        const b = rocket.getBoundingClientRect();
        fadingDot(svg, b.left + b.width * .3, b.bottom - b.height * .18, COLORS[n++ % 2], 4.5, 800);
      },
      onComplete: () => { const b = rocket.getBoundingClientRect(); burst(svg, b.left + b.width / 2, b.top + b.height / 2, { count: 10, spread: 70, size: 3 }); }
    }));
  }

  // QR: los cuadros aparecen escalonados desde el centro.
  function qrSvg(url, hidden) {
    const code = qrcode(0, 'M'); code.addData(url); code.make();
    const n = code.getModuleCount(), c = (n - 1) / 2; let rects = '';
    for (let row = 0; row < n; row++) for (let col = 0; col < n; col++) if (code.isDark(row, col))
      rects += `<rect x="${col}" y="${row}" width="1.02" height="1.02" data-d="${Math.hypot(row - c, col - c).toFixed(2)}"${hidden ? ' style="opacity:0"' : ''}/>`;
    return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges" fill="#000">${rects}</svg>`;
  }
  function qrReveal(delay) {
    const rects = [...document.querySelectorAll('#showExtra .qr-box rect')];
    if (!rects.length) return;
    track(animate(rects, { opacity: [0, 1], scale: [0, 1], duration: 420, delay: (el) => delay + Number(el.dataset.d) * 26, ease: 'outBack(2)' }));
  }

  // SQL: la consulta se escribe sola con las palabras clave resaltadas.
  const highlight = (text) => escapeText(text).replace(/\b(SELECT|FROM|WHERE|JOIN|ON|AND|ORDER BY|LIMIT)\b/g, '<b>$1</b>');
  function typeCode(scene, ctx, delay) {
    const out = document.getElementById('codeOut');
    if (!out) return;
    if (ctx.reduce) { out.innerHTML = highlight(scene.code); return; }
    out.innerHTML = '';
    const state = { n: 0 };
    track(animate(state, {
      n: [0, scene.code.length], duration: scene.code.length * 55, delay, ease: 'linear',
      onUpdate: () => { out.innerHTML = highlight(scene.code.slice(0, Math.floor(state.n))); }
    }));
  }

  // Votación: el número cuenta hacia el nuevo valor y "salta" (destello de cada voto).
  function countTo(el, to, reduce) {
    const from = Number(el.dataset.v || 0);
    el.dataset.v = to;
    if (reduce || from === to) { el.textContent = to; return; }
    const state = { v: from };
    animate(state, { v: to, duration: 600, ease: 'outExpo', onUpdate: () => { el.textContent = Math.round(state.v); }, onComplete: () => { el.textContent = to; } });
    animate(el, { scale: [1.6, 1], duration: 550, ease: 'outBack(3)' });
  }

  // Cuenta regresiva: cada segundo late; en los últimos 10 se vuelve rosa y al llegar a cero estalla.
  function tick(label, seconds, reduce) {
    if (tickState.seconds === seconds) return;
    const previous = tickState.seconds; tickState.seconds = seconds;
    label.classList.toggle('urgent', seconds <= 10);
    if (reduce) return;
    animate(label, { scale: [seconds <= 10 ? 1.35 : 1.15, 1], duration: 450, ease: 'outBack(2.5)' });
    if (seconds === 0 && previous > 0) { const b = label.getBoundingClientRect(); burst(mount(), b.left + b.width / 2, b.top + b.height / 2, { count: 26, spread: 170, size: 5 }); }
  }

  function clear() {
    running.forEach((a) => a.cancel()); running = [];
    bothLayers().forEach((root) => root.querySelector('svg')?.remove());
    const stage = document.querySelector('.show'); if (stage) stage.style.transform = ''; // por si se cancela un temblor
    tickState = { seconds: null };
  }
  let fadeAnim = null;
  function fade() { fadeAnim = animate(bothLayers(), { opacity: 0, duration: 180, ease: 'in(2)' }); }
  function reset() { fadeAnim?.cancel(); fadeAnim = null; bothLayers().forEach((root) => { root.style.opacity = ''; }); }

  // Punto de entrada por escena. `quick` repite el efecto sin esperar la entrada (tecla E).
  function start(scene, ctx, quick = false) {
    clear(); reset();
    if (ctx.reduce) { if (scene.code) typeCode(scene, ctx, 0); return; }
    const wait = (ms) => (quick ? 0 : ms);
    if (scene.moment === 'strike') strike(scene, ctx, wait(1500));
    else if (scene.moment === 'plane') plane(wait(1400));
    else if (scene.moment === 'moon') moon(wait(300));
    else if (registry[scene.moment]) registry[scene.moment](scene, ctx, wait);
    else if (!scene.moment && !scene.poll && !scene.qr && !scene.code && !scene.media) rocketTrail();
    if (scene.qr) qrReveal(wait(700));
    if (scene.code) typeCode(scene, ctx, wait(900));
  }

  const kit = { svgEl, mount, burst, fadingDot, ring, track, later, makeRocket, CENTER, COLORS };
  return { start, clear, fade, qrSvg, countTo, tick, highlight, kit, register: (name, fn) => { registry[name] = fn; } };
})();
