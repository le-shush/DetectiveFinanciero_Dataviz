// Sección 9 — Laboratorio: ER + Balance + Flujo conectados (E.model). Mueves una perilla y se recalcula todo en cascada.
(function () {
  const F = E.fmt;
  const GROUPS = [
    { title: '📈 Ventas y márgenes', defs: [
      { k: 'ventas', label: 'Ventas del año', min: 800, max: 2600, step: 25, v: E.DRV.ventas, fmt: '$', hint: 'Año 0 no cambia; esto es el año 1' },
      { k: 'mb', label: 'Margen bruto', min: 0.15, max: 0.6, step: 0.01, v: E.DRV.mb, fmt: 'pct', dec: 0, hint: 'Costo de ventas = ventas × (1 − margen bruto)' },
      { k: 'go', label: 'Gastos operativos (% ventas)', min: 0.05, max: 0.35, step: 0.01, v: E.DRV.go, fmt: 'pct', dec: 0 },
      { k: 'dep', label: 'Depreciación (% activo fijo)', min: 0.02, max: 0.25, step: 0.01, v: E.DRV.dep, fmt: 'pct', dec: 0 },
    ] },
    { title: '🔄 Capital de trabajo (días)', defs: [
      { k: 'dso', label: 'Días de cobro (PPC)', min: 0, max: 120, step: 1, v: E.DRV.dso, fmt: 'd', dec: 0, hint: 'Cuánto tardan tus clientes en pagarte' },
      { k: 'dio', label: 'Días de inventario (PPI)', min: 5, max: 200, step: 1, v: E.DRV.dio, fmt: 'd', hint: 'Cuánto tiempo se queda la mercancía en bodega' },
      { k: 'dpo', label: 'Días de pago (PPdP)', min: 0, max: 150, step: 1, v: E.DRV.dpo, fmt: 'd', hint: 'Cuánto tardas TÚ en pagar a proveedores' },
    ] },
    { title: '🏗️ Inversión y financiamiento', defs: [
      { k: 'capex', label: 'CapEx (compra de activo fijo)', min: 0, max: 500, step: 10, v: E.DRV.capex, fmt: '$' },
      { k: 'ddeuda', label: 'Deuda nueva (+) / pago (−)', min: -250, max: 400, step: 10, v: E.DRV.ddeuda, fmt: '$', hint: 'Deuda de largo plazo' },
      { k: 'aporte', label: 'Aportación de los socios', min: 0, max: 300, step: 10, v: E.DRV.aporte, fmt: '$' },
      { k: 'payout', label: 'Dividendos (% de la utilidad)', min: 0, max: 1, step: 0.05, v: E.DRV.payout, fmt: 'pct', dec: 0 },
      { k: 'tasa', label: 'Tasa de interés', min: 0.02, max: 0.25, step: 0.01, v: E.DRV.tasa, fmt: 'pct', dec: 0 },
      { k: 'tax', label: 'Tasa de impuestos', min: 0, max: 0.4, step: 0.01, v: E.DRV.tax, fmt: 'pct', dec: 0 },
    ] },
  ];
  const PRESETS = [
    ['Base', {}],
    ['🐢 Clientes pagan lento', { dso: 80 }],
    ['🛒 Modelo Walmart', { ventas: 2200, mb: 0.24, go: 0.15, dso: 5, dio: 40, dpo: 95 }],
    ['🏗️ Expansión con deuda', { ventas: 1650, capex: 380, ddeuda: 260 }],
    ['✂️ Recorte de costos', { mb: 0.4, go: 0.15 }],
    ['💸 Reparto agresivo', { payout: 1, ddeuda: 120 }],
    ['🚨 Empresa en apuros', { ventas: 1150, mb: 0.27, dso: 70, dio: 130, tasa: 0.18 }],
  ];
  // Qué provoca cada perilla (cadena causa → efecto)
  const WHY = {
    ventas: (u) => `${u ? 'Vendes más' : 'Vendes menos'} → la utilidad ${u ? 'sube' : 'baja'}, pero como los días no cambian, también ${u ? 'suben' : 'bajan'} cuentas por cobrar e inventario: ${u ? '<b>crecer consume capital de trabajo</b> (uso de caja)' : 'achicarse <b>libera capital de trabajo</b> (fuente de caja), aunque gane menos'}.`,
    mb: (u) => `Margen bruto ${u ? '↑' : '↓'} → costo de ventas ${u ? '↓' : '↑'} → utilidad neta ${u ? '↑' : '↓'} → márgenes, ROA y ROE ${u ? 'suben' : 'bajan'}. Como el inventario y los proveedores se calculan sobre el costo, también ${u ? 'bajan' : 'suben'}.`,
    go: (u) => `Gastos operativos ${u ? '↑' : '↓'} → EBITDA y EBIT ${u ? '↓' : '↑'} → cobertura de intereses y rentabilidad ${u ? 'empeoran' : 'mejoran'}.`,
    dep: (u) => `Más depreciación ${u ? '' : '(menos)'} → EBIT y utilidad ${u ? 'bajan' : 'suben'}, pero <b>la caja casi no cambia</b>: la depreciación no es salida de efectivo (se suma de regreso en operación). Hasta ${u ? 'ahorra' : 'cuesta'} impuestos.`,
    dso: (u) => `Cobras ${u ? 'más lento' : 'más rápido'} → cuentas por cobrar ${u ? '↑ (un activo que sube = USO)' : '↓ (un activo que baja = FUENTE)'} → flujo de operación ${u ? '↓' : '↑'} <b>aunque la utilidad sea la misma</b>.`,
    dio: (u) => `Inventario se queda ${u ? 'más' : 'menos'} tiempo → inventario ${u ? '↑ = USO' : '↓ = FUENTE'} de caja → la prueba ácida casi no cambia pero la razón corriente sí; ciclo operativo ${u ? 'más largo' : 'más corto'}.`,
    dpo: (u) => `Pagas a proveedores ${u ? 'más lento' : 'más rápido'} → proveedores ${u ? '↑ = FUENTE (te financian)' : '↓ = USO'} → ciclo de efectivo ${u ? 'más corto' : 'más largo'}; la razón corriente ${u ? 'baja' : 'sube'} porque crece/baja el pasivo corriente.`,
    capex: (u) => `${u ? 'Más' : 'Menos'} CapEx → flujo de inversión ${u ? 'más negativo' : 'menos negativo'} → caja ${u ? '↓' : '↑'}; el activo fijo ${u ? 'crece y la rotación de activos baja' : 'se encoge y la rotación sube'} (hasta que la inversión genere ventas).`,
    ddeuda: (u) => `${u ? 'Pides deuda' : 'Pagas deuda'} → financiamiento ${u ? '+ (FUENTE)' : '− (USO)'} → caja ${u ? '↑' : '↓'}; nivel de endeudamiento y apalancamiento ${u ? '↑ (el ROE puede subir, pero con más riesgo)' : '↓'}. (Los intereses se calculan sobre la deuda inicial.)`,
    aporte: (u) => `Los socios ${u ? 'meten' : 'sacan'} dinero → caja ${u ? '↑' : '↓'} y patrimonio ${u ? '↑' : '↓'} → endeudamiento ${u ? '↓' : '↑'} y ROE ${u ? '↓ (más patrimonio entre el que dividir la utilidad)' : '↑'}.`,
    payout: (u) => `Repartes ${u ? 'más' : 'menos'} dividendos → financiamiento ${u ? 'más negativo' : 'menos negativo'} → caja y patrimonio ${u ? '↓' : '↑'} → ROE ${u ? '↑' : '↓'} y endeudamiento ${u ? '↑' : '↓'} (mismo pasivo, menos capital).`,
    tasa: (u) => `Tasa ${u ? '↑' : '↓'} → intereses ${u ? '↑' : '↓'} → cobertura de intereses ${u ? 'empeora' : 'mejora'} y la utilidad neta ${u ? 'baja' : 'sube'} (el EBIT no cambia: los intereses van DEBAJO de la utilidad operacional).`,
    tax: (u) => `Impuestos ${u ? '↑' : '↓'} → utilidad neta y caja ${u ? '↓' : '↑'} ("el gobierno es el tercer socio"). EBIT y EBITDA no cambian.`,
  };

  function render(root) {
    root.innerHTML = `
    <style>
      .lab .tbl td.chg{color:var(--accent-ink);font-weight:700}
      .lab .eqline{font-size:15px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px 12px;margin:8px 0;font-variant-numeric:tabular-nums}
      .lab .why li{margin:6px 0}
      .lab .tgrp h4{font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);margin:14px 0 6px}
      .lab .alert{display:none}.lab .alert.on{display:block}
    </style>
    ${E.kid('Este es un "simulador de tiendita". Cada perilla es una decisión del dueño (vender más, cobrar más lento, comprar un camión, pedir un préstamo…). Al moverla, los tres reportes se recalculan solitos y puedes ver <b>qué se mueve y por qué</b>. Los números en <b style="color:var(--accent-ink)">azul</b> son los que cambiaron contra el caso base.')}
    <div class="btnrow no-print" id="pre">${PRESETS.map(([n], i) => `<button class="btn${i ? '' : ' on'}" data-i="${i}">${n}</button>`).join('')}</div>
    <div class="lab">
      <div class="lab-k" id="kn"></div>
      <div>
        <div class="co warn alert" id="alCaja"><b>¡Te quedaste sin caja!</b>La caja final es negativa: el negocio puede tener utilidad y aun así no poder pagar. Necesitarías pedir prestado o que los socios aporten. <b>Utilidad ≠ caja.</b></div>
        <div class="card2"><h4>🔗 Qué cambió y por qué</h4><ul class="why" id="why"></ul></div>
        <div class="tgrp" id="tiles"></div>
        <h3>Los tres estados financieros (cifras en miles de $)</h3>
        <div class="stm">
          <div class="card2"><h4>Estado de resultados · año 1</h4><div id="tER"></div></div>
          <div class="card2"><h4>Balance general</h4><div id="tBG"></div></div>
          <div class="card2"><h4>Flujo de efectivo · indirecto</h4><div id="tCF"></div></div>
        </div>
        <div class="g2">
          <div class="card2"><h4>💧 De la caja inicial a la caja final</h4><div class="chart" id="cW"></div></div>
          <div class="card2"><h4>⚖️ Balance: Activo = Pasivo + Capital</h4><div class="chart" id="cB"></div></div>
        </div>
        <div class="g2">
          <div class="card2"><h4>⚖️ Fuentes y usos (año 0 → año 1)</h4><div id="tFU"></div><p class="small muted">Activo: anterior − actual · Pasivo y capital: actual − anterior. La suma siempre da 0.</p></div>
          <div class="card2"><h4>🌳 DuPont en vivo</h4><div id="dp"></div><h4 style="margin-top:14px">🔓 Flujo de caja libre (ecuación fundamental)</h4><div id="fcl"></div></div>
        </div>
      </div>
    </div>`;

    const base = E.model(E.DRV);
    let drv = { ...E.DRV }, m = base;
    const apis = [];
    const kn = root.querySelector('#kn');
    GROUPS.forEach((g) => apis.push(E.knobs(kn, g.defs, (st) => { Object.assign(drv, st); update(); }, { title: g.title })));

    const chg = (a, b) => Math.abs(a - b) > 0.05;
    const cell = (v, b, f = F.n) => `<span>${f(v)}</span>`;
    function tbl(rows) { // rows: [label, val, baseVal, cls]
      return `<table class="tbl">${rows.map(([l, v, b, cls]) => `<tr${cls ? ` class="${cls}"` : ''}><td>${l}</td><td class="${b !== undefined && chg(v, b) ? 'chg' : ''}">${F.n(v)}</td></tr>`).join('')}</table>`;
    }

    let cW, cB;
    function update() {
      if (!apis.length || apis.length < GROUPS.length) return; // espera a que existan los 3 grupos
      m = E.model(drv);
      const r = m.er, rb = base.er, A = m.y0, B = m.y1, Bb = base.y1, c = m.cf, cb = base.cf, R = m.ratios, Rb = base.ratios;
      root.querySelector('#alCaja').classList.toggle('on', B.caja < 0);

      // por qué
      const changed = Object.keys(WHY).filter((k) => Math.abs(drv[k] - E.DRV[k]) > 1e-9);
      root.querySelector('#why').innerHTML = changed.length
        ? changed.map((k) => `<li>${WHY[k](drv[k] > E.DRV[k])}</li>`).join('') + `<li class="muted">Resultado: caja final ${F.$(B.caja)} (base ${F.$(Bb.caja)}) · utilidad neta ${F.$(r.UN)} (base ${F.$(rb.UN)}) · ROE ${F.pct(R.roe)} (base ${F.pct(Rb.roe)}).</li>`
        : '<li class="muted">Estás en el caso base. Mueve cualquier perilla o elige un escenario arriba.</li>';

      // tiles
      const T = (label, k, fmt, better, dec) => ({ label, v: R[k], base: Rb[k], fmt, better, dec });
      const tiles = root.querySelector('#tiles');
      tiles.innerHTML = ['💧 Liquidez', '⚙️ Eficiencia', '🏦 Endeudamiento', '💰 Rentabilidad', '🚰 Caja'].map((h, i) => `<h4>${h}</h4><div id="tl${i}"></div>`).join('');
      [
        [T('Razón corriente', 'rc', 'x', 'up'), T('Prueba ácida', 'pa', 'x', 'up'), { label: 'Capital neto de trabajo', v: R.cnt, base: Rb.cnt, fmt: '$', better: 'up' }],
        [T('Rotación de activos', 'rat', 'x', 'up'), T('Rotación de inventarios', 'rinv', 'x', 'up', 1), T('Días de cobro (PPC)', 'ppc', 'd', 'down'), T('Días de inventario (PPI)', 'ppi', 'd', 'down'), T('Días de pago (PPdP)', 'ppp', 'd', 'up'), T('Ciclo de efectivo', 'ce', 'd', 'down')],
        [T('Nivel de endeudamiento', 'nde', 'pct', 'down'), T('Cobertura de intereses', 'cdi', 'x', 'up', 1), T('Multiplicador (A/Patrimonio)', 'mult', 'x', null)],
        [T('Margen operacional', 'mo', 'pct', 'up'), T('Margen neto', 'mn', 'pct', 'up'), T('ROA', 'roa', 'pct', 'up'), T('ROE', 'roe', 'pct', 'up')],
        [{ label: 'Flujo de operación', v: c.CFO, base: cb.CFO, fmt: '$', better: 'up' }, { label: 'Indicador Buffett (oper. + inv.)', v: c.buffett, base: cb.buffett, fmt: '$', better: 'up' }, { label: 'Caja final', v: B.caja, base: Bb.caja, fmt: '$', better: 'up', hl: true }],
      ].forEach((items, i) => E.tiles(tiles.querySelector('#tl' + i), items));

      // estados
      root.querySelector('#tER').innerHTML = tbl([
        ['Ventas', r.V, rb.V], ['− Costo de ventas', -r.CV, -rb.CV], ['= Utilidad bruta', r.UB, rb.UB, 'tot'], ['− Gastos operativos', -r.GO, -rb.GO],
        ['= EBITDA', r.EBITDA, rb.EBITDA, 'tot'], ['− Depreciación', -r.DA, -rb.DA], ['= EBIT (utilidad operacional)', r.EBIT, rb.EBIT, 'tot'],
        ['− Intereses', -r.INT, -rb.INT], ['= Utilidad antes de impuestos', r.UAI, rb.UAI], ['− Impuestos', -r.IMP, -rb.IMP], ['= Utilidad neta', r.UN, rb.UN, 'tot'],
        ['Dividendos pagados', r.DIV, rb.DIV, 'sub'],
      ]);
      const bgRow = (l, k, cls) => `<tr${cls ? ` class="${cls}"` : ''}><td>${l}</td><td>${F.n(A[k])}</td><td class="${chg(B[k], Bb[k]) ? 'chg' : ''}">${F.n(B[k])}</td></tr>`;
      root.querySelector('#tBG').innerHTML = `<table class="tbl"><thead><tr><th></th><th>Año 0</th><th>Año 1</th></tr></thead>
        ${bgRow('Caja', 'caja')}${bgRow('Cuentas por cobrar', 'cxc')}${bgRow('Inventarios', 'inv')}${bgRow('Activo corriente', 'ac', 'sub')}${bgRow('Activo fijo neto', 'ppe')}${bgRow('Total activo', 'a', 'tot')}
        ${bgRow('Proveedores', 'cxp')}${bgRow('Deuda CP', 'deudaCP')}${bgRow('Pasivo corriente', 'pc', 'sub')}${bgRow('Deuda LP', 'deudaLP')}${bgRow('Total pasivo', 'p', 'sub')}
        ${bgRow('Capital social', 'capital')}${bgRow('Utilidades retenidas', 'ur')}${bgRow('Patrimonio', 'pat', 'sub')}${bgRow('Pasivo + capital', 'pyp', 'tot')}
        <tr class="sub"><td colspan="3">${m.check ? '✓ Cuadra: Activo = Pasivo + Capital' : '✗ No cuadra'}</td></tr></table>`;
      root.querySelector('#tCF').innerHTML = tbl([
        ['Utilidad neta', c.UN, cb.UN], ['+ Depreciación', c.DA, cb.DA], ['− Aumento en CxC', -c.dCxC, -cb.dCxC], ['− Aumento en inventario', -c.dInv, -cb.dInv], ['+ Aumento en proveedores', c.dCxP, cb.dCxP],
        ['= Flujo de operación', c.CFO, cb.CFO, 'tot'], ['− CapEx', -drv.capex, -E.DRV.capex], ['= Flujo de inversión', c.CFI, cb.CFI, 'tot'],
        ['+ Deuda nueva / − pago', c.dDeuda, cb.dDeuda], ['+ Aportación socios', c.aporte, cb.aporte], ['− Dividendos', -c.DIV, -cb.DIV], ['= Flujo de financiamiento', c.CFF, cb.CFF, 'tot'],
        ['Cambio en caja', c.dCaja, cb.dCaja], ['+ Caja inicial', c.caja0, cb.caja0], ['= Caja final', c.caja1, cb.caja1, 'tot'],
      ]);
      root.querySelector('#tFU').innerHTML = E.table(m.fu.map(([l, v]) => [l, `<span class="${v > 0.05 ? 'good' : v < -0.05 ? 'bad' : 'muted'}">${F.sgn(v)}</span>`, v > 0.05 ? '⬆ Fuente' : v < -0.05 ? '⬇ Uso' : '—'])
        .concat([['Suma (debe ser 0)', F.sgn(m.fu.reduce((s, x) => s + x[1], 0)), '✓', { cls: 'tot' }]]), { head: ['Cuenta', 'Cambio', 'Tipo'] });
      root.querySelector('#dp').innerHTML = `<div class="eqline">ROE <b>${F.pct(R.roe)}</b> = Margen neto <b>${F.pct(R.mn)}</b> × Rotación <b>${F.x(R.rat)}</b> × Apalancamiento <b>${F.x(R.mult)}</b></div>
        <p class="small muted">Base: ${F.pct(Rb.roe)} = ${F.pct(Rb.mn)} × ${F.x(Rb.rat)} × ${F.x(Rb.mult)}. ¿Qué palanca movió tu ROE?</p>`;
      const f = m.fcl;
      root.querySelector('#fcl').innerHTML = `<div class="eqline">FCL <b>${F.$(f.FCL)}</b> = EBITDA ${F.$(f.EBITDA)} ${f.dKT >= 0 ? '+' : '−'} ΔKT ${F.$(Math.abs(f.dKT))} − impuestos ${F.$(-f.IMP)} − CapEx ${F.$(-f.capex)}</div>
        <p class="small muted">FCL/Activos ${F.pct(f.fclA)} · CapEx/Activos ${F.pct(f.capexA)} · Dividendos/Activos ${F.pct(f.divA)}</p>`;

      cW && cW.refresh(); cB && cB.refresh();
    }

    // gráficas
    cW = E.chart(root.querySelector('#cW'), (T) => {
      const c = m.cf; const steps = [['Caja\ninicial', c.caja0, 'tot'], ['Operación', c.CFO], ['Inversión', c.CFI], ['Financia-\nmiento', c.CFF], ['Caja\nfinal', c.caja1, 'tot']];
      let run = 0; const help = [], val = [];
      steps.forEach(([n, v, t]) => {
        if (t) { help.push(Math.min(0, v)); val.push({ value: Math.abs(v), itemStyle: { color: T.c5 } }); run = v; }
        else { const lo = v >= 0 ? run : run + v; help.push(lo); val.push({ value: Math.abs(v), itemStyle: { color: v >= 0 ? T.c1 : T.c2 } }); run += v; }
      });
      return { ...E.baseOpt(T), legend: { show: false }, tooltip: { ...E.baseOpt(T).tooltip, formatter: (p) => { const i = p[0].dataIndex; return `<b>${steps[i][0].replace(/-?\n/g, '')}</b><br>${F.sgn(steps[i][1])}`; } },
        xAxis: E.axisCat(steps.map((s) => s[0]), T, { axisLabel: { color: T.ink2, fontSize: 12, interval: 0 } }), yAxis: E.axisVal(T, (v) => F.n(v)),
        series: [{ type: 'bar', stack: 'w', data: help, itemStyle: { color: 'transparent' }, silent: true, emphasis: { disabled: true } },
          { type: 'bar', stack: 'w', data: val, barWidth: '52%', itemStyle: { borderRadius: 4 }, label: { show: true, position: 'top', color: T.ink2, fontSize: 11, formatter: (p) => F.sgn(steps[p.dataIndex][1]) } }] };
    });
    cB = E.chart(root.querySelector('#cB'), (T) => {
      const A = m.y0, B = m.y1; const cats = ['Activo\naño 0', 'P + C\naño 0', 'Activo\naño 1', 'P + C\naño 1'];
      const ser = [['Caja', 'caja', 0], ['Cuentas por cobrar', 'cxc', 0], ['Inventarios', 'inv', 0], ['Activo fijo', 'ppe', 0], ['Proveedores', 'cxp', 1], ['Deuda', null, 1], ['Capital', 'pat', 1]];
      const val = (y, k) => (k ? y[k] : y.deudaCP + y.deudaLP);
      return { ...E.baseOpt(T), grid: { ...E.baseOpt(T).grid, top: 56 },
        xAxis: E.axisCat(cats, T), yAxis: E.axisVal(T, (v) => F.n(v)),
        series: ser.map(([n, k, side], i) => ({ name: n, type: 'bar', stack: 'b', barWidth: '50%', itemStyle: { color: T.c[i], borderColor: T.card, borderWidth: 1 },
          data: [side === 0 ? Math.max(0, val(A, k)) : 0, side === 1 ? val(A, k) : 0, side === 0 ? Math.max(0, val(B, k)) : 0, side === 1 ? val(B, k) : 0] })) };
    });

    // presets
    const pre = root.querySelector('#pre');
    pre.addEventListener('click', (e) => {
      const b = e.target.closest('button'); if (!b) return;
      pre.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
      const vals = { ...E.DRV, ...PRESETS[+b.dataset.i][1] };
      apis.forEach((a) => a.set(vals, false));
      drv = { ...vals }; update();
    });
    update();
  }

  E.section({
    id: 'lab', n: 9, group: 'lab', icon: '🧪', short: 'Laboratorio de estados',
    title: 'Laboratorio: los tres estados financieros conectados',
    lead: 'Mueve una perilla y mira cómo se propaga el cambio: estado de resultados → balance → flujo de efectivo → todas las razones.',
    exam: 'in',
    render,
  });
})();
