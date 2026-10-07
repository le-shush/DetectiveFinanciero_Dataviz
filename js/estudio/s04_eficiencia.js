// Sección 4 — Eficiencia (administración de activos): rotaciones, días, ciclo operativo y de efectivo, proyección de servilleta.
(function () {
  const F = E.fmt;
  const D = (v) => F.d(v, 0);

  // ---------------------------------------------------------------- ilustración: los activos son la causa
  const causa = `<svg class="ill" viewBox="0 0 900 360" role="img" aria-label="La administración de activos es la causa; liquidez, crédito y rentabilidad son los efectos. Activo productivo contra improductivo">
    <defs><marker id="efAh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    <rect x="30" y="40" width="300" height="150" rx="16" class="f1"/>
    <text x="180" y="78" text-anchor="middle" font-size="13" class="tw" font-weight="700">CAUSA</text>
    <text x="180" y="110" text-anchor="middle" font-size="19" class="tw" font-weight="800">🏭 Administración</text>
    <text x="180" y="134" text-anchor="middle" font-size="19" class="tw" font-weight="800">de activos</text>
    <text x="180" y="162" text-anchor="middle" font-size="13" class="tw">(activo = inversión)</text>
    <text x="700" y="28" text-anchor="middle" font-size="13" class="tm" font-weight="700">EFECTOS</text>
    <rect x="560" y="40" width="290" height="44" rx="12" class="w2"/><text x="705" y="68" text-anchor="middle" font-size="15" font-weight="700">💧 Liquidez (caja)</text>
    <rect x="560" y="93" width="290" height="44" rx="12" class="w3"/><text x="705" y="121" text-anchor="middle" font-size="15" font-weight="700">🏦 Crédito: "lana atrae lana"</text>
    <rect x="560" y="146" width="290" height="44" rx="12" class="w4"/><text x="705" y="174" text-anchor="middle" font-size="15" font-weight="700">💰 Rentabilidad (ROA, ROE)</text>
    <path d="M330 100 C 440 100, 450 62, 556 62" class="ln s5 anim-flow" marker-end="url(#efAh)"/>
    <path d="M330 115 L556 115" class="ln s5 anim-flow" marker-end="url(#efAh)"/>
    <path d="M330 130 C 440 130, 450 168, 556 168" class="ln s5 anim-flow" marker-end="url(#efAh)"/>
    <rect x="30" y="220" width="400" height="120" rx="14" class="w4"/>
    <text x="230" y="250" text-anchor="middle" font-size="15" font-weight="700" class="fgood">✓ Activo productivo</text>
    <text x="230" y="278" text-anchor="middle" font-size="14">🚚 Walmart: ~80,000 tráileres, centros de</text>
    <text x="230" y="298" text-anchor="middle" font-size="14">distribución baratos, corporativo austero</text>
    <text x="230" y="322" text-anchor="middle" font-size="13" class="t2">"¿En cuánto tiempo se paga? Si no, no se hace."</text>
    <rect x="470" y="220" width="400" height="120" rx="14" class="w6"/>
    <text x="670" y="250" text-anchor="middle" font-size="15" font-weight="700" class="fbad">✗ Activo improductivo</text>
    <text x="670" y="278" text-anchor="middle" font-size="14">🏙️ Torre corporativa (Sears, Chrysler),</text>
    <text x="670" y="298" text-anchor="middle" font-size="14">clubes y colegios de BP, aviones privados</text>
    <text x="670" y="322" text-anchor="middle" font-size="13" class="t2">No vende ni una chamarra más → se castiga</text>
  </svg>`;

  // ---------------------------------------------------------------- pictograma dinámico: $ de ventas por $1 de activo fijo
  function svgRafn(r) {
    const n = Math.max(0, Math.min(12, r)), full = Math.floor(n), part = n - full;
    let coins = '';
    for (let i = 0; i < Math.ceil(n); i++) {
      const x = 250 + i * 46, frac = i < full ? 1 : part;
      coins += `<circle cx="${x}" cy="70" r="19" class="w5"/><rect x="${x - 19}" y="${70 - 19}" width="${(38 * frac).toFixed(1)}" height="38" class="f5" clip-path="url(#efCoin${i})"/>
        <clipPath id="efCoin${i}"><circle cx="${x}" cy="70" r="19"/></clipPath><circle cx="${x}" cy="70" r="19" class="ln"/><text x="${x}" y="75" text-anchor="middle" font-size="13" class="tw" font-weight="700">$</text>`;
    }
    return `<svg class="ill" viewBox="0 0 820 130" role="img" aria-label="Pesos de venta por cada peso de activo fijo">
      <rect x="20" y="36" width="150" height="70" rx="10" class="w1"/><text x="95" y="66" text-anchor="middle" font-size="26">🏭</text>
      <text x="95" y="96" text-anchor="middle" font-size="13" font-weight="700">$1 de fábrica</text>
      <text x="205" y="78" text-anchor="middle" font-size="24" class="t2">→</text>
      ${coins}
      <text x="250" y="122" font-size="13" class="t2">genera ${F.$(r, 2)} de ventas al año</text>
    </svg>`;
  }

  // ---------------------------------------------------------------- línea de tiempo del ciclo (la estrella)
  const reduce = (() => { try { return matchMedia('(prefers-reduced-motion: reduce)').matches; } catch (e) { return false; } })();
  function svgCiclo(s) {
    const CO = s.ppi + s.ppc, CE = CO - s.ppdp;
    const maxD = Math.max(CO, s.ppdp, 30) * 1.04, X0 = 60, W = 790, x = (d) => X0 + (d / maxD) * W;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const lab = (cx, y, txt, size, cls, anchor) => `<text x="${cx.toFixed(1)}" y="${y}" text-anchor="${anchor || 'middle'}" font-size="${size || 13}"${cls ? ` class="${cls}"` : ''}>${txt}</text>`;
    const inBar = (a, b, y, cls, long, short) => {
      const w = x(b) - x(a); if (w <= 0) return '';
      const t = w > 230 ? long : w > 70 ? short : '';
      return `<rect x="${x(a).toFixed(1)}" y="${y}" width="${w.toFixed(1)}" height="34" rx="6" class="${cls}"/>` + (t ? lab((x(a) + x(b)) / 2, y + 22, t, 14, 'tw') : '');
    };
    let g = '';
    // zona de financiamiento
    const za = Math.min(CO, s.ppdp), zb = Math.max(CO, s.ppdp);
    if (zb - za > 0.01) {
      g += `<rect x="${x(za).toFixed(1)}" y="50" width="${(x(zb) - x(za)).toFixed(1)}" height="160" rx="6" class="${CE > 0 ? 'fbad' : 'fgood'}" opacity="0.16"/>`;
      g += `<line x1="${x(za).toFixed(1)}" y1="50" x2="${x(za).toFixed(1)}" y2="210" class="lnm dash"/><line x1="${x(zb).toFixed(1)}" y1="50" x2="${x(zb).toFixed(1)}" y2="210" class="lnm dash"/>`;
    }
    // ciclo operativo (llave)
    g += `<path d="M${x(0)} 44 L${x(0)} 36 L${x(CO).toFixed(1)} 36 L${x(CO).toFixed(1)} 44" class="ln"/>`;
    g += lab(clamp((x(0) + x(CO)) / 2, 150, 760), 28, `Ciclo operativo = PPI + PPC = <tspan font-weight="800">${F.n(CO)} días</tspan>`, 16);
    // fila 1: inventario + por cobrar
    g += lab(X0 - 8, 84, 'Tú', 14, 'tm', 'end');
    g += inBar(0, s.ppi, 62, 'f3', `📦 Inventario · PPI ${F.n(s.ppi)} d`, `📦 ${F.n(s.ppi)} d`);
    g += inBar(s.ppi, CO, 62, 'f2', `🧾 Por cobrar · PPC ${F.n(s.ppc)} d`, `🧾 ${F.n(s.ppc)} d`);
    // eventos fila 1
    const close = (x(s.ppi) - x(0) < 130) || (x(CO) - x(s.ppi) < 150);
    g += lab(x(0), 116, '📥 compro (día 0)', 14, 't2', 'start');
    g += lab(clamp(x(s.ppi), 120, 800), close ? 132 : 116, `🤝 vendo (día ${F.n(s.ppi)})`, 14, 't2');
    g += lab(Math.min(x(CO), 850), 116, `💵 cobro (día ${F.n(CO)})`, 14, 't2', x(CO) > 760 ? 'end' : 'middle');
    // fila 2: proveedor
    g += lab(X0 - 8, 172, 'Prov.', 14, 'tm', 'end');
    g += inBar(0, s.ppdp, 150, 'f5', `🚚 El proveedor te presta · PPdP ${F.n(s.ppdp)} d`, `🚚 ${F.n(s.ppdp)} d`);
    if (s.ppdp > 0) g += lab(clamp(x(s.ppdp), 110, 800), 202, `🧾 pago al proveedor (día ${F.n(s.ppdp)})`, 14, 't2', x(s.ppdp) > 740 ? 'end' : 'middle');
    // leyenda de la zona
    const zc = clamp((x(za) + x(zb)) / 2, 230, 680);
    if (Math.abs(CE) < 0.5) g += lab(450, 244, 'Ciclo de efectivo = 0: pagas el mismo día que cobras', 17, null);
    else if (CE > 0) g += lab(zc, 244, `💸 Tú financias ${F.n(CE)} días (ciclo de efectivo)`, 17, 'fbad') + lab(zc, 264, 'entre que pagas al proveedor y te paga tu cliente', 14, 'tm');
    else g += lab(zc, 244, `🎁 Te financian ${F.n(-CE)} días (ciclo de efectivo negativo)`, 17, 'fgood') + lab(zc, 264, 'ya cobraste y todavía no le pagas al proveedor', 14, 'tm');
    // eje de días
    const step = maxD > 300 ? 60 : maxD > 150 ? 30 : maxD > 60 ? 15 : 10;
    g += `<line x1="${X0}" y1="292" x2="${X0 + W}" y2="292" class="lnm"/>`;
    for (let d = 0; d <= maxD; d += step) g += `<line x1="${x(d).toFixed(1)}" y1="288" x2="${x(d).toFixed(1)}" y2="296" class="lnm"/>` + lab(x(d), 312, F.n(d), 13, 'tm');
    g += lab(X0 + W, 330, 'días →', 11, 'tm', 'end');
    // moneda animada que recorre el ciclo operativo
    if (!reduce && CO > 0) g += `<circle cx="${x(0)}" cy="79" r="9" class="f4"><animate attributeName="cx" values="${x(0)};${x(CO).toFixed(1)}" dur="${(2 + CO / 60).toFixed(1)}s" repeatCount="indefinite"/></circle>`;
    return `<svg class="ill" viewBox="0 0 900 340" role="img" aria-label="Línea de tiempo: inventario, cobro y pago al proveedor; la zona sombreada son los días de ciclo de efectivo">${g}</svg>`;
  }

  // ---------------------------------------------------------------- mini calculadora genérica: knobs → tiles + frase
  function mini(root, sel, defs, fn, title) {
    const box = root.querySelector(sel);
    box.innerHTML = '<div class="mk"></div><div class="mt" style="margin-top:10px"></div><div class="co key mx" style="margin-top:8px"></div>';
    const tEl = box.querySelector('.mt'), xEl = box.querySelector('.mx');
    E.knobs(box.querySelector('.mk'), defs, (st) => { const r = fn(st); E.tiles(tEl, r.tiles); xEl.innerHTML = '<b>Cómo se lee</b>' + r.txt; }, { title: title || '🎛️ Pruébalo' });
  }

  const PRE = {
    abc: { v: { ppi: 182, ppc: 55, ppdp: 45, ventas: 6000, cv: 0.67 }, ref: { co: 186, ce: 121, nm: 'sector' }, txt: 'Caso ABC (miles de $): PPC 55, PPI 182, PPdP 45 → ciclo operativo 237 y de efectivo 192 días. Sector: 186 y 121.' },
    wal: { v: { ppi: 45, ppc: 3, ppdp: 120, ventas: 30000, cv: 0.77 }, ref: null, txt: 'Supermercado tipo Walmart (ilustrativo): cobra casi de contado, rota rápido y paga muy tarde. El profe habló de ciclos de efectivo negativos de 70–90 días en supermercados.' },
    cmx: { v: { ppi: 55, ppc: 36, ppdp: 119, ventas: 16000, cv: 0.66 }, ref: { co: 99, ce: -9, nm: 'sector cementero' }, txt: 'Cementera: Cemex 2024 (≈, millones de USD): PPC ≈36, PPI ≈55, PPdP ≈119 → ciclo operativo ≈91 y de efectivo ≈ −28 días. Sector ≈99 y ≈ −9.' },
  };

  E.section({
    id: 'eficiencia', n: 4, group: 'razones', icon: '⚙️', short: 'Eficiencia y ciclos', exam: 'in',
    title: 'Eficiencia: ¿qué tan bien trabaja tu inversión?',
    lead: 'Rotaciones, días y ciclos. Los activos son la causa: si se administran bien, llegan solos la caja, el crédito y la rentabilidad.',
    render(root) {
      root.innerHTML = `
      <div class="prose">
        <p>El activo es <b>inversión</b>. Las razones de eficiencia (administración de activos) miden <b>cuántas ventas saca la empresa de cada peso invertido</b> y <b>qué tan rápido da vuelta el dinero</b>: compro → vendo → cobro.</p>
        <p>En la encuesta de clase, el grupo más importante fue éste, <b>"porque de ahí parte cualquier negocio"</b>: liquidez, crédito y rentabilidad son <b>efectos</b> de cómo administras la inversión.</p>
      </div>
      ${E.fig(causa, 'Los activos son la causa; la liquidez, el crédito y la rentabilidad son los efectos. Lo improductivo se castiga cada vez más.', true)}
      ${E.tip('<q>En gerencia financiera, la administración de activos lo es todo.</q> Las empresas suelen morir cuando dejan de ser eficientes: burocracia y activos improductivos.', 'Clase 21-sep')}
      ${E.kid('Tienes un puesto de limonadas. Si con una jarra de $100 vendes $300 al día, tu jarra es <b>productiva</b>. Si compras una sombrilla carísima de $1,000 que no te hace vender ni un vaso más, es <b>improductiva</b>: tu dinero está ahí sentado sin trabajar.')}

      <h2 id="rotaciones">1 · Rotaciones de activos: ventas por cada peso invertido</h2>
      ${E.concept({ id: 'rat', title: 'Rotación de activos totales y Rotación de activos fijos netos (RAFN)', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Rotación de activos totales', 'RAT', E.frac('Ventas', 'Activos totales'), 'cuántos $ vendes por cada $1 de inversión total')}
          <div id="rafn"></div>
          ${E.formula('Rotación de activos fijos netos', 'RAFN', E.frac('Ventas', 'Activos fijos netos'), 'neto = propiedad, planta y equipo después de depreciación')}
          <p><b>Cómo se lee:</b> RAFN = 2 → "cada $1 de inversión productiva genera $2 de ingreso al año". Se mide en <b>veces</b> y <b>más alto es mejor</b> (siempre contra el sector).</p>
          <ul>
            <li><b>ABC:</b> RAFN 2 contra sector 4 → ABC está <b>mal</b>. En una fábrica puede ser capacidad instalada subutilizada o activo improductivo.</li>
            <li><b>Cementeras 2024:</b> Cemex RAFN 1.44 vs sector 1.43; RAT 0.59 vs 0.56. Capital intensivo: $1 de fábrica sólo genera ≈$1.4 al año.</li>
            <li>La rotación mide la <b>inversión</b>; el margen mide lo que te deja cada venta. Juntas forman el ROA (ver ${E.link('dupont', 'DuPont')}).</li>
          </ul>
          ${E.warn('Usar activo fijo <b>bruto</b>. Es <b>neto</b> de depreciación. Y ojo: patentes, intangibles y goodwill "tienden a inflar la inversión".')}
        </div><div>
          <div id="mRaf"></div>
          <div id="svgRaf" style="margin-top:8px"></div>
        </div></div>` })}

      <h2 id="inventarios">2 · Inventarios, cobro y pago: ¿qué tan rápido da vuelta el dinero?</h2>
      ${E.concept({ id: 'rdi', title: 'Rotación de inventarios (RdI) y Periodo promedio de inventarios (PPI)', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Rotación de inventarios', 'RdI', E.frac('Costo de ventas', 'Inventario promedio'), 'veces al año que vendes (o fabricas) tu inventario')}
          ${E.formula('Inventario promedio', 'Inv. prom.', E.frac('Inventario inicial + Inventario final', '2'))}
          <div id="ppi"></div>
          ${E.formula('Periodo promedio de inventarios', 'PPI', E.frac('Inventario promedio', 'Costo de ventas ÷ 365'), 'días que tarda el inventario en venderse')}
          <ul>
            <li><b>Con COSTO de ventas, no con ventas:</b> el inventario está registrado a costo.</li>
            <li><b>Con inventario PROMEDIO:</b> el costo de ventas sucede a lo largo del año, entre el inventario inicial y el final (como en la Tiendita: CV = Inv. inicial + compras − Inv. final).</li>
            <li>En una fábrica, el inventario = materia prima + producto en proceso + terminado, así que la rotación es un <b>proxy del ciclo de fabricación</b>.</li>
          </ul>
          <p><b>ABC:</b> CV 4,000,000 ÷ inventario promedio 2,000,000 = <b>2 veces</b> (sector 3) → peor. En días: 2,000,000 ÷ (4,000,000 ÷ 365) ≈ <b>182 días</b> (sector ≈121) → ABC tarda dos meses más en vender. <b>Cemex 2024:</b> 6.57 veces ≈ 55 días, la más eficiente (sector 5.85).</p>
        </div><div>
          ${E.tip('<q>Recuerden esto del inventario promedio… para que su diez no sea un ocho.</q> Y <q>es con el costo de los ingresos</q>, no con ventas.', 'Clase 23-sep')}
          <div id="mRdi"></div>
          <div id="rdiErr" style="margin-top:8px"></div>
        </div></div>` })}

      ${E.concept({ id: 'ppc', title: 'Periodo promedio de cobro (PPC)', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Periodo promedio de cobro', 'PPC', E.frac('Cuentas por cobrar', 'Ventas ÷ 365'), 'días que tardan tus clientes en pagarte')}
          <p>Las cuentas por cobrar nacen de las <b>ventas</b> (a precio de venta), por eso aquí sí se divide entre ventas. <b>Entre menor, mejor</b>; lo ideal es 0 o que te paguen por adelantado.</p>
          <p><b>ABC:</b> ventas 6,000,000 → PPC <b>55 días</b> vs sector 65 → ABC cobra <b>más rápido</b> (mejor). <b>Cemex 2024:</b> ≈36 días, igual que el sector: en un oligopolio los plazos se parecen.</p>
          ${E.key('<b>"Mientras más días tenga por cobrar, así de competitivo es el sector"</b>: la política de crédito la ponen los competidores. Un monopolio (gasolina) cobra de contado; quien vende pastelitos o muebles compite en precio <b>y plazo</b>.', 'Los días dicen cómo es el mercado')}
          ${E.kid('Si vendes dulces en el recreo y tus amigos te pagan hasta el viernes, tu dinero está "prestado" toda la semana. El PPC cuenta esos días.')}
        </div><div><div id="mPpc"></div></div></div>` })}

      ${E.concept({ id: 'ppdp', title: 'Periodo promedio de pago (PPdP)', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Periodo promedio de pago', 'PPdP', E.frac('Cuentas por pagar (proveedores)', 'Costo de ventas ÷ 365'), 'días que tardas en pagarle a tus proveedores')}
          <p>Los proveedores te venden a <b>costo</b> (tu compra), por eso se divide entre costo de ventas. Aquí <b>más días es mejor</b> para ti: el proveedor es un financiamiento <b>sin intereses</b>. Idealmente debe ser <b>mayor que tu PPC</b>, para no financiar tú el hueco.</p>
          <p><b>ABC:</b> PPdP <b>45 días</b> vs sector 65 → el sector aprovecha mejor a sus proveedores. Y como ABC <b>cobra a 55 y paga a 45, financia 10 días</b> con caja o préstamo. <b>Cemex 2024:</b> ≈119 días ("cuatro meses"); Heidelberg ≈76: "si le quiero vender a alguien, ¿a quién? A los alemanes".</p>
          ${E.note('Las grandes (FEMSA, América Móvil) ganan días con trámites de alta de proveedor. Y las materias primas casi nunca dan crédito: "ningún ganadero te da crédito por la leche".', 'Dato de clase')}
        </div><div><div id="mPpp"></div></div></div>` })}

      ${E.concept({ id: 'dias', title: 'Veces ↔ días: la misma información, dos idiomas', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Conversión', 'Días', E.frac('365', 'Rotación'), 'y al revés: Rotación = 365 ÷ Días')}
          <ul>
            <li><b>Rotación (veces al año):</b> más es mejor. <b>Días:</b> menos es mejor (excepto el PPdP, donde más días te conviene).</li>
            <li>6.57 veces → 365 ÷ 6.57 ≈ <b>55.5 días</b>; 25 días → 365 ÷ 25 = <b>14.6 veces</b>.</li>
          </ul>
          ${E.tip('<q>Las rotaciones para lo único que te sirven es para hacer proyecciones financieras.</q> <q>Si yo tengo que dar información, la doy en días.</q>', 'Clase 23-sep')}
          ${E.warn('Reportar "rota 2" sin decir unidades. Escribe siempre "<b>veces al año</b>" o "<b>días</b>".')}
        </div><div>
          <div id="kDias"></div>
          <div class="chart h220" id="cDias"></div>
        </div></div>` })}

      <h2 id="ciclos">3 · Ciclo operativo y ciclo de efectivo</h2>
      ${E.concept({ id: 'ciclo', title: 'Los dos ciclos', badge: 'in', html: `
        <div class="g2" style="margin-top:4px">
          <div>
            ${E.formula('Ciclo operativo', 'CO', 'PPI + PPC', 'desde que entra la materia prima hasta que cobras')}
            <p><b>Siempre es positivo</b> ("así hagas el negocio en cincuenta segundos") y lo quieres <b>lo más corto posible</b>. El capital de trabajo es justo el dinero necesario para recorrerlo.</p>
          </div>
          <div>
            ${E.formula('Ciclo de efectivo', 'CE', 'PPI + PPC − PPdP', '= ciclo operativo − periodo de pago')}
            <p>Cuántos días del ciclo operativo <b>financias tú</b>: "cuándo un peso que sale de mi empresa vuelve a ella". <b>Puede ser negativo, y lo quieres lo más negativo posible</b>: te financian proveedores (o clientes con anticipos).</p>
          </div>
        </div>
        ${E.kid('Compras limones el lunes, vendes limonada el miércoles y tu cliente te paga el viernes: tu ciclo operativo es de 4 días. Si el señor de los limones te deja pagarle hasta el sábado, ¡nunca pusiste dinero tuyo! Tu ciclo de efectivo es negativo: −1 día.')}
        ${E.warn('Un ciclo de efectivo negativo <b>sólo es bueno en una empresa sana y con margen</b>. También aparece cuando una empresa está por quebrar y simplemente no le paga a nadie.')}
        ${E.note('Con <b>anticipos</b> puedes tener un ciclo operativo largo y un ciclo de efectivo corto: fabricantes de transformadores que entregan en 2–3 años pero cobran por adelantado, obra pública (anticipo–avance–cobro), Uber que cobra al reservar.', 'Ciclo operativo largo, ciclo de efectivo corto')}
      ` })}

      <section class="concept" id="ciclo-sim">
        <header><h3>⭐ Simulador: la línea de tiempo del dinero</h3><span class="badge in">● Entra al examen</span></header>
        <p class="small muted" style="margin:0 0 8px">Mueve los días. La zona sombreada es el ciclo de efectivo: <span class="bad">rojo = días que tú financias</span>, <span class="good">verde = días que te financian</span>.</p>
        <div class="btnrow" id="efPre">
          <button class="btn on" data-p="abc" type="button">Caso ABC</button>
          <button class="btn" data-p="wal" type="button">Supermercado tipo Walmart</button>
          <button class="btn" data-p="cmx" type="button">Cementera (Cemex 2024 ≈)</button>
        </div>
        <p class="small muted" id="efPreTxt"></p>
        <div id="svgCiclo"></div>
        <div class="cols" style="margin-top:8px">
          <div id="kCiclo"></div>
          <div><div id="tCiclo"></div><div class="co key" id="txCiclo" style="margin-top:10px"></div></div>
        </div>
      </section>

      ${E.reveal('📝 Caso ABC resuelto paso a paso (así se escribe en el examen)', `
        ${E.table([
          ['Ciclo operativo', 'PPI + PPC = 182 + 55', '<b>237 días</b>', '186 días'],
          ['Ciclo de efectivo', 'CO − PPdP = 237 − 45', '<b>192 días</b>', '121 días'],
        ], { head: ['Concepto', 'Cálculo', 'ABC', 'Sector'] })}
        <p><b>Interpretación:</b> ABC tarda 237 días desde que compra hasta que cobra, 51 días más que el sector, sobre todo porque su inventario se mueve lento (182 vs 121 días). Además financia con su propio dinero 192 días del ciclo contra 121 del sector: necesita más capital de trabajo (caja o préstamos). Su punto fuerte es la cobranza (55 vs 65 días); su punto débil, el inventario y que paga rápido a proveedores (45 vs 65).</p>
        <p class="small muted">La transcripción de clase mezcla algunas cifras del sector; los apuntes del alumno (diapositiva) dicen 186 y 121.</p>
      `)}

      <h2 id="servilleta">4 · Proyección de servilleta: ¿cuánta caja libero si cobro más rápido?</h2>
      <div class="prose">
        <p>"La pista está en las rotaciones": con los días meta puedes proyectar cuentas del balance en segundos. Si una cuenta de activo <b>baja</b>, libera caja (<b>fuente</b>); si <b>sube</b>, consume caja (<b>uso</b>). Ver ${E.link('fuentes-usos', 'fuentes y usos')}.</p>
        ${E.formula('Cuenta proyectada', 'CxC proyectada', E.frac('Ventas proyectadas', '365 ÷ días meta'), '= ventas proyectadas ÷ nueva rotación')}
        ${E.formula('Sin crecimiento (atajo)', 'Caja liberada', E.frac('Ventas', '365') + ' × (días antes − días después)')}
      </div>
      <section class="concept" id="serv-sim"><div class="cols">
        <div><div id="kServ"></div></div>
        <div><div id="tServ"></div><div id="pasosServ" style="margin-top:10px"></div><div class="chart h220" id="cServ"></div></div>
      </div></section>
      ${E.reveal('El mismo truco con inventarios (Cemex, ≈)', `
        <p>El costo de ventas sube 7%: 10,761 × 1.07 ≈ <b>11,514</b>. Una nueva tecnología baja el inventario de ≈55 a <b>45 días</b> → nueva rotación 365 ÷ 45 ≈ <b>8.1 veces</b> → inventario promedio esperado ≈ 11,514 ÷ 8.1 ≈ <b>1,420 MDD</b>.</p>
        <p>En el Excel de clase, sumando cobranza e inventarios, la caja liberada quedó en <b>≈ 410 MDD</b>. Y al revés: si relajas el crédito a 70 días para ganar clientes, necesitas caja que quizá no tienes. "La administración de inversiones construye valor, y mal hecha también lo destruye."</p>
      `)}

      <h2>Lo que dijo el profe y errores típicos</h2>
      <div class="g2">
        <div>
          ${E.tip('<q>El ciclo operativo siempre es positivo.</q> <q>El ciclo de efectivo sí puede ser negativo, y yo quiero que sea lo más negativo posible.</q>', 'Clase 21-sep')}
          ${E.tip('<q>Cuando yo digo rotaciones, son veces al año. Cuando yo digo días, es los días.</q>', 'Clase 23-sep')}
          ${E.tip('Walmart prácticamente no ha pagado nada de lo que ves en sus anaqueles: cobra de contado, paga a ~90 días e invierte ese dinero. Por eso su capital de trabajo es negativo y los bancos le quieren prestar.', 'Clase 18-sep')}
          ${E.tip('Interpreta siempre contra el sector: <q>¿está mejor o peor que el sector?</q>', 'Clase 21-sep')}
        </div>
        <div>
          ${E.warn('Usar <b>ventas</b> en la rotación de inventarios, el PPI o el PPdP. Van con <b>costo de ventas</b>. Sólo el PPC (y las rotaciones de activos) van con ventas.')}
          ${E.warn('Usar el inventario final en vez del <b>promedio</b> (inicial + final) ÷ 2.')}
          ${E.warn('Confundir ciclo operativo con ciclo de efectivo, o decir que "más días es mejor" en todo. Sólo en el PPdP.')}
          ${E.warn('Creer que un ciclo de efectivo negativo siempre es bueno: sólo con margen sano.')}
        </div>
      </div>

      <h2>¿Qué pasa si…? (quiz rápido)</h2>
      <div id="qz"></div>
      `;

      // ---------------- RAFN / RAT
      mini(root, '#mRaf', [
        { k: 'v', label: 'Ventas', min: 500, max: 15000, step: 100, v: 6000, fmt: 'n' },
        { k: 'af', label: '🏭 Activo fijo neto productivo', min: 200, max: 8000, step: 100, v: 3000, fmt: 'n' },
        { k: 'imp', label: '🏙️ Activo improductivo (torre corporativa)', min: 0, max: 6000, step: 100, v: 0, fmt: 'n', hint: 'Suma activo fijo pero no vende nada' },
        { k: 'ac', label: 'Activo corriente', min: 0, max: 8000, step: 100, v: 3000, fmt: 'n' },
      ], (s) => {
        const afn = s.af + s.imp, at = afn + s.ac, rafn = s.v / afn, rat = s.v / at;
        const el = root.querySelector('#svgRaf'); if (el) el.innerHTML = svgRafn(rafn);
        return {
          tiles: [
            { label: 'RAFN', v: rafn, fmt: 'x', base: 4, better: 'up', note: 'sector ABC: 4.00x', hl: true },
            { label: 'Rotación de activos totales', v: rat, fmt: 'x', note: 'ventas ÷ activos totales' },
          ],
          txt: `Cada $1 de activo fijo genera <b>${F.$(rafn, 2)}</b> de ventas y cada $1 de inversión total, <b>${F.$(rat, 2)}</b>. ` +
            (s.imp > 0 ? `La torre de ${F.$(s.imp)} no vendió nada: sin ella la RAFN sería ${F.x(s.v / s.af)}. <b>Eso es activo improductivo.</b>` :
              rafn < 4 ? 'Estás debajo del sector (4): ¿capacidad ociosa o activo que no produce?' : 'Estás al nivel o arriba del sector: tu inversión productiva trabaja bien.'),
        };
      }, '🎛️ Tu inversión');

      // ---------------- RdI / PPI
      mini(root, '#mRdi', [
        { k: 'cv', label: 'Costo de ventas', min: 500, max: 12000, step: 100, v: 4000, fmt: 'n' },
        { k: 'v', label: 'Ventas (sólo para ver el error)', min: 500, max: 18000, step: 100, v: 6000, fmt: 'n' },
        { k: 'ii', label: 'Inventario inicial', min: 100, max: 5000, step: 100, v: 1600, fmt: 'n' },
        { k: 'if', label: 'Inventario final', min: 100, max: 5000, step: 100, v: 2400, fmt: 'n' },
      ], (s) => {
        const prom = (s.ii + s.if) / 2, rdi = s.cv / prom, ppi = prom / (s.cv / 365);
        const errEl = root.querySelector('#rdiErr');
        if (errEl) errEl.innerHTML = E.table([
          ['✓ Costo de ventas ÷ inventario promedio', F.x(rdi), D(365 / rdi)],
          ['✗ Costo de ventas ÷ inventario final', F.x(s.cv / s.if), D(365 / (s.cv / s.if))],
          ['✗ Ventas ÷ inventario promedio', F.x(s.v / prom), D(365 / (s.v / prom))],
        ], { head: ['Cálculo', 'Veces', 'Días'] });
        return {
          tiles: [
            { label: 'Inventario promedio', v: prom, fmt: 'n' },
            { label: 'Rotación de inventarios', v: rdi, fmt: 'x', base: 3, better: 'up', note: 'sector ABC: 3.00x', hl: true },
            { label: 'PPI', v: ppi, fmt: 'd', base: 365 / 3, better: 'down', note: 'sector ≈122 días' },
          ],
          txt: `El inventario da <b>${F.n(rdi, 2)} vueltas al año</b>: cada lote tarda <b>≈${F.n(ppi)} días</b> en venderse. ` + (ppi > 365 / 3 ? 'Más lento que el sector: dinero estancado en bodega.' : 'Igual o más rápido que el sector.'),
        };
      }, '🎛️ Calcula (y compara con los errores típicos)');

      // ---------------- PPC
      mini(root, '#mPpc', [
        { k: 'v', label: 'Ventas anuales', min: 500, max: 15000, step: 100, v: 6000, fmt: 'n' },
        { k: 'cxc', label: '🧾 Cuentas por cobrar', min: 0, max: 4000, step: 10, v: 904, fmt: 'n' },
      ], (s) => {
        const ppc = s.cxc / (s.v / 365);
        return {
          tiles: [
            { label: 'Ventas por día', v: s.v / 365, fmt: 'n', dec: 1 },
            { label: 'PPC', v: ppc, fmt: 'd', base: 65, better: 'down', note: 'sector ABC: 65 días', hl: true },
            { label: 'Rotación de cartera', v: ppc > 0 ? 365 / ppc : null, fmt: 'x', note: 'veces al año' },
          ],
          txt: `Tus clientes tardan <b>≈${F.n(ppc)} días</b> en pagarte. ` + (ppc < 65 ? 'Cobras más rápido que el sector: menos dinero prestado a clientes.' : 'Cobras más lento que el sector: ese dinero lo estás financiando tú.'),
        };
      });

      // ---------------- PPdP
      mini(root, '#mPpp', [
        { k: 'cv', label: 'Costo de ventas anual', min: 500, max: 12000, step: 100, v: 4000, fmt: 'n' },
        { k: 'cxp', label: '🚚 Cuentas por pagar (proveedores)', min: 0, max: 4000, step: 10, v: 493, fmt: 'n' },
        { k: 'ppc', label: 'Tu PPC (para comparar)', min: 0, max: 120, step: 1, v: 55, fmt: 'd' },
      ], (s) => {
        const ppp = s.cxp / (s.cv / 365), gap = s.ppc - ppp;
        return {
          tiles: [
            { label: 'Costo de ventas por día', v: s.cv / 365, fmt: 'n', dec: 1 },
            { label: 'PPdP', v: ppp, fmt: 'd', base: 65, better: 'up', note: 'sector ABC: 65 días', hl: true },
          ],
          txt: `Le pagas a tus proveedores a <b>≈${F.n(ppp)} días</b>. ` + (gap > 0.5 ? `Cobras a ${F.n(s.ppc)} y pagas a ${F.n(ppp)}: <b>financias ≈${F.n(gap)} días</b> entre que pagas y cobras.` : gap < -0.5 ? `Cobras ${F.n(-gap)} días <b>antes</b> de pagar: el proveedor te financia.` : 'Cobras y pagas casi al mismo tiempo.'),
        };
      });

      // ---------------- veces ↔ días
      let rot = 6.57; let cD = null;
      const tDias = E.el('<div style="margin-top:10px"></div>');
      E.knobs(root.querySelector('#kDias'), [{ k: 'r', label: 'Rotación (veces al año)', min: 1, max: 30, step: 0.1, v: 6.6, fmt: 'x', dec: 1 }], (s) => {
        rot = s.r; E.tiles(tDias, [{ label: 'Rotación', v: rot, fmt: 'x', dec: 1 }, { label: 'Equivale a', v: 365 / rot, fmt: 'd', hl: true }]);
        cD && cD.refresh();
      }, { title: '🔁 Convertidor' });
      root.querySelector('#kDias').appendChild(tDias);
      cD = E.chart(root.querySelector('#cDias'), (T) => {
        const pts = []; for (let r = 1; r <= 30; r += 0.5) pts.push([r, 365 / r]);
        return {
          ...E.baseOpt(T), legend: { show: false },
          tooltip: { ...E.baseOpt(T).tooltip, trigger: 'item', formatter: (p) => `${F.n(p.value[0], 1)} veces = ${F.n(p.value[1])} días` },
          xAxis: { type: 'value', min: 1, max: 30, name: 'veces al año', nameLocation: 'middle', nameGap: 26, nameTextStyle: { color: T.muted }, axisLine: { lineStyle: { color: T.axis } }, splitLine: { show: false }, axisLabel: { color: T.muted } },
          yAxis: E.axisVal(T, (v) => v + ' d', { name: 'días', nameTextStyle: { color: T.muted } }),
          grid: { left: 8, right: 16, top: 30, bottom: 30, containLabel: true },
          series: [
            { type: 'line', data: pts, showSymbol: false, lineStyle: { width: 2, color: T.c1 }, itemStyle: { color: T.c1 } },
            { type: 'scatter', data: [[rot, 365 / rot]], symbolSize: 12, itemStyle: { color: T.c2 }, label: { show: true, position: 'right', color: T.ink, formatter: () => `${F.n(rot, 1)}x → ${F.n(365 / rot)} días` } },
          ],
        };
      });

      // ---------------- simulador de ciclos
      let ref = PRE.abc.ref; let stC = null;
      const drawC = () => {
        if (!stC) return;
        const s = stC, CO = s.ppi + s.ppc, CE = CO - s.ppdp, V = s.ventas, cvd = V * s.cv / 365, vd = V / 365;
        const exact = s.ppi * cvd + s.ppc * vd - s.ppdp * cvd;
        root.querySelector('#svgCiclo').innerHTML = svgCiclo(s);
        E.tiles(root.querySelector('#tCiclo'), [
          { label: 'Ciclo operativo', v: CO, fmt: 'd', base: ref ? ref.co : undefined, better: 'down', note: ref ? `${ref.nm}: ${D(ref.co)}` : 'siempre positivo' },
          { label: 'Ciclo de efectivo', v: CE, fmt: 'd', base: ref ? ref.ce : undefined, better: 'down', note: ref ? `${ref.nm}: ${D(ref.ce)}` : 'negativo = te financian', hl: true },
          { label: exact >= 0 ? 'Dinero atrapado en la operación' : 'Dinero que te prestan proveedores', v: Math.abs(exact), fmt: '$', note: 'Inventario + Cuentas por cobrar − Proveedores' },
        ]);
        let t = `<b>Cómo se lee</b>Compras el día 0, vendes el día ${F.n(s.ppi)} y cobras el día <b>${F.n(CO)}</b> (ciclo operativo). Al proveedor le pagas el día <b>${F.n(s.ppdp)}</b>. `;
        if (CE > 0.5) t += `Durante <b>${F.n(CE)} días</b> el dinero lo pones tú (caja propia o préstamo): ≈ <b>${F.$(Math.max(0, exact))}</b> atrapados en la operación (inventario + clientes − proveedores). Para liberarlo: vende más rápido (↓PPI), cobra antes (↓PPC) o negocia pagar después (↑PPdP).`;
        else if (CE < -0.5) t += `Cobras <b>${F.n(-CE)} días antes</b> de pagarle al proveedor: él financia toda tu operación y te sobra ≈ <b>${F.$(Math.max(0, -exact))}</b> que puedes invertir (como Walmart). Sólo es bueno si la empresa es sana y con margen.`;
        else t += 'Cobras justo cuando pagas: nadie financia a nadie.';
        if (ref) t += ` <br>Contra el ${ref.nm} (${D(ref.co)} / ${D(ref.ce)}): ciclo operativo ${CO > ref.co ? '<b>más largo</b> (peor)' : '<b>más corto</b> (mejor)'}, ciclo de efectivo ${CE > ref.ce ? '<b>mayor</b> (peor: financias más días)' : '<b>menor</b> (mejor)'}.`;
        root.querySelector('#txCiclo').innerHTML = t;
      };
      const kC = E.knobs(root.querySelector('#kCiclo'), [
        { k: 'ppi', label: '📦 PPI · días de inventario', min: 0, max: 250, step: 1, v: 182, fmt: 'd' },
        { k: 'ppc', label: '🧾 PPC · días de cobro', min: 0, max: 120, step: 1, v: 55, fmt: 'd' },
        { k: 'ppdp', label: '🚚 PPdP · días de pago', min: 0, max: 200, step: 1, v: 45, fmt: 'd' },
        { k: 'ventas', label: 'Ventas anuales', min: 500, max: 40000, step: 500, v: 6000, fmt: 'n' },
        { k: 'cv', label: 'Costo de ventas (% de ventas)', min: 0.3, max: 0.95, step: 0.01, v: 0.67, fmt: 'pct', dec: 0 },
      ], (s) => { stC = s; drawC(); }, { title: '🎛️ Días y ventas' });
      root.querySelector('#efPreTxt').textContent = PRE.abc.txt;
      root.querySelectorAll('#efPre button').forEach((b) => b.addEventListener('click', () => {
        const p = PRE[b.dataset.p];
        root.querySelectorAll('#efPre button').forEach((x) => x.classList.toggle('on', x === b));
        root.querySelector('#efPreTxt').textContent = p.txt;
        ref = p.ref; kC.set(p.v);
      }));

      // ---------------- servilleta
      let stV = null; let cS = null;
      const drawS = () => {
        if (!stV) return;
        const s = stV, V1 = s.v * (1 + s.g), c0 = s.v / 365 * s.d0, c1 = V1 / 365 * s.d1, lib = c0 - c1, rot1 = s.d1 > 0 ? 365 / s.d1 : null;
        E.tiles(root.querySelector('#tServ'), [
          { label: 'CxC hoy', v: c0, fmt: '$' },
          { label: 'CxC proyectada', v: c1, fmt: '$' },
          { label: lib >= 0 ? 'Caja liberada (fuente) ▲' : 'Caja que necesitas (uso) ▼', v: Math.abs(lib), fmt: '$', hl: true, note: lib >= 0 ? 'baja un activo → entra caja' : 'sube un activo → sale caja' },
        ]);
        root.querySelector('#pasosServ').innerHTML = E.table([
          ['1. CxC hoy', `${F.n(s.v)} ÷ 365 × ${F.n(s.d0, 2)} días`, F.$(c0)],
          ['2. Ventas proyectadas', `${F.n(s.v)} × ${F.n(1 + s.g, 2)}`, F.$(V1)],
          ['3. Nueva rotación', `365 ÷ ${F.n(s.d1)} días`, rot1 ? F.x(rot1) : '—'],
          ['4. CxC proyectada', rot1 ? `${F.n(V1)} ÷ ${F.n(rot1, 2)}` : 'cobras de contado', F.$(c1)],
          [lib >= 0 ? '5. Caja liberada' : '5. Caja requerida', `${F.n(c0)} − ${F.n(c1)}`, F.$(lib), { cls: 'tot' }],
        ], { head: ['Paso', 'Cálculo', 'Resultado'] });
        cS && cS.refresh();
      };
      E.knobs(root.querySelector('#kServ'), [
        { k: 'v', label: 'Ventas actuales (MDD)', min: 1000, max: 40000, step: 100, v: 16200, fmt: 'n' },
        { k: 'g', label: 'Crecimiento de ventas', min: -0.2, max: 0.4, step: 0.01, v: 0.1, fmt: 'pct', dec: 0, hint: 'Pon 0% para el atajo: ventas/365 × (días antes − después)' },
        { k: 'd0', label: 'Días de cobro hoy', min: 0, max: 120, step: 0.05, v: 35.65, fmt: 'd', dec: 1 },
        { k: 'd1', label: 'Días de cobro meta', min: 0, max: 120, step: 1, v: 25, fmt: 'd' },
      ], (s) => { stV = s; drawS(); }, { title: '🧻 Servilleta (ejemplo Cemex ≈)' });
      cS = E.chart(root.querySelector('#cServ'), (T) => {
        const s = stV, V1 = s.v * (1 + s.g), c0 = s.v / 365 * s.d0, c1 = V1 / 365 * s.d1, lib = c0 - c1;
        return {
          ...E.baseOpt(T), legend: { show: false },
          tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.$(v) },
          xAxis: E.axisCat(['CxC hoy', 'CxC proyectada', lib >= 0 ? 'Caja liberada ▲' : 'Caja requerida ▼'], T),
          yAxis: E.axisVal(T, (v) => F.n(v)),
          series: [{ type: 'bar', barMaxWidth: 56, data: [
            { value: c0, itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] } },
            { value: c1, itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] } },
            { value: Math.abs(lib), itemStyle: { color: lib >= 0 ? T.good : T.bad, borderRadius: [4, 4, 0, 0] } },
          ], label: { show: true, position: 'top', color: T.ink2, formatter: (p) => F.$(p.value) } }],
        };
      });

      // ---------------- quiz
      E.quiz(root.querySelector('#qz'), [
        { q: 'Tu rotación de inventarios es 6 veces al año. ¿Cuántos días de inventario tienes?',
          o: ['6 días', '≈ 61 días', '≈ 2,190 días'], a: 1, w: 'Días = 365 ÷ rotación = 365 ÷ 6 ≈ <b>61 días</b>.' },
        { q: 'Con las mismas ventas, tu periodo de cobro sube de 35 a 45 días. ¿Qué pasa con la caja?',
          o: ['Sube, porque vendes más', 'Baja: suben las cuentas por cobrar (uso de efectivo)', 'No cambia, sólo cambian días'], a: 1,
          w: 'Más días = más CxC en el balance. Activo que sube = <b>uso</b> de efectivo. Con ventas de 16,200: 16,200 ÷ 365 × 10 ≈ 444 que dejan de entrar a caja.' },
        { q: 'Negocias pagar a tus proveedores a 90 días en vez de 60. ¿Qué cambia?',
          o: ['Baja el ciclo operativo 30 días', 'Baja el ciclo de efectivo 30 días; el operativo no cambia', 'Los dos ciclos bajan 30 días'], a: 1,
          w: 'El PPdP no entra en el ciclo operativo (PPI + PPC). Sólo resta en el ciclo de efectivo.' },
        { q: 'Una empresa tiene ciclo de efectivo de −40 días. ¿Siempre es buena señal?',
          o: ['Sí, siempre', 'Sólo si es sana y tiene margen: también pasa cuando no le paga a nadie', 'No, negativo siempre es malo'], a: 1,
          w: 'Walmart o Cemex: negativo por poder de negociación = bueno. Una empresa a punto de quebrar que deja de pagar también lo tiene negativo.' },
        { q: 'Calculaste la rotación de inventarios con VENTAS en vez de costo de ventas. ¿Qué error cometes?',
          o: ['La rotación sale inflada (más veces) y los días salen más bajos', 'La rotación sale más baja', 'Da lo mismo'], a: 0,
          w: 'Ventas > costo de ventas, así que la división sale más grande: parece que rotas más rápido de lo real. El inventario está a costo: se divide entre costo de ventas.' },
        { q: 'La empresa compra un edificio corporativo de lujo que no aumenta las ventas. ¿Qué le pasa a la RAFN?',
          o: ['Sube', 'Baja', 'No cambia porque no es inventario'], a: 1,
          w: 'Mismo numerador (ventas), denominador más grande (activo fijo neto). Activo improductivo → RAFN y rotación de activos totales bajan → baja el ROA.' },
      ]);
    },
  });
})();
