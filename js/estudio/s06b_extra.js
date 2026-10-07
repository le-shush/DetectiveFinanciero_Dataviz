// Sección 6.9 — Para saber más (NO entra al examen): ROC/ROIC/ROCE, WACC (ejemplo Uber), ROIC vs WACC y cómo leer una cotización (AAL).
(function () {
  const F = E.fmt;

  // Uber: el conductor es el CEO de su coche
  const uber = `<svg class="ill" viewBox="0 0 860 300" role="img" aria-label="Coche de 100 mil: 60 mil del banco que pide 30% y 40 mil del dueño que pide 50%; el conductor debe producir 38 mil, 38%">
    <defs><marker id="sxext-ah" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    <!-- coche -->
    <rect x="40" y="120" width="230" height="70" rx="18" class="f3"/>
    <path d="M80 120 L115 78 H200 L240 120 Z" class="f3"/><path d="M95 120 L122 88 H155 V120 Z M165 120 V88 H196 L224 120 Z" class="bg" opacity=".85"/>
    <circle cx="95" cy="192" r="22" class="f8"/><circle cx="95" cy="192" r="9" class="bg"/><circle cx="215" cy="192" r="22" class="f8"/><circle cx="215" cy="192" r="9" class="bg"/>
    <text x="155" y="162" text-anchor="middle" class="tw" font-size="17" font-weight="800">$100,000</text>
    <text x="155" y="244" text-anchor="middle" font-size="13" class="tm">90 coche + 10 capital de trabajo</text>
    <text x="155" y="262" text-anchor="middle" font-size="13" class="tm">(seguro, gasolina)</text>
    <!-- financiamiento -->
    <rect x="330" y="40" width="230" height="76" rx="14" class="w2"/>
    <text x="345" y="66" font-size="15" font-weight="700">🏦 Banco: $60,000 (60%)</text><text x="345" y="88" font-size="14" class="t2">quiere 30% → <tspan font-weight="700">$18,000</tspan></text><text x="345" y="106" font-size="12" class="tm">costo de la deuda (Kd)</text>
    <rect x="330" y="176" width="230" height="76" rx="14" class="w1"/>
    <text x="345" y="202" font-size="15" font-weight="700">🙋 Dueño: $40,000 (40%)</text><text x="345" y="224" font-size="14" class="t2">quiere 50% → <tspan font-weight="700">$20,000</tspan></text><text x="345" y="242" font-size="12" class="tm">costo del patrimonio (Ke)</text>
    <path d="M272 140 C 300 120, 305 90, 328 82" class="ln s5" marker-end="url(#sxext-ah)"/><path d="M272 170 C 300 190, 305 205, 328 212" class="ln s5" marker-end="url(#sxext-ah)"/>
    <!-- conductor -->
    <path d="M562 78 C 600 80, 610 130, 640 140" class="ln s5 anim-flow" marker-end="url(#sxext-ah)"/><path d="M562 214 C 600 212, 610 165, 640 158" class="ln s5 anim-flow" marker-end="url(#sxext-ah)"/>
    <rect x="645" y="96" width="200" height="108" rx="16" class="f5"/>
    <text x="745" y="124" text-anchor="middle" class="tw" font-size="15" font-weight="700">🧑‍✈️ Conductor = CEO</text>
    <text x="745" y="152" text-anchor="middle" class="tw" font-size="15">debe producir</text>
    <text x="745" y="182" text-anchor="middle" class="tw" font-size="22" font-weight="800">$38,000 = 38%</text>
    <text x="745" y="232" text-anchor="middle" font-size="13" class="t2">produce 40 → bono · 30 → sólo le paga al banco</text>
    <text x="745" y="250" text-anchor="middle" font-size="13" class="t2">produce 10 → "tiene que perder la chamba"</text>
  </svg>`;

  E.section({
    id: 'extra', n: 6.9, group: 'razones', icon: '➕', short: 'ROIC, WACC y múltiplos', exam: 'out',
    title: 'Para saber más: ROIC, WACC y cómo leer una cotización',
    lead: 'Cultura general de finanzas corporativas. El profe fue claro: esto no viene en el examen. Léelo rápido para entender de qué hablan los ejecutivos.',
    render(root) {
      root.innerHTML = `
      <style>.sx-ext .interp{font-size:15px;line-height:1.5;margin-top:10px;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line)}
        .sx-ext .quote{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:8px;margin:10px 0}.sx-ext .quote div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px 10px}
        .sx-ext .quote b{display:block;font-size:17px;font-variant-numeric:tabular-nums}.sx-ext .quote span{font-size:12px;color:var(--muted)}</style>
      <div class="sx-ext">
      ${E.tip('Sobre ROC, ROIC, ROCE y la lectura de Morgan Stanley: <q>nada de esto se los voy a poner en un examen. Esto simplemente es cultura general.</q>', 'Clase 28-sep')}

      ${E.concept({ id: 'roic', title: 'ROC, ROIC y ROCE: rendimientos "de multinacional"', badge: 'out', html: `
        <p>Las multinacionales los usan para <b>pagar bonos a sus ejecutivos</b>. Los tres tienen el <b>mismo numerador</b>: la utilidad de la operación después de impuestos, sin importar cómo se financia la empresa.</p>
        ${E.formula('Numerador común', 'NOPAT (EBIAT)', 'Utilidad operacional − Impuestos', '≈ EBIT × (1 − t). "Ese siempre va a ser el numerador"')}
        ${E.table([
          ['ROC (retorno sobre capital)', 'Deuda con costo + Patrimonio', 'Lo que pusieron bancos y dueños'],
          ['ROIC (retorno sobre capital invertido)', 'Activos no circulantes + Capital de trabajo SIN caja', 'Lo que el gerente tiene para trabajar'],
          ['ROCE (retorno sobre capital empleado)', 'Activo total − Pasivo circulante', 'Inversión total menos lo que debo a corto plazo'],
        ], { head: ['Medida = NOPAT ÷ …', 'Denominador', 'Idea'] })}
        ${E.key('¿Por qué el capital invertido va <b>sin caja</b>? En finanzas puras la caja <b>ya es del accionista</b>, sólo que no se la han devuelto. Si la empresa devuelve el exceso de caja, el capital invertido baja y el ROIC sube: por eso <b>generar caja</b> (cobrar antes, rotar inventario, manejar proveedores) es tan importante.', 'La caja no cuenta')}
        ${E.note('Mauboussin (Morgan Stanley): una empresa <b>crea valor</b> cuando su ROIC supera su costo de capital; crecer con ROIC menor al costo de capital es "correr en la caminadora". Las recompras suben el ROE pero no el ROIC.', 'Lectura')}
      ` })}

      ${E.concept({ id: 'wacc', title: 'Costo promedio de capital (WACC): el ejemplo Uber', badge: 'out', html: `
        ${E.fig(uber, 'Cualquier conductor es el CEO de su coche: tiene que pagarle al banco y al dueño lo que esperan.', true)}
        <div class="cols"><div>
          ${E.formula('Versión de clase', 'WACC', 'Kd × %Deuda + Ke × %Patrimonio', '0.30 × 0.60 + 0.50 × 0.40 = 0.18 + 0.20 = 38%')}
          ${E.formula('Versión estándar (libros)', 'WACC', 'Kd × (1 − t) × %Deuda + Ke × %Patrimonio', 'los intereses son deducibles: la deuda cuesta menos después de impuestos')}
        </div><div>
          ${E.tip('<q>Al único que le importa el costo promedio de capital es al gerente.</q> Al dueño y al banco los tiene sin cuidado: ellos sólo quieren su 50% y su 30%.', 'Clase 28-sep')}
          ${E.kid('Pediste prestado para tu puesto de tacos: el banco quiere su parte y tu mamá (que puso el resto) también. Lo que el puesto tiene que ganar para que <b>los dos</b> queden contentos es el costo promedio de capital.')}
        </div></div>
      ` })}

      ${E.concept({ id: 'roic-wacc', title: 'ROIC vs WACC: ¿creas valor?', badge: 'out', html: `
        <div class="cols"><div>
          <div id="kRW"></div>
        </div><div>
          <div id="tRW"></div>
          <div class="chart h220" id="cRW"></div>
          <div class="interp" id="iRW"></div>
        </div></div>
        ${E.formula('Utilidad económica (EVA)', 'EVA', '(ROIC − WACC) × Capital invertido', 'si es positiva, creas valor; ahí se atan los bonos del C-Suite')}
      ` })}

      ${E.concept({ id: 'cotizacion', title: 'Cómo leer una cotización: American Airlines (AAL)', badge: 'out', html: `
        <p>Ejemplo de la clase del 21-sep (cifras aproximadas de la transcripción, sólo para ilustrar).</p>
        <div class="quote">
          <div><span>Ticker</span><b>AAL</b><span>abreviatura para buscarla</span></div>
          <div><span>Último precio</span><b>$12.88</b><span>apertura 11.78</span></div>
          <div><span>Bid / Ask</span><b>12.83 / 12.84</b><span>quién compra / quién vende</span></div>
          <div><span>Rango 52 semanas</span><b>8.50 – 19.10</b><span>mín. y máx. del año</span></div>
          <div><span>Volumen</span><b>≈63.7 M</b><span>acciones que cambiaron de manos hoy</span></div>
          <div><span>Capitalización</span><b>≈ $8,498 M</b><span>acciones × precio</span></div>
          <div><span>EPS (TTM)</span><b>$0.84</b><span>utilidad por acción, 12 meses</span></div>
          <div><span>P/E (TTM)</span><b>≈15.3</b><span>12.88 ÷ 0.84</span></div>
          <div><span>Dividendo / ex-dividend</span><b>—</b><span>no paga desde ≈2020</span></div>
        </div>
        ${E.table([
          ['Bid / Ask', 'Bid = lo más que alguien paga hoy; Ask = lo menos que alguien acepta para vender. Hay operación cuando uno "se baja" o "se sube".'],
          ['Capitalización de mercado', 'Acciones en circulación × último precio. <q>El indicador final para una empresa pública.</q>'],
          ['Beta', 'Pendiente de la regresión de los rendimientos de la acción vs. el índice (≈60 meses). <b>&gt; 1 = agresiva</b> (se mueve más que el mercado); &lt; 1 = defensiva.'],
          ['EPS (TTM)', 'Utilidad neta de los últimos 12 meses ÷ acciones en circulación.'],
          ['P/E', 'Precio ÷ EPS. Más alto que la competencia: o está <b>cara</b>, o el mercado espera <b>mucho crecimiento</b> (tech).'],
          ['Ex-dividend date', 'Fecha a partir de la cual quien compra la acción ya <b>no</b> recibe el próximo dividendo.'],
        ], { head: ['Dato', 'Qué significa'] })}
        <div class="cols"><div><div id="kQ"></div></div><div><div id="tQ"></div><div class="interp" id="iQ"></div></div></div>
        ${E.note('"Economía de expectativas": si prometieron EPS de $1 y entregan $0.80, la acción baja aunque haya utilidad; si entregan $1.50, sube.', 'Expectativas')}
      ` })}
      </div>`;

      // ---- ROIC vs WACC
      let rw = null, cR = null;
      const tR = root.querySelector('#tRW'), iR = root.querySelector('#iRW');
      const W0 = { roic: 0.40, kd: 0.30, ke: 0.50, wd: 0.6, t: 0, cap: 100000 };
      const wacc = (s) => s.kd * (1 - s.t) * s.wd + s.ke * (1 - s.wd);
      E.knobs(root.querySelector('#kRW'), [
        { k: 'roic', label: 'ROIC (lo que produce el conductor)', min: 0, max: 0.6, step: 0.01, v: W0.roic, fmt: 'pct', dec: 0 },
        { k: 'kd', label: 'Kd: lo que pide el banco', min: 0.02, max: 0.4, step: 0.01, v: W0.kd, fmt: 'pct', dec: 0 },
        { k: 'ke', label: 'Ke: lo que pide el dueño', min: 0.05, max: 0.6, step: 0.01, v: W0.ke, fmt: 'pct', dec: 0 },
        { k: 'wd', label: '% financiado con deuda', min: 0, max: 0.9, step: 0.05, v: W0.wd, fmt: 'pct', dec: 0 },
        { k: 't', label: 'Tasa de impuestos (0% = versión de clase)', min: 0, max: 0.4, step: 0.01, v: W0.t, fmt: 'pct', dec: 0 },
        { k: 'cap', label: 'Capital invertido', min: 10000, max: 500000, step: 10000, v: W0.cap, fmt: '$' },
      ], (s) => {
        rw = s; const w = wacc(s), eva = (s.roic - w) * s.cap;
        E.tiles(tR, [
          { label: 'WACC', v: w, fmt: 'pct', hl: true },
          { label: 'ROIC − WACC', v: s.roic - w, fmt: 'pct' },
          { label: 'EVA (utilidad económica)', v: eva, fmt: '$' },
          { label: 'Valor de cada $1 invertido', v: w > 0 ? s.roic / w : null, fmt: 'n', dec: 2, note: '≈ ROIC ÷ WACC (perpetuidad)' },
        ]);
        const debt = s.kd * (1 - s.t) * s.wd * s.cap;
        let t;
        if (s.roic >= w + 0.0001) t = `✓ El negocio produce <b>${F.pct(s.roic, 0)}</b> y el capital cuesta <b>${F.pct(w)}</b>: le pagas al banco, le cumples al dueño y sobran ${F.$(eva)} → <b>crea valor</b> (aquí van los bonos).`;
        else if (s.roic * s.cap >= debt) t = `! Produces ${F.pct(s.roic, 0)}: alcanza para el banco (${F.$(debt)}), pero <b>no le cumples al dueño</b>. Destruyes ${F.$(-eva)} de valor.`;
        else t = `✗ Produces ${F.pct(s.roic, 0)}: ni siquiera le pagas al banco. Como dijo el profe, <q>es un CEO que tiene que perder la chamba</q>.`;
        iR.innerHTML = t;
        cR && cR.refresh();
      }, { title: '🚗 ¿El conductor crea valor?' });
      cR = E.chart(root.querySelector('#cRW'), (T) => ({
        ...E.baseOpt(T),
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.pct(v) },
        xAxis: E.axisCat(['ROIC (lo que produces)', 'WACC (lo que cuesta)'], T),
        yAxis: E.axisVal(T, (v) => F.pct(v, 0)),
        series: [{ name: 'Rendimiento', type: 'bar', barMaxWidth: 56, data: [{ value: rw.roic, itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] } }, { value: wacc(rw), itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] } }], label: { show: true, position: 'top', color: T.ink2, formatter: (p) => F.pct(p.value) } }],
      }));

      // ---- cotización: market cap y P/E
      const tQ = root.querySelector('#tQ'), iQ = root.querySelector('#iQ');
      const SH = 659.828; // millones de acciones
      E.knobs(root.querySelector('#kQ'), [
        { k: 'px', label: 'Precio de la acción (USD)', min: 4, max: 30, step: 0.01, v: 12.88, fmt: 'n', dec: 2 },
        { k: 'eps', label: 'EPS de los últimos 12 meses (USD)', min: -1, max: 3, step: 0.01, v: 0.84, fmt: 'n', dec: 2 },
      ], (s) => {
        const pe = s.eps > 0 ? s.px / s.eps : null;
        E.tiles(tQ, [
          { label: 'Capitalización (millones USD)', v: SH * s.px, fmt: '$', base: SH * 12.88, note: '659.8 M acciones × precio' },
          { label: 'Utilidad neta TTM (millones)', v: SH * s.eps, fmt: '$' },
          { label: 'P/E', v: pe, fmt: 'n', dec: 1, hl: true },
        ]);
        iQ.innerHTML = pe === null ? '✗ Con utilidad por acción negativa el P/E no tiene sentido: el mercado paga por expectativas, no por utilidades actuales.' : `Pagas <b>$${F.n(pe, 1)}</b> por cada $1 de utilidad anual. ${pe > 25 ? 'Muy alto: o está cara, o el mercado espera mucho crecimiento.' : pe < 10 ? 'Bajo: el mercado espera poco crecimiento o ve riesgo (o está barata).' : 'Rango "normal" para una empresa establecida.'}`;
      }, { title: '📈 Juega con la cotización' });
    },
  });
})();
