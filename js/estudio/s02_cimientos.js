// Sección 2 — Cimientos contables: A = P + C, película vs foto, costo vs gasto, costo de ventas,
// cascada del estado de resultados (EBITDA vs EBIT), depreciación, análisis vertical/horizontal, normas y lectores.
(function () {
  const f$ = (v, d = 0) => E.fmt.$(v, d);
  const n0 = (v) => E.fmt.n(v, 0);

  // ------------------------------------------------------------------ 1. Balanza A = P + C (SVG dinámico)
  function svgBalanza(a, d) {
    const c = a - d;
    const m = Math.max(a, d, 1), H = 180, base = 240;
    const ha = (a / m) * H, hd = (d / m) * H, hc = Math.max(0, c / m) * H;
    const lbl = (x, y, h, t1, t2, cls) => h >= 34
      ? `<text x="${x}" y="${y + h / 2 - 2}" text-anchor="middle" class="${cls}" font-size="15" font-weight="700">${t1}</text><text x="${x}" y="${y + h / 2 + 16}" text-anchor="middle" class="${cls}" font-size="14">${t2}</text>`
      : `<text x="${x}" y="${y - 4}" text-anchor="middle" font-size="13" class="t2">${t1} ${t2}</text>`;
    const pctT = a > 0 ? Math.round((d / a) * 100) : 0;
    // lado derecho: pasivo abajo, capital arriba
    const yP = base - hd, yC = yP - hc;
    let right = `<rect x="405" y="${yP}" width="150" height="${Math.max(hd, 0.5)}" rx="6" class="f2"/>` + lbl(480, yP, hd, 'Pasivo', f$(d), 'tw');
    if (c >= 0) right += `<rect x="405" y="${yC}" width="150" height="${Math.max(hc, 0.5)}" rx="6" class="f3"/>` + lbl(480, yC, hc, 'Capital', f$(c), 'tw');
    else {
      const hh = ((d - a) / m) * H;
      right += `<rect x="401" y="${yP - 2}" width="158" height="${hh + 4}" rx="6" class="ln sbad dash" fill="none"/><text x="480" y="${yP - 10}" text-anchor="middle" font-size="13" class="t2">⚠ Capital negativo: ${f$(c)}</text>`;
    }
    return `<svg class="ill" viewBox="0 0 640 330" role="img" aria-label="Balanza contable: activo de ${f$(a)} igual a pasivo de ${f$(d)} más capital de ${f$(c)}">
      <text x="160" y="24" text-anchor="middle" font-size="15" font-weight="700">INVERSIÓN</text>
      <text x="160" y="42" text-anchor="middle" font-size="13" class="tm">lo que la empresa tiene</text>
      <text x="480" y="24" text-anchor="middle" font-size="15" font-weight="700">FUENTES DE FINANCIAMIENTO</text>
      <text x="480" y="42" text-anchor="middle" font-size="13" class="tm">quién lo pagó</text>
      <rect x="85" y="${base - ha}" width="150" height="${Math.max(ha, 0.5)}" rx="6" class="f1"/>${lbl(160, base - ha, ha, 'Activo', f$(a), 'tw')}
      ${right}
      <rect x="70" y="${base}" width="180" height="8" rx="4" class="bg2"/><rect x="390" y="${base}" width="180" height="8" rx="4" class="bg2"/>
      <line x1="160" y1="${base + 8}" x2="160" y2="${base + 20}" class="ln"/><line x1="480" y1="${base + 8}" x2="480" y2="${base + 20}" class="ln"/>
      <rect x="110" y="${base + 20}" width="420" height="10" rx="5" class="f5"/>
      <path d="M320 ${base + 30} L290 ${base + 78} L350 ${base + 78} Z" class="f5"/>
      <circle cx="320" cy="${base + 25}" r="7" class="bg" stroke-width="2"/>
      <text x="320" y="150" text-anchor="middle" font-size="44" font-weight="700" class="${c >= 0 ? '' : 'tm'}">=</text>
      <text x="320" y="178" text-anchor="middle" font-size="12" class="tm">siempre nivelada</text>
      <text x="480" y="${base + 52}" text-anchor="middle" font-size="12" class="t2">terceros ${pctT}% · dueños ${100 - pctT}%</text>
    </svg>`;
  }

  // ------------------------------------------------------------------ 2. Ilustraciones estáticas
  const svgFoto = `<svg class="ill" viewBox="0 0 900 250" role="img" aria-label="El estado de resultados es una película de todo el año; el balance es una foto al 31 de diciembre">
    <rect x="20" y="20" width="560" height="210" rx="16" class="w1"/>
    <text x="40" y="50" font-size="17" font-weight="700">🎬 Estado de resultados = PELÍCULA</text>
    <text x="40" y="72" font-size="13" class="t2">mide un PERIODO: todo lo que pasó del 1-ene al 31-dic</text>
    <rect x="40" y="92" width="520" height="70" rx="6" class="f5"/>
    ${Array.from({ length: 12 }, (_, i) => `<rect x="${48 + i * 42.5}" y="104" width="34" height="46" rx="3" class="bg"/><text x="${65 + i * 42.5}" y="132" text-anchor="middle" font-size="11" class="t2">${['E','F','M','A','M','J','J','A','S','O','N','D'][i]}</text>`).join('')}
    ${Array.from({ length: 26 }, (_, i) => `<rect x="${44 + i * 20}" y="95" width="8" height="5" rx="1" class="bg"/><rect x="${44 + i * 20}" y="154" width="8" height="5" rx="1" class="bg"/>`).join('')}
    <text x="40" y="190" font-size="14">Ventas, costos, gastos… se <tspan font-weight="700">acumulan</tspan> durante el año.</text>
    <text x="40" y="212" font-size="13" class="tm">Pregunta que responde: ¿cuánto produjo la inversión en el periodo?</text>
    <path d="M590 125 L640 125" class="ln s5 anim-flow"/>
    <rect x="650" y="20" width="230" height="210" rx="16" class="w3"/>
    <text x="765" y="50" text-anchor="middle" font-size="17" font-weight="700">📸 Balance = FOTO</text>
    <text x="765" y="72" text-anchor="middle" font-size="13" class="t2">un INSTANTE: 31-dic, 23:59</text>
    <rect x="705" y="95" width="120" height="80" rx="12" class="f3"/><rect x="730" y="84" width="40" height="16" rx="4" class="f3"/>
    <circle cx="765" cy="135" r="26" class="bg"/><circle cx="765" cy="135" r="15" class="f3"/>
    <text x="765" y="200" text-anchor="middle" font-size="13">Al día siguiente ya cambió.</text>
  </svg>`;

  const svgLiquidez = `<svg class="ill" viewBox="0 0 900 420" role="img" aria-label="Balance ordenado por liquidez: activo circulante arriba, no circulante abajo; pasivo de corto plazo, de largo plazo y capital">
    <defs><marker id="ahc2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    <text x="230" y="26" text-anchor="middle" font-size="16" font-weight="700">ACTIVO (inversión)</text>
    <text x="640" y="26" text-anchor="middle" font-size="16" font-weight="700">PASIVO + CAPITAL (fuentes)</text>
    <g font-size="14">
      ${[['💵 Efectivo y bancos', 'f1'], ['📈 Inversiones temporales (CETES)', 'f1'], ['🧾 Clientes / deudores', 'w1'], ['📦 Inventarios', 'w1'], ['⏩ Anticipos', 'w1']].map(([t, c], i) => `<rect x="70" y="${42 + i * 38}" width="320" height="32" rx="7" class="${c}"/><text x="84" y="${63 + i * 38}" class="${c === 'f1' ? 'tw' : ''}">${t}</text>`).join('')}
      ${[['🏭 Propiedad, planta y equipo NETO', 'w3'], ['🌳 Terrenos (no se deprecian)', 'w3'], ['🔑 Otros activos de largo plazo', 'w3']].map(([t, c], i) => `<rect x="70" y="${258 + i * 38}" width="320" height="32" rx="7" class="${c}"/><text x="84" y="${279 + i * 38}">${t}</text>`).join('')}
      ${[['🤝 Proveedores (el mejor pasivo: sin interés)', 'w2'], ['🏦 Deuda de corto plazo (sólo el capital)', 'w2'], ['🏛️ Impuestos por pagar', 'w2'], ['👷 Obligaciones laborales', 'w2']].map(([t, c], i) => `<rect x="480" y="${42 + i * 38}" width="330" height="32" rx="7" class="${c}"/><text x="494" y="${63 + i * 38}">${t}</text>`).join('')}
      <rect x="480" y="258" width="330" height="32" rx="7" class="f2"/><text x="494" y="279" class="tw">🏦 Deuda de largo plazo / bonos</text>
      <rect x="480" y="296" width="330" height="32" rx="7" class="f3"/><text x="494" y="317" class="tw">👪 Capital suscrito y pagado</text>
      <rect x="480" y="334" width="330" height="32" rx="7" class="f3"/><text x="494" y="355" class="tw">🔁 Utilidades retenidas</text>
    </g>
    <line x1="50" y1="245" x2="840" y2="245" class="lnm dash"/>
    <text x="445" y="240" text-anchor="middle" font-size="13" font-weight="700" class="t2">— 1 año —</text>
    <text x="445" y="120" text-anchor="middle" font-size="12" class="tm">CIRCULANTE</text><text x="445" y="136" text-anchor="middle" font-size="12" class="tm">&lt; 1 año</text>
    <text x="445" y="300" text-anchor="middle" font-size="12" class="tm">NO CIRCULANTE</text><text x="445" y="316" text-anchor="middle" font-size="12" class="tm">&gt; 1 año</text>
    <path d="M40 50 L40 370" class="ln s5" marker-end="url(#ahc2)"/>
    <text x="30" y="210" font-size="12" class="t2" transform="rotate(-90 30 210)" text-anchor="middle">más líquido → menos líquido</text>
    <path d="M850 50 L850 370" class="ln s5" marker-end="url(#ahc2)"/>
    <text x="866" y="210" font-size="12" class="t2" transform="rotate(90 866 210)" text-anchor="middle">se paga antes → después → dueños</text>
    <text x="450" y="402" text-anchor="middle" font-size="14" font-weight="700">Total activo  =  Total pasivo + capital</text>
  </svg>`;

  const svgCostoGasto = `<svg class="ill" viewBox="0 0 900 360" role="img" aria-label="Costo: lo que toca el producto y se guarda en inventario. Gasto: lo que ayuda a vender o administrar y se va al estado de resultados del periodo">
    <defs><marker id="ahcg" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    <rect x="16" y="16" width="430" height="328" rx="16" class="w3"/>
    <text x="231" y="44" text-anchor="middle" font-size="17" font-weight="700">COSTO = toca el producto</text>
    <g font-size="13">${['🧴 Plástico', '🔵 Tapa', '🥤 Líquido', '🏷️ Etiqueta', '👷 Obrero que ensambla'].map((t, i) => `<rect x="30" y="${62 + i * 40}" width="172" height="30" rx="7" class="bg"/><text x="40" y="${82 + i * 40}">${t}</text><path d="M204 ${77 + i * 40} L234 160" class="lnm"/>`).join('')}</g>
    <rect x="236" y="120" width="60" height="96" rx="14" class="f3"/><rect x="252" y="104" width="28" height="20" rx="4" class="f3"/>
    <text x="266" y="174" text-anchor="middle" font-size="12" class="tw" font-weight="700">TWIST</text>
    <path d="M300 168 L332 168" class="ln s5" marker-end="url(#ahcg)"/>
    <rect x="338" y="120" width="96" height="92" rx="8" class="bg"/><path d="M338 140 L386 108 L434 140" class="ln"/>
    <text x="386" y="168" text-anchor="middle" font-size="13" font-weight="700">Almacén</text><text x="386" y="186" text-anchor="middle" font-size="12" class="t2">inventario</text>
    <text x="231" y="268" text-anchor="middle" font-size="14" font-weight="700">✔ Es INVENTARIABLE</text>
    <text x="231" y="290" text-anchor="middle" font-size="13" class="t2">se queda en el balance hasta que vendes;</text>
    <text x="231" y="308" text-anchor="middle" font-size="13" class="t2">al vender pasa a "costo de ventas"</text>
    <rect x="454" y="16" width="430" height="328" rx="16" class="w2"/>
    <text x="669" y="44" text-anchor="middle" font-size="17" font-weight="700">GASTO = ayuda a vender / administrar</text>
    <g font-size="13">${['📣 Agencia de publicidad', '👔 Presidente (CEO)', '🧮 Contador', '✏️ Diseñador / I+D', '🛍️ Vendedor y su comisión'].map((t, i) => `<rect x="472" y="${62 + i * 40}" width="190" height="30" rx="7" class="bg"/><text x="482" y="${82 + i * 40}">${t}</text>`).join('')}</g>
    <path d="M668 160 L720 160" class="ln s5 anim-flow" marker-end="url(#ahcg)"/>
    <rect x="726" y="112" width="140" height="96" rx="10" class="bg"/>
    <text x="796" y="146" text-anchor="middle" font-size="13" font-weight="700">Estado de</text><text x="796" y="164" text-anchor="middle" font-size="13" font-weight="700">resultados</text><text x="796" y="184" text-anchor="middle" font-size="12" class="t2">del periodo</text>
    <text x="669" y="268" text-anchor="middle" font-size="14" font-weight="700">✘ NO es inventariable</text>
    <text x="669" y="290" text-anchor="middle" font-size="13" class="t2">"se fue": el sueldo del presidente</text>
    <text x="669" y="308" text-anchor="middle" font-size="13" class="t2">no se puede guardar en el almacén</text>
  </svg>`;

  // Silo de inventario (FIFO: entra por arriba, sale por abajo)
  function svgSilo(II, C, IF) {
    const D = Math.max(II + C, 1), CV = D - IF;
    const top = 50, H = 230, bot = top + H, x0 = 300, w = 150;
    const y = (v) => bot - (v / D) * H; // altura acumulada desde abajo
    const seg = (from, to, cls) => to > from ? `<rect x="${x0}" y="${y(to)}" width="${w}" height="${y(from) - y(to)}" class="${cls}"/>` : '';
    const cut = CV; // por debajo de cut: vendido
    const parts = [
      seg(0, Math.min(II, cut), 'w3'), seg(Math.min(II, cut), II, 'f3'),
      seg(II, Math.max(II, cut), 'w1'), seg(Math.max(II, cut), D, 'f1'),
    ].join('');
    return `<svg class="ill" viewBox="0 0 760 340" role="img" aria-label="Silo de inventario: inventario inicial más compras es lo disponible; lo que sale por abajo es costo de ventas y lo que queda arriba es inventario final">
      <defs><marker id="ahsi" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
      <text x="375" y="22" text-anchor="middle" font-size="13" class="t2">🚚 Compras ${f$(C)} entran por arriba</text>
      <path d="M375 28 L375 46" class="ln s5 anim-flow" marker-end="url(#ahsi)"/>
      ${parts}
      <rect x="${x0}" y="${top}" width="${w}" height="${H}" rx="4" class="ln" fill="none"/>
      <line x1="${x0 - 12}" y1="${y(cut)}" x2="${x0 + w + 12}" y2="${y(cut)}" class="ln dash"/>
      <path d="M${x0 + 40} ${bot} L${x0 + 60} ${bot + 22} L${x0 + 90} ${bot + 22} L${x0 + 110} ${bot}" class="ln"/>
      <path d="M${x0 + 75} ${bot + 24} L${x0 + 75} ${bot + 44}" class="ln s5 anim-flow" marker-end="url(#ahsi)"/>
      <text x="375" y="${bot + 58}" text-anchor="middle" font-size="13" class="t2">sale por abajo (lo más viejo primero = FIFO)</text>
      <text x="${x0 - 18}" y="${(y(0) + y(II)) / 2 + 5}" text-anchor="end" font-size="13">Inventario inicial ${f$(II)}</text>
      <text x="${x0 - 18}" y="${(y(II) + y(D)) / 2 + 5}" text-anchor="end" font-size="13">+ Compras ${f$(C)}</text>
      <text x="${x0 - 18}" y="${top - 2}" text-anchor="end" font-size="12" class="tm">= Disponible ${f$(D)}</text>
      <path d="M${x0 + w + 16} ${y(D)} l8 0 l0 ${y(cut) - y(D)} l-8 0" class="ln"/>
      <text x="${x0 + w + 32}" y="${(y(D) + y(cut)) / 2}" font-size="14" font-weight="700">Inventario final ${f$(IF)}</text>
      <text x="${x0 + w + 32}" y="${(y(D) + y(cut)) / 2 + 18}" font-size="12" class="t2">se queda → BALANCE (lo más nuevo)</text>
      <path d="M${x0 + w + 16} ${y(cut)} l8 0 l0 ${y(0) - y(cut)} l-8 0" class="ln s2"/>
      <text x="${x0 + w + 32}" y="${(y(cut) + y(0)) / 2}" font-size="14" font-weight="700">Costo de ventas ${f$(CV)}</text>
      <text x="${x0 + w + 32}" y="${(y(cut) + y(0)) / 2 + 18}" font-size="12" class="t2">se vendió → ESTADO DE RESULTADOS</text>
      <text x="${x0 + w / 2}" y="${top + 16}" text-anchor="middle" font-size="12" class="tm">más nuevo</text>
      <text x="${x0 + w / 2}" y="${bot - 6}" text-anchor="middle" font-size="12" class="tm">más viejo</text>
    </svg>`;
  }

  const svgMatriz = `<svg class="ill" viewBox="0 0 900 290" role="img" aria-label="Matriz de costo manufacturera: materia prima, producto en proceso, producto terminado y costo de ventas">
    <defs><marker id="ahmx" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    ${[['Materia prima', 'MP', 'w3', 'Materiales directos consumidos'], ['Producto en proceso', 'PP', 'w1', 'Costo de producto terminado'], ['Producto terminado', 'PT', 'w5', 'Costo de ventas']].map(([t, s, c, out], i) => {
      const x = 20 + i * 240;
      return `<rect x="${x}" y="40" width="190" height="150" rx="14" class="${c}"/>
      <text x="${x + 95}" y="66" text-anchor="middle" font-size="15" font-weight="700">${t}</text>
      <text x="${x + 16}" y="94" font-size="13">+ Inventario inicial ${s}</text>
      <text x="${x + 16}" y="116" font-size="13">+ ${i === 0 ? 'Compras' : 'lo que llega'}</text>
      <text x="${x + 16}" y="138" font-size="13">− Inventario final ${s}</text>
      <line x1="${x + 16}" y1="148" x2="${x + 174}" y2="148" class="lnm"/>
      <text x="${x + 16}" y="170" font-size="12.5" font-weight="700">= ${out}</text>
      <path d="M${x + 192} 115 L${x + 236} 115" class="ln s5" marker-end="url(#ahmx)"/>`;
    }).join('')}
    <rect x="740" y="80" width="140" height="70" rx="14" class="f2"/>
    <text x="810" y="110" text-anchor="middle" font-size="15" font-weight="700" class="tw">Costo de</text><text x="810" y="130" text-anchor="middle" font-size="15" font-weight="700" class="tw">ventas</text>
    <rect x="236" y="214" width="200" height="30" rx="8" class="bg"/><text x="336" y="234" text-anchor="middle" font-size="13">👷 + Mano de obra directa</text>
    <rect x="236" y="250" width="200" height="30" rx="8" class="bg"/><text x="336" y="270" text-anchor="middle" font-size="13">🔥 + Costos indirectos de fabricación</text>
    <path d="M300 212 L300 192" class="ln s5" marker-end="url(#ahmx)"/>
    <text x="450" y="24" text-anchor="middle" font-size="13" class="t2">Cada tanque usa la MISMA lógica: inicial + lo que entra − final = lo que pasa al siguiente</text>
  </svg>`;

  // Depreciación de un coche de 100k a 5 años
  function svgDep(yr) {
    const cost = 100, dep = 20;
    const bars = Array.from({ length: 6 }, (_, i) => {
      const neto = cost - dep * i, x = 330 + i * 70, H = 180, base = 230, hN = (neto / cost) * H;
      const on = i === yr;
      return `<g opacity="${on ? 1 : 0.45}">
        <rect x="${x}" y="${base - H}" width="44" height="${H}" rx="4" class="w2"/>
        ${hN > 0 ? `<rect x="${x}" y="${base - hN}" width="44" height="${hN}" rx="4" class="f1"/>` : ''}
        <text x="${x + 22}" y="${base - hN - 6 > base - H + 12 ? base - hN - 6 : base - H - 6}" text-anchor="middle" font-size="12" font-weight="700">${neto}k</text>
        <text x="${x + 22}" y="${base + 18}" text-anchor="middle" font-size="12" class="t2">Año ${i}</text>
        <text x="${x + 22}" y="${base + 40}" text-anchor="middle" font-size="12" class="${on ? '' : 'tm'}">${i === 0 ? '0' : '−20k'}</text>
        <text x="${x + 22}" y="${base + 60}" text-anchor="middle" font-size="12" class="${on ? '' : 'tm'}">${i === 0 ? '−100k' : '0'}</text>
        ${on ? `<rect x="${x - 6}" y="${base - H - 24}" width="56" height="${H + 94}" rx="8" class="ln s4" fill="none"/>` : ''}
      </g>`;
    }).join('');
    const neto = cost - dep * yr;
    return `<svg class="ill" viewBox="0 0 760 310" role="img" aria-label="Coche de 100 mil depreciado en 5 años: año ${yr}, valor neto ${neto} mil">
      <g transform="translate(20,70)">
        <rect x="10" y="60" width="240" height="56" rx="18" class="f3" opacity="${0.35 + 0.65 * (neto / cost)}"/>
        <path d="M60 60 L95 22 L180 22 L215 60 Z" class="f3" opacity="${0.35 + 0.65 * (neto / cost)}"/>
        <rect x="102" y="30" width="34" height="26" rx="4" class="bg"/><rect x="142" y="30" width="34" height="26" rx="4" class="bg"/>
        <circle cx="65" cy="118" r="22" class="bg2"/><circle cx="65" cy="118" r="10" class="bg"/>
        <circle cx="195" cy="118" r="22" class="bg2"/><circle cx="195" cy="118" r="10" class="bg"/>
        <rect x="70" y="-46" width="122" height="44" rx="10" class="bg" stroke-width="1.5"/><rect x="70" y="-46" width="122" height="44" rx="10" class="lnm"/>
        <text x="131" y="-28" text-anchor="middle" font-size="12" class="tm">valor en libros</text>
        <text x="131" y="-10" text-anchor="middle" font-size="16" font-weight="700">${neto ? '$' + neto + ',000' : '$0'}</text>
      </g>
      <text x="300" y="${230 + 40}" text-anchor="end" font-size="12" class="t2">Gasto en ER:</text>
      <text x="300" y="${230 + 60}" text-anchor="end" font-size="12" class="t2">Salida de caja:</text>
      <text x="540" y="28" text-anchor="middle" font-size="13" class="t2">■ azul = PPE neto · ■ claro = depreciación acumulada</text>
      ${bars}
    </svg>`;
  }

  // ------------------------------------------------------------------ render
  E.section({
    id: 'cimientos', n: 2, group: 'base', icon: '🧱', short: 'Cimientos contables', exam: 'in',
    title: 'Cimientos contables: la balanza, la película, la foto y la cascada',
    lead: 'Todo el análisis financiero se apoya en unas pocas reglas de contabilidad. Si dominas A = P + C, costo vs gasto y la cascada del estado de resultados, las razones financieras salen solas.',
    render(root) {
      root.innerHTML = `
      <style>
        .sx-cim svg.ill{width:100%;height:auto;display:block}
        .sx-cim .cols>div{min-width:0}
        .sx-cim .tbl.txt td,.sx-cim .tbl.txt th{white-space:normal;text-align:left;vertical-align:top}
        .sx-cim .tx{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:8px;margin:10px 0}
        @media(max-width:720px){.sx-cim .tx{grid-template-columns:1fr 1fr}}
        .sx-cim .tx .btn{justify-content:center;text-align:center;min-height:40px}
        .sx-cim .bs{display:grid;grid-template-columns:1fr 1fr;gap:10px;font-size:14px;font-variant-numeric:tabular-nums}
        .sx-cim .bs>div{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:8px 10px}
        .sx-cim .bs h4{margin:0 0 4px;font-size:12px;text-transform:uppercase;letter-spacing:.05em;color:var(--muted)}
        .sx-cim .bs .r{display:flex;justify-content:space-between;gap:6px;padding:2px 4px;border-radius:5px}
        .sx-cim .bs .r.t{font-weight:700;border-top:1px solid var(--axis);margin-top:4px;padding-top:4px}
        .sx-cim .bs .r.g{color:var(--muted);font-size:12px;text-transform:uppercase;letter-spacing:.04em;margin-top:4px}
        .sx-cim .bs .dl{font-size:12px;font-weight:700;color:var(--accent-ink);margin-left:4px}
        .sx-cim .log{font-size:14px;margin-top:10px;background:var(--card);border:1px solid var(--line);border-radius:10px;padding:8px 12px;min-height:48px}
        .sx-cim .ok{color:var(--good);font-weight:700}.sx-cim .ko{color:var(--bad);font-weight:700}
        .sx-cim .interp{font-size:14.5px;background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 12px;margin-top:10px}
        .sx-cim .seg2{display:flex;gap:6px;flex-wrap:wrap;margin:8px 0}
        .sx-cim .vs{display:grid;grid-template-columns:1fr 1fr;gap:12px}
        @media(max-width:720px){.sx-cim .vs{grid-template-columns:1fr}}
      </style>
      <div class="sx-cim">

      ${E.concept({ id: 'apc', title: '⚖️ A = P + C: la balanza contable equilibrada', badge: 'in', html: `
        <div class="cols"><div>
          <p><b>¿Qué pregunta responde?</b> ¿En qué invirtió la empresa y <b>quién</b> le dio el dinero para hacerlo?</p>
          ${E.formula('Identidad contable', 'Activo', 'Pasivo + Capital', 'Inversión = Fuentes de financiamiento')}
          <ul>
            <li><b>Activo = la inversión.</b> Todo lo que la empresa tiene: caja, clientes, inventario, máquinas, edificios.</li>
            <li><b>Pasivo = terceros.</b> Lo que pusieron otros: bancos, proveedores, el gobierno (impuestos por pagar), empleados.</li>
            <li><b>Capital (patrimonio) = dueños.</b> Lo que pusieron los socios: su aportación + las utilidades que dejaron reinvertidas.</li>
          </ul>
          ${E.kid('Compras un coche de <b>$500</b>. Pones <b>$200</b> de enganche (tu dinero = capital) y el banco te presta <b>$300</b> (pasivo). El coche (activo) vale 500 = 300 + 200. Si lo pagas de contado, activo = capital. La balanza <b>siempre</b> queda nivelada.')}
          ${E.tip('<q>A mí nunca olvidarse la identidad contable.</q> Es <q>la piedra angular de la contabilidad financiera</q>: si no cuadra, estás haciendo algo mal.', 'Clases 14 y 18-sep')}
          ${E.key('<q>Una empresa nada tiene, todo lo debe</q>: lo que tiene se lo debe a terceros (pasivo) o a sus dueños (capital). Por eso <b>Capital = Activo − Pasivo</b> (es el "residual").', 'Idea clave')}
        </div><div>
          <div id="kBal"></div>
          <div id="svBal" style="margin-top:10px"></div>
          <div class="interp" id="txBal"></div>
        </div></div>

        <h3>🚲 Simulador de transacciones: cada movimiento toca DOS cuentas</h3>
        <p class="small muted">Como Jack, el de la tienda de bicis Ashmont Cycles (lectura de Narayanan), arrancas con <b>$50</b> mil de tu bolsa. Aprieta botones y mira cómo la balanza siempre cuadra (cifras en miles).</p>
        <div class="cols"><div>
          <div class="tx" id="txBtns">
            <button class="btn" data-t="prest">🏦 Pido préstamo<br>$20</button>
            <button class="btn" data-t="inv">📦 Compro inventario a crédito $10</button>
            <button class="btn" data-t="vende">🛒 Vendo con ganancia (costó 10, cobro 16)</button>
            <button class="btn" data-t="div">💸 Pago dividendo<br>$5</button>
            <button class="btn" data-t="prov">🧾 Pago al proveedor<br>$10</button>
            <button class="btn" data-t="eq">🔧 Compro equipo de contado $15</button>
          </div>
          <div class="btnrow"><button class="btn sm" id="txReset">↺ Empezar de nuevo</button></div>
          <div class="log" id="txLog">Aprieta un botón. 👆</div>
        </div><div>
          <div class="bs" id="txBS"></div>
          <div class="interp" id="txChk"></div>
        </div></div>
        ${E.warn('Pedir un préstamo <b>no es ingreso</b> y pagar el capital de un préstamo <b>no es gasto</b>: sólo mueven el balance. Al estado de resultados sólo va el <b>interés</b>. Y vender con ganancia hace crecer el <b>capital</b> (utilidades retenidas), porque la ganancia es de los dueños.')}
      ` })}

      ${E.concept({ id: 'pelicula-foto', title: '🎬 Película vs 📸 foto: estado de resultados y balance', badge: 'in', html: `
        ${E.fig(svgFoto, 'El estado de resultados acumula un periodo; el balance retrata un instante.', true)}
        <div class="cols"><div>
          <ul>
            <li><b>Estado de resultados = periodo</b> (un año, un trimestre, hasta un día). Dice cuánto <b>produjo</b> la inversión.</li>
            <li><b>Balance general = punto en el tiempo</b> (normalmente el 31-dic). Dice qué <b>tiene</b> y a quién se lo <b>debe</b>.</li>
            <li><b>Flujo de efectivo = periodo</b>, pero en caja real: por dónde entró y salió el dinero.</li>
          </ul>
          ${E.tip('<q>Escriban bien. El balance general se hace en un punto de tiempo específico.</q> El estado de resultados <q>lo que mide es un periodo</q>.', 'Clase 14-sep')}
          <h3>Devengo: utilidad ≠ caja</h3>
          <p>Se registra la venta <b>cuando ocurre</b>, aunque no te hayan pagado (en México "devengo", en otros países "causación"). Ejemplo del profe: facturas <b>7</b>, te pagan <b>5</b> y tus gastos son <b>6</b>:</p>
          ${E.table([['Utilidad contable', '7 − 6 = <b>+1</b>'], ['Caja real', '5 − 6 = <b class="bad">−1</b> (déficit)']], { head: ['', 'Cuenta'] })}
          ${E.tip('<q>¿Qué es lo que quiebra a una empresa generalmente? Es la falta de caja.</q>', 'Clase 18-sep')}
        </div><div>
          ${E.fig(svgLiquidez, 'Regla universal: el balance se ordena por LIQUIDEZ (lo que se vuelve dinero más rápido va primero).')}
          ${E.kid('<b>Líquido</b> = que lo puedes convertir en billetes rápido. Un billete ya es dinero; una deuda de tu cliente tarda un mes; un edificio puede tardar años en venderse.')}
          ${E.note('<b>Circulante</b> (corriente) = se vuelve efectivo o se paga en <b>menos de un año</b>. <b>No circulante</b> = más de un año. De aquí salen la razón corriente y la prueba ácida (' + E.link('liquidez', 'ver Liquidez') + ').', 'Circulante vs no circulante')}
          ${E.warn('Un <b>anticipo</b> que pagas (p.ej. renta adelantada) <b>no es gasto todavía</b>: es un activo circulante hasta que recibes el servicio.')}
        </div></div>
      ` })}

      ${E.concept({ id: 'costo-gasto', title: '🏷️ Costo vs gasto: "el arte de la categorización"', badge: 'in', html: `
        ${E.fig(svgCostoGasto, 'Ejemplo del profe: botella de Twist. Lo que toca la botella es costo; lo que ayuda a venderla o a administrar la empresa es gasto.', true)}
        <div class="cols"><div>
          <ul>
            <li><b>COSTO</b> = todo lo <b>directamente asociado</b> a elaborar el producto o dar el servicio: materiales + la gente que lo hace.</li>
            <li><b>GASTO</b> = lo que <b>soporta la operación</b> para poder vender y administrar (overhead): no toca el producto.</li>
            <li><b>Regla 2: el costo es inventariable, el gasto no.</b> Si fabricas y no vendes, el costo se queda guardado en el inventario (balance). El gasto "se fue" en el periodo.</li>
          </ul>
          ${E.tip('<q>El costo es inventariable, el gasto no… escríbanlo ahí, que esa también es de preguntas.</q>', 'Clase 14-sep')}
          ${E.kid('En un avión, el <b>piloto</b> es costo: sin él no hay vuelo. El <b>presidente de la aerolínea</b> es gasto: nunca toca tu vuelo. El <b>diseñador</b> de un coche también es gasto: dibuja, pero no ensambla.')}
          ${E.note('Por qué importa: <q>Hay gente que puede ser muy eficiente en costo, pero pésima administrando el gasto.</q> El costo se mide con el <b>margen bruto</b>; el gasto con el <b>margen operacional</b>.', 'Para qué sirve separarlos')}
        </div><div>
          <h3 style="margin-top:0">🎮 Clasifica: ¿costo o gasto?</h3>
          <div id="qzCG"></div>
        </div></div>
      ` })}

      ${E.concept({ id: 'costo-ventas', title: '📦 Costo de ventas: inventario inicial + compras − inventario final', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Costo de ventas (comercializadora)', 'Costo de ventas', 'Inventario inicial + Compras − Inventario final', 'Inventario inicial + Compras = Producto disponible para la venta')}
          <ul>
            <li>Una unidad pasa de inventario a costo <b>sólo cuando se vende</b>. Si vendiste 12,000 kg, en costo van <b>exactamente</b> 12,000 kg.</li>
            <li>El inventario final de un año <b>es</b> el inventario inicial del siguiente ("fotografía del tiempo").</li>
            <li>Con FIFO (primeras entradas, primeras salidas) el inventario final se valúa al <b>costo de compra más reciente</b>.</li>
          </ul>
          ${E.tip('<q>Cuando yo hablo totales me refiero al valor total. No se puede hacer con los unitarios.</q> Hazlo en <b>$ totales</b> y comprueba con <b>unidades</b>.', 'Clase 14-sep')}
          ${E.reveal('Ejemplo resuelto: tomates de La Tiendita 2025', `
            <p>Inventario inicial 2,000 kg × $300 = <b>$600,000</b>. Compras 13,500 kg × $250 = <b>$3,375,000</b>. Vendió 12,000 kg.</p>
            <p>Unidades: 2,000 + 13,500 − 12,000 = <b>3,500 kg</b> finales → valuados al último costo (FIFO): 3,500 × $250 = <b>$875,000</b>.</p>
            <p>Costo de ventas = 600,000 + 3,375,000 − 875,000 = <b>$3,100,000</b> → costo promedio ≈ 3,100,000 / 12,000 ≈ <b>$258/kg</b> (mezcla de kilos a $300 y a $250). Vende a $500 → gana ≈ $242 por kg.</p>`)}
          ${E.kid('El silo de una cervecera: la cebada entra por arriba y sale por abajo. Lo que salió (se vendió) es <b>costo</b>; lo que sigue adentro es <b>inventario</b>.')}
        </div><div>
          <div id="kCV"></div>
          <div id="svCV" style="margin-top:10px"></div>
          <div id="tCV" style="margin-top:10px"></div>
        </div></div>
        <h3>🏭 Si la empresa fabrica: la matriz de costo manufacturera</h3>
        ${E.fig(svgMatriz, 'Materia prima → producto en proceso → producto terminado → costo de ventas. "Tómenle foto" (clase 21-sep).', true)}
        ${E.note('En una fábrica, el inventario del balance = materia prima + producto en proceso + producto terminado. Por eso la ' + E.link('eficiencia', 'rotación de inventarios') + ' es un "proxy" del ciclo de fabricación.', 'Conexión')}
      ` })}

      ${E.concept({ id: 'cascada', title: '🌊 La cascada del estado de resultados (EBITDA vs EBIT)', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Utilidad bruta', 'UB', 'Ventas − Costo de ventas')}
          ${E.formula('EBITDA', 'EBITDA', 'UB − Gastos operativos (sin D&A)', '= EBIT + Depreciación y amortización')}
          ${E.formula('Utilidad operacional', 'EBIT', 'EBITDA − D&A', 'Earnings Before Interest and Taxes: el "core business"')}
          ${E.formula('Utilidad antes de impuestos', 'UAI', 'EBIT − Intereses (± otros financieros)')}
          ${E.formula('Utilidad neta', 'UN', 'UAI − Impuestos')}
          ${E.warn('En los apuntes quedó escrito <b>"Utilidad operacional = EBITDA"</b>: es un descuido muy común, pero <b>no son lo mismo</b>. La <b>utilidad operacional es el EBIT</b> (ya restó la depreciación). El <b>EBITDA = EBIT + D&amp;A</b>, siempre un poco más grande. Para la cobertura de intereses y el margen operacional usa el <b>EBIT</b>; para la cobertura del servicio de la deuda y la ecuación fundamental, el <b>EBITDA</b>.')}
          ${E.tip('El impuesto es <q>mi tercer socio… el gobierno… el que primero recibe dividendo</q>. Hasta la utilidad operacional está la operación; abajo, las decisiones de financiamiento.', 'Clase 14-sep')}
          ${E.kid('Una cascada: arriba entra toda el agua (ventas). En cada escalón alguien toma su parte: el proveedor (costo), los empleados y la oficina (gastos), el desgaste de las máquinas (depreciación), el banco (intereses) y el gobierno (impuestos). Lo que llega abajo es de los dueños.')}
        </div><div>
          <div id="kER"></div>
        </div></div>
        <div id="chER" class="chart h360" style="margin-top:12px"></div>
        <div id="tER" style="margin-top:10px"></div>
        <div class="cols" style="margin-top:12px"><div>
          <h3 style="margin-top:0">¿Quién se queda con la utilidad operacional?</h3>
          <div id="svSoc"></div>
        </div><div>
          <div class="interp" id="txER"></div>
          ${E.note('Valores de arranque = La Tiendita 2025: ventas $8,350k, costo ≈ $4,690k, empleado $840k, depreciación $100k, intereses netos $25k (40 de crédito − 15 de CETES), impuestos 30%. Utilidad neta ≈ $1,886k.', 'De dónde salen los números')}
        </div></div>
      ` })}

      ${E.concept({ id: 'depreciacion', title: '🚗 Depreciación: el gasto que no sale de la caja', badge: 'in', html: `
        <div class="cols"><div>
          ${E.formula('Depreciación anual (línea recta)', 'Depreciación', E.frac('Costo histórico', 'Vida útil (años)'), '= Costo × tasa (tabla del SAT; 20 años = 5% anual)')}
          ${E.formula('Activo fijo neto', 'PPE neto', 'Costo histórico − Depreciación acumulada')}
          <ul>
            <li>Un activo <b>físico</b> se deprecia (edificio, máquina, coche). <b>El terreno no.</b></li>
            <li>La depreciación es <b>gasto</b> en el estado de resultados, pero <b>no es salida de caja</b>: el dinero salió el día que compraste.</li>
            <li>Por eso en el flujo de efectivo se <b>suma de regreso</b> (actúa "como fuente") y el EBITDA la excluye.</li>
            <li>Baja la utilidad y por lo tanto los <b>impuestos</b>: el gobierno la permite para incentivar la inversión productiva.</li>
          </ul>
          ${E.table([
            ['Depreciación', 'Desgaste de un activo físico', 'Coche, máquina, local'],
            ['Amortización contable', 'Igual que la depreciación, pero de una <b>mejora</b> al activo', 'Pintar la tienda, nueva iluminación'],
            ['Amortización financiera', '<b>Abono a capital</b> de una deuda', 'Pagar parte del préstamo'],
          ], { head: ['Palabra', 'Qué es', 'Ejemplo'], cls: 'txt' })}
        </div><div>
          <div id="kDep"></div>
          <div id="svDep" style="margin-top:10px"></div>
          <div class="interp" id="txDep"></div>
        </div></div>
        ${E.tip('Ejemplo de clase: coche comprado en <b>$100,000</b>, línea recta a 5 años = <b>$20,000 por año</b>. <q>La factura en la caja fuerte</q> (costo histórico) nunca cambia; el neto va 100 → 80 → 60…', 'Clase 5-oct')}
        ${E.warn('En el flujo de efectivo usa el <b>PPE neto</b>, no sumes por separado el costo histórico y la depreciación acumulada. Y para estimar el CapEx: <b>CapEx = Δ activo fijo neto + depreciación del año</b> (ver ' + E.link('flujo', 'Flujo de efectivo') + ').')}
      ` })}

      ${E.concept({ id: 'vertical-horizontal', title: '📏 Análisis vertical y horizontal', badge: 'in', html: `
        <div class="cols"><div>
          <h3 style="margin-top:0">Vertical: ¿qué tamaño tiene cada pedazo?</h3>
          ${E.formula('Balance', '% vertical', E.frac('Cada cuenta', 'Activo total'))}
          ${E.formula('Estado de resultados', '% vertical', E.frac('Cada cuenta', 'Ventas (ingresos)'))}
          ${E.tip('<q>En el estado de resultados, el ingreso. En el balance, el activo. Recuerden eso.</q> Y <q>vean siempre los porcentajes, no se confundan con los absolutos.</q>', 'Clase 18-sep')}
          <p>Sirve para comparar empresas de <b>distinto tamaño</b> del mismo sector. Ejemplo (ilustrativo):</p>
          ${E.table([
            ['Ventas', '16,000', '100%', '800', '100%'],
            ['Costo de ventas', '10,880', '68%', '480', '60%'],
            ['Utilidad bruta', '5,120', '32%', '320', '40%', { cls: 'tot' }],
            ['Gastos operativos', '2,560', '16%', '96', '12%'],
            ['Utilidad operacional', '2,560', '16%', '224', '28%', { cls: 'tot' }],
          ], { head: ['', 'Gigante $', '%', 'Chica $', '%'] })}
          <p class="small">En absolutos la Gigante gana 11 veces más; en porcentajes la Chica tiene <b>mejor estructura de costo y de gasto</b>.</p>
          <div id="chVert" class="chart h220"></div>
          <p class="small muted">Balance vertical ilustrativo: <q>negocios similares tienen estructura de capital similar</q>; las cementeras tienen ≈75–80% en activo de largo plazo.</p>
        </div><div>
          <h3 style="margin-top:0">Horizontal: ¿cuánto cambió de un año a otro?</h3>
          ${E.formula('Análisis horizontal', 'Variación %', E.frac('Cuenta año posterior', 'Cuenta año anterior') + ' − 1')}
          ${E.warn('Tiene una ceguera: <b>NO MUESTRA LA MAGNITUD</b>. Pasar de $1M a $2M es +100%, pero en una empresa de $100,000M es irrelevante; en una de $20M es enorme.')}
          <div id="kHor"></div>
          <div class="seg2" id="szBtns">
            <span class="small muted" style="align-self:center">Tamaño de la empresa:</span>
            <button class="btn" data-s="20">$20M</button><button class="btn" data-s="1000">$1,000M</button><button class="btn on" data-s="100000">$100,000M</button>
          </div>
          <div id="tHor"></div>
          <div class="interp" id="txHor"></div>
        </div></div>
      ` })}

      ${E.concept({ id: 'lectores', title: '👀 Dos lectores y una regla: las razones sólo sirven comparando', badge: 'in', html: `
        <div class="vs">
          <div class="card2"><h4>👔 La gerencia</h4><p class="small">Usa los estados para ver si cumplió los objetivos que le pusieron los accionistas: eficiencia, costos, ciclos, caja para operar. Le gusta tener <b>colchón</b> (más capital de trabajo).</p></div>
          <div class="card2"><h4>💼 El accionista</h4><p class="small">Busca la rentabilidad directa de su inversión (ROE, dividendos). El dinero ocioso en la empresa le <b>cuesta</b>: podría ser dividendo.</p></div>
        </div>
        ${E.key('Una razón aislada no dice nada. <b>Siempre compárala</b>: contra el año anterior, contra el promedio del sector o contra competidores directos ("farma con farmas"; si es un conglomerado, por unidad de negocio). Y escribe <b>para quién</b> es bueno o malo: banco, dueño o gerente.', 'La regla de oro')}
        ${E.reveal('Mini caso del profe: ¿A o B está mejor? (deuda e intereses)', `
          <p>A: deuda $5,000M, intereses $450M. B: deuda $10,000M, intereses $900M (misma tasa, 9%). ¿Cuál está mejor? → <b>Falta información.</b></p>
          <p>Con más datos: patrimonio A $95,000M vs B $1,000M; utilidad operacional A $2,000M vs B $800M.</p>
          <p>Cobertura de intereses: A = 2,000 / 450 ≈ <b>4.4x</b> (holgada). B = 800 / 900 ≈ <b>0.89x</b> → la operación no alcanza para pagar intereses (pérdida). <b>B está peor</b>, y casi todo lo financian terceros.</p>`)}
        ${E.tip('<q>Solo son útiles en términos comparativos.</q> Y <q>para exámenes… utilicen las fórmulas que les muestro.</q>', 'Clase 18-sep')}
      ` })}

      ${E.concept({ id: 'normas', title: '📚 US GAAP vs IFRS (NIIF)', badge: 'out', html: `
        <p>Las reglas para construir los estados son casi universales; lo que cambia por país es lo <b>fiscal</b>. Objetivo de las normas: <b>transparencia, comparabilidad y confiabilidad</b>.</p>
        ${E.table([
          ['Dónde', 'Estados Unidos', '+110 países: Europa, México, LatAm'],
          ['Enfoque', 'Basado en <b>reglas</b>, prescriptivo ("la receta exacta")', 'Basado en <b>principios</b>, más juicio profesional'],
          ['Revaluar activos', 'No: costo histórico', 'Sí: permite valor de mercado'],
          ['Desarrollo / I+D', 'Gasto', 'Puede capitalizarse (activo) con criterios'],
          ['Divulgación', 'Más cuantitativa y formatos rígidos', 'Más información cualitativa'],
        ], { head: ['', 'US GAAP', 'IFRS / NIIF'], cls: 'txt' })}
        ${E.note('Empresas grandes (p.ej. América Móvil) llevan ambas si cotizan o se financian en EE.UU.; las diferencias suelen ser pequeñas salvo en negocios de capital intelectual. Para el examen basta saber que existen y la idea general.', 'Para saber más')}
      ` })}

      <h2>🧠 ¿Qué pasa si…?</h2>
      <div id="qzFin"></div>
      </div>`;

      // ---------------- A = P + C: knobs + balanza
      const bTxt = root.querySelector('#txBal'), bSv = root.querySelector('#svBal');
      E.knobs(root.querySelector('#kBal'), [
        { k: 'a', label: 'Activos (la inversión)', min: 100, max: 1000, step: 10, v: 500, fmt: '$' },
        { k: 'd', label: 'Deuda / pasivo (terceros)', min: 0, max: 1000, step: 10, v: 300, fmt: '$' },
      ], (s) => {
        const c = s.a - s.d;
        bSv.innerHTML = svgBalanza(s.a, s.d);
        bTxt.innerHTML = c >= 0
          ? `De cada <b>$100</b> invertidos, <b>$${Math.round((s.d / s.a) * 100)}</b> los pusieron terceros y <b>$${Math.round((c / s.a) * 100)}</b> los dueños. Capital = ${f$(s.a)} − ${f$(s.d)} = <b>${f$(c)}</b>. ${s.d / s.a > 0.6 ? 'Muy endeudada: el banco pone casi todo.' : s.d === 0 ? 'Sin deuda: los dueños financian todo (activo = capital).' : ''}`
          : `<span class="ko">⚠ La deuda (${f$(s.d)}) supera a los activos (${f$(s.a)}).</span> El capital es <b>${f$(c)}</b>: aunque vendiera todo, no alcanza para pagar. Los dueños ya no tienen nada.`;
      }, { title: '🎛️ Mueve la balanza' });

      // ---------------- simulador de transacciones
      const S0 = { caja: 50, inv: 0, eq: 0, prov: 0, prest: 0, cap: 50, ur: 0 };
      let st = { ...S0 }, last = {};
      const bsEl = root.querySelector('#txBS'), logEl = root.querySelector('#txLog'), chkEl = root.querySelector('#txChk');
      const ROWS = { A: [['caja', 'Caja'], ['inv', 'Inventario'], ['eq', 'Equipo']], P: [['prov', 'Proveedores'], ['prest', 'Préstamo bancario']], C: [['cap', 'Capital social'], ['ur', 'Utilidades retenidas']] };
      const row = (k, l) => `<div class="r${last[k] ? ' flash' : ''}"><span>${l}</span><span>${n0(st[k])}${last[k] ? `<span class="dl">${E.fmt.sgn(last[k])}</span>` : ''}</span></div>`;
      const drawBS = () => {
        const A = st.caja + st.inv + st.eq, P = st.prov + st.prest, C = st.cap + st.ur;
        bsEl.innerHTML = `<div><h4>Activo</h4>${ROWS.A.map(([k, l]) => row(k, l)).join('')}<div class="r t"><span>Total activo</span><span>${n0(A)}</span></div></div>
          <div><h4>Pasivo + Capital</h4>${ROWS.P.map(([k, l]) => row(k, l)).join('')}<div class="r g">Capital</div>${ROWS.C.map(([k, l]) => row(k, l)).join('')}<div class="r t"><span>Total P + C</span><span>${n0(P + C)}</span></div></div>`;
        chkEl.innerHTML = `${A === P + C ? '<span class="ok">✓ Cuadra:</span>' : '<span class="ko">✗ No cuadra:</span>'} Activo <b>${n0(A)}</b> = Pasivo <b>${n0(P)}</b> + Capital <b>${n0(C)}</b>`;
      };
      const ACT = {
        prest: () => ({ d: { caja: 20, prest: 20 }, m: '<b>Caja +20</b> (activo) y <b>Préstamo +20</b> (pasivo). Creció la inversión y la financió el banco. No es ingreso: no toca el estado de resultados.' }),
        inv: () => ({ d: { inv: 10, prov: 10 }, m: '<b>Inventario +10</b> (activo) y <b>Proveedores +10</b> (pasivo). El proveedor te financia sin cobrar intereses: "el mejor pasivo".' }),
        vende: () => st.inv < 10 ? { e: 'No tienes inventario para vender. Compra primero 📦.' } : ({ d: { inv: -10, caja: 16, ur: 6 }, m: '<b>Inventario −10</b> y <b>Caja +16</b> (el activo neto sube 6) y <b>Utilidades retenidas +6</b> (capital). La ganancia es de los dueños. El 10 que salió del inventario es el <b>costo de ventas</b>. (Ignoramos impuestos.)' }),
        div: () => st.caja < 5 || st.ur < 5 ? { e: st.ur < 5 ? 'Sin utilidades acumuladas no hay qué repartir: vende con ganancia primero 🛒.' : 'No alcanza la caja.' } : ({ d: { caja: -5, ur: -5 }, m: '<b>Caja −5</b> (activo) y <b>Utilidades retenidas −5</b> (capital). Los dueños se llevan dinero: baja la inversión y baja lo que ellos financian. El dividendo <b>no es gasto</b>.' }),
        prov: () => st.prov < 10 ? { e: 'No le debes $10 al proveedor.' } : st.caja < 10 ? { e: 'No alcanza la caja.' } : ({ d: { caja: -10, prov: -10 }, m: '<b>Caja −10</b> y <b>Proveedores −10</b>: bajan los dos lados. Pagar no es gasto (el costo se registró al vender).' }),
        eq: () => st.caja < 15 ? { e: 'No alcanza la caja: pide un préstamo 🏦.' } : ({ d: { caja: -15, eq: 15 }, m: '<b>Caja −15</b> y <b>Equipo +15</b>: un cambio dentro del activo. El total no se mueve; sólo cambió la forma de la inversión (menos líquida).' }),
      };
      root.querySelectorAll('#txBtns button').forEach((b) => b.addEventListener('click', () => {
        const r = ACT[b.dataset.t]();
        if (r.e) { logEl.innerHTML = `<span class="ko">✗</span> ${r.e}`; return; }
        last = r.d; Object.entries(r.d).forEach(([k, v]) => (st[k] += v));
        logEl.innerHTML = r.m; drawBS();
      }));
      root.querySelector('#txReset').addEventListener('click', () => { st = { ...S0 }; last = {}; logEl.textContent = 'Arrancas con $50 de tu bolsa: Caja +50 y Capital social +50.'; drawBS(); });
      drawBS();

      // ---------------- quiz costo vs gasto
      const CG = [
        ['El <b>piloto</b> de un vuelo de Aeroméxico', 0, 'Sin piloto no hay servicio: toca directamente el servicio.'],
        ['El <b>presidente</b> de Aeroméxico', 1, 'No interactúa con el servicio: es overhead.'],
        ['Las <b>lechugas y tomates</b> que compra La Tiendita para revender', 0, 'Es el producto mismo: costo (y es inventariable).'],
        ['El <b>diseñador</b> que dibuja un nuevo coche (I+D)', 1, 'No toca ni ensambla el producto: gasto (diseño, investigación e ingeniería conceptual).'],
        ['El <b>obrero</b> que ensambla el motor', 0, 'Mano de obra directa: costo.'],
        ['La <b>agencia de publicidad</b> de Twist', 1, 'Ayuda a vender, no forma parte de la botella: gasto.'],
        ['El <b>gerente de producción</b> de una línea específica', 0, 'Dirige directamente la fabricación de esa línea: el profe lo puso como costo.'],
        ['El <b>sueldo y comisión del vendedor</b>', 1, 'Ayuda a vender: gasto de venta.'],
      ];
      E.quiz(root.querySelector('#qzCG'), CG.map(([q, a, w]) => ({ q, o: ['Costo', 'Gasto'], a, w: (a ? 'Gasto. ' : 'Costo. ') + w })));

      // ---------------- costo de ventas (silo)
      const svCV = root.querySelector('#svCV'), tCV = root.querySelector('#tCV');
      E.knobs(root.querySelector('#kCV'), [
        { k: 'II', label: 'Inventario inicial ($ miles)', min: 0, max: 2000, step: 25, v: 750, fmt: '$' },
        { k: 'C', label: 'Compras del año ($ miles)', min: 0, max: 8000, step: 25, v: 5215, fmt: '$' },
        { k: 'IF', label: 'Inventario final ($ miles)', min: 0, max: 4000, step: 25, v: 1275, fmt: '$', hint: 'No puede ser mayor que lo disponible' },
      ], (s) => {
        const D = s.II + s.C, IF = Math.min(s.IF, D), CV = D - IF, V = 8350;
        svCV.innerHTML = svgSilo(s.II, s.C, IF);
        E.tiles(tCV, [
          { label: 'Disponible para la venta', v: D, fmt: '$' },
          { label: 'Costo de ventas', v: CV, fmt: '$', base: 4690, better: 'down', hl: true },
          { label: 'Utilidad bruta (ventas $8,350)', v: V - CV, fmt: '$', base: 3660, better: 'up', note: 'Margen bruto ' + E.fmt.pct((V - CV) / V) },
        ]);
        if (s.IF > D) tCV.insertAdjacentHTML('beforeend', '<div class="small ko" style="grid-column:1/-1">El inventario final no puede superar lo disponible: lo topé en ' + f$(D) + '.</div>');
      }, { title: '🎛️ Llena y vacía el silo (La Tiendita 2025)' });

      // ---------------- cascada del ER
      let er = {}, chER = null;
      const kER = E.knobs(root.querySelector('#kER'), [
        { k: 'V', label: 'Ventas', min: 1000, max: 15000, step: 50, v: 8350, fmt: '$' },
        { k: 'mb', label: 'Margen bruto (UB ÷ ventas)', min: 0.05, max: 0.8, step: 0.001, v: 0.438, fmt: 'pct' },
        { k: 'GO', label: 'Gastos operativos (sin depreciación)', min: 0, max: 5000, step: 10, v: 840, fmt: '$' },
        { k: 'DA', label: 'Depreciación y amortización', min: 0, max: 2000, step: 10, v: 100, fmt: '$' },
        { k: 'INT', label: 'Intereses (netos)', min: 0, max: 3000, step: 5, v: 25, fmt: '$' },
        { k: 't', label: 'Tasa de impuestos', min: 0, max: 0.4, step: 0.01, v: 0.30, fmt: 'pct', dec: 0 },
      ], (s) => {
        const UB = s.V * s.mb, CV = s.V - UB, EBITDA = UB - s.GO, EBIT = EBITDA - s.DA, UAI = EBIT - s.INT, IMP = Math.max(0, UAI) * s.t, UN = UAI - IMP;
        er = { ...s, UB, CV, EBITDA, EBIT, UAI, IMP, UN };
        if (chER) chER.refresh();
        E.tiles(root.querySelector('#tER'), [
          { label: 'Utilidad bruta', v: UB, fmt: '$', note: 'Margen bruto ' + E.fmt.pct(s.mb) },
          { label: 'EBITDA', v: EBITDA, fmt: '$', note: 'Margen EBITDA ' + E.fmt.pct(EBITDA / s.V) },
          { label: 'EBIT = utilidad operacional', v: EBIT, fmt: '$', hl: true, note: 'Margen operacional ' + E.fmt.pct(EBIT / s.V) },
          { label: 'Utilidad neta', v: UN, fmt: '$', note: 'Margen neto ' + E.fmt.pct(UN / s.V) },
          { label: 'Cobertura de intereses', v: s.INT ? EBIT / s.INT : null, fmt: 'x', note: 'EBIT ÷ intereses (en el examen, usa los intereses brutos)' },
        ]);
        // ¿quién se queda con el EBIT?
        const soc = root.querySelector('#svSoc');
        if (EBIT <= 0) {
          soc.innerHTML = `<p class="ko">La operación no genera utilidad (EBIT = ${f$(EBIT)}). No hay nada que repartir: ni al banco le alcanza.</p>`;
        } else {
          const parts = [['🏦 Banco (intereses)', Math.min(s.INT, EBIT), 'f4'], ['🏛️ Gobierno (impuestos)', IMP, 'f2'], ['👪 Dueños (utilidad neta)', Math.max(0, UN), 'f1']];
          const tot = parts.reduce((a, p) => a + p[1], 0) || 1;
          let x = 10;
          soc.innerHTML = `<svg class="ill" viewBox="0 0 620 130" role="img" aria-label="Reparto de la utilidad operacional entre banco, gobierno y dueños">
            ${parts.map(([l, v, c]) => { const w = (v / tot) * 600; const r = `<rect x="${x}" y="10" width="${Math.max(w, 0)}" height="44" class="${c}"/>${w > 60 ? `<text x="${x + w / 2}" y="38" text-anchor="middle" class="tw" font-size="14" font-weight="700">${Math.round((v / tot) * 100)}%</text>` : ''}`; x += w; return r; }).join('')}
            ${parts.map(([l, v, c], i) => `<rect x="${10 + i * 205}" y="76" width="14" height="14" rx="3" class="${c}"/><text x="${30 + i * 205}" y="88" font-size="13">${l}</text><text x="${30 + i * 205}" y="110" font-size="13" class="t2">${f$(v)}</text>`).join('')}
          </svg>`;
        }
        const tx = root.querySelector('#txER');
        tx.innerHTML = EBIT <= 0
          ? `<b class="ko">Pérdida operativa.</b> El negocio central no cubre sus costos y gastos: ningún banco presta así.`
          : UN < 0
            ? `La operación sí gana (EBIT ${f$(EBIT)}), pero los <b>intereses (${f$(s.INT)})</b> se comen todo: cobertura de ${E.fmt.x(EBIT / s.INT)} < 1. Problema de <b>financiamiento</b>, no de operación.`
            : `De cada <b>$100</b> que vende, <b>$${E.fmt.n((EBIT / s.V) * 100, 1)}</b> son utilidad operacional y <b>$${E.fmt.n((UN / s.V) * 100, 1)}</b> llegan a los dueños. El gobierno se lleva ${f$(IMP)}: <b>es el tercer socio</b>. EBITDA (${f$(EBITDA)}) − EBIT (${f$(EBIT)}) = ${f$(s.DA)} de depreciación.`;
      }, { title: '🎛️ Mueve el estado de resultados' });

      chER = E.chart(root.querySelector('#chER'), (T) => {
        const s = er;
        const steps = [
          ['Ventas', 0, s.V, s.V, 'sub'], ['Costo de ventas', s.UB, s.V, -s.CV, 'neg'], ['Utilidad bruta', 0, s.UB, s.UB, 'sub'],
          ['Gastos operativos', s.EBITDA, s.UB, -s.GO, 'neg'], ['EBITDA', 0, s.EBITDA, s.EBITDA, 'sub'], ['D&A', s.EBIT, s.EBITDA, -s.DA, 'neg'],
          ['EBIT', 0, s.EBIT, s.EBIT, 'sub'], ['Intereses', s.UAI, s.EBIT, -s.INT, 'neg'], ['UAI', 0, s.UAI, s.UAI, 'sub'],
          ['Impuestos', s.UN, s.UAI, -s.IMP, 'neg'], ['Utilidad neta', 0, s.UN, s.UN, 'sub'],
        ];
        const mk = (kind) => steps.map((r, i) => (r[4] === kind ? [i, Math.min(r[1], r[2]), Math.max(r[1], r[2]), r[3]] : null)).filter(Boolean);
        const rend = (color) => (params, api) => {
          const i = api.value(0), lo = api.value(1), hi = api.value(2), amt = api.value(3);
          const pHi = api.coord([i, hi]), pLo = api.coord([i, lo]); const w = api.size([1, 0])[0] * 0.62;
          return { type: 'group', children: [
            { type: 'rect', shape: { x: pHi[0] - w / 2, y: pHi[1], width: w, height: Math.max(1, pLo[1] - pHi[1]), r: 3 }, style: { fill: color } },
            { type: 'text', style: { text: E.fmt.n(amt, 0), x: pHi[0], y: pHi[1] - 4, align: 'center', verticalAlign: 'bottom', fill: T.ink2, fontSize: 11 } },
          ] };
        };
        const ser = (name, kind, color) => ({ name, type: 'custom', renderItem: rend(color), encode: { x: 0, y: [1, 2] }, data: mk(kind), itemStyle: { color } });
        return {
          ...E.baseOpt(T),
          grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
          tooltip: { trigger: 'item', backgroundColor: T.card, borderColor: T.line, textStyle: { color: T.ink, fontSize: 13 }, formatter: (p) => `${steps[p.value[0]][0]}: <b>${E.fmt.$(p.value[3])}</b>` },
          xAxis: E.axisCat(steps.map((r) => r[0]), T, { axisLabel: { color: T.ink2, fontSize: 11, interval: 0, rotate: 30 } }),
          yAxis: E.axisVal(T, (v) => E.fmt.n(v)),
          series: [ser('Subtotal', 'sub', T.c1), ser('Resta', 'neg', T.c2)],
        };
      });

      // ---------------- depreciación
      const svDep = root.querySelector('#svDep'), txDep = root.querySelector('#txDep');
      E.knobs(root.querySelector('#kDep'), [{ k: 'y', label: 'Año', min: 0, max: 5, step: 1, v: 0, fmt: 'n' }], (s) => {
        const y = s.y, acc = 20 * y, neto = 100 - acc;
        svDep.innerHTML = svgDep(y);
        txDep.innerHTML = y === 0
          ? 'Año 0: compras el coche en <b>$100,000</b>. Aquí sí <b>sale la caja</b> (es inversión, CapEx). Todavía no hay gasto por depreciación.'
          : `Año ${y}: gasto por depreciación del año <b>$20,000</b> (estado de resultados) · depreciación acumulada <b>$${n0(acc)},000</b> · PPE neto <b>$${n0(neto)},000</b> (balance). Salida de caja este año: <b>$0</b>.${y === 5 ? ' Totalmente depreciado: vale $0 en libros aunque siga funcionando (el valor comercial es otra cosa).' : ''}`;
      }, { title: '🎛️ Avanza los años' });

      // ---------------- vertical (gráfica) y horizontal
      E.chart(root.querySelector('#chVert'), (T) => {
        const cats = ['Supermercado', 'Cementera'];
        const S = [['Caja', [12, 6]], ['Clientes', [3, 8]], ['Inventarios', [20, 8]], ['Activo fijo y otros LP', [65, 78]]];
        return {
          ...E.baseOpt(T), grid: { left: 8, right: 24, top: 34, bottom: 8, containLabel: true },
          tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => v + '% del activo' },
          xAxis: E.axisVal(T, (v) => v + '%', { max: 100 }), yAxis: E.axisCat(cats, T),
          series: S.map(([name, d], i) => ({ name, type: 'bar', stack: 'a', barWidth: 26, data: d, itemStyle: { color: T.c[i] } })),
        };
      });

      let size = 100000;
      const tHor = root.querySelector('#tHor'), txHor = root.querySelector('#txHor');
      const kHor = E.knobs(root.querySelector('#kHor'), [
        { k: 'a', label: 'Cuenta año anterior ($ millones)', min: 0.5, max: 10, step: 0.5, v: 1, fmt: 'n', dec: 1 },
        { k: 'p', label: 'Cuenta año posterior ($ millones)', min: 0, max: 20, step: 0.5, v: 2, fmt: 'n', dec: 1 },
      ], (s) => {
        const varp = s.p / s.a - 1, abs = s.p - s.a, mag = Math.abs(abs) / size;
        E.tiles(tHor, [
          { label: 'Variación % (horizontal)', v: varp, fmt: 'pct', hl: true },
          { label: 'Cambio absoluto', v: abs, fmt: 'n', dec: 1, note: 'millones' },
          { label: 'Cambio vs tamaño de la empresa', v: mag, fmt: 'pct', dec: mag < 0.001 ? 3 : 1 },
        ]);
        txHor.innerHTML = `${s.p} / ${s.a} − 1 = <b>${E.fmt.pct(varp)}</b>. ` + (mag < 0.01
          ? `Pero equivale a sólo <b>${E.fmt.pct(mag, 3)}</b> de una empresa de ${f$(size)}M: <b>irrelevante</b>, aunque el porcentaje asuste.`
          : mag < 0.1 ? `Equivale a <b>${E.fmt.pct(mag)}</b> de la empresa: <b>sí es relevante</b>; pregunta por qué cambió.` : `¡Equivale a <b>${E.fmt.pct(mag)}</b> de la empresa! Aquí sí es un cambio <b>material</b>: investiga la causa.`);
      }, { title: '🎛️ Prueba la ceguera del horizontal' });
      root.querySelectorAll('#szBtns button').forEach((b) => b.addEventListener('click', () => {
        size = +b.dataset.s; root.querySelectorAll('#szBtns button').forEach((x) => x.classList.toggle('on', x === b)); kHor.set({});
      }));

      // ---------------- quiz final
      E.quiz(root.querySelector('#qzFin'), [
        { q: 'La empresa paga $100 de <b>capital</b> de su préstamo bancario. ¿Qué pasa en el estado de resultados?', o: ['Gasto financiero de $100', 'Nada: sólo bajan caja y deuda (balance)', 'Baja la utilidad bruta'], a: 1, w: 'El capital del préstamo es balance (caja −100, deuda −100). Al estado de resultados sólo va el interés.' },
        { q: 'Compras inventario por $50 <b>a crédito</b>. ¿Cómo queda A = P + C?', o: ['Activo +50 y Capital +50', 'Activo +50 y Pasivo (proveedores) +50', 'Activo no cambia'], a: 1, w: 'Inventario (activo) sube y proveedores (pasivo) sube: un tercero te financió.' },
        { q: 'Fabricas 100 botellas y vendes 60. ¿Dónde está el costo de las 40 que no vendiste?', o: ['En el costo de ventas', 'En el inventario (balance)', 'En gastos de administración'], a: 1, w: 'El costo es inventariable: se queda en el balance hasta que se venda.' },
        { q: 'Una empresa tiene utilidad operacional de $900 y depreciación de $100. ¿Cuál es su EBITDA?', o: ['$800', '$900', '$1,000'], a: 2, w: 'EBITDA = EBIT + D&A = 900 + 100 = 1,000. La utilidad operacional es el EBIT, no el EBITDA.' },
        { q: 'Un rubro pasa de $1M a $3M (+200%) en una empresa con activos de $50,000M. ¿Conclusión?', o: ['Alarma: creció 200%', 'Poco material: hay que ver la magnitud', 'Error contable seguro'], a: 1, w: 'El horizontal no muestra magnitud: $2M es 0.004% de la empresa.' },
      ]);
    },
  });
})();
