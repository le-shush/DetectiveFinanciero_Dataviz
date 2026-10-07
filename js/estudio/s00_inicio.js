// Sección 0 — Inicio: el examen en una pantalla, mapa del curso y plan de repaso.
(function () {
  const EXAM = new Date('2026-10-07T20:15:00-06:00'); // después del break (clase 18:30–21:45, hora CDMX)

  // Mapa: cómo se conectan los tres estados financieros y las razones
  const mapa = `<svg class="ill" viewBox="0 0 900 360" role="img" aria-label="Cómo se conectan el estado de resultados, el balance y el flujo de efectivo">
    <defs><marker id="ah0" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0 0L10 5L0 10z" class="f5"/></marker></defs>
    <!-- Estado de resultados: película -->
    <rect x="20" y="40" width="250" height="220" rx="16" class="w1"/>
    <text x="145" y="72" text-anchor="middle" font-size="18" font-weight="700">Estado de resultados</text>
    <text x="145" y="94" text-anchor="middle" font-size="14" class="tm">🎬 una PELÍCULA del año</text>
    <g font-size="14"><text x="44" y="128">Ventas</text><text x="44" y="152" class="t2">− Costo de ventas</text><text x="44" y="176" class="t2">− Gastos</text><text x="44" y="200" class="t2">− Intereses e impuestos</text>
    <line x1="44" y1="212" x2="246" y2="212" class="ln"/><text x="44" y="238" font-weight="700">= Utilidad neta</text></g>
    <!-- Balance: foto -->
    <rect x="325" y="40" width="250" height="220" rx="16" class="w3"/>
    <text x="450" y="72" text-anchor="middle" font-size="18" font-weight="700">Balance general</text>
    <text x="450" y="94" text-anchor="middle" font-size="14" class="tm">📸 una FOTO al cierre</text>
    <rect x="345" y="110" width="100" height="130" rx="8" class="f3"/><text x="395" y="180" text-anchor="middle" class="tw" font-size="15" font-weight="700">Activo</text>
    <rect x="455" y="110" width="100" height="70" rx="8" class="f2"/><text x="505" y="150" text-anchor="middle" class="tw" font-size="14" font-weight="700">Pasivo</text>
    <rect x="455" y="186" width="100" height="54" rx="8" class="f1"/><text x="505" y="218" text-anchor="middle" class="tw" font-size="14" font-weight="700">Capital</text>
    <text x="450" y="252" text-anchor="middle" font-size="13" class="tm"></text>
    <!-- Flujo: tubería -->
    <rect x="630" y="40" width="250" height="220" rx="16" class="w4"/>
    <text x="755" y="72" text-anchor="middle" font-size="18" font-weight="700">Flujo de efectivo</text>
    <text x="755" y="94" text-anchor="middle" font-size="14" class="tm">💧 por dónde entró y salió la caja</text>
    <g font-size="14"><text x="654" y="130">± Operación</text><text x="654" y="156">± Inversión</text><text x="654" y="182">± Financiamiento</text>
    <line x1="654" y1="196" x2="856" y2="196" class="ln"/><text x="654" y="220" font-weight="700">= Cambio en caja</text><text x="654" y="244" class="tm" font-size="13">caja inicial + cambio = caja final</text></g>
    <!-- flechas -->
    <path d="M270 150 C 295 150, 300 150, 323 150" class="ln s5 anim-flow" marker-end="url(#ah0)"/>
    <path d="M575 150 C 600 150, 605 150, 628 150" class="ln s5 anim-flow" marker-end="url(#ah0)"/>
    <text x="297" y="138" text-anchor="middle" font-size="12" class="t2">utilidad</text><text x="297" y="168" text-anchor="middle" font-size="12" class="t2">→ capital</text>
    <text x="602" y="138" text-anchor="middle" font-size="12" class="t2">cambios</text><text x="602" y="168" text-anchor="middle" font-size="12" class="t2">año vs año</text>
    <!-- razones -->
    <rect x="150" y="290" width="600" height="54" rx="27" class="f5"/>
    <text x="450" y="323" text-anchor="middle" class="tw" font-size="16" font-weight="700">Razones financieras = dividir una cuenta entre otra para COMPARAR</text>
  </svg>`;

  const groups = [
    ['examen', '🎓', 'Lo que dijo el profe', 'Formato, cómo califica, qué entra y todos sus tips.'],
    ['cimientos', '🧱', 'Cimientos', 'A = P + C, película vs foto, costo vs gasto, EBIT vs EBITDA.'],
    ['liquidez', '💧', 'Liquidez', 'Razón corriente, prueba ácida, capital neto de trabajo.'],
    ['eficiencia', '⚙️', 'Eficiencia y ciclos', 'Rotaciones, días, ciclo operativo y de efectivo.'],
    ['deuda', '🏦', 'Endeudamiento', 'Nivel de endeudamiento y coberturas.'],
    ['rentabilidad', '💰', 'Rentabilidad', 'Márgenes, ROA y ROE.'],
    ['dupont', '🌳', 'DuPont', 'ROE = margen × rotación × apalancamiento.'],
    ['fuentes-usos', '⚖️', 'Fuentes y usos', '★ La pregunta que no falla: cambio en capital de trabajo.'],
    ['flujo', '🚰', 'Flujo de efectivo', 'Operación, inversión, financiamiento; directo e indirecto.'],
    ['lab', '🧪', 'Laboratorio', 'Mueve una perilla y mira cómo cambian los 3 estados y todas las razones.'],
    ['casos', '🏗️', 'Casos reales', 'Cementeras, Walmex, Detective, juego de razones.'],
    ['practica', '✍️', 'Práctica tipo examen', 'Preguntas abiertas con rúbrica y solución.'],
    ['formulario', '🖨️', 'Formulario imprimible', 'Todas las fórmulas en 1–2 hojas para llevar.'],
  ];

  E.section({
    id: 'inicio', n: 0, group: 'inicio', icon: '🏠', short: 'Inicio',
    title: 'Central de estudio de Análisis Financiero',
    kicker: 'Examen final · miércoles 7 de octubre, después del break',
    lead: 'Todo lo del curso en un solo lugar, explicado fácil, con perillas para jugar con los conceptos y los tips que dio el profe para el examen.',
    render(root) {
      root.innerHTML = `
      <div class="hero2">
        <div>
          <h3 style="margin-top:0">El examen en 30 segundos</h3>
          <ul>
            <li><b>3 preguntas abiertas</b> e independientes: valen <b>40 + 40 + 20</b>. Pensado para <b>70 minutos</b>.</li>
            <li><b>Libro abierto:</b> puedes llevar todas tus notas y fórmulas. <b>Calculadora sí</b> (la del celular). <b>Excel no</b>.</li>
            <li>Se hace con <b>Respondus / LockDown Browser</b>: tenlo instalado y haz el examen de práctica antes.</li>
            <li><b>50% interpretación</b> (lo que escribes) y <b>50% cálculo</b> en 3 niveles: básico → intermedio (≈80) → avanzado (100).</li>
          </ul>
          ${E.tip('<q>Escriban cómo hicieron la lógica del cálculo. No me importa si los números no están bien.</q>', 'Clase 5-oct')}
        </div>
        <div>
          <h3 style="margin-top:0">Faltan</h3>
          <div class="count" id="cd"></div>
          <p class="small muted" style="margin-top:10px">Hora estimada: 20:15 (CDMX), después de la explicación de leasing.</p>
          <div class="btnrow"><a class="btn pri" href="#/examen">Ver los tips del profe →</a><a class="btn" href="#/practica">Practicar</a><a class="btn" href="#/formulario">🖨️ Formulario</a></div>
        </div>
      </div>

      <h2>El mapa de todo el curso</h2>
      <p class="prose">Casi todo lo que viste sale de <b>tres reportes</b> que se pasan información entre sí. Las razones financieras son sólo divisiones entre cuentas de esos reportes para <b>comparar</b> contra el año anterior o contra la competencia.</p>
      ${E.fig(mapa, 'La utilidad del estado de resultados alimenta el capital del balance; los cambios del balance de un año a otro explican el flujo de efectivo.', true)}
      ${E.kid('Imagina una tiendita. El <b>estado de resultados</b> es el video de todo lo que vendió y gastó en el año. El <b>balance</b> es una foto de lo que tiene (y a quién se lo debe) el 31 de diciembre. El <b>flujo de efectivo</b> es la alcancía: explica por qué hoy tiene más o menos monedas que el año pasado.')}

      <h2>Temas</h2>
      <div class="map">${groups.map(([id, ic, t, d], i) => `<a href="#/${id}"><span class="n">${ic} ${String(i + 1).padStart(2, '0')}</span><b>${t}</b><span>${d}</span></a>`).join('')}</div>

      <h2>Plan de repaso para hoy (≈3 horas)</h2>
      <div class="tblwrap">${E.table([
        ['1. Tips del profe + formato', '15 min', 'Saber cómo te van a calificar cambia cómo respondes.'],
        ['2. Fuentes y usos + cambio en capital de trabajo', '40 min', '★ "La pregunta que no falla". Practica con el generador.'],
        ['3. Razones: liquidez, eficiencia, deuda, rentabilidad', '50 min', 'Fórmula exacta + qué significa alto/bajo + error típico.'],
        ['4. DuPont', '20 min', 'Saber de qué palanca viene el ROE.'],
        ['5. Flujo de efectivo (3 renglones, directo/indirecto, Buffett)', '30 min', 'Interpretar, no memorizar líneas.'],
        ['6. Práctica tipo examen', '30 min', 'Con cronómetro: no te atores en la primera.'],
        ['7. Imprime el formulario', '5 min', 'Puedes llevarlo.'],
      ], { head: ['Bloque', 'Tiempo', 'Por qué'] })}</div>
      ${E.key('Para cada número que calcules, escribe 3 cosas: <b>(1) la fórmula con los datos</b>, <b>(2) el resultado</b> y <b>(3) qué significa comparado con algo</b> (el año pasado, el sector o la competencia). Así ganas puntos de cálculo aunque te equivoques en una división, y puntos de interpretación.', 'La receta para cada respuesta')}
      `;
      const cd = root.querySelector('#cd');
      const tick = () => {
        if (!cd.isConnected) return clearInterval(t);
        let s = Math.max(0, Math.floor((EXAM - new Date()) / 1000));
        const d = Math.floor(s / 86400); s -= d * 86400; const h = Math.floor(s / 3600); s -= h * 3600; const m = Math.floor(s / 60);
        cd.innerHTML = [[d, 'días'], [h, 'horas'], [m, 'min']].map(([v, l]) => `<div><b>${v}</b><span>${l}</span></div>`).join('');
      };
      const t = setInterval(tick, 30000); tick();
    },
  });
})();
