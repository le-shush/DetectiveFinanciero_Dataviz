# Detective financiero — motor de DataViz (contexto para Claude Code)

Reporte web estático (GitHub Pages) que compara cuatro industrias (O&G, Biotech, Tecnología, Pharma) a partir de promedios de estados financieros, y cuatro empresas "misteriosas" (A–D) que hay que asignar a una industria. Es un ejercicio del curso de Análisis Financiero (MBA EGADE) de Chucho. Idioma de la UI y de los comentarios: **español**.

## Estructura del repo

```
index.html                 # página generada — NO editar a mano; sale de tools/site_template.html + data/data.json
assets/plotly.min.js       # Plotly 2.35.2 local (sin CDN, funciona offline)
assets/Comparativo_Industrias_Averages.xlsx   # Excel generado con los promedios (link de descarga en la página)
data/20261001_Detective_Financiero_v3.xlsx    # FUENTE: libro de Excel del ejercicio
data/data_industrias.json  # intermedio (paso 1)
data/data.json             # dataset final que se inyecta en el HTML (paso 2)
tools/build_excel.py       # paso 1: hojas ">>" del Excel -> Excel de promedios + data_industrias.json
tools/make_data.py         # paso 2: + hoja Resumen (empresas A–D) + partida agregada -> data.json
tools/build_site.py        # paso 3: template + data.json -> index.html
tools/site_template.html   # EL MOTOR: todo el HTML/CSS/JS; `__DATA__` se sustituye por el JSON
tools/deviations_excel.py  # opcional: Excel con desviaciones % y "industria más parecida"
tools/smoke_test.js        # playwright: recorre vistas/toggles, reporta errores JS y # de gráficos
.nojekyll                  # GitHub Pages sin Jekyll
```

### Regenerar todo
```bash
pip install openpyxl            # único requisito de Python
python3 tools/build_excel.py    # [ruta_al_xlsx opcional]
python3 tools/make_data.py      # [ruta_al_xlsx opcional]
python3 tools/build_site.py
# prueba (opcional): npm i playwright && node tools/smoke_test.js  -> espera "ind full 82 / ind reduced 44 / emp 46 / vs 29 / vs dev 29" y cero PAGEERR
```
Publicación: GitHub Pages desde `main` / raíz. Al cambiar sólo el motor, basta con correr el paso 3 y subir `index.html`.

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

## El motor (tools/site_template.html)

Un solo archivo, vanilla JS + Plotly, sin build step. Partes:
- **Estado** `S = {view:'ind'|'emp'|'vs', reduced, dev, dark}`. `render()` purga todos los plots, reconstruye el DOM de la vista y luego `flush()` dibuja (los `plot()` se encolan para que el grid ya tenga su ancho final — si se dibuja antes, el primer gráfico del grid sale al ancho completo).
- **Tema**: variables CSS en `:root` y `:root[data-theme="dark"]`; Plotly lee los colores con `css('--var')` en cada render, por eso al cambiar tema se re-renderiza todo. Preferencia en `localStorage('theme')`, default = `prefers-color-scheme`.
- **Conjuntos de entidades** intercambiables: `INDS` (industrias) y `COMPS` (empresas). Interfaz: `{kind, names, color(n), label(n), val(short)->array|null, sub(n)}`. Todos los builders reciben un `set`, así cualquier gráfico sirve para industrias o empresas.
- **Builders**: `stackChart` (100% apilado), `incomeStack` (a dónde va cada dólar), `barOne`, `grouped`, `dupont` (scatter margen × rotación, tamaño=|ROE|), `radar` (normalizado 0–1 por indicador), `keyCharts` (sección "indicadores clave"), `categorySections` (por categoría: barras agrupadas horizontales o heatmap para indicadores + mini-gráfico por partida), `tableFor`, `chips`. Cada builder se **salta solo** si al `set` le faltan las partidas que necesita (`set.val(k)` → null), así la vista reducida/empresas no requiere lógica especial.
- **Vistas**: `viewInd` (completa o reducida con el toggle "Solo partidas de las empresas"), `viewEmp` (A–D con las 28 partidas), `viewVs` (empresa vs industria: valores en barras de 8, o con el toggle "Mostrar desviación %" heatmaps 4×4 por partida + resumen "¿a qué industria se parece?").
- **Desviaciones** (`devMatrix`/`summary`): `(valor − promedio)/|promedio|`; promedio 0 o valor null → no comparable. Por empresa se cuenta en cuántas partidas cada industria es la más cercana (`wins`) y la mediana de |desv| por industria; "más parecida" = más wins, desempate por mediana. Misma lógica que `tools/deviations_excel.py`.
- Paleta (del skill dataviz, validada CVD): industrias azul `#2a78d6` / naranja `#eb6834` / aqua `#1baf7a` / amarillo `#eda100`; empresas violeta `#4a3aa7` / magenta `#e87ba4` / verde `#008300` / rojo `#e34948`. Una serie = un color fijo por entidad (nunca por rango). Texto siempre en tokens de tinta, nunca en color de serie.

## Decisiones y rarezas de los datos (no "corregir" sin preguntar)

- `Otros act. LP (intang. + otros)` = Intangibles + Otros no circulantes de las industrias, porque las empresas A–D traen ese rubro junto. Se marca `agg:true`.
- En A–D: C y D tienen días de inventario = 0 y D días de cobro = 0 → se tratan como `null` ("—"), no como cero. Las partidas de las empresas sin equivalente (PPE bruto, depreciación acumulada, preferentes, interés minoritario) se ignoran.
- Biotech: IQVIA e ICON (CROs) no tienen inventario → rotación/días de inventario del sector quedan bajos. Cobertura de intereses sale negativa en Biotech/Tech/Pharma porque tienen ingreso neto por intereses (EBIT ÷ negativo). Está anotado en la UI.
- En "¿A dónde va cada dólar?" no se incluye D&A (ya está dentro de costo/gastos; EBITDA = EBIT + D&A); el residuo gris cierra al 100%.
- Resultado actual del detective: **A→Tech (12/28), B→Pharma (18), C→O&G (14), D→Tech (13)**. A queda casi empatada con Biotech (mediana 48% vs 51%); si cada industria debe usarse una vez, la asignación de menor desviación total es A→Biotech, D→Tech. Los textos de insight en el template están escritos a mano con estas cifras: si cambian los datos hay que revisarlos (están en `viewInd`, `viewEmp`, `viewVs` y en `keyCharts`).
- `index.html` pesa ~67 KB porque lleva el JSON embebido; Plotly va aparte (4.5 MB) para que el HTML sea editable.

## Ideas pendientes / "chochos" que se habían mencionado
- Hoja/sección "cómo reconocer cada industria" (3–4 rasgos por sector).
- Selector de empresas individuales dentro de cada industria (los datos por empresa ya están en `items[].comp`).
- Exportar gráficos a PNG (Plotly `toImage`) y/o un botón de "copiar tabla".
- Validar la paleta con `scripts/validate_palette.js` del skill dataviz si se cambian colores (CVD ΔE ≥ 8, normal ≥ 15).
- Separar el template en `css/` y `js/` si crece; hoy todo vive en un archivo a propósito (cero build).
