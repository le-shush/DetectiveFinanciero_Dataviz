// Sección 7 — Fuentes y usos + cambio en capital de trabajo ("la pregunta que no falla").
// Simulador de dos balances, KT, dividendo implícito, CapEx, generador de ejercicios y quiz.
(function () {
  'use strict';

  // ------------------------------------------------------------------ datos fijos
  // Cuentas del balance simplificado. s: 'a' activo | 'p' pasivo | 'c' patrimonio
  const ACC = [
    { k: 'caja', n: 'Caja y equivalentes', s: 'a' },
    { k: 'cxc', n: 'Cuentas por cobrar (clientes)', s: 'a' },
    { k: 'inv', n: 'Inventarios', s: 'a' },
    { k: 'afn', n: 'Activo fijo neto', s: 'a' },
    { k: 'prov', n: 'Proveedores', s: 'p' },
    { k: 'dcp', n: 'Deuda bancaria CP (con interés)', s: 'p' },
    { k: 'dlp', n: 'Deuda bancaria LP', s: 'p' },
    { k: 'cs', n: 'Capital social', s: 'c' },
    { k: 'ur', n: 'Utilidades retenidas', s: 'c' },
  ];
  const SHORT = { caja: 'Caja', cxc: 'Clientes (CxC)', inv: 'Inventarios', afn: 'Activo fijo neto', prov: 'Proveedores', dcp: 'Deuda CP', dlp: 'Deuda LP', cs: 'Capital social', ur: 'Utilidades retenidas' };
  // [frase si es FUENTE, frase si es USO]
  const WHY = {
    caja: ['sacaste dinero de la caja para usarlo en otra cosa', 'estacionaste más dinero en la caja (el dueño deja más inversión ahí)'],
    cxc: ['cobraste a tus clientes lo que te debían', 'financiaste más a tus clientes (vendiste a crédito)'],
    inv: ['redujiste inventario: liberaste caja de la bodega', 'metiste más dinero en inventario'],
    afn: ['el activo fijo neto bajó (se depreció más de lo que invertiste, o vendiste activos)', 'invertiste en activo fijo más de lo que se depreció'],
    prov: ['tus proveedores te financiaron más (les quedaste debiendo)', 'pagaste a tus proveedores'],
    dcp: ['pediste prestado al banco a corto plazo', 'pagaste deuda de corto plazo'],
    dlp: ['pediste prestado al banco a largo plazo', 'pagaste deuda de largo plazo'],
    cs: ['los socios aportaron capital nuevo', 'se le devolvió capital a los socios'],
    ur: ['los dueños dejaron utilidades en la empresa (capitalizaron)', 'las utilidades retenidas bajaron (repartieron más de lo que se ganó, o hubo pérdida)'],
  };
  // Ejemplos que cuadran (verificados: activo = pasivo + patrimonio en ambos años)
  const PRESETS = {
    base: { name: 'Empresa que crece', y0: { caja: 100, cxc: 150, inv: 200, afn: 600, prov: 120, dcp: 80, dlp: 250, cs: 300, ur: 300 }, y1: { caja: 130, cxc: 190, inv: 240, afn: 640, prov: 160, dcp: 60, dlp: 300, cs: 300, ur: 380 }, un: 120, dep: 60 },
    super: { name: 'Supermercado (KT negativo)', y0: { caja: 80, cxc: 20, inv: 300, afn: 900, prov: 450, dcp: 0, dlp: 200, cs: 300, ur: 350 }, y1: { caja: 90, cxc: 25, inv: 330, afn: 980, prov: 520, dcp: 0, dlp: 180, cs: 300, ur: 425 }, un: 160, dep: 90 },
    paga: { name: 'Empresa que paga deuda', y0: { caja: 60, cxc: 200, inv: 260, afn: 500, prov: 140, dcp: 120, dlp: 300, cs: 250, ur: 210 }, y1: { caja: 70, cxc: 170, inv: 200, afn: 480, prov: 130, dcp: 60, dlp: 240, cs: 250, ur: 240 }, un: 90, dep: 50 },
  };

  // ------------------------------------------------------------------ utilidades
  const n0 = (v) => E.fmt.n(v, 0);
  const sg = (v) => (Math.abs(v) < 1e-9 ? '0' : E.fmt.sgn(v, 0));
  const chg = (a, y0, y1) => (a.s === 'a' ? y0[a.k] - y1[a.k] : y1[a.k] - y0[a.k]);
  const tag = (v) => (v > 0 ? '<span class="fu-tag f">⊕ FUENTE</span>' : v < 0 ? '<span class="fu-tag u">⊖ USO</span>' : '<span class="fu-tag z">= sin cambio</span>');
  const tot = (y) => {
    const ac = y.caja + y.cxc + y.inv, a = ac + y.afn, pc = y.prov + y.dcp, pyc = pc + y.dlp + y.cs + y.ur;
    return { ac, a, pc, pyc, kt: ac - pc, ktd: y.cxc + y.inv - y.prov };
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // ------------------------------------------------------------------ ilustraciones estáticas
  const svgMatriz = `<svg class="ill" viewBox="0 0 820 360" role="img" aria-label="Matriz de fuentes y usos: activo que aumenta es uso, activo que disminuye es fuente; pasivo o patrimonio que aumenta es fuente, que disminuye es uso">
    <text x="385" y="44" text-anchor="middle" font-size="18" font-weight="700">↑ AUMENTA</text>
    <text x="670" y="44" text-anchor="middle" font-size="18" font-weight="700">↓ DISMINUYE</text>
    <rect x="15" y="64" width="220" height="134" rx="14" class="w3"/>
    <text x="125" y="106" text-anchor="middle" font-size="20" font-weight="800">ACTIVO</text>
    <text x="125" y="130" text-anchor="middle" font-size="14" class="t2">lo que la empresa TIENE</text>
    <text x="125" y="152" text-anchor="middle" font-size="14" class="t2">(= la inversión)</text>
    <text x="125" y="180" text-anchor="middle" font-size="13" class="tm">👤 mirada del ACCIONISTA</text>
    <rect x="15" y="212" width="220" height="134" rx="14" class="w5"/>
    <text x="125" y="250" text-anchor="middle" font-size="18" font-weight="800">PASIVO +</text>
    <text x="125" y="272" text-anchor="middle" font-size="18" font-weight="800">PATRIMONIO</text>
    <text x="125" y="298" text-anchor="middle" font-size="14" class="t2">quién me FINANCIA</text>
    <text x="125" y="326" text-anchor="middle" font-size="13" class="tm">🧑‍💼 mirada de la GERENCIA</text>
    <rect x="250" y="64" width="270" height="134" rx="14" class="w2"/>
    <text x="385" y="108" text-anchor="middle" font-size="26" font-weight="800">⊖ USO</text>
    <text x="385" y="136" text-anchor="middle" font-size="14">salió caja para tenerlo</text>
    <text x="385" y="160" text-anchor="middle" font-size="13" class="t2">ej. abrir tienda, más inventario,</text>
    <text x="385" y="178" text-anchor="middle" font-size="13" class="t2">más clientes a crédito, más caja</text>
    <rect x="535" y="64" width="270" height="134" rx="14" class="w1"/>
    <text x="670" y="108" text-anchor="middle" font-size="26" font-weight="800">⊕ FUENTE</text>
    <text x="670" y="136" text-anchor="middle" font-size="14">lo vendí, lo cobré o lo liberé</text>
    <text x="670" y="160" text-anchor="middle" font-size="13" class="t2">ej. clientes me pagaron,</text>
    <text x="670" y="178" text-anchor="middle" font-size="13" class="t2">bajé inventario, vendí un terreno</text>
    <rect x="250" y="212" width="270" height="134" rx="14" class="w1"/>
    <text x="385" y="256" text-anchor="middle" font-size="26" font-weight="800">⊕ FUENTE</text>
    <text x="385" y="284" text-anchor="middle" font-size="14">alguien me dio dinero</text>
    <text x="385" y="308" text-anchor="middle" font-size="13" class="t2">ej. préstamo nuevo, proveedores me fían,</text>
    <text x="385" y="326" text-anchor="middle" font-size="13" class="t2">los dueños no retiran utilidades</text>
    <rect x="535" y="212" width="270" height="134" rx="14" class="w2"/>
    <text x="670" y="256" text-anchor="middle" font-size="26" font-weight="800">⊖ USO</text>
    <text x="670" y="284" text-anchor="middle" font-size="14">yo pagué</text>
    <text x="670" y="308" text-anchor="middle" font-size="13" class="t2">ej. abono al banco, pagué proveedores,</text>
    <text x="670" y="326" text-anchor="middle" font-size="13" class="t2">pagué dividendos</text>
  </svg>`;

  const svgUber = `<svg class="ill" viewBox="0 0 820 300" role="img" aria-label="El chofer de Uber recibe un préstamo (fuente para él, uso para quien presta) y luego lo paga (uso para él, fuente para quien presta)">
    <defs>
      <marker id="fuA1" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f1"/></marker>
      <marker id="fuA2" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f2"/></marker>
    </defs>
    <rect x="20" y="20" width="220" height="260" rx="16" class="w4"/>
    <text x="130" y="80" text-anchor="middle" font-size="44">🚗</text>
    <text x="130" y="112" text-anchor="middle" font-size="16" font-weight="700">Chofer de Uber</text>
    <text x="130" y="132" text-anchor="middle" font-size="13" class="tm">(la gerencia)</text>
    <rect x="580" y="20" width="220" height="260" rx="16" class="w6"/>
    <text x="690" y="80" text-anchor="middle" font-size="44">🏦</text>
    <text x="690" y="112" text-anchor="middle" font-size="16" font-weight="700">Quien le presta</text>
    <text x="690" y="132" text-anchor="middle" font-size="13" class="tm">(dueño del coche / banco)</text>
    <text x="410" y="58" text-anchor="middle" font-size="15" font-weight="700">1) Hoy: le prestan $100,000</text>
    <path d="M572 80 L248 80" class="ln s1 anim-flow" marker-end="url(#fuA1)"/>
    <rect x="40" y="160" width="180" height="34" rx="17" class="f1"/><text x="130" y="182" text-anchor="middle" class="tw" font-size="14" font-weight="700">⊕ FUENTE (le entra)</text>
    <rect x="600" y="160" width="180" height="34" rx="17" class="f2"/><text x="690" y="182" text-anchor="middle" class="tw" font-size="14" font-weight="700">⊖ USO (le sale)</text>
    <text x="410" y="200" text-anchor="middle" font-size="15" font-weight="700">2) Después: paga los $100,000</text>
    <path d="M248 222 L572 222" class="ln s2 anim-flow" marker-end="url(#fuA2)"/>
    <rect x="40" y="232" width="180" height="34" rx="17" class="f2"/><text x="130" y="254" text-anchor="middle" class="tw" font-size="14" font-weight="700">⊖ USO (le sale)</text>
    <rect x="600" y="232" width="180" height="34" rx="17" class="f1"/><text x="690" y="254" text-anchor="middle" class="tw" font-size="14" font-weight="700">⊕ FUENTE (le entra)</text>
    <text x="410" y="130" text-anchor="middle" font-size="13" class="tm">misma transacción,</text>
    <text x="410" y="148" text-anchor="middle" font-size="13" class="tm">signo opuesto según quién mira</text>
  </svg>`;

  const svgCaja = `<svg class="ill" viewBox="0 0 760 210" role="img" aria-label="Si la caja de la empresa aumenta, es un uso: el dueño deja dinero estacionado ahí en vez de recibirlo">
    <defs><marker id="fuA3" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f2"/></marker></defs>
    <rect x="20" y="30" width="180" height="150" rx="16" class="w4"/>
    <text x="110" y="92" text-anchor="middle" font-size="44">👤</text>
    <text x="110" y="128" text-anchor="middle" font-size="16" font-weight="700">El dueño</text>
    <text x="110" y="150" text-anchor="middle" font-size="13" class="tm">pudo recibir ese dinero…</text>
    <path d="M206 105 L330 105" class="ln s2 anim-flow" marker-end="url(#fuA3)"/>
    <text x="268" y="92" text-anchor="middle" font-size="13" class="t2">lo deja</text>
    <rect x="340" y="30" width="230" height="150" rx="16" class="w3"/>
    <text x="455" y="62" text-anchor="middle" font-size="16" font-weight="700">🏢 Caja de la empresa</text>
    <text x="455" y="96" text-anchor="middle" font-size="22" font-weight="800">100 → 400</text>
    <text x="455" y="128" text-anchor="middle" font-size="26">🅿️💰</text>
    <text x="455" y="162" text-anchor="middle" font-size="13" class="tm">dinero "estacionado"</text>
    <rect x="590" y="70" width="150" height="70" rx="14" class="f2"/>
    <text x="665" y="100" text-anchor="middle" class="tw" font-size="17" font-weight="800">⊖ USO</text>
    <text x="665" y="124" text-anchor="middle" class="tw" font-size="15" font-weight="700">100 − 400 = −300</text>
  </svg>`;

  const svgMoto = (() => {
    const base = 200, k = 1.6; // px por unidad (miles)
    const bar = (x, v, cls, lbl, sub) => `<rect x="${x}" y="${base - v * k}" width="70" height="${v * k}" rx="6" class="${cls}"/><text x="${x + 35}" y="${base - v * k - 8}" text-anchor="middle" font-size="15" font-weight="700">${lbl}</text><text x="${x + 35}" y="${base + 20}" text-anchor="middle" font-size="13" class="tm">${sub}</text>`;
    return `<svg class="ill" viewBox="0 0 860 340" role="img" aria-label="Ejemplo del coche y la moto: con sólo el activo fijo neto y la depreciación se puede deducir el CapEx">
      <rect x="10" y="8" width="410" height="324" rx="16" class="bg2"/>
      <rect x="440" y="8" width="410" height="324" rx="16" class="bg2"/>
      <text x="215" y="36" text-anchor="middle" font-size="16" font-weight="700">A) Año normal: 🚗 sólo se deprecia</text>
      <text x="645" y="36" text-anchor="middle" font-size="16" font-weight="700">B) Año en que compra 🏍️ moto de 10</text>
      <line x1="40" y1="${base}" x2="390" y2="${base}" class="lnm"/>
      ${bar(90, 80, 'f3', '80', 'AFN inicio')}
      ${bar(250, 60, 'f3', '60', 'AFN final')}
      <path d="M170 ${base - 110} L240 ${base - 110}" class="ln s3 dash"/>
      <text x="205" y="${base - 118}" text-anchor="middle" font-size="12" class="t2">−20 de dep.</text>
      <line x1="470" y1="${base}" x2="820" y2="${base}" class="lnm"/>
      ${bar(520, 20, 'f3', '20', 'AFN inicio (🚗)')}
      <rect x="680" y="${base - 10 * k}" width="70" height="${10 * k}" rx="6" class="f2"/>
      <text x="715" y="${base - 10 * k - 8}" text-anchor="middle" font-size="15" font-weight="700">10</text>
      <text x="715" y="${base + 20}" text-anchor="middle" font-size="13" class="tm">AFN final</text>
      <text x="715" y="${base - 46}" text-anchor="middle" font-size="12" class="t2">🚗 0 + 🏍️ 10</text>
      <g font-size="14">
        <text x="30" y="252">Fuentes/usos (ant − act): 80 − 60 = <tspan font-weight="700">+20</tspan></text>
        <text x="30" y="276">Depreciación (no salió caja): <tspan font-weight="700">−20</tspan></text>
        <text x="30" y="306" font-weight="800">+20 − 20 = 0 → CapEx = 0</text>
        <text x="460" y="252">Fuentes/usos (ant − act): 20 − 10 = <tspan font-weight="700">+10</tspan></text>
        <text x="460" y="276">Depreciación del coche: <tspan font-weight="700">−20</tspan></text>
        <text x="460" y="306" font-weight="800">+10 − 20 = −10 → CapEx = 10 🏍️</text>
      </g>
    </svg>`;
  })();

  // ------------------------------------------------------------------ ilustraciones dinámicas
  // Balanza: usos (izquierda) vs fuentes (derecha)
  const svgBalanza = (F, U) => {
    const diff = F - U, ok = Math.abs(diff) < 0.5;
    const ang = ok ? 0 : clamp((diff / Math.max(F, U, 1)) * 14, -14, 14);
    const r = (ang * Math.PI) / 180, px = 320, py = 70, L = 200;
    const lx = px - L * Math.cos(r), ly = py - L * Math.sin(r), rx = px + L * Math.cos(r), ry = py + L * Math.sin(r);
    const pan = (x, y, cls, t1, t2) => `<line x1="${x}" y1="${y}" x2="${x - 60}" y2="${y + 60}" class="lnm"/><line x1="${x}" y1="${y}" x2="${x + 60}" y2="${y + 60}" class="lnm"/>
      <path d="M${x - 75} ${y + 60} Q ${x} ${y + 105} ${x + 75} ${y + 60} Z" class="${cls}"/>
      <text x="${x}" y="${y + 50}" text-anchor="middle" font-size="14" font-weight="700">${t1}</text><text x="${x}" y="${y + 82}" text-anchor="middle" font-size="16" font-weight="800">${t2}</text>`;
    return `<svg class="ill" viewBox="0 0 640 260" role="img" aria-label="Balanza: total de usos contra total de fuentes; deben pesar lo mismo">
      <path d="M300 230 L320 ${py} L340 230 Z" class="bg2"/><rect x="250" y="226" width="140" height="14" rx="7" class="bg2"/>
      <line x1="${lx}" y1="${ly}" x2="${rx}" y2="${ry}" class="ln" stroke-width="5"/>
      <circle cx="${px}" cy="${py}" r="8" class="f5"/>
      ${pan(lx, ly, 'w2', '⊖ Usos', n0(U))}
      ${pan(rx, ry, 'w1', '⊕ Fuentes', n0(F))}
      <text x="320" y="24" text-anchor="middle" font-size="16" font-weight="800" class="${ok ? 'fgood' : 'fbad'}">${ok ? '✓ Suma de cambios = 0: cuadra' : '✗ Suma = ' + sg(diff) + ': no cuadra'}</text>
    </svg>`;
  };

  // Tanques de capital de trabajo (nivel) y el cambio
  const svgKT = (kt0, kt1, d) => {
    const z = 165, mx = Math.max(Math.abs(kt0), Math.abs(kt1), 100), k = 115 / mx;
    const tank = (x, v, lbl) => {
      const h = Math.abs(v) * k, y = v >= 0 ? z - h : z;
      return `<rect x="${x}" y="${z - 120}" width="150" height="240" rx="12" class="bg2"/>
        <rect x="${x + 12}" y="${y}" width="126" height="${Math.max(h, 1)}" rx="6" class="${v >= 0 ? 'f3' : 'f4'}"/>
        <text x="${x + 75}" y="${z - 128}" text-anchor="middle" font-size="15" font-weight="700">${lbl}</text>
        ${h >= 34
          ? `<text x="${x + 75}" y="${v >= 0 ? z - h / 2 + 6 : z + h / 2 + 6}" text-anchor="middle" font-size="18" font-weight="800" class="tw">KT ${n0(v)}</text>`
          : `<text x="${x + 75}" y="${v >= 0 ? z - h - 8 : z + h + 22}" text-anchor="middle" font-size="18" font-weight="800">KT ${n0(v)}</text>`}`;
    };
    const lab = d > 0 ? '⊕ FUENTE: liberaste KT' : d < 0 ? '⊖ USO: invertiste en KT' : '= sin cambio';
    return `<svg class="ill" viewBox="0 0 720 320" role="img" aria-label="Nivel de capital de trabajo del año anterior y del actual, y el cambio que va al flujo">
      <defs><marker id="fuA4" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
      <line x1="30" y1="${z}" x2="690" y2="${z}" class="lnm dash"/><text x="24" y="${z + 5}" text-anchor="end" font-size="12" class="tm">0</text>
      ${tank(60, kt0, 'Año anterior')}
      ${tank(510, kt1, 'Año actual')}
      <path d="M222 ${z - 60} L500 ${z - 60}" class="ln s5 anim-flow" marker-end="url(#fuA4)"/>
      <text x="361" y="${z - 92}" text-anchor="middle" font-size="14" class="t2">CAMBIO = anterior − actual</text>
      <text x="361" y="${z - 70}" text-anchor="middle" font-size="20" font-weight="800">${sg(d)}</text>
      <rect x="236" y="${z - 30}" width="250" height="38" rx="19" class="${d > 0 ? 'f1' : d < 0 ? 'f2' : 'bg2'}"/>
      <text x="361" y="${z - 5}" text-anchor="middle" font-size="15" font-weight="800" class="${d ? 'tw' : ''}">${lab}</text>
      <text x="361" y="${z + 50}" text-anchor="middle" font-size="13" class="tm">El NIVEL (los tanques) no va al flujo;</text>
      <text x="361" y="${z + 68}" text-anchor="middle" font-size="13" class="tm">lo que va al flujo es el CAMBIO (la flecha).</text>
    </svg>`;
  };

  // Cubeta de utilidades retenidas
  const svgUR = (ur0, un, ur1) => {
    const pot = ur0 + un, top = Math.max(pot, ur1, 1), H = 170, k = H / top, base = 225, x = 300, w = 180;
    const fill = Math.max(ur1, 0) * k, potY = base - Math.max(pot, 0) * k, d = ur1 - pot;
    return `<svg class="ill" viewBox="0 0 780 260" role="img" aria-label="Cubeta de utilidades retenidas: lo que falta para llegar a lo posible salió como dividendo">
      <rect x="20" y="70" width="200" height="56" rx="12" class="w3"/><text x="120" y="94" text-anchor="middle" font-size="14">UR año anterior</text><text x="120" y="116" text-anchor="middle" font-size="18" font-weight="800">${n0(ur0)}</text>
      <rect x="20" y="140" width="200" height="56" rx="12" class="w5"/><text x="120" y="164" text-anchor="middle" font-size="14">+ Utilidad neta del año</text><text x="120" y="186" text-anchor="middle" font-size="18" font-weight="800">${sg(un)}</text>
      <path d="M${x} ${base - H - 10} L${x + 14} ${base} L${x + w - 14} ${base} L${x + w} ${base - H - 10}" class="ln" stroke-width="3"/>
      <rect x="${x + 16}" y="${base - fill}" width="${w - 32}" height="${Math.max(fill, 1)}" rx="4" class="f3"/>
      <line x1="${x - 10}" y1="${potY}" x2="${x + w + 10}" y2="${potY}" class="ln s5 dash"/>
      <text x="${x + w / 2}" y="${fill >= 30 ? base - fill / 2 + 6 : base - fill - 8}" text-anchor="middle" font-size="16" font-weight="800" class="${fill >= 30 ? 'tw' : ''}">UR final ${n0(ur1)}</text>
      <text x="${x - 14}" y="${potY + 4}" text-anchor="end" font-size="12" class="t2">máximo posible ${n0(pot)}</text>
      <rect x="540" y="95" width="225" height="80" rx="14" class="${d < 0 ? 'f2' : d > 0 ? 'f1' : 'bg2'}"/>
      <text x="652" y="125" text-anchor="middle" font-size="14" font-weight="700" class="${d ? 'tw' : ''}">${d < 0 ? 'Salió a los dueños' : d > 0 ? 'Entró extra (aportaron)' : 'No repartieron nada'}</text>
      <text x="652" y="155" text-anchor="middle" font-size="20" font-weight="800" class="${d ? 'tw' : ''}">${d < 0 ? 'dividendo ' + n0(-d) : d > 0 ? '+' + n0(d) : '0'}</text>
    </svg>`;
  };

  // ------------------------------------------------------------------ sección
  E.section({
    id: 'fuentes-usos', n: 7, group: 'flujo', icon: '⚖️', short: 'Fuentes y usos', exam: 'star',
    title: 'Fuentes y usos: ¿de dónde salió el dinero y en qué se usó?',
    lead: 'Comparas dos balances, cuenta por cuenta, y cada cambio te dice si entró caja (fuente) o salió (uso). De aquí sale el cambio en capital de trabajo: "la pregunta que no falla".',
    render(root) {
      root.innerHTML = `
      <style>
        .sfu .fu-tag{display:inline-flex;align-items:center;gap:4px;font-size:12px;font-weight:800;border-radius:999px;padding:2px 9px;border:1.5px solid;white-space:nowrap;color:var(--ink)}
        .sfu .fu-tag.f{border-color:var(--c1);background:color-mix(in srgb,var(--c1) 16%,var(--card))}
        .sfu .fu-tag.u{border-color:var(--c2);background:color-mix(in srgb,var(--c2) 16%,var(--card))}
        .sfu .fu-tag.z{border-color:var(--line);background:var(--surface);color:var(--muted)}
        .sfu input.num{width:86px;padding:4px 6px;border:1px solid var(--line);border-radius:7px;background:var(--surface);color:var(--ink);font:inherit;font-size:14px;text-align:right;font-variant-numeric:tabular-nums}
        .sfu input.num:focus{outline:2px solid var(--accent);outline-offset:0}
        .sfu .tbl tr.grp td{background:var(--surface);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);text-align:left}
        .sfu .tbl td.chg{font-weight:700}
        .sfu .toc{display:flex;flex-wrap:wrap;gap:6px;margin:12px 0 4px}
        .sfu .toc a{font-size:13px;text-decoration:none;border:1px solid var(--line);border-radius:999px;padding:3px 11px;color:var(--ink2);background:var(--card)}
        .sfu .toc a:hover{border-color:var(--axis);color:var(--ink)}
        .sfu .ctl{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin:10px 0}
        .sfu select{padding:5px 8px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);font:inherit;font-size:13px}
        .sfu .status{font-size:13.5px;color:var(--ink2)}
        .sfu .interp{background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:12px 16px;font-size:15px}
        .sfu .interp h4{margin:0 0 4px;font-size:14px}
        .sfu .interp ul{margin:4px 0 8px}
        .sfu .pick{display:inline-flex;flex-wrap:wrap;gap:4px}
        .sfu .tbl td.pk{white-space:normal;text-align:left;min-width:120px}
        .sfu .pick button{border:1.5px solid var(--line);background:var(--surface);color:var(--ink2);border-radius:8px;padding:3px 9px;font-size:12.5px;font-weight:700;cursor:pointer}
        .sfu .pick button.on[data-v="f"]{border-color:var(--c1);background:color-mix(in srgb,var(--c1) 20%,var(--card));color:var(--ink)}
        .sfu .pick button.on[data-v="u"]{border-color:var(--c2);background:color-mix(in srgb,var(--c2) 20%,var(--card));color:var(--ink)}
        .sfu .pick button.on[data-v="z"]{border-color:var(--axis);background:var(--line2);color:var(--ink)}
        .sfu .fb{font-size:13px;text-align:left;white-space:normal;min-width:130px}
        .sfu .fb.ok{color:var(--good)}.sfu .fb.ko{color:var(--bad)}
        .sfu .score{font-size:18px;font-weight:800}
        .sfu .steps{counter-reset:st;list-style:none;padding-left:0}
        .sfu .steps li{counter-increment:st;position:relative;padding-left:38px;margin:8px 0}
        .sfu .steps li::before{content:counter(st);position:absolute;left:0;top:0;width:26px;height:26px;border-radius:50%;background:var(--btn-on);color:var(--btn-on-ink);display:grid;place-items:center;font-size:13px;font-weight:800}
      </style>
      <div class="sfu">
      <nav class="toc">
        <a href="#/fuentes-usos/fu-que">1 · Qué es</a><a href="#/fuentes-usos/fu-signos">2 · Atajo de signos</a><a href="#/fuentes-usos/fu-sim">3 · Simulador</a>
        <a href="#/fuentes-usos/fu-kt">4 · ★ Cambio en KT</a><a href="#/fuentes-usos/fu-div">5 · Dividendo implícito</a><a href="#/fuentes-usos/fu-capex">6 · CapEx</a>
        <a href="#/fuentes-usos/fu-gen">7 · 🎲 Practica</a><a href="#/fuentes-usos/fu-tips">8 · Tips y errores</a><a href="#/fuentes-usos/fu-quiz">9 · Quiz</a>
      </nav>

      ${E.concept({ id: 'fu-que', title: '1 · Qué es una fuente y qué es un uso', badge: 'star', html: `
        <div class="cols"><div>
          <p><b>Fuente (+)</b> = <b>entró</b> efectivo. <b>Uso (−)</b> = <b>salió</b> efectivo (pago, gasto o inversión).</p>
          <p>Para saber por dónde entró y salió el dinero en un año, pones <b>dos balances lado a lado</b> (año anterior y año actual) y miras <b>cuánto cambió cada cuenta</b>. Cada cambio es una fuente o un uso.</p>
          ${E.tip('<q>Las fuentes y los usos son los bloques básicos de las finanzas corporativas.</q> Si los entiendes, entiendes cómo funciona la empresa.', 'Clase 28-sep')}
        </div><div>
          ${E.kid('Piensa en tu <b>alcancía</b>. Si vendes tu bici, te entra dinero: <b>fuente</b>. Si compras un videojuego, te sale dinero: <b>uso</b>. Si tu tío te presta $100, te entra: <b>fuente</b>. Cuando se los regresas, te sale: <b>uso</b>.')}
        </div></div>
        <h4 style="margin:16px 0 4px">La tabla que tienes que saber de memoria</h4>
        ${E.fig(svgMatriz, 'Activo y pasivo se leen AL REVÉS: si el activo sube, salió caja para comprarlo (uso); si el pasivo sube, alguien te dio dinero (fuente).', true)}
        <div class="g2">
          <div class="card2"><h4>👤 Lado del activo = mirada del accionista</h4><p class="small">El activo es <b>la inversión</b>. Si crece, al dueño le están pidiendo meter más dinero: es <b>uso</b>. Si baja (vendes un terreno, cobras a clientes, bajas inventario), se libera dinero: <b>fuente</b>.</p></div>
          <div class="card2"><h4>🧑‍💼 Lado del pasivo y patrimonio = mirada de la gerencia</h4><p class="small">El gerente es quien le paga a los que financian (bancos, proveedores, dueños). Si le prestan, le entra: <b>fuente</b>. Si paga deuda o dividendos, le sale: <b>uso</b>. Si los dueños <b>no retiran</b> utilidades, para el gerente es <b>fuente</b>.</p></div>
        </div>
        <h4 style="margin:18px 0 4px">Todo depende de quién mira: el chofer de Uber</h4>
        ${E.fig(svgUber, 'Para el chofer, recibir el préstamo es fuente y pagarlo es uso. Para quien le prestó (el dueño del coche o el banco), exactamente al revés.', true)}
        ${E.note('Lo mismo pasa con tu <b>tarjeta de crédito</b>: cuando la usas, el banco te financia (fuente para ti, uso para el banco). Cuando pagas el mes siguiente, es uso para ti y fuente para el banco.', 'Mismo truco, otro ejemplo')}
        <h4 style="margin:18px 0 4px">¿Y la depreciación?</h4>
        <p>La depreciación aparece en el estado de resultados como gasto, <b>pero no sale ni un peso de la caja</b> (el coche se pagó el día que se compró). Por eso en el flujo <b>se devuelve: actúa como fuente</b>.</p>
        ${E.formula('Ejemplo rápido', 'Caja generada antes de KT', 'Utilidad neta 100 + Depreciación 30 = 130', 'Los 30 de depreciación bajaron la utilidad, pero nunca salieron de la caja.')}
        ${E.tip('<q>La depreciación no es un gasto [de caja], siempre actúa como una fuente.</q>', 'Clases de septiembre · La Tiendita')}
      ` })}

      ${E.concept({ id: 'fu-signos', title: '2 · El atajo de signos del profe (para no equivocarte nunca)', badge: 'star', html: `
        <div class="cols"><div>
          ${E.formula('Cuentas de ACTIVO', 'Cambio', 'Año anterior − Año actual', 'Si el activo subió, el resultado sale negativo = uso. Solo.')}
          ${E.formula('Cuentas de PASIVO y PATRIMONIO', 'Cambio', 'Año actual − Año anterior', 'Si el pasivo subió, sale positivo = fuente. Solo.')}
          ${E.formula('Verificación', 'Suma de TODOS los cambios', '0', 'Lo que se usó en activos tuvo que financiarse en pasivo + capital (A = P + C).')}
          <p>Con este truco <b>el signo te dice la respuesta</b>: <b>positivo = fuente (entró)</b>, <b>negativo = uso (salió)</b>. No tienes que pensar si la cuenta es de activo o pasivo después de restar.</p>
          ${E.tip('<q>La clave de todo es tener los signos.</q> <q>Hasta que no tengan la maña, háganlo así, no se van a equivocar.</q>', 'Clase 5-oct')}
          ${E.tip('<q>Positivo es que nos entró dinero. Negativo, gastamos.</q>', 'Clase 30-sep')}
        </div><div>
          <h4 style="margin:0 0 6px">El caso que confunde a todos: la caja</h4>
          ${E.fig(svgCaja, 'La caja también es un activo. Si sube, es USO: el dueño deja dinero "estacionado" en la empresa en vez de recibirlo.')}
          ${E.warn('<b>Un AUMENTO de caja es un USO.</b> Suena raro, pero la caja es activo = inversión del dueño. Si sube, el dueño está dejando más dinero ahí.')}
          ${E.warn('<b>No te confundas por el nombre de la cuenta.</b> Si un pasivo sube (diga "beneficios a empleados", "impuesto diferido" o lo que sea), alguien te está financiando: fuente. Si baja, lo pagaste: uso.')}
          ${E.tip('Proveedores pasaron de ≈32,000 a ≈28,000. Un alumno dijo "les quedé debiendo más". El profe: <q>La palabra es pagar.</q> Bajaron = les pagaste = uso.', 'Clase 30-sep · Soriana')}
        </div></div>
        <h4 style="margin:18px 0 4px">Mini ejemplo del profe: ¿cuánto cobré de verdad?</h4>
        <p>Ventas del año: <b>1,000,000</b>. Clientes (CxC) el año anterior: <b>5,000</b>; este año: <b>2,000</b>.</p>
        <div class="g2">
          <div class="card2"><h4>Caso A: los clientes bajan</h4><p class="small">Activo: anterior − actual = 5,000 − 2,000 = <b>+3,000 → fuente</b> (cobré lo que me debían).<br>Efectivo cobrado = 1,000,000 + 3,000 = <b>1,003,000</b>.</p></div>
          <div class="card2"><h4>Caso B: los clientes suben a 12,000</h4><p class="small">5,000 − 12,000 = <b>−7,000 → uso</b> (estoy financiando a mis clientes).<br>Efectivo cobrado = 1,000,000 − 7,000 = <b>993,000</b>.</p></div>
        </div>
        ${E.key('Para responder cualquier pregunta de fuentes y usos: <ol class="steps"><li>Pon los dos balances lado a lado.</li><li>Activo: <b>anterior − actual</b>. Pasivo y patrimonio: <b>actual − anterior</b>.</li><li>Etiqueta: <b>+ fuente</b>, <b>− uso</b>.</li><li>Verifica: la suma de todos los cambios <b>= 0</b>.</li><li>Interpreta en una frase: <b>¿de dónde vino el dinero y en qué se usó?</b></li></ol>', 'La receta paso a paso')}
      ` })}

      ${E.concept({ id: 'fu-sim', title: '3 · Simulador: dos balances → fuentes y usos en vivo', badge: 'star', html: `
        <p>Cambia cualquier número (cifras en miles). El simulador calcula el cambio con el signo del profe, lo etiqueta, revisa que la suma dé 0 y te cuenta la historia. Si tus balances no cuadran, usa <b>⚖️ Cuadrar</b>.</p>
        <div class="ctl"><span class="small muted">Ejemplos que cuadran:</span>
          ${Object.entries(PRESETS).map(([k, p]) => `<button type="button" class="btn sm" data-preset="${k}">${p.name}</button>`).join('')}
        </div>
        <div class="tblwrap"><table class="tbl" id="fuTbl"></table></div>
        <div class="ctl">
          <label class="small" for="fuRow">Renglón que se ajusta para cuadrar:</label>
          <select id="fuRow"><option value="caja">Caja</option><option value="ur">Utilidades retenidas</option></select>
          <button type="button" class="btn pri sm" id="fuCuadrar">⚖️ Cuadrar</button>
          <span class="status" id="fuStatus"></span>
        </div>
        <div class="ctl">
          <label class="small" for="fuUN">Utilidad neta del año:</label><input class="num" id="fuUN" type="number" step="10">
          <label class="small" for="fuDep">Depreciación del año:</label><input class="num" id="fuDep" type="number" step="10">
          <span class="small muted">(sirven para dividendo implícito y CapEx)</span>
        </div>
        <div id="fuTiles" style="margin:10px 0"></div>
        <div class="cols">
          <div>${E.fig('<div id="fuBal"></div>', 'Total de usos contra total de fuentes: si los dos balances cuadran, la balanza queda pareja.')}</div>
          <div><div class="chart h360" id="fuChart" role="img" aria-label="Barras divergentes: fuentes a la derecha, usos a la izquierda"></div></div>
        </div>
        <div class="interp" id="fuInterp" aria-live="polite"></div>
      ` })}

      ${E.concept({ id: 'fu-kt', title: '4 · ★ Cambio en capital de trabajo: "la pregunta que no falla"', badge: 'star', html: `
        ${E.tip('Sobre el cambio en capital de trabajo: <q>Esta es una pregunta que no falla.</q> Es la que se le hace a cualquiera en un examen de finanzas.', 'Clase 5-oct')}
        <div class="cols"><div>
          ${E.formula('Capital de trabajo (nivel)', 'KT', 'Activo corriente − Pasivo corriente')}
          ${E.formula('Cambio en KT (lo que va al flujo)', 'ΔKT', 'KT año anterior − KT año actual', 'Mismo atajo que un activo: si sale negativo, es uso.')}
          <ul>
            <li><b>KT aumenta → USO</b> (la empresa <b>invirtió</b> en capital de trabajo: más clientes, más inventario o menos proveedores).</li>
            <li><b>KT disminuye → FUENTE</b> (la empresa <b>liberó</b> dinero del capital de trabajo).</li>
          </ul>
          ${E.tip('<q>Si es un uso, la inversión en capital de trabajo está aumentando.</q> Si es fuente, está disminuyendo.', 'Clase 5-oct · Walmex')}
          ${E.warn('<b>"No confundan"</b> el <b>KT del año</b> (el nivel, AC − PC, sirve para liquidez) con el <b>CAMBIO</b> en KT (la diferencia entre dos años, que es lo que va al flujo). Si KT pasó de 200 a 350, al flujo NO va 350: va <b>−150 (uso)</b>.')}
          ${E.kid('El capital de trabajo es el <b>dinero que la tiendita necesita "dando vueltas"</b> para operar: dulces en el anaquel y fiado a los vecinos, menos lo que le debe al proveedor. Si este año necesita más dulces y fía más, tuvo que <b>meter</b> más dinero: eso es un uso.')}
        </div><div>
          <div id="fuKtSvg"></div>
          <div id="fuKtK"></div>
          <div id="fuKtTiles" style="margin-top:10px"></div>
          <p class="small" id="fuKtTxt" style="margin-top:8px"></p>
        </div></div>
        <h4 style="margin:18px 0 4px">Dos maneras de calcularlo (el simulador de arriba muestra las dos)</h4>
        <div class="g2">
          <div class="card2"><h4>A) Atajo contable (todo el corriente)</h4><p class="small">KT = (Caja + CxC + Inventarios) − (Proveedores + Deuda CP). Rápido, da una idea. Es lo que se usa para el análisis de liquidez.</p></div>
          <div class="card2"><h4>B) Depurado (sólo la operación)</h4><p class="small">KT operativo = CxC + Inventarios − Proveedores. <b>Sin caja</b> (es dinero estacionado, no operación) y <b>sin deuda con costo</b> (el banco es un proveedor de capital, va a financiamiento). Es lo que se hace "en serio".</p></div>
        </div>
        ${E.note('El criterio <b>purista</b> saca toda deuda que cobra interés, aunque venga de socios o de la casa matriz. <b>Excepción válida:</b> cuando la línea de crédito es <b>vital para operar</b>, p.ej. un <b>hospital</b> (las aseguradoras tardan en pagar y la nómina es quincenal), un <b>abogado litigante</b> o una <b>importadora</b> (cartas de crédito con meses de desfase). El profe: "no es blanco y negro… ambas posiciones son válidas". Lo importante es <b>decir qué criterio usaste</b>.', 'Qué cuentas meter: depende del analista')}
        <h4 style="margin:18px 0 4px">KT "después de impuestos" (concepto)</h4>
        <p>Sin pagar impuestos no puedes operar (te embargan). Por eso el profe resta los impuestos del año al cambio en KT:</p>
        ${E.formula('', 'ΔKT después de impuestos', '(KT anterior − KT actual) − Impuestos del año')}
        ${E.key('Con cifras de clase (aproximadas): el KT de Walmex se volvió "más negativo" → <b>fuente ≈ +5.4 mil millones</b>; menos impuestos del año ≈ <b>19 mil millones</b> → <b>ΔKT después de impuestos ≈ −13.6 mil millones</b>: Walmex <b>invirtió</b> ≈ 13.6 mil millones en capital de trabajo.<br><br><b>¿KT negativo es malo?</b> No necesariamente. Walmex tiene KT negativo porque sus <b>proveedores (≈123 mil millones)</b> le financian casi toda la operación: vende la mercancía antes de pagarla. Es señal de poder de negociación, no de problema.', 'Caso Walmex 2025')}
        ${E.note('El profe aclaró que el <b>cálculo de impuestos pagados no entra</b> al examen; quédate con el concepto: el KT se ajusta por impuestos porque son un costo para poder operar.', 'Ojo')}
      ` })}

      ${E.concept({ id: 'fu-div', title: '5 · Utilidades retenidas → el dividendo "implícito"', badge: 'in', html: `
        <div class="cols"><div>
          <p>Si no te dan el dividendo, lo <b>deduces</b>: las utilidades retenidas del año anterior más la utilidad del año es lo <b>máximo</b> que podría haber al cierre. Lo que falta, <b>salió a los dueños</b>.</p>
          ${E.formula('Dividendo implícito', 'Dividendos', 'Utilidad neta − ΔUtilidades retenidas')}
          ${E.formula('Versión del profe (flujo al accionista)', 'Flujo al accionista', 'ΔPatrimonio − Utilidad neta', 'Negativo = pagó dividendos (uso). Positivo = los socios capitalizaron (fuente).')}
          ${E.tip('Lo que falta al hacer la variación del patrimonio y restarle la utilidad: <q>eso es el dinero que salió de la empresa.</q>', 'Clase 30-sep')}
          <h4>Ejemplo del profe: UR anterior = 100, utilidad del año = 150</h4>
          ${E.table([
            ['Reparte 50', 200, '+100', '100 − 150 = −50', 'pagó 50'],
            ['No reparte nada', 250, '+150', '150 − 150 = 0', 'pagó 0'],
            ['Reparte todo', 100, '0', '0 − 150 = −150', 'pagó 150'],
          ], { head: ['Caso', 'UR final', 'ΔUR', 'ΔUR − UN', 'Dividendo'], fmt: [null, n0] })}
          ${E.note('El dividendo <b>financiero</b> es "todo dinero que le devuelvo al dueño, no importa cómo" (dividendos, recompras, préstamos a socios). El <b>contable</b> es sólo el declarado.', 'Dos conceptos de dividendo')}
        </div><div>
          <div id="fuUrSvg"></div>
          <div id="fuUrK"></div>
          <p class="small" id="fuUrTxt" style="margin-top:8px"></p>
        </div></div>
      ` })}

      ${E.concept({ id: 'fu-capex', title: '6 · CapEx a partir del activo fijo neto', badge: 'in', html: `
        <p>El balance muestra el activo fijo <b>neto</b> (ya le restaron la depreciación). Si sólo comparas el neto, la depreciación "esconde" lo que compraste. Por eso hay que <b>devolverle la depreciación</b>.</p>
        ${E.formula('CapEx (lo que invertiste en activo fijo)', 'CapEx', 'ΔActivo fijo neto (actual − anterior) + Depreciación del año')}
        ${E.formula('Con signos de fuentes y usos', '−CapEx', '(AFN anterior − AFN actual) − Depreciación', 'Sale negativo = uso: invertiste.')}
        ${E.fig(svgMoto, 'Coche de 100 que se deprecia 20 al año. En un año normal el neto baja 20 y la depreciación es 20: CapEx 0. El año en que compra una moto de 10, el neto baja sólo 10 aunque se depreciaron 20: la diferencia es la moto.', true)}
        <div class="cols"><div>
          <ol class="steps">
            <li>Coche comprado en <b>100</b>; se deprecia <b>20 por año</b> (5 años). La factura (costo histórico) nunca cambia; el <b>neto</b> baja 100 → 80 → 60 → 40 → 20 → 0.</li>
            <li><b>Año normal (80 → 60):</b> fuentes/usos 80 − 60 = +20; quito la depreciación −20 → <b>0</b>. No compró nada.</li>
            <li><b>Año de la moto (20 → 10):</b> el coche llega a 0 y entra una moto de 10. Fuentes/usos 20 − 10 = +10; menos depreciación 20 → <b>−10 = CapEx de 10</b>.</li>
          </ol>
          ${E.tip('<q>Es la manera que indirectamente llego a saber cuánto se gastó en CapEx.</q>', 'Clase 5-oct')}
          ${E.tip('<q>Ajustar el CapEx y ajustar los dividendos… es el único truco.</q> Sólo al CapEx se le devuelve la depreciación.', 'Clase 30-sep')}
        </div><div>
          <div id="fuCxK"></div>
          <div id="fuCxTiles" style="margin-top:10px"></div>
          <p class="small" id="fuCxTxt" style="margin-top:8px"></p>
        </div></div>
      ` })}

      ${E.concept({ id: 'fu-gen', title: '7 · 🎲 Generador de ejercicios: practica hasta que te salga solo', badge: 'star', html: `
        <p>Cada ejercicio trae dos balances que <b>cuadran</b>. Marca cada renglón como <b>fuente</b>, <b>uso</b> o <b>igual</b> (sin cambio), escribe el <b>cambio en KT operativo</b> (CxC + Inventarios − Proveedores) con su signo (+ fuente / − uso) y revisa.</p>
        <div class="ctl"><button type="button" class="btn pri" id="fuNew">🎲 Nuevo ejercicio</button><button type="button" class="btn" id="fuCheck">✔ Revisar</button><span class="score" id="fuScore" aria-live="polite"></span></div>
        <div class="tblwrap"><table class="tbl" id="fuGTbl"></table></div>
        <div class="ctl"><label for="fuKtAns"><b>ΔKT operativo</b> = KT anterior − KT actual =</label><input class="num" id="fuKtAns" type="number" step="10" placeholder="±"><span class="fb" id="fuKtFb"></span></div>
        <div id="fuSol"></div>
      ` })}

      ${E.concept({ id: 'fu-tips', title: '8 · Tips del profe y errores comunes', badge: 'star', html: `
        <div class="g2"><div>
          ${E.tip('<q>Esta es una pregunta que no falla.</q> Cambio en capital de trabajo: aumento = uso, disminución = fuente.', 'Clase 5-oct')}
          ${E.tip('<q>No importa el nombre, no se confundan por el nombre.</q> Pasivo que sube: alguien te financia.', 'Clase 30-sep')}
          ${E.tip('Activo = perspectiva del <b>accionista</b>; pasivo y patrimonio = perspectiva de la <b>gerencia</b>.', 'Apuntes · Flujos de Caja 1')}
          ${E.tip('Para concluir algo de un cambio, compáralo: <q>Tienes que tener más variables para poder hacer la conclusión.</q> Si bajó el inventario y subieron las ventas, buena tarea.', 'Clase 30-sep · Soriana')}
          ${E.tip('<q>Escriban cómo hicieron la lógica del cálculo.</q> Pon la resta con los dos años y el signo, aunque te equivoques en un número.', 'Clase 5-oct')}
        </div><div>
          ${E.warn('<b>Creer que si la caja sube es fuente.</b> Es USO: el dueño deja más inversión en la caja.')}
          ${E.warn('<b>Proveedores bajaron = "les quedé debiendo más".</b> No: bajaron porque <b>les pagaste</b> → uso.')}
          ${E.warn('<b>Restar igual en activo y pasivo.</b> Activo: anterior − actual. Pasivo y capital: actual − anterior. Si no, todos los signos del lado derecho salen al revés.')}
          ${E.warn('<b>Meter el nivel de KT al flujo</b> en vez del cambio. Al flujo va la diferencia entre dos años.')}
          ${E.warn('<b>Meter deuda con interés en el KT operativo.</b> Va a financiamiento (salvo la excepción de la línea de crédito vital, y dilo).')}
          ${E.warn('<b>Olvidar la depreciación</b> al sacar CapEx del activo fijo neto, o no deducir el dividendo implícito (UN − ΔUR).')}
          ${E.warn('<b>No verificar.</b> Si la suma de todos los cambios no da 0, algo está mal (un signo o un renglón).')}
        </div></div>
      ` })}

      ${E.concept({ id: 'fu-quiz', title: '9 · Quiz final: 5 preguntas rápidas', badge: 'star', html: '<div id="fuQuiz"></div>' })}
      </div>`;

      // ================================================================ SIMULADOR
      const st = { y0: {}, y1: {}, un: 0, dep: 0 };
      const load = (p) => { st.y0 = { ...p.y0 }; st.y1 = { ...p.y1 }; st.un = p.un; st.dep = p.dep; };
      load(PRESETS.base);
      const tbl = root.querySelector('#fuTbl');
      const inUN = root.querySelector('#fuUN'), inDep = root.querySelector('#fuDep');
      let chartData = [];

      const buildTable = () => {
        const row = (a) => `<tr data-k="${a.k}"><td>${a.n}</td>
          <td><input class="num" type="number" step="10" data-y="0" data-k="${a.k}" value="${st.y0[a.k]}" aria-label="${a.n}, año anterior"></td>
          <td><input class="num" type="number" step="10" data-y="1" data-k="${a.k}" value="${st.y1[a.k]}" aria-label="${a.n}, año actual"></td>
          <td class="chg" data-c="${a.k}"></td><td data-t="${a.k}"></td></tr>`;
        tbl.innerHTML = `<thead><tr><th>Cuenta</th><th>Año anterior</th><th>Año actual</th><th>Cambio</th><th>¿Qué es?</th></tr></thead><tbody>
          <tr class="grp"><td colspan="5">Activo · cambio = anterior − actual</td></tr>
          ${ACC.filter((a) => a.s === 'a').map(row).join('')}
          <tr class="tot"><td>Total activo</td><td data-tt="a0"></td><td data-tt="a1"></td><td data-tt="ca"></td><td></td></tr>
          <tr class="grp"><td colspan="5">Pasivo y patrimonio · cambio = actual − anterior</td></tr>
          ${ACC.filter((a) => a.s !== 'a').map(row).join('')}
          <tr class="tot"><td>Total pasivo + patrimonio</td><td data-tt="p0"></td><td data-tt="p1"></td><td data-tt="cp"></td><td></td></tr>
          <tr class="tot"><td>Suma de todos los cambios (debe ser 0)</td><td></td><td></td><td data-tt="sum"></td><td data-tt="sumt"></td></tr></tbody>`;
        tbl.querySelectorAll('input').forEach((inp) => inp.addEventListener('input', () => {
          const v = parseFloat(inp.value); st['y' + inp.dataset.y][inp.dataset.k] = isFinite(v) ? v : 0; update();
        }));
        inUN.value = st.un; inDep.value = st.dep;
      };
      inUN.addEventListener('input', () => { st.un = parseFloat(inUN.value) || 0; update(); });
      inDep.addEventListener('input', () => { st.dep = parseFloat(inDep.value) || 0; update(); });

      const chart = E.chart(root.querySelector('#fuChart'), (T) => ({
        ...E.baseOpt(T),
        grid: { left: 8, right: 30, top: 30, bottom: 8, containLabel: true },
        tooltip: { ...E.baseOpt(T).tooltip, formatter: (ps) => { const p = ps.find((x) => x.value !== '-' && x.value !== null && x.value !== undefined); const name = ps[0].name; if (!p) return name + ': sin cambio'; return `<b>${name}</b><br>${p.value > 0 ? '⊕ Fuente' : '⊖ Uso'}: ${sg(p.value)}`; } },
        legend: { ...E.baseOpt(T).legend, data: ['⊕ Fuente (entró)', '⊖ Uso (salió)'] },
        yAxis: E.axisCat(chartData.map((d) => d.name), T, { inverse: true }),
        xAxis: E.axisVal(T, (v) => E.fmt.sgn(v, 0), (() => { const m = Math.max(10, ...chartData.map((d) => Math.abs(d.v))) * 1.35; return { min: -m, max: m, axisLabel: { color: T.muted, fontSize: 11, formatter: (v) => (Math.abs(v - m) < 1e-6 || Math.abs(v + m) < 1e-6 ? '' : E.fmt.sgn(v, 0)) } }; })()),
        series: [
          { name: '⊕ Fuente (entró)', type: 'bar', stack: 'fu', barMaxWidth: 22, data: chartData.map((d) => (d.v > 0 ? d.v : '-')), itemStyle: { color: T.c1, borderRadius: [0, 4, 4, 0] },
            label: { show: true, position: 'right', color: T.ink2, fontSize: 11, formatter: (p) => sg(p.value) } },
          { name: '⊖ Uso (salió)', type: 'bar', stack: 'fu', barMaxWidth: 22, data: chartData.map((d) => (d.v < 0 ? d.v : '-')), itemStyle: { color: T.c2, borderRadius: [4, 0, 0, 4] },
            label: { show: true, position: 'left', color: T.ink2, fontSize: 11, formatter: (p) => sg(p.value) },
            markLine: { silent: true, symbol: 'none', lineStyle: { color: T.axis, width: 1 }, label: { show: false }, data: [{ xAxis: 0 }] } },
        ],
      }));

      const update = () => {
        const { y0, y1 } = st, t0 = tot(y0), t1 = tot(y1);
        const ch = ACC.map((a) => ({ a, v: chg(a, y0, y1) }));
        ch.forEach(({ a, v }) => { tbl.querySelector(`[data-c="${a.k}"]`).textContent = sg(v); tbl.querySelector(`[data-t="${a.k}"]`).innerHTML = tag(v); });
        const ca = t0.a - t1.a, cp = t1.pyc - t0.pyc, sum = ca + cp;
        const set = (k, h) => { tbl.querySelector(`[data-tt="${k}"]`).innerHTML = h; };
        set('a0', n0(t0.a)); set('a1', n0(t1.a)); set('p0', n0(t0.pyc)); set('p1', n0(t1.pyc)); set('ca', sg(ca)); set('cp', sg(cp)); set('sum', sg(sum));
        const okSum = Math.abs(sum) < 0.5;
        set('sumt', okSum ? '<span class="good">✓ cuadra</span>' : '<span class="bad">✗ revisa</span>');
        const b0 = Math.abs(t0.a - t0.pyc) < 0.5, b1 = Math.abs(t1.a - t1.pyc) < 0.5;
        root.querySelector('#fuStatus').innerHTML = `Año anterior ${b0 ? '<span class="good">✓ cuadra</span>' : `<span class="bad">✗ A − (P+C) = ${sg(t0.a - t0.pyc)}</span>`} · Año actual ${b1 ? '<span class="good">✓ cuadra</span>' : `<span class="bad">✗ A − (P+C) = ${sg(t1.a - t1.pyc)}</span>`}`;
        const F = ch.filter((c) => c.v > 0).reduce((s, c) => s + c.v, 0), U = -ch.filter((c) => c.v < 0).reduce((s, c) => s + c.v, 0);
        const dKT = t0.kt - t1.kt, dKTd = t0.ktd - t1.ktd, div = st.un - (y1.ur - y0.ur), flujoAcc = (y1.cs - y0.cs) + (y1.ur - y0.ur) - st.un, capex = (y1.afn - y0.afn) + st.dep;
        E.tiles(root.querySelector('#fuTiles'), [
          { label: '⊕ Total fuentes', v: F, fmt: 'n' },
          { label: '⊖ Total usos', v: U, fmt: 'n' },
          { label: 'Verificación: fuentes − usos', v: F - U, fmt: 'n', note: okSum ? '✓ suma = 0' : '✗ no da 0: algún balance no cuadra', hl: true },
          { label: 'ΔKT contable (con caja y deuda CP)', v: dKT, fmt: 'sgn', note: `KT ${n0(t0.kt)} → ${n0(t1.kt)} · ${dKT > 0 ? '⊕ fuente' : dKT < 0 ? '⊖ uso (invirtió)' : 'sin cambio'}` },
          { label: '★ ΔKT operativo (depurado)', v: dKTd, fmt: 'sgn', hl: true, note: `CxC + Inv − Prov: ${n0(t0.ktd)} → ${n0(t1.ktd)} · ${dKTd > 0 ? '⊕ fuente' : dKTd < 0 ? '⊖ uso (invirtió)' : 'sin cambio'}` },
          { label: 'Dividendo implícito (UN − ΔUR)', v: div, fmt: 'n', note: div > 0 ? 'salió a los dueños' : div < 0 ? 'retuvieron más que la utilidad: revisa' : 'no repartieron' },
          { label: 'Flujo al accionista (ΔPatrimonio − UN)', v: flujoAcc, fmt: 'sgn', note: flujoAcc < 0 ? '⊖ uso: les pagó' : flujoAcc > 0 ? '⊕ fuente: capitalizaron' : 'neutro' },
          { label: 'CapEx (ΔAFN + depreciación)', v: capex, fmt: 'n', note: capex > 0 ? `invirtió (${st.dep ? E.fmt.x(capex / st.dep, 1) : '—'} la depreciación)` : capex < 0 ? 'desinvirtió (vendió activos)' : 'sólo repuso lo depreciado' },
        ]);
        root.querySelector('#fuBal').innerHTML = svgBalanza(F, U);
        chartData = ch.map(({ a, v }) => ({ name: SHORT[a.k], v }));
        chart.refresh();
        // interpretación automática
        const top = (arr) => arr.slice(0, 3).map(({ a, v }) => `<li><b>${SHORT[a.k]} (${sg(v)})</b>: ${WHY[a.k][v > 0 ? 0 : 1]}.</li>`).join('');
        const fs = ch.filter((c) => c.v > 0).sort((p, q) => q.v - p.v), us = ch.filter((c) => c.v < 0).sort((p, q) => p.v - q.v);
        const ktPhrase = dKTd < 0 ? `El capital de trabajo operativo <b>aumentó</b>: la empresa <b>invirtió ${n0(-dKTd)}</b> en clientes/inventario (uso).` : dKTd > 0 ? `El capital de trabajo operativo <b>disminuyó</b>: la empresa <b>liberó ${n0(dKTd)}</b> (fuente).` : 'El capital de trabajo operativo no cambió.';
        root.querySelector('#fuInterp').innerHTML = `
          ${okSum ? '' : '<p class="bad"><b>✗ Ojo:</b> los balances no cuadran, por eso la suma no da 0. Usa ⚖️ Cuadrar.</p>'}
          <div class="g2" style="margin:0"><div><h4>⊕ ¿De dónde salió el dinero? (${n0(F)})</h4><ul>${top(fs) || '<li>Ninguna fuente.</li>'}</ul></div>
          <div><h4>⊖ ¿En qué se usó? (${n0(U)})</h4><ul>${top(us) || '<li>Ningún uso.</li>'}</ul></div></div>
          <p style="margin:4px 0">${ktPhrase} ${div > 0 ? `Con utilidad de ${n0(st.un)} y utilidades retenidas que subieron ${n0(y1.ur - y0.ur)}, se deduce un <b>dividendo de ${n0(div)}</b>.` : ''} ${capex > 0 ? `Invirtió <b>${n0(capex)}</b> en activo fijo (CapEx).` : ''}</p>`;
      };

      root.querySelector('#fuCuadrar').addEventListener('click', () => {
        const k = root.querySelector('#fuRow').value;
        [st.y0, st.y1].forEach((y) => { const t = tot(y), d = t.a - t.pyc; if (k === 'caja') y.caja -= d; else y.ur += d; });
        buildTable(); update();
        tbl.classList.remove('flash'); void tbl.offsetWidth; tbl.classList.add('flash');
      });
      root.querySelectorAll('[data-preset]').forEach((b) => b.addEventListener('click', () => { load(PRESETS[b.dataset.preset]); buildTable(); update(); }));
      buildTable(); update();

      // ================================================================ KT widget
      const K0 = { cxc: 150, inv: 200, prov: 120 };
      E.knobs(root.querySelector('#fuKtK'), [
        { k: 'cxc', label: 'Clientes (CxC) año actual · anterior 150', min: 0, max: 500, step: 10, v: 190, fmt: 'n' },
        { k: 'inv', label: 'Inventarios año actual · anterior 200', min: 0, max: 500, step: 10, v: 240, fmt: 'n' },
        { k: 'prov', label: 'Proveedores año actual · anterior 120', min: 0, max: 900, step: 10, v: 160, fmt: 'n', hint: 'Súbelo mucho para ver un KT negativo tipo Walmex.' },
        { k: 'tax', label: 'Impuestos del año', min: 0, max: 150, step: 5, v: 30, fmt: 'n' },
      ], (s) => {
        const kt0 = K0.cxc + K0.inv - K0.prov, kt1 = s.cxc + s.inv - s.prov, d = kt0 - kt1, dt = d - s.tax;
        root.querySelector('#fuKtSvg').innerHTML = E.fig(svgKT(kt0, kt1, d), '');
        E.tiles(root.querySelector('#fuKtTiles'), [
          { label: 'KT anterior (nivel)', v: kt0, fmt: 'n' },
          { label: 'KT actual (nivel)', v: kt1, fmt: 'n' },
          { label: 'ΔKT = anterior − actual', v: d, fmt: 'sgn', hl: true, note: d > 0 ? '⊕ fuente' : d < 0 ? '⊖ uso' : 'sin cambio' },
          { label: 'ΔKT después de impuestos', v: dt, fmt: 'sgn', note: `${sg(d)} − ${n0(s.tax)}` },
        ]);
        root.querySelector('#fuKtTxt').innerHTML = (d < 0
          ? `El KT pasó de ${n0(kt0)} a ${n0(kt1)}: <b>aumentó ${n0(-d)}</b> → es un <b>uso</b>. La empresa tuvo que meter dinero a clientes/inventario.`
          : d > 0 ? `El KT pasó de ${n0(kt0)} a ${n0(kt1)}: <b>disminuyó ${n0(d)}</b> → es una <b>fuente</b>. Liberó caja (cobró, bajó inventario o los proveedores la financiaron más).`
            : 'El KT no cambió: ni fuente ni uso.')
          + (kt1 < 0 ? ' <b>KT negativo</b>: los proveedores financian la operación (como Walmex); no es malo por sí mismo.' : '')
          + ` Después de impuestos: <b>${sg(dt)}</b>${dt < 0 ? ' (invirtió en KT después de impuestos).' : '.'}`;
      }, { title: '🎛️ Mueve el año actual' });

      // ================================================================ dividendo implícito widget
      E.knobs(root.querySelector('#fuUrK'), [
        { k: 'ur0', label: 'Utilidades retenidas año anterior', min: 0, max: 400, step: 10, v: 100, fmt: 'n' },
        { k: 'un', label: 'Utilidad neta del año', min: -100, max: 300, step: 10, v: 150, fmt: 'n' },
        { k: 'ur1', label: 'Utilidades retenidas año actual', min: 0, max: 700, step: 10, v: 200, fmt: 'n' },
        { k: 'dcs', label: 'Cambio en capital social (aportaciones)', min: -100, max: 200, step: 10, v: 0, fmt: 'n' },
      ], (s) => {
        const dur = s.ur1 - s.ur0, div = s.un - dur, fa = s.dcs + dur - s.un;
        root.querySelector('#fuUrSvg').innerHTML = E.fig(svgUR(s.ur0, s.un, s.ur1), '');
        root.querySelector('#fuUrTxt').innerHTML = `ΔUR = ${n0(s.ur1)} − ${n0(s.ur0)} = <b>${sg(dur)}</b>. Dividendo implícito = UN − ΔUR = ${n0(s.un)} − (${sg(dur)}) = <b>${n0(div)}</b>. `
          + `Flujo al accionista = ΔCapital ${sg(s.dcs)} + ΔUR ${sg(dur)} − UN ${n0(s.un)} = <b>${sg(fa)}</b> → `
          + (fa < 0 ? `<b>uso</b>: la empresa les pagó ${n0(-fa)} a los dueños.` : fa > 0 ? `<b>fuente</b>: los dueños capitalizaron (metieron ${n0(fa)} netos).` : 'neutro: ni pagaron ni aportaron.');
      }, { title: '🎛️ Juega con las utilidades retenidas' });

      // ================================================================ CapEx widget
      E.knobs(root.querySelector('#fuCxK'), [
        { k: 'a0', label: 'Activo fijo neto año anterior', min: 0, max: 1000, step: 10, v: 600, fmt: 'n' },
        { k: 'a1', label: 'Activo fijo neto año actual', min: 0, max: 1000, step: 10, v: 640, fmt: 'n' },
        { k: 'dep', label: 'Depreciación del año', min: 0, max: 200, step: 5, v: 60, fmt: 'n' },
      ], (s) => {
        const capex = s.a1 - s.a0 + s.dep, fu = s.a0 - s.a1;
        E.tiles(root.querySelector('#fuCxTiles'), [
          { label: 'Fuentes/usos del AFN (ant − act)', v: fu, fmt: 'sgn' },
          { label: 'Depreciación (se devuelve)', v: s.dep, fmt: 'n' },
          { label: 'CapEx = ΔAFN + dep.', v: capex, fmt: 'n', hl: true },
          { label: 'CapEx / depreciación', v: s.dep ? capex / s.dep : null, fmt: 'x', dec: 2 },
        ]);
        root.querySelector('#fuCxTxt').innerHTML = `CapEx = (${n0(s.a1)} − ${n0(s.a0)}) + ${n0(s.dep)} = <b>${n0(capex)}</b>. `
          + (capex < 0 ? 'Negativo: <b>desinvirtió</b> (vendió activos fijos) — sería fuente.'
            : !s.dep ? 'Sin depreciación, el CapEx es sólo el cambio del neto.'
              : capex / s.dep > 1.2 ? 'Invierte <b>bastante más de lo que deprecia</b>: está creciendo (abriendo tiendas, más capacidad).'
                : capex / s.dep >= 0.8 ? 'Invierte <b>más o menos lo que deprecia</b>: típico de una empresa madura que sólo repone.'
                  : 'Invierte <b>menos de lo que deprecia</b>: sus activos se van haciendo viejos.');
      }, { title: '🎛️ Calcula el CapEx' });

      // ================================================================ generador de ejercicios
      const rnd = (a, b, step = 10) => a + step * Math.floor(Math.random() * ((b - a) / step + 1));
      const nz = (v) => (v === 0 ? 20 : v);
      let G = null, picks = {};
      const genEx = () => {
        for (let i = 0; i < 500; i++) {
          const y0 = { caja: rnd(40, 200), cxc: rnd(80, 300), inv: rnd(100, 400), afn: rnd(300, 900), prov: rnd(60, 300), dcp: rnd(0, 150), dlp: rnd(100, 400), cs: rnd(100, 300) };
          y0.ur = y0.caja + y0.cxc + y0.inv + y0.afn - (y0.prov + y0.dcp + y0.dlp + y0.cs);
          if (y0.ur < 50) continue;
          const y1 = { cxc: y0.cxc + nz(rnd(-80, 100)), inv: y0.inv + nz(rnd(-80, 100)), afn: y0.afn + nz(rnd(-60, 120)), prov: y0.prov + nz(rnd(-60, 80)),
            dcp: y0.dcp + rnd(-60, 60), dlp: y0.dlp + nz(rnd(-80, 100)), cs: y0.cs + (Math.random() < 0.7 ? 0 : rnd(20, 100)), ur: y0.ur + nz(rnd(-30, 120)) };
          y1.caja = y1.prov + y1.dcp + y1.dlp + y1.cs + y1.ur - (y1.cxc + y1.inv + y1.afn);
          if (y1.caja < 20 || y1.caja === y0.caja || Object.values(y1).some((v) => v < 0)) continue;
          if (Math.abs(y1.caja - y0.caja) > 250) continue;
          return { y0, y1 };
        }
        return { y0: { ...PRESETS.base.y0 }, y1: { ...PRESETS.base.y1 } };
      };
      const gTbl = root.querySelector('#fuGTbl');
      const newEx = () => {
        G = genEx(); picks = {};
        gTbl.innerHTML = `<thead><tr><th>Cuenta</th><th>2024</th><th>2025</th><th>Tu respuesta</th><th style="text-align:left">Revisión</th></tr></thead><tbody>
          ${ACC.map((a, i) => `${i === 0 ? '<tr class="grp"><td colspan="5">Activo</td></tr>' : i === 4 ? '<tr class="grp"><td colspan="5">Pasivo y patrimonio</td></tr>' : ''}<tr><td>${a.n}</td><td>${n0(G.y0[a.k])}</td><td>${n0(G.y1[a.k])}</td>
          <td class="pk"><span class="pick" role="group" aria-label="${a.n}" data-k="${a.k}"><button type="button" data-v="f">⊕ Fuente</button><button type="button" data-v="u">⊖ Uso</button><button type="button" data-v="z">= Igual</button></span></td>
          <td class="fb" data-fb="${a.k}"></td></tr>`).join('')}
          <tr class="tot"><td>Total</td><td>${n0(tot(G.y0).a)} = ${n0(tot(G.y0).pyc)}</td><td>${n0(tot(G.y1).a)} = ${n0(tot(G.y1).pyc)}</td><td colspan="2" class="fb">activo = pasivo + patrimonio ✓</td></tr></tbody>`;
        gTbl.querySelectorAll('.pick').forEach((g) => g.querySelectorAll('button').forEach((b) => b.addEventListener('click', () => {
          g.querySelectorAll('button').forEach((x) => { x.classList.toggle('on', x === b); x.setAttribute('aria-pressed', x === b); });
          picks[g.dataset.k] = b.dataset.v;
        })));
        root.querySelector('#fuKtAns').value = ''; root.querySelector('#fuKtFb').textContent = ''; root.querySelector('#fuKtFb').className = 'fb';
        root.querySelector('#fuScore').textContent = ''; root.querySelector('#fuSol').innerHTML = '';
      };
      const check = () => {
        let good = 0;
        const rows = ACC.map((a) => {
          const v = chg(a, G.y0, G.y1), right = v > 0 ? 'f' : v < 0 ? 'u' : 'z', p = picks[a.k], fb = gTbl.querySelector(`[data-fb="${a.k}"]`);
          const calc = a.s === 'a' ? `${n0(G.y0[a.k])} − ${n0(G.y1[a.k])}` : `${n0(G.y1[a.k])} − ${n0(G.y0[a.k])}`;
          if (p === right) { good++; fb.className = 'fb ok'; fb.innerHTML = `✓ ${calc} = ${sg(v)}`; }
          else { fb.className = 'fb ko'; fb.innerHTML = `${p ? '✗' : '— sin responder ·'} ${calc} = ${sg(v)} → ${right === 'f' ? 'fuente' : right === 'u' ? 'uso' : 'sin cambio'}${a.k === 'caja' && v < 0 ? ' (caja ↑ = uso)' : ''}${a.s !== 'a' && v < 0 ? ' (bajó = pagaste)' : ''}`; }
          return [a.n, G.y0[a.k], G.y1[a.k], calc, sg(v), tag(v)];
        });
        const t0 = tot(G.y0), t1 = tot(G.y1), dK = t0.ktd - t1.ktd, dKc = t0.kt - t1.kt;
        const raw = root.querySelector('#fuKtAns').value.trim(), ans = parseFloat(raw), fbK = root.querySelector('#fuKtFb');
        let ktOk = false;
        if (raw === '' || !isFinite(ans)) { fbK.className = 'fb ko'; fbK.innerHTML = `— sin responder. Era ${sg(dK)}.`; }
        else if (Math.abs(ans - dK) < 0.5) { ktOk = true; fbK.className = 'fb ok'; fbK.innerHTML = `✓ ${n0(t0.ktd)} − ${n0(t1.ktd)} = ${sg(dK)} → ${dK > 0 ? 'fuente' : dK < 0 ? 'uso (invirtió en KT)' : 'sin cambio'}`; }
        else if (Math.abs(ans + dK) < 0.5) { fbK.className = 'fb ko'; fbK.innerHTML = `✗ Casi: el número está bien pero el <b>signo</b> no. Es KT anterior − KT actual = ${sg(dK)}.`; }
        else { fbK.className = 'fb ko'; fbK.innerHTML = `✗ Era ${n0(t0.ktd)} − ${n0(t1.ktd)} = ${sg(dK)}. ¿Usaste el nivel en vez del cambio, o metiste caja/deuda?`; }
        const total = good + (ktOk ? 1 : 0);
        root.querySelector('#fuScore').innerHTML = `${total} / ${ACC.length + 1} ${total === ACC.length + 1 ? '🎉 ¡Perfecto!' : total >= 7 ? '👍 Muy bien' : '💪 Revisa la solución'}`;
        const sum = ACC.reduce((s, a) => s + chg(a, G.y0, G.y1), 0);
        root.querySelector('#fuSol').innerHTML = E.reveal('📋 Ver solución completa', E.table(rows, { head: ['Cuenta', '2024', '2025', 'Resta', 'Cambio', '¿Qué es?'], fmt: [null, n0, n0] })
          + `<p><b>Verificación:</b> suma de todos los cambios = ${sg(sum)} ${Math.abs(sum) < 0.5 ? '✓' : '✗'}</p>`
          + `<p><b>ΔKT operativo</b> (CxC + Inv − Prov): ${n0(t0.ktd)} − ${n0(t1.ktd)} = <b>${sg(dK)}</b> → ${dK > 0 ? 'fuente (liberó KT)' : dK < 0 ? 'uso (invirtió en KT)' : 'sin cambio'}.<br>`
          + `<b>ΔKT contable</b> (con caja y deuda CP): ${n0(t0.kt)} − ${n0(t1.kt)} = ${sg(dKc)}. La diferencia viene de la caja y la deuda bancaria CP.</p>`, true);
      };
      root.querySelector('#fuNew').addEventListener('click', newEx);
      root.querySelector('#fuCheck').addEventListener('click', check);
      newEx();

      // ================================================================ quiz final
      E.quiz(root.querySelector('#fuQuiz'), [
        { q: 'La empresa cobró a sus clientes: las cuentas por cobrar bajaron de 500 a 300. ¿Fuente o uso?', o: ['Uso de 200', 'Fuente de 200', 'No afecta la caja'], a: 1,
          w: 'Activo: anterior − actual = 500 − 300 = +200 → <b>fuente</b>. Te pagaron lo que te debían.' },
        { q: 'La caja pasó de 100 a 400. ¿Qué es?', o: ['Fuente de 300: entró dinero', 'Uso de 300', 'Ni fuente ni uso'], a: 1,
          w: 'La caja es activo: 100 − 400 = −300 → <b>uso</b>. El dueño deja dinero estacionado en la empresa (aumenta su inversión).' },
        { q: 'Proveedores bajaron de 32,000 a 28,000. ¿Qué pasó?', o: ['Les quedé debiendo más: fuente', 'Les pagué: uso de 4,000', 'Me financiaron 4,000'], a: 1,
          w: 'Pasivo: actual − anterior = 28,000 − 32,000 = −4,000 → <b>uso</b>. "La palabra es pagar."' },
        { q: 'El KT pasó de 200 a 350. ¿Qué va al flujo de efectivo?', o: ['+350', '−150 (uso: invirtió en KT)', '+150 (fuente)'], a: 1,
          w: 'Al flujo va el <b>cambio</b>, no el nivel: 200 − 350 = −150. KT aumentó → <b>uso</b> (inversión en capital de trabajo).' },
        { q: 'Utilidades retenidas pasaron de 100 a 200 y la utilidad neta del año fue 150. ¿Cuánto se pagó de dividendos?', o: ['0', '50', '100', '150'], a: 1,
          w: 'Dividendo = UN − ΔUR = 150 − 100 = <b>50</b>. Lo que no se quedó en la empresa, salió a los dueños.' },
      ]);
    },
  });
})();
