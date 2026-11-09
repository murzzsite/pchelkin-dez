(() => {
  const LEAD_ENDPOINT = 'https://lead-relay.leestygpt.workers.dev/lead/U6PSYLKMT7';
  const root = document.documentElement;
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const smooth = (a, b, v) => { const k = clamp((v - a) / (b - a)); return k * k * (3 - 2 * k); };

  const y = $('#year'); if (y) y.textContent = new Date().getFullYear();

  /* ---------- header ---------- */
  const burger = $('#burger'), nav = $('#nav');
  const closeNav = () => { burger?.classList.remove('is-open'); nav?.classList.remove('is-open'); burger?.setAttribute('aria-expanded', 'false'); };
  burger?.addEventListener('click', () => {
    const o = burger.classList.toggle('is-open');
    nav.classList.toggle('is-open', o);
    burger.setAttribute('aria-expanded', String(o));
  });
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeNav));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeNav(); });

  /* ---------- smooth anchors ---------- */
  $$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const h = a.getAttribute('href'); if (h.length < 2) return;
    const t = $(h); if (!t) return;
    e.preventDefault();
    const top = h === '#top' ? 0 : t.getBoundingClientRect().top + scrollY - 84;
    window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
  }));

  /* ---------- intro: hero shutter + name rise ---------- */
  const start = () => root.classList.add('ready');
  const go = () => requestAnimationFrame(start);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(go); else go();
  setTimeout(start, 900);

  /* ---------- reveal on scroll (rAF check, not IntersectionObserver) ---------- */
  const rev = $$('[data-r]');
  const checkReveal = () => {
    const vh = innerHeight;
    rev.forEach(el => {
      if (el.classList.contains('is-in')) return;
      if (el.getBoundingClientRect().top < vh * 0.96) el.classList.add('is-in');
    });
  };

  /* ---------- parallax on hero photos ---------- */
  const par = $$('.hero__ph img');
  const doPar = () => {
    if (reduce) return;
    if (scrollY > innerHeight * 1.2) return;
    par.forEach(img => { img.style.translate = `0 ${(scrollY * -0.06).toFixed(1)}px`; });
  };

  /* ---------- nav highlight ---------- */
  const navLinks = $$('.bar__nav a');
  const secs = navLinks.map(a => $(a.getAttribute('href'))).filter(Boolean);
  const doNav = () => {
    const mid = innerHeight * 0.4;
    let cur = null;
    secs.forEach(s => { const r = s.getBoundingClientRect(); if (r.top < mid && r.bottom > mid) cur = s.id; });
    navLinks.forEach(a => a.classList.toggle('is-on', a.getAttribute('href') === '#' + cur));
  };

  /* ---------- mosaic: one photograph cut across tiles ---------- */
  const board = $('#board');
  const mosaic = {
    wide: { cols: 6, rows: 4, img: 'img/mosaic-wide.jpg', cells: {
      '0,0': { t: 'h' }, '1,3': { t: 'f', b: '4,97', p: 'на Профи.ру, 132 отзыва' },
      '2,1': { t: 'f', b: '5,0', p: 'в Яндекс Услугах, 114 оценок' },
      '2,4': { t: 'f', b: '−15%', p: 'пенсионерам, инвалидам и многодетным' },
      '3,5': { t: 'a' } } },
    tall: { cols: 3, rows: 6, img: 'img/mosaic-tall.jpg', cells: {
      '0,0': { t: 'h', span: 2 }, '1,2': { t: 'f', b: '4,97', p: 'на Профи.ру, 132 отзыва' },
      '3,0': { t: 'f', b: '5,0', p: 'в Яндекс Услугах' },
      '5,2': { t: 'a' } } }
  };
  let mosaicMode = '';
  const buildMosaic = () => {
    if (!board) return;
    const m = innerWidth <= 700 ? 'tall' : 'wide';
    if (m === mosaicMode) return;
    mosaicMode = m;
    const cfg = mosaic[m];
    board.innerHTML = '';
    board.style.gridTemplateColumns = `repeat(${cfg.cols},1fr)`;
    let i = 0;
    const skip = new Set();
    for (let r = 0; r < cfg.rows; r++) for (let c = 0; c < cfg.cols; c++) {
      const key = r + ',' + c;
      if (skip.has(key)) continue;
      const cell = cfg.cells[key];
      const d = document.createElement(cell && cell.t === 'a' ? 'a' : 'div');
      d.className = 'mt';
      d.style.setProperty('--i', i++);
      if (cell && cell.span) { d.style.gridColumn = 'span ' + cell.span; d.style.aspectRatio = cell.span + '/1'; skip.add(r + ',' + (c + 1)); }
      const img = document.createElement('div');
      img.className = 'mt__img';
      img.style.backgroundImage = `url(${cfg.img})`;
      img.style.backgroundSize = `${cfg.cols * 100}% ${cfg.rows * 100}%`;
      const x = cfg.cols > 1 ? (c / (cfg.cols - 1)) * 100 : 0;
      const yy = cfg.rows > 1 ? (r / (cfg.rows - 1)) * 100 : 0;
      img.style.backgroundPosition = `${x}% ${yy}%`;
      d.appendChild(img);
      if (cell) {
        d.classList.add('mt--c', 'mt--' + cell.t);
        if (cell.t === 'h') d.innerHTML = '<h2>Работы на объектах</h2>';
        if (cell.t === 'f') d.innerHTML = `<b>${cell.b}</b><p>${cell.p}</p>`;
        if (cell.t === 'a') { d.href = 'https://t.me/pchela3636'; d.target = '_blank'; d.rel = 'noopener'; d.innerHTML = cfg.cols === 3 ? '<span>Написать в Telegram</span>' : '<span>Написать Денису в Telegram</span>'; }
      }
      board.appendChild(d);
    }
    if (reduce) $$('.mt', board).forEach(t => t.classList.add('is-in'));
    checkMosaic();
  };
  const checkMosaic = () => {
    if (!board) return;
    const vh = innerHeight;
    $$('.mt', board).forEach(t => {
      if (t.classList.contains('is-in')) return;
      if (t.getBoundingClientRect().top < vh * 0.98) t.classList.add('is-in');
    });
  };

  /* ---------- visit scene: a flat gets cleaned as you scroll ---------- */
  const cv = $('#plan');
  const track = $('.visit__track');
  const stepsEl = $$('.step');
  const cnt = $('#cnt'), cntl = $('#cntl'), cntBox = $('.plan__count');
  let planP = 0, planVisible = false, raf = 0;
  const N = 140;
  const rooms = [
    { x: 0, y: 0, w: 38, h: 46, n: 40 },    // kitchen
    { x: 40, y: 0, w: 60, h: 46, n: 22 },   // living
    { x: 0, y: 50, w: 24, h: 30, n: 14 },   // hall
    { x: 26, y: 50, w: 18, h: 30, n: 28 },  // bath
    { x: 46, y: 50, w: 54, h: 30, n: 36 }   // bedroom
  ];
  const doors = [
    { x: 8, y: 45.5, w: 8, h: 5 }, { x: 70, y: 45.5, w: 10, h: 5 },
    { x: 37.5, y: 18, w: 3, h: 10 }, { x: 23.5, y: 60, w: 3, h: 8 },
    { x: 44, y: 62, w: 2.5, h: 8 }, { x: 5, y: 79.5, w: 12, h: 1 }
  ];
  const furniture = [
    { x: 2, y: 2, w: 34, h: 6 }, { x: 52, y: 6, w: 24, h: 10 }, { x: 60, y: 20, w: 16, h: 14 },
    { x: 48, y: 62, w: 26, h: 14 }, { x: 28, y: 52, w: 14, h: 8 }
  ];
  const sources = [{ x: 11, y: 78 }, { x: 34, y: 24 }, { x: 70, y: 34 }, { x: 78, y: 66 }];
  const maxR = 62;
  const bugs = [];
  let seed = 20261109;
  const rnd = () => (seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296;
  rooms.forEach(rm => {
    for (let i = 0; i < rm.n; i++) {
      const edge = rnd() < 0.55;
      let bx = rm.x + 2 + rnd() * (rm.w - 4), by = rm.y + 2 + rnd() * (rm.h - 4);
      if (edge) { const s = Math.floor(rnd() * 4); if (s === 0) by = rm.y + 1.8; if (s === 1) by = rm.y + rm.h - 1.8; if (s === 2) bx = rm.x + 1.8; if (s === 3) bx = rm.x + rm.w - 1.8; }
      bugs.push({ rm, x: bx, y: by, a: rnd() * 6.283, sp: 0.5 + rnd() * 1.6, ph: rnd() * 100, sz: 0.85 + rnd() * 0.4, rank: rnd() });
    }
  });
  bugs.forEach(b => {
    const d = Math.min(...sources.map(s => Math.hypot(s.x - b.x, s.y - b.y)));
    b.t = 0.5 + 0.34 * clamp(d / maxR) * 0.95 + rnd() * 0.035;
  });
  const css = n => getComputedStyle(root).getPropertyValue(n).trim();
  let col = null;
  const lensPath = [[8, 66], [10, 8], [34, 36], [60, 10], [90, 40], [86, 70], [58, 74], [34, 66]];
  const lensAt = k => {
    const f = k * (lensPath.length - 1), i = Math.min(lensPath.length - 2, Math.floor(f)), u = f - i;
    const e = u * u * (3 - 2 * u);
    return [lensPath[i][0] + (lensPath[i + 1][0] - lensPath[i][0]) * e, lensPath[i][1] + (lensPath[i + 1][1] - lensPath[i][1]) * e];
  };
  let W = 0, H = 0, dpr = 1, S = 1, OX = 0, OY = 0, lastN = -1, lastStep = -1;
  const sizeCanvas = () => {
    if (!cv) return;
    dpr = Math.min(2, window.devicePixelRatio || 1);
    const r = cv.getBoundingClientRect();
    W = Math.max(10, Math.round(r.width * dpr)); H = Math.max(10, Math.round(r.height * dpr));
    cv.width = W; cv.height = H;
    const pad = Math.max(16, W * 0.04);
    S = Math.min((W - pad * 2) / 100, (H - pad * 2 - H * 0.12) / 80);
    OX = (W - 100 * S) / 2; OY = (H - 80 * S) / 2 + H * 0.05;
    col = null;
  };
  const drawPlan = (p, time) => {
    if (!cv) return;
    const ctx = cv.getContext('2d');
    if (!col) col = { ink: css('--ink'), paper: css('--paper'), surface: css('--surface'), deep: css('--deep'), accent: css('--accent'), bg: css('--bg'), muted: css('--muted') };
    ctx.clearRect(0, 0, W, H);
    ctx.save(); ctx.translate(OX, OY); ctx.scale(S, S);
    // walls as one filled block, rooms cut out of it
    ctx.fillStyle = col.ink; ctx.globalAlpha = 0.88;
    ctx.beginPath(); ctx.roundRect(-1.4, -1.4, 102.8, 82.8, 1.2); ctx.fill();
    ctx.globalAlpha = 1;
    rooms.forEach(rm => { ctx.fillStyle = col.bg; ctx.fillRect(rm.x, rm.y, rm.w, rm.h); });
    doors.forEach(d => { ctx.fillStyle = col.bg; ctx.fillRect(d.x, d.y, d.w, d.h); });
    ctx.fillStyle = col.deep;
    furniture.forEach(f => { ctx.beginPath(); ctx.roundRect(f.x, f.y, f.w, f.h, 0.8); ctx.fill(); });

    // marks: found nests
    const mk = smooth(0.02, 0.44, p);
    // bugs
    let alive = 0;
    for (const b of bugs) {
      const a = 1 - smooth(b.t - 0.012, b.t + 0.012, p);
      if (a > 0.5) alive++;
      const w = b.rm;
      const live = a > 0.02;
      if (live && !reduce) {
        const v = b.sp * a;
        b.a += (Math.sin(time * 0.0007 + b.ph) + Math.sin(time * 0.0013 + b.ph * 2)) * 0.035;
        b.x += Math.cos(b.a) * v * 0.016; b.y += Math.sin(b.a) * v * 0.016;
        if (b.x < w.x + 1.2) { b.x = w.x + 1.2; b.a = Math.PI - b.a; }
        if (b.x > w.x + w.w - 1.2) { b.x = w.x + w.w - 1.2; b.a = Math.PI - b.a; }
        if (b.y < w.y + 1.2) { b.y = w.y + 1.2; b.a = -b.a; }
        if (b.y > w.y + w.h - 1.2) { b.y = w.y + w.h - 1.2; b.a = -b.a; }
      }
      const dead = 1 - a;
      const fade = a > 0.02 ? 1 : 1 - smooth(b.t + 0.012, b.t + 0.07, p);
      if (fade <= 0.01) continue;
      ctx.save(); ctx.translate(b.x, b.y); ctx.rotate(b.a);
      ctx.globalAlpha = (a > 0.02 ? 0.35 + 0.65 * a : 0.35) * fade;
      const k = b.sz * (1 + dead * 0.0);
      ctx.fillStyle = a > 0.5 ? col.ink : col.muted;
      ctx.beginPath(); ctx.ellipse(0, 0, 1.15 * k, 0.65 * k, 0, 0, 6.283); ctx.fill();
      ctx.beginPath(); ctx.ellipse(1.05 * k, 0, 0.42 * k, 0.4 * k, 0, 0, 6.283); ctx.fill();
      ctx.strokeStyle = ctx.fillStyle; ctx.lineWidth = 0.14;
      const sw = a > 0.5 ? Math.sin(time * 0.02 + b.ph * 9) * 0.22 : 0;
      ctx.beginPath();
      for (const lx of [-0.5, 0, 0.5]) { ctx.moveTo(lx * k, 0.4 * k); ctx.lineTo((lx + 0.3 + sw) * k, 1.15 * k); ctx.moveTo(lx * k, -0.4 * k); ctx.lineTo((lx + 0.3 - sw) * k, -1.15 * k); }
      ctx.moveTo(1.4 * k, 0.12 * k); ctx.lineTo(2.1 * k, 0.55 * k); ctx.moveTo(1.4 * k, -0.12 * k); ctx.lineTo(2.1 * k, -0.55 * k);
      ctx.stroke();
      ctx.restore();
      if (mk > b.rank && a > 0.5 && p < 0.52) {
        ctx.save(); ctx.globalAlpha = 0.9 * (1 - smooth(0.46, 0.52, p));
        ctx.strokeStyle = col.accent; ctx.lineWidth = 0.34;
        ctx.beginPath(); ctx.arc(b.x, b.y, 1.9, 0, 6.283); ctx.stroke(); ctx.restore();
      }
    }
    ctx.globalAlpha = 1;

    // lens (step 1)
    if (p < 0.27) {
      const k = clamp(p / 0.25);
      const [lx, ly] = lensAt(k);
      const la = 1 - smooth(0.23, 0.27, p);
      ctx.save(); ctx.globalAlpha = la;
      ctx.fillStyle = col.accent; ctx.globalAlpha = 0.14 * la; ctx.beginPath(); ctx.arc(lx, ly, 7, 0, 6.283); ctx.fill();
      ctx.globalAlpha = la; ctx.strokeStyle = col.accent; ctx.lineWidth = 0.9; ctx.beginPath(); ctx.arc(lx, ly, 7, 0, 6.283); ctx.stroke();
      ctx.lineCap = 'round'; ctx.lineWidth = 1.6; ctx.beginPath(); ctx.moveTo(lx + 5, ly + 5); ctx.lineTo(lx + 10.5, ly + 10.5); ctx.stroke();
      ctx.restore();
    }

    // fog (step 3), flat translucent circles, clipped to the flat
    const f = smooth(0.5, 0.86, p);
    const fogA = p > 0.88 ? 1 - smooth(0.88, 1, p) * 0.85 : 1;
    if (f > 0.001) {
      ctx.save();
      ctx.beginPath(); rooms.forEach(rm => ctx.rect(rm.x, rm.y, rm.w, rm.h)); doors.forEach(d => ctx.rect(d.x, d.y, d.w, d.h)); ctx.clip();
      ctx.fillStyle = col.accent;
      sources.forEach((s, si) => {
        const R = f * maxR;
        for (let k = 0; k < 5; k++) {
          const rr = R * (1 - k * 0.1);
          const ox = Math.sin(time * 0.0004 + si * 2 + k) * 1.6 * (reduce ? 0 : 1), oy = Math.cos(time * 0.0005 + si + k * 1.7) * 1.6 * (reduce ? 0 : 1);
          ctx.globalAlpha = 0.045 * fogA;
          ctx.beginPath(); ctx.arc(s.x + ox, s.y + oy, Math.max(0, rr), 0, 6.283); ctx.fill();
        }
      });
      ctx.restore();
    }
    // hatch handle
    ctx.restore();
    return alive;
  };
  const updateStepUI = p => {
    const s = p < 0.25 ? 0 : p < 0.5 ? 1 : p < 0.86 ? 2 : 3;
    if (s !== lastStep) { stepsEl.forEach((el, i) => el.classList.toggle('is-active', i === s)); lastStep = s; }
  };
  const planProgress = () => {
    if (!track) return 0;
    const r = track.getBoundingClientRect();
    const total = r.height - innerHeight;
    return total > 0 ? clamp(-r.top / total) : 0;
  };
  const frame = time => {
    raf = 0;
    if (!planVisible) return;
    const target = planProgress();
    planP += (target - planP) * 0.22;
    if (Math.abs(target - planP) < 0.0004) planP = target;
    const alive = drawPlan(planP, time);
    updateStepUI(planP);
    if (alive !== lastN) {
      cnt.textContent = alive;
      cntl.textContent = alive === 0 ? 'ни одного' : (planP < 0.5 ? 'насекомых на схеме' : 'насекомых осталось');
      cntBox.classList.toggle('is-done', alive === 0);
      lastN = alive;
    }
    raf = requestAnimationFrame(frame);
  };
  const kick = () => { if (!raf && planVisible && !reduce) raf = requestAnimationFrame(frame); };
  if (cv) {
    if (reduce) {
      sizeCanvas(); planP = 0.62;
      const redraw = () => { sizeCanvas(); drawPlan(planP, 0); };
      redraw(); addEventListener('resize', redraw);
      document.fonts?.ready.then(redraw);
      cnt.textContent = '38'; cntl.textContent = 'насекомых осталось';
    } else {
      sizeCanvas();
      addEventListener('resize', sizeCanvas);
      const vis = () => {
        const r = $('.visit').getBoundingClientRect();
        const was = planVisible;
        planVisible = r.bottom > -200 && r.top < innerHeight + 200;
        if (planVisible && !was) kick();
      };
      addEventListener('scroll', vis, { passive: true }); vis();
    }
  }

  /* ---------- scroll loop ---------- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return; ticking = true;
    requestAnimationFrame(() => { checkReveal(); checkMosaic(); doPar(); doNav(); ticking = false; });
  };
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', () => { buildMosaic(); onScroll(); });
  buildMosaic(); onScroll(); setTimeout(onScroll, 300);

  /* ---------- calculator ---------- */
  const calc = $('#calc');
  const SVC = {
    bugs:  { name: 'Клопы и тараканы', area: true,  note: 'Ориентир для квартиры. Зависит от площади и степени заражения.', price: a => { const v = 3500 + (a - 20) / 130 * 9500; return [Math.round(v / 500) * 500]; } },
    mold:  { name: 'Плесень', area: true, note: 'От 800 до 1 200 ₽ за квадратный метр обработки.', price: a => [800 * a, 1200 * a], max: 60, def: 8, unit: 'м² плесени' },
    rats:  { name: 'Грызуны', area: false, note: 'Дератизация: крысы и мыши. Итоговая сумма после осмотра.', from: 4000 },
    smell: { name: 'Запах', area: false, note: 'Обработка помещения от запахов. Итоговая сумма после осмотра.', from: 5000 },
    plot:  { name: 'Участок', area: false, note: 'Клещи, комары, муравьи, осы, борщевик. Итоговая сумма после осмотра.', from: 4000 },
    emerg: { name: 'Уборка после ЧП', area: false, note: 'После пожара, потопа и других происшествий. Итоговая сумма после осмотра.', from: 10000 }
  };
  if (calc) {
    const range = $('#calc-range'), areaBox = $('#calc-area'), areaV = $('#calc-area-v'), areaL = $('#calc-area-l');
    const sumEl = $('#calc-sum'), noteEl = $('#calc-note'), disc = $('#calc-disc'), hidden = $('#calc-hidden');
    let svc = 'bugs', shown = [6000, 0], rafT = 0, last = '';
    const fmt = n => Math.round(n).toLocaleString('ru-RU').replace(/ /g, ' ');
    const setRange = k => {
      const c = SVC[k];
      if (k === 'bugs') { range.min = 20; range.max = 150; range.step = 5; range.value = 45; areaL.textContent = 'Площадь помещения'; }
      if (k === 'mold') { range.min = 1; range.max = 60; range.step = 1; range.value = 8; areaL.textContent = 'Площадь плесени'; }
      areaBox.hidden = !c.area;
    };
    const compute = () => {
      const c = SVC[svc], k = disc.checked ? 0.85 : 1;
      let lo, hi, pre = '', txt;
      if (c.from) { lo = c.from * k; txt = [pre = 'от ', lo]; }
      else if (svc === 'bugs') { lo = c.price(+range.value)[0] * k; txt = ['около ', lo]; }
      else { const [a, b] = c.price(+range.value); lo = a * k; hi = b * k; txt = ['', lo, hi]; }
      areaV.textContent = range.value + ' м²';
      return { txt, lo, hi, c };
    };
    const render = (v0, v1, pre) => { sumEl.textContent = v1 == null ? pre + fmt(v0) + ' ₽' : fmt(v0) + ' – ' + fmt(v1) + ' ₽'; };
    const update = () => {
      const { txt, lo, hi, c } = compute();
      noteEl.textContent = c.note + (disc.checked ? ' Скидка 15% учтена.' : '');
      const to = [lo, hi == null ? 0 : hi];
      const range2 = hi != null;
      const from = shown.slice(), t0 = performance.now();
      cancelAnimationFrame(rafT);
      const done = () => { shown = to; render(to[0], range2 ? to[1] : null, txt[0]); };
      if (reduce) return done();
      const step = t => {
        const e = clamp((t - t0) / 420), q = 1 - Math.pow(1 - e, 3);
        const a = from[0] + (to[0] - from[0]) * q, b = from[1] + (to[1] - from[1]) * q;
        render(a, range2 ? b : null, txt[0]);
        if (e < 1) rafT = requestAnimationFrame(step); else shown = to;
      };
      rafT = requestAnimationFrame(step);
      const m = svc === 'bugs' || svc === 'mold' ? ', ' + range.value + ' м²' : '';
      last = `${c.name}${m}: ${sumEl.textContent || ''}`;
    };
    $$('input[name="svc"]', calc).forEach(r => r.addEventListener('change', () => { svc = r.value; setRange(svc); update(); }));
    range.addEventListener('input', update);
    disc.addEventListener('change', update);
    setRange(svc); update();
    $('#calc-go').addEventListener('click', () => {
      const c = SVC[svc];
      const m = c.area ? ', ' + range.value + ' м²' : '';
      hidden.value = `Расчёт на сайте: ${c.name}${m}, ${sumEl.textContent}${disc.checked ? ' (со скидкой 15%)' : ''}`;
      const map = { bugs: 'Клопы или тараканы', mold: 'Плесень', rats: 'Крысы или мыши', smell: 'Запах', plot: 'Участок: клещи, комары, осы', emerg: 'Уборка после ЧП' };
      const sel = $('#leadForm select'); if (sel) sel.value = map[svc];
      const t = $('#contact');
      window.scrollTo({ top: t.getBoundingClientRect().top + scrollY - 70, behavior: reduce ? 'auto' : 'smooth' });
      setTimeout(() => $('#leadForm input[name="name"]')?.focus({ preventScroll: true }), 700);
    });
  }

  /* ---------- form → Cloudflare Worker → Telegram ---------- */
  const form = $('#leadForm');
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]'), orig = btn.textContent;
    const payload = {}; new FormData(form).forEach((v, k) => payload[k] = v);
    if (payload._gotcha) return;
    let bad = false;
    ['name', 'contact'].forEach(k => {
      const f = form.elements[k]; const ok = (payload[k] || '').trim().length >= (k === 'name' ? 2 : 5);
      f.classList.toggle('bad', !ok); if (!ok) bad = true;
    });
    if (bad) return;
    payload.comment = `Что беспокоит: ${payload.problem}` + (payload.calc ? `; ${payload.calc}` : '');
    delete payload.calc;
    payload.source = 'pchelkin-dez';
    btn.disabled = true; btn.textContent = 'Отправляем...';
    try {
      const resp = await fetch(LEAD_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      if (!resp.ok) throw new Error('HTTP ' + resp.status);
      btn.textContent = 'Заявка отправлена. Напишу вам';
      form.reset();
    } catch (err) { console.error(err); btn.textContent = 'Ошибка, попробуйте ещё раз'; }
    finally { setTimeout(() => { btn.textContent = orig; btn.disabled = false; }, 3500); }
  });
})();
