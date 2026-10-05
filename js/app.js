'use strict';
/* Detective financiero — motor de DataViz (ECharts). `D` viene inyectado por tools/build_site.py; GLOSARIO de js/glosario.js. */

// =====================================================================
// 1. Modelo de datos
// =====================================================================
const ITEMS = [], byShort = {};
D.cats.forEach(c => c.items.forEach(it => { it.cat = c.name; ITEMS.push(it); byShort[it.short] = it; }));
const RED = new Set(D.reduced);                       // las 28 partidas que traen A–D
const IND = D.inds.slice(), CO = D.comps.names.slice();
const ENT = [
  ...IND.map((n, i) => ({id:n, kind:'ind', i, label:n, short:n === 'Tecnología' ? 'Tech' : n, slot:i + 1, sub:D.companies[n].join(' · ')})),
  ...CO.map((n, i) => ({id:n, kind:'co', i, label:'Empresa ' + n, short:n, slot:5 + i, sub:'industria por descubrir'})),
];
const E = Object.fromEntries(ENT.map(e => [e.id, e]));
const ALL = ENT.map(e => e.id);
const num = v => (v == null || typeof v !== 'number' || !isFinite(v)) ? null : v;
const add = (a, b) => a == null || b == null ? null : a + b;
const mul = (a, b) => a == null || b == null ? null : a * b;
const div = (a, b) => a == null || b == null || b === 0 ? null : a / b;
const mean = a => { const v = a.filter(x => x != null); return v.length ? v.reduce((s, x) => s + x, 0) / v.length : null; };
const median = a => { const v = a.filter(x => x != null).sort((x, y) => x - y); if (!v.length) return null; const m = v.length >> 1; return v.length % 2 ? v[m] : (v[m - 1] + v[m]) / 2; };

// Indicadores derivados (calculados aquí). Industrias: se calcula por empresa y se promedia (igual que el resto de promedios).
const DERIVED = [
  {short:'Liquidez inmediata',         unit:'pct', f:g => add(g('Efectivo'), g('Inversiones CP'))},
  {short:'Deuda financiera',           unit:'pct', f:g => add(g('Deuda CP'), g('Deuda LP'))},
  {short:'Deuda / Capital',            unit:'x',   f:g => div(add(g('Deuda CP'), g('Deuda LP')), g('Total capital'))},
  {short:'Multiplicador de capital',   unit:'x',   f:g => div(1, g('Total capital'))},
  {short:'Razón de efectivo',          unit:'x',   f:g => div(add(g('Efectivo'), g('Inversiones CP')), g('Total pas. circulante'))},
  {short:'Capital de trabajo / Activo',unit:'pct', f:g => add(g('Total act. circulante'), g('Total pas. circulante') == null ? null : -g('Total pas. circulante'))},
  {short:'Margen neto implícito',      unit:'pct', f:g => div(mul(g('ROE'), g('Total capital')), g('Rotación de activos totales'))},
  {short:'ROA implícito',              unit:'pct', f:g => mul(g('ROE'), g('Total capital'))},
];
(function buildDerived(){
  const cat = {name:'Indicadores: Derivados', items:[]};
  DERIVED.forEach(d => {
    const comp = {}, avg = [];
    IND.forEach((ind, ii) => {
      comp[ind] = [0, 1, 2, 3].map(j => num(d.f(k => byShort[k] ? num(byShort[k].comp[ind][j]) : null)));
      avg[ii] = mean(comp[ind]);
    });
    const co = CO.map((_, ci) => num(d.f(k => D.comps.items[k] ? num(D.comps.items[k][ci]) : null)));
    const it = {key:'calculado', short:d.short, unit:d.unit, avg, comp, co, derived:true, cat:cat.name};
    cat.items.push(it); ITEMS.push(it); byShort[d.short] = it;
  });
  D.cats.push(cat);
})();
const DER = new Set(DERIVED.map(d => d.short));
const CONST_ITEMS = /^(Total activos|Pasivo \+ Capital|Ingresos)$/;

function avail(id, k){ const it = byShort[k]; if (!it) return false; return E[id].kind === 'ind' ? true : (it.derived || RED.has(k)); }
function val(id, k){
  const it = byShort[k], e = E[id]; if (!it) return null;
  if (e.kind === 'ind') return num(it.avg[e.i]);
  if (it.derived) return num(it.co[e.i]);
  const a = D.comps.items[k]; return a ? num(a[e.i]) : null;
}
const unitOf = k => byShort[k].unit;
function baseOf(it){
  if (it.unit === 'usd') return 'USD mm'; if (it.unit === 'días') return 'días'; if (it.unit === 'x') return 'veces';
  if (['Activos', 'Pasivos', 'Capital'].includes(it.cat) || ['Liquidez inmediata', 'Deuda financiera', 'Capital de trabajo / Activo'].includes(it.short)) return '% del activo';
  if (it.cat.startsWith('Indicadores')) return '%';
  return '% de ingresos';
}
const pct = (v, d = 1) => (v * 100).toFixed(d) + '%';
function fmt(v, u){
  if (v == null) return '—';
  if (u === 'pct') return pct(v, Math.abs(v) >= 10 ? 0 : 1);
  if (u === 'días') return v.toFixed(0) + ' días';
  if (u === 'usd') return '$' + Math.round(v).toLocaleString('en-US') + ' mm';
  return (Math.abs(v) >= 100 ? v.toFixed(0) : v.toFixed(2)) + '×';
}
function fmtAxis(v, u){
  if (u === 'pct') return (Math.round(v * 1000) / 10) + '%';
  if (u === 'norm') return Math.round(v * 100);
  if (u === 'dev') return (v > 0 ? '+' : '') + Math.round(v * 100) + '%';
  if (u === 'usd') return Math.abs(v) >= 1000 ? (v / 1000).toFixed(0) + 'k' : v;
  if (u === 'x') return +v.toFixed(2) + '×';
  return +v.toFixed(1);
}
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
// dominio de una partida sobre todas las entidades que la tienen (escala estable al cambiar la selección)
function domain(k){ const v = ALL.filter(id => avail(id, k)).map(id => val(id, k)).filter(x => x != null); return v.length ? [Math.min(...v), Math.max(...v)] : [0, 1]; }

// =====================================================================
// 2. Tema
// =====================================================================
let T = {};
const FONT = 'system-ui,-apple-system,"Segoe UI",Roboto,sans-serif';
function isDark(){ const a = document.documentElement.getAttribute('data-theme'); return a ? a === 'dark' : matchMedia('(prefers-color-scheme: dark)').matches; }
function readTheme(){
  const s = getComputedStyle(document.documentElement), g = v => s.getPropertyValue(v).trim();
  T = {ink:g('--ink'), ink2:g('--ink2'), muted:g('--muted'), axis:g('--axis'), line:g('--line'), grid:g('--grid'), card:g('--card'), surface:g('--surface'),
       seq0:g('--seq0'), seq1:g('--seq1'), dark:isDark(), c:[1, 2, 3, 4, 5, 6, 7, 8].map(i => g('--c' + i))};
}
const col = id => T.c[E[id].slot - 1];
function rgba(hex, a){ const h = hex.replace('#', ''); const n = parseInt(h.length === 3 ? h.split('').map(x => x + x).join('') : h, 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`; }
function mix(a, b, t){ const p = h => { const n = parseInt(h.replace('#', ''), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }; const x = p(a), y = p(b);
  return '#' + x.map((v, i) => Math.round(v + (y[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
function lum(hex){ const n = parseInt(hex.replace('#', ''), 16); const f = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4); };
  return 0.2126 * f(n >> 16 & 255) + 0.7152 * f(n >> 8 & 255) + 0.0722 * f(n & 255); }
const inkOn = hex => lum(hex) > 0.36 ? '#0b0b0b' : '#ffffff';
const seq = t => mix(T.seq0, T.seq1, clamp(t, 0, 1));
const symOf = id => E[id].kind === 'co' ? 'diamond' : 'circle';
const dot = id => `<span style="display:inline-block;width:9px;height:9px;border-radius:${E[id].kind === 'co' ? '50%' : '2px'};background:${col(id)};margin-right:6px"></span>`;
const swatch = id => `<span class="sw-dot${E[id].kind === 'co' ? ' co' : ''}" style="background:${col(id)}"></span>`;

// =====================================================================
// 3. Estado
// =====================================================================
const S = {view:'ind', reduced:false, dev:false, gtype:'auto'};
const OVR = {};                                          // tipo elegido por tarjeta (id de tarjeta -> tipo)
const LAB = {ents:['Pharma', 'B'], items:null, type:'radar', scale:'auto', ref:null, x:'Rotación de activos totales', y:'Margen operacional', size:'ROE', preset:'huella'};

// =====================================================================
// 4. Registro de gráficas (carga diferida + redimensionado)
// =====================================================================
const LIVE = new Set();
const io = new IntersectionObserver(es => es.forEach(en => { if (en.isIntersecting){ io.unobserve(en.target); draw(en.target, true); } }), {rootMargin:'700px 0px'});
const ro = new ResizeObserver(es => es.forEach(en => { const el = en.target; const w = Math.round(en.contentRect.width);
  if (!el._drawn || Math.abs(w - (el._w || 0)) < 2) return; clearTimeout(el._rt); el._rt = setTimeout(() => draw(el, false), 120); }));
function mount(el, spec){ el._spec = spec; el._drawn = false; LIVE.add(el); io.observe(el); ro.observe(el); }
function draw(el, anim){
  const spec = el._spec; if (!spec || !el.isConnected) return;
  const w = el.clientWidth || 600; el._w = w; el._drawn = true;
  const type = typeOf(spec);
  if (type === 'table'){ const c = echarts.getInstanceByDom(el); if (c) c.dispose(); el.style.height = ''; el.innerHTML = tableHTML(spec); return; }
  const h = heightOf(spec, type, w); el.style.height = h + 'px';
  let c = echarts.getInstanceByDom(el);
  if (!c){ el.innerHTML = ''; c = echarts.init(el, null, {renderer:'canvas'}); c.on('click', p => onChartClick(spec, p)); }
  else c.resize();
  const opt = build(spec, type, w, h); opt.animation = anim !== false; opt.animationDuration = 450; opt.animationDurationUpdate = 350;
  c.setOption(opt, true);
}
function redrawAll(anim){ LIVE.forEach(el => { if (!el.isConnected){ LIVE.delete(el); return; } if (el._drawn) draw(el, anim); }); }
function disposeAll(){ LIVE.forEach(el => { const c = echarts.getInstanceByDom(el); if (c) c.dispose(); io.unobserve(el); ro.unobserve(el); }); LIVE.clear(); }
function onChartClick(spec, p){
  let k = null;
  if (p.componentType === 'xAxis' || p.componentType === 'yAxis') k = p.value;
  else if (p.data && p.data.item) k = p.data.item;
  else if (spec.items && spec.items.includes(p.name)) k = p.name;
  else if (spec.item) k = spec.item;
  if (k && byShort[k]) openItem(k);
}

// =====================================================================
// 5. Tipos de gráfica
// =====================================================================
const ICON = {
  auto:'<path d="M10 3v3M10 14v3M3 10h3M14 10h3M5 5l2 2M13 13l2 2M5 15l2-2M13 7l2-2"/>',
  bar:'<path d="M4.5 17V10M8.5 17V4M12.5 17v-5M16.5 17V7" stroke-width="2.6"/>',
  hbar:'<path d="M3 4.5h8M3 8.5h13M3 12.5h6M3 16.5h10" stroke-width="2.6"/>',
  radar:'<path d="M10 2.5l7.1 5.2-2.7 8.3H5.6L2.9 7.7z"/><path d="M10 6.5l3.4 2.5-1.3 4H7.9l-1.3-4z"/>',
  line:'<path d="M2.5 15l4.5-6 4 3 6.5-8"/>',
  area:'<path d="M2.5 16.5V14l4.5-6 4 3 6.5-7.5v13z" fill="currentColor" fill-opacity=".28"/>',
  heat:'<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="11" y="3" width="6" height="6" rx="1" fill="currentColor"/><rect x="3" y="11" width="6" height="6" rx="1" fill="currentColor" fill-opacity=".5"/><rect x="11" y="11" width="6" height="6" rx="1"/>',
  dist:'<path d="M3 6h14M3 14h14" stroke-opacity=".5"/><circle cx="6" cy="6" r="1.9" fill="currentColor"/><circle cx="12.5" cy="6" r="1.9" fill="currentColor"/><circle cx="9" cy="14" r="1.9" fill="currentColor"/><circle cx="15" cy="14" r="1.9" fill="currentColor"/>',
  table:'<rect x="3" y="4" width="14" height="12" rx="1.5"/><path d="M3 8h14M3 12h14M8 4v12"/>',
  stack:'<rect x="3" y="4" width="14" height="4.5" rx="1"/><rect x="3" y="11.5" width="14" height="4.5" rx="1"/><path d="M9 4v4.5M13 4v4.5M7 11.5V16M11 11.5V16" />',
  scatter:'<circle cx="6" cy="13" r="2.2"/><circle cx="12" cy="8" r="3"/><circle cx="15.5" cy="14.5" r="1.6"/><path d="M3 3v14h14" stroke-opacity=".5"/>',
  dupont:'<circle cx="6" cy="13" r="2.2"/><circle cx="12" cy="8" r="3"/><circle cx="15.5" cy="14.5" r="1.6"/><path d="M3 3v14h14" stroke-opacity=".5"/>',
};
const TNAME = {auto:'Automático', bar:'Barras', hbar:'Barras horizontales', radar:'Radar', line:'Líneas', area:'Áreas', heat:'Mapa de calor', dist:'Distribución',
               table:'Tabla', stack:'Composición 100%', scatter:'Dispersión', dupont:'Dispersión DuPont'};
const MULTI = ['bar', 'hbar', 'radar', 'line', 'area', 'heat', 'table'];
const svg = k => `<svg viewBox="0 0 20 20" aria-hidden="true">${ICON[k]}</svg>`;
function typesOf(spec){
  if (spec.kind === 'single') return ['hbar', 'dist', 'table'];
  if (spec.kind === 'stack') return ['stack', ...MULTI];
  if (spec.kind === 'dupont') return ['dupont', 'table'];
  if (spec.kind === 'scatter') return ['scatter', 'table'];
  if (spec.kind === 'devheat' || spec.kind === 'simheat') return ['heat'];
  return spec.items.length < 3 ? MULTI.filter(t => t !== 'radar') : MULTI;
}
const SHOWN = ['bar', 'hbar', 'radar', 'line', 'area', 'heat', 'dist', 'table'];
function typesShown(spec){
  if (spec.fixed && !spec.lab) return [spec.fixed];
  const sp = spec.kind === 'stack' ? ['stack'] : spec.kind === 'dupont' ? ['dupont'] : spec.kind === 'scatter' ? ['scatter'] : [];
  return sp.concat(SHOWN);
}
function whyNot(spec, t){
  if (spec.kind === 'single') return t === 'stack' ? '' : 'Esta tarjeta muestra una sola partida: este tipo necesita varias partidas';
  if (spec.kind === 'dupont' || spec.kind === 'scatter') return 'La dispersión DuPont cruza dos indicadores en ejes distintos; solo se puede ver como dispersión o tabla';
  if (t === 'dist') return 'La distribución es para una sola partida: úsala en las tarjetas "partida por partida"';
  if (t === 'radar') return 'El radar necesita al menos 3 partidas';
  return 'No disponible para esta gráfica';
}
function typeBtn(spec, t, cur, menu){
  const ok = (spec.fixed && !spec.lab) || typesOf(spec).includes(t);
  const tt = ok ? TNAME[t] : `${TNAME[t]} — no disponible: ${whyNot(spec, t)}`;
  return `<button data-t="${t}" class="${t === cur ? 'on' : ''}" ${ok ? '' : 'disabled aria-disabled="true"'} title="${esc(tt)}" aria-label="${esc(tt)}">${svg(t)}${menu ? ' ' + TNAME[t] : ''}</button>`;
}
function typeOf(spec){
  if (spec.fixed) return spec.fixed;
  const ts = typesOf(spec);
  if (OVR[spec.id] && ts.includes(OVR[spec.id])) return OVR[spec.id];
  if (S.gtype !== 'auto'){
    if (ts.includes(S.gtype)) return S.gtype;
    if (spec.kind === 'single' && ['bar', 'hbar'].includes(S.gtype)) return 'hbar';
  }
  return spec.auto || ts[0];
}

// --- escala: real si todas las partidas comparten unidad; si no, relativa al máximo (máx |valor| = 100)
function scaleOf(spec){
  if (spec.scale === 'dev') return 'dev';
  const us = new Set(spec.items.map(unitOf));
  if (spec.scale === 'norm' || us.size > 1) return 'norm';
  return [...us][0];
}
function scaled(spec, sc, id, k){
  const v = val(id, k); if (v == null) return null;
  if (sc === 'norm'){ const [lo, hi] = domain(k); const m = Math.max(Math.abs(lo), Math.abs(hi)) || 1; return v / m; }
  if (sc === 'dev'){ const r = val(spec.ref, k); return r == null || r === 0 ? null : (v - r) / Math.abs(r); }
  return v;
}

// =====================================================================
// 6. Opciones base de ECharts
// =====================================================================
function tip(extra){ return Object.assign({confine:true, backgroundColor:T.card, borderColor:T.line, borderWidth:1, padding:[8, 11],
  textStyle:{color:T.ink, fontSize:12, fontFamily:FONT}, extraCssText:'border-radius:9px;box-shadow:0 6px 24px rgba(0,0,0,.16);max-width:320px;white-space:normal'}, extra || {}); }
function legend(ents, extra){ return Object.assign({type:'scroll', top:0, left:0, right:0, itemWidth:12, itemHeight:12, itemGap:16, icon:'roundRect',
  textStyle:{color:T.ink2, fontSize:12, fontFamily:FONT}, pageIconColor:T.ink2, pageIconInactiveColor:T.line, pageTextStyle:{color:T.muted},
  data:ents.map(id => ({name:E[id].label, icon:E[id].kind === 'co' ? 'circle' : 'roundRect'}))}, extra || {}); }
const catAxis = (o) => Object.assign({type:'category', axisLine:{lineStyle:{color:T.axis}}, axisTick:{show:false}, triggerEvent:true,
  axisLabel:{color:T.ink2, fontSize:12, fontFamily:FONT, interval:0}}, o || {});
const valAxis = (u, o) => Object.assign({type:'value', axisLine:{show:false}, axisTick:{show:false}, splitLine:{lineStyle:{color:T.grid}},
  axisLabel:{color:T.muted, fontSize:11, fontFamily:FONT, formatter:v => fmtAxis(v, u), hideOverlap:true}}, o || {});
const base = () => ({textStyle:{fontFamily:FONT, color:T.ink2}, backgroundColor:'transparent'});
function tipRows(title, rows, foot){ // rows: [{id|color,name,v}]
  return `<div style="font-weight:600;margin-bottom:4px">${esc(title)}</div>` + rows.map(r =>
    `<div style="display:flex;align-items:center;gap:10px;line-height:1.7"><span style="flex:1;white-space:nowrap">${r.id ? dot(r.id) : `<span style="display:inline-block;width:9px;height:9px;border-radius:2px;background:${r.color};margin-right:6px"></span>`}${esc(r.name)}</span><b style="font-variant-numeric:tabular-nums">${r.v}</b></div>`).join('') +
    (foot ? `<div style="color:${T.muted};margin-top:4px;font-size:11px">${foot}</div>` : '');
}
const showLabels = (n) => n <= 14;

// =====================================================================
// 7. Builders
// =====================================================================
function build(spec, type, w, h){
  switch (type){
    case 'bar': case 'line': case 'area': return buildCartesian(spec, type, w);
    case 'hbar': return spec.kind === 'single' ? buildSingle(spec, w) : buildHBar(spec, w);
    case 'radar': return buildRadar(spec, w, h);
    case 'heat': return spec.kind === 'devheat' ? buildDevHeat(spec, w) : spec.kind === 'simheat' ? buildSimHeat(spec, w) : buildHeat(spec, w);
    case 'dist': return buildDist(spec, w);
    case 'stack': return buildStack(spec, w);
    case 'dupont': case 'scatter': return buildScatter(spec, w);
  }
}
function heightOf(spec, type, w){
  const nI = spec.items ? spec.items.length : 1, nE = spec.ents.length;
  switch (type){
    case 'bar': case 'line': case 'area': return spec.h || Math.round(clamp(w * 0.5, 300, 430)) + (w < 520 ? 30 : 0);
    case 'radar': return spec.h || Math.round(clamp(w * 0.72, 340, 500));
    case 'hbar': if (spec.kind === 'single') return nE * 30 + 34; return nI * Math.max(30, nE * 11 + 14) + 64;
    case 'heat': return spec.kind === 'simheat' ? nE * 46 + 60 : nI * 36 + 64;
    case 'dist': return nE * 32 + 44;
    case 'stack': return nE * 46 + 60 + stackLegendH(spec.items.concat(spec.resid ? [spec.resid.name] : []), w);
    case 'dupont': case 'scatter': return spec.h || Math.round(clamp(w * 0.62, 320, 470));
  }
  return 360;
}
function barItem(v, raw, k, horiz){ const r = 4; const neg = v != null && v < 0;
  return {value:v, raw, item:k, itemStyle:{borderRadius:horiz ? (neg ? [r, 0, 0, r] : [0, r, r, 0]) : (neg ? [0, 0, r, r] : [r, r, 0, 0])}}; }

// barras verticales / líneas / áreas: categorías = partidas, series = entidades
function buildCartesian(spec, type, w){
  const sc = scaleOf(spec), its = spec.items, ents = spec.ents;
  const band = (w - 60) / its.length, rot = band < 58;
  const many = ents.length * its.length;
  const series = ents.map(id => {
    const c = col(id), co = E[id].kind === 'co';
    const data = its.map(k => { const v = scaled(spec, sc, id, k); return type === 'bar' ? barItem(v, val(id, k), k, false) : {value:v, raw:val(id, k), item:k}; });
    const s = {type:type === 'bar' ? 'bar' : 'line', name:E[id].label, data, itemStyle:{color:c}, emphasis:{focus:'series'}};
    if (type === 'bar'){ Object.assign(s, {barMaxWidth:24, barGap:'12%', barCategoryGap:'28%'});
      s.label = {show:showLabels(many) && !rot, position:'top', distance:4, color:T.ink2, fontSize:11, formatter:p => sc === 'norm' || sc === 'dev' ? fmtScaled(p.value, sc) : fmt(p.data.raw, unitOf(p.data.item))};
      s.labelLayout = {hideOverlap:true};
    } else {
      Object.assign(s, {symbol:symOf(id), symbolSize:co ? 11 : 9, connectNulls:true, lineStyle:{width:2, type:co ? [6, 4] : 'solid'},
        itemStyle:{color:c, borderColor:T.card, borderWidth:2}});
      if (type === 'area'){ s.smooth = 0.3; s.areaStyle = {color:new echarts.graphic.LinearGradient(0, 0, 0, 1, [{offset:0, color:rgba(c, ents.length > 3 ? .22 : .34)}, {offset:1, color:rgba(c, .03)}])}; }
    }
    return s;
  });
  return Object.assign(base(), {
    legend:legend(ents), tooltip:tip({trigger:'axis', axisPointer:{type:type === 'bar' ? 'shadow' : 'line', shadowStyle:{color:rgba(T.axis, .1)}, lineStyle:{color:T.axis}},
      formatter:ps => { const k = its[ps[0].dataIndex]; return tipRows(k, ps.map(p => ({id:ents[p.seriesIndex], name:p.seriesName, v:fmtTip(spec, sc, p)})), baseOf(byShort[k])); }}),
    grid:{left:6, right:14, top:ents.length > 1 ? 40 : 16, bottom:8, containLabel:true},
    xAxis:catAxis({data:its, boundaryGap:type === 'bar' || its.length < 4 ? true : true,
      axisLabel:{color:T.ink2, fontSize:rot ? 11 : 12, interval:0, rotate:rot ? 35 : 0, width:rot ? 120 : Math.max(40, band - 8), overflow:rot ? 'truncate' : 'break', lineHeight:14}}),
    yAxis:valAxis(sc, sc === 'dev' ? {} : {}),
    series,
  });
}
const fmtScaled = (v, sc) => v == null ? '' : sc === 'dev' ? (v > 0 ? '+' : '') + Math.round(v * 100) + '%' : Math.round(v * 100);
function fmtTip(spec, sc, p){ const raw = p.data.raw, k = p.data.item; const r = fmt(raw, unitOf(k));
  if (sc === 'dev') return `${r} <span style="color:${T.muted};font-weight:400">(${fmtScaled(p.value, 'dev')})</span>`;
  return r; }

// barras horizontales: categorías = partidas (etiquetas largas legibles), series = entidades
function buildHBar(spec, w){
  const sc = scaleOf(spec), its = spec.items, ents = spec.ents;
  const lw = clamp(Math.round(w * 0.32), 90, 190);
  const many = ents.length * its.length;
  const series = ents.map(id => ({type:'bar', name:E[id].label, barMaxWidth:18, barGap:'14%', barCategoryGap:'26%', itemStyle:{color:col(id)}, emphasis:{focus:'series'},
    data:its.map(k => barItem(scaled(spec, sc, id, k), val(id, k), k, true)),
    label:{show:showLabels(many) || ents.length <= 2, position:'right', distance:4, color:T.ink2, fontSize:11,
      formatter:p => p.value == null ? '' : sc === 'norm' || sc === 'dev' ? fmtScaled(p.value, sc) : fmt(p.data.raw, unitOf(p.data.item))},
    labelLayout:{hideOverlap:true}}));
  return Object.assign(base(), {
    legend:legend(ents), tooltip:tip({trigger:'axis', axisPointer:{type:'shadow', shadowStyle:{color:rgba(T.axis, .1)}},
      formatter:ps => { const k = its[ps[0].dataIndex]; return tipRows(k, ps.map(p => ({id:ents[p.seriesIndex], name:p.seriesName, v:fmtTip(spec, sc, p)})), baseOf(byShort[k])); }}),
    grid:{left:6, right:46, top:ents.length > 1 ? 36 : 8, bottom:6, containLabel:true},
    yAxis:catAxis({data:its, inverse:true, axisLabel:{color:T.ink2, fontSize:12, interval:0, width:lw, overflow:'break', lineHeight:14}}),
    xAxis:valAxis(sc), series,
  });
}

// una sola partida: categorías = entidades, valor en la punta
function buildSingle(spec, w){
  const k = spec.item, u = unitOf(k), ents = spec.ents;
  return Object.assign(base(), {
    tooltip:tip({trigger:'item', formatter:p => tipRows(k, [{id:ents[p.dataIndex], name:E[ents[p.dataIndex]].label, v:fmt(p.data.raw, u)}], baseOf(byShort[k]))}),
    grid:{left:4, right:58, top:6, bottom:4, containLabel:true},
    yAxis:catAxis({data:ents.map(id => E[id].kind === 'co' ? E[id].label : E[id].short), inverse:true, triggerEvent:false,
      axisLabel:{color:T.ink2, fontSize:12, interval:0}}),
    xAxis:valAxis(u, {splitNumber:3}),
    series:[{type:'bar', barMaxWidth:18, barCategoryGap:'30%',
      data:ents.map(id => { const v = val(id, k); const o = barItem(v, v, k, true); o.itemStyle.color = col(id); o.label = {position:v != null && v < 0 ? 'left' : 'right'}; return o; }),
      label:{show:true, distance:4, color:T.ink2, fontSize:11, formatter:p => fmt(p.data.raw, u)}}],
  });
}

// radar: cada eje con su propia escala (rango de todas las entidades que tienen la partida, con margen)
function buildRadar(spec, w, h){
  const its = spec.items, ents = spec.ents, narrow = w < 520;
  const doms = its.map(k => { const [lo, hi] = domain(k); const pad = (hi - lo) * 0.18 || Math.abs(hi) * 0.2 || 1; return [lo - pad, hi + pad * 0.4]; });
  const wrap = (s, n) => { const out = []; let cur = ''; s.split(' ').forEach(t => { if ((cur + ' ' + t).trim().length > n && cur){ out.push(cur); cur = t; } else cur = (cur + ' ' + t).trim(); }); out.push(cur); return out.join('\n'); };
  return Object.assign(base(), {
    legend:legend(ents),
    tooltip:tip({trigger:'item', formatter:p => { const sid = p.data.id;
      return tipRows(E[sid].label, its.map((k, i) => ({color:col(sid), name:k, v:fmt(p.data.raw[i], unitOf(k))})), 'Cada eje usa su propia escala'); }}),
    radar:{indicator:its.map((k, i) => ({name:k, min:doms[i][0], max:doms[i][1]})), shape:'polygon', splitNumber:4, radius:narrow ? '58%' : (h > 500 ? '70%' : '64%'), center:['50%', ents.length > 1 ? '54%' : '52%'],
      axisName:{color:T.ink2, fontSize:narrow ? 10.5 : 12, fontFamily:FONT, formatter:n => wrap(n, narrow ? 12 : 16)}, nameGap:narrow ? 6 : 10,
      splitLine:{lineStyle:{color:T.grid}}, splitArea:{show:false}, axisLine:{lineStyle:{color:T.grid}}},
    series:[{type:'radar', emphasis:{focus:'self', lineStyle:{width:3}}, data:ents.map(id => {
      const c = col(id), co = E[id].kind === 'co';
      const raw = its.map(k => val(id, k));
      return {id, name:E[id].label, raw, value:raw.map((v, i) => v == null ? doms[i][0] : v), symbol:symOf(id), symbolSize:co ? 9 : 7,
        lineStyle:{color:c, width:2, type:co ? [6, 4] : 'solid'}, itemStyle:{color:c, borderColor:T.card, borderWidth:1.5},
        areaStyle:{color:rgba(c, ents.length > 4 ? .08 : .16)}};
    })}],
  });
}

// mapa de calor: filas = partidas, columnas = entidades; color = posición relativa dentro de la fila (min→max de lo mostrado)
function buildHeat(spec, w){
  const its = spec.items, ents = spec.ents, data = [];
  its.forEach((k, yi) => { const vs = ents.map(id => val(id, k)); const ok = vs.filter(v => v != null); const lo = Math.min(...ok), hi = Math.max(...ok);
    ents.forEach((id, xi) => { const v = vs[xi]; const t = v == null ? null : (v - lo) / ((hi - lo) || 1); const bg = t == null ? T.card : seq(t);
      data.push({value:[xi, yi, t == null ? '-' : t], raw:v, item:k, id, label:{color:t == null ? T.muted : inkOn(bg)}}); }); });
  const lw = clamp(Math.round(w * 0.3), 90, 190);
  return Object.assign(base(), {
    tooltip:tip({trigger:'item', formatter:p => tipRows(p.data.item, [{id:p.data.id, name:E[p.data.id].label, v:fmt(p.data.raw, unitOf(p.data.item))}], 'Más oscuro = mayor valor de la fila')}),
    grid:{left:6, right:8, top:34, bottom:4, containLabel:true},
    xAxis:catAxis({data:ents.map(id => E[id].kind === 'co' ? E[id].short : E[id].short), position:'top', axisLine:{show:false}, triggerEvent:false, splitArea:{show:false}}),
    yAxis:catAxis({data:its, inverse:true, axisLine:{show:false}, axisLabel:{color:T.ink2, fontSize:12, interval:0, width:lw, overflow:'break', lineHeight:14}}),
    visualMap:{show:false, min:0, max:1, dimension:2, inRange:{color:[T.seq0, T.seq1]}},
    series:[{type:'heatmap', data, itemStyle:{borderColor:T.card, borderWidth:3, borderRadius:5},
      label:{show:true, fontSize:w < 480 ? 11 : 12, fontFamily:FONT, formatter:p => fmt(p.data.raw, unitOf(p.data.item))}, emphasis:{itemStyle:{borderColor:T.ink, borderWidth:1.5}}}],
  });
}

// distribución: por industria, sus 4 empresas (puntos) + promedio (barra vertical); A–D como rombos
function buildDist(spec, w){
  const k = spec.item, it = byShort[k], u = it.unit, ents = spec.ents.filter(id => avail(id, k));
  const rows = ents.map(id => E[id].kind === 'co' ? E[id].label : E[id].short);
  const pts = [], avgs = [];
  ents.forEach((id, yi) => {
    const e = E[id];
    if (e.kind === 'ind'){
      (it.comp[id] || []).forEach((v, j) => { if (num(v) != null) pts.push({value:[v, yi], name:D.companies[id][j], id, itemStyle:{color:rgba(col(id), .55)}}); });
      avgs.push({value:[val(id, k), yi], id, symbol:'rect', symbolSize:[4, 22], itemStyle:{color:col(id)}});
    } else if (val(id, k) != null) avgs.push({value:[val(id, k), yi], id, symbol:'diamond', symbolSize:15, itemStyle:{color:col(id), borderColor:T.card, borderWidth:2}});
  });
  return Object.assign(base(), {
    tooltip:tip({trigger:'item', formatter:p => p.data.name ? tipRows(p.data.name, [{id:p.data.id, name:E[p.data.id].label, v:fmt(p.data.value[0], u)}], 'Empresa de la muestra de la industria')
      : tipRows(E[p.data.id].label, [{id:p.data.id, name:E[p.data.id].kind === 'ind' ? 'Promedio' : 'Valor', v:fmt(p.data.value[0], u)}], k)}),
    grid:{left:4, right:20, top:8, bottom:4, containLabel:true},
    yAxis:catAxis({data:rows, inverse:true, triggerEvent:false, splitLine:{show:true, lineStyle:{color:T.grid}}, axisLine:{show:false},
      axisLabel:{color:T.ink2, fontSize:12, interval:0, formatter:(n, i) => `{n|${n}}  {v|${fmt(val(ents[i], k), u)}}`, rich:{n:{color:T.ink2, fontSize:12}, v:{color:T.ink, fontSize:12, fontWeight:600}}}}),
    xAxis:valAxis(u, {splitNumber:4, scale:true}),
    series:[{type:'scatter', name:'Empresas', symbolSize:9, data:pts, z:2},
            {type:'scatter', name:'Promedio', data:avgs, z:3}],
  });
}

// composición 100%: filas = entidades, segmentos = partidas (rampas por grupo, no colores de entidad)
function buildStack(spec, w){
  const ents = spec.ents, parts = spec.items.concat(spec.resid ? ['__resid'] : []);
  const name = k => k === '__resid' ? spec.resid.name : k;
  const plotW = Math.max(120, w - 150);
  const get = (id, k) => k === '__resid' ? 1 - spec.items.reduce((s, x) => s + (val(id, x) || 0), 0) : val(id, k);
  const series = parts.map((k, j) => { const c = (spec.colors || [])[j] || T.c[j % 8]; return {type:'bar', name:name(k), stack:'s', barMaxWidth:26, itemStyle:{color:c, borderColor:T.card, borderWidth:1},
    emphasis:{focus:'series'}, data:ents.map(id => ({value:get(id, k), item:k === '__resid' ? null : k})),
    label:{show:true, position:'inside', color:inkOn(c), fontSize:11, formatter:p => { const v = p.value; const txt = pct(v, 0); return v != null && Math.abs(v) * plotW > txt.length * 7 + 8 ? txt : ''; }}}; });
  return Object.assign(base(), {
    legend:{type:'plain', bottom:0, left:0, right:0, itemWidth:12, itemHeight:12, itemGap:14, icon:'roundRect', textStyle:{color:T.ink2, fontSize:12}},
    tooltip:tip({trigger:'axis', axisPointer:{type:'shadow', shadowStyle:{color:rgba(T.axis, .1)}}, formatter:ps => { const id = ents[ps[0].dataIndex];
      return tipRows(E[id].label, ps.map(p => ({color:p.color, name:p.seriesName, v:pct(p.value)})), spec.base); }}),
    grid:{left:4, right:20, top:6, bottom:stackLegendH(parts.map(name), w) + 8, containLabel:true},
    yAxis:catAxis({data:ents.map(id => E[id].kind === 'co' ? E[id].label : E[id].short), inverse:true, triggerEvent:false}),
    xAxis:valAxis('pct', {max:v => Math.max(1, v.max), min:v => Math.min(0, v.min)}),
    series,
  });
}

function stackLegendH(names, w){ let rows = 1, x = 0; const avail = w - 10;
  names.forEach(n => { const iw = 12 + 5 + n.length * 6.6 + 14; if (x + iw > avail && x > 0){ rows++; x = 0; } x += iw; }); return rows * 22 + 6; }
// dispersión (DuPont o libre): x, y, tamaño
function buildScatter(spec, w){
  const {x, y, size} = spec, ents = spec.ents.filter(id => avail(id, x) && avail(id, y));
  const sz = size ? (() => { const vs = ents.map(id => Math.abs(val(id, size) || 0)); const m = Math.max(...vs) || 1; return id => 14 + 34 * Math.sqrt(Math.abs(val(id, size) || 0) / m); })() : () => 16;
  return Object.assign(base(), {
    legend:legend(ents),
    tooltip:tip({trigger:'item', formatter:p => { const id = p.data.id; const rows = [[x, val(id, x)], [y, val(id, y)]].concat(size ? [[size, val(id, size)]] : []);
      return tipRows(E[id].label, rows.map(([k, v]) => ({color:col(id), name:k, v:fmt(v, unitOf(k))}))); }}),
    grid:{left:10, right:24, top:ents.length > 1 ? 66 : 36, bottom:30, containLabel:true},
    xAxis:valAxis(unitOf(x), {name:x, nameLocation:'middle', nameGap:28, nameTextStyle:{color:T.ink2, fontSize:12}, scale:true, boundaryGap:['12%', '12%']}),
    yAxis:valAxis(unitOf(y), {name:'↑ ' + y, nameLocation:'end', nameGap:14, nameTextStyle:{color:T.ink2, fontSize:12, align:'left'}, scale:true, boundaryGap:['14%', '18%']}),
    series:ents.map(id => ({type:'scatter', name:E[id].label, symbol:symOf(id), data:[{value:[val(id, x), val(id, y)], id}], symbolSize:sz(id),
      itemStyle:{color:rgba(col(id), .85), borderColor:T.card, borderWidth:2},
      label:{show:true, position:'top', distance:4, color:T.ink, fontSize:12, fontWeight:600, formatter:() => E[id].short},
      labelLayout:{moveOverlap:'shiftY', hideOverlap:false}, emphasis:{scale:1.15}})),
  });
}

// desviación empresa × industria para una partida (cercanía: más oscuro = más parecido)
function closeness(d){ return d == null ? null : 1 - Math.min(1.2, Math.abs(d)) / 1.2; }
function buildDevHeat(spec, w){
  const k = spec.item, M = DEVM[k], data = [];
  CO.forEach((c, yi) => IND.forEach((ind, xi) => { const d = M[yi][xi]; const t = closeness(d); const bg = t == null ? T.card : seq(t);
    data.push({value:[xi, yi, t == null ? '-' : t], d, co:c, ind, label:{color:t == null ? T.muted : inkOn(bg)}}); }));
  return Object.assign(base(), {
    tooltip:tip({trigger:'item', formatter:p => tipRows(k, [{id:p.data.co, name:E[p.data.co].label, v:fmt(val(p.data.co, k), unitOf(k))}, {id:p.data.ind, name:p.data.ind, v:fmt(val(p.data.ind, k), unitOf(k))}],
      'Desviación: ' + (p.data.d == null ? 'no comparable' : fmtScaled(p.data.d, 'dev')))}),
    grid:{left:4, right:6, top:28, bottom:4, containLabel:true},
    xAxis:catAxis({data:IND.map(n => E[n].short), position:'top', axisLine:{show:false}, triggerEvent:false}),
    yAxis:catAxis({data:CO.map(c => E[c].label), inverse:true, axisLine:{show:false}, triggerEvent:false}),
    visualMap:{show:false, min:0, max:1, dimension:2, inRange:{color:[T.seq0, T.seq1]}},
    series:[{type:'heatmap', data, itemStyle:{borderColor:T.card, borderWidth:3, borderRadius:5}, label:{show:true, fontSize:12, formatter:p => p.data.d == null ? '—' : fmtScaled(p.data.d, 'dev')}}],
  });
}
function buildSimHeat(spec, w){
  const {res} = SUMMARY, data = [];
  res.forEach((r, yi) => IND.forEach((ind, xi) => { const m = r.med[xi]; const t = closeness(m); const bg = seq(t);
    data.push({value:[xi, yi, t], m, wins:r.wins[xi], co:r.n, ind, label:{color:inkOn(bg)}}); }));
  return Object.assign(base(), {
    tooltip:tip({trigger:'item', formatter:p => tipRows(`${E[p.data.co].label} vs ${p.data.ind}`, [{color:seq(p.data.value[2]), name:'Mediana |desviación|', v:pct(p.data.m, 0)}, {color:'transparent', name:'Partidas donde es la más cercana', v:p.data.wins + ' / 28'}])}),
    grid:{left:4, right:6, top:28, bottom:4, containLabel:true},
    xAxis:catAxis({data:IND.map(n => E[n].short), position:'top', axisLine:{show:false}, triggerEvent:false}),
    yAxis:catAxis({data:CO.map(c => E[c].label), inverse:true, axisLine:{show:false}, triggerEvent:false}),
    visualMap:{show:false, min:0, max:1, dimension:2, inRange:{color:[T.seq0, T.seq1]}},
    series:[{type:'heatmap', data, itemStyle:{borderColor:T.card, borderWidth:3, borderRadius:6}, label:{show:true, fontSize:12, lineHeight:16, formatter:p => pct(p.data.m, 0) + '\n(' + p.data.wins + ')'}}],
  });
}

// tabla (vista accesible de cualquier tarjeta)
function tableHTML(spec){
  const ents = spec.ents;
  const its = spec.kind === 'single' ? [spec.item] : spec.kind === 'dupont' || spec.kind === 'scatter' ? [spec.x, spec.y].concat(spec.size ? [spec.size] : []) : spec.items;
  let h = `<tr><th>Partida</th>${ents.map(id => `<th><span class="th-sw" style="background:${col(id)};${E[id].kind === 'co' ? 'border-radius:50%' : ''}"></span>${esc(E[id].kind === 'co' ? E[id].label : E[id].short)}</th>`).join('')}</tr>`;
  its.forEach(k => { h += `<tr><td><button class="it" data-item="${esc(k)}">${esc(k)}</button></td>${ents.map(id => `<td>${avail(id, k) ? fmt(val(id, k), unitOf(k)) : '<span style="color:var(--muted)">n/d</span>'}</td>`).join('')}</tr>`; });
  return `<div class="tbl" style="max-height:none;padding:4px 4px 8px"><table>${h}</table></div>`;
}

// =====================================================================
// 8. Tarjetas
// =====================================================================
let cardSeq = 0;
function card(parent, spec){
  spec.id = spec.id || ('c' + (cardSeq++));
  const d = document.createElement('div'); d.className = 'card'; d.style.containerType = 'inline-size';
  const ts = typesShown(spec), cur = typeOf(spec);
  const titleHTML = spec.item && !spec.noInfo ? `<button class="lnk" data-item="${esc(spec.item)}" title="Ver qué es, fórmula y cómo leerlo">${esc(spec.title)}</button>` : `<b>${esc(spec.title)}</b>`;
  const seg = ts.length > 1 ? `<div class="seg tseg">${ts.map(t => typeBtn(spec, t, cur)).join('')}</div>` : '';
  d.innerHTML = `<div class="card-h"><div class="card-t">${titleHTML}${spec.sub ? `<small>${spec.sub}</small>` : ''}</div><div class="card-a">${seg}
    ${spec.item && !spec.noInfo ? `<button class="mini" data-item="${esc(spec.item)}" title="Qué es y cómo se calcula" aria-label="Información">${svgI('info')}</button>` : ''}
    <div class="menu"><button class="mini mbtn" title="Más opciones" aria-label="Más opciones">${svgI('more')}</button><div class="menu-pop"></div></div></div></div>
    <div class="badge-n hide"></div><div class="chart"></div>${spec.insight ? `<div class="card-f"><p class="insight">${spec.insight}</p></div>` : '<div style="height:10px"></div>'}`;
  parent.appendChild(d);
  const el = d.querySelector('.chart'); el._card = d;
  updateBadge(d, spec);
  d.querySelector('.card-a').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b || b.disabled) return;
    if (b.dataset.t){ OVR[spec.id] = b.dataset.t; d.querySelectorAll('.tseg button').forEach(x => x.classList.toggle('on', x.dataset.t === b.dataset.t)); updateBadge(d, spec); draw(el, true); return; }
    if (b.classList.contains('mbtn')){ toggleMenu(d, spec, el); e.stopPropagation(); }
  });
  mount(el, spec);
  return d;
}
function updateBadge(d, spec){
  const t = typeOf(spec), b = d.querySelector('.badge-n');
  const mixed = spec.items && ['bar', 'hbar', 'line', 'area'].includes(t) && spec.kind !== 'stack' && scaleOf(spec) === 'norm' && spec.scale !== 'norm';
  const msg = mixed ? 'Unidades mixtas: escala relativa al máximo de cada partida (máx = 100). El tooltip muestra el valor real.' : t === 'radar' ? 'Cada eje tiene su propia escala (rango de todas las entidades).' : '';
  b.textContent = msg; b.classList.toggle('hide', !msg);
}
function svgI(k){ const P = {info:'<circle cx="10" cy="10" r="7.5"/><path d="M10 9v5M10 6.2v.1"/>', img:'<rect x="3" y="4" width="14" height="12" rx="2"/><circle cx="7.5" cy="8.5" r="1.4"/><path d="M3.5 14.5l4-4 3 3 2-2 4 4"/>', more:'<circle cx="4.5" cy="10" r="1" fill="currentColor"/><circle cx="10" cy="10" r="1" fill="currentColor"/><circle cx="15.5" cy="10" r="1" fill="currentColor"/>'};
  return `<svg viewBox="0 0 20 20" aria-hidden="true">${P[k]}</svg>`; }
function toggleMenu(d, spec, el){
  const pop = d.querySelector('.menu-pop'); const open = pop.classList.contains('open'); closeMenus(); if (open) return;
  const ts = typesShown(spec), cur = typeOf(spec);
  pop.innerHTML = (ts.length > 1 ? `<div class="mh">Tipo de gráfica</div>${ts.map(t => typeBtn(spec, t, cur, true)).join('')}<hr>` : '') +
    `<button data-a="png">${svgI('img')} Descargar imagen…</button>` + (!/heat$/.test(spec.kind || '') && (spec.ents.length > 1 || spec.items) ? `<button data-a="lab">${svg('radar')} Abrir en el comparador</button>` : '') +
    (spec.item ? `<button data-a="info">${svgI('info')} Qué es y cómo se calcula</button>` : '');
  pop.classList.add('open');
  pop.onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; closeMenus();
    if (b.dataset.t){ OVR[spec.id] = b.dataset.t; d.querySelectorAll('.tseg button').forEach(x => x.classList.toggle('on', x.dataset.t === b.dataset.t)); updateBadge(d, spec); draw(el, true); }
    else if (b.dataset.a === 'png') openExport(spec, el);
    else if (b.dataset.a === 'lab') sendToLab(spec);
    else if (b.dataset.a === 'info') openItem(spec.item); };
}
function closeMenus(){ document.querySelectorAll('.menu-pop.open').forEach(p => p.classList.remove('open')); }
document.addEventListener('click', e => { if (!e.target.closest('.menu')) closeMenus(); const b = e.target.closest('[data-item]'); if (b && !b.closest('.card-a .tseg')) { e.preventDefault(); openItem(b.dataset.item); } });
// ---------- Exportar imagen: título + subtítulo + leyenda + gráfica re-trazada al tamaño elegido + pie ----------
const EXP = {bg:'light', size:'wide'};
const EXP_SIZES = {screen:{n:'Como en pantalla'}, wide:{n:'Presentación 16:9', W:1600, H:900}, doc:{n:'Documento 4:3', W:1400, H:1050},
                   square:{n:'Cuadrado', W:1200, H:1200}, tall:{n:'Vertical 4:5', W:1080, H:1350}};
const EXP_BG = {light:'Claro', dark:'Oscuro', transparent:'Transparente'};
// Lee los tokens de otro tema sin repintar la página: cambia y restaura el atributo dentro de la misma tarea.
function withTheme(mode, fn){
  const root = document.documentElement, prev = root.getAttribute('data-theme');
  if (mode) root.setAttribute('data-theme', mode); readTheme();
  try { return fn(); } finally { if (prev == null) root.removeAttribute('data-theme'); else root.setAttribute('data-theme', prev); readTheme(); }
}
function wrapText(ctx, text, maxW){
  const out = []; let cur = '';
  String(text).split(/\s+/).forEach(w => { const t = cur ? cur + ' ' + w : w; if (ctx.measureText(t).width > maxW && cur){ out.push(cur); cur = w; } else cur = t; });
  if (cur) out.push(cur); return out;
}
const plain = h => { const d = document.createElement('div'); d.innerHTML = h || ''; return d.textContent.trim(); };
function exportType(spec){ const t = typeOf(spec); return t !== 'table' ? t : (spec.auto && spec.auto !== 'table' ? spec.auto : typesOf(spec).find(x => x !== 'table')); }
function exportCanvas(spec, el){
  const type = exportType(spec);
  const mode = EXP.bg === 'transparent' ? (isDark() ? 'dark' : 'light') : EXP.bg;
  return withTheme(mode, () => {
    if (EXP.bg === 'transparent') T.card = 'rgba(0,0,0,0)';
    const sz = EXP_SIZES[EXP.size];
    const screen = !sz.W;
    const z = screen ? 2 : sz.W / 1000;                    // factor de escala: el texto crece con la imagen
    const pad = Math.round(28 * z);
    const W = screen ? Math.round((el.clientWidth || 600) * z + 2 * pad) : sz.W;
    const cw = (W - 2 * pad) / z;                            // ancho lógico de la gráfica
    const cvs = document.createElement('canvas'), ctx = cvs.getContext('2d');
    const F = (px, wt) => `${wt || 400} ${Math.round(px * z)}px ${FONT}`;
    // leyenda propia de entidades (la composición conserva la suya, que es de partidas)
    const keepOwn = spec.kind === 'stack' || /heat$/.test(spec.kind || '');
    const ents = (spec.kind === 'single' || spec.kind === 'dupont' || spec.kind === 'scatter') && spec.item ? spec.ents.filter(id => avail(id, spec.item)) : spec.ents;
    ctx.font = F(20, 700); const tl = wrapText(ctx, spec.title || '', W - 2 * pad);
    ctx.font = F(13); const sl = spec.sub ? wrapText(ctx, plain(spec.sub), W - 2 * pad) : [];
    ctx.font = F(13); const items = keepOwn ? [] : ents.map(id => ({id, w:ctx.measureText(E[id].label).width + 22 * z}));
    const rows = []; let row = [], x = 0;
    items.forEach(it => { if (x + it.w > W - 2 * pad && row.length){ rows.push(row); row = []; x = 0; } row.push(it); x += it.w + 18 * z; });
    if (row.length) rows.push(row);
    const headH = pad + tl.length * 27 * z + sl.length * 19 * z + (rows.length ? 10 * z + rows.length * 22 * z : 0) + 14 * z;
    const footH = 14 * z + 16 * z + pad * 0.8;
    const ch = screen ? heightOf(spec, type, cw) : Math.max(160, (sz.H - headH - footH) / z);
    const H = screen ? Math.round(headH + ch * z + footH) : sz.H;
    // gráfica fuera de pantalla, re-trazada al tamaño lógico
    const div = document.createElement('div'); div.style.cssText = `position:fixed;left:-20000px;top:0;width:${cw}px;height:${ch}px`; document.body.appendChild(div);
    const c = echarts.init(div, null, {renderer:'canvas', devicePixelRatio:z});
    const opt = build(spec, type, cw, ch); opt.animation = false;
    if (!keepOwn && opt.legend){ opt.legend = {show:false}; if (opt.grid) opt.grid.top = (type === 'dupont' || type === 'scatter') ? 36 : (type === 'hbar' && spec.kind !== 'single' ? 8 : 16);
      if (opt.radar) opt.radar.center = ['50%', '52%']; }
    if (opt.legend && opt.legend.type === 'scroll') opt.legend.type = 'plain';
    if (opt.tooltip) opt.tooltip.show = false;
    // aprovechar el espacio extra del formato: barras más gruesas y radar más grande
    const grow = Math.min(2.4, ch / heightOf(spec, type, cw));
    if (grow > 1.05) (opt.series || []).forEach(se => { if (se.type === 'bar' && se.barMaxWidth) se.barMaxWidth = Math.round(se.barMaxWidth * grow); });
    if (opt.radar) opt.radar.radius = cw < 520 ? '60%' : '70%';
    c.setOption(opt);
    const img = c.getRenderedCanvas({pixelRatio:z, backgroundColor:'transparent'});
    c.dispose(); div.remove();
    // composición
    cvs.width = W; cvs.height = H;
    if (EXP.bg !== 'transparent'){ ctx.fillStyle = T.card; ctx.fillRect(0, 0, W, H); }
    ctx.textBaseline = 'top'; let y = pad;
    ctx.fillStyle = T.ink; ctx.font = F(20, 700); tl.forEach(l => { ctx.fillText(l, pad, y); y += 27 * z; });
    ctx.fillStyle = T.ink2; ctx.font = F(13); sl.forEach(l => { ctx.fillText(l, pad, y); y += 19 * z; });
    if (rows.length){ y += 10 * z; ctx.font = F(13);
      rows.forEach(r => { let lx = pad; r.forEach(it => { const s = 12 * z, col0 = col(it.id); ctx.fillStyle = col0; ctx.beginPath();
          if (E[it.id].kind === 'co') ctx.arc(lx + s / 2, y + 3 * z + s / 2, s / 2, 0, 7); else { ctx.roundRect ? ctx.roundRect(lx, y + 3 * z, s, s, 3 * z) : ctx.rect(lx, y + 3 * z, s, s); }
          ctx.fill(); ctx.fillStyle = T.ink2; ctx.fillText(E[it.id].label, lx + s + 7 * z, y + 2 * z); lx += it.w + 18 * z; }); y += 22 * z; }); }
    ctx.drawImage(img, pad, headH, W - 2 * pad, ch * z);
    ctx.fillStyle = T.muted; ctx.font = F(11);
    ctx.fillText('Detective financiero · Fuente: 20261001_Detective_Financiero_v3.xlsx' + (spec.item ? ' · ' + baseOf(byShort[spec.item]) : ''), pad, H - footH + 14 * z);
    return cvs;
  });
}
function openExport(spec, el){
  let m = document.getElementById('expModal');
  if (!m){ m = document.createElement('div'); m.id = 'expModal'; m.className = 'modal'; document.body.appendChild(m); }
  const seg = (k, opts) => `<div class="seg" data-k="${k}">${Object.entries(opts).map(([v, n]) => `<button data-v="${v}" class="${EXP[k] === v ? 'on' : ''}">${typeof n === 'string' ? n : n.n}</button>`).join('')}</div>`;
  m.innerHTML = `<div class="modal-c" role="dialog" aria-modal="true" aria-label="Descargar imagen"><div class="dr-head"><div class="dr-title">Descargar imagen · ${esc(spec.title)}</div><button class="icon-btn" data-x="1" aria-label="Cerrar">✕</button></div>
    <div class="exp-b"><div class="exp-prev ${EXP.bg === 'transparent' ? 'chk' : ''}"><img alt="Vista previa"></div>
    <div class="exp-o"><label class="ctl">Fondo</label>${seg('bg', EXP_BG)}<label class="ctl">Tamaño</label>${seg('size', EXP_SIZES)}
      <p class="sub exp-info" style="margin:4px 0 0"></p><p class="sub" style="font-size:12px;margin:0">La gráfica se vuelve a trazar al tamaño elegido e incluye título, leyenda y fuente.${typeOf(spec) === 'table' ? ' Esta tarjeta está en tabla: se exporta como ' + TNAME[exportType(spec)].toLowerCase() + '.' : ''}</p>
      <button class="pill on exp-go" style="padding:9px 16px;font-size:14px;align-self:flex-start">Descargar PNG</button></div></div></div>`;
  let cvs;
  const refresh = () => { cvs = exportCanvas(spec, el); m.querySelector('img').src = cvs.toDataURL('image/png');
    m.querySelector('.exp-prev').classList.toggle('chk', EXP.bg === 'transparent');
    m.querySelector('.exp-info').textContent = `${cvs.width} × ${cvs.height} px · PNG · fondo ${EXP_BG[EXP.bg].toLowerCase()}`; };
  m.onclick = e => {
    if (e.target === m || e.target.closest('[data-x]')){ m.classList.remove('open'); return; }
    const b = e.target.closest('.seg button'); if (b){ EXP[b.parentNode.dataset.k] = b.dataset.v; b.parentNode.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b)); refresh(); return; }
    if (e.target.closest('.exp-go')){ const a = document.createElement('a'); a.href = cvs.toDataURL('image/png');
      a.download = (spec.title || 'grafica').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^\w ]+/g, '').trim().replace(/\s+/g, '_') + `_${cvs.width}x${cvs.height}.png`; a.click(); }
  };
  m.classList.add('open'); refresh();
}
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ const m = document.getElementById('expModal'); if (m) m.classList.remove('open'); } });

function sendToLab(spec){
  const its = spec.kind === 'single' ? [spec.item] : spec.kind === 'dupont' ? ['Rotación de activos totales', 'Margen operacional', 'ROE'] : (spec.items || []);
  LAB.ents = spec.ents.slice(); LAB.items = its.filter(k => !CONST_ITEMS.test(k)); LAB.preset = null;
  const t = typeOf(spec); LAB.type = MULTI.includes(t) ? t : (LAB.items.length >= 3 ? 'radar' : 'bar');
  go('lab');
}

// =====================================================================
// 9. Bloques reutilizables
// =====================================================================
const ASSET_FULL = ['Efectivo', 'Inversiones CP', 'Cuentas por cobrar', 'Inventarios', 'Otros act. circulantes', 'PP&E neto', 'Intangibles', 'Inversiones LP', 'Otros act. no circulantes'];
const ASSET_RED = ['Efectivo', 'Inversiones CP', 'Cuentas por cobrar', 'Inventarios', 'Otros act. circulantes', 'PP&E neto', 'Inversiones LP', 'Otros act. LP (intang. + otros)'];
const FIN = ['Cuentas por pagar', 'Deuda CP', 'Otros pas. circulantes', 'Deuda LP', 'Otros pas. no circulantes', 'Total capital'];
const BLUE = ['#184f95', '#2a78d6', '#5598e7', '#86b6ef', '#b7d3f6'], WARM = ['#9a3412', '#c2410c', '#eb6834', '#f4a27e', '#f9cdb6'];
function okFor(ents, keys){ return keys.every(k => ents.every(id => avail(id, k))); }
function radiografia(parent, ents, reduced, ins){
  const g = el('div', 'grid2', parent);
  const assets = reduced ? ASSET_RED : ASSET_FULL;
  if (okFor(ents, assets)) card(g, {kind:'stack', id:'stk-act-' + ents.join(), title:'¿De qué está hecho el activo?', sub:'% del total de activos · azules = circulante, cálidos = no circulante', ents, items:assets, base:'% del total de activos',
    colors:BLUE.concat(reduced ? [WARM[0], WARM[2], WARM[3]] : [WARM[0], WARM[1], WARM[3], WARM[4]]), insight:ins.act});
  if (okFor(ents, FIN)) card(g, {kind:'stack', id:'stk-fin-' + ents.join(), title:'¿Cómo se financia?', sub:'% del total de activos · claros = pasivo circulante, oscuros = pasivo LP, azul = capital', ents, items:FIN, base:'% del total de activos',
    colors:[WARM[4], WARM[3], WARM[2], WARM[1], WARM[0], '#2a78d6'], insight:ins.fin});
  const dol = ['Costo de ventas', 'SG&A', 'I+D', 'Impuestos', 'Utilidad neta'];
  if (okFor(ents, dol)) card(parent, {kind:'stack', id:'stk-dol-' + ents.join(), title:'¿A dónde va cada dólar de ingreso?', sub:'% de ingresos · D&A ya está dentro de costo y gastos', ents, items:dol, base:'% de ingresos',
    resid:{name:'Otros gastos, intereses y otros (neto)'}, colors:['#8a8985', '#f4a27e', '#c2410c', '#7c2d12', '#2a78d6', '#d6d4cc'], insight:ins.dol});
}
function keyBlocks(parent, ents, ins, full){
  const g = el('div', 'grid2', parent);
  const B = (o) => { const its = (o.items || []).filter(k => ents.every(id => avail(id, k))); if (o.items && !its.length) return; card(g, Object.assign({ents}, o, o.items ? {items:its} : {})); };
  if (okFor(ents, ['Margen operacional', 'Rotación de activos totales', 'ROE'])) card(g, {kind:'dupont', id:'dup-' + ents.join(), title:'DuPont: margen × rotación', sub:'Tamaño de la burbuja = ROE · clic en una burbuja para ver la partida', ents,
    x:'Rotación de activos totales', y:'Margen operacional', size:'ROE', insight:ins.dupont});
  card(g, {kind:'single', item:'ROE', id:'k-roe-' + ents.join(), title:'ROE', sub:'Utilidad neta / capital contable', ents, insight:ins.roe});
  B({id:'k-liq', title:'Liquidez: razón corriente y prueba ácida', sub:'veces', items:['Razón corriente', 'Prueba ácida', 'Razón de efectivo'], auto:'bar', insight:ins.liq});
  B({id:'k-dias', title:'Días de inventario y días de cobro', sub:'días', items:['Días de inventario', 'Días de cuentas por cobrar'], auto:'bar', insight:ins.days});
  B({id:'k-apal', title:'Apalancamiento', sub:'% del activo', items:['Deuda LP', 'Deuda financiera', 'Total pasivos', 'Total capital'], auto:'bar', insight:'Estructura de financiamiento: deuda con costo vs pasivo total vs capital.'});
  B({id:'k-int', title:'Intensidad del activo', sub:'% del activo', items:full ? ['PP&E neto', 'Intangibles', 'Liquidez inmediata'] : ['PP&E neto', 'Otros act. LP (intang. + otros)', 'Liquidez inmediata'], auto:'bar',
    insight:'Dónde está invertido el activo: físico (PP&E), intangible/otros LP o líquido.'});
  B({id:'k-rot', title:'Rotación de activos totales y fijos', sub:'veces', items:['Rotación de activos totales', 'Rotación de activos fijos netos'], auto:'bar', insight:'Cuántas veces vende su activo al año: alta rotación = negocio de volumen.'});
  if (full){
    B({id:'k-cost', title:'Estructura de costos', sub:'% de ingresos', items:['Costo de ventas', 'SG&A', 'I+D'], auto:'bar', insight:'Intensidad de costo de ventas vs gasto comercial vs I+D.'});
    B({id:'k-ciclo', title:'Ciclo de conversión de efectivo', sub:'días', items:['Días de cuentas por cobrar', 'Días de inventario', 'Días de cuentas por pagar', 'Ciclo de efectivo'], auto:'bar', insight:'Ciclo de efectivo = cobro + inventario − pago.'});
    B({id:'k-rent', title:'Rentabilidad: ROA, ROIC, ROE y margen neto', sub:'%', items:['ROA', 'ROIC', 'ROE', 'Margen neto'], auto:'bar', insight:'Rentabilidad sobre activos, capital invertido y capital contable.'});
  } else {
    B({id:'k-rent', title:'Rentabilidad (DuPont despejado)', sub:'%', items:['ROE', 'ROA implícito', 'Margen neto implícito', 'Margen operacional'], auto:'bar', insight:'A–D no reportan margen neto: se despeja de ROE × capital ÷ rotación.'});
  }
  const huella = full ? ['Margen operacional', 'ROE', 'Rotación de activos totales', 'Razón corriente', 'Días de inventario', 'Ciclo de efectivo', 'Nivel de endeudamiento', 'PP&E neto', 'Intangibles', 'Utilidad bruta']
                      : ['Margen operacional', 'ROE', 'Rotación de activos totales', 'Razón corriente', 'Días de inventario', 'Días de cuentas por cobrar', 'Total pasivos', 'PP&E neto', 'Liquidez inmediata', 'Rotación de activos fijos netos'];
  B({id:'k-huella', title:'Huella financiera', sub:'Cada eje con su propia escala', items:huella, auto:'radar', insight:'La forma del polígono es la "huella" de cada uno. Cambia a barras, líneas o calor con los iconos.'});
}
function categorySections(parent, ents, filter, n0, tocs){
  let n = n0;
  D.cats.forEach(c => {
    const items = c.items.filter(it => filter(it) && ents.every(id => avail(id, it.short)) && !CONST_ITEMS.test(it.short)).map(it => it.short); if (!items.length) return;
    const ind = c.name.startsWith('Indicadores'); const aid = 'sec' + n; tocs.push([aid, c.name.replace('Indicadores: ', '')]);
    const sec = el('section', '', parent);
    sec.innerHTML = `<h2 id="${aid}">${n}. ${esc(c.name)}${c.name.endsWith('Derivados') ? ' <span class="tag">calculado</span>' : ''}</h2><p class="sub">${ind ? 'Cada indicador en su unidad. Clic en cualquier nombre para ver su fórmula y cómo leerlo.' : (['Activos', 'Pasivos', 'Capital'].includes(c.name) ? 'Cada partida como % del total de activos.' : 'Cada partida como % de ingresos.')}</p>`;
    n++;
    card(sec, {id:'cat-' + c.name, title:c.name + ' — todas las partidas', sub:ind ? 'Color = posición dentro de cada fila (más oscuro = mayor)' : 'Clic en una partida para ver su detalle', ents, items, auto:ind ? 'heat' : 'hbar'});
    const h3 = el('h3', '', sec); h3.textContent = 'Partida por partida';
    const g = el('div', 'grid', sec);
    items.forEach(k => card(g, {kind:'single', id:'one-' + k + ents.length, item:k, title:k, sub:baseOf(byShort[k]), ents, auto:'hbar'}));
  });
  return n;
}
function tableFor(parent, ents, filter, title, aid){
  const sec = el('section', '', parent); sec.innerHTML = `<h2 id="${aid}">${title}</h2>`;
  let h = `<tr><th>Partida</th>${ents.map(id => `<th><span class="th-sw" style="background:${col(id)}"></span>${esc(E[id].kind === 'co' ? E[id].label : E[id].label)}</th>`).join('')}<th>Base</th></tr>`;
  D.cats.forEach(c => { const its = c.items.filter(it => filter(it) && ents.every(id => avail(id, it.short))); if (!its.length) return;
    h += `<tr class="cat"><td colspan="${ents.length + 2}">${esc(c.name)}</td></tr>`;
    its.forEach(it => { h += `<tr><td><button class="it" data-item="${esc(it.short)}">${esc(it.short)}</button></td>${ents.map(id => `<td>${fmt(val(id, it.short), it.unit)}</td>`).join('')}<td style="color:var(--muted)">${baseOf(it)}</td></tr>`; }); });
  const d = el('div', 'card tbl', sec); d.innerHTML = `<table>${h}</table>`;
}
function chips(parent, ents){ const d = el('div', 'chips', parent); d.innerHTML = ents.map(id => `<div class="chip">${swatch(id)}<b>${esc(E[id].label)}</b><span>${esc(E[id].sub)}</span></div>`).join(''); }
function el(tag, cls, parent){ const d = document.createElement(tag); if (cls) d.className = cls; if (parent) parent.appendChild(d); return d; }
function hero(root, title, sub, tocs){
  const h = el('div', 'hero', root); h.innerHTML = `<h1>${title}</h1><p class="sub">${sub}</p><div class="toc"></div>`;
  return () => { h.querySelector('.toc').innerHTML = tocs.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join(''); };
}

// =====================================================================
// 10. Desviaciones (misma lógica que tools/deviations_excel.py)
// =====================================================================
let DEVM = {}, SUMMARY = null;
function computeSummary(){
  DEVM = {}; D.reduced.forEach(k => { DEVM[k] = CO.map(c => IND.map(i => { const cv = val(c, k), av = val(i, k); return (cv == null || av == null || av === 0) ? null : (cv - av) / Math.abs(av); })); });
  const res = CO.map((n, ci) => {
    const wins = [0, 0, 0, 0], abs = [[], [], [], []];
    D.reduced.forEach(k => { const d = DEVM[k][ci]; const ok = d.map((x, j) => [x == null ? Infinity : Math.abs(x), j]).filter(p => p[0] !== Infinity); if (!ok.length) return;
      ok.sort((a, b) => a[0] - b[0]); wins[ok[0][1]]++; d.forEach((x, j) => { if (x != null) abs[j].push(Math.abs(x)); }); });
    const med = abs.map(median);
    const order = [0, 1, 2, 3].sort((a, b) => (wins[b] - wins[a]) || (med[a] - med[b]));
    return {n, wins, med, best:order[0], second:order[1]};
  });
  SUMMARY = {res};
}

// =====================================================================
// 11. Vistas
// =====================================================================
function viewInd(root){
  const ents = IND, full = !S.reduced, tocs = [];
  const filter = full ? (() => true) : (it => RED.has(it.short) || it.derived);
  const fin = hero(root, 'Industrias', `Promedio simple de 4 empresas por industria. Balance como % del total de activos · estado de resultados como % de ingresos · indicadores en sus unidades.${full ? '' : ' <b>Vista reducida:</b> solo las partidas que traen las empresas A–D (+ derivados).'}`, tocs);
  chips(root, ents);
  if (full) root.insertAdjacentHTML('beforeend', `<div class="note"><b>Nota:</b> en Biotech, IQVIA e ICON (CROs) no manejan inventario; sus ceros bajan el promedio de rotación y días de inventario. La cobertura de intereses sale negativa en Biotech, Tech y Pharma porque tienen ingreso neto por intereses.</div>`);
  tocs.push(['sec1', 'Radiografía']); root.insertAdjacentHTML('beforeend', `<h2 id="sec1">1. Radiografía de cada industria</h2><p class="sub">Composición del activo, cómo se financia y a dónde va cada dólar de ingreso.</p>`);
  radiografia(root, ents, !full, {act:'O&G vive de PP&E (66%); Biotech acumula efectivo (27%) y, en las CROs, intangibles; Pharma y Tech cargan intangibles por adquisiciones.',
    fin:'Tech es la que menos se apalanca (61% capital); Pharma la que más (65% pasivos, 30% deuda LP).',
    dol:'O&G gasta 79¢ de cada dólar en costo de ventas y le quedan 8¢ netos; Pharma solo 24¢ de costo pero reinvierte ~40¢ en SG&A + I+D; Tech y Pharma dejan ~28¢ netos.'});
  tocs.push(['sec2', 'Indicadores clave']); root.insertAdjacentHTML('beforeend', '<h2 id="sec2">2. Indicadores clave para diferenciar las industrias</h2><p class="sub">Cambia el tipo de gráfica de cada bloque con los iconos de su esquina, o de todos a la vez con el selector de arriba.</p>');
  keyBlocks(root, ents, {dupont:'O&G gana por volumen (rotación 0.94×, margen 12%); Pharma y Tech por margen (32–37%); Biotech queda en medio.',
    roe:'Pharma (44%) y Tech (34%) muy por encima de O&G (10%) y Biotech (12%).', liq:'Tech y Biotech tienen razón corriente ~2.6×; O&G y Pharma operan cerca de 1.3× y con prueba ácida < 1.',
    days:'Pharma tarda 242 días en rotar inventario y 76 en cobrar; O&G rota en 27 y cobra en 30.'}, full);
  const n = categorySections(root, ents, filter, 3, tocs);
  tocs.push(['secT', 'Tabla']); tableFor(root, ents, filter, `${n}. Tabla de promedios por industria`, 'secT');
  fin();
}
function viewEmp(root){
  const ents = CO, tocs = [];
  const filter = it => RED.has(it.short) || it.derived;
  const fin = hero(root, 'Empresas A–D', 'Las cuatro empresas por identificar, con las 28 partidas que trae la tabla del ejercicio más los indicadores derivados (balance como % del total de activos; indicadores en sus unidades).', tocs);
  chips(root, ents);
  root.insertAdjacentHTML('beforeend', `<div class="note"><b>Nota:</b> C y D traen días de inventario en 0 y D días de cobro en 0; se tratan como dato no disponible (—).</div>`);
  tocs.push(['sec1', 'Radiografía']); root.insertAdjacentHTML('beforeend', `<h2 id="sec1">1. Radiografía de cada empresa</h2>`);
  radiografia(root, ents, true, {act:'A: 25% en inversiones temporales y poco PP&E. C: 77% PP&E. D: 54% en otros activos LP (intangibles).',
    fin:'A casi sin deuda (76% capital); B es la más apalancada (76% pasivos, 37% deuda LP).'});
  tocs.push(['sec2', 'Indicadores clave']); root.insertAdjacentHTML('beforeend', '<h2 id="sec2">2. Indicadores clave</h2>');
  keyBlocks(root, ents, {dupont:'A y B tienen márgenes altísimos (60% y 40%) con ROE ~100%; C y D ganan poco por unidad de activo.', roe:'',
    liq:'A nada en liquidez (3.9×); C opera por debajo de 1×.', days:'B tarda 352 días en rotar inventario (perfil farma); A 92 días.'}, false);
  const n = categorySections(root, ents, filter, 3, tocs);
  tocs.push(['secT', 'Tabla']); tableFor(root, ents, filter, `${n}. Tabla de las empresas A–D`, 'secT');
  fin();
}
function viewVs(root){
  const {res} = SUMMARY, tocs = [];
  const fin = hero(root, 'Empresas vs industrias', `Cada empresa A–D contra el promedio de las cuatro industrias, en las 28 partidas comparables. ${S.dev ? '<b>Modo desviación:</b> (valor empresa − promedio industria) / |promedio industria|; más oscuro = más parecido.' : 'Activa <b>Desviación %</b> arriba para ver las diferencias en lugar de los valores.'}`, tocs);
  chips(root, ALL);
  tocs.push(['sec1', '¿A qué se parece?']);
  root.insertAdjacentHTML('beforeend', `<h2 id="sec1">1. ¿A qué industria se parece cada empresa?</h2><p class="sub">Se cuenta en cuántas de las 28 partidas cada industria es la más cercana, y la mediana de |desviación| contra cada industria.</p>`);
  const g = el('div', 'grid2', root);
  const bl = el('div', 'card', g);
  bl.innerHTML = `<div class="card-h"><div class="card-t"><b>Veredicto del detective</b><small>Más parecida = más partidas ganadas; desempate por mediana</small></div></div><div class="tbl" style="padding:6px 6px 0"><table><tr><th>Empresa</th><th>Más parecida</th><th>Partidas</th><th>Mediana |desv|</th><th>2ª opción</th><th></th></tr>` +
    res.map(r => { const b = IND[r.best], o = IND[r.second];
      return `<tr><td>${swatch(r.n)} <b>Empresa ${r.n}</b></td><td><span class="bdg">${swatch(b)} ${esc(b)}</span></td><td>${r.wins[r.best]} / 28</td><td>${pct(r.med[r.best], 0)}</td><td style="color:var(--muted)">${esc(o)}: ${r.wins[r.second]} · ${pct(r.med[r.second], 0)}</td>
        <td><button class="pill" data-cmp="${r.n},${esc(b)}">Comparar</button></td></tr>`; }).join('') + `</table></div>
    <div class="card-f" style="padding-top:10px"><p class="insight">A y D caen en Tech; B en Pharma; C en O&G. Si cada industria debe usarse una sola vez, la combinación de menor desviación total es A → Biotech y D → Tech (A queda casi empatada entre ambas).</p></div>`;
  bl.querySelectorAll('[data-cmp]').forEach(b => b.onclick = () => { const [c, i] = b.dataset.cmp.split(','); LAB.ents = [i, c]; LAB.items = null; LAB.preset = 'huella'; LAB.type = 'radar'; go('lab'); });
  card(g, {kind:'simheat', id:'simheat', title:'Parecido empresa × industria', sub:'Mediana de |desviación| (más oscuro = más parecido) · entre paréntesis, # de partidas donde es la más cercana', ents:CO, fixed:'heat'});
  let n = 2;
  D.cats.forEach(c => {
    const items = c.items.filter(it => RED.has(it.short)); if (!items.length) return;
    const aid = 'sec' + n; tocs.push([aid, c.name.replace('Indicadores: ', '')]);
    const sec = el('section', '', root); sec.innerHTML = `<h2 id="${aid}">${n}. ${esc(c.name)}</h2>`; n++;
    const gg = el('div', 'grid', sec);
    items.forEach(it => {
      if (!S.dev) card(gg, {kind:'single', id:'vs-' + it.short, item:it.short, title:it.short, sub:baseOf(it), ents:ALL, auto:'hbar'});
      else card(gg, {kind:'devheat', id:'dv-' + it.short, item:it.short, title:it.short, sub:'Desviación de cada empresa vs cada industria', ents:CO, fixed:'heat'});
    });
  });
  tocs.push(['secT', 'Tabla']);
  const sec = el('section', '', root); sec.innerHTML = `<h2 id="secT">Tabla: empresas vs industrias${S.dev ? ' (desviación % vs la industria más parecida)' : ''}</h2>`;
  let h = `<tr><th>Partida</th>${ALL.map(id => `<th><span class="th-sw" style="background:${col(id)}"></span>${esc(E[id].kind === 'co' ? E[id].label : E[id].short)}</th>`).join('')}</tr>`;
  D.cats.forEach(c => { const its = c.items.filter(it => RED.has(it.short)); if (!its.length) return; h += `<tr class="cat"><td colspan="9">${esc(c.name)}</td></tr>`;
    its.forEach(it => { const k = it.short;
      h += `<tr><td><button class="it" data-item="${esc(k)}">${esc(k)}</button></td>` + (S.dev ? CO.map((nm, ci) => { const r = res[ci]; const d = DEVM[k][ci][r.best];
        return `<td title="vs ${esc(IND[r.best])}">${d == null ? '—' : fmtScaled(d, 'dev') + ` <span style="color:var(--muted)">vs ${esc(E[IND[r.best]].short)}</span>`}</td>`; }).join('') : CO.map(c => `<td>${fmt(val(c, k), it.unit)}</td>`).join(''))
        + IND.map(i => `<td>${fmt(val(i, k), it.unit)}</td>`).join('') + '</tr>'; }); });
  const d = el('div', 'card tbl', sec); d.innerHTML = `<table>${h}</table>`;
  fin();
}

// ---------- Comparador ----------
const PRESETS = [
  ['huella', 'Huella detective', ['Margen operacional', 'ROE', 'Rotación de activos totales', 'Razón corriente', 'Prueba ácida', 'Días de inventario', 'Días de cuentas por cobrar', 'PP&E neto', 'Otros act. LP (intang. + otros)', 'Total pasivos', 'Liquidez inmediata', 'Rotación de activos fijos netos']],
  ['activo', 'Estructura del activo', ASSET_RED.concat(['Intangibles', 'Otros act. no circulantes'])],
  ['fin', 'Financiamiento', FIN],
  ['liq', 'Liquidez', ['Razón corriente', 'Prueba ácida', 'Razón de efectivo', 'Capital de trabajo / Activo', 'Liquidez inmediata']],
  ['efi', 'Eficiencia', ['Rotación de activos totales', 'Rotación de activos fijos netos', 'Rotación de inventario', 'Días de inventario', 'Días de cuentas por cobrar', 'Días de cuentas por pagar', 'Ciclo de efectivo']],
  ['dupont', 'Rentabilidad y DuPont', ['ROE', 'ROA implícito', 'Margen neto implícito', 'Margen operacional', 'Rotación de activos totales', 'Multiplicador de capital']],
  ['apal', 'Apalancamiento', ['Total pasivos', 'Deuda financiera', 'Deuda LP', 'Deuda / Capital', 'Multiplicador de capital']],
  ['res', 'Estado de resultados', ['Costo de ventas', 'Utilidad bruta', 'SG&A', 'I+D', 'EBIT', 'EBITDA', 'Utilidad neta']],
  ['todas', 'Todas las disponibles', null],
];
// "Nuestras Asociaciones": la asignación elegida por el equipo (empresa -> industria). No es el cálculo de
// computeSummary (que sigue en la vista "Empresas vs industrias"); D se asocia a Biotech por decisión del equipo.
const ASOC = {A:'Tecnología', B:'Pharma', C:'O&G', D:'Biotech'};
const LAB_TYPES = ['bar', 'hbar', 'radar', 'line', 'area', 'heat', 'scatter', 'table'];
const labAvail = k => LAB.ents.length ? LAB.ents.every(id => avail(id, k)) : true;
function labItems(){
  const all = ITEMS.filter(it => !CONST_ITEMS.test(it.short) && labAvail(it.short)).map(it => it.short);
  if (LAB.preset){ const p = PRESETS.find(x => x[0] === LAB.preset); LAB.items = p[2] ? p[2].filter(k => byShort[k] && labAvail(k)) : all.slice(); }
  if (!LAB.items) LAB.items = PRESETS[0][2].filter(labAvail);
  LAB.items = LAB.items.filter(k => byShort[k] && labAvail(k));
  return LAB.items;
}
function viewLab(root){
  if (!LAB.ents.length) LAB.ents = ['Pharma', 'B'];
  const its = labItems();
  if (!LAB.ref || !LAB.ents.includes(LAB.ref)) LAB.ref = LAB.ents.find(id => E[id].kind === 'ind') || LAB.ents[0];
  const h = el('div', 'hero', root);
  h.innerHTML = `<h1>Comparador</h1><p class="sub">Elige quiénes comparar (industrias y/o empresas) y qué partidas; luego cambia la forma de verlos. Todo queda superpuesto en un mismo gráfico. El enlace de la página guarda tu selección.</p>`;
  const wrap = el('div', 'lab', root);
  const side = el('div', 'lab-side', wrap), main = el('div', 'lab-main', wrap);
  // --- entidades
  const pe = el('div', 'panel', side);
  const sugg = CO.map(c => [ASOC[c], c]);
  pe.innerHTML = `<h4>Quiénes <span class="spacer"></span><button data-q="ind">Industrias</button>·<button data-q="co">Empresas</button>·<button data-q="all">Todas</button></h4>
    <div class="ents">${ALL.map(id => `<div class="ent ${LAB.ents.includes(id) ? 'on' : ''}" data-e="${esc(id)}" role="checkbox" aria-checked="${LAB.ents.includes(id)}" tabindex="0">${swatch(id)}<span>${esc(E[id].label)}</span></div>`).join('')}</div>
    <h4 style="margin-top:12px">Nuestras Asociaciones</h4><div class="presets">${sugg.map(([i, c]) => `<button class="pill ${LAB.ents.length === 2 && LAB.ents.includes(i) && LAB.ents.includes(c) ? 'on' : ''}" data-duel="${esc(i)},${c}">${c} vs ${esc(E[i].short)}</button>`).join('')}</div>`;
  pe.addEventListener('click', e => {
    const t = e.target.closest('[data-e],[data-q],[data-duel]'); if (!t) return;
    if (t.dataset.e){ const id = t.dataset.e; LAB.ents = LAB.ents.includes(id) ? LAB.ents.filter(x => x !== id) : ALL.filter(x => LAB.ents.includes(x) || x === id); }
    else if (t.dataset.q) LAB.ents = t.dataset.q === 'ind' ? IND.slice() : t.dataset.q === 'co' ? CO.slice() : ALL.slice();
    else { const [i, c] = t.dataset.duel.split(','); LAB.ents = [i, c]; }
    if (!LAB.ents.length) LAB.ents = [t.dataset.e || 'Pharma'];
    rerenderLab();
  });
  pe.addEventListener('keydown', e => { if ((e.key === ' ' || e.key === 'Enter') && e.target.dataset.e){ e.preventDefault(); e.target.click(); } });
  // --- partidas
  const pi = el('div', 'panel', side);
  const nAll = ITEMS.filter(it => !CONST_ITEMS.test(it.short)).length;
  pi.innerHTML = `<h4>Qué partidas <span class="spacer"></span><button data-clear="1">Limpiar</button></h4>
    <div class="presets" style="margin-bottom:10px">${PRESETS.map(([id, n]) => `<button class="pill ${LAB.preset === id ? 'on' : ''}" data-p="${id}">${n}</button>`).join('')}</div>
    <details class="pick" ${innerWidth > 960 ? 'open' : ''}><summary>Elegir partidas una por una</summary><div class="items">${D.cats.map(c => { const list = c.items.filter(it => !CONST_ITEMS.test(it.short)); const sel = list.filter(it => its.includes(it.short)).length;
      return `<details ${sel && innerWidth > 960 ? 'open' : ''}><summary>${esc(c.name.replace('Indicadores: ', 'Ind. '))}<span class="cnt">${sel}/${list.length}</span></summary>${list.map(it => { const ok = labAvail(it.short);
        return `<label class="${ok ? '' : 'na'}" title="${ok ? '' : 'No disponible para alguna de las entidades elegidas'}"><input type="checkbox" data-k="${esc(it.short)}" ${its.includes(it.short) ? 'checked' : ''} ${ok ? '' : 'disabled'}> ${esc(it.short)}${it.derived ? ' <span class="tag">calc.</span>' : ''}</label>`; }).join('')}</details>`; }).join('')}</div></details>
    <p class="sub" style="margin:8px 0 0;font-size:12px">${its.length} de ${nAll} partidas · las que no traen A–D se desactivan al elegir una empresa.</p>`;
  pi.addEventListener('click', e => { const p = e.target.closest('[data-p]'); if (p){ LAB.preset = p.dataset.p; LAB.items = null; rerenderLab(); }
    if (e.target.closest('[data-clear]')){ LAB.preset = null; LAB.items = []; rerenderLab(); } });
  pi.addEventListener('change', e => { const k = e.target.dataset.k; if (!k) return; LAB.preset = null;
    const set = new Set(LAB.items); e.target.checked ? set.add(k) : set.delete(k); LAB.items = ITEMS.map(it => it.short).filter(x => set.has(x)); rerenderLab(true); });
  // --- barra de herramientas
  const bar = el('div', 'lab-bar', main);
  const sc = LAB.scale;
  const labNo = t => t === 'radar' && its.length < 3 ? 'El radar necesita al menos 3 partidas' : t === 'scatter' && its.length < 2 ? 'La dispersión necesita al menos 2 partidas' : '';
  bar.innerHTML = `<div class="seg" id="labT">${LAB_TYPES.map(t => `<button data-t="${t}" class="${LAB.type === t && !labNo(t) ? 'on' : ''}" ${labNo(t) ? 'disabled' : ''} title="${esc(labNo(t) ? TNAME[t] + ' — no disponible: ' + labNo(t) : TNAME[t])}">${svg(t)}<span class="lbl-s">${TNAME[t].replace('Barras horizontales', 'Barras H').replace('Mapa de calor', 'Calor')}</span></button>`).join('')}</div>
    <label class="ctl">Escala <select class="sel" id="labS"><option value="auto" ${sc === 'auto' ? 'selected' : ''}>Automática</option><option value="norm" ${sc === 'norm' ? 'selected' : ''}>Relativa al máximo (=100)</option><option value="dev" ${sc === 'dev' ? 'selected' : ''}>Desviación % vs referencia</option></select></label>
    <label class="ctl ${sc === 'dev' ? '' : 'hide'}">Referencia <select class="sel" id="labR">${LAB.ents.map(id => `<option value="${esc(id)}" ${LAB.ref === id ? 'selected' : ''}>${esc(E[id].label)}</option>`).join('')}</select></label>`;
  bar.querySelector('#labT').onclick = e => { const b = e.target.closest('button'); if (!b || b.disabled) return; LAB.type = b.dataset.t; rerenderLab(true); };
  bar.querySelector('#labS').onchange = e => { LAB.scale = e.target.value; rerenderLab(true); };
  bar.querySelector('#labR').onchange = e => { LAB.ref = e.target.value; rerenderLab(true); };
  // --- gráfico principal
  if (!its.length || !LAB.ents.length){ el('div', 'note', main).textContent = 'Elige al menos una entidad y una partida.'; return; }
  const ents = LAB.ents;
  if (LAB.type === 'scatter' && its.length >= 2){
    if (!its.includes(LAB.x)) LAB.x = its[0]; if (!its.includes(LAB.y)) LAB.y = its[Math.min(1, its.length - 1)]; if (LAB.size && !its.includes(LAB.size)) LAB.size = '';
    const sb = el('div', 'lab-bar', main);
    sb.innerHTML = `<label class="ctl">Eje X <select class="sel" data-ax="x">${its.map(k => `<option ${k === LAB.x ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></label>
      <label class="ctl">Eje Y <select class="sel" data-ax="y">${its.map(k => `<option ${k === LAB.y ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></label>
      <label class="ctl">Tamaño <select class="sel" data-ax="size"><option value="">(ninguno)</option>${its.map(k => `<option ${k === LAB.size ? 'selected' : ''}>${esc(k)}</option>`).join('')}</select></label>`;
    sb.onchange = e => { LAB[e.target.dataset.ax] = e.target.value; rerenderLab(true); };
    card(main, {kind:'scatter', id:'lab-main', title:`${LAB.y} vs ${LAB.x}`, sub:LAB.size ? 'Tamaño = ' + LAB.size : '', ents, x:LAB.x, y:LAB.y, size:LAB.size || null, fixed:'scatter', h:520});
  } else {
    const t = (LAB.type === 'radar' && its.length < 3) || LAB.type === 'scatter' ? 'bar' : LAB.type;
    const sub = LAB.scale === 'dev' ? `Desviación % de cada uno contra ${E[LAB.ref].label} (0 = igual)` : t === 'radar' ? 'Pasa el cursor sobre un polígono para ver los valores reales' : t === 'heat' ? 'Color = posición dentro de cada fila' : '';
    card(main, {id:'lab-main', title:ents.map(id => E[id].label).join(' vs '), sub, ents, items:its, fixed:t, scale:LAB.scale === 'auto' ? null : LAB.scale, ref:LAB.ref,
      h:t === 'radar' ? (window.innerWidth < 600 ? 420 : 560) : (['bar', 'line', 'area'].includes(t) ? 460 : null)});
  }
  // --- lectura automática
  if (ents.length >= 2) labReading(main, ents, its);
  // --- partida por partida
  const h3 = el('h3', '', main); h3.textContent = 'Partida por partida';
  const g = el('div', 'grid', main);
  its.forEach(k => card(g, {kind:'single', id:'lab1-' + k, item:k, title:k, sub:baseOf(byShort[k]), ents, auto:'hbar'}));
}
function labReading(main, ents, its){
  const ref = LAB.ref, others = ents.filter(id => id !== ref);
  const d = el('div', 'card', main);
  const devs = id => its.map(k => { const r = val(ref, k), v = val(id, k); return {k, d:r == null || v == null || r === 0 ? null : (v - r) / Math.abs(r)}; }).filter(x => x.d != null);
  let body;
  if (others.length === 1){
    const id = others[0], ds = devs(id).sort((a, b) => Math.abs(a.d) - Math.abs(b.d));
    const row = x => { const w = Math.min(1, Math.abs(x.d)) * 50; return `<div class="rw"><button class="it" data-item="${esc(x.k)}" style="all:unset;cursor:pointer;flex:0 0 46%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;border-bottom:1px dashed var(--axis)">${esc(x.k)}</button>
      <span class="dev-bar"><i style="left:${x.d < 0 ? 50 - w : 50}%;width:${w}%;background:${x.d < 0 ? 'var(--div-neg)' : 'var(--div-pos)'}"></i><i style="left:50%;width:1px;background:var(--axis)"></i></span><b class="num" style="flex:0 0 58px;text-align:right">${fmtScaled(x.d, 'dev')}</b></div>`; };
    const med = median(ds.map(x => Math.abs(x.d)));
    body = `<p class="sub" style="margin:0 0 10px">Desviación de <b>${esc(E[id].label)}</b> contra <b>${esc(E[ref].label)}</b> en las ${ds.length} partidas elegidas · mediana |desv| <b>${pct(med, 0)}</b> · ${ds.filter(x => Math.abs(x.d) <= 0.2).length} partidas dentro de ±20%.
      Barra azul = menor que la referencia, roja = mayor.</p><div class="grid2" style="gap:18px"><div class="find"><b style="font-size:13px">Más parecidas</b>${ds.slice(0, 6).map(row).join('')}</div>
      <div class="find"><b style="font-size:13px">Más distintas</b>${ds.slice(-6).reverse().map(row).join('')}</div></div>`;
  } else {
    body = `<p class="sub" style="margin:0 0 10px">Mediana de |desviación| contra <b>${esc(E[ref].label)}</b> en las partidas elegidas (cambia la referencia con la escala "Desviación %").</p><div class="find">` +
      others.map(id => { const ds = devs(id); const m = median(ds.map(x => Math.abs(x.d))); const w = Math.min(1, m || 0) * 100;
        return `<div class="rw"><span style="flex:0 0 40%">${swatch(id)} ${esc(E[id].label)}</span><span class="dev-bar"><i style="left:0;width:${w}%;background:${col(id)}"></i></span><b class="num" style="flex:0 0 58px;text-align:right">${m == null ? '—' : pct(m, 0)}</b></div>`; }).join('') + '</div>';
  }
  d.innerHTML = `<div class="card-h"><div class="card-t"><b>Lectura rápida</b><small>Referencia: ${esc(E[ref].label)}${ents.length > 2 ? '' : ' · cambia la referencia con la escala "Desviación %"'}</small></div></div><div style="padding:8px 14px 14px">${body}</div>`;
}
function rerenderLab(keepScroll){ const y = window.scrollY; writeHash(); render(); if (keepScroll) window.scrollTo(0, y); }
function writeHash(){
  if (S.view !== 'lab') return;
  const idx = (LAB.items || []).map(k => ITEMS.findIndex(it => it.short === k)).filter(i => i >= 0);
  const p = new URLSearchParams({e:LAB.ents.join(','), t:LAB.type, s:LAB.scale, r:LAB.ref || ''}); if (LAB.preset) p.set('p', LAB.preset); else p.set('i', idx.join('.'));
  history.replaceState(null, '', '#lab?' + p.toString());
}
function readHash(){
  const h = location.hash.slice(1); if (!h) return; const [v, q] = h.split('?');
  if (['ind', 'emp', 'vs', 'lab'].includes(v)) S.view = v;
  if (v === 'lab' && q){ const p = new URLSearchParams(q);
    const es = (p.get('e') || '').split(',').filter(x => E[x]); if (es.length) LAB.ents = es;
    if (LAB_TYPES.includes(p.get('t'))) LAB.type = p.get('t'); if (['auto', 'norm', 'dev'].includes(p.get('s'))) LAB.scale = p.get('s');
    if (p.get('r') && E[p.get('r')]) LAB.ref = p.get('r');
    if (p.get('p') && PRESETS.find(x => x[0] === p.get('p'))) LAB.preset = p.get('p');
    else if (p.get('i') != null){ LAB.preset = null; LAB.items = p.get('i').split('.').map(Number).map(i => ITEMS[i] && ITEMS[i].short).filter(Boolean); } }
}

// =====================================================================
// 12. Panel de detalle (qué es, fórmula, componentes, lectura)
// =====================================================================
const DR = {stack:[]};
function openItem(k, push){
  const it = byShort[k]; if (!it) return;
  if (push !== false){ if (DR.cur && DR.cur !== k) DR.stack.push(DR.cur); }
  DR.cur = k;
  const g = GLOSARIO[k] || {};
  const ents = ALL.filter(id => avail(id, k));
  const u = it.unit;
  $('#drTitle').textContent = k;
  let html = `<div class="dr-kicker">${esc(it.cat)} · ${baseOf(it)}${it.derived ? ' · <span class="tag">calculado</span>' : ''}${it.agg ? ' · <span class="tag">agregado</span>' : ''}${RED.has(k) ? '' : it.derived ? '' : ' · solo industrias'}</div>
    <div class="dr-name">${esc(k)}</div>${it.key && !it.key.startsWith('__') && it.key !== 'calculado' ? `<div class="dr-kicker">${esc(it.key)}</div>` : ''}
    ${g.def ? `<p style="margin-top:8px">${g.def}</p>` : ''}`;
  if (g.f) html += `<h5>Fórmula</h5><div class="formula">${g.f}</div>${['Activos', 'Pasivos', 'Capital'].includes(it.cat) ? `<p style="font-size:12px;margin-top:6px">${BASE_BAL}</p>` : ['Ingresos', 'Gastos', 'Utilidad e Impuestos'].includes(it.cat) ? `<p style="font-size:12px;margin-top:6px">${BASE_ER}</p>` : ''}`;
  html += `<h5>Cómo se ve en los datos</h5><div class="chart" id="drChart"></div>${autoReading(k, ents)}`;
  if (g.read) html += `<h5>Cómo leerlo</h5><p>${g.read}</p>`;
  // Pistas de detective ocultas temporalmente (el texto sigue en GLOSARIO[k].pista). Para volver a mostrarlas, descomentar:
  // if (g.pista && g.pista !== '—') html += `<div class="callout"><p style="margin:0"><b>Pista de detective:</b> ${g.pista}</p></div>`;
  if (k === 'ROE') html += dupontTable();
  else if (g.parts && g.parts.length) html += partsTable(k, g, ents);
  if (g.rel && g.rel.length) html += `<h5>Relacionadas</h5><div class="rel">${g.rel.filter(r => byShort[r]).map(r => `<button class="pill" data-item="${esc(r)}">${esc(r)}</button>`).join('')}</div>`;
  html += `<h5>Explorar</h5><div class="rel"><button class="pill on" id="drLab">Abrir en el comparador con sus relacionadas</button></div>`;
  $('#drBody').innerHTML = html; $('#drBody').scrollTop = 0;
  $('#drBack').style.visibility = DR.stack.length ? 'visible' : 'hidden';
  $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); $('#drawer').setAttribute('aria-hidden', 'false');
  $('#drLab').onclick = () => { LAB.items = [k].concat((g.rel || []).filter(r => byShort[r])).filter((x, i, a) => a.indexOf(x) === i); LAB.preset = null;
    if (!LAB.ents.length) LAB.ents = ALL.slice(); closeDrawer(); go('lab'); };
  const ch = $('#drChart'); const spec = {kind:'single', item:k, ents, fixed:'dist', id:'dr'};
  const old = echarts.getInstanceByDom(ch); if (old) old.dispose();
  requestAnimationFrame(() => { ch._spec = spec; draw(ch, true); LIVE.add(ch); });
}
function autoReading(k, ents){
  const u = unitOf(k), vs = ents.map(id => [id, val(id, k)]).filter(x => x[1] != null);
  if (vs.length < 2) return '';
  const s = vs.slice().sort((a, b) => b[1] - a[1]);
  const inds = vs.filter(x => E[x[0]].kind === 'ind');
  let txt = `<p style="font-size:13px;margin-top:6px">Mayor: <b>${esc(E[s[0][0]].label)}</b> (${fmt(s[0][1], u)}) · menor: <b>${esc(E[s[s.length - 1][0]].label)}</b> (${fmt(s[s.length - 1][1], u)}).`;
  const cos = vs.filter(x => E[x[0]].kind === 'co');
  if (cos.length && inds.length) txt += ' Industria más cercana en esta partida: ' + cos.map(([c, v]) => { const best = inds.slice().sort((a, b) => Math.abs(a[1] - v) - Math.abs(b[1] - v))[0];
    return `<b>${c}</b> → ${esc(E[best[0]].short)}`; }).join(', ') + '.';
  return txt + ' <span style="color:var(--muted)">Puntos = empresas de cada industria; barra = promedio; rombos = A–D.</span></p>';
}
function partsTable(k, g, ents){
  const parts = g.parts.filter(p => byShort[p]);
  const rows = ents.filter(id => parts.every(p => avail(id, p)));
  if (!rows.length) return '';
  const getter = id => p => val(id, p);
  const hasCalc = typeof g.calc === 'function';
  let h = `<tr><th></th>${parts.map(p => `<th><button class="it" data-item="${esc(p)}">${esc(p)}</button></th>`).join('')}<th>${esc(k)}</th>${hasCalc ? '<th>Recalculado</th>' : ''}</tr>`;
  rows.forEach(id => { const c = hasCalc ? g.calc(getter(id)) : null;
    h += `<tr><td>${swatch(id)} ${esc(E[id].kind === 'co' ? E[id].label : E[id].short)}</td>${parts.map(p => `<td>${fmt(val(id, p), unitOf(p))}</td>`).join('')}<td><b>${fmt(val(id, k), unitOf(k))}</b></td>${hasCalc ? `<td style="color:var(--ink2)">${fmt(num(c), unitOf(k))}</td>` : ''}</tr>`; });
  return `<h5>Los componentes de la fórmula</h5><p style="font-size:13px">Así se arma el indicador con las partidas del reporte. ${hasCalc ? 'En las industrias el recalculado usa promedios, por eso puede diferir un poco del reportado (el promedio de razones ≠ la razón de los promedios).' : ''}</p><div class="tbl"><table>${h}</table></div>`;
}
function dupontTable(){
  const rows = ALL.map(id => { const e = E[id];
    const mn = e.kind === 'ind' ? val(id, 'Margen neto') : val(id, 'Margen neto implícito');
    return {id, mn, rot:val(id, 'Rotación de activos totales'), mult:val(id, 'Multiplicador de capital'), roe:val(id, 'ROE')}; });
  const medOf = f => median(rows.map(r => r[f]));
  const M = {mn:medOf('mn'), rot:medOf('rot'), mult:medOf('mult')};
  const NAMES = {mn:'margen', rot:'rotación', mult:'apalancamiento'};
  const motor = r => { const sc = ['mn', 'rot', 'mult'].map(f => [f, r[f] != null && M[f] ? r[f] / M[f] : 0]).sort((a, b) => b[1] - a[1]); return `${NAMES[sc[0][0]]} <span style="color:var(--muted)">${sc[0][1].toFixed(1)}×</span>`; };
  let h = '<tr><th></th><th>Margen neto</th><th>× Rotación</th><th>× Multiplicador</th><th>= ROE</th><th style="text-align:left">Motor principal</th></tr>';
  rows.forEach(r => { h += `<tr><td>${swatch(r.id)} ${esc(E[r.id].kind === 'co' ? E[r.id].label : E[r.id].short)}</td><td>${fmt(r.mn, 'pct')}${E[r.id].kind === 'co' ? '<sup>*</sup>' : ''}</td><td>${fmt(r.rot, 'x')}</td><td>${fmt(r.mult, 'x')}</td><td><b>${fmt(r.roe, 'pct')}</b></td><td style="text-align:left">${motor(r)}</td></tr>`; });
  return `<h5>Descomposición DuPont</h5><p style="font-size:13px">ROE = margen neto × rotación de activos × multiplicador de capital (activo ÷ capital). El "motor principal" es el factor que más se separa de la mediana de las 8 entidades (veces la mediana).</p>
    <div class="tbl"><table>${h}</table></div><p style="font-size:12px;color:var(--muted);margin-top:6px">* A–D no reportan margen neto: es el margen implícito = ROE × (capital/activo) ÷ rotación.</p>`;
}
function closeDrawer(){ $('#drawer').classList.remove('open'); $('#scrim').classList.remove('open'); $('#drawer').setAttribute('aria-hidden', 'true'); DR.stack = []; DR.cur = null; }
function openGlossary(){
  DR.stack = []; DR.cur = null;
  $('#drTitle').textContent = 'Glosario'; $('#drBack').style.visibility = 'hidden';
  $('#drBody').innerHTML = `<input class="search" id="gq" placeholder="Buscar partida o indicador…" autocomplete="off"><div class="gloss-list" id="gl"></div>`;
  const list = () => { const q = $('#gq').value.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
    $('#gl').innerHTML = D.cats.map(c => { const its = c.items.filter(it => !q || (it.short + ' ' + ((GLOSARIO[it.short] || {}).def || '')).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').includes(q));
      return its.length ? `<div class="dr-kicker" style="margin:14px 0 2px;text-transform:uppercase;letter-spacing:.05em">${esc(c.name)}</div>` + its.map(it => `<button data-item="${esc(it.short)}"><b style="font-weight:500">${esc(it.short)}</b><small>${baseOf(it)}</small></button>`).join('') : ''; }).join(''); };
  $('#gq').oninput = list; list();
  $('#drawer').classList.add('open'); $('#scrim').classList.add('open'); setTimeout(() => $('#gq').focus(), 250);
}
const $ = s => document.querySelector(s);
$('#drClose').onclick = closeDrawer; $('#scrim').onclick = closeDrawer;
$('#drBack').onclick = () => { const k = DR.stack.pop(); if (k){ DR.cur = null; openItem(k, false); } };
document.addEventListener('keydown', e => { if (e.key === 'Escape'){ closeMenus(); closeDrawer(); } });
$('#bGloss').onclick = openGlossary;

// =====================================================================
// 13. Barra de controles + render
// =====================================================================
const GTYPES = ['auto', 'bar', 'hbar', 'radar', 'line', 'area', 'heat', 'dist', 'table'];
function subbar(){
  const sb = $('#subbar');
  if (S.view === 'lab'){ sb.innerHTML = ''; return; }
  sb.innerHTML = `<span class="ctl">Gráficas</span><div class="seg" id="gT">${GTYPES.map(t => `<button data-t="${t}" class="${S.gtype === t ? 'on' : ''}" title="${TNAME[t]} — aplica a todos los bloques que lo admiten">${svg(t)}<span class="lbl-s">${t === 'auto' ? 'Auto' : TNAME[t].replace('Barras horizontales', 'Barras H').replace('Mapa de calor', 'Calor')}</span></button>`).join('')}</div>
    <span class="spacer"></span>
    ${S.view === 'ind' ? `<div class="tog ${S.reduced ? 'on' : ''}" id="tReduced" role="switch" aria-checked="${S.reduced}" tabindex="0"><span class="sw"></span>Solo partidas de las empresas</div>` : ''}
    ${S.view === 'vs' ? `<div class="tog ${S.dev ? 'on' : ''}" id="tDev" role="switch" aria-checked="${S.dev}" tabindex="0"><span class="sw"></span>Desviación %</div>` : ''}`;
  $('#gT').onclick = e => { const b = e.target.closest('button'); if (!b) return; S.gtype = b.dataset.t; Object.keys(OVR).forEach(k => delete OVR[k]);
    sb.querySelectorAll('#gT button').forEach(x => x.classList.toggle('on', x.dataset.t === S.gtype));
    document.querySelectorAll('.card').forEach(c => { const ch = c.querySelector('.chart'); if (!ch || !ch._spec) return; const t = typeOf(ch._spec);
      c.querySelectorAll('.tseg button').forEach(x => x.classList.toggle('on', x.dataset.t === t)); updateBadge(c, ch._spec); if (ch._drawn) draw(ch, true); }); };
  const tr = $('#tReduced'); if (tr) tr.onclick = () => { S.reduced = !S.reduced; render(); };
  const td = $('#tDev'); if (td) td.onclick = () => { S.dev = !S.dev; const y = scrollY; render(); scrollTo(0, y); };
}
function syncHeader(){ document.documentElement.style.setProperty('--hdr', document.querySelector('.topbar').offsetHeight + 'px'); }
addEventListener('resize', syncHeader);
function render(){
  readTheme(); closeMenus();
  document.querySelectorAll('#views button').forEach(b => b.classList.toggle('on', b.dataset.v === S.view));
  disposeAll(); cardSeq = 0;
  const root = $('#view'); root.innerHTML = '';
  subbar();
  ({ind:viewInd, emp:viewEmp, vs:viewVs, lab:viewLab})[S.view](root);
  syncHeader();
}
function go(v){ S.view = v; if (v === 'lab') writeHash(); else history.replaceState(null, '', '#' + v); window.scrollTo(0, 0); render(); }
$('#views').addEventListener('click', e => { const b = e.target.closest('button'); if (b) go(b.dataset.v); });
$('#bTheme').onclick = () => { const d = !isDark(); document.documentElement.setAttribute('data-theme', d ? 'dark' : 'light'); try { localStorage.setItem('theme', d ? 'dark' : 'light'); } catch (e) {}
  readTheme(); redrawAll(false); if (DR.cur) { const c = $('#drChart'); if (c && c._spec) draw(c, false); } };
matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => { readTheme(); redrawAll(false); });
window.addEventListener('hashchange', () => { const before = S.view; readHash(); if (S.view !== before) render(); });

computeSummary();
readHash();
render();
