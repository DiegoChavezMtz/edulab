// Deck 2 (Producto Dekids), parte 2: letras que caen y robot impresor (5), brocha (6), terror (7), frases (9),
// plano del cohete (11), colección de capturas (12) y aviones que se vuelven cohetes (13).
(() => {
  const { animate, stagger } = anime;
  const { svgEl, mount, burst, fadingDot, ring, track, later, makeRocket, CENTER, COLORS } = moments.kit;
  const { CREAM, INK, rand, pulse } = papel;
  const LIME = '#d9ff20', PINK = '#ff3bb9', CYAN = '#22d7ff';                    // paleta neón de EduLab
  // Colores de los avioncitos que imprime el robot: [ala principal, ala sombreada, pliegue]
  const PLANE_COLORS = [['#d9ff20', '#a9cf00', '#86a800'], ['#ff3bb9', '#d11f98', '#a3157a'], ['#22d7ff', '#13a8cc', '#0c7f9c'], ['#1457ff', '#0f3fc0', '#0b2f94'], ['#ff9f1c', '#d17d0a', '#a65f05'], ['#b57bff', '#8a52d6', '#6a3aa8'], ['#ffffff', '#e1e7f2', '#c0cadc']];
  const NIGHT = '#0b1030';
  const BOTTOM = 'transform-box:fill-box;transform-origin:50% 100%;';
  let uid = 0;

  function paperPlane(parent, { fill = '#ffffff', shade = '#e4eaf3', dark = '#cfd9ea', stroke = 'rgba(0,0,0,.25)' } = {}) {
    const g = svgEl('g', { style: CENTER }, parent), o = { stroke, 'stroke-width': 1.2, 'stroke-linejoin': 'round' };
    svgEl('path', { d: 'M52 0L-22 -19L3 3Z', fill, ...o }, g);
    svgEl('path', { d: 'M52 0L3 3L-15 18Z', fill: shade, ...o }, g);
    svgEl('path', { d: 'M3 3L-22 -19L-15 18Z', fill: dark, ...o }, g);
    return g;
  }
  const bez = (p0, p1, p2, p3) => ({
    at: (t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p0[k] + 3*u*u*t*p1[k] + 3*u*t*t*p2[k] + t*t*t*p3[k]); },
    angle: (t) => { const u = 1 - t; const d = [0, 1].map((k) => 3*u*u*(p1[k]-p0[k]) + 6*u*t*(p2[k]-p1[k]) + 3*t*t*(p3[k]-p2[k])); return Math.atan2(d[1], d[0]); }
  });

  // ---- 5 · Dificultades deseables: el texto se cae letra a letra y un robot imprime aviones que salen volando por todos lados.
  moments.register('papel5', (scene, ctx, wait) => {
    const back = mount(true), front = mount(false), W = innerWidth, H = innerHeight, R = H / 440, bx = W * .5, by = H * .94;
    // robot (coordenadas locales: origen en los pies)
    const spot = svgEl('g', { transform: `translate(${bx} ${by}) scale(${R})` }, back), robot = svgEl('g', { opacity: 0, style: BOTTOM }, spot), body = svgEl('g', { style: BOTTOM }, robot);
    const o = { stroke: '#1b2240', 'stroke-width': 3, 'stroke-linejoin': 'round' };
    svgEl('ellipse', { cx: 0, cy: 2, rx: 84, ry: 8, fill: 'rgba(0,0,0,.45)' }, robot);
    svgEl('rect', { x: -38, y: -36, width: 26, height: 36, rx: 6, fill: '#8c97b3', ...o }, body); svgEl('rect', { x: 12, y: -36, width: 26, height: 36, rx: 6, fill: '#8c97b3', ...o }, body);
    svgEl('rect', { x: -100, y: -140, width: 30, height: 62, rx: 12, fill: '#aab5d0', ...o }, body); svgEl('rect', { x: 70, y: -140, width: 30, height: 62, rx: 12, fill: '#aab5d0', ...o }, body);
    svgEl('rect', { x: -70, y: -156, width: 140, height: 124, rx: 20, fill: '#cdd6ea', ...o }, body);
    svgEl('rect', { x: -54, y: -124, width: 108, height: 56, rx: 8, fill: '#1b2240' }, body);
    svgEl('rect', { x: -46, y: -102, width: 92, height: 9, rx: 4, fill: '#05081a' }, body);                       // la ranura por donde sale el papel
    const lights = [[-42, -78, '#ff7a6b'], [-28, -78, '#ffd84d'], [-14, -78, '#7fd6ff']].map(([x, y, c]) => svgEl('circle', { cx: x, cy: y, r: 4, fill: c }, body));
    svgEl('rect', { x: -52, y: -240, width: 104, height: 80, rx: 18, fill: '#dfe6f4', ...o }, body);
    svgEl('rect', { x: -42, y: -230, width: 84, height: 54, rx: 12, fill: '#0e1530' }, body);
    const eyes = [-18, 18].map((x) => svgEl('ellipse', { cx: x, cy: -204, rx: 9, ry: 12, fill: '#7fd6ff', style: CENTER }, body));
    svgEl('path', { d: 'M-12 -186Q0 -180 12 -186', fill: 'none', stroke: '#7fd6ff', 'stroke-width': 3, 'stroke-linecap': 'round' }, body);
    svgEl('path', { d: 'M0 -240V-258', stroke: '#1b2240', 'stroke-width': 4, 'stroke-linecap': 'round' }, body);
    const bulb = svgEl('circle', { cx: 0, cy: -262, r: 7, fill: '#ff4b4b', style: CENTER }, body);

    // 1) el texto cae letra a letra
    const fallAt = wait(3200);
    later(fallAt, () => {
      const chars = ctx.getSplit?.()?.chars || [], overline = document.getElementById('showOverline');
      track(animate(overline, { opacity: 0, duration: 400 }));
      track(animate(chars, { y: () => H * 1.15, rotate: () => rand(-70, 70), duration: () => rand(900, 1300), delay: stagger(120, { from: 'random' }), ease: 'inQuad' }));   // caen en orden aleatorio
    });
    // 2) aparece el robot y empieza a imprimir
    const robotAt = fallAt + 4000;
    track(animate(robot, { opacity: [0, 1], scale: [.4, 1], duration: 900, delay: robotAt, ease: 'outBack(2)' }));
    track(animate(eyes, { scaleY: [1, .1, 1], duration: 220, delay: () => robotAt + 1000 + rand(0, 3000), loop: true, loopDelay: 2600, ease: 'inOutSine' }));
    track(animate(bulb, { opacity: [1, .25], duration: 450, delay: robotAt, loop: true, alternate: true }));
    track(animate(lights, { opacity: [1, .2], duration: 220, delay: stagger(90, { start: robotAt }), loop: true, alternate: true }));

    let active = 0, printed = 0;
    const slotX = bx, slotY = by - 97 * R;
    const print = () => {
      if (active > 34) return;
      active++; printed++;
      track(animate(body, { scaleY: [1, .96, 1], duration: 150, ease: 'outQuad' }));
      const [cMain, cShade, cDark] = PLANE_COLORS[Math.floor(rand(0, PLANE_COLORS.length))];
      const sheet = svgEl('rect', { x: slotX - 22, y: slotY, width: 44, height: 1, rx: 2, fill: cMain, stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1.2 }, front), out = { h: 1 };
      track(animate(out, { h: [1, 24 * R], duration: 280, ease: 'outQuad', onUpdate: () => sheet.setAttribute('height', out.h) }));
      later(300, () => {                                                       // la hoja sale y se convierte en avión
        sheet.remove();
        const holder = svgEl('g', {}, front), plane = paperPlane(holder, { fill: cMain, shade: cShade, dark: cDark });
        const size = (W * .04 / 74) * rand(.9, 1.5);
        const a = rand(-Math.PI * .98, -Math.PI * .02) + (Math.random() < .25 ? rand(-.5, .5) : 0), far = Math.hypot(W, H) * .75;
        const p3 = [slotX + Math.cos(a) * far, slotY + Math.sin(a) * far], p1 = [slotX + rand(-W * .2, W * .2), slotY - rand(H * .1, H * .4)], p2 = [(slotX + p3[0]) / 2 + rand(-W * .2, W * .2), (slotY + p3[1]) / 2 + rand(-H * .2, H * .2)];
        const path = bez([slotX, slotY], p1, p2, p3), s = { t: 0 }; let last = 0;
        track(animate(plane, { scale: [.2, 1], duration: 260, ease: 'outBack(3)' }));
        track(animate(s, {
          t: [0, 1], duration: rand(1800, 3000), ease: 'inQuad',
          onUpdate: () => {
            const [x, y] = path.at(s.t), ang = path.angle(s.t);
            holder.setAttribute('transform', `translate(${x} ${y}) rotate(${ang * 180 / Math.PI}) scale(${size * (1 + s.t * 1.2)})`);
            const now = performance.now(); if (now - last > 80) { last = now; fadingDot(front, x, y, cMain, 2.8 * size, 520); }
          },
          onComplete: () => { holder.remove(); active--; }
        }));
      });
    };
    const loop = () => { print(); later(printed < 6 ? 520 : printed < 20 ? 300 : 170, loop); };
    later(robotAt + 1100, loop);
  });

  // ---- 6 · Que no se vea tan IA: una brocha gorda embarra pintura neón por toda la pantalla; al terminar, la pintura desaparece y solo queda "MÁS DISEÑO".
  moments.register('papel6', (scene, ctx, wait) => {
    const front = mount(false), W = innerWidth, H = innerHeight;
    const bw = H * .2, bh = bw * .5, step = bw * .6, N = Math.ceil(H / step) + 2, NEON = [LIME, PINK, CYAN, '#1457ff', '#ff9f1c', '#b57bff'];
    const paint = svgEl('g', {}, front);
    const easeIO = (p) => .5 - Math.cos(Math.PI * p) / 2;
    const attr = (o) => Object.fromEntries(Object.entries(o).filter(([, val]) => val !== null && val !== undefined));

    // una franja de pintura por fila: halo, color, brillo húmedo y pelos de la brocha
    const rows = Array.from({ length: N }, (_, i) => {
      const dir = i % 2 ? -1 : 1, y = -bw * .12 + i * step, phase = rand(0, 6), color = NEON[i % NEON.length];
      const x0 = dir > 0 ? -bw * .7 : W + bw * .7, x1 = dir > 0 ? W + bw * .7 : -bw * .7;
      const slope = rand(-bw * .7, bw * .7), amp = rand(.12, .3);
      const pts = Array.from({ length: 24 }, (_, k) => { const t = k / 23; return [x0 + (x1 - x0) * t, y + (t - .5) * slope + Math.sin(t * 8 + phase) * bw * amp + rand(-bw * .04, bw * .04)]; });   // franjas inclinadas y onduladas
      const d = 'M' + pts.map((p) => p.map((n) => n.toFixed(1)).join(' ')).join('L');
      const layers = [
        { w: bw * 1.32, c: color, o: .22 }, { w: bw, c: color, o: 1 }, { w: bw * .15, c: '#ffffff', o: .3, dy: -bw * .24 },
        { w: 3, c: '#ffffff', o: .38, dy: bw * .14 }, { w: 2.5, c: 'rgba(0,0,0,.3)', o: 1, dy: -bw * .06 }, { w: 3, c: '#ffffff', o: .26, dy: bw * .32 }
      ].map((l) => svgEl('path', attr({ d, fill: 'none', stroke: l.c, 'stroke-width': l.w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', opacity: l.o, transform: l.dy ? `translate(0 ${l.dy})` : null }), paint));
      const len = layers[1].getTotalLength();
      layers.forEach((p) => { p.style.strokeDasharray = len; p.style.strokeDashoffset = len; });
      return { layers, len, dir, pts, color };
    });
    const pointAt = (row, p) => { const f = p * (row.pts.length - 1), i = Math.min(row.pts.length - 2, Math.floor(f)), t = f - i; return [row.pts[i][0] + (row.pts[i + 1][0] - row.pts[i][0]) * t, row.pts[i][1] + (row.pts[i + 1][1] - row.pts[i][1]) * t]; };

    // la brocha gorda (la punta está en el origen; se mueve hacia +x y se voltea si va hacia -x)
    const brush = svgEl('g', { opacity: 0 }, front), flip = svgEl('g', {}, brush);
    const hx = -bh * .5 - bw * .22;
    svgEl('polygon', { points: `${hx},${-bw * .14} ${hx},${bw * .14} ${hx - bw * 1.7},${-bw * .55} ${hx - bw * 1.7},${-bw * .98}`, fill: '#e0a860', stroke: '#7a4a1f', 'stroke-width': 3, 'stroke-linejoin': 'round' }, flip);
    svgEl('rect', { x: hx, y: -bw * .38, width: bw * .22, height: bw * .76, rx: 6, fill: '#c9ced6', stroke: '#6b7280', 'stroke-width': 3 }, flip);
    const bristle = svgEl('rect', { x: -bh * .5, y: -bw / 2, width: bh, height: bw, rx: bh * .22, fill: LIME, stroke: 'rgba(0,0,0,.35)', 'stroke-width': 2 }, flip);
    [-.36, -.2, -.04, .12, .28, .42].forEach((k) => svgEl('path', { d: `M${-bh * .46} ${bw * k}H${bh * .46}`, stroke: 'rgba(255,255,255,.4)', 'stroke-width': 2.5, 'stroke-linecap': 'round' }, flip));

    // recorrido: fila a fila (pintar) y saltos entre filas (mover)
    const ordered = rows.map((r) => r).sort(() => Math.random() - .5);               // se embarra en desorden, por todos lados
    const segs = [];
    ordered.forEach((row, i) => {
      segs.push({ type: 'paint', row, i, dur: 720 });
      if (i < N - 1) segs.push({ type: 'move', from: pointAt(row, 1), to: pointAt(ordered[i + 1], 0), dur: 240, i });
    });
    const total = segs.reduce((acc, s) => acc + s.dur, 0), state = { u: 0 };
    let finished = -1, splatted = -1;
    const splat = (x, y, color, n = 11) => { for (let k = 0; k < n; k++) later(k * 18, () => fadingDot(front, x + rand(-40, 40), y + rand(-60, 60), color, rand(4, 11), 900)); };
    const paintAll = () => {
      track(animate(state, {
        u: [0, total], duration: total, ease: 'linear',
        onBegin: () => brush.setAttribute('opacity', 1),
        onUpdate: () => {
          let u = state.u, seg = segs[0];
          for (const s of segs) { if (u <= s.dur) { seg = s; break; } u -= s.dur; seg = s; }
          const p = Math.min(1, u / seg.dur);
          let x, y, ang = 0;
          if (seg.type === 'paint') {
            const q = easeIO(p), row = seg.row, [px, py] = pointAt(row, q);
            for (let r = finished + 1; r < seg.i; r++) { ordered[r].layers.forEach((l) => { l.style.strokeDashoffset = 0; }); finished = r; }
            row.layers.forEach((l) => { l.style.strokeDashoffset = row.len * (1 - q); });
            bristle.setAttribute('fill', row.color); flip.setAttribute('transform', `scale(${row.dir} 1)`);
            x = px; y = py; ang = Math.sin(q * 12) * 8 + row.dir * -6;
            if (Math.random() < .12) fadingDot(front, px + rand(-30, 30), py + rand(-bw * .6, bw * .6), row.color, rand(3, 8), 800);
          } else {
            x = seg.from[0] + (seg.to[0] - seg.from[0]) * easeIO(p); y = seg.from[1] + (seg.to[1] - seg.from[1]) * easeIO(p) - Math.sin(p * Math.PI) * bw * .25; ang = -18;
            if (splatted < seg.i) { splatted = seg.i; splat(seg.from[0], seg.from[1], ordered[seg.i].color); }
          }
          brush.setAttribute('transform', `translate(${x} ${y}) rotate(${ang})`);
        },
        onComplete: () => {
          rows.forEach((r) => r.layers.forEach((l) => { l.style.strokeDashoffset = 0; }));
          pulse(1.4);
          // todo está cubierto: se cambia el texto por debajo y la pintura desaparece, como si se retirara
          later(500, () => {
            ctx.retitle?.('PONLE MÁS DISEÑO', { hold: true, exit: false });
            track(animate(brush, { opacity: 0, duration: 500, ease: 'inQuad' }));
            rows.forEach((r, i) => r.layers.forEach((l) => track(animate(l, { strokeDashoffset: [0, -r.len], duration: 720, delay: 250 + i * 130, ease: 'inOutQuad' }))));
            const eraseEnd = 250 + N * 130 + 720;
            later(eraseEnd - 650, () => ctx.reveal?.({ parts: ['chars'] }));
            later(eraseEnd + 100, () => paint.remove());
          });
        }
      }));
    };
    later(wait(2600), paintAll);                                            // primero se lee "Que no se vea tan IA"
  });

  // ---- 7 · "¿Para qué atender un curso si le pregunto a mi IA?": un tono de terror (latido, luces que fallan, glitch, ojos, goteo).
  moments.register('papel7', (scene, ctx, wait) => {
    const back = mount(true), front = mount(false), W = innerWidth, H = innerHeight;
    const defs = svgEl('defs', {}, back), id = `h${++uid}`;
    const vg = svgEl('radialGradient', { id }, defs);
    [[.35, 'rgba(255,59,185,0)'], [1, 'rgba(255,59,185,.5)']].forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, vg));
    const beat = svgEl('rect', { width: W, height: H, fill: `url(#${id})`, opacity: .2 }, back);
    track(animate(beat, { opacity: [{ to: .85, duration: 110 }, { to: .35, duration: 130 }, { to: .7, duration: 110 }, { to: .15, duration: 900 }], duration: 1250, loop: true, ease: 'outQuad' }));

    // luces que fallan
    const dark = svgEl('rect', { width: W, height: H, fill: '#000', opacity: 0 }, front);
    const flicker = () => {
      const n = Math.floor(rand(2, 5)), seq = Array.from({ length: n * 2 }, (_, i) => ({ to: i % 2 ? 0 : rand(.55, .95), duration: rand(40, 110) }));
      track(animate(dark, { opacity: seq, duration: seq.reduce((a, s) => a + s.duration, 0) }));
      later(rand(2200, 5200), flicker);
    };
    later(wait(2500), flicker);
    // glitch del título
    const h1 = document.getElementById('showTitle');
    const glitch = () => { h1.classList.remove('glitch'); void h1.offsetWidth; h1.classList.add('glitch'); later(rand(2600, 6000), glitch); };
    later(wait(3200), glitch);
    // líneas de interferencia (VHS)
    const lines = Array.from({ length: 12 }, () => svgEl('rect', { x: 0, y: rand(0, H), width: rand(.2, 1) * W, height: rand(1, 3), fill: '#fff', opacity: 0 }, front));
    track(animate({ t: 0 }, { t: [0, 1], duration: 90, loop: true, ease: 'linear', onLoop: () => lines.forEach((l) => { l.setAttribute('y', rand(0, H)); l.setAttribute('x', rand(0, W * .5)); l.setAttribute('opacity', Math.random() < .6 ? rand(.03, .12) : 0); }) }));
    // ojos que observan desde la oscuridad
    const watch = () => {
      const x = Math.random() < .5 ? rand(.06, .22) * W : rand(.78, .94) * W, y = rand(.2, .75) * H, g = svgEl('g', { opacity: 0, style: CENTER }, front);
      [-22, 22].forEach((dx) => { svgEl('ellipse', { cx: x + dx, cy: y, rx: 11, ry: 5, fill: LIME, style: 'filter:drop-shadow(0 0 8px #d9ff20)' }, g); svgEl('circle', { cx: x + dx, cy: y, r: 2, fill: '#101800' }, g); });
      track(animate(g, { opacity: [0, 1, 1, 0], duration: 2600, ease: 'linear', onComplete: () => g.remove() }));
      track(animate(g, { scaleY: [1, .05, 1], duration: 200, delay: 1100, ease: 'inOutSine' }));
      later(rand(7000, 11000), watch);
    };
    later(wait(6000), watch);
    // goteo líquido: la gota crece colgando (lenta, luego acelera), se estrecha, se desprende y cae estirada; salpica, forma ondas y un charco
    const defsF = svgEl('defs', {}, front), grad = svgEl('linearGradient', { id: `pg${uid}`, x1: 0, y1: 0, x2: 0, y2: 1 }, defsF);
    [[0, '#ff7fd8'], [.6, '#ff3bb9'], [1, '#b3107f']].forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, grad));
    const FILL = `url(#pg${uid})`, pool = { h: 0 }, poolPath = svgEl('path', { fill: FILL, opacity: .95 }, front), poolShine = svgEl('path', { fill: 'none', stroke: 'rgba(255,255,255,.35)', 'stroke-width': 2, 'stroke-linecap': 'round' }, front);
    const drawPool = () => {
      const top = H - pool.h, pts = Array.from({ length: 33 }, (_, i) => `${(i / 32) * W} ${top + Math.sin(i * .9 + performance.now() / 700) * Math.min(3, pool.h * .15)}`);
      poolPath.setAttribute('d', `M0 ${H + 2}L${pts.join('L')}L${W} ${H + 2}Z`); poolShine.setAttribute('d', `M${W * .08} ${top + 4}Q${W * .3} ${top + 1} ${W * .5} ${top + 4}`);
    };
    track(animate({ t: 0 }, { t: [0, 1], duration: 700, loop: true, ease: 'linear', onUpdate: () => { if (pool.h > 0) drawPool(); } }));
    const drip = () => {
      const chars = (ctx.getSplit?.()?.chars || []).filter((c) => c.textContent.trim());
      if (chars.length) {
        const r = chars[Math.floor(rand(0, chars.length))].getBoundingClientRect(), x = r.left + r.width * rand(.25, .75), y0 = r.bottom - r.height * .16;
        const w = rand(5, 10), maxLen = rand(70, 250), s = { len: 2, r: w * .6, fall: 0, stretch: 1, detached: false };
        const g = svgEl('g', {}, front), tail = svgEl('path', { fill: FILL, stroke: FILL, 'stroke-width': 1.5, 'stroke-linejoin': 'round' }, g);
        const head = svgEl('ellipse', { fill: FILL }, g), shine = svgEl('ellipse', { fill: '#fff', opacity: .5 }, g), seam = svgEl('path', { fill: 'none', stroke: 'rgba(255,255,255,.28)', 'stroke-width': 1.6, 'stroke-linecap': 'round' }, g);
        let headY0 = 0;
        const draw = () => {
          const len = s.len, nk = Math.max(1.4, w * .34 - len * .0016), hy = (s.detached ? headY0 + s.fall : y0 + len + s.r * .45), rx = s.r * (s.detached ? 1 / Math.sqrt(s.stretch) : 1), ry = s.r * (s.detached ? s.stretch : 1);
          tail.setAttribute('d', `M${x - w / 2} ${y0 - 1}L${x + w / 2} ${y0 - 1}C${x + w / 2} ${y0 + len * .4} ${x + nk} ${y0 + len * .72} ${x + nk} ${y0 + len}L${x - nk} ${y0 + len}C${x - nk} ${y0 + len * .72} ${x - w / 2} ${y0 + len * .4} ${x - w / 2} ${y0 - 1}Z`);
          head.setAttribute('cx', x); head.setAttribute('cy', hy); head.setAttribute('rx', rx); head.setAttribute('ry', ry);
          shine.setAttribute('cx', x - rx * .35); shine.setAttribute('cy', hy - ry * .3); shine.setAttribute('rx', rx * .22); shine.setAttribute('ry', ry * .32);
          seam.setAttribute('d', `M${x - w * .22} ${y0 + 2}L${x - w * .16} ${y0 + Math.max(3, len * .8)}`);
        };
        draw();
        track(animate(s, {                                                    // 1) cuelga y crece, cada vez más rápido
          len: [2, maxLen], r: [w * .6, w * 1.5], duration: rand(2400, 4600), ease: 'inCubic', onUpdate: draw,
          onComplete: () => {
            headY0 = y0 + maxLen + s.r * .45; s.detached = true;               // 2) se estrangula: el hilo se recoge y la gota se separa
            track(animate(s, { len: [maxLen, 5], duration: 420, ease: 'outQuad', onUpdate: draw }));
            const dist = (H - pool.h) - headY0 - s.r;
            track(animate(s, {                                                // 3) cae acelerando y se estira
              fall: [0, Math.max(40, dist)], stretch: [1, 2.1], duration: Math.max(500, Math.sqrt(Math.max(40, dist)) * 62), ease: 'inQuad', onUpdate: draw,
              onComplete: () => {                                              // 4) salpica, ondas y sube el charco
                g.remove();
                const px = x, py = H - pool.h;
                for (let k = 0; k < 7; k++) later(k * 14, () => fadingDot(front, px + rand(-10, 10), py - rand(0, 8), '#ff5ccd', rand(2.5, 5), 650));
                const ripple = svgEl('ellipse', { cx: px, cy: py, rx: 4, ry: 1.5, fill: 'none', stroke: 'rgba(255,170,230,.8)', 'stroke-width': 2, style: CENTER }, front);
                track(animate(ripple, { scale: [1, 9], opacity: [.9, 0], duration: 900, ease: 'outQuad', onComplete: () => ripple.remove() }));
                track(animate(pool, { h: Math.min(26, pool.h + 1.8), duration: 500, ease: 'outQuad', onUpdate: drawPool }));
              }
            }));
            track(animate(g, { opacity: [1, 1], duration: 1 }));
          }
        }));
      }
      later(rand(450, 950), drip);
    };
    later(wait(3500), drip);
  });

  // ---- 8 · "Tiene razón" → se disuelve → "¿Qué va a preguntar?" (letra de marcador lima, como en las diapositivas 9 y de las presentaciones 1 y 3).
  moments.register('papel8', (scene, ctx, wait) => {
    const front = mount(false), W = innerWidth, H = innerHeight;
    const chars = () => (ctx.getSplit?.()?.chars || []).filter((c) => c.textContent.trim());
    const rect = () => document.getElementById('showTitle').getBoundingClientRect();
    // 1) "Tiene razón": se queda un momento para que se lea y se asiente
    later(wait(4800), () => {
      const cs = chars(), b = rect();
      track(animate(cs, { y: () => rand(-H * .35, -H * .12), x: () => rand(-W * .08, W * .08), rotate: () => rand(-50, 50), opacity: 0, scale: () => rand(.4, 1.3), duration: () => rand(700, 1000), delay: stagger(45, { from: 'random' }), ease: 'inExpo' }));   // desaparece
      burst(front, b.left + b.width / 2, b.top + b.height / 2, { count: 26, spread: 260, size: 5 });
      // 2) "¿Qué va a preguntar?": cada letra entra como si se estuviera pensando; el signo final se queda inquieto
      later(1000, () => {
        ctx.retitle?.('¿QUÉ VA A PREGUNTAR?', { hold: true, exit: false });
        later(120, () => {
          const cs2 = chars();
          track(animate(cs2, { opacity: [0, 1], y: ['.7em', 0], rotate: { from: () => rand(-18, 18), to: 0 }, scale: [.3, 1], duration: 800, delay: stagger(85), ease: 'outBack(2.4)' }));
          const last = cs2[cs2.length - 1], total = 800 + cs2.length * 85;
          later(total + 200, () => {
            track(animate(last, { rotate: [-10, 10], duration: 700, loop: true, alternate: true, ease: 'inOutSine' }));
            const b2 = rect(); ring(front, b2.right - 40, b2.top + b2.height * .5, Math.max(W, H) * .3, { color: LIME, duration: 1400, width: 3 });
          });
        });
      });
    });
  });

  // ---- 9 · Incomodar, pero bien → (se hace añicos) → poco a poco → bien diseñado → bajo control (se queda). Letra de marcador, como en las presentaciones 1 y 3.
  moments.register('papel9', (scene, ctx, wait) => {
    const front = mount(false), W = innerWidth, H = innerHeight;
    const chars = () => (ctx.getSplit?.()?.chars || []).filter((c) => c.textContent.trim());
    const wordChars = (i) => { const w = ctx.getSplit?.()?.words?.[i]; return w ? [...w.querySelectorAll('[data-char]')] : []; };
    const rect = () => document.getElementById('showTitle').getBoundingClientRect();
    let chrome = [];                                                          // decoración de la fase actual; se retira al cambiar de frase
    const addChrome = (el) => { chrome.push(el); return el; };
    const clearChrome = (ms = 350) => { chrome.forEach((el) => track(animate(el, { opacity: 0, duration: ms, onComplete: () => el.remove() }))); chrome = []; };
    const strokeIn = (el, ms, delay = 0) => { const len = el.getTotalLength(); el.style.strokeDasharray = len; el.style.strokeDashoffset = len; track(animate(el, { strokeDashoffset: [len, 0], duration: ms, delay, ease: 'inOutSine' })); };
    const swap = (text, then) => { ctx.retitle?.(text, { hold: true, exit: false }); later(80, then); };

    // A) "Incomodar": la palabra tiembla, nerviosa e incómoda; "pero bien" se mantiene firme
    const nerv = { on: false };
    later(wait(1800), () => {
      nerv.on = true; track(animate(wordChars(0), { color: PINK, duration: 500 })); track(animate(wordChars(2), { color: LIME, duration: 700, delay: 300 }));
      track(animate({ t: 0 }, { t: [0, 1], duration: 70, loop: true, ease: 'linear', onLoop: () => {
        if (!nerv.on) return;
        wordChars(0).forEach((c) => { c.style.transform = `translate(${rand(-5, 5)}px, ${rand(-4, 4)}px) rotate(${rand(-8, 8)}deg) skewX(${rand(-10, 10)}deg)`; });
      } }));
    });

    // B) la frase se hace añicos: las letras salen disparadas y estalla una nube de chispas
    later(wait(6200), () => {
      nerv.on = false;
      const cs = chars(), b = rect(); cs.forEach((c) => { c.style.transform = ''; });
      track(animate(cs, { x: () => rand(-W * .6, W * .6), y: () => rand(-H * .6, H * .6), rotate: () => rand(-420, 420), scale: () => rand(.2, 2.2), opacity: [1, 0], duration: () => rand(800, 1300), ease: 'outExpo' }));
      burst(front, b.left + b.width / 2, b.top + b.height / 2, { count: 44, spread: 380, size: 6 }); ring(front, b.left + b.width / 2, b.top + b.height / 2, Math.max(W, H) * .5, { color: PINK, duration: 900, width: 4 }); pulse(1.3);

      // C) "Poco a poco": las letras crecen una a una, despacio, mientras una línea avanza muy lento
      later(1100, () => swap('POCO A POCO', () => {
        const cs2 = chars(), b2 = rect();
        track(animate(cs2, { opacity: [0, 1], scale: [.05, 1], y: ['.7em', 0], duration: 1000, delay: stagger(430), ease: 'outElastic(1, .55)' }));
        const base = svgEl('path', { d: `M${b2.left} ${b2.bottom + 24}H${b2.right}`, stroke: 'rgba(255,255,255,.18)', 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none' }, front);
        const fill = svgEl('path', { d: `M${b2.left} ${b2.bottom + 24}H${b2.right}`, stroke: LIME, 'stroke-width': 5, 'stroke-linecap': 'round', fill: 'none', style: 'filter:drop-shadow(0 0 8px #d9ff20)' }, front);
        addChrome(base); addChrome(fill);
        const len = b2.width, dot = addChrome(svgEl('circle', { cx: b2.left, cy: b2.bottom + 24, r: 9, fill: '#fff', style: 'filter:drop-shadow(0 0 10px #d9ff20)' }, front)), st = { p: 0 };
        fill.style.strokeDasharray = len; fill.style.strokeDashoffset = len;
        track(animate(st, { p: [0, 1], duration: cs2.length * 430 + 800, ease: 'inOutSine', onUpdate: () => { fill.style.strokeDashoffset = len * (1 - st.p); dot.setAttribute('cx', b2.left + len * st.p); } }));
      }));
    });

    // D) "Bien diseñado": las letras se acomodan con precisión y aparecen las herramientas de diseño (caja de selección, guías, medidas y cursor)
    later(wait(6200 + 1100 + 6200), () => {
      const cs = chars();
      clearChrome(300);
      track(animate(cs, { y: () => rand(H * .2, H * .55), x: () => rand(-90, 90), rotate: () => rand(-50, 50), opacity: 0, duration: 800, delay: stagger(36, { from: 'random' }), ease: 'inQuad' }));   // se deshacen como arena
      later(950, () => swap('BIEN DISEÑADO', () => {
        const cs2 = chars();
        track(animate(cs2, { x: { from: () => rand(-W * .4, W * .4), to: 0 }, y: { from: () => rand(-H * .4, H * .4), to: 0 }, rotate: { from: () => rand(-140, 140), to: 0 }, scale: { from: () => rand(.4, 1.7), to: 1 }, opacity: [0, 1], duration: () => rand(900, 1300), delay: stagger(55), ease: 'outBack(1.3)' }));
        later(1900, () => {
          const b = rect(), pad = 22, x0 = b.left - pad, y0 = b.top - pad, w = b.width + pad * 2, h = b.height + pad * 2;
          const sel = addChrome(svgEl('rect', { x: x0, y: y0, width: w, height: h, fill: 'none', stroke: LIME, 'stroke-width': 2.5, 'stroke-dasharray': '10 8', style: 'filter:drop-shadow(0 0 6px #d9ff20)' }, front));
          track(animate(sel, { strokeDashoffset: [0, -180], duration: 6000, loop: true, ease: 'linear' }));
          const handles = [[x0, y0], [x0 + w / 2, y0], [x0 + w, y0], [x0, y0 + h / 2], [x0 + w, y0 + h / 2], [x0, y0 + h], [x0 + w / 2, y0 + h], [x0 + w, y0 + h]].map(([hx, hy]) => addChrome(svgEl('rect', { x: hx - 7, y: hy - 7, width: 14, height: 14, fill: '#fff', stroke: LIME, 'stroke-width': 2.5, style: CENTER }, front)));
          track(animate(handles, { scale: [0, 1], opacity: [0, 1], duration: 500, delay: stagger(60), ease: 'outBack(3)' }));
          const guides = [y0, y0 + h].map((gy) => addChrome(svgEl('path', { d: `M0 ${gy}H${W}`, stroke: CYAN, 'stroke-width': 1.5, 'stroke-dasharray': '6 8', opacity: .55, fill: 'none' }, front)));
          guides.forEach((gl) => strokeIn(gl, 900));
          const guidesV = [x0, x0 + w].map((gx) => addChrome(svgEl('path', { d: `M${gx} 0V${H}`, stroke: CYAN, 'stroke-width': 1.5, 'stroke-dasharray': '6 8', opacity: .4, fill: 'none' }, front)));
          guidesV.forEach((gl) => strokeIn(gl, 900, 150));
          const label = addChrome(svgEl('text', { display: 'none', x: x0 + w, y: y0 + h + 28, 'text-anchor': 'end', 'font-family': 'DM Mono, monospace', 'font-size': 15, fill: LIME, opacity: 0 }, front));
          label.textContent = `${Math.round(w)} × ${Math.round(h)}`;
          track(animate(label, { opacity: [0, 1], duration: 500, delay: 700 }));
          // cursor que hace clic en una esquina: "se confirma el diseño"
          const cur = addChrome(svgEl('path', { d: 'M0 0L0 26L7 20L12 32L17 30L12 18L21 18Z', fill: '#fff', stroke: '#030711', 'stroke-width': 2, 'stroke-linejoin': 'round', opacity: 0 }, front)), c = { x: W * .85, y: H * .85 };
          const place = () => cur.setAttribute('transform', `translate(${c.x} ${c.y})`);
          place(); track(animate(cur, { opacity: [0, 1], duration: 300, delay: 600 }));
          track(animate(c, { x: x0 + w, y: y0 + h, duration: 1300, delay: 700, ease: 'inOutCubic', onUpdate: place, onComplete: () => {
            ring(front, x0 + w, y0 + h, 70, { color: LIME, duration: 600, width: 3 });
            track(animate(chars(), { scale: [1, 1.05, 1], duration: 450, ease: 'outBack(3)' })); pulse(.9);
          } }));
        });
      }));
    });

    // E) "Bajo control": las letras caen con peso y rebotan, un visor se cierra sobre la frase y se queda
    later(wait(6200 + 1100 + 6200 + 950 + 7600), () => {
      const cs = chars();
      clearChrome(400);
      track(animate(cs, { y: '-.45em', opacity: 0, rotate: () => rand(-20, 20), duration: 400, delay: stagger(22, { from: 'last' }), ease: 'in(2)' }));
      later(650, () => swap('BAJO CONTROL', () => {
        const cs2 = chars();
        track(animate(cs2, { y: { from: () => -H * rand(.55, .9), to: 0 }, rotate: { from: () => rand(-35, 35), to: 0 }, opacity: [0, 1], duration: 1100, delay: stagger(70), ease: 'outBounce' }));
        later(1500, () => {
          const b = rect(), pad = 28, x0 = b.left - pad, y0 = b.top - pad, x1 = b.right + pad, y1 = b.bottom + pad, L = Math.min(70, (x1 - x0) * .12);
          const corner = (d) => addChrome(svgEl('path', { d, stroke: LIME, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', fill: 'none', style: 'filter:drop-shadow(0 0 8px #d9ff20);' + CENTER }, front));
          [`M${x0} ${y0 + L}V${y0}H${x0 + L}`, `M${x1 - L} ${y0}H${x1}V${y0 + L}`, `M${x1} ${y1 - L}V${y1}H${x1 - L}`, `M${x0 + L} ${y1}H${x0}V${y1 - L}`].forEach((d) => { const p = corner(d); track(animate(p, { scale: [1.5, 1], opacity: [0, 1], duration: 700, ease: 'outExpo' })); });
          const under = addChrome(svgEl('path', { d: `M${x0 + L} ${y1 + 14}H${x1 - L}`, stroke: LIME, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }, front)); strokeIn(under, 900, 300);
          const mx = (x0 + x1) / 2, my = (y0 + y1) / 2, R = Math.hypot(x1 - x0, y1 - y0) / 2;
          const lock = addChrome(svgEl('circle', { cx: mx, cy: my, r: R, fill: 'none', stroke: CYAN, 'stroke-width': 2, opacity: 0, style: CENTER }, front));
          track(animate(lock, { scale: [2.6, 1], opacity: [0, .7, .25], duration: 1200, ease: 'outExpo' }));
          pulse(.8);
          const calm = () => { ring(front, mx, my, R * 1.9, { color: LIME, duration: 2200, width: 2 }); later(3600, calm); };      // un pulso tranquilo cada pocos segundos
          later(1500, calm);
        });
      }));
    });
  });

  // ---- 11 · Iteraciones más rápidas: el plano de un cohete evoluciona. v1 no despega · v2 se cae · v3 sale volando sin control · v4 futurista, grande, y sí despega.
  moments.register('papel11', (scene, ctx, wait) => {
    const box = document.getElementById('showExtra'); box.innerHTML = '';
    const svg = svgEl('svg', { viewBox: '0 0 460 420', style: 'width:100%;max-height:62vh;overflow:visible;' }, box);
    const base = { fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    const drawn = (parent, d, attrs = {}) => { const p = svgEl('path', { d, ...base, stroke: CYAN, 'stroke-width': 2.4, ...attrs }, parent), len = p.getTotalLength(); p.style.strokeDasharray = len; p.style.strokeDashoffset = len; p.dataset.len = len; return p; };
    const trace = (paths, at, step, dur = 650) => paths.forEach((p, i) => track(animate(p, { strokeDashoffset: [Number(p.dataset.len), 0], duration: dur, delay: at + i * step, ease: 'inOutSine' })));
    const puff = (x, y, n = 6) => { for (let i = 0; i < n; i++) later(i * 70, () => fadingDot(svg, x + rand(-18, 18), y + rand(0, 14), 'rgba(205,220,240,.55)', rand(9, 18), 1100)); };
    const flick = (el, on, big = 1) => track(animate(el, { opacity: on ? [0, 1, .5, 1, .6, 1] : [1, .3, .9, .1, .6, 0], scaleY: on ? [.2, big] : [big, .1], duration: on ? 500 : 900, ease: 'inOutSine' }));
    const tip = 'transform-box:fill-box;transform-origin:50% 0%;';

    const cycle = () => {
      svg.innerHTML = '';
      // ---- cohete v1/v2/v3 (una sola pieza que se va modificando)
      const R = { x: 0, y: 0, r: 0, a: 1 };
      const rocket = svgEl('g', { style: 'transform-box:fill-box;transform-origin:50% 50%;' }, svg);
      const applyR = () => { rocket.style.transform = `translate(${R.x}px, ${R.y}px) rotate(${R.r}deg)`; rocket.style.opacity = R.a; };
      const hull = ['M230 40C262 80 270 150 266 250L194 250C190 150 198 80 230 40Z', 'M194 214H266', 'M230 130a20 20 0 1 0 .01 0', 'M230 138a12 12 0 1 0 .01 0', 'M208 250L202 280L258 280L252 250Z'].map((d) => drawn(rocket, d));
      const finsV1 = ['M194 214L158 292L194 268Z', 'M266 214L302 292L266 268Z'].map((d) => drawn(rocket, d));
      const finsV2 = ['M194 200L132 318L194 272Z', 'M266 200L328 318L266 272Z', 'M194 232L176 262', 'M266 232L284 262'].map((d) => drawn(rocket, d, { stroke: LIME }));
      const boosters = ['M190 150C174 176 172 246 178 282L192 282L192 150Z', 'M270 150C286 176 288 246 282 282L268 282L268 150Z', 'M204 96L184 128L206 124', 'M256 96L276 128L254 124'].map((d) => drawn(rocket, d, { stroke: LIME }));
      const flame = svgEl('path', { d: 'M214 280Q230 352 246 280Z', fill: LIME, opacity: 0, style: tip }, rocket), flame2 = svgEl('path', { d: 'M222 280Q230 326 238 280Z', fill: '#fff', opacity: 0, style: tip }, rocket);
      const dims = [drawn(svg, 'M340 40V280M332 40H348M332 280H348', { 'stroke-width': 1.6, opacity: .7 }), drawn(svg, 'M194 316H266M194 308V324M266 308V324', { 'stroke-width': 1.6, opacity: .7 })];
      const label = svgEl('text', { display: 'none', x: 18, y: 34, 'font-family': 'DM Mono, monospace', 'font-size': 22, fill: LIME, opacity: 0, style: CENTER }, svg); label.textContent = 'v1';
      const setLabel = (text) => { label.textContent = text; track(animate(label, { opacity: [0, 1], scale: [1.6, 1], duration: 500, ease: 'outBack(2)' })); };
      const cross = svgEl('path', { d: 'M350 110l30 30M380 110l-30 30', stroke: PINK, 'stroke-width': 5, 'stroke-linecap': 'round', opacity: 0, style: CENTER }, svg);
      const mark = svgEl('ellipse', { cx: 230, cy: 285, rx: 120, ry: 52, fill: 'none', stroke: PINK, 'stroke-width': 2.4, 'stroke-dasharray': '8 8', opacity: 0 }, svg);
      const shake = (ms, amp) => { const s = { p: 0 }; track(animate(s, { p: [0, 1], duration: ms, ease: 'linear', onUpdate: () => { R.x = (Math.random() - .5) * amp; R.y = (Math.random() - .5) * amp; applyR(); }, onComplete: () => { R.x = 0; R.y = 0; applyR(); } })); };
      const showCross = () => track(animate(cross, { opacity: [0, 1], scale: [.4, 1], duration: 400, ease: 'outBack(3)' }));
      const tailOf = (dist = 70) => [230 + R.x - Math.sin(R.r * Math.PI / 180) * dist, 250 + R.y + Math.cos(R.r * Math.PI / 180) * dist];
      applyR();

      // v1: se dibuja el plano y no despega
      const t0 = wait(700) ;
      track(animate(label, { opacity: [0, 1], duration: 500, delay: t0 })); trace(hull, t0 + 300, 650); trace(finsV1, t0 + 300 + hull.length * 650, 500); trace(dims, t0 + 300 + hull.length * 650 + 700, 600);
      const A = t0 + 6200;
      later(A, () => { flick(flame, true); flick(flame2, true); shake(1500, 5); puff(230, 292, 4); });
      later(A + 1800, () => { flick(flame, false); flick(flame2, false); puff(230, 292, 8); showCross(); });
      // v2: aletas más grandes... y se cae
      const B = A + 3600;
      later(B, () => {
        track(animate(cross, { opacity: 0, duration: 300 })); track(animate(mark, { opacity: [0, 1, .5, 1], duration: 900 }));
        track(animate(finsV1, { opacity: .22, duration: 700, delay: 500 })); trace(finsV2, 700, 450, 650);
        later(1300, () => setLabel('v2')); later(3000, () => track(animate(mark, { opacity: 0, duration: 400 })));
      });
      const C = B + 4300;
      later(C, () => { flick(flame, true); flick(flame2, true); shake(1000, 6); puff(230, 292, 5); });
      later(C + 1100, () => {
        track(animate(R, { y: -90, duration: 900, ease: 'outQuad', onUpdate: applyR }));                         // se eleva un poco...
        later(950, () => { flick(flame, false); flick(flame2, false);                                                // ...se le apaga el motor y cae girando
          track(animate(R, { y: 150, r: 38, duration: 1250, ease: 'inQuad', onUpdate: applyR, onComplete: () => {
            burst(svg, 230, 395, { count: 18, spread: 130, size: 4 }); puff(230, 395, 10); showCross();
            track(animate(R, { r: 74, y: 160, duration: 400, ease: 'outBounce', onUpdate: applyR }));
          } }));
        });
      });
      later(C + 5400, () => { track(animate(R, { a: 0, duration: 350, onUpdate: applyR })); track(animate(cross, { opacity: 0, duration: 300 })); });
      // v3: boosters y canards... y sale volando por todos lados
      const D = C + 6300;
      later(D, () => { R.x = 0; R.y = 0; R.r = 0; R.a = 0; applyR(); track(animate(R, { a: 1, duration: 500, onUpdate: applyR })); trace(boosters, 500, 380, 600); finsV2.forEach((p) => { p.style.strokeDashoffset = 0; }); });
      later(D + 700, () => setLabel('v3'));
      const E = D + 4200;
      later(E, () => { flick(flame, true, 1.8); flick(flame2, true, 1.8); shake(700, 8); puff(230, 292, 6); });
      later(E + 800, () => {
        const wp = Array.from({ length: 9 }, () => ({ x: rand(-300, 300), y: rand(-280, 130), r: rand(-540, 540), d: rand(500, 800) })); wp.push({ x: -420, y: -420, r: -900, d: 800 });
        let last = 0, n = 0;
        track(animate(R, {
          x: wp.map((w) => ({ to: w.x, duration: w.d, ease: 'inOutSine' })), y: wp.map((w) => ({ to: w.y, duration: w.d, ease: 'inOutSine' })), r: wp.map((w) => ({ to: w.r, duration: w.d, ease: 'inOutSine' })),
          duration: wp.reduce((acc, w) => acc + w.d, 0),
          onUpdate: () => {
            applyR(); const now = performance.now(); if (now - last < 26) return; last = now;
            const [tx, ty] = tailOf(75); fadingDot(svg, tx + rand(-5, 5), ty + rand(-5, 5), COLORS[n++ % 3], rand(4, 8), 800);
          }
        }));
        pulse(1.1);
      });
      later(E + 8800, () => { rocket.remove(); });
      // v4: futurista, más grande, sí despega
      const F = E + 9400;
      later(F, () => {
        dims.forEach((p) => track(animate(p, { opacity: 0, duration: 400, onComplete: () => p.remove() })));
        const B4 = { y: 0, a: 1 }, big = svgEl('g', {}, svg), applyB = () => { big.style.transform = `translateY(${B4.y}px)`; big.style.opacity = B4.a; };
        big.style.cssText = 'transform-box:fill-box;';
        const tr = (d, attrs = {}) => drawn(big, d, { 'stroke-width': 2.6, ...attrs });
        const glow = drawn(big, 'M230 22C254 66 264 130 264 220L264 332L196 332L196 220C196 130 206 66 230 22Z', { 'stroke-width': 11, opacity: .14 });
        const parts = [
          tr('M230 22C254 66 264 130 264 220L264 332L196 332L196 220C196 130 206 66 230 22Z'),
          tr('M196 118H264M196 236H264', { stroke: 'rgba(34,215,255,.55)', 'stroke-width': 1.6 }), tr('M230 22V332', { stroke: 'rgba(34,215,255,.4)', 'stroke-width': 1.4 }),
          tr('M230 84C246 98 248 128 230 150C212 128 214 98 230 84Z', { stroke: LIME }),
          tr('M196 224L118 344L136 356L196 300ZM264 224L342 344L324 356L264 300Z', { stroke: LIME }),
          tr('M176 150C164 190 164 296 172 336L194 336L194 160ZM284 150C296 190 296 296 288 336L266 336L266 160Z', { stroke: PINK }),
          tr('M206 332L200 356L222 356L218 332ZM222 332L218 360L242 360L238 332ZM242 332L238 356L260 356L254 332Z'),
          tr('M206 170V300M254 170V300', { stroke: LIME, 'stroke-width': 1.6 }),
          tr('M222 40L238 40M218 56L242 56', { stroke: PINK, 'stroke-width': 1.6 })
        ];
        const dim4 = tr('M372 22V360M364 22H380M364 360H380', { 'stroke-width': 1.6, opacity: .7 });
        const flames = [['M207 356Q211 420 215 356Z', LIME, .8], ['M224 360Q230 450 236 360Z', '#ffffff', 1], ['M245 356Q249 420 253 356Z', LIME, .8], ['M196 356Q230 480 264 356Z', CYAN, .35]].map(([d, c, o]) => { const f = svgEl('path', { d, fill: c, opacity: 0, style: tip }, big); f.dataset.o = o; return f; });
        trace([glow], 0, 0, 800); trace(parts, 300, 420, 700); trace([dim4], 300 + parts.length * 420, 0, 700);
        setLabel('v4');
        const G = 300 + parts.length * 420 + 1300;
        const tt = svgEl('text', { display: 'none', x: 230, y: 12, 'text-anchor': 'middle', 'font-family': 'DM Mono, monospace', 'font-size': 20, fill: CYAN, opacity: 0, style: CENTER }, svg);
        ['T-3', 'T-2', 'T-1'].forEach((txt, i) => later(G + i * 700, () => { tt.textContent = txt; track(animate(tt, { opacity: [1, .25], scale: [1.5, 1], duration: 650, ease: 'outExpo' })); }));
        later(G + 2100, () => { flames.forEach((f) => track(animate(f, { opacity: [0, Number(f.dataset.o)], scaleY: [.2, 1], duration: 700, ease: 'outQuad' }))); });
        later(G + 2100, () => { const s = { p: 0 }; track(animate(s, { p: [0, 1], duration: 1000, ease: 'linear', onUpdate: () => { B4.y = (Math.random() - .5) * 5; applyB(); }, onComplete: () => { B4.y = 0; applyB(); } })); });
        later(G + 3200, () => {                                                    // ¡despega!
          pulse(1.6); tt.textContent = '¡OK!'; track(animate(tt, { opacity: [1, 0], duration: 1200 }));
          ring(svg, 230, 372, 200, { color: CYAN, duration: 1000, width: 4 }); ring(svg, 230, 372, 120, { color: LIME, duration: 800, width: 3 }); burst(svg, 230, 372, { count: 30, spread: 220, size: 5 });
          let last = 0, n = 0;
          track(animate(B4, { y: [0, -820], duration: 2300, ease: 'inQuart', onUpdate: () => {
            applyB(); const now = performance.now(); if (now - last < 24) return; last = now;
            fadingDot(svg, 230 + rand(-14, 14), 400 + B4.y + rand(0, 40), COLORS[n++ % 3], rand(6, 11), 800); if (n % 2 === 0) fadingDot(svg, 230 + rand(-22, 22), 430 + B4.y, 'rgba(205,220,240,.35)', rand(12, 20), 1100);
          } }));
        });
        later(G + 7500, () => { track(animate(label, { opacity: 0, duration: 400 })); });
      });
      later(F + 300 + 9 * 420 + 1300 + 3200 + 6500, cycle);                  // vuelve a empezar para que la escena no se quede vacía
    };
    cycle();
  });

  // ---- 12 · Múltiples herramientas para diferentes temas: dos carruseles de capturas, arriba y abajo del texto, en sentidos opuestos y a velocidad tranquila.
  moments.register('papel12', (scene, ctx, wait) => {
    const back = mount(true), W = innerWidth, H = innerHeight, defs = svgEl('defs', {}, back);
    const rowH = H * .2, cw = rowH * 1.6, gap = H * .035, topY = H * .1, botY = H - H * .1 - rowH;   // las bandas dejan libres el encabezado y el pie
    const clip = svgEl('clipPath', { id: `cc${++uid}`, clipPathUnits: 'objectBoundingBox' }, defs); svgEl('rect', { width: 1, height: 1, rx: .035, ry: .055 }, clip);
    const palette = [['#1457ff', '#8fb0ff'], ['#ff3bb9', '#ffb3e3'], ['#22d7ff', '#a6efff'], ['#9a5cff', '#cdb0ff'], ['#a9cf00', '#e6ff7a'], ['#1457ff', '#8fb0ff'], ['#ff3bb9', '#ffb3e3']];
    const card = (parent, x, y, src, i) => {                                   // tarjeta = marco blanco + captura (o una "app" de ejemplo si no hay capturas)
      const g = svgEl('g', {}, parent), p = rowH * .028;
      svgEl('rect', { x: x + p, y: y + p * 1.6, width: cw, height: rowH, rx: rowH * .06, fill: 'rgba(0,0,0,.4)' }, g);
      svgEl('rect', { x, y, width: cw, height: rowH, rx: rowH * .06, fill: '#fff', stroke: i % 2 ? 'rgba(255,59,185,.7)' : 'rgba(34,215,255,.7)', 'stroke-width': 2 }, g);
      if (src) svgEl('image', { href: src, x: x + p, y: y + p, width: cw - p * 2, height: rowH - p * 2, preserveAspectRatio: 'xMidYMin slice', 'clip-path': `url(#${clip.id})` }, g);
      else {
        const [c1, c2] = palette[i % palette.length], ix = x + p, iy = y + p, iw = cw - p * 2, ih = rowH - p * 2;
        svgEl('rect', { x: ix, y: iy, width: iw, height: ih, fill: '#f8fafc', rx: 4 }, g); svgEl('rect', { x: ix, y: iy, width: iw, height: ih * .14, fill: c1 }, g);
        [[.06, .26, .36, .26], [.46, .26, .46, .1], [.46, .42, .46, .07], [.06, .58, .86, .3]].forEach(([dx, dy, w, h], k) => svgEl('rect', { x: ix + iw * dx, y: iy + ih * dy, width: iw * w, height: ih * h, rx: 4, fill: k % 2 ? c2 : c1, opacity: .88 }, g));
      }
    };
    const build = (images) => {
      const list = images && images.length ? images : Array.from({ length: 8 }, () => null), n = list.length, L = n * (cw + gap);
      const copies = Math.ceil(W / L) + 2;                                      // suficientes copias para que el recorrido sea continuo
      const row = (y, order, reverse, speedK) => {
        const g = svgEl('g', { opacity: 0 }, back);
        for (let c = 0; c < copies; c++) order.forEach((src, i) => card(g, c * L + i * (cw + gap), y, src, i));
        const speed = H * .075 * speedK;                                         // px/s: calmado
        track(animate(g, { opacity: [0, 1], duration: 1200, delay: wait(400), ease: 'outQuad' }));
        track(animate(g, { translateX: reverse ? [-L, 0] : [0, -L], duration: (L / speed) * 1000, loop: true, ease: 'linear', delay: wait(400) }));
        return g;
      };
      row(topY, list, false, 1);                                                 // arriba: hacia la izquierda
      row(botY, [...list].reverse(), true, .9);                                  // abajo: hacia la derecha
      const edge = (x, rev) => { const gid = `ef${++uid}`, gr = svgEl('linearGradient', { id: gid, x1: rev ? 1 : 0, y1: 0, x2: rev ? 0 : 1, y2: 0 }, defs); [[0, 'rgba(2,6,15,1)'], [1, 'rgba(2,6,15,0)']].forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, gr)); [topY, botY].forEach((y) => svgEl('rect', { x, y: y - 6, width: W * .1, height: rowH + 12, fill: `url(#${gid})` }, back)); };
      edge(0, false); edge(W * .9, true);                                        // los bordes se funden con el fondo
    };
    // Las capturas se listan en media/capturas/index.json (ver README); si no existe, se usan tarjetas de ejemplo.
    fetch('media/capturas/index.json').then((r) => (r.ok ? r.json() : null)).catch(() => null).then((list) => {
      if (!back.isConnected) return;                                            // la escena ya cambió
      const images = scene.captures && scene.captures.length ? scene.captures : Array.isArray(list) ? list.map((f) => `media/capturas/${f}`) : [];
      build(images);
    });
  });

  // ---- 13 · Que sea más Dekids: aviones de papel cruzan por detrás de las letras y a mitad de camino se vuelven cohetes.
  moments.register('papel13', (scene, ctx, wait) => {
    const back = mount(true), W = innerWidth, H = innerHeight;
    const a = .539, T1 = .65;                                                  // movimiento continuo; tras la transformación acelera
    const progress = (t) => t < T1 ? (t / T1) * .5 : .5 + .5 * (a * ((t - T1) / (1 - T1)) + (1 - a) * Math.pow((t - T1) / (1 - T1), 2));
    let count = 0, active = 0;
    const flight = () => {
      if (active > 26) return;
      active++; count++;
      const y0 = rand(.08, .92) * H, size = (W * .045 / 74) * rand(.8, 1.4), phase = rand(0, 6), holder = svgEl('g', {}, back), plane = paperPlane(holder);
      let rocket = null, last = 0, n = 0, bornAt = 0;
      const s = { t: 0 };
      track(animate(s, {
        t: [0, 1], duration: rand(5200, 7600), ease: 'linear',
        onUpdate: () => {
          const p = progress(s.t), x = -90 + (W + 180) * p, transformed = s.t >= T1 * 1.0;
          if (!transformed) {
            const y = y0 + Math.sin(s.t * 9 + phase) * H * .02;
            holder.setAttribute('transform', `translate(${x} ${y}) rotate(${Math.cos(s.t * 9 + phase) * 8}) scale(${size})`);
          } else {
            if (!rocket) {                                                      // a mitad de la diapositiva: ¡cohete!
              holder.remove(); rocket = makeRocket(back, { glow: false });
              const mx = W * .5, my = y0 + Math.sin(T1 * 9 + phase) * H * .02;
              ring(back, mx, my, 70, { color: LIME, duration: 600, width: 3 }); burst(back, mx, my, { count: 12, spread: 80, size: 3.5 });
              bornAt = performance.now();
            }
            rocket.place(x, y0, 0, size * 1.15 * (.4 + .6 * Math.min(1, (performance.now() - bornAt) / 300)), 1.1);
            const now = performance.now(); if (now - last > 40) { last = now; fadingDot(back, x - 70 * size, y0 + rand(-3, 3), COLORS[n++ % 3], 4 * size * 1.2, 500); }
          }
        },
        onComplete: () => { holder.remove(); rocket?.ship.remove(); active--; }
      }));
    };
    const next = () => { flight(); later(count < 10 ? rand(250, 500) : rand(500, 950), next); };
    later(wait(700), next);
  });

  // ---- 14 · Final: la hoja en blanco sobre la mesa, con la frase ya escrita, se dobla en avioncito; la mesa desaparece; el avioncito se vuelve un
  // blueprint que se transforma en el plano del cohete v4 y luego se solidifica en un cohete casi 3D isométrico, listo para despegar, esperando a la tripulación.
  moments.register('papel14', (scene, ctx, wait) => {
    const W = innerWidth, H = innerHeight, t = papel.table(W, H, { palette: 'neon', push: false }), S = (H * .74) / 200, K = H / 730, BP = 1.3, CY = H * .47;
    const tableParts = [...t.cam.children, ...[...t.svg.children].filter((el) => el.tagName === 'rect')];     // madera, vetas, luz, polvo y viñeta
    const svg = t.svg, defs = svgEl('defs', {}, svg), id = (n) => `${n}${++uid}`;
    const linear = (gid, stops, x2 = 1, y2 = 0) => { const g = svgEl('linearGradient', { id: gid, x1: 0, y1: 0, x2, y2 }, defs); stops.forEach(([o, c]) => svgEl('stop', { offset: o, 'stop-color': c }, g)); return `url(#${gid})`; };
    const radial = (gid, stops) => { const g = svgEl('radialGradient', { id: gid }, defs); stops.forEach(([o, c, a]) => svgEl('stop', { offset: o, 'stop-color': c, 'stop-opacity': a ?? 1 }, g)); return `url(#${gid})`; };

    // ---------- 1) la hoja con la frase ya escrita
    const sheet = papel.foldingSheet(t.cam, S), pos = { x: W * .5, y: H * .5, rot: -2, s: 1 }, apply = () => papel.place(sheet.g, pos.x, pos.y, pos.rot, pos.s);
    apply(); sheet.g.setAttribute('opacity', 0);
    const inner = sheet.g.firstChild, textG = svgEl('g', {}, inner);
    ['Imaginar es', 'lo más poderoso', 'que podemos', 'hacer'].forEach((line, i) => { const el = svgEl('text', { x: -60, y: [-46, -10, 26, 62][i], 'font-family': 'Permanent Marker, cursive', 'font-size': 14.5, fill: papel.INK }, textG); el.textContent = line; });
    track(animate(sheet.g, { opacity: [0, 1], duration: 1800, delay: wait(500), ease: 'outQuad' }));
    const T_fold = wait(500) + 5200;
    later(T_fold, () => track(animate(textG, { opacity: 0, duration: 700, ease: 'inQuad' })));              // al doblarse, la frase se pierde en los pliegues
    const folded = sheet.play(T_fold + 300);                                                                   // se dobla en avioncito

    // ---------- 2) la mesa desaparece y el avioncito se coloca en el centro, apuntando hacia arriba
    const sPlane = (208 * BP * K) / (204 * S), T_move = folded + 500;
    track(animate(pos, { x: W * .5, y: H * .5, rot: -90, s: sPlane, duration: 1500, delay: T_move, ease: 'inOutCubic', onUpdate: apply }));
    later(T_move + 200, () => track(animate(tableParts, { opacity: 0, duration: 1700, ease: 'inOutQuad' })));    // (se crea a su hora: Anime reemplaza animaciones previas de la misma propiedad)

    // ---------- 3) blueprint del avioncito
    const world = svgEl('g', { transform: `translate(${W / 2} ${CY}) scale(${K})` }, svg);
    const wst = { k: K, x: W / 2 }; const setWorld = () => world.setAttribute('transform', `translate(${wst.x} ${CY}) scale(${wst.k})`);
    const T_bp = T_move + 1700;
    const grid = svgEl('g', { opacity: 0 }, svg); svg.insertBefore(grid, world);
    for (let x = ((W / 2) % 48) - 48; x < W; x += 48) svgEl('path', { d: `M${x} 0V${H}`, stroke: CYAN, 'stroke-width': 1, opacity: .13 }, grid);
    for (let y = ((H / 2) % 48) - 48; y < H; y += 48) svgEl('path', { d: `M0 ${y}H${W}`, stroke: CYAN, 'stroke-width': 1, opacity: .13 }, grid);
    track(animate(grid, { opacity: [0, 1], duration: 1200, delay: T_bp - 300, ease: 'inOutQuad' }));
    const bp = svgEl('g', { transform: `scale(${BP})` }, world);
    const stroke = { fill: 'none', stroke: CYAN, 'stroke-width': 2.4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' };
    const resample = (pts, n) => {
      const closed = [...pts, pts[0]], segs = []; let total = 0;
      pts.forEach((_, i) => { const a = closed[i], b = closed[i + 1], l = Math.hypot(b[0] - a[0], b[1] - a[1]); segs.push({ a, b, l, start: total }); total += l; });
      return Array.from({ length: n }, (_, i) => { const d = (i / n) * total, s = segs.find((q) => d >= q.start && d < q.start + q.l) || segs[segs.length - 1], u = (d - s.start) / s.l; return [s.a[0] + (s.b[0] - s.a[0]) * u, s.a[1] + (s.b[1] - s.a[1]) * u]; });
    };
    const P = resample([[0, -104], [92, 40], [16, 2], [16, 100], [-16, 100], [-16, 2], [-92, 40]], 36);        // silueta del avioncito (arriba = punta)
    const R = resample([[0, -155], [24, -111], [34, -47], [34, 47], [112, 167], [94, 179], [34, 123], [34, 155], [-34, 155], [-34, 123], [-94, 179], [-112, 167], [-34, 47], [-34, -47], [-24, -111]], 36);   // silueta del cohete v4
    const toD = (pts) => 'M' + pts.map((q) => q.map((n) => n.toFixed(1)).join(' ')).join('L') + 'Z';
    const shape = svgEl('path', { d: toD(P), ...stroke }, bp), shapeGlow = svgEl('path', { d: toD(P), ...stroke, 'stroke-width': 9, opacity: .14 }, bp);
    const len0 = shape.getTotalLength();
    [shape, shapeGlow].forEach((p) => { p.style.strokeDasharray = len0; p.style.strokeDashoffset = len0; });
    const keel = svgEl('path', { d: 'M0 -104V100M-16 2H16', ...stroke, 'stroke-width': 1.6, opacity: .6 }, bp), keelLen = keel.getTotalLength();
    keel.style.strokeDasharray = keelLen; keel.style.strokeDashoffset = keelLen;
    const tag = svgEl('text', { display: 'none', x: -300, y: -250, 'font-family': 'DM Mono, monospace', 'font-size': 22, fill: LIME, opacity: 0, style: CENTER }, world); tag.textContent = 'v0';
    track(animate([shape, shapeGlow], { strokeDashoffset: [len0, 0], duration: 1400, delay: T_bp, ease: 'inOutSine' }));
    track(animate(keel, { strokeDashoffset: [keelLen, 0], duration: 1000, delay: T_bp + 400, ease: 'inOutSine' }));
    track(animate(tag, { opacity: [0, 1], duration: 500, delay: T_bp + 600 }));
    later(T_bp + 900, () => track(animate(sheet.g, { opacity: 0, duration: 900, ease: 'inQuad' })));              // el papel se va y queda solo el plano

    // ---------- 4) el plano del avión se transforma en el plano del cohete v4
    const T_morph = T_bp + 2600, m = { v: 0 };
    track(animate(m, { v: [0, 1], duration: 2300, delay: T_morph, ease: 'inOutCubic', onUpdate: () => {
      const d = toD(P.map((q, i) => [q[0] + (R[i][0] - q[0]) * m.v, q[1] + (R[i][1] - q[1]) * m.v]));
      shape.setAttribute('d', d); shapeGlow.setAttribute('d', d); keel.setAttribute('opacity', .6 * (1 - m.v));
    }, onBegin: () => { shape.style.strokeDasharray = ''; shapeGlow.style.strokeDasharray = ''; } }));
    later(T_morph + 100, () => { tag.textContent = 'v4'; track(animate(tag, { scale: [1.7, 1], duration: 600, ease: 'outBack(2)' })); });
    // detalles del plano del cohete (los mismos de la diapositiva 11)
    const det = svgEl('g', { transform: 'translate(-230 -177)' }, bp);
    const dpaths = ['M196 118H264M196 236H264', 'M230 22V332', 'M230 84C246 98 248 128 230 150C212 128 214 98 230 84Z', 'M206 332L200 356L222 356L218 332ZM222 332L218 360L242 360L238 332ZM242 332L238 356L260 356L254 332Z', 'M176 150C164 190 164 296 172 336L194 336L194 160ZM284 150C296 190 296 296 288 336L266 336L266 160Z', 'M206 170V300M254 170V300'];
    const dcol = ['rgba(34,215,255,.6)', 'rgba(34,215,255,.45)', LIME, CYAN, PINK, LIME];
    const detPaths = dpaths.map((d, i) => { const q = svgEl('path', { d, ...stroke, stroke: dcol[i], 'stroke-width': 2 }, det), l = q.getTotalLength(); q.style.strokeDasharray = l; q.style.strokeDashoffset = l; q.dataset.l = l; return q; });
    const T_detail = T_morph + 2400;
    detPaths.forEach((q, i) => track(animate(q, { strokeDashoffset: [Number(q.dataset.l), 0], duration: 700, delay: T_detail + i * 340, ease: 'inOutSine' })));
    const dimV = svgEl('path', { d: 'M168 -190V190M160 -190H176M160 190H176', ...stroke, 'stroke-width': 1.5, opacity: 0 }, bp);
    track(animate(dimV, { opacity: [0, .7], duration: 700, delay: T_detail + 600 }));

    // ---------- 5) se solidifica: un barrido de luz sube y deja un cohete casi 3D isométrico, sobre su plataforma, con torre y brazo de la tripulación
    const T_solid = T_detail + detPaths.length * 340 + 900;
    const fBody = linear(id('gb'), [[0, '#51628f'], [.28, '#e8eefc'], [.5, '#ffffff'], [.75, '#a9b9da'], [1, '#3f4f78']]);
    const fNose = linear(id('gn'), [[0, '#6f8a00'], [.35, '#eaff6e'], [.55, '#d9ff20'], [1, '#556a00']]);
    const fBoost = linear(id('gp'), [[0, '#6e0e4f'], [.35, '#ff92da'], [.55, '#ff3bb9'], [1, '#62093f']]);
    const fFin = linear(id('gf'), [[0, '#2b6bff'], [1, '#0a2a8a']], 0, 1), fFinB = linear(id('gf'), [[0, '#6aa0ff'], [1, '#1a47c9']], 0, 1);
    const fMetal = linear(id('gm'), [[0, '#202a45'], [.5, '#7584b0'], [1, '#18203a']]);
    const fGlass = radial(id('gg'), [[0, '#6fe7ff'], [.6, '#0a3a6a'], [1, '#050c20']]);
    const fLight = radial(id('gl'), [[0, '#fff3c4', 1], [1, '#ffd36a', 0]]);
    const cp = svgEl('clipPath', { id: id('cp') }, defs), cpRect = svgEl('rect', { x: -420, y: 340, width: 840, height: 760 }, cp);
    const solid = svgEl('g', { 'clip-path': `url(#${cp.id})` }, world), pad = svgEl('g', { opacity: 0 }, world), tower = svgEl('g', {}, world);
    // plataforma isométrica
    svgEl('polygon', { points: '-190,267 0,302 0,322 -190,287', fill: '#0d1838', stroke: 'rgba(34,215,255,.5)', 'stroke-width': 1.2 }, pad); svgEl('polygon', { points: '190,267 0,302 0,322 190,287', fill: '#091030', stroke: 'rgba(34,215,255,.5)', 'stroke-width': 1.2 }, pad);
    svgEl('polygon', { points: '0,232 190,267 0,302 -190,267', fill: '#17265a', stroke: CYAN, 'stroke-width': 1.6 }, pad); svgEl('ellipse', { cx: 0, cy: 262, rx: 56, ry: 20, fill: '#040916', stroke: 'rgba(34,215,255,.4)', 'stroke-width': 1 }, pad);
    [[-44, 238], [44, 238], [-44, 258], [44, 258]].forEach(([cx, cy]) => svgEl('polygon', { points: `${cx - 8},${cy} ${cx + 8},${cy} ${cx + 8},${cy + 10} ${cx - 8},${cy + 10}`, fill: '#2c3a6e', stroke: CYAN, 'stroke-width': 1 }, pad));
    // cohete (dibujado de atrás hacia delante)
    svgEl('path', { d: 'M-42,120L-128,214L-104,230L-42,192Z', fill: fFin, stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }, solid); svgEl('path', { d: 'M42,120L128,214L104,230L42,192Z', fill: fFinB, stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }, solid);
    [-1, 1].forEach((sd) => {                                                                                    // boosters laterales
      const x = sd * 67;
      svgEl('path', { d: `M${x - 15},-24L${x - 15},186A15,5 0 0 0 ${x + 15},186L${x + 15},-24A15,5 0 0 0 ${x - 15},-24Z`, fill: fBoost, stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }, solid);
      svgEl('path', { d: `M${x - 15},-24C${x - 14},-52 ${x - 6},-74 ${x},-88C${x + 6},-74 ${x + 14},-52 ${x + 15},-24A15,5 0 0 1 ${x - 15},-24Z`, fill: fNose, stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }, solid);
      svgEl('path', { d: `M${x - 10},206L${x - 14},228L${x + 14},228L${x + 10},206Z`, fill: fMetal }, solid);
    });
    svgEl('path', { d: 'M-52,10H-42M-52,150H-42M42,10H52M42,150H52', stroke: '#2c3a6e', 'stroke-width': 6 }, solid);
    svgEl('path', { d: 'M-42,-120L-42,205A42,13 0 0 0 42,205L42,-120A42,13 0 0 0 -42,-120Z', fill: fBody, stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }, solid);              // fuselaje
    svgEl('path', { d: 'M-42,-120C-40,-170 -16,-225 0,-252C16,-225 40,-170 42,-120A42,13 0 0 1 -42,-120Z', fill: fNose, stroke: 'rgba(0,0,0,.25)', 'stroke-width': 1 }, solid);      // ojiva
    svgEl('path', { d: 'M-42,-100A42,13 0 0 0 42,-100', fill: 'none', stroke: CYAN, 'stroke-width': 3.5 }, solid); svgEl('path', { d: 'M-42,150A42,13 0 0 0 42,150', fill: 'none', stroke: PINK, 'stroke-width': 3.5 }, solid);
    svgEl('path', { d: 'M-42,92A42,13 0 0 0 42,92', fill: 'none', stroke: 'rgba(11,16,48,.35)', 'stroke-width': 2 }, solid);
    svgEl('path', { d: 'M-30,-30V120M30,-30V120', stroke: 'rgba(11,16,48,.12)', 'stroke-width': 1.5 }, solid);
    svgEl('circle', { cx: -4, cy: -52, r: 18, fill: '#0b1230', stroke: LIME, 'stroke-width': 4 }, solid); svgEl('circle', { cx: -4, cy: -52, r: 13, fill: fGlass }, solid); svgEl('path', { d: 'M-12,-58A10,10 0 0 1 2,-62', fill: 'none', stroke: 'rgba(255,255,255,.75)', 'stroke-width': 2.2, 'stroke-linecap': 'round' }, solid);
    const hatchLight = svgEl('rect', { x: 12, y: 26, width: 26, height: 60, rx: 8, fill: fLight, opacity: 0 }, solid), hatch = svgEl('rect', { x: 12, y: 26, width: 26, height: 60, rx: 8, fill: '#0b1230', stroke: LIME, 'stroke-width': 2.4, style: 'transform-box:fill-box;transform-origin:100% 50%;' }, solid);
    [[-18, 206], [0, 214], [18, 206]].forEach(([cx, cy], i) => { svgEl('path', { d: `M${cx - 14},${cy}L${cx - 20},${cy + 38}L${cx + 20},${cy + 38}L${cx + 14},${cy}Z`, fill: fMetal, stroke: 'rgba(0,0,0,.3)', 'stroke-width': 1 }, solid); });
    const noz = [-18, 0, 18].map((cx) => svgEl('ellipse', { cx, cy: cx === 0 ? 252 : 244, rx: 12, ry: 4, fill: LIME, opacity: 0 }, solid));
    // torre de lanzamiento y brazo de acceso de la tripulación
    const TX = 168, tw = { stroke: 'rgba(223,247,255,.8)', 'stroke-width': 2.6, 'stroke-linecap': 'round', fill: 'none' };
    const post = (d) => { const q = svgEl('path', { d, ...tw }, tower), l = q.getTotalLength(); q.style.strokeDasharray = l; q.style.strokeDashoffset = l; q.dataset.l = l; return q; };
    const towerPaths = [post(`M${TX} 262V-190`), post(`M${TX + 28} 276V-176`), post(`M${TX} -190L${TX + 28} -176`), ...Array.from({ length: 11 }, (_, i) => post(`M${TX} ${250 - i * 40}L${TX + 28} ${264 - (i + 1) * 40}M${TX + 28} ${264 - i * 40}L${TX} ${250 - (i + 1) * 40}`))];
    const arm = svgEl('g', { opacity: 0, style: 'transform-box:fill-box;transform-origin:100% 50%;' }, tower);
    svgEl('polygon', { points: `${TX},30 46,30 46,58 ${TX},58`, fill: '#1d2c58', stroke: CYAN, 'stroke-width': 1.8 }, arm); svgEl('path', { d: `M${TX - 20} 38H${TX - 100}M${TX - 20} 48H${TX - 100}`, stroke: 'rgba(255,230,160,.8)', 'stroke-width': 2 }, arm);
    const beacons = [[TX + 14, -192, PINK], [0, -256, LIME], [-128, 214, CYAN], [128, 214, CYAN]].map(([cx, cy, c]) => svgEl('circle', { cx, cy, r: 4.5, fill: c, opacity: 0, style: CENTER }, tower));

    // barrido de luz
    const scan = svgEl('g', { opacity: 0 }, world);
    svgEl('path', { d: 'M-190 0H190', stroke: LIME, 'stroke-width': 10, opacity: .22, 'stroke-linecap': 'round' }, scan); svgEl('path', { d: 'M-190 0H190', stroke: '#fff', 'stroke-width': 2.4, 'stroke-linecap': 'round' }, scan);
    const sc = { y: 340 };
    const T_scan = T_solid + 700;
    track(animate(pad, { opacity: [0, 1], translateY: [40, 0], duration: 900, delay: T_solid, ease: 'outExpo' }));
    track(animate(scan, { opacity: [0, 1], duration: 300, delay: T_scan }));
    track(animate(sc, { y: [340, -270], duration: 3000, delay: T_scan, ease: 'inOutQuad', onUpdate: () => { cpRect.setAttribute('y', sc.y); scan.setAttribute('transform', `translate(0 ${sc.y})`); } }));
    later(T_scan + 3000, () => track(animate(scan, { opacity: 0, duration: 400 })));
    later(T_scan + 2600, () => { track(animate([tag, dimV], { opacity: 0, duration: 700 })); track(animate(grid, { opacity: .5, duration: 1200 })); });
    later(T_scan + 2800, () => track(animate(bp, { opacity: 0, duration: 900, ease: 'inQuad' })));
    pulseAt(T_scan + 3000, 1.2);
    // torre, brazo y escotilla
    const T_tower = T_scan + 3200;
    towerPaths.forEach((q, i) => track(animate(q, { strokeDashoffset: [Number(q.dataset.l), 0], duration: 600, delay: T_tower + i * 90, ease: 'inOutSine' })));
    const T_arm = T_tower + towerPaths.length * 90 + 400;
    track(animate(arm, { opacity: [0, 1], scaleX: [.15, 1], duration: 1400, delay: T_arm, ease: 'inOutCubic' }));
    track(animate(hatchLight, { opacity: [0, 1], duration: 700, delay: T_arm + 1300 })); track(animate(hatch, { scaleX: [1, .12], duration: 800, delay: T_arm + 1300, ease: 'inOutCubic' }));
    track(animate(noz, { opacity: [0, .5], duration: 800, delay: T_arm + 600 }));
    track(animate(beacons, { opacity: [{ to: 1, duration: 120 }, { to: .15, duration: 520 }], duration: 900, delay: stagger(220, { start: T_arm }), loop: true, ease: 'linear' }));
    // en espera: vapor que se escapa, luces parpadeando y una cámara que se acerca muy despacio
    const T_idle = T_arm + 1800;
    later(T_idle, () => {
      const vent = () => { for (let i = 0; i < 3; i++) later(i * 120, () => fadingDot(world, -44 - rand(0, 10), 70 + rand(-6, 6), 'rgba(220,235,255,.55)', rand(7, 14), 1500)); later(rand(900, 1700), vent); };
      const base = () => { fadingDot(world, rand(-70, 70), 270 + rand(-6, 6), 'rgba(205,220,240,.4)', rand(10, 20), 1900); later(rand(250, 500), base); };
      vent(); base();
      track(animate(wst, { k: [K, K * 1.04], duration: 6000, ease: 'linear', onUpdate: setWorld }));
      track(animate(noz, { opacity: [.35, .75], duration: 1500, loop: true, alternate: true, ease: 'inOutSine' }));
      // el cohete se corre a la derecha y a la izquierda sale el texto de Dekids
      later(5200, () => {
        track(animate(wst, { x: W * .7, k: K * .88, duration: 2200, ease: 'inOutCubic', onUpdate: setWorld }));
        later(1100, () => ctx.showText?.('DEKIDS TRANSFORMA AVIONES DE PAPEL EN NAVES ESPACIALES'));
      });
    });
    function pulseAt(ms, n) { later(ms, () => pulse(n)); }
  });
})();
