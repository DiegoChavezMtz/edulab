// Momentos del deck 3 (Cierre): despegue, contador de manos, universo y final.
// Se apoyan en el kit de moments.js; todo es visual y cancelable.
(() => {
  const { animate, stagger, utils } = anime;
  const { svgEl, mount, burst, fadingDot, ring, track, later, makeRocket, CENTER, COLORS } = moments.kit;
  const stageEl = document.querySelector('.show');
  const UP = -Math.PI / 2;
  const rand = (min, max) => min + Math.random() * (max - min);

  // Temblor de pantalla que se apaga solo.
  function shake(ms, amp) {
    const state = { p: 0 };
    track(animate(state, {
      p: [0, 1], duration: ms, ease: 'linear',
      onUpdate: () => { const k = (1 - state.p) * amp; stageEl.style.transform = `translate(${(Math.random() - .5) * k}px, ${(Math.random() - .5) * k}px)`; },
      onComplete: () => { stageEl.style.transform = ''; }
    }));
  }
  const pulse = (strength) => { if (typeof pulseBackground === 'function') pulseBackground(strength); };

  // ---- Despegue: cuenta 3-2-1 con el cohete en su plataforma; al llegar a cero sale disparado hacia arriba.
  moments.register('liftoff', (scene, ctx, wait) => {
    const svg = mount(false), W = innerWidth, H = innerHeight, S = H / 430, px = W * .86, py = H * .8;
    const pad = svgEl('g', { opacity: 0 }, svg);
    svgEl('rect', { x: px - 90 * S, y: py + 42 * S, width: 180 * S, height: 9 * S, fill: '#14223b' }, pad);
    svgEl('rect', { x: px - 90 * S, y: py + 42 * S, width: 180 * S, height: 3 * S, fill: '#d9ff20' }, pad);
    const rocket = makeRocket(svg);
    const digit = svgEl('text', {
      x: px, y: H * .52, 'text-anchor': 'middle', 'font-family': 'Archivo Black, sans-serif', 'font-size': H * .3, fill: '#d9ff20', opacity: 0,
      style: CENTER + 'paint-order:stroke;stroke:#030711;stroke-width:8px;'
    }, svg);
    const t0 = wait(500), LIFT = t0 + 3700;

    track(animate(pad, { opacity: [0, 1], duration: 500, delay: t0, ease: 'outQuad' }));
    const idle = { f: 0 };
    track(animate(idle, {                                    // ignición: tiembla más y el fuego crece
      f: [0, 1], duration: LIFT - t0, delay: t0, ease: 'inQuad',
      onUpdate: () => rocket.place(px + (Math.random() - .5) * 6 * idle.f, py + (Math.random() - .5) * 5 * idle.f, UP, S, .15 + idle.f * .75)
    }));
    [3, 2, 1].forEach((n, i) => later(t0 + 500 + i * 1000, () => {
      digit.textContent = n;
      track(animate(digit, { opacity: [1, .12], scale: [1.6, 1], duration: 900, ease: 'outExpo' }));
      if (n === 1) shake(1000, 6);
    }));

    later(LIFT, () => {
      digit.remove();
      ring(svg, px, py + 46 * S, 260 * S, { color: '#d9ff20', duration: 900, width: 5 });
      burst(svg, px, py + 48 * S, { count: 34, spread: 230 * S, size: 5 });
      const puffs = Array.from({ length: 16 }, () => svgEl('circle', { cx: px + rand(-60, 60) * S, cy: py + 44 * S, r: rand(14, 28) * S, fill: 'rgba(210,220,240,.42)', style: CENTER }, svg));
      animate(puffs, { translateX: () => rand(-380, 380) * S, translateY: () => rand(-40, 20) * S, scale: [.4, 2.6], opacity: [.6, 0], duration: 1900, ease: 'outQuad', onComplete: () => puffs.forEach((p) => p.remove()) });
      shake(1500, 22); pulse(1.8);
      if (ctx.split) track(animate(ctx.split.chars, { y: [0, '-.22em', 0], duration: 800, delay: stagger(18), ease: 'outQuad' }));
      const fl = { t: 0 }; let last = 0, n = 0;
      const yEnd = -H * .3;
      track(animate(fl, {
        t: [0, 1], duration: 1900, ease: 'inQuart',
        onUpdate: () => {
          const y = py + (yEnd - py) * fl.t, x = px + Math.sin(fl.t * 9) * 4 * S;
          rocket.place(x, y, UP, S, 1.25);
          const now = performance.now(); if (now - last < 18) return; last = now;
          const j = () => (Math.random() - .5) * 20 * S;
          fadingDot(svg, x + j(), y + 100 * S + j(), COLORS[n++ % 3], 8 * S, 700);
          if (n % 2 === 0) fadingDot(svg, x + j(), y + 130 * S + j(), 'rgba(205,215,235,.32)', 15 * S, 1100);
        },
        onComplete: () => rocket.ship.remove()
      }));
    });
  });

  // ---- Contador de manos: cada +1 (desde el presentador) lanza un cohete por la pantalla.
  let counterSvg = null;
  moments.register('counter', () => { counterSvg = mount(false); });
  moments.launchMini = () => {
    const svg = counterSvg;
    if (!svg || !svg.isConnected) return;
    const W = innerWidth, H = innerHeight, S = H / 760, x0 = W * rand(.06, .94), sway = W * rand(.01, .035), phase = rand(0, 6);
    const rocket = makeRocket(svg, { glow: false }), state = { t: 0 }; let last = 0, n = 0;
    track(animate(state, {
      t: [0, 1], duration: rand(1300, 1800), ease: 'inCubic',
      onUpdate: () => {
        const y = H + 90 * S - (H + 360 * S) * state.t, x = x0 + Math.sin(state.t * 6 + phase) * sway, h = UP + Math.cos(state.t * 6 + phase) * .14;
        rocket.place(x, y, h, S, 1);
        const now = performance.now(); if (now - last < 24) return; last = now;
        fadingDot(svg, x - Math.cos(h) * 70 * S, y - Math.sin(h) * 70 * S, COLORS[n++ % 3], 6 * S, 600);
      },
      onComplete: () => rocket.ship.remove()
    }));
  };

  // ---- Universo: núcleo con las cuatro palabras y cuatro planetas casi 3D que lo orbitan (textos de scene.universe).
  moments.register('universe', (scene, ctx, wait) => {
    const cfg = scene.universe, box = document.getElementById('showExtra');
    if (!cfg) return;
    box.innerHTML = '';
    const svg = svgEl('svg', { viewBox: '-60 -10 720 490', style: 'width:100%;max-height:84vh;overflow:visible;' }, box);
    const defs = svgEl('defs', {}, svg);
    // Esfera con volumen: luz arriba a la izquierda, tono medio y sombra abajo a la derecha.
    const sphereGrad = (id, light, mid, dark) => {
      const g = svgEl('radialGradient', { id, cx: '.34', cy: '.3', r: '.8' }, defs);
      [[0, light], [.4, mid], [1, dark]].forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, g));
    };
    const glowGrad = (id, color) => {
      const g = svgEl('radialGradient', { id }, defs);
      svgEl('stop', { offset: '.35', 'stop-color': color, 'stop-opacity': .55 }, g); svgEl('stop', { offset: '1', 'stop-color': color, 'stop-opacity': 0 }, g);
    };
    const cx = 300, cy = 235, radii = [170, 230, 290, 350], sizes = [24, 28, 32, 27], FLAT = .5, TILT = -14 * Math.PI / 180, periods = [12000, 17000, 23000, 30000], starts = [.9, 2.6, 4.2, 5.7];
    const palette = [['#ffd6f0', '#ff3bb9', '#6b0a4d'], ['#e8ffa0', '#a6e91b', '#3c6200'], ['#cdf8ff', '#22d7ff', '#04556b'], ['#ffffff', '#b9a6ff', '#3a2a86']];
    sphereGrad('coreSphere', '#ffffd0', '#d9ff20', '#8a9a00'); glowGrad('coreGlow', '#d9ff20');
    palette.forEach((p, i) => { sphereGrad(`pl${i}`, ...p); glowGrad(`plg${i}`, p[1]); });
    // Vista isométrica: las órbitas son elipses aplastadas e inclinadas; lo que pasa por detrás del núcleo se dibuja detrás y más pequeño.
    const rings = radii.map((r) => svgEl('ellipse', { cx, cy, rx: r, ry: r * FLAT, fill: 'none', stroke: 'rgba(255,255,255,.2)', 'stroke-width': 1.6, transform: `rotate(${TILT * 180 / Math.PI} ${cx} ${cy})` }, svg));
    const backLayer = svgEl('g', {}, svg);
    rings.forEach((c, i) => { const len = c.getTotalLength(); c.style.strokeDasharray = len; c.style.strokeDashoffset = len; track(animate(c, { strokeDashoffset: [len, 0], duration: 1200, delay: wait(500) + i * 180, ease: 'outQuad' })); });
    const coreG = svgEl('g', { style: CENTER }, svg), frontLayer = svgEl('g', {}, svg);
    svgEl('circle', { cx, cy, r: 118, fill: 'url(#coreGlow)' }, coreG);
    svgEl('circle', { cx, cy, r: 72, fill: 'url(#coreSphere)' }, coreG);
    svgEl('ellipse', { cx: cx - 26, cy: cy - 48, rx: 26, ry: 13, fill: '#fff', opacity: .35, transform: `rotate(-28 ${cx - 26} ${cy - 48})` }, coreG);
    const words = (cfg.core || []).slice(0, 4);
    words.forEach((w, i) => {
      const t = svgEl('text', { x: cx, y: cy - 26 + i * 21 + 6, 'text-anchor': 'middle', 'font-family': 'Archivo Black, sans-serif', 'font-size': 16, fill: '#030711', opacity: 0 }, coreG);
      t.textContent = w;
      track(animate(t, { opacity: [0, 1], duration: 500, delay: wait(900) + i * 260, ease: 'outQuad' }));
    });
    track(animate(coreG, { scale: [0, 1], duration: 800, delay: wait(300), ease: 'outBack(2.5)' }));
    track(animate(coreG, { scale: [1, 1.05], duration: 2200, delay: wait(1500), loop: true, alternate: true, ease: 'inOutSine' }));

    (cfg.planets || []).slice(0, 4).forEach((label, i) => {
      const r0 = sizes[i], g = svgEl('g', { opacity: 0 }, backLayer);
      const glow = svgEl('circle', { r: r0 * 1.9, fill: `url(#plg${i})`, style: CENTER }, g);
      const dot = svgEl('circle', { r: r0, fill: `url(#pl${i})`, style: CENTER }, g);
      const shine = svgEl('ellipse', { rx: r0 * .38, ry: r0 * .2, fill: '#fff', opacity: .55, style: CENTER }, g);
      const text = svgEl('text', { 'font-family': 'Space Grotesk, sans-serif', 'font-size': 19, 'font-weight': 700, fill: '#fff', style: 'paint-order:stroke;stroke:#030711;stroke-width:5px;' }, g);
      text.textContent = label;
      const state = { a: starts[i] };
      const put = () => {
        const sn = Math.sin(state.a), lx = Math.cos(state.a) * radii[i], ly = sn * radii[i] * FLAT, depth = .82 + .22 * sn, r = r0 * depth;
        const x = cx + lx * Math.cos(TILT) - ly * Math.sin(TILT), y = cy + lx * Math.sin(TILT) + ly * Math.cos(TILT);
        const layer = sn < 0 ? backLayer : frontLayer;
        if (g.parentNode !== layer) layer.appendChild(g);
        glow.setAttribute('r', r * 1.9); dot.setAttribute('r', r); shine.setAttribute('rx', r * .38); shine.setAttribute('ry', r * .2);
        glow.setAttribute('cx', x); glow.setAttribute('cy', y); dot.setAttribute('cx', x); dot.setAttribute('cy', y);
        shine.setAttribute('cx', x - r * .35); shine.setAttribute('cy', y - r * .4);
        text.setAttribute('x', x); text.setAttribute('y', sn < 0 ? y - r - 14 : y + r + 24); text.setAttribute('text-anchor', 'middle'); text.setAttribute('opacity', sn < 0 ? .7 : 1);
      };
      put();
      const at = wait(900) + i * 260;
      track(animate(g, { opacity: [0, 1], duration: 600, delay: at, ease: 'outQuad' }));
      track(animate([glow, dot, shine], { scale: [0, 1], duration: 700, delay: at, ease: 'outBack(2.5)' }));
      track(animate(state, { a: [starts[i], starts[i] + Math.PI * 2], duration: periods[i], delay: at, loop: true, ease: 'linear', onUpdate: put }));
    });
  });

  // ---- Centro de lanzamiento: el título entra grande y centrado; a los scene.launch.at[0] ms se encoge a su lugar y aparece
  // el recuadro 1; a los at[1] ms aparece el recuadro 2. (E repite la secuencia acelerada.)
  moments.register('launchcenter', (scene, ctx, wait) => {
    const cfg = scene.launch, box = document.getElementById('showExtra');
    if (!cfg) return;
    const quick = wait(1) === 0, [T1, T2] = quick ? [2500, 5500] : (cfg.at || [60000, 120000]);
    if (stageEl.classList.contains('has-extra')) { stageEl.classList.remove('has-extra'); fitTitle(paintTitle(scene)); } // repetición: volver al título grande
    const esc = (t) => String(t).replace(/[&<>"']/g, '');
    const chips = (items) => items.map((t) => `<span>${esc(t)}</span>`).join('');
    box.innerHTML = `<div class="lc">
      <div class="lc-card"><small>01 · CENTRO DE LANZAMIENTO</small><div class="lc-chips">${chips(cfg.center)}</div></div>
      <div class="lc-arrow"><svg viewBox="0 0 40 70"><path d="M20 66V8M6 22L20 6L34 22" fill="none" stroke="currentColor" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg></div>
      <div class="lc-card crew"><small>02 · NUEVA GENERACIÓN DE TRIPULANTES</small><div class="lc-chips">${chips(cfg.crew)}</div></div>
      <p class="lc-caption">${esc(cfg.caption || '')}</p></div>`;
    const cards = [...box.querySelectorAll('.lc-card')], arrow = box.querySelector('.lc-arrow'), items = [...box.querySelectorAll('.lc-chips span')], caption = box.querySelector('.lc-caption');
    utils.set([...cards, arrow, ...items, caption], { opacity: 0 });

    later(T1, () => {                                  // el título se encoge hasta su lugar (FLIP) y entra el recuadro 1
      const copy = stageEl.querySelector('.show-copy'), b0 = copy.getBoundingClientRect();
      stageEl.classList.add('has-extra');
      fitTitle(document.getElementById('showTitle'));
      const b1 = copy.getBoundingClientRect();
      track(animate(copy, {
        x: [(b0.left + b0.width / 2) - (b1.left + b1.width / 2), 0], y: [(b0.top + b0.height / 2) - (b1.top + b1.height / 2), 0],
        scale: [b0.width / b1.width, 1], duration: 1400, ease: 'inOutExpo'
      }));
      pulse(.8);
      track(animate(cards[0], { opacity: [0, 1], x: [-40, 0], duration: 800, delay: 1000, ease: 'outExpo' }));
      track(animate(items.slice(0, 3), { opacity: [0, 1], scale: [.7, 1], duration: 500, delay: stagger(160, { start: 1500 }), ease: 'outBack(2.5)' }));
    });
    later(T2, () => {                                  // recuadro 2
      track(animate(arrow, { opacity: [0, 1], duration: 400, ease: 'outQuad' }));
      track(animate(arrow.firstElementChild, { y: [6, -8], duration: 800, loop: true, alternate: true, ease: 'inOutSine' }));
      track(animate(cards[1], { opacity: [0, 1], x: [40, 0], duration: 700, delay: 500, ease: 'outExpo' }));
      track(animate(items.slice(3), { opacity: [0, 1], scale: [.7, 1], duration: 500, delay: stagger(160, { start: 1000 }), ease: 'outBack(2.5)' }));
      track(animate(caption, { opacity: [0, 1], y: [10, 0], duration: 600, delay: 2100, ease: 'outExpo' }));
      later(500, () => { const b = cards[1].getBoundingClientRect(); burst(mount(false), b.left + b.width / 2, b.top + b.height / 2, { count: 16, spread: 130, size: 4 }); pulse(.7); });
    });
  });

  // ---- Temporizador: reloj grande con un botón que inicia y reinicia la cuenta (E hace lo mismo). Se queda hasta avanzar con →.
  moments.register('timer', (scene, ctx, wait) => {
    const box = document.getElementById('showExtra'), total = (scene.timer?.seconds || 120) * 1000;
    box.innerHTML = '<div class="tm"><div class="tm-clock"></div><button type="button" class="tm-btn"></button></div>';
    const clock = box.querySelector('.tm-clock'), btn = box.querySelector('.tm-btn');
    const fmt = (ms) => { const s = Math.ceil(ms / 1000); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`; };
    let id = null, last = null;
    const show = (ms) => {
      clock.textContent = fmt(ms);
      clock.classList.toggle('urgent', ms > 0 && ms <= 10000);
      const s = Math.ceil(ms / 1000);
      if (last !== null && s !== last && ms > 0) track(animate(clock, { scale: [ms <= 10000 ? 1.12 : 1.04, 1], duration: 380, ease: 'outBack(2.5)' }));
      last = s;
    };
    const finish = () => {
      clearInterval(id); id = null; clock.classList.remove('urgent'); clock.classList.add('done'); btn.textContent = 'REINICIAR';
      const b = clock.getBoundingClientRect();
      burst(mount(false), b.left + b.width / 2, b.top + b.height / 2, { count: 36, spread: 260, size: 5 }); ring(mount(false), b.left + b.width / 2, b.top + b.height / 2, 300, { color: '#ff3bb9', duration: 1000, width: 5 });
      pulse(1.4); shake(900, 14);
    };
    const start = () => {
      clearInterval(id); clock.classList.remove('done'); btn.textContent = 'REINICIAR';
      const t0 = performance.now(); last = null; show(total);
      id = setInterval(() => {
        if (!btn.isConnected) { clearInterval(id); return; }       // la escena cambió
        const left = Math.max(0, total - (performance.now() - t0));
        show(left); if (left <= 0) finish();
      }, 200);
    };
    btn.textContent = 'INICIAR'; show(total);
    btn.addEventListener('click', (event) => { event.stopPropagation(); btn.blur(); start(); });
    if (wait(1) === 0) start();                                    // E (repetir efecto) = iniciar / reiniciar
  });

  // ---- Tripulación: la foto entra como una polaroid pegada con cinta, flota y una órbita con un cohete la rodea por detrás.
  moments.register('crew', (scene, ctx, wait) => {
    const cfg = scene.crew, box = document.getElementById('showExtra');
    if (!cfg) return;
    const esc = (t) => String(t).replace(/[&<>"']/g, '');
    box.innerHTML = `<figure class="crew-photo"><div class="crew-frame"><img src="${esc(cfg.src)}" alt="${esc(cfg.alt || '')}"><i class="tape"></i><i class="tape t2"></i></div><figcaption>${esc(cfg.label || '')}</figcaption></figure>`;
    const fig = box.firstElementChild, frame = fig.querySelector('.crew-frame'), img = fig.querySelector('img'), tapes = [...fig.querySelectorAll('.tape')], cap = fig.querySelector('figcaption');
    utils.set([frame, cap, ...tapes], { opacity: 0 });
    track(animate(frame, { opacity: [0, 1], scale: [.5, 1], rotate: [-9, -2], y: [60, 0], duration: 1100, delay: wait(700), ease: 'outBack(1.6)' }));
    track(animate(img, { clipPath: ['inset(0 100% 0 0)', 'inset(0 0% 0 0)'], duration: 900, delay: wait(900), ease: 'inOutQuart' }));
    track(animate(tapes, { opacity: [0, 1], scale: [.4, 1], duration: 450, delay: stagger(140, { start: wait(1500) }), ease: 'outBack(2.5)' }));
    track(animate(cap, { opacity: [0, 1], y: [12, 0], duration: 600, delay: wait(1900), ease: 'outExpo' }));
    track(animate(frame, { y: [0, -10], rotate: [-2, -.6], duration: 3200, delay: wait(2000), loop: true, alternate: true, ease: 'inOutSine' }));

    later(wait(1500), () => {
      const b = frame.getBoundingClientRect(), W = innerWidth, H = innerHeight;
      const cx = b.left + b.width / 2, cy = b.top + b.height / 2, rx = b.width * .72, ry = b.height * .62, tilt = -10 * Math.PI / 180;
      const back = mount(true), front = mount(false);
      const pt = (a) => { const lx = Math.cos(a) * rx, ly = Math.sin(a) * ry; return [cx + lx * Math.cos(tilt) - ly * Math.sin(tilt), cy + lx * Math.sin(tilt) + ly * Math.cos(tilt)]; };
      const head = (a) => Math.atan2(Math.cos(a) * ry, -Math.sin(a) * rx) + tilt;
      const orbit = svgEl('ellipse', { cx, cy, rx, ry, fill: 'none', stroke: 'rgba(34,215,255,.55)', 'stroke-width': 3, 'stroke-dasharray': '3 12', 'stroke-linecap': 'round', transform: `rotate(${tilt * 180 / Math.PI} ${cx} ${cy})` }, back);
      track(animate(orbit, { opacity: [0, 1], duration: 700, ease: 'outQuad' }));
      const stars = Array.from({ length: 16 }, () => svgEl('circle', { cx: rand(W * .5, W * .96), cy: rand(H * .1, H * .9), r: rand(1.8, 4), fill: Math.random() < .35 ? '#d9ff20' : '#fff', opacity: 0 }, back));
      track(animate(stars, { opacity: [0, 1], scale: [0, 1], duration: 600, delay: stagger(70), ease: 'outBack(2)' }));
      track(animate(stars, { opacity: [1, .3], duration: 1400, delay: stagger(110), loop: true, alternate: true, ease: 'inOutSine' }));
      const rocket = makeRocket(back, { glow: false }), S = H / 1300, st = { a: 0 };
      track(animate(st, { a: [0, Math.PI * 2], duration: 9000, loop: true, ease: 'linear',
        onUpdate: () => { const [x, y] = pt(st.a); rocket.place(x, y, head(st.a), S * 1.6, .55, Math.sin(st.a) < 0 ? .5 : 1); } }));
      burst(front, cx, cy, { count: 30, spread: Math.max(b.width, b.height) * .7, size: 5 });
      ring(front, cx, cy, b.width * .8, { color: '#d9ff20', duration: 900, width: 4 });
      pulse(1.1);
    });
  });

  // ---- Comunidad: una red de personas que crece sola; cada nodo nuevo nace de otro ya conectado (4 minutos de movimiento suave).
  moments.register('community', (scene, ctx, wait) => {
    const back = mount(true), front = mount(false), W = innerWidth, H = innerHeight, S = H / 800, MAX = 34;
    const nodes = [], links = [];
    const lines = svgEl('g', {}, back), dots = svgEl('g', {}, back);
    const born = (x, y, parent, color) => {
      const dot = svgEl('circle', { cx: x, cy: y, r: rand(6, 10) * S, fill: color, style: CENTER }, dots);
      const node = { x, y, dot };
      nodes.push(node);
      track(animate(dot, { scale: [0, 1], opacity: [0, .9], duration: 900, ease: 'outElastic(1, .6)' }));
      track(animate(dot, { scale: [1, 1.18], duration: rand(1800, 3000), delay: rand(600, 1500), loop: true, alternate: true, ease: 'inOutSine' }));
      ring(back, x, y, 70 * S, { color, duration: 1100, width: 3 });
      if (parent) {
        const nearby = nodes.filter((n) => n !== node && n !== parent && Math.hypot(n.x - x, n.y - y) < 230 * S).slice(0, 1);
        [parent, ...nearby].forEach((n, i) => {
          const line = svgEl('line', { x1: n.x, y1: n.y, x2: x, y2: y, stroke: color, 'stroke-width': 2, 'stroke-opacity': .5 }, lines);
          const len = Math.hypot(n.x - x, n.y - y); line.style.strokeDasharray = len; line.style.strokeDashoffset = len;
          track(animate(line, { strokeDashoffset: [len, 0], duration: 800, delay: i * 200, ease: 'outQuad' }));
          links.push({ line, a: n, b: node });
        });
        burst(front, x, y, { count: 8, spread: 60 * S, size: 3 });
      }
      return node;
    };
    const spawn = () => {
      if (!nodes.length) return;
      const parent = nodes[Math.floor(rand(0, nodes.length))];
      for (let i = 0; i < 14; i++) {
        const ang = rand(0, Math.PI * 2), d = rand(110, 230) * S, x = parent.x + Math.cos(ang) * d, y = parent.y + Math.sin(ang) * d;
        if (x < W * .05 || x > W * .95 || y < H * .14 || y > H * .92) continue;
        if (Math.abs(x - W * .5) < W * .34 && y > H * .2 && y < H * .7) continue; // deja libre la zona del título
        if (nodes.some((n) => Math.hypot(n.x - x, n.y - y) < 70 * S)) continue;
        born(x, y, parent, COLORS[Math.floor(rand(0, 3))]); pulse(.35);
        if (nodes.length > MAX) {                       // el más viejo se apaga para que la red siga viva sin saturarse
          const old = nodes.splice(5, 1)[0];
          links.filter((l) => l.a === old || l.b === old).forEach((l) => { track(animate(l.line, { opacity: 0, duration: 800, onComplete: () => l.line.remove() })); links.splice(links.indexOf(l), 1); });
          track(animate(old.dot, { opacity: 0, scale: 0, duration: 800, onComplete: () => old.dot.remove() }));
        }
        break;
      }
    };
    [[.1, .3], [.9, .3], [.14, .78], [.86, .78], [.5, .86]].forEach(([fx, fy], i) => later(wait(300) + i * 250, () => born(W * fx, H * fy, null, COLORS[i % 3])));
    const tick = () => { spawn(); later(rand(1500, 2600), tick); };
    later(wait(1400), tick);
  });

  // ---- Final: las estrellas se juntan formando un cohete (detrás del texto) y estallan fuegos artificiales.
  moments.register('finale', (scene, ctx, wait) => {
    const back = mount(true), front = mount(false), W = innerWidth, H = innerHeight;
    const parts = [
      { d: 'M66 0C46 -18 6 -20 -30 -14L-30 14C6 20 46 18 66 0Z', n: 46 }, { d: 'M66 0C56 -9 47 -15 38 -18L38 18C47 15 56 9 66 0Z', n: 12 },
      { d: 'M-14 -14L-36 -36L-36 -10Z', n: 12 }, { d: 'M-14 14L-36 36L-36 10Z', n: 12 }, { d: 'M-30 -12C-62 -13 -84 -5 -104 0C-84 5 -62 13 -30 12Z', n: 18 }
    ];
    const k = (H * (scene.qrSlot ? .62 : .8)) / 170, ox = W * (scene.qrSlot ? .3 : .5), oy = H * .5, project = (x, y) => [ox + y * k, oy - (x + 20) * k]; // cohete apuntando arriba
    const probe = svgEl('path', {}, back), outlines = [];
    parts.forEach((part) => {
      probe.setAttribute('d', part.d); const total = probe.getTotalLength();
      outlines.push(Array.from({ length: part.n }, (_, i) => { const p = probe.getPointAtLength((i / part.n) * total); return project(p.x, p.y); }));
    });
    probe.remove();
    outlines.push(Array.from({ length: 12 }, (_, i) => project(8 + Math.cos(i / 12 * Math.PI * 2) * 8, Math.sin(i / 12 * Math.PI * 2) * 8)));
    const points = outlines.flat(), stars = points.map(([x, y]) => svgEl('circle', { cx: x, cy: y, r: rand(2.2, 4), fill: Math.random() < .3 ? '#d9ff20' : '#ffffff', opacity: 0 }, back));
    track(animate(stars, {
      opacity: [0, 1], translateX: () => rand(-W * .6, W * .6), translateY: () => rand(-H * .6, H * .6),
      duration: 1500, delay: (el, i) => wait(300) + (points[i][1] / H) * 900, ease: 'outExpo'
    }));
    const lines = outlines.map((pts) => svgEl('path', { d: 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z', fill: 'none', stroke: 'rgba(217,255,32,.4)', 'stroke-width': 1.3 }, back));
    lines.forEach((path, i) => { const len = path.getTotalLength(); path.style.strokeDasharray = len; path.style.strokeDashoffset = len; track(animate(path, { strokeDashoffset: [len, 0], duration: 1300, delay: wait(1700) + i * 120, ease: 'outQuad' })); });
    later(wait(3300), () => track(animate(stars, { opacity: [1, .45], duration: 1600, delay: stagger(35), loop: true, alternate: true, ease: 'inOutSine' })));

    const firework = () => {
      const x = rand(W * .1, W * .9), y = rand(H * .12, H * .5), rocketDot = svgEl('circle', { cx: x, cy: H, r: 4, fill: '#fff' }, front);
      track(animate(rocketDot, {
        translateY: [0, y - H], duration: 650, ease: 'outQuad',
        onComplete: () => { rocketDot.remove(); burst(front, x, y, { count: 38, spread: rand(150, 230), size: 4.5 }); ring(front, x, y, 90, { color: COLORS[Math.floor(rand(0, 3))], duration: 700, width: 3 }); pulse(.6); }
      }));
    };
    for (let i = 0; i < 7; i++) later(wait(2800) + i * 720 + rand(0, 200), firework);
  });
})();
