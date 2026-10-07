// Sección 1 — Lo que dijo el profe: formato, cómo califica, qué entra, TODOS sus tips, errores, filosofía y checklist.
(function () {
  // ---------------------------------------------------------------- ilustraciones
  // Presupuesto de tiempo: 70 minutos repartidos según el peso de cada pregunta
  const svgTiempo = `<svg class="ill" viewBox="0 0 900 150" role="img" aria-label="Reparto sugerido de los 70 minutos: 25 minutos pregunta 1, 25 minutos pregunta 2, 13 minutos pregunta 3 y 7 minutos para revisar">
    <text x="20" y="26" font-size="15" font-weight="700">Tus 70 minutos (reparte según lo que vale cada pregunta)</text>
    <rect x="20" y="44" width="300" height="52" rx="10" class="f1"/><text x="170" y="68" text-anchor="middle" class="tw" font-size="15" font-weight="700">Pregunta 1 · 40 pts</text><text x="170" y="87" text-anchor="middle" class="tw" font-size="13">≈ 25 min</text>
    <rect x="326" y="44" width="300" height="52" rx="10" class="f2"/><text x="476" y="68" text-anchor="middle" class="tw" font-size="15" font-weight="700">Pregunta 2 · 40 pts</text><text x="476" y="87" text-anchor="middle" class="tw" font-size="13">≈ 25 min</text>
    <rect x="632" y="44" width="160" height="52" rx="10" class="f3"/><text x="712" y="68" text-anchor="middle" class="tw" font-size="15" font-weight="700">P3 · 20 pts</text><text x="712" y="87" text-anchor="middle" class="tw" font-size="13">≈ 13 min</text>
    <rect x="798" y="44" width="82" height="52" rx="10" class="bg2"/><text x="839" y="68" text-anchor="middle" font-size="13" font-weight="700">Revisar</text><text x="839" y="87" text-anchor="middle" font-size="13" class="t2">7 min</text>
    <g font-size="12" class="tm"><text x="20" y="116">0</text><text x="320" y="116" text-anchor="middle">25</text><text x="626" y="116" text-anchor="middle">50</text><text x="792" y="116" text-anchor="middle">63</text><text x="880" y="116" text-anchor="end">70 min</text></g>
    <text x="20" y="140" font-size="13" class="t2">⏰ Pon una alarma mental: si en el minuto 25 sigues en la pregunta 1, escribe tu conclusión y pasa a la 2.</text>
  </svg>`;

  // 50 / 50 y los tres niveles del cálculo
  const svgCalif = `<svg class="ill" viewBox="0 0 900 230" role="img" aria-label="La calificación: 50 por ciento interpretación escrita y 50 por ciento cálculo en tres niveles: básico, intermedio que llega a 80 y avanzado que llega a 100">
    <rect x="20" y="20" width="420" height="190" rx="16" class="w5"/>
    <text x="230" y="58" text-anchor="middle" font-size="40" font-weight="800">50%</text>
    <text x="230" y="88" text-anchor="middle" font-size="17" font-weight="700">Interpretación escrita</text>
    <text x="230" y="116" text-anchor="middle" font-size="14" class="t2">"lo que escriban, interpreta"</text>
    <text x="230" y="148" text-anchor="middle" font-size="14" class="t2">¿Qué significa? ¿Mejor o peor que antes</text>
    <text x="230" y="168" text-anchor="middle" font-size="14" class="t2">y que el sector? ¿Por qué? ¿Qué harías?</text>
    <rect x="460" y="20" width="420" height="190" rx="16" class="w3"/>
    <text x="670" y="52" text-anchor="middle" font-size="17" font-weight="700">50% Cálculo, en 3 niveles</text>
    <rect x="490" y="150" width="110" height="44" rx="8" class="f3"/><text x="545" y="177" text-anchor="middle" class="tw" font-size="14" font-weight="700">Básico</text>
    <rect x="615" y="116" width="110" height="78" rx="8" class="f2"/><text x="670" y="150" text-anchor="middle" class="tw" font-size="14" font-weight="700">Intermedio</text><text x="670" y="170" text-anchor="middle" class="tw" font-size="13">≈ 80</text>
    <rect x="740" y="88" width="110" height="106" rx="8" class="f1"/><text x="795" y="134" text-anchor="middle" class="tw" font-size="14" font-weight="700">Avanzado</text><text x="795" y="154" text-anchor="middle" class="tw" font-size="13">100</text>
    <text x="545" y="140" text-anchor="middle" font-size="12" class="t2">pocos cálculos</text>
    <text x="670" y="106" text-anchor="middle" font-size="12" class="t2">más indicadores</text>
    <text x="795" y="80" text-anchor="middle" font-size="12" class="t2">usas TODA la info</text>
  </svg>`;

  // Anatomía de una respuesta de 100
  const pasos = [
    ['1', 'Dato', 'w3', ['AC 2025 = 330', 'PC 2025 = 300']],
    ['2', 'Fórmula', 'w3', ['RC = AC / PC', '(escrita, con', 'los datos)']],
    ['3', 'Resultado', 'w3', ['330 / 300', '= 1.10x']],
    ['4', 'Comparación', 'w2', ['2024: 1.50x', 'sector: 1.30x', '▼ bajó y quedó abajo']],
    ['5', 'Interpretación', 'w1', ['por cada $1 que', 'debo a corto plazo', 'tengo $1.10']],
    ['6', 'Causa y acción', 'w1', ['el inventario', 'infló el AC →', 'vender / cobrar']],
  ];
  const W = 132, G = 18, X0 = 9;
  const bx = (i) => X0 + i * (W + G);
  const svgAnat = `<svg class="ill" viewBox="0 0 900 330" role="img" aria-label="Anatomía de una respuesta de 100: dato, fórmula escrita, resultado, comparación, interpretación y causa o recomendación. Los tres primeros dan el nivel básico, con la comparación llegas a intermedio y con interpretación y causa llegas a avanzado">
    <defs><marker id="exAh" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    <path d="M${bx(0)} 40 L${bx(0)} 30 L${bx(3) + W} 30 L${bx(3) + W} 40" class="lnm"/>
    <text x="${(bx(0) + bx(3) + W) / 2}" y="22" text-anchor="middle" font-size="13" font-weight="700" class="t2">CÁLCULO (lo que se ve en tu hoja)</text>
    <path d="M${bx(4)} 40 L${bx(4)} 30 L${bx(5) + W} 30 L${bx(5) + W} 40" class="lnm"/>
    <text x="${(bx(4) + bx(5) + W) / 2}" y="22" text-anchor="middle" font-size="13" font-weight="700" class="t2">INTERPRETACIÓN (50%)</text>
    ${pasos.map(([n, t, w, lines], i) => `
      <rect x="${bx(i)}" y="48" width="${W}" height="128" rx="12" class="${w}"/>
      <circle cx="${bx(i) + 20}" cy="70" r="13" class="f5"/><text x="${bx(i) + 20}" y="75" text-anchor="middle" class="tw" font-size="13" font-weight="700">${n}</text>
      <text x="${bx(i) + 40}" y="75" font-size="14" font-weight="700">${t}</text>
      ${lines.map((l, j) => `<text x="${bx(i) + W / 2}" y="${112 + j * 19}" text-anchor="middle" font-size="13" class="t2">${l}</text>`).join('')}
      ${i < 5 ? `<path d="M${bx(i) + W + 2} 112 L${bx(i + 1) - 2} 112" class="ln s5" marker-end="url(#exAh)"/>` : ''}`).join('')}
    <rect x="${bx(0)}" y="196" width="${bx(2) + W - bx(0)}" height="30" rx="8" class="f3"/>
    <text x="${bx(0) + 12}" y="216" class="tw" font-size="13" font-weight="700">BÁSICO · 1 a 3: dato → fórmula → resultado</text>
    <rect x="${bx(0)}" y="234" width="${bx(3) + W - bx(0)}" height="30" rx="8" class="f2"/>
    <text x="${bx(0) + 12}" y="254" class="tw" font-size="13" font-weight="700">INTERMEDIO (≈80) · + comparas con año previo, sector o competidor</text>
    <rect x="${bx(0)}" y="272" width="${bx(5) + W - bx(0)}" height="30" rx="8" class="f1"/>
    <text x="${bx(0) + 12}" y="292" class="tw" font-size="13" font-weight="700">AVANZADO (100) · + conectas varios indicadores, explicas la causa y recomiendas</text>
    <text x="450" y="322" text-anchor="middle" font-size="12.5" class="tm">Aunque te equivoques en la división, los pasos 2, 4, 5 y 6 siguen dando puntos.</text>
  </svg>`;

  // ---------------------------------------------------------------- qué entra y qué no
  const entra = [
    ['✅ Entra', 'Indicadores financieros de todo tipo: liquidez, eficiencia/rotaciones, endeudamiento', '<q>indicadores financieros de todo tipo</q>', '5-oct', 'liquidez'],
    ['✅ Entra', 'Rentabilidad hasta el ROE (márgenes, ROA, ROE) y DuPont', '<q>es con el ROE, todo hasta el ROE</q>', '30-sep', 'rentabilidad'],
    ['✅ Entra', 'Principios de contabilidad: A = P + C, costo vs gasto, película vs foto', '<q>Lo más importante es análisis y principios de contabilidad</q>', '30-sep', 'cimientos'],
    ['★ Entra seguro', 'Fuentes y usos y el cambio en capital de trabajo', '<q>esta es una pregunta que no falla</q>', '5-oct', 'fuentes-usos'],
    ['✅ Entra', 'Flujo de efectivo contable: operación, inversión, financiamiento (tipo Soriana), Buffett, directo vs indirecto', '<q>sí tienen que saber manejar las tres líneas</q>', '30-sep', 'flujo'],
    ['🟡 Sólo la idea', 'Flujo de caja libre / ecuación fundamental (Walmex)', '<q>no entra, pero es muy importante. Va a haber una pequeña relación</q>', '5-oct', 'fcl'],
    ['🟡 Dudoso', 'Calcular el dividendo implícito (Δ patrimonio − utilidad neta)', '<q>No los voy a poner a que saquen el dividendo</q> — pero sí lo usó para armar el flujo: entiéndelo.', '30-sep', 'flujo'],
    ['❌ No entra', 'ROIC, ROCE, ROC, costo promedio de capital (WACC)', '<q>nada de esto se los voy a poner en un examen</q>', '28-sep', null],
    ['❌ No entra', 'Análisis de crédito y de sectores (refuerzo de flujo)', '<q>eso no les va a entrar en el final</q>', '30-sep', null],
    ['❌ No entra', 'Cálculo de los impuestos pagados en caja', '<q>no te voy a hacer examen de eso</q>', '5-oct', null],
    ['❌ No entra', 'Leasing / instrumentos de financiación (clase del 7-oct antes del examen)', '<q>ya no hay evaluación</q> de eso; es para pensar.', '5-oct', null],
  ];

  // ---------------------------------------------------------------- todos los tips, por tema
  // [cita literal corta, explicación, fecha, id de sección, texto del link]
  const TIPS = [
    { id: 'gen', t: '🎯 Interpretación general y examen', items: [
      ['No me importa si los números no están bien.', 'Escribe <b>la lógica del cálculo</b> ("dividí este entre este"). Un error aritmético casi no se castiga si se ve el razonamiento.', '5-oct', 'practica', 'Practicar con rúbrica'],
      ['Es interpretación', 'Te dan la información ya lista para que <b>interpretes</b>; no hay conversiones largas. Los cálculos son de dividir y multiplicar.', '5-oct', 'practica', 'Ver preguntas tipo'],
      ['solo son útiles en términos comparativos', 'Una razón sola no dice nada: compárala contra <b>el año anterior, el sector o el competidor</b>. "Farma con farmas"; si es conglomerado, por unidad de negocio.', '18-sep', 'liquidez', 'Liquidez: benchmark'],
      ['vean siempre los porcentajes, no se confundan con los absolutos', 'Para comparar empresas de distinto tamaño usa % (análisis vertical, razones), no pesos.', '18-sep', 'cimientos', 'Análisis vertical'],
      ['sin ver la pintura completa', 'Error típico: analizar "pedacito por pedacito". <b>Una información le aporta a la otra</b>: conecta liquidez, eficiencia, deuda y rentabilidad.', '18-sep', 'casos', 'Casos integrales'],
      ['averigüen por qué', 'Cuando veas algo raro (pérdidas anormales, saltos), la respuesta avanzada explica la <b>causa</b>, no sólo el número.', '18-sep', 'casos', 'Casos reales'],
      ['Nunca les voy a preguntar nada que yo no haya explicado', 'Todo sale de clase, materiales o quizzes. Lo que dijo "pongan atención" es por algo.', '30-sep', 'inicio', 'Mapa del curso'],
      ['se quedan en la primera pregunta', 'Gestión del tiempo: "se embelesan y ya pasó medio examen". Reparte 25 / 25 / 13 min.', '5-oct', 'examen/formato', 'Reparto del tiempo'],
      ['utilizan las fórmulas que les muestro', 'En examen, <b>las fórmulas exactas del profe</b> (aunque existan otras versiones en internet).', '18-sep', 'formulario', 'Formulario imprimible'],
      ['El examen es durito.', '… pero <q>si sabes lo que estás haciendo, es perfecto</q>. Es más de conceptualización que de cálculo.', '28-sep', 'practica', 'Simulacro'],
    ] },
    { id: 'cont', t: '🧱 Contabilidad (cimientos)', items: [
      ['A mí nunca olvidarse la identidad contable', '<b>Activo = Pasivo + Capital</b>. Es tu "doble chequeo": si no cuadra, algo hiciste mal.', '14-sep', 'cimientos', 'A = P + C'],
      ['el costo es inventariable, el gasto no', 'Costo = lo que toca el producto (se queda en inventario hasta vender). Gasto = lo que soporta la operación (se va).', '14-sep', 'cimientos', 'Costo vs gasto'],
      ['El balance general se hace en un punto de tiempo específico', 'Balance = <b>foto</b> (31-dic). Estado de resultados = <b>película</b> de un periodo.', '14-sep', 'cimientos', 'Foto vs película'],
      ['No se puede hacer con los unitarios', 'Costo de ventas = Inv. inicial + Compras − Inv. final, con <b>totales en pesos</b> (y verifica las unidades).', '14-sep', 'cimientos', 'Costo de ventas'],
      ['Activos es igual a inversión', '"Lo voy a repetir hasta el final del curso". Activo = inversión; pasivo + capital = de dónde salió el dinero.', '18-sep', 'cimientos', 'Activo = inversión'],
      ['La contabilidad no crea ni destruye valor', '…sólo lo registra y clasifica: "el arte de la categorización".', '18-sep', 'cimientos', 'Cimientos'],
      ['Es la falta de caja.', 'Lo que quiebra a una empresa no es la pérdida contable, <b>es quedarse sin caja</b>. Utilidad ≠ caja (devengo).', '18-sep', 'flujo', 'Flujo de efectivo'],
      ['En el estado de resultados, el ingreso. En el balance, el activo.', 'Análisis vertical: cada renglón del ER ÷ <b>ventas</b>; cada renglón del balance ÷ <b>activo total</b>.', '18-sep', 'cimientos', 'Análisis vertical'],
    ] },
    { id: 'liq', t: '💧 Liquidez', items: [
      ['siempre tiene que ser menor que la razón corriente', 'Chequeo: si tu <b>prueba ácida</b> sale mayor que la razón corriente, te equivocaste.', '23-sep', 'liquidez', 'Prueba ácida'],
      ['la naturaleza del inventario', 'Prueba ácida baja preocupa si el inventario es perecedero u obsoleto (tomates, tecnología); no tanto si se vende rápido (cemento, gasolina).', '18-sep', 'liquidez', 'Prueba ácida'],
      ['el mayor grado de realismo', 'En servicios (sin inventario), arma tu prueba ácida quitando <b>deudores de difícil cobro</b>.', '18-sep', 'liquidez', 'Liquidez'],
      ['Depende de la perspectiva', 'Capital neto de trabajo alto: le gusta al <b>banco</b> y a la <b>gerencia</b>; al <b>dueño</b> le cuesta (podría ser dividendo).', '18-sep', 'liquidez', 'Capital neto de trabajo'],
      ['Nada de esto es malo. Uno tiene que entrar a ver con detalle.', 'CNT negativo no siempre es malo (Dell, supermercados: los financian proveedores o anticipos). En cemento sí preocupa.', '23-sep', 'liquidez', 'CNT negativo'],
      ['es menos riesgoso para el inversionista', 'Más caja y menos activo no circulante = menos riesgo (Nvidia).', '21-sep', 'liquidez', 'Liquidez'],
    ] },
    { id: 'efi', t: '⚙️ Eficiencia / rotaciones / ciclos', items: [
      ['para que garanticen que su diez no sea un ocho', 'Rotación y días de inventario con <b>inventario PROMEDIO</b> = (inicial + final) / 2.', '23-sep', 'eficiencia', 'Rotación de inventarios'],
      ['Recuerden que es con el costo de los ingresos', 'Inventarios y proveedores se dividen entre <b>costo de ventas</b>, no ventas. Cuentas por cobrar sí van con <b>ventas</b>.', '23-sep', 'eficiencia', 'PPI y PPdP'],
      ['Cuando yo digo rotaciones, son veces al año.', 'Rotación (veces): más es mejor. Días: menos es mejor (salvo días de pago). <b>Días = 365 / rotación</b>.', '23-sep', 'eficiencia', 'Rotación ↔ días'],
      ['Si yo tengo que dar información, la doy en días.', 'Las rotaciones sirven para <b>proyectar</b>; para reportar al jefe, días.', '23-sep', 'eficiencia', 'Proyección de servilleta'],
      ['El ciclo operativo siempre es positivo', 'Ciclo operativo = PPC + PPI: lo más corto posible.', '21-sep', 'eficiencia', 'Ciclos'],
      ['lo más negativo posible', 'Ciclo de efectivo = ciclo operativo − PPdP. Negativo = te financian (supermercados, Cemex). <b>Sólo es bueno si la empresa es sana</b>: también sale negativo cuando no le pagas a nadie.', '21-sep', 'eficiencia', 'Ciclo de efectivo'],
      ['así de competitivo es el sector', 'Más días de cobro = sector más competido (la competencia fija el crédito). Un monopolio cobra de contado.', '21-sep', 'eficiencia', 'PPC'],
      ['La pista está en las rotaciones', 'Proyección de servilleta: cuenta proyectada = ventas (o costo) proyectado ÷ (365 / días meta).', '23-sep', 'eficiencia', 'Proyección'],
      ['la administración de la inversión es todo', 'Los activos son la causa; liquidez, deuda y rentabilidad son los efectos. Activos improductivos (Sears, BP) se castigan.', '21-sep', 'eficiencia', 'Activo productivo'],
    ] },
    { id: 'deu', t: '🏦 Endeudamiento y cobertura', items: [
      ['es con lo que se gasta en intereses', 'Cobertura de intereses = utilidad operacional ÷ <b>gasto</b> por intereses (bruto), <b>no</b> el neto.', '23-sep', 'deuda', 'Cobertura de intereses'],
      ['no basta que sea mayor que uno', 'Cobertura < 1: la operación no alcanza para los intereses. Los bancos piden más (p.ej. 3), según sector.', '21-sep', 'deuda', 'Cobertura'],
      ['prueba ácida del endeudamiento', 'Cobertura del servicio de la deuda = <b>EBITDA ÷ (intereses + abono a capital)</b>. Para empresas que sí pagan capital.', '23-sep', 'deuda', 'Servicio de deuda'],
      ['Falta información', 'Para saber si una deuda es mucha, compara contra el patrimonio y contra la <b>utilidad operacional</b> (capacidad de pago), no la neta.', '18-sep', 'deuda', 'Endeudamiento'],
      ['lana atrae lana', 'La banca le presta al sólido, no al que lo necesita.', '18-sep', 'deuda', 'Deuda'],
    ] },
    { id: 'ren', t: '💰 Rentabilidad y DuPont', items: [
      ['es con el ROE, todo hasta el ROE', 'Márgenes, ROA, ROE y DuPont entran; ROIC/ROCE no.', '30-sep', 'rentabilidad', 'Rentabilidad'],
      ['no es en sí la fórmula, es la metodología', 'DuPont = descomponer el ROE en <b>margen × rotación × apalancamiento</b> para saber <b>de dónde viene</b>.', '28-sep', 'dupont', 'Árbol DuPont'],
      ['usted utiliza la fórmula para gestionar', 'Para subir el ROA sólo hay 2 caminos: más utilidad con la misma inversión, o la misma utilidad con menos inversión.', '28-sep', 'dupont', 'Sensibilidad DuPont'],
      ['La que realmente le importa al inversionista', 'El ROE: lo que gana el dueño por cada peso que puso. El margen operacional es "el más importante" de la operación.', '23-sep', 'rentabilidad', 'ROE'],
      ['ya puede ser consultor de McKinsey', '… si entiendes que el ROA sube con más utilidad o con menos inversión.', '23-sep', 'rentabilidad', 'ROA'],
    ] },
    { id: 'fyu', t: '⚖️ Fuentes y usos / capital de trabajo', items: [
      ['esta es una pregunta que no falla', 'El <b>cambio en capital de trabajo</b>: si aumenta es <b>uso</b> (inversión); si disminuye es <b>fuente</b>.', '5-oct', 'fuentes-usos', 'La pregunta que no falla'],
      ['si es un uso, la inversión en capital de trabajo está aumentando', 'Y si es fuente, está disminuyendo. Memorízalo tal cual.', '5-oct', 'fuentes-usos', 'Cambio en KT'],
      ['Hasta que no tengan la maña, háganlo así', 'Signos: <b>activo = año anterior − año actual</b>; <b>pasivo y capital = año actual − año anterior</b>. La suma de todo da 0.', '5-oct', 'fuentes-usos', 'Atajo de signos'],
      ['Activos, perspectiva del accionista. Pasivo y capital, perspectiva de los gerentes.', 'Por eso un aumento de caja es <b>uso</b> (el dueño deja más dinero adentro): <q>es un poquito contraintuitivo</q>.', '28-sep', 'fuentes-usos', 'Perspectivas'],
      ['No importa el nombre, no se confundan por el nombre.', 'En el pasivo: si sube, alguien te financió (fuente); si baja, <b>pagaste</b> (uso). Proveedores bajan = "la palabra es pagar".', '30-sep', 'fuentes-usos', 'Pasivos'],
      ['Positivo es que nos entró dinero. Negativo, gastamos.', 'Fuente (+) = entra caja. Uso (−) = sale caja.', '30-sep', 'fuentes-usos', 'Fuentes y usos'],
    ] },
    { id: 'flu', t: '🚰 Flujo de efectivo', items: [
      ['Nunca se dejen asustar por esto', 'Todo flujo contable del planeta tiene 3 renglones: <b>operación, inversión, financiamiento</b>. "El resto es información adicional".', '30-sep', 'flujo', 'Los 3 renglones'],
      ['Operación, inversión, financiación. Memorízate eso', 'Y que la operación sea positiva, alta y creciendo año con año.', '30-sep', 'flujo', 'Flujo de operación'],
      ['yo espero que la operación exceda a la inversión', 'Flujo libre de <b>Buffett = operación + inversión</b>. Si es positivo, sobra para bancos y dueños.', '30-sep', 'flujo', 'Indicador Buffett'],
      ['es el único truco', 'Al construir el flujo, los dos ajustes especiales: <b>CapEx = Δ activo fijo neto + depreciación</b> y <b>dividendo = Δ patrimonio − utilidad neta</b>.', '30-sep', 'flujo', 'CapEx y dividendo'],
      ['Lo único que cambia', '… es mostrar: directo e indirecto dan <b>el mismo</b> flujo de operación; inversión y financiamiento son idénticos. Indirecto: cotizadas. Directo: PyMEs.', '30-sep', 'flujo', 'Directo vs indirecto'],
      ['No va a hacer nada que no puedas hacer con una calculadora', 'El flujo entra para <b>interpretar</b> y llegar a conclusiones, no para construirlo completo.', '30-sep', 'flujo', 'Interpretar el flujo'],
      ['uno tiene que ver la magnitud', 'Análisis horizontal (año posterior ÷ año anterior − 1) no muestra el tamaño: +100% de 1 a 2 millones puede ser irrelevante.', '30-sep', 'flujo', 'Análisis horizontal'],
      ['Lo que no quiero ver es un flujo de caja libre negativo.', 'Puede ser normal en expansión, pero <b>déficit + pago de dividendos</b> = <q>piden prestado para pagarle a sus accionistas</q>: alerta.', '5-oct', 'fcl', 'Flujo de caja libre'],
      ['El trigger es que lo justifiquen', 'En el día a día el ingreso debe crecer (en %) más que el CapEx. Empresa madura: CapEx ≈ depreciación.', '5-oct', 'fcl', 'CapEx'],
    ] },
  ];

  // ---------------------------------------------------------------- errores que mencionó
  const ERR = [
    ['Usar el inventario final en rotación / días de inventario', 'Usa <b>inventario promedio</b> = (inicial + final) / 2.', 'eficiencia'],
    ['Dividir inventarios o proveedores entre <b>ventas</b>', 'Inventarios y proveedores van contra <b>costo de ventas</b>; cuentas por cobrar contra ventas.', 'eficiencia'],
    ['Prueba ácida mayor que la razón corriente', 'Imposible: revisa que restaste el inventario.', 'liquidez'],
    ['Cobertura de intereses con el interés <b>neto</b>', 'Usa el <b>gasto</b> por intereses (lo que realmente cuesta la deuda).', 'deuda'],
    ['Medir capacidad de pago con la utilidad <b>neta</b>', 'Usa la <b>utilidad operacional</b> (EBIT) para cobertura.', 'deuda'],
    ['Creer que cobertura > 1 ya basta', 'Es el mínimo; bancos y calificadoras piden más (p.ej. 3) según el sector.', 'deuda'],
    ['Confundir rotación (veces) con días', 'Veces: más es mejor. Días: menos es mejor (excepto días de pago). Días = 365 / rotación.', 'eficiencia'],
    ['Pensar que ciclo de efectivo negativo siempre es bueno', 'Sólo en empresa sana con margen; si no pagas a nadie también sale negativo.', 'eficiencia'],
    ['Creer que más capital de trabajo siempre es mejor (o que negativo siempre es malo)', '"Depende de la perspectiva" y del negocio (retail, Dell).', 'liquidez'],
    ['Restar los años al revés en fuentes y usos', 'Activo: <b>anterior − actual</b>. Pasivo y capital: <b>actual − anterior</b>. Todo suma 0.', 'fuentes-usos'],
    ['Decir que si la caja aumenta es fuente', 'Es <b>uso</b>: el accionista dejó más inversión en caja.', 'fuentes-usos'],
    ['"Proveedores bajó: les quedé debiendo más"', 'Al revés: <b>les pagué</b> (uso).', 'fuentes-usos'],
    ['Dejarse llevar por el nombre raro de una cuenta de pasivo', 'Sólo mira si subió (fuente) o bajó (uso).', 'fuentes-usos'],
    ['Confundir capital de trabajo (nivel AC − PC) con el <b>cambio</b> en capital de trabajo', 'Al flujo va <b>el cambio</b> de un año a otro.', 'fuentes-usos'],
    ['Meter deuda con intereses en el capital de trabajo operativo', 'La deuda con costo va a <b>financiamiento</b>; en KT operativo sólo cuentas sin interés (clientes, inventarios, proveedores).', 'flujo'],
    ['Olvidar la depreciación al sacar el CapEx', 'CapEx = Δ activo fijo <b>neto</b> + depreciación del año.', 'flujo'],
    ['Pensar que directo e indirecto dan flujos distintos', 'Dan el mismo flujo de operación; sólo cambia cómo se muestra.', 'flujo'],
    ['Interpretar % horizontales sin ver la magnitud', 'Siempre mira también el monto absoluto.', 'flujo'],
    ['Leer un flujo de caja libre negativo sin contexto', 'Puede ser expansión; preocupa si además paga dividendos.', 'fcl'],
    ['Análisis vertical del ER sobre activos (o del balance sobre ventas)', 'ER ÷ <b>ventas</b>; balance ÷ <b>activo total</b>.', 'cimientos'],
    ['Poner el capital de un préstamo en el estado de resultados', 'Sólo el <b>interés</b> va al ER; el capital va al balance.', 'cimientos'],
    ['Registrar un anticipo como gasto', 'Es activo hasta que recibes el bien o servicio.', 'cimientos'],
    ['Costo de ventas con precios unitarios', 'Con totales en pesos; verifica que cuadren las unidades vendidas.', 'cimientos'],
    ['"Utilidad operacional = EBITDA" (en tus apuntes)', 'Utilidad operacional ≈ <b>EBIT</b>. <b>EBITDA = utilidad operacional + depreciación y amortización</b>.', 'cimientos'],
    ['Comparar contra otro sector o contra el consolidado de un conglomerado', 'Compara contra pares del mismo sector o por unidad de negocio.', 'casos'],
    ['No ver las unidades (miles vs millones)', 'Walmex: "¿49 millones?" — no, estaba en miles: 49 mil millones.', 'casos'],
    ['Quedarse atorado en la primera pregunta', 'Reparte el tiempo por puntos y regresa al final si se puede.', 'practica'],
  ];

  // ---------------------------------------------------------------- frases-filosofía
  const FIL = [
    ['📏', 'Las razones sólo sirven comparando', 'Contra el año previo, el sector o el competidor. Sin benchmark no hay análisis.'],
    ['🌱', 'Los activos son la causa', 'Liquidez, pasivos y rentabilidad son los efectos. "La administración de la inversión lo es todo".'],
    ['📖', 'Lee los reportes de atrás hacia adelante', 'En las notas "está la carnita": son revelaciones forzadas por el auditor.'],
    ['🧘', 'No te espantes por las cuentas', 'Los pasivos se reestructuran todo el tiempo: mira el <i>full picture</i>.'],
    ['💼', 'Activo = inversión', 'Inversión = fuentes de financiamiento (terceros + dueños).'],
    ['🪙', 'Lo que quiebra a una empresa es la falta de caja', 'Utilidad no es lo mismo que efectivo.'],
    ['🔍', 'Busca conclusiones irrefutables', 'Ej.: RC abajo del sector pero prueba ácida arriba → tiene menos inventario que el sector.'],
    ['🗂️', 'La contabilidad es el arte de la categorización', 'No crea ni destruye valor: lo registra y clasifica.'],
    ['🏦', 'Lana atrae lana', 'Los bancos le prestan al que se ve sólido.'],
    ['🎲', 'A mayor riesgo, mayor recompensa', 'El axioma de las finanzas.'],
    ['🛒', 'Todo negocio es atractivo por su capacidad de monetización', 'Cobrar de contado y pagar a crédito (Walmart, OXXO, el Tec).'],
    ['🤝', 'Proveedores: "la mejor financiación del mundo"', 'No cobran intereses (aunque no puedes financiar todo con ellos).'],
    ['🚦', 'La fórmula es para gestionar', 'DuPont no es para calcular: es para saber qué palanca mover.'],
    ['👀', 'Negocios similares, estructuras similares', 'Primer reto del análisis: identificar el sector.'],
  ];

  // ---------------------------------------------------------------- checklist
  const CHECK = [
    ['lockdown', 'Instalar <b>Respondus LockDown Browser</b> en una compu propia (las de oficina con restricciones no funcionan).'],
    ['practica-ldb', 'Hacer el <b>examen de práctica</b> de LockDown en Canvas (no se califica, sólo prueba que funciona).'],
    ['bateria', 'Laptop cargada + cargador en la mochila.'],
    ['formulario', `Imprimir el ${E.link('formulario', 'formulario')} (se vale llevar todo impreso).`],
    ['tips', 'Imprimir esta hoja de tips y tus apuntes clave (Ctrl+P).'],
    ['calc', 'Calculadora lista (la del celular sirve). <b>Excel NO</b>.'],
    ['papel', 'Hojas en blanco y pluma para hacer cuentas.'],
    ['simulacro', `Hacer el ${E.link('practica', 'simulacro de 3 preguntas')} con cronómetro.`],
    ['fyu', `Repasar ${E.link('fuentes-usos', 'fuentes y usos y el cambio en capital de trabajo')} (★ la que no falla).`],
    ['flujo3', `Repasar los ${E.link('flujo', '3 renglones del flujo')} + Buffett.`],
    ['ecoa', 'Contestar la <b>ECOA</b> (MiTec) y subir el pantallazo a "participación" en Canvas (5%).'],
    ['hora', 'Llegar a tiempo: el examen es <b>después del break</b> (≈ 20:15).'],
  ];
  const KEY = 'estudio.examen.check';
  const load = () => { try { return JSON.parse(localStorage.getItem(KEY) || '{}') || {}; } catch (e) { return {}; } };
  const save = (o) => { try { localStorage.setItem(KEY, JSON.stringify(o)); } catch (e) {} };

  E.section({
    id: 'examen', n: 1, group: 'inicio', icon: '🎓', short: 'Lo que dijo el profe', exam: 'in',
    title: 'Lo que dijo el profe: tu referencia definitiva para el examen',
    lead: 'Formato, cómo califica, qué entra y qué no, y TODOS sus tips para el examen (con la fecha de la clase y una liga a la sección que lo explica).',
    render(root) {
      root.innerHTML = `
      <style>
        .sx-ex .toc{display:flex;flex-wrap:wrap;gap:8px;margin:14px 0 4px}
        .sx-ex .fact{display:flex;gap:12px;align-items:flex-start}
        .sx-ex .fact .ic{font-size:26px;line-height:1}
        .sx-ex .fact b{display:block}
        .sx-ex .fact span{font-size:14px;color:var(--ink2)}
        .sx-ex .ans{border-left:4px solid var(--line);padding:2px 0 2px 12px;margin:8px 0}
        .sx-ex .ans.b{border-color:var(--c3)}.sx-ex .ans.i{border-color:var(--c2)}.sx-ex .ans.a{border-color:var(--c1)}
        .sx-ex .ans h4{margin:0 0 4px;font-size:14px}
        .sx-ex .ans p{margin:4px 0;font-size:14.5px}
        .sx-ex .tipgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:0 14px;max-width:1180px}
        .sx-ex .tipgrid .co{margin:8px 0}
        @media(max-width:900px){.sx-ex .tipgrid{grid-template-columns:1fr}}
        .sx-ex .co .go{display:inline-block;margin-top:4px;font-size:13px;font-weight:600}
        .sx-ex .errl{list-style:none;padding:0;margin:12px 0;max-width:1180px;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px}
        @media(max-width:900px){.sx-ex .errl{grid-template-columns:1fr}}
        .sx-ex .errl li{background:var(--card);border:1px solid var(--line);border-radius:12px;padding:10px 14px;margin:0;font-size:14.5px}
        .sx-ex .errl .x{color:var(--bad);font-weight:600}
        .sx-ex .errl .ok{color:var(--good);font-weight:600}
        .sx-ex .fil{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:12px;max-width:1180px}
        .sx-ex .fil div{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:12px 14px}
        .sx-ex .fil .e{font-size:24px}
        .sx-ex .fil b{display:block;font-size:15.5px;margin:4px 0 2px}
        .sx-ex .fil span{font-size:13.5px;color:var(--ink2)}
        .sx-ex .chk{max-width:var(--read);list-style:none;padding:0;margin:10px 0}
        .sx-ex .chk li{margin:0;border-bottom:1px solid var(--line2)}
        .sx-ex .chk label{display:flex;gap:12px;align-items:flex-start;padding:9px 4px;cursor:pointer;font-size:15px}
        .sx-ex .chk input{width:20px;height:20px;margin-top:2px;accent-color:var(--good);flex:none}
        .sx-ex .chk input:checked + span{color:var(--muted);text-decoration:line-through}
        .sx-ex .bar{height:10px;border-radius:99px;background:var(--line2);overflow:hidden;max-width:var(--read)}
        .sx-ex .bar i{display:block;height:100%;background:var(--good);transition:width .25s}
      </style>
      <div class="sx-ex">
        <div class="toc">
          <a class="btn" href="#/examen/formato">🗓️ Formato</a><a class="btn" href="#/examen/califica">🧮 Cómo califica</a><a class="btn" href="#/examen/entra">✅ Qué entra</a>
          <a class="btn" href="#/examen/tips">🎓 Todos los tips</a><a class="btn" href="#/examen/errores">⚠️ Errores</a><a class="btn" href="#/examen/filosofia">💬 Frases</a><a class="btn pri" href="#/examen/checklist">☑️ Checklist</a>
        </div>

        <h2 id="formato">Formato y logística</h2>
        <div class="g3">
          <div class="card2 fact"><span class="ic">🗓️</span><div><b>Miércoles 7 de octubre de 2026</b><span>En el salón, en horario de clase, <b>después del break</b> (≈ 20:15). Antes, explicación de leasing (sin evaluación).</span></div></div>
          <div class="card2 fact"><span class="ic">📝</span><div><b>3 preguntas abiertas: 40 / 40 / 20</b><span>Independientes: "ninguna pregunta está relacionada con la otra". Cada una trae la información que necesitas.</span></div></div>
          <div class="card2 fact"><span class="ic">⏱️</span><div><b>70 minutos</b><span>Diseñado para ese tiempo. Se puede <b>regresar entre preguntas</b> ("creo que sí… lo voy a verificar").</span></div></div>
          <div class="card2 fact"><span class="ic">📚</span><div><b>Libro abierto</b><span>"Pueden traer todas sus notas": fórmulas impresas, apuntes, papel en blanco.</span></div></div>
          <div class="card2 fact"><span class="ic">🧮</span><div><b>Calculadora sí · Excel NO</b><span>La del celular sirve; "los cálculos van a ser fáciles". Excel ni en otra compu: <q>No. Respuesta simple. No.</q></span></div></div>
          <div class="card2 fact"><span class="ic">🔒</span><div><b>Canvas + Respondus LockDown</b><span>Bloquea la web. Instálalo y haz el examen de práctica; en compus de oficina restringidas no corre.</span></div></div>
        </div>
        <p class="small muted">Vale <b>35%</b> de la calificación final, individual y sincrónico (syllabus). Aprobatoria: 70.</p>
        ${E.fig(svgTiempo, 'Reparto sugerido. El profe advirtió que la gente "se queda en la primera pregunta".', true)}
        ${E.tip('<q>se olvidan el tiempo… se quedan en la primera pregunta</q> — escribe tu conclusión aunque no termines todos los cálculos y avanza.', 'Clase 5-oct')}

        <h2 id="califica">Cómo califica</h2>
        <p class="prose">La mitad de la nota es <b>lo que escribes</b> (interpretación) y la otra mitad es el <b>cálculo</b>, que tiene tres niveles: mientras más información uses y más indicadores conectes, más alto llegas. <q>De acuerdo a como usted la use, usted le puede sacar más o menos cosas… es abierto</q>.</p>
        ${E.fig(svgCalif, '50% cualitativo + 50% cuantitativo en 3 niveles (básico → intermedio ≈80 → avanzado 100).', true)}
        ${E.tip('<q>escriban como hicieron la lógica del cálculo. No me importa si los números no están bien</q>', 'Clase 5-oct')}
        <h3>Anatomía de una respuesta de 100</h3>
        ${E.fig(svgAnat, 'Seis pasos para cada número que calcules. Los pasos 1–3 son el mínimo; 4–6 son los que te llevan a 100.', true)}

        <h3>La misma pregunta, tres niveles de respuesta</h3>
        <div class="card2" style="max-width:var(--read)">
          <p style="margin-top:0"><b>Pregunta:</b> La razón corriente de la empresa pasó de <b>1.5</b> (2024) a <b>1.1</b> (2025); el sector está en <b>1.3</b>. Datos 2025: activo corriente 330, de los cuales inventario 180; pasivo corriente 300. (2024: AC 300, inventario 100, PC 200.) Analiza la liquidez.</p>
          <div class="ans b"><h4>🟢 Básica (sólo cálculo)</h4><p>RC 2025 = 330 / 300 = 1.1. Bajó.</p></div>
          <div class="ans i"><h4>🟠 Intermedia (≈80)</h4><p>RC = AC / PC: 2024 = 300 / 200 = <b>1.50x</b>; 2025 = 330 / 300 = <b>1.10x</b>. Prueba ácida = (AC − inventario) / PC: 2024 = 200 / 200 = <b>1.00x</b>; 2025 = 150 / 300 = <b>0.50x</b>. La liquidez empeoró y quedó <b>por debajo del sector (1.3x)</b>: por cada $1 que debe a corto plazo sólo tiene $1.10 de activo corriente, y sólo $0.50 que sea "dinero, dinero".</p></div>
          <div class="ans a"><h4>🔵 Avanzada (100)</h4><p>Todo lo anterior, más: la prueba ácida cayó a la mitad (1.0 → 0.5) mientras la RC cayó menos → <b>conclusión irrefutable: el activo corriente creció por inventario</b> (100 → 180, +80%), no por caja ni cobranza. Al mismo tiempo el pasivo corriente subió 50% (200 → 300): parece que el inventario se financió con deuda o proveedores de corto plazo. Riesgo: si el inventario no se vende rápido (depende de su naturaleza), la empresa podría no poder pagar. <b>Recomendaría</b> revisar la rotación/días de inventario, bajar compras y, si la deuda es bancaria, refinanciarla a largo plazo. Como banco, pediría más garantías antes de prestar más a corto plazo.</p></div>
        </div>
        ${E.key('Para cada indicador: <b>fórmula con datos → resultado → "mejor/peor que…" → qué significa → por qué pasó → qué harías</b>. Si te falta tiempo, prioriza escribir la comparación y la interpretación: valen más que un decimal perfecto.', 'La receta')}

        <h2 id="entra">Qué entra y qué no</h2>
        <div class="tblwrap"><table class="tbl"><thead><tr><th>Tema</th><th style="text-align:left">Estatus</th><th style="text-align:left">Lo que dijo</th></tr></thead><tbody>
          ${entra.map(([st, tema, cita, f, id]) => `<tr><td>${id ? E.link(id, tema) : tema}</td><td style="text-align:left;white-space:nowrap"><b>${st}</b></td><td style="text-align:left;white-space:normal">${cita} <span class="muted small">(${f})</span></td></tr>`).join('')}
        </tbody></table></div>
        ${E.note('El profe también dijo: <q>Lo más importante del examen van a ser indicadores</q>, saber análisis financiero bien <b>y una parte de flujo de caja</b> (30-sep). La cotización de AAL (beta, P/E, EPS) y la conferencia de IA no las mencionó para el examen.', 'En resumen')}

        <h2 id="tips">Todos los tips del profe, por tema</h2>
        <div class="btnrow" id="tipf"><button class="btn on" type="button" data-g="all">Todos</button>${TIPS.map((g) => `<button class="btn" type="button" data-g="${g.id}">${g.t}</button>`).join('')}</div>
        <div id="tipwrap">${TIPS.map((g) => `<div class="tipg" data-g="${g.id}"><h3>${g.t} <span class="muted small">(${g.items.length})</span></h3><div class="tipgrid">${g.items.map(([q, txt, f, id, lt]) => E.tip(`<q>${q}</q> ${txt}<br><span class="go">${E.link(id, '→ ' + lt)}</span>`, 'Clase ' + f)).join('')}</div></div>`).join('')}</div>

        <h2 id="errores">Errores que el profe mencionó (y la forma correcta)</h2>
        <ul class="errl">${ERR.map(([x, ok, id]) => `<li><span class="x">✗ ${x}</span><br><span class="ok">✓</span> ${ok} <span class="small">${E.link(id, '→ ver')}</span></li>`).join('')}</ul>

        <h2 id="filosofia">Frases-filosofía del profe</h2>
        <p class="prose">Úsalas en tu interpretación: demuestran que entendiste <b>cómo piensa</b> el analista.</p>
        <div class="fil">${FIL.map(([e, b, s]) => `<div><span class="e">${e}</span><b>${b}</b><span>${s}</span></div>`).join('')}</div>
        ${E.kid('El profe piensa como un detective: un número solo es una pista. Para resolver el caso necesitas <b>comparar</b> (¿es más o menos que antes, o que los demás?), <b>conectar</b> pistas (inventario sube + caja baja + deuda sube = algo pasó) y <b>explicar el porqué</b>.')}

        <h2 id="checklist">Checklist antes del examen</h2>
        <p class="small muted">Se guarda en este navegador.</p>
        <div class="bar"><i id="chkbar" style="width:0"></i></div>
        <p class="small" id="chktxt"></p>
        <ul class="chk" id="chk">${CHECK.map(([k, t]) => `<li><label><input type="checkbox" data-k="${k}"><span>${t}</span></label></li>`).join('')}</ul>
        <div class="btnrow"><button class="btn sm" type="button" id="chkreset">↺ Desmarcar todo</button></div>
      </div>`;

      // filtro de tips por tema
      const tf = root.querySelector('#tipf');
      tf.addEventListener('click', (ev) => {
        const b = ev.target.closest('button'); if (!b) return;
        tf.querySelectorAll('button').forEach((x) => x.classList.toggle('on', x === b));
        root.querySelectorAll('.tipg').forEach((g) => { g.style.display = b.dataset.g === 'all' || g.dataset.g === b.dataset.g ? '' : 'none'; });
      });

      // checklist con localStorage
      const st = load();
      const boxes = Array.from(root.querySelectorAll('#chk input'));
      const paint = () => {
        const n = boxes.filter((b) => b.checked).length;
        root.querySelector('#chkbar').style.width = (100 * n / boxes.length) + '%';
        root.querySelector('#chktxt').textContent = n === boxes.length ? '✓ ¡Todo listo! Duerme bien.' : `${n} de ${boxes.length} listos`;
      };
      boxes.forEach((b) => {
        b.checked = !!st[b.dataset.k];
        b.addEventListener('change', () => { st[b.dataset.k] = b.checked; save(st); paint(); });
      });
      root.querySelector('#chkreset').addEventListener('click', () => { boxes.forEach((b) => { b.checked = false; st[b.dataset.k] = false; }); save(st); paint(); });
      paint();
    },
  });
})();
