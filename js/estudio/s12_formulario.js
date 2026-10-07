// Sección 12 — Formulario imprimible: todas las fórmulas con los nombres del profe, cómo leerlas, tips y plantilla.
// Pensado para caber en 2 hojas carta (2 columnas, 9–10px) al imprimir.
(function () {
  // fila: nombre | fórmula + cómo leerla
  const r = (name, f, read) => `<tr><th>${name}</th><td><span class="f">${f}</span>${read ? `<span class="rd">${read}</span>` : ''}</td></tr>`;
  const blk = (icon, title, rows, extra = '') => `<div class="blk"><h4>${icon} ${title}</h4>${rows.length ? `<table>${rows.join('')}</table>` : ''}${extra}</div>`;

  E.section({
    id: 'formulario', n: 12, group: 'examen', icon: '🖨️', short: 'Formulario imprimible', exam: 'in',
    title: 'Formulario imprimible',
    lead: 'Todas las fórmulas del curso con los nombres del profe y cómo leerlas. Libro abierto: imprímelo y llévalo al examen.',
    render(root) {
      root.innerHTML = `
      <style>
        .sx-fx{--fxb:var(--line)}
        .sx-fx .bar{display:flex;flex-wrap:wrap;gap:10px;align-items:center;margin:10px 0 16px}
        .sx-fx .ph{display:none}
        .sx-fx .fx{column-count:2;column-gap:22px;max-width:1240px}
        @media(max-width:1100px){.sx-fx .fx{column-count:1}}
        .sx-fx .blk{break-inside:avoid;-webkit-column-break-inside:avoid;background:var(--card);border:1px solid var(--fxb);border-radius:12px;padding:10px 12px;margin:0 0 14px;display:inline-block;width:100%;box-sizing:border-box}
        .sx-fx h4{margin:0 0 6px;font-size:14px;letter-spacing:.01em;border-bottom:2px solid var(--accent);padding-bottom:3px}
        .sx-fx table{width:100%;border-collapse:collapse;font-size:13px;line-height:1.35}
        .sx-fx th,.sx-fx td{text-align:left;vertical-align:top;padding:4px 6px;border-bottom:1px solid var(--line2);white-space:normal!important;overflow-wrap:anywhere}
        .sx-fx tr:last-child th,.sx-fx tr:last-child td{border-bottom:0}
        .sx-fx th{font-weight:700;width:31%;color:var(--ink);font-size:inherit;text-transform:none;letter-spacing:0}
        .sx-fx .f{display:block;font-weight:600;font-variant-numeric:tabular-nums}
        .sx-fx .rd{display:block;font-size:12px;color:var(--ink2);margin-top:1px}
        .sx-fx .rd::before{content:"→ ";color:var(--muted)}
        .sx-fx .sg th,.sx-fx .sg td{text-align:center}.sx-fx .sg th:first-child,.sx-fx .sg td:first-child{text-align:left}
        .sx-fx .sg thead th{font-size:11px;text-transform:uppercase;letter-spacing:.04em;color:var(--muted);width:auto}
        .sx-fx .fxn{font-size:12px;color:var(--ink2);margin:6px 2px 0}
        .sx-fx ol,.sx-fx ul{margin:0;padding-left:18px;font-size:13px;line-height:1.4}.sx-fx li{margin:2px 0}
        .sx-fx .tree{font-family:ui-monospace,Consolas,monospace;font-size:12px;white-space:pre;line-height:1.35;margin:6px 0 0;overflow-x:auto}
        .sx-fx .abbr{font-size:12px;color:var(--ink2)}
        @media print{
          @page{size:letter portrait;margin:8mm}
          html,body,body.est{background:#fff!important;color:#000!important}
          .sec-head{display:none!important}
          .main{padding:0!important;max-width:none!important}
          .sx-fx .ph{display:flex!important;justify-content:space-between;align-items:baseline;border-bottom:1.5px solid #000;margin:0 0 5px;padding-bottom:2px}
          .sx-fx .ph b{font-size:12px}.sx-fx .ph span{font-size:8.5px}
          .sx-fx,.sx-fx *{color:#000!important;background:transparent!important;box-shadow:none!important}
          .sx-fx .fx{column-count:2!important;column-gap:4.5mm;column-rule:.5px solid #999;max-width:none}
          .sx-fx .blk{border:0;border-radius:0;padding:0;margin:0 0 5px}
          .sx-fx h4{font-size:10.5px;border-bottom:1px solid #000;margin:0 0 2px;padding-bottom:1px}
          .sx-fx table{font-size:9.6px;line-height:1.22}
          .sx-fx th,.sx-fx td{padding:1.2px 3px;border-bottom:.5px solid #ccc}
          .sx-fx th{width:29%}
          .sx-fx .rd{font-size:8.8px;color:#333!important}
          .sx-fx .fxn,.sx-fx .abbr{font-size:8.4px}
          .sx-fx ol,.sx-fx ul{font-size:9.6px;line-height:1.25;padding-left:13px}.sx-fx li{margin:0}
          .sx-fx .tree{font-size:8.6px;line-height:1.2;margin:2px 0 0}
          .sx-fx .sg thead th{font-size:8px}
        }
      </style>
      <div class="sx-fx">
        <div class="bar no-print">
          <button class="btn pri" type="button" id="bPrint">🖨️ Imprimir</button>
          <span class="small muted">Carta, vertical, márgenes predeterminados. Sale en ≈2 hojas. Activa "Gráficos de fondo" sólo si quieres color (no hace falta).</span>
        </div>
        <div class="ph"><b>Formulario · Análisis Financiero (Prof. Cayón) · EGADE MBA</b><span>Escribe: fórmula con datos → resultado → vs qué → qué significa y para quién</span></div>
        <div class="fx">

        ${blk('🧱', 'Contabilidad', [
          r('Identidad contable', 'Activo = Pasivo + Capital (patrimonio)', 'Inversión = fuentes de financiamiento (terceros + dueños). Si no cuadra, algo está mal.'),
          r('Capital (residual)', 'Capital = Activo − Pasivo', '"Una empresa nada tiene, todo lo debe".'),
          r('Costo de ventas', 'Inventario inicial + Compras − Inventario final', 'En $ TOTALES, no unitarios; verifica con unidades. II + Compras = disponible para la venta.'),
          r('Cascada del ER', 'Ventas − Costo = Utilidad bruta − Gastos op. = EBITDA − D&A = EBIT − Intereses = UAI − Impuestos = Utilidad neta', 'Utilidad operacional = EBIT (no EBITDA). Gobierno = "tercer socio".'),
          r('EBITDA', 'EBIT + Depreciación y amortización', '≈ generación contable de fondos operativos (la D&A no sale de caja).'),
          r('PPE neto', 'Costo histórico − Depreciación acumulada', 'Depreciación anual = costo ÷ vida útil (o costo × tasa SAT). Terreno no se deprecia.'),
          r('Utilidades retenidas', 'UR final = UR inicial + Utilidad neta − Dividendos', 'Liga el ER con el balance.'),
          r('Análisis vertical', 'Balance: cuenta ÷ Activo total · ER: cuenta ÷ Ventas', 'Compara empresas de distinto tamaño. "Vean porcentajes, no absolutos".'),
          r('Análisis horizontal', '(Año posterior ÷ Año anterior) − 1', 'Detecta cambios fuertes, pero NO muestra magnitud: revisa el monto.'),
        ], '<p class="fxn">Costo = toca el producto, inventariable · Gasto = ayuda a vender/administrar, no inventariable. Balance = foto (instante, orden de liquidez); ER y flujo = película (periodo). Circulante &lt; 1 año.</p>')}

        ${blk('💧', 'Liquidez', [
          r('Razón corriente', 'Activo corriente ÷ Pasivo corriente', '$ de inversión CP por cada $1 de deuda CP. Alto = más colchón (banco/proveedor felices); muy alto = dinero ocioso (al dueño no le gusta).'),
          r('Prueba ácida', '(Activo corriente − Inventarios) ÷ Pasivo corriente', 'Dinero "puro y duro". Siempre ≤ razón corriente. Ojo naturaleza del inventario; en servicios depura deudores malos.'),
          r('Capital neto de trabajo', 'Activo corriente − Pasivo corriente', '$ para el ciclo operativo ("la sangre"). Alto: le gusta al banco y al gerente, no al dueño. Comparable: CNT ÷ Activo total.'),
        ], '<p class="fxn">RC baja pero ácida alta vs sector ⇒ conclusión irrefutable: tiene proporcionalmente MENOS inventario que el sector.</p>')}

        ${blk('⚙️', 'Eficiencia (administración de activos)', [
          r('Rotación de activos fijos netos (RAFN)', 'Ventas ÷ Activo fijo neto (PPE neto)', 'Veces que los activos productivos "dan vuelta". Alto = activos productivos.'),
          r('Rotación de activos totales', 'Ventas ÷ Activo total', '$ de ventas por $1 invertido. Alto = mejor (pieza de DuPont).'),
          r('Rotación de inventarios (RdI)', 'Costo de ventas ÷ Inventario promedio', 'Inv. promedio = (inicial + final) ÷ 2 ("que su diez no sea un ocho"). Con COSTO, no ventas. Alto = mejor.'),
          r('Periodo promedio de cobro (PPC)', 'Cuentas por cobrar ÷ (Ventas ÷ 365)', 'Días en cobrar. Bajo = mejor. Sector competido ⇒ más días.'),
          r('Periodo promedio de inventarios (PPI)', 'Inventario promedio ÷ (Costo de ventas ÷ 365)', 'Días que el inventario se queda. Bajo = mejor. = 365 ÷ RdI.'),
          r('Periodo promedio de pago (PPdP)', 'Proveedores ÷ (Costo de ventas ÷ 365)', 'Días en pagar. Alto = te financian (idealmente > PPC), sin llegar a no pagar.'),
          r('Ciclo operativo', 'PPC + PPI', 'Materia prima → cobro. Siempre positivo; corto = mejor.'),
          r('Ciclo de efectivo', 'PPC + PPI − PPdP', 'Días que TÚ financias. Puede ser negativo: lo más negativo posible en empresa sana (súper: −70 a −90).'),
        ], '<p class="fxn">Días = 365 ÷ rotación · Rotación = 365 ÷ días · Servilleta: CxC = (Ventas ÷ 365) × días; Inventario = (CV ÷ 365) × días. Usa 360 si el problema lo dice. Ej. ABC: PPC 55 + PPI 182 = 237; − PPdP 45 = 192 días (sector 186 / 121 ⇒ ABC peor).</p>')}

        ${blk('🏦', 'Endeudamiento', [
          r('Nivel de endeudamiento', 'Pasivo total ÷ Activo total', '% de la inversión que financian terceros. Bajo vs sector = espacio para pedir prestado; alto = más riesgo.'),
          r('Cobertura de intereses', 'Utilidad operacional (EBIT) ÷ Gastos financieros (intereses brutos)', 'Veces que la operación paga los intereses. < 1 no alcanza; bancos piden ≈3. Inverso = % del EBIT que se va a intereses.'),
          r('Cobertura del servicio de la deuda', 'EBITDA ÷ (Intereses + Abono a capital)', '"Prueba ácida del endeudamiento". > 1 alcanza; empresa chica que amortiza ⇒ usa ésta.'),
        ])}

        ${blk('💰', 'Rentabilidad', [
          r('Margen neto = Rendimiento neto de ventas (RNdV)', 'Utilidad neta ÷ Ventas', 'Centavos que llegan a los dueños por $1 vendido. ¿Ventas bajas o costos altos?'),
          r('Margen bruto', 'Utilidad bruta ÷ Ventas', 'Estructura de COSTO.'),
          r('Margen operacional', 'Utilidad operacional (EBIT) ÷ Ventas', 'El core business: costo + gasto. El más importante para comparar operación.'),
          r('ROA', 'Utilidad neta ÷ Activo total', 'Rendimiento de la inversión. Dos palancas: + utilidad con la misma inversión o − inversión con la misma utilidad.'),
          r('ROE', 'Utilidad neta ÷ Patrimonio', 'Lo que gana el dueño por $1 que puso. ROE > ROA por apalancamiento.'),
        ])}

        ${blk('🌳', 'DuPont', [
          r('ROE (3 palancas)', '(UN ÷ Ventas) × (Ventas ÷ AT) × (AT ÷ Patrimonio)', 'Margen neto × Rotación de activos totales × Apalancamiento (multiplicador).'),
          r('ROA', 'Margen neto × Rotación de activos totales', 'Izquierda = operación; derecha = inversión.'),
          r('ROE (2 palancas)', 'ROA × (Activo total ÷ Patrimonio)', '¿De qué palanca viene el ROE? Por margen = sano; por apalancamiento = riesgoso (Timberland).'),
        ], `<div class="tree">ROE ─┬─ ROA ─┬─ Margen neto (UN ÷ Ventas)      ← costos, gastos, impuestos
     │       └─ Rotación AT (Ventas ÷ AT)     ← activos CP y LP
     └─ Apalancamiento (AT ÷ Patrimonio)      ← deuda vs capital</div>`)}

        ${blk('⚖️', 'Fuentes y usos · Δ capital de trabajo ★', [], `
          <table class="sg"><thead><tr><th>Cuenta</th><th>Aumenta</th><th>Disminuye</th><th>Atajo (sale con signo)</th></tr></thead><tbody>
            <tr><td><b>Activo</b> (¡incluida la caja!)</td><td>USO (−)</td><td>FUENTE (+)</td><td>anterior − posterior</td></tr>
            <tr><td><b>Pasivo y patrimonio</b></td><td>FUENTE (+)</td><td>USO (−)</td><td>posterior − anterior</td></tr>
          </tbody></table>
          <table>
            ${r('Comprobación', 'Suma de TODOS los renglones (con caja) = 0', 'Sin la caja, la suma = Δ caja. Fuente = entró dinero (+); uso = salió/se invirtió (−).')}
            ${r('Δ Capital de trabajo', 'KT = AC − PC · Δ con atajo de activo: KT anterior − KT posterior', 'KT ↑ = USO (la empresa invirtió en KT); KT ↓ = FUENTE. "La pregunta que no falla".')}
            ${r('Cobros a clientes', 'Ventas + (CxC anterior − CxC posterior)', 'Ventas 1,000,000; CxC 5,000 → 2,000 ⇒ cobró 1,003,000.')}
            ${r('Perspectivas', 'Lado activo = accionista · Lado pasivo/patrimonio = gerencia', '')}
          </table>
          <p class="fxn">No te guíes por el NOMBRE del pasivo: si sube, alguien te financia; si baja, pagaste. Caja ↑ = uso (contraintuitivo). Proveedores ↓ = "pagué más".</p>`)}

        ${blk('🚰', 'Flujo de efectivo (contable)', [
          r('Tres renglones', 'Operación + Inversión + Financiamiento = Δ Caja', 'Caja inicial + Δ caja = Caja final (debe coincidir con el balance).'),
          r('Operación', 'Lo más alto y creciente posible', 'Negativo sólo es normal en empresas nuevas / de crecimiento.'),
          r('Indicador de Buffett', 'Flujo de operación + Flujo de inversión', '> 0: la operación cubre la inversión y sobra para bancos y dueños.'),
          r('Método indirecto', 'Utilidad + D&A ± Δ capital de trabajo (cuentas SIN interés) = Operación', 'Para empresas que cotizan. Deuda con interés y leasing van a financiamiento.'),
          r('Método directo', 'Cobros a clientes − Pagos a proveedores y empleados − Intereses − Impuestos', 'Para PyMEs. Mismo resultado de operación; inversión y financiamiento idénticos.'),
          r('CapEx (sin costo histórico)', 'Activo fijo neto posterior − anterior + Depreciación del año', 'Con signos F&U: (anterior − posterior) − depreciación. Sólo al CapEx se le regresa la D&A.'),
          r('Dividendo implícito', 'Δ Patrimonio − Utilidad neta', 'Negativo = salió dinero a los dueños (dividendo financiero, sin importar el instrumento).'),
        ], `<table class="sg"><thead><tr><th>Perfil</th><th>Operación</th><th>Inversión</th><th>Financiamiento</th></tr></thead><tbody>
            <tr><td><b>Valor</b></td><td>+ grande</td><td>− disciplinada</td><td>− grande (div. + recompras)</td></tr>
            <tr><td><b>Crecimiento</b></td><td>−</td><td>− grande</td><td>+ (capital externo)</td></tr>
            <tr><td><b>Ingreso</b></td><td>+ estable</td><td>− poca</td><td>− (dividendos)</td></tr>
          </tbody></table>`)}

        ${blk('🧮', 'Ecuación fundamental (FCL) · "pequeña relación"', [
          r('Flujo de caja libre de la firma', 'FCL = EBITDA ± Δ KT (después de impuestos) ± CapEx', 'Lo que la firma produce en caja por su negocio. Negativo = déficit (no cubre KT ni CapEx).'),
          r('Cierre', 'FCL + Flujo no operativo = 0', 'No operativo = bancos (deuda + intereses) + accionistas (dividendos) + otros.'),
          r('CapEx ÷ Activos', '−CapEx ÷ Activo total (signo invertido)', 'Cuánto reinvierte. Negativo = está desinvirtiendo.'),
          r('FCL ÷ Activos', 'FCL ÷ Activo total', '"El más importante" para comparar en el sector: positivo y alto.'),
          r('Dividendos ÷ Activos', '−Flujo al accionista ÷ Activo total', 'Alto le gusta al accionista.'),
        ], '<p class="fxn">⚠ Alerta: FCL negativo + pago de dividendos = pide prestado para pagar a accionistas. Regla: crecimiento % de ventas &gt; crecimiento % del CapEx (salvo expansión). Empresa madura: CapEx ≈ depreciación.</p>')}

        <div class="blk"><h4>🎓 Tips del profe en 10 líneas</h4><ol>
          <li><b>Escribe la lógica</b> del cálculo: "no me importa si los números no están bien".</li>
          <li><b>Compara siempre</b> (año anterior, sector, competidor): las razones sólo sirven comparando.</li>
          <li>Usa <b>las fórmulas tal como las dio</b> el profe (inventario promedio, intereses brutos).</li>
          <li>RdI y PPI con <b>costo de ventas</b>; PPC con <b>ventas</b>; cobertura con <b>EBIT</b>.</li>
          <li>¿Alto es bueno? <b>Depende de quién mira</b>: banco, dueño o gerente.</li>
          <li>Activo ↑ = uso (aun la caja); pasivo ↑ = fuente. <b>No te guíes por el nombre</b>.</li>
          <li>Flujo: <b>3 renglones</b>; operación positiva y creciendo; Op + Inv &gt; 0.</li>
          <li>Busca <b>conclusiones irrefutables</b> y luego pregunta "¿por qué?" (análisis integral).</li>
          <li>Horizontal: mira la <b>magnitud</b>. Vertical: ER ÷ ventas, balance ÷ activo.</li>
          <li><b>Tiempo</b>: 40 + 40 + 20 pts en 70 min; no te quedes en la primera.</li>
        </ol></div>

        <div class="blk"><h4>✍️ Plantilla de respuesta</h4><ol>
          <li><b>Fórmula con datos:</b> "Razón corriente = AC ÷ PC = 3,000 ÷ 1,000"</li>
          <li><b>Resultado con unidad:</b> "= 3.0x" (x, %, días, $)</li>
          <li><b>Comparación:</b> "vs sector 4.0x → por debajo / vs año anterior ↑"</li>
          <li><b>Qué significa:</b> "por cada $1 de deuda CP tiene $3 de inversión CP"</li>
          <li><b>Por qué (causa):</b> liga con otra razón ("la ácida es mayor que el sector ⇒ menos inventario")</li>
          <li><b>Para quién / qué haría:</b> banco, dueño o gerente + recomendación</li>
        </ol>
        <p class="abbr">AC/PC = activo/pasivo corriente · AT = activo total · UN = utilidad neta · CV = costo de ventas · CxC = cuentas por cobrar · KT = capital de trabajo · D&A = depreciación y amortización · UAI = utilidad antes de impuestos.</p></div>

        </div>
      </div>`;
      root.querySelector('#bPrint').addEventListener('click', () => window.print());
    },
  });
})();
