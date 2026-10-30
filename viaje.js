// Deck 1 (El viaje a la luna): ilustraciones "dibujadas por un niño" (crayón, trazo tembloroso, aviones de papel).
// Cada escena se registra como un momento; las de columna (illustration) se dibujan dentro de #showExtra.
(() => {
  const { animate, stagger } = anime;
  const { svgEl, mount, fadingDot, track, later, CENTER } = moments.kit;
  const rand = (min, max) => min + Math.random() * (max - min);
  const NIGHT = '#0b1030', CREAM = '#fff3d6', YELLOW = '#ffd84d', CORAL = '#ff7a6b', SKY = '#7fd6ff', PINK = '#ff9ad5', SKIN = '#c68d62', HAIR = '#2b1b17';
  const BOTTOM = 'transform-box:fill-box;transform-origin:50% 100%;';
  const pulse = (n) => { if (typeof pulseBackground === 'function') pulseBackground(n); };

  // ---- Trazo de crayón: curvas cerradas suaves con un pequeño temblor y un relleno desplazado.
  function smooth(pts) {
    const n = pts.length, mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    let d = `M${mid(pts[n - 1], pts[0]).join(' ')}`;
    for (let i = 0; i < n; i++) d += `Q${pts[i].join(' ')} ${mid(pts[i], pts[(i + 1) % n]).join(' ')}`;
    return d + 'Z';
  }
  const blobPts = (cx, cy, r, seg = 14, amp = .035) => Array.from({ length: seg }, (_, i) => { const a = (i / seg) * Math.PI * 2, k = 1 + rand(-amp, amp); return [cx + Math.cos(a) * r * k, cy + Math.sin(a) * r * k]; });
  function crayonCircle(parent, cx, cy, r, { fill, stroke = NIGHT, w = 3, opacity = 1, amp = .035 } = {}) {
    const g = svgEl('g', {}, parent);
    if (fill) svgEl('path', { d: smooth(blobPts(cx + 2, cy + 2, r * .97, 14, amp)), fill, opacity }, g);
    svgEl('path', { d: smooth(blobPts(cx, cy, r, 14, amp)), fill: 'none', stroke, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    return g;
  }
  const star4 = (parent, x, y, r, fill = CREAM) => svgEl('path', {
    d: `M${x} ${y - r}Q${x} ${y} ${x + r} ${y}Q${x} ${y} ${x} ${y + r}Q${x} ${y} ${x - r} ${y}Q${x} ${y} ${x} ${y - r}Z`, fill, style: CENTER
  }, parent);
  function paperPlane(parent) {
    const g = svgEl('g', { style: CENTER }, parent);
    const o = { stroke: NIGHT, 'stroke-width': 1.6, 'stroke-linejoin': 'round' };
    svgEl('path', { d: 'M52 0L-22 -19L3 3Z', fill: '#ffffff', ...o }, g);
    svgEl('path', { d: 'M52 0L3 3L-15 18Z', fill: '#ffe9a8', ...o }, g);
    svgEl('path', { d: 'M3 3L-22 -19L-15 18Z', fill: SKY, ...o }, g);
    return g;
  }
  const twinkle = (stars, wait) => track(animate(stars, { opacity: [1, .25], scale: [1, .7], duration: () => rand(900, 2200), delay: () => wait + rand(0, 1500), loop: true, alternate: true, ease: 'inOutSine' }));
  const extraSvg = (viewBox) => { const box = document.getElementById('showExtra'); box.innerHTML = ''; return svgEl('svg', { viewBox, style: 'width:100%;max-height:60vh;overflow:visible;' }, box); };

  // ---- 1 · El viaje a la luna: cielo estrellado y una luna minimalista; un avioncito lejano la sobrevuela.
  moments.register('dream1', (scene, ctx, wait) => {
    const back = mount(true), W = innerWidth, H = innerHeight;
    const stars = Array.from({ length: 46 }, () => {
      const s = svgEl('g', { opacity: 0 }, back); star4(s, rand(.03, .97) * W, rand(.04, .96) * H, rand(5, 13), Math.random() < .35 ? YELLOW : CREAM); return s;
    });
    track(animate(stars, { opacity: [0, 1], duration: 900, delay: stagger(40, { start: wait(300) }), ease: 'outQuad' }));
    later(wait(2200), () => twinkle(stars, 0));
    const moonX = W * .87, moonY = H * .24, r = H * .2;
    const moon = svgEl('g', { opacity: 0, style: 'filter:drop-shadow(0 0 46px rgba(255,216,77,.5))' }, back);
    const float = svgEl('g', {}, moon);
    crayonCircle(float, moonX, moonY, r, { fill: '#fff0b8', stroke: YELLOW, w: 5 });
    [[-.35, -.2, .2], [.3, .15, .25], [-.05, .5, .14], [.38, -.45, .11]].forEach(([dx, dy, k]) => crayonCircle(float, moonX + dx * r, moonY + dy * r, k * r, { fill: '#f5dc8c', stroke: '#e7c765', w: 2.5 }));
    track(animate(moon, { opacity: [0, 1], translateY: [H * .3, 0], duration: 2400, delay: wait(400), ease: 'outExpo' }));
    track(animate(float, { translateY: [0, -10], duration: 3600, delay: wait(2800), loop: true, alternate: true, ease: 'inOutSine' }));

    // avioncito: sale por la izquierda, sube hacia la luna y desaparece; vuelve a salir cada cierto tiempo
    const flight = () => {
      const plane = paperPlane(back), p0 = [-60, H * .85], p1 = [W * .3, H * .6], p2 = [W * .5, H * .2], p3 = [moonX - r * .9, moonY + r * .2], state = { t: 0 }, size = H / 700;
      const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p0[k] + 3*u*u*t*p1[k] + 3*u*t*t*p2[k] + t*t*t*p3[k]); };
      const ang = (t) => { const u = 1 - t; const d = [0, 1].map((k) => 3*u*u*(p1[k]-p0[k]) + 6*u*t*(p2[k]-p1[k]) + 3*t*t*(p3[k]-p2[k])); return Math.atan2(d[1], d[0]) * 180 / Math.PI; };
      track(animate(state, {
        t: [0, 1], duration: 9000, ease: 'inOutSine',
        onUpdate: () => { const [x, y] = at(state.t); plane.setAttribute('transform', `translate(${x} ${y}) rotate(${ang(state.t)}) scale(${size * (1.2 - state.t * .6)})`); },
        onComplete: () => { plane.remove(); later(6000, flight); }
      }));
    };
    later(wait(3500), flight);
  });

  // ---- 2 · El niño interior y la carga de la duda: solo dos sombras sobre la luna, la de un adulto y la de un niño con capa.
  // Siluetas planas con un borde de luz tenue (se dibuja el contorno primero y el relleno encima para que no se vean costuras).
  function shadow(parent, parts, style = {}) {
    const g = svgEl('g', { style: BOTTOM + (style.css || '') }, parent), rim = { stroke: 'rgba(255,243,214,.32)', 'stroke-width': 3, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    const shapes = parts.map((d) => svgEl('path', { d, fill: NIGHT, ...rim }, g));
    parts.forEach((d) => svgEl('path', { d, fill: NIGHT }, g));
    return { g, shapes };
  }
  moments.register('dream2', (scene, ctx, wait) => {
    const svg = extraSvg('0 0 440 380');
    const moon = svgEl('g', { opacity: 0, style: 'filter:drop-shadow(0 0 30px rgba(255,216,77,.45))' }, svg);
    crayonCircle(moon, 230, 150, 128, { fill: '#fff3d6', stroke: YELLOW, w: 4 });
    [[190, 105, 20], [275, 160, 26], [215, 205, 13]].forEach(([x, y, r]) => crayonCircle(moon, x, y, r, { fill: '#f3dd96', stroke: '#f0cf70', w: 2 }));
    svgEl('ellipse', { cx: 225, cy: 342, rx: 195, ry: 15, fill: 'rgba(255,243,214,.16)' }, svg);

    // adulto: de pie, hombros caídos, la cabeza al frente y un maletín que pesa
    const adult = shadow(svg, [
      'M126 118C110 121 97 128 94 144C90 178 88 218 90 264L152 264C154 218 151 178 147 146C145 130 137 122 126 118Z',   // abrigo
      'M95 146C88 178 84 208 86 238L98 239C99 208 103 178 106 152Z',                                                  // brazo caído
      'M146 148C152 178 156 212 158 252L147 253C146 212 142 180 139 154Z',                                            // brazo con el maletín
      'M99 262L105 337L121 337L123 262ZM126 262L127 337L143 337L149 262Z',                                            // piernas
      'M154 254h30a4 4 0 0 1 4 4v22a4 4 0 0 1-4 4h-30a4 4 0 0 1-4-4v-22a4 4 0 0 1 4-4ZM158 254v-6a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v6h-4v-5h-10v5Z', // maletín y asa
      'M131 86C142 86 149 94 149 104C149 115 141 122 131 122C121 122 114 115 114 104C114 94 121 86 131 86Z'              // cabeza
    ]);
    adult.g.setAttribute('opacity', 0);

    // niño: pequeño, de brazos arriba y con una capa que ondea (la capa también es sombra)
    const cape = svgEl('path', { fill: NIGHT, stroke: 'rgba(255,243,214,.32)', 'stroke-width': 3, 'stroke-linejoin': 'round' }, svg);
    const kid = shadow(svg, [
      'M300 262C308 262 312 268 312 276C312 288 312 298 310 306L290 306C288 298 288 288 288 276C288 268 292 262 300 262Z', // cuerpo
      'M292 268L272 240L279 234L298 260ZM308 268L328 238L335 244L314 272Z',                                                // brazos en V
      'M292 304L293 338L302 338L301 304ZM299 304L300 338L309 338L309 304Z',                                                  // piernas
      'M300 233C307 233 312 239 312 246C312 254 307 259 300 259C293 259 288 254 288 246C288 239 293 233 300 233Z'             // cabeza
    ]);
    kid.g.setAttribute('opacity', 0);
    const wave = { t: 0 };
    const drawCape = () => {
      const a = Math.sin(wave.t) * 9, b = Math.sin(wave.t + 1.6) * 7;
      cape.setAttribute('d', `M293 262Q${334 + a} ${248 + b} ${382 + a * 1.5} ${282 + b}Q${364 + a} ${300 + b} ${376 + a * 1.3} ${324 + b}Q${338 + a} ${306} ${312} ${300}L309 264Z`);
    };
    drawCape();
    cape.style.cssText = BOTTOM;

    track(animate(moon, { opacity: [0, 1], translateY: [30, 0], duration: 1400, delay: wait(300), ease: 'outExpo' }));
    track(animate(adult.g, { opacity: [0, 1], translateX: [-24, 0], duration: 1000, delay: wait(800), ease: 'outQuad' }));
    track(animate(adult.g, { scaleY: [1, .988], duration: 2800, delay: wait(1900), loop: true, alternate: true, ease: 'inOutSine' }));   // respira lento: la carga
    track(animate([kid.g, cape], { opacity: [0, 1], translateY: [50, 0], duration: 900, delay: wait(1300), ease: 'outBack(2)' }));
    track(animate([kid.g, cape], { translateY: [0, -14], duration: 520, delay: wait(2500), loop: true, alternate: true, ease: 'outQuad' })); // salta: la ligereza
    track(animate(wave, { t: [0, Math.PI * 2], duration: 1500, delay: wait(1300), loop: true, ease: 'linear', onUpdate: drawCape }));
  });

  // ---- 4 · ¿Cuál es su historia de origen?: ¿ ? gigantes y dos niños superhéroes en medio.
  function kid(parent, cx, base, { suit, cape, girl, maskColor }) {
    const g = svgEl('g', { opacity: 0, style: BOTTOM }, parent), o = { stroke: NIGHT, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    const capePath = svgEl('path', { fill: cape, ...o }, g);
    svgEl('path', { d: `M${cx - 16} ${base - 50}h13v44h-13zM${cx + 3} ${base - 50}h13v44h-13z`, fill: suit, ...o }, g);
    svgEl('path', { d: `M${cx - 18} ${base - 12}h16v12h-16zM${cx + 2} ${base - 12}h16v12h-16z`, fill: NIGHT, ...o }, g);
    svgEl('rect', { x: cx - 24, y: base - 102, width: 48, height: 58, rx: 12, fill: suit, ...o }, g);
    svgEl('rect', { x: cx - 24, y: base - 62, width: 48, height: 7, fill: YELLOW, ...o }, g);
    star4(svgEl('g', {}, g), cx, base - 82, 10, YELLOW);
    [-1, 1].forEach((s) => {
      svgEl('path', { d: `M${cx + s * 24} ${base - 92}Q${cx + s * 50} ${base - 80} ${cx + s * 27} ${base - 62}`, fill: 'none', stroke: suit, 'stroke-width': 12 }, g);
      svgEl('circle', { cx: cx + s * 27, cy: base - 62, r: 7, fill: SKIN, ...o }, g);
    });
    svgEl('circle', { cx, cy: base - 136, r: 27, fill: SKIN, ...o }, g);
    if (girl) [-1, 1].forEach((s) => svgEl('circle', { cx: cx + s * 31, cy: base - 124, r: 11, fill: HAIR, ...o }, g));
    svgEl('path', { d: `M${cx - 27} ${base - 140}Q${cx} ${base - 182} ${cx + 27} ${base - 140}Q${cx} ${base - 153} ${cx - 27} ${base - 140}Z`, fill: HAIR, ...o }, g);
    svgEl('path', { d: `M${cx - 28} ${base - 143}Q${cx} ${base - 153} ${cx + 28} ${base - 143}L${cx + 25} ${base - 127}Q${cx} ${base - 134} ${cx - 25} ${base - 127}Z`, fill: maskColor, ...o }, g);
    [-10, 10].forEach((x) => { svgEl('ellipse', { cx: cx + x, cy: base - 136, rx: 5.5, ry: 4.5, fill: '#fff' }, g); svgEl('circle', { cx: cx + x, cy: base - 136, r: 2.2, fill: NIGHT }, g); });
    svgEl('path', { d: `M${cx - 10} ${base - 119}Q${cx} ${base - 110} ${cx + 10} ${base - 119}`, fill: 'none', stroke: NIGHT, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, g);
    const drawCape = (t) => {
      const a = Math.sin(t) * 8, b = Math.sin(t + 1.4) * 6;
      capePath.setAttribute('d', `M${cx - 14} ${base - 100}Q${cx + 36 + a} ${base - 118 + b} ${cx + 92 + a * 1.4} ${base - 70 + b}Q${cx + 70 + a} ${base - 56 + b} ${cx + 84 + a * 1.2} ${base - 22 + b}Q${cx + 40 + a} ${base - 50} ${cx + 14} ${base - 54}Z`);
    };
    drawCape(0);
    return { g, drawCape };
  }
  moments.register('dream4', (scene, ctx, wait) => {
    const svg = extraSvg('0 0 480 380');
    const marks = [['¿', 10, 262, -7, YELLOW, 250, 'start'], ['?', 472, 262, 7, PINK, 250, 'end']].map(([t, x, y, rot, fill, size, anchor]) => {
      const el = svgEl('text', { x, y, 'text-anchor': anchor, 'font-family': 'Permanent Marker, cursive', 'font-size': size, fill, opacity: 0, style: CENTER + `paint-order:stroke;stroke:${NIGHT};stroke-width:7px;` }, svg);
      el.textContent = t; el.dataset.rot = rot; return el;
    });
    const minis = [[120, 80, 40, SKY], [360, 70, 34, YELLOW], [230, 40, 30, PINK], [60, 170, 26, CORAL], [425, 175, 28, SKY]].map(([x, y, size, fill]) => {
      const el = svgEl('text', { x, y, 'text-anchor': 'middle', 'font-family': 'Permanent Marker, cursive', 'font-size': size, fill, opacity: 0, style: CENTER }, svg); el.textContent = Math.random() < .5 ? '?' : '¿'; return el;
    });
    const big = (cx) => svgEl('g', { transform: `translate(${cx} 340) scale(1.5) translate(${-cx} -340)` }, svg); // los niños más grandes que el contexto
    const boy = kid(big(170), 170, 340, { suit: CORAL, cape: YELLOW, girl: false, maskColor: SKY });
    const girl = kid(big(310), 310, 340, { suit: SKY, cape: PINK, girl: true, maskColor: YELLOW });
    track(animate(marks, { opacity: [0, 1], scale: [.3, 1], rotate: { from: (el) => Number(el.dataset.rot) * 3, to: (el) => Number(el.dataset.rot) }, duration: 900, delay: stagger(200, { start: wait(500) }), ease: 'outBack(2)' }));
    track(animate(marks, { rotate: { from: (el) => Number(el.dataset.rot) - 4, to: (el) => Number(el.dataset.rot) + 4 }, duration: 2000, delay: wait(1800), loop: true, alternate: true, ease: 'inOutSine' }));
    track(animate(minis, { opacity: [0, .9], scale: [0, 1], duration: 600, delay: stagger(160, { start: wait(1200) }), ease: 'outBack(3)' }));
    track(animate(minis, { translateY: { from: 0, to: () => rand(-10, -18) }, duration: () => rand(1400, 2400), delay: wait(2000), loop: true, alternate: true, ease: 'inOutSine' }));
    [boy, girl].forEach((hero, i) => {
      track(animate(hero.g, { opacity: [0, 1], scale: [.2, 1], duration: 800, delay: wait(900) + i * 300, ease: 'outBack(2.5)' }));
      track(animate(hero.g, { translateY: [0, -8], duration: 700, delay: wait(2200) + i * 350, loop: true, alternate: true, ease: 'outQuad' }));
    });
    const wave = { t: 0 };
    track(animate(wave, { t: [0, Math.PI * 2], duration: 1600, delay: wait(900), loop: true, ease: 'linear', onUpdate: () => { boy.drawCape(wave.t); girl.drawCape(wave.t + .7); } }));
    later(wait(1800), () => { const s = mount(false); /* destellos de superpoder al aparecer */ for (let i = 0; i < 10; i++) later(i * 120, () => fadingDot(s, rand(.35, .75) * innerWidth, rand(.3, .6) * innerHeight, [YELLOW, PINK, SKY][i % 3], rand(4, 8), 900)); });
  });

  // ---- 5 · La mentalidad dekids y tu sueño sin límites: un niño con casco espacial lanza un avioncito de papel (se repite).
  moments.register('dream5', (scene, ctx, wait) => {
    const svg = extraSvg('0 0 440 380');
    const cx = 120, base = 336, shoulder = [cx + 22, base - 92], ARM = 46;
    svgEl('ellipse', { cx: 190, cy: base + 2, rx: 170, ry: 14, fill: 'rgba(255,243,214,.14)' }, svg);
    const o = { stroke: NIGHT, 'stroke-width': 2.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' };
    const kidG = svgEl('g', { opacity: 0, style: BOTTOM }, svg);
    // mochila de oxígeno y capa de astronauta detrás del cuerpo
    svgEl('rect', { x: cx - 38, y: base - 98, width: 20, height: 46, rx: 8, fill: '#c9d3ea', ...o }, kidG);
    svgEl('path', { d: `M${cx - 30} ${base - 92}v34`, stroke: '#9fb6d9', 'stroke-width': 3, 'stroke-linecap': 'round' }, kidG);
    // piernas y botas
    svgEl('path', { d: `M${cx - 16} ${base - 50}h13v44h-13zM${cx + 3} ${base - 50}h13v44h-13z`, fill: CORAL, ...o }, kidG);
    svgEl('path', { d: `M${cx - 19} ${base - 12}h17v12h-17zM${cx + 2} ${base - 12}h17v12h-17z`, fill: NIGHT, ...o }, kidG);
    // brazo trasero (cuelga) y torso
    svgEl('path', { d: `M${cx - 24} ${base - 92}Q${cx - 44} ${base - 74} ${cx - 34} ${base - 56}`, fill: 'none', stroke: CORAL, 'stroke-width': 12, 'stroke-linecap': 'round' }, kidG);
    svgEl('circle', { cx: cx - 34, cy: base - 54, r: 7, fill: SKIN, ...o }, kidG);
    svgEl('rect', { x: cx - 24, y: base - 102, width: 48, height: 58, rx: 12, fill: CORAL, ...o }, kidG);
    svgEl('rect', { x: cx - 24, y: base - 62, width: 48, height: 7, fill: YELLOW, ...o }, kidG);
    star4(svgEl('g', {}, kidG), cx, base - 80, 10, YELLOW);
    svgEl('rect', { x: cx - 13, y: base - 108, width: 26, height: 10, rx: 4, fill: '#c9d3ea', ...o }, kidG);  // aro del cuello
    // cabeza con casco
    const hy = base - 140;
    svgEl('circle', { cx, cy: hy, r: 26, fill: SKIN, ...o }, kidG);
    svgEl('path', { d: `M${cx - 26} ${hy - 4}Q${cx} ${hy - 44} ${cx + 26} ${hy - 4}Q${cx} ${hy - 17} ${cx - 26} ${hy - 4}Z`, fill: HAIR, ...o }, kidG);
    [-9, 9].forEach((x) => { svgEl('ellipse', { cx: cx + x + 3, cy: hy + 2, rx: 5, ry: 4.5, fill: '#fff' }, kidG); svgEl('circle', { cx: cx + x + 5, cy: hy + 2, r: 2.2, fill: NIGHT }, kidG); });
    svgEl('path', { d: `M${cx - 6} ${hy + 15}Q${cx + 4} ${hy + 22} ${cx + 14} ${hy + 14}`, fill: 'none', stroke: NIGHT, 'stroke-width': 2.5, 'stroke-linecap': 'round' }, kidG);
    svgEl('circle', { cx, cy: hy, r: 41, fill: 'rgba(127,214,255,.2)', stroke: CREAM, 'stroke-width': 4 }, kidG);   // burbuja del casco
    svgEl('path', { d: `M${cx - 30} ${hy - 20}Q${cx - 22} ${hy - 32} ${cx - 8} ${hy - 36}`, fill: 'none', stroke: '#fff', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: .85 }, kidG);  // brillo
    svgEl('path', { d: `M${cx + 28} ${hy - 30}l7 -16`, stroke: CREAM, 'stroke-width': 3, 'stroke-linecap': 'round' }, kidG);                         // antena
    svgEl('circle', { cx: cx + 36, cy: hy - 48, r: 4.5, fill: PINK, ...o, 'stroke-width': 2 }, kidG);
    // brazo que lanza (gira desde el hombro)
    const arm = svgEl('g', {}, kidG);
    svgEl('path', { d: `M0 0L${ARM} 0`, stroke: CORAL, 'stroke-width': 12, 'stroke-linecap': 'round' }, arm);
    svgEl('circle', { cx: ARM, cy: 0, r: 7, fill: SKIN, ...o }, arm);
    const plane = paperPlane(svg), size = 1;
    plane.setAttribute('opacity', 0);

    const state = { a: 110, grab: 0 };
    const hand = () => [shoulder[0] + Math.cos(state.a * Math.PI / 180) * ARM, shoulder[1] + Math.sin(state.a * Math.PI / 180) * ARM];
    const drawArm = () => {
      arm.setAttribute('transform', `translate(${shoulder[0]} ${shoulder[1]}) rotate(${state.a})`);
      if (state.grab) { const [x, y] = hand(); plane.setAttribute('transform', `translate(${x + 10} ${y - 6}) rotate(${-24 + (state.a - 200) * .08}) scale(${size * .95})`); }
    };
    drawArm();

    const cycle = (first) => {
      const t0 = first ? wait(700) : 500;
      Object.assign(state, { a: 110, grab: 1 }); drawArm();
      if (!first) track(animate(plane, { opacity: [0, 1], duration: 350, delay: t0 - 300, ease: 'outQuad' }));
      else later(t0 + 500, () => plane.setAttribute('opacity', 1));
      if (first) track(animate(kidG, { opacity: [0, 1], translateY: [40, 0], duration: 900, delay: t0, ease: 'outBack(2)' }));
      const t1 = t0 + (first ? 1500 : 300);
      track(animate(state, { a: [110, 205], duration: 800, delay: t1, ease: 'inOutQuad', onUpdate: drawArm }));          // se echa para atrás
      track(animate(state, { a: [205, 322], duration: 330, delay: t1 + 1000, ease: 'outQuad', onUpdate: drawArm }));     // lanza por encima del hombro
      later(t1 + 1330, () => {
        state.grab = 0;
        const [hx, hy2] = hand(), f = { t: 0 }, p0 = [hx + 10, hy2 - 6], p1 = [300, 120], p2 = [380, 20], p3 = [600, -120];
        const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p0[k] + 3*u*u*t*p1[k] + 3*u*t*t*p2[k] + t*t*t*p3[k]); };
        const ang = (t) => { const u = 1 - t; const d = [0, 1].map((k) => 3*u*u*(p1[k]-p0[k]) + 6*u*t*(p2[k]-p1[k]) + 3*t*t*(p3[k]-p2[k])); return Math.atan2(d[1], d[0]) * 180 / Math.PI; };
        let last = 0;
        for (let i = 0; i < 8; i++) later(i * 40, () => fadingDot(svg, p0[0] + rand(-8, 8), p0[1] + rand(-8, 8), [YELLOW, PINK, SKY][i % 3], rand(4, 7), 700));
        pulse(.6);
        track(animate(f, {
          t: [0, 1], duration: 2600, ease: 'outSine',
          onUpdate: () => { const [x, y] = at(f.t); plane.setAttribute('transform', `translate(${x} ${y}) rotate(${ang(f.t) + Math.sin(f.t * 14) * 5}) scale(${size * (.95 - f.t * .35)})`); const now = performance.now(); if (now - last > 45) { last = now; fadingDot(svg, x - 18, y + 8, [YELLOW, PINK, SKY][Math.floor(f.t * 16) % 3], 5, 800); } },
          onComplete: () => plane.setAttribute('opacity', 0)
        }));
        track(animate(state, { a: [322, 470], duration: 700, delay: 250, ease: 'inOutQuad', onUpdate: drawArm }));       // el brazo regresa
      });
      later(t1 + 4800, () => cycle(false));
    };
    // el niño respira suave mientras espera
    track(animate(kidG, { scaleY: [1, .99], duration: 1800, delay: wait(2200), loop: true, alternate: true, ease: 'inOutSine' }));
    cycle(true);
  });

  // ---- 6 · El poder de las ideas que vuelan: el avión, sobre unos libros, tiembla a punto de despegar.
  moments.register('dream6', (scene, ctx, wait) => {
    const svg = extraSvg('0 0 440 380');
    svgEl('ellipse', { cx: 210, cy: 340, rx: 170, ry: 12, fill: 'rgba(255,243,214,.14)' }, svg);
    [[100, 296, 220, 36, CORAL], [122, 262, 176, 34, SKY], [146, 230, 128, 32, YELLOW]].forEach(([x, y, w, h, fill], i) => {
      const book = svgEl('g', { opacity: 0, style: BOTTOM }, svg);
      svgEl('rect', { x, y, width: w, height: h, rx: 5, fill, stroke: NIGHT, 'stroke-width': 3 }, book);
      svgEl('path', { d: `M${x + 14} ${y + 8}v${h - 16}M${x + 22} ${y + 8}v${h - 16}`, stroke: NIGHT, 'stroke-width': 2, opacity: .5 }, book);
      track(animate(book, { opacity: [0, 1], translateY: [-40, 0], duration: 600, delay: wait(400) + i * 220, ease: 'outBounce' }));
    });
    const winds = [['M10 120q40 -30 80 0t80 0t80 0', .35], ['M30 170q40 -30 80 0t80 0', .25], ['M-10 70q40 -30 80 0t80 0', .2]].map(([d, o]) => {
      const p = svgEl('path', { d, fill: 'none', stroke: CREAM, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: o, 'stroke-dasharray': '14 12' }, svg); return p;
    });
    track(animate(winds, { strokeDashoffset: [0, -52], duration: 1400, delay: wait(900), loop: true, ease: 'linear' }));
    const plane = paperPlane(svg), home = [218, 206], size = 2.3;
    const energy = [0, 1, 2, 3, 4].map((i) => svgEl('path', { d: `M${150 - i * 4} ${230 + i * 9}l-${18 + i * 3} ${6 + i * 3}`, stroke: YELLOW, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }, svg));
    const place = (x, y, rot, s = size, alpha = 1) => { plane.setAttribute('transform', `translate(${x} ${y}) rotate(${rot}) scale(${s})`); plane.setAttribute('opacity', alpha); };
    place(...home, -28, size, 0);

    const cycle = (first) => {
      const t0 = first ? wait(1300) : 400, shake = { a: 0 };
      later(t0, () => place(...home, -28));
      track(animate(shake, { a: [0, 1], duration: 3200, delay: t0, ease: 'inQuad', onUpdate: () => place(home[0] + (Math.random() - .5) * 5 * shake.a, home[1] + (Math.random() - .5) * 4 * shake.a, -28 + (Math.random() - .5) * 5 * shake.a) }));
      track(animate(energy, { opacity: [0, 1, 0], duration: 500, delay: stagger(90, { start: t0 + 800 }), loop: 5, ease: 'inOutQuad' }));
      later(t0 + 3300, () => {
        for (let i = 0; i < 9; i++) later(i * 40, () => fadingDot(svg, 190 + rand(-50, 50), 246 + rand(-6, 8), CREAM, rand(8, 15), 900));
        pulse(.9);
        const f = { t: 0 }, p0 = home, p1 = [300, 60], p2 = [430, 20], p3 = [560, -150];
        const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p0[k] + 3*u*u*t*p1[k] + 3*u*t*t*p2[k] + t*t*t*p3[k]); };
        let last = 0;
        track(animate(f, {
          t: [0, 1], duration: 1700, ease: 'inQuad',
          onUpdate: () => { const [x, y] = at(f.t); place(x, y, -28 - f.t * 24, size * (1 - f.t * .35)); const now = performance.now(); if (now - last > 40) { last = now; fadingDot(svg, x - 20, y + 14, [YELLOW, PINK, SKY][Math.floor(f.t * 12) % 3], 5, 700); } },
          onComplete: () => { place(...home, -28, size, 0); later(1500, () => cycle(false)); }
        }));
      });
    };
    cycle(true);
  });

  // ---- 7 · ¡A la luna!: llueven aviones de papel hacia la luna; unos llegan directo, otros dan vueltas, todos llegan.
  moments.register('dream7', (scene, ctx, wait) => {
    const back = mount(true), front = mount(false), W = innerWidth, H = innerHeight;
    const stars = Array.from({ length: 34 }, () => { const s = svgEl('g', { opacity: 0 }, back); star4(s, rand(.02, .98) * W, rand(.05, .95) * H, rand(4, 10), Math.random() < .3 ? YELLOW : CREAM); return s; });
    track(animate(stars, { opacity: [0, 1], duration: 800, delay: stagger(35, { start: wait(200) }), ease: 'outQuad' }));
    later(wait(2000), () => twinkle(stars, 0));
    const mx = W * .5, my = H * .13, mr = H * .14;
    const moon = svgEl('g', { opacity: 0, style: 'filter:drop-shadow(0 0 30px rgba(255,216,77,.5))' }, back);
    const bump = svgEl('g', { style: CENTER }, moon);
    crayonCircle(bump, mx, my, mr, { fill: '#fff0b8', stroke: YELLOW, w: 4.5 });
    [[-.35, -.2, .2], [.3, .15, .25], [-.05, .5, .14]].forEach(([dx, dy, k]) => crayonCircle(bump, mx + dx * mr, my + dy * mr, k * mr, { fill: '#f5dc8c', stroke: '#e7c765', w: 2.2 }));
    track(animate(moon, { opacity: [0, 1], translateY: [-60, 0], duration: 1600, delay: wait(300), ease: 'outExpo' }));
    let arrived = 0;

    const launch = () => {
      const holder = svgEl('g', {}, front), plane = paperPlane(holder), size = (W * .062 / 74) * rand(.8, 1.3), kind = Math.random();
      const fromSide = Math.random() < .35, left = Math.random() < .5;
      const p0 = fromSide ? [left ? -70 : W + 70, rand(.45, .95) * H] : [rand(.04, .96) * W, H + 70];
      const p3 = [mx + rand(-.6, .6) * mr, my + rand(.05, .7) * mr];
      const p1 = [p0[0] + (p3[0] - p0[0]) * rand(.1, .5) + rand(-W * .18, W * .18), p0[1] + (p3[1] - p0[1]) * rand(.3, .7)];
      const p2 = [p3[0] + rand(-W * .15, W * .15), p3[1] + rand(H * .15, H * .4)];
      const looper = kind < .4, loops = looper ? (Math.random() < .5 ? 1 : 2) : 0, R = H * rand(.05, .09), dir = Math.random() < .5 ? 1 : -1;
      const at = (t) => { const u = 1 - t; return [0, 1].map((k) => u*u*u*p0[k] + 3*u*u*t*p1[k] + 3*u*t*t*p2[k] + t*t*t*p3[k]); };
      const tangent = (t) => { const u = 1 - t; const d = [0, 1].map((k) => 3*u*u*(p1[k]-p0[k]) + 6*u*t*(p2[k]-p1[k]) + 3*t*t*(p3[k]-p2[k])); return Math.atan2(d[1], d[0]); };
      const t1 = rand(.3, .45), span = .14 * loops, state = { t: 0 }; let last = 0;
      const base1 = at(t1), dir1 = tangent(t1);
      track(animate(state, {
        t: [0, 1], duration: rand(3000, 5200) + loops * 700, ease: 'inOutSine',
        onUpdate: () => {
          let [x, y] = at(state.t), h = tangent(state.t), extra = 0;
          if (looper && state.t > t1 && state.t < t1 + span) {                       // vuelta de campana: un círculo en el plano de vuelo
            const phi = ((state.t - t1) / span) * loops * Math.PI * 2;
            x += Math.cos(dir1) * R * Math.sin(phi) - Math.sin(dir1) * R * dir * (1 - Math.cos(phi));
            y += Math.sin(dir1) * R * Math.sin(phi) + Math.cos(dir1) * R * dir * (1 - Math.cos(phi));
            extra = phi * dir;
          } else if (looper && state.t >= t1 + span) { extra = loops * Math.PI * 2 * dir; }
          holder.setAttribute('transform', `translate(${x} ${y}) rotate(${(h + extra) * 180 / Math.PI}) scale(${size * (1.1 - state.t * .45)})`);
          const now = performance.now(); if (now - last > 90) { last = now; fadingDot(front, x, y, Math.random() < .5 ? CREAM : YELLOW, 3, 700); }
        },
        onComplete: () => {
          const [x, y] = at(1);
          animate(plane, { scale: [1, .25], opacity: [1, 0], duration: 320, ease: 'inQuad', onComplete: () => holder.remove() });
          const spark = svgEl('g', { opacity: 1 }, front); star4(spark, x, y, 14, YELLOW);
          animate(spark, { scale: [.2, 1.6], opacity: [1, 0], duration: 600, ease: 'outQuad', onComplete: () => spark.remove() });
          animate(bump, { scale: [1, 1.035, 1], duration: 420, ease: 'outQuad' });
          arrived++; moon.style.filter = `drop-shadow(0 0 ${30 + Math.min(arrived, 40) * 2.2}px rgba(255,216,77,${Math.min(.5 + arrived * .012, .9)}))`;
          if (arrived % 8 === 0) pulse(.7);
        }
      }));
    };
    let count = 0;
    const next = () => { launch(); count++; later(count < 8 ? rand(320, 650) : rand(700, 1500), next); };
    later(wait(1400), next);
  });
})();
