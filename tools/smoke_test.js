// node tools/smoke_test.js  (requiere: npm i playwright; usa chromium) — recorre las 3 vistas y toggles, reporta errores JS y # de gráficos
const{chromium}=require('playwright');(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1300,height:900}});
p.on('pageerror',e=>console.log('PAGEERR',e.message));p.on('console',m=>{if(m.type()==='error')console.log('CERR',m.text().slice(0,200))});
await p.goto('file://'+process.cwd()+'/index.html');await p.waitForTimeout(3000);
const cnt=async()=>p.evaluate(()=>document.querySelectorAll('.js-plotly-plot').length);
console.log('ind full',await cnt());await p.screenshot({path:'w1.png'});
await p.click('#tReduced');await p.waitForTimeout(2500);console.log('ind reduced',await cnt());await p.screenshot({path:'w2.png'});
await p.click('button[data-v=emp]');await p.waitForTimeout(2500);console.log('emp',await cnt());await p.screenshot({path:'w3.png'});
await p.evaluate(()=>window.scrollTo(0,900));await p.waitForTimeout(400);await p.screenshot({path:'w3b.png'});
await p.click('button[data-v=vs]');await p.waitForTimeout(2500);console.log('vs',await cnt());await p.screenshot({path:'w4.png'});
await p.evaluate(()=>window.scrollTo(0,1000));await p.waitForTimeout(400);await p.screenshot({path:'w4b.png'});
await p.click('#tDev');await p.waitForTimeout(2500);console.log('vs dev',await cnt());await p.evaluate(()=>window.scrollTo(0,1000));await p.waitForTimeout(400);await p.screenshot({path:'w5.png'});
await p.click('#tDark');await p.waitForTimeout(2500);await p.evaluate(()=>window.scrollTo(0,0));await p.waitForTimeout(400);await p.screenshot({path:'w6.png'});
await p.click('button[data-v=ind]');await p.waitForTimeout(2500);await p.evaluate(()=>window.scrollTo(0,700));await p.waitForTimeout(400);await p.screenshot({path:'w7.png'});
await b.close()})()
