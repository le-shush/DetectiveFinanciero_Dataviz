# Detective financiero — motor de DataViz (contexto para Claude Code)

Reporte web estático (GitHub Pages) que compara cuatro industrias (O&G, Biotech, Tecnología, Pharma) a partir de promedios de estados financieros, y cuatro empresas "misteriosas" (A–D) que hay que asignar a una industria. Es un ejercicio del curso de Análisis Financiero (MBA EGADE) de Chucho. Idioma de la UI y de los comentarios: **español**.

## Estructura del repo

```
index.html                 # página generada — NO editar a mano; sale de tools/site_template.html + data/data.json
css/app.css                # estilos y tokens de color (claro/oscuro); se sirve directo, sin build
js/app.js                  # EL MOTOR: modelo de datos, builders ECharts, vistas, comparador, panel de detalle
js/glosario.js             # conocimiento financiero por partida: definición, fórmula, cómo leerlo, pista, relacionadas
assets/echarts.min.js      # Apache ECharts 5.6.0 local (sin CDN, funciona offline)
assets/Comparativo_Industrias_Averages.xlsx   # Excel generado con los promedios (link de descarga en la página)
data/20261001_Detective_Financiero_v3.xlsx    # FUENTE: libro de Excel del ejercicio
data/data_industrias.json  # intermedio (paso 1)
data/data.json             # dataset final que se inyecta en el HTML (paso 2)
tools/build_excel.py       # paso 1: hojas ">>" del Excel -> Excel de promedios + data_industrias.json
tools/make_data.py         # paso 2: + hoja Resumen (empresas A–D) + partida agregada -> data.json
tools/build_site.py        # paso 3: template + data.json -> index.html
tools/site_template.html   # shell HTML; `__DATA__` se sustituye por el JSON; carga css/ y js/
tools/deviations_excel.py  # opcional: Excel con desviaciones % y "industria más parecida"
tools/smoke_test.js        # playwright: recorre vistas, tipos de gráfica, comparador y detalle; reporta errores JS
.nojekyll                  # GitHub Pages sin Jekyll
```

### Regenerar todo
```bash
pip install openpyxl            # único requisito de Python
python tools/build_excel.py     # [ruta_al_xlsx opcional]
python tools/make_data.py       # [ruta_al_xlsx opcional]
python tools/build_site.py
# prueba (opcional): npm i playwright && npx playwright install chromium && node tools/smoke_test.js  -> termina en "OK: cero errores"
```
Publicación: GitHub Pages desde `main` / raíz. Cambios en `css/` o `js/` no requieren build (se sirven directo); sólo `tools/site_template.html` o los datos requieren el paso 3.
Para verlo local: `python -m http.server 8765` y abrir http://localhost:8765 (también funciona con `file://`). Los scripts de Python abren todo en UTF-8 (en Windows el default es cp1252).

## El Excel fuente (data/20261001_Detective_Financiero_v3.xlsx)

- Hojas `O&G>>`, `Biotech>>`, `Technology>>`, `Pharma>>`: una por industria. Columnas B..G = etiqueta, **Average**, 4 empresas (O&G: Conoco, Chevron, Exxon, Valero · Biotech: IQVIA, Argenx, Beone, ICON · Tech: NVIDIA, Intel, Broadcom, Micron · Pharma: Eli Lilly, J&J, Merck, Roche). Filas: balance como **% del total de activos**, estado de resultados como **% de ingresos**, luego 4 bloques de indicadores (Liquidez, Eficiencia, Apalancamiento, Rentabilidad). Las filas-encabezado de bloque empiezan con `Indicadores de` / `Administración de`; hay tres filas distintas llamadas `Other`/`—` (se renombran por posición en `build_excel.py`).
- Hoja `Resumen`: columnas B..F = empresas misteriosas **A, B, C, D** (balance en unidades de porcentaje: `5.13` = 5.13% → se divide /100; 8 KPIs en sus unidades). Columnas H..L = promedios por industria (referencias a las hojas `>>`). La fila 1 trae las conjeturas de Chucho (A=Tech, B=Pharma, C=Oil & Gas).
- Cada empresa individual tiene su propia hoja (`Conoco`, `IQVIA`, …) con el estado financiero completo; no se usan directamente.

## Modelo de datos (data/data.json)

```
inds: ["O&G","Biotech","Tecnología","Pharma"]      colors: {ind: hex}      companies: {ind: [4 nombres]}
cats: [{name, items:[{key (etiqueta original), short (nombre corto ES), unit: 'pct'|'x'|'días'|'usd',
                      avg:[4 por industria], comp:{ind:[4 valores por empresa]}, agg?:true}]}]
reduced: [28 shorts]   # las partidas que SÍ traen las empresas A–D (20 balance + 8 KPI)
comps: {names:['A','B','C','D'], colors:{...}, items:{short:[4 valores]}}   # null = dato no disponible
```
Categorías: Activos, Pasivos, Capital, Ingresos, Gastos, Utilidad e Impuestos, Indicadores: Liquidez / Eficiencia / Apalancamiento / Rentabilidad. Los nombres cortos (`short`) son la **clave** con la que el JS busca partidas (`byShort`); si se renombran en `build_excel.py` (dict `SHORT`) hay que actualizar las referencias en el template y en `make_data.py` (lista `M`).

## El motor (js/app.js + js/glosario.js)

Vanilla JS + ECharts, sin build step. Secciones numeradas igual que en el archivo:
1. **Modelo**: 8 entidades `ENT` (4 industrias + A–D) con `id`, `kind:'ind'|'co'`, `slot` (color). `val(id, short)` y `avail(id, short)` son la única forma de leer datos; las empresas sólo tienen las 28 partidas de `reduced` + los derivados. **Derivados** (`DERIVED`, categoría "Indicadores: Derivados", `derived:true`, etiqueta "calculado"): liquidez inmediata, deuda financiera, D/E, multiplicador de capital, razón de efectivo, capital de trabajo/activo, margen neto implícito y ROA implícito (DuPont despejado: A–D no reportan margen neto). En industrias se calculan por empresa y luego se promedian.
2. **Tema**: tokens en `css/app.css` (`:root`, `prefers-color-scheme` y `[data-theme]`); colores de entidad `--c1..--c8` con pasos propios para oscuro. `readTheme()` los lee a `T` antes de dibujar; al cambiar tema se redibuja lo ya pintado.
3. **Estado** `S = {view:'ind'|'emp'|'vs'|'lab', reduced, dev, gtype}`; `OVR[cardId]` = tipo elegido en cada tarjeta (el selector global lo limpia); `LAB` = estado del comparador, guardado en el hash (`#lab?e=Pharma,B&t=radar&s=auto&p=huella`) para compartir.
4. **Registro de gráficas**: `mount(el, spec)` → carga diferida (IntersectionObserver) y redibujo al cambiar de ancho (ResizeObserver): las opciones dependen del ancho (rotación/corte de etiquetas, altura, radio del radar).
5. **Tipos** (`typesOf`/`typeOf`): `bar`, `hbar`, `radar`, `line`, `area`, `heat`, `table` para bloques multi-partida; `stack` (composición 100%), `dupont`/`scatter`, `dist` (distribución: las 4 empresas de cada industria + promedio + A–D). Un `spec` = `{kind?, id, title, sub, ents, items|item, auto, insight, fixed?}`; si no admite el tipo global se queda en su `auto`.
   **Escala**: real si todas las partidas comparten unidad; si no, "relativa al máximo" (v / máx|v| de las 8 entidades = 100) con aviso en la tarjeta; el comparador agrega "desviación % vs referencia". El radar usa escala propia por eje (rango de las 8 entidades), nunca normaliza contra la selección: las formas no brincan al cambiar quién se compara.
7. **Builders** `buildCartesian`, `buildHBar`, `buildSingle`, `buildRadar`, `buildHeat`, `buildDist`, `buildStack`, `buildScatter`, `buildDevHeat`, `buildSimHeat`, `tableHTML`. Etiquetas con `hideOverlap`, ancho fijo + `overflow:'break'` para nombres largos, `containLabel` en todos los grids.
8. **Tarjetas** `card(parent, spec)`: título (clic → detalle), iconos de tipo, ⓘ y menú ⋯ (tipo, PNG, abrir en el comparador). En tarjetas angostas los iconos bajan a su propia fila.
9–11. **Vistas** `viewInd`, `viewEmp`, `viewVs`, `viewLab` (comparador: entidades, duelos sugeridos, presets de partidas, checklist, tipo, escala, "lectura rápida" de desviaciones y partida por partida).
12. **Panel de detalle** `openItem(short)`: definición, fórmula (HTML con `frac()`), distribución, lectura automática (máx/mín, industria más cercana por empresa), cómo leerlo, pista de detective, tabla de componentes con recalculado (`GLOSARIO[k].parts/calc`) y, para ROE, descomposición DuPont con "motor principal". `openGlossary()` = lista con buscador.
- **Desviaciones** (`computeSummary`): `(valor − promedio)/|promedio|`; promedio 0 o valor null → no comparable. Por empresa se cuenta en cuántas partidas cada industria es la más cercana (`wins`) y la mediana de |desv|; "más parecida" = más wins, desempate por mediana. Misma lógica que `tools/deviations_excel.py`. Sólo usa las 28 de `reduced` (no los derivados).
- **Paleta** (skill dataviz, validada con `validate_palette.js` en claro y oscuro): industrias azul/naranja/aqua/amarillo, empresas violeta/magenta/verde/rojo. En claro el par verde↔rojo (C↔D) queda en ΔE CVD 7.2, por eso las empresas llevan **codificación secundaria** (línea punteada, marcador rombo/círculo). Color fijo por entidad, nunca por rango; texto siempre en tokens de tinta. Las composiciones usan rampas por grupo (azules = circulante/capital, cálidos = no circulante/pasivo), no colores de entidad. Mapas de calor: una sola rampa azul (más oscuro = mayor / más parecido).

## Decisiones y rarezas de los datos (no "corregir" sin preguntar)

- `Otros act. LP (intang. + otros)` = Intangibles + Otros no circulantes de las industrias, porque las empresas A–D traen ese rubro junto. Se marca `agg:true`.
- En A–D: C y D tienen días de inventario = 0 y D días de cobro = 0 → se tratan como `null` ("—"), no como cero. Las partidas de las empresas sin equivalente (PPE bruto, depreciación acumulada, preferentes, interés minoritario) se ignoran.
- Biotech: IQVIA e ICON (CROs) no tienen inventario → rotación/días de inventario del sector quedan bajos. Cobertura de intereses sale negativa en Biotech/Tech/Pharma porque tienen ingreso neto por intereses (EBIT ÷ negativo). Está anotado en la UI.
- En "¿A dónde va cada dólar?" no se incluye D&A (ya está dentro de costo/gastos; EBITDA = EBIT + D&A); el residuo gris cierra al 100%.
- Resultado actual del detective: **A→Tech (12/28), B→Pharma (18), C→O&G (14), D→Tech (13)**. A queda casi empatada con Biotech (mediana 48% vs 51%); si cada industria debe usarse una vez, la asignación de menor desviación total es A→Biotech, D→Tech. Los textos de insight en el template están escritos a mano con estas cifras: si cambian los datos hay que revisarlos (están en `viewInd`, `viewEmp` y `viewVs` de `js/app.js`).
- Los textos de `js/glosario.js` no llevan cifras a propósito: las cifras vivas las calcula el panel de detalle.
- `index.html` pesa ~40 KB porque lleva el JSON embebido; ECharts va aparte (1 MB).

## Ideas pendientes
- Hoja/sección "cómo reconocer cada industria" (3–4 rasgos por sector).
- Empresas individuales de cada industria como entidades del comparador (los datos ya están en `items[].comp`; hoy sólo se ven en el tipo "Distribución").
- Botón "copiar tabla".
- Validar la paleta con `scripts/validate_palette.js` del skill dataviz si se cambian colores (CVD ΔE ≥ 8, normal ≥ 15).

## Central de estudio (`estudio.html`, URL aparte sin liga desde index)
Guía de estudio interactiva para el examen final (`noindex`). Vanilla JS + ECharts, sin build; carga `css/app.css` (tokens) + `css/estudio.css`.
- `js/estudio/core.js`: API `window.E` (helpers de HTML, `E.knobs`, `E.tiles`, `E.chart`, `E.quiz`, `E.table`) y `E.model` = modelo de "La Tiendita" con ER + balance + flujo + razones conectados (la caja del año 1 sale del flujo, así el balance siempre cuadra).
- `js/estudio/boot.js`: navegación lateral y router `#/id[/ancla]`; modo "Explicado fácil" (`body.kid-off` oculta `.co.kid`).
- Una sección por archivo `sNN_*.js` que llama `E.section({id, n, group, title, short, exam, render})`; para agregar una, crea el archivo y su `<script>` en `estudio.html` antes de `boot.js`.
- Ilustraciones = SVG inline con clases `.ill` (`f1..f8`, `w1..w8`, `ln`, `s1..s8`, `tw`…); las variables CSS no sirven como atributos de presentación.
- Cifras de clase dudosas (transcripción automática) van marcadas con "≈"/"aprox.".
