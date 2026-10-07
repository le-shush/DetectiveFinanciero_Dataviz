// Sección 11 — Práctica tipo examen: simulacro de 3 preguntas abiertas (40/40/20) con cronómetro, rúbrica y solución,
// más un set de ejercicios rápidos con números al azar ("quiz algorítmico") que se revisan con tolerancia de ±2%.
(function () {
  const N = (v) => E.fmt.n(v, 0), N1 = (v) => E.fmt.n(v, 1), X = (v) => E.fmt.x(v, 2), P = (v) => E.fmt.pct(v, 1), D = (v) => E.fmt.d(v, 1), S = (v) => E.fmt.sgn(v, 0);

  // ================================================================ P1 — Tiendas Del Valle (retailer ficticio)
  // millones de pesos. inv0 = inventario del año anterior (para inventario promedio)
  const P1 = {
    y24: { v: 1000, cv: 700, uo: 80, int: 20, un: 40, caja: 60, cxc: 80, inv: 140, inv0: 120, ppe: 520, prov: 110, dcp: 70, dlp: 220, pat: 400 },
    y25: { v: 1100, cv: 770, uo: 77, int: 35, un: 28, caja: 30, cxc: 120, inv: 200, inv0: 140, ppe: 550, prov: 115, dcp: 165, dlp: 230, pat: 390 },
    sec: { rc: 1.30, pa: 0.70, rdi: 5.2, ppc: 30, ppi: 70, ppp: 60, co: 100, ce: 40, rafn: 2.1, nde: 0.50, cob: 4.5 },
  };
  const r1 = (d) => {
    const ac = d.caja + d.cxc + d.inv, at = ac + d.ppe, pc = d.prov + d.dcp, p = pc + d.dlp, ip = (d.inv + d.inv0) / 2;
    const o = { ac, at, pc, p, ip, rc: ac / pc, pa: (ac - d.inv) / pc, cnt: ac - pc, rdi: d.cv / ip, ppi: ip / (d.cv / 365), ppc: d.cxc / (d.v / 365), ppp: d.prov / (d.cv / 365),
      rafn: d.v / d.ppe, nde: p / at, cob: d.uo / d.int, mn: d.un / d.v, roe: d.un / d.pat };
    o.co = o.ppc + o.ppi; o.ce = o.co - o.ppp; return o;
  };

  // ================================================================ P2 — Cementos del Bajío (ficticio)
  const P2 = {
    A: { caja: 50, cxc: 100, inv: 150, ppe: 700, prov: 120, dcp: 80, dlp: 300, cs: 200, ur: 300 },   // 2024
    B: { caja: 70, cxc: 130, inv: 170, ppe: 780, prov: 140, dcp: 60, dlp: 400, cs: 200, ur: 350 },   // 2025
    v24: 1000, v25: 1150, un: 90, dep: 60,
  };
  const ACT = [['caja', 'Caja'], ['cxc', 'Cuentas por cobrar'], ['inv', 'Inventarios'], ['ppe', 'Activo fijo neto (PP&E)']];
  const PAS = [['prov', 'Proveedores'], ['dcp', 'Deuda bancaria CP'], ['dlp', 'Deuda bancaria LP'], ['cs', 'Capital social'], ['ur', 'Utilidades retenidas']];
  const r2 = () => {
    const { A, B, un, dep } = P2;
    const sumA = (x) => x.caja + x.cxc + x.inv + x.ppe, sumP = (x) => x.prov + x.dcp + x.dlp + x.cs + x.ur;
    const fa = ACT.map(([k, n]) => [n, A[k], B[k], A[k] - B[k]]), fp = PAS.map(([k, n]) => [n, A[k], B[k], B[k] - A[k]]);
    const kt = (x) => x.caja + x.cxc + x.inv - x.prov - x.dcp, kto = (x) => x.cxc + x.inv - x.prov;
    const capex = (B.ppe - A.ppe) + dep, div = ((B.cs + B.ur) - (A.cs + A.ur)) - un;
    const dCxC = B.cxc - A.cxc, dInv = B.inv - A.inv, dProv = B.prov - A.prov;
    const cfo = un + dep - dCxC - dInv + dProv, cfi = -capex, cff = (B.dcp - A.dcp) + (B.dlp - A.dlp) + div;
    return { ta: sumA(A), tb: sumA(B), pa: sumP(A), pb: sumP(B), fa, fp, sum: [...fa, ...fp].reduce((s, x) => s + x[3], 0),
      kt0: kt(A), kt1: kt(B), kto0: kto(A), kto1: kto(B), capex, div, dCxC, dInv, dProv, cfo, cfi, cff, tot: cfo + cfi + cff, dcaja: B.caja - A.caja, buf: cfo + cfi };
  };

  // ================================================================ P3 — DuPont de dos farmacias (ficticias)
  const P3 = { A: { n: 'Farmacias Aurora', v: 1500, un: 120, at: 1000, pat: 500 }, B: { n: 'Farmacias Boreal', v: 1800, un: 108, at: 1200, pat: 300 } };
  const r3 = (d) => ({ mn: d.un / d.v, rot: d.v / d.at, apal: d.at / d.pat, roa: d.un / d.at, roe: d.un / d.pat, nde: 1 - d.pat / d.at });

  // ================================================================ utilidades: cronómetro y respuestas guardadas
  const KEY = 'estudio.practica.';
  const lsGet = (k) => { try { return localStorage.getItem(KEY + k) || ''; } catch (e) { return ''; } };
  const lsSet = (k, v) => { try { localStorage.setItem(KEY + k, v); return true; } catch (e) { return false; } };

  const timerHTML = (min) => `<div class="sx-pr-tm" data-min="${min}"><button class="btn pri" type="button" data-a="go">▶ Iniciar ${min} min</button><span class="clk">${min}:00</span><button class="btn sm" type="button" data-a="rs">↺</button><span class="msg small muted"></span></div>`;
  const wireTimer = (el) => {
    const min = +el.dataset.min; let left = min * 60, run = false, id = null;
    const go = el.querySelector('[data-a="go"]'), clk = el.querySelector('.clk'), msg = el.querySelector('.msg');
    const show = () => {
      const m = Math.floor(left / 60), s = left % 60; clk.textContent = `${m}:${String(s).padStart(2, '0')}`;
      el.classList.toggle('low', left <= 120 && left > 0); el.classList.toggle('end', left === 0);
      msg.textContent = left === 0 ? '⏰ ¡Tiempo! Escribe tu conclusión y pasa a la siguiente.' : left <= 120 ? 'Quedan 2 minutos: cierra con tu interpretación.' : '';
    };
    const stop = () => { clearInterval(id); id = null; run = false; go.textContent = left === 0 ? '✓ Terminado' : `▶ Seguir`; };
    go.addEventListener('click', () => {
      if (left === 0) return;
      if (run) { stop(); return; }
      run = true; go.textContent = '⏸ Pausar';
      id = setInterval(() => { if (!el.isConnected) { clearInterval(id); return; } left = Math.max(0, left - 1); show(); if (!left) stop(); }, 1000);
    });
    el.querySelector('[data-a="rs"]').addEventListener('click', () => { clearInterval(id); id = null; run = false; left = min * 60; go.textContent = `▶ Iniciar ${min} min`; show(); });
    show();
  };
  const ansHTML = (k, ph) => `<div class="sx-pr-ans"><label class="small muted" for="ta-${k}">✍️ Tu respuesta (se guarda sola en este navegador)</label><textarea id="ta-${k}" data-k="${k}" rows="9" placeholder="${ph}"></textarea><div class="small muted"><span class="sv"></span> <button class="btn sm" type="button" data-clr="${k}">Borrar</button></div></div>`;
  const wireAns = (root) => {
    root.querySelectorAll('.sx-pr-ans textarea').forEach((ta) => {
      const sv = ta.parentElement.querySelector('.sv');
      ta.value = lsGet(ta.dataset.k);
      ta.addEventListener('input', () => { sv.textContent = lsSet(ta.dataset.k, ta.value) ? '✓ guardado' : '(no se pudo guardar: copia tu texto)'; });
      ta.parentElement.querySelector('[data-clr]').addEventListener('click', () => { if (ta.value && !confirm('¿Borrar tu respuesta?')) return; ta.value = ''; lsSet(ta.dataset.k, ''); sv.textContent = ''; });
    });
  };

  // ================================================================ quiz algorítmico (números al azar)
  const R = (a, b, step = 1) => Math.round((a + Math.random() * (b - a)) / step) * step;
  const rd = (v, s) => Math.round(v / s) * s;
  // Cada generador devuelve {t, q (html), f:[{l, a, k:'x'|'pct'|'d'|'$'|'ch', o?}], s (html solución)}
  const GEN = [
    function liquidez() {
      const caja = R(20, 150, 5), cxc = R(40, 250, 10), inv = R(40, 300, 10), ac = caja + cxc + inv;
      const pc = Math.max(50, R(ac * 0.55, ac * 1.4, 10));
      const rc = ac / pc, pa = (ac - inv) / pc, cnt = ac - pc;
      return { t: '1 · Liquidez: razón corriente, prueba ácida y capital neto de trabajo',
        q: `<p>Balance al cierre (millones): caja <b>${N(caja)}</b>, cuentas por cobrar <b>${N(cxc)}</b>, inventarios <b>${N(inv)}</b>; pasivo corriente <b>${N(pc)}</b>.</p>`,
        f: [{ l: 'Razón corriente (x)', a: rc, k: 'x' }, { l: 'Prueba ácida (x)', a: pa, k: 'x' }, { l: 'Capital neto de trabajo ($)', a: cnt, k: '$' }],
        s: `<ol><li>Activo corriente = ${N(caja)} + ${N(cxc)} + ${N(inv)} = <b>${N(ac)}</b>.</li>
          <li>Razón corriente = AC / PC = ${N(ac)} / ${N(pc)} = <b>${X(rc)}</b> → por cada $1 que debe a corto plazo tiene $${E.fmt.n(rc, 2)} de activo corriente.</li>
          <li>Prueba ácida = (AC − Inventarios) / PC = (${N(ac)} − ${N(inv)}) / ${N(pc)} = ${N(ac - inv)} / ${N(pc)} = <b>${X(pa)}</b> (✓ menor que la razón corriente).</li>
          <li>Capital neto de trabajo = AC − PC = ${N(ac)} − ${N(pc)} = <b>${E.fmt.$(cnt)}</b> ${cnt < 0 ? '(negativo: opera con dinero de proveedores o bancos de corto plazo)' : '(positivo: lo financian los dueños)'}.</li></ol>` };
    },
    function dias() {
      const v = R(1200, 4000, 100), cv = rd(v * (0.55 + Math.random() * 0.25), 10);
      const cxc = Math.max(10, rd(v * R(20, 75, 5) / 365, 5)), inv0 = Math.max(20, rd(cv * R(30, 110, 5) / 365, 5));
      const inv1 = Math.max(20, inv0 + R(-40, 60, 5)), prov = Math.max(10, rd(cv * R(25, 100, 5) / 365, 5));
      const ip = (inv0 + inv1) / 2, ppc = cxc / (v / 365), ppi = ip / (cv / 365), ppp = prov / (cv / 365), ce = ppc + ppi - ppp;
      return { t: '2 · Eficiencia: días de cobro, inventario, pago y ciclo de efectivo',
        q: `<p>Ventas <b>${N(v)}</b>, costo de ventas <b>${N(cv)}</b>. Cuentas por cobrar al cierre <b>${N(cxc)}</b>; inventario inicial <b>${N(inv0)}</b> e inventario final <b>${N(inv1)}</b>; proveedores <b>${N(prov)}</b>. Usa 365 días.</p>`,
        f: [{ l: 'Periodo promedio de cobro (días)', a: ppc, k: 'd' }, { l: 'Periodo promedio de inventario (días)', a: ppi, k: 'd' }, { l: 'Periodo promedio de pago (días)', a: ppp, k: 'd' }, { l: 'Ciclo de efectivo (días)', a: ce, k: 'd' }],
        s: `<ol><li>Ventas diarias = ${N(v)} / 365 = ${E.fmt.n(v / 365, 2)}; costo de ventas diario = ${N(cv)} / 365 = ${E.fmt.n(cv / 365, 2)}.</li>
          <li>PPC = CxC / ventas diarias = ${N(cxc)} / ${E.fmt.n(v / 365, 2)} = <b>${D(ppc)}</b>.</li>
          <li>Inventario <b>promedio</b> = (${N(inv0)} + ${N(inv1)}) / 2 = ${N1(ip)} → PPI = ${N1(ip)} / ${E.fmt.n(cv / 365, 2)} = <b>${D(ppi)}</b> (rotación = 365 / ${N1(ppi)} = ${X(365 / ppi)}).</li>
          <li>PPdP = proveedores / <b>costo</b> diario = ${N(prov)} / ${E.fmt.n(cv / 365, 2)} = <b>${D(ppp)}</b>.</li>
          <li>Ciclo operativo = PPC + PPI = ${D(ppc + ppi)}; ciclo de efectivo = ${N1(ppc + ppi)} − ${N1(ppp)} = <b>${D(ce)}</b> ${ce < 0 ? '→ negativo: los proveedores le financian toda la operación (bueno si es sana).' : '→ son los días que la empresa financia con su propio dinero.'}</li></ol>` };
    },
    function dupont() {
      const v = R(1000, 8000, 100), un = Math.round(v * R(2, 15, 0.5) / 100), at = rd(v / R(0.5, 2.5, 0.1), 10), pat = rd(at / R(1.2, 4, 0.1), 10);
      const mn = un / v, rot = v / at, apal = at / pat, roe = un / pat;
      const big = [['margen', mn / 0.08], ['rotación', rot / 1.2], ['apalancamiento', apal / 2]].sort((a, b) => b[1] - a[1])[0][0];
      return { t: '3 · ROE con DuPont',
        q: `<p>Ventas <b>${N(v)}</b>, utilidad neta <b>${N(un)}</b>, activo total <b>${N(at)}</b>, patrimonio <b>${N(pat)}</b>. Descompón el ROE.</p>`,
        f: [{ l: 'Margen neto (%)', a: mn * 100, k: 'pct' }, { l: 'Rotación de activos totales (x)', a: rot, k: 'x' }, { l: 'Apalancamiento patrimonial (x)', a: apal, k: 'x' }, { l: 'ROE (%)', a: roe * 100, k: 'pct' }],
        s: `<ol><li>Margen neto = UN / Ventas = ${N(un)} / ${N(v)} = <b>${P(mn)}</b>.</li>
          <li>Rotación de activos = Ventas / Activo total = ${N(v)} / ${N(at)} = <b>${X(rot)}</b>.</li>
          <li>Apalancamiento = Activo total / Patrimonio = ${N(at)} / ${N(pat)} = <b>${X(apal)}</b>.</li>
          <li>ROE = ${P(mn)} × ${E.fmt.n(rot, 2)} × ${E.fmt.n(apal, 2)} = <b>${P(roe)}</b>. Verificación directa: UN / Patrimonio = ${N(un)} / ${N(pat)} = ${P(roe)} ✓. (ROA = margen × rotación = ${P(mn * rot)}.)</li>
          <li class="muted">Contra una referencia "típica" (margen 8%, rotación 1.2x, apalancamiento 2x), la palanca que más destaca aquí es el <b>${big}</b>.</li></ol>` };
    },
    function deltaKT() {
      let ac0, pc0, ac1, pc1, d;
      do { ac0 = R(200, 800, 10); pc0 = R(100, 600, 10); ac1 = ac0 + R(-80, 120, 10); pc1 = pc0 + R(-60, 100, 10); d = (ac1 - pc1) - (ac0 - pc0); } while (Math.abs(d) < 10);
      const kt0 = ac0 - pc0, kt1 = ac1 - pc1, uso = d > 0;
      return { t: '4 · ★ Cambio en capital de trabajo (la pregunta que no falla)',
        q: `<p>2024: activo corriente <b>${N(ac0)}</b>, pasivo corriente <b>${N(pc0)}</b>. 2025: activo corriente <b>${N(ac1)}</b>, pasivo corriente <b>${N(pc1)}</b>.</p>`,
        f: [{ l: 'Capital de trabajo 2025 ($)', a: kt1, k: '$' }, { l: 'Cambio en KT = KT 2025 − KT 2024 ($)', a: d, k: '$' }, { l: '¿Es fuente o uso de efectivo?', a: uso ? 'uso' : 'fuente', k: 'ch', o: ['fuente', 'uso'] }],
        s: `<ol><li>KT 2024 = ${N(ac0)} − ${N(pc0)} = ${E.fmt.$(kt0)}; KT 2025 = ${N(ac1)} − ${N(pc1)} = <b>${E.fmt.$(kt1)}</b>.</li>
          <li>Cambio = ${E.fmt.$(kt1)} − ${E.fmt.$(kt0)} = <b>${S(d)}</b> → el capital de trabajo <b>${uso ? 'aumentó' : 'disminuyó'}</b>.</li>
          <li>Regla del profe: <q>si es un uso, la inversión en capital de trabajo está aumentando</q>. Aquí es <b>${uso ? 'USO' : 'FUENTE'}</b>: con el atajo de activo (anterior − actual) queda ${E.fmt.$(kt0)} − ${E.fmt.$(kt1)} = <b>${S(-d)}</b> ${uso ? '(negativo = la empresa invirtió caja en capital de trabajo)' : '(positivo = liberó caja)'}.</li></ol>` };
    },
    function capexDiv() {
      const ppe0 = R(400, 1500, 10), dep = R(30, 150, 5), capex = R(dep * 0.6, dep * 2.5, 5), ppe1 = ppe0 + capex - dep;
      const pat0 = R(300, 1500, 10), un = R(40, 250, 5), div = R(0, un, 5), pat1 = pat0 + un - div;
      return { t: '5 · Los dos "trucos": CapEx y dividendo implícito',
        q: `<p>Activo fijo neto: 2024 <b>${N(ppe0)}</b>, 2025 <b>${N(ppe1)}</b>; depreciación del año <b>${N(dep)}</b>. Patrimonio: 2024 <b>${N(pat0)}</b>, 2025 <b>${N(pat1)}</b>; utilidad neta 2025 <b>${N(un)}</b> (no hubo aportaciones de capital).</p>`,
        f: [{ l: 'CapEx del año ($, positivo)', a: capex, k: '$' }, { l: 'Dividendo pagado ($, positivo)', a: div, k: '$', abs: true }],
        s: `<ol><li>CapEx = Δ activo fijo neto + depreciación = (${N(ppe1)} − ${N(ppe0)}) + ${N(dep)} = ${S(ppe1 - ppe0)} + ${N(dep)} = <b>${E.fmt.$(capex)}</b>. (La depreciación bajó el activo neto sin salir caja: hay que devolverla para llegar a las facturas reales.) ${capex > dep ? 'CapEx > depreciación → está creciendo.' : 'CapEx ≤ depreciación → invierte al ritmo que se desgasta (empresa madura).'}</li>
          <li>Dividendo implícito = Δ patrimonio − utilidad neta = (${N(pat1)} − ${N(pat0)}) − ${N(un)} = ${S(pat1 - pat0)} − ${N(un)} = <b>${S(-div)}</b> → ${div ? `salieron ${E.fmt.$(div)} a los dueños (${P(div / un)} de la utilidad).` : 'no repartió nada: retuvo toda la utilidad.'}</li></ol>` };
    },
  ];
  const parse = (s) => {
    s = String(s).trim().replace(/[\s%$x]|días|dias/gi, '').replace(/[−–]/g, '-');
    if (!s) return NaN;
    if (s.includes('.') && s.includes(',')) s = s.replace(/,/g, '');
    else if (s.includes(',')) s = /^-?\d{1,3}(,\d{3})+$/.test(s) ? s.replace(/,/g, '') : s.replace(',', '.');
    return parseFloat(s);
  };
  const MINABS = { x: 0.01, pct: 0.1, d: 1, $: 1 };
  const check = (f, raw) => {
    if (f.k === 'ch') return raw === f.a;
    let v = parse(raw); if (!isFinite(v)) return false;
    const tol = Math.max(Math.abs(f.a) * 0.02, MINABS[f.k] || 0.01);
    if (f.abs) v = Math.abs(v);
    if (Math.abs(v - f.a) <= tol) return true;
    return f.k === 'pct' && Math.abs(v * 100 - f.a) <= tol; // escribió 0.065 en vez de 6.5
  };
  const fmtAns = (f) => (f.k === 'ch' ? f.a : f.k === 'pct' ? E.fmt.n(f.a, 2) + '%' : f.k === 'x' ? X(f.a) : f.k === 'd' ? D(f.a) : E.fmt.$(f.a));

  const renderQuiz = (box) => {
    box.innerHTML = GEN.map((g, gi) => {
      const ex = g(); box['ex' + gi] = ex;
      return `<div class="card2 sx-pr-q" data-i="${gi}"><h4>${ex.t}</h4>${ex.q}
        <div class="sx-pr-fields">${ex.f.map((f, fi) => `<label><span>${f.l}</span>${f.k === 'ch'
          ? `<select data-f="${fi}"><option value="">— elige —</option>${f.o.map((o) => `<option value="${o}">${o}</option>`).join('')}</select>`
          : `<input type="text" inputmode="decimal" autocomplete="off" data-f="${fi}" placeholder="${f.k === 'pct' ? 'p.ej. 12.5' : f.k === 'x' ? 'p.ej. 1.35' : f.k === 'd' ? 'p.ej. 45.2' : 'p.ej. 120'}">`}<em class="fb"></em></label>`).join('')}</div>
        <div class="btnrow"><button class="btn pri sm" type="button" data-chk>Revisar</button><span class="small sc"></span></div>
        ${E.reveal('Ver solución paso a paso', ex.s)}</div>`;
    }).join('');
    box.querySelectorAll('.sx-pr-q').forEach((card) => {
      const ex = box['ex' + card.dataset.i];
      card.querySelector('[data-chk]').addEventListener('click', () => {
        let ok = 0;
        ex.f.forEach((f, fi) => {
          const inp = card.querySelector(`[data-f="${fi}"]`), fb = inp.parentElement.querySelector('.fb');
          const good = check(f, inp.value); ok += good ? 1 : 0;
          fb.className = 'fb ' + (good ? 'good' : 'bad');
          fb.textContent = good ? '✓ correcto' : inp.value.trim() ? `✗ era ${fmtAns(f)}` : `✗ falta · era ${fmtAns(f)}`;
        });
        card.querySelector('.sc').textContent = `${ok} de ${ex.f.length} correctas${ok === ex.f.length ? ' 🎉' : ''}`;
        card.querySelector('details').open = true;
      });
    });
  };

  // ================================================================ render
  E.section({
    id: 'practica', n: 11, group: 'examen', icon: '✍️', short: 'Práctica tipo examen', exam: 'in',
    title: 'Práctica tipo examen: simulacro de 3 preguntas y ejercicios rápidos',
    lead: 'Un examen simulado con el estilo del profe (abierto, 40/40/20, datos incluidos, cálculos de calculadora) con rúbrica, solución completa y respuesta modelo. Abajo, ejercicios con números nuevos cada vez.',
    render(root) {
      const a = r1(P1.y24), b = r1(P1.y25), s = P1.sec, t2 = r2();
      const A3 = r3(P3.A), B3 = r3(P3.B);
      const y24 = P1.y24, y25 = P1.y25;
      // lectura automática: ▲/▼ vs 2024 y vs sector
      const cmp = (v, base, better) => (Math.abs(v - base) < 1e-9 ? '=' : (v > base) === (better === 'up') ? '<span class="good">▲ mejor</span>' : '<span class="bad">▼ peor</span>');

      root.innerHTML = `
      <style>
        .sx-pr .sx-pr-tm{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:10px 0}
        .sx-pr .sx-pr-tm .clk{font-variant-numeric:tabular-nums;font-size:22px;font-weight:700;min-width:70px}
        .sx-pr .sx-pr-tm.low .clk{color:var(--bad)} .sx-pr .sx-pr-tm.end .clk{color:var(--bad)}
        .sx-pr .sx-pr-ans textarea{width:100%;box-sizing:border-box;font:inherit;font-size:15px;line-height:1.5;border:1px solid var(--line);border-radius:10px;padding:10px 12px;background:var(--surface);color:var(--ink);resize:vertical;margin:4px 0}
        .sx-pr .preg ol{margin:6px 0}
        .sx-pr .sx-pr-q{margin:14px 0;max-width:var(--read)}
        .sx-pr .sx-pr-q h4{margin:0 0 6px;font-size:16px}
        .sx-pr .sx-pr-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px 16px;margin:8px 0}
        @media(max-width:720px){.sx-pr .sx-pr-fields{grid-template-columns:1fr}}
        .sx-pr .sx-pr-fields label{display:flex;flex-direction:column;gap:3px;font-size:13.5px;color:var(--ink2)}
        .sx-pr .sx-pr-fields input,.sx-pr .sx-pr-fields select{font:inherit;font-size:15px;padding:6px 10px;border:1px solid var(--line);border-radius:8px;background:var(--surface);color:var(--ink);max-width:220px}
        .sx-pr .fb{font-style:normal;font-size:13px;min-height:1em}.sx-pr .fb.good{color:var(--good)}.sx-pr .fb.bad{color:var(--bad)}
        .sx-pr .rub td{white-space:normal;text-align:left;vertical-align:top}
        .sx-pr .model{background:var(--surface);border:1px solid var(--line);border-radius:10px;padding:10px 14px;font-size:14.5px}
        .sx-pr .model p{margin:6px 0}
      </style>
      <div class="sx-pr">
      <h2>Cómo usar este simulacro</h2>
      <ol class="prose">
        <li>Ten a la mano <b>sólo</b> lo que llevarás al examen: tu formulario impreso, calculadora y papel.</li>
        <li>Inicia el cronómetro de cada pregunta (25 / 25 / 13 min = 63 min, con 7 de colchón para revisar, como en los 70 del examen real).</li>
        <li>Escribe tu respuesta como la escribirías en Canvas: <b>fórmula con datos → resultado → comparación → interpretación → causa → recomendación</b>.</li>
        <li>Al terminar, abre la <b>rúbrica</b> y califícate; luego compara con la <b>solución</b> y la <b>respuesta modelo</b>.</li>
      </ol>
      ${E.tip('<q>escriban como hicieron la lógica del cálculo</q> — en las soluciones verás siempre la fórmula con los datos antes del resultado.', 'Clase 5-oct')}

      <!-- ================= P1 ================= -->
      ${E.concept({ id: 'p1', title: 'Pregunta 1 (40 puntos) · Tiendas Del Valle: liquidez, eficiencia y endeudamiento', badge: 'in', html: `
        <div class="preg">
        <p><b>Tiendas Del Valle</b> es una cadena (ficticia) de tiendas de abarrotes y hogar. Cifras en <b>millones de pesos</b>. El inventario al cierre de 2023 era <b>${N(y24.inv0)}</b>.</p>
        <div class="g2">
          <div><h4>Estado de resultados</h4>${E.table([
            ['Ventas', y24.v, y25.v], ['Costo de ventas', y24.cv, y25.cv], ['Utilidad operacional', y24.uo, y25.uo], ['Gasto por intereses', y24.int, y25.int], ['Utilidad neta', y24.un, y25.un, { cls: 'tot' }],
          ], { head: ['', '2024', '2025'], fmt: [null, N, N] })}
          <h4>Promedios del sector (2025)</h4>${E.table([
            ['Razón corriente', X(s.rc)], ['Prueba ácida', X(s.pa)], ['Rotación de inventarios', X(s.rdi)], ['Periodo promedio de cobro', D(s.ppc)], ['Periodo promedio de inventario', D(s.ppi)],
            ['Periodo promedio de pago', D(s.ppp)], ['Ciclo operativo / de efectivo', `${N(s.co)} / ${N(s.ce)} días`], ['Rotación de activos fijos netos', X(s.rafn)], ['Nivel de endeudamiento', P(s.nde)], ['Cobertura de intereses', X(s.cob)],
          ], { head: ['Indicador', 'Sector'] })}</div>
          <div><h4>Balance general (31-dic)</h4>${E.table([
            ['Caja', y24.caja, y25.caja], ['Cuentas por cobrar', y24.cxc, y25.cxc], ['Inventarios', y24.inv, y25.inv], ['Activo corriente', a.ac, b.ac, { cls: 'sub' }], ['Activo fijo neto', y24.ppe, y25.ppe], ['Activo total', a.at, b.at, { cls: 'tot' }],
            ['Proveedores', y24.prov, y25.prov], ['Deuda bancaria CP', y24.dcp, y25.dcp], ['Pasivo corriente', a.pc, b.pc, { cls: 'sub' }], ['Deuda bancaria LP', y24.dlp, y25.dlp], ['Pasivo total', a.p, b.p, { cls: 'sub' }], ['Patrimonio', y24.pat, y25.pat], ['Pasivo + patrimonio', a.p + y24.pat, b.p + y25.pat, { cls: 'tot' }],
          ], { head: ['', '2024', '2025'], fmt: [null, N, N] })}</div>
        </div>
        <p><b>Se pide:</b></p>
        <ol type="a">
          <li>Calcula para 2024 y 2025 la <b>razón corriente</b>, la <b>prueba ácida</b> y el <b>capital neto de trabajo</b>.</li>
          <li>Calcula la <b>rotación de inventarios</b>, el <b>periodo promedio de cobro</b>, <b>de inventario</b> y <b>de pago</b>, y los <b>ciclos operativo y de efectivo</b>.</li>
          <li>Calcula el <b>nivel de endeudamiento</b> y la <b>cobertura de intereses</b>.</li>
          <li>Compara contra el año anterior y contra el sector. ¿Qué le pasó a la empresa? Si fueras el banco, ¿le prestarías más a corto plazo? ¿Qué le recomiendas?</li>
        </ol>
        </div>
        ${timerHTML(25)}
        ${ansHTML('p1', 'RC 2024 = AC / PC = … ; RC 2025 = … ; vs sector … ; interpretación …')}
        ${E.reveal('📋 Rúbrica: ¿qué te da cada nivel?', `<div class="tblwrap"><table class="tbl rub"><thead><tr><th>Nivel</th><th style="text-align:left">Qué tiene la respuesta</th></tr></thead><tbody>
          <tr><td><b>Básico</b></td><td>Fórmulas escritas y bien calculadas RC, prueba ácida, CNT y nivel de endeudamiento en ambos años.</td></tr>
          <tr><td><b>Intermedio (≈80)</b></td><td>+ eficiencia completa usando <b>inventario promedio</b> y <b>costo de ventas</b> (no ventas) en PPI y PPdP; ciclos; cobertura con gasto por intereses; cada indicador comparado con 2024 <b>y</b> con el sector (mejor/peor).</td></tr>
          <tr><td><b>Avanzado (100)</b></td><td>+ <b>conecta</b> los indicadores: cuentas por cobrar (+50%) e inventarios (+43%) crecieron mucho más que las ventas (+10%) → se comieron la caja (60 → 30) → la empresa se financió con deuda bancaria de corto plazo (70 → 165) → cae la liquidez y la cobertura. Saca la conclusión irrefutable (la prueba ácida cae más que la RC: el activo corriente se infló con inventario) y da recomendaciones concretas.</td></tr>
          <tr><td><b>50% cualitativo</b></td><td>Diagnóstico claro en prosa; distingue perspectivas (banco vs dueño); explica la <b>causa</b>; no analiza "pedacito por pedacito"; postura explícita sobre el crédito; recomendaciones accionables.</td></tr>
        </tbody></table></div>`)}
        ${E.reveal('🧮 Solución paso a paso (todos los cálculos)', `
          <p class="small muted">Inventario promedio 2024 = (${N(y24.inv0)} + ${N(y24.inv)}) / 2 = ${N(a.ip)}; 2025 = (${N(y25.inv0)} + ${N(y25.inv)}) / 2 = ${N(b.ip)}. Ventas diarias 2025 = ${N(y25.v)}/365 = ${E.fmt.n(y25.v / 365, 2)}; costo diario 2025 = ${N(y25.cv)}/365 = ${E.fmt.n(y25.cv / 365, 2)}.</p>
          <div class="tblwrap"><table class="tbl"><thead><tr><th>Indicador</th><th style="text-align:left">Fórmula con datos (2025)</th><th>2024</th><th>2025</th><th>Sector</th><th>vs 2024</th><th>vs sector</th></tr></thead><tbody>
          ${[
            ['Razón corriente', `AC / PC = ${N(b.ac)} / ${N(b.pc)}`, X(a.rc), X(b.rc), X(s.rc), cmp(b.rc, a.rc, 'up'), cmp(b.rc, s.rc, 'up')],
            ['Prueba ácida', `(AC − Inv) / PC = (${N(b.ac)} − ${N(y25.inv)}) / ${N(b.pc)}`, X(a.pa), X(b.pa), X(s.pa), cmp(b.pa, a.pa, 'up'), cmp(b.pa, s.pa, 'up')],
            ['Capital neto de trabajo', `AC − PC = ${N(b.ac)} − ${N(b.pc)}`, N(a.cnt), N(b.cnt), '—', cmp(b.cnt, a.cnt, 'up'), '—'],
            ['Rotación de inventarios', `CV / Inv. prom. = ${N(y25.cv)} / ${N(b.ip)}`, X(a.rdi), X(b.rdi), X(s.rdi), cmp(b.rdi, a.rdi, 'up'), cmp(b.rdi, s.rdi, 'up')],
            ['Periodo prom. de cobro', `CxC / (V/365) = ${N(y25.cxc)} / ${E.fmt.n(y25.v / 365, 2)}`, D(a.ppc), D(b.ppc), D(s.ppc), cmp(b.ppc, a.ppc, 'down'), cmp(b.ppc, s.ppc, 'down')],
            ['Periodo prom. de inventario', `Inv. prom. / (CV/365) = ${N(b.ip)} / ${E.fmt.n(y25.cv / 365, 2)}`, D(a.ppi), D(b.ppi), D(s.ppi), cmp(b.ppi, a.ppi, 'down'), cmp(b.ppi, s.ppi, 'down')],
            ['Periodo prom. de pago', `Prov. / (CV/365) = ${N(y25.prov)} / ${E.fmt.n(y25.cv / 365, 2)}`, D(a.ppp), D(b.ppp), D(s.ppp), cmp(b.ppp, a.ppp, 'up'), cmp(b.ppp, s.ppp, 'up')],
            ['Ciclo operativo', `PPC + PPI = ${N1(b.ppc)} + ${N1(b.ppi)}`, D(a.co), D(b.co), D(s.co), cmp(b.co, a.co, 'down'), cmp(b.co, s.co, 'down')],
            ['Ciclo de efectivo', `C. operativo − PPdP = ${N1(b.co)} − ${N1(b.ppp)}`, D(a.ce), D(b.ce), D(s.ce), cmp(b.ce, a.ce, 'down'), cmp(b.ce, s.ce, 'down')],
            ['Rot. activos fijos netos', `Ventas / AF neto = ${N(y25.v)} / ${N(y25.ppe)}`, X(a.rafn), X(b.rafn), X(s.rafn), cmp(b.rafn, a.rafn, 'up'), cmp(b.rafn, s.rafn, 'up')],
            ['Nivel de endeudamiento', `Pasivo total / Activo total = ${N(b.p)} / ${N(b.at)}`, P(a.nde), P(b.nde), P(s.nde), cmp(b.nde, a.nde, 'down'), cmp(b.nde, s.nde, 'down')],
            ['Cobertura de intereses', `Utilidad operacional / Gasto int. = ${N(y25.uo)} / ${N(y25.int)}`, X(a.cob), X(b.cob), X(s.cob), cmp(b.cob, a.cob, 'up'), cmp(b.cob, s.cob, 'up')],
          ].map((r) => `<tr>${r.map((c, i) => `<td${i === 1 ? ' style="text-align:left;white-space:normal"' : ''}>${c}</td>`).join('')}</tr>`).join('')}
          </tbody></table></div>
          <p class="small">Extra (no se pedía, suma para avanzado): margen neto ${P(a.mn)} → ${P(b.mn)}; ROE ${P(a.roe)} → ${P(b.roe)}. Crecimientos 2024→2025: ventas ${P(y25.v / y24.v - 1)}, cuentas por cobrar ${P(y25.cxc / y24.cxc - 1)}, inventario final ${P(y25.inv / y24.inv - 1)}, deuda CP ${P(y25.dcp / y24.dcp - 1)}, intereses ${P(y25.int / y24.int - 1)}.</p>
          ${E.warn('Si te salió la prueba ácida mayor que la razón corriente, no restaste el inventario. Si usaste el inventario final (200) en vez del promedio (170), tu PPI sería ' + D(y25.inv / (y25.cv / 365)) + ': "que su diez no sea un ocho".')}`)}
        ${E.reveal('💬 Respuesta modelo de interpretación', `<div class="model">
          <p><b>Liquidez.</b> La razón corriente bajó de ${X(a.rc)} a ${X(b.rc)} y quedó debajo del sector (${X(s.rc)}). La prueba ácida cayó todavía más (${X(a.pa)} → ${X(b.pa)}, sector ${X(s.pa)}): por cada $1 de deuda de corto plazo sólo hay $${E.fmt.n(b.pa, 2)} que "sí es dinero". Como la prueba ácida cae más que la razón corriente, <b>el activo corriente creció por inventario y cartera, no por caja</b> (la caja se redujo a la mitad: 60 → 30). El capital neto de trabajo bajó de ${N(a.cnt)} a ${N(b.cnt)}.</p>
          <p><b>Eficiencia.</b> Las ventas crecieron 10%, pero el inventario promedio creció 31% (${N(a.ip)} → ${N(b.ip)}): la rotación cayó de ${X(a.rdi)} a ${X(b.rdi)} (${N1(a.ppi)} → ${N1(b.ppi)} días; sector ${N(s.ppi)}). Cobra más lento: ${N1(a.ppc)} → ${N1(b.ppc)} días contra ${N(s.ppc)} del sector. Y paga a proveedores un poco más rápido (${N1(a.ppp)} → ${N1(b.ppp)} días; sector ${N(s.ppp)}). Resultado: el ciclo de efectivo se alargó de ${N1(a.ce)} a ${N1(b.ce)} días (sector ${N(s.ce)}): <b>la empresa financia con su dinero ≈26 días más de operación</b>. Lo único que mejora un poco es la rotación de activos fijos (${X(a.rafn)} → ${X(b.rafn)}), aunque sigue debajo del sector.</p>
          <p><b>Endeudamiento.</b> Ese hueco de capital de trabajo se cubrió con deuda bancaria de corto plazo (70 → 165): el nivel de endeudamiento sube de ${P(a.nde)} a ${P(b.nde)} (sector ${P(s.nde)}) y la cobertura de intereses cae de ${X(a.cob)} a ${X(b.cob)}, la mitad del sector (${X(s.cob)}). Por eso la rentabilidad también se deteriora (margen neto ${P(a.mn)} → ${P(b.mn)}; ROE ${P(a.roe)} → ${P(b.roe)}).</p>
          <p><b>Diagnóstico.</b> Tiendas Del Valle creció vendiendo a crédito y acumulando inventario; el capital de trabajo extra se comió la caja y lo tuvo que pedir prestado a corto plazo. No es un problema de rentabilidad del activo fijo, es de <b>administración del capital de trabajo</b> ("los activos son la causa").</p>
          <p><b>Como banco</b> no le prestaría más a corto plazo sin un plan: liquidez y cobertura están debajo del sector y empeorando. <b>Recomendaciones:</b> (1) cobranza: volver a 30 días como el sector liberaría ≈30 millones (120 − 1,100 × 30/365 ≈ 90); (2) inventario: con 70 días de costo (≈148) liberaría ≈52 millones; (3) negociar plazo con proveedores hacia 60 días; (4) refinanciar la deuda de corto plazo a largo plazo mientras se libera la caja.</p></div>`)}
      ` })}

      <!-- ================= P2 ================= -->
      ${E.concept({ id: 'p2', title: 'Pregunta 2 (40 puntos) · Cementos del Bajío: fuentes y usos, capital de trabajo y flujo', badge: 'star', html: `
        <div class="preg">
        <p><b>Cementos del Bajío</b> (ficticia). Cifras en <b>millones de pesos</b>. Ventas: 2024 = <b>${N(P2.v24)}</b>; 2025 = <b>${N(P2.v25)}</b>. Utilidad neta 2025 = <b>${N(P2.un)}</b>. Depreciación 2025 = <b>${N(P2.dep)}</b>. No hubo aportaciones de capital ni venta de activos fijos.</p>
        <div class="g2">
          <div>${E.table([...ACT.map(([k, n]) => [n, P2.A[k], P2.B[k]]), ['Activo total', t2.ta, t2.tb, { cls: 'tot' }]], { head: ['Activo', '2024', '2025'], fmt: [null, N, N] })}</div>
          <div>${E.table([...PAS.map(([k, n]) => [n, P2.A[k], P2.B[k]]), ['Pasivo + patrimonio', t2.pa, t2.pb, { cls: 'tot' }]], { head: ['Pasivo y patrimonio', '2024', '2025'], fmt: [null, N, N] })}</div>
        </div>
        <p><b>Se pide:</b></p>
        <ol type="a">
          <li>Arma las <b>fuentes y usos</b> de todas las cuentas y verifica que cuadren.</li>
          <li>¿Cuánto <b>cambió el capital de trabajo</b>? ¿Es fuente o uso? ¿Qué significa?</li>
          <li>Calcula el <b>CapEx</b> del año y el <b>dividendo implícito</b>.</li>
          <li>Construye el flujo de <b>operación</b> (método indirecto), <b>inversión</b> y <b>financiamiento</b>, y verifica contra la caja.</li>
          <li>Calcula el flujo libre de <b>Buffett</b>. ¿Es una empresa sana? ¿Qué le dirías a un inversionista?</li>
        </ol>
        </div>
        ${timerHTML(25)}
        ${ansHTML('p2', 'Caja: 50 − 70 = −20 (uso) … ; ΔKT … ; Operación = … ; Buffett = … ; interpretación …')}
        ${E.reveal('📋 Rúbrica: ¿qué te da cada nivel?', `<div class="tblwrap"><table class="tbl rub"><thead><tr><th>Nivel</th><th style="text-align:left">Qué tiene la respuesta</th></tr></thead><tbody>
          <tr><td><b>Básico</b></td><td>Fuentes y usos con los signos correctos (activo: anterior − actual; pasivo y capital: actual − anterior) y la suma = 0. Dice que el capital de trabajo <b>aumentó → uso</b>.</td></tr>
          <tr><td><b>Intermedio (≈80)</b></td><td>+ CapEx <b>sumando la depreciación</b> (140, no 80); flujo de operación, inversión y financiamiento; verificación: suma = Δ caja (+20) y 50 + 20 = 70.</td></tr>
          <tr><td><b>Avanzado (100)</b></td><td>+ Buffett negativo (−20) y la <b>alerta</b>: déficit + dividendos pagados con deuda; distingue KT contable (+70, incluye caja y deuda CP) del operativo (+30: clientes, inventarios, proveedores); nota que las cuentas por cobrar crecen 30% con ventas +15%; CapEx > depreciación = expansión (¿la justifican las ventas?); dividendo implícito (−40).</td></tr>
          <tr><td><b>50% cualitativo</b></td><td>Interpreta los tres flujos "de uno al otro"; dice si es empresa sana (operación + inversión > 0); explica de dónde salió y a dónde se fue el dinero; matiza (expansión puede justificar el déficit) y recomienda.</td></tr>
        </tbody></table></div>`)}
        ${E.reveal('🧮 Solución paso a paso (todos los cálculos)', `
          <h4>a) Fuentes y usos</h4>
          <div class="g2"><div>${E.table(t2.fa.map(([n, x, y, d]) => [n, `${N(x)} − ${N(y)}`, `<b>${S(d)}</b>`, d > 0 ? 'Fuente' : d < 0 ? 'Uso' : '—']).concat([['Total activo', '', `<b>${S(t2.fa.reduce((s2, x) => s2 + x[3], 0))}</b>`, '', { cls: 'tot' }]]), { head: ['Activo (2024 − 2025)', 'Cálculo', 'Monto', 'Tipo'] })}</div>
          <div>${E.table(t2.fp.map(([n, x, y, d]) => [n, `${N(y)} − ${N(x)}`, `<b>${S(d)}</b>`, d > 0 ? 'Fuente' : d < 0 ? 'Uso' : '—']).concat([['Total pasivo + patrimonio', '', `<b>${S(t2.fp.reduce((s2, x) => s2 + x[3], 0))}</b>`, '', { cls: 'tot' }]]), { head: ['Pasivo y patrimonio (2025 − 2024)', 'Cálculo', 'Monto', 'Tipo'] })}</div></div>
          <p>Suma de todo = ${S(t2.sum)} ✓ (usos = fuentes = 170). Ojo: la caja <b>aumentó</b>, por eso es <b>uso</b> (el dueño dejó más inversión en caja).</p>
          <h4>b) Cambio en capital de trabajo ★</h4>
          <ul><li><b>Contable</b> (AC − PC): 2024 = (50 + 100 + 150) − (120 + 80) = <b>${N(t2.kt0)}</b>; 2025 = (70 + 130 + 170) − (140 + 60) = <b>${N(t2.kt1)}</b>. Aumentó ${S(t2.kt1 - t2.kt0)} → <b>uso</b>: en fuentes y usos, ${N(t2.kt0)} − ${N(t2.kt1)} = <b>${S(t2.kt0 - t2.kt1)}</b>. La empresa invirtió ${N(t2.kt1 - t2.kt0)} en capital de trabajo.</li>
          <li><b>Operativo</b> (sólo cuentas sin intereses: clientes + inventarios − proveedores): 2024 = 100 + 150 − 120 = ${N(t2.kto0)}; 2025 = 130 + 170 − 140 = ${N(t2.kto1)} → aumento de ${N(t2.kto1 - t2.kto0)} = <b>uso de ${N(t2.kto1 - t2.kto0)}</b>. Es el que entra al flujo de operación. La diferencia (${N(t2.kt1 - t2.kt0 - (t2.kto1 - t2.kto0))}) son la caja (+20) y el pago de deuda bancaria CP (20), que no son operación.</li></ul>
          <h4>c) Los dos ajustes especiales</h4>
          <ul><li><b>CapEx</b> = Δ activo fijo neto + depreciación = (780 − 700) + 60 = <b>${N(t2.capex)}</b>. (Si sólo pones 80 te faltan las facturas que "escondió" la depreciación.)</li>
          <li><b>Dividendo implícito</b> = Δ patrimonio − utilidad neta = (550 − 500) − 90 = <b>${S(t2.div)}</b> → pagó ${N(-t2.div)} a los dueños (${P(-t2.div / P2.un)} de la utilidad).</li></ul>
          <h4>d) Flujo de efectivo (método indirecto)</h4>
          ${E.table([
            ['Utilidad neta', S(P2.un)], ['+ Depreciación (no es salida de caja)', S(P2.dep)], ['− Aumento de cuentas por cobrar', S(-t2.dCxC)], ['− Aumento de inventarios', S(-t2.dInv)], ['+ Aumento de proveedores', S(t2.dProv)],
            ['<b>Flujo de operación</b>', `<b>${S(t2.cfo)}</b>`, { cls: 'tot' }],
            ['− CapEx', S(-t2.capex)], ['<b>Flujo de inversión</b>', `<b>${S(t2.cfi)}</b>`, { cls: 'tot' }],
            ['Pago de deuda bancaria CP', S(P2.B.dcp - P2.A.dcp)], ['Nueva deuda bancaria LP', S(P2.B.dlp - P2.A.dlp)], ['Dividendos pagados', S(t2.div)], ['<b>Flujo de financiamiento</b>', `<b>${S(t2.cff)}</b>`, { cls: 'tot' }],
            ['<b>Cambio en caja</b> = operación + inversión + financiamiento', `<b>${S(t2.tot)}</b>`, { cls: 'tot' }],
            ['Caja inicial + cambio = caja final', `${N(P2.A.caja)} ${S(t2.tot)} = ${N(P2.A.caja + t2.tot)} ✓`],
          ], { head: ['Concepto', 'Millones'] })}
          <h4>e) Flujo libre de Buffett</h4>
          <p>Operación + inversión = ${S(t2.cfo)} ${S(t2.cfi)} = <b>${S(t2.buf)}</b> → la operación <b>no alcanzó</b> a cubrir la inversión. CapEx / activo total = ${N(t2.capex)} / ${N(t2.tb)} = ${P(t2.capex / t2.tb)}; CapEx / depreciación = ${E.fmt.n(t2.capex / P2.dep, 1)} veces.</p>`)}
        ${E.reveal('💬 Respuesta modelo de interpretación', `<div class="model">
          <p><b>De dónde salió y a dónde fue el dinero.</b> Las fuentes y usos cuadran (170 de usos = 170 de fuentes). Los grandes usos fueron el activo fijo (80 neto; CapEx real de 140), clientes (30), inventarios (20), más caja (20) y pagar deuda de corto plazo (20). Se financió con deuda de largo plazo (+100), utilidades retenidas (+50) y proveedores (+20).</p>
          <p><b>Capital de trabajo (la pregunta que no falla).</b> El capital de trabajo <b>aumentó</b> de ${N(t2.kt0)} a ${N(t2.kt1)}: es un <b>uso</b>, la empresa invirtió ${N(t2.kt1 - t2.kt0)} en capital de trabajo. En lo operativo el aumento fue de ${N(t2.kto1 - t2.kto0)}, impulsado por clientes: las cuentas por cobrar crecieron 30% contra ventas +15% (cobro de ${N1(100 / (P2.v24 / 365))} a ${N1(130 / (P2.v25 / 365))} días): está financiando a sus clientes.</p>
          <p><b>Flujo.</b> La operación es <b>positiva</b> (${S(t2.cfo)}: utilidad 90 + depreciación 60 − 30 de capital de trabajo), lo cual es sano. Pero invirtió ${N(t2.capex)} en activo fijo, más del doble de su depreciación (expansión). El flujo libre de Buffett es <b>${S(t2.buf)}</b>: la operación no alcanzó para la inversión. El financiamiento fue <b>positivo (${S(t2.cff)})</b>: pidió 100 al banco de largo plazo, con lo que cubrió el déficit, pagó deuda de corto plazo y <b>pagó ${N(-t2.div)} de dividendos</b>.</p>
          <p><b>Conclusión.</b> Señal de alerta: <b>déficit de flujo libre + pago de dividendos</b> = se está endeudando para pagarle a los accionistas. Atenuante: es un año de expansión (CapEx alto) con ventas creciendo 15%; si en los próximos años las ventas crecen más que el CapEx, la inversión se justifica. <b>Recomendaría</b> mejorar la cobranza (volver a ≈36 días liberaría ≈15 millones), moderar dividendos mientras dure la expansión y vigilar que la operación vuelva a cubrir la inversión.</p></div>`)}
      ` })}

      <!-- ================= P3 ================= -->
      ${E.concept({ id: 'p3', title: 'Pregunta 3 (20 puntos) · DuPont: ¿de qué palanca viene el ROE?', badge: 'in', html: `
        <div class="preg">
        <p>Dos cadenas de farmacias (ficticias) del mismo mercado. Cifras de 2025 en millones de pesos.</p>
        ${E.table([['Ventas', P3.A.v, P3.B.v], ['Utilidad neta', P3.A.un, P3.B.un], ['Activo total', P3.A.at, P3.B.at], ['Patrimonio', P3.A.pat, P3.B.pat]], { head: ['', P3.A.n, P3.B.n], fmt: [null, N, N] })}
        <p><b>Se pide:</b> calcula el ROE de ambas con la descomposición DuPont (margen neto × rotación de activos × apalancamiento). ¿De qué palanca viene la diferencia? ¿Cuál preferirías como inversionista y cuál como banco? Explica.</p>
        </div>
        ${timerHTML(13)}
        ${ansHTML('p3', 'Aurora: margen = 120 / 1,500 = … ; rotación … ; apalancamiento … ; ROE … ; Boreal … ; la diferencia viene de …')}
        ${E.reveal('📋 Rúbrica: ¿qué te da cada nivel?', `<div class="tblwrap"><table class="tbl rub"><thead><tr><th>Nivel</th><th style="text-align:left">Qué tiene la respuesta</th></tr></thead><tbody>
          <tr><td><b>Básico</b></td><td>ROE = utilidad neta / patrimonio correcto para ambas (24% y 36%).</td></tr>
          <tr><td><b>Intermedio (≈80)</b></td><td>+ los tres factores de cada una y la verificación margen × rotación × apalancamiento = ROE; ROA de ambas.</td></tr>
          <tr><td><b>Avanzado (100)</b></td><td>+ identifica que Boreal gana en ROE <b>sólo por apalancamiento</b> (4x vs 2x) mientras opera peor (margen y ROA menores); cuantifica (con el apalancamiento de Aurora, Boreal tendría 18%); habla del riesgo (75% de deuda) y de las perspectivas.</td></tr>
          <tr><td><b>50% cualitativo</b></td><td>Explica "no es la fórmula, es la metodología": qué palanca mover; el ROE de Boreal es "prestado"; postura clara según perspectiva (dueño vs banco).</td></tr>
        </tbody></table></div>`)}
        ${E.reveal('🧮 Solución paso a paso (todos los cálculos)', `
          ${E.table([
            ['Margen neto = UN / Ventas', `120 / 1,500 = ${P(A3.mn)}`, `108 / 1,800 = ${P(B3.mn)}`],
            ['× Rotación de activos = Ventas / AT', `1,500 / 1,000 = ${X(A3.rot)}`, `1,800 / 1,200 = ${X(B3.rot)}`],
            ['= ROA = UN / AT', `${P(A3.roa)}`, `${P(B3.roa)}`, { cls: 'sub' }],
            ['× Apalancamiento = AT / Patrimonio', `1,000 / 500 = ${X(A3.apal)}`, `1,200 / 300 = ${X(B3.apal)}`],
            ['= ROE', `<b>${P(A3.roe)}</b>`, `<b>${P(B3.roe)}</b>`, { cls: 'tot' }],
            ['Verificación: UN / Patrimonio', `120 / 500 = ${P(A3.roe)} ✓`, `108 / 300 = ${P(B3.roe)} ✓`],
            ['Nivel de endeudamiento = 1 − Pat/AT', P(A3.nde), P(B3.nde)],
          ], { head: ['Paso', P3.A.n, P3.B.n] })}
          <p>Sensibilidad: si Boreal tuviera el apalancamiento de Aurora (2x), su ROE sería ${P(B3.roa)} × 2 = <b>${P(B3.roa * 2)}</b> &lt; ${P(A3.roe)}.</p>`)}
        ${E.reveal('💬 Respuesta modelo de interpretación', `<div class="model">
          <p>Boreal tiene un ROE mayor (${P(B3.roe)} vs ${P(A3.roe)}), pero DuPont muestra que <b>no viene de operar mejor</b>: su margen neto es menor (${P(B3.mn)} vs ${P(A3.mn)}) y la rotación es igual (${X(A3.rot)}), así que su ROA es menor (${P(B3.roa)} vs ${P(A3.roa)}). Toda la ventaja sale del <b>apalancamiento</b>: cada peso de patrimonio de Boreal sostiene ${X(B3.apal)} de activos contra ${X(A3.apal)} de Aurora (endeudamiento ${P(B3.nde)} vs ${P(A3.nde)}). Con el mismo apalancamiento, Boreal rendiría ${P(B3.roa * 2)}.</p>
          <p><b>Como inversionista</b> prefiero Aurora: su rentabilidad viene de la operación (margen), que es "el lugar correcto"; el ROE de Boreal es "prestado" y, si bajan las ventas, la deuda amplifica la caída. <b>Como banco</b>, también Aurora: menos deuda y más capacidad de pago. A Boreal le recomendaría mejorar el margen (costos y gastos) antes de seguir endeudándose.</p></div>`)}
      ` })}

      <h2 id="rapidos">Ejercicios rápidos con números al azar</h2>
      <p class="prose">Como los quizzes algorítmicos del profe: mismo procedimiento, números distintos cada vez. Escribe tu número (sin el símbolo %; se acepta punto o coma decimal) y presiona <b>Revisar</b>: se aceptan diferencias de <b>±2%</b> por redondeo.</p>
      <div class="btnrow"><button class="btn pri" type="button" id="qnew">🎲 Nuevos números</button><a class="btn" href="#/formulario">🖨️ Ver formulario</a></div>
      <div id="qa"></div>
      ${E.key(`Si fallas uno, abre la solución y fíjate <b>en qué paso</b> te desviaste: casi siempre es inventario promedio, ventas vs costo de ventas, o el signo de fuentes y usos. Repasa en ${E.link('eficiencia', 'Eficiencia')}, ${E.link('fuentes-usos', 'Fuentes y usos')} o ${E.link('dupont', 'DuPont')}.`, 'Para corregir')}
      </div>`;

      root.querySelectorAll('.sx-pr-tm').forEach(wireTimer);
      wireAns(root);
      const qa = root.querySelector('#qa');
      renderQuiz(qa);
      root.querySelector('#qnew').addEventListener('click', () => renderQuiz(qa));
    },
  });
})();
