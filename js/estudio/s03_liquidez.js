// Sección 3 — Liquidez: razón corriente, prueba ácida, capital neto de trabajo (+ simulador de cubetas y caso ABC).
(function () {
  const F = E.fmt;

  // ---------------------------------------------------------------- ilustración de entrada: dos cubetas
  const intro = `<svg class="ill" viewBox="0 0 860 330" role="img" aria-label="Dos cubetas: activo corriente (lo que se vuelve dinero en menos de un año) contra pasivo corriente (lo que debo pagar en menos de un año)">
    <defs>
      <clipPath id="liqClipL"><path d="M80 70 L320 70 L300 270 L100 270 Z"/></clipPath>
      <clipPath id="liqClipR"><path d="M540 70 L780 70 L760 270 L560 270 Z"/></clipPath>
    </defs>
    <text x="200" y="30" text-anchor="middle" font-size="18" font-weight="700">Activo corriente</text>
    <text x="200" y="52" text-anchor="middle" font-size="13" class="tm">lo que se vuelve dinero en menos de 1 año</text>
    <g clip-path="url(#liqClipL)">
      <rect x="60" y="210" width="280" height="60" class="f1"/><text x="200" y="246" text-anchor="middle" font-size="15" class="tw" font-weight="700">💵 Caja</text>
      <rect x="60" y="150" width="280" height="60" class="f2"/><text x="200" y="186" text-anchor="middle" font-size="15" class="tw" font-weight="700">🧾 Clientes (CxC)</text>
      <rect x="60" y="95" width="280" height="55" class="f3"/><text x="200" y="128" text-anchor="middle" font-size="15" class="tw" font-weight="700">📦 Inventario</text>
    </g>
    <path d="M80 70 L320 70 L300 270 L100 270 Z" class="ln"/>
    <text x="340" y="126" font-size="12" class="tm">← el menos líquido</text>

    <text x="660" y="30" text-anchor="middle" font-size="18" font-weight="700">Pasivo corriente</text>
    <text x="660" y="52" text-anchor="middle" font-size="13" class="tm">lo que debo pagar en menos de 1 año</text>
    <g clip-path="url(#liqClipR)">
      <rect x="520" y="225" width="280" height="45" class="f5"/><text x="660" y="253" text-anchor="middle" font-size="15" class="tw" font-weight="700">🚚 Proveedores</text>
      <rect x="520" y="200" width="280" height="25" class="f6"/><text x="660" y="218" text-anchor="middle" font-size="13" class="tw" font-weight="700">🏦 Deuda CP</text>
    </g>
    <path d="M540 70 L780 70 L760 270 L560 270 Z" class="ln"/>

    <circle cx="430" cy="170" r="44" class="w5"/>
    <text x="430" y="166" text-anchor="middle" font-size="26" font-weight="800">≥ ?</text>
    <text x="430" y="190" text-anchor="middle" font-size="13" class="t2">¿alcanza?</text>
    <rect x="150" y="290" width="560" height="34" rx="17" class="f5"/>
    <text x="430" y="312" text-anchor="middle" font-size="15" class="tw" font-weight="700">Razón corriente = cubeta izquierda ÷ cubeta derecha</text>
  </svg>`;

  // ---------------------------------------------------------------- ilustración CNT: ¿de quién es el capital con el que se trabaja?
  const cntFig = `<svg class="ill" viewBox="0 0 640 330" role="img" aria-label="Balance en bloques: la parte del activo corriente que no cubre el pasivo corriente es el capital neto de trabajo, financiado por deuda de largo plazo o por los dueños">
    <text x="160" y="24" text-anchor="middle" font-size="15" font-weight="700">Activo (inversión)</text>
    <text x="440" y="24" text-anchor="middle" font-size="15" font-weight="700">Pasivo + Capital (¿quién pone?)</text>
    <rect x="60" y="40" width="200" height="150" rx="8" class="f3"/>
    <text x="160" y="80" text-anchor="middle" font-size="15" class="tw" font-weight="700">Activo corriente</text>
    <text x="160" y="100" text-anchor="middle" font-size="13" class="tw">3,000</text>
    <rect x="60" y="194" width="200" height="120" rx="8" class="w3"/>
    <text x="160" y="258" text-anchor="middle" font-size="14">Activo fijo</text>
    <rect x="340" y="40" width="200" height="50" rx="8" class="f5"/>
    <text x="440" y="62" text-anchor="middle" font-size="14" class="tw" font-weight="700">Pasivo corriente</text>
    <text x="440" y="80" text-anchor="middle" font-size="13" class="tw">1,000 (proveedores, bancos CP)</text>
    <rect x="340" y="94" width="200" height="110" rx="8" class="f6"/>
    <text x="440" y="146" text-anchor="middle" font-size="14" class="tw" font-weight="700">Deuda de largo plazo</text>
    <rect x="340" y="208" width="200" height="106" rx="8" class="f1"/>
    <text x="440" y="262" text-anchor="middle" font-size="14" class="tw" font-weight="700">Capital (dueños)</text>
    <line x1="40" y1="92" x2="560" y2="92" class="ln dash"/>
    <path d="M30 94 L22 94 L22 188 L30 188" class="ln s4"/>
    <text x="16" y="146" text-anchor="middle" font-size="13" font-weight="700" transform="rotate(-90 16 146)">CNT = 2,000</text>
    <text x="590" y="150" font-size="12" class="t2">↖ esta parte</text>
    <text x="590" y="166" font-size="12" class="t2">del AC la</text>
    <text x="590" y="182" font-size="12" class="t2">pagan fuentes</text>
    <text x="590" y="198" font-size="12" class="t2">de largo plazo</text>
  </svg>`;

  // ---------------------------------------------------------------- balanza dinámica con dos cubetas
  function svgBal(a) {
    const AC = a.caja + a.cxc + a.otros + a.inv, PC = a.prov + a.dcp, max = Math.max(AC, PC, 1);
    const H = 150, W = 180, L = 250, cx = 450, yb = 98;
    const t = (AC - PC) / ((AC + PC) || 1), ang = t * 0.24;
    const lx = cx - L * Math.cos(ang), ly = yb + L * Math.sin(ang), rx = cx + L * Math.cos(ang), ry = yb - L * Math.sin(ang);
    const bucket = (x, y, layers, extra) => {
      const bottom = y + H + 6; let cur = bottom; let g = '';
      g += `<line x1="${x}" y1="${y - 34}" x2="${x - W / 2 + 12}" y2="${y}" class="lnm"/><line x1="${x}" y1="${y - 34}" x2="${x + W / 2 - 12}" y2="${y}" class="lnm"/>`;
      g += `<rect x="${x - W / 2}" y="${y}" width="${W}" height="${H + 8}" rx="10" class="bd"/>`;
      layers.forEach(([v, cls, lab]) => {
        const h = (v / max) * H; if (h <= 0) return; cur -= h;
        g += `<rect x="${x - W / 2 + 5}" y="${cur.toFixed(1)}" width="${W - 10}" height="${h.toFixed(1)}" rx="4" class="${cls}"/>`;
        if (h >= 19) g += `<text x="${x}" y="${(cur + h / 2 + 5).toFixed(1)}" text-anchor="middle" font-size="14" class="tw" font-weight="600">${lab} ${F.n(v)}</text>`;
      });
      return g + (extra ? extra(bottom) : '');
    };
    const yL = ly + 34, yR = ry + 34;
    const pcLine = (bottom) => {
      const y = bottom - (PC / max) * H; if (PC <= 0 || y < yL) return '';
      return `<line x1="${lx - W / 2 - 6}" y1="${y.toFixed(1)}" x2="${lx + W / 2 + 6}" y2="${y.toFixed(1)}" class="ln dash"/><text x="${lx + W / 2 + 10}" y="${(y + 4).toFixed(1)}" font-size="13" class="t2">← lo que debes</text>`;
    };
    const rc = PC > 0 ? AC / PC : null;
    return `<svg class="ill" viewBox="0 0 900 400" role="img" aria-label="Balanza: activo corriente contra pasivo corriente">
      <text x="${cx}" y="34" text-anchor="middle" font-size="26" font-weight="800">RC = ${rc === null ? '∞' : F.x(rc)}</text>
      <text x="${cx}" y="58" text-anchor="middle" font-size="15" class="tm">${rc === null ? 'no debes nada a corto plazo' : rc >= 1 ? 'pesa más lo que tienes' : 'pesa más lo que debes'}</text>
      <path d="M${cx} ${yb} L${cx - 34} 380 L${cx + 34} 380 Z" class="w8"/><rect x="${cx - 70}" y="378" width="140" height="10" rx="5" class="bg2"/>
      <line x1="${lx.toFixed(1)}" y1="${ly.toFixed(1)}" x2="${rx.toFixed(1)}" y2="${ry.toFixed(1)}" class="ln" stroke-width="6" stroke-linecap="round"/>
      <circle cx="${cx}" cy="${yb}" r="8" class="f8"/>
      ${bucket(lx, yL, [[a.caja, 'f1', 'Caja'], [a.cxc, 'f2', 'CxC'], [a.otros, 'f4', 'Otros'], [a.inv, 'f3', 'Inv.']], pcLine)}
      ${bucket(rx, yR, [[a.prov, 'f5', 'Prov.'], [a.dcp, 'f6', 'Deuda CP']])}
      <text x="${lx.toFixed(1)}" y="${(yL + H + 28).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="700">Activo corriente ${F.n(AC)}</text>
      <text x="${rx.toFixed(1)}" y="${(yR + H + 28).toFixed(1)}" text-anchor="middle" font-size="16" font-weight="700">Pasivo corriente ${F.n(PC)}</text>
    </svg>`;
  }

  // ---------------------------------------------------------------- frase de interpretación automática
  function interp(a, sec) {
    const AC = a.caja + a.cxc + a.otros + a.inv, PC = a.prov + a.dcp, cnt = AC - PC;
    if (PC <= 0) return 'No debes nada a corto plazo: las razones se vuelven infinitas. Pon algo en proveedores o deuda CP.';
    const rc = AC / PC, pa = (AC - a.inv) / PC;
    const c = (v) => F.$(v, 2);
    let s = `<b>Razón corriente ${F.x(rc)}:</b> por cada $1 que debes a corto plazo tienes ${c(rc)} de activo corriente. `;
    s += rc >= 1 ? '' : '<b>No alcanza</b>: dependes de que te refinancien o de la paciencia de los proveedores. ';
    s += `<b>Prueba ácida ${F.x(pa)}:</b> sin contar inventario, tienes ${c(pa)} de dinero "dinero" por cada $1. `;
    s += cnt >= 0
      ? `<b>CNT ${F.$(cnt)}:</b> esa parte de la operación la financian los dueños o la deuda de largo plazo. `
      : `<b>CNT ${F.$(cnt)} (negativo):</b> proveedores o bancos de corto plazo financian parte de tu operación. Tipo Walmart: <b>no necesariamente malo</b>, hay que ver el porqué. `;
    // comparación con el sector
    const rcUp = rc > sec.rc, paUp = pa > sec.pa;
    let v;
    if (rcUp && paUp) v = 'Estás <b>arriba del sector en las dos</b>: más líquido que tus pares (al banco le gusta; el dueño se pregunta si sobra dinero ocioso).';
    else if (!rcUp && !paUp) v = 'Estás <b>abajo del sector en las dos</b>: menos líquido que tus pares. Investiga el porqué antes de concluir.';
    else if (!rcUp && paUp) v = 'Razón corriente <b>abajo</b> del sector pero prueba ácida <b>arriba</b> → conclusión irrefutable: <b>tienes relativamente menos inventario que el sector</b> (como ABC).';
    else v = 'Razón corriente <b>arriba</b> del sector pero prueba ácida <b>abajo</b> → <b>tienes relativamente más inventario que el sector</b>. ¿Es inventario fácil de vender?';
    return s + '<br>' + v;
  }

  // ---------------------------------------------------------------- presets
  const PRE = {
    abc: { a: { caja: 100, cxc: 900, inv: 2000, otros: 0, prov: 500, dcp: 500, dud: 0 }, s: { rc: 4, pa: 0.8 }, txt: 'Caso ABC del profe (miles de $): AC 3,000, inventario 2,000, PC 1,000. Sector: RC 4, PA 0.8.' },
    wal: { a: { caja: 400, cxc: 100, inv: 900, otros: 100, prov: 1400, dcp: 500, dud: 0 }, s: { rc: 0.9, pa: 0.35 }, txt: 'Supermercado tipo Walmart (ilustrativo): cobra de contado, paga a ~90 días → poca CxC, muchos proveedores y CNT negativo.' },
    cmx: { a: { caja: 1050, cxc: 1600, inv: 1500, otros: 850, prov: 3550, dcp: 2550, dud: 0 }, s: { rc: 1.11, pa: 0.79 }, txt: 'Cemex 2024 (≈, millones de USD): AC ≈5,016, PC ≈6,093 → RC 0.82, PA ≈0.58, CNT ≈ −1,077. Sector = promedio de las 3 cementeras.' },
    srv: { a: { caja: 300, cxc: 1000, inv: 0, otros: 100, prov: 200, dcp: 500, dud: 0.2 }, s: { rc: 1.5, pa: 1.3 }, txt: 'Empresa de servicios (ilustrativo): sin inventario, así que RC = PA. Para ser realistas se quitan los deudores de mala calidad (aquí 20% de la CxC).' },
  };

  E.section({
    id: 'liquidez', n: 3, group: 'razones', icon: '💧', short: 'Liquidez', exam: 'in',
    title: 'Razones de liquidez: ¿alcanza para pagar lo de corto plazo?',
    lead: '¿Puedo pagar lo que debo en el próximo año? Tres números lo responden: razón corriente, prueba ácida y capital neto de trabajo. Y sólo sirven comparando.',
    render(root) {
      root.innerHTML = `
      <div class="prose">
        <p>La pregunta de la liquidez es muy sencilla: <b>lo que tengo y se vuelve dinero en menos de un año</b> (activo corriente), ¿alcanza para <b>lo que tengo que pagar en menos de un año</b> (pasivo corriente)?</p>
        <p>Importa porque <b>lo que quiebra a una empresa generalmente es la falta de caja</b>, no la falta de utilidad.</p>
      </div>
      ${E.fig(intro, 'Las tres razones de liquidez comparan estas dos cubetas. La prueba ácida le quita a la izquierda la capa de arriba: el inventario.', true)}
      ${E.kid('Imagina que este mes tienes que pagar $100 de tu celular y tu renta. En la alcancía tienes $50, tu primo te debe $40 y tienes una bici que podrías vender en $60. ¿Alcanza? Con la bici sí ($150 contra $100). Sin la bici, no ($90). Eso es justo la diferencia entre la <b>razón corriente</b> (con la bici) y la <b>prueba ácida</b> (sin la bici).')}
      ${E.tip('<q>Solo son útiles en términos comparativos.</q> Una razón sola no dice nada: compárala con el sector, con competidores directos o con el año anterior.', 'Clase 18-sep')}

      ${E.concept({ id: 'rc', title: '1 · Razón corriente', badge: 'in', html: `
        <div class="cols"><div>
          <p><b>Pregunta que responde:</b> ¿cuántos pesos de inversión de corto plazo tengo por cada peso que debo a corto plazo?</p>
          ${E.formula('Razón corriente (circulante)', 'RC', E.frac('Activo corriente', 'Pasivo corriente'))}
          <p><b>Cómo se lee:</b> RC = 3 → <i>"tengo tres pesos de inversión de corto plazo por cada peso de deuda de corto plazo"</i>. Para un banco o un proveedor, <b>más alto es mejor</b>. Menor a 1 = lo que tienes no alcanza para lo que debes.</p>
          <p><b>Ojo:</b> que sea menor que 1 no es automáticamente quiebra. Cemex 2024 tenía 0.82 ("82 centavos por cada dólar que debo") y es sana por su posición dominante: sus proveedores la financian. Las aerolíneas también viven con RC &lt; 1 porque cobran el boleto por adelantado.</p>
        </div><div>
          <h4 style="margin:0 0 6px">Ejemplo resuelto: ABC</h4>
          ${E.table([
            ['Activo corriente', '3,000,000'], ['Pasivo corriente', '1,000,000'],
            ['Razón corriente', '3,000,000 ÷ 1,000,000 = <b>3.0</b>', { cls: 'tot' }], ['Sector', '4.0'],
          ], { head: ['Dato', 'Valor'] })}
          <p class="small">Lógica escrita como la pide el profe: <i>"ABC tiene $3 de activo corriente por cada $1 de pasivo corriente; está por <b>debajo</b> del sector (4), es decir, es menos líquida que sus pares."</i></p>
          ${E.warn('Comparar contra otro sector, o contra el <b>consolidado</b> de un conglomerado. "Farma con farmas"; si no hay competidor idéntico, compara por <b>unidad de negocio</b>.')}
        </div></div>` })}

      ${E.concept({ id: 'pa', title: '2 · Prueba ácida', badge: 'in', html: `
        <div class="cols"><div>
          <p><b>Pregunta que responde:</b> si no pudiera vender mi inventario, ¿con lo que <b>sí es dinero, dinero</b> (caja + clientes) pago lo de corto plazo?</p>
          ${E.formula('Prueba ácida (quick ratio)', 'PA', E.frac('Activo corriente − Inventarios', 'Pasivo corriente'))}
          <p><b>¿Por qué se quita el inventario?</b> Porque su valor de venta es incierto: se echa a perder, pasa de moda, se vuelve obsoleto.</p>
          <ul>
            <li><b>Depende de la naturaleza del inventario.</b> Gasolina, oro, cemento, cal o materiales de construcción se venden rápido → una PA baja preocupa poco. Tecnología, tomates, lácteos o refacciones de un avión raro → sí preocupa.</li>
            <li><b>Empresas de servicios</b> (sin inventario): RC = PA. Ahí haz tu propia prueba ácida <b>ajustando los deudores</b>: quita los de mala calidad (p. ej. de 1 M de clientes, 200 mil llevan 180 días sin pagar → fuera). Se busca <b>el mayor grado de realismo</b>: ¿qué es realmente dinero?</li>
          </ul>
        </div><div>
          ${E.key('La prueba ácida <b>siempre es menor (o igual, si no hay inventario) que la razón corriente</b>. Si te sale mayor, te equivocaste en el cálculo. Úsalo como chequeo en el examen.', 'Chequeo automático')}
          <h4 style="margin:12px 0 6px">Ejemplo resuelto: ABC</h4>
          ${E.table([
            ['Activo corriente', '3,000,000'], ['− Inventarios', '2,000,000'], ['= Lo que sí es dinero', '1,000,000'], ['÷ Pasivo corriente', '1,000,000'],
            ['Prueba ácida', '<b>1.0</b>', { cls: 'tot' }], ['Sector', '0.8'],
          ], { head: ['Paso', 'Valor'] })}
          <p class="small">"ABC tiene $1 de dinero líquido por cada $1 que debe a corto plazo; está <b>arriba</b> del sector (0.8)."</p>
        </div></div>` })}

      ${E.concept({ id: 'cnt', title: '3 · Capital neto de trabajo', badge: 'in', html: `
        <div class="cols"><div>
          <p><b>Pregunta que responde:</b> <b>¿de quién es el capital con el que se está trabajando?</b> No es una razón (división), es una <b>resta</b>: sale en pesos.</p>
          ${E.formula('Capital neto de trabajo', 'CNT', 'Activo corriente − Pasivo corriente', 'ABC: 3,000,000 − 1,000,000 = 2,000,000')}
          <p><b>Capital de trabajo es el dinero necesario para realizar el ciclo operativo</b> (comprar, fabricar, vender y cobrar). Es "la sangre del negocio": el coche de Uber no opera solo, necesita chofer, gasolina, seguro… Ver ${E.link('eficiencia/ciclos', 'ciclo operativo y de efectivo')}.</p>
          <ul>
            <li><b>Positivo:</b> lo que no financian los proveedores y bancos de corto plazo lo ponen <b>los dueños</b> (o deuda de largo plazo). Así cuadra A = P + C.</li>
            <li><b>Negativo:</b> operas con dinero del proveedor o de un banco de corto plazo. En <b>Walmart</b> (o Walmex) es normal: cobra de contado y paga a ~90 días; los proveedores financian todo. <b>No necesariamente malo.</b> En una cementera como Cemex depende de "la paciencia de los proveedores", así que hay que verlo con lupa.</li>
          </ul>
        </div><div>
          ${E.fig(cntFig, 'La parte del activo corriente que no cubre el pasivo corriente se financia con dinero de largo plazo: deuda LP o los dueños.')}
        </div></div>
        <h4>¿Conviene tenerlo alto? <span class="muted">"Depende de la perspectiva"</span></h4>
        ${E.table([
          ['🏦 Banco / acreedor', 'Sí le gusta', 'Los dueños tienen dinero metido y la empresa aguanta pagar intereses.'],
          ['👔 Gerencia (empleado)', 'Sí le gusta', 'Más caja de la necesaria = puede enfrentar problemas sin pedir permiso.'],
          ['💼 Dueño (accionista)', 'No le gusta', 'Ese dinero ocioso le cuesta: podría ser un dividendo o una inversión que rinda.'],
        ], { head: ['¿Quién?', '¿CNT alto?', '¿Por qué?'] })}
        ${E.key('Lo que le conviene al dueño (principal) no siempre le conviene al empleado (agente): eso es el <b>conflicto de agencia</b>. El <b>gobierno corporativo</b> es el conjunto de reglas para alinearlos ("cómo hago que el empleado no me robe", en chilango): compensación variable, consejo, compliance.', 'Conflicto de agencia')}
        ${E.note('Para comparar empresas de distinto tamaño usa <b>CNT ÷ Activo total</b>: qué % de la inversión se necesita para operar. En las cementeras 2024 rondaba ~5%. Si dos empresas son sanas y rentables, <b>la de menor % es más eficiente</b> (opera con lo mínimo). Regla práctica para estimarlo en un proyecto: <i>¿cuánto me cuesta al mes tener esto abierto si no vendo nada?</i>', 'Truco de tamaño')}
        ${E.warn('Pensar que más capital de trabajo siempre es mejor, o que negativo siempre es malo. Truco del profe: si el CNT es positivo pero <b>sin la caja</b> queda negativo, la empresa acumula efectivo y aun así vive de sus proveedores: lo está haciendo muy bien.')}
      ` })}

      <h2 id="simulador">🎛️ Simulador: llena las cubetas</h2>
      <p class="prose">Mueve caja, clientes, inventario y deudas. Mira cómo se inclina la balanza, cómo cambian las tres medidas y cómo quedas contra el sector. Cifras en miles (o millones: como son divisiones, da igual).</p>
      <div class="btnrow" id="liqPre">
        <button class="btn" data-p="abc" type="button">Caso ABC</button>
        <button class="btn" data-p="wal" type="button">Supermercado tipo Walmart</button>
        <button class="btn" data-p="cmx" type="button">Cemex 2024 (≈)</button>
        <button class="btn" data-p="srv" type="button">Servicios (sin inventario)</button>
      </div>
      <p class="small muted" id="liqPreTxt"></p>
      <section class="concept" id="sim"><div class="cols">
        <div><div id="kA"></div><div id="kS" style="margin-top:12px"></div></div>
        <div>
          <div id="tA"></div>
          <div id="svgBal" style="margin-top:10px"></div>
          <div class="co key" id="liqTxt" style="margin-top:6px"></div>
          <div class="chart h220" id="cA"></div>
        </div>
      </div></section>

      <h2 id="abc">🕵️ Acertijo: el caso ABC</h2>
      <div class="prose">
        ${E.table([
          ['Razón corriente', '3.0', '4.0', 'ABC abajo'], ['Prueba ácida', '1.0', '0.8', 'ABC arriba'],
        ], { head: ['Razón', 'ABC', 'Sector', '¿Cómo queda?'] })}
        <p><b>¿Qué puedes concluir con certeza?</b> Piénsalo antes de abrir.</p>
        ${E.reveal('Ver la respuesta', `
          <p>La única diferencia entre las dos razones es el <b>inventario</b>. Con inventario, ABC queda <b>peor</b> que el sector; sin inventario, queda <b>mejor</b>. Entonces la conclusión irrefutable es:</p>
          ${E.key('<b>ABC tiene, proporcionalmente, menos inventario que el sector.</b>', 'Conclusión')}
          <p>¿Eso es bueno o malo? <b>Con estos datos no se sabe</b>: puede ser eficiencia (rota rápido su inventario) o debilidad (vende menos, es menos competitiva). Lo correcto es decirlo y <b>proponer qué revisar</b>: rotación de inventarios y días de inventario (${E.link('eficiencia/rdi', 'siguiente sección')}).</p>
          <p class="small muted">Spoiler: en la clase siguiente se vio que ABC tarda ≈182 días en vender su inventario contra 121 del sector. Por eso una razón sola nunca cuenta toda la historia: hay que cruzarla con las demás.</p>
        `)}
        ${E.tip('<q>Utilizan las fórmulas que les muestro.</q> En el examen, las fórmulas exactamente como las vimos en clase.', 'Clase 18-sep')}
      </div>

      <h2>Lo que dijo el profe y errores típicos</h2>
      <div class="g2">
        <div>
          ${E.tip('<q>La prueba ácida siempre tiene que ser menor que la razón corriente.</q>', 'Clase 23-sep')}
          ${E.tip('Ve la <b>naturaleza del inventario</b>: cal, clinker o gasolina se liquidan rápido; tecnología o tomates no.', 'Clases 18 y 23-sep')}
          ${E.tip('<q>Nada de esto es malo. Uno tiene que entrar a ver con detalle.</q> Sobre el capital de trabajo negativo (Dell cobra antes de entregar).', 'Clase 23-sep')}
        </div>
        <div>
          ${E.warn('Dar el número sin interpretarlo. En el examen escribe siempre: <b>fórmula con datos → resultado → qué significa contra el sector</b>.')}
          ${E.warn('Confundir capital neto de trabajo (resta, en pesos) con razón corriente (división, en veces).')}
          ${E.warn('Decir "más liquidez siempre es mejor". Para el banco sí; para el dueño, el exceso de caja ociosa cuesta.')}
        </div>
      </div>

      <h2>¿Qué pasa si…? (quiz rápido)</h2>
      <div id="qz"></div>
      `;

      // ---------------- simulador
      let stA = null, stS = null, chart = null;
      const draw = () => {
        if (!stA || !stS) return;
        const a = stA, AC = a.caja + a.cxc + a.otros + a.inv, PC = a.prov + a.dcp;
        const rc = PC > 0 ? AC / PC : null, pa = PC > 0 ? (AC - a.inv) / PC : null, paj = PC > 0 ? (AC - a.inv - a.dud * a.cxc) / PC : null;
        const tiles = [
          { label: 'Razón corriente', v: rc, fmt: 'x', base: stS.rc, better: 'up', note: 'vs sector ' + F.x(stS.rc), hl: true },
          { label: 'Prueba ácida', v: pa, fmt: 'x', base: stS.pa, better: 'up', note: 'vs sector ' + F.x(stS.pa) },
          { label: 'Capital neto de trabajo', v: AC - PC, fmt: '$', note: AC - PC >= 0 ? 'lo financian dueños / deuda LP' : 'te financian proveedores / bancos CP' },
        ];
        if (a.dud > 0) tiles.splice(2, 0, { label: 'Prueba ácida ajustada', v: paj, fmt: 'x', note: 'sin el ' + F.pct(a.dud, 0) + ' de CxC dudosa' });
        E.tiles(root.querySelector('#tA'), tiles);
        root.querySelector('#svgBal').innerHTML = svgBal(a);
        root.querySelector('#liqTxt').innerHTML = '<b>Interpretación automática</b>' + interp(a, stS) ;
        chart && chart.refresh();
      };
      const kA = E.knobs(root.querySelector('#kA'), [
        { k: 'caja', label: '💵 Caja', min: 0, max: 3000, step: 50, v: 100, fmt: 'n' },
        { k: 'cxc', label: '🧾 Cuentas por cobrar (clientes)', min: 0, max: 3000, step: 50, v: 900, fmt: 'n' },
        { k: 'inv', label: '📦 Inventario', min: 0, max: 4000, step: 50, v: 2000, fmt: 'n', hint: 'Es lo que la prueba ácida quita' },
        { k: 'otros', label: 'Otros activos corrientes', min: 0, max: 2000, step: 50, v: 0, fmt: 'n' },
        { k: 'prov', label: '🚚 Proveedores', min: 0, max: 5000, step: 50, v: 500, fmt: 'n' },
        { k: 'dcp', label: '🏦 Deuda CP y otros pasivos CP', min: 0, max: 5000, step: 50, v: 500, fmt: 'n' },
        { k: 'dud', label: 'CxC de dudoso cobro (ajuste servicios)', min: 0, max: 0.6, step: 0.05, v: 0, fmt: 'pct', dec: 0, hint: 'Quítalas para la prueba ácida "realista"' },
      ], (st) => { stA = st; draw(); }, { title: '🎛️ Tu empresa' });
      const kS = E.knobs(root.querySelector('#kS'), [
        { k: 'rc', label: 'Razón corriente del sector', min: 0.2, max: 6, step: 0.05, v: 4, fmt: 'x' },
        { k: 'pa', label: 'Prueba ácida del sector', min: 0.1, max: 5, step: 0.05, v: 0.8, fmt: 'x' },
      ], (st) => { stS = st; draw(); }, { title: '🏭 El sector (benchmark)' });
      chart = E.chart(root.querySelector('#cA'), (T) => {
        const a = stA, AC = a.caja + a.cxc + a.otros + a.inv, PC = a.prov + a.dcp;
        const rc = PC > 0 ? AC / PC : 0, pa = PC > 0 ? (AC - a.inv) / PC : 0;
        return {
          ...E.baseOpt(T),
          tooltip: { ...E.baseOpt(T).tooltip, valueFormatter: (v) => F.x(v) },
          xAxis: E.axisCat(['Razón corriente', 'Prueba ácida'], T),
          yAxis: E.axisVal(T, (v) => v + 'x'),
          series: [
            { name: 'Tu empresa', type: 'bar', data: [rc, pa], barMaxWidth: 46, itemStyle: { color: T.c1, borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'top', color: T.ink2, formatter: (p) => F.x(p.value) } },
            { name: 'Sector', type: 'bar', data: [stS.rc, stS.pa], barMaxWidth: 46, itemStyle: { color: T.c2, borderRadius: [4, 4, 0, 0] }, label: { show: true, position: 'top', color: T.ink2, formatter: (p) => F.x(p.value) } },
          ],
        };
      });
      draw();
      root.querySelectorAll('#liqPre button').forEach((b) => b.addEventListener('click', () => {
        const p = PRE[b.dataset.p];
        root.querySelectorAll('#liqPre button').forEach((x) => x.classList.toggle('on', x === b));
        root.querySelector('#liqPreTxt').textContent = p.txt;
        kS.set(p.s); kA.set(p.a);
      }));

      // ---------------- quiz
      E.quiz(root.querySelector('#qz'), [
        { q: 'Tu razón corriente es 3 (AC 300, PC 100). Pagas $50 a un proveedor con caja. ¿Qué le pasa a la razón corriente?',
          o: ['Baja, porque tienes menos caja', 'No cambia, porque bajan los dos lados', 'Sube a 5'], a: 2,
          w: 'Bajan los dos lados lo mismo: (300 − 50) ÷ (100 − 50) = 250 ÷ 50 = <b>5</b>. Cuando la RC es <b>mayor que 1</b>, restar lo mismo arriba y abajo la <b>sube</b>. El CNT no cambia (250 − 50 = 200 = 300 − 100).' },
        { q: 'Ahora tu razón corriente es 0.8 (AC 80, PC 100) y pagas $20 a un proveedor con caja. ¿Qué pasa?',
          o: ['Sube', 'Baja a 0.75', 'No cambia'], a: 1,
          w: '(80 − 20) ÷ (100 − 20) = 60 ÷ 80 = <b>0.75</b>. Con RC <b>menor que 1</b> pasa lo contrario: baja. (Si la RC fuera exactamente 1, no cambiaría.)' },
        { q: 'RC = 3 (AC 300, PC 100, inventario 200). Compras $100 de inventario a crédito con el proveedor. ¿Qué pasa?',
          o: ['RC baja a 2 y la prueba ácida baja a 0.5; el CNT no cambia', 'RC sube y la prueba ácida no cambia', 'Todo se queda igual porque suben los dos lados'], a: 0,
          w: 'RC = 400 ÷ 200 = 2. PA = (400 − 300) ÷ 200 = 0.5 (el inventario no cuenta arriba, pero la deuda sí cuenta abajo). CNT = 400 − 200 = 200, igual que antes.' },
        { q: 'Tomas un crédito a 5 años por $200 y lo dejas en caja. ¿Qué pasa con la liquidez?',
          o: ['Mejoran RC, PA y CNT', 'Empeora la RC porque tienes más deuda', 'Sólo cambia el CNT'], a: 0,
          w: 'La caja (activo corriente) sube, pero la deuda es de <b>largo plazo</b>, no entra al pasivo corriente. Suben las tres medidas. Ojo: si el crédito fuera a 6 meses, sería pasivo corriente.' },
        { q: 'Tu RC está arriba del sector y tu prueba ácida está abajo del sector. ¿Qué concluyes con certeza?',
          o: ['Tienes relativamente más inventario que el sector', 'Tienes menos caja que el sector', 'Eres más eficiente que el sector'], a: 0,
          w: 'Es el caso ABC al revés: lo único que cambia entre las dos razones es el inventario. Con inventario quedas mejor y sin inventario peor, así que tu "ventaja" es inventario. Siguiente pregunta: ¿ese inventario se vende fácil?' },
        { q: '¿A quién NO le gusta un capital neto de trabajo muy alto?',
          o: ['Al banco', 'Al dueño', 'Al gerente'], a: 1,
          w: 'Al dueño le cuesta: ese dinero podría ser dividendo o una inversión que rinda. Al banco y al gerente sí les gusta. Ese choque de intereses es el <b>conflicto de agencia</b>.' },
      ]);
    },
  });
})();
