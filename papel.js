// Deck 2 (Producto Dekids), parte 1: la mesa, la hoja que se dobla y las diapositivas 1, 2, 3, 4 y 14.
// Vista cenital de una mesa de madera con una lámpara cálida; todo visual y cancelable (moments.kit).
const papel = (() => {
  const { animate, stagger } = anime;
  const { svgEl, mount, burst, fadingDot, ring, track, later, makeRocket, CENTER, COLORS } = moments.kit;
  const rand = (min, max) => min + Math.random() * (max - min);
  const AMBER = '#ffb347', INK = '#1b2a4a', GRAPHITE = '#2b2f3a', CREAM = '#fff3d6';
  const pulse = (n) => { if (typeof pulseBackground === 'function') pulseBackground(n); };
  let uid = 0;
  const shared = { cam: 1 };                                                      // escala de cámara: las diapositivas 1-4 la continúan sin saltos

  // ---- La mesa: madera oscura, charco de luz de la lámpara, polvo flotando y viñeta. La "cámara" hace un empuje lento.
  function table(W, H, { bars = false, push = true, palette = 'wood', continuing = false } = {}) {
    const neon = palette === 'neon';                                              // mesa azul noche con luz fría (EduLab) en vez de madera cálida
    const svg = mount(true), id = `p${++uid}`;
    const defs = svgEl('defs', {}, svg);
    const wood = svgEl('linearGradient', { id: `${id}w`, x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    (neon ? [[0, '#0b1636'], [.5, '#060c22'], [1, '#02040d']] : [[0, '#3a2412'], [.5, '#22140a'], [1, '#0f0804']]).forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, wood));
    const lamp = svgEl('radialGradient', { id: `${id}l` }, defs);
    (neon ? [[0, 'rgba(150,215,255,.4)'], [.55, 'rgba(60,140,255,.13)'], [1, 'rgba(34,120,255,0)']] : [[0, 'rgba(255,220,165,.46)'], [.55, 'rgba(255,190,110,.13)'], [1, 'rgba(255,170,90,0)']]).forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, lamp));
    const vig = svgEl('radialGradient', { id: `${id}v` }, defs);
    [[.45, 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,.82)']].forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, vig));
    const paper = svgEl('linearGradient', { id: 'pp', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
    [[0, '#fffdf6'], [1, '#ece5d6']].forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, paper));

    const cam = svgEl('g', { style: CENTER }, svg);
    svgEl('rect', { x: -W * .1, y: -H * .1, width: W * 1.2, height: H * 1.2, fill: `url(#${id}w)` }, cam);
    for (let i = 0; i < 30; i++) {                                              // vetas de la madera
      const y = (i / 30) * H * 1.1 - H * .05, bend = rand(-14, 14);
      svgEl('path', { d: `M${-W * .05} ${y}C${W * .3} ${y + bend} ${W * .6} ${y - bend} ${W * 1.05} ${y + rand(-8, 8)}`, fill: 'none', stroke: i % 3 ? 'rgba(0,0,0,.2)' : (neon ? 'rgba(34,215,255,.07)' : 'rgba(255,200,140,.06)'), 'stroke-width': rand(1, 3) }, cam);
    }
    svgEl('ellipse', { cx: W * .5, cy: H * .5, rx: W * .55, ry: H * .55, fill: `url(#${id}l)` }, cam);
    const motes = Array.from({ length: 26 }, () => svgEl('circle', { cx: rand(.15, .85) * W, cy: rand(.1, .9) * H, r: rand(1, 2.6), fill: neon ? '#bfeaff' : '#ffe2b0', opacity: 0 }, cam));
    track(animate(motes, { opacity: [0, () => rand(.25, .7)], translateX: { from: 0, to: () => rand(-30, 30) }, translateY: { from: 0, to: () => rand(-40, -10) }, duration: () => rand(5000, 9000), delay: () => rand(0, 3000), loop: true, alternate: true, ease: 'inOutSine' }));
    const camState = { s: continuing ? shared.cam : 1 };                           // empuje lento de cámara, continuo entre diapositivas
    const setCam = () => { cam.style.transform = `scale(${camState.s})`; shared.cam = camState.s; };
    setCam();
    if (push) track(animate(camState, { s: [camState.s, camState.s + .05], duration: 45000, ease: 'linear', onUpdate: setCam }));
    svgEl('rect', { width: W, height: H, fill: `url(#${id}v)` }, svg);
    if (bars) {                                                                  // barras de cine (bars:'retract' = ya estaban y se retiran)
      const bar = H * .075, retract = bars === 'retract';
      const top = svgEl('rect', { width: W, height: bar, fill: '#000', style: 'transform-origin:top;transform-box:view-box;' }, svg), bottom = svgEl('rect', { y: H - bar, width: W, height: bar, fill: '#000', style: 'transform-origin:bottom;transform-box:view-box;' }, svg);
      track(animate([top, bottom], { scaleY: retract ? [1, 0] : [0, 1], duration: retract ? 1800 : 1400, ease: 'outExpo' }));
    }
    if (!continuing) {                                                           // entrada desde negro (solo cuando no viene de otra escena de la mesa)
      const fade = svgEl('rect', { width: W, height: H, fill: '#000' }, svg);
      track(animate(fade, { opacity: [1, 0], duration: 2200, ease: 'outQuad', onComplete: () => fade.remove() }));
    }
    return { svg, cam, W, H };
  }

  // ---- Hoja que se dobla: rectángulo → esquinas → mitades → avión (coordenadas locales 140×200).
  const K = [
    [[-70, -100], [70, -100], [70, 0], [70, 100], [-70, 100], [-70, 0]],
    [[0, -100], [0, -100], [70, -30], [70, 100], [-70, 100], [-70, -30]],
    [[0, -100], [0, -100], [16, -40], [16, 100], [-16, 100], [-16, -40]]
  ];
  const lerpPts = (a, b, t) => a.map((p, i) => [p[0] + (b[i][0] - p[0]) * t, p[1] + (b[i][1] - p[1]) * t]);
  function foldingSheet(parent, S) {
    const g = svgEl('g', {}, parent), inner = svgEl('g', { transform: `scale(${S})` }, g), body = svgEl('g', {}, inner);
    const sh2 = svgEl('path', { fill: 'rgba(0,0,0,.2)' }, body), sh1 = svgEl('path', { fill: 'rgba(0,0,0,.28)' }, body);
    const sheet = svgEl('path', { fill: 'url(#pp)', stroke: '#d6cdbb', 'stroke-width': 1.4, 'stroke-linejoin': 'round' }, body);
    const crease = svgEl('path', { d: 'M0 -100L0 100M-70 -30L0 -100M70 -30L0 -100', fill: 'none', stroke: '#b9c6dc', 'stroke-width': 1.3, 'stroke-dasharray': '5 5' }, body);
    const wings = svgEl('g', { opacity: 0 }, inner);
    const wShadow = svgEl('path', { d: 'M108 8L-36 -88L8 8ZM108 8L-36 104L8 8Z', fill: 'rgba(0,0,0,.22)' }, wings);
    const wingTop = svgEl('path', { d: 'M104 0L-40 -92L6 0Z', fill: '#ffffff', stroke: '#d6cdbb', 'stroke-width': 1.4, 'stroke-linejoin': 'round', style: 'transform-box:fill-box;transform-origin:50% 100%;' }, wings);
    const wingBottom = svgEl('path', { d: 'M104 0L-40 92L6 0Z', fill: '#e4eaf3', stroke: '#d6cdbb', 'stroke-width': 1.4, 'stroke-linejoin': 'round', style: 'transform-box:fill-box;transform-origin:50% 0%;' }, wings);
    const state = { f1: 0, f2: 0, rot: 0, open: 0 };
    const draw = () => {
      const pts = state.f2 > 0 ? lerpPts(K[1], K[2], state.f2) : lerpPts(K[0], K[1], state.f1);
      const d = 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z', r = state.rot * Math.PI / 180;
      const off = (dx, dy) => `translate(${dx * Math.cos(r) + dy * Math.sin(r)} ${-dx * Math.sin(r) + dy * Math.cos(r)})`; // la sombra siempre cae hacia abajo-derecha
      sheet.setAttribute('d', d); sh1.setAttribute('d', d); sh2.setAttribute('d', d);
      sh1.setAttribute('transform', off(3, 5)); sh2.setAttribute('transform', off(7, 11));
      body.setAttribute('transform', `rotate(${state.rot})`);
      crease.setAttribute('opacity', state.rot > 0 || state.f1 <= 0 ? 0 : 1 - state.f2); // las guías solo aparecen al empezar a doblar
      sheet.setAttribute('opacity', state.open > .02 ? 1 - state.open * .15 : 1);
      wings.setAttribute('opacity', state.open > 0 ? 1 : 0);
      wingTop.setAttribute('transform', `scale(1 ${state.open})`); wingBottom.setAttribute('transform', `scale(1 ${state.open})`);
    };
    draw();
    const set = (values) => { Object.assign(state, values); draw(); };
    // k: velocidad (1 = normal). Devuelve cuándo termina (ms desde t0).
    const play = (t0, k = 1) => {
      const at = (ms) => t0 + ms * k, dur = (ms) => ms * k;
      track(animate(state, { f1: [0, 1], duration: dur(900), delay: at(0), ease: 'inOutQuad', onUpdate: draw }));
      track(animate(state, { f2: [0, 1], duration: dur(900), delay: at(1200), ease: 'inOutQuad', onUpdate: draw }));
      track(animate(state, { rot: [0, 90], duration: dur(700), delay: at(2400), ease: 'inOutQuad', onUpdate: draw }));
      track(animate(state, { open: [0, 1], duration: dur(700), delay: at(3200), ease: 'outBack(2)', onUpdate: draw }));
      return at(3900);
    };
    const asPlane = () => set({ f1: 1, f2: 1, rot: 90, open: 1 });
    return { g, state, draw, set, play, asPlane };
  }
  const place = (g, x, y, rot = 0, s = 1) => g.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(${s})`);

  // ---- 1 · Hoja en blanco sobre la mesa (sin texto), con barras de cine y un empuje lento de cámara.
  moments.register('papel1', (scene, ctx, wait) => {
    const W = innerWidth, H = innerHeight, t = table(W, H, { bars: true }), S = (H * .62) / 200;
    const sheet = foldingSheet(t.cam, S);
    place(sheet.g, W * .5, H * .5, -3);
    track(animate(sheet.g, { opacity: [0, 1], duration: 2200, delay: wait(900), ease: 'outQuad' }));
    sheet.g.setAttribute('opacity', 0);
  });

  // ---- 2 · La hoja se dobla hasta ser un avioncito; el avioncito se queda en la mesa y aparece el texto a un lado.
  moments.register('papel2', (scene, ctx, wait) => {
    const W = innerWidth, H = innerHeight, t = table(W, H, { continuing: ctx.continuing, bars: ctx.continuing ? 'retract' : false }), S = (H * .62) / 200, sheet = foldingSheet(t.cam, S);
    const pos = { x: W * .5, y: H * .5, rot: -3, s: 1 }, apply = () => place(sheet.g, pos.x, pos.y, pos.rot, pos.s);
    apply();
    if (!ctx.continuing) { track(animate(sheet.g, { opacity: [0, 1], duration: 1200, delay: wait(500), ease: 'outQuad' })); sheet.g.setAttribute('opacity', 0); } // viniendo de la 1, la hoja ya está sobre la mesa
    const done = sheet.play(wait(ctx.continuing ? 900 : 1700));
    track(animate(pos, { x: W * .73, y: H * .52, rot: -24, s: .88, duration: 1500, delay: done + 300, ease: 'inOutCubic', onUpdate: apply }));
    later(done + 1500, () => { ctx.reveal?.(); });
    track(animate(pos, { y: [H * .52, H * .52 + 6], duration: 2600, delay: done + 2600, loop: true, alternate: true, ease: 'inOutSine', onUpdate: apply })); // respira sobre la mesa
  });

  // ---- 3 · El avioncito se convierte en un cohete que se enciende, despega y sigue dando vueltas por la pantalla.
  moments.register('papel3', (scene, ctx, wait) => {
    const W = innerWidth, H = innerHeight, t = table(W, H, { continuing: ctx.continuing }), S = (H * .62) / 200, plane = foldingSheet(t.cam, S);
    plane.asPlane();
    const px = W * .73, py = H * .52, pos = { x: px, y: py, rot: -24, s: .88 }, apply = () => place(plane.g, pos.x, pos.y, pos.rot, pos.s);
    apply();
    const rocket = makeRocket(t.cam), RS = H / 420, UP = -Math.PI / 2;
    const rig = { x: px, y: py, h: UP, s: 0, flame: .3, a: 0, shake: 0 };
    let emit = false, last = 0, n = 0;
    track(animate({ t: 0 }, {                                                   // un solo bucle dibuja el cohete y emite humo/fuego detrás de él
      t: [0, 1], duration: 1000, loop: true, ease: 'linear',
      onUpdate: () => {
        if (rig.a <= 0) return;
        rocket.place(rig.x + (Math.random() - .5) * rig.shake, rig.y, rig.h, rig.s, rig.flame, rig.a);
        const now = performance.now(); if (!emit || now - last < 26) return; last = now;
        const bx = rig.x - Math.cos(rig.h) * 112 * rig.s, by = rig.y - Math.sin(rig.h) * 112 * rig.s;
        fadingDot(t.cam, bx + rand(-6, 6), by + rand(-6, 6), COLORS[n++ % 3], 6.5 * rig.s, 650);
        if (n % 2 === 0) fadingDot(t.cam, bx - Math.cos(rig.h) * 26 * rig.s + rand(-8, 8), by - Math.sin(rig.h) * 26 * rig.s + rand(-8, 8), 'rgba(205,215,235,.3)', 11 * rig.s, 1000);
      }
    }));
    const t0 = wait(ctx.continuing ? 900 : 1400);
    track(animate(pos, { y: py - 12, s: 1.0, rot: -90, duration: 1100, delay: t0, ease: 'outQuad', onUpdate: apply }));          // se levanta y apunta hacia arriba
    later(t0 + 1300, () => {                                                    // transformación
      const glow = svgEl('circle', { cx: px, cy: py - 12, r: H * .22, fill: 'rgba(255,230,180,.9)', style: CENTER }, t.cam);
      track(animate(glow, { scale: [.1, 1.5], opacity: [.9, 0], duration: 800, ease: 'outQuad', onComplete: () => glow.remove() }));
      ring(t.cam, px, py - 12, H * .3, { color: AMBER, duration: 900, width: 4 }); burst(t.cam, px, py - 12, { count: 30, spread: 190, size: 5 }); pulse(1.3);
      track(animate(plane.g, { opacity: [1, 0], duration: 300, ease: 'inQuad' }));
      Object.assign(rig, { s: RS * .3, flame: .2, a: 1, y: py - 12, shake: 0 });
      track(animate(rig, { s: RS * 1.15, duration: 700, ease: 'outBack(2)' }));
    });
    later(t0 + 2600, () => { rig.shake = 5; track(animate(rig, { flame: .9, duration: 900, ease: 'inQuad' })); });              // ignición
    later(t0 + 3500, () => { emit = true; rig.shake = 0; track(animate(rig, { y: H * .4, flame: 1.25, duration: 1800, ease: 'outQuad' })); }); // despega
    // crucero: una trayectoria en ocho por toda la pantalla (detrás del texto); el cohete gira siguiendo la curva
    later(t0 + 5600, () => {
      const cx = W * .56, cy = H * .46, ax = W * .34, ay = H * .3, u = { t: 0 }, blend = { k: 0 };
      const at = (a) => [cx + ax * Math.sin(a), cy + ay * Math.sin(2 * a + .4)];
      const heading = (a) => Math.atan2(2 * ay * Math.cos(2 * a + .4), ax * Math.cos(a));
      const from = { x: rig.x, y: rig.y, h: rig.h }, a0 = .9;
      const wrap = (d) => Math.atan2(Math.sin(d), Math.cos(d));
      track(animate(blend, { k: [0, 1], duration: 1600, ease: 'inOutSine' }));
      track(animate(u, {
        t: [a0, a0 + Math.PI * 2], duration: 15000, loop: true, ease: 'linear',
        onUpdate: () => {
          const [x, y] = at(u.t), h = heading(u.t), k = blend.k;
          rig.x = from.x + (x - from.x) * k; rig.y = from.y + (y - from.y) * k; rig.h = from.h + wrap(h - from.h) * k;
        }
      }));
    });
  });

  // ---- 4 · Buscar. Probar. Equivocarse. Retomar.: una hoja, un cohete dibujado, la bolita, otra hoja y un avión hacia el público.
  moments.register('papel4', (scene, ctx, wait) => {
    const W = innerWidth, H = innerHeight, t = table(W, H, { continuing: ctx.continuing }), S = (H * .56) / 200, cx = W * .73, cy = H * .5;
    ctx.reveal?.({ parts: ['overline'] });
    const words = () => ctx.getSplit?.()?.words?.length || 0;
    const showWord = (i) => ctx.reveal?.({ parts: ['chars'], words: [i] });

    const cycle = (first) => {
      const sheet = foldingSheet(t.cam, S), pos = { x: cx, y: cy + (first ? 0 : H * .7), rot: -3, s: 1, a: first ? 0 : 1 }, apply = () => { place(sheet.g, pos.x, pos.y, pos.rot, pos.s); sheet.g.setAttribute('opacity', pos.a); };
      apply();
      const sketch = svgEl('g', { opacity: 1 }, sheet.g.firstChild);               // el dibujo vive dentro de la hoja (coordenadas locales)
      const strokes = ['M0 -80C22 -52 24 -10 18 40L-18 40C-24 -10 -22 -52 0 -80Z', 'M18 18L42 58L18 46M-18 18L-42 58L-18 46', 'M-11 40Q0 80 11 40Z', 'M9 -30a9 9 0 1 0 .01 0']
        .map((d) => svgEl('path', { d, fill: 'none', stroke: GRAPHITE, 'stroke-width': 2.2, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, sketch));
      strokes.forEach((p) => { const len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
      const t0 = first ? wait(700) : 200;

      // 1) Buscar: la hoja aparece y se dibuja un cohete
      if (first) { later(t0, () => showWord(0)); track(animate(pos, { a: [0, 1], duration: 800, delay: t0, ease: 'outQuad', onUpdate: apply })); }
      else track(animate(pos, { y: cy, duration: 800, delay: t0, ease: 'outCubic', onUpdate: apply }));
      const drawAt = t0 + 1100;
      strokes.forEach((p, i) => { const len = p.getTotalLength(); track(animate(p, { strokeDashoffset: [len, 0], duration: 900, delay: drawAt + i * 750, ease: 'inOutSine' })); });

      // 2) Probar: la hoja se levanta un poco y el dibujo "se prueba"
      const tryAt = drawAt + 4000;
      if (first) later(tryAt, () => showWord(1));
      track(animate(pos, { s: [1, 1.06], rot: [-3, -5], duration: 500, delay: tryAt, loop: 4, alternate: true, ease: 'inOutSine', onUpdate: apply }));

      // 3) Equivocarse: se hace bolita y se arroja
      const crumpleAt = tryAt + 2600;
      if (first) later(crumpleAt, () => showWord(2));
      const N = 22;                                                              // la hoja (perímetro) → una bolita irregular
      const rect = Array.from({ length: N }, (_, i) => {
        const s = (i / N) * 680, w = 140, h = 200;                                // perímetro total = 2*(140+200)
        if (s < w) return [-70 + s, -100];
        if (s < w + h) return [70, -100 + (s - w)];
        if (s < 2 * w + h) return [70 - (s - w - h), 100];
        return [-70, 100 - (s - 2 * w - h)];
      });
      const ball = rect.map((_, i) => { const a = -Math.PI * .75 + (i / N) * Math.PI * 2, r = 44 + rand(-5, 5); return [Math.cos(a) * r, Math.sin(a) * r]; });
      const morph = { c: 0 };
      const body = sheet.g.firstChild.firstChild;
      const sheetPath = body.children[2], sh1 = body.children[1], sh2 = body.children[0];
      const wrinkles = Array.from({ length: 9 }, () => svgEl('path', { d: `M${rand(-30, 30)} ${rand(-30, 30)}l${rand(-18, 18)} ${rand(-18, 18)}`, stroke: 'rgba(60,50,40,.45)', 'stroke-width': 1.6, fill: 'none', opacity: 0, 'stroke-linecap': 'round' }, sheet.g.firstChild));
      later(crumpleAt, () => {
        track(animate(morph, { c: [0, 1], duration: 1100, ease: 'inOutQuad', onUpdate: () => {
          const pts = lerpPts(rect, ball, morph.c), d = 'M' + pts.map((p) => p.join(' ')).join('L') + 'Z';
          sheetPath.setAttribute('d', d); sh1.setAttribute('d', d); sh2.setAttribute('d', d);
          sketch.setAttribute('opacity', 1 - morph.c); sheet.g.firstChild.setAttribute('transform', `scale(${S * (1 - morph.c * .35)})`);
          wrinkles.forEach((w) => w.setAttribute('opacity', morph.c * .9)); sheet.g.querySelector('path[stroke-dasharray]')?.setAttribute('opacity', 0);
        } }));
      });
      const throwAt = crumpleAt + 1500, tw = { t: 0 };
      later(throwAt, () => {
        track(animate(tw, { t: [0, 1], duration: 1100, ease: 'inQuad', onUpdate: () => {
          pos.x = cx + (W * .1 - cx) * tw.t; pos.y = cy - Math.sin(tw.t * Math.PI) * H * .22 + (H * .5) * tw.t * tw.t; pos.rot = -5 + tw.t * 540; pos.s = 1 - tw.t * .25; apply();
        }, onComplete: () => sheet.g.remove() }));
      });

      // 4) Retomar: otra hoja entra, se dobla en avión y se lanza hacia el público
      const retakeAt = throwAt + 1500;
      if (first) later(retakeAt, () => showWord(3));
      later(retakeAt, () => {
        const sheet2 = foldingSheet(t.cam, S * 1.12), p2 = { x: cx, y: cy + H * .7, rot: -3, s: 1, sx: 1, a: 1 };   // hoja un poco más grande para que se vea bien cada pliegue
        const ap2 = () => { sheet2.g.setAttribute('transform', `translate(${p2.x} ${p2.y}) rotate(${p2.rot}) scale(${p2.s * p2.sx} ${p2.s})`); sheet2.g.setAttribute('opacity', p2.a); };
        ap2();
        track(animate(p2, { y: cy, duration: 800, ease: 'outCubic', onUpdate: ap2 }));
        const folded = sheet2.play(1100, 1.5);                                     // doblado lento (1.5×) y bien visible; tiempo (relativo a ahora) en que termina
        // (Anime reemplaza las animaciones previas de la misma propiedad, por eso cada fase se crea a su hora; si no, la hoja se quedaba fuera de pantalla)
        later(folded + 200, () => track(animate(p2, { rot: -24, s: .9, duration: 600, ease: 'inOutQuad', onUpdate: ap2 })));
        // el avión gira para apuntar con la punta al público (hacia abajo de la pantalla) ...
        later(folded + 1000, () => track(animate(p2, { rot: 90, s: 1.0, y: cy - 10, duration: 850, ease: 'inOutCubic', onUpdate: ap2 })));
        // ... y sale disparado hacia ellos: crece (se acerca) y se acorta por la perspectiva
        later(folded + 2100, () => {
          const f = { t: 0 };
          track(animate(f, { t: [0, 1], duration: 1500, ease: 'inQuad', onUpdate: () => {
            const k = Math.pow(f.t, 1.5);
            p2.x = cx + (W * .5 - cx) * f.t; p2.y = cy - 10 + (H * .85) * f.t; p2.s = 1 + k * 6.5; p2.sx = 1 - f.t * .45; p2.rot = 90 + Math.sin(f.t * 14) * 4 * (1 - f.t); ap2();
          }, onComplete: () => sheet2.g.remove() }));
          for (let i = 0; i < 10; i++) later(i * 90, () => fadingDot(t.cam, cx + rand(-50, 50), cy + i * 14 + rand(-10, 10), CREAM, rand(3, 6), 700));
        });
      });
      later(retakeAt + 1100 + 3900 * 1.5 + 2100 + 1500 + 3000, () => cycle(false));      // se repite para que la escena no se quede vacía
    };
    cycle(true);
  });

  return { table, foldingSheet, place, rand, AMBER, CREAM, INK, GRAPHITE, pulse };
})();
