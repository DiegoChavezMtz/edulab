// Momentos del deck 3 (Cierre): despegue, contador de manos, universo y final.
// Se apoyan en el kit de moments.js; todo es visual y cancelable.
(() => {
  const { animate, stagger } = anime;
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

  // ---- Universo: núcleo con cuatro planetas que lo orbitan (textos de scene.universe).
  moments.register('universe', (scene, ctx, wait) => {
    const cfg = scene.universe, box = document.getElementById('showExtra');
    if (!cfg) return;
    box.innerHTML = '';
    const svg = svgEl('svg', { viewBox: '-60 -40 520 480', style: 'width:100%;max-height:58vh;overflow:visible;' }, box);
    const defs = svgEl('defs', {}, svg), grad = svgEl('radialGradient', { id: 'coreGlow' }, defs);
    svgEl('stop', { offset: '0', 'stop-color': '#d9ff20', 'stop-opacity': .75 }, grad); svgEl('stop', { offset: '1', 'stop-color': '#d9ff20', 'stop-opacity': 0 }, grad);
    const cx = 200, cy = 200, radii = [76, 114, 152, 190], colors = ['#d9ff20', '#ff3bb9', '#22d7ff', '#ffffff'], sizes = [12, 14, 16, 13], periods = [11000, 16000, 22000, 29000], starts = [.9, 2.6, 4.2, 5.7];
    const rings = radii.map((r) => svgEl('circle', { cx, cy, r, fill: 'none', stroke: 'rgba(255,255,255,.16)', 'stroke-width': 1.5 }, svg));
    rings.forEach((c, i) => { const len = 2 * Math.PI * radii[i]; c.style.strokeDasharray = len; c.style.strokeDashoffset = len; track(animate(c, { strokeDashoffset: [len, 0], duration: 1200, delay: wait(500) + i * 180, ease: 'outQuad' })); });
    svgEl('circle', { cx, cy, r: 62, fill: 'url(#coreGlow)' }, svg);
    const core = svgEl('circle', { cx, cy, r: 30, fill: '#d9ff20', style: CENTER }, svg);
    svgEl('text', { x: cx, y: cy + 4, 'text-anchor': 'middle', 'font-family': 'DM Mono, monospace', 'font-size': 11, 'font-weight': 500, fill: '#030711', 'letter-spacing': '1.5' }, svg).textContent = 'NÚCLEO';
    track(animate(core, { scale: [0, 1], duration: 800, delay: wait(300), ease: 'outBack(2.5)' }));
    track(animate(core, { scale: [1, 1.09], duration: 1800, delay: wait(1500), loop: true, alternate: true, ease: 'inOutSine' }));

    (cfg.planets || []).slice(0, 4).forEach((label, i) => {
      const g = svgEl('g', { opacity: 0 }, svg), dot = svgEl('circle', { r: sizes[i], fill: colors[i], style: CENTER }, g);
      const text = svgEl('text', { 'font-family': 'Space Grotesk, sans-serif', 'font-size': 15, 'font-weight': 700, fill: '#fff', style: 'paint-order:stroke;stroke:#030711;stroke-width:4px;' }, g);
      text.textContent = label;
      const state = { a: starts[i] };
      const put = () => {
        const x = cx + Math.cos(state.a) * radii[i], y = cy + Math.sin(state.a) * radii[i], right = x >= cx;
        dot.setAttribute('cx', x); dot.setAttribute('cy', y);
        text.setAttribute('x', x + (right ? sizes[i] + 7 : -(sizes[i] + 7))); text.setAttribute('y', y + 5); text.setAttribute('text-anchor', right ? 'start' : 'end');
      };
      put();
      track(animate(g, { opacity: [0, 1], duration: 600, delay: wait(900) + i * 260, ease: 'outQuad' }));
      track(animate(dot, { scale: [0, 1], duration: 700, delay: wait(900) + i * 260, ease: 'outBack(2.5)' }));
      track(animate(state, { a: [starts[i], starts[i] + Math.PI * 2], duration: periods[i], delay: wait(900) + i * 260, loop: true, ease: 'linear', onUpdate: put }));
    });

    const chips = document.createElement('div');
    chips.className = 'chips';
    chips.innerHTML = (cfg.core || []).map((word) => `<span>${word.replace(/[&<>]/g, '')}</span>`).join('');
    box.appendChild(chips);
    track(animate([...chips.children], { opacity: [0, 1], y: [14, 0], duration: 600, delay: stagger(140, { start: wait(1800) }), ease: 'outExpo' }));
  });

  // ---- Final: las estrellas se juntan formando un cohete (detrás del texto) y estallan fuegos artificiales.
  moments.register('finale', (scene, ctx, wait) => {
    const back = mount(true), front = mount(false), W = innerWidth, H = innerHeight;
    const parts = [
      { d: 'M66 0C46 -18 6 -20 -30 -14L-30 14C6 20 46 18 66 0Z', n: 46 }, { d: 'M66 0C56 -9 47 -15 38 -18L38 18C47 15 56 9 66 0Z', n: 12 },
      { d: 'M-14 -14L-36 -36L-36 -10Z', n: 12 }, { d: 'M-14 14L-36 36L-36 10Z', n: 12 }, { d: 'M-30 -12C-62 -13 -84 -5 -104 0C-84 5 -62 13 -30 12Z', n: 18 }
    ];
    const k = (H * .8) / 170, ox = W * .5, oy = H * .5, project = (x, y) => [ox + y * k, oy - (x + 20) * k]; // cohete apuntando arriba
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
