# Comparativo de industrias — promedios por sector

Reporte interactivo (Plotly) que compara los promedios de balance, estado de resultados e indicadores
de cuatro industrias: O&G, Biotech, Tecnología y Pharma.

## Publicar en GitHub Pages

1. Crea un repositorio nuevo en GitHub (público).
2. Sube **todo el contenido de esta carpeta** a la raíz del repo (`index.html`, `assets/`, `.nojekyll`, `README.md`).
3. En el repo: **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**, Branch: `main`, carpeta `/ (root)` → Save.
4. En 1–2 minutos queda en `https://<tu-usuario>.github.io/<nombre-del-repo>/`.

## Estructura

```
index.html                              # el reporte
assets/plotly.min.js                    # librería de gráficos (local, no depende de internet)
assets/Comparativo_Industrias_Averages.xlsx   # Excel descargable desde el reporte
.nojekyll                               # evita que GitHub procese el sitio con Jekyll
```

Fuente de datos: `20261001_Detective_Financiero_v3.xlsx`, hojas `O&G>>`, `Biotech>>`, `Technology>>`, `Pharma>>` (columna *Average*).
