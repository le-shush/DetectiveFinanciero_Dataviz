// Sección 6 — Rentabilidad (márgenes, ROA, ROE) y Sección 6.5 — Metodología DuPont (árbol interactivo).
(function () {
  const F = E.fmt;
  const ok = (v) => v !== null && v !== undefined && isFinite(v);

  // ================================================================ utilidades compartidas
  // Estado de resultados simple a partir de cuentas
  const er = (s) => {
    const UB = s.v - s.cv, UO = UB - s.go, UAI = UO - s.int, IMP = Math.max(0, UAI) * s.t, UN = UAI - IMP;
    return { UB, UO, UAI, IMP, UN };
  };

  // ================================================================ moneda que se parte
  function moneda(s) {
    const r = er(s); const V = s.v;
    const parts = [
      ['Costo de ventas', s.cv, 'f1'], ['Gastos de operación', s.go, 'f2'], ['Intereses', s.int, 'f3'], ['Impuestos', r.IMP, 'f4'], ['Utilidad neta', Math.max(0, r.UN), 'f5'],
    ];
    const tot = r.UN >= 0 ? V : s.cv + s.go + s.int; // si hay pérdida, la moneda no alcanza: escalamos
    const cx = 150, cy = 150, R = 118, r0 = 60;
    let a = -Math.PI / 2; let paths = '';
    parts.forEach(([, val, cls]) => {
      const f = Math.min(0.9999, Math.max(0, val / tot)); if (f <= 0.0005) return;
      const a1 = a + f * 2 * Math.PI, large = f > 0.5 ? 1 : 0;
      const p = (ang, rr) => `${(cx + rr * Math.cos(ang)).toFixed(2)} ${(cy + rr * Math.sin(ang)).toFixed(2)}`;
      paths += `<path d="M${p(a, R)} A${R} ${R} 0 ${large} 1 ${p(a1, R)} L${p(a1, r0)} A${r0} ${r0} 0 ${large} 0 ${p(a, r0)} Z" class="${cls}"/>`;
      a = a1;
    });
    const cent = (x) => F.n((x / V) * 100, 1) + '¢';
    const loss = r.UN < 0;
    return `<svg class="ill" viewBox="0 0 640 300" role="img" aria-label="De cada peso vendido: ${parts.map((p) => p[0] + ' ' + cent(p[1])).join(', ')}">
      <circle cx="${cx}" cy="${cy}" r="${R + 10}" class="w4"/><circle cx="${cx}" cy="${cy}" r="${R + 10}" class="ln"/>
      ${paths}
      <circle cx="${cx}" cy="${cy}" r="${r0 - 2}" class="bg"/>
      <text x="${cx}" y="${cy - 8}" text-anchor="middle" font-size="26" font-weight="800">$1</text>
      <text x="${cx}" y="${cy + 14}" text-anchor="middle" font-size="12" class="tm">${loss ? 'no alcanza' : 'de venta'}</text>
      <g font-size="15">
        <text x="300" y="40" font-weight="700">De cada $1 que vendes…</text>
        ${parts.map(([lb, val, cls], i) => `<rect x="300" y="${58 + i * 32}" width="16" height="16" rx="4" class="${cls}"/><text x="324" y="${71 + i * 32}" ${i === 4 ? 'font-weight="700"' : ''}>${lb}</text><text x="612" y="${71 + i * 32}" text-anchor="end" font-weight="700">${i === 4 && loss ? '−' + F.n((-r.UN / V) * 100, 1) + '¢' : cent(val)}</text>`).join('')}
        <line x1="300" y1="222" x2="612" y2="222" class="lnm"/>
        <text x="300" y="248" font-size="14" class="t2">${loss ? '✗ Pérdida: los costos se comen más que la moneda completa.' : 'Te quedas con <tspan font-weight="700">' + cent(r.UN) + '</tspan> de cada peso (margen neto).'}</text>
        <text x="300" y="272" font-size="13" class="tm">Margen bruto ${F.pct(r.UB / V)} · operacional ${F.pct(r.UO / V)}</text>
      </g></svg>`;
  }

  // ================================================================ sección RENTABILIDAD
  E.section({
    id: 'rentabilidad', n: 6, group: 'razones', icon: '💰', short: 'Rentabilidad', exam: 'in',
    title: 'Rentabilidad: ¿cuánto te queda de lo que vendes y de lo que invertiste?',
    lead: 'Márgenes (por cada peso vendido) y rendimientos (por cada peso invertido). Son el efecto combinado de todas las razones anteriores.',
    render(root) {
      root.innerHTML = `
      <style>.sx-ren .interp{font-size:15px;line-height:1.5;margin-top:10px;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line)}</style>
      <div class="sx-ren">
      <p class="prose">Liquidez, eficiencia y deuda son <b>causas</b>; la rentabilidad es el <b>efecto</b>. Hay dos familias: <b>márgenes</b> (se dividen entre <b>ventas</b>: ¿cuánto queda de cada peso vendido?) y <b>rendimientos</b> (se dividen entre <b>activos o patrimonio</b>: ¿cuánto gana cada peso invertido?).</p>
      ${E.table([
        ['Margen bruto', 'Utilidad bruta ÷ Ventas', 'Lo que queda después del costo de lo vendido'],
        ['Margen operacional', 'Utilidad operacional ÷ Ventas', 'Lo que deja la operación (antes de intereses e impuestos)'],
        ['Margen neto (rendimiento neto de ventas)', 'Utilidad neta ÷ Ventas', 'Lo que le queda al final al dueño de cada peso vendido'],
        ['ROA (rendimiento del activo)', 'Utilidad neta ÷ Activo total', 'Lo que gana cada peso de inversión total'],
        ['ROE (rendimiento del patrimonio)', 'Utilidad neta ÷ Patrimonio', 'Lo que gana cada peso que puso el dueño'],
      ], { head: ['Razón', 'Fórmula (como la usa el profe)', 'Qué dice'] })}

      ${E.concept({ id: 'moneda', title: 'La moneda que se va partiendo: márgenes', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Margen neto / Rendimiento neto de ventas', 'MN', E.frac('Utilidad neta', 'Ventas'), '¿ventas muy bajas o costos muy altos?')}
          ${E.formula('Margen operacional', 'MO', E.frac('Utilidad operacional', 'Ventas'), 'el profe: "el más importante"')}
          ${E.formula('Margen bruto', 'MB', E.frac('Ventas − Costo de ventas', 'Ventas'))}
          ${E.kid('Vendes una paleta en <b>$1</b>. Con 60 centavos pagas la paleta, 24 la renta y el sueldo, 4 los intereses, 4 los impuestos… y <b>te quedan 8 centavos</b>. Ese es tu margen neto: <b>8%</b>.')}
          <p><b>Cómo se lee:</b> más alto es mejor, <b>siempre comparado</b> con el año anterior o con la competencia. Si tu margen neto es más bajo que el del sector, la pregunta del profe es: <b>¿nuestras ventas son muy bajas o nuestros costos son muy altos?</b></p>
          <p>Prueba en las perillas: con <b>gastos fijos</b>, si bajan las ventas el margen se desploma aunque el costo por unidad sea el mismo (ventas muy bajas). Si sube el % de costo, el margen bruto cae (costos muy altos).</p>
        </div><div>
          <div id="kMon"></div>
          <div id="fMon" style="margin-top:10px"></div>
        </div></div>
        <div class="cols"><div><div id="tMon"></div><div class="interp" id="iMon"></div></div><div><div class="chart" id="cMon"></div></div></div>
        ${E.tip('ABC: margen neto <b>2.5%</b>; si la competencia tiene 5%, <b>mal</b>. Margen operacional <b>16%</b>: <q>por cada peso vendido, 16 centavos de utilidad operacional</q> y 84 de costo y gastos. Lo quieres lo más alto posible.', 'Clase 23-sep')}
      ` })}

      ${E.concept({ id: 'roa-roe', title: 'ROA y ROE: ¿cuánto rinde lo invertido?', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('ROA — rendimiento del activo total', 'ROA', E.frac('Utilidad neta', 'Total activos'))}
          ${E.formula('ROE — rendimiento del patrimonio', 'ROE', E.frac('Utilidad neta', 'Patrimonio'), '"la que realmente le importa al inversionista"')}
          <p><b>ROA:</b> por cada $100 invertidos en la empresa (sin importar quién los puso), ¿cuántos gané? <b>Sólo hay dos caminos para subirlo:</b> (1) la <b>misma utilidad con menos inversión</b> (vender activos improductivos) o (2) <b>más utilidad con la misma inversión</b>.</p>
          <p><b>ROE:</b> por cada $100 que puso el <b>dueño</b>, ¿cuántos ganó? El resto de la inversión está <b>apalancada</b> (deuda).</p>
          ${E.key('<b>ROE vs ROA = el apalancamiento.</b> Si el dueño pone sólo la mitad (multiplicador 2x), el ROE es ≈ 2 × ROA. La deuda <b>ayuda</b> al ROE cuando tus activos rinden más de lo que cuesta la deuda, y lo <b>hunde</b> cuando rinden menos. Juega con la tasa de interés.')}
          ${E.kid('Tu tienda gana $10 al año con $100 de inversión (ROA 10%). Si $50 te los prestó tu tío al 6% (le pagas $3), tú pusiste $50 y te quedan $7: <b>tu ROE es 14%</b>. Pero si el tío cobra 20% ($10), te quedas en $0.')}
        </div><div>
          <div id="kLev"></div>
          <div id="tLev" style="margin-top:10px"></div>
          <div class="chart" id="cLev"></div>
          <div class="interp" id="iLev"></div>
        </div></div>
        ${E.tip('<q>Solo hay dos caminos para mejorar el ROA</q>: menos inversión con la misma utilidad, o más utilidad con la misma inversión. <q>Felicitaciones, ya puede ser consultor de McKinsey.</q>', 'Clase 23-sep')}
        ${E.note('Este simulador supone que todo el pasivo cobra interés y una tasa de impuestos fija; en la vida real los <b>proveedores</b> son pasivo sin costo (el mejor pasivo).', 'Simplificación')}
      ` })}

      ${E.concept({ id: 'cementeras', title: 'Caso real: cementeras 2024 → 2025', badge: 'in', html: `
        <p>De tu tarea individual (cifras en millones de USD; benchmark = promedio de las 3). La lección no es memorizar números sino <b>leer la calidad de la utilidad</b> antes de comparar.</p>
        <div class="cols"><div>
          ${E.table([
            ['Margen operativo', '10.9% → 11.1%', '18.6% → 15.9%', '13.6% → 13.9%'],
            ['Margen neto', '5.9% → 6.0%', '11.5% → 84.3%*', '8.8% → 9.8%'],
            ['ROA', '3.5% → 3.4%', '5.8% → 37.8%*', '5.4% → 5.7%'],
            ['ROE', '7.7% → 7.1%', '11.2% → 78.9%*', '10.0% → 10.6%'],
            ['Deuda / activos', '54.3% → 52.9%', '48.5% → 52.1%', '46.5% → 46.6%'],
          ], { head: ['2024 → 2025', 'Cemex', 'Holcim', 'Heidelberg'] })}
          <p class="small muted">* Distorsionado por la escisión de Amrize (Holcim).</p>
        </div><div><div class="chart" id="cCem"></div></div></div>
        <div class="g3">
          <div class="card2"><h4>🟢 Heidelberg: mejora "limpia"</h4><p class="small">Única con los 4 indicadores de rentabilidad al alza <b>sin ayudas extraordinarias</b>: utilidad de operaciones continuas ≈ +21% y partidas anormales bajando (≈472 → 101). Más ROE (10.6%) con <b>menos</b> deuda que Cemex.</p></div>
          <div class="card2"><h4>🔴 Cemex: la utilidad neta engaña</h4><p class="small">La utilidad neta casi no cambia, pero la <b>utilidad de operaciones continuas cae ≈56%</b> (≈912 → 404) por deterioros y reestructura. La sostuvo una ganancia de ≈551 por <b>vender República Dominicana</b> y el tipo de cambio. ROE el más bajo.</p></div>
          <div class="card2"><h4>⚠️ Holcim: no comparable</h4><p class="small">En 2025 <b>escindió Norteamérica (Amrize)</b>; esa operación generó una ganancia contable no monetaria enorme → margen neto 84% y ROE 79% son <b>artefactos</b>. Su operación de fondo sí fue buena (margen recurrente récord).</p></div>
        </div>
        ${E.warn('Comparar la <b>utilidad neta</b> sin revisar <b>partidas extraordinarias</b> (ventas de negocios, escisiones, deterioros, tipo de cambio). Antes de comparar años, busca qué es <b>recurrente</b>. El margen <b>operativo</b> suele ser más confiable que el neto.')}
        ${E.tip('Ojo con las <b>pérdidas (o ganancias) anormales</b>: dicen mucho de la <b>eficiencia de la gerencia</b>. Y en una <b>empresa familiar</b> la rentabilidad puede venir "optimizada" a la baja por impuestos (gasto inflado): ahí mira más la eficiencia operativa.', 'Apuntes / clase 23-sep')}
      ` })}

      ${E.reveal('📝 Ejercicio resuelto: todas las razones de rentabilidad', `
        <p><b>Datos:</b> Ventas 10,000; Costo de ventas 6,000; Gastos de operación 2,400; Intereses 400; Impuestos 30%; Activo total 12,000; Patrimonio 6,000.</p>
        <ol>
          <li>Utilidad bruta = 10,000 − 6,000 = 4,000 → <b>margen bruto 40%</b>.</li>
          <li>Utilidad operacional = 4,000 − 2,400 = 1,600 → <b>margen operacional 16%</b> (16 centavos de cada peso).</li>
          <li>Antes de impuestos = 1,600 − 400 = 1,200; impuestos 360; <b>utilidad neta 840</b> → <b>margen neto 8.4%</b>.</li>
          <li><b>ROA</b> = 840 ÷ 12,000 = <b>7%</b>: cada $100 invertidos generan $7.</li>
          <li><b>ROE</b> = 840 ÷ 6,000 = <b>14%</b>: cada $100 del dueño generan $14. Es el doble del ROA porque el dueño puso sólo la mitad (multiplicador 12,000 ÷ 6,000 = 2x).</li>
          <li><b>Interpretación:</b> compárala con el sector. Si el sector tiene margen neto de 10% con margen operacional parecido, el problema está <b>debajo</b> de la utilidad operacional (intereses: mucha deuda o cara).</li>
        </ol>`)}

      ${E.warn('Confundir <b>margen</b> (÷ ventas) con <b>rendimiento</b> (÷ activos o patrimonio). Y en el ROE usar el <b>pasivo</b> en lugar del <b>patrimonio</b>.')}
      ${E.warn('Un ROE alto <b>no siempre</b> es buena gestión: puede venir sólo de mucha deuda (caso Timberland en ' + E.link('dupont', 'DuPont') + '). Por eso existe la descomposición DuPont.')}

      <h2>¿Qué pasa si…?</h2>
      <div id="qz"></div>
      </div>`;

      // ---- moneda
      const BASEM = { v: 10000, cvp: 0.6, go: 2400, int: 400, t: 0.3 };
      const toS = (k) => ({ v: k.v, cv: k.v * k.cvp, go: k.go, int: k.int, t: k.t });
      const r0 = er(toS(BASEM));
      let mon = null, cM = null;
      const fM = root.querySelector('#fMon'), tM = root.querySelector('#tMon'), iM = root.querySelector('#iMon');
      E.knobs(root.querySelector('#kMon'), [
        { k: 'v', label: 'Ventas', min: 4000, max: 16000, step: 100, v: BASEM.v, fmt: '$' },
        { k: 'cvp', label: 'Costo de ventas (% de ventas)', min: 0.3, max: 0.9, step: 0.01, v: BASEM.cvp, fmt: 'pct', dec: 0, hint: 'Variable: crece con las ventas.' },
        { k: 'go', label: 'Gastos de operación (fijos)', min: 500, max: 5000, step: 50, v: BASEM.go, fmt: '$', hint: 'Renta, sueldos de oficina: no cambian con las ventas.' },
        { k: 'int', label: 'Intereses', min: 0, max: 1500, step: 25, v: BASEM.int, fmt: '$' },
        { k: 't', label: 'Tasa de impuestos', min: 0, max: 0.4, step: 0.01, v: BASEM.t, fmt: 'pct', dec: 0 },
      ], (k) => {
        const s = toS(k), r = er(s); mon = { s, r };
        fM.innerHTML = E.fig(moneda(s), 'Cada rebanada es cuántos centavos de cada peso vendido se van en cada cosa.');
        E.tiles(tM, [
          { label: 'Margen bruto', v: r.UB / s.v, fmt: 'pct', base: r0.UB / BASEM.v, better: 'up' },
          { label: 'Margen operacional', v: r.UO / s.v, fmt: 'pct', base: r0.UO / BASEM.v, better: 'up', hl: true },
          { label: 'Margen neto', v: r.UN / s.v, fmt: 'pct', base: r0.UN / BASEM.v, better: 'up', hl: true },
        ]);
        const mn = r.UN / s.v, mn0 = r0.UN / BASEM.v;
        let t = mn < 0 ? `✗ <b>Pérdida</b>: por cada $1 vendido pierdes ${F.n(-mn * 100, 1)} centavos.` : `De cada <b>$1</b> vendido te quedan <b>${F.n(mn * 100, 1)} centavos</b> de utilidad neta y <b>${F.n((r.UO / s.v) * 100, 1)}</b> de utilidad operacional.`;
        if (Math.abs(mn - mn0) > 0.0005) {
          const dV = s.v - BASEM.v, dC = k.cvp - BASEM.cvp, dG = k.go - BASEM.go;
          if (mn < mn0) t += dV < 0 && dC <= 0 ? ' El margen bajó porque las <b>ventas son más bajas</b> y los gastos fijos pesan más.' : dC > 0 ? ' El margen bajó porque los <b>costos son más altos</b> (el costo de ventas se come más de cada peso).' : dG > 0 ? ' El margen bajó por <b>gastos más altos</b>.' : ' El margen bajó: revisa intereses e impuestos (debajo de la utilidad operacional).';
          else t += dV > 0 && dC >= 0 ? ' Subió porque <b>vendes más</b> y los gastos fijos se reparten entre más pesos.' : ' Subió porque <b>bajaste costos o gastos</b>.';
        }
        iM.innerHTML = t;
        cM && cM.refresh();
      }, { title: '🪙 Parte la moneda' });
      cM = E.chart(root.querySelector('#cMon'), (T) => {
        const s = mon.s, r = mon.r, c = (x) => (x / s.v) * 100;
        const steps = [
          ['Ventas', 0, c(s.v), T.axis], ['Costo', c(r.UB), c(s.cv), T.c1], ['U. bruta', 0, c(r.UB), T.axis], ['Gastos', c(r.UO), c(s.go), T.c2],
          ['U. operac.', 0, c(r.UO), T.axis], ['Intereses', c(r.UAI), c(s.int), T.c3], ['Impuestos', c(r.UN), c(r.IMP), T.c4], ['U. neta', 0, c(r.UN), T.c5],
        ];
        // barras flotantes: base transparente + valor (recorta en 0 si hay pérdida)
        const base = steps.map(([, b, v]) => (v >= 0 && b >= 0 ? b : 0));
        const vals = steps.map(([, b, v, col]) => ({ value: b >= 0 ? v : Math.max(0, v + b), itemStyle: { color: col, borderRadius: [4, 4, 0, 0] } }));
        return {
          ...E.baseOpt(T),
          grid: { left: 8, right: 16, top: 24, bottom: 8, containLabel: true },
          legend: { show: false },
          tooltip: { ...E.baseOpt(T).tooltip, formatter: (ps) => { const p = ps.find((x) => x.seriesName === 'centavos'); return p ? `${p.name}: <b>${F.n(steps[p.dataIndex][2], 1)}¢</b> de cada $1` : ''; } },
          xAxis: E.axisCat(steps.map((x) => x[0]), T, { axisLabel: { color: T.ink2, fontSize: 11, interval: 0 } }),
          yAxis: E.axisVal(T, (v) => v + '¢'),
          series: [
            { name: 'base', type: 'bar', stack: 'w', data: base, itemStyle: { color: 'transparent' }, emphasis: { disabled: true }, silent: true },
            { name: 'centavos', type: 'bar', stack: 'w', data: vals, barMaxWidth: 38, label: { show: true, position: 'top', color: T.ink2, fontSize: 11, formatter: (p) => F.n(steps[p.dataIndex][2], 0) } },
          ],
        };
      });

      // ---- apalancamiento: ROA vs ROE
      let lev = null, cL = null;
      const tLv = root.querySelector('#tLev'), iLv = root.querySelector('#iLev');
      const roeOf = (ro, i, d, t) => ((ro - i * d) * (1 - t)) / (1 - d);
      const roaOf = (ro, i, d, t) => (ro - i * d) * (1 - t);
      const L0 = { ro: 0.12, i: 0.08, d: 0.5, t: 0.3 };
      E.knobs(root.querySelector('#kLev'), [
        { k: 'ro', label: 'Rendimiento operativo de los activos (UO ÷ Activos)', min: 0, max: 0.25, step: 0.005, v: L0.ro, fmt: 'pct' },
        { k: 'i', label: 'Tasa de interés de la deuda', min: 0.02, max: 0.25, step: 0.005, v: L0.i, fmt: 'pct' },
        { k: 'd', label: 'Nivel de endeudamiento (Pasivo ÷ Activo)', min: 0, max: 0.85, step: 0.05, v: L0.d, fmt: 'pct', dec: 0 },
        { k: 't', label: 'Tasa de impuestos', min: 0, max: 0.4, step: 0.01, v: L0.t, fmt: 'pct', dec: 0 },
      ], (s) => {
        lev = s;
        const roa = roaOf(s.ro, s.i, s.d, s.t), roe = roeOf(s.ro, s.i, s.d, s.t);
        E.tiles(tLv, [
          { label: 'ROA', v: roa, fmt: 'pct', base: roaOf(L0.ro, L0.i, L0.d, L0.t), better: 'up' },
          { label: 'ROE', v: roe, fmt: 'pct', base: roeOf(L0.ro, L0.i, L0.d, L0.t), better: 'up', hl: true },
          { label: 'Multiplicador A/P', v: 1 / (1 - s.d), fmt: 'x' },
        ]);
        let t;
        if (s.ro > s.i + 1e-9) t = `✓ Tus activos rinden <b>${F.pct(s.ro)}</b> y la deuda cuesta <b>${F.pct(s.i)}</b>: cada peso prestado <b>deja ganancia</b> al dueño. Por eso el ROE (${F.pct(roe)}) es mayor que el ROA (${F.pct(roa)}) y sube con más deuda… junto con el riesgo.`;
        else if (Math.abs(s.ro - s.i) <= 1e-9) t = 'La deuda cuesta exactamente lo que rinden los activos: endeudarte no cambia el ROE (sólo el riesgo).';
        else t = `✗ La deuda cuesta <b>${F.pct(s.i)}</b> y tus activos sólo rinden <b>${F.pct(s.ro)}</b>: cada peso prestado <b>le resta</b> al dueño. Más deuda = ROE más bajo (y puede volverse negativo).`;
        iLv.innerHTML = t;
        cL && cL.refresh();
      }, { title: '⚖️ ¿La deuda le ayuda al dueño?' });
      cL = E.chart(root.querySelector('#cLev'), (T) => {
        const xs = []; for (let d = 0; d <= 0.851; d += 0.05) xs.push(+d.toFixed(2));
        const s = lev;
        return {
          ...E.baseOpt(T),
          tooltip: { ...E.baseOpt(T).tooltip, axisPointer: { type: 'line', lineStyle: { color: T.axis } }, valueFormatter: (v) => F.pct(v) },
          xAxis: E.axisCat(xs.map((d) => F.pct(d, 0)), T, { name: 'Nivel de endeudamiento', nameLocation: 'middle', nameGap: 26, nameTextStyle: { color: T.muted, fontSize: 11 }, axisLabel: { color: T.ink2, fontSize: 11, interval: 2 } }),
          yAxis: E.axisVal(T, (v) => F.pct(v, 0)),
          grid: { left: 8, right: 16, top: 30, bottom: 28, containLabel: true },
          series: [
            { name: 'ROA', type: 'line', data: xs.map((d) => roaOf(s.ro, s.i, d, s.t)), lineStyle: { width: 2, color: T.c1 }, itemStyle: { color: T.c1 }, symbolSize: 6 },
            { name: 'ROE', type: 'line', data: xs.map((d) => roeOf(s.ro, s.i, d, s.t)), lineStyle: { width: 2, color: T.c2 }, itemStyle: { color: T.c2 }, symbolSize: 6,
              markPoint: { symbol: 'circle', symbolSize: 12, itemStyle: { color: T.c2, borderColor: T.card, borderWidth: 2 }, label: { show: true, position: 'top', color: T.ink, formatter: 'tú' }, data: [{ coord: [Math.round(s.d / 0.05), roeOf(s.ro, s.i, s.d, s.t)] }] } },
          ],
        };
      });

      // ---- cementeras: margen operativo
      E.chart(root.querySelector('#cCem'), (T) => ({
        ...E.baseOpt(T),
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.pct(v) },
        xAxis: E.axisCat(['Cemex', 'Holcim', 'Heidelberg'], T),
        yAxis: E.axisVal(T, (v) => F.pct(v, 0)),
        title: { text: 'Margen operativo (el más confiable aquí)', right: 0, top: 0, textStyle: { color: T.muted, fontSize: 12, fontWeight: 'normal' } },
        series: [
          { name: '2024', type: 'bar', data: [0.109, 0.186, 0.136], itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 34 },
          { name: '2025', type: 'bar', data: [0.111, 0.159, 0.139], itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 34 },
        ],
      }));

      E.quiz(root.querySelector('#qz'), [
        { q: 'Tu margen neto es 2.5% y el de la competencia 5%. ¿Qué preguntas te haces?', o: ['¿Tengo mucho efectivo?', '¿Mis ventas son muy bajas o mis costos muy altos?', '¿Mi rotación de inventarios es alta?'], a: 1, w: 'Margen neto = UN ÷ Ventas: o el numerador es chico por costos, o el denominador no da escala.' },
        { q: 'Vendes un edificio improductivo y la utilidad neta no cambia. ¿Qué pasa con el ROA?', o: ['Sube: misma utilidad con menos inversión', 'Baja', 'No cambia'], a: 0, w: 'Es el primero de los dos caminos para mejorar el ROA.' },
        { q: 'Dos empresas tienen el mismo ROA de 6%. A tiene ROE 6% y B ROE 15%. ¿Por qué?', o: ['B tiene mejor margen', 'B usa más deuda (multiplicador ≈2.5x); A no tiene deuda', 'A tiene más ventas'], a: 1, w: 'ROE = ROA × Activos/Patrimonio. La diferencia es el apalancamiento.' },
        { q: 'La utilidad neta de Cemex 2025 casi no cambió. ¿Significa que su operación estuvo igual?', o: ['Sí', 'No: la utilidad de operaciones continuas cayó y una venta de activos (R. Dominicana) sostuvo la UN', 'No se puede saber'], a: 1, w: 'Siempre separa lo recurrente de lo extraordinario.' },
      ]);
    },
  });

  // ================================================================ DuPont: árbol dinámico
  const DUP0 = { v: 10000, cv: 6000, go: 2400, int: 400, t: 0.3, ac: 4000, af: 8000, p: 6000 };
  const dup = (s) => {
    const r = er(s); const A = s.ac + s.af, Pat = A - s.p;
    const mn = r.UN / s.v, rat = s.v / A, roa = r.UN / A, mult = Pat > 0 ? A / Pat : null, roe = Pat > 0 ? r.UN / Pat : null;
    return { ...r, A, Pat, mn, rat, roa, mult, roe };
  };
  const sem = (v, meta) => (!ok(v) || !ok(meta) ? null : v >= meta - 1e-9 ? 'good' : v >= meta * (meta >= 0 ? 0.9 : 1.1) ? 'yel' : 'bad');
  const SEMC = { good: ['fgood', 'sgood', '✓'], yel: ['fyel', 'syel', '!'], bad: ['fbad', 'sbad', '✗'] };

  function nodo(cx, y, w, h, title, val, st, sub) {
    const x = cx - w / 2; const c = st ? SEMC[st] : null;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="bd ${c ? c[1] : ''}" style="stroke-width:${c ? 2.5 : 1.5}"/>
      <text x="${cx}" y="${y + 20}" text-anchor="middle" font-size="13" class="t2">${title}</text>
      <text x="${cx}" y="${y + 42}" text-anchor="middle" font-size="19" font-weight="800">${val}</text>
      ${sub ? `<text x="${cx}" y="${y + h + 14}" text-anchor="middle" font-size="11" class="tm">${sub}</text>` : ''}
      ${c ? `<circle cx="${x + w - 12}" cy="${y + 12}" r="9" class="${c[0]}"/><text x="${x + w - 12}" y="${y + 16}" text-anchor="middle" font-size="12" font-weight="800" class="tw">${c[2]}</text>` : ''}</g>`;
  }
  function panel(x, y, w, title, rows) {
    const h = 38 + rows.length * 22;
    return `<g><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" class="bd"/>
      <text x="${x + 12}" y="${y + 22}" font-size="13" font-weight="700">${title}</text>
      ${rows.map(([lb, v, chg, tot], i) => `<text x="${x + 12}" y="${y + 44 + i * 22}" font-size="13" class="${tot ? '' : 't2'}" ${tot || chg ? 'font-weight="700"' : ''}>${chg ? '✎ ' : ''}${lb}</text><text x="${x + w - 12}" y="${y + 44 + i * 22}" text-anchor="end" font-size="13" ${tot || chg ? 'font-weight="700"' : ''}>${v}</text>${tot ? `<line x1="${x + 10}" y1="${y + 29 + i * 22}" x2="${x + w - 10}" y2="${y + 29 + i * 22}" class="lnm"/>` : ''}`).join('')}</g>`;
  }
  const edge = (x1, y1, x2, y2) => { const m = (y1 + y2) / 2; return `<path d="M${x1} ${y1} V${m} H${x2} V${y2}" class="lnm"/>`; };

  function arbol(s, base, meta) {
    const d = dup(s), b = dup(base);
    const ch = (k) => Math.abs(s[k] - base[k]) > 1e-9;
    const $ = (v) => F.$(v);
    const negPat = !(d.Pat > 0);
    return `<svg class="ill" viewBox="0 0 900 508" role="img" aria-label="Árbol DuPont: ROE ${ok(d.roe) ? F.pct(d.roe) : 'no calculable'} = ROA ${F.pct(d.roa)} × multiplicador ${ok(d.mult) ? F.x(d.mult) : '—'}; ROA = margen neto ${F.pct(d.mn)} × rotación ${F.x(d.rat)}">
      <rect x="8" y="276" width="300" height="226" rx="14" class="w1"/>
      <rect x="314" y="276" width="578" height="226" rx="14" class="w3"/>
      <text x="158" y="494" text-anchor="middle" font-size="12" font-weight="700" class="t2">LADO IZQUIERDO · OPERACIÓN (resultados)</text>
      <text x="603" y="494" text-anchor="middle" font-size="12" font-weight="700" class="t2">LADO DERECHO · INVERSIÓN (activos y cómo se financian)</text>
      ${edge(450, 70, 290, 106)}${edge(450, 70, 725, 106)}
      ${edge(290, 160, 160, 196)}${edge(290, 160, 430, 196)}
      ${edge(160, 250, 160, 286)}${edge(430, 250, 430, 286)}${edge(740, 182, 740, 286)}
      ${nodo(450, 12, 200, 58, 'ROE', ok(d.roe) ? F.pct(d.roe) : 'n/c', ok(d.roe) ? sem(d.roe, meta) : 'bad', 'meta ' + F.pct(meta))}
      <text x="512" y="142" text-anchor="middle" font-size="22" font-weight="800" class="t2">×</text>
      ${nodo(290, 106, 170, 54, 'ROA', F.pct(d.roa), sem(d.roa, b.roa))}
      ${nodo(725, 106, 210, 54, 'Apalancamiento (A ÷ P)', ok(d.mult) ? F.x(d.mult) : 'n/c', null, ok(d.mult) && ok(b.mult) && d.mult > b.mult + 1e-9 ? 'más palanca: más ROE y más riesgo' : 'sin semáforo: no es "mejor" por sí solo')}
      <text x="295" y="232" text-anchor="middle" font-size="22" font-weight="800" class="t2">×</text>
      ${nodo(160, 196, 170, 54, 'Margen neto', F.pct(d.mn), sem(d.mn, b.mn))}
      ${nodo(430, 196, 170, 54, 'Rotación de activos', F.x(d.rat), sem(d.rat, b.rat))}
      ${panel(20, 286, 276, 'Utilidad neta ÷ Ventas', [
        ['Ventas', $(s.v), ch('v')], ['− Costo de ventas', $(s.cv), ch('cv')], ['− Gastos de operación', $(s.go), ch('go')],
        ['= Utilidad operacional', $(d.UO), false, true], ['− Intereses', $(s.int), ch('int')], ['− Impuestos (' + F.pct(s.t, 0) + ')', $(d.IMP), ch('t')], ['= Utilidad neta', $(d.UN), false, true],
      ])}
      ${panel(326, 286, 208, 'Ventas ÷ Activo total', [
        ['Ventas', $(s.v), ch('v')], ['Activo corriente', $(s.ac), ch('ac')], ['Activo fijo', $(s.af), ch('af')], ['= Activo total', $(d.A), false, true],
      ])}
      ${panel(600, 286, 280, 'Activo total ÷ Patrimonio', [
        ['Activo total', $(d.A), ch('ac') || ch('af')], ['− Pasivo (deuda)', $(s.p), ch('p')], ['= Patrimonio', $(d.Pat), false, true],
      ])}
      ${negPat ? '<text x="740" y="440" text-anchor="middle" font-size="12" font-weight="700" class="t2">⚠ patrimonio ≤ 0: ROE no calculable</text>' : '<text x="740" y="440" text-anchor="middle" font-size="12" class="tm">patrimonio = lo que queda (A − P)</text>'}
    </svg>`;
  }

  // tres palancas (estático)
  const palancas = `<svg class="ill" viewBox="0 0 900 250" role="img" aria-label="ROE es margen neto por rotación de activos por apalancamiento">
    <path d="M30 40 V28 H560 V40" class="ln"/><text x="295" y="20" text-anchor="middle" font-size="14" font-weight="700">= ROA (rendimiento del activo)</text>
    <rect x="20" y="50" width="250" height="120" rx="16" class="w5"/><text x="145" y="84" text-anchor="middle" font-size="28">💰</text>
    <text x="145" y="112" text-anchor="middle" font-size="17" font-weight="700">Margen neto</text><text x="145" y="134" text-anchor="middle" font-size="14" class="t2">Utilidad neta ÷ Ventas</text><text x="145" y="156" text-anchor="middle" font-size="13" class="tm">¿cuánto me queda de cada venta?</text>
    <text x="295" y="118" text-anchor="middle" font-size="30" font-weight="800">×</text>
    <rect x="320" y="50" width="250" height="120" rx="16" class="w3"/><text x="445" y="84" text-anchor="middle" font-size="28">🔄</text>
    <text x="445" y="112" text-anchor="middle" font-size="17" font-weight="700">Rotación de activos</text><text x="445" y="134" text-anchor="middle" font-size="14" class="t2">Ventas ÷ Activos totales</text><text x="445" y="156" text-anchor="middle" font-size="13" class="tm">¿cuántas veces "vendo" mi inversión?</text>
    <text x="595" y="118" text-anchor="middle" font-size="30" font-weight="800">×</text>
    <rect x="620" y="50" width="260" height="120" rx="16" class="w2"/><text x="750" y="84" text-anchor="middle" font-size="28">🏗️</text>
    <text x="750" y="112" text-anchor="middle" font-size="17" font-weight="700">Apalancamiento</text><text x="750" y="134" text-anchor="middle" font-size="14" class="t2">Activos totales ÷ Patrimonio</text><text x="750" y="156" text-anchor="middle" font-size="13" class="tm">¿cuánta inversión mueve cada $1 del dueño?</text>
    <rect x="300" y="196" width="300" height="44" rx="22" class="f5"/><text x="450" y="224" text-anchor="middle" font-size="17" font-weight="800" class="tw">= ROE (rendimiento del patrimonio)</text>
  </svg>`;

  const PRESETS = {
    joya: { n: '💎 Joyería', mn: 0.15, rat: 0.5, mult: 2.0 },
    super: { n: '🛒 Supermercado', mn: 0.025, rat: 3.0, mult: 2.0 },
    apal: { n: '🏗️ Apalancada (Timberland / recompras)', mn: 0.05, rat: 1.0, mult: 3.0 },
  };
  const REF = { mn: 0.06, rat: 1.0, mult: 2.0 };
  const LEVN = { mn: 'su <b>margen</b> (gana mucho en cada venta)', rat: 'su <b>rotación</b> (vende muchas veces su inversión al año)', mult: 'su <b>apalancamiento</b> (mucha deuda por cada peso del dueño)' };

  E.section({
    id: 'dupont', n: 6.5, group: 'razones', icon: '🌳', short: 'DuPont', exam: 'in',
    title: 'DuPont: ¿de dónde sale tu ROE?',
    lead: 'ROE = margen neto × rotación de activos × apalancamiento. No es una fórmula para calcular: es una metodología para gestionar, bajando del indicador global hasta la última cuenta.',
    render(root) {
      root.innerHTML = `
      <style>.sx-dup .ill .fyel{fill:#d4a017}.sx-dup .ill .syel{stroke:#d4a017}.sx-dup .interp{font-size:15px;line-height:1.5;margin-top:10px;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line)}
        .sx-dup .tree-wrap{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:18px;align-items:start}@media(max-width:1100px){.sx-dup .tree-wrap{grid-template-columns:1fr}}
        .sx-dup .knobs{gap:8px}.sx-dup .mini{height:200px}</style>
      <div class="sx-dup">
      ${E.fig(palancas, 'Tres palancas. Las dos primeras juntas son el ROA; la tercera es la deuda.', true)}
      <div class="cols" style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;max-width:1180px">
        <div>
          ${E.formula('DuPont', 'ROE', E.frac('Utilidad neta', '<s>Ventas</s>') + ' × ' + E.frac('<s>Ventas</s>', '<s>Activos totales</s>') + ' × ' + E.frac('<s>Activos totales</s>', 'Patrimonio'), 'las ventas y los activos se cancelan → queda UN ÷ Patrimonio')}
          ${E.formula('', 'ROA', 'Margen neto × Rotación de activos totales', '= UN ÷ Activos')}
          ${E.formula('', 'ROE', 'ROA × Apalancamiento patrimonial (Activos ÷ Patrimonio)')}
        </div>
        <div>
          ${E.tip('<q>Cuando hablen de DuPont, no es en sí la fórmula, es la metodología.</q> <q>Usted utiliza la fórmula para gestionar.</q>', 'Clase 28-sep')}
          ${E.kid('Tu ROE es como la calificación final de la boleta. DuPont te dice <b>de qué materia</b> viene: ¿de ganar mucho por cada venta (margen), de vender muchísimo con poca tienda (rotación) o de usar mucho dinero prestado (apalancamiento)? Así sabes <b>qué estudiar</b> para subirla.')}
        </div>
      </div>
      <p class="prose">La metodología es de la química <b>DuPont (≈1919)</b> y casi no ha cambiado: <q>la fórmula base para cualquier proceso de consultoría</q>. Se baja <b>del indicador global → a sus componentes → a las cuentas → a los procesos</b>, y luego se sube para ver el impacto. El <b>lado izquierdo</b> (utilidad y ventas) es la <b>operación</b>; el <b>lado derecho</b> (activos y patrimonio) es la <b>inversión</b>.</p>

      <h2 id="arbol">🌳 El árbol DuPont en vivo</h2>
      <p class="prose">Cada perilla es una <b>cuenta</b> (una hoja del árbol). Muévela y mira cómo se recalculan todos los nodos hacia arriba. El semáforo funciona como un <b>Cuadro de Mando</b>: el ROE se compara contra tu <b>meta</b>; margen, rotación y ROA contra el <b>presupuesto</b> (los valores iniciales). Verde = cumple; amarillo = hasta 10% abajo (explica por qué); rojo = más abajo (decide o escala).</p>
      <div class="concept">
        <div class="tree-wrap">
          <div>
            <div id="fTree"></div>
            <div class="interp" id="iMotor"></div>
            <div class="btnrow" id="bSens">
              <button class="btn" type="button" data-sc="cv">Costo de ventas −5%</button>
              <button class="btn" type="button" data-sc="v">Ventas +5%</button>
              <button class="btn" type="button" data-sc="ac">Cobrar/rotar más rápido: activo corriente −10%</button>
              <button class="btn" type="button" data-sc="p">Recomprar acciones con +10% de deuda</button>
            </div>
            <div class="cols"><div><h4 style="margin:6px 0 0">¿Qué palanca movió el ROE?</h4><div class="chart h220" id="cMotor"></div></div>
            <div><h4 style="margin:6px 0 0">Sensibilidad: mejora 5% una cuenta</h4><div class="chart h220" id="cSens"></div></div></div>
          </div>
          <div>
            <div id="kMeta"></div>
            <div id="kTree" style="margin-top:10px"></div>
          </div>
        </div>
        ${E.note('En este árbol el <b>patrimonio es lo que queda</b> (Activo − Pasivo). Si bajas activos sin tocar la deuda, es como <b>devolver esa caja a los dueños</b> (dividendo o recompra); si subes la deuda sin cambiar activos, es como <b>recomprar acciones con deuda</b>. Los intereses no se mueven solos con la deuda: ajústalos tú.', 'Cómo leer el modelo')}
      </div>

      ${E.concept({ id: 'comparador', title: 'Mismo ROE, caminos distintos', badge: 'in', html: `
        <p>Tres empresas con <b>ROE ≈ 15%</b>. Una joyería gana mucho por pieza pero rota lento; un supermercado gana centavos por venta pero rota muchísimo; una tercera lo saca de la <b>deuda</b>. Carga un ejemplo en A o B, o mueve sus perillas.</p>
        <div class="btnrow" id="bPre"></div>
        <div class="cols"><div><div id="kA"></div></div><div><div id="kB"></div></div></div>
        <div id="tAB" style="margin-top:12px"></div>
        <div class="g3"><div class="chart mini" id="cP1"></div><div class="chart mini" id="cP2"></div><div class="chart mini" id="cP3"></div></div>
        <div class="interp" id="iAB"></div>
        ${E.key('Según Desai, el <b>ROE se parece mucho entre industrias</b> (compiten por el mismo capital), mientras que margen y rotación varían muchísimo: Food Lion gana rotando inventario con margen ≈ 2.7%; Intel gana con margen altísimo. Y el <b>apalancamiento suele ser inverso al riesgo del negocio</b>: una eléctrica regulada usa mucha deuda; una tecnológica, poca. No apiles riesgo financiero sobre riesgo de negocio.', 'Lectura: How Finance Works')}
      ` })}

      ${E.concept({ id: 'casos-dupont', title: 'Casos: Timberland, Apple y Cemex', badge: 'in', html: `
        <div class="g3">
          <div class="card2"><h4>👢 Timberland (1994–98)</h4><p class="small">ROE ≈ 11.9% vs. industria ≈ 12.3%: <b>parecía bien</b>. DuPont reveló que venía del <b>apalancamiento</b>, no de margen ni rotación; cobertura de intereses &lt; 3 y en 1995 &lt; 1: casi quiebra. Se salvó liquidando inventario, cobrando más rápido y luego subiendo <b>margen</b>: el ROE pasó a venir del lugar correcto.</p></div>
          <div class="card2"><h4>🍎 Apple y las recompras</h4><p class="small">Un activista (Carl Icahn) presionó a Apple para <b>devolver su enorme caja</b> recomprando acciones. Menos caja y menos patrimonio → el multiplicador sube y el ROE también, sin cambiar la operación. Recomprar caro puede dejar <b>patrimonio negativo</b> en empresas sanas.</p></div>
          <div class="card2"><h4>🏗️ Cemex 2024 (Excel en clase)</h4><p class="small">Margen neto ≈ <b>5.92%</b> × rotación ≈ <b>0.59</b> = ROA ≈ <b>3.51%</b>; × apalancamiento 27,299 ÷ patrimonio ≈ <b>2.19</b> = ROE ≈ <b>7.7%</b>. <q>Un dólar de patrimonio apalanca 2.19 de inversión.</q></p></div>
        </div>
        ${E.tip('En Excel arma el árbol formulando <b>cada nivel con el de abajo</b>: <q>Si una cifra cambia… estoy haciendo algo mal.</q> Luego pega las cuentas base como valores y haz sensibilidad: en Cemex, si una tecnología bajara <b>1,000 MDD</b> el costo de producción, el ROE subía <b>casi al doble</b>.', 'Clase 28-sep')}
        ${E.tip('El <b>Balanced Scorecard</b> (Cuadro de Mando Integral) <q>es simplemente que usted hace eso y le pone colorcitos</q>: metas con semáforo. Las metas del árbol se vuelven <b>KPIs</b> por división, proceso o responsable; quien está en amarillo/rojo explica, decide o escala.', 'Clase 28-sep')}
        ${E.note('La transcripción de clase dice algo como "36.8" para el ROE de Cemex, pero con ROA 3.51% × 2.19 da ≈ 7.7%, que coincide con la tabla de razones 2024. Usa la lógica, no el número dictado.', 'Cifra dudosa')}
      ` })}

      ${E.reveal('📝 Ejercicio resuelto: DuPont paso a paso', `
        <p><b>Datos:</b> Ventas 10,000; Utilidad neta 840; Activo total 12,000; Patrimonio 6,000. Sector: margen 6%, rotación 1.5x, apalancamiento 1.5x.</p>
        <ol>
          <li><b>Margen neto</b> = 840 ÷ 10,000 = <b>8.4%</b> (sector 6%: mejor).</li>
          <li><b>Rotación de activos</b> = 10,000 ÷ 12,000 = <b>0.83x</b> (sector 1.5x: peor; hay mucha inversión para lo que vende).</li>
          <li><b>ROA</b> = 8.4% × 0.83 = <b>7%</b> (sector 6% × 1.5 = 9%: peor).</li>
          <li><b>Apalancamiento</b> = 12,000 ÷ 6,000 = <b>2x</b> (sector 1.5x: más deuda).</li>
          <li><b>ROE</b> = 7% × 2 = <b>14%</b> (sector 9% × 1.5 = 13.5%). Comprobación: 840 ÷ 6,000 = 14% ✓.</li>
          <li><b>Interpretación:</b> el ROE parece igual o mejor que el sector, pero <b>viene de la deuda</b>, no de usar bien los activos. La palanca a trabajar es la <b>rotación</b>: vender activos improductivos, bajar inventario y cuentas por cobrar.</li>
        </ol>`)}

      ${E.warn('Escribir sólo "ROE = 14%". El profe quiere la <b>lógica</b>: qué palanca lo explica y comparada contra qué (año anterior o sector).')}
      ${E.warn('Creer que más apalancamiento es "mejor gestión". Sube el ROE pero también el riesgo (Timberland). Y ojo: <b>el patrimonio negativo</b> no siempre es quiebra; puede venir de recompras.')}

      <h2>¿Qué pasa si…?</h2>
      <div id="qz"></div>
      </div>`;

      // ---------------- árbol
      let meta = 0.15, cur = null, kT = null, cMot = null, cSen = null, motor = [0, 0, 0], sens = [];
      const fTree = root.querySelector('#fTree'), iMot = root.querySelector('#iMotor');
      const d0 = dup(DUP0);
      const SCN = [
        ['Ventas +5% (mismo margen bruto)', (s) => ({ ...s, v: s.v * 1.05, cv: s.cv * 1.05 })],
        ['Costo de ventas −5%', (s) => ({ ...s, cv: s.cv * 0.95 })],
        ['Gastos de operación −5%', (s) => ({ ...s, go: s.go * 0.95 })],
        ['Intereses −5%', (s) => ({ ...s, int: s.int * 0.95 })],
        ['Activo corriente −5% (devuelves caja)', (s) => ({ ...s, ac: s.ac * 0.95 })],
        ['Activo fijo −5% (vendes improductivo)', (s) => ({ ...s, af: s.af * 0.95 })],
        ['Deuda +5% (recompra)', (s) => ({ ...s, p: s.p * 1.05 })],
      ];
      const draw = () => {
        if (!cur) return;
        const d = dup(cur);
        fTree.innerHTML = E.fig(arbol(cur, DUP0, meta), '');
        // motor principal (descomposición logarítmica del cambio de ROE vs presupuesto)
        let t = '';
        if (!ok(d.roe) || d.UN <= 0) {
          motor = [0, 0, 0];
          t = d.UN <= 0 ? '✗ Con utilidad neta negativa no hay "motor": la empresa destruye valor para el dueño. Revisa costos y gastos (lado izquierdo).' : '⚠ El patrimonio es cero o negativo: el ROE no tiene sentido (puede pasar con recompras muy grandes, como en algunas empresas sanas).';
        } else {
          const lm = Math.log(d.mn / d0.mn), lr = Math.log(d.rat / d0.rat), ll = Math.log(d.mult / d0.mult), lt = lm + lr + ll;
          const dROE = d.roe - d0.roe;
          motor = Math.abs(lt) > 1e-9 ? [lm, lr, ll].map((x) => (dROE * x) / lt) : [0, 0, 0];
          const st = sem(d.roe, meta);
          const head = `${st === 'good' ? '✓' : st === 'yel' ? '!' : '✗'} ROE <b>${F.pct(d.roe)}</b> = margen ${F.pct(d.mn)} × rotación ${F.x(d.rat)} × apalancamiento ${F.x(d.mult)} (meta ${F.pct(meta)}: ${st === 'good' ? 'cumple' : st === 'yel' ? 'abajo de la meta, hay que explicar por qué' : 'muy abajo: decidir o escalar'}).`;
          if (Math.abs(dROE) < 1e-6 && [lm, lr, ll].every((x) => Math.abs(x) < 1e-9)) t = head + ' Estás en el presupuesto: mueve una cuenta y te digo qué palanca la explica.';
          else if (Math.abs(lt) < 1e-6) t = head + ' Las palancas <b>se compensaron</b>: el ROE no cambió aunque sí cambiaron sus piezas.';
          else {
            const names = ['el margen neto (operación)', 'la rotación de activos (inversión)', 'el apalancamiento (financiamiento)'];
            const i = [0, 1, 2].reduce((a, b) => (Math.abs(motor[b]) > Math.abs(motor[a]) ? b : a), 0);
            t = head + ` Vs. el presupuesto el ROE ${dROE >= 0 ? 'sube' : 'baja'} <b>${F.n(Math.abs(dROE) * 100, 1)} puntos</b>; el <b>motor principal</b> es ${names[i]} (${F.sgn(motor[i] * 100, 1)} pts).`;
          }
        }
        iMot.innerHTML = t;
        // sensibilidad
        sens = ok(d.roe) ? SCN.map(([n, f]) => { const r = dup(f(cur)); return [n, ok(r.roe) ? (r.roe - d.roe) * 100 : 0]; }) : SCN.map(([n]) => [n, 0]);
        cMot && cMot.refresh(); cSen && cSen.refresh();
      };
      E.knobs(root.querySelector('#kMeta'), [{ k: 'meta', label: '🎯 Meta de ROE', min: 0.05, max: 0.3, step: 0.005, v: 0.15, fmt: 'pct' }], (s) => { meta = s.meta; draw(); }, { title: 'Cuadro de mando' });
      kT = E.knobs(root.querySelector('#kTree'), [
        { k: 'v', label: 'Ventas', min: 4000, max: 20000, step: 100, v: DUP0.v, fmt: '$' },
        { k: 'cv', label: 'Costo de ventas', min: 2000, max: 14000, step: 100, v: DUP0.cv, fmt: '$' },
        { k: 'go', label: 'Gastos de operación', min: 500, max: 5000, step: 50, v: DUP0.go, fmt: '$' },
        { k: 'int', label: 'Intereses', min: 0, max: 1500, step: 25, v: DUP0.int, fmt: '$' },
        { k: 't', label: 'Tasa de impuestos', min: 0, max: 0.4, step: 0.01, v: DUP0.t, fmt: 'pct', dec: 0 },
        { k: 'ac', label: 'Activo corriente', min: 1000, max: 10000, step: 100, v: DUP0.ac, fmt: '$' },
        { k: 'af', label: 'Activo fijo', min: 2000, max: 16000, step: 100, v: DUP0.af, fmt: '$' },
        { k: 'p', label: 'Pasivo (deuda)', min: 0, max: 14000, step: 100, v: DUP0.p, fmt: '$' },
      ], (s) => { cur = s; draw(); }, { title: '🍃 Hojas del árbol (cuentas)' });
      cMot = E.chart(root.querySelector('#cMotor'), (T) => ({
        ...E.baseOpt(T),
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.sgn(v * 100, 2) + ' pts' },
        xAxis: E.axisCat(['Margen', 'Rotación', 'Apalanc.'], T),
        legend: { show: false },
        yAxis: E.axisVal(T, (v) => F.n(v * 100, 1), { min: (v) => Math.min(v.min, -0.005), max: (v) => Math.max(v.max, 0.005) }),
        series: [{ name: 'Puntos de ROE vs presupuesto', type: 'bar', data: motor, itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 40, label: { show: true, position: 'top', color: T.ink2, fontSize: 11, formatter: (p) => (p.value > 0 ? '▲ ' : p.value < 0 ? '▼ ' : '') + F.n(Math.abs(p.value) * 100, 1) } }],
      }));
      cSen = E.chart(root.querySelector('#cSens'), (T) => ({
        ...E.baseOpt(T),
        grid: { left: 8, right: 40, top: 10, bottom: 8, containLabel: true },
        legend: { show: false },
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.sgn(v, 2) + ' pts de ROE' },
        yAxis: E.axisCat(sens.map((x) => x[0]), T, { inverse: true, axisLabel: { color: T.ink2, fontSize: 11, interval: 0, width: 170, overflow: 'truncate' } }),
        xAxis: E.axisVal(T, (v) => F.n(v, 1)),
        series: [{ name: 'Cambio en ROE (pts)', type: 'bar', data: sens.map((x) => x[1]), itemStyle: { color: T.c2, borderRadius: [0, 4, 4, 0] }, barMaxWidth: 16, label: { show: true, position: 'right', color: T.ink2, fontSize: 11, formatter: (p) => F.sgn(p.value, 1) } }],
      }));
      root.querySelectorAll('#bSens button').forEach((b) => b.addEventListener('click', () => {
        const s = kT.get(); const sc = b.dataset.sc;
        const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
        if (sc === 'cv') kT.set({ cv: clamp(s.cv * 0.95, 2000, 14000) });
        if (sc === 'v') kT.set({ v: clamp(s.v * 1.05, 4000, 20000), cv: clamp(s.cv * 1.05, 2000, 14000) });
        if (sc === 'ac') kT.set({ ac: clamp(s.ac * 0.9, 1000, 10000) });
        if (sc === 'p') kT.set({ p: clamp(s.p * 1.1, 0, 14000) });
      }));

      // ---------------- comparador A vs B
      let A = null, B = null, kA = null, kB = null; const cs = [];
      const tAB = root.querySelector('#tAB'), iAB = root.querySelector('#iAB');
      const domi = (x) => { const sc = { mn: Math.log(x.mn / REF.mn), rat: Math.log(x.rat / REF.rat), mult: Math.log(x.mult / REF.mult) }; return Object.keys(sc).reduce((a, b) => (sc[b] > sc[a] ? b : a), 'mn'); };
      const upd = () => {
        if (!A || !B) return;
        const ra = A.mn * A.rat, rb = B.mn * B.rat, ea = ra * A.mult, eb = rb * B.mult;
        E.tiles(tAB, [
          { label: 'A · ROA', v: ra, fmt: 'pct' }, { label: 'A · ROE', v: ea, fmt: 'pct', hl: true },
          { label: 'B · ROA', v: rb, fmt: 'pct' }, { label: 'B · ROE', v: eb, fmt: 'pct', hl: true },
        ]);
        const da = domi(A), db = domi(B);
        let t = `A obtiene su ROE de <b>${F.pct(ea)}</b> sobre todo por ${LEVN[da]}; B obtiene <b>${F.pct(eb)}</b> sobre todo por ${LEVN[db]}.`;
        t += Math.abs(ea - eb) < 0.005 ? ' <b>Mismo ROE, caminos distintos</b>: por eso el ROE solo no basta.' : ` ${ea > eb ? 'A' : 'B'} tiene mejor ROE por ${F.n(Math.abs(ea - eb) * 100, 1)} puntos.`;
        if (da === 'mult' || db === 'mult') t += ' ⚠ Un ROE que viene de la deuda es <b>más frágil</b>: si las ventas caen, la cobertura de intereses sufre (Timberland).';
        iAB.innerHTML = t;
        cs.forEach((c) => c.refresh());
      };
      const kdefs = (p) => [
        { k: 'mn', label: 'Margen neto', min: 0.005, max: 0.3, step: 0.005, v: p.mn, fmt: 'pct' },
        { k: 'rat', label: 'Rotación de activos', min: 0.2, max: 4, step: 0.05, v: p.rat, fmt: 'x' },
        { k: 'mult', label: 'Apalancamiento (A ÷ P)', min: 1, max: 6, step: 0.1, v: p.mult, fmt: 'x' },
      ];
      kA = E.knobs(root.querySelector('#kA'), kdefs(PRESETS.joya), (s) => { A = s; upd(); }, { title: 'Empresa A' });
      kB = E.knobs(root.querySelector('#kB'), kdefs(PRESETS.super), (s) => { B = s; upd(); }, { title: 'Empresa B' });
      const bp = root.querySelector('#bPre');
      Object.entries(PRESETS).forEach(([id, p]) => {
        ['A', 'B'].forEach((w) => {
          const b = E.el(`<button class="btn sm" type="button">${w} = ${p.n}</button>`);
          b.addEventListener('click', () => (w === 'A' ? kA : kB).set({ mn: p.mn, rat: p.rat, mult: p.mult }));
          bp.appendChild(b);
        });
      });
      [['mn', 'Margen neto', (v) => F.pct(v)], ['rat', 'Rotación de activos', (v) => F.x(v)], ['mult', 'Apalancamiento', (v) => F.x(v)]].forEach(([k, name, fmt], i) => {
        cs.push(E.chart(root.querySelector('#cP' + (i + 1)), (T) => ({
          ...E.baseOpt(T),
          title: { text: name, left: 0, top: 0, textStyle: { color: T.ink, fontSize: 13, fontWeight: 600 } },
          grid: { left: 8, right: 10, top: 34, bottom: 8, containLabel: true },
          tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: fmt },
          xAxis: E.axisCat(['Empresa A', 'Empresa B'], T),
          yAxis: E.axisVal(T, (v) => (k === 'mn' ? F.pct(v, 0) : F.n(v, 1))),
          series: [{ name, type: 'bar', barMaxWidth: 44, data: [{ value: A[k], itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] } }, { value: B[k], itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] } }], label: { show: true, position: 'top', color: T.ink2, fontSize: 11, formatter: (p) => fmt(p.value) } }],
        })));
      });

      E.quiz(root.querySelector('#qz'), [
        { q: 'Una empresa tiene margen 2%, rotación 3x y apalancamiento 2x. ¿Cuál es su ROE?', o: ['7%', '12%', '6%'], a: 1, w: '2% × 3 = 6% (ROA) × 2 = 12%.' },
        { q: 'El ROE de tu empresa iguala al del sector, pero tu margen y rotación son peores. ¿De dónde sale?', o: ['De más apalancamiento (deuda)', 'De más ventas', 'De la tasa de impuestos'], a: 0, w: 'Si margen × rotación (ROA) es menor, sólo el multiplicador A/P puede compensar. Es el caso Timberland.' },
        { q: 'Bajas 5% el costo de ventas sin tocar nada más. ¿Qué nodos cambian?', o: ['Sólo el margen neto', 'Utilidad neta → margen neto → ROA → ROE (rotación y apalancamiento no)', 'Todos, incluida la rotación'], a: 1, w: 'El costo está del lado izquierdo (operación): sube la utilidad y de ahí hacia arriba.' },
        { q: 'Según el profe, ¿para qué sirve DuPont?', o: ['Para calcular el ROE más rápido', 'Para gestionar: saber qué palanca mover y convertir metas en KPIs', 'Sólo para empresas químicas'], a: 1, w: '"No es la fórmula, es la metodología… para gestionar."' },
      ]);
    },
  });
})();
