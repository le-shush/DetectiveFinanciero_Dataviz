// Sección 8 — Flujo de efectivo contable (3 renglones, perfiles, directo vs indirecto, ajustes, 4 pasos)
// Sección 8.5 — Flujo de caja libre / ecuación fundamental (FCL, flujo no operativo, indicadores sobre activos)
(function () {
  'use strict';
  const sg = (v, d = 1) => E.fmt.sgn(v, d);
  const n1 = (v) => E.fmt.n(v, 1);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ------------------------------------------------------------------ cascada (waterfall) genérica
  // getSteps(T) -> [{name, v, total:bool, color}] ; fmtv(v, signed) -> texto
  function waterfall(el, getSteps, fmtv) {
    return E.chart(el, (T) => {
      const steps = getSteps(T);
      let run = 0;
      const data = steps.map((s, i) => {
        let lo, hi;
        if (s.total) { lo = Math.min(0, s.v); hi = Math.max(0, s.v); run = s.v; }
        else { const a = run, b = run + s.v; lo = Math.min(a, b); hi = Math.max(a, b); run = b; }
        return { name: s.name, value: [i, lo, hi, s.v, s.total ? 1 : 0], itemStyle: { color: s.color } };
      });
      return {
        ...E.baseOpt(T),
        grid: { left: 8, right: 16, top: 34, bottom: 22, containLabel: true },
        legend: { show: false },
        tooltip: {
          trigger: 'item', backgroundColor: T.card, borderColor: T.line, textStyle: { color: T.ink, fontSize: 13 },
          formatter: (p) => p.name + ': <b>' + fmtv(p.value[3], !p.value[4]) + '</b>',
        },
        xAxis: E.axisCat(steps.map((s) => s.name), T),
        yAxis: E.axisVal(T, (v) => E.fmt.n(v)),
        series: [{
          type: 'custom', encode: { x: 0, y: [1, 2] }, data,
          renderItem: (params, api) => {
            const x = api.value(0), lo = api.value(1), hi = api.value(2), v = api.value(3), tot = api.value(4);
            const top = api.coord([x, hi]), bot = api.coord([x, lo]);
            const w = api.size([1, 0])[0] * 0.56, h = Math.max(2, bot[1] - top[1]);
            const up = v >= 0;
            return {
              type: 'group', children: [
                { type: 'rect', shape: { x: top[0] - w / 2, y: top[1], width: w, height: h, r: 4 }, style: { fill: api.visual('color') } },
                { type: 'text', style: { text: fmtv(v, !tot), x: top[0], y: up ? top[1] - 4 : bot[1] + 4, align: 'center', verticalAlign: up ? 'bottom' : 'top', fill: T.ink, font: '600 12px system-ui, sans-serif' } },
              ],
            };
          },
        }],
      };
    });
  }

  // ------------------------------------------------------------------ SVG: tinaco con 3 tuberías
  const PIPES = [['Operación', 1], ['Inversión', 2], ['Financiamiento', 3]];
  function tinaco(o, i, f, c0) {
    const vals = [o, i, f];
    const c1 = c0 + o + i + f;
    const pos = vals.reduce((s, v) => s + Math.max(0, v), 0);
    const cap = Math.max(c0 + pos, c0, c1, 1) * 1.08;
    const tx = 440, tw = 170, ty = 50, th = 240;
    const lvl = (c) => ty + th - th * clamp(c / cap, 0, 1);
    const ys = [105, 170, 235];
    const big = Math.max(1, ...vals.map(Math.abs));
    let pipes = '';
    vals.forEach((v, k) => {
      const y = ys[k], n = PIPES[k][1];
      const t = (4 + 12 * Math.min(1, Math.abs(v) / big)).toFixed(1);
      const inn = v >= 0, x1 = 170, x2 = tx;
      const path = inn ? `M${x1} ${y} L${x2 - 16} ${y}` : `M${x2} ${y} L${x1 + 16} ${y}`;
      const head = inn ? `${x2 - 2},${y} ${x2 - 20},${y - 12} ${x2 - 20},${y + 12}` : `${x1},${y} ${x1 + 18},${y - 12} ${x1 + 18},${y + 12}`;
      pipes += `<rect x="${x1}" y="${y - 15}" width="${x2 - x1}" height="30" rx="7" class="bg2"/>
        <path d="${path}" class="ln s${n} anim-flow" style="stroke-width:${t}px"/>
        <polygon points="${head}" class="f${n}"/>
        <text x="14" y="${y - 3}" font-size="15" font-weight="700">${PIPES[k][0]}</text>
        <text x="14" y="${y + 17}" font-size="14" font-weight="600" class="${inn ? 'fgood' : 'fbad'}">${inn ? '▶ entra ' : '◀ sale '}${sg(v, 0)}</text>`;
    });
    const yw = lvl(Math.max(0, c1)), y0 = lvl(c0);
    const water = c1 > 0 ? `<rect x="${tx + 4}" y="${yw.toFixed(1)}" width="${tw - 8}" height="${Math.max(0, ty + th - 4 - yw).toFixed(1)}" rx="10" class="f5" opacity=".5"/>` : '';
    const neg = c1 < 0;
    return `<svg class="ill" viewBox="0 0 790 320" role="img" aria-label="Tinaco de caja con tres tuberías: operación, inversión y financiamiento">
      ${pipes}
      <rect x="${tx + 50}" y="${ty - 16}" width="70" height="18" rx="5" class="bg2"/>
      <rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="14" class="bd"/>
      ${water}
      ${neg ? `<rect x="${tx}" y="${ty}" width="${tw}" height="${th}" rx="14" class="ln sbad" style="stroke-width:4px"/>` : ''}
      <line x1="${tx - 8}" y1="${y0.toFixed(1)}" x2="${tx + tw + 8}" y2="${y0.toFixed(1)}" class="lnm dash"/>
      <text x="${tx + tw / 2}" y="${ty + 34}" text-anchor="middle" font-size="14" class="t2">Caja final</text>
      <text x="${tx + tw / 2}" y="${ty + 58}" text-anchor="middle" font-size="20" font-weight="700" class="${neg ? 'fbad' : ''}">${E.fmt.n(c1, 0)}</text>
      ${neg ? `<text x="${tx + tw / 2}" y="${ty + 80}" text-anchor="middle" font-size="13" font-weight="700" class="fbad">✗ ¡Sobregiro!</text>` : ''}
      <g font-size="14">
        <text x="${tx + tw + 16}" y="${(y0 + 5).toFixed(1)}" class="tm">← inicial ${E.fmt.n(c0, 0)}</text>
        <text x="${tx + tw + 16}" y="22" class="t2">Δ caja = ${sg(c1 - c0, 0)}</text>
        <text x="${tx + tw + 16}" y="44" class="t2">Buffett = ${sg(o + i, 0)}</text>
      </g>
    </svg>`;
  }

  // ------------------------------------------------------------------ SVG: utilidad vs caja (dos frascos)
  function jars(util, caja) {
    const m = Math.max(Math.abs(util), Math.abs(caja), 1), H = 115, base = 205;
    const bar = (x, v, cls, title, sub) => {
      const h = H * Math.abs(v) / m, y = v >= 0 ? base - h : base;
      return `<rect x="${x - 70}" y="${y.toFixed(1)}" width="140" height="${Math.max(2, h).toFixed(1)}" rx="8" class="${cls}"/>
        <text x="${x}" y="${(v >= 0 ? y - 8 : y + h + 20).toFixed(1)}" text-anchor="middle" font-size="18" font-weight="700" class="${v < 0 ? 'fbad' : ''}">${sg(v, 0)}</text>
        <text x="${x}" y="30" text-anchor="middle" font-size="15" font-weight="700">${title}</text>
        <text x="${x}" y="50" text-anchor="middle" font-size="13" class="tm">${sub}</text>`;
    };
    return `<svg class="ill" viewBox="0 0 620 350" role="img" aria-label="Utilidad contable comparada con la caja que realmente entró">
      <line x1="40" y1="${base}" x2="580" y2="${base}" class="ln"/>
      ${bar(170, util, 'f1', '📒 Utilidad', 'lo que dice la contabilidad')}
      ${bar(450, caja, 'f5', '🐷 Caja de la operación', 'lo que hay en la alcancía')}
      <text x="310" y="${base - 6}" text-anchor="middle" font-size="12" class="tm">0</text>
    </svg>`;
  }

  // ------------------------------------------------------------------ perfiles por signos
  const PROF = {
    valor: { ic: '🏛️', name: 'Acción de valor (madura)', lvl: 'ok', d: 'Opera con caja de sobra, reinvierte con disciplina y <b>regresa mucho a bancos y dueños</b> (dividendos + recompras). Ej.: Walmart, Coca-Cola, McDonald’s, Apple, cementeras. Además del dividendo, la acción crece.' },
    ingreso: { ic: '🧓', name: 'Acción de ingreso', lvl: 'ok', d: 'Opera positivo, <b>invierte poquito</b> y reparte casi todo como dividendo. Acción "planita" pero paga religiosamente. Ej.: utilities (Duke Energy), FIBRAs/REITs, Pepsi.' },
    crec: { ic: '🚀', name: 'Acción de crecimiento', lvl: 'mid', d: 'La operación <b>consume</b> caja, todo se va a <b>inversión</b> y lo paga el <b>financiamiento</b> externo (socios, warrants, deuda). Más riesgo, más potencial. Normal en startups (computación cuántica, IA).' },
    expan: { ic: '🏗️', name: 'Expansión con ayuda', lvl: 'mid', d: 'Opera positivo pero invierte <b>más de lo que genera</b> (o quiere colchón) y por eso <b>pide dinero</b>. Típico de un plan de expansión: revisa que las ventas crezcan para justificarlo.' },
    achica: { ic: '✂️', name: 'Se está achicando / reestructura', lvl: 'mid', d: 'Opera positivo y además <b>vende activos</b> para pagar deudas o repartir. Puede ser limpieza sana… o una empresa que se encoge. Hay que ver si vende lo que no es core.' },
    sobrevive: { ic: '🆘', name: 'Sobreviviendo', lvl: 'bad', d: 'La operación pierde caja y la tapa <b>vendiendo activos y pidiendo prestado</b>. Alerta roja: así se llega a concurso mercantil.' },
    liquida: { ic: '🏚️', name: 'Liquidándose', lvl: 'bad', d: 'Operación negativa, <b>vende activos</b> y con eso <b>paga</b> a bancos o dueños. Se está desarmando.' },
    acumula: { ic: '🐿️', name: 'Acumulando caja', lvl: 'mid', d: 'Le entra dinero por los tres tubos (opera, vende activos y pide prestado). Raro: ¿prepara una compra grande o se protege de algo?' },
    quema: { ic: '🔥', name: 'Quemando sus ahorros', lvl: 'bad', d: 'Todo sale: opera con pérdida de caja, invierte y paga. Solo dura mientras haya caja acumulada en el tinaco.' },
  };
  function perfil(o, i, f) {
    const s = (v) => (v >= 0 ? '+' : '−');
    const key = s(o) + s(i) + s(f);
    const map = { '+−+': 'expan', '++−': 'achica', '−−+': 'crec', '−++': 'sobrevive', '−+−': 'liquida', '+++': 'acumula', '−−−': 'quema' };
    if (key === '+−−') return { key, ...(Math.abs(i) <= 0.25 * o ? PROF.ingreso : PROF.valor), id: Math.abs(i) <= 0.25 * o ? 'ingreso' : 'valor' };
    return { key, ...PROF[map[key]], id: map[key] };
  }
  const MATRIX = [
    ['valor', '+', '− (disciplinada)', '− (dividendos y recompras)'],
    ['ingreso', '+', '− (poquita)', '− (casi todo a dividendos)'],
    ['crec', '− o poco', '− (mucha)', '+ (socios, deuda, warrants)'],
    ['expan', '+', '− (mucha)', '+'],
    ['achica', '+', '+ (vende activos)', '−'],
    ['sobrevive', '−', '+ (vende activos)', '+'],
    ['liquida', '−', '+ (vende activos)', '−'],
    ['acumula', '+', '+', '+'],
    ['quema', '−', '−', '−'],
  ];

  // ------------------------------------------------------------------ SVG: 4 pasos
  const pasosSvg = `<svg class="ill" viewBox="0 0 880 210" role="img" aria-label="Cuatro pasos para leer un estado de flujo de efectivo">
    ${[['🔭', 'Panorama', 'contexto, industria,', 'tendencia de la utilidad', 1], ['🚂', 'El motor', 'operación: ¿positiva?', '¿crece? ¿alcanza?', 2], ['📰', 'Noticias', 'inversión y financ.:', '¿buenas o malas?', 3], ['🧩', 'Rompecabezas', 'juntar la evidencia', 'y concluir', 5]]
      .map(([ic, t, a, b, c], k) => {
        const x = 20 + k * 215;
        return `<rect x="${x}" y="30" width="190" height="150" rx="16" class="w${c}"/>
        <circle cx="${x + 30}" cy="30" r="18" class="f${c}"/><text x="${x + 30}" y="36" text-anchor="middle" font-size="16" font-weight="700" class="tw">${k + 1}</text>
        <text x="${x + 95}" y="82" text-anchor="middle" font-size="30">${ic}</text>
        <text x="${x + 95}" y="118" text-anchor="middle" font-size="17" font-weight="700">${t}</text>
        <text x="${x + 95}" y="142" text-anchor="middle" font-size="13" class="t2">${a}</text>
        <text x="${x + 95}" y="160" text-anchor="middle" font-size="13" class="t2">${b}</text>
        ${k < 3 ? `<path d="M${x + 192} 105 L${x + 213} 105" class="ln s5"/><polygon points="${x + 214},105 ${x + 206},99 ${x + 206},111" class="f5"/>` : ''}`;
      }).join('')}
  </svg>`;

  // ================================================================== SECCIÓN 8
  E.section({
    id: 'flujo', n: 8, group: 'flujo', icon: '🚰', short: 'Flujo de efectivo', exam: 'in',
    title: 'Flujo de efectivo: por dónde entró y salió la caja',
    lead: 'Todo flujo de efectivo, del tamaño que sea, se reduce a tres renglones: operación, inversión y financiamiento. Aprende a leerlos, a reconocer el perfil de la empresa y a ver que directo e indirecto llegan al mismo número.',
    render(root) {
      const base = E.model({});
      root.innerHTML = `
      <style>
        .sx-flujo .sx-prof{display:flex;gap:14px;align-items:flex-start;margin:0 0 12px}
        .sx-flujo .sx-prof .ic{font-size:40px;line-height:1}
        .sx-flujo .sx-prof.bad{border-color:var(--bad)}
        .sx-flujo .sx-prof.ok{border-color:var(--good)}
        .sx-flujo .sx-prof p{margin:4px 0 0;font-size:14.5px}
        .sx-flujo .sx-sig{font-family:ui-monospace,monospace;font-weight:700;font-size:13px;color:var(--muted)}
        .sx-flujo tr.on td{background:var(--accent-wash);font-weight:600}
        .sx-flujo .sx-ok{font-weight:700;margin:8px 0;padding:8px 12px;border-radius:10px;border:1px solid var(--good);background:color-mix(in srgb,var(--good) 10%,var(--card))}
        .sx-flujo .sx-interp{font-size:15px;margin:10px 0;max-width:var(--read)}
        .sx-flujo .card2 .tbl td,.sx-flujo .card2 .tbl th,.sx-flujo #mtx .tbl td{white-space:normal}
      </style>
      <div class="sx-flujo">

      <h2 id="importa"><span class="hn">1</span>Por qué la caja importa</h2>
      <div class="prose">
        <p>El estado de resultados cuenta lo que <b>ganaste según las reglas contables</b> (vendiste aunque no te hayan pagado; gastaste aunque no hayas pagado). El flujo de efectivo cuenta <b>cuánto dinero entró y salió de verdad</b> de la cuenta del banco.</p>
        <p><b>Utilidad ≠ caja.</b> Una empresa puede reportar utilidad y aun así quebrar, porque los empleados, los proveedores y el banco se pagan con <b>caja</b>, no con utilidad. Por eso la caja es el tercer pilar de la salud financiera, junto con la utilidad y el capital.</p>
      </div>
      ${E.concept({
        id: 'utilidad-caja', title: 'Utilidad ≠ caja: la limonada fiada', badge: 'in',
        html: `<div class="cols"><div>
          <p>La Tiendita vende <b>$1,000</b> en el año con un margen de 30%: la mercancía le costó <b>$700</b>. La contabilidad dice <b>utilidad = $300</b> (sin importar si cobró).</p>
          <p>Pero si vende <b>fiado</b> y paga a sus proveedores <b>de contado</b>, la caja cuenta otra historia:</p>
          ${E.formula('Caja de la operación (ejemplo)', 'Caja', 'Ventas cobradas − Compras pagadas')}
          ${E.kid('Vendes limonadas a tus amigos y te dicen "mañana te pago". En tu cuaderno ganaste, pero en tu alcancía no hay nada… y el limón y el azúcar sí los pagaste hoy. Si te pasa todos los días, cierras el puesto aunque "ganes".')}
          <div id="iUC" class="sx-interp"></div>
        </div><div>
          <div id="kUC"></div>
          <div id="tUC" style="margin-top:12px"></div>
          <div id="svgUC"></div>
        </div></div>`,
      })}
      <h3>El caso Ashmont Cycles (lectura de Narayanan)</h3>
      <p class="prose">Ashmont tuvo <b>utilidad neta de $10,088</b> y su operación generó caja <b>positiva</b>… y aun así su caja <b>bajó</b> de $8,000 a $3,368. ¿Por qué? Porque invirtió en equipo y pagó deuda.</p>
      ${E.table([
        ['Utilidad neta (estado de resultados)', '$10,088'],
        ['Flujo de operación', '+4,768'],
        ['Flujo de inversión (compró activo fijo)', '−5,400'],
        ['Flujo de financiamiento (pagó deuda)', '−4,000'],
        ['= Cambio en caja', '−4,632', { cls: 'tot' }],
        ['Caja inicial → caja final', '8,000 → 3,368', { cls: 'tot' }],
      ], { head: ['Ashmont Cycles, año 20X3', 'Monto'] })}
      ${E.key('Que la caja baje <b>no es malo por sí mismo</b>. Aquí bajó porque la empresa <b>invirtió en crecer y pagó deuda</b>, y la operación sí generó caja. Lo grave sería que la caja bajara porque la <b>operación</b> está quemando dinero.')}

      <h2 id="renglones"><span class="hn">2</span>Los 3 renglones que importan</h2>
      ${E.tip('<q>Todo flujo contable en el planeta Tierra va a tener tres cosas.</q> Operación, inversión y financiamiento; <q>el resto es información adicional</q>.', 'Clase 30-sep')}
      ${E.fig(tinaco(base.cf.CFO, base.cf.CFI, base.cf.CFF, base.cf.caja0), 'La Tiendita S.A. (modelo de la guía, miles de $): la operación llena el tinaco, la inversión y el financiamiento lo vacían. Línea punteada = caja inicial.', true)}
      ${E.kid('Piensa en el <b>tinaco</b> de tu casa. Tiene tres tubos: uno que trae agua de la calle (<b>operación</b>: vender y comprar), uno para regar el jardín y arreglar la casa (<b>inversión</b>) y uno que conecta con el vecino (<b>financiamiento</b>: el banco te presta agua o tú le devuelves; tus papás meten agua o se la llevan). Lo que queda en el tinaco al final es la caja.')}
      ${E.formula('La única cuenta que tienes que saber hacer', 'Caja final', 'Caja inicial + Operación + Inversión + Financiamiento', 'La caja final debe ser igual al efectivo del balance. Si no cuadra, algo está mal.')}
      <div class="g3">
        <div class="card2"><h4>🛒 Operación</h4><p class="small">Caja del negocio central: vender y comprar mercancía, pagar sueldos, intereses e impuestos. Parte de la utilidad, suma la depreciación y ajusta por capital de trabajo.</p><p class="small"><b>Esperado: positivo y creciendo.</b> <q>Entre más positivo, mejor</q>, salvo empresas nuevas o de crecimiento.</p></div>
        <div class="card2"><h4>🏗️ Inversión</h4><p class="small">Compra (−) o venta (+) de activo fijo: tiendas, plantas, equipo (CapEx), inversiones en otras empresas.</p><p class="small"><b>Esperado: negativo</b> (la empresa está invirtiendo). Positivo seguido = vende activos, se está achicando.</p></div>
        <div class="card2"><h4>🏦 Financiamiento</h4><p class="small">Bancos y dueños: préstamos recibidos (+), pagos de deuda e intereses (−), arrendamientos, aportaciones (+), dividendos y recompras (−).</p><p class="small"><b>Puede ser + o −.</b> En una madura, negativo (paga y reparte).</p></div>
      </div>
      ${E.formula('Indicador de Warren Buffett', 'Buffett', 'Flujo de operación + Flujo de inversión', 'Con sus signos. Si es positivo, la operación pagó la inversión y sobra dinero para bancos y dueños.')}
      ${E.key('Una <b>empresa sana</b> tiene una <b>"barriga operativa"</b> positiva que <b>supera a las otras dos</b>: operación + inversión &gt; 0 (Buffett positivo) y alcanza para cubrir el financiamiento (pagar deuda y dividendos). Y que la operación vaya <b>creciendo año con año</b>.', 'Qué esperamos ver')}
      ${E.tip('<q>Yo espero que la operación exceda a la inversión.</q> Lo que sobre es para la financiación, que incluye a los dueños.', 'Clase 30-sep')}

      <h2 id="perfiles"><span class="hn">3</span>Matriz de signos: ¿qué tipo de empresa es?</h2>
      <p class="prose">Con solo ver <b>el signo</b> de los tres renglones puedes adivinar en qué etapa está la empresa. Mueve las perillas o prueba un perfil.</p>
      ${E.concept({
        id: 'matriz', title: 'Juega con los tres tubos', badge: 'in',
        html: `<div class="cols"><div>
          <div class="btnrow" id="pPF">
            <button class="btn" type="button" data-p="valor">🏛️ Valor</button>
            <button class="btn" type="button" data-p="crec">🚀 Crecimiento</button>
            <button class="btn" type="button" data-p="ingreso">🧓 Ingreso</button>
            <button class="btn" type="button" data-p="sobrevive">🆘 Sobreviviendo</button>
            <button class="btn" type="button" data-p="achica">✂️ Achicándose</button>
          </div>
          <div id="kPF"></div>
          <div id="tPF" style="margin-top:12px"></div>
        </div><div>
          <div id="cardPF"></div>
          <div id="svgPF"></div>
        </div></div>`,
      })}
      <div id="mtx"></div>
      ${E.note('Ejemplo del profe de una acción de valor (cifras redondas): operación ≈ +55 mil millones, inversión ≈ −20 mil millones, financiamiento ≈ −42 mil millones, de los cuales ≈30–37 mil millones fueron recompras + dividendos. <b>Reinversión disciplinada y distribución elevada de efectivo.</b>', 'Para fijarlo')}
      ${E.tip('¿Pagar dividendos depende del sector o de ser acción de valor? <q>Por ser acción de valor.</q> Diferencia con ingreso: en la de valor, <b>además</b> del dividendo, la acción crece; en la de ingreso la acción es plana porque reparte casi todo.', 'Clase 30-sep')}

      <h2 id="metodos"><span class="hn">4</span>Método indirecto vs directo: mismo destino, distinto camino</h2>
      <div class="g2">
        <div class="card2"><h4>↩️ Indirecto (empresas que cotizan)</h4><p class="small">Parte de la <b>utilidad neta</b> y la "concilia" hasta caja: <b>+ depreciación</b> (gasto que no sale de la caja) <b>± cambios en capital de trabajo</b>. Al inversionista de bolsa le interesa la utilidad, de ahí salen sus dividendos.</p>
          ${E.formula('', 'Operación', 'UN + Dep. − ΔCxC − ΔInv + ΔProveedores')}</div>
        <div class="card2"><h4>➡️ Directo (PyMEs, bancos)</h4><p class="small">Muestra los <b>grandes chorros</b> de entrada y salida: cuánto cobré a clientes y cuánto pagué a proveedores, empleados, intereses e impuestos. Al banco que le presta a una PyME le interesa ver eso.</p>
          ${E.formula('', 'Operación', 'Cobros a clientes − Pagos a proveedores − Gastos − Intereses − Impuestos')}</div>
      </div>
      ${E.key('Los dos métodos dan <b>exactamente el mismo</b> flujo de operación. Inversión y financiamiento son <b>idénticos</b> en ambos. <q>Lo único que cambia… es mostrar.</q> Es una recomendación, no una obligación: cualquier empresa puede usar el que quiera.')}
      ${E.concept({
        id: 'directo-indirecto', title: 'Demuéstralo: mueve La Tiendita y compara los dos métodos', badge: 'in',
        html: `<div class="cols"><div>
          <div id="kM"></div>
        </div><div>
          <div id="tM"></div>
          <div id="okM"></div>
          <div id="wfM" class="chart" style="margin-top:8px"></div>
          <p class="small muted">Cascada: caja inicial → operación → inversión → financiamiento → caja final (miles de $).</p>
        </div></div>
        <div id="iM" class="sx-interp"></div>
        <div class="g2">
          <div class="card2"><h4>↩️ Método indirecto</h4><div id="tbInd"></div></div>
          <div class="card2"><h4>➡️ Método directo</h4><div id="tbDir"></div></div>
        </div>
        <div class="card2"><h4>Inversión y financiamiento (iguales en los dos)</h4><div id="tbIF"></div></div>
        <p class="small muted">Modelo conectado de la guía (miles de $). En este modelo el costo de ventas no incluye depreciación; en estados reales (Soriana) la depreciación viene dentro del costo, por eso en el directo hay que <b>sumarla de regreso</b>. ¿Quieres mover los tres estados a la vez? Ve al <a href="#/lab">Laboratorio</a>.</p>`,
      })}
      ${E.warn('En el capital de trabajo de la operación solo van cuentas que <b>NO generan interés</b>: clientes, inventarios, proveedores, otras cuentas por cobrar/pagar. La <b>deuda bancaria de corto plazo</b> y el <b>leasing</b> generan interés → van a <b>financiamiento</b>, aunque estén en el pasivo circulante.')}
      ${E.tip('En ambos métodos la depreciación <b>suma</b> en operación y se <b>resta</b> en inversión (vía CapEx). Es consistente.', 'Clase 30-sep')}

      <h2 id="ajustes"><span class="hn">5</span>Ajustes delicados: CapEx, dividendo implícito y análisis horizontal</h2>
      ${E.tip('<q>Ajustar el CapEx y ajustar los dividendos… es el único truco.</q>', 'Clase 30-sep')}
      <div class="g2">
        <div class="card2" id="capex">
          <h4>🏗️ CapEx cuando solo tienes el activo fijo NETO</h4>
          <p class="small">El balance trae el activo fijo <b>neto de depreciación</b>. Si solo restas un año contra otro, la depreciación "esconde" parte de lo que compraste. Por eso se la <b>devuelves</b>:</p>
          ${E.formula('', 'CapEx', 'AF neto final − AF neto inicial + Depreciación del año')}
          <div id="kCX"></div>
          <div id="oCX" class="sx-interp"></div>
          ${E.reveal('Ejemplo del profe: coche y moto', `<p>Coche comprado en <b>100,000</b>, se deprecia 20,000 al año. Neto: 100 → 80 → 60… Si un año el neto pasa de 80 a 60 y la depreciación fue 20: CapEx = 60 − 80 + 20 = <b>0</b> (no compraste nada).</p><p>Último año: el coche llega a 0 y el 31-dic compras una <b>moto de 10,000</b>. Neto pasa de 20 a 10: CapEx = 10 − 20 + 20 = <b>10</b> = la moto. Así llegas indirectamente a lo que gastaste.</p>`)}
        </div>
        <div class="card2" id="dividendo">
          <h4>💸 Dividendo implícito</h4>
          <p class="small">Si no te dan los dividendos, los sacas del patrimonio: lo que <b>debió</b> crecer (la utilidad) contra lo que <b>sí</b> creció.</p>
          ${E.formula('', 'Dividendo', 'UN − Δ Utilidades retenidas', 'Equivale a: Variación patrimonial − UN (sale negativo = dinero que salió a los dueños).')}
          <div id="kDV"></div>
          <div id="oDV" class="sx-interp"></div>
          ${E.reveal('Ejemplo del profe: retenidas 100, utilidad 150', E.table([
            ['Reparte 50', '200', '+100', '100 − 150 = <b>−50</b>'],
            ['No reparte nada', '250', '+150', '150 − 150 = <b>0</b>'],
            ['Reparte todo', '100', '0', '0 − 150 = <b>−150</b>'],
          ], { head: ['Caso', 'Retenidas finales', 'Variación', 'Var. − UN = dividendo'] }) + '<p class="small">Dividendo <b>financiero</b> = todo lo que se le devuelve al dueño, sin importar cómo (dividendo, recompra…), no solo el dividendo "de noticia".</p>')}
        </div>
      </div>
      <div class="card2" id="horizontal" style="max-width:var(--read)">
        <h4>📈 Análisis horizontal</h4>
        ${E.formula('Variación %', 'Δ%', E.frac('Cuenta del año posterior', 'Cuenta del año anterior') + ' − 1', 'Como el rendimiento de una inversión: 150/100 − 1 = 50%.')}
        <p class="small">Sirve para encontrar rápido los cambios fuertes y luego preguntar <b>por qué</b>. Pero tiene una ceguera: <b>no muestra la magnitud</b>.</p>
        ${E.table([
          ['Cuenta que va de 1 a 2 millones (empresa de 100,000 millones)', '+100%', 'Irrelevante'],
          ['Deudores de 0 a 6,800 millones', 'enorme (se divide entre ~0)', 'Muy relevante'],
        ], { head: ['Caso', 'Variación %', '¿Importa?'] })}
        ${E.tip('<q>Como es porcentual, uno no ve la magnitud.</q> Siempre mira también el monto.', 'Clase 30-sep')}
      </div>

      <h2 id="pasos"><span class="hn">6</span>Cómo leer un flujo en 4 pasos + el caso Soriana</h2>
      <p class="prose">La lectura de Hertenstein &amp; McKinnon dice que el flujo de efectivo es un <b>rompecabezas</b>: no necesitas estadística, sino un orden. En nuestras palabras:</p>
      ${E.fig(pasosSvg, 'Los cuatro pasos de "Solving the Puzzle of the Cash Flow Statement", resumidos.', true)}
      <ol class="prose">
        <li><b>Panorama.</b> ¿Qué empresa es, de qué industria, qué edad, qué tamaño? ¿Cómo va la utilidad neta? ¿Hay partidas raras que investigar?</li>
        <li><b>El motor (operación).</b> ¿Es positiva? ¿Crece? ¿Alcanza para reponer activos (≈ depreciación) y pagar dividendos? En una empresa sana que crece, clientes, inventarios y proveedores también crecen. <b>Ojo:</b> si <i>todas</i> las cuentas de capital de trabajo están soltando caja, puede estar exprimiéndolas para sobrevivir.</li>
        <li><b>Buenas y malas noticias.</b> Inversión normalmente negativa; CapEx &gt; depreciación = crece; vender activos o divisiones para tener caja = se encoge. Financiamiento: ¿pide prestado porque quiere o porque no le queda de otra? Léelo junto con la operación.</li>
        <li><b>Armar el rompecabezas.</b> Junta la evidencia como un juez y concluye. Investiga solo lo que pesa (lo material).</li>
      </ol>
      ${E.kid('El flujo es como el <b>coche</b> de la familia: la operación es el <b>motor</b>, la inversión es lo que gastas en mantenerlo y mejorarlo, y el financiamiento es la gasolina que te prestan o que pones tú. Un coche sano anda con su propio motor, no empujado.')}
      ${E.concept({
        id: 'soriana', title: 'Caso Soriana: "los tres que les hice mucho énfasis"', badge: 'in',
        html: `<p>En el taller del 30-sep el profe leyó el flujo real de Soriana enfocándose solo en los tres renglones (cifras aproximadas, la transcripción es confusa en algunas):</p>
        ${E.table([
          ['🛒 Operación', '≈ +13.4 mil millones', 'Positiva y alta. Tres palancas: (1) margen al comprar y vender mercancía, (2) depreciación (mucha inversión en tiendas), (3) negocio financiero: paga a proveedores a ~90 días, cobra rápido e invierte la caja. En capital de trabajo, el gran generador: <b>proveedores</b>.'],
          ['🏗️ Inversión', 'negativa', 'Sobre todo inmuebles (tiendas). Algunas fuentes: intereses cobrados, venta de activos.'],
          ['🏦 Financiamiento', '≈ −11.6 mil millones', 'Pagó préstamos, intereses y arrendamientos, y dividendos ≈ 0.97 mil millones.'],
        ], { head: ['Renglón', 'Monto (aprox.)', 'Lectura'] })}
        <p class="small">Verificación: operación + inversión + financiamiento = aumento/disminución de caja; + saldo inicial = saldo final del balance. Soriana: un año aumentó la caja (≈ +2.8 mil millones), otro la redujo.</p>
        ${E.tip('<q>Recordar todo lo que vimos de Soriana, los tres que yo les hice mucho énfasis.</q>', 'Clase 5-oct, repaso para el examen')}`,
      })}

      <h2 id="tips"><span class="hn">7</span>Tips del profe y errores comunes</h2>
      ${E.tip('<q>Operación, inversión, financiación. Memorízate eso.</q> En el examen no te van a preguntar el detalle de arriba, pero <b>sí tienes que saber manejar las tres líneas</b>. Es interpretativo, con calculadora.', 'Clase 30-sep')}
      ${E.tip('El flujo de operación: <b>positivo</b> y que vaya <b>creciendo año con año</b>. Negativo solo se perdona en empresas nuevas o de crecimiento.', 'Clase 30-sep')}
      ${E.warn('Pensar que directo e indirecto dan flujos de operación distintos. <b>Dan lo mismo</b>; solo cambia cómo se presenta.')}
      ${E.warn('Meter la deuda bancaria de corto plazo o el leasing en el capital de trabajo. Generan interés → <b>financiamiento</b>.')}
      ${E.warn('Olvidar sumar la depreciación al CapEx cuando solo tienes el activo fijo neto, o calcular mal el dividendo implícito (es <b>UN − ΔUR</b>).')}
      ${E.warn('Concluir que "la caja bajó = la empresa va mal". Primero mira <b>qué renglón</b> la bajó: invertir o pagar deuda no es lo mismo que una operación negativa.')}
      ${E.warn('Leer variaciones % del análisis horizontal sin ver el monto.')}

      <h2 id="quiz"><span class="hn">8</span>¿Qué pasa si…?</h2>
      <div id="qzF"></div>
      </div>`;

      // ---- 1. utilidad vs caja
      const kUC = root.querySelector('#kUC'), tUC = root.querySelector('#tUC'), sUC = root.querySelector('#svgUC'), iUC = root.querySelector('#iUC');
      E.knobs(kUC, [
        { k: 'c', label: '% de las ventas que vendiste fiado (sin cobrar aún)', min: 0, max: 1, step: 0.05, v: 0.5, fmt: 'pct', dec: 0 },
        { k: 'p', label: '% de las compras que te fió el proveedor', min: 0, max: 1, step: 0.05, v: 0.2, fmt: 'pct', dec: 0 },
        { k: 'x', label: 'Inventario extra comprado y no vendido', min: 0, max: 400, step: 20, v: 0, fmt: '$' },
      ], (st) => {
        const util = 300, caja = 1000 * (1 - st.c) - (700 + st.x) * (1 - st.p);
        E.tiles(tUC, [
          { label: 'Utilidad (contabilidad)', v: util, fmt: '$' },
          { label: 'Caja de la operación', v: caja, fmt: '$', hl: true, base: 1000 * 0.5 - 700 * 0.8, better: 'up' },
          { label: 'Diferencia', v: caja - util, fmt: '$' },
        ]);
        sUC.innerHTML = jars(util, caja);
        iUC.innerHTML = caja < 0
          ? `Ganaste <b>$300</b> en papel, pero tu alcancía <b>perdió ${E.fmt.$(-caja)}</b>. ✗ Si esto se repite, te quedas sin dinero para pagar aunque "ganes": así quiebra una empresa rentable.`
          : caja < util
            ? `La caja (<b>${E.fmt.$(caja)}</b>) es menor que la utilidad: parte de lo que "ganaste" está atorado en clientes o inventario.`
            : `✓ La caja (<b>${E.fmt.$(caja)}</b>) supera la utilidad: cobras rápido y tus proveedores te financian.`;
      }, { title: '🍋 La limonada fiada' });

      // ---- 3. perfiles
      const kPFel = root.querySelector('#kPF'), tPF = root.querySelector('#tPF'), cardPF = root.querySelector('#cardPF'), sPF = root.querySelector('#svgPF'), mtx = root.querySelector('#mtx');
      const drawMtx = (id) => {
        mtx.innerHTML = E.table(MATRIX.map(([pid, o, i, f]) => {
          const P = PROF[pid];
          return [`${P.ic} <b>${P.name}</b>`, o, i, f, P.lvl === 'ok' ? '✓ sana' : P.lvl === 'bad' ? '✗ alerta' : '◐ depende', pid === id ? { cls: 'on' } : {}];
        }), { head: ['Perfil', 'Operación', 'Inversión', 'Financiamiento', 'Lectura'] });
      };
      const kPF = E.knobs(kPFel, [
        { k: 'o', label: 'Flujo de operación', min: -100, max: 100, step: 5, v: 55, fmt: 'n' },
        { k: 'i', label: 'Flujo de inversión', min: -100, max: 100, step: 5, v: -20, fmt: 'n' },
        { k: 'f', label: 'Flujo de financiamiento', min: -100, max: 100, step: 5, v: -42, fmt: 'n' },
        { k: 'c0', label: 'Caja inicial', min: 0, max: 200, step: 5, v: 50, fmt: 'n' },
      ], (st) => {
        const P = perfil(st.o, st.i, st.f), bf = st.o + st.i, dc = st.o + st.i + st.f;
        cardPF.innerHTML = `<div class="card2 sx-prof ${P.lvl}"><div class="ic" aria-hidden="true">${P.ic}</div><div><span class="sx-sig">Signos: ${P.key}</span><h4>${P.name}</h4><p>${P.d}</p></div></div>`;
        sPF.innerHTML = tinaco(st.o, st.i, st.f, st.c0);
        E.tiles(tPF, [
          { label: 'Buffett (op. + inv.)', v: bf, fmt: 'sgn', note: bf >= 0 ? '✓ la operación paga la inversión' : '✗ la operación no alcanza' },
          { label: 'Cambio en caja', v: dc, fmt: 'sgn' },
          { label: 'Caja final', v: st.c0 + dc, fmt: 'n', note: st.c0 + dc < 0 ? '✗ sobregiro' : '' },
        ]);
        drawMtx(P.id);
      }, { title: '🎛️ Signo y tamaño de cada tubo (millones)' });
      const PRE = { valor: { o: 55, i: -20, f: -42 }, crec: { o: -15, i: -40, f: 60 }, ingreso: { o: 40, i: -5, f: -33 }, sobrevive: { o: -10, i: 15, f: 5 }, achica: { o: 20, i: 15, f: -40 } };
      root.querySelectorAll('#pPF button').forEach((b) => b.addEventListener('click', () => kPF.set(PRE[b.dataset.p])));

      // ---- 4. directo vs indirecto con E.model
      const tM = root.querySelector('#tM'), okM = root.querySelector('#okM'), iM = root.querySelector('#iM');
      const tbInd = root.querySelector('#tbInd'), tbDir = root.querySelector('#tbDir'), tbIF = root.querySelector('#tbIF');
      let R = base, wf = null;
      E.knobs(root.querySelector('#kM'), [
        { k: 'ventas', label: 'Ventas del año', min: 600, max: 3000, step: 50, v: 1500, fmt: '$' },
        { k: 'dso', label: 'Días de cobro (clientes)', min: 0, max: 120, step: 0.5, v: 36.5, fmt: 'd', dec: 1, hint: 'Año 0: 36.5 días' },
        { k: 'dio', label: 'Días de inventario', min: 0, max: 180, step: 1, v: 75, fmt: 'd' },
        { k: 'dpo', label: 'Días de pago a proveedores', min: 0, max: 150, step: 1, v: 45, fmt: 'd' },
        { k: 'capex', label: 'CapEx (compra de activo fijo)', min: 0, max: 400, step: 10, v: 80, fmt: '$' },
        { k: 'ddeuda', label: 'Deuda nueva (+) o pago de deuda (−)', min: -250, max: 300, step: 10, v: 0, fmt: 'sgn' },
        { k: 'payout', label: 'Dividendos (% de la utilidad)', min: 0, max: 1, step: 0.05, v: 0.4, fmt: 'pct', dec: 0 },
      ], (st) => {
        R = E.model(st);
        const cf = R.cf, d = R.cfd, b = base.cf;
        E.tiles(tM, [
          { label: 'Utilidad neta', v: cf.UN, fmt: 'n', dec: 1, base: b.UN, better: 'up' },
          { label: 'Flujo de operación', v: cf.CFO, fmt: 'n', dec: 1, base: b.CFO, better: 'up', hl: true },
          { label: 'Buffett (op. + inv.)', v: cf.buffett, fmt: 'sgn', dec: 1, base: b.buffett, better: 'up' },
          { label: 'Cambio en caja', v: cf.dCaja, fmt: 'sgn', dec: 1 },
          { label: 'Caja final', v: cf.caja1, fmt: 'n', dec: 1 },
        ]);
        const diff = Math.abs(cf.CFO - d.CFO);
        okM.innerHTML = `<div class="sx-ok">${diff < 0.01 ? '✓' : '✗'} Indirecto ${n1(cf.CFO)} = Directo ${n1(d.CFO)} → diferencia ${n1(diff)}</div>`;
        tbInd.innerHTML = E.table([
          ['Utilidad neta', sg(cf.UN)],
          ['+ Depreciación (gasto que no sale de caja)', sg(cf.DA)],
          ['− Aumento en clientes (CxC)', sg(-cf.dCxC)],
          ['− Aumento en inventarios', sg(-cf.dInv)],
          ['+ Aumento en proveedores', sg(cf.dCxP)],
          ['= Flujo de operación', sg(cf.CFO), { cls: 'tot' }],
        ]);
        tbDir.innerHTML = E.table([
          ['Cobros a clientes (ventas − ΔCxC)', sg(d.cobros)],
          ['− Pagos a proveedores (costo + ΔInv − ΔProv.)', sg(d.pagosProv)],
          ['− Gastos operativos pagados', sg(d.gastos)],
          ['− Intereses pagados', sg(d.intereses)],
          ['− Impuestos pagados', sg(d.impuestos)],
          ['= Flujo de operación', sg(d.CFO), { cls: 'tot' }],
        ]);
        tbIF.innerHTML = E.table([
          ['Flujo de operación (cualquier método)', sg(cf.CFO)],
          ['Inversión: CapEx', sg(cf.CFI)],
          ['Financiamiento: deuda nueva (+) / pago (−)', sg(cf.dDeuda)],
          ['Financiamiento: dividendos', sg(-cf.DIV)],
          ['= Cambio en caja', sg(cf.dCaja), { cls: 'tot' }],
          ['Caja inicial', n1(cf.caja0)],
          ['Caja final (debe ser igual al balance)', n1(cf.caja1), { cls: 'tot' }],
        ]);
        const kt = -cf.dCxC - cf.dInv + cf.dCxP;
        let msg = `La utilidad neta es <b>${n1(cf.UN)}</b> y la operación generó <b>${n1(cf.CFO)}</b>. `;
        if (kt < -1) msg += `El capital de trabajo <b>se tragó ${n1(-kt)}</b> de caja (clientes e inventarios crecieron más que proveedores): la utilidad no cambia, la caja sí. `;
        else if (kt > 1) msg += `El capital de trabajo <b>soltó ${n1(kt)}</b> de caja (cobras más rápido, tienes menos inventario o los proveedores te financian). `;
        else msg += 'El capital de trabajo casi no movió la caja. ';
        msg += cf.buffett >= 0
          ? `Buffett = <b>${sg(cf.buffett)}</b>: ✓ la operación paga la inversión y sobra para bancos y dueños.`
          : `Buffett = <b>${sg(cf.buffett)}</b>: ✗ la operación no alcanza para la inversión; la diferencia sale de la caja o de financiamiento.`;
        if (cf.caja1 < 0) msg += ' ⚠️ La caja final es negativa: en la vida real tendrías que pedir prestado.';
        iM.innerHTML = msg;
        if (wf) wf.refresh();
      }, { title: '🎛️ Perillas de La Tiendita' });
      wf = waterfall(root.querySelector('#wfM'), (T) => [
        { name: 'Caja inicial', v: R.cf.caja0, total: true, color: T.c4 },
        { name: 'Operación', v: R.cf.CFO, color: T.c1 },
        { name: 'Inversión', v: R.cf.CFI, color: T.c2 },
        { name: 'Financiamiento', v: R.cf.CFF, color: T.c3 },
        { name: 'Caja final', v: R.cf.caja1, total: true, color: T.c4 },
      ], (v, s) => (s ? sg(v, 0) : E.fmt.n(v, 0)));

      // ---- 5. mini calculadoras
      const oCX = root.querySelector('#oCX');
      E.knobs(root.querySelector('#kCX'), [
        { k: 'a0', label: 'Activo fijo neto inicial', min: 0, max: 1000, step: 10, v: 500, fmt: 'n' },
        { k: 'a1', label: 'Activo fijo neto final', min: 0, max: 1000, step: 10, v: 540, fmt: 'n' },
        { k: 'dep', label: 'Depreciación del año', min: 0, max: 200, step: 5, v: 60, fmt: 'n' },
      ], (st) => {
        const cx = st.a1 - st.a0 + st.dep;
        oCX.innerHTML = `CapEx = ${E.fmt.n(st.a1)} − ${E.fmt.n(st.a0)} + ${E.fmt.n(st.dep)} = <b>${E.fmt.n(cx)}</b>. ` +
          (cx < 0 ? '✗ Negativo: vendió activos (desinvirtió).' : cx > st.dep ? `✓ Invirtió más que la depreciación (${E.fmt.n(cx / Math.max(1, st.dep), 1)}× la depreciación): está creciendo.` : '◐ Invirtió menos que la depreciación: apenas repone (o se achica).') +
          ` Sin el ajuste habrías dicho ${E.fmt.n(st.a1 - st.a0)}.`;
      }, { title: '🎛️ Calcula el CapEx' });
      const oDV = root.querySelector('#oDV');
      E.knobs(root.querySelector('#kDV'), [
        { k: 'u0', label: 'Utilidades retenidas iniciales', min: 0, max: 600, step: 10, v: 300, fmt: 'n' },
        { k: 'un', label: 'Utilidad neta del año', min: 0, max: 300, step: 10, v: 100, fmt: 'n' },
        { k: 'u1', label: 'Utilidades retenidas finales', min: 0, max: 800, step: 10, v: 340, fmt: 'n' },
      ], (st) => {
        const var_ = st.u1 - st.u0, dv = var_ - st.un;
        oDV.innerHTML = `Variación = ${E.fmt.n(st.u1)} − ${E.fmt.n(st.u0)} = ${sg(var_, 0)}; menos UN ${E.fmt.n(st.un)} = <b>${sg(dv, 0)}</b>. ` +
          (dv < 0 ? `Salieron <b>${E.fmt.n(-dv)}</b> a los dueños (payout ≈ ${E.fmt.pct(st.un ? -dv / st.un : 0, 0)}).` : dv === 0 ? 'No se repartió nada: retuvieron toda la utilidad.' : '◐ Positivo: el patrimonio creció más que la utilidad → los socios metieron dinero (recapitalización) u otro movimiento.');
      }, { title: '🎛️ Calcula el dividendo' });

      // ---- quiz
      E.quiz(root.querySelector('#qzF'), [
        { q: 'Operación +80, inversión −30, financiamiento −45. ¿Qué perfil se ve?', o: ['Crecimiento', 'Madura / valor: genera, invierte y regresa dinero', 'Sobreviviendo'], a: 1, w: 'Signos + − −: genera caja, invierte con disciplina y paga a bancos y dueños. Buffett = 80 − 30 = +50 ✓.' },
        { q: 'Los clientes (CxC) suben 20 en el año. En el método indirecto, ¿qué le pasa al flujo de operación?', o: ['Sube 20', 'Baja 20', 'No cambia'], a: 1, w: 'Aumento de un activo = uso: vendiste pero no cobraste. Se resta. La utilidad no cambia, la caja sí.' },
        { q: 'Con el método directo obtienes una operación de 150. ¿Cuánto dará el indirecto?', o: ['Menos, porque no suma la depreciación', 'Exactamente 150', 'Más, porque parte de la utilidad'], a: 1, w: 'Los dos métodos dan exactamente lo mismo; solo cambia cómo se muestra.' },
        { q: 'Activo fijo neto pasa de 500 a 540 y la depreciación fue 60. ¿CapEx?', o: ['40', '100', '−20'], a: 1, w: 'CapEx = 540 − 500 + 60 = 100. La depreciación había "escondido" 60 de lo que compraste.' },
        { q: 'Utilidades retenidas pasan de 300 a 340 con utilidad neta de 100. ¿Dividendo implícito?', o: ['40', '60', '100'], a: 1, w: 'Variación 40 − UN 100 = −60 → salieron 60 a los dueños.' },
        { q: 'Operación −10, inversión +25, financiamiento −10. ¿Qué te dice?', o: ['Empresa de valor', 'Vende activos para tapar la operación y pagar: alerta', 'Startup sana'], a: 1, w: 'Signos − + −: la operación pierde caja y la empresa vende activos para pagar. Se está desarmando.' },
        { q: '¿La deuda bancaria de corto plazo va en el capital de trabajo de la operación?', o: ['Sí, es pasivo circulante', 'No, genera interés → financiamiento'], a: 1, w: 'En capital de trabajo solo lo que NO genera interés. Deuda y leasing van a financiamiento.' },
      ]);
    },
  });

  // ================================================================== SECCIÓN 8.5 — FCL
  const PRESET_FCL = {
    walmex: { A: { ebitda: 103, dkt: 5.4, imp: 19, capex: 38, act: 495 }, B: { ban: -9, acc: -47, otr: 4.6 } },
    crec: { A: { ebitda: 6, dkt: -1.5, imp: 1.2, capex: 5, act: 44 }, B: { ban: 1.5, acc: -0.6, otr: 0.8 } },
  };

  function balanza(fcl, noop) {
    const diff = fcl + noop, ref = Math.max(1, Math.abs(fcl), Math.abs(noop));
    const ang = -clamp((diff / ref) * 22, -14, 14), a = ang * Math.PI / 180;
    const px = 350, py = 90, L = 210;
    const end = (dx) => [px + dx * Math.cos(a), py + dx * Math.sin(a)];
    const [lx, ly] = end(-L), [rx, ry] = end(L);
    const pan = (x, y, title, val, cls) => `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x - 70).toFixed(1)}" y2="${(y + 70).toFixed(1)}" class="lnm"/>
      <line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(x + 70).toFixed(1)}" y2="${(y + 70).toFixed(1)}" class="lnm"/>
      <path d="M${(x - 90).toFixed(1)} ${(y + 70).toFixed(1)} Q ${x.toFixed(1)} ${(y + 120).toFixed(1)} ${(x + 90).toFixed(1)} ${(y + 70).toFixed(1)} Z" class="${cls}"/>
      <text x="${x.toFixed(1)}" y="${(y + 62).toFixed(1)}" text-anchor="middle" font-size="14" font-weight="700">${title}</text>
      <text x="${x.toFixed(1)}" y="${(y + 92).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="700" class="tw">${val}</text>`;
    const ok = Math.abs(diff) < 0.05;
    return `<svg class="ill" viewBox="0 0 700 300" role="img" aria-label="Balanza: flujo de caja libre contra flujo no operativo">
      <polygon points="${px},${py} ${px - 40},270 ${px + 40},270" class="bg2"/>
      <rect x="${px - 90}" y="268" width="180" height="12" rx="6" class="bg2"/>
      <line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}" class="ln" style="stroke-width:6px"/>
      <circle cx="${px}" cy="${py}" r="9" class="f5"/>
      ${pan(lx, ly, 'FCL (operativo)', sg(fcl), 'f1')}
      ${pan(rx, ry, 'No operativo', sg(noop), 'f3')}
      <text x="${px}" y="30" text-anchor="middle" font-size="16" font-weight="700" class="${ok ? 'fgood' : 'fbad'}">${ok ? '✓ FCL + no operativo = 0: cuadra' : '✗ No cuadra: FCL + no operativo = ' + sg(diff)}</text>
    </svg>`;
  }

  E.section({
    id: 'fcl', n: 8.5, group: 'flujo', icon: '🔓', short: 'Flujo de caja libre (ecuación fundamental)', exam: 'in',
    title: 'Flujo de caja libre: la ecuación fundamental',
    kicker: 'Flujo de efectivo · no entra como tal, pero habrá una pequeña relación',
    lead: 'Un flujo para EVALUAR la empresa (no el contable): cuánta caja produce el negocio central después de pagar su capital de trabajo, sus impuestos y su CapEx, y a quién se le entregó.',
    render(root) {
      root.innerHTML = `
      <style>
        .sx-fcl .sx-scope{display:flex;gap:10px;align-items:center;flex-wrap:wrap;margin:16px 0 0}
        .sx-fcl .sx-interp{font-size:15px;margin:10px 0;max-width:var(--read)}
        .sx-fcl .sx-alert{font-weight:700;margin:8px 0;padding:8px 12px;border-radius:10px;border:1px solid var(--bad);background:color-mix(in srgb,var(--bad) 10%,var(--card))}
        .sx-fcl .tbl td,.sx-fcl .tbl th{white-space:normal}
      </style>
      <div class="sx-fcl">
      <div class="sx-scope"><span class="badge out">No entra como tal</span><span class="badge in">● Pero habrá una pequeña relación</span></div>
      ${E.note('El profe dijo: <q>esto que vamos a ver ahora no entra, pero es muy importante. Va a haber una pequeña relación.</q> Lo que sí debes dominar de aquí: la lógica de <b>fuentes y usos</b>, el <b>cambio en capital de trabajo</b> (' + E.link('fuentes-usos', '"la pregunta que no falla"') + '), el <b>CapEx</b> y los indicadores sobre activos para comparar empresas.', 'Alcance para el examen (clase 5-oct)')}

      <h2 id="ecuacion"><span class="hn">1</span>La ecuación fundamental</h2>
      ${E.formula('Flujo de caja libre (FCL = FCFF)', 'FCL', 'EBITDA ± ΔKT después de impuestos ± CapEx', 'Fuente = positivo; uso = negativo. Solo el negocio central (core).')}
      <div class="g3">
        <div class="card2"><h4>1 · EBITDA</h4><p class="small">Utilidad operacional (≈ EBIT) <b>+ depreciación y amortización</b>. La D&amp;A se devuelve porque es un gasto que no sale de la caja. Ojo: utilidad operacional <b>no</b> es lo mismo que EBITDA.</p></div>
        <div class="card2"><h4>2 · ΔKT después de impuestos</h4><p class="small">El <b>cambio</b> en capital de trabajo operativo (fuentes y usos de AC y PC) <b>menos los impuestos del año</b>: sin pagar impuestos no se puede operar (te embargan).</p><p class="small"><b>Uso</b> = la inversión en KT aumenta; <b>fuente</b> = disminuye.</p></div>
        <div class="card2"><h4>3 · CapEx</h4><p class="small">Inversión en activos del negocio central. Si solo tienes el neto: <b>CapEx = Δ activo fijo neto + depreciación</b>. Nada de inversiones en otras empresas ni locales que rentas a terceros.</p></div>
      </div>
      <p class="prose small">Nombres equivalentes: <b>flujo de caja libre</b>, flujo de caja libre operacional, flujo de caja de la firma, <b>FCFF</b> (free cash flow to the firm), "flujo de caja del EBITDA". Es la versión depurada de lo que Buffett mide con operación + inversión.</p>
      ${E.kid('Tu sueldo (EBITDA) menos lo que tienes que gastar para poder seguir trabajando: el pasaje y la comida de la semana (capital de trabajo), los impuestos y arreglar tu bici de reparto (CapEx). Lo que te queda es <b>libre</b>: con eso pagas al banco y le das a tu familia.')}
      ${E.table([
        ['¿Para qué?', 'Reportar (lo exige la norma; interpretar)', 'Evaluar / valorar: proyectos, M&amp;A, "¿cuánto pago por la empresa?"'],
        ['¿Qué incluye?', 'Todo lo que hace la empresa, con reglas fijas IFRS / US GAAP', 'Solo el negocio central (core), según el criterio del analista'],
        ['Estructura', 'Operación + Inversión + Financiamiento = Δ caja', 'FCL (operativo) + flujo no operativo = 0'],
        ['Financiamiento', 'Bancos y dueños mezclados', 'Separado: bancos / accionistas / otros'],
      ], { head: ['', 'Flujo contable', 'Flujo de caja libre'] })}

      <h2 id="cascada"><span class="hn">2</span>Cascada interactiva y a quién se le dio el dinero</h2>
      ${E.concept({
        id: 'fcl-walmex', title: 'Del EBITDA al FCL y la balanza del flujo no operativo', badge: 'in',
        html: `<div class="btnrow" id="pFCL">
            <button class="btn" type="button" data-p="walmex">🛒 Walmex 2025 (≈ mil millones MXN)</button>
            <button class="btn" type="button" data-p="crec">🏗️ Comparable en crecimiento (ilustrativo)</button>
          </div>
          <div class="cols"><div>
            <div id="kFA"></div>
            <div id="kFB" style="margin-top:12px"></div>
            <div class="btnrow"><button class="btn sm" type="button" id="bCuadra">⚖️ Ajustar "otros" para que cuadre</button></div>
          </div><div>
            <div id="tF"></div>
            <div id="wfF" class="chart" style="margin-top:8px"></div>
            <div id="svgBal"></div>
          </div></div>
          <div id="iF" class="sx-interp"></div>
          <p class="small muted">Walmex 2025 según la clase del 5-oct (cifras dictadas, aproximadas): EBITDA ≈ 103 (utilidad operacional ≈ 78 + D&amp;A ≈ 25); KT operativo soltó ≈ +5.4 y los impuestos del año fueron ≈ 19 → ΔKT d.i. ≈ −13.6; CapEx ≈ 38 → FCL ≈ +51 (el profe lo redondeó a ≈ 50). Activos ≈ 495. El preset de crecimiento es inventado para ilustrar.</p>`,
      })}
      <h3>El flujo no operativo: tres destinos</h3>
      <div class="g3">
        <div class="card2"><h4>🏦 Bancos</h4><p class="small">Deuda <b>con costo</b> (todo lo que genera interés) + <b>intereses netos</b>. Uso = pagué a bancos; fuente = me prestaron. Walmex 2025: ≈ <b>9</b> a bancos (intereses).</p></div>
        <div class="card2"><h4>👥 Accionistas</h4><p class="small">Δ capital + Δ retenidas − utilidad neta. <b>Negativo = pagó dividendos</b>; positivo = los socios recapitalizaron. Walmex 2025: ≈ <b>47</b> en dividendos ("generosos").</p></div>
        <div class="card2"><h4>📦 Otros</h4><p class="small">Lo no operativo que no es ni banco ni dueño: asociadas, venta de activos, goodwill, impuestos diferidos LP, provisiones. Walmex: ≈ <b>+5</b> (redujo cosas no operativas: buena señal).</p></div>
      </div>
      ${E.formula('Verificación', 'FCL + Flujo no operativo', '0', 'Si hubo superávit, abajo ves a quién se le dio; si hubo déficit, abajo ves quién lo cubrió.')}
      ${E.kid('Es una <b>balanza</b>: todo el dinero que el negocio produce (o le falta) tiene que salir hacia alguien (o venir de alguien). Si la balanza no queda derecha, hiciste mal una cuenta.')}
      ${E.tip('<q>Lo que no quiero ver es un flujo de caja libre negativo.</q> Quiere decir que la empresa no genera lo suficiente para su capital de trabajo ni su CapEx.', 'Clase 5-oct')}

      <h2 id="indicadores"><span class="hn">3</span>Indicadores normalizados por activos</h2>
      <p class="prose">Para comparar empresas de distinto tamaño del mismo sector, divide los flujos entre los <b>activos totales</b> (no entre el flujo al accionista).</p>
      ${E.formula('CapEx sobre activos', 'CapEx/A', E.frac('−CapEx', 'Activos totales'), 'Signo invertido para que salga positivo. Si sale negativo, la empresa está desinvirtiendo.')}
      ${E.formula('Flujo de caja libre sobre activos', 'FCL/A', E.frac('FCL', 'Activos totales'), '"El más importante": el que se compara entre empresas del sector. Positivo y lo más alto posible. Se deja con su signo.')}
      ${E.formula('Dividendos sobre activos', 'Div/A', E.frac('−Flujo al accionista', 'Activos totales'), 'Signo invertido. El accionista lo quiere alto.')}
      ${E.tip('FCL sobre activos: <q>el más importante</q>, el que se compara de empresa a empresa en el mismo sector.', 'Clase 5-oct')}
      <div class="card2" style="max-width:var(--read)"><h4>Walmex: 2024 vs 2025 (aprox.)</h4><div id="chW" class="chart h220"></div><p class="small muted">Cifras dichas en clase (aprox.): CapEx/A ≈ 10% → ≈ 7.9%; FCL/A ≈ 7% → ≈ 11%; Div/A ≈ 4.1% → ≈ 9.5%. Invirtió un poco menos, generó más caja y repartió más.</p></div>
      <h3>Walmex vs Chedraui vs La Comer</h3>
      ${E.table([
        ['CapEx / Activos', '≈ 7.7–7.9% (2025); ≈ 10% (2024)', '≈ 17–18% (2024, inversión fuerte)', '≈ 10.4% (2024)'],
        ['FCL', '≈ +50 mil mill. (≈ 10–11% de activos)', '≈ +13 mil mill. (2025)', 'Negativo en 2024 (≈ −0.26 mil mill.)'],
        ['Dividendos', '≈ 47 mil mill. (≈ 9.5% de activos)', '≈ 0.4 mil mill.', 'Bajos; ≈ 0.65 mil mill. en 2024 con FCL negativo ⚠️'],
        ['Lectura', 'Madura, sana, reparte mucho', 'Invirtió fuerte y ya genera caja', 'Creciendo/remodelando; control familiar'],
        ['Ranking como inversión', '1', '2', '3 (¿oportunidad de comprar a descuento?)'],
      ], { head: ['Aprox.', 'Walmex', 'Chedraui', 'La Comer*'] })}
      <p class="small muted">*La transcripción automática deforma el nombre de la segunda comparable; por contexto es La Comer. Todas las cifras son aproximadas (dictadas en voz): úsalas para el orden de magnitud, no como dato exacto.</p>

      <h2 id="reglas"><span class="hn">4</span>Reglas para interpretar</h2>
      ${E.concept({
        id: 'regla-capex', title: 'Regla del CapEx: ¿está justificada la inversión?', badge: 'in',
        html: `<div class="cols"><div>
          ${E.formula('En el curso normal del negocio', 'Crec. % ingresos', '&gt; Crec. % CapEx')}
          <p>El CapEx se hace para <b>crecer</b>: más capacidad → más ventas. Por eso se compara contra el <b>ingreso</b>, no contra la utilidad. Excepción: años de <b>plan de expansión</b> (pasar de 25% a 50% del mercado), donde el CapEx se dispara.</p>
          <p><b>Empresa madura:</b> CapEx ≈ depreciación (solo repone lo que se gasta).</p>
          <div id="oRC" class="sx-interp"></div>
        </div><div><div id="kRC"></div></div></div>`,
      })}
      ${E.warn('<b>Señal de alerta (análisis de crédito):</b> FCL <b>negativo</b> y pago de <b>dividendos</b> al mismo tiempo = pide prestado para pagarle a sus accionistas. Repetido varios años, es la típica candidata a concurso mercantil.')}
      ${E.key('<b>KT negativo en retail no es malo:</b> Walmex tiene pasivo circulante mayor que activo circulante porque sus <b>proveedores</b> (≈ 123 mil millones) le financian la operación. Es poder de negociación, no debilidad.')}
      ${E.note('<b>La Comer</b> cotiza en bolsa pero tiene <b>control familiar</b>: su dividendo es bajo. Eso no significa que la familia no gane; puede extraer valor por otras vías legales (ser su propio proveedor, comercializadoras propias).', 'Dividendo bajo ≠ dueños que no ganan')}
      ${E.warn('No confundas el <b>nivel</b> de capital de trabajo (AC − PC, para liquidez) con el <b>cambio</b> en capital de trabajo (lo que entra al flujo). Y no olvides restarle los impuestos.')}
      ${E.warn('Meter en el KT la deuda con costo o la caja excedente. El banco es un aportante de capital: va al flujo no operativo (salvo líneas vitales para operar, como en un hospital o una importadora).')}
      ${E.tip('<q>Esta es la medida básica de valor.</q> Mientras más caja produzca la empresa, más atractiva para inversionistas y bancos.', 'Clase 5-oct')}

      <h2 id="quiz-fcl"><span class="hn">5</span>¿Qué pasa si…?</h2>
      <div id="qzL"></div>
      </div>`;

      // ---- cascada + balanza
      const tF = root.querySelector('#tF'), sBal = root.querySelector('#svgBal'), iF = root.querySelector('#iF');
      let A = null, B = null, wfF = null, kA = null, kB = null;
      const calc = () => {
        const fcl = A.ebitda + A.dkt - A.imp - A.capex, kti = A.dkt - A.imp, noop = B.ban + B.acc + B.otr;
        return { fcl, kti, noop };
      };
      const upd = () => {
        if (!A || !B) return;
        const { fcl, kti, noop } = calc();
        E.tiles(tF, [
          { label: 'EBITDA', v: A.ebitda, fmt: 'n', dec: 1 },
          { label: 'ΔKT después de impuestos', v: kti, fmt: 'sgn', dec: 1 },
          { label: 'CapEx', v: -A.capex, fmt: 'sgn', dec: 1 },
          { label: 'Flujo de caja libre', v: fcl, fmt: 'sgn', dec: 1, hl: true, note: fcl >= 0 ? '✓ superávit' : '✗ déficit' },
          { label: 'CapEx / Activos', v: A.capex / A.act, fmt: 'pct' },
          { label: 'FCL / Activos ★', v: fcl / A.act, fmt: 'pct', hl: true },
          { label: 'Dividendos / Activos', v: -B.acc / A.act, fmt: 'pct' },
        ]);
        sBal.innerHTML = balanza(fcl, noop);
        let msg = fcl >= 0
          ? `✓ El EBITDA (<b>${n1(A.ebitda)}</b>) alcanzó para el capital de trabajo, los impuestos y el CapEx, y sobró un <b>FCL de ${sg(fcl)}</b> para bancos y accionistas. `
          : `✗ <b>Déficit de ${sg(fcl)}</b>: KT + impuestos + CapEx superan al EBITDA. Normal en años de expansión si hay caja para aguantar; preocupante en un negocio maduro (y más en un supermercado). `;
        msg += A.dkt > 0 ? `El KT operativo <b>soltó</b> ${n1(A.dkt)} (proveedores financian), pero tras impuestos el ΔKT es ${sg(kti)}. ` : `El KT operativo <b>consumió</b> ${n1(-A.dkt)}; con impuestos, ${sg(kti)}. `;
        msg += `Destino: bancos ${sg(B.ban)}, accionistas ${sg(B.acc)}, otros ${sg(B.otr)}.`;
        iF.innerHTML = msg + (fcl < 0 && B.acc < 0 ? `<div class="sx-alert">⚠️ Señal de alerta: FCL negativo y aun así paga dividendos (${n1(-B.acc)}). El dinero viene de bancos u otras fuentes para pagarle a los accionistas.</div>` : '');
        if (wfF) wfF.refresh();
      };
      kA = E.knobs(root.querySelector('#kFA'), [
        { k: 'ebitda', label: 'EBITDA (utilidad operacional + D&A)', min: -10, max: 150, step: 0.5, v: 103, fmt: 'n', dec: 1 },
        { k: 'dkt', label: 'Cambio en KT operativo antes de impuestos (+ fuente / − uso)', min: -30, max: 30, step: 0.1, v: 5.4, fmt: 'sgn', dec: 1 },
        { k: 'imp', label: 'Impuestos del año (uso)', min: 0, max: 40, step: 0.1, v: 19, fmt: 'n', dec: 1 },
        { k: 'capex', label: 'CapEx del negocio central (uso)', min: 0, max: 80, step: 0.5, v: 38, fmt: 'n', dec: 1 },
        { k: 'act', label: 'Activos totales', min: 10, max: 800, step: 1, v: 495, fmt: 'n' },
      ], (st) => { A = st; upd(); }, { title: '🎛️ Flujo operativo (mil millones)' });
      kB = E.knobs(root.querySelector('#kFB'), [
        { k: 'ban', label: 'Bancos: deuda con costo + intereses', min: -30, max: 30, step: 0.1, v: -9, fmt: 'sgn', dec: 1 },
        { k: 'acc', label: 'Accionistas: dividendos (−) / recapitalización (+)', min: -60, max: 20, step: 0.1, v: -47, fmt: 'sgn', dec: 1 },
        { k: 'otr', label: 'Otros no operativos', min: -20, max: 20, step: 0.1, v: 4.6, fmt: 'sgn', dec: 1 },
      ], (st) => { B = st; upd(); }, { title: '🎛️ Flujo no operativo (mil millones)' });
      wfF = waterfall(root.querySelector('#wfF'), (T) => [
        { name: 'EBITDA', v: A.ebitda, total: true, color: T.c4 },
        { name: 'ΔKT operativo', v: A.dkt, color: T.c1 },
        { name: 'Impuestos', v: -A.imp, color: T.c2 },
        { name: 'CapEx', v: -A.capex, color: T.c3 },
        { name: 'FCL', v: A.ebitda + A.dkt - A.imp - A.capex, total: true, color: T.c4 },
      ], (v, s) => (s ? sg(v) : n1(v)));
      root.querySelectorAll('#pFCL button').forEach((b) => b.addEventListener('click', () => {
        const p = PRESET_FCL[b.dataset.p]; kA.set(p.A); kB.set(p.B);
      }));
      root.querySelector('#bCuadra').addEventListener('click', () => {
        const { fcl } = calc();
        const o = Math.round(clamp(-fcl - B.ban - B.acc, -20, 20) * 10) / 10;
        kB.set({ otr: o });
      });

      // ---- Walmex 2024 vs 2025
      E.chart(root.querySelector('#chW'), (T) => ({
        ...E.baseOpt(T),
        xAxis: E.axisCat(['CapEx / Activos', 'FCL / Activos', 'Dividendos / Activos'], T),
        yAxis: E.axisVal(T, (v) => E.fmt.pct(v, 0)),
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => '≈ ' + E.fmt.pct(v, 1) },
        series: [
          { name: '2024', type: 'bar', data: [0.10, 0.07, 0.0406], itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 34 },
          { name: '2025', type: 'bar', data: [0.0786, 0.11, 0.0953], itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 34 },
        ],
      }));

      // ---- regla del CapEx
      const oRC = root.querySelector('#oRC');
      E.knobs(root.querySelector('#kRC'), [
        { k: 'gr', label: 'Crecimiento % de los ingresos', min: -0.1, max: 0.3, step: 0.01, v: 0.07, fmt: 'pct', dec: 0 },
        { k: 'gc', label: 'Crecimiento % del CapEx', min: -0.3, max: 0.6, step: 0.01, v: 0.05, fmt: 'pct', dec: 0 },
      ], (st) => {
        oRC.innerHTML = st.gr > st.gc
          ? `✓ Ingresos ${E.fmt.pct(st.gr, 0)} &gt; CapEx ${E.fmt.pct(st.gc, 0)}: las inversiones se están pagando con más ventas; hay espacio para invertir.`
          : `✗ CapEx ${E.fmt.pct(st.gc, 0)} ≥ ingresos ${E.fmt.pct(st.gr, 0)}: en un año normal, la inversión no se justifica con ventas. Pregunta: ¿hay un plan de expansión que lo explique?`;
      }, { title: '🎛️ ¿Justificado?' });

      // ---- quiz
      E.quiz(root.querySelector('#qzL'), [
        { q: 'EBITDA 50, ΔKT después de impuestos −10, CapEx −25. ¿FCL?', o: ['+85', '+15', '−15'], a: 1, w: 'FCL = 50 − 10 − 25 = +15. Superávit para bancos y accionistas.' },
        { q: 'Una empresa tiene FCL de −20 y pagó 15 de dividendos. ¿Qué concluyes?', o: ['Excelente: es generosa', 'Señal de alerta: se financia para pagar dividendos', 'Nada, son flujos independientes'], a: 1, w: 'Déficit + dividendos = pide prestado (o vende cosas) para pagarle a los socios. Repetido, huele a concurso mercantil.' },
        { q: '¿Qué indicador se deja con su signo y es "el más importante" para comparar en el sector?', o: ['CapEx / Activos', 'FCL / Activos', 'Dividendos / Activos'], a: 1, w: 'FCL/A: positivo y alto. CapEx y dividendos se dividen con el signo invertido.' },
        { q: 'Walmex tiene capital de trabajo negativo. ¿Qué significa?', o: ['Está quebrando', 'Sus proveedores le financian la operación', 'Tiene demasiada caja'], a: 1, w: 'En retail es normal: vende antes de pagar a proveedores. Es poder de negociación.' },
        { q: 'En un año normal, ingresos +5% y CapEx +12%. ¿Lectura?', o: ['Inversión justificada', 'No se justifica con ventas (salvo plan de expansión)', 'CapEx debe ser igual a la utilidad'], a: 1, w: 'La regla: crecimiento % de ingresos > crecimiento % del CapEx.' },
        { q: 'FCL = +51 y bancos −9, accionistas −47. ¿Cuánto deben ser "otros" para que cuadre?', o: ['+5', '−5', '0'], a: 0, w: '51 − 9 − 47 + otros = 0 → otros = +5. FCL + no operativo = 0.' },
      ]);
    },
  });
})();
