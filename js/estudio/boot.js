// Central de estudio — navegación, router (#/id[/ancla]), tema y modo "explicado fácil".
(function () {
  'use strict';
  const S = () => E.sections.slice().sort((a, b) => a.n - b.n);
  const side = document.getElementById('side'), main = document.getElementById('main'), scrim = document.getElementById('scrim2');

  function buildNav() {
    const list = S();
    side.innerHTML = E.GROUPS.map(([g, label]) => {
      const items = list.filter((s) => s.group === g);
      if (!items.length) return '';
      return `<h6>${label}</h6>` + items.map((s) => `<a href="#/${s.id}" data-id="${s.id}"><span class="n">${s.icon || s.n}</span><span>${s.short || s.title}</span>${s.exam === 'star' ? '<span class="dot">★</span>' : s.exam === 'out' ? '<span class="dot no">extra</span>' : ''}</a>`).join('');
    }).join('');
  }

  function render() {
    const raw = (location.hash || '#/inicio').replace(/^#\/?/, '');
    const [id, anchor] = raw.split('/');
    const list = S(); const i = Math.max(0, list.findIndex((s) => s.id === id)); const s = list[i];
    E.disposeCharts();
    main.innerHTML = `<header class="sec-head"><div class="kicker"><span>${s.kicker || (E.GROUPS.find((g) => g[0] === s.group) || [, ''])[1]}</span>${s.exam ? E.badge(s.exam) : ''}</div><h1>${s.title}</h1>${s.lead ? `<p class="lead">${s.lead}</p>` : ''}</header><div id="body"></div>`;
    const prev = list[i - 1], next = list[i + 1];
    try { s.render(document.getElementById('body')); }
    catch (e) { console.error(e); document.getElementById('body').innerHTML = `<div class="co warn"><b>Error</b>No se pudo dibujar esta sección: ${E.esc(e.message)}</div>`; }
    main.insertAdjacentHTML('beforeend', `<nav class="pager">${prev ? `<a href="#/${prev.id}"><small>← Anterior</small>${prev.short || prev.title}</a>` : '<span></span>'}${next ? `<a href="#/${next.id}" style="text-align:right"><small>Siguiente →</small>${next.short || next.title}</a>` : ''}</nav>`);
    side.querySelectorAll('a').forEach((a) => a.classList.toggle('on', a.dataset.id === s.id));
    document.title = `${s.short || s.title} · Central de estudio`;
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'instant' });
    if (anchor) { const t = document.getElementById(anchor); if (t) setTimeout(() => t.scrollIntoView({ block: 'start', behavior: 'instant' }), 80); }
  }

  // menú móvil
  const closeMenu = () => { side.classList.remove('open'); scrim.classList.remove('on'); };
  document.getElementById('bMenu').addEventListener('click', () => { side.classList.add('open'); scrim.classList.add('on'); });
  scrim.addEventListener('click', closeMenu);

  // tema
  document.getElementById('bTheme').addEventListener('click', () => {
    const cur = document.documentElement.getAttribute('data-theme') || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    const nx = cur === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nx);
    try { localStorage.setItem('theme', nx); } catch (e) {}
    E.redrawAll();
  });
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => E.redrawAll());

  // modo explicado fácil
  const kidBtn = document.getElementById('bKid');
  const setKid = (on) => { document.body.classList.toggle('kid-off', !on); kidBtn.classList.toggle('on', on); kidBtn.setAttribute('aria-pressed', on); try { localStorage.setItem('kid', on ? '1' : '0'); } catch (e) {} };
  let kid = true; try { kid = localStorage.getItem('kid') !== '0'; } catch (e) {}
  setKid(kid);
  kidBtn.addEventListener('click', () => setKid(document.body.classList.contains('kid-off')));

  E.readTheme();
  buildNav();
  window.addEventListener('hashchange', render);
  render();
})();
