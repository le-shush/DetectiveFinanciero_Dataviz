// Sección 5 — Endeudamiento: nivel de endeudamiento, cobertura de intereses y cobertura del servicio de la deuda.
(function () {
  const F = E.fmt;

  // ---------------------------------------------------------------- ilustración: casa con hipoteca (dinámica)
  function casa(st) {
    const d = st.d, V = 1000000, deuda = V * d, tuyo = V - deuda, mult = tuyo > 0 ? V / tuyo : Infinity;
    const g = st.g, rTuyo = tuyo > 0 ? (V * g) / tuyo : null;
    const x0 = 50, w = 320, xb = x0 + w * d; // corte banco | tú
    const showB = d >= 0.14, showT = d <= 0.86;
    return `<svg class="ill" viewBox="0 0 660 310" role="img" aria-label="Casa de un millón: el banco financia ${F.pct(d, 0)} y tú ${F.pct(1 - d, 0)}">
      <defs><clipPath id="sxdeu-clip"><path d="M50 128 L210 34 L370 128 L350 128 L350 282 L70 282 L70 128 Z"/></clipPath></defs>
      <g clip-path="url(#sxdeu-clip)">
        <rect x="${x0}" y="20" width="${Math.max(0, xb - x0)}" height="270" class="f2"/>
        <rect x="${xb}" y="20" width="${Math.max(0, x0 + w - xb)}" height="270" class="f1"/>
      </g>
      <path d="M50 128 L210 34 L370 128 L350 128 L350 282 L70 282 L70 128 Z" class="ln" stroke-linejoin="round"/>
      <rect x="182" y="206" width="54" height="76" rx="6" class="bg" opacity=".9"/>
      <rect x="96" y="160" width="52" height="44" rx="5" class="bg" opacity=".85"/><rect x="272" y="160" width="52" height="44" rx="5" class="bg" opacity=".85"/>
      ${d > 0 && d < 1 ? `<line x1="${xb}" y1="20" x2="${xb}" y2="292" class="ln dash"/>` : ''}
      ${showB ? `<text x="${(x0 + xb) / 2}" y="${d > 0.3 ? 120 : 250}" text-anchor="middle" class="tw" font-size="15" font-weight="700">🏦 Banco</text>` : ''}
      ${showT ? `<text x="${(xb + x0 + w) / 2}" y="${d < 0.7 ? 120 : 250}" text-anchor="middle" class="tw" font-size="15" font-weight="700">🙋 Tú</text>` : ''}
      <text x="210" y="304" text-anchor="middle" font-size="13" class="tm">Casa (activo) = $1,000,000</text>
      <g font-size="15">
        <text x="405" y="52" font-weight="700">¿Quién pagó la casa?</text>
        <rect x="405" y="68" width="14" height="14" rx="3" class="f2"/><text x="426" y="80">Banco (pasivo): <tspan font-weight="700">${F.$(deuda)}</tspan></text>
        <rect x="405" y="94" width="14" height="14" rx="3" class="f1"/><text x="426" y="106">Tú (patrimonio): <tspan font-weight="700">${F.$(tuyo)}</tspan></text>
        <text x="405" y="140">Nivel de endeudamiento: <tspan font-weight="700">${F.pct(d, 0)}</tspan></text>
        <text x="405" y="166">Multiplicador (A/P): <tspan font-weight="700">${isFinite(mult) ? F.x(mult) : '∞'}</tspan></text>
        <text x="405" y="188" font-size="13" class="t2">${isFinite(mult) ? `con cada $1 tuyo controlas $${F.n(mult, 2)} de casa` : 'no pusiste nada: todo es del banco'}</text>
        <text x="405" y="226" font-weight="700">Si la casa ${g >= 0 ? 'sube' : 'baja'} ${F.pct(Math.abs(g), 0)}…</text>
        <text x="405" y="250">tu dinero ${rTuyo === null ? '—' : rTuyo >= 0 ? 'gana' : 'pierde'} <tspan font-weight="700">${rTuyo === null ? '—' : F.pct(Math.abs(rTuyo), 0)}</tspan></text>
        <text x="405" y="272" font-size="13" class="t2">${rTuyo !== null && rTuyo <= -1 ? '⚠ perdiste todo lo tuyo (y aún debes)' : 'la deuda AGRANDA ganancias y pérdidas'}</text>
      </g>
    </svg>`;
  }

  // ---------------------------------------------------------------- ilustración: termómetro de cobertura
  // escala por tramos: 0–3x ocupa la mitad del tubo; 3–12x la otra mitad
  const yv = (v) => { v = Math.max(0, Math.min(12, v)); return v <= 3 ? 262 - (v / 3) * 110 : 152 - ((v - 3) / 9) * 110; };
  function termo(x, v, titulo, sub) {
    const ok = v !== null && isFinite(v);
    const vv = ok ? v : 0;
    const zone = !ok ? 'lnm' : vv < 1 ? 'fbad' : vv < 3 ? 'fyel' : 'fgood';
    const top = yv(vv);
    const ticks = [0, 1, 2, 3, 6, 9, 12];
    return `<g transform="translate(${x},0)">
      <text x="70" y="22" text-anchor="middle" font-size="22" font-weight="700">${ok ? F.x(v) : '—'}${ok && v > 12 ? '+' : ''}</text>
      <!-- zonas -->
      <rect x="92" y="${yv(1)}" width="12" height="${262 - yv(1)}" class="fbad" opacity=".55"/>
      <rect x="92" y="${yv(3)}" width="12" height="${yv(1) - yv(3)}" class="fyel" opacity=".6"/>
      <rect x="92" y="${yv(12)}" width="12" height="${yv(3) - yv(12)}" class="fgood" opacity=".5"/>
      <!-- tubo -->
      <rect x="56" y="36" width="28" height="236" rx="14" class="bd"/>
      <rect x="62" y="${top}" width="16" height="${272 - top}" rx="8" class="${zone}"/>
      <circle cx="70" cy="292" r="22" class="${zone}"/><circle cx="70" cy="292" r="22" class="ln"/>
      ${ticks.map((t) => `<line x1="48" y1="${yv(t)}" x2="56" y2="${yv(t)}" class="lnm"/><text x="44" y="${yv(t) + 4}" text-anchor="end" font-size="12" class="tm">${t}x</text>`).join('')}
      <text x="110" y="${(yv(1) + 262) / 2 + 4}" font-size="12" class="t2">✗ no alcanza</text>
      <text x="110" y="${(yv(1) + yv(3)) / 2 + 4}" font-size="12" class="t2">! alcanza, no basta</text>
      <text x="110" y="${(yv(3) + yv(12)) / 2 + 4}" font-size="12" class="t2">✓ cómodo para el banco</text>
      <text x="70" y="334" text-anchor="middle" font-size="14" font-weight="700">${titulo}</text>
      <text x="70" y="352" text-anchor="middle" font-size="12" class="tm">${sub}</text>
    </g>`;
  }
  const termos = (a, b) => `<svg class="ill" viewBox="0 0 640 362" role="img" aria-label="Termómetros de cobertura: intereses ${a !== null ? F.x(a) : '—'}, servicio de deuda ${b !== null ? F.x(b) : '—'}">
      ${termo(20, a, 'Cobertura de intereses', 'UO ÷ intereses')}${termo(340, b, 'Cobertura del servicio', 'EBITDA ÷ (intereses + capital)')}</svg>`;

  E.section({
    id: 'deuda', n: 5, group: 'razones', icon: '🏦', short: 'Endeudamiento', exam: 'in',
    title: 'Endeudamiento y cobertura: ¿cuánto debes y te alcanza para pagarlo?',
    lead: 'Tres preguntas: ¿qué parte de tu empresa la pagaron terceros?, ¿tu operación alcanza para pagar los intereses?, y si además tienes que devolver capital, ¿te alcanza?',
    render(root) {
      root.innerHTML = `
      <style>.sx-deu .ill .fyel{fill:#d4a017}.sx-deu .interp{font-size:15px;line-height:1.5;margin-top:10px;padding:10px 12px;border-radius:10px;background:var(--surface);border:1px solid var(--line)}</style>
      <div class="sx-deu">
      <p class="prose">Después de liquidez y eficiencia viene el grupo de <b>administración de la deuda (pasivos)</b>. Son tres razones y todas responden lo que le importa a un <b>banco</b> antes de prestarte: <b>¿cuánto ya debes?</b> y <b>¿te alcanza para pagar?</b></p>
      ${E.table([
        ['Nivel de endeudamiento', 'Pasivo total ÷ Activo total', '¿Qué % de mi empresa financian terceros?'],
        ['Cobertura de intereses', 'Utilidad operacional ÷ Gastos financieros', '¿Mi operación alcanza para pagar los intereses?'],
        ['Cobertura del servicio de la deuda', 'EBITDA ÷ (Intereses + Abono a capital)', '¿Alcanza para intereses Y para devolver el préstamo?'],
      ], { head: ['Razón', 'Fórmula', 'Pregunta que responde'] })}

      ${E.concept({ id: 'nde', title: '1. Nivel de endeudamiento', badge: 'in', html: `
        <div class="cols"><div>
          <p><b>Pregunta:</b> de todo lo que tiene la empresa (sus activos = su inversión), <b>¿cuánto lo pagaron terceros</b> (bancos, proveedores, etc.)?</p>
          ${E.formula('Nivel de endeudamiento', 'NdE', E.frac('Total pasivos', 'Total activos'), 'en %')}
          ${E.kid('Compras una casa de <b>$1,000,000</b>. Tú pones $400,000 y el banco te presta $600,000. Tu nivel de endeudamiento es <b>60%</b>: el 60% de tu casa "es del banco" hasta que pagues. Mueve la perilla y mira cómo se reparte la casa.')}
          <p>Dos primas hermanas que verás en lecturas (Desai) y que sirven de <b>puente a DuPont</b>:</p>
          ${E.formula('Deuda / patrimonio', 'D/P', E.frac('Total pasivos', 'Patrimonio'), '¿cuánto deben terceros por cada $1 de los dueños?')}
          ${E.formula('Multiplicador de capital (apalancamiento patrimonial)', 'A/P', E.frac('Total activos', 'Patrimonio'), '= 1 ÷ (1 − NdE). Es la 3ª palanca de ' + E.link('dupont', 'DuPont'))}
          <p><b>¿Alto es bueno o malo?</b> Depende de quién pregunte:</p>
          <ul>
            <li><b>Banco:</b> lo quiere bajo; menos deuda previa = más colchón para cobrarte.</li>
            <li><b>Dueño:</b> algo de deuda le sube el ROE (pone menos dinero propio), pero con más riesgo.</li>
            <li><b>Siempre vs. el sector:</b> empresas de un mismo sector tienden a estructuras de financiamiento parecidas.</li>
          </ul>
        </div><div>
          <div id="kCasa"></div>
          <div id="figCasa" style="margin-top:12px"></div>
          <div id="tCasa" style="margin-top:10px"></div>
        </div></div>
        ${E.key('El apalancamiento es una lupa: <b>agranda las ganancias y también las pérdidas</b> del dueño. Con 80% de deuda, si la casa baja 20%, pierdes TODO lo que pusiste.', 'Por qué importa')}
        ${E.tip('Ejemplo ABC: <b>3 millones ÷ 6 millones = 50%</b>. El sector está en 60%, así que ABC <b>todavía puede financiar su crecimiento con deuda</b> (si tiene utilidades positivas). Cementeras 2024: Cemex ≈ <b>54%</b>, sector ≈ 50%: <q>el punto medio, 50% de la inversión se financia por terceros</q>.', 'Clases 21 y 23-sep')}
        ${E.note('Los <b>proveedores</b> también son pasivo y entran en el NdE… pero son <b>el mejor pasivo</b>: te financian <b>sin cobrarte intereses</b>. Por eso a Walmart o Cemex les conviene pagarles a muchos días (ver ' + E.link('eficiencia', 'ciclo de efectivo') + '). No es lo mismo deber $100 a proveedores que $100 a un banco al 12%.', 'Proveedores: el mejor pasivo')}
      ` })}

      ${E.concept({ id: 'cdi', title: '2. Cobertura de intereses', badge: 'in', html: `
        <div class="cols"><div>
          <p><b>Pregunta:</b> con lo que gana mi <b>operación</b> (antes de intereses e impuestos), <b>¿cuántas veces puedo pagar los intereses</b> del año?</p>
          ${E.formula('Cobertura de intereses', 'CdI', E.frac('Utilidad operacional (EBIT)', 'Gastos financieros (intereses)'), 'en veces (x)')}
          ${E.kid('Ganas $2 en tu puesto de limonadas y cada día le debes $1 de intereses a tu tío. Tu cobertura es <b>2x</b>: te alcanza dos veces. Si ganas $0.80 y le debes $1 (<b>0.8x</b>), ni vendiendo todo le pagas: <b>pierdes dinero</b>.')}
          <p><b>Cómo se lee</b> (más alto = mejor para el banco):</p>
          <ul>
            <li><b>&lt; 1x</b>: la utilidad operacional <b>no alcanza</b> para los intereses → pérdida. Nadie te presta.</li>
            <li><b>1x</b>: "justo uno a uno": pagas intereses y no queda nada.</li>
            <li><b>&gt; 1x no basta</b>: bancos y calificadoras (S&amp;P, Moody's) piden, según el sector, algo como <b>3x</b> o más.</li>
          </ul>
          <p><b>El inverso</b> a veces se entiende mejor: <b>intereses ÷ utilidad operacional</b> = qué % de tu utilidad operacional se va a pagar intereses. ABC: 1,000,000 ÷ 500,000 = <b>2x</b> → el <b>50%</b> de su utilidad operacional se va en intereses.</p>
        </div><div>
          <div id="figTermo1"></div>
          ${E.tip('Cementeras 2024: Cemex <b>1,771 ÷ 360 = 4.92x</b>; los alemanes (Heidelberg) ≈ <b>10x</b>, <q>el cliente más atractivo para un banco</q>. Sector ≈ <b>8.28x</b>.', 'Clase 23-sep')}
        </div></div>
        ${E.warn('Usa el <b>gasto por intereses BRUTO</b>, no el "neto" (intereses pagados − intereses ganados). <q>Siempre que vayan a calcular la capacidad de endeudamiento es con lo que se gasta en intereses.</q> Lo que recibes de intereses es incierto.')}
        ${E.warn('El numerador es la <b>utilidad operacional (≈ EBIT)</b>, no el EBITDA ni la utilidad neta. Ojo: utilidad operacional ≠ EBITDA (EBITDA = utilidad operacional + depreciación y amortización).')}
        ${E.note('A los bancos les encanta el <b>colateral</b> (terrenos, edificios, camiones). Es fácil prestarle a quien tiene activos físicos y difícil a una agencia de publicidad: <q>si se van los empleados, ¿qué me queda?</q>', 'Además del número')}
      ` })}

      ${E.concept({ id: 'csd', title: '3. Cobertura del servicio de la deuda', badge: 'in', html: `
        <div class="cols"><div>
          <p><b>Pregunta:</b> si además de intereses tengo que <b>devolver una parte del préstamo</b> cada año (abono a capital), <b>¿me alcanza?</b> El profe la llamó la <b>"prueba ácida del endeudamiento"</b>.</p>
          ${E.formula('Cobertura del servicio de la deuda', 'CSD', E.frac('EBITDA', 'Intereses + Abono a capital'), 'servicio de la deuda = intereses + abono a capital')}
          ${E.formula('', 'EBITDA', 'Utilidad operacional + Depreciación y amortización', 'aprox. del flujo que genera la operación')}
          <p><b>¿Por qué EBITDA y no utilidad operacional?</b> La depreciación es un gasto <b>contable</b> que no saca dinero de la caja; para pagar capital importa el <b>flujo</b>, y el EBITDA es su aproximación.</p>
          <p><b>Ejemplo ABC:</b> utilidad operacional 1,000,000 + depreciación 700,000 = <b>EBITDA 1,700,000</b>. Con un servicio de deuda de ≈1,080,000 (500,000 de intereses + ≈580,000 de capital): 1,700,000 ÷ 1,080,000 ≈ <b>1.57x</b> → por cada peso de servicio de deuda genero 1.57 de EBITDA; o sea, ≈ <b>64%</b> de lo que produzco se va a pagar deuda.</p>
        </div><div>
          ${E.kid('No sólo pagas los intereses del tío: también tienes que <b>devolverle cada mes un pedacito de lo que te prestó</b>. Esta razón revisa si tu alcancía aguanta las dos cosas juntas.')}
          ${E.key('<b>Empresas grandes</b> (Cemex emite más deuda que algunos países) se financian con <b>bonos</b> y al vencer <b>refinancian</b> ("patean") el principal → para ellas basta la <b>cobertura de intereses</b>. <b>Empresas pequeñas</b> sí pagan capital cada año y el banco <q>no te lo deja patear tanto</q> → usa la <b>cobertura del servicio de la deuda</b>.', '¿Cuál uso?')}
        </div></div>
        <h4 id="bonos">Bono vs. préstamo amortizable (en breve)</h4>
        <div class="cols"><div>
          <p>Ejemplo de clase: te prestan <b>1,000</b> a 3 años al <b>7%</b>.</p>
          ${E.table([
            ['Año 1', 70, 370], ['Año 2', 70, 349], ['Año 3', 1070, 428], ['Total pagado', 1210, 1147, { cls: 'tot' }],
          ], { head: ['', 'Bono', 'Préstamo amortizable'], fmt: [null, (v) => F.n(v), (v) => F.n(v)] })}
          <p class="small muted">Bono: sólo pagas el cupón (7% × 1,000 = 70) y el principal al final. Préstamo: abonas capital (300, 300, 400) + interés sobre el saldo (70, 49, 28).</p>
          <p>El préstamo amortizable es <b>más barato en total</b>, pero el bono es <b>mejor "por flujo"</b>: pagas sólo 70 al año y el resto se queda en la operación (y el interés es deducible).</p>
        </div><div><div class="chart h220" id="cBono"></div></div></div>
      ` })}

      <h2 id="lab-deuda">🎛️ Simulador: ¿te presta el banco?</h2>
      <p class="prose">Mueve la utilidad operacional, la depreciación, la deuda, la tasa y el abono a capital. Los valores iniciales son los del ejemplo <b>ABC</b> (en miles de pesos).</p>
      <div class="concept"><div class="cols"><div>
        <div id="kLab"></div>
        <div class="interp" id="iLab"></div>
      </div><div>
        <div id="tLab"></div>
        <div id="figTermo2" style="margin-top:10px"></div>
        <div class="chart h220" id="cLab"></div>
      </div></div></div>

      ${E.reveal('📝 Ejercicio resuelto paso a paso (como lo quiere el profe)', `
        <p><b>Datos:</b> Activo total 8,000; Pasivo total 5,200; Utilidad operacional 900; Depreciación 300; Gasto por intereses 400 (intereses ganados 50); Abono a capital del año 500. Sector: NdE 55%, cobertura 3x.</p>
        <ol>
          <li><b>Nivel de endeudamiento</b> = Pasivo ÷ Activo = 5,200 ÷ 8,000 = <b>65%</b>. Más endeudada que el sector (55%): terceros financian 65 de cada 100 pesos de inversión; le queda poco espacio para pedir más.</li>
          <li><b>Cobertura de intereses</b> = Utilidad operacional ÷ intereses <b>brutos</b> = 900 ÷ 400 = <b>2.25x</b> (no uses 400 − 50 = 350). Alcanza, pero está debajo de 3x: <b>un banco dudaría</b>. El 44% de la utilidad operacional se va en intereses.</li>
          <li><b>EBITDA</b> = 900 + 300 = 1,200. <b>Servicio de deuda</b> = 400 + 500 = 900. <b>CSD</b> = 1,200 ÷ 900 = <b>1.33x</b>: le alcanza para intereses y capital, con poco colchón (75% de su EBITDA se va a la deuda).</li>
          <li><b>Conclusión escrita:</b> empresa más apalancada que su sector y con cobertura justa; no debería tomar más deuda bancaria; mejor crecer con utilidades retenidas o capital, o negociar plazos (bono / refinanciar).</li>
        </ol>`)}

      <h2>¿Qué pasa si…?</h2>
      <div id="qz"></div>
      </div>`;

      // ---- casa
      const tC = root.querySelector('#tCasa'), fC = root.querySelector('#figCasa');
      E.knobs(root.querySelector('#kCasa'), [
        { k: 'd', label: '% de la casa que paga el banco (deuda)', min: 0, max: 0.95, step: 0.05, v: 0.6, fmt: 'pct', dec: 0 },
        { k: 'g', label: 'Cambio en el valor de la casa', min: -0.3, max: 0.3, step: 0.05, v: 0.1, fmt: 'pct', dec: 0, hint: 'Simula que la casa se revalúa o se devalúa.' },
      ], (st) => {
        fC.innerHTML = E.fig(casa(st), '');
        const mult = 1 / (1 - st.d);
        E.tiles(tC, [
          { label: 'Nivel de endeudamiento', v: st.d, fmt: 'pct', dec: 0, base: 0.6, better: 'down', hl: true },
          { label: 'Deuda / patrimonio', v: st.d / (1 - st.d), fmt: 'x', base: 1.5, better: 'down' },
          { label: 'Multiplicador A/P', v: mult, fmt: 'x', base: 2.5, note: 'palanca de DuPont' },
          { label: 'Rendimiento para ti', v: st.g * mult, fmt: 'pct', dec: 0, note: 'cambio de la casa × multiplicador' },
        ]);
      }, { title: '🏠 La casa con hipoteca' });

      // ---- termómetro de la ficha 2 (estático, ejemplos)
      root.querySelector('#figTermo1').innerHTML = E.fig(`<svg class="ill" viewBox="0 0 640 362" role="img" aria-label="Termómetros: Cemex 4.9x y Heidelberg 10.9x en 2024">${termo(20, 4.92, 'Cemex 2024', '1,771 ÷ 360')}${termo(340, 10.86, 'Heidelberg 2024', 'el favorito del banco')}</svg>`, 'Verde: arriba de ~3x. Amarillo: alcanza pero no basta. Rojo: menos de 1x.');

      // ---- bono vs préstamo
      E.chart(root.querySelector('#cBono'), (T) => ({
        ...E.baseOpt(T),
        xAxis: E.axisCat(['Año 1', 'Año 2', 'Año 3'], T),
        yAxis: E.axisVal(T, (v) => F.n(v)),
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.n(v) },
        series: [
          { name: 'Bono', type: 'bar', data: [70, 70, 1070], itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 36 },
          { name: 'Préstamo amortizable', type: 'bar', data: [370, 349, 428], itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 36 },
        ],
      }));

      // ---- simulador
      const iL = root.querySelector('#iLab'), tL = root.querySelector('#tLab'), fT = root.querySelector('#figTermo2');
      let lab = null, ch = null;
      const BASE = { ebit: 1000, da: 700, deuda: 5000, tasa: 0.10, abono: 580 };
      const calc = (s) => { const int = s.deuda * s.tasa, ebitda = s.ebit + s.da, serv = int + s.abono; return { int, ebitda, serv, cdi: int > 0 ? s.ebit / int : null, csd: serv > 0 ? ebitda / serv : null, pctInt: s.ebit > 0 ? int / s.ebit : null }; };
      const b0 = calc(BASE);
      E.knobs(root.querySelector('#kLab'), [
        { k: 'ebit', label: 'Utilidad operacional (EBIT)', min: 0, max: 3000, step: 50, v: BASE.ebit, fmt: '$' },
        { k: 'da', label: 'Depreciación y amortización', min: 0, max: 2000, step: 50, v: BASE.da, fmt: '$' },
        { k: 'deuda', label: 'Deuda con costo', min: 0, max: 20000, step: 250, v: BASE.deuda, fmt: '$' },
        { k: 'tasa', label: 'Tasa de interés', min: 0.02, max: 0.25, step: 0.005, v: BASE.tasa, fmt: 'pct' },
        { k: 'abono', label: 'Abono a capital del año', min: 0, max: 3000, step: 20, v: BASE.abono, fmt: '$', hint: 'Pon 0 si es un bono (sólo pagas cupón).' },
      ], (s) => {
        const r = calc(s); lab = { s, r };
        E.tiles(tL, [
          { label: 'Intereses (deuda × tasa)', v: r.int, fmt: '$', base: b0.int, better: 'down' },
          { label: 'EBITDA', v: r.ebitda, fmt: '$', base: b0.ebitda, better: 'up' },
          { label: 'Cobertura de intereses', v: r.cdi, fmt: 'x', base: b0.cdi, better: 'up', hl: true },
          { label: 'Servicio de deuda', v: r.serv, fmt: '$', base: b0.serv, better: 'down' },
          { label: 'Cobertura del servicio', v: r.csd, fmt: 'x', base: b0.csd, better: 'up', hl: true },
          { label: '% de la UO que se va a intereses', v: r.pctInt, fmt: 'pct', dec: 0, base: b0.pctInt, better: 'down' },
        ]);
        fT.innerHTML = E.fig(termos(r.cdi, r.csd), '');
        let t = '';
        if (r.cdi === null) t = 'Sin deuda no hay intereses: la cobertura es "infinita". Al banco le encantas… pero quizá el dueño podría usar algo de deuda para crecer.';
        else if (r.cdi < 1) t = `✗ Con <b>${F.x(r.cdi)}</b>, por cada $1 de intereses tu operación sólo genera <b>$${F.n(r.cdi, 2)}</b>. <b>No alcanza</b>: la empresa pierde dinero y ningún banco le presta.`;
        else if (r.cdi < 3) t = `! Con <b>${F.x(r.cdi)}</b> sí pagas los intereses (${F.pct(r.pctInt, 0)} de tu utilidad operacional se va en ellos), pero <b>no basta</b>: un banco o calificadora pediría ≈3x o más.`;
        else t = `✓ Con <b>${F.x(r.cdi)}</b> tu operación paga los intereses ${F.n(r.cdi, 1)} veces; sólo el ${F.pct(r.pctInt, 0)} de la utilidad operacional se va en intereses. Cliente atractivo para el banco.`;
        if (r.csd !== null) {
          if (r.csd < 1) t += ` Pero si además debes abonar capital, el EBITDA <b>no cubre</b> el servicio de la deuda (${F.x(r.csd)}): tendrías que refinanciar o el banco embarga.`;
          else if (r.csd < 1.3) t += ` Con el abono a capital, la cobertura del servicio es <b>${F.x(r.csd)}</b>: alcanza muy justo (${F.pct(1 / r.csd, 0)} del EBITDA se va a la deuda).`;
          else t += ` Incluyendo el abono a capital, la cobertura del servicio es <b>${F.x(r.csd)}</b>: hay colchón (${F.pct(1 / r.csd, 0)} del EBITDA se va a la deuda).`;
        }
        iL.innerHTML = t;
        ch && ch.refresh();
      }, { title: '🏦 Tu empresa y su deuda' });
      ch = E.chart(root.querySelector('#cLab'), (T) => ({
        ...E.baseOpt(T),
        xAxis: E.axisCat(['Sólo intereses', 'Intereses + capital'], T),
        yAxis: E.axisVal(T, (v) => F.n(v)),
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.$(v) },
        series: [
          { name: 'Lo que generas (UO / EBITDA)', type: 'bar', data: [lab.s.ebit, lab.r.ebitda], itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 40 },
          { name: 'Lo que debes pagar', type: 'bar', data: [lab.r.int, lab.r.serv], itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] }, barMaxWidth: 40 },
        ],
      }));

      E.quiz(root.querySelector('#qz'), [
        { q: 'Una empresa tiene cobertura de intereses de 0.8x. ¿Le presta el banco?', o: ['Sí, porque es positiva', 'No: su utilidad operacional no alcanza para pagar los intereses', 'Sí, si su nivel de endeudamiento es bajo'], a: 1, w: 'Genera $0.80 por cada $1 de intereses: pierde dinero. Además, ni siquiera >1 basta; suelen pedir ≈3x.' },
        { q: 'La empresa pagó 400 de intereses y ganó 50 de intereses por inversiones. ¿Qué pones en el denominador de la cobertura?', o: ['350 (neto)', '400 (bruto)', '450'], a: 1, w: 'El profe: siempre el gasto por intereses bruto. Lo que recibes es incierto.' },
        { q: 'Una PyME paga intereses y además abona capital cada año. ¿Qué razón describe mejor su capacidad de pago?', o: ['Cobertura de intereses', 'Cobertura del servicio de la deuda (EBITDA ÷ intereses + abono)', 'Nivel de endeudamiento'], a: 1, w: 'Las grandes refinancian el principal (bonos); las pequeñas sí lo pagan, así que hay que incluirlo.' },
        { q: 'ABC tiene nivel de endeudamiento de 50% y su sector 60%. ¿Puede crecer con deuda?', o: ['Sí, tiene espacio vs. el sector (si tiene utilidades positivas)', 'No, 50% ya es demasiado', 'No se puede saber sin el ROE'], a: 0, w: 'Comparado con el sector está menos endeudada: tiene capacidad para pedir más.' },
        { q: 'Si subes el multiplicador A/P de 2 a 4 y tus activos rinden lo mismo, ¿qué pasa con el ROE?', o: ['Baja', 'Sube, pero con más riesgo', 'No cambia'], a: 1, w: 'Pones menos dinero propio por cada peso de inversión: ganancias y pérdidas se agrandan (ver DuPont).' },
      ]);
    },
  });
})();
