// Central de estudio — núcleo compartido (window.E).
// Cada archivo de sección llama E.section({...}); boot.js arma la navegación y el router (#/id).
// Vanilla JS + ECharts (assets/echarts.min.js). Sin build.
(function () {
  'use strict';
  const E = (window.E = {});

  // ---------------------------------------------------------------- formato
  const nf = (d) => new Intl.NumberFormat('es-MX', { minimumFractionDigits: d, maximumFractionDigits: d });
  const NF = [0, 1, 2, 3].map(nf);
  const ok = (v) => v !== null && v !== undefined && isFinite(v);
  const z = (v, d) => (Math.abs(v) < 0.5 * Math.pow(10, -d) ? 0 : v); // evita "−0"
  E.fmt = {
    n: (v, d = 0) => (ok(v) ? NF[d].format(z(v, d)) : '—'),                        // 1,234
    pct: (v, d = 1) => (ok(v) ? NF[d].format(v * 100) + '%' : '—'),          // 0.123 -> 12.3%
    x: (v, d = 2) => (ok(v) ? NF[d].format(v) + 'x' : '—'),                  // 1.85x
    d: (v, d = 0) => (ok(v) ? NF[d].format(v) + ' días' : '—'),              // 45 días
    $: (v, d = 0) => (ok(v) ? (v < 0 ? '−$' : '$') + NF[d].format(Math.abs(v)) : '—'), // $1,234
    sgn: (v, d = 0) => (ok(v) ? (v > 0 ? '+' : v < 0 ? '−' : '') + NF[d].format(Math.abs(v)) : '—'), // +12 / −12
  };
  E.fmtBy = (kind, v, d) => (E.fmt[kind] || E.fmt.n)(v, d);

  // ---------------------------------------------------------------- html helpers (devuelven strings)
  E.frac = (n, d) => `<span class="frac"><span>${n}</span><span>${d}</span></span>`;
  E.formula = (name, lhs, rhs, note) =>
    `<div class="formula">${name ? `<span class="nm">${name}</span>` : ''}<span class="eq">${lhs}</span><span>=</span><span>${rhs}</span>${note ? `<small>${note}</small>` : ''}</div>`;
  E.tip = (html, src) => `<div class="co tip"><b>Lo que dijo el profe</b>${html}${src ? `<span class="src">${src}</span>` : ''}</div>`;
  E.warn = (html) => `<div class="co warn"><b>Error común</b>${html}</div>`;
  E.kid = (html) => `<div class="co kid"><b>Explicado fácil</b>${html}</div>`;
  E.key = (html, title = 'Idea clave') => `<div class="co key"><b>${title}</b>${html}</div>`;
  E.note = (html, title = 'Nota') => `<div class="co note"><b>${title}</b>${html}</div>`;
  E.fig = (svg, caption, full) => `<figure class="fig${full ? ' full' : ''}">${svg}${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
  E.reveal = (summary, html, open) => `<details class="reveal"${open ? ' open' : ''}><summary>${summary}</summary><div class="rb">${html}</div></details>`;
  E.badge = (kind) =>
    ({ in: '<span class="badge in">● Entra al examen</span>', star: '<span class="badge star">★ Pregunta que no falla</span>', out: '<span class="badge out">No entra al examen · para saber más</span>' }[kind] || '');
  E.link = (id, text) => `<a href="#/${id}">${text}</a>`;
  E.esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  // ficha de concepto: E.concept({id, title, badge, html}) — html puede incluir <div class="cols">…</div>
  E.concept = ({ id, title, badge, html }) =>
    `<section class="concept"${id ? ` id="${id}"` : ''}><header><h3>${title}</h3>${badge ? E.badge(badge) : ''}</header>${html}</section>`;
  // crea un elemento a partir de html
  E.el = (html) => { const t = document.createElement('template'); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  E.$ = (sel, root = document) => root.querySelector(sel);
  E.$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  // ---------------------------------------------------------------- tema / tokens
  E.T = {};
  E.readTheme = () => {
    const cs = getComputedStyle(document.documentElement);
    const g = (k) => cs.getPropertyValue('--' + k).trim();
    ['page', 'surface', 'card', 'ink', 'ink2', 'muted', 'axis', 'line', 'line2', 'grid', 'accent', 'accent-ink', 'accent-wash', 'good', 'bad', 'seq0', 'seq1', 'div-mid',
      'c1', 'c2', 'c3', 'c4', 'c5', 'c6', 'c7', 'c8'].forEach((k) => (E.T[k.replace('-', '_')] = g(k)));
    E.T.c = [E.T.c1, E.T.c2, E.T.c3, E.T.c4, E.T.c5, E.T.c6, E.T.c7, E.T.c8];
    return E.T;
  };

  // ---------------------------------------------------------------- gráficas (ECharts)
  // E.chart(el, (T) => option) -> {refresh(), inst}. Redibuja al cambiar tema y al cambiar tamaño.
  const charts = new Set();
  E.baseOpt = (T = E.T) => ({
    animationDuration: 350, animationDurationUpdate: 300,
    textStyle: { fontFamily: 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif', color: T.ink2 },
    grid: { left: 8, right: 16, top: 30, bottom: 8, containLabel: true },
    tooltip: { trigger: 'axis', backgroundColor: T.card, borderColor: T.line, textStyle: { color: T.ink, fontSize: 13 }, axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(127,127,127,.08)' } } },
    legend: { top: 0, left: 0, textStyle: { color: T.ink2, fontSize: 12 }, itemWidth: 12, itemHeight: 12, icon: 'roundRect' },
  });
  E.axisCat = (data, T = E.T, extra = {}) => ({ type: 'category', data, axisLine: { lineStyle: { color: T.axis } }, axisTick: { show: false }, axisLabel: { color: T.ink2, fontSize: 12, interval: 0, hideOverlap: true }, ...extra });
  E.axisVal = (T = E.T, fmt, extra = {}) => ({ type: 'value', splitLine: { lineStyle: { color: T.grid } }, axisLabel: { color: T.muted, fontSize: 11, formatter: fmt }, ...extra });
  E.chart = (el, fn) => {
    if (typeof el === 'string') el = document.querySelector(el);
    const inst = echarts.init(el, null, { renderer: 'canvas' });
    const c = { el, inst, fn, refresh() { if (!el.isConnected) return; inst.setOption(fn(E.T), true); } };
    c.refresh();
    const ro = new ResizeObserver(() => inst.resize());
    ro.observe(el);
    charts.add(c);
    return c;
  };
  E.disposeCharts = () => { charts.forEach((c) => { try { c.inst.dispose(); } catch (e) {} }); charts.clear(); };
  E.redrawAll = () => { E.readTheme(); charts.forEach((c) => c.refresh()); };

  // ---------------------------------------------------------------- knobs
  // E.knobs(container, defs, onChange, {title}) ; defs: [{k,label,min,max,step,v,fmt:'pct'|'x'|'d'|'$'|'n',dec,hint}]
  // Los valores 'pct' se guardan como fracción (0.35) y el slider trabaja en fracción.
  E.knobs = (container, defs, onChange, opts = {}) => {
    if (typeof container === 'string') container = document.querySelector(container);
    const st = {}; const base = {};
    const box = E.el(`<div class="knobs"><div class="kh"><span>${opts.title || '🎛️ Mueve las perillas'}</span><button class="btn sm" type="button">↺ Reiniciar</button></div></div>`);
    const rows = {};
    defs.forEach((d) => {
      st[d.k] = base[d.k] = d.v;
      const id = 'k' + Math.random().toString(36).slice(2, 8);
      const r = E.el(`<div class="knob"><label for="${id}">${d.label}</label><output></output><input id="${id}" type="range" min="${d.min}" max="${d.max}" step="${d.step}" value="${d.v}">${d.hint ? `<div class="hint">${d.hint}</div>` : ''}</div>`);
      const inp = r.querySelector('input'); const out = r.querySelector('output');
      const show = () => { out.textContent = E.fmtBy(d.fmt || 'n', st[d.k], d.dec ?? (d.fmt === 'pct' ? 1 : d.fmt === 'x' ? 2 : 0)); r.classList.toggle('changed', st[d.k] !== base[d.k]); };
      inp.addEventListener('input', () => { st[d.k] = +inp.value; show(); onChange && onChange({ ...st }, d.k); });
      rows[d.k] = { inp, show }; show(); box.appendChild(r);
    });
    box.querySelector('.kh button').addEventListener('click', () => { Object.keys(base).forEach((k) => { st[k] = base[k]; rows[k].inp.value = base[k]; rows[k].show(); }); onChange && onChange({ ...st }, null); });
    container.appendChild(box);
    const api = {
      el: box, get: () => ({ ...st }),
      set(vals, fire = true) { Object.entries(vals).forEach(([k, v]) => { if (k in st) { st[k] = v; rows[k].inp.value = v; rows[k].show(); } }); if (fire && onChange) onChange({ ...st }, null); },
    };
    onChange && onChange({ ...st }, null);
    return api;
  };

  // ---------------------------------------------------------------- tiles (indicadores)
  // E.tiles(container, [{label, v, fmt, dec, base, better:'up'|'down'|null, note, hl}])  -> redibuja el contenedor
  E.tiles = (container, items) => {
    if (typeof container === 'string') container = document.querySelector(container);
    container.classList.add('tiles');
    container.innerHTML = items.map((t) => {
      let delta = '';
      if (t.base !== undefined && ok(t.base) && ok(t.v) && Math.abs(t.v - t.base) > 1e-9) {
        const diff = t.v - t.base; const better = t.better === 'up' ? diff > 0 : t.better === 'down' ? diff < 0 : null;
        const txt = (diff > 0 ? '▲ ' : '▼ ') + E.fmtBy(t.fmt, Math.abs(diff), t.dec) + ' vs base';
        delta = `<div class="td ${better === null ? '' : better ? 'up' : 'dn'}">${txt}${better === null ? '' : better ? ' · mejor' : ' · peor'}</div>`;
      }
      return `<div class="tile${t.hl ? ' hl' : ''}"><div class="tl">${t.label}</div><div class="tv">${E.fmtBy(t.fmt, t.v, t.dec)}</div>${delta}${t.note ? `<div class="tn">${t.note}</div>` : ''}</div>`;
    }).join('');
  };

  // ---------------------------------------------------------------- quiz
  // E.quiz(container, [{q, o:[...], a:index, w:'por qué'}])
  E.quiz = (container, items) => {
    if (typeof container === 'string') container = document.querySelector(container);
    container.classList.add('quiz');
    items.forEach((it) => {
      const q = E.el(`<div class="qz"><div class="qq">${it.q}</div><div class="qo">${it.o.map((o, i) => `<button type="button" data-i="${i}">${o}</button>`).join('')}</div><div class="qw">${it.w || ''}</div></div>`);
      q.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
        q.querySelectorAll('button').forEach((x) => x.classList.remove('ok', 'ko'));
        const i = +b.dataset.i; b.classList.add(i === it.a ? 'ok' : 'ko'); q.querySelector(`button[data-i="${it.a}"]`).classList.add('ok'); q.classList.add('done');
      }));
      container.appendChild(q);
    });
  };

  // ---------------------------------------------------------------- tabla simple
  // E.table(rows, {head:[...], fmt:[fn|null...]}) -> html. rows: [[label, v1, v2...], ...] ; fila con {cls:'tot'} como último elemento
  E.table = (rows, { head, fmt = [], cls = '' } = {}) => `<div class="tblwrap"><table class="tbl ${cls}">${head ? `<thead><tr>${head.map((h) => `<th>${h}</th>`).join('')}</tr></thead>` : ''}<tbody>${rows.map((r) => {
    const meta = r[r.length - 1] && typeof r[r.length - 1] === 'object' && !Array.isArray(r[r.length - 1]) ? r[r.length - 1] : null; const cells = meta ? r.slice(0, -1) : r;
    return `<tr${meta && meta.cls ? ` class="${meta.cls}"` : ''}>${cells.map((c, i) => `<td>${i && fmt[i] && typeof c === 'number' ? fmt[i](c) : c}</td>`).join('')}</tr>`; }).join('')}</tbody></table></div>`;

  // ---------------------------------------------------------------- secciones
  E.sections = [];
  // E.section({id, n, group, title, short, lead, exam:'in'|'star'|'out'|null, render(root)})
  E.section = (s) => { E.sections.push(s); };
  E.GROUPS = [
    ['inicio', 'Empieza aquí'], ['base', 'Cimientos'], ['razones', 'Razones financieras'], ['flujo', 'Flujo de efectivo'],
    ['lab', 'Laboratorio'], ['casos', 'Casos reales'], ['examen', 'Para el examen'],
  ];

  // ---------------------------------------------------------------- MODELO FINANCIERO CONECTADO
  // Empresa ejemplo "La Tiendita S.A." (cifras en miles de $). Año 0 = balance inicial fijo; año 1 se calcula con los drivers.
  // El efectivo del año 1 es el resultado del flujo (operación + inversión + financiamiento), así el balance SIEMPRE cuadra.
  E.Y0 = { caja: 100, cxc: 150, inv: 200, ppe: 600, cxp: 120, deudaCP: 80, deudaLP: 250, capital: 300, ur: 300 };
  E.DRV = {
    ventas: 1500,     // ingresos del año 1
    mb: 0.35,         // margen bruto (costo de ventas = ventas × (1 − mb))
    go: 0.18,         // gastos operativos (sin depreciación) como % de ventas
    dep: 0.10,        // depreciación anual como % del activo fijo inicial
    tasa: 0.10,       // tasa de interés sobre la deuda inicial
    tax: 0.30,        // tasa de impuestos
    dso: 36.5,        // días de cobro (cuentas por cobrar)
    dio: 75,          // días de inventario
    dpo: 45,          // días de pago a proveedores
    capex: 80,        // compra de activo fijo en el año
    ddeuda: 0,        // deuda nueva (+) o pago de deuda (−) en el año (deuda de largo plazo)
    payout: 0.40,     // % de la utilidad que se reparte como dividendo
    aporte: 0,        // aportación de capital de los socios (+)
  };
  E.model = (drv = E.DRV, y0 = E.Y0) => {
    const d = { ...E.DRV, ...drv };
    const r = {};
    // Estado de resultados (año 1)
    const V = d.ventas, CV = V * (1 - d.mb), UB = V - CV, GO = V * d.go, EBITDA = UB - GO, DA = y0.ppe * d.dep, EBIT = EBITDA - DA;
    const INT = (y0.deudaCP + y0.deudaLP) * d.tasa, UAI = EBIT - INT, IMP = Math.max(0, UAI) * d.tax, UN = UAI - IMP;
    const DIV = Math.max(0, UN) * d.payout;
    r.er = { V, CV, UB, GO, EBITDA, DA, EBIT, INT, UAI, IMP, UN, DIV };
    // Balance año 1 (sin caja todavía)
    const y1 = { cxc: V * d.dso / 365, inv: CV * d.dio / 365, cxp: CV * d.dpo / 365, ppe: y0.ppe + d.capex - DA,
      deudaCP: y0.deudaCP, deudaLP: Math.max(0, y0.deudaLP + d.ddeuda), capital: y0.capital + d.aporte, ur: y0.ur + UN - DIV };
    const dDeuda = y1.deudaLP - y0.deudaLP;
    // Flujo de efectivo (método indirecto)
    const dCxC = y1.cxc - y0.cxc, dInv = y1.inv - y0.inv, dCxP = y1.cxp - y0.cxp;
    const CFO = UN + DA - dCxC - dInv + dCxP, CFI = -d.capex, CFF = dDeuda + d.aporte - DIV, dCaja = CFO + CFI + CFF;
    y1.caja = y0.caja + dCaja;
    r.cf = { UN, DA, dCxC, dInv, dCxP, CFO, CFI, CFF, dDeuda, DIV, aporte: d.aporte, dCaja, caja0: y0.caja, caja1: y1.caja, buffett: CFO + CFI };
    // Método directo (mismo CFO): cobros a clientes − pagos a proveedores − gastos − intereses − impuestos
    const compras = CV + dInv; // compras = costo de ventas + aumento de inventario
    r.cfd = { cobros: V - dCxC, pagosProv: -(compras - dCxP), gastos: -GO, intereses: -INT, impuestos: -IMP };
    r.cfd.CFO = r.cfd.cobros + r.cfd.pagosProv + r.cfd.gastos + r.cfd.intereses + r.cfd.impuestos;
    const tot = (y) => {
      const ac = y.caja + y.cxc + y.inv, a = ac + y.ppe, pc = y.cxp + y.deudaCP, p = pc + y.deudaLP, pat = y.capital + y.ur;
      return { ...y, ac, a, pc, p, pat, pyp: p + pat };
    };
    r.y0 = tot({ ...y0 }); r.y1 = tot(y1);
    // Fuentes y usos (activo: anterior − posterior; pasivo y patrimonio: posterior − anterior)
    const A = r.y0, B = r.y1;
    r.fu = [
      ['Caja', A.caja - B.caja, 'a'], ['Cuentas por cobrar', A.cxc - B.cxc, 'a'], ['Inventarios', A.inv - B.inv, 'a'], ['Activo fijo neto', A.ppe - B.ppe, 'a'],
      ['Proveedores', B.cxp - A.cxp, 'p'], ['Deuda CP', B.deudaCP - A.deudaCP, 'p'], ['Deuda LP', B.deudaLP - A.deudaLP, 'p'],
      ['Capital social', B.capital - A.capital, 'p'], ['Utilidades retenidas', B.ur - A.ur, 'p'],
    ];
    // Razones (año 1) — con las fórmulas del profe
    const invProm = (A.inv + B.inv) / 2;
    r.ratios = {
      rc: B.ac / B.pc, pa: (B.ac - B.inv) / B.pc, cnt: B.ac - B.pc,
      rat: V / B.a, rafn: V / B.ppe, rinv: CV / invProm,
      ppc: B.cxc / (V / 365), ppi: invProm / (CV / 365), ppp: B.cxp / (CV / 365),
      nde: B.p / B.a, cdi: INT ? EBIT / INT : null, csd: EBITDA / (INT + Math.max(0, -dDeuda) + 0),
      mn: UN / V, mo: EBIT / V, mb: UB / V, roa: UN / B.a, roe: UN / B.pat, mult: B.a / B.pat,
    };
    r.ratios.co = r.ratios.ppc + r.ratios.ppi; r.ratios.ce = r.ratios.co - r.ratios.ppp;
    // Ecuación fundamental (flujo de caja libre de la firma, simplificado: KT operativo = CxC + Inv − Proveedores)
    const dKT = -(dCxC + dInv - dCxP);           // fuente(+)/uso(−) del capital de trabajo
    r.fcl = { EBITDA, dKT, IMP: -IMP, capex: -d.capex, FCL: EBITDA + dKT - IMP - d.capex };
    r.fcl.capexA = d.capex / B.a; r.fcl.fclA = r.fcl.FCL / B.a; r.fcl.divA = DIV / B.a;
    r.check = Math.abs(B.a - B.pyp) < 1e-6;
    return r;
  };
})();
