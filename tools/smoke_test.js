// node tools/smoke_test.js  (requiere: npm i playwright && npx playwright install chromium)
// Recorre las 4 vistas, todos los tipos de gráfica globales, los toggles, los tipos del comparador y el panel de detalle
// de cada partida. Reporta errores JS (PAGEERR/CERR) y cuántas gráficas se dibujaron. Esperado: cero errores.
const {chromium} = require('playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage({viewport:{width:1300, height:900}});
  let errs = 0; p.on('pageerror', e => { errs++; console.log('PAGEERR', e.message); }); p.on('console', m => { if (m.type() === 'error'){ errs++; console.log('CERR', m.text().slice(0, 200)); } });
  const url = require('url').pathToFileURL(require('path').resolve('index.html')).href;
  const drawAll = () => p.evaluate(async () => { document.documentElement.style.scrollBehavior = 'auto';
    for (let y = 0; y < document.body.scrollHeight; y += 600){ scrollTo(0, y); await new Promise(r => setTimeout(r, 30)); }
    await new Promise(r => setTimeout(r, 300)); const cs = [...document.querySelectorAll('.chart')]; return `${cs.filter(c => c._drawn).length}/${cs.length}`; });
  await p.goto(url + '#ind'); await p.waitForTimeout(1500);
  for (const v of ['ind', 'emp', 'vs']){
    await p.click(`#views button[data-v=${v}]`); await p.waitForTimeout(500);
    for (const t of ['auto', 'bar', 'hbar', 'radar', 'line', 'area', 'heat', 'dist', 'table']){ await p.click(`#gT button[data-t=${t}]`); console.log(v, t, await drawAll()); }
    await p.click('#gT button[data-t=auto]');
    if (v === 'ind'){ await p.click('#tReduced'); console.log('ind reducida', await drawAll()); await p.click('#tReduced'); }
    if (v === 'vs'){ await p.click('#tDev'); console.log('vs desviación', await drawAll()); await p.click('#tDev'); }
  }
  await p.click('#views button[data-v=lab]'); await p.waitForTimeout(500);
  for (const q of ['huella', 'activo', 'todas']) for (const t of ['bar', 'hbar', 'radar', 'line', 'area', 'heat', 'scatter', 'table']) for (const s of ['auto', 'norm', 'dev']){
    await p.evaluate(([q, t, s]) => { location.hash = `#lab?e=O%26G,Pharma,A,B&t=${t}&s=${s}&r=Pharma&p=${q}`; }, [q, t, s]); await p.waitForTimeout(80); }
  console.log('comparador', await drawAll());
  await p.click('#bTheme'); console.log('tema', await drawAll());
  const n = await p.evaluate(async () => { let n = 0; for (const it of ITEMS){ openItem(it.short); n++; await new Promise(r => setTimeout(r, 25)); } closeDrawer(); return n; });
  console.log('detalle de partidas', n);
  console.log(errs ? `${errs} ERRORES` : 'OK: cero errores'); await b.close();
})();
