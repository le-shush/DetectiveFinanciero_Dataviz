// Sección 10 — Casos reales: cementeras 2024 vs 2025, Walmex vs Chedraui vs La Comer (FCL),
// Detective financiero (huella por industria + mini-juego), Juego de razones / Desai, ABC y AAL,
// y la plantilla para "contar la historia con razones".
// Todas las cifras van incrustadas como constantes (sin fetch). Fuentes en los comentarios de cada bloque.
(function () {
  'use strict';

  // =====================================================================================
  // 1) CEMENTERAS — fuente: Razonescementeras_2024_2025_Consolidado.xlsx, hoja "Comparativo Razones"
  //    (millones de USD, base Bloomberg/EGADE). Orden de cada par: [2024, 2025].
  //    bench = promedio simple de las 3 (columna "Benchmark" del Excel; para CNT se calcula aquí).
  // =====================================================================================
  const CO = [
    { k: 'cemex', n: 'CEMEX', c: 'c1' },
    { k: 'holcim', n: 'Holcim', c: 'c2' },
    { k: 'heid', n: 'Heidelberg', c: 'c3' },
  ];
  const R = {
    rc: { g: 'Liquidez', n: 'Razón corriente', fmt: 'x', b: 'up', cemex: [0.8232, 0.8299], holcim: [1.2494, 1.3245], heid: [1.2676, 1.2359], bench: [1.1134, 1.1301],
      lee: 'CEMEX es la única <b>debajo de 1</b>: tiene 83 centavos de activo corriente por cada dólar que debe a corto plazo. No es quiebra: sus <b>proveedores la financian</b> (le dan ~119 días). Holcim mejora (1.32x) y Heidelberg baja un poco (1.24x).' },
    pa: { g: 'Liquidez', n: 'Prueba ácida', fmt: 'x', b: 'up', cemex: [0.5795, 0.622], holcim: [0.9299, 1.0927], heid: [0.874, 0.8379], bench: [0.7945, 0.8509],
      lee: 'Holcim es la <b>única arriba de 1</b> en 2025 (mucha caja: ≈6,856 mill.). En cemento el inventario (cal, clinker) sí se vende rápido, así que una prueba ácida &lt; 1 preocupa menos que en tecnología. Chequeo: siempre es menor que la razón corriente.' },
    cnt: { g: 'Liquidez', n: 'Capital neto de trabajo (mill. USD)', fmt: '$', b: null, cemex: [-1077, -1250], holcim: [2680, 3027], heid: [2010, 1927],
      lee: 'CEMEX opera con capital de trabajo <b>negativo</b> (−1,250 mill.): el pasivo corriente es mayor que el activo corriente porque proveedores y deuda de corto plazo financian la operación. Ojo: en 2025 parte del pasivo corriente es <b>deuda de corto plazo que se multiplicó ×4.7</b>, no sólo proveedores.' },
    rdi: { g: 'Eficiencia', n: 'Rotación de inventarios (veces)', fmt: 'x', b: 'up', cemex: [6.5738, 7.1854], holcim: [4.936, 3.9107], heid: [6.0484, 6.3124], bench: [5.8528, 5.8028], bad: { holcim: 1 },
      lee: 'CEMEX es la <b>más eficiente</b> y además mejora: rota su inventario 7.2 veces al año (con <b>costo de ventas</b> e <b>inventario promedio</b>). La caída de Holcim está distorsionada: su costo de ventas bajó por la escisión de Amrize.' },
    dso: { g: 'Eficiencia', n: 'Periodo promedio de cobro (días)', fmt: 'd', b: 'down', cemex: [35.65, 40.05], holcim: [36.86, 43.55], heid: [35.84, 42.5], bench: [36.12, 42.03],
      lee: 'Las <b>tres</b> cobran ≈5–7 días más lento. Cuando todas se mueven igual, la causa es <b>el mercado</b> (clientes pagando más lento), no la gestión de una sola. Es un oligopolio: términos de crédito parecidos.' },
    dio: { g: 'Eficiencia', n: 'Periodo promedio de inventario (días)', fmt: 'd', b: 'down', cemex: [55.52, 50.8], holcim: [73.95, 93.33], heid: [60.35, 57.82], bench: [63.27, 67.32], bad: { holcim: 1 },
      lee: 'CEMEX baja de 55.5 a <b>50.8 días</b>: la mejor mejora de eficiencia del grupo (plan de ahorros del nuevo CEO). Heidelberg también mejora. Holcim sube a 93 días, pero está distorsionado por la escisión.' },
    dpo: { g: 'Eficiencia', n: 'Periodo promedio de pago (días)', fmt: 'd', b: null, cemex: [119.42, 119.07], holcim: [131.13, 167.1], heid: [75.7, 76.75], bench: [108.75, 120.97],
      lee: 'Tres filosofías: Holcim paga a <b>167 días</b> (extremo), CEMEX a ≈119 y Heidelberg a ≈77 (paga rápido: "si quiero venderle a alguien, a los alemanes"). Más días = el proveedor te financia más, pero estirar demasiado tensa la relación.' },
    ce: { g: 'Eficiencia', n: 'Ciclo de efectivo (días)', fmt: 'd', b: 'down', cemex: [-28.25, -28.22], holcim: [-20.32, -30.21], heid: [20.49, 23.57], bench: [-9.36, -11.62],
      lee: 'CEMEX y Holcim tienen ciclo <b>negativo</b>: cobran antes de pagarle al proveedor ("el dinero nunca sale de la empresa"). <b>Heidelberg es la única positiva</b> (+24 días): financia su operación con su propio balance.' },
    da: { g: 'Endeudamiento', n: 'Nivel de endeudamiento (pasivo / activo)', fmt: 'pct', b: 'down', cemex: [0.543, 0.5288], holcim: [0.485, 0.5213], heid: [0.4645, 0.4659], bench: [0.4975, 0.5054],
      lee: 'CEMEX sigue siendo la <b>más endeudada</b> (52.9%) aunque baja un poco. Pero el total esconde la mezcla: su <b>deuda de corto plazo pasó de 458 a 2,135 mill.</b> (×4.7). Heidelberg es la menos endeudada (46.6%).' },
    ci: { g: 'Endeudamiento', n: 'Cobertura de intereses (veces)', fmt: 'x', b: 'up', cemex: [4.9251, 4.1702], holcim: [9.0728, 7.6923], heid: [10.8586, 9.5186], bench: [8.2855, 7.127],
      lee: 'Las tres bajan (señal del sector: tasas más altas). CEMEX es la <b>más débil</b>: 4.17x, porque su gasto por intereses subió 19% (360 → 429 mill.) con la misma utilidad operativa. Se usa el <b>gasto</b> por intereses, no el neto.' },
    mo: { g: 'Rentabilidad', n: 'Margen operacional', fmt: 'pct', b: 'up', cemex: [0.1093, 0.1109], holcim: [0.1859, 0.159], heid: [0.1362, 0.1386], bench: [0.1438, 0.1362],
      lee: '<b>El margen más honesto</b>: no lo tocan ventas de negocios ni tipo de cambio. CEMEX casi igual (11.1%), Heidelberg sube (13.9%). Holcim baja por la escisión, aunque su operación recurrente fue récord.' },
    mn: { g: 'Rentabilidad', n: 'Margen neto (rendimiento neto de ventas)', fmt: 'pct', b: 'up', cemex: [0.0592, 0.0601], holcim: [0.1152, 0.8427], heid: [0.0884, 0.0976], bench: [0.0876, 0.3335], bad: { holcim: 1, bench: 1 },
      lee: 'Holcim "gana" 84 centavos por cada dólar vendido: <b>imposible en cemento</b>. Es la ganancia contable (no es caja) de escindir Amrize. El margen neto de CEMEX sube un pelito, pero gracias a la venta de República Dominicana y al tipo de cambio.' },
    roa: { g: 'Rentabilidad', n: 'ROA (utilidad neta / activo total)', fmt: 'pct', b: 'up', cemex: [0.0351, 0.0335], holcim: [0.0578, 0.3776], heid: [0.0538, 0.0568], bench: [0.0489, 0.156], bad: { holcim: 1, bench: 1 },
      lee: 'Heidelberg sube a 5.7% sin ayudas extraordinarias. CEMEX baja a 3.4%: <b>la más baja</b> (invierte más activo, 28,945 mill., para la misma utilidad). Holcim 38%: artefacto contable.' },
    roe: { g: 'Rentabilidad', n: 'ROE (utilidad neta / capital)', fmt: 'pct', b: 'up', cemex: [0.0769, 0.0711], holcim: [0.1122, 0.7889], heid: [0.1004, 0.1063], bench: [0.0965, 0.3221], bad: { holcim: 1, bench: 1 },
      lee: 'Heidelberg da <b>más ROE (10.6%) con menos deuda</b> (46.6%). CEMEX da 7.1% con más deuda (52.9%): <b>el apalancamiento no le está rindiendo</b>. Holcim 79% no es rentabilidad real.' },
  };
  // promedio para la razón que no trae benchmark en el Excel
  R.cnt.bench = [0, 1].map((i) => (R.cnt.cemex[i] + R.cnt.holcim[i] + R.cnt.heid[i]) / 3);
  const RK = Object.keys(R);
  const fmtK = (r, v, d) => (r.fmt === '$' ? E.fmt.$(v) : E.fmtBy(r.fmt, v, d ?? (r.fmt === 'pct' ? 1 : r.fmt === 'd' ? 1 : 2)));

  // CEMEX: de dónde salió la utilidad (hoja "Comparativo Estados", millones de USD)
  const CMX = [
    ['Ventas', 16200, 16132],
    ['Utilidad de operación', 1771, 1789],
    ['Intereses y otros no operativos (sin cambiario)', -487, -448],
    ['Efecto cambiario (− pérdida / + ganancia)', -353, 232],
    ['Partidas anormales (deterioros 538, reestructura 179…)', 49, -784],
    ['Impuestos', -67, -385],
    ['Utilidad de operaciones continuas', 912, 404],
    ['Operaciones discontinuas (venta de Rep. Dominicana)', 47, 566],
    ['Utilidad neta (incl. minoritario)', 959, 970],
  ];

  // =====================================================================================
  // 3) DETECTIVE — fuente: C:\ClaudeCode\DetectiveFinanciero\data\data.json (promedios por industria, cierre 2025)
  //    y hoja Resumen (empresas A–D). Balance como fracción del activo total.
  // =====================================================================================
  const INDS = ['O&G', 'Biotech', 'Tecnología', 'Pharma'];
  const INDN = { 'O&G': 'Gas y petróleo', Biotech: 'Biotecnología', 'Tecnología': 'Tecnología', Pharma: 'Farmacéutica' };
  const DV = [ // k, nombre, unidad, promedios [O&G, Biotech, Tech, Pharma], empresas [A,B,C,D]
    { k: 'caja', n: 'Caja + inversiones CP (% activo)', u: 'pct', avg: [0.045, 0.295, 0.196, 0.106], co: [0.302, 0.065, 0.023, 0.130] },
    { k: 'ppe', n: 'PP&E neto (% activo)', u: 'pct', avg: [0.662, 0.071, 0.292, 0.194], co: [0.064, 0.219, 0.767, 0.113] },
    { k: 'intang', n: 'Intangibles + otros LP (% activo)', u: 'pct', avg: [0.127, 0.430, 0.298, 0.428], co: [0.329, 0.261, 0.128, 0.542] },
    { k: 'dinv', n: 'Días de inventario', u: 'd', avg: [26.7, 178.9, 102.0, 241.7], co: [91.7, 352.3, null, null] },
    { k: 'rat', n: 'Rotación de activos totales', u: 'x', avg: [0.943, 0.546, 0.561, 0.528], co: [1.36, 0.68, 0.25, 0.34] },
    { k: 'mo', n: 'Margen operacional', u: 'pct', avg: [0.115, 0.150, 0.324, 0.368], co: [0.604, 0.404, 0.181, 0.188] },
    { k: 'roe', n: 'ROE', u: 'pct', avg: [0.096, 0.118, 0.340, 0.445], co: [1.015, 1.012, 0.062, 0.074] },
    { k: 'nde', n: 'Nivel de endeudamiento', u: 'pct', avg: [0.456, 0.458, 0.391, 0.648], co: [0.239, 0.764, 0.565, 0.380] },
  ];
  const REAL = [ // respuesta entregada por el Equipo 3 (4-oct-2026)
    { n: 'A', ind: 'Tecnología', why: 'Mucha caja e inversiones de CP (30%), poco pasivo (24%), margen operacional 60% y ROE 101% (como NVIDIA). Sí tiene inventario (≈92 días): vende chips, algo tangible.' },
    { n: 'B', ind: 'Pharma', why: 'Inventario de rotación lentísima (352 días), la más endeudada (76% de pasivo → por eso su ROE de 101% es apalancamiento), margen operacional ≈40% (≈ Eli Lilly).' },
    { n: 'C', ind: 'O&G', why: 'PP&E 77% del activo y rotación de activos 0.25 (necesita muchísima inversión para vender), prueba ácida 0.48 y ROE 6%: la huella de petróleo y gas.' },
    { n: 'D', ind: 'Biotech', why: 'Intangibles/otros LP 54% (licencias, moléculas, goodwill), PP&E bajo (11%), razón corriente 2.7, margen y ROE moderados (reinvierte en I+D). Ojo: en el dashboard D queda cerca de Tech; la entrega la asignó a Biotech por eliminación y por su ROE bajo.' },
  ];

  // =====================================================================================
  // 4) JUEGO DE RAZONES (Equipo 6, 2026) y Desai (2013) — fuente: notes/lecturas_entregas.md (B1 y A5)
  // =====================================================================================
  const CARDS = [
    { ic: '🏦', ind: 'Servicios financieros diversificados', p: ['Días de cobro: <b>3,577</b>', 'Capital: sólo <b>8%</b> del activo', 'Flujo operativo <b>negativo</b> (−11,820 mill.)'],
      l: 'Sus "cuentas por cobrar" son <b>préstamos</b>: cobrar en 10 años es su negocio. Prestar más = flujo operativo negativo, y es normal. (Desai: Citigroup ≈8,047 días).' },
    { ic: '✈️', ind: 'Aerolínea', p: ['Razón corriente <b>0.5x</b>', 'Capital <b>−6%</b>', 'Cobra en <b>13.7 días</b> (tarjeta)'],
      l: 'Razón corriente &lt; 1 <b>no es quiebra</b>: el pasivo corriente incluye boletos vendidos y no volados (el cliente pagó por adelantado).' },
    { ic: '🏨', ind: 'Hotelera asset-light (marcas y franquicias)', p: ['Capital contable <b>−13.7%</b>', 'Goodwill + intangibles <b>69.9%</b>', 'PP&E sólo 10.5%; margen neto 9.9%'],
      l: 'Capital negativo con utilidades: <b>recompra más acciones de lo que gana</b>. No es pérdida; es devolver dinero al accionista.' },
    { ic: '🛍️', ind: 'Off-price (ropa y hogar)', p: ['Rotación de activos <b>1.8x</b> (la más alta)', 'ROE <b>59%</b> (el más alto)', 'Proveedores 22.8% &gt; inventario 20.4%'],
      l: 'ROE alto <b>por rotación</b>, no por margen (neto 9%). Sus proveedores le pagan el inventario: capital de trabajo negativo, como Walmart.' },
    { ic: '☁️', ind: 'Tecnológica megacap (software / nube)', p: ['Margen neto <b>40%</b>', 'Flujo operativo 25× la siguiente', 'Inventario ≈0 (rota 91x); ROE 34%'],
      l: 'Convierte cada venta en mucha utilidad y mucha caja. Su PP&E (44%) son centros de datos, no fábricas.' },
    { ic: '⚛️', ind: 'Computación cuántica (pre-comercial)', p: ['Margen neto <b>−393%</b>', 'I+D = <b>235%</b> de las ventas', 'Razón corriente <b>15.5x</b>; deuda 0%'],
      l: 'Quema caja que levantó en bolsa. Liquidez enorme ≠ buena empresa: es <b>colchón para sobrevivir</b> hasta tener ventas.' },
    { ic: '⛏️', ind: 'Minería', p: ['PP&E <b>51%</b>', 'Margen neto <b>32%</b>, ROE 43%', 'Razón corriente 3.9x; otros pasivos LP 16.5% (cierre de minas)'],
      l: 'Capital intensivo como O&amp;G, pero con precios de metales altos el margen se dispara. El "otro pasivo" es la obligación de cerrar la mina.' },
    { ic: '🥫', ind: 'Hard discount de comida', p: ['Días de cobro <b>0.6</b>', 'Margen neto <b>3.5%</b>', 'Inventario 20% (rota 4.5x)'],
      l: 'Vende de contado y gana por <b>volumen</b>, no por margen (como Food Lion en Desai).' },
    { ic: '🍔', ind: 'Holding de comida rápida (franquicias)', p: ['Payout <b>91.5%</b>', 'Goodwill + intangibles <b>68%</b>', 'Inventario rota 28x (perecederos)'],
      l: 'Cobra regalías de franquicias: negocio estable que reparte casi toda la utilidad como dividendo.' },
  ];
  const DSO_SCALE = [ // días de cobro — termómetro del modelo de negocio (B1, B2, Detective)
    ['Hard discount', 0.6], ['Aerolínea', 13.7], ['CEMEX 2025', 40.0], ['Dispositivos médicos', 66.2], ['Operador de prisiones', 67.4],
    ['Pharma (prom. Detective)', 75.7], ['Infraestructura IT', 97.9], ['Hotelera asset-light', 149.5], ['Financiera diversificada', 3577.5],
  ];

  // =====================================================================================
  // 5) ABC — fuente: notes/transcripts_A.md (18-sep) y transcripts_B.md (21 y 23-sep). Ejemplo del profe.
  // =====================================================================================
  const ABC = [
    ['Razón corriente', '3.0x', '4.0x', '✗ peor'],
    ['Prueba ácida', '1.0x', '0.8x', '✓ mejor'],
    ['Rotación de activos fijos netos', '2.0x', '4.0x', '✗ peor'],
    ['Rotación de inventarios', '2 veces', '3 veces', '✗ peor'],
    ['Periodo promedio de cobro', '55 días', '65 días', '✓ mejor'],
    ['Periodo promedio de inventario', '182 días', '121 días', '✗ peor'],
    ['Periodo promedio de pago', '45 días', '65 días', '✗ peor'],
    ['Nivel de endeudamiento', '50%', '60%', '✓ menos deuda'],
    ['Margen neto', '2.5%', '5%', '✗ peor'],
    ['ROA', '2.5%', '5%', '✗ peor'],
  ];

  // =====================================================================================
  // Ilustraciones SVG
  // =====================================================================================
  const silo = (x, cls, name, verdict, sub, mark) => `
    <g>
      <rect x="${x}" y="70" width="120" height="150" rx="14" class="${cls}"/>
      <path d="M${x} 82 Q ${x + 60} 30 ${x + 120} 82" class="${cls}"/>
      <rect x="${x + 40}" y="180" width="40" height="40" rx="6" class="bg"/>
      <text x="${x + 60}" y="140" text-anchor="middle" class="tw" font-size="17" font-weight="700">${name}</text>
      <text x="${x + 60}" y="252" text-anchor="middle" font-size="19" font-weight="700">${mark} ${verdict}</text>
      <text x="${x + 60}" y="278" text-anchor="middle" font-size="15.5" class="t2">${sub[0]}</text>
      <text x="${x + 60}" y="299" text-anchor="middle" font-size="15.5" class="t2">${sub[1]}</text>
    </g>`;
  const svgCem = `<svg class="ill" viewBox="0 0 860 316" role="img" aria-label="Tres cementeras: Heidelberg mejoró, CEMEX empeoró y Holcim se partió en dos">
    ${silo(70, 'f3', 'Heidelberg', 'Mejoró', ['utilidad "limpia" +16%', 'menos deuda, más cobertura'], '▲')}
    ${silo(370, 'f1', 'CEMEX', 'Empeoró', ['op. continuas −56%', 'la salvan RD y el tipo de cambio'], '▼')}
    <g>
      <rect x="640" y="70" width="70" height="150" rx="14" class="f2"/>
      <path d="M640 82 Q 675 40 710 82" class="f2"/>
      <rect x="738" y="92" width="62" height="128" rx="14" class="w2"/>
      <line x1="724" y1="50" x2="724" y2="230" class="ln dash"/>
      <text x="675" y="150" text-anchor="middle" class="tw" font-size="15" font-weight="700">Holcim</text>
      <text x="769" y="160" text-anchor="middle" font-size="13" font-weight="700">Amrize</text>
      <text x="720" y="252" text-anchor="middle" font-size="19" font-weight="700">✂ No comparable</text>
      <text x="720" y="278" text-anchor="middle" font-size="15.5" class="t2">escindió Norteamérica</text>
      <text x="720" y="299" text-anchor="middle" font-size="15.5" class="t2">→ ganancia contable gigante</text>
    </g>
    <text x="430" y="24" text-anchor="middle" font-size="15" class="tm">2024 → 2025 · mismas razones, misma industria, tres historias distintas</text>
  </svg>`;

  const svgWal = `<svg class="ill" viewBox="0 0 860 230" role="img" aria-label="Línea de tiempo: Walmex cobra de contado y le paga al proveedor meses después">
    <defs><marker id="ahc1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    <line x1="60" y1="120" x2="800" y2="120" class="ln" marker-end="url(#ahc1)"/>
    <text x="810" y="125" font-size="13" class="tm">días</text>
    <circle cx="80" cy="120" r="9" class="f4"/><text x="80" y="95" text-anchor="middle" font-size="14" font-weight="700">Día 0</text>
    <text x="80" y="150" text-anchor="middle" font-size="13" class="t2">llega la mercancía</text>
    <circle cx="250" cy="120" r="9" class="f3"/><text x="250" y="95" text-anchor="middle" font-size="14" font-weight="700">Días después</text>
    <text x="250" y="150" text-anchor="middle" font-size="13" class="t2">la vende de contado</text><text x="250" y="168" text-anchor="middle" font-size="13" class="t2">🛒 → 💵 entra la caja</text>
    <circle cx="700" cy="120" r="9" class="f2"/><text x="700" y="95" text-anchor="middle" font-size="14" font-weight="700">≈ 90 días</text>
    <text x="700" y="150" text-anchor="middle" font-size="13" class="t2">le paga al proveedor</text><text x="700" y="168" text-anchor="middle" font-size="13" class="t2">💵 → 🚚 sale la caja</text>
    <rect x="262" y="40" width="426" height="34" rx="17" class="w5"/>
    <text x="475" y="62" text-anchor="middle" font-size="14" font-weight="700">el dinero del proveedor trabaja para Walmex</text>
    <rect x="262" y="190" width="426" height="30" rx="15" class="f5"/>
    <text x="475" y="210" text-anchor="middle" font-size="14" class="tw" font-weight="700">capital de trabajo negativo = proveedores (≈123 mil mill.) financian</text>
  </svg>`;

  const steps = [
    ['1', 'Contexto', '¿Qué empresa, sector, año y para quién analizo?'],
    ['2', 'Qué cambió', 'Las razones que más se movieron (con números).'],
    ['3', 'Por qué', 'La causa en activos / operación (cuentas).'],
    ['4', 'Consecuencia', 'Efecto en liquidez, deuda y rentabilidad.'],
    ['5', 'Vs. pares', 'Contra el benchmark o la competencia.'],
    ['6', 'Conclusión', 'Una frase irrefutable + qué haría.'],
  ];
  const svgSteps = `<svg class="ill" viewBox="0 0 660 420" role="img" aria-label="Plantilla de 6 pasos para contar la historia con razones">
    <defs><marker id="ahc2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    ${steps.map((s, i) => {
      const ci = [1, 2, 3, 5, 6, 7][i];
      const x = 10 + (i % 3) * 220, y = 10 + Math.floor(i / 3) * 210;
      return `<rect x="${x}" y="${y}" width="196" height="190" rx="16" class="w${ci}"/>
      <circle cx="${x + 98}" cy="${y + 36}" r="22" class="f${ci}"/><text x="${x + 98}" y="${y + 43}" text-anchor="middle" class="tw" font-size="20" font-weight="700">${s[0]}</text>
      <text x="${x + 98}" y="${y + 90}" text-anchor="middle" font-size="19" font-weight="700">${s[1]}</text>
      ${wrap(s[2], 20).map((t, j) => `<text x="${x + 98}" y="${y + 118 + j * 20}" text-anchor="middle" font-size="15" class="t2">${t}</text>`).join('')}
      ${i % 3 < 2 ? `<line x1="${x + 198}" y1="${y + 95}" x2="${x + 218}" y2="${y + 95}" class="ln s5" marker-end="url(#ahc2)"/>` : ''}`;
    }).join('')}
    <path d="M598 200 C 598 212, 108 206, 108 218" class="ln s5 dash" marker-end="url(#ahc2)"/>
  </svg>`;
  function wrap(s, n) { const out = []; let cur = ''; s.split(' ').forEach((w) => { if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w; }); if (cur.trim()) out.push(cur.trim()); return out; }

  // =====================================================================================
  // Render
  // =====================================================================================
  E.section({
    id: 'casos', n: 10, group: 'casos', icon: '🏗️', short: 'Casos reales', exam: 'in',
    title: 'Casos reales: las razones cuentan historias',
    lead: 'Las mismas fórmulas, aplicadas a empresas que analizaste en clase. El objetivo: aprender a leer los números como una historia, que es el 50% del examen.',
    render(root) {
      root.innerHTML = `
      <style>
        .sx-cas .chips{display:flex;flex-wrap:wrap;gap:6px;margin:8px 0 4px}
        .sx-cas .chips .gl{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--muted);width:100%;margin-top:6px}
        .sx-cas .read{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:10px 14px;font-size:15px;margin-top:10px}
        .sx-cas .verdict{border-top:4px solid var(--line);}
        .sx-cas .verdict.v1{border-top-color:var(--c1)}.sx-cas .verdict.v2{border-top-color:var(--c2)}.sx-cas .verdict.v3{border-top-color:var(--c3)}
        .sx-cas .flip{cursor:pointer;text-align:left;font:inherit;color:inherit;width:100%;display:block}
        .sx-cas .flip .ans{display:none;margin-top:8px;padding-top:8px;border-top:1px dashed var(--line);font-size:14px}
        .sx-cas .flip.open .ans{display:block}
        .sx-cas .flip .q{font-size:12px;color:var(--muted);margin-top:6px}
        .sx-cas .flip.open .q{display:none}
        .sx-cas .flip ul{margin:6px 0 0;padding-left:18px;font-size:14px}
        .sx-cas .flip .ic{font-size:26px;line-height:1}
        .sx-cas .game .opts{display:flex;flex-wrap:wrap;gap:8px;margin:10px 0}
        .sx-cas .game .fb{min-height:24px;font-size:15px}
        .sx-cas .score{font-weight:700;font-variant-numeric:tabular-nums}
        .sx-cas .model{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;font-size:15px}
        .sx-cas .model p{margin:6px 0}
        .sx-cas .model .st{display:inline-block;font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.05em;color:var(--accent-ink);background:var(--accent-wash);border-radius:5px;padding:1px 6px;margin-right:6px}
        .sx-cas .tbl.wrap td{white-space:normal;vertical-align:top}.sx-cas .tbl.wrap td:not(:first-child){text-align:left}.sx-cas .tbl.wrap th{text-align:left}
        .sx-cas .chk{display:flex;align-items:center;gap:6px;font-size:13.5px;color:var(--ink2);margin-top:6px}
      </style>
      <div class="sx-cas">
        <p class="prose">Cinco casos, del más importante al más corto. En cada uno: <b>qué pasó</b>, <b>qué razón lo delata</b> y <b>la lección</b> que puedes reusar en el examen.</p>
        <div class="btnrow">
          <a class="btn" href="#/casos/cementeras">🏭 Cementeras 24 vs 25</a>
          <a class="btn" href="#/casos/walmex">🛒 Walmex vs Chedraui vs La Comer</a>
          <a class="btn" href="#/casos/detective">🔎 Detective financiero</a>
          <a class="btn" href="#/casos/juego">🃏 Juego de razones</a>
          <a class="btn" href="#/casos/abc">🔤 ABC y AAL</a>
          <a class="btn pri" href="#/casos/historia">✍️ Cómo contar la historia</a>
        </div>

        ${E.concept({ id: 'cementeras', title: '1 · Cementeras 2024 vs 2025: CEMEX, Holcim y Heidelberg Materials', badge: 'in', html: `
          <p>La tarea fue: <b>¿quién mejoró más y a quién le fue peor?</b> Mismo sector, mismas fórmulas, cifras en millones de USD (Bloomberg). La respuesta no está en una razón, sino en <b>leerlas juntas</b>.</p>
          ${E.fig(svgCem, 'Heidelberg mejoró de verdad; CEMEX se ve igual por fuera pero su operación empeoró; Holcim no se puede comparar tal cual.', true)}
          ${E.kid('Tres tiendas de cemento. A la alemana le fue mejor en todo. A CEMEX le fue peor en su negocio, pero vendió una sucursal (República Dominicana) y le ayudó el tipo de cambio, así que su "ganancia" final se ve igual. Holcim regaló media tienda a sus dueños (Amrize) y la contabilidad lo anotó como una ganancia enorme... pero no entró dinero nuevo.')}
          <div class="cols">
            <div>
              <h4 style="margin:8px 0 2px">Elige una razón</h4>
              <div id="cemBtns"></div>
              <label class="chk"><input type="checkbox" id="cemHide"> Ocultar Holcim 2025 cuando está distorsionado (escisión)</label>
              <div class="read" id="cemRead"></div>
            </div>
            <div>
              <div id="cemTiles" style="margin-bottom:10px"></div>
              <div class="chart h360" id="cemChart"></div>
              <p class="small muted" style="margin:4px 0 0">Barras = cada empresa (2024 y 2025). Línea punteada = promedio de las tres (benchmark). ⚠ = cifra distorsionada por la escisión de Amrize.</p>
            </div>
          </div>

          <h4>La tabla completa (2024 → 2025)</h4>
          ${E.table(RK.map((k) => { const r = R[k]; return [r.n, ...CO.map((c) => fmtK(r, r[c.k][0]) + ' → ' + fmtK(r, r[c.k][1]) + (r.bad && r.bad[c.k] ? ' ⚠' : '')), fmtK(r, r.bench[0]) + ' → ' + fmtK(r, r.bench[1]) + (r.bad && r.bad.bench ? ' ⚠' : '')]; }), { head: ['Razón', 'CEMEX', 'Holcim', 'Heidelberg', 'Promedio'] })}

          <h4>La historia de cada una</h4>
          <div class="g3">
            <div class="card2 verdict v3"><h4>▲ Heidelberg: mejoró más</h4>
              <ul class="small">
                <li>La <b>única</b> con los 4 indicadores de rentabilidad al alza <b>sin ayudas extraordinarias</b>: utilidad neta +16% (2,075 → 2,407), operativa +7%, operaciones continuas +21%.</li>
                <li>Partidas anormales bajan de 472 a 101: <b>utilidad "limpia"</b>.</li>
                <li>Menos deuda (46.6%) y la mejor cobertura (9.5x).</li>
                <li>Débil: cobra 6.7 días más lento y es la única con <b>ciclo de efectivo positivo</b> (+24 días).</li>
              </ul></div>
            <div class="card2 verdict v1"><h4>▼ CEMEX: le fue peor</h4>
              <ul class="small">
                <li>Ventas planas (−0.4%) y utilidad neta "igual" (959 → 970)…</li>
                <li>…pero la <b>utilidad de operaciones continuas cae 56%</b> (912 → 404) por deterioros (538) y reestructura (179).</li>
                <li>La neta se sostiene por la <b>venta de República Dominicana</b> (≈551) y un giro cambiario de +585.</li>
                <li><b>Deuda de CP ×4.7</b> (458 → 2,135); cobertura más baja (4.17x); ROA y ROE más bajos.</li>
                <li>Bueno: días de inventario 55.5 → 50.8 y caja +70%.</li>
              </ul></div>
            <div class="card2 verdict v2"><h4>✂ Holcim: no comparable</h4>
              <ul class="small">
                <li>El 23-jun-2025 escindió Norteamérica (<b>Amrize</b>, ≈11.7 mil mill. de ventas): ventas 29,994 → 18,979.</li>
                <li>La escisión, como dividendo en especie, generó una <b>ganancia contable no monetaria</b> (≈CHF 12.3 mil mill.).</li>
                <li>Por eso margen neto 84%, ROA 38% y ROE 79% <b>no son rentabilidad real</b>.</li>
                <li>Su operación de fondo fue buena (EBIT recurrente +10%) y es la única con prueba ácida &gt; 1.</li>
              </ul></div>
          </div>

          <h4>CEMEX: ¿de dónde salió la utilidad neta?</h4>
          <div class="cols">
            <div>${E.table(CMX.map((r, i) => [r[0], r[1], r[2], { cls: i === 6 || i === 8 ? 'tot' : '' }]), { head: ['Mill. USD', '2024', '2025'], fmt: [null, (v) => E.fmt.sgn(v), (v) => E.fmt.sgn(v)] })}
              <p class="small muted">Desde la utilidad de operación, los renglones suman hasta operaciones continuas, y continuas + discontinuas = utilidad neta (±1 por redondeo). Fuente: hoja "Comparativo Estados" del Excel.</p></div>
            <div><div class="chart" id="cmxChart"></div></div>
          </div>
          ${E.warn('Ver que la <b>utilidad neta</b> de CEMEX subió 1% y concluir "le fue igual". La neta mezcla la operación con cosas de una sola vez (venta de un país, tipo de cambio, deterioros). Siempre baja al <b>margen operacional</b> y a la <b>utilidad de operaciones continuas</b>.')}
          ${E.key('<ol style="margin:4px 0 0;padding-left:20px"><li><b>Mira el margen operacional</b> antes que el neto: es la operación pura.</li><li><b>Busca partidas extraordinarias</b>: escisiones, ventas de negocios, deterioros, operaciones discontinuas. "Cuando ven esto, averigüen por qué".</li><li><b>Efecto cambiario</b>: CEMEX ganó 232 mill. por tipo de cambio en 2025 (perdió 353 en 2024). Heidelberg reporta en euros: en EUR sus activos bajaron 3%, en USD suben ≈10%.</li><li><b>Si las tres se mueven igual, es el mercado</b> (cobro más lento, cobertura menor), no la gestión.</li></ol>', 'Lecciones para el examen')}
          ${E.tip('<q>Estoy calificando su capacidad de argumentación con argumentos cuantitativos y cualitativos.</q> Renglón por renglón, con análisis integral.', 'Clase 23-sep, sobre esta tarea')}
          ${E.tip('<q>Pregúntenle a ChatGPT qué le pasó a Lafarge/Holcim en el 2025… ahí va a haber cosas locas.</q>', 'Clase 23-sep')}
          <div id="qzCem"></div>
        ` })}

        ${E.concept({ id: 'walmex', title: '2 · Walmex vs Chedraui vs La Comer: el flujo de caja libre', badge: 'in', html: `
          <p>Clase del 5-oct. Pregunta: <b>¿cuánta caja genera la operación después de invertir en capital de trabajo y en CapEx?</b> El FCL "no entra pero habrá una pequeña relación"; lo que <b>sí</b> entra seguro es el cambio en capital de trabajo (★ ${E.link('fuentes-usos', 'la pregunta que no falla')}).</p>
          ${E.formula('Ecuación fundamental (simplificada)', 'FCL', 'EBITDA ± ΔKT (después de impuestos) − CapEx', 'Fuente = +, uso = −. Verificación: FCL + flujo no operativo (bancos + accionistas + otros) = 0')}
          ${E.fig(svgWal, 'Walmex cobra de contado y paga a ≈90 días: por eso su capital de trabajo es negativo y no es mala señal.', true)}
          <div class="cols">
            <div>
              <h4 style="margin:6px 0">Walmex 2025 (cifras aprox., mil millones de pesos)</h4>
              ${E.table([
                ['EBITDA (utilidad operacional ≈78 + D&A ≈25)', '≈ +103'],
                ['ΔKT después de impuestos (uso)', '≈ −13.6'],
                ['CapEx (2024 ≈ 49)', '≈ −38'],
                ['FCL', '≈ +50', { cls: 'tot' }],
                ['→ a bancos (intereses netos)', '≈ −9'],
                ['→ a accionistas (dividendos)', '≈ −47'],
                ['→ otras partidas no operativas (fuente)', '≈ +5'],
              ], { head: ['Concepto', 'aprox.'] })}
              <p class="small muted">Activos ≈ 495 · CapEx/activos ≈ 7.9% (2024 ≈ 10%) · dividendos/activos ≈ 9.5% (2024 ≈ 4.1%) · ventas ≈ 1 billón · utilidad neta ≈ 49. Cifras de la transcripción de clase: úsalas como orden de magnitud.</p>
            </div>
            <div>
              <div class="btnrow" id="fclPre"></div>
              <div id="fclK"></div>
            </div>
          </div>
          <div id="fclTiles" style="margin-top:12px"></div>
          <div class="chart h360" id="fclChart"></div>
          <div class="read" id="fclRead"></div>

          <h4>Los tres supermercados (aprox.)</h4>
          ${E.table([
            ['🥇 Walmex', 'FCL ≈ +50 mil mill. (2025)', 'CapEx/activos ≈ 7.9%', 'Dividendos ≈ 47 mil mill.', 'Madura y sana: la caja sobra y se reparte.'],
            ['🥈 Chedraui', 'FCL ≈ +13 mil mill. (2025)', '≈ 17–18% en 2024', 'Dividendos bajos (≈0.4 mil mill.)', 'Invirtió fuerte en 2024 y ya genera caja.'],
            ['🥉 Comparable (prob. La Comer)', 'FCL negativo (2024)', '≈ 10.4% en 2024', 'Pagó dividendos aun con déficit', 'Crecer con FCL negativo es normal; <b>pagar dividendos con déficit es alerta</b>.'],
          ], { head: ['Empresa', 'FCL', 'CapEx / activos', 'Dividendos', 'Lectura'], cls: 'wrap' })}
          <p class="small muted">La transcripción automática deforma los nombres ("Coppel", "Gary"); por contexto el comparable con FCL negativo es probablemente La Comer. Cifras marcadas "≈" son aproximadas.</p>
          ${E.kid('Walmex es como una tiendita donde los clientes pagan en efectivo hoy y al señor que trae los refrescos le paga en tres meses. Mientras tanto, ese dinero está en su caja. Por eso puede deberle mucho al proveedor (capital de trabajo negativo) y estar perfectamente sana.')}
          ${E.warn('Leer el capital de trabajo negativo de un supermercado como "le falta liquidez". En retail es <b>financiamiento de proveedores</b> (Walmex les debe ≈123 mil mill.). En cemento sí preocupa más: dependes "de la paciencia de los proveedores".')}
          ${E.tip('<q>Lo que no quiero ver es un flujo de caja libre negativo.</q> Puede ser normal en años de expansión, pero déficit + dividendos al mismo tiempo = te endeudas para pagar a los accionistas.', 'Clase 5-oct')}
          ${E.key('Ranking como inversión de la clase: <b>1) Walmex, 2) Chedraui, 3) La Comer</b>. Matiz del profe: una empresa de control familiar puede pagar poco dividendo y aun así la familia ganar por otras vías; y puede ser oportunidad de compra a descuento.', 'Conclusión')}
        ` })}

        ${E.concept({ id: 'detective', title: '3 · Detective financiero: la huella de cada industria', badge: 'in', html: `
          <p>Cuatro empresas anónimas (A–D) y cuatro industrias. Comparando contra los promedios de 16 empresas reales (4 por industria, cierre 2025) se descubre quién es quién. Lección: <b>cada industria deja una huella</b> en el balance y en las razones.</p>
          <div class="cols">
            <div>
              <div class="chart h420" id="detRadar"></div>
              <p class="small muted">Cada eje tiene su propia escala (de 0 al máximo entre industrias). Pasa el cursor para ver el valor real.</p>
            </div>
            <div>
              <h4 style="margin:6px 0">Cómo reconocer cada industria</h4>
              <div class="g2" style="margin-top:6px">
                <div class="card2"><h4>🛢️ Gas y petróleo</h4><p class="small">PP&E ≈66% del activo + rotación de activos baja (necesita mucha inversión para vender) + caja mínima + días de inventario cortos (≈27). ROE bajo (≈10%).</p></div>
                <div class="card2"><h4>💊 Farmacéutica</h4><p class="small"><b>Días de inventario altísimos</b> (≈242; B: 352) + la más endeudada (≈65% de pasivo) + patentes/intangibles ≈30–40% + margen operacional ≈37%.</p></div>
                <div class="card2"><h4>🧬 Biotecnología</h4><p class="small"><b>Mucha caja</b> (≈30% del activo, dinero de bolsa para ensayos) + <b>intangibles</b> altos + PP&E mínimo (≈7%) + <b>margen y ROE bajos</b> (reinvierte en I+D).</p></div>
                <div class="card2"><h4>💻 Tecnología</h4><p class="small"><b>Márgenes y ROE altísimos</b> (A: 60% y 101%) + mucho activo corriente e inversiones CP + el capital más alto (poca deuda). Sí tiene inventario (chips).</p></div>
              </div>
            </div>
          </div>
          ${E.table(DV.map((r) => [r.n, ...r.avg.map((v) => E.fmtBy(r.u, v, r.u === 'd' ? 0 : r.u === 'x' ? 2 : 1))]), { head: ['Promedio por industria', 'O&G', 'Biotech', 'Tecnología', 'Pharma'] })}
          ${E.note('Ojo con los promedios: Pharma también tiene ROE alto (≈45%) <b>pero por apalancamiento</b> (65% de pasivo), y Biotech promedia CROs (IQVIA, ICON, sin inventario) con biotechs puras (argenx, BeOne). Cuando una partida se desvía, baja al detalle por empresa.', 'Matiz')}

          <h4>🎲 Mini-juego: ¿de qué industria es la empresa misteriosa?</h4>
          <div class="card2 game" id="game">
            <div class="btnrow"><button class="btn pri" type="button" id="gNew">🎲 Empresa aleatoria</button><button class="btn" type="button" id="gReal">🔎 Las reales: A, B, C, D</button><span class="small muted" style="align-self:center">Aciertos: <span class="score" id="gScore">0 / 0</span></span></div>
            <div id="gTitle" class="small muted"></div>
            <div id="gTbl"></div>
            <div class="opts" id="gOpts"></div>
            <div class="fb" id="gFb"></div>
          </div>
          ${E.tip('<q>Solo son útiles en términos comparativos.</q> Farma con farmas; si la empresa está diversificada, compara por unidad de negocio.', 'Clase 18-sep')}
        ` })}

        ${E.concept({ id: 'juego', title: '4 · Juego de razones (Equipo 6) y las 14 industrias de Desai', badge: 'in', html: `
          <p>El juego de Mihir Desai: te dan el balance porcentual y las razones de empresas sin nombre, y adivinas la industria buscando <b>los números extremos</b>. Haz clic en cada tarjeta para revelar la industria y la lección.</p>
          <div class="g3" id="cards"></div>
          <h4>El termómetro: días de cobro según el modelo de negocio</h4>
          <div class="chart h360" id="dsoChart"></div>
          <p class="small muted">Escala logarítmica (cada línea es ×10). Fuentes: entrega del Juego de razones (Equipo 6), cementeras 2025 y Detective.</p>
          ${E.key('<ul style="margin:4px 0 0;padding-left:20px"><li><b>Capital negativo ≠ quiebra</b>: puede ser recompra de acciones (hotelera) o pérdidas acumuladas (aerolínea).</li><li><b>Razón corriente &lt; 1 puede ser sana</b> si el cliente paga por adelantado (aerolínea) o el proveedor financia (off-price, CEMEX, Walmex).</li><li><b>Flujo operativo negativo es normal</b> en una financiera que crece su cartera.</li><li><b>El mismo ROE sale de palancas distintas</b>: off-price por rotación, tech por margen, pharma por apalancamiento (ver ' + E.link('dupont', 'DuPont') + ').</li></ul>', 'Lecciones reutilizables')}
          ${E.note('El ROE es lo más parecido entre industrias; <b>margen y rotación</b> son los que cambian muchísimo (Food Lion gana rotando, Intel gana con margen).', 'Desai, How Finance Works')}
        ` })}

        ${E.concept({ id: 'abc', title: '5 · Caso ABC y AAL (repaso rápido)', badge: 'in', html: `
          <div class="cols">
            <div>
              <h4 style="margin:6px 0">ABC vs. sector (ejemplo del profe)</h4>
              ${E.table(ABC, { head: ['Razón', 'ABC', 'Sector', 'Veredicto'] })}
            </div>
            <div>
              ${E.key('Con inventario ABC sale peor (3 vs 4); sin inventario sale mejor (1 vs 0.8). <b>Conclusión irrefutable: ABC tiene, en proporción, MENOS inventario que el sector.</b> La resta lo prueba: razón corriente − prueba ácida = inventario / pasivo corriente → ABC 3 − 1 = 2; sector 4 − 0.8 = 3.2. Si eso es bueno (eficiencia) o malo (vende menos) todavía no se sabe: te lleva a preguntar por qué.', 'La conclusión irrefutable')}
              ${E.key('ABC <b>cobra a 55 días y paga a 45</b>: financia 10 días con caja o préstamos. El sector paga a medida que cobra. Ver ' + E.link('eficiencia', 'Eficiencia y ciclos') + '.', 'El detalle que pidió el profe')}
              <p class="small">Su ROA (2.5%) es la mitad del sector: o gana menos con la misma inversión o invierte de más (inventario lento, activos fijos que rotan 2x vs 4x). <b>Sólo hay dos caminos</b> para subir el ROA: más utilidad con la misma inversión o menos inversión con la misma utilidad.</p>
              ${E.note('<b>AAL (American Airlines)</b> se usó para leer una cotización: precio ≈12.88 USD, capitalización = acciones × precio ≈ 8,498 mill. USD, P/E ≈ 15.7, beta. No entra al examen; está en ' + E.link('extra', 'el material extra') + '. Conexión con este caso: una aerolínea vive con razón corriente &lt; 1 porque cobra el boleto antes de volar.', 'AAL')}
            </div>
          </div>
        ` })}

        ${E.concept({ id: 'historia', title: '✍️ Cómo contar la historia con razones', badge: 'in', html: `
          <p>Para el 50% de interpretación no basta con "la razón corriente es 0.83". La plantilla de seis pasos convierte números en un argumento:</p>
          ${E.fig(svgSteps, 'Contexto → qué cambió → por qué → consecuencia → vs. pares → conclusión irrefutable.')}
          ${E.kid('Es como contar por qué un equipo de futbol bajó en la tabla: primero dices qué equipo y qué temporada, luego qué cambió (metió menos goles), por qué (se lesionó el delantero), qué provocó (perdió partidos), cómo le fue a los otros equipos, y terminas con una frase que nadie pueda discutir.')}
          <h4>Ejemplo modelo: CEMEX 2025</h4>
          <div class="model">
            <p><span class="st">1 Contexto</span>CEMEX, cementera con fuerte presencia en México, comparada con Holcim y Heidelberg (cifras en mill. USD, Bloomberg), desde la perspectiva de un inversionista y de un banco.</p>
            <p><span class="st">2 Qué cambió</span>Ventas planas (16,200 → 16,132, −0.4%) y utilidad neta casi igual (959 → 970). Pero la utilidad de operaciones continuas cayó 56% (912 → 404), la cobertura de intereses bajó de 4.93x a 4.17x y la deuda de corto plazo pasó de 458 a 2,135 (×4.7).</p>
            <p><span class="st">3 Por qué</span>La operación no generó más: la utilidad de operación quedó en ≈1,790 (margen operacional 11.1%), mientras crecieron los deterioros de activos (538) y la reestructura (179). La neta se sostuvo por partidas que no se repiten: la venta de República Dominicana (≈551) y una ganancia cambiaria (+232 vs −353 el año anterior).</p>
            <p><span class="st">4 Consecuencia</span>Rentabilidad: ROA 3.5% → 3.4% y ROE 7.7% → 7.1%. Deuda: más presión de corto plazo y gasto por intereses +19% (360 → 429). Liquidez: razón corriente 0.83 con capital de trabajo negativo (−1,250), sostenida por proveedores (≈119 días de pago) y ahora también por deuda de corto plazo. A favor: días de inventario 55.5 → 50.8 y caja +70%.</p>
            <p><span class="st">5 Vs. pares</span>CEMEX tiene la cobertura más baja del sector (4.17x vs 7.13x promedio) y el ROE más bajo, con más deuda (52.9% vs 46.6% de Heidelberg). Heidelberg logra un ROE de 10.6% con menos deuda, y Holcim no es comparable por la escisión de Amrize.</p>
            <p><span class="st">6 Conclusión</span><b>CEMEX fue la que peor evolucionó:</b> su utilidad neta se ve estable, pero su operación continua se deterioró y depende de partidas de una sola vez; el apalancamiento no le está rindiendo. Vigilaría el refinanciamiento de su deuda de corto plazo y si el plan de ahorros mejora el margen operacional en 2026.</p>
          </div>
          ${E.tip('<q>Escriban cómo hicieron la lógica del cálculo. No me importa si los números no están bien.</q>', 'Clase 5-oct')}
          ${E.warn('Analizar "pedacito por pedacito" sin ver la pintura completa. Una razón aislada no dice nada: une liquidez → eficiencia → deuda → rentabilidad en una sola historia.')}
          <h4>Comprueba que lo entendiste</h4>
          <div id="qzEnd"></div>
        ` })}
      </div>`;

      // ---------------------------------------------------------------- 1. cementeras: selector + gráfica
      let cur = 'roe';
      const btnBox = root.querySelector('#cemBtns');
      const groups = [...new Set(RK.map((k) => R[k].g))];
      btnBox.innerHTML = groups.map((g) => `<div class="chips"><span class="gl">${g}</span>${RK.filter((k) => R[k].g === g).map((k) => `<button type="button" class="btn sm" data-k="${k}">${R[k].n.replace(/ \(.*\)$/, '')}</button>`).join('')}</div>`).join('');
      const hide = root.querySelector('#cemHide');
      const cemChart = E.chart(root.querySelector('#cemChart'), (T) => {
        const r = R[cur];
        const yfmt = (v) => (r.fmt === 'pct' ? E.fmt.pct(v, 0) : r.fmt === '$' ? E.fmt.n(v) : r.fmt === 'd' ? E.fmt.n(v) : E.fmt.n(v, 1));
        const ser = CO.map((c, i) => ({
          name: c.n, type: 'bar', barMaxWidth: 46, itemStyle: { color: T[c.c], borderRadius: [4, 4, 0, 0] },
          data: r[c.k].map((v, y) => {
            const bad = y === 1 && r.bad && r.bad[c.k];
            if (bad && hide.checked) return null;
            return bad ? { value: v, itemStyle: { color: T[c.c], opacity: 0.45, borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'top', color: T.ink2, fontSize: 11, formatter: '⚠ escisión' } } : v;
          }),
        }));
        ser.push({ name: 'Promedio (benchmark)', type: 'line', symbol: 'circle', symbolSize: 9, lineStyle: { width: 2, type: 'dashed', color: T.ink2 }, itemStyle: { color: T.ink2 },
          data: r.bench.map((v, y) => (y === 1 && r.bad && r.bad.bench && hide.checked ? null : v)) });
        return {
          ...E.baseOpt(T),
          grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
          tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => (v == null ? '—' : fmtK(r, v)) },
          xAxis: E.axisCat(['2024', '2025'], T),
          yAxis: E.axisVal(T, yfmt),
          series: ser,
        };
      });
      const cemDraw = () => {
        const r = R[cur];
        btnBox.querySelectorAll('button').forEach((b) => b.classList.toggle('on', b.dataset.k === cur));
        E.tiles(root.querySelector('#cemTiles'), CO.map((c) => ({
          label: c.n + ' 2025', v: r[c.k][1], fmt: r.fmt, dec: r.fmt === 'pct' ? 1 : r.fmt === 'd' ? 1 : r.fmt === '$' ? 0 : 2,
          base: r.bad && r.bad[c.k] ? undefined : r[c.k][0], better: r.b, note: '2024: ' + fmtK(r, r[c.k][0]) + (r.bad && r.bad[c.k] ? ' · ⚠ distorsionado' : ''),
        })));
        const best = CO.filter((c) => !(r.bad && r.bad[c.k])).sort((a, b) => (r.b === 'down' ? r[a.k][1] - r[b.k][1] : r[b.k][1] - r[a.k][1]))[0];
        const lider = r.b ? `<br><span class="small muted">Mejor en 2025 (sin cifras distorsionadas): <b>${best.n}</b> · ${r.b === 'up' ? 'más alto es mejor' : 'más bajo es mejor'}.</span>` : '<br><span class="small muted">Aquí no hay "más es mejor" universal: depende de para quién lo lees.</span>';
        root.querySelector('#cemRead').innerHTML = `<b>${r.n}.</b> ${r.lee}${lider}`;
        cemChart.refresh();
      };
      btnBox.addEventListener('click', (e) => { const b = e.target.closest('button[data-k]'); if (!b) return; cur = b.dataset.k; cemDraw(); });
      hide.addEventListener('change', cemDraw);
      cemDraw();

      // CEMEX: utilidad neta = continuas + discontinuas
      E.chart(root.querySelector('#cmxChart'), (T) => ({
        ...E.baseOpt(T),
        grid: { left: 8, right: 16, top: 40, bottom: 8, containLabel: true },
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => E.fmt.n(v) + ' mill. USD' },
        xAxis: E.axisCat(['2024', '2025'], T),
        yAxis: E.axisVal(T, (v) => E.fmt.n(v)),
        series: [
          { name: 'Operaciones continuas', type: 'bar', stack: 'u', barMaxWidth: 70, itemStyle: { color: T.c1 }, data: [912, 404], label: { show: true, color: '#fff', fontWeight: 700 } },
          { name: 'Discontinuas (venta Rep. Dominicana)', type: 'bar', stack: 'u', barMaxWidth: 70, itemStyle: { color: T.c5, borderRadius: [4, 4, 0, 0] }, data: [47, 566], label: { show: true, position: 'insideTop', color: '#fff', fontWeight: 700, formatter: (p) => (p.value > 100 ? p.value : '') } },
        ],
      }));

      E.quiz(root.querySelector('#qzCem'), [
        { q: 'Holcim reporta en 2025 un ROE de 79%. ¿Qué escribes en el examen?', o: ['Que es la cementera más rentable', 'Que está distorsionado por una partida extraordinaria (escisión de Amrize) y no es comparable', 'Que tiene demasiado capital'], a: 1, w: 'La escisión generó una ganancia contable no monetaria. La rentabilidad de fondo se lee en el margen operacional (15.9%).' },
        { q: 'La utilidad neta de CEMEX sube 1%, pero la de operaciones continuas cae 56%. ¿Qué significa?', o: ['Que la operación mejoró', 'Que la utilidad depende de partidas que no se repiten (venta de RD, tipo de cambio)', 'Que pagó menos impuestos'], a: 1, w: 'Calidad de utilidad: misma neta, operación muy distinta.' },
        { q: 'Las tres cementeras cobran ≈6 días más lento en 2025. ¿Conclusión?', o: ['Las tres gerencias lo hicieron mal', 'Es una señal del mercado/sector, no de una empresa', 'Ninguna, es irrelevante'], a: 1, w: 'Cuando todas se mueven igual, el origen suele ser externo (clientes, tasas, ciclo económico).' },
      ]);

      // ---------------------------------------------------------------- 2. Walmex: simulador FCL
      const PRE = {
        wal: { lbl: 'Walmex 2025 (aprox.)', v: { ebitda: 103, dkt: -13.6, capex: 38, div: 47, act: 495 } },
        exp: { lbl: 'Súper en expansión que paga dividendos (ilustrativo)', v: { ebitda: 5, dkt: -1.5, capex: 4.6, div: 0.7, act: 44 } },
      };
      let fv = { ...PRE.wal.v };
      const fclChart = E.chart(root.querySelector('#fclChart'), (T) => {
        const fcl = fv.ebitda + fv.dkt - fv.capex;
        const gap = -(fcl - fv.div); // + = financiamiento que entra; − = sobrante que va a bancos/otros
        const steps = [['EBITDA', fv.ebitda, 'tot'], ['ΔKT', fv.dkt], ['CapEx', -fv.capex], ['FCL', fcl, 'tot'], ['Dividendos', -fv.div], [gap >= 0 ? 'Deuda/otros que entran' : 'A bancos/otros', gap], ['Cierre', 0, 'tot']];
        let run = 0; const rows = [];
        steps.forEach(([, v, t], i) => {
          if (t === 'tot') { rows.push([i, Math.min(0, v), Math.max(0, v), 0]); run = v; return; }
          const a = run, b = run + v; rows.push([i, Math.min(a, b), Math.max(a, b), v >= 0 ? 1 : 2]); run = b;
        });
        const col = [T.c1, T.c3, T.c2];
        const lab = (i) => (steps[i][1] === 0 && steps[i][2] !== 'tot' ? '' : E.fmt.sgn(steps[i][1], 1));
        return {
          ...E.baseOpt(T),
          grid: { left: 8, right: 16, top: 44, bottom: 8, containLabel: true },
          tooltip: { trigger: 'item', backgroundColor: T.card, borderColor: T.line, textStyle: { color: T.ink, fontSize: 13 },
            formatter: (p) => (p.seriesType === 'custom' ? `<b>${steps[p.value[0]][0]}</b><br>${E.fmt.sgn(steps[p.value[0]][1], 1)} mil mill. $` : '') },
          legend: { ...E.baseOpt(T).legend, data: ['Total', 'Fuente (+)', 'Uso (−)'] },
          xAxis: E.axisCat(steps.map((s) => s[0]), T, { axisLabel: { color: T.ink2, fontSize: 11, interval: 0, width: 80, overflow: 'break' } }),
          yAxis: E.axisVal(T, (v) => E.fmt.n(v)),
          series: [
            { name: 'Total', type: 'bar', data: [], itemStyle: { color: col[0] } },
            { name: 'Fuente (+)', type: 'bar', data: [], itemStyle: { color: col[1] } },
            { name: 'Uso (−)', type: 'bar', data: [], itemStyle: { color: col[2] } },
            { name: 'Cascada', type: 'custom', data: rows, encode: { x: 0, y: [1, 2] },
              renderItem: (params, api) => {
                const i = api.value(0), lo = api.value(1), hi = api.value(2), k = api.value(3);
                const p1 = api.coord([i, hi]), p0 = api.coord([i, lo]); const w = api.size([1, 0])[0] * 0.55;
                return { type: 'group', children: [
                  { type: 'rect', shape: { x: p1[0] - w / 2, y: p1[1], width: w, height: Math.max(1, p0[1] - p1[1]), r: 4 }, style: { fill: col[k] } },
                  { type: 'text', style: { text: lab(i), x: p1[0], y: p1[1] - 4, textAlign: 'center', textVerticalAlign: 'bottom', fill: T.ink, font: '600 12px system-ui,sans-serif' } },
                ] };
              } },
          ],
        };
      });
      const fclUpdate = (st) => {
        fv = st;
        const fcl = st.ebitda + st.dkt - st.capex;
        E.tiles(root.querySelector('#fclTiles'), [
          { label: 'FCL (mil mill. $)', v: fcl, fmt: 'n', dec: 1, hl: true, note: fcl >= 0 ? '✓ superávit' : '✗ déficit' },
          { label: 'FCL / activos', v: fcl / st.act, fmt: 'pct', note: '"el más importante" para comparar' },
          { label: 'CapEx / activos', v: st.capex / st.act, fmt: 'pct' },
          { label: 'Dividendos / activos', v: st.div / st.act, fmt: 'pct' },
        ]);
        let t;
        if (fcl >= 0 && fcl >= st.div) t = `✓ La operación genera <b>${E.fmt.n(fcl, 1)}</b> después de capital de trabajo y CapEx, y alcanza para pagar <b>${E.fmt.n(st.div, 1)}</b> de dividendos; sobran ${E.fmt.n(fcl - st.div, 1)} para bancos u otras partidas. Empresa madura y sana.`;
        else if (fcl >= 0) t = `⚠ Hay superávit (${E.fmt.n(fcl, 1)}), pero los dividendos (${E.fmt.n(st.div, 1)}) son mayores: la diferencia (${E.fmt.n(st.div - fcl, 1)}) tiene que salir de deuda o de la caja. Vigilar.`;
        else if (st.div > 0) t = `✗ <b>Alerta:</b> FCL negativo (${E.fmt.n(fcl, 1)}) y aun así paga ${E.fmt.n(st.div, 1)} de dividendos. Se endeuda para pagarle a sus accionistas; si se repite en el tiempo es la típica candidata a problemas de crédito.`;
        else t = `⚠ FCL negativo (${E.fmt.n(fcl, 1)}) pero sin dividendos: puede ser normal en un año de expansión (CapEx/activos ${E.fmt.pct(st.capex / st.act)}). Lo importante es tener la caja o el crédito para aguantar.`;
        root.querySelector('#fclRead').innerHTML = t;
        fclChart.refresh();
      };
      const fk = E.knobs(root.querySelector('#fclK'), [
        { k: 'ebitda', label: 'EBITDA (mil mill. $)', min: 0, max: 130, step: 0.5, v: PRE.wal.v.ebitda, fmt: 'n', dec: 1 },
        { k: 'dkt', label: 'ΔKT después de impuestos (− = uso)', min: -30, max: 15, step: 0.1, v: PRE.wal.v.dkt, fmt: 'n', dec: 1, hint: 'Si el capital de trabajo aumenta es un uso (negativo).' },
        { k: 'capex', label: 'CapEx (mil mill. $)', min: 0, max: 80, step: 0.1, v: PRE.wal.v.capex, fmt: 'n', dec: 1 },
        { k: 'div', label: 'Dividendos pagados (mil mill. $)', min: 0, max: 70, step: 0.1, v: PRE.wal.v.div, fmt: 'n', dec: 1 },
        { k: 'act', label: 'Activos totales (mil mill. $)', min: 10, max: 600, step: 1, v: PRE.wal.v.act, fmt: 'n' },
      ], fclUpdate, { title: '🎛️ Arma el flujo de caja libre' });
      const preBox = root.querySelector('#fclPre');
      preBox.innerHTML = Object.entries(PRE).map(([k, p]) => `<button type="button" class="btn sm" data-p="${k}">${p.lbl}</button>`).join('');
      preBox.addEventListener('click', (e) => { const b = e.target.closest('button[data-p]'); if (!b) return; fk.set(PRE[b.dataset.p].v); });

      // ---------------------------------------------------------------- 3. Detective: radar + juego
      E.chart(root.querySelector('#detRadar'), (T) => {
        const mx = DV.map((r) => Math.max(...r.avg) * 1.12);
        return {
          ...E.baseOpt(T),
          tooltip: { trigger: 'item', backgroundColor: T.card, borderColor: T.line, textStyle: { color: T.ink, fontSize: 13 },
            formatter: (p) => `<b>${INDN[p.name] || p.name}</b><br>` + DV.map((r, i) => `${r.n}: <b>${E.fmtBy(r.u, p.value[i], r.u === 'd' ? 0 : r.u === 'x' ? 2 : 1)}</b>`).join('<br>') },
          legend: { ...E.baseOpt(T).legend, data: INDS },
          radar: {
            center: ['50%', '56%'], radius: '62%', splitNumber: 4,
            indicator: DV.map((r, i) => ({ name: r.n.replace(' (% activo)', ''), max: mx[i] })),
            axisName: { color: T.ink2, fontSize: 11 }, splitLine: { lineStyle: { color: T.grid } }, splitArea: { show: false }, axisLine: { lineStyle: { color: T.grid } },
          },
          series: [{ type: 'radar', symbolSize: 8, lineStyle: { width: 2 },
            data: INDS.map((ind, j) => ({ name: ind, value: DV.map((r) => r.avg[j]), itemStyle: { color: T.c[j] }, lineStyle: { color: T.c[j], width: 2 }, areaStyle: { color: T.c[j], opacity: 0.08 } })) }],
        };
      });

      const G = { ok: 0, n: 0, cur: null, realIdx: 0 };
      const gTbl = root.querySelector('#gTbl'), gOpts = root.querySelector('#gOpts'), gFb = root.querySelector('#gFb'), gTitle = root.querySelector('#gTitle');
      const gauss = () => { let u = 0, v = 0; while (!u) u = Math.random(); while (!v) v = Math.random(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); };
      const clue = {
        'O&G': 'PP&E dominante y rotación de activos baja, poca caja e inventario que rota rápido.',
        Biotech: 'mucha caja e intangibles, PP&E mínimo y márgenes/ROE bajos.',
        'Tecnología': 'márgenes y ROE altos, poca deuda, buen colchón de activo corriente.',
        Pharma: 'días de inventario altísimos, la más endeudada, intangibles/patentes altos y margen operacional alto.',
      };
      const showCo = (co) => {
        G.cur = co;
        gTitle.innerHTML = co.title;
        gTbl.innerHTML = E.table(DV.map((r, i) => [r.n, co.v[i] == null ? '— (no disponible)' : E.fmtBy(r.u, co.v[i], r.u === 'd' ? 0 : r.u === 'x' ? 2 : 1)]), { head: ['Razón', 'Empresa misteriosa'] });
        gOpts.innerHTML = INDS.map((ind) => `<button type="button" class="btn" data-i="${ind}">${INDN[ind]}</button>`).join('');
        gFb.innerHTML = '';
      };
      const newRandom = () => {
        const j = Math.floor(Math.random() * 4);
        const v = DV.map((r) => { let x = r.avg[j] * Math.exp(gauss() * 0.22); if (r.u === 'pct' && x > 0.95) x = 0.95; return x; });
        showCo({ ind: INDS[j], v, title: 'Empresa aleatoria: promedios de una industria con ±20% de "ruido". ¿Cuál es?' });
      };
      const nextReal = () => {
        const r = REAL[G.realIdx % 4]; G.realIdx++;
        showCo({ ind: r.ind, v: DV.map((d) => d.co['ABCD'.indexOf(r.n)]), title: `Empresa real <b>${r.n}</b> del Detective (datos de las instrucciones). ¿Cuál es?`, why: r.why });
      };
      gOpts.addEventListener('click', (e) => {
        const b = e.target.closest('button[data-i]'); if (!b || !G.cur || G.cur.done) return;
        G.cur.done = true; G.n++;
        const right = b.dataset.i === G.cur.ind; if (right) G.ok++;
        gOpts.querySelectorAll('button').forEach((x) => { x.disabled = true; if (x.dataset.i === G.cur.ind) x.classList.add('on'); });
        gFb.innerHTML = (right ? '<span class="good">✓ ¡Correcto!</span> ' : `<span class="bad">✗ No.</span> Era <b>${INDN[G.cur.ind]}</b>. `) + (G.cur.why || 'Pistas: ' + clue[G.cur.ind]);
        root.querySelector('#gScore').textContent = G.ok + ' / ' + G.n;
      });
      root.querySelector('#gNew').addEventListener('click', newRandom);
      root.querySelector('#gReal').addEventListener('click', nextReal);
      newRandom();

      // ---------------------------------------------------------------- 4. Juego de razones: tarjetas + días de cobro
      const cards = root.querySelector('#cards');
      cards.innerHTML = CARDS.map((c, i) => `<button type="button" class="card2 flip" data-c="${i}" aria-expanded="false">
        <div class="ic">❓</div><ul>${c.p.map((p) => `<li>${p}</li>`).join('')}</ul>
        <div class="q">👆 ¿Qué industria es? Toca para ver.</div>
        <div class="ans"><b>${c.ic} ${c.ind}</b><br>${c.l}</div></button>`).join('');
      cards.addEventListener('click', (e) => {
        const b = e.target.closest('.flip'); if (!b) return;
        const open = b.classList.toggle('open'); b.setAttribute('aria-expanded', open);
        b.querySelector('.ic').textContent = open ? CARDS[+b.dataset.c].ic : '❓';
      });
      E.chart(root.querySelector('#dsoChart'), (T) => ({
        ...E.baseOpt(T),
        grid: { left: 8, right: 56, top: 10, bottom: 8, containLabel: true },
        tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => E.fmt.d(v, 1) },
        legend: { show: false },
        yAxis: E.axisCat(DSO_SCALE.map((d) => d[0]), T, { axisLabel: { color: T.ink2, fontSize: 12 } }),
        xAxis: { type: 'log', logBase: 10, min: 0.1, max: 10000, splitLine: { lineStyle: { color: T.grid } }, axisLabel: { color: T.muted, fontSize: 11, formatter: (v) => E.fmt.n(v, v < 1 ? 1 : 0) } },
        series: [{ name: 'Días de cobro', type: 'bar', barMaxWidth: 22, itemStyle: { color: T.c1, borderRadius: [0, 4, 4, 0] }, data: DSO_SCALE.map((d) => d[1]),
          label: { show: true, position: 'right', color: T.ink, fontSize: 12, formatter: (p) => E.fmt.n(p.value, p.value < 100 ? 1 : 0) } }],
      }));

      // ---------------------------------------------------------------- quiz final
      E.quiz(root.querySelector('#qzEnd'), [
        { q: 'Una empresa tiene razón corriente 0.5x y capital contable negativo. ¿Qué haces primero?', o: ['Concluir que está en quiebra', 'Preguntar por el modelo de negocio: ¿cobra por adelantado (aerolínea)? ¿recompra acciones (hotelera)?', 'Ignorar la liquidez'], a: 1, w: 'Las razones sólo significan algo en contexto y comparadas con pares.' },
        { q: 'Una empresa tiene FCL negativo y paga dividendos dos años seguidos. ¿Lectura?', o: ['Excelente para el accionista', 'Señal de alerta: se endeuda para pagar dividendos', 'Normal en cualquier supermercado'], a: 1, w: 'Un año de expansión con FCL negativo puede ser normal; déficit + dividendos repetido es alerta de crédito.' },
        { q: 'Para contar la historia de un cambio en el ROE, ¿qué paso no puede faltar?', o: ['Decir sólo el número del ROE', 'Explicar la causa (margen, rotación o apalancamiento) y compararlo con los pares', 'Copiar la fórmula'], a: 1, w: 'Por qué (causa en la operación) + vs. pares = la parte que vale la mitad del examen.' },
        { q: 'Una empresa misteriosa: PP&E 77% del activo, rotación de activos 0.25, prueba ácida 0.48. ¿Industria?', o: ['Biotecnología', 'Tecnología', 'Gas y petróleo'], a: 2, w: 'Capital intensivo, muy poca rotación y poca liquidez: la huella de O&G (empresa C del Detective).' },
      ]);
    },
  });
})();
